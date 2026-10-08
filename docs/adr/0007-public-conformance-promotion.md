# ADR-0007: Public conformance identities and evidence-gated promotion

- **Status:** Accepted for Phase 1 conformance infrastructure
- **Date:** 2026-10-08
- **Wayfinder:** https://github.com/AahPlexX/nomos/issues/5

## Context

The PRD requires every normative `MUST` / `MUST NOT` obligation to map to an automated public conformance test. `spec/requirements.json` already reserves one stable `NCON-*` identity per requirement, but the repository did not yet define how a test becomes public evidence or how a requirement can safely move from `planned` to `passing`.

The same PRD also requires real-browser execution where DOM behavior matters; therefore a conformance mechanism cannot treat a unit-only substitute as equivalent to a declared browser environment.

## Decision

1. Public conformance tests live under `conformance/` and are indexed by `conformance/manifest.json`.
2. Each manifest entry uses the exact `testId` already reserved by its `spec/requirements.json` row and names the corresponding `requirementId`.
3. Each entry declares every environment required to prove that obligation. Initial environment vocabulary starts with `node`; real-browser profiles are added only when a browser harness exists.
4. `tools/run-conformance.mjs` executes exact manifest entries. A runner fails if it cannot satisfy an entry's declared environment rather than silently substituting another runtime.
5. A requirement may move from `planned` to `passing` only when every declared environment for the exact `NCON-*` identity is green in the same evidence set.
6. Ledger promotion is explicit and reviewed. Test execution does not automatically rewrite `spec/requirements.json`.
7. `tools/validate-conformance.mjs` prevents a `passing` row from existing without its exact public manifest entry and keeps the machine contract synchronized.

## Initial implementation

The first public test identity, `NCON-NREQ-0145`, is wired for the compiler requirement to parse component sections and preserve exact source positions. It remains `wired-unverified`, and `NREQ-0145` remains `planned`, until that public test is actually executed against a complete repository checkout or CI evidence set.

## Consequences

- Public conformance identity is stable and reviewable.
- Environment requirements are data, not informal CI convention.
- Browser-required behaviors cannot be accidentally promoted from Node-only evidence.
- Development tests can remain richer/faster without being confused with public conformance proof.
- Future CI may parallelize environment profiles, but all required results must be green before promotion.

## Sources

See `docs/phase-1/research/public-conformance-promotion.md`.
