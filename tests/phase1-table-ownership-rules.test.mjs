import test from 'node:test';
import assert from 'node:assert/strict';
import { detectTableStartTagRewrite } from '../packages/compiler/src/html-table-ownership.mjs';

const cases = [
  ['tr directly under table requires an implied tbody', ['table'], 'tr', { kind: 'implied-wrapper', wrappers: ['tbody'], closes: [] }],
  ['td directly under table requires implied tbody and tr', ['table'], 'td', { kind: 'implied-wrapper', wrappers: ['tbody', 'tr'], closes: [] }],
  ['td inside tbody without tr requires implied tr', ['table', 'tbody'], 'td', { kind: 'implied-wrapper', wrappers: ['tr'], closes: [] }],
  ['a second cell closes the currently open cell', ['table', 'tbody', 'tr', 'td'], 'th', { kind: 'implicit-close', wrappers: [], closes: ['td'] }],
  ['a new tr closes the currently open tr', ['table', 'tbody', 'tr'], 'tr', { kind: 'implicit-close', wrappers: [], closes: ['tr'] }],
];

for (const [name, stack, incoming, expected] of cases) {
  test(name, () => assert.deepEqual(detectTableStartTagRewrite(stack, incoming), expected));
}

test('explicit table structure does not report a rewrite', () => {
  assert.equal(detectTableStartTagRewrite(['table', 'tbody', 'tr'], 'td'), null);
  assert.equal(detectTableStartTagRewrite(['table', 'tbody', 'tr', 'td'], 'span'), null);
});
