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

function requireBindAttributes() {
  assert.equal(typeof runtimeInternal.bindAttributes, 'function', 'runtimeInternal.bindAttributes must be implemented');
  return runtimeInternal.bindAttributes;
}

function createFakeElement(initial = {}) {
  const attributes = new Map(Object.entries(initial).map(([name, value]) => [name.toLowerCase(), String(value)]));
  return {
    setAttribute(name, value) { attributes.set(String(name).toLowerCase(), String(value)); },
    removeAttribute(name) { attributes.delete(String(name).toLowerCase()); },
    hasAttribute(name) { return attributes.has(String(name).toLowerCase()); },
    getAttribute(name) { const key = String(name).toLowerCase(); return attributes.has(key) ? attributes.get(key) : null; },
    getAttributeNames() { return [...attributes.keys()]; },
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

test('bindAttributes applies spread and explicit attributes in source order and restores earlier fallbacks', async () => {
  const bindAttributes = requireBindAttributes();
  const owner = createOwner(null, { name: 'root' });
  const before = createStateCell('before', { name: 'before' });
  const after = createStateCell('after', { name: 'after' });
  const spread = createStateCell({
    'data-collision': 'spread',
    title: 'from-spread',
    class: 'spread-class',
    inert: true,
  }, { name: 'spread' });
  const element = createFakeElement({ title: 'static-title' });

  runWithOwner(owner, () => {
    bindAttributes(element, [
      { kind: 'value', name: 'data-collision', compute: () => read(before) },
      { kind: 'static', name: 'title' },
      { kind: 'spread', compute: () => read(spread) },
      { kind: 'value', name: 'class', compute: () => read(after) },
    ], { name: 'attrs' });
  });
  mountOwner(owner);
  await nextMicrotask();

  assert.equal(element.getAttribute('data-collision'), 'spread');
  assert.equal(element.getAttribute('title'), 'from-spread');
  assert.equal(element.getAttribute('class'), 'after');
  assert.equal(element.getAttribute('inert'), '');

  write(spread, { 'data-next': 'next', class: 'spread-next', inert: false });
  await nextMicrotask();
  assert.equal(element.getAttribute('data-collision'), 'before');
  assert.equal(element.getAttribute('title'), 'static-title');
  assert.equal(element.getAttribute('class'), 'after');
  assert.equal(element.hasAttribute('inert'), false);
  assert.equal(element.getAttribute('data-next'), 'next');

  write(spread, null);
  await nextMicrotask();
  assert.equal(element.getAttribute('data-collision'), 'before');
  assert.equal(element.getAttribute('title'), 'static-title');
  assert.equal(element.getAttribute('class'), 'after');
  assert.equal(element.hasAttribute('data-next'), false);

  disposeOwner(owner);
  write(before, 'disposed-change');
  await nextMicrotask();
  assert.equal(element.getAttribute('data-collision'), 'before');
});

test('bindAttributes spreads only enumerable own string keys', async () => {
  const bindAttributes = requireBindAttributes();
  const owner = createOwner(null, { name: 'root' });
  const inherited = { inherited: 'no' };
  const source = Object.create(inherited);
  source.visible = 'yes';
  Object.defineProperty(source, 'hidden', { value: 'no', enumerable: false });
  source[Symbol('symbol')] = 'no';
  const spread = createStateCell(source, { name: 'spread' });
  const element = createFakeElement();

  runWithOwner(owner, () => {
    bindAttributes(element, [{ kind: 'spread', compute: () => read(spread) }], { name: 'attrs' });
  });
  mountOwner(owner);
  await nextMicrotask();

  assert.equal(element.getAttribute('visible'), 'yes');
  assert.equal(element.hasAttribute('inherited'), false);
  assert.equal(element.hasAttribute('hidden'), false);
  assert.deepEqual(element.getAttributeNames(), ['visible']);
});
