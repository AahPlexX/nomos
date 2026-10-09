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

test('non-whitespace text in table context is rejected because the browser foster-parents it', () => {
  const source = '<table>outside<tr><td>inside</td></tr></table>';
  const result = analyze(source);
  assert.equal(result.diagnostics.some((diagnostic) => diagnostic.code === 'NOMOS-PARSE-HTML-OWNERSHIP'), true);
});

test('ordinary elements directly in table context are rejected because the browser foster-parents them', () => {
  const source = '<table><div>outside</div><tr><td>inside</td></tr></table>';
  const result = analyze(source);
  assert.equal(result.diagnostics.some((diagnostic) => diagnostic.code === 'NOMOS-PARSE-HTML-OWNERSHIP'), true);
});

test('ordinary content inside a table cell remains valid', () => {
  const source = '<table><tbody><tr><td><div>inside</div>text</td></tr></tbody></table>';
  const result = analyze(source);
  assert.deepEqual(result.diagnostics, []);
});
