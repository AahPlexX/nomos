# Governance and change control

**Status:** Interim project governance for pre-1.0 development  
**Last verified:** 2026-10-08 (America/Chicago)  
**Authority:** `PRD.md` defines the preserved baseline plus effective product-owner amendments.

## Authority order

When documents conflict, use this order:

1. Explicit effective product-owner amendments listed by `PRD.md`, limited to their stated scope.
2. The preserved PRD baseline (`docs/prd/source-part-*.md`) for everything not amended.
3. Ratified ADRs under `docs/adr/` for decisions the effective PRD delegates.
4. `docs/DECISIONS.md` for decision status and links.
5. Phase specifications and machine-readable files under `spec/`.
6. `TODO.md`, `docs/STATUS.md`, and `CHANGELOG.md` for execution state.
7. Implementation details and comments.

An ADR cannot contradict an effective PRD `MUST` or `MUST NOT` without an explicit PRD amendment. Preserved source fragments are provenance and must not be edited to hide later requirement changes.

## PRD amendment protocol

A product-owner directive that changes a PRD requirement must be represented as a numbered record under `docs/prd/amendments/` and listed in `PRD.md`. The amendment must state scope and non-effects. In the same change, update every affected traceability record, test, decision/status document, and phase gate. Unaffected source requirements remain binding.

## Branch and delivery rule

The project owner requires work to remain on `origin/main` and no open PRs to be left behind. Until changed explicitly:

- `main` is the only delivery branch.
- Before every remote write, re-read the remote head and affected files.
- Commits must be coherent and independently verifiable.
- A write that would overwrite unknown newer work must stop rather than force-update.

## Documentation freshness rule

A material code, contract, dependency, architecture, or phase-state change is incomplete until the same commit updates the living records that it invalidates. At minimum consider `docs/STATUS.md`, `TODO.md`, `CHANGELOG.md`, `docs/DECISIONS.md` / `docs/adr/*`, and affected `spec/*`/traceability records.

No document may claim completion based only on intent or a chat summary. `spec/phase-status.json` must agree with the human-readable status and TODO documents.

## Decision protocol

The effective PRD's **Open Decisions** cannot be settled by implementation accident. Each requires a focused prototype/evidence package when appropriate, an ADR or public RFC, compatibility impact, automated test plan, and synchronized documentation update.

Until ratified, code and examples must avoid depending on one possible answer where another remains compatible with the PRD.

## Dependency policy

Before adding or upgrading a dependency: verify current stable registry version, current official API documentation, known vulnerabilities and license; prefer existing/platform capability; pin exact versions; record purpose and compatibility consequence.

## Contribution status

The repository already contains an Apache-2.0 `LICENSE`, but the PRD requires the exact license and governance model to be ratified before accepting external contributions. External-contribution governance remains **not ratified**.

## Release authority

No artifact may be called Nomos 1.0 until every effective PRD release gate is evidenced. Phase completion requires the effective exit criterion after applicable amendments, not merely completion of a historical unamended sentence.
