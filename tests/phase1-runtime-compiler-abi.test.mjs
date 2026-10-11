import test from 'node:test';
import assert from 'node:assert/strict';
import { createStateCell, read, updateState } from '../packages/runtime/src/internal.mjs';

test('internal updateState preserves prefix and postfix increment semantics', () => {
  const count = createStateCell(1, { name: 'count' });
  assert.equal(updateState(count, 1, true), 1);
  assert.equal(read(count), 2);
  assert.equal(updateState(count, 1, false), 3);
  assert.equal(read(count), 3);
});

test('internal updateState preserves BigInt increment semantics', () => {
  const value = createStateCell(1n, { name: 'value' });
  assert.equal(updateState(value, 1, true), 1n);
  assert.equal(read(value), 2n);
  assert.equal(updateState(value, -1, false), 1n);
  assert.equal(read(value), 1n);
});
