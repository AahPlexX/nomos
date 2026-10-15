import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STANDARD_HTML_PROPERTY_ASSIGNMENTS,
  resolveStandardHtmlPropertyAssignment,
} from '../packages/shared/src/html-attribute-policy.mjs';

test('property assignment table publishes current-state HTML properties and required binding targets', () => {
  assert.ok(Object.isFrozen(STANDARD_HTML_PROPERTY_ASSIGNMENTS));
  assert.ok(STANDARD_HTML_PROPERTY_ASSIGNMENTS.length >= 10);
  for (const entry of STANDARD_HTML_PROPERTY_ASSIGNMENTS) {
    assert.ok(Object.isFrozen(entry));
    assert.ok(Object.isFrozen(entry.bindings));
    if (entry.inputTypes) assert.ok(Object.isFrozen(entry.inputTypes));
  }

  assert.deepEqual(resolveStandardHtmlPropertyAssignment('textarea', 'value'), {
    element: 'textarea', sourceName: 'value', property: 'value', authoredDynamic: 'property',
    bindings: ['value'], semantics: 'current-value',
  });
  assert.deepEqual(resolveStandardHtmlPropertyAssignment('select', 'value'), {
    element: 'select', sourceName: 'value', property: 'value', authoredDynamic: 'property',
    bindings: ['value'], semantics: 'current-selection',
  });
  assert.deepEqual(resolveStandardHtmlPropertyAssignment('option', 'selected'), {
    element: 'option', sourceName: 'selected', property: 'selected', authoredDynamic: 'property',
    bindings: [], semantics: 'current-selectedness',
  });
  for (const element of ['audio', 'video']) {
    assert.deepEqual(resolveStandardHtmlPropertyAssignment(element, 'muted'), {
      element, sourceName: 'muted', property: 'muted', authoredDynamic: 'property',
      bindings: [], semantics: 'current-muted-state',
    });
  }
  assert.deepEqual(resolveStandardHtmlPropertyAssignment('output', 'value'), {
    element: 'output', sourceName: 'value', property: 'value', authoredDynamic: 'property',
    bindings: [], semantics: 'current-value',
  });
});

test('input value policy is type-sensitive and preserves default/default-on/filename modes', () => {
  for (const type of ['text', 'search', 'tel', 'url', 'email', 'password', 'date', 'month', 'week', 'time', 'datetime-local', 'number', 'range', 'color']) {
    const assignment = resolveStandardHtmlPropertyAssignment('input', 'value', { inputType: type });
    assert.equal(assignment?.property, 'value', type);
    assert.equal(assignment?.authoredDynamic, 'property', type);
    assert.deepEqual(assignment?.bindings, ['value'], type);
  }
  assert.equal(resolveStandardHtmlPropertyAssignment('input', 'value')?.property, 'value');
  assert.equal(resolveStandardHtmlPropertyAssignment('INPUT', 'VALUE', { inputType: 'not-a-real-state' })?.property, 'value');
  for (const type of ['hidden', 'checkbox', 'radio', 'file', 'submit', 'image', 'reset', 'button']) {
    assert.equal(resolveStandardHtmlPropertyAssignment('input', 'value', { inputType: type }), null, type);
  }
});

test('checked and files assignment rows are constrained to the HTML input states where they apply', () => {
  for (const type of ['checkbox', 'radio']) {
    const checked = resolveStandardHtmlPropertyAssignment('input', 'checked', { inputType: type });
    assert.equal(checked?.property, 'checked');
    assert.deepEqual(checked?.bindings, ['checked', 'group']);
  }
  assert.equal(resolveStandardHtmlPropertyAssignment('input', 'checked', { inputType: 'text' }), null);

  const files = resolveStandardHtmlPropertyAssignment('input', 'files', { inputType: 'file' });
  assert.equal(files?.property, 'files');
  assert.equal(files?.authoredDynamic, 'binding-only');
  assert.deepEqual(files?.bindings, ['files']);
  assert.equal(resolveStandardHtmlPropertyAssignment('input', 'files', { inputType: 'text' }), null);
});

test('reflected open remains attribute-oriented while bind:open has an explicit property seam', () => {
  for (const element of ['details', 'dialog']) {
    const open = resolveStandardHtmlPropertyAssignment(element, 'open');
    assert.equal(open?.property, 'open');
    assert.equal(open?.authoredDynamic, 'attribute');
    assert.deepEqual(open?.bindings, ['open']);
    assert.equal(open?.semantics, 'reflected-open-state');
  }
});

test('ordinary reflected/content attributes do not acquire accidental property assignment', () => {
  for (const [element, name] of [['div', 'class'], ['label', 'for'], ['div', 'tabindex'], ['button', 'disabled'], ['progress', 'value'], ['div', 'data-x'], ['div', 'aria-label']]) {
    assert.equal(resolveStandardHtmlPropertyAssignment(element, name), null, `${element}.${name}`);
  }
});
