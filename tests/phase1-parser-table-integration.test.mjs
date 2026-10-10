import test from 'node:test';
import assert from 'node:assert/strict';
import { parseComponent } from '../packages/compiler/src/index.mjs';

for (const [name, source, expectedMessage] of [
  ['direct tr under table requires explicit tbody', '<table><tr><td>x</td></tr></table>', /tbody/],
  ['direct td under table requires explicit tbody and tr', '<table><td>x</td></table>', /tbody.*tr|tr.*tbody/],
  ['direct td under tbody requires explicit tr', '<table><tbody><td>x</td></tbody></table>', /tr/],
  ['second cell explicitly closes the first cell', '<table><tbody><tr><td>a<th>b</th></tr></tbody></table>', /open <td>/],
  ['second row explicitly closes the first row', '<table><tbody><tr><td>a</td><tr><td>b</td></tr></tbody></table>', /open <tr>/],
]) {
  test(name, () => {
    const result = parseComponent(source, { filename: 'TableOwnership.nomos' });
    const ownership = result.diagnostics.filter((diagnostic) => diagnostic.code === 'NOMOS-PARSE-HTML-OWNERSHIP');
    assert.equal(ownership.length, 1);
    assert.match(ownership[0].message, expectedMessage);
    assert.equal(ownership[0].disableable, false);
  });
}

test('explicit tbody, tr, and cell boundaries remain valid', () => {
  const source = '<table><tbody><tr><td>a</td><th>b</th></tr><tr><td>c</td></tr></tbody></table>';
  const result = parseComponent(source, { filename: 'ValidTable.nomos' });
  assert.deepEqual(result.diagnostics, []);
});
