import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ReactiveCycleError,
  createDerived,
  createDomEffect,
  createOwner,
  createStateCell,
  createSync,
  disposeOwner,
  flushRuntime,
  mountOwner,
  onCleanup,
  ownDom,
  read,
  runWithOwner,
  untrack,
  write,
} from '../packages/runtime/src/reactivity.mjs';

test('state writes are synchronous while derives stay lazy, memoized, and glitch-free', () => {
  const a = createStateCell(1, { name: 'a' });
  const b = createStateCell(2, { name: 'b' });
  let calls = 0;
  const sum = createDerived(() => { calls += 1; return read(a) + read(b); }, { name: 'sum' });
  assert.equal(read(sum), 3);
  assert.equal(read(sum), 3);
  assert.equal(calls, 1);
  write(a, 1);
  assert.equal(calls, 1);
  write(a, 3);
  write(b, 4);
  assert.equal(calls, 1);
  assert.equal(read(sum), 7);
  assert.equal(calls, 2);
});

test('dynamic dependencies unsubscribe branches that are no longer read', () => {
  const chooseA = createStateCell(true, { name: 'chooseA' });
  const a = createStateCell(1, { name: 'a' });
  const b = createStateCell(10, { name: 'b' });
  let calls = 0;
  const selected = createDerived(() => {
    calls += 1;
    return read(chooseA) ? read(a) : read(b);
  }, { name: 'selected' });
  assert.equal(read(selected), 1);
  write(b, 11);
  assert.equal(read(selected), 1);
  assert.equal(calls, 1);
  write(chooseA, false);
  assert.equal(read(selected), 11);
  assert.equal(calls, 2);
  write(a, 2);
  assert.equal(read(selected), 11);
  assert.equal(calls, 2);
});

test('derive writes are rejected at runtime', () => {
  const source = createStateCell(0, { name: 'source' });
  const illegal = createDerived(() => {
    write(source, 1);
    return 1;
  }, { name: 'illegal' });
  assert.throws(() => read(illegal), /derive.*write|write.*derive/i);
});

test('mounted DOM effects flush before sync reruns and synchronous writes coalesce', () => {
  const owner = createOwner(null, { name: 'component' });
  const count = createStateCell(0, { name: 'count' });
  const log = [];
  runWithOwner(owner, () => {
    createDomEffect(() => log.push(`dom:${read(count)}`), { name: 'text' });
    createSync(() => {
      log.push(`sync:${read(count)}`);
      return () => log.push('cleanup');
    }, { name: 'storage' });
  });
  assert.deepEqual(log, []);
  mountOwner(owner);
  flushRuntime();
  assert.deepEqual(log, ['dom:0', 'sync:0']);
  log.length = 0;
  write(count, 1);
  write(count, 2);
  flushRuntime();
  assert.deepEqual(log, ['dom:2', 'cleanup', 'sync:2']);
});

test('sync only tracks reads made before an await boundary', async () => {
  const owner = createOwner(null, { name: 'component' });
  const before = createStateCell(0, { name: 'before' });
  const after = createStateCell(0, { name: 'after' });
  let runs = 0;
  runWithOwner(owner, () => {
    createSync(async () => {
      runs += 1;
      read(before);
      await Promise.resolve();
      read(after);
    }, { name: 'async-sync' });
  });
  mountOwner(owner);
  flushRuntime();
  await Promise.resolve();
  assert.equal(runs, 1);
  write(after, 1);
  flushRuntime();
  assert.equal(runs, 1);
  write(before, 1);
  flushRuntime();
  await Promise.resolve();
  assert.equal(runs, 2);
});

test('untrack excludes reads from the active dependency set', () => {
  const owner = createOwner(null, { name: 'component' });
  const tracked = createStateCell(0, { name: 'tracked' });
  const ignored = createStateCell(0, { name: 'ignored' });
  let runs = 0;
  runWithOwner(owner, () => createSync(() => {
    runs += 1;
    read(tracked);
    untrack(() => read(ignored));
  }, { name: 'sync' }));
  mountOwner(owner);
  flushRuntime();
  write(ignored, 1);
  flushRuntime();
  assert.equal(runs, 1);
  write(tracked, 1);
  flushRuntime();
  assert.equal(runs, 2);
});

test('owner disposal is children first, local cleanup reverse-creation, then DOM', () => {
  const root = createOwner(null, { name: 'root' });
  const log = [];
  runWithOwner(root, () => {
    onCleanup(() => log.push('root-cleanup-1'));
    onCleanup(() => log.push('root-cleanup-2'));
    ownDom(() => log.push('root-dom'));
    const child = createOwner(undefined, { name: 'child' });
    runWithOwner(child, () => {
      onCleanup(() => log.push('child-cleanup-1'));
      onCleanup(() => log.push('child-cleanup-2'));
      ownDom(() => log.push('child-dom'));
    });
  });
  disposeOwner(root);
  assert.deepEqual(log, [
    'child-cleanup-2', 'child-cleanup-1', 'child-dom',
    'root-cleanup-2', 'root-cleanup-1', 'root-dom',
  ]);
});

test('non-terminating sync cycles identify participating state and sync owner', () => {
  const owner = createOwner(null, { name: 'CounterComponent' });
  const count = createStateCell(0, { name: 'count' });
  runWithOwner(owner, () => createSync(() => {
    write(count, read(count) + 1);
  }, { name: 'increment-loop' }));
  mountOwner(owner);
  assert.throws(
    () => flushRuntime(),
    (error) => error instanceof ReactiveCycleError
      && /count/.test(error.message)
      && /CounterComponent\/increment-loop/.test(error.message),
  );
});

test('scheduler automatically delivers one batched microtask flush', async () => {
  const owner = createOwner(null, { name: 'component' });
  const value = createStateCell(0, { name: 'value' });
  const seen = [];
  runWithOwner(owner, () => createSync(() => seen.push(read(value)), { name: 'observer' }));
  mountOwner(owner);
  await Promise.resolve();
  assert.deepEqual(seen, [0]);
  write(value, 1);
  write(value, 2);
  await Promise.resolve();
  assert.deepEqual(seen, [0, 2]);
});

test('sync cleanup runs during owner disposal', () => {
  const owner = createOwner(null, { name: 'component' });
  const log = [];
  runWithOwner(owner, () => createSync(() => {
    log.push('run');
    return () => log.push('cleanup');
  }, { name: 'external-system' }));
  mountOwner(owner);
  flushRuntime();
  disposeOwner(owner);
  assert.deepEqual(log, ['run', 'cleanup']);
});
