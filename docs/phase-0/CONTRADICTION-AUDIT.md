# Phase 0 contradiction audit

**Audit date:** 2026-10-08  
**Status:** Internal audit complete; external-review feedback still required before Phase 0 exit.

## Scope

The audit compared the authoritative PRD against the Phase 0 grammar, runtime API budget, learning levels, representative components, parser contract corpus, reactive contract, capability-gauntlet specification, learnability protocol, ADRs, decision register, and normative traceability ledger.

## Findings

### Resolved during audit: `state.snapshot` placement looked more final than the PRD permits

The proposed runtime API lists `state.snapshot`, while the PRD separately keeps its final root-namespace placement open. `spec/runtime-api.json` previously listed the nested export without machine-readable provisional status. That could allow a later agent to mistake a proposal for a ratified decision.

**Resolution:** `spec/runtime-api.json` now references `OD-004` in `provisionalDecisions`, and `spec/open-decisions.json` records all eleven PRD open decisions as unresolved. The API proposal remains visible without silently closing the decision.

### No other silent open-decision resolution found

Current Phase 0 artifacts do not choose:

- a slot-presence API;
- empty-array async-branch semantics;
- an HMR compatibility signature;
- exhaustive pattern matching syntax;
- query-key serialization;
- SSG serialization/CSP envelope;
- custom-element pre-upgrade property behavior;
- TypeScript 7.1+ migration timing;
- external-linter framework-file support; or
- final product/extension naming.

Machine tests compare the PRD's complete Open Decisions list with `spec/open-decisions.json` and require every entry to remain `open` with no resolution.

### Whitespace was required but not an Open Decision

The PRD explicitly requires whitespace behavior to be documented by grammar fixtures. ADR-0003 resolves this specified Phase 0 design obligation using HTML/CSS semantics; it does not close any PRD Open Decision.

## Current conclusion

No unresolved internal semantic contradiction is known after the fixes above. This is an internal engineering audit, not the PRD's five-experienced-external-reviewer evidence. Any external reviewer disagreement reopens this conclusion until resolved through the PRD/ADR process.
