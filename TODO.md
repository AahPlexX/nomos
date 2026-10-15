# Nomos execution queue

**Last updated:** 2026-10-14  
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
  - [x] Parser CI gate verified **66/66**.
  - [x] Same-span generic/specialized table ownership diagnostics deduplicated without weakening ownership checks.
  - [x] ECMA-426 decoded mapping/composition core and script/template/text/attribute/spread mapping points.
  - [x] 21 certified WHATWG ownership scenarios.
  - [x] TypeScript-backed `EmbeddedScript` and `EmbeddedExpression` lowering.
  - [x] Browser-parsed static template DOM + live text interpolation.
  - [x] Lower all four required standard-HTML runtime attribute forms from typed IR: dynamic, mixed, shorthand, spread.
  - [x] Publish/test the built-in standard-HTML property-assignment table and type-sensitive native-control seams without changing existing attribute mutation semantics.
  - [>] Wire dynamic URL safety end-to-end.
    - [x] Runtime scheme-classification core refuses normalized `javascript:` values for the initial guarded single-URL attribute set and validates spread plans before DOM mutation.
    - [x] Safe URL-valued spread entries are no longer rejected solely by attribute name.
    - [ ] Remove the compiler guard for statically named expression-derived URL attributes and route those bindings through the same runtime validator.
    - [ ] Audit/cover remaining HTML URL-bearing list/token grammars (for example `ping` and responsive-image candidate attributes) before marking the PRD-wide URL requirement complete.
  - [ ] Finish only material remaining active-formatting/special insertion-mode gaps.
  - [ ] Implement `EmbeddedStylesheet` with exact-pinned Lightning CSS when executable CSS code consumes it.
- [>] State, derivation, synchronization, ownership.
  - [x] ADR-0008 graph/owner/scheduler; scalar/deep/raw state; derives; `untrack`; sync cleanup; cycle diagnostics.
  - [x] Script lowering for implemented state/derive reads/writes and direct reactive-root loop targets.
  - [x] Internal owner-backed `bindText`, `bindAttribute`, grouped `bindAttributes`, and `mountTemplate`.
  - [ ] Remaining reactive destructuring assignment targets when required by conformance fixtures.
  - [!] `state.snapshot` remains blocked on its explicit contract and `OD-004`.
  - [ ] Query request ownership/cancellation.
- [>] Text and attribute bindings.
  - [x] Text interpolation → `EmbeddedExpression` → `TextBinding` → real browser `Text` node.
  - [x] Typed attribute-value IR for all five ratified non-directive forms.
  - [x] Dynamic `name={expr}` standard-HTML assignment.
  - [x] Mixed `name="text {expr}"` standard-HTML assignment.
  - [x] Shorthand `{identifier}` standard-HTML assignment.
  - [x] Spread `{...expr}` assignment with authored-left-to-right precedence; later entries win.
  - [x] Spread consumes enumerable own string keys; nullish spread sources are no-ops.
  - [x] When spread keys disappear, earlier source-order fallbacks are restored and stale keys are removed.
  - [x] Runtime spread validation blocks `on*` before DOM mutation and routes the initial URL-bearing set through value-level scheme safety.
  - [x] Ordinary content attributes remove on nullish values and otherwise stringify; certified boolean attributes use presence/absence.
  - [x] Built-in property table covers current-state `value`, `checked`, `files`, `selected`, `muted`, and reflected `open` seams, including HTML input `type`-specific value modes.
  - [x] Runtime URL scheme safety rejects `javascript:` after WHATWG URL normalization for `action`, `cite`, `formaction`, `href`, `poster`, and `src` without rejecting safe values containing a misleading `javascript:` substring.
  - [!] Dynamic custom-element assignment remains guarded while `OD-008` is open.
  - [>] Complete compiler enablement and full HTML URL-bearing grammar coverage for dynamic URL protocol safety.
  - [ ] Activate property-backed authored/native-control assignment only through the published table with explicit cleanup/two-way semantics.
- [>] Verification.
  - [x] CI pins Ubuntu 24.04, Node `22.16.0`, pnpm `12.10.1`, exact dependencies, and verifies Chrome.
  - [x] Spread behavioral RED `38637069602`: parser/previous browser path green; grouped spread runtime/lowering absent as intended.
  - [x] Spread implementation GREEN `38638143259`: parser **66/66**, focused DOM **11/11 + Chrome/Trusted Types**, lowering **16/16**, runtime **26/26**.
  - [x] Property-table focused TDD: RED on missing exports, then **5/5** green on Node `22.16.0`.
  - [x] URL-safety core TDD: RED on missing validator export; focused helper **2/2** green locally on Node `22.16.0`; repository run `38662076485` then passed parser, DOM/Trusted Types, lowering, runtime, and machine-state gates with URL runtime tests included.
  - [x] Synchronized URL-safety checkpoint `38662666873`: expanded DOM-slice gate includes `tests/phase1-runtime-url-safety.test.mjs`; parser, DOM/Trusted Types, lowering, runtime, and Phase-1 machine-state validation all passed.
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
