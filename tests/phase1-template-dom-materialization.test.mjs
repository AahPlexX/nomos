import test from 'node:test';
import assert from 'node:assert/strict';
import * as compiler from '../packages/compiler/src/index.mjs';
import * as runtimeInternal from '../packages/runtime/src/internal.mjs';
import { lowerComponentScript } from '../packages/compiler/src/script-lowering.mjs';

function requireDomSlice() {
  const missing = [];
  if (typeof compiler.lowerTemplateDom !== 'function') missing.push('compiler.lowerTemplateDom');
  if (typeof runtimeInternal.mountTemplate !== 'function') missing.push('runtimeInternal.mountTemplate');
  assert.deepEqual(missing, [], `template DOM materialization seam is incomplete: ${missing.join(', ')}`);
}

test('lowers a static HTML skeleton plus interpolations into one browser-parsed template mount', () => {
  requireDomSlice();

  const source = `<script lang="ts">import { state } from 'nomos'; let count = state(1);</script><main data-label="A &amp; B">Hello {count}<span>!</span></main>`;
  const component = compiler.parseComponent(source, { filename: 'Greeting.nomos' });
  const script = lowerComponentScript(source, component, { filename: 'Greeting.nomos' });
  const result = compiler.lowerTemplateDom(source, component, {
    script,
    filename: 'Greeting.nomos',
    targetIdentifier: 'target',
  });

  assert.equal(result.type, 'TemplateDomLowering');
  assert.equal(result.diagnostics.length, 0);
  assert.equal(result.bindings.length, 1);
  assert.equal(result.markerCount, 1);
  assert.equal(result.targetIdentifier, 'target');
  assert.match(result.staticHtml, /data-label="A &amp; B"/);
  assert.match(result.staticHtml, new RegExp(`<!--${result.markerPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}0-->`));
  assert.doesNotMatch(result.staticHtml, /\{count\}/);
  assert.deepEqual(result.runtimeImports.map((entry) => entry.imported), ['mountTemplate', 'bindText', 'read']);
  assert.match(result.code, /mountTemplate/);
  assert.match(result.code, /markerCount:\s*1/);
  assert.match(result.code, /\.bindings\[0\]/);
  assert.match(result.code, /bindText/);
  assert.match(result.code, /read/);
  assert.deepEqual(result.map.sources, ['Greeting.nomos']);
  assert.deepEqual(result.map.sourcesContent, [source]);
  assert.ok(result.decodedMappings.length >= 3);
  assert.ok(result.decodedMappings.some((mapping) => mapping.original?.column === source.indexOf('count}') - source.lastIndexOf('\n', source.indexOf('count}')) - 1));
});

test('refuses unsupported dynamic/structural template features instead of silently emitting incorrect DOM', () => {
  requireDomSlice();

  const source = `<button class={kind} on:click={save}>{#if ready}Ready{/if}</button>`;
  const component = compiler.parseComponent(source, { filename: 'Unsupported.nomos' });
  const result = compiler.lowerTemplateDom(source, component, { filename: 'Unsupported.nomos' });

  assert.equal(result.code, null);
  assert.equal(result.map, null);
  assert.ok(result.diagnostics.length > 0);
  assert.ok(result.diagnostics.every((diagnostic) => diagnostic.code === 'NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE'));
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.feature === 'dynamic-attribute-or-shorthand'));
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.feature === 'directive'));
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.feature === 'structural-block'));
});

test('refuses interpolation marker lowering inside raw-text/RCDATA/template contexts', () => {
  requireDomSlice();

  for (const source of ['<textarea>{value}</textarea>', '<title>{value}</title>', '<template>{value}</template>']) {
    const component = compiler.parseComponent(source, { filename: 'Context.nomos' });
    const result = compiler.lowerTemplateDom(source, component, { filename: 'Context.nomos' });
    assert.equal(result.code, null);
    assert.ok(result.diagnostics.some((diagnostic) => diagnostic.feature === 'interpolation-context'));
  }
});
