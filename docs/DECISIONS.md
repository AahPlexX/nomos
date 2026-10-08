# Decision register

**Last updated:** 2026-10-08

This register records decision status. The PRD's Open Decisions remain open unless an approved ADR/RFC explicitly changes the authoritative PRD and `spec/open-decisions.json` together.

## Accepted decisions

| ID | Decision | Status | Record |
|---|---|---|---|
| ADR-0001 | Treat TypeScript 7 project compilation and the TS6 compatibility API as separate concerns until the TS7 programmatic API is stable and validated | Accepted for current baseline | `docs/adr/0001-toolchain-baseline.md` |
| ADR-0002 | Keep Phase 0 contract tests dependency-light and deliver directly to `main` while maintaining same-commit living docs | Accepted for Phase 0 | `docs/adr/0002-phase0-execution-discipline.md` |
| ADR-0003 | Preserve author text whitespace using HTML-compatible newline/`pre`/`textarea` rules and delegate visual collapse to CSS | Accepted for 1.0 source semantics | `docs/adr/0003-whitespace-semantics.md` |

## PRD Open Decisions

The machine-readable authority for the eleven still-open items is `spec/open-decisions.json`. Every entry is currently `open` with `resolution: null`.

No implementation artifact may silently close an item. In particular, `state.snapshot` remains present in the proposed API while `OD-004` explicitly marks its final namespace placement provisional.
