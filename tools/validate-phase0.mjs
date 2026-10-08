import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const required = [
  'PRD.md', 'AGENTS.md', 'README.md', 'TODO.md', 'CHANGELOG.md',
  'docs/GOVERNANCE.md', 'docs/STATUS.md', 'docs/DECISIONS.md',
  'docs/phase-0/REACTIVE-CONTRACT.md',
  'docs/phase-0/CAPABILITY-GAUNTLET.md',
  'docs/phase-0/LEARNABILITY-STUDY.md',
  'docs/phase-0/REQUIREMENT-TRACEABILITY.md',
  'docs/phase-0/PARSER-CORPUS.md',
  'docs/phase-0/CONTRADICTION-AUDIT.md',
  'docs/phase-0/EXTERNAL-REVIEW-PACKET.md',
  'docs/adr/0003-whitespace-semantics.md',
  'spec/nomos.ebnf', 'spec/runtime-api.json', 'spec/levels.json', 'spec/requirements.json',
  'spec/open-decisions.json', 'spec/whitespace.json',
  'tests/fixtures/parser/manifest.json'
];

for (const path of required) await access(new URL(path, root));

const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
for (const group of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
  for (const [name, version] of Object.entries(packageJson[group] ?? {})) {
    assert.doesNotMatch(version, /^[~^]/, `${name} must use an exact version`);
  }
}

const status = await readFile(new URL('docs/STATUS.md', root), 'utf8');
const todo = await readFile(new URL('TODO.md', root), 'utf8');
assert.match(status, /Phase state:\*\* IN PROGRESS/);
assert.match(todo, /Phase 0 must remain IN PROGRESS/);

const examples = (await readdir(new URL('examples/phase-0/', root))).filter((name) => name.endsWith('.nomos'));
assert.equal(examples.length, 10);

const requirements = JSON.parse(await readFile(new URL('spec/requirements.json', root), 'utf8'));
assert.equal(requirements.releaseComplete, false, 'Phase 0 must not claim release-complete traceability');
const statusIndex = requirements.columns.indexOf('status');
assert.ok(requirements.requirements.some((row) => row[statusIndex] === 'planned'));
assert.equal(requirements.requirements.length, 239, 'normative requirement index changed without synchronized documentation');

console.log(`Phase 0 contract check passed: ${required.length} required artifacts, ${examples.length} representative components, ${requirements.requirements.length} normative requirements indexed.`);
