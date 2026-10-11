# Nomos execution queue

**Last updated:** 2026-10-11  
**Binding scope:** `PRD.md` plus effective amendments  
**Current phase:** Phase 1 — Vertical Slice

Status keys: `[x]` verified complete, `[>]` in progress, `[ ]` not complete, `[!]` blocked.

## Phase 0 — COMPLETE

- [x] Grammar, parser corpus, whitespace/ownership fixtures, reactive contract, 10 representative components, ADRs, learning levels/additivity, API budget, capability gauntlet, learnability protocol, and 239-requirement traceability infrastructure.
- [x] Phase 0 exit gate closed under PRD Amendment 0001 with contradiction-free semantics retained and all eleven PRD Open Decisions explicit/open.

## Phase 1 — Vertical Slice

- [>] Parser and source maps.
  - [x] Lossless top-level sections and exact UTF-16 source coordinates.
  - [x] Stable structural diagnostics and Phase 0 structural parser-corpus certification.
  - [x] Flat `TemplateSyntaxTree` and hierarchical template AST with exact spans/ownership.
  - [x] ADR-0004 ECMA-426 baseline, ADR-0005 embedded-language boundary, and ADR-0006 stage-local map composition.
  - [x] Exact decoded mapping validation/composition, unmapped-scaffolding preservation, and version-3 encoding.
  - [x] HTML ownership: 21 certified WHATWG scenarios without attempting a duplicate browser parser.
  - [ ] Finish only remaining material active-formatting/special insertion-mode gaps.
  - [x] `EmbeddedScript` + symbol-aware `state` / `derive` / `state.raw` lowering with exact-pinned TypeScript 6.
  - [x] TypeScript script source maps rebased to original `.nomos` coordinates and full `sourcesContent`.
  - [x] `EmbeddedExpression` text-interpolation lowering using the same TypeScript adapter.
  - [x] Browser-parsed static template DOM materialization with deterministic text markers and combined template mapping points.
  - [ ] Promote template attributes to typed exact-span IR and lower dynamic/mixed/shorthand/spread forms.
  - [ ] Expand template maps toward token-level coverage as each real lowering stage is added.
  - [ ] `EmbeddedStylesheet` adapter using exact-pinned Lightning CSS.
- [>] State, derivation, synchronization, and ownership.
  - [x] ADR-0008 owner graph and one DOM-before-sync microtask scheduler.
  - [x] Scalar/deep/raw state, stable cycle-safe proxies, lazy derives, dynamic dependencies, `untrack`, sync cleanup, and named cycle diagnostics.
  - [x] Compiler script lowering for transparent reads/writes, prefix/postfix, and direct reactive-root `for...of` / `for...in` targets.
  - [ ] Remaining reactive destructuring assignment-target lowering when required by conformance fixtures.
  - [x] Internal owner-backed `bindText` uses the existing DOM-observer phase.
  - [x] Internal `mountTemplate` parses static HTML through `HTMLTemplateElement`, exposes text binding slots, and owns/removes cloned roots.
  - [x] Trusted Types-enforced browser execution uses the existing required `nomos` policy name contract.
  - [!] `state.snapshot` remains blocked on its explicit contract and must not silently resolve `OD-004`.
  - [ ] Owner-backed exclusive/shared request cancellation in the query slice.
- [>] Text and attribute bindings.
  - [x] Text interpolation → `EmbeddedExpression` → `TextBinding` IR with TypeScript syntax diagnostics and reactive symbol-aware reads.
  - [x] Static HTML + interpolation text nodes materialize in a real browser; entities/namespaces remain browser-owned.
  - [x] Text updates and owner disposal are wired end-to-end.
  - [ ] Typed attribute-value IR for static/dynamic/mixed/shorthand/spread forms.
  - [ ] Safe standard-HTML dynamic attribute lowering and published attribute/property assignment table.
  - [!] Custom-element property/pre-upgrade behavior must not be guessed while `OD-008` is open.
- [>] Dependency/browser verification.
  - [x] CI pins Ubuntu 24.04, Node `22.16.0`, pnpm `12.10.1`, and exact dependencies.
  - [x] Text-binding RED `38120782593`; GREEN `38120937878` with lowering **16/16** and runtime **21/21**.
  - [x] Browser-DOM RED `38122206062`: unit/browser gates reached the intended missing `lowerTemplateDom` / `mountTemplate` seam.
  - [x] Browser-DOM GREEN `38122323711`: focused DOM **3/3**, Chrome `154.0.8037.97` under Trusted Types enforcement, existing lowering **16/16**, runtime **21/21**, machine validator green.
- [>] Public conformance infrastructure.
  - [x] ADR-0007 public `NCON-*` identity/environment/promotion contract and conformance harness foundation.
  - [x] Wire first public compiler test `NCON-NREQ-0145`.
  - [ ] Execute/promote `NCON-NREQ-0145` only under the complete ADR-0007 evidence set; keep `NREQ-0145` planned meanwhile.
  - [ ] Add real-browser public environment profiles only at complete requirement boundaries; development browser tests are not automatic normative evidence.
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
- [x] Issue 4 — runtime ownership/scheduler → ADR-0008.
- [x] Issue 5 — public conformance promotion → ADR-0007.

No Wayfinder architecture ticket remains open.

## Continuing controls

- [>] Requirement rows move from `planned` to `passing` only when their exact reserved public `NCON-*` test is green in every declared environment for the same evidence set.
- [>] Keep all eleven `spec/open-decisions.json` entries open until explicit ADR/RFC approval changes one.
- [>] Prefer lean contract-level TDD and platform/real dependencies when they remove duplicated work without changing Nomos semantics.
- [>] Keep CI, STATUS, TODO, CHANGELOG, machine specs, decision records, and Handoff synchronized on every material change.
