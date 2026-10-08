# Project status and handoff

**Last verified:** 2026-10-08 12:58 America/Chicago  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Phase:** 0 — Thesis  
**Phase state:** IN PROGRESS  
**Product name:** provisional; clearance not complete

## Verified repository baseline

- Default/only branch observed: `main`.
- Initial remote baseline: `b7d1d58875365b7193d8ccd8765a37ec63601c8c` (`Initial commit`), containing `LICENSE` only.
- Current verified pre-traceability head: `41b95da774e6637e9e18beb133b44815707743a8`.
- Open pull requests observed before this delivery: none.
- No prior hidden implementation branch was found through the connected GitHub repository state.

## Current Phase 0 state

Already on `main` before the current delivery:

- formal `.nomos` component grammar draft (`spec/nomos.ebnf`);
- root runtime API budget contract (`spec/runtime-api.json`);
- additive learning-level contract (`spec/levels.json`);
- ten representative `.nomos` component fixtures (`examples/phase-0/`);
- executable Phase 0 contract tests (`tests/phase0-contracts.test.mjs`);
- lossless repository preservation of the supplied PRD as four ordered source fragments plus a SHA-256 manifest/checker;
- governance, decisions, continuation protocol, reactive contract, capability-gauntlet specification, learnability-study protocol, and dated toolchain ADRs.

Included in the current direct-to-`main` delivery:

- `spec/requirements.json` with **239 operator-level normative obligations** (195 `MUST`, 44 `MUST NOT`) and one reserved conformance ID per obligation;
- deterministic independent extraction in `tools/normative-requirements.mjs` that fails on omission/drift and retains governing clauses for inherited list requirements;
- Phase 0 parser contract corpus with seven valid and four invalid/adversarial fixtures;
- synchronized `AGENTS.md`, `README.md`, `TODO.md`, `CHANGELOG.md`, traceability docs, parser-corpus docs, and Phase 0 validator updates.

Phase 0 is **not complete**. The whitespace-behavior fixture, contradiction audit, and five-reviewer external exit gate remain open, and no runtime/compiler implementation is claimed. All implementation conformance rows remain `planned`.

## Verification evidence

Initial Phase 0 TDD:

```text
node --test tests/phase0-contracts.test.mjs
RED before contract artifacts: 5 failures.
GREEN after contract artifacts: 5 passed; 0 failed.
```

Traceability TDD:

```text
node --test tests/phase0-traceability.test.mjs
RED: 3 failures while requirements ledger and parser manifest were absent.
RED after completeness tightening: independent normative extractor absent.
GREEN after ledger, extractor, parser corpus, and operator-level compound-clause fix: 3 passed; 0 failed.
```

Combined pre-delivery suite:

```text
node --test tests/phase0-contracts.test.mjs tests/phase0-traceability.test.mjs
8 passed; 0 failed.
```

Remote PRD integrity was rechecked after correcting one fragment-boundary newline: the four downloaded remote fragments concatenate to exactly 52,982 bytes and SHA-256 `b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`, byte-for-byte equal to the uploaded source.

The current execution container has Node `v22.16.0` but no `pnpm` executable, so verification here runs the repository's zero-dependency Node commands directly rather than weakening the pnpm policy.

## Current verified external baseline

On 2026-10-08:

- Vite 8 is the active stable major and supports custom transform, virtual-module, and HMR hooks suitable for compiler integration.
- Vite's documented Node requirement is 20.19+ or 22.12+.
- TypeScript 7.0 is released, while API-dependent tooling may still use `@typescript/typescript6` until the new programmatic API is stable and validated.
- Registry checks observed `vite@8.3.4`, `typescript@7.0.2`, `@typescript/typescript6@6.0.2`, `@volar/language-core@2.4.28`, `@volar/language-service@2.4.28`, and `pnpm@12.10.1`; the checked set returned no known vulnerabilities from the connected vulnerability source.
- WCAG 2.2 SC 1.4.10 still requires content/functionality without two-dimensional scrolling at the equivalent of 320 CSS px for vertical-scrolling content, except intrinsically two-dimensional content.

These version facts are implementation constraints, not source-language semantics. Revalidate before dependency installation or a Nomos minor release.

## Known blockers / intentionally open decisions

All PRD Open Decisions remain open unless an ADR explicitly says otherwise. In particular this slice does not settle query-key serialization, SSG serialization/CSP envelope, HMR compatibility signature, slot-presence API, custom-element pre-upgrade property behavior, TS 7.1+ API adoption timing, pattern matching, external-linter framework-file support, or final naming.

## Immediate next action

1. Re-read `origin/main`, verify the complete suite against the delivered files, and confirm `main` remains the only branch with zero open PRs.
2. Define the required whitespace behavior fixture without resolving any unrelated PRD Open Decision.
3. Run the Phase 0 contradiction audit and prepare the five-reviewer external review packet required by the PRD exit gate.
