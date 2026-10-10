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

### Added

- WHATWG-aligned ownership diagnostics when a new `li` implicitly closes an open `li`.
- Ownership diagnostics when a new `dt`/`dd` implicitly closes an open `dt`/`dd`.
- Ownership diagnostics when a nested `button` causes the browser parser to close the outer button.
- `tests/phase1-parser-html-ownership.test.mjs` with three focused regression cases.
- Updated diagnostic documentation and machine-readable ownership coverage.

### Verified

- RED: 0/3 new ownership tests passed because no diagnostics were emitted.
- GREEN: 3/3 pass under Node `v22.16.0`.
- Existing paragraph auto-close behavior remained diagnosed.
- Explicitly closed `li`, `dt`/`dd`, and `button` examples remained valid.

## 2026-10-09 — Table foster-parenting ownership validation

### Added

- WHATWG-aligned ownership diagnostics for non-whitespace text that browser table parsing foster-parents away from `table`, `tbody`, `tfoot`, `thead`, or `tr` ownership.
- Ownership diagnostics for ordinary non-table elements in those same table parsing contexts when the browser would foster-parent them outside the declared owner.
- `tests/phase1-parser-table-ownership.test.mjs` covering both relocation cases plus valid ordinary content inside an explicit table cell.
- Machine-readable ownership coverage now records six certified rewrite families.

### Verified

- RED: 1/3 table tests passed; the valid cell-content control passed while both relocation cases were still undiagnosed.
- GREEN: 3/3 table tests pass under Node `v22.16.0`.
- Combined focused ownership regression run: 11/11 pass under Node `v22.16.0`, including earlier paragraph/`li`/`dt`/`dd`/`button` cases and explicit valid controls.

## 2026-10-09 — Table wrapper and row/cell ownership validation

### Added

- `html-table-ownership.mjs` as a pure rule layer for browser-implied `tbody`/`tr` insertion and row/cell auto-close behavior.
- `table-structure-validation.mjs` as the compiler diagnostic layer over the existing flat template syntax stream.
- Ownership diagnostics when `tr` directly under `table` requires an implied `tbody`.
- Ownership diagnostics when `td`/`th` directly under `table` requires implied `tbody` + `tr`, or directly under a table section requires an implied `tr`.
- Ownership diagnostics when a new table cell closes an open cell or a new row closes an open row.
- `tests/phase1-table-ownership-rules.test.mjs`, `tests/phase1-table-structure-validation.test.mjs`, and `tests/phase1-parser-table-integration.test.mjs`.
- Parser gate updated to include `phase1-table-*` suites.
- Machine-readable ownership coverage increased from 6 to **11 certified rewrite families**.

### Verified

- Pure rule layer RED: helper module absent. GREEN: 6/6 focused rule tests under Node `v22.16.0`.
- Integration layer RED: validator module absent. GREEN: combined rule + integration run 10/10 under Node `v22.16.0`.
- Public `parseComponent` integration regression file is wired on `main`; a complete repository `pnpm` run is not claimed in this environment.

### Still open

- Remaining table-section transition rewrites and high-impact formatting/adoption-agency insertion-mode behavior.
- Embedded TypeScript/CSS adapters and real lowering/code-generation mapping production.
