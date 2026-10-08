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
  'docs/phase-1/PARSER-AND-SOURCEMAPS.md',
  'docs/phase-1/research/embedded-language-representation.md',
  'docs/phase-1/research/source-map-composition.md',
  'docs/adr/0004-source-position-and-map-baseline.md',
  'docs/adr/0005-embedded-language-adapter-boundary.md',
  'docs/adr/0006-stage-local-source-map-composition.md',
  'spec/compiler-front-end.json',
  'spec/phase-status.json',
];
for (const path of required) await access(new URL(path, root));

const phase = JSON.parse(await readFile(new URL('spec/phase-status.json', root), 'utf8'));
assert.equal(phase.currentPhase, 1);
assert.equal(phase.phase1.status, 'in-progress');
assert.equal(phase.phase1.parserAndSourceMaps, 'in-progress');
assert.ok(phase.phase1.parserImplemented.includes('hierarchical-template-ast'));
assert.ok(phase.phase1.parserImplemented.includes('embedded-language-adapter-boundary'));
assert.ok(phase.phase1.parserImplemented.includes('stage-local-source-map-composition-contract'));
assert.ok(phase.phase1.parserRemaining.includes('embedded-typescript-and-css-adapter-implementation'));
assert.ok(phase.phase1.parserRemaining.includes('stage-local-source-map-composer-implementation'));

const frontEnd = JSON.parse(await readFile(new URL('spec/compiler-front-end.json', root), 'utf8'));
assert.equal(frontEnd.sourcePositionModel.offsetUnit, 'utf-16-code-unit');
assert.equal(frontEnd.sourceMaps.standard, 'ECMA-426');
assert.equal(frontEnd.sourceMaps.versionField, 3);
assert.equal(frontEnd.sourceMaps.stageLocalMappings, 'contract-resolved-implementation-planned');
assert.equal(frontEnd.sourceMaps.generatedScaffolding, 'unmapped');
assert.equal(frontEnd.sourceMaps.finalMapTarget, 'original-.nomos-source');
assert.equal(frontEnd.sourceMaps.finalMapValidation, 'required');
assert.equal(frontEnd.templateSyntax.hierarchicalTypedAst, 'implemented-structural');
assert.equal(frontEnd.embeddedLanguages.nomosOwnsDurableIr, true);
assert.equal(frontEnd.embeddedLanguages.authoritativeLocations, 'nomos-raw-source-spans');
assert.equal(frontEnd.embeddedLanguages.typescript.verifiedVersionBaseline, '6.0.2');
assert.equal(frontEnd.embeddedLanguages.css.verifiedVersionBaseline, '1.33.0');
assert.equal(frontEnd.embeddedLanguages.typescript.implementation, 'planned');
assert.equal(frontEnd.embeddedLanguages.css.implementation, 'planned');
assert.ok(frontEnd.wayfinder.resolvedDecisionTickets.includes('https://github.com/AahPlexX/nomos/issues/2'));
assert.ok(frontEnd.wayfinder.resolvedDecisionTickets.includes('https://github.com/AahPlexX/nomos/issues/3'));

console.log(`Phase 1 front-end check passed: ${required.length} required artifacts; hierarchy plus embedded-language/source-map contracts recorded; executable adapters/composer remain in progress.`);
