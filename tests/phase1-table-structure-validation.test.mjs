import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTableStructure } from '../packages/compiler/src/table-structure-validation.mjs';

function node(type, name, start) {
  return { type, name, span: { start: { offset: start, line: 1, column: start + 1 }, end: { offset: start + 1, line: 1, column: start + 2 } } };
}

function validate(nodes) {
  const result = { sections: [{ kind: 'template', syntax: { type: 'TemplateSyntaxTree', nodes } }], diagnostics: [] };
  validateTableStructure(result);
  return result.diagnostics;
}

test('implied tbody for a direct tr becomes an ownership diagnostic', () => {
  const diagnostics = validate([node('ElementOpen', 'table', 0), node('ElementOpen', 'tr', 1)]);
  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].code, 'NOMOS-PARSE-HTML-OWNERSHIP');
  assert.match(diagnostics[0].message, /tbody/);
});

test('implied row for a direct cell becomes an ownership diagnostic', () => {
  const diagnostics = validate([node('ElementOpen', 'table', 0), node('ElementOpen', 'tbody', 1), node('ElementOpen', 'td', 2)]);
  assert.equal(diagnostics.length, 1);
  assert.match(diagnostics[0].message, /tr/);
});

test('a second cell reports the implicit close and does not cascade', () => {
  const diagnostics = validate([
    node('ElementOpen', 'table', 0), node('ElementOpen', 'tbody', 1), node('ElementOpen', 'tr', 2),
    node('ElementOpen', 'td', 3), node('ElementOpen', 'th', 4), node('ElementClose', 'th', 5), node('ElementClose', 'tr', 6),
  ]);
  assert.equal(diagnostics.length, 1);
  assert.match(diagnostics[0].message, /open <td>/);
});

test('explicit table hierarchy stays valid', () => {
  const diagnostics = validate([
    node('ElementOpen', 'table', 0), node('ElementOpen', 'tbody', 1), node('ElementOpen', 'tr', 2), node('ElementOpen', 'td', 3),
    node('ElementClose', 'td', 4), node('ElementClose', 'tr', 5), node('ElementClose', 'tbody', 6), node('ElementClose', 'table', 7),
  ]);
  assert.deepEqual(diagnostics, []);
});
