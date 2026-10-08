import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = async (path) => readFile(new URL(path, root), 'utf8');

test('product-owner amendment supersedes only the Phase 0 external-review exit criterion', async () => {
  const amendment = await read('docs/prd/amendments/0001-remove-phase0-external-review-gate.md');
  assert.match(amendment, /Status:\*\* EFFECTIVE/);
  assert.match(amendment, /five experienced external reviewers/);
  assert.match(amendment, /superseded/i);
  assert.match(amendment, /conformance drafts reveal no contradictory semantics/i);
  assert.match(amendment, /does not resolve/i);
});

test('manifest makes explicit amendments authoritative without altering preserved source', async () => {
  const manifest = await read('PRD.md');
  assert.match(manifest, /b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690/);
  assert.match(manifest, /amendments\/0001-remove-phase0-external-review-gate\.md/);
  assert.match(manifest, /amendment takes precedence/i);
});

test('machine phase state opens Phase 1 only after the amended Phase 0 gate', async () => {
  const phase = JSON.parse(await read('spec/phase-status.json'));
  assert.equal(phase.currentPhase, 1);
  assert.equal(phase.phase0.status, 'complete');
  assert.equal(phase.phase0.externalReviewRequired, false);
  assert.equal(phase.phase0.contradictionAudit, 'passed');
  assert.equal(phase.phase1.status, 'in-progress');
  assert.equal(phase.phase1.allowed, true);
  assert.equal(phase.sourcePrdPreserved, true);
});
