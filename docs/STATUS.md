# Project status and handoff

**Last verified:** 2026-10-08 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Phase 0:** COMPLETE under PRD Amendment 0001  
**Product name:** provisional; clearance not complete

## Authority and phase transition

The original October 7 PRD remains byte-for-byte preserved in four source fragments with SHA-256 `b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`.

On 2026-10-08 the product owner explicitly instructed the project to disregard the Phase 0 requirement for five experienced external reviewers because none are available. `docs/prd/amendments/0001-remove-phase0-external-review-gate.md` records that directive without rewriting historical source. The amendment removes only that review prerequisite; the contradiction-free semantic gate remains.

`spec/phase-status.json` is the machine-readable phase handoff: Phase 0 is complete, external review is not required, the contradiction audit is passed, no Phase 0 blockers are open, and Phase 1 is allowed/active.

## Phase 0 closure evidence

Delivered on `main` before closure:

- formal `.nomos` grammar draft, API budget, additive levels, and ten representative components;
- reactive contract, capability-gauntlet specification, learnability protocol, governance, and ADR-0001 through ADR-0003;
- 239 operator-level normative requirement IDs with deterministic PRD extraction and reserved conformance IDs;
- seven valid plus four invalid/adversarial structural parser fixtures;
- HTML/CSS-aligned whitespace semantics and five whitespace fixtures;
- all eleven PRD Open Decisions machine-registered as `open` with no resolution;
- `state.snapshot` machine-marked provisional through `OD-004`;
- contradiction audit with no unresolved semantic contradiction.

The 239 traceability rows are not all implementation-complete; future-phase rows intentionally remain `planned` until their executable conformance tests land. That is release traceability work, not a reopened Phase 0 exit blocker.

## Current TDD evidence for the gate amendment

```text
node --test tests/phase0-governance.test.mjs
RED: 3 failed before amendment/manifest precedence/phase-state artifacts existed.
GREEN: 3 passed, 0 failed after synchronized implementation.

cat docs/prd/source-part-01.md ... source-part-04.md | sha256sum
b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690
```

Earlier Phase 0 evidence remains recorded in `CHANGELOG.md`: 5/5 initial contracts, 3/3 traceability, and 3/3 semantic tests were green at the prior semantic delivery.

## Phase 1 active scope

The effective PRD Phase 1 vertical slice requires:

- parser and source maps;
- state, derivation, synchronization, and ownership;
- text and attribute bindings;
- events and native-control bindings;
- conditions and keyed lists;
- components and inputs;
- scoped CSS;
- Vite integration and HMR;
- Levels 0 through 3.

Exit requires a TodoMVC-class application to pass deterministic browser tests, preserve valid state through HMR, and clean up every owned effect.

## Open decisions and continuing blockers

- All eleven PRD Open Decisions remain open in `spec/open-decisions.json`; none was closed by the Phase 0 amendment.
- Final product and extension naming remain provisional.
- External-contribution governance/license ratification remains separate from the existing license file.
- No external-review dependency blocks Phase 1.

## Immediate next action

1. Establish the Phase 1 implementation architecture and deterministic test harness from the Phase 0 grammar/reactivity contracts.
2. Implement the parser/source-map vertical slice test-first, without prematurely resolving any Open Decision.
3. Keep requirement rows, phase status, TODO, changelog, decisions, and this handoff synchronized with each implementation slice.
