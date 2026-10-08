# Governance and change control

**Status:** Interim project governance for pre-1.0 development  
**Last verified:** 2026-10-08 (America/Chicago)  
**Authority:** `PRD.md` remains the product and public-behavior authority.

## Authority order

When documents conflict, use this order:

1. `PRD.md` normative requirements (`MUST`, `MUST NOT`, `SHOULD`, `MAY`).
2. Ratified ADRs under `docs/adr/` for decisions the PRD delegates.
3. `docs/DECISIONS.md` for decision status and links.
4. Phase specifications and machine-readable files under `spec/`.
5. `TODO.md`, `docs/STATUS.md`, and `CHANGELOG.md` for execution state.
6. Implementation details and comments.

An ADR cannot contradict a PRD `MUST` or `MUST NOT` without an explicit PRD amendment.

## Branch and delivery rule

The project owner requires work to remain on `origin/main` and no open PRs to be left behind. Until changed explicitly:

- `main` is the only delivery branch.
- Before every remote write, re-read the remote head and affected files.
- Commits must be coherent and independently verifiable.
- A write that would overwrite unknown newer work must stop rather than force-update.

## Documentation freshness rule

A material code, contract, dependency, architecture, or phase-state change is incomplete until the same commit updates the living records that it invalidates. At minimum consider:

- `docs/STATUS.md` — what is true now, evidence, blockers, next exact action.
- `TODO.md` — completed/in-progress/next work and exit gates.
- `CHANGELOG.md` — durable record of material completed changes.
- `docs/DECISIONS.md` / `docs/adr/*` — any decision made or reopened.
- `spec/*` and requirement traceability — any public-contract change.

No document may claim completion based only on intent or a chat summary.

## Decision protocol

The PRD's **Open Decisions** cannot be settled by implementation accident. Each requires:

1. a focused prototype or evidence package when appropriate;
2. an ADR or public RFC describing the chosen behavior;
3. compatibility impact;
4. automated test plan;
5. documentation update.

Until ratified, code and examples must avoid depending on one possible answer where another remains compatible with the PRD.

## Dependency policy

Before adding or upgrading a dependency:

1. verify the current stable version against the package registry;
2. verify the supported API in current official documentation;
3. check known vulnerabilities and license;
4. prefer an already-installed dependency or web/platform primitive when it covers the requirement;
5. pin the exact version; do not use `^` or `~` ranges;
6. record the purpose and compatibility consequence in the relevant ADR/status record.

## Contribution status

The repository already contains an Apache-2.0 `LICENSE`, but the PRD requires the exact license and governance model to be ratified before accepting external contributions. Therefore external-contribution governance remains **not ratified**. Do not represent the presence of the license file as closure of that PRD gate.

## Release authority

No artifact may be called Nomos 1.0 until every PRD release gate is evidenced. Phase completion similarly requires the exact exit criterion in the PRD, not merely completion of listed deliverables.
