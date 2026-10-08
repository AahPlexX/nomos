import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateManifest } from './conformance-core.mjs';

const root = new URL('../', import.meta.url);
const ledger = JSON.parse(await readFile(new URL('spec/requirements.json', root), 'utf8'));
const manifest = JSON.parse(await readFile(new URL('conformance/manifest.json', root), 'utf8'));
const contract = JSON.parse(await readFile(new URL('spec/conformance.json', root), 'utf8'));

const validated = validateManifest(ledger, manifest);
assert.equal(contract.schemaVersion, 1);
assert.equal(contract.status, 'foundation-implemented');
assert.equal(contract.publicRoot, manifest.publicRoot);
assert.equal(contract.promotionPolicy, 'all-declared-environments-green-same-evidence-set');
assert.equal(contract.ledgerMutation, 'explicit-after-green-evidence');
assert.equal(contract.browserSubstitutionAllowed, false);
assert.deepEqual(contract.passingRequirements, ledger.requirements
  .filter((row) => row[ledger.columns.indexOf('status')] === 'passing')
  .map((row) => row[ledger.columns.indexOf('id')])
  .sort());
assert.ok(validated.tests.has('NCON-NREQ-0145'));
assert.equal(contract.seedTest.id, 'NCON-NREQ-0145');
assert.equal(contract.seedTest.status, 'wired-unverified');

console.log(`Conformance contract valid: ${manifest.tests.length} public test(s) wired; ${contract.passingRequirements.length} requirement row(s) passing.`);
