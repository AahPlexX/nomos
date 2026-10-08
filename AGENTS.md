# Nomos continuation protocol

This repository is designed to be resumable by another engineer or coding agent without relying on chat history.

## Read order before making changes

1. `PRD.md` — authority manifest; read its four preserved `docs/prd/source-part-*.md` fragments and then every effective amendment under `docs/prd/amendments/` in numeric order.
2. `docs/STATUS.md` — current verified repository state and immediate handoff.
3. `TODO.md` — ordered work queue and acceptance evidence.
4. `docs/GOVERNANCE.md` — decision, branch, documentation, and release rules.
5. `docs/DECISIONS.md` and `docs/adr/` — ratified and still-open architecture decisions.
6. `spec/phase-status.json` — machine-readable phase state and gate evidence.
7. `spec/open-decisions.json` — machine guard against silently resolving the PRD's eleven open decisions.
8. `spec/requirements.json` — append-only normative requirement IDs, owning phase, and conformance-test mappings.
9. `CHANGELOG.md` — completed material changes.

## Mandatory continuation rules

- Work from and deliver to `origin/main`. Do not leave feature branches or open pull requests unless the owner explicitly changes this rule.
- Fetch/re-read remote state immediately before a write. Do not infer repository state from chat history.
- Preserve the four source PRD fragments byte-for-byte. Apply explicit product-owner amendments from `docs/prd/amendments/` after the preserved baseline; an amendment wins only inside its stated scope.
- Do not silently resolve an item listed under **Open Decisions**.
- Every `MUST` and `MUST NOT` ultimately requires automated conformance coverage. `spec/requirements.json` is the traceability ledger; IDs are append-only, `planned` reserves a test ID, and only executable evidence may promote a row to `passing`.
- Use test-first development for executable behavior. Record red and green evidence in `docs/STATUS.md` or the relevant task record.
- Keep internal documentation synchronized in the same commit as the code/spec change it describes. At minimum update `docs/STATUS.md`, `TODO.md`, and `CHANGELOG.md` when material state changes.
- Do not claim a phase, feature, or requirement complete without executable evidence and the effective PRD gate, including applicable amendments.
- Prefer platform standards, existing repository utilities, and already-approved dependencies before adding new abstractions or packages.
- Dependency additions require current official-documentation verification, npm-registry verification, vulnerability review, an exact version, and a recorded reason.
- `Nomos` and `.nomos` remain provisional names until the naming-clearance gate is explicitly closed.

## Current execution boundary

Phase 0 is complete under PRD Amendment 0001, which removes external review as a Phase 0 prerequisite while preserving the contradiction-free semantic gate. Phase 1 — Vertical Slice is active. Work must remain within the Phase 1 deliverables in `TODO.md`; later-phase application features remain out of scope until their phase opens.
