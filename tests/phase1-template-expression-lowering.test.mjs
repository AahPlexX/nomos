import test from 'node:test';
import assert from 'node:assert/strict';
import { parseComponent } from '../packages/compiler/src/index.mjs';
import { lowerComponentScript } from '../packages/compiler/src/script-lowering.mjs';
import { lowerTemplateTextBindings } from '../packages/compiler/src/template-lowering.mjs';

test('lowers template interpolations through TypeScript with reactive reads, lexical shadowing, and original-source mappings', () => {
  const source = `<script lang="ts">\nimport { state } from 'nomos';\nlet count = state(1);\nconst suffix = '!';\n</script>\n<template>Hello {count} {((count) => count)(2)} {suffix}</template>`;
  const component = parseComponent(source, { filename: 'Greeting.nomos' });
  const script = lowerComponentScript(source, component, { filename: 'Greeting.nomos' });
  const result = lowerTemplateTextBindings(source, component, { script, filename: 'Greeting.nomos' });

  assert.equal(result.diagnostics.length, 0);
  assert.equal(result.bindings.length, 3);
  assert.deepEqual(result.runtimeImports.map((entry) => entry.imported), ['bindText', 'read']);

  const [reactive, shadowed, constant] = result.bindings;
  assert.equal(reactive.expression.raw, 'count');
  assert.match(reactive.expressionCode, /__n_read(?:_\d+)?\(count\)/);
  assert.match(reactive.setupCode, /__n_bindText(?:_\d+)?\(__n_text_0, \(\) =>/);
  assert.deepEqual(reactive.map.sources, ['Greeting.nomos']);
  assert.deepEqual(reactive.map.sourcesContent, [source]);
  assert.match(reactive.map.mappings, /./);
  assert.equal(reactive.expression.bodySpan.start.offset, source.indexOf('{count}') + 1);

  assert.equal(shadowed.expression.raw, '((count) => count)(2)');
  assert.doesNotMatch(shadowed.expressionCode, /__n_read(?:_\d+)?\(count\)/);
  assert.equal(constant.expressionCode, 'suffix');
});

test('reports TypeScript syntax diagnostics for an invalid interpolation without creating a binding setup statement', () => {
  const source = `<template>{value + }</template>`;
  const component = parseComponent(source, { filename: 'Broken.nomos' });
  const result = lowerTemplateTextBindings(source, component, { filename: 'Broken.nomos' });

  assert.equal(result.bindings.length, 0);
  assert.ok(result.diagnostics.length > 0);
  assert.ok(result.diagnostics.every((diagnostic) => diagnostic.source === 'typescript'));
});
