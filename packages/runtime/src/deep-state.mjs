const ITERATE_KEY = Symbol('iterate');
const SIZE_KEY = Symbol('size');
const proxyToRaw = new WeakMap();

export function unwrapDeepProxy(value) {
  return value && (typeof value === 'object' || typeof value === 'function')
    ? (proxyToRaw.get(value) ?? value)
    : value;
}

export function createDeepStateController({ stateName, track, notify, assertWritable }) {
  if (typeof stateName !== 'string') throw new TypeError('stateName must be a string');
  if (typeof track !== 'function' || typeof notify !== 'function' || typeof assertWritable !== 'function') {
    throw new TypeError('deep state controller requires track, notify, and assertWritable hooks');
  }

  const context = {
    stateName,
    rawToProxy: new WeakMap(),
    depsByTarget: new WeakMap(),
    track,
    notify,
    assertWritable,
  };

  return {
    wrap(value) { return wrapDeep(context, value); },
  };
}

function isDeepTrackable(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return false;
  if (Array.isArray(value) || value instanceof Map || value instanceof Set) return true;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function wrapDeep(context, value) {
  const raw = unwrapDeepProxy(value);
  if (!isDeepTrackable(raw)) return raw;
  const cached = context.rawToProxy.get(raw);
  if (cached) return cached;

  let proxy;
  if (raw instanceof Map) proxy = createMapProxy(context, raw);
  else if (raw instanceof Set) proxy = createSetProxy(context, raw);
  else proxy = createObjectProxy(context, raw);
  context.rawToProxy.set(raw, proxy);
  proxyToRaw.set(proxy, raw);
  return proxy;
}

function dependencyFor(context, target, key) {
  let deps = context.depsByTarget.get(target);
  if (!deps) {
    deps = new Map();
    context.depsByTarget.set(target, deps);
  }
  let source = deps.get(key);
  if (!source) {
    source = {
      kind: 'property',
      name: context.stateName,
      version: 0,
      observers: new Set(),
    };
    deps.set(key, source);
  }
  return source;
}

function notifyProperty(context, target, key) {
  context.notify(dependencyFor(context, target, key));
}

function trackProperty(context, target, key) {
  context.track(dependencyFor(context, target, key));
}

function createObjectProxy(context, target) {
  return new Proxy(target, {
    get(raw, key, receiver) {
      if (shouldTrackObjectKey(raw, key)) trackProperty(context, raw, key);
      const value = Reflect.get(raw, key, receiver);
      const descriptor = Reflect.getOwnPropertyDescriptor(raw, key);
      if (descriptor && descriptor.configurable === false && 'value' in descriptor && descriptor.writable === false) {
        return value;
      }
      return wrapDeep(context, value);
    },
    set(raw, key, value, receiver) {
      context.assertWritable();
      const rawValue = unwrapDeepProxy(value);
      const hadKey = Object.prototype.hasOwnProperty.call(raw, key);
      const oldValue = raw[key];
      const oldLength = Array.isArray(raw) ? raw.length : null;
      if (hadKey && Object.is(oldValue, rawValue)) return true;
      const result = Reflect.set(raw, key, rawValue, receiver);
      if (!result) return false;
      notifyProperty(context, raw, key);
      if (!hadKey) notifyProperty(context, raw, ITERATE_KEY);
      if (Array.isArray(raw)) notifyArrayStructuralChanges(context, raw, key, oldLength);
      return true;
    },
    deleteProperty(raw, key) {
      context.assertWritable();
      const hadKey = Object.prototype.hasOwnProperty.call(raw, key);
      if (!hadKey) return true;
      const result = Reflect.deleteProperty(raw, key);
      if (!result) return false;
      notifyProperty(context, raw, key);
      notifyProperty(context, raw, ITERATE_KEY);
      return true;
    },
    has(raw, key) {
      trackProperty(context, raw, key);
      return Reflect.has(raw, key);
    },
    ownKeys(raw) {
      trackProperty(context, raw, ITERATE_KEY);
      return Reflect.ownKeys(raw);
    },
  });
}

function shouldTrackObjectKey(target, key) {
  if (key === '__proto__' || key === 'prototype' || key === 'constructor') return false;
  if (Array.isArray(target) && key === Symbol.iterator) return false;
  return Object.prototype.hasOwnProperty.call(target, key)
    || (Array.isArray(target) && key === 'length');
}

function notifyArrayStructuralChanges(context, target, key, oldLength) {
  if (key === 'length') {
    const newLength = target.length;
    if (oldLength !== newLength) {
      notifyProperty(context, target, ITERATE_KEY);
      if (newLength < oldLength) {
        const deps = context.depsByTarget.get(target);
        if (deps) {
          for (const [depKey, source] of deps) {
            if (isArrayIndex(depKey) && Number(depKey) >= newLength) context.notify(source);
          }
        }
      }
    }
    return;
  }
  if (isArrayIndex(key) && target.length !== oldLength) {
    notifyProperty(context, target, 'length');
    notifyProperty(context, target, ITERATE_KEY);
  }
}

function isArrayIndex(key) {
  if (typeof key !== 'string' || key === '') return false;
  const index = Number(key);
  return Number.isInteger(index) && index >= 0 && index < 4294967295 && String(index) === key;
}

function createMapProxy(context, target) {
  let proxy;
  proxy = new Proxy(target, {
    get(raw, key) {
      if (key === 'size') {
        trackProperty(context, raw, SIZE_KEY);
        return raw.size;
      }
      if (key === 'get') return (mapKey) => {
        const rawKey = unwrapDeepProxy(mapKey);
        trackProperty(context, raw, rawKey);
        return wrapDeep(context, raw.get(rawKey));
      };
      if (key === 'has') return (mapKey) => {
        const rawKey = unwrapDeepProxy(mapKey);
        trackProperty(context, raw, rawKey);
        return raw.has(rawKey);
      };
      if (key === 'set') return (mapKey, value) => {
        context.assertWritable();
        const rawKey = unwrapDeepProxy(mapKey);
        const rawValue = unwrapDeepProxy(value);
        const had = raw.has(rawKey);
        const oldValue = raw.get(rawKey);
        if (had && Object.is(oldValue, rawValue)) return proxy;
        raw.set(rawKey, rawValue);
        notifyProperty(context, raw, rawKey);
        notifyProperty(context, raw, ITERATE_KEY);
        if (!had) notifyProperty(context, raw, SIZE_KEY);
        return proxy;
      };
      if (key === 'delete') return (mapKey) => {
        context.assertWritable();
        const rawKey = unwrapDeepProxy(mapKey);
        if (!raw.has(rawKey)) return false;
        const result = raw.delete(rawKey);
        notifyProperty(context, raw, rawKey);
        notifyProperty(context, raw, ITERATE_KEY);
        notifyProperty(context, raw, SIZE_KEY);
        return result;
      };
      if (key === 'clear') return () => {
        context.assertWritable();
        if (raw.size === 0) return undefined;
        const deps = context.depsByTarget.get(raw);
        raw.clear();
        if (deps) {
          for (const [depKey, source] of deps) {
            if (depKey !== ITERATE_KEY && depKey !== SIZE_KEY) context.notify(source);
          }
        }
        notifyProperty(context, raw, ITERATE_KEY);
        notifyProperty(context, raw, SIZE_KEY);
        return undefined;
      };
      if (key === 'keys') return () => mapIterator(context, raw, raw.keys(), 'key');
      if (key === 'values') return () => mapIterator(context, raw, raw.values(), 'value');
      if (key === 'entries' || key === Symbol.iterator) return () => mapIterator(context, raw, raw.entries(), 'entry');
      if (key === 'forEach') return (callback, thisArg) => {
        if (typeof callback !== 'function') throw new TypeError('Map.forEach callback must be a function');
        trackProperty(context, raw, ITERATE_KEY);
        raw.forEach((value, mapKey) => callback.call(thisArg, wrapDeep(context, value), wrapDeep(context, mapKey), proxy));
      };
      const value = Reflect.get(raw, key, raw);
      return typeof value === 'function' ? value.bind(raw) : value;
    },
  });
  return proxy;
}

function mapIterator(context, target, iterator, mode) {
  trackProperty(context, target, ITERATE_KEY);
  return {
    next() {
      const step = iterator.next();
      if (step.done) return step;
      if (mode === 'entry') return { done: false, value: [wrapDeep(context, step.value[0]), wrapDeep(context, step.value[1])] };
      return { done: false, value: wrapDeep(context, step.value) };
    },
    [Symbol.iterator]() { return this; },
  };
}

function createSetProxy(context, target) {
  let proxy;
  proxy = new Proxy(target, {
    get(raw, key) {
      if (key === 'size') {
        trackProperty(context, raw, SIZE_KEY);
        return raw.size;
      }
      if (key === 'has') return (value) => {
        const rawValue = unwrapDeepProxy(value);
        trackProperty(context, raw, rawValue);
        return raw.has(rawValue);
      };
      if (key === 'add') return (value) => {
        context.assertWritable();
        const rawValue = unwrapDeepProxy(value);
        if (raw.has(rawValue)) return proxy;
        raw.add(rawValue);
        notifyProperty(context, raw, rawValue);
        notifyProperty(context, raw, ITERATE_KEY);
        notifyProperty(context, raw, SIZE_KEY);
        return proxy;
      };
      if (key === 'delete') return (value) => {
        context.assertWritable();
        const rawValue = unwrapDeepProxy(value);
        if (!raw.has(rawValue)) return false;
        const result = raw.delete(rawValue);
        notifyProperty(context, raw, rawValue);
        notifyProperty(context, raw, ITERATE_KEY);
        notifyProperty(context, raw, SIZE_KEY);
        return result;
      };
      if (key === 'clear') return () => {
        context.assertWritable();
        if (raw.size === 0) return undefined;
        const deps = context.depsByTarget.get(raw);
        raw.clear();
        if (deps) {
          for (const [depKey, source] of deps) {
            if (depKey !== ITERATE_KEY && depKey !== SIZE_KEY) context.notify(source);
          }
        }
        notifyProperty(context, raw, ITERATE_KEY);
        notifyProperty(context, raw, SIZE_KEY);
        return undefined;
      };
      if (key === 'values' || key === 'keys' || key === Symbol.iterator) return () => setIterator(context, raw, raw.values(), false);
      if (key === 'entries') return () => setIterator(context, raw, raw.values(), true);
      if (key === 'forEach') return (callback, thisArg) => {
        if (typeof callback !== 'function') throw new TypeError('Set.forEach callback must be a function');
        trackProperty(context, raw, ITERATE_KEY);
        raw.forEach((value) => {
          const wrapped = wrapDeep(context, value);
          callback.call(thisArg, wrapped, wrapped, proxy);
        });
      };
      const value = Reflect.get(raw, key, raw);
      return typeof value === 'function' ? value.bind(raw) : value;
    },
  });
  return proxy;
}

function setIterator(context, target, iterator, entries) {
  trackProperty(context, target, ITERATE_KEY);
  return {
    next() {
      const step = iterator.next();
      if (step.done) return step;
      const value = wrapDeep(context, step.value);
      return { done: false, value: entries ? [value, value] : value };
    },
    [Symbol.iterator]() { return this; },
  };
}
