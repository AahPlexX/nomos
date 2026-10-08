# ADR-0002: Phase 0 execution and documentation discipline

- **Status:** Accepted for Phase 0
- **Date:** 2026-10-08

## Context

The repository started with only `LICENSE`; there was no earlier implementation to recover. The owner requires all work consolidated on `origin/main`, no open PRs, and internal documentation sufficient for another model/provider to resume without chat history.

## Decision

- Deliver coherent verified slices directly to `main`; do not leave auxiliary branches or PRs.
- Maintain `AGENTS.md`, `docs/STATUS.md`, `TODO.md`, `CHANGELOG.md`, and decision records as the project control plane.
- Update invalidated living documents in the same commit as the change that invalidates them.
- Use the platform/standard library before dependencies for Phase 0 checks; Node's built-in test runner is sufficient for contract tests.
- Record test-first red evidence and final green evidence for executable changes.
- Do not infer phase completion from a checklist alone; PRD exit criteria remain authoritative.

## Consequences

The repository remains cheap to bootstrap and recoverable by another engineer. Direct-to-main delivery increases the importance of remote-head checks and coherent commits; unknown remote changes must never be overwritten.
