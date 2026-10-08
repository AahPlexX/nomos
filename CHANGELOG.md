# Changelog

All material repository changes are recorded here. This file tracks project state, not semantic-version release notes yet.

## 2026-10-08 — Phase 0 thesis slice

- Preserved the authoritative PRD byte-for-byte, established governance, grammar/reactive/learning contracts, 10 representative components, parser corpus, whitespace semantics, capability/learnability protocols, and 239-requirement traceability.
- Phase 0 contract, traceability, and semantics TDD reached green; preserved PRD SHA is `b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`.

## 2026-10-08 — Product-owner Phase 0 gate amendment

- PRD Amendment 0001 removed the unavailable five-external-reviewer prerequisite while retaining contradiction-free semantics and immutable source provenance.
- Phase 0 closed and Phase 1 opened with synchronized machine/handoff state.

## 2026-10-08 — Phase 1 parser/source-map foundations

- Added lossless component section parsing, exact UTF-16 positions, structural diagnostics, ECMA-426 identity mapping, full Phase 0 structural parser-corpus certification, and hierarchical template ownership AST.
- Parser development evidence reached 11/11 structural tests plus 4/4 focused hierarchy/annotator tests under Node `v22.16.0`.
- ADR-0004 established source positions/maps; ADR-0005 established embedded-language adapter boundaries; ADR-0006 established stage-local source-map composition.
- Embedded TypeScript/CSS adapters, broader HTML tree construction, and the segment-map composer remain unimplemented.

## 2026-10-08 — Public conformance foundation

### Added

- ADR-0007 defining stable public `NCON-*` identities, manifest-declared environments, and evidence-gated requirement promotion.
- `docs/phase-1/research/public-conformance-promotion.md` with Node/GitHub Actions/PRD evidence.
- `conformance/manifest.json` and `conformance/README.md` as the public suite index/contract.
- `tools/conformance-core.mjs`, `tools/run-conformance.mjs`, and `tools/validate-conformance.mjs`.
- `spec/conformance.json` as machine-readable conformance state.
- `tests/phase1-conformance-harness.test.mjs` with four harness-contract cases.
- First public compiler conformance file: `conformance/compiler/NCON-NREQ-0145.test.mjs`.

### Verified

- Conformance harness core: 4/4 tests green under Node `v22.16.0`.
- Public seed test file, runner, and validator pass syntax checks.

### Not promoted

- `NREQ-0145` remains `planned`. Its public test is wired but has not been executed against a complete authenticated checkout in this environment, so no green public evidence is claimed.
- Real-browser environment profiles remain future work; unit-only DOM substitution is explicitly forbidden for browser-required obligations.
