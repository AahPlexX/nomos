# Changelog

All material repository changes are recorded here. This file tracks project state, not semantic-version release notes yet.

## 2026-10-08 — Phase 0 thesis slice

- Preserved the authoritative PRD byte-for-byte, established governance, grammar/reactive/learning contracts, 10 representative components, parser corpus, whitespace semantics, capability/learnability protocols, and 239-requirement traceability.
- Phase 0 contract, traceability, and semantics TDD reached green; preserved PRD SHA is `b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`.

## 2026-10-08 — Product-owner Phase 0 gate amendment

- PRD Amendment 0001 removed the unavailable five-external-reviewer prerequisite while retaining contradiction-free semantics and immutable source provenance.
- Phase 0 closed and Phase 1 opened with synchronized machine/handoff state.

## 2026-10-08 — Phase 1 parser/source-map foundations

- Added lossless component section parsing, exact UTF-16 positions, structural diagnostics, ECMA-426 identity mapping, full Phase 0 structural parser-corpus certification, and hierarchical template ownership AST.
- Parser development evidence reached 11/11 structural tests plus 4/4 focused hierarchy/annotator tests under Node `v22.16.0`.
- ADR-0004 established source positions/maps; ADR-0005 established embedded-language adapter boundaries; ADR-0006 established stage-local source-map composition.

## 2026-10-08 — Public conformance foundation

- Added ADR-0007, public `conformance/` manifest/runner/validator, machine state, four harness-core tests, and the first wired compiler test `NCON-NREQ-0145`.
- `NREQ-0145` remains `planned` until that exact public test executes green against a complete checkout/evidence set.

## 2026-10-09 — Source-map composition core

- Added strict decoded mapping validation, exact stage-to-stage composition, explicit unmapped scaffolding preservation, and ECMA-426 version-3 encoding with `sourcesContent`.
- TDD RED: composer exports absent. GREEN: 4/4 focused source-map tests under Node `v22.16.0`.
- Real lowering/code-generation stages still need to emit sufficient token/segment mappings.

## 2026-10-09 — Expanded HTML ownership validation

- Added WHATWG-aligned paragraph/list/definition-list/button ownership diagnostics and table foster-parenting checks.
- Added pure table rewrite rules plus compiler integration for implied `tbody`/`tr` wrappers and row/cell auto-close behavior.
- Machine-readable ownership coverage reached 11 certified rewrite scenarios.

## 2026-10-10 — Table section transitions and close-chain repair

- Added bare `col` → `colgroup`, caption/table-section/column-group transitions, row/section and cell/row/section close chains, caption replacement, and full synthetic-stack repair.
- Added focused section-transition, stack-repair, and public parser integration regression files.
- Machine-readable HTML ownership coverage increased from 11 to 18 certified scenarios.
- Focused transition + repair verification reached 9/9 under Node `v22.16.0`.

## 2026-10-10 — High-impact formatting/adoption-agency ownership validation

- Added pure formatting ownership rules and diagnostic integration for nested anchors, nested `nobr`, and misnested formatting end tags.
- Cached current WHATWG rationale in `docs/phase-1/research/html-formatting-ownership.md` and expanded the parser gate.
- Machine-readable HTML ownership coverage increased from 18 to 21 certified scenarios.
- Focused formatting rule + diagnostic verification reached 9/9 under Node `v22.16.0`.

## 2026-10-10 — Runtime ownership, scheduler, and reactive core

- ADR-0008 resolves Wayfinder issue #4 with one versioned fine-grained graph, one owner tree, lazy derives, and an ordered DOM-before-sync microtask scheduler.
- Added `packages/runtime/src/reactivity.mjs`, scalar cells, derives, dynamic dependencies, derive-write guards, `untrack()`, mount-gated DOM/sync observers, sync cleanup, deterministic owner disposal, and named cycle errors.
- Proper behavioral RED was established against a skeletal runtime; GREEN reached 10/10 focused runtime contract tests under Node `v22.16.0`.
- `spec/runtime-core.json` and the Phase 1 validator were added; no normative requirement row was promoted from development tests alone.

## 2026-10-10 — Deep reactive state and raw-state runtime semantics

### Added

- `packages/runtime/src/deep-state.mjs` isolates deep proxy/collection tracking from the ADR-0008 scheduler and owner core.
- Plain objects and arrays now track property/index/iteration dependencies; array length and truncation invalidate appropriate dependents.
- `Map` and `Set` now provide reactive membership, size, iteration, and mutation behavior for `set`/`add`, `delete`, and `clear`.
- Proxy identity is stable per state cell and cycle-safe.
- Class instances, dates, DOM nodes, typed arrays, promises, errors, functions, weak collections, and frozen objects remain reference-held.
- Runtime raw-state behavior uses the same state-cell ABI via `{ raw: true }`.

### Verified

- RED: before implementation, the deep-state suite passed 3/8 controls and failed 5/8 required deep behaviors.
- GREEN: deep-state suite reached 8/8.
- Regression gate: runtime core plus deep state reached 18/18 under Node `v22.16.0` after module separation.

## 2026-10-10 — TypeScript reactive script lowering bridge

### Added

- Exact-pinned `@typescript/typescript6@6.0.2` as the executable TypeScript compatibility adapter.
- `packages/compiler/src/script-lowering.mjs` with durable `EmbeddedScript` extraction, TypeScript-symbol-aware primitive recognition, transparent `state` / `state.raw` / `derive` lowering, collision-free helper names, root write/update lowering, and TypeScript-emitter source maps.
- `.nomos` script map rebasing via coordinate-preserving prefix padding, keeping original line/UTF-16 columns and full original `sourcesContent`.
- `packages/runtime/src/internal.mjs` as the compiler-only runtime ABI and `updateState` for correct prefix/postfix Number/BigInt semantics without adding a root API concept.
- `NOMOS-REACTIVE-DERIVE-WRITE` for writes to derived bindings and statically visible state writes during synchronous derive evaluation.
- Focused compiler and runtime ABI regression suites plus `check:phase1:lowering`.

### Earlier verification

- Compiler lowering had recorded 10/10 focused tests under Node `v22.16.0` using an API-compatibility harness.
- Runtime ABI plus existing runtime regression reached 20/20 under Node `v22.16.0`.

## 2026-10-10 — Pinned CI gate and reactive loop assignment lowering

### Added

- `.github/workflows/ci.yml` as the reproducible dependency-backed verification surface for Phase 1 compiler/runtime work.
- Pinned workflow runtime: Node `22.16.0`, pnpm `12.10.1`, exact repository dependencies including `@typescript/typescript6@6.0.2`.
- Reactive direct-root `for...of` and `for...in` assignment-target lowering through a collision-safe generated loop temporary followed by the existing internal `write(...)` ABI.
- Static derive-write detection now includes direct reactive loop assignment targets.
- Regression controls preserve ordinary lexical-shadowed `for (let key in ...)` behavior.

### CI bootstrap correction

- The first workflow attempt failed before tests because Corepack could not activate pnpm 12.10.1 from its cache.
- The workflow was corrected to use `pnpm/action-setup@v6.1.0`.
- Because the first test-only workflow never reached the test command, the loop-target slice is not described as an observed executable RED→GREEN cycle.

### Verified

- GitHub Actions run `38102821673`: exact toolchain setup green.
- `check:phase1:lowering`: **14/14 passed**.
- `check:phase1:runtime`: **20/20 passed**.
- `check:phase1`: green.
- CI evidence remains development/regression evidence and does not promote public `NCON-*` requirement rows under ADR-0007.

## 2026-10-11 — EmbeddedExpression and text-binding runtime seam

### Added

- `packages/compiler/src/expression-lowering.mjs` implements durable `EmbeddedExpression` extraction with exact original `.nomos` spans and TypeScript 6 adapter metadata.
- Template expressions are parsed with the already-pinned TypeScript 6 compiler API rather than a second Nomos expression parser.
- Reactive script bindings supplied to template lowering are resolved by TypeScript symbol identity; lexical shadowing inside a template expression remains ordinary TypeScript.
- Invalid interpolation syntax produces TypeScript diagnostics translated to original `.nomos` offsets/spans.
- `packages/compiler/src/template-lowering.mjs` emits `TextBinding` IR with collision-safe helper/node identifiers and owner-backed `bindText(...)` setup statements.
- Every successful text binding emits an ECMA-426 version-3 map point from the generated expression start to the original `.nomos` expression-body start, retaining full original `sourcesContent`.
- `packages/runtime/src/dom-bindings.mjs` adds internal `bindText`, delegating scheduling and cleanup to the existing ADR-0008 DOM observer/owner system.
- `packages/runtime/src/internal.mjs` exposes `bindText` only through the compiler-internal ABI; public root API budget is unchanged.

### TDD evidence

- RED run `38120782593`: pinned toolchain/dependencies installed successfully; 14 existing lowering/ABI tests passed, then the new feature suite failed with `ERR_MODULE_NOT_FOUND` for absent `packages/compiler/src/template-lowering.mjs`. Runtime/machine-state steps were skipped by the failed lowering gate.
- GREEN run `38120937878`: `check:phase1:lowering` reached **16/16**, including reactive-read/shadowing/mapping and invalid-syntax expression cases.
- The same GREEN run: `check:phase1:runtime` reached **21/21**, including owner-backed `bindText` mount/update/disposal behavior.
- The Phase 1 validator was green on the then-current 57-artifact machine state before this documentation/validator synchronization.

### Boundary retained

- This slice does not yet materialize actual DOM text nodes from the template AST; `TextBinding.nodeIdentifier` is code-generation IR for the next slice.
- Dynamic/mixed/shorthand/spread attribute lowering is not implemented yet.
- The expression adapter does not claim complete cross-component/template semantic type checking for all script/import scopes yet.
- Reactive destructuring assignment targets remain open.
- `state.snapshot` remains blocked on its explicit contract/`OD-004`.
- No public `NCON-*` requirement row is promoted by these development tests.
