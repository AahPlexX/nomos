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

### Added

- ADR-0008 resolves Wayfinder issue #4 with one versioned fine-grained graph, one owner tree, lazy derives, and an ordered DOM-before-sync microtask scheduler.
- `packages/runtime/src/reactivity.mjs` implements the first executable Phase 1 runtime core using platform `Map`, `Set`, and `queueMicrotask()` primitives rather than a third-party reactivity engine.
- Versioned scalar state cells, lazy memoized derives, dynamic dependency capture/removal, development derive-write guards, `untrack()`, mount-gated DOM/sync observers, sync cleanup, deterministic owner disposal, and named reactive-cycle errors.
- `spec/runtime-core.json` records the implemented core and explicitly separates deep state, `state.raw`, snapshot semantics, compiler lowering, request cancellation, and generated DOM binding work.
- `docs/phase-1/research/runtime-ownership-and-scheduling.md` caches the architecture research and dependency decision.
- `tests/phase1-runtime-core.test.mjs` provides a lean 10-test contract suite; `check:phase1:runtime` runs it directly.

### Verified

- Proper RED was re-established against a deliberately reverted skeletal runtime: the suite exited non-zero with behavioral assertion failures for memoization, dynamic dependencies, derive-write protection, scheduler ordering, async tracking, cycle detection, automatic microtask delivery, and sync cleanup.
- GREEN: 10/10 runtime contract tests pass under Node `v22.16.0`.
- Runtime source passes `node --check`; runtime machine state parses as valid JSON.
- No normative requirement row is promoted from development tests alone; ADR-0007 public conformance evidence remains required.

### Still open

- Deep reactive tracking for plain objects, arrays, `Map`, and `Set`; `state.raw`; and compiler lowering to the internal cell ABI.
- `state.snapshot` behavior specification and implementation; `OD-004` remains open and is not silently resolved.
- Request ownership/cancellation and generated DOM binding integration.
- Embedded TypeScript/CSS adapters, real code-generation source mappings, remaining narrow HTML ownership cases, and public conformance evidence.
