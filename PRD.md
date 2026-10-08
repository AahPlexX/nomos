# Nomos PRD source manifest

The preserved product-source baseline is the exact user-supplied `nomos-prd.md` dated October 7, 2026. To keep that source lossless while making connector-based handoff reliable, its 1,046 lines are stored verbatim in four ordered fragments:

1. `docs/prd/source-part-01.md` — original lines 1–262
2. `docs/prd/source-part-02.md` — original lines 263–524
3. `docs/prd/source-part-03.md` — original lines 525–786
4. `docs/prd/source-part-04.md` — original lines 787–1046

Concatenating those files byte-for-byte produces the preserved source with SHA-256:

`b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`

Run `pnpm check:prd` to verify the stored fragments reconstruct the supplied PRD exactly. Do not edit a source fragment as an ordinary living document.

## Effective product authority

The preserved source establishes the baseline. Explicit dated product-owner amendments under `docs/prd/amendments/` modify that baseline. When an amendment explicitly conflicts with preserved source text, the amendment takes precedence for the stated scope and nothing else.

Effective amendments, in order:

1. `docs/prd/amendments/0001-remove-phase0-external-review-gate.md` — removes the five-external-reviewer requirement from the Phase 0 exit gate while retaining the no-contradictory-semantics condition.

For normal work, read this manifest, the four source fragments in order, then every effective amendment in numeric order. Normative `MUST` and `MUST NOT` statements remain binding unless an amendment explicitly changes them. Product-requirement changes must synchronize amendments, traceability where affected, decisions, TODO, status, tests, and changelog.
