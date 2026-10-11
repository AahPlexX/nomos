# Nomos execution queue

**Last updated:** 2026-10-11  
**Binding scope:** `PRD.md` plus effective amendments  
**Current phase:** Phase 1 — Vertical Slice

Status keys: `[x]` verified complete, `[>]` in progress, `[ ]` not complete, `[!]` blocked.

## Phase 0 — COMPLETE

- [x] Grammar, parser corpus, whitespace/ownership fixtures, reactive contract, representative components, ADRs, learning levels/additivity, API budget, capability/learnability protocols, and 239-requirement traceability.
- [x] Phase 0 closed under PRD Amendment 0001; all eleven PRD Open Decisions remain explicit/open.

## Phase 1 — Vertical Slice

- [>] Parser and source maps.
  - [x] Lossless top-level sections, exact UTF-16 coordinates, flat syntax tree, hierarchical AST.
  - [x] Typed exact-span attribute IR for static, dynamic, mixed, shorthand, and spread forms; directives remain separate.
  - [x] Parser CI gate now runs on every main push; latest parser suite **66/66**.
  - [x] Same-span generic/specialized table ownership diagnostics deduplicated without weakening ownership checks.
  - [x] ECMA-426 decoded mapping/composition core and script/template mapping points.
  - [x] 21 certified WHATWG ownership scenarios.
  - [x] TypeScript-backed `EmbeddedScript` and `EmbeddedExpression` lowering.
  - [x] Browser-parsed static template DOM + live text interpolation.
  - [ ] Lower dynamic/mixed/shorthand/spread attributes from the typed IR.
  - [ ] Finish only material remaining active-formatting/special insertion-mode gaps.
  - [ ] Expand template maps as real attribute/event/block/component stages are added.
  - [ ] Implement `EmbeddedStylesheet` with exact-pinned Lightning CSS when executable CSS code consumes it.
- [>] State, derivation, synchronization, ownership.
  - [x] ADR-0008 graph/owner/scheduler; scalar/deep/raw state; derives; `untrack`; sync cleanup; cycle diagnostics.
  - [x] Script lowering for implemented state/derive reads/writes and direct reactive-root loop targets.
  - [x] Internal owner-backed `bindText` and `mountTemplate`.
  - [ ] Remaining reactive destructuring assignment targets when required by conformance fixtures.
  - [!] `state.snapshot` remains blocked on its explicit contract and `OD-004`.
  - [ ] Query request ownership/cancellation.
- [>] Text and attribute bindings.
  - [x] Text interpolation → `EmbeddedExpression` → `TextBinding` → real browser `Text` node.
  - [x] Typed attribute-value IR for all five ratified non-directive forms.
  - [>] Safe standard-HTML dynamic attribute assignment/lowering.
  - [ ] Publish/test built-in attribute/property assignment table before property-backed native-control expansion.
  - [!] Custom-element property/pre-upgrade behavior must not be guessed while `OD-008` is open.
- [>] Verification.
  - [x] CI pins Ubuntu 24.04, Node `22.16.0`, pnpm `12.10.1`, exact dependencies, and verifies Chrome.
  - [x] Browser-DOM RED `38122206062`; GREEN `38122323711`.
  - [x] Attribute-IR RED `38122824413` also exposed latent table diagnostic duplication.
  - [x] Attribute/table GREEN `38122979344`: parser **66/66**, DOM **3/3 + Chrome**, lowering **16/16**, runtime **21/21**, machine state green.
- [>] Public conformance infrastructure.
  - [x] ADR-0007 + manifest/runner/validator foundation; `NCON-NREQ-0145` wired.
  - [ ] Promote only under complete ADR-0007 evidence; passing requirement count remains zero.
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

Issues 2–5 are resolved into ADR-0005/0006/0008/0007 respectively. No Wayfinder architecture decision remains open.

## Continuing controls

- [>] `planned` → `passing` only through exact reserved `NCON-*` evidence in every manifest-declared environment.
- [>] Keep all eleven `spec/open-decisions.json` entries open until explicit ADR/RFC approval changes one.
- [>] Prefer lean contract-level TDD and platform/real dependencies when they remove duplicated work without changing semantics.
- [>] Keep CI, STATUS, TODO, CHANGELOG, machine specs, decision records, and Handoff synchronized on every material change.
