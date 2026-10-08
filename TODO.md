# Nomos execution queue

**Last updated:** 2026-10-08  
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
  - [ ] Implement `EmbeddedScript` / `EmbeddedExpression` adapter using exact-pinned TypeScript compatibility API after fresh dependency recheck.
  - [ ] Implement `EmbeddedStylesheet` adapter using exact-pinned Lightning CSS after fresh dependency recheck.
  - [ ] Implement decoded segment maps + stage composition + final validation per ADR-0006.
  - [ ] Broaden HTML ownership checks beyond the certified paragraph auto-close case.
- [>] Public conformance infrastructure.
  - [x] ADR-0007 public `NCON-*` identity/environment/promotion contract.
  - [x] Public `conformance/` manifest, runner, validator, machine contract, and harness-core tests.
  - [x] Wire first public compiler test `NCON-NREQ-0145`.
  - [ ] Execute `NCON-NREQ-0145` against a complete checkout/CI evidence set; keep `NREQ-0145` planned until then.
  - [ ] Add real-browser environment profiles when the browser harness exists; never substitute unit-only DOM emulation.
- [ ] State, derivation, synchronization, and ownership.
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
- [ ] Issue 4 — runtime ownership/scheduler architecture.
- [x] Issue 5 — public conformance-harness promotion workflow → ADR-0007.

## Continuing controls

- [>] Requirement rows move from `planned` to `passing` only when their exact reserved public `NCON-*` test is green in every manifest-declared environment for the same evidence set.
- [>] Keep all eleven `spec/open-decisions.json` entries open until explicit ADR/RFC approval changes one.
- [>] Keep `docs/STATUS.md`, this queue, `CHANGELOG.md`, decision records, machine specs, Wayfinder map, and Handoff synchronized on every material change.
