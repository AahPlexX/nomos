import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const PRD_PARTS = [1, 2, 3, 4].map((part) => `docs/prd/source-part-${String(part).padStart(2, '0')}.md`);

async function prdSource() {
  return (await Promise.all(PRD_PARTS.map((path) => readFile(new URL(path, root), 'utf8')))).join('');
}

function openDecisionBullets(source) {
  const section = source.match(/## Open Decisions\n([\s\S]*?)\nOpen decisions MUST NOT be silently resolved/);
  assert.ok(section, 'PRD Open Decisions section not found');
  return section[1].split('\n').map((line) => line.trim()).filter((line) => line.startsWith('- ')).map((line) => line.slice(2));
}

test('every PRD open decision remains explicitly open in the machine register', async () => {
  const source = await prdSource();
  const register = await readJson('spec/open-decisions.json');
  assert.equal(register.schemaVersion, 1);
  assert.deepEqual(register.decisions.map(({ text }) => text), openDecisionBullets(source));
  for (const decision of register.decisions) {
    assert.match(decision.id, /^OD-\d{3}$/);
    assert.equal(decision.status, 'open');
    assert.equal(decision.resolution, null);
  }
});

test('proposed runtime API marks state.snapshot placement as unresolved', async () => {
  const api = await readJson('spec/runtime-api.json');
  assert.ok(api.nested.state.includes('snapshot'));
  assert.ok(api.provisionalDecisions.includes('OD-004'));
});

test('whitespace policy preserves author text and delegates visual collapse to CSS', async () => {
  const policy = await readJson('spec/whitespace.json');
  const manifest = await readJson('tests/fixtures/parser/whitespace/manifest.json');
  const files = (await readdir(new URL('tests/fixtures/parser/whitespace/', root))).filter((name) => name.endsWith('.nomos')).sort();

  assert.equal(policy.compilerTrimming, 'none');
  assert.equal(policy.lineEndingNormalization, 'CRLF-or-CR-to-LF');
  assert.equal(policy.visualWhitespaceProcessing, 'CSS');
  assert.equal(policy.preTextareaLeadingLf, 'strip-one');
  assert.equal(policy.templateDelimitersEmitText, false);
  assert.equal(policy.interpolationTrimsAdjacentLiteralText, false);
  assert.deepEqual(files, manifest.cases.map(({ file }) => file).sort());
  assert.equal(manifest.cases.length, 5);
  for (const entry of manifest.cases) {
    assert.match(entry.id, /^WS-\d{3}$/);
    assert.ok(Array.isArray(entry.expectedTextSegments) && entry.expectedTextSegments.length > 0);
  }
});
