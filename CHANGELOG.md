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

### Added

- `html-formatting-ownership.mjs` as a pure rule layer for nested anchors, nested `nobr`, and misnested formatting end tags.
- `formatting-structure-validation.mjs` as the diagnostic/stack-repair layer over the existing flat syntax stream.
- Compiler entrypoint integration before hierarchical AST construction.
- `tests/phase1-formatting-ownership-rules.test.mjs` and `tests/phase1-formatting-structure-validation.test.mjs`.
- `tests/phase1-parser-formatting-integration.test.mjs` for public `parseComponent` coverage.
- `docs/phase-1/research/html-formatting-ownership.md` caching the current WHATWG rationale and deliberate scope boundary.
- Parser gate expanded to include focused `phase1-formatting-*` suites.
- Machine-readable HTML ownership coverage increased from 18 to **21 certified scenarios**.

### Verified

- Formatting rule RED: module absent.
- Formatting rule GREEN: 5/5 under Node `v22.16.0`.
- Formatting diagnostic RED: module absent.
- Combined formatting rule + diagnostic GREEN: 9/9 under Node `v22.16.0`.
- New and modified JavaScript files pass syntax checks; JSON state files parse successfully.
- A fresh whole-repository `pnpm` run and public parser integration execution are not claimed in this environment.

### Still open

- Active-formatting reconstruction edge cases and lower-frequency special/table/template insertion-mode ownership rewrites.
- Embedded TypeScript/CSS adapters and real lowering/code-generation mapping production.
- Public conformance green evidence and later Vite/HMR integration.
