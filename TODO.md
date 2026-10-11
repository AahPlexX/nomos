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
  - [x] Parser CI gate latest verified **66/66**.
  - [x] Same-span generic/specialized table ownership diagnostics deduplicated without weakening ownership checks.
  - [x] ECMA-426 decoded mapping/composition core and script/template/text/attribute mapping points.
  - [x] 21 certified WHATWG ownership scenarios.
  - [x] TypeScript-backed `EmbeddedScript` and `EmbeddedExpression` lowering.
  - [x] Browser-parsed static template DOM + live text interpolation.
  - [x] Lower standard-HTML dynamic, mixed, and shorthand attributes from typed IR with deterministic element slots.
  - [ ] Define/test/implement spread-attribute merge precedence to complete the fourth runtime attribute form.
  - [ ] Finish only material remaining active-formatting/special insertion-mode gaps.
  - [ ] Implement `EmbeddedStylesheet` with exact-pinned Lightning CSS when executable CSS code consumes it.
- [>] State, derivation, synchronization, ownership.
  - [x] ADR-0008 graph/owner/scheduler; scalar/deep/raw state; derives; `untrack`; sync cleanup; cycle diagnostics.
  - [x] Script lowering for implemented state/derive reads/writes and direct reactive-root loop targets.
  - [x] Internal owner-backed `bindText`, `bindAttribute`, and `mountTemplate`.
  - [ ] Remaining reactive destructuring assignment targets when required by conformance fixtures.
  - [!] `state.snapshot` remains blocked on its explicit contract and `OD-004`.
  - [ ] Query request ownership/cancellation.
- [>] Text and attribute bindings.
  - [x] Text interpolation → `EmbeddedExpression` → `TextBinding` → real browser `Text` node.
  - [x] Typed attribute-value IR for all five ratified non-directive forms.
  - [x] Dynamic `name={expr}` standard-HTML assignment.
  - [x] Mixed `name="text {expr}"` standard-HTML assignment.
  - [x] Shorthand `{identifier}` standard-HTML assignment.
  - [ ] Spread `{...expr}` assignment/merge semantics.
  - [x] Ordinary content attributes remove on nullish values and otherwise stringify; certified boolean attributes use presence/absence.
  - [!] Dynamic custom-element assignment remains guarded while `OD-008` is open.
  - [ ] Dynamic URL protocol validator before expression-derived URL-bearing attributes are enabled.
  - [ ] Publish/test built-in attribute/property assignment table before property-backed native-control expansion.
- [>] Verification.
  - [x] CI pins Ubuntu 24.04, Node `22.16.0`, pnpm `12.10.1`, exact dependencies, and verifies Chrome.
  - [x] Attribute-binding behavioral RED `38168546695`: parser/Chrome green, DOM focused units **3/7** because binding behavior was absent.
  - [x] Attribute-binding GREEN `38168894701`: parser **66/66**, DOM **7/7 + Chrome/Trusted Types**, lowering **16/16**, runtime **23/23**.
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
