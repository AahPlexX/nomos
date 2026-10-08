# Decision register

**Last updated:** 2026-10-08

This register records product amendments and architecture decision status. The PRD's Open Decisions remain open unless an approved ADR/RFC explicitly changes the effective PRD and `spec/open-decisions.json` together.

## Product-owner amendments

| ID | Decision | Status | Record |
|---|---|---|---|
| PRD-A0001 | Remove the five-external-reviewer requirement from the Phase 0 exit gate; retain contradiction-free semantics | Effective | `docs/prd/amendments/0001-remove-phase0-external-review-gate.md` |

## Accepted architecture decisions

| ID | Decision | Status | Record |
|---|---|---|---|
| ADR-0001 | Treat TypeScript 7 project compilation and the TS6 compatibility API as separate concerns until the TS7 programmatic API is stable and validated | Accepted for current baseline | `docs/adr/0001-toolchain-baseline.md` |
| ADR-0002 | Keep Phase 0 contract tests dependency-light and deliver directly to `main` while maintaining same-commit living docs | Accepted for Phase 0 | `docs/adr/0002-phase0-execution-discipline.md` |
| ADR-0003 | Preserve author text whitespace using HTML-compatible newline/`pre`/`textarea` rules and delegate visual collapse to CSS | Accepted for 1.0 source semantics | `docs/adr/0003-whitespace-semantics.md` |
| ADR-0004 | Preserve raw UTF-16 source offsets, expose one-based diagnostic coordinates, and use ECMA-426 source maps with UTF-16 JavaScript/CSS columns | Accepted for Phase 1 compiler front end | `docs/adr/0004-source-position-and-map-baseline.md` |

## PRD Open Decisions

The machine-readable authority for the eleven still-open items is `spec/open-decisions.json`. Every entry remains `open` with `resolution: null`.

PRD-A0001 and ADR-0004 change no Open Decision. In particular, `state.snapshot` remains present in the proposed API while `OD-004` explicitly marks its final namespace placement provisional, and the product/extension name remains provisional under `OD-011`.
