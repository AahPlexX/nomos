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
- Plain objects and arrays now track property/index/iteration dependencies; array length and truncation invalidate the appropriate dependents.
- `Map` and `Set` now provide reactive membership, size, iteration, and mutation behavior for `set`/`add`, `delete`, and `clear`, including stable wrapping of deep values.
- Proxy identity is stable per state cell and cycle-safe.
- Class instances, dates, DOM nodes, typed arrays, promises, errors, functions, weak collections, and frozen objects remain reference-held rather than internally reactive.
- Runtime raw-state behavior is implemented with the same state-cell ABI via `{ raw: true }`.
- Added `tests/phase1-runtime-deep-state.test.mjs`; the existing runtime wildcard gate automatically includes it.

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

- The first workflow attempt failed before any tests because Corepack could not activate pnpm 12.10.1 from its cache (`MODULE_NOT_FOUND` for the pnpm binary).
- The workflow was corrected to use `pnpm/action-setup@v6.1.0`, which successfully installed pnpm 12.10.1 before Node/dependency verification.
- Because the first test-only workflow never reached the test command, the loop-target slice must **not** be described as an observed executable RED→GREEN cycle. The regression tests were authored before the fix, but RED execution was blocked by CI infrastructure.

### Verified

- GitHub Actions run `38102821673`: toolchain setup green with Node `22.16.0`, pnpm `12.10.1`, and `@typescript/typescript6@6.0.2`.
- `check:phase1:lowering`: **14/14 passed**, including the new `for...of` / `for...in` regression cases and compiler/runtime ABI tests.
- `check:phase1:runtime`: **20/20 passed**.
- `check:phase1`: green; at that run it validated 56 required artifacts.
- This CI evidence is development/regression evidence only and does not promote public `NCON-*` requirement rows under ADR-0007.

### Still open

- Reactive destructuring assignment-target lowering.
- `EmbeddedExpression` template lowering, generated text/attribute DOM bindings, and template/DOM mapping production.
- Lightning CSS executable adapter.
- `state.snapshot` contract/implementation (`OD-004` remains open).
- Public conformance green evidence.
