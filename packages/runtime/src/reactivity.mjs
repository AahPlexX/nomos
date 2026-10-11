import { createDeepStateController, unwrapDeepProxy } from './deep-state.mjs';

let activeObserver = null;
let currentOwner = null;
let nextId = 1;

const pendingDom = new Set();
const pendingSync = new Set();
let flushScheduled = false;
let flushing = false;
let activeFlush = null;

const MAX_SYNC_RUNS_PER_FLUSH = 100;

export class ReactiveCycleError extends Error {
  constructor(states, syncs) {
    const stateList = [...states].sort().join(', ') || '(unknown state)';
    const syncList = [...syncs].sort().join(', ') || '(unknown sync owner)';
    super(`Non-terminating reactive cycle detected. States: ${stateList}. Synchronization owners: ${syncList}.`);
    this.name = 'ReactiveCycleError';
    this.states = [...states];
    this.syncs = [...syncs];
  }
}

export function createOwner(parent = currentOwner, options = {}) {
  const owner = {
    kind: 'owner',
    id: nextId++,
    name: options.name ?? `owner-${nextId - 1}`,
    parent: parent ?? null,
    children: [],
    cleanups: [],
    domRemovers: [],
    observers: [],
    mounted: false,
    disposed: false,
  };
  if (owner.parent) owner.parent.children.push(owner);
  return owner;
}

export function runWithOwner(owner, fn) {
  if (!owner || owner.kind !== 'owner') throw new TypeError('runWithOwner requires an owner');
  if (owner.disposed) throw new Error(`Cannot run with disposed owner ${owner.name}`);
  const previous = currentOwner;
  currentOwner = owner;
  try { return fn(); } finally { currentOwner = previous; }
}

export function onCleanup(cleanup) {
  if (!currentOwner) throw new Error('onCleanup requires an active owner');
  if (typeof cleanup !== 'function') throw new TypeError('cleanup must be a function');
  currentOwner.cleanups.push(cleanup);
  return cleanup;
}

export function ownDom(remove) {
  if (!currentOwner) throw new Error('ownDom requires an active owner');
  if (typeof remove !== 'function') throw new TypeError('DOM remover must be a function');
  currentOwner.domRemovers.push(remove);
  return remove;
}

export function mountOwner(owner) {
  if (!owner || owner.kind !== 'owner') throw new TypeError('mountOwner requires an owner');
  if (owner.disposed || owner.mounted) return owner;
  owner.mounted = true;
  for (const observer of owner.observers) queueObserver(observer);
  for (const child of owner.children) mountOwner(child);
  return owner;
}

export function disposeOwner(owner) {
  if (!owner || owner.kind !== 'owner') throw new TypeError('disposeOwner requires an owner');
  if (owner.disposed) return;
  owner.disposed = true;

  for (let index = owner.children.length - 1; index >= 0; index -= 1) {
    disposeOwner(owner.children[index]);
  }
  for (let index = owner.cleanups.length - 1; index >= 0; index -= 1) {
    owner.cleanups[index]();
  }
  for (let index = owner.domRemovers.length - 1; index >= 0; index -= 1) {
    owner.domRemovers[index]();
  }

  for (const observer of owner.observers) disposeObserver(observer);
  owner.children.length = 0;
  owner.cleanups.length = 0;
  owner.domRemovers.length = 0;
  owner.observers.length = 0;
}

export function createStateCell(initial, options = {}) {
  const state = {
    kind: 'state',
    id: nextId++,
    name: options.name ?? `state-${nextId - 1}`,
    raw: options.raw === true,
    rawValue: unwrapDeepProxy(initial),
    value: undefined,
    version: 0,
    observers: new Set(),
    deepContext: null,
  };
  if (!state.raw) {
    state.deepContext = createDeepStateController({
      stateName: state.name,
      track,
      notify: (source) => notifySource(source, state.name),
      assertWritable,
    });
  }
  state.value = state.raw ? state.rawValue : state.deepContext.wrap(state.rawValue);
  return state;
}

export function createDerived(compute, options = {}) {
  if (typeof compute !== 'function') throw new TypeError('derive compute must be a function');
  return {
    kind: 'derive',
    id: nextId++,
    name: options.name ?? `derive-${nextId - 1}`,
    compute,
    value: undefined,
    version: 0,
    initialized: false,
    dirty: true,
    computing: false,
    observers: new Set(),
    deps: new Map(),
    disposed: false,
  };
}

export function createSync(callback, options = {}) {
  return createOwnedObserver('sync', callback, options);
}

export function createDomEffect(callback, options = {}) {
  return createOwnedObserver('dom', callback, options);
}

function createOwnedObserver(kind, callback, options) {
  if (!currentOwner) throw new Error(`${kind} observer requires an active owner`);
  if (typeof callback !== 'function') throw new TypeError(`${kind} callback must be a function`);
  const observer = {
    kind,
    id: nextId++,
    name: options.name ?? `${kind}-${nextId - 1}`,
    owner: currentOwner,
    callback,
    deps: new Map(),
    queued: false,
    hasRun: false,
    cleanup: null,
    disposed: false,
  };
  currentOwner.observers.push(observer);
  currentOwner.cleanups.push(() => disposeObserver(observer));
  if (currentOwner.mounted) queueObserver(observer);
  return observer;
}

export function read(source) {
  if (!source || (source.kind !== 'state' && source.kind !== 'derive')) throw new TypeError('read requires reactive state or derive');
  if (source.kind === 'derive') ensureDerived(source);
  track(source);
  return source.value;
}

export function write(state, nextValue) {
  if (!state || state.kind !== 'state') throw new TypeError('write requires a state cell');
  assertWritable();
  const rawNext = unwrapDeepProxy(nextValue);
  if (Object.is(state.rawValue, rawNext)) return state.value;

  state.rawValue = rawNext;
  state.value = state.raw ? rawNext : state.deepContext.wrap(rawNext);
  notifySource(state, state.name);
  return state.value;
}

export function updateState(state, direction, postfix = false) {
  if (direction !== 1 && direction !== -1) throw new TypeError('updateState direction must be 1 or -1');
  let next = read(state);
  const previous = direction === 1 ? next++ : next--;
  write(state, next);
  return postfix ? previous : next;
}

function assertWritable() {
  if (activeObserver?.kind === 'derive') {
    throw new Error(`Reactive state write is not allowed while derive ${activeObserver.name} is evaluating.`);
  }
}

function notifySource(source, stateName) {
  source.version += 1;
  if (activeFlush && activeObserver?.kind === 'sync') {
    activeFlush.states.add(stateName);
    activeFlush.syncs.add(syncLabel(activeObserver));
  }
  for (const observer of [...source.observers]) invalidateObserver(observer);
}

export function untrack(fn) {
  if (typeof fn !== 'function') throw new TypeError('untrack requires a function');
  const previous = activeObserver;
  activeObserver = null;
  try { return fn(); } finally { activeObserver = previous; }
}

function track(source) {
  if (!activeObserver || activeObserver.disposed) return;
  if (!activeObserver.deps.has(source)) {
    activeObserver.deps.set(source, source.version);
    source.observers.add(activeObserver);
  } else {
    activeObserver.deps.set(source, source.version);
  }
}

function ensureDerived(derived) {
  if (!derived.dirty && derived.initialized) return;
  if (derived.computing) throw new Error(`Reactive derive cycle detected in ${derived.name}.`);

  derived.computing = true;
  cleanupDependencies(derived);
  const previousObserver = activeObserver;
  activeObserver = derived;
  try {
    const nextValue = derived.compute();
    const changed = !derived.initialized || !Object.is(derived.value, nextValue);
    derived.value = nextValue;
    derived.initialized = true;
    derived.dirty = false;
    if (changed) derived.version += 1;
  } finally {
    activeObserver = previousObserver;
    derived.computing = false;
  }
}

function invalidateObserver(observer) {
  if (observer.disposed) return;
  if (observer.kind === 'derive') {
    if (observer.dirty) return;
    observer.dirty = true;
    for (const dependent of [...observer.observers]) invalidateObserver(dependent);
    return;
  }
  queueObserver(observer);
}

function queueObserver(observer) {
  if (observer.disposed || observer.owner.disposed || !observer.owner.mounted || observer.queued) return;
  observer.queued = true;
  (observer.kind === 'dom' ? pendingDom : pendingSync).add(observer);
  scheduleFlush();
}

function scheduleFlush() {
  if (flushing || flushScheduled) return;
  flushScheduled = true;
  queueMicrotask(() => {
    flushScheduled = false;
    flushRuntime();
  });
}

export function flushRuntime() {
  if (flushing) return;
  flushing = true;
  flushScheduled = false;
  const previousFlush = activeFlush;
  activeFlush = { states: new Set(), syncs: new Set(), syncRuns: new Map() };
  try {
    while (pendingDom.size || pendingSync.size) {
      drainDom();
      if (pendingDom.size) continue;
      drainSyncUntilDomInvalidation();
    }
  } finally {
    activeFlush = previousFlush;
    flushing = false;
  }
}

function drainDom() {
  while (pendingDom.size) {
    const batch = [...pendingDom];
    pendingDom.clear();
    for (const observer of batch) {
      observer.queued = false;
      if (observerNeedsRun(observer)) runObserver(observer);
    }
  }
}

function drainSyncUntilDomInvalidation() {
  if (!pendingSync.size) return;
  const batch = [...pendingSync];
  pendingSync.clear();
  for (let index = 0; index < batch.length; index += 1) {
    const observer = batch[index];
    observer.queued = false;
    if (observerNeedsRun(observer)) {
      const count = (activeFlush.syncRuns.get(observer) ?? 0) + 1;
      activeFlush.syncRuns.set(observer, count);
      activeFlush.syncs.add(syncLabel(observer));
      if (count > MAX_SYNC_RUNS_PER_FLUSH) {
        throw new ReactiveCycleError(activeFlush.states, activeFlush.syncs);
      }
      runObserver(observer);
    }
    if (pendingDom.size) {
      for (let remainder = index + 1; remainder < batch.length; remainder += 1) queueObserver(batch[remainder]);
      break;
    }
  }
}

function observerNeedsRun(observer) {
  if (observer.disposed || observer.owner.disposed || !observer.owner.mounted) return false;
  if (!observer.hasRun) return true;
  for (const [source, version] of observer.deps) {
    if (source.kind === 'derive') ensureDerived(source);
    if (source.version !== version) return true;
  }
  return false;
}

function runObserver(observer) {
  if (observer.kind === 'sync' && observer.cleanup) {
    const cleanup = observer.cleanup;
    observer.cleanup = null;
    untrack(cleanup);
  }

  cleanupDependencies(observer);
  const previousObserver = activeObserver;
  const previousOwner = currentOwner;
  activeObserver = observer;
  currentOwner = observer.owner;
  try {
    const result = observer.callback();
    if (observer.kind === 'sync' && typeof result === 'function') observer.cleanup = result;
    observer.hasRun = true;
  } finally {
    activeObserver = previousObserver;
    currentOwner = previousOwner;
  }
}

function cleanupDependencies(observer) {
  for (const source of observer.deps.keys()) source.observers.delete(observer);
  observer.deps.clear();
}

function disposeObserver(observer) {
  if (!observer || observer.disposed) return;
  observer.disposed = true;
  pendingDom.delete(observer);
  pendingSync.delete(observer);
  observer.queued = false;
  cleanupDependencies(observer);
  if (observer.cleanup) {
    const cleanup = observer.cleanup;
    observer.cleanup = null;
    untrack(cleanup);
  }
}

function syncLabel(observer) {
  return `${observer.owner.name}/${observer.name}`;
}
