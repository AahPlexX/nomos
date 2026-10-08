# Nomos execution queue

**Last updated:** 2026-10-08  
**Binding scope:** `PRD.md` plus effective amendments  
**Current phase:** Phase 1 — Vertical Slice

Status keys: `[x]` verified complete, `[>]` in progress, `[ ]` not complete, `[!]` blocked by an explicit decision/gate.

## Phase 0 — Thesis

- [x] Formal component grammar, valid/invalid parser corpus, and whitespace/HTML-ownership fixtures.
- [x] One-page reactive contract.
- [x] Ten representative `.nomos` components.
- [x] Architecture decision records required by current Phase 0 decisions.
- [x] Learning-level definitions and additivity test.
- [x] Public root API budget test (`<= 12`; proposed root currently 10).
- [x] Capability-gauntlet specification.
- [x] Learnability-study protocol.
- [x] Normative requirement extraction and traceability infrastructure for all 239 uppercase `MUST` / `MUST NOT` operators.
  - Runtime/compiler rows remain `planned` until their owning implementation phases provide executable conformance evidence; this does not reopen Phase 0.

## Phase 0 exit gate — CLOSED

- [x] External-review prerequisite removed by product owner in `docs/prd/amendments/0001-remove-phase0-external-review-gate.md`.
- [x] Conformance drafts reveal no known contradictory semantics.
  - [x] Internal contradiction audit completed; one provisional-status ambiguity (`state.snapshot`) fixed.
  - [x] All eleven PRD Open Decisions remain explicitly unresolved rather than silently chosen.
- [x] Original PRD source remains byte-for-byte preserved; amendment precedence is explicit in `PRD.md`.
- [x] Machine phase state records Phase 0 complete and Phase 1 allowed.

## Phase 1 — Vertical Slice

- [>] Establish Phase 1 implementation architecture and deterministic conformance harness from the Phase 0 contracts.
- [ ] Parser and source maps.
- [ ] State, derivation, synchronization, and ownership.
- [ ] Text and attribute bindings.
- [ ] Events and native-control bindings.
- [ ] Conditions and keyed lists.
- [ ] Components and live inputs.
- [ ] Scoped CSS.
- [ ] Vite integration and HMR.
- [ ] Levels 0 through 3 integrated end-to-end.
- [ ] TodoMVC-class reference application passes deterministic browser tests.
- [ ] HMR preserves valid state across compatible updates.
- [ ] Every owned effect is proven to clean up on disposal.

**Phase 1 exit criterion:** the TodoMVC-class application passes deterministic browser tests, preserves valid state through HMR, and cleans up every owned effect.

## Continuing controls

- [>] Promote each `spec/requirements.json` row from `planned` to `passing` only when its executable conformance evidence lands.
- [>] Keep all eleven `spec/open-decisions.json` items open until an explicit ADR/RFC resolution is approved.
- [>] Keep `docs/STATUS.md`, this queue, `CHANGELOG.md`, decision records, and affected specs synchronized on every material change.
