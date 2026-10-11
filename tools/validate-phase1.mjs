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
  'packages/runtime/src/deep-state.mjs',
  'packages/runtime/src/internal.mjs',
  'packages/compiler/src/script-lowering.mjs',
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
  'tests/phase1-runtime-deep-state.test.mjs',
  'tests/phase1-runtime-compiler-abi.test.mjs',
  'tests/phase1-compiler-reactive-lowering.test.mjs',
  'tests/phase1-source-map-composition.test.mjs',
  'tests/phase1-conformance-harness.test.mjs',
  'docs/diagnostics/NOMOS-PARSE-HTML-OWNERSHIP.md',
  'docs/diagnostics/NOMOS-REACTIVE-DERIVE-WRITE.md',
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
assert.equal(phase.phase1.runtimeCore, 'deep-state-and-script-lowering-implemented');
assert.equal(phase.phase1.conformanceInfrastructure, 'foundation-implemented');
assert.ok(phase.phase1.parserImplemented.includes('whatwg-high-impact-formatting-adoption-agency-ownership'));
assert.ok(phase.phase1.runtimeImplemented.includes('adr-0008-owner-and-scheduler-architecture'));
assert.ok(phase.phase1.runtimeImplemented.includes('deep-tracking-plain-object-array-map-set'));
assert.ok(phase.phase1.runtimeImplemented.includes('raw-state-cell-runtime-semantics'));
assert.ok(phase.phase1.runtimeImplemented.includes('stable-cycle-safe-deep-proxy-identity'));
assert.ok(phase.phase1.runtimeImplemented.includes('dom-before-sync-microtask-flush'));
assert.ok(phase.phase1.runtimeImplemented.includes('named-reactive-cycle-diagnostics'));
assert.ok(phase.phase1.runtimeImplemented.includes('compiler-internal-update-state-helper'));
assert.ok(phase.phase1.runtimeImplemented.includes('compiler-state-derive-and-state-raw-script-lowering'));
assert.ok(phase.phase1.parserImplemented.includes('typescript-embedded-script-wrapper-and-reactive-lowering'));
assert.ok(phase.phase1.parserImplemented.includes('typescript-script-emitter-source-maps-to-original-nomos'));
assert.ok(!phase.phase1.runtimeRemaining.includes('deep-tracking-plain-object-array-map-set'));
assert.ok(!phase.phase1.runtimeRemaining.includes('state-raw'));
assert.ok(!phase.phase1.runtimeRemaining.includes('compiler-state-derive-and-state-raw-lowering'));
assert.ok(phase.phase1.runtimeRemaining.includes('state-snapshot-contract-and-implementation'));
assert.equal(phase.phase1.runtimeMachineSpec, 'spec/runtime-core.json');
assert.deepEqual(phase.phase1.openWayfinderDecisions, []);
assert.ok(phase.phase1.resolvedWayfinderDecisions.includes('https://github.com/AahPlexX/nomos/issues/4'));
assert.equal(phase.phase1.conformance.seedTest, 'NCON-NREQ-0145');
assert.equal(phase.phase1.conformance.seedTestStatus, 'wired-unverified');
assert.equal(phase.phase1.conformance.passingRequirementCount, 0);

const frontEnd = JSON.parse(await readFile(new URL('spec/compiler-front-end.json', root), 'utf8'));
assert.equal(frontEnd.sourceMaps.standard, 'ECMA-426');
assert.equal(frontEnd.sourceMaps.stageLocalMappings, 'core-composer-plus-typescript-script-emitter-implemented');
assert.equal(frontEnd.sourceMaps.scriptLoweringMappings, 'implemented-with-original-nomos-sourcesContent');
assert.equal(frontEnd.htmlOwnership.certifiedRewriteCount, 21);
assert.equal(frontEnd.templateSyntax.hierarchicalTypedAst, 'implemented-structural');
assert.equal(frontEnd.embeddedLanguages.typescript.dependencyPin, '6.0.2');
assert.equal(frontEnd.embeddedLanguages.typescript.scriptWrapper, 'implemented');
assert.equal(frontEnd.embeddedLanguages.typescript.scriptLowering, 'implemented-state-derive-state-raw');
assert.equal(frontEnd.embeddedLanguages.typescript.expressionAdapter, 'planned');
assert.equal(frontEnd.reactiveLowering.status, 'script-core-implemented');
assert.equal(frontEnd.reactiveLowering.bindingRecognition, 'typescript-symbol-resolution');
assert.equal(frontEnd.reactiveLowering.internalRuntimeFile, 'packages/runtime/src/internal.mjs');
assert.equal(frontEnd.embeddedLanguages.css.implementation, 'planned');

const runtime = JSON.parse(await readFile(new URL('spec/runtime-core.json', root), 'utf8'));
assert.equal(runtime.status, 'phase-1-runtime-deep-state-and-script-lowering-implemented');
assert.equal(runtime.decision, 'docs/adr/0008-runtime-ownership-and-scheduler.md');
assert.ok(runtime.graph.sources.includes('deep-property-source'));
assert.equal(runtime.deepState.status, 'runtime-implemented');
assert.deepEqual(runtime.deepState.containers, ['plain-object', 'array', 'Map', 'Set']);
assert.ok(runtime.deepState.granularity.includes('membership'));
assert.equal(runtime.deepState.proxyIdentity, 'stable-per-state-and-cycle-safe');
assert.equal(runtime.deepState.rawOptOut, 'implemented-as-state-cell-raw-option');
assert.equal(runtime.deepState.publicStateRawSurface, 'implemented-by-typescript-script-lowering');
assert.equal(runtime.compilerAbi.implementationFile, 'packages/runtime/src/internal.mjs');
assert.ok(runtime.compilerAbi.exports.includes('updateState'));
assert.equal(runtime.scheduler.primitive, 'queueMicrotask');
assert.deepEqual(runtime.scheduler.flushPhases, ['dom', 'sync']);
assert.equal(runtime.scheduler.syncYieldsToNewDomWork, true);
assert.equal(runtime.graph.derivedEvaluation, 'lazy-memoized-on-demand');
assert.equal(runtime.graph.deriveWriteGuard, 'development-runtime-implemented');
assert.deepEqual(runtime.ownership.disposalOrder, ['child-owners', 'local-cleanup-reverse-creation', 'owned-dom']);
assert.equal(runtime.cycleDetection.status, 'development-runtime-implemented');
assert.ok(runtime.implementedSlice.includes('deep-tracked-plain-object-array-map-set'));
assert.ok(runtime.implementedSlice.includes('raw-state-cell-runtime-semantics'));
assert.ok(runtime.remaining.includes('state-snapshot-contract-and-implementation'));
assert.ok(!runtime.remaining.includes('compiler-state-derive-and-state-raw-lowering'));
assert.equal(runtime.openDecisionImpact, 'none');

const conformance = JSON.parse(await readFile(new URL('spec/conformance.json', root), 'utf8'));
assert.equal(conformance.status, 'foundation-implemented');
assert.equal(conformance.browserSubstitutionAllowed, false);
assert.equal(conformance.seedTest.status, 'wired-unverified');
assert.deepEqual(conformance.passingRequirements, []);

console.log(`Phase 1 check passed: ${required.length} required artifacts; compiler foundations, 21 HTML ownership scenarios, deep runtime state, and TypeScript-symbol-aware state/derive/state.raw script lowering are implemented while template/DOM lowering, snapshot semantics, remaining adapters, and public green evidence remain in progress.`);
