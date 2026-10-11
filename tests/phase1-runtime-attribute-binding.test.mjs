import test from 'node:test';
import assert from 'node:assert/strict';
import * as runtimeInternal from '../packages/runtime/src/internal.mjs';
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

function requireBindAttribute() {
  assert.equal(typeof runtimeInternal.bindAttribute, 'function', 'runtimeInternal.bindAttribute must be implemented');
  return runtimeInternal.bindAttribute;
}

function createFakeElement() {
  const attributes = new Map();
  return {
    setAttribute(name, value) { attributes.set(name, String(value)); },
    removeAttribute(name) { attributes.delete(name); },
    hasAttribute(name) { return attributes.has(name); },
    getAttribute(name) { return attributes.has(name) ? attributes.get(name) : null; },
  };
}

test('bindAttribute stringifies ordinary values, removes nullish values, and stops after owner disposal', async () => {
  const bindAttribute = requireBindAttribute();
  const owner = createOwner(null, { name: 'root' });
  const value = createStateCell(1, { name: 'value' });
  const element = createFakeElement();

  runWithOwner(owner, () => {
    bindAttribute(element, 'data-count', () => read(value), { name: 'data-count' });
  });
  mountOwner(owner);
  await nextMicrotask();
  assert.equal(element.getAttribute('data-count'), '1');

  write(value, null);
  await nextMicrotask();
  assert.equal(element.hasAttribute('data-count'), false);

  write(value, false);
  await nextMicrotask();
  assert.equal(element.getAttribute('data-count'), 'false');

  disposeOwner(owner);
  write(value, 2);
  await nextMicrotask();
  assert.equal(element.getAttribute('data-count'), 'false');
});

test('bindAttribute uses presence/absence semantics for certified boolean HTML attributes', async () => {
  const bindAttribute = requireBindAttribute();
  const owner = createOwner(null, { name: 'root' });
  const enabled = createStateCell(false, { name: 'enabled' });
  const element = createFakeElement();

  runWithOwner(owner, () => {
    bindAttribute(element, 'inert', () => read(enabled), { name: 'inert', boolean: true });
  });
  mountOwner(owner);
  await nextMicrotask();
  assert.equal(element.hasAttribute('inert'), false);

  write(enabled, true);
  await nextMicrotask();
  assert.equal(element.hasAttribute('inert'), true);
  assert.equal(element.getAttribute('inert'), '');

  write(enabled, false);
  await nextMicrotask();
  assert.equal(element.hasAttribute('inert'), false);
});
