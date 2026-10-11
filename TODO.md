# Nomos execution queue

**Last updated:** 2026-10-10  
**Binding scope:** `PRD.md` plus effective amendments  
**Current phase:** Phase 1 — Vertical Slice

Status keys: `[x]` verified complete, `[>]` in progress, `[ ]` not complete, `[!]` blocked.

## Phase 0 — COMPLETE

- [x] Grammar, parser corpus, whitespace/ownership fixtures, reactive contract, 10 representative components, ADRs, learning levels/additivity, API budget, capability gauntlet, learnability protocol, and 239-requirement traceability infrastructure.
- [x] Phase 0 exit gate closed under PRD Amendment 0001 with contradiction-free semantics retained and all eleven PRD Open Decisions still explicit/open.

## Phase 1 — Vertical Slice

- [>] Parser and source maps.
  - [x] Lossless top-level sections and exact UTF-16 source coordinates.
  - [x] Stable structural diagnostics and full Phase 0 structural parser-corpus certification.
  - [x] Flat `TemplateSyntaxTree` and hierarchical template AST with exact spans/ownership.
  - [x] ADR-0004 ECMA-426 coordinate/map baseline and identity pass-through map.
  - [x] ADR-0005 embedded-language representation boundary.
  - [x] ADR-0006 stage-local source-map composition contract.
  - [x] Exact decoded mapping validation, stage composition, unmapped scaffolding preservation, and ECMA-426 encoding core.
  - [x] HTML ownership: 21 certified WHATWG scenarios spanning paragraph/list/button, major table insertion modes, and high-impact formatting/adoption-agency recovery.
  - [ ] Finish only remaining material active-formatting/special insertion-mode gaps; do not build a duplicate browser parser.
  - [ ] Produce token/segment mappings from real lowering/code-generation stages and compose them through the source-map core.
  - [ ] Implement `EmbeddedScript` / `EmbeddedExpression` adapter using exact-pinned TypeScript compatibility API.
  - [ ] Implement `EmbeddedStylesheet` adapter using exact-pinned Lightning CSS.
- [>] State, derivation, synchronization, and ownership.
  - [x] ADR-0008 resolves the owner graph and scheduler architecture without adding root concepts.
  - [x] Versioned scalar state cells and `Object.is` notification suppression.
  - [x] Deep reactive tracking for plain objects, arrays, `Map`, and `Set` using the same dependency graph.
  - [x] Property/index/membership/size/iteration dependency precision with stable cycle-safe proxy identity.
  - [x] Runtime raw-state semantics using the same cell model; source-level `state.raw` still requires compiler lowering.
  - [x] Lazy, memoized, dynamic-dependency derived nodes with development derive-write guard.
  - [x] One microtask scheduler with DOM phase before sync phase and DOM reentry before remaining sync work.
  - [x] `sync()` mount gating, synchronous-read tracking, cleanup before rerun/disposal, and post-`await` tracking cutoff.
  - [x] Single owner tree with children-first disposal, reverse local cleanup, then owned DOM.
  - [x] `untrack()` and named non-terminating cycle diagnostics.
  - [!] `state.snapshot` conformance semantics/implementation remain blocked on the still-required behavior contract and must not silently resolve `OD-004`.
  - [ ] Compiler lowering for transparent source-level `state`, `derive`, and `state.raw` reads/writes.
  - [ ] Generated DOM binding integration with the DOM observer phase.
  - [ ] Owner-backed exclusive/shared request cancellation in the query slice.
- [>] Public conformance infrastructure.
  - [x] ADR-0007 public `NCON-*` identity/environment/promotion contract.
  - [x] Public `conformance/` manifest, runner, validator, machine contract, and harness-core tests.
  - [x] Wire first public compiler test `NCON-NREQ-0145`.
  - [ ] Execute `NCON-NREQ-0145` against a complete checkout/CI evidence set; keep `NREQ-0145` planned until then.
  - [ ] Add public Node conformance for runtime requirements as their complete contract slices become executable; avoid mechanically duplicating development tests.
  - [ ] Add real-browser environment profiles when the browser harness exists; never substitute unit-only DOM emulation.
- [ ] Text and attribute bindings.
- [ ] Events and native-control bindings.
- [ ] Conditions and keyed lists.
- [ ] Components and live inputs.
- [ ] Scoped CSS.
- [ ] Vite integration and HMR.
- [ ] Levels 0–3 integrated end-to-end.
- [ ] TodoMVC-class deterministic browser exit application.
- [ ] Compatible HMR preserves valid state.
- [ ] Every owned effect proven to clean up.

**Phase 1 exit:** TodoMVC-class application passes deterministic browser tests, preserves valid state through HMR, and cleans up every owned effect.

## Wayfinder

Map: https://github.com/AahPlexX/nomos/issues/1

- [x] Issue 2 — embedded TypeScript/CSS boundary → ADR-0005.
- [x] Issue 3 — generated source-map composition → ADR-0006.
- [x] Issue 4 — runtime ownership/scheduler architecture → ADR-0008.
- [x] Issue 5 — public conformance-harness promotion workflow → ADR-0007.

No Wayfinder architecture decision ticket remains open.

## Continuing controls

- [>] Requirement rows move from `planned` to `passing` only when their exact reserved public `NCON-*` test is green in every manifest-declared environment for the same evidence set.
- [>] Keep all eleven `spec/open-decisions.json` entries open until explicit ADR/RFC approval changes one.
- [>] Prefer lean contract-level TDD and real dependencies where they remove substantial duplicated work without changing Nomos semantics.
- [>] Keep `docs/STATUS.md`, this queue, `CHANGELOG.md`, decision records, machine specs, Wayfinder map, and Handoff synchronized on every material change.
