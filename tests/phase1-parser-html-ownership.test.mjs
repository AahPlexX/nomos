import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTemplateSections } from '../packages/compiler/src/template-syntax.mjs';

function analyze(source) {
  const result = {
    sections: [{ kind: 'template', span: { start: { offset: 0 }, end: { offset: source.length } } }],
    diagnostics: [],
  };
  analyzeTemplateSections(source, result);
  return result;
}

for (const [name, source, marker] of [
  ['a new li implicitly ends the previous li', '<ul><li>one<li>two</li></ul>', '<li>two'],
  ['a new dd implicitly ends an open dt', '<dl><dt>term<dd>definition</dd></dl>', '<dd>definition'],
  ['a nested button implicitly ends the outer button', '<button>outer<button>inner</button></button>', '<button>inner'],
]) {
  test(name, () => {
    const result = analyze(source);
    assert.deepEqual(result.diagnostics.map((diagnostic) => diagnostic.code), ['NOMOS-PARSE-HTML-OWNERSHIP']);
    const diagnostic = result.diagnostics[0];
    assert.equal(source.slice(diagnostic.span.start.offset, diagnostic.span.end.offset), marker.startsWith('<li>') ? '<li>' : marker.startsWith('<dd>') ? '<dd>' : '<button>');
    assert.equal(diagnostic.disableable, false);
  });
}
