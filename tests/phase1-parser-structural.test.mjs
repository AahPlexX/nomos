import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseComponent } from '../packages/compiler/src/index.mjs';

test('all seven Phase 0 valid parser fixtures are accepted by executable structural validation', async () => {
  for (const file of [
    '01-sections-and-scripts.nomos',
    '02-attributes-and-directives.nomos',
    '03-control-flow.nomos',
    '04-await-regions.nomos',
    '05-components-and-slots.nomos',
    '06-raw-namespaces-and-global-style.nomos',
    '07-javascript-script.nomos',
  ]) {
    const source = await readFile(new URL(`./fixtures/parser/valid/${file}`, import.meta.url), 'utf8');
    const result = parseComponent(source, { filename: file });
    assert.deepEqual(result.diagnostics, [], `${file} should be accepted`);
    const templateSections = result.sections.filter((section) => section.kind === 'template');
    assert.ok(templateSections.every((section) => section.syntax?.type === 'TemplateSyntaxTree'));
  }
});

test('remaining Phase 0 invalid parser fixtures emit their reserved stable diagnostics', async () => {
  const cases = [
    ['02-html-ownership.nomos', 'NOMOS-PARSE-HTML-OWNERSHIP'],
    ['03-unterminated-block.nomos', 'NOMOS-PARSE-UNTERMINATED-BLOCK'],
    ['04-unknown-directive.nomos', 'NOMOS-PARSE-UNKNOWN-DIRECTIVE'],
  ];
  for (const [file, code] of cases) {
    const source = await readFile(new URL(`./fixtures/parser/invalid/${file}`, import.meta.url), 'utf8');
    const result = parseComponent(source, { filename: file });
    assert.deepEqual(result.diagnostics.map((diagnostic) => diagnostic.code), [code], `${file} should emit ${code}`);
    assert.equal(result.diagnostics[0].disableable, false);
  }
});

test('template syntax tree records typed elements, attributes, interpolations, directives, and structural markers', () => {
  const source = '<button class="x" on:click={run}>{label}</button>\n{#if ready}<span>{@html trusted}</span>{/if}';
  const result = parseComponent(source, { filename: 'Syntax.nomos' });
  assert.deepEqual(result.diagnostics, []);
  const nodes = result.sections[0].syntax.nodes;
  assert.ok(nodes.some((node) => node.type === 'ElementOpen' && node.name === 'button'));
  assert.ok(nodes.some((node) => node.type === 'Directive' && node.kind === 'on' && node.name === 'click'));
  assert.ok(nodes.some((node) => node.type === 'Interpolation'));
  assert.ok(nodes.some((node) => node.type === 'BlockOpen' && node.kind === 'if'));
  assert.ok(nodes.some((node) => node.type === 'RawHtml'));
  assert.ok(nodes.some((node) => node.type === 'BlockClose' && node.kind === 'if'));
});
