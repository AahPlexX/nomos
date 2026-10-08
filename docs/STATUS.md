# Project status and handoff

**Last verified:** 2026-10-08 09:57 America/Chicago  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Phase:** 0 — Thesis  
**Phase state:** IN PROGRESS  
**Product name:** provisional; clearance not complete

## Verified repository baseline before this slice

- Default/only branch observed: `main`.
- Remote head before Phase 0 work: `b7d1d58875365b7193d8ccd8765a37ec63601c8c` (`Initial commit`).
- Repository contents at that baseline: `LICENSE` only.
- Open pull requests observed: none.
- No prior implementation branch or hidden implementation commit was found through the connected GitHub repository state.

## Current Phase 0 implementation state

Implemented in this slice locally and queued for the same `main` delivery commit:

- formal `.nomos` component grammar draft (`spec/nomos.ebnf`);
- root runtime API budget contract (`spec/runtime-api.json`);
- additive learning-level contract (`spec/levels.json`);
- ten representative `.nomos` component fixtures (`examples/phase-0/`);
- executable Phase 0 contract tests (`tests/phase0-contracts.test.mjs`);
- living governance/handoff documentation;
- reactive contract, capability-gauntlet specification, and learnability-study protocol;
- dated toolchain architecture record based on current official sources and registry checks.

Phase 0 is **not complete**. The external-review exit gate and full parser test corpus remain open, and no runtime/compiler implementation is claimed.

## Verification evidence for this slice

TDD red observed before contract artifacts existed:

```text
node --test tests/phase0-contracts.test.mjs
5 tests failed: missing runtime-api.json, levels.json, grammar, and representative fixtures.
```

Green observed after the minimal contract artifacts were added:

```text
node --test tests/phase0-contracts.test.mjs
5 tests passed; 0 failed.
```

The full repository check must be rerun after remote delivery using the checked-in files; local green evidence is not a substitute for remote-state verification.

## Current verified external baseline

On 2026-10-08:

- Vite 8 is the active stable major and supports custom transform, virtual-module, and HMR hooks suitable for compiler integration.
- Vite's documented Node requirement is 20.19+ or 22.12+.
- TypeScript 7.0 is released, but its stable programmatic API is deferred; `@typescript/typescript6` remains the compatibility path for API-dependent tooling until the new API is stable.
- npm registry checks returned: `vite@8.3.4`, `typescript@7.0.2`, `@typescript/typescript6@6.0.2`, `@volar/language-core@2.4.28`, `@volar/language-service@2.4.28`, and `pnpm@12.10.1`; the checked set returned no known vulnerabilities from the connected vulnerability source.
- WCAG 2.2 SC 1.4.10 still requires content/functionality without two-dimensional scrolling at the equivalent of 320 CSS px for vertical-scrolling content, except intrinsically two-dimensional content.

These version facts are implementation constraints, not source-language semantics. Revalidate before dependency installation or a Nomos minor release.

## Known blockers / intentionally open decisions

All PRD Open Decisions remain open unless an ADR explicitly says otherwise. In particular this slice does not settle query-key serialization, SSG serialization/CSP envelope, HMR compatibility signature, slot-presence API, custom-element pre-upgrade property behavior, TS 7.1+ API adoption timing, pattern matching, external-linter framework-file support, or final naming.

## Immediate next action

1. Deliver this Phase 0 control-plane/contract slice to `origin/main` without a PR.
2. Re-read the resulting tree and commit.
3. Add parser conformance fixtures/tests that exercise valid and invalid grammar ownership cases without yet building the Phase 1 compiler.
4. Begin requirement-to-conformance traceability extraction so every normative PRD statement has an explicit test mapping or planned test id.
