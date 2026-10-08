# Normative requirement traceability

**Status:** Phase 0 baseline established; release coverage remains incomplete  
**Source digest:** `sha256:b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`  
**Ledger:** `spec/requirements.json`

## Purpose

The PRD requires every normative `MUST` and `MUST NOT` obligation to map to an automated public conformance test before release completion. The ledger makes that rule machine-checkable without pretending unimplemented behavior already passes.

The current deterministic extraction contains **239 operator-level obligations**: **195 `MUST`** and **44 `MUST NOT`**. Every compact row has a stable `NREQ-####` identifier, source line/operator index, normative keyword, reserved `NCON-*` conformance-test identifier, owning delivery phase, and status. Verbatim requirement text and inherited governing clauses are derived from the frozen PRD source by the extractor and verified in tests rather than duplicated in the ledger.

Operator-level granularity matters because a single PRD sentence can contain more than one normative operator. Such obligations receive distinct IDs even when they share the same source sentence.

## Status meanings

- `planned`: the conformance-test ID is reserved, but no passing implementation evidence exists yet.
- `passing`: the corresponding conformance test exists, runs against the implementation, and passes in the supported environment matrix.

`releaseComplete` MUST remain `false` while any row is `planned`. Phase 0 contract tests and design checks do not promote runtime requirements to `passing` merely because the intended contract is documented.

## Stable-ID rule

`NREQ` identifiers are append-only. A later PRD amendment must preserve existing IDs for unchanged obligations, retire changed obligations explicitly, and append new IDs rather than renumbering the ledger. This prevents documentation edits from silently changing test identity.

## Extraction rule

`tools/normative-requirements.mjs` deterministically extracts:

1. every uppercase normative `MUST` or `MUST NOT` operator in direct requirement sentences, including multiple operators in one sentence; and
2. each list item governed by a lead such as `Nomos MUST:`, `Components MUST support:`, or `Nomos 1.0 MUST NOT ship until:`.

Inherited list rows retain their full `governingClause` and `governingLine`, so a condition such as `MUST NOT ship until:` cannot be misread as negating the list item's own text.

The authority definitions of the words `MUST` / `MUST NOT` and the meta sentence that defines mapping policy are excluded because they describe requirement vocabulary rather than product behavior. The traceability test compares this independent extraction to the committed ledger exactly; omission or drift fails the suite.

## Owner assignment

Ownership is intentionally coarse scheduling metadata rather than source semantics:

- **Phase 0:** learning-level invariants, public API budget governance, and other thesis-level contract checks.
- **Phase 1:** component/reactivity/template/styling behavior plus compiler, diagnostics, TypeScript tooling, and HMR foundations.
- **Phase 2:** remote data, routing, accessibility primitives, testing utilities, and initial devtools.
- **Phase 3:** rendering modes, interoperability, agent interfaces, and performance/release implementation suites.
- **Release:** product-wide, release-gate, policy, naming, governance, and other aggregate obligations that may depend on work from several phases.

Changing an owner does not change the requirement or its `NREQ`/`NCON` identity.

## Ownership distribution

| Owner | Requirements |
|---|---:|
| Phase 0 | 11 |
| Phase 1 | 69 |
| Phase 2 | 38 |
| Phase 3 | 32 |
| Release | 89 |
| **Total** | **239** |

Ownership is scheduling metadata, not a relaxation of the requirement. A release-owned aggregate requirement can depend on work produced in multiple phases.
