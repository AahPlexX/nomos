import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const required = [
  'packages/compiler/src/index.mjs',
  'packages/compiler/src/parser.mjs',
  'packages/compiler/src/source-map.mjs',
  'tests/phase1-parser.test.mjs',
  'docs/phase-1/PARSER-AND-SOURCEMAPS.md',
  'docs/adr/0004-source-position-and-map-baseline.md',
  'docs/diagnostics/NOMOS-PARSE-DUPLICATE-SCRIPT.md',
  'docs/diagnostics/NOMOS-PARSE-UNCLOSED-SECTION.md',
  'spec/compiler-front-end.json',
  'spec/phase-status.json',
];

for (const path of required) await access(new URL(path, root));

const phase = JSON.parse(await readFile(new URL('spec/phase-status.json', root), 'utf8'));
assert.equal(phase.currentPhase, 1);
assert.equal(phase.phase1.status, 'in-progress');
assert.equal(phase.phase1.parserAndSourceMaps, 'in-progress');

const frontEnd = JSON.parse(await readFile(new URL('spec/compiler-front-end.json', root), 'utf8'));
assert.equal(frontEnd.sourcePositionModel.offsetUnit, 'utf-16-code-unit');
assert.equal(frontEnd.sourceMaps.standard, 'ECMA-426');
assert.equal(frontEnd.sourceMaps.versionField, 3);
assert.equal(frontEnd.phase0ParserCorpus.duplicateScript, 'implemented');
assert.equal(frontEnd.phase0ParserCorpus.htmlOwnership, 'planned');

console.log(`Phase 1 front-end check passed: ${required.length} required artifacts; parser/source-map slice remains in progress.`);
