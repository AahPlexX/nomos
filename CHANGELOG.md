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
- Phase 0 contradiction audit and an external-review packet that is now retained as optional historical review material.

### Verified

- Initial contract TDD: RED 5 failures -> GREEN 5/5.
- Traceability/parser TDD: RED 3 failures plus completeness-gate RED -> GREEN 3/3.
- Semantics TDD: RED 3 failures -> GREEN 3/3.
- Remote PRD reconstruction after the boundary-byte repair equals the uploaded 52,982-byte source and SHA-256 exactly.

## 2026-10-08 — Product-owner Phase 0 gate amendment

### Changed

- Added `docs/prd/amendments/0001-remove-phase0-external-review-gate.md` to record the owner's explicit instruction to disregard the unavailable five-external-reviewer requirement.
- Updated `PRD.md` so preserved source remains immutable provenance while explicit numbered amendments take precedence only within their stated scope.
- Retained the Phase 0 requirement that conformance drafts reveal no contradictory semantics.
- Reclassified `docs/phase-0/EXTERNAL-REVIEW-PACKET.md` as optional historical material rather than a blocking gate.
- Added `spec/phase-status.json` as machine-readable phase authority and opened Phase 1.
- Updated governance, continuation instructions, status, decisions, TODO, README, contradiction audit, validation tooling, and tests to prevent a future agent from reintroducing the superseded gate.

### TDD evidence

- Governance transition test: RED 3/3 before the amendment, manifest-precedence rule, and phase-state record existed.
- Governance transition test: GREEN 3/3 after the synchronized implementation.
- Preserved source re-hash remains `b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`.

### Current state

- Phase 0 is complete under the effective amended PRD.
- Phase 1 — Vertical Slice is active.
- Runtime/compiler conformance rows remain `planned` until executable evidence lands in their owning phases.

## 2026-10-08 — Phase 1 parser/source-map slice 1

### Added

- `packages/compiler/src/parser.mjs` lossless top-level component section parser.
- `packages/compiler/src/source-map.mjs` ECMA-426 version-3 identity line-start source-map primitive.
- `packages/compiler/src/index.mjs` compiler-front-end entrypoint for the current slice.
- Stable duplicate-script and unclosed-section diagnostics with dedicated documentation.
- ADR-0004 defining raw UTF-16 source positions, CRLF handling, diagnostic coordinates, and source-map conventions.
- `spec/compiler-front-end.json` machine-readable parser/source-map implementation state.
- `tools/validate-phase1.mjs` and package scripts for the active Phase 1 artifact gate.
- `tests/phase1-parser.test.mjs` with eight executable parser/source-map cases, including the preserved Phase 0 duplicate-script fixture.

### TDD evidence

- Initial parser test RED: compiler entry modules absent.
- First GREEN: 5/5 tests after section parser/source-map baseline implementation.
- Regression RED: nested script/style content was incorrectly classified as a component section (5 passed / 1 failed).
- Regression GREEN plus Unicode/fixture coverage: 8/8 passed under Node `v22.16.0`.

### Still in progress

- Typed template AST, HTML ownership validation, structural-block termination, directive validation, embedded TypeScript/CSS structures, full Phase 0 parser-corpus certification, and token-level generated-code source-map composition remain required before `Parser and source maps` can be marked complete.
- `NREQ-0145` / `NREQ-0150` remain `planned` until their exact public `NCON-*` conformance IDs are wired; development tests do not silently promote traceability rows.

## 2026-10-08 — Phase 1 parser structural validation slice

### Added

- Flat typed `TemplateSyntaxTree` nodes for element opens/closes, attributes/directives, interpolation/raw HTML, and structural block markers with exact source spans.
- `NOMOS-PARSE-HTML-OWNERSHIP`, `NOMOS-PARSE-UNTERMINATED-BLOCK`, and `NOMOS-PARSE-UNKNOWN-DIRECTIVE` implementations and diagnostic documentation.
- Structural executable certification for all seven valid and all four invalid Phase 0 parser fixtures.
- Machine-state updates that distinguish the certified structural layer from the still-planned hierarchical typed AST and generated-code mapping work.

### TDD evidence

- RED before implementation: 8 passed / 3 failed.
- GREEN after implementation: 11 passed / 0 failed under Node `v22.16.0`.

### Still in progress

- Final hierarchical typed template AST, embedded TypeScript/CSS structures, broader HTML tree-construction validation, token-level source-map composition, and public `NCON-*` wiring remain open.

## 2026-10-08 — Phase 1 hierarchical template AST slice

### Added

- `packages/compiler/src/template-ast.mjs`, a separate transform from the certified flat syntax stream into hierarchical template ownership structures.
- Hierarchical `Template`, `Element`, `Text`, `Interpolation`, `RawHtml`, `IfBlock`, `EachBlock`, `AwaitBlock`, and `Branch` structures while preserving exact source spans.
- Element-owned attribute/directive metadata, component/custom-element categories, self-closing/void handling, and recovered literal text nodes.
- `tests/phase1-parser-ast.test.mjs` with three focused hierarchy/ownership cases.
- Wayfinder Phase 1 architecture map and decision tickets under GitHub issues 1–5; unresolved architecture is now explicit instead of implicit in continuation prose.

### TDD evidence

- Hierarchical AST regression RED: removing the new transform produces `ERR_MODULE_NOT_FOUND` and test exit 1.
- Hierarchical AST GREEN: 3/3 focused hierarchy tests pass under Node `v22.16.0`.
- Existing flat structural syntax remains a separate input layer; the hierarchy transform does not rewrite the certified scanner/structural analyzer.

### Still in progress

- Embedded TypeScript/CSS typed structures, broader HTML tree-construction validation, token/segment source-map composition, and exact public `NCON-*` wiring remain open.
- `Parser and source maps` remains IN PROGRESS.

