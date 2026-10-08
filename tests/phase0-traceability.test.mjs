import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';
import { extractNormativeRequirements } from '../tools/normative-requirements.mjs';

const root = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const PRD_PARTS = [1, 2, 3, 4].map((part) => `docs/prd/source-part-${String(part).padStart(2, '0')}.md`);
const COLUMNS = ['id', 'sourceLine', 'operatorIndex', 'keyword', 'testId', 'owner', 'status'];

async function prdSource() {
  return (await Promise.all(PRD_PARTS.map((path) => readFile(new URL(path, root), 'utf8')))).join('');
}

function rowObject(row) {
  return Object.fromEntries(COLUMNS.map((column, index) => [column, row[index]]));
}

test('normative requirements have stable ids and conformance mappings', async () => {
  const ledger = await readJson('spec/requirements.json');
  const source = await prdSource();
  const extracted = extractNormativeRequirements(source);

  assert.equal(ledger.schemaVersion, 1);
  assert.deepEqual(ledger.columns, COLUMNS);
  assert.equal(ledger.sourceSha256, createHash('sha256').update(source).digest('hex'), 'ledger source digest must match the reconstructed PRD');
  assert.equal(ledger.requirements.length, extracted.length, 'every extracted normative operator must have exactly one ledger row');
  assert.ok(ledger.requirements.length > 100, 'expected a comprehensive normative requirement ledger');

  const ids = new Set();
  ledger.requirements.forEach((row, index) => {
    assert.equal(row.length, COLUMNS.length, `row ${index + 1} does not match the declared compact schema`);
    const requirement = rowObject(row);
    const sourceRequirement = extracted[index];

    assert.match(requirement.id, /^NREQ-\d{4}$/);
    assert.ok(!ids.has(requirement.id), `duplicate requirement id ${requirement.id}`);
    ids.add(requirement.id);
    assert.equal(requirement.sourceLine, sourceRequirement.sourceLine, `${requirement.id} source line drifted`);
    assert.equal(requirement.operatorIndex, sourceRequirement.operatorIndex, `${requirement.id} operator index drifted`);
    assert.equal(requirement.keyword, sourceRequirement.keyword, `${requirement.id} normative keyword drifted`);
    assert.ok(source.includes(sourceRequirement.text), `${requirement.id} source text is not verbatim from the PRD`);
    if (sourceRequirement.provenance === 'inherited') {
      assert.ok(sourceRequirement.governingClause && source.includes(sourceRequirement.governingClause), `${requirement.id} is missing its governing normative clause`);
    }
    assert.equal(requirement.testId, `NCON-${requirement.id}`);
    assert.ok(['phase-0', 'phase-1', 'phase-2', 'phase-3', 'release'].includes(requirement.owner));
    assert.ok(['planned', 'passing'].includes(requirement.status));
  });
});

test('release traceability remains visibly incomplete while planned mappings exist', async () => {
  const ledger = await readJson('spec/requirements.json');
  const statuses = ledger.requirements.map((row) => rowObject(row).status);
  assert.ok(statuses.includes('planned'));
  assert.equal(ledger.releaseComplete, false);
});

test('parser corpus covers required forms and invalid ownership cases', async () => {
  const manifest = await readJson('tests/fixtures/parser/manifest.json');
  const validFiles = await readdir(new URL('tests/fixtures/parser/valid/', root));
  const invalidFiles = await readdir(new URL('tests/fixtures/parser/invalid/', root));

  const requiredForms = [
    'interpolation', 'dynamic-attribute', 'mixed-attribute', 'shorthand-attribute', 'spread-attribute',
    'if', 'else-if', 'else', 'keyed-list', 'positional-list', 'empty-list',
    'await-pending', 'await-success', 'await-empty', 'await-error',
    'component', 'custom-element', 'raw-html', 'on-directive', 'bind-directive', 'use-directive', 'let-directive',
    'script-typescript', 'script-javascript', 'scoped-style', 'global-style', 'svg', 'mathml'
  ];

  const provedForms = new Set(manifest.valid.flatMap(({ proves }) => proves));
  for (const form of requiredForms) {
    assert.ok(manifest.coverage.includes(form), `missing parser coverage declaration for ${form}`);
    assert.ok(provedForms.has(form), `no valid fixture proves parser form ${form}`);
  }

  assert.deepEqual(validFiles.filter((name) => name.endsWith('.nomos')).sort(), manifest.valid.map(({ file }) => file).sort());
  assert.deepEqual(invalidFiles.filter((name) => name.endsWith('.nomos')).sort(), manifest.invalid.map(({ file }) => file).sort());

  for (const diagnostic of ['NOMOS-PARSE-DUPLICATE-SCRIPT', 'NOMOS-PARSE-HTML-OWNERSHIP', 'NOMOS-PARSE-UNTERMINATED-BLOCK', 'NOMOS-PARSE-UNKNOWN-DIRECTIVE']) {
    assert.ok(manifest.invalid.some((entry) => entry.diagnostic === diagnostic), `missing invalid fixture for ${diagnostic}`);
  }
});
