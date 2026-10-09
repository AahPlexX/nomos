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
  'tests/phase1-parser-html-ownership.test.mjs',
  'tests/phase1-source-map-composition.test.mjs',
  'tests/phase1-conformance-harness.test.mjs',
  'docs/diagnostics/NOMOS-PARSE-HTML-OWNERSHIP.md',
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
assert.ok(phase.phase1.parserImplemented.includes('exact-decoded-segment-composer'));
assert.ok(phase.phase1.parserImplemented.includes('whatwg-implied-close-ownership-li-dd-dt-button'));
assert.ok(phase.phase1.parserRemaining.includes('remaining-html-tree-construction-validation-including-table-foster-parenting'));
assert.ok(phase.phase1.parserRemaining.includes('token-level-generated-mapping-production'));
assert.equal(phase.phase1.conformance.seedTest, 'NCON-NREQ-0145');
assert.equal(phase.phase1.conformance.seedTestStatus, 'wired-unverified');
assert.equal(phase.phase1.conformance.passingRequirementCount, 0);
assert.deepEqual(phase.phase1.openWayfinderDecisions, ['https://github.com/AahPlexX/nomos/issues/4']);

const frontEnd = JSON.parse(await readFile(new URL('spec/compiler-front-end.json', root), 'utf8'));
assert.equal(frontEnd.sourcePositionModel.offsetUnit, 'utf-16-code-unit');
assert.equal(frontEnd.sourceMaps.standard, 'ECMA-426');
assert.equal(frontEnd.sourceMaps.stageLocalMappings, 'core-composer-implemented');
assert.equal(frontEnd.sourceMaps.compositionResolution, 'exact-mapping-points-only');
assert.equal(frontEnd.sourceMaps.finalMapValidation, 'implemented-core');
assert.equal(frontEnd.sourceMaps.tokenLevelGeneratedMappings, 'planned');
assert.equal(frontEnd.htmlOwnership.status, 'partial-whatwg-tree-construction-validation');
assert.ok(frontEnd.htmlOwnership.certifiedRewrites.includes('li-start-tag-closes-open-li'));
assert.ok(frontEnd.htmlOwnership.certifiedRewrites.includes('dd-or-dt-start-tag-closes-open-dd-or-dt'));
assert.ok(frontEnd.htmlOwnership.certifiedRewrites.includes('button-start-tag-closes-open-button'));
assert.ok(frontEnd.htmlOwnership.remaining.includes('table-insertion-modes-and-foster-parenting'));
assert.equal(frontEnd.templateSyntax.hierarchicalTypedAst, 'implemented-structural');
assert.equal(frontEnd.embeddedLanguages.typescript.implementation, 'planned');
assert.equal(frontEnd.embeddedLanguages.css.implementation, 'planned');

const conformance = JSON.parse(await readFile(new URL('spec/conformance.json', root), 'utf8'));
assert.equal(conformance.status, 'foundation-implemented');
assert.equal(conformance.browserSubstitutionAllowed, false);
assert.equal(conformance.seedTest.status, 'wired-unverified');
assert.deepEqual(conformance.passingRequirements, []);

console.log(`Phase 1 check passed: ${required.length} required artifacts; source-map composition core and expanded implied-close HTML ownership checks are implemented while remaining HTML modes, embedded adapters, token mapping production, and public green evidence remain in progress.`);
