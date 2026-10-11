import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDerived,
  createOwner,
  createStateCell,
  createSync,
  flushRuntime,
  mountOwner,
  read,
  runWithOwner,
  write,
} from '../packages/runtime/src/reactivity.mjs';

test('nested plain-object reads track the mutated property without invalidating unrelated siblings', () => {
  const profile = createStateCell({ user: { name: 'Ada', age: 36 }, status: 'ready' }, { name: 'profile' });
  let calls = 0;
  const name = createDerived(() => {
    calls += 1;
    return read(profile).user.name;
  }, { name: 'name' });

  assert.equal(read(name), 'Ada');
  assert.equal(calls, 1);
  read(profile).status = 'busy';
  assert.equal(read(name), 'Ada');
  assert.equal(calls, 1);
  read(profile).user.name = 'Grace';
  assert.equal(read(name), 'Grace');
  assert.equal(calls, 2);
  read(profile).user.name = 'Grace';
  assert.equal(read(name), 'Grace');
  assert.equal(calls, 2);
});

test('object key iteration reacts to add and delete without broad sibling invalidation', () => {
  const record = createStateCell({ a: 1 }, { name: 'record' });
  let keyCalls = 0;
  let aCalls = 0;
  const keys = createDerived(() => { keyCalls += 1; return Object.keys(read(record)).join(','); });
  const a = createDerived(() => { aCalls += 1; return read(record).a; });
  assert.equal(read(keys), 'a');
  assert.equal(read(a), 1);
  read(record).b = 2;
  assert.equal(read(keys), 'a,b');
  assert.equal(read(a), 1);
  assert.equal(aCalls, 1);
  delete read(record).b;
  assert.equal(read(keys), 'a');
});

test('arrays react to indexed mutation and structural length changes', () => {
  const items = createStateCell(['a'], { name: 'items' });
  let firstCalls = 0;
  let lengthCalls = 0;
  const first = createDerived(() => { firstCalls += 1; return read(items)[0]; });
  const length = createDerived(() => { lengthCalls += 1; return read(items).length; });

  assert.equal(read(first), 'a');
  assert.equal(read(length), 1);
  read(items).push('b');
  assert.equal(read(first), 'a');
  assert.equal(firstCalls, 1);
  assert.equal(read(length), 2);
  assert.equal(lengthCalls, 2);
  read(items)[0] = 'z';
  assert.equal(read(first), 'z');
  assert.equal(firstCalls, 2);
  read(items).length = 0;
  assert.equal(read(first), undefined);
  assert.equal(read(length), 0);
});

test('Map get/has/size dependencies update precisely across set and delete', () => {
  const values = createStateCell(new Map([['a', 1]]), { name: 'values' });
  let aCalls = 0;
  let sizeCalls = 0;
  const a = createDerived(() => { aCalls += 1; return read(values).get('a'); });
  const size = createDerived(() => { sizeCalls += 1; return read(values).size; });

  assert.equal(read(a), 1);
  assert.equal(read(size), 1);
  read(values).set('b', 2);
  assert.equal(read(a), 1);
  assert.equal(aCalls, 1);
  assert.equal(read(size), 2);
  assert.equal(sizeCalls, 2);
  read(values).set('a', 3);
  assert.equal(read(a), 3);
  assert.equal(aCalls, 2);
  read(values).delete('a');
  assert.equal(read(a), undefined);
  assert.equal(read(values).has('a'), false);
  read(values).clear();
  assert.equal(read(size), 0);
});

test('Set membership and size are reactive while duplicate add is a no-op', () => {
  const tags = createStateCell(new Set(['a']), { name: 'tags' });
  let runs = 0;
  const owner = createOwner(null, { name: 'component' });
  runWithOwner(owner, () => createSync(() => {
    runs += 1;
    read(tags).has('a');
    read(tags).size;
  }, { name: 'tags-sync' }));
  mountOwner(owner);
  flushRuntime();
  assert.equal(runs, 1);
  read(tags).add('a');
  flushRuntime();
  assert.equal(runs, 1);
  read(tags).add('b');
  flushRuntime();
  assert.equal(runs, 2);
  read(tags).delete('a');
  flushRuntime();
  assert.equal(runs, 3);
  read(tags).clear();
  flushRuntime();
  assert.equal(runs, 4);
});

test('state raw opt-out keeps nested mutation non-reactive while root replacement stays reactive', () => {
  const raw = createStateCell({ count: 0 }, { name: 'raw', raw: true });
  let calls = 0;
  const count = createDerived(() => { calls += 1; return read(raw).count; });
  assert.equal(read(count), 0);
  read(raw).count = 1;
  assert.equal(read(count), 0);
  assert.equal(calls, 1);
  write(raw, { count: 2 });
  assert.equal(read(count), 2);
  assert.equal(calls, 2);
});

test('non-deep values are reference-held rather than proxied', () => {
  class Box { constructor(value) { this.value = value; } }
  const date = new Date('2026-01-01T00:00:00Z');
  const box = new Box(1);
  const frozen = Object.freeze({ value: 1 });
  const state = createStateCell({ date, box, frozen });
  const value = read(state);
  assert.equal(value.date, date);
  assert.equal(value.box, box);
  assert.equal(value.frozen, frozen);
});

test('deep proxy identity is stable and cycle-safe', () => {
  const raw = { name: 'root' };
  raw.self = raw;
  const state = createStateCell(raw, { name: 'cyclic' });
  const value = read(state);
  assert.equal(value, read(state));
  assert.equal(value.self, value);
});
