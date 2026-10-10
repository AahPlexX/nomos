import test from 'node:test';
import assert from 'node:assert/strict';
import { parseComponent } from '../packages/compiler/src/index.mjs';

for (const [name, source, expectedMessage] of [
  ['bare col requires an explicit colgroup', '<table><col></table>', /colgroup/],
  ['caption closes an open table section', '<table><tbody><caption>c</caption></tbody></table>', /tbody/],
  ['new table section closes the previous section', '<table><thead><tbody><tr><td>x</td></tr></tbody></table>', /thead/],
  ['caption inside a cell closes cell row and section', '<table><tbody><tr><td>x<caption>c</caption></td></tr></tbody></table>', /td.*tr.*tbody|tbody.*tr.*td/],
]) {
  test(name, () => {
    const result = parseComponent(source, { filename: 'TableTransitions.nomos' });
    const ownership = result.diagnostics.filter((diagnostic) => diagnostic.code === 'NOMOS-PARSE-HTML-OWNERSHIP');
    assert.equal(ownership.length, 1);
    assert.match(ownership[0].message, expectedMessage);
    assert.equal(ownership[0].disableable, false);
  });
}

test('explicit colgroup and table section boundaries remain valid', () => {
  const source = '<table><colgroup><col></colgroup><thead><tr><th>x</th></tr></thead><tbody><tr><td>y</td></tr></tbody></table>';
  const result = parseComponent(source, { filename: 'ValidTableTransitions.nomos' });
  assert.deepEqual(result.diagnostics, []);
});
