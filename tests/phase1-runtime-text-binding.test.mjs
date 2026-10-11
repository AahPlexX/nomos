import test from 'node:test';
import assert from 'node:assert/strict';
import { bindText } from '../packages/runtime/src/internal.mjs';
import {
  createOwner,
  createStateCell,
  disposeOwner,
  mountOwner,
  read,
  runWithOwner,
  write,
} from '../packages/runtime/src/reactivity.mjs';

const nextMicrotask = () => new Promise((resolve) => queueMicrotask(resolve));

test('bindText updates through the DOM observer phase and stops after owner disposal', async () => {
  const owner = createOwner(null, { name: 'root' });
  const label = createStateCell('first', { name: 'label' });
  const node = { textContent: '' };

  runWithOwner(owner, () => {
    bindText(node, () => read(label), { name: 'label-text' });
  });
  mountOwner(owner);
  await nextMicrotask();
  assert.equal(node.textContent, 'first');

  write(label, 'second');
  await nextMicrotask();
  assert.equal(node.textContent, 'second');

  disposeOwner(owner);
  write(label, 'third');
  await nextMicrotask();
  assert.equal(node.textContent, 'second');
});
