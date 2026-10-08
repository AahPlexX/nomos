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
