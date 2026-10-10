import test from 'node:test';
import assert from 'node:assert/strict';
import { parseComponent } from '../packages/compiler/src/index.mjs';

for (const [name, source, expected] of [
  ['nested anchors are rejected before browser recovery can change ownership', '<a href="/one"><span>x<a href="/two">y</a></span></a>', /open <a>/],
  ['nested nobr is rejected before formatting recovery changes ownership', '<nobr><em>x<nobr>y</nobr></em></nobr>', /nobr/],
  ['misnested formatting close is rejected before adoption-agency reparenting', '<b>one<p>two</b>three</p>', /adoption-agency|misnested/i],
]) {
  test(name, () => {
    const result = parseComponent(source, { filename: 'FormattingOwnership.nomos' });
    const ownership = result.diagnostics.filter((diagnostic) => diagnostic.code === 'NOMOS-PARSE-HTML-OWNERSHIP');
    assert.equal(ownership.length, 1);
    assert.match(ownership[0].message, expected);
    assert.equal(ownership[0].disableable, false);
  });
}

test('properly nested formatting remains valid', () => {
  const result = parseComponent('<strong><em>safe</em></strong>', { filename: 'ValidFormatting.nomos' });
  assert.deepEqual(result.diagnostics, []);
});
