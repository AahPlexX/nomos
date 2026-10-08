# Changelog

All material repository changes are recorded here. This file tracks project state, not semantic-version release notes yet.

## 2026-10-08 — Phase 0 thesis slice

### Added

- Lossless repository preservation of the user-supplied PRD through a SHA-256 manifest plus four verbatim ordered source fragments.
- Repository continuation protocol and interim governance.
- Phase 0 project status and ordered TODO ledger.
- Formal `.nomos` EBNF contract draft.
- Machine-readable root runtime API budget and additive learning levels.
- Ten representative `.nomos` fixtures spanning learning levels 0–7.
- No-dependency Node contract tests for API budget, level additivity, grammar coverage, and representative-fixture presence.
- Reactive contract, capability-gauntlet specification, learnability-study protocol, and initial ADR records.
- Normative traceability ledger for 239 PRD obligations with stable requirement/test IDs and owning phases.
- Deterministic normative extraction checker that fails on ledger omission or drift.
- Parser contract corpus with seven valid and four invalid/adversarial `.nomos` fixtures.

### Verified

- Test-first red state: five Phase 0 contract tests failed before required artifacts existed.
- Green state after initial implementation: five passed, zero failed.
- Traceability RED: three tests failed before `spec/requirements.json` and parser corpus existed.
- Completeness-gate RED: traceability suite failed when the independent normative extractor was absent.
- Traceability GREEN: three tests pass after the 239-row ledger, extractor, and parser corpus were added.
- Remote PRD reconstruction after the boundary-byte repair equals the uploaded 52,982-byte source and SHA-256 exactly.
- Current Vite/TypeScript/Volar/pnpm registry baseline and selected official web-platform/accessibility constraints rechecked on 2026-10-08.

### Not complete

- Phase 0 exit gate, whitespace behavior fixture, contradiction review, and five-reviewer external review remain open. Runtime/compiler conformance rows remain `planned`.
