# Changelog

All material repository changes are recorded here. This file tracks project state, not semantic-version release notes yet.

## 2026-10-08 — Phase 0 thesis slice

### Added

- Lossless repository preservation of the user-supplied PRD through a SHA-256 manifest plus four verbatim ordered source fragments.
- Repository continuation protocol and interim governance.
- Formal `.nomos` EBNF contract draft, root runtime API budget, additive learning levels, and ten representative `.nomos` fixtures.
- Reactive contract, capability-gauntlet specification, learnability-study protocol, parser contract corpus, whitespace semantics, and ADR-0001 through ADR-0003.
- Normative traceability ledger for 239 PRD obligations with deterministic extraction and reserved conformance-test IDs.
- Machine-readable register for all eleven PRD Open Decisions.
- Phase 0 contradiction audit and an external-review packet retained as optional historical review material.

### Verified

- Initial contract TDD: RED 5 failures -> GREEN 5/5.
- Traceability/parser TDD: RED 3 failures plus completeness-gate RED -> GREEN 3/3.
- Semantics TDD: RED 3 failures -> GREEN 3/3.
- Remote PRD reconstruction equals the uploaded 52,982-byte source and SHA-256 exactly.

## 2026-10-08 — Product-owner Phase 0 gate amendment

### Changed

- Added PRD Amendment 0001 recording removal of the unavailable five-external-reviewer prerequisite while retaining contradiction-free semantics.
- Added explicit amendment precedence without modifying preserved PRD source fragments.
- Added machine phase state, synchronized governance/handoff records, and opened Phase 1.

### TDD evidence

- Governance transition: RED 3/3 before amendment/precedence/phase-state artifacts; GREEN 3/3 after synchronized implementation.
- Preserved source SHA remains `b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`.

## 2026-10-08 — Phase 1 parser/source-map slice 1

### Added

- Lossless top-level component section parser, compiler entrypoint, and ECMA-426 version-3 identity line-start source-map primitive.
- Stable duplicate-script/unclosed-section diagnostics, ADR-0004, machine front-end state, Phase 1 validator, and eight executable tests.

### TDD evidence

- Initial RED: compiler entry modules absent.
- First GREEN: 5/5.
- Nested-section regression RED: 5 passed / 1 failed.
- Regression GREEN plus Unicode/fixture coverage: 8/8 under Node `v22.16.0`.

## 2026-10-08 — Phase 1 parser structural validation slice

### Added

- Flat typed `TemplateSyntaxTree` with exact-span element, attribute/directive, interpolation/raw-HTML, and structural-block markers.
- Remaining Phase 0 reserved invalid-fixture diagnostics and documentation.
- Structural executable certification for all seven valid and all four invalid Phase 0 parser fixtures.

### TDD evidence

- RED: 8 passed / 3 failed.
- GREEN: 11 passed / 0 failed under Node `v22.16.0`.

## 2026-10-08 — Phase 1 hierarchical template AST slice

### Added

- `packages/compiler/src/template-ast.mjs`, a separate transformation from the certified flat stream into hierarchical ownership structures.
- Hierarchical `Template`, `Element`, `Text`, `Interpolation`, `RawHtml`, `IfBlock`, `EachBlock`, `AwaitBlock`, and `Branch` structures with exact spans.
- Element-owned metadata, categories, self-closing/void handling, literal text recovery, and template-only integration.
- `tests/phase1-parser-ast.test.mjs` with **four** focused hierarchy/ownership/integration cases.
- Wayfinder Phase 1 architecture map and decision tickets under GitHub issues 1–5.

### TDD evidence

- Regression RED: removing the transform produces `ERR_MODULE_NOT_FOUND`; exit 1.
- GREEN: **4/4** focused hierarchy/annotator tests pass under Node `v22.16.0`.

## 2026-10-08 — Embedded-language representation decision

### Added

- Primary-source embedded-language research and ADR-0005.
- Nomos-owned `EmbeddedScript`, `EmbeddedExpression`, and `EmbeddedStylesheet` wrapper contract; third-party parser objects remain opaque/internal.
- Machine state for resolved Wayfinder issue 2.

### Decision evidence

- TypeScript 7.0 has no programmatic API; Microsoft provides `@typescript/typescript6` during the transition.
- Lightning CSS exposes typed visitor structures/source-map input-output, while Nomos retains exact source-span authority.
- Verified baselines: `@typescript/typescript6@6.0.2` (Apache-2.0), `lightningcss@1.33.0` (MPL-2.0); dependencies remain uninstalled pending consuming code + fresh recheck.
- ADR-0005 does not resolve `OD-009`.

## 2026-10-08 — Generated source-map composition decision

### Added

- `docs/phase-1/research/source-map-composition.md` with ECMA-426, Vite/Rolldown, Rollup, and Parcel primary-source evidence.
- ADR-0006 establishing stage-local decoded mappings, explicit unmapped compiler scaffolding, ordered composition back to the original `.nomos` source, `sourcesContent`, and strict final map validation before Vite/Rolldown handoff.
- Machine-state records for resolved Wayfinder issue 3.

### Decision evidence

- ECMA-426 explicitly represents generated code with no original source using unmapped segments.
- Vite 8 custom-file transforms return code plus a source map when available and build on Rolldown's plugin interface.
- Rolldown validates source/name indices while ingesting maps, so malformed references are a build failure rather than a tolerable implementation detail.
- The contract chooses no source-map library and does not resolve `OD-003` or any other PRD Open Decision.

### Still in progress

- Executable embedded-language adapters, broader HTML tree-construction validation, the stage-local segment/composition implementation, and public `NCON-*` wiring remain open.
- `Parser and source maps` remains IN PROGRESS.
