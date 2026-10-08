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
  'docs/adr/0004-source-position-and-map-baseline.md',
  'docs/adr/0005-embedded-language-adapter-boundary.md',
  'docs/diagnostics/NOMOS-PARSE-DUPLICATE-SCRIPT.md',
  'docs/diagnostics/NOMOS-PARSE-UNCLOSED-SECTION.md',
  'docs/diagnostics/NOMOS-PARSE-HTML-OWNERSHIP.md',
  'docs/diagnostics/NOMOS-PARSE-UNTERMINATED-BLOCK.md',
  'docs/diagnostics/NOMOS-PARSE-UNKNOWN-DIRECTIVE.md',
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
assert.ok(phase.phase1.parserRemaining.includes('embedded-typescript-and-css-adapter-implementation'));
assert.equal(phase.phase1.wayfinderMap, 'https://github.com/AahPlexX/nomos/issues/1');

const frontEnd = JSON.parse(await readFile(new URL('spec/compiler-front-end.json', root), 'utf8'));
assert.equal(frontEnd.sourcePositionModel.offsetUnit, 'utf-16-code-unit');
assert.equal(frontEnd.sourceMaps.standard, 'ECMA-426');
assert.equal(frontEnd.sourceMaps.versionField, 3);
assert.equal(frontEnd.phase0ParserCorpus.allValidFixtures, 'certified-structural');
assert.equal(frontEnd.phase0ParserCorpus.allInvalidFixtures, 'certified');
assert.equal(frontEnd.templateSyntax.status, 'hierarchical-structural-ast');
assert.equal(frontEnd.templateSyntax.hierarchicalTypedAst, 'implemented-structural');
assert.equal(frontEnd.templateSyntax.typedEmbeddedExpressions, 'boundary-resolved-implementation-planned');
assert.equal(frontEnd.embeddedLanguages.nomosOwnsDurableIr, true);
assert.equal(frontEnd.embeddedLanguages.authoritativeLocations, 'nomos-raw-source-spans');
assert.equal(frontEnd.embeddedLanguages.typescript.verifiedVersionBaseline, '6.0.2');
assert.equal(frontEnd.embeddedLanguages.css.verifiedVersionBaseline, '1.33.0');
assert.equal(frontEnd.embeddedLanguages.typescript.implementation, 'planned');
assert.equal(frontEnd.embeddedLanguages.css.implementation, 'planned');
assert.equal(frontEnd.embeddedLanguages.dependencyInstallation, 'deferred-until-executable-adapter-slice');
assert.equal(frontEnd.wayfinder.map, 'https://github.com/AahPlexX/nomos/issues/1');
assert.ok(frontEnd.wayfinder.resolvedDecisionTickets.includes('https://github.com/AahPlexX/nomos/issues/2'));

console.log(`Phase 1 front-end check passed: ${required.length} required artifacts; hierarchy and embedded-language boundary are recorded; executable adapters/source-map composition remain in progress.`);
