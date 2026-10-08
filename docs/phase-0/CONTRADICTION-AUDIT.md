# Phase 0 contradiction audit

**Audit date:** 2026-10-08  
**Status:** Complete; no unresolved internal semantic contradiction is known.

## Scope

The audit compared the authoritative PRD baseline and effective amendments against the Phase 0 grammar, runtime API budget, learning levels, representative components, parser contract corpus, reactive contract, capability-gauntlet specification, learnability protocol, ADRs, decision register, and normative traceability ledger.

## Findings

### Resolved during audit: `state.snapshot` placement looked more final than the PRD permits

The proposed runtime API lists `state.snapshot`, while the PRD separately keeps its final root-namespace placement open. `spec/runtime-api.json` now references `OD-004` in `provisionalDecisions`, and `spec/open-decisions.json` records all eleven PRD Open Decisions as unresolved.

### No other silent open-decision resolution found

Current Phase 0 artifacts do not choose a slot-presence API, empty-array async-branch semantics, HMR compatibility signature, exhaustive pattern matching syntax, query-key serialization, SSG serialization/CSP envelope, custom-element pre-upgrade property behavior, TypeScript 7.1+ migration timing, external-linter framework-file support, or final product/extension naming.

Machine tests compare the PRD's complete Open Decisions list with `spec/open-decisions.json` and require every entry to remain `open` with no resolution.

### Whitespace was required but not an Open Decision

The PRD explicitly requires whitespace behavior to be documented by grammar fixtures. ADR-0003 resolves this specified Phase 0 design obligation using HTML/CSS semantics; it does not close any PRD Open Decision.

### Product-owner gate amendment is not a semantic contradiction

PRD Amendment 0001 removes only the Phase 0 requirement for five external reviewers. It retains the contradiction-free semantic exit condition and does not alter language/runtime behavior, normative `MUST`/`MUST NOT` obligations, or Open Decisions.

## Conclusion

No unresolved Phase 0 semantic contradiction is known. External review may still be used voluntarily and any later discovered contradiction must be fixed, but external reviewer evidence is no longer required for Phase 0 exit under PRD Amendment 0001.
