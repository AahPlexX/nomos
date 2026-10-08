# Nomos PRD source manifest

The product authority is the exact user-supplied `nomos-prd.md` dated October 7, 2026. To keep that source lossless while making connector-based handoff reliable, its 1,046 lines are stored verbatim in four ordered fragments:

1. `docs/prd/source-part-01.md` — original lines 1–262
2. `docs/prd/source-part-02.md` — original lines 263–524
3. `docs/prd/source-part-03.md` — original lines 525–786
4. `docs/prd/source-part-04.md` — original lines 787–1046

Concatenating those files byte-for-byte produces the authoritative source with SHA-256:

`b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`

Run `pnpm check:prd` to verify the stored fragments reconstruct the supplied PRD exactly. Do not edit a fragment as an ordinary living document. Product-requirement changes require an explicit PRD amendment process that updates the source, digest, traceability, decisions, TODO, status, tests, and changelog together.

For normal work, read this manifest and then the four fragments in order. Normative `MUST` and `MUST NOT` statements in those fragments outrank implementation notes and living execution documents.
