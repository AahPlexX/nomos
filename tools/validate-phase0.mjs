import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const required = [
  'PRD.md', 'AGENTS.md', 'README.md', 'TODO.md', 'CHANGELOG.md',
  'docs/GOVERNANCE.md', 'docs/STATUS.md', 'docs/DECISIONS.md',
  'docs/phase-0/REACTIVE-CONTRACT.md',
  'docs/phase-0/CAPABILITY-GAUNTLET.md',
  'docs/phase-0/LEARNABILITY-STUDY.md',
  'spec/nomos.ebnf', 'spec/runtime-api.json', 'spec/levels.json'
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

console.log(`Phase 0 contract check passed: ${required.length} required artifacts, ${examples.length} representative components.`);
