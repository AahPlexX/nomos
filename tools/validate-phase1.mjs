import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const required = [
  '.github/workflows/ci.yml',
  'packages/compiler/src/index.mjs',
  'packages/compiler/src/parser.mjs',
  'packages/compiler/src/template-syntax.mjs',
  'packages/compiler/src/template-ast.mjs',
  'packages/compiler/src/source-map.mjs',
  'packages/compiler/src/html-table-ownership.mjs',
  'packages/compiler/src/table-structure-validation.mjs',
  'packages/compiler/src/html-formatting-ownership.mjs',
  'packages/compiler/src/formatting-structure-validation.mjs',
  'packages/compiler/src/script-lowering.mjs',
  'packages/compiler/src/expression-lowering.mjs',
  'packages/compiler/src/template-lowering.mjs',
  'packages/compiler/src/template-dom-lowering.mjs',
  'packages/runtime/src/reactivity.mjs',
  'packages/runtime/src/deep-state.mjs',
  'packages/runtime/src/dom-bindings.mjs',
  'packages/runtime/src/internal.mjs',
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
  'tests/phase1-runtime-text-binding.test.mjs',
  'tests/phase1-compiler-reactive-lowering.test.mjs',
  'tests/phase1-template-expression-lowering.test.mjs',
  'tests/phase1-template-dom-materialization.test.mjs',
  'tests/phase1-source-map-composition.test.mjs',
  'tests/phase1-conformance-harness.test.mjs',
  'tools/verify-browser-dom.mjs',
  'tools/verify-dom-slice.mjs',
  'docs/diagnostics/NOMOS-PARSE-HTML-OWNERSHIP.md',
  'docs/diagnostics/NOMOS-REACTIVE-DERIVE-WRITE.md',
  'docs/diagnostics/NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE.md',
  'docs/phase-1/PARSER-AND-SOURCEMAPS.md',
  'docs/phase-1/research/embedded-language-representation.md',
  'docs/phase-1/research/source-map-composition.md',
  'docs/phase-1/research/public-conformance-promotion.md',
  'docs/phase-1/research/html-formatting-ownership.md',
  'docs/phase-1/research/runtime-ownership-and-scheduling.md',
  'docs/phase-1/research/dom-materialization.md',
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
assert.equal(phase.phase1.runtimeCore, 'deep-state-script-and-browser-template-dom-implemented');
assert.equal(phase.phase1.conformanceInfrastructure, 'foundation-implemented');
assert.ok(phase.phase1.parserImplemented.includes('typescript-embedded-expression-and-text-binding-ir-lowering'));
assert.ok(phase.phase1.parserImplemented.includes('browser-parsed-static-template-dom-materialization'));
assert.ok(phase.phase1.parserImplemented.includes('template-dom-mount-binding-and-expression-mapping'));
assert.ok(phase.phase1.parserImplemented.includes('whatwg-high-impact-formatting-adoption-agency-ownership'));
assert.ok(phase.phase1.parserRemaining.includes('dynamic-mixed-shorthand-spread-attribute-ir-and-lowering'));
assert.ok(phase.phase1.parserRemaining.includes('remaining-reactive-destructuring-assignment-target-lowering'));
assert.ok(phase.phase1.parserRemaining.includes('structural-block-and-component-template-lowering'));
assert.ok(!phase.phase1.parserRemaining.some((entry) => entry.includes('dom-node-materialization')));
assert.ok(phase.phase1.runtimeImplemented.includes('owner-backed-browser-parsed-static-template-mount'));
assert.ok(phase.phase1.runtimeImplemented.includes('internal-owner-backed-text-binding-helper'));
assert.ok(phase.phase1.runtimeRemaining.includes('state-snapshot-contract-and-implementation'));
assert.ok(phase.phase1.runtimeRemaining.includes('dynamic-attribute-event-binding-integration'));
assert.equal(phase.phase1.verification.workflow, '.github/workflows/ci.yml');
assert.equal(phase.phase1.verification.node, '22.16.0');
assert.equal(phase.phase1.verification.pnpm, '12.10.1');
assert.equal(phase.phase1.verification.typescript6, '6.0.2');
assert.equal(phase.phase1.verification.chrome, '154.0.8037.97');
assert.equal(phase.phase1.verification.loweringAndAbiTests, 16);
assert.equal(phase.phase1.verification.runtimeTests, 21);
assert.equal(phase.phase1.verification.domSliceUnitTests, 3);
assert.equal(phase.phase1.verification.browserDomRun, 38122323711);
assert.equal(phase.phase1.verification.browserTrustedTypesEnforced, true);
assert.equal(phase.phase1.verification.lastVerifiedRun, 38122323711);
assert.deepEqual(phase.phase1.openWayfinderDecisions, []);
assert.equal(phase.phase1.conformance.seedTestStatus, 'wired-unverified');
assert.equal(phase.phase1.conformance.passingRequirementCount, 0);

const frontEnd = JSON.parse(await readFile(new URL('spec/compiler-front-end.json', root), 'utf8'));
assert.equal(frontEnd.sourceMaps.standard, 'ECMA-426');
assert.equal(frontEnd.sourceMaps.scriptLoweringMappings, 'implemented-with-original-nomos-sourcesContent');
assert.equal(frontEnd.sourceMaps.templateDomMappings, 'implemented-mount-binding-and-expression-points-to-original-nomos');
assert.equal(frontEnd.sourceMaps.tokenLevelGeneratedMappings, 'partial-template-dom-points-not-token-complete');
assert.equal(frontEnd.htmlOwnership.certifiedRewriteCount, 21);
assert.ok(frontEnd.implementedDiagnostics.includes('NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE'));
assert.equal(frontEnd.embeddedLanguages.typescript.dependencyPin, '6.0.2');
assert.equal(frontEnd.embeddedLanguages.typescript.expressionAdapter, 'implemented-text-interpolation');
assert.equal(frontEnd.embeddedLanguages.css.implementation, 'planned');
assert.equal(frontEnd.templateDom.status, 'browser-parsed-static-skeleton-and-text-interpolation-materialization-implemented');
assert.equal(frontEnd.templateDom.staticHtmlParsing, 'HTMLTemplateElement-browser-parser');
assert.equal(frontEnd.templateDom.ownedRootCleanup, true);
assert.equal(frontEnd.templateDom.trustedTypes.policyName, 'nomos');
assert.equal(frontEnd.templateDom.trustedTypes.hostMustAllowPolicyName, true);
assert.equal(frontEnd.templateDom.browserVerification.run, 38122323711);
assert.equal(frontEnd.templateDom.browserVerification.chrome, '154.0.8037.97');
assert.equal(frontEnd.templateDom.browserVerification.trustedTypesEnforced, true);
assert.equal(frontEnd.reactiveLowering.status, 'script-core-and-browser-parsed-template-text-dom-implemented');
assert.equal(frontEnd.reactiveLowering.templateTextBindings.status, 'browser-materialized-and-runtime-bound');
assert.equal(frontEnd.reactiveLowering.templateTextBindings.nodeMaterialization, 'implemented-via-browser-parsed-static-skeleton-markers');
assert.ok(!frontEnd.reactiveLowering.remaining.includes('generated-dom-node-materialization'));
assert.ok(frontEnd.reactiveLowering.remaining.includes('dynamic-mixed-shorthand-spread-attribute-lowering'));
assert.equal(frontEnd.reactiveLowering.verification.domSliceUnitTests, 3);
assert.equal(frontEnd.reactiveLowering.verification.browserDomRun, 38122323711);
assert.equal(frontEnd.reactiveLowering.verification.lastVerifiedRun, 38122323711);

const runtime = JSON.parse(await readFile(new URL('spec/runtime-core.json', root), 'utf8'));
assert.equal(runtime.status, 'phase-1-runtime-deep-state-script-and-browser-template-dom-implemented');
assert.equal(runtime.compilerAbi.implementationFile, 'packages/runtime/src/internal.mjs');
assert.ok(runtime.compilerAbi.exports.includes('updateState'));
assert.ok(runtime.compilerAbi.exports.includes('bindText'));
assert.ok(runtime.compilerAbi.exports.includes('mountTemplate'));
assert.equal(runtime.domBindings.status, 'static-template-mount-and-text-binding-implemented');
assert.equal(runtime.domBindings.staticParser, 'HTMLTemplateElement');
assert.equal(runtime.domBindings.nodeMaterialization, 'implemented-static-html-and-text-interpolation-slice');
assert.equal(runtime.domBindings.trustedTypes.policyName, 'nomos');
assert.equal(runtime.domBindings.browserVerification.run, 38122323711);
assert.ok(runtime.implementedSlice.includes('owner-backed-browser-parsed-static-template-mount'));
assert.ok(runtime.remaining.includes('dynamic-attribute-event-binding-integration'));
assert.ok(!runtime.remaining.some((entry) => entry.includes('generated-dom-node-materialization')));
assert.equal(runtime.openDecisionImpact, 'none');

const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
assert.equal(packageJson.scripts['check:phase1:dom-slice'], 'node tools/verify-dom-slice.mjs');
assert.equal(packageJson.scripts['check:phase1:browser-dom'], 'node tools/verify-browser-dom.mjs');

const workflow = await readFile(new URL('.github/workflows/ci.yml', root), 'utf8');
assert.match(workflow, /runs-on: ubuntu-24\.04/);
assert.match(workflow, /google-chrome --version/);
assert.match(workflow, /pnpm check:phase1:dom-slice/);

const conformance = JSON.parse(await readFile(new URL('spec/conformance.json', root), 'utf8'));
assert.equal(conformance.status, 'foundation-implemented');
assert.equal(conformance.browserSubstitutionAllowed, false);
assert.equal(conformance.seedTest.status, 'wired-unverified');
assert.deepEqual(conformance.passingRequirements, []);

console.log(`Phase 1 check passed: ${required.length} required artifacts; compiler foundations, 21 HTML ownership scenarios, reactive runtime, browser-parsed static template DOM, live text interpolation, Trusted Types browser verification, and template mapping points are implemented while dynamic attributes/events, structural/component lowering, snapshot semantics, CSS adapter work, and public green evidence remain in progress.`);
