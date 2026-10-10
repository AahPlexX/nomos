import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectFormattingEndTagRewrite,
  detectFormattingStartTagRewrite,
} from '../packages/compiler/src/html-formatting-ownership.mjs';

test('a nested anchor closes the already-open anchor', () => {
  assert.deepEqual(
    detectFormattingStartTagRewrite(['div', 'a', 'span'], 'a'),
    { kind: 'implicit-close', closes: ['a'], reason: 'nested-anchor' },
  );
});

test('a nested nobr closes the already-open nobr', () => {
  assert.deepEqual(
    detectFormattingStartTagRewrite(['p', 'nobr', 'em'], 'nobr'),
    { kind: 'implicit-close', closes: ['nobr'], reason: 'nested-nobr' },
  );
});

test('a misnested formatting end tag invokes adoption-agency restructuring', () => {
  assert.deepEqual(
    detectFormattingEndTagRewrite(['div', 'b', 'p'], 'b'),
    { kind: 'adoption-agency', formatting: 'b', current: 'p' },
  );
});

test('a properly nested formatting end tag needs no rewrite', () => {
  assert.equal(detectFormattingEndTagRewrite(['div', 'strong'], 'strong'), null);
});

test('ordinary tags are ignored by formatting ownership rules', () => {
  assert.equal(detectFormattingStartTagRewrite(['div'], 'span'), null);
  assert.equal(detectFormattingEndTagRewrite(['div', 'span'], 'span'), null);
});
