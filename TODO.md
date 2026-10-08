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
  - Runtime/compiler rows remain `planned` until their owning public conformance IDs provide executable evidence; this does not reopen Phase 0.

## Phase 0 exit gate — CLOSED

- [x] External-review prerequisite removed by product owner in `docs/prd/amendments/0001-remove-phase0-external-review-gate.md`.
- [x] Conformance drafts reveal no known contradictory semantics.
  - [x] Internal contradiction audit completed; one provisional-status ambiguity (`state.snapshot`) fixed.
  - [x] All eleven PRD Open Decisions remain explicitly unresolved rather than silently chosen.
- [x] Original PRD source remains byte-for-byte preserved; amendment precedence is explicit in `PRD.md`.
- [x] Machine phase state records Phase 0 complete and Phase 1 allowed.

## Phase 1 — Vertical Slice

- [>] Establish Phase 1 implementation architecture and deterministic conformance harness from the Phase 0 contracts.
- [>] Parser and source maps.
  - [x] Lossless top-level section partitioning with arbitrary section order.
  - [x] Exact raw UTF-16 offsets and one-based diagnostic line/column positions, including CRLF handling.
  - [x] Reject a second top-level script with `NOMOS-PARSE-DUPLICATE-SCRIPT`.
  - [x] Reject unclosed top-level script/style sections with `NOMOS-PARSE-UNCLOSED-SECTION`.
  - [x] Ignore script/style-like markup nested inside element or structural-block ownership when identifying component sections.
  - [x] ECMA-426 version-3 identity line-start source-map primitive with embedded `sourcesContent`.
  - [x] ADR-0004 and `spec/compiler-front-end.json` define the coordinate/map contract for continuation.
  - [ ] Parse template nodes, attributes, directives, interpolation, and structural blocks into the typed internal AST.
  - [ ] Implement `NOMOS-PARSE-HTML-OWNERSHIP` against the Phase 0 adversarial fixture.
  - [ ] Implement `NOMOS-PARSE-UNTERMINATED-BLOCK` against the Phase 0 adversarial fixture.
  - [ ] Implement `NOMOS-PARSE-UNKNOWN-DIRECTIVE` against the Phase 0 adversarial fixture.
  - [ ] Parse embedded TypeScript and CSS into typed/structured compiler representations.
  - [ ] Compose token-level generated-code source maps rather than only pass-through line-start mappings.
  - [ ] Certify all seven valid and four invalid Phase 0 parser fixtures against the executable parser.
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

- [>] Promote each `spec/requirements.json` row from `planned` to `passing` only when its exact public `NCON-*` conformance ID is wired and green. Development tests alone do not promote a row.
- [>] Keep all eleven `spec/open-decisions.json` items open until an explicit ADR/RFC resolution is approved.
- [>] Keep `docs/STATUS.md`, this queue, `CHANGELOG.md`, decision records, and affected specs synchronized on every material change.
