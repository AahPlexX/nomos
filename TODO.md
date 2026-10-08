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

## Phase 0 exit gate — CLOSED

- [x] External-review prerequisite removed by product owner in PRD Amendment 0001.
- [x] Conformance drafts reveal no known contradictory semantics.
- [x] All eleven PRD Open Decisions remain explicitly unresolved.
- [x] Original PRD source remains byte-for-byte preserved.
- [x] Machine phase state records Phase 0 complete and Phase 1 allowed.

## Phase 1 — Vertical Slice

- [>] Establish Phase 1 implementation architecture and deterministic conformance harness from the Phase 0 contracts.
- [>] Parser and source maps.
  - [x] Lossless top-level section partitioning with arbitrary section order.
  - [x] Exact raw UTF-16 offsets and one-based diagnostic line/column positions, including CRLF handling.
  - [x] Duplicate-script and unclosed-section diagnostics.
  - [x] Ignore nested script/style-like markup when identifying component sections.
  - [x] ECMA-426 version-3 identity line-start source-map primitive with `sourcesContent`.
  - [x] ADR-0004 coordinate/map contract.
  - [x] Flat structural `TemplateSyntaxTree` with exact spans.
  - [x] Hierarchical template AST with parent/child ownership, text recovery, element-owned metadata, structural branches, categories, and exact spans.
  - [x] Phase 0 parser-corpus structural certification (7 valid / 4 invalid).
  - [x] Resolve embedded TypeScript/CSS representation boundary through Wayfinder research and ADR-0005.
  - [ ] Implement `EmbeddedScript` and `EmbeddedExpression` adapters using the exact-pinned TypeScript compatibility API after dependency recheck.
  - [ ] Implement `EmbeddedStylesheet` adapter using exact-pinned Lightning CSS after dependency recheck.
  - [ ] Broaden HTML tree-construction ownership validation beyond the paragraph auto-close fixture.
  - [ ] Compose token/segment generated-code source maps rather than only pass-through line-start mappings.
  - [ ] Wire exact public `NCON-*` parser/source-map conformance tests before promoting requirement rows.
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

## Wayfinder control plane

- [>] Canonical Phase 1 decision map: https://github.com/AahPlexX/nomos/issues/1
  - [x] Embedded TypeScript/CSS representation boundary: https://github.com/AahPlexX/nomos/issues/2 → ADR-0005.
  - [ ] Generated source-map composition contract: https://github.com/AahPlexX/nomos/issues/3
  - [ ] Runtime ownership/scheduler architecture: https://github.com/AahPlexX/nomos/issues/4
  - [ ] Public conformance-harness promotion workflow: https://github.com/AahPlexX/nomos/issues/5

Already-ratified bounded implementation may continue without reopening closed decisions. Unresolved architecture must not be selected silently in code.

## Continuing controls

- [>] Promote each `spec/requirements.json` row from `planned` to `passing` only when its exact public `NCON-*` conformance ID is wired and green.
- [>] Keep all eleven `spec/open-decisions.json` items open until an explicit ADR/RFC resolution is approved.
- [>] Keep `docs/STATUS.md`, this queue, `CHANGELOG.md`, decision records, affected specs, Wayfinder map, and Handoff pointer synchronized on every material change.
