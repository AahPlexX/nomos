import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdentitySourceMap, parseComponent } from '../packages/compiler/src/index.mjs';

test('parser preserves exact section source spans and arbitrary section order', () => {
  const source = '<style>p { color: red; }</style>\n<p>Hello {name}</p>\n<script lang="js">const name = "Nomos";</script>';
  const result = parseComponent(source, { filename: 'Greeting.nomos' });
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.sections.map((section) => section.kind), ['style', 'template', 'script']);
  for (const section of result.sections) {
    assert.equal(source.slice(section.span.start.offset, section.span.end.offset), section.raw);
  }
  assert.deepEqual(result.sections[0].span.start, { offset: 0, line: 1, column: 1 });
  assert.equal(result.sections[2].span.end.offset, source.length);
});

test('duplicate top-level script emits a stable non-disableable diagnostic with exact span', () => {
  const source = '<script>const a = 1;</script>\n<div>ok</div>\n<script>const b = 2;</script>';
  const result = parseComponent(source, { filename: 'Duplicate.nomos' });
  assert.equal(result.diagnostics.length, 1);
  const [diagnostic] = result.diagnostics;
  assert.equal(diagnostic.code, 'NOMOS-PARSE-DUPLICATE-SCRIPT');
  assert.equal(diagnostic.severity, 'error');
  assert.equal(diagnostic.disableable, false);
  assert.equal(source.slice(diagnostic.span.start.offset, diagnostic.span.end.offset), '<script>const b = 2;</script>');
  assert.equal(diagnostic.level, 0);
  assert.equal(diagnostic.docsUrl, 'https://github.com/AahPlexX/nomos/blob/main/docs/diagnostics/NOMOS-PARSE-DUPLICATE-SCRIPT.md');
  assert.equal(diagnostic.autofix.safe, false);
  assert.equal(diagnostic.sarif.ruleId, diagnostic.code);
});

test('unclosed top-level script or style reports the opening section span', () => {
  const source = '<p>before</p>\n<style>p { color: red; }';
  const result = parseComponent(source, { filename: 'Broken.nomos' });
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].code, 'NOMOS-PARSE-UNCLOSED-SECTION');
  assert.deepEqual(result.diagnostics[0].span.start, { offset: 14, line: 2, column: 1 });
  assert.equal(result.diagnostics[0].span.end.offset, source.length);
});

test('source positions preserve raw CRLF offsets while reporting one-based line and column', () => {
  const source = '<p>a</p>\r\n<script>\r\nconst x = 1;\r\n</script>';
  const result = parseComponent(source, { filename: 'Windows.nomos' });
  const script = result.sections.find((section) => section.kind === 'script');
  assert.deepEqual(script.span.start, { offset: 10, line: 2, column: 1 });
  assert.deepEqual(script.span.end, { offset: source.length, line: 4, column: 10 });
});

test('identity source map is ECMA-426-shaped and embeds original source', () => {
  const source = 'first\nsecond\nthird';
  const map = createIdentitySourceMap(source, { sourceFile: 'Input.nomos', generatedFile: 'Input.js' });
  assert.equal(map.version, 3);
  assert.equal(map.file, 'Input.js');
  assert.deepEqual(map.sources, ['Input.nomos']);
  assert.deepEqual(map.sourcesContent, [source]);
  assert.deepEqual(map.names, []);
  assert.equal(map.mappings, 'AAAA;AACA;AACA');
});

test('only top-level script and style tags become component sections', () => {
  const source = '<div><style>.nested { color: red; }</style></div>\n{#if ready}<script>notASection()</script>{/if}\n<script>const ready = true;</script>';
  const result = parseComponent(source, { filename: 'Nested.nomos' });
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.sections.map((section) => section.kind), ['template', 'script']);
  assert.equal(result.sections[0].raw, '<div><style>.nested { color: red; }</style></div>\n{#if ready}<script>notASection()</script>{/if}\n');
});

test('diagnostic/parser columns use UTF-16 code units to align with JavaScript source-map columns', () => {
  const source = '<p>🔥</p><script>const x = 1;</script>';
  const result = parseComponent(source, { filename: 'Unicode.nomos' });
  const script = result.sections.find((section) => section.kind === 'script');
  assert.deepEqual(script.span.start, { offset: 9, line: 1, column: 10 });
});

test('parser honors the Phase 0 duplicate-script adversarial fixture', async () => {
  const { readFile } = await import('node:fs/promises');
  const fixture = await readFile(new URL('./fixtures/parser/invalid/01-duplicate-script.nomos', import.meta.url), 'utf8');
  const result = parseComponent(fixture, { filename: '01-duplicate-script.nomos' });
  assert.deepEqual(result.diagnostics.map((diagnostic) => diagnostic.code), ['NOMOS-PARSE-DUPLICATE-SCRIPT']);
});
