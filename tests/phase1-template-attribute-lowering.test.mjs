import test from 'node:test';
import assert from 'node:assert/strict';
import * as compiler from '../packages/compiler/src/index.mjs';
import { lowerComponentScript } from '../packages/compiler/src/script-lowering.mjs';

test('lowers dynamic, mixed, and shorthand standard-HTML attributes onto deterministic element slots', () => {
  const source = `<script lang="ts">import { state } from 'nomos'; let count = state(1); let active = state(true); let inert = state(false);</script><button data-count={count} class="count {count}" {active} inert={inert}>Go</button>`;
  const component = compiler.parseComponent(source, { filename: 'Attributes.nomos' });
  const script = lowerComponentScript(source, component, { filename: 'Attributes.nomos' });
  const result = compiler.lowerTemplateDom(source, component, {
    script,
    filename: 'Attributes.nomos',
    targetIdentifier: 'target',
  });

  assert.equal(result.diagnostics.length, 0);
  assert.ok(result.code);
  assert.equal(result.attributeBindings.length, 4);
  assert.deepEqual(result.attributeBindings.map((binding) => binding.kind), ['dynamic', 'mixed', 'shorthand', 'dynamic']);
  assert.deepEqual(result.attributeBindings.map((binding) => binding.name), ['data-count', 'class', 'active', 'inert']);
  assert.equal(result.attributeBindings[0].boolean, false);
  assert.equal(result.attributeBindings[3].boolean, true);
  assert.ok(result.attributeBindings.every((binding) => binding.elementIndex === 0));
  assert.match(result.staticHtml, /<button\s+data-nomos-el(?:-[0-9]+)?="0"/);
  assert.doesNotMatch(result.staticHtml, /\{count\}|\{active\}|\{inert\}/);
  assert.ok(result.runtimeImports.some((entry) => entry.imported === 'bindAttribute'));
  assert.ok(result.runtimeImports.some((entry) => entry.imported === 'read'));
  assert.match(result.code, /\.elements\[0\]/);
  assert.match(result.code, /bindAttribute/);
  assert.match(result.code, /data-count/);
  assert.match(result.code, /class/);
  assert.match(result.code, /active/);
  assert.match(result.code, /inert/);
  assert.deepEqual(result.map.sources, ['Attributes.nomos']);
  assert.deepEqual(result.map.sourcesContent, [source]);
  assert.ok(result.decodedMappings.some((mapping) => mapping.original?.column === source.indexOf('data-count')));
});

test('lowers spread attributes with neighboring explicit attributes into one source-ordered element binding plan', () => {
  const source = `<script lang="ts">import { state } from 'nomos'; let before = state('before'); let attrs = state({ 'data-collision': 'spread', class: 'spread' }); let after = state('after');</script><button data-collision={before} {...attrs} class={after}>Go</button>`;
  const component = compiler.parseComponent(source, { filename: 'SpreadAttributes.nomos' });
  const script = lowerComponentScript(source, component, { filename: 'SpreadAttributes.nomos' });
  const result = compiler.lowerTemplateDom(source, component, {
    script,
    filename: 'SpreadAttributes.nomos',
    targetIdentifier: 'target',
  });

  assert.equal(result.diagnostics.length, 0);
  assert.ok(result.code);
  assert.deepEqual(result.attributeBindings.map((binding) => binding.kind), ['dynamic', 'spread', 'dynamic']);
  assert.ok(result.attributeBindings.every((binding) => binding.elementIndex === 0));
  assert.ok(result.runtimeImports.some((entry) => entry.imported === 'bindAttributes'));
  assert.ok(result.runtimeImports.some((entry) => entry.imported === 'read'));
  assert.match(result.staticHtml, /<button\s+data-nomos-el(?:-[0-9]+)?="0"/);
  assert.doesNotMatch(result.staticHtml, /\{\.\.\.attrs\}|\{before\}|\{after\}/);
  assert.match(result.code, /bindAttributes/);
  assert.match(result.code, /kind:\s*"spread"/);
  const spreadExpressionStart = source.indexOf('attrs', source.indexOf('{...attrs}'));
  assert.ok(result.decodedMappings.some((mapping) => mapping.original?.column === spreadExpressionStart));
});

test('keeps custom-element dynamic/spread attributes, URL expressions, and inline event attributes guarded', () => {
  const cases = [
    [`<x-card value={value}></x-card>`, 'dynamic-custom-element-attribute'],
    [`<x-card {...attrs}></x-card>`, 'dynamic-custom-element-attribute'],
    [`<a href={url}>link</a>`, 'dynamic-url-attribute-unvalidated'],
    [`<button onclick="alert(1)">Go</button>`, 'inline-event-attribute'],
  ];

  for (const [source, feature] of cases) {
    const component = compiler.parseComponent(source, { filename: 'Guarded.nomos' });
    const result = compiler.lowerTemplateDom(source, component, { filename: 'Guarded.nomos' });
    assert.equal(result.code, null, `${feature} must not produce executable DOM code`);
    assert.ok(result.diagnostics.some((diagnostic) => diagnostic.feature === feature), `${feature} diagnostic missing`);
  }
});
