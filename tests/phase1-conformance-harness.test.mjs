import test from 'node:test';
import assert from 'node:assert/strict';
import { promotableRequirement, selectTests, validateManifest } from '../tools/conformance-core.mjs';

const ledger = {
  columns: ['id', 'sourceLine', 'operatorIndex', 'keyword', 'testId', 'owner', 'status'],
  requirements: [
    ['NREQ-0001', 1, 1, 'MUST', 'NCON-NREQ-0001', 'phase-1', 'planned'],
    ['NREQ-0002', 2, 1, 'MUST', 'NCON-NREQ-0002', 'phase-1', 'passing'],
  ],
};

const manifest = {
  tests: [
    { id: 'NCON-NREQ-0001', requirementId: 'NREQ-0001', file: 'conformance/a.test.mjs', environments: ['node'] },
    { id: 'NCON-NREQ-0002', requirementId: 'NREQ-0002', file: 'conformance/b.test.mjs', environments: ['node', 'browser-chromium'] },
  ],
};

test('manifest preserves the exact reserved NCON identity for each requirement', () => {
  assert.doesNotThrow(() => validateManifest(ledger, manifest));
  const wrong = structuredClone(manifest);
  wrong.tests[0].id = 'NCON-WRONG';
  assert.throws(() => validateManifest(ledger, wrong), /reserves NCON-NREQ-0001/);
});

test('a passing ledger row must have its public conformance entry', () => {
  const incomplete = { tests: [manifest.tests[0]] };
  assert.throws(() => validateManifest(ledger, incomplete), /passing without public test NCON-NREQ-0002/);
});

test('promotion requires every declared environment in the evidence set to pass', () => {
  assert.equal(promotableRequirement(manifest.tests[1], { node: 'passed', 'browser-chromium': 'passed' }), true);
  assert.equal(promotableRequirement(manifest.tests[1], { node: 'passed', 'browser-chromium': 'failed' }), false);
  assert.equal(promotableRequirement(manifest.tests[1], { node: 'passed' }), false);
});

test('runner selection is exact and rejects unknown NCON ids', () => {
  assert.deepEqual(selectTests(manifest, ['NCON-NREQ-0001']).map((entry) => entry.id), ['NCON-NREQ-0001']);
  assert.throws(() => selectTests(manifest, ['NCON-MISSING']), /unknown conformance ids/);
});
