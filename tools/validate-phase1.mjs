import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const required = [
  'packages/compiler/src/index.mjs',
  'packages/compiler/src/parser.mjs',
  'packages/compiler/src/template-syntax.mjs',
  'packages/compiler/src/template-ast.mjs',
  'packages/compiler/src/source-map.mjs',
  'tests/phase1-parser.test.mjs',
  'tests/phase1-parser-structural.test.mjs',
  'tests/phase1-parser-ast.test.mjs',
  'tests/phase1-conformance-harness.test.mjs',
  'docs/phase-1/PARSER-AND-SOURCEMAPS.md',
  'docs/phase-1/research/embedded-language-representation.md',
  'docs/phase-1/research/source-map-composition.md',
  'docs/phase-1/research/public-conformance-promotion.md',
  'docs/adr/0004-source-position-and-map-baseline.md',
  'docs/adr/0005-embedded-language-adapter-boundary.md',
  'docs/adr/0006-stage-local-source-map-composition.md',
  'docs/adr/0007-public-conformance-promotion.md',
  'conformance/README.md',
  'conformance/manifest.json',
  'conformance/compiler/NCON-NREQ-0145.test.mjs',
  'tools/conformance-core.mjs',
  'tools/run-conformance.mjs',
  'tools/validate-conformance.mjs',
  'spec/conformance.json',
  'spec/compiler-front-end.json',
  'spec/phase-status.json',
];
for (const path of required) await access(new URL(path, root));

const phase = JSON.parse(await readFile(new URL('spec/phase-status.json', root), 'utf8'));
assert.equal(phase.currentPhase, 1);
assert.equal(phase.phase1.status, 'in-progress');
assert.equal(phase.phase1.parserAndSourceMaps, 'in-progress');
assert.equal(phase.phase1.conformanceInfrastructure, 'foundation-implemented');
assert.equal(phase.phase1.conformance.seedTest, 'NCON-NREQ-0145');
assert.equal(phase.phase1.conformance.seedTestStatus, 'wired-unverified');
assert.equal(phase.phase1.conformance.passingRequirementCount, 0);
assert.ok(phase.phase1.resolvedWayfinderDecisions.includes('https://github.com/AahPlexX/nomos/issues/5'));
assert.deepEqual(phase.phase1.openWayfinderDecisions, ['https://github.com/AahPlexX/nomos/issues/4']);

const frontEnd = JSON.parse(await readFile(new URL('spec/compiler-front-end.json', root), 'utf8'));
assert.equal(frontEnd.sourcePositionModel.offsetUnit, 'utf-16-code-unit');
assert.equal(frontEnd.sourceMaps.standard, 'ECMA-426');
assert.equal(frontEnd.sourceMaps.stageLocalMappings, 'contract-resolved-implementation-planned');
assert.equal(frontEnd.templateSyntax.hierarchicalTypedAst, 'implemented-structural');
assert.equal(frontEnd.embeddedLanguages.typescript.implementation, 'planned');
assert.equal(frontEnd.embeddedLanguages.css.implementation, 'planned');

const conformance = JSON.parse(await readFile(new URL('spec/conformance.json', root), 'utf8'));
assert.equal(conformance.status, 'foundation-implemented');
assert.equal(conformance.browserSubstitutionAllowed, false);
assert.equal(conformance.seedTest.status, 'wired-unverified');
assert.deepEqual(conformance.passingRequirements, []);

console.log(`Phase 1 check passed: ${required.length} required artifacts; conformance foundation is implemented while parser adapters/composer and public green evidence remain in progress.`);
