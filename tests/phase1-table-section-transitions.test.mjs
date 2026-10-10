import test from 'node:test';
import assert from 'node:assert/strict';
import { detectTableStartTagRewrite } from '../packages/compiler/src/html-table-ownership.mjs';

const cases = [
  ['bare col under table requires colgroup', ['table'], 'col', { kind: 'implied-wrapper', wrappers: ['colgroup'], closes: [] }],
  ['caption closes an open tbody', ['table', 'tbody'], 'caption', { kind: 'implicit-close', wrappers: [], closes: ['tbody'] }],
  ['thead closes an open tbody', ['table', 'tbody'], 'thead', { kind: 'implicit-close', wrappers: [], closes: ['tbody'] }],
  ['colgroup closes an open tfoot', ['table', 'tfoot'], 'colgroup', { kind: 'implicit-close', wrappers: [], closes: ['tfoot'] }],
  ['tbody while a row is open closes row and section', ['table', 'thead', 'tr'], 'tbody', { kind: 'implicit-close', wrappers: [], closes: ['tr', 'thead'] }],
  ['caption while a cell is open closes cell row and section', ['table', 'tbody', 'tr', 'td'], 'caption', { kind: 'implicit-close', wrappers: [], closes: ['td', 'tr', 'tbody'] }],
  ['new caption closes the current caption', ['table', 'caption'], 'caption', { kind: 'implicit-close', wrappers: [], closes: ['caption'] }],
];

for (const [name, stack, incoming, expected] of cases) {
  test(name, () => assert.deepEqual(detectTableStartTagRewrite(stack, incoming), expected));
}

test('valid direct table section and explicit colgroup remain unchanged', () => {
  assert.equal(detectTableStartTagRewrite(['table'], 'tbody'), null);
  assert.equal(detectTableStartTagRewrite(['table', 'colgroup'], 'col'), null);
});
