import test from 'node:test';
import assert from 'node:assert/strict';
import {
  composeDecodedMappings,
  createSourceMapFromDecodedMappings,
  validateDecodedMappings,
} from '../packages/compiler/src/source-map.mjs';

test('composes final generated positions through an intermediate stage to original source positions', () => {
  const finalToMiddle = [
    { generated: { line: 0, column: 0 }, original: { source: 'middle.js', line: 0, column: 4 } },
    { generated: { line: 0, column: 8 }, original: { source: 'middle.js', line: 0, column: 12 } },
  ];
  const middleToOriginal = [
    { generated: { line: 0, column: 4 }, original: { source: 'Component.nomos', line: 2, column: 3 } },
    { generated: { line: 0, column: 12 }, original: { source: 'Component.nomos', line: 4, column: 1 } },
  ];

  assert.deepEqual(composeDecodedMappings(finalToMiddle, middleToOriginal, { intermediateSource: 'middle.js' }), [
    { generated: { line: 0, column: 0 }, original: { source: 'Component.nomos', line: 2, column: 3 } },
    { generated: { line: 0, column: 8 }, original: { source: 'Component.nomos', line: 4, column: 1 } },
  ]);
});

test('preserves intentionally unmapped generated scaffolding during composition', () => {
  const finalToMiddle = [
    { generated: { line: 0, column: 0 }, original: null },
    { generated: { line: 0, column: 6 }, original: { source: 'middle.js', line: 0, column: 2 } },
  ];
  const middleToOriginal = [
    { generated: { line: 0, column: 2 }, original: { source: 'Component.nomos', line: 1, column: 5 } },
  ];
  const result = composeDecodedMappings(finalToMiddle, middleToOriginal, { intermediateSource: 'middle.js' });
  assert.equal(result[0].original, null);
  assert.deepEqual(result[1].original, { source: 'Component.nomos', line: 1, column: 5 });
});

test('rejects unsorted, negative, or unresolved decoded mappings', () => {
  assert.throws(() => validateDecodedMappings([
    { generated: { line: 1, column: 0 }, original: null },
    { generated: { line: 0, column: 0 }, original: null },
  ]), /generated order/);
  assert.throws(() => validateDecodedMappings([
    { generated: { line: 0, column: -1 }, original: null },
  ]), /non-negative integer/);
  assert.throws(() => composeDecodedMappings([
    { generated: { line: 0, column: 0 }, original: { source: 'middle.js', line: 9, column: 9 } },
  ], [], { intermediateSource: 'middle.js' }), /cannot resolve/);
});

test('encodes decoded mappings into an ECMA-426 version-3 source map with sourcesContent', () => {
  const map = createSourceMapFromDecodedMappings([
    { generated: { line: 0, column: 0 }, original: null },
    { generated: { line: 0, column: 4 }, original: { source: 'Component.nomos', line: 1, column: 2 } },
    { generated: { line: 1, column: 0 }, original: { source: 'Component.nomos', line: 2, column: 0 }, name: 'value' },
  ], {
    generatedFile: 'Component.js',
    sourceContents: { 'Component.nomos': '<script>\nconst value = 1;\n</script>' },
  });
  assert.equal(map.version, 3);
  assert.equal(map.file, 'Component.js');
  assert.deepEqual(map.sources, ['Component.nomos']);
  assert.deepEqual(map.sourcesContent, ['<script>\nconst value = 1;\n</script>']);
  assert.deepEqual(map.names, ['value']);
  assert.match(map.mappings, /^[A-Za-z0-9+/;,]+$/);
  assert.ok(map.mappings.includes(';'));
});
