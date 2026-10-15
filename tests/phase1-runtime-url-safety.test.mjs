import test from 'node:test';
import assert from 'node:assert/strict';
import * as runtimeInternal from '../packages/runtime/src/internal.mjs';
import {
  assertSafeDynamicUrlAttributeValue,
} from '../packages/shared/src/html-attribute-policy.mjs';
import {
  createOwner,
  createStateCell,
  disposeOwner,
  flushRuntime,
  mountOwner,
  read,
  runWithOwner,
  write,
} from '../packages/runtime/src/reactivity.mjs';

function createFakeElement(initial = {}) {
  const attributes = new Map(Object.entries(initial).map(([name, value]) => [name.toLowerCase(), String(value)]));
  return {
    setAttribute(name, value) { attributes.set(String(name).toLowerCase(), String(value)); },
    removeAttribute(name) { attributes.delete(String(name).toLowerCase()); },
    hasAttribute(name) { return attributes.has(String(name).toLowerCase()); },
    getAttribute(name) { const key = String(name).toLowerCase(); return attributes.has(key) ? attributes.get(key) : null; },
  };
}

test('URL safety refuses javascript scheme after WHATWG URL normalization', () => {
  for (const value of [
    'javascript:alert(1)',
    ' JAVASCRIPT:alert(1)',
    'java\nscript:alert(1)',
    'java\tscript:alert(1)',
    'java\rscript:alert(1)',
  ]) {
    assert.throws(() => assertSafeDynamicUrlAttributeValue('href', value), /javascript:/i, value);
  }
});

test('URL safety permits ordinary absolute, relative, fragment, and misleading-substring values', () => {
  for (const value of [
    'https://example.com/docs',
    '/docs',
    '#section',
    'mailto:test@example.com',
    'https://example.com/?q=javascript:alert(1)',
    '/javascript:guide',
    null,
    undefined,
  ]) {
    assert.equal(assertSafeDynamicUrlAttributeValue('href', value), value);
  }
});

test('bindAttribute refuses javascript URL updates before DOM mutation', () => {
  const owner = createOwner(null, { name: 'root' });
  const href = createStateCell('/safe', { name: 'href' });
  const element = createFakeElement();

  runWithOwner(owner, () => {
    runtimeInternal.bindAttribute(element, 'href', () => read(href), { name: 'href' });
  });
  mountOwner(owner);
  flushRuntime();
  assert.equal(element.getAttribute('href'), '/safe');

  write(href, 'java\nscript:alert(1)');
  assert.throws(() => flushRuntime(), /javascript:/i);
  assert.equal(element.getAttribute('href'), '/safe');
  disposeOwner(owner);
});

test('bindAttributes allows safe spread URLs and rejects unsafe URL updates before any DOM mutation', () => {
  const owner = createOwner(null, { name: 'root' });
  const spread = createStateCell({ href: '/safe', 'data-state': 'initial' }, { name: 'spread' });
  const element = createFakeElement();

  runWithOwner(owner, () => {
    runtimeInternal.bindAttributes(element, [{ kind: 'spread', compute: () => read(spread) }], { name: 'attrs' });
  });
  mountOwner(owner);
  flushRuntime();
  assert.equal(element.getAttribute('href'), '/safe');
  assert.equal(element.getAttribute('data-state'), 'initial');

  write(spread, { href: ' JAVASCRIPT:alert(1)', 'data-state': 'changed' });
  assert.throws(() => flushRuntime(), /javascript:/i);
  assert.equal(element.getAttribute('href'), '/safe');
  assert.equal(element.getAttribute('data-state'), 'initial');
  disposeOwner(owner);
});
