# Nomos execution queue

**Last updated:** 2026-10-11  
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
  - [x] Exact decoded mapping validation, stage composition, unmapped-scaffolding preservation, and ECMA-426 encoding core.
  - [x] HTML ownership: 21 certified WHATWG scenarios spanning paragraph/list/button, major table insertion modes, and high-impact formatting/adoption-agency recovery.
  - [ ] Finish only remaining material active-formatting/special insertion-mode gaps; do not build a duplicate browser parser.
  - [x] `EmbeddedScript` plus symbol-aware `state` / `derive` / `state.raw` lowering with exact-pinned TypeScript compatibility API.
  - [x] TypeScript script source maps rebased to original `.nomos` coordinates and full `sourcesContent`.
  - [x] `EmbeddedExpression` text-interpolation slice using the same TypeScript 6 adapter; reactive reads use symbol identity and preserve lexical shadowing.
  - [x] Per-text-binding ECMA-426 mapping point from generated expression start to original `.nomos` expression-body start with full `sourcesContent`.
  - [ ] Expand template mappings as real DOM node/attribute code generation is added; current text-binding mapping is intentionally partial rather than token-complete.
  - [ ] `EmbeddedStylesheet` adapter using exact-pinned Lightning CSS.
- [>] State, derivation, synchronization, and ownership.
  - [x] ADR-0008 owner graph and scheduler architecture without new root concepts.
  - [x] Versioned scalar state cells and `Object.is` notification suppression.
  - [x] Deep reactive tracking for plain objects, arrays, `Map`, and `Set` using the same dependency graph.
  - [x] Property/index/membership/size/iteration precision with stable cycle-safe proxy identity.
  - [x] Runtime raw-state semantics plus source-level `state.raw` lowering.
  - [x] Lazy, memoized, dynamic-dependency derives with development derive-write guard.
  - [x] One microtask scheduler with DOM phase before sync phase and DOM reentry before remaining sync work.
  - [x] `sync()` mount gating, synchronous-read tracking, cleanup before rerun/disposal, and post-`await` tracking cutoff.
  - [x] Single owner tree with children-first disposal, reverse local cleanup, then owned DOM.
  - [x] `untrack()` and named non-terminating cycle diagnostics.
  - [!] `state.snapshot` conformance semantics/implementation remain blocked on the still-required behavior contract and must not silently resolve `OD-004`.
  - [x] Compiler script lowering for transparent source-level `state`, `derive`, and `state.raw` reads/writes, including assignment/compound assignment and prefix/postfix updates.
  - [x] Direct reactive-root `for...of` and `for...in` assignment targets through collision-safe temporaries and `write(...)`.
  - [ ] Remaining reactive destructuring assignment-target lowering when required by conformance fixtures.
  - [x] Internal owner-backed `bindText` runtime helper uses the existing DOM-observer phase and stops after owner disposal.
  - [ ] Owner-backed exclusive/shared request cancellation in the query slice.
- [>] Text and attribute bindings.
  - [x] Text interpolation expression lowering to `TextBinding` IR with collision-safe `bindText`/`read` helper aliases.
  - [x] TypeScript syntax diagnostics map invalid interpolation locations back to original `.nomos` source.
  - [x] Text binding runtime seam proven through ADR-0008 DOM scheduling and owner disposal.
  - [ ] Materialize static/interpolation text DOM nodes and wire generated node identifiers to the proven `TextBinding` IR.
  - [ ] Lower dynamic, mixed, shorthand, and spread attributes with mappings in the same generation pass.
- [>] Dependency-backed verification.
  - [x] `.github/workflows/ci.yml` pins Node `22.16.0`, pnpm `12.10.1`, and installs exact dependencies.
  - [x] Text-binding RED run `38120782593`: exact toolchain reached lowering; 14 existing tests passed and the new feature failed because `template-lowering.mjs` did not exist.
  - [x] Text-binding GREEN run `38120937878`: lowering/ABI/expression **16/16**, runtime **21/21**, Phase 1 validator green on the pre-sync 57-artifact state.
- [>] Public conformance infrastructure.
  - [x] ADR-0007 public `NCON-*` identity/environment/promotion contract.
  - [x] Public `conformance/` manifest, runner, validator, machine contract, and harness-core tests.
  - [x] Wire first public compiler test `NCON-NREQ-0145`.
  - [ ] Execute `NCON-NREQ-0145` against a complete required evidence set; keep `NREQ-0145` planned until then.
  - [ ] Add public Node conformance for runtime requirements only as complete contract slices become executable; avoid mechanically duplicating development tests.
  - [ ] Add real-browser environment profiles when the browser harness exists; never substitute unit-only DOM emulation.
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
- [>] Keep `.github/workflows/ci.yml`, `docs/STATUS.md`, this queue, `CHANGELOG.md`, decision records, machine specs, Wayfinder map, and Handoff synchronized on every material change.
