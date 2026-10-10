import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTableStructure } from '../packages/compiler/src/table-structure-validation.mjs';

function open(name, offset) {
  return { type: 'ElementOpen', name, selfClosing: false, span: {
    start: { offset, line: 1, column: offset + 1 },
    end: { offset: offset + 1, line: 1, column: offset + 2 },
  } };
}

function close(name, offset) {
  return { type: 'ElementClose', name, span: {
    start: { offset, line: 1, column: offset + 1 },
    end: { offset: offset + 1, line: 1, column: offset + 2 },
  } };
}

test('multi-level table transition repairs the whole closed chain and avoids a false second diagnostic', () => {
  const nodes = [
    open('table', 0), open('tbody', 1), open('tr', 2), open('td', 3),
    open('caption', 4), close('caption', 5),
    open('tbody', 6), close('tbody', 7), close('table', 8),
  ];
  const result = {
    sections: [{ kind: 'template', syntax: { type: 'TemplateSyntaxTree', nodes } }],
    diagnostics: [],
  };
  validateTableStructure(result);
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].code, 'NOMOS-PARSE-HTML-OWNERSHIP');
});
