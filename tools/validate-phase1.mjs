import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const required = [
  '.github/workflows/ci.yml',
  'packages/compiler/src/index.mjs',
  'packages/compiler/src/parser.mjs',
  'packages/compiler/src/template-syntax.mjs',
  'packages/compiler/src/attribute-ir.mjs',
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
  'packages/shared/src/html-attribute-policy.mjs',
  'packages/runtime/src/reactivity.mjs',
  'packages/runtime/src/deep-state.mjs',
  'packages/runtime/src/dom-bindings.mjs',
  'packages/runtime/src/internal.mjs',
  'tests/phase1-parser.test.mjs',
  'tests/phase1-parser-structural.test.mjs',
  'tests/phase1-parser-ast.test.mjs',
  'tests/phase1-parser-attribute-ir.test.mjs',
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
  'tests/phase1-runtime-attribute-binding.test.mjs',
  'tests/phase1-runtime-html-assignment-policy.test.mjs',
  'tests/phase1-compiler-reactive-lowering.test.mjs',
  'tests/phase1-template-expression-lowering.test.mjs',
  'tests/phase1-template-dom-materialization.test.mjs',
  'tests/phase1-template-attribute-lowering.test.mjs',
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
  'docs/phase-1/research/html-attribute-assignment.md',
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
assert.equal(phase.phase1.runtimeCore, 'browser-template-dom-and-all-standard-html-runtime-attribute-forms-implemented');
assert.equal(phase.phase1.conformanceInfrastructure, 'foundation-implemented');
assert.ok(phase.phase1.parserImplemented.includes('typed-exact-span-static-dynamic-mixed-shorthand-spread-attribute-ir'));
assert.ok(phase.phase1.parserImplemented.includes('same-span-table-ownership-diagnostic-deduplication'));
assert.ok(phase.phase1.parserImplemented.includes('browser-parsed-static-template-dom-materialization'));
assert.ok(phase.phase1.parserImplemented.includes('standard-html-dynamic-mixed-shorthand-attribute-lowering'));
assert.ok(phase.phase1.parserImplemented.includes('standard-html-source-ordered-spread-attribute-lowering'));
assert.ok(phase.phase1.parserImplemented.includes('shared-standard-html-attribute-policy'));
assert.ok(phase.phase1.parserImplemented.includes('published-standard-html-property-assignment-table'));
assert.ok(phase.phase1.parserImplemented.includes('template-dom-text-attribute-and-spread-mapping'));
assert.ok(!phase.phase1.parserRemaining.some((entry) => entry.includes('spread-attribute')));
assert.ok(!phase.phase1.parserRemaining.includes('attribute-property-assignment-table'));
assert.ok(phase.phase1.parserRemaining.includes('dynamic-url-attribute-safety-validation'));
assert.ok(phase.phase1.runtimeImplemented.includes('owner-backed-source-ordered-standard-html-spread-attribute-binding'));
assert.ok(phase.phase1.runtimeImplemented.includes('published-standard-html-property-assignment-policy'));
assert.ok(!phase.phase1.runtimeRemaining.some((entry) => entry.includes('spread-attribute')));
assert.ok(!phase.phase1.runtimeRemaining.includes('attribute-property-assignment-table'));
assert.ok(phase.phase1.runtimeRemaining.includes('state-snapshot-contract-and-implementation'));
assert.equal(phase.phase1.attributeBindingFunctions.required, 4);
assert.equal(phase.phase1.attributeBindingFunctions.complete, 4);
assert.deepEqual(phase.phase1.attributeBindingFunctions.implemented, ['dynamic', 'mixed', 'shorthand', 'spread']);
assert.deepEqual(phase.phase1.attributeBindingFunctions.remaining, []);
assert.equal(phase.phase1.propertyAssignmentPolicy.status, 'published-tested-contract-activation-pending');
assert.equal(phase.phase1.propertyAssignmentPolicy.focusedTests, 5);
assert.equal(phase.phase1.verification.workflow, '.github/workflows/ci.yml');
assert.equal(phase.phase1.verification.node, '22.16.0');
assert.equal(phase.phase1.verification.pnpm, '12.10.1');
assert.equal(phase.phase1.verification.typescript6, '6.0.2');
assert.equal(phase.phase1.verification.chrome, '154.0.8037.97');
assert.equal(phase.phase1.verification.parserTests, 66);
assert.equal(phase.phase1.verification.loweringAndAbiTests, 16);
assert.equal(phase.phase1.verification.runtimeTests, 31);
assert.equal(phase.phase1.verification.domSliceUnitTests, 11);
assert.equal(phase.phase1.verification.propertyAssignmentPolicyTests, 5);
assert.equal(phase.phase1.verification.browserDomRun, 38638143259);
assert.equal(phase.phase1.verification.browserTrustedTypesEnforced, true);
assert.equal(phase.phase1.verification.lastVerifiedRun, 38638143259);
assert.deepEqual(phase.phase1.openWayfinderDecisions, []);
assert.equal(phase.phase1.conformance.seedTestStatus, 'wired-unverified');
assert.equal(phase.phase1.conformance.passingRequirementCount, 0);

const frontEnd = JSON.parse(await readFile(new URL('spec/compiler-front-end.json', root), 'utf8'));
assert.equal(frontEnd.sourceMaps.standard, 'ECMA-426');
assert.equal(frontEnd.sourceMaps.templateDomMappings, 'implemented-mount-text-attribute-spread-binding-and-expression-points-to-original-nomos');
assert.equal(frontEnd.htmlOwnership.certifiedRewriteCount, 21);
assert.equal(frontEnd.templateSyntax.attributeIr.status, 'implemented-exact-span-five-ratified-forms');
assert.deepEqual(frontEnd.templateSyntax.attributeIr.forms, ['static', 'dynamic', 'mixed', 'shorthand', 'spread']);
assert.equal(frontEnd.templateDom.status, 'browser-parsed-static-skeleton-text-and-all-standard-html-runtime-attribute-forms-implemented');
assert.equal(frontEnd.templateDom.sharedAttributePolicy, 'packages/shared/src/html-attribute-policy.mjs');
assert.equal(frontEnd.templateDom.attributeBinding.requiredDynamicForms, 4);
assert.equal(frontEnd.templateDom.attributeBinding.implementedCount, 4);
assert.deepEqual(frontEnd.templateDom.attributeBinding.implementedForms, ['dynamic', 'mixed', 'shorthand', 'spread']);
assert.deepEqual(frontEnd.templateDom.attributeBinding.remainingForms, []);
assert.equal(frontEnd.templateDom.attributeBinding.spreadPrecedence, 'authored-left-to-right-later-entry-wins');
assert.equal(frontEnd.templateDom.attributeBinding.spreadEnumeration, 'own-enumerable-string-keys');
assert.equal(frontEnd.templateDom.attributeBinding.spreadNullishSource, 'no-op');
assert.equal(frontEnd.templateDom.attributeBinding.spreadDroppedKeys, 'restore-earlier-source-order-fallback-or-remove');
assert.equal(frontEnd.templateDom.attributeBinding.spreadUnsafeNameValidation, 'on-and-guarded-url-names-rejected-before-dom-mutation');
assert.equal(frontEnd.templateDom.attributeBinding.propertyAssignmentPolicy.status, 'published-tested-contract-activation-pending');
assert.equal(frontEnd.templateDom.attributeBinding.propertyAssignmentPolicy.focusedTests, 5);
assert.equal(frontEnd.templateDom.attributeBinding.propertyAssignmentPolicy.inputValueModeAware, true);
assert.equal(frontEnd.templateDom.attributeBinding.customElementDynamicAssignment, 'guarded-od-008');
assert.equal(frontEnd.templateDom.attributeBinding.dynamicUrlAttributes, 'guarded-until-protocol-validator');
assert.equal(frontEnd.templateDom.trustedTypes.policyName, 'nomos');
assert.equal(frontEnd.templateDom.browserVerification.run, 38638143259);
assert.ok(frontEnd.templateDom.browserVerification.verifiedBehaviors.includes('spread-overrides-earlier-explicit-attribute'));
assert.ok(frontEnd.templateDom.browserVerification.verifiedBehaviors.includes('later-explicit-attribute-overrides-spread'));
assert.ok(frontEnd.templateDom.browserVerification.verifiedBehaviors.includes('spread-only-ordinary-attribute-assignment'));
assert.equal(frontEnd.reactiveLowering.verification.parserTests, 66);
assert.equal(frontEnd.reactiveLowering.verification.domSliceUnitTests, 11);
assert.equal(frontEnd.reactiveLowering.verification.runtimeTests, 31);
assert.equal(frontEnd.reactiveLowering.verification.propertyAssignmentPolicyTests, 5);
assert.equal(frontEnd.reactiveLowering.verification.lastVerifiedRun, 38638143259);
assert.ok(!frontEnd.reactiveLowering.remaining.some((entry) => entry.includes('spread-attribute')));
assert.ok(!frontEnd.reactiveLowering.remaining.includes('attribute-property-assignment-table'));
assert.ok(frontEnd.reactiveLowering.remaining.includes('dynamic-url-attribute-safety'));

const runtime = JSON.parse(await readFile(new URL('spec/runtime-core.json', root), 'utf8'));
assert.equal(runtime.status, 'phase-1-runtime-browser-template-dom-and-all-standard-html-runtime-attribute-forms-implemented');
assert.ok(runtime.compilerAbi.exports.includes('bindText'));
assert.ok(runtime.compilerAbi.exports.includes('bindAttribute'));
assert.ok(runtime.compilerAbi.exports.includes('bindAttributes'));
assert.ok(runtime.compilerAbi.exports.includes('mountTemplate'));
assert.equal(runtime.domBindings.status, 'static-template-text-and-all-standard-html-runtime-attribute-binding-forms-implemented');
assert.equal(runtime.domBindings.sharedAttributePolicy, 'packages/shared/src/html-attribute-policy.mjs');
assert.equal(runtime.domBindings.attributeForms.requiredDynamicForms, 4);
assert.equal(runtime.domBindings.attributeForms.implementedCount, 4);
assert.deepEqual(runtime.domBindings.attributeForms.implemented, ['dynamic', 'mixed', 'shorthand', 'spread']);
assert.deepEqual(runtime.domBindings.attributeForms.remaining, []);
assert.equal(runtime.domBindings.propertyAssignmentPolicy.status, 'published-tested-contract-activation-pending');
assert.equal(runtime.domBindings.propertyAssignmentPolicy.focusedTests, 5);
assert.equal(runtime.domBindings.propertyAssignmentPolicy.inputValueModes, 'type-sensitive-value-vs-default-default-on-filename');
assert.equal(runtime.domBindings.spreadSemantics.precedence, 'authored-left-to-right-later-entry-wins');
assert.equal(runtime.domBindings.spreadSemantics.enumeration, 'own-enumerable-string-keys');
assert.equal(runtime.domBindings.spreadSemantics.nullishSource, 'no-op');
assert.equal(runtime.domBindings.spreadSemantics.droppedKeyBehavior, 'restore-earlier-source-order-fallback-or-remove');
assert.equal(runtime.domBindings.spreadSemantics.unsafeNameValidation, 'validate-complete-plan-before-dom-mutation');
assert.equal(runtime.domBindings.trustedTypes.policyName, 'nomos');
assert.equal(runtime.domBindings.browserVerification.run, 38638143259);
assert.ok(runtime.domBindings.browserVerification.verifiedBehaviors.includes('spread-overrides-earlier-explicit-attribute'));
assert.ok(!runtime.remaining.some((entry) => entry.includes('spread-attribute')));
assert.ok(!runtime.remaining.includes('attribute-property-assignment-table'));
assert.ok(runtime.remaining.includes('dynamic-url-attribute-safety'));
assert.equal(runtime.openDecisionImpact, 'none');

const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
assert.equal(packageJson.scripts['check:phase1:dom-slice'], 'node tools/verify-dom-slice.mjs');
assert.equal(packageJson.scripts['check:phase1:parser'], 'node --test "tests/phase1-parser*.test.mjs" "tests/phase1-table-*.test.mjs" "tests/phase1-formatting-*.test.mjs"');

const workflow = await readFile(new URL('.github/workflows/ci.yml', root), 'utf8');
assert.match(workflow, /runs-on: ubuntu-24\.04/);
assert.match(workflow, /google-chrome --version/);
assert.match(workflow, /pnpm check:phase1:parser/);
assert.match(workflow, /pnpm check:phase1:dom-slice/);

const conformance = JSON.parse(await readFile(new URL('spec/conformance.json', root), 'utf8'));
assert.equal(conformance.status, 'foundation-implemented');
assert.equal(conformance.browserSubstitutionAllowed, false);
assert.equal(conformance.seedTest.status, 'wired-unverified');
assert.deepEqual(conformance.passingRequirements, []);

console.log(`Phase 1 check passed: ${required.length} required artifacts; compiler foundations, typed five-form attribute IR, 21 HTML ownership scenarios, browser-parsed template DOM, live text interpolation, 4/4 standard-HTML runtime attribute forms, and the published/tested standard-HTML property-assignment contract are implemented while property-write activation, URL safety, events/native controls, structural/component lowering, snapshot semantics, CSS adapter work, and public green evidence remain in progress.`);
