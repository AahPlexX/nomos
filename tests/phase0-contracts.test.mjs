import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const readText = async (path) => readFile(new URL(path, root), 'utf8');

test('root runtime API stays within the PRD complexity budget', async () => {
  const api = await readJson('spec/runtime-api.json');
  assert.equal(api.package, 'nomos');
  assert.ok(api.exports.length <= 12, `root API has ${api.exports.length} exports`);
  assert.deepEqual(api.exports, [
    'inputs', 'state', 'derive', 'sync', 'untrack',
    'context', 'query', 'action', 'Boundary', 'mount'
  ]);
});

test('learning levels are additive and preserve earlier concepts', async () => {
  const { levels } = await readJson('spec/levels.json');
  assert.deepEqual(levels.map(({ level }) => level), [0, 1, 2, 3, 4, 5, 6, 7]);

  const introduced = new Set();
  for (const entry of levels) {
    for (const concept of entry.introduces) introduced.add(concept);
    assert.deepEqual(new Set(entry.available), introduced, `level ${entry.level} is not additive`);
  }
});

test('formal grammar declares every required directive prefix and structural block', async () => {
  const grammar = await readText('spec/nomos.ebnf');
  for (const token of ['on:', 'bind:', 'use:', 'let:', '#if', '#each', '#await', '@html']) {
    assert.match(grammar, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('phase 0 contains ten representative component fixtures', async () => {
  const files = (await readdir(new URL('examples/phase-0/', root))).filter((name) => name.endsWith('.nomos'));
  assert.equal(files.length, 10);
});

test('every representative component declares an allowed learning level', async () => {
  const { levels } = await readJson('spec/levels.json');
  const validLevels = new Set(levels.map(({ level }) => level));
  const files = (await readdir(new URL('examples/phase-0/', root))).filter((name) => name.endsWith('.nomos'));
  for (const file of files) {
    const source = await readText(`examples/phase-0/${file}`);
    const match = source.match(/<!--\s*nomos-level:\s*(\d)\s*-->/);
    assert.ok(match, `${file} is missing a nomos-level declaration`);
    assert.ok(validLevels.has(Number(match[1])), `${file} declares an invalid level`);
  }
});
