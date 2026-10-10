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

### Added

- Bare `col` directly under `table` now reports the browser-implied `colgroup` wrapper.
- Caption, table-section, and `colgroup` starts now report when browser table parsing closes an active table section before reprocessing.
- Table-section starts now report row + section close chains when a row is still open.
- Caption starts inside a table cell now report the browser-closing cell → row → section chain.
- A new caption now reports the implicit close of an already-open caption.
- Table validation stack repair now removes the complete browser-closed chain rather than only its first element, preventing false secondary diagnostics.
- Added `tests/phase1-table-section-transitions.test.mjs`, `tests/phase1-table-stack-repair.test.mjs`, and `tests/phase1-parser-table-transitions.test.mjs`.
- Machine-readable HTML ownership coverage increased from 11 to **18 certified scenarios**.

### Verified

- Section-transition RED: 1/7 tests passed; six transition rewrites were not yet implemented.
- Section-transition GREEN: 8/8 tests passed after implementation.
- Stack-repair RED: one multi-level transition produced two diagnostics instead of one.
- Combined section-transition + stack-repair GREEN: 9/9 tests passed under Node `v22.16.0`.
- The public `parseComponent` transition regression file is wired on `main`; a fresh whole-repository `pnpm` run is not claimed in this environment.

### Still open

- Formatting/adoption-agency and lower-frequency special/table/template insertion-mode ownership rewrites.
- Embedded TypeScript/CSS adapters and real lowering/code-generation mapping production.
- Public conformance green evidence and later Vite/HMR integration.
