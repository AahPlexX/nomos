import test from 'node:test';
import assert from 'node:assert/strict';
import { parseComponent } from '../../packages/compiler/src/index.mjs';

test('NCON-NREQ-0145 | compiler parses component sections and preserves exact source positions', () => {
  const source = '<style>p { color: red; }</style>\r\n<p>Hello {name}</p>\r\n<script lang="js">const name = "Nomos";</script>';
  const result = parseComponent(source, { filename: 'Conformance0145.nomos' });

  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.sections.map((section) => section.kind), ['style', 'template', 'script']);
  for (const section of result.sections) {
    assert.equal(source.slice(section.span.start.offset, section.span.end.offset), section.raw);
  }

  assert.deepEqual(result.sections[0].span.start, { offset: 0, line: 1, column: 1 });
  assert.equal(result.sections[1].span.start.line, 2);
  assert.equal(result.sections[2].span.start.line, 3);
  assert.equal(result.sections[2].span.end.offset, source.length);
});
