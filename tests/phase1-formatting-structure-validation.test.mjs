import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFormattingStructure } from '../packages/compiler/src/formatting-structure-validation.mjs';

function span(offset) {
  return {
    start: { offset, line: 1, column: offset + 1 },
    end: { offset: offset + 1, line: 1, column: offset + 2 },
  };
}

function run(nodes) {
  const result = {
    sections: [{ kind: 'template', syntax: { type: 'TemplateSyntaxTree', nodes } }],
    diagnostics: [],
  };
  validateFormattingStructure(result);
  return result.diagnostics;
}

test('nested anchor start produces one ownership diagnostic', () => {
  const diagnostics = run([
    { type: 'ElementOpen', name: 'a', selfClosing: false, span: span(0) },
    { type: 'ElementOpen', name: 'span', selfClosing: false, span: span(1) },
    { type: 'ElementOpen', name: 'a', selfClosing: false, span: span(2) },
  ]);
  assert.equal(diagnostics.length, 1);
  assert.match(diagnostics[0].message, /<a>.*open <a>|open <a>.*<a>/);
  assert.equal(diagnostics[0].disableable, false);
});

test('nested nobr start produces one ownership diagnostic', () => {
  const diagnostics = run([
    { type: 'ElementOpen', name: 'nobr', selfClosing: false, span: span(0) },
    { type: 'ElementOpen', name: 'em', selfClosing: false, span: span(1) },
    { type: 'ElementOpen', name: 'nobr', selfClosing: false, span: span(2) },
  ]);
  assert.equal(diagnostics.length, 1);
  assert.match(diagnostics[0].message, /nobr/);
});

test('misnested formatting end tag crossing a block produces one diagnostic', () => {
  const diagnostics = run([
    { type: 'ElementOpen', name: 'b', selfClosing: false, span: span(0) },
    { type: 'ElementOpen', name: 'p', selfClosing: false, span: span(1) },
    { type: 'ElementClose', name: 'b', span: span(2) },
    { type: 'ElementClose', name: 'p', span: span(3) },
  ]);
  assert.equal(diagnostics.length, 1);
  assert.match(diagnostics[0].message, /adoption-agency|misnested/i);
});

test('properly nested formatting elements remain valid', () => {
  const diagnostics = run([
    { type: 'ElementOpen', name: 'strong', selfClosing: false, span: span(0) },
    { type: 'ElementOpen', name: 'em', selfClosing: false, span: span(1) },
    { type: 'ElementClose', name: 'em', span: span(2) },
    { type: 'ElementClose', name: 'strong', span: span(3) },
  ]);
  assert.deepEqual(diagnostics, []);
});
