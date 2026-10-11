import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const required = [
  'packages/compiler/src/index.mjs',
  'packages/compiler/src/parser.mjs',
  'packages/compiler/src/template-syntax.mjs',
  'packages/compiler/src/template-ast.mjs',
  'packages/compiler/src/source-map.mjs',
  'packages/compiler/src/html-table-ownership.mjs',
  'packages/compiler/src/table-structure-validation.mjs',
  'packages/compiler/src/html-formatting-ownership.mjs',
  'packages/compiler/src/formatting-structure-validation.mjs',
  'packages/runtime/src/reactivity.mjs',
  'tests/phase1-parser.test.mjs',
  'tests/phase1-parser-structural.test.mjs',
  'tests/phase1-parser-ast.test.mjs',
  'tests/phase1-parser-html-ownership.test.mjs',
  'tests/phase1-parser-table-ownership.test.mjs',
  'tests/phase1-parser-table-integration.test.mjs',
  'tests/phase1-parser-table-transitions.test.mjs',
  'tests/phase1-table-ownership-rules.test.mjs',
  'tests/phase1-table-structure-validation.test.mjs',
  'tests/phase1-table-section-transitions.test.mjs',
  'tests/phase1-table-stack-repair.test.mjs',
  'tests/phase1-formatting-ownership-rules.test.mjs',
  'tests/phase1-formatting-structure-validation.test.mjs',
  'tests/phase1-parser-formatting-integration.test.mjs',
  'tests/phase1-runtime-core.test.mjs',
  'tests/phase1-source-map-composition.test.mjs',
  'tests/phase1-conformance-harness.test.mjs',
  'docs/diagnostics/NOMOS-PARSE-HTML-OWNERSHIP.md',
  'docs/phase-1/PARSER-AND-SOURCEMAPS.md',
  'docs/phase-1/research/embedded-language-representation.md',
  'docs/phase-1/research/source-map-composition.md',
  'docs/phase-1/research/public-conformance-promotion.md',
  'docs/phase-1/research/html-formatting-ownership.md',
  'docs/phase-1/research/runtime-ownership-and-scheduling.md',
  'docs/adr/0004-source-position-and-map-baseline.md',
  'docs/adr/0005-embedded-language-adapter-boundary.md',
  'docs/adr/0006-stage-local-source-map-composition.md',
  'docs/adr/0007-public-conformance-promotion.md',
  'docs/adr/0008-runtime-ownership-and-scheduler.md',
  'conformance/README.md',
  'conformance/manifest.json',
  'conformance/compiler/NCON-NREQ-0145.test.mjs',
  'tools/conformance-core.mjs',
  'tools/run-conformance.mjs',
  'tools/validate-conformance.mjs',
  'spec/conformance.json',
  'spec/compiler-front-end.json',
  'spec/runtime-core.json',
  'spec/phase-status.json',
];
for (const path of required) await access(new URL(path, root));

const phase = JSON.parse(await readFile(new URL('spec/phase-status.json', root), 'utf8'));
assert.equal(phase.currentPhase, 1);
assert.equal(phase.phase1.status, 'in-progress');
assert.equal(phase.phase1.parserAndSourceMaps, 'in-progress');
assert.equal(phase.phase1.runtimeCore, 'foundation-implemented');
assert.equal(phase.phase1.conformanceInfrastructure, 'foundation-implemented');
assert.ok(phase.phase1.parserImplemented.includes('whatwg-high-impact-formatting-adoption-agency-ownership'));
assert.ok(phase.phase1.runtimeImplemented.includes('adr-0008-owner-and-scheduler-architecture'));
assert.ok(phase.phase1.runtimeImplemented.includes('dom-before-sync-microtask-flush'));
assert.ok(phase.phase1.runtimeImplemented.includes('named-reactive-cycle-diagnostics'));
assert.ok(phase.phase1.runtimeRemaining.includes('deep-tracking-plain-object-array-map-set'));
assert.ok(phase.phase1.runtimeRemaining.includes('compiler-state-and-derive-lowering'));
assert.equal(phase.phase1.runtimeMachineSpec, 'spec/runtime-core.json');
assert.deepEqual(phase.phase1.openWayfinderDecisions, []);
assert.ok(phase.phase1.resolvedWayfinderDecisions.includes('https://github.com/AahPlexX/nomos/issues/4'));
assert.equal(phase.phase1.conformance.seedTest, 'NCON-NREQ-0145');
assert.equal(phase.phase1.conformance.seedTestStatus, 'wired-unverified');
assert.equal(phase.phase1.conformance.passingRequirementCount, 0);

const frontEnd = JSON.parse(await readFile(new URL('spec/compiler-front-end.json', root), 'utf8'));
assert.equal(frontEnd.sourceMaps.standard, 'ECMA-426');
assert.equal(frontEnd.sourceMaps.stageLocalMappings, 'core-composer-implemented');
assert.equal(frontEnd.htmlOwnership.certifiedRewriteCount, 21);
assert.equal(frontEnd.templateSyntax.hierarchicalTypedAst, 'implemented-structural');
assert.equal(frontEnd.embeddedLanguages.typescript.implementation, 'planned');
assert.equal(frontEnd.embeddedLanguages.css.implementation, 'planned');

const runtime = JSON.parse(await readFile(new URL('spec/runtime-core.json', root), 'utf8'));
assert.equal(runtime.status, 'phase-1-runtime-core-implemented');
assert.equal(runtime.decision, 'docs/adr/0008-runtime-ownership-and-scheduler.md');
assert.equal(runtime.scheduler.primitive, 'queueMicrotask');
assert.deepEqual(runtime.scheduler.flushPhases, ['dom', 'sync']);
assert.equal(runtime.scheduler.syncYieldsToNewDomWork, true);
assert.equal(runtime.graph.derivedEvaluation, 'lazy-memoized-on-demand');
assert.equal(runtime.graph.deriveWriteGuard, 'development-runtime-implemented');
assert.deepEqual(runtime.ownership.disposalOrder, ['child-owners', 'local-cleanup-reverse-creation', 'owned-dom']);
assert.equal(runtime.cycleDetection.status, 'development-runtime-implemented');
assert.ok(runtime.remaining.includes('deep-tracking-plain-object-array-map-set'));
assert.ok(runtime.remaining.includes('state-snapshot-contract-and-implementation'));
assert.equal(runtime.openDecisionImpact, 'none');

const conformance = JSON.parse(await readFile(new URL('spec/conformance.json', root), 'utf8'));
assert.equal(conformance.status, 'foundation-implemented');
assert.equal(conformance.browserSubstitutionAllowed, false);
assert.equal(conformance.seedTest.status, 'wired-unverified');
assert.deepEqual(conformance.passingRequirements, []);

console.log(`Phase 1 check passed: ${required.length} required artifacts; compiler front-end foundations, 21 HTML ownership scenarios, and ADR-0008 runtime core are implemented while deep state/lowering, embedded adapters, generated mappings, and public green evidence remain in progress.`);
