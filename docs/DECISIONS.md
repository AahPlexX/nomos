# Decision register

**Last updated:** 2026-10-08

This register records decision status. The PRD's Open Decisions remain open unless listed here as accepted with a corresponding ADR/RFC.

## Accepted operational decisions

| ID | Decision | Status | Record |
|---|---|---|---|
| ADR-0001 | Treat TypeScript 7 CLI/project compilation and the TS6 compatibility API as separate concerns until the TS7 programmatic API is stable and validated | Accepted for current baseline | `docs/adr/0001-toolchain-baseline.md` |
| ADR-0002 | Keep Phase 0 contract tests dependency-free and deliver directly to `main` while maintaining same-commit living docs | Accepted for Phase 0 | `docs/adr/0002-phase0-execution-discipline.md` |

## PRD Open Decisions — still open

- Exact slot-presence API without expanding the core budget.
- Whether empty arrays trigger the asynchronous empty branch.
- Exact HMR compatibility signature.
- Whether `state.snapshot` remains on the root state namespace.
- Whether exhaustive pattern matching warrants another structural block.
- Canonical query-key serialization.
- Canonical SSG data-serialization format and CSP envelope.
- Exact custom-element pre-upgrade property behavior.
- TypeScript 7.1-or-later API adoption timing.
- Framework-file support status in external linters.
- Final product and extension name.

No implementation artifact in the current Phase 0 slice is intended to close these items.
