# Nomos continuation protocol

This repository is designed to be resumable by another engineer or coding agent without relying on chat history.

## Read order before making changes

1. `PRD.md` — source manifest; then read its four ordered `docs/prd/source-part-*.md` fragments, whose concatenation is the product authority and public behavioral contract.
2. `docs/STATUS.md` — current verified repository state and immediate handoff.
3. `TODO.md` — ordered work queue and acceptance evidence.
4. `docs/GOVERNANCE.md` — decision, branch, documentation, and release rules.
5. `docs/DECISIONS.md` and `docs/adr/` — ratified and still-open architecture decisions.
6. `spec/open-decisions.json` — machine guard against silently resolving the PRD's eleven open decisions.
7. `spec/requirements.json` — append-only normative requirement IDs, owning phase, and conformance-test mappings.
8. `CHANGELOG.md` — completed material changes.

## Mandatory continuation rules

- Work from and deliver to `origin/main`. Do not leave feature branches or open pull requests unless the owner explicitly changes this rule.
- Fetch/re-read remote state immediately before a write. Do not infer repository state from chat history.
- Treat the `PRD.md` manifest plus its four ordered `docs/prd/source-part-*.md` fragments as the binding PRD. Do not silently resolve an item listed under **Open Decisions** in that source.
- Every `MUST` and `MUST NOT` ultimately requires automated conformance coverage. `spec/requirements.json` is the traceability ledger; IDs are append-only, `planned` reserves a test ID, and only executable evidence may promote a row to `passing`.
- Use test-first development for executable behavior. Record the red and green commands in `docs/STATUS.md` or the relevant task record.
- Keep internal documentation synchronized in the same commit as the code/spec change it describes. At minimum update `docs/STATUS.md`, `TODO.md`, and `CHANGELOG.md` when material state changes.
- Do not claim a phase, feature, or requirement complete without executable evidence and the PRD-defined exit gate.
- Prefer platform standards, existing repository utilities, and already-approved dependencies before adding new abstractions or packages.
- Dependency additions require current official-documentation verification, npm-registry verification, vulnerability review, an exact version, and a recorded reason.
- `Nomos` and `.nomos` remain provisional names until the naming-clearance gate is explicitly closed.

## Current execution boundary

Phase 0 is in progress. The repository may contain contract fixtures and tests before runtime/compiler implementation. Do not jump to Phase 1 until every Phase 0 deliverable and exit criterion is represented in `TODO.md` and the exit review is recorded.
