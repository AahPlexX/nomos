# Project status and handoff

**Last verified:** 2026-10-09 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Parser, source maps, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler state

The parser front end has lossless section partitioning, exact UTF-16 source positions, a flat structural syntax stream, a hierarchical template AST, complete structural coverage of the Phase 0 parser fixture corpus, and ECMA-426 source-map support.

Resolved Wayfinder research decisions:

1. **Embedded language boundary** — ADR-0005. Nomos owns stable embedded-language wrapper IR and exact source spans; TypeScript/Lightning CSS structures are opaque implementation adapters. This does not resolve `OD-009`.
2. **Generated source-map composition** — ADR-0006. Every code-changing stage maps output to its immediate input; generated-only scaffolding is explicitly unmapped; stage maps compose back to the original `.nomos`; the final ECMA-426 map is validated before Vite/Rolldown handoff. This does not resolve `OD-003`.
3. **Public conformance promotion** — ADR-0007. `conformance/manifest.json` binds exact reserved `NCON-*` identities to public test files and required environments. A requirement may move from `planned` to `passing` only after every declared environment is green in the same evidence set; ledger mutation remains explicit and reviewed.

The ADR-0006 composition core is now executable: decoded mappings are validated, exact stage mapping points compose through an intermediate source, generated-only scaffolding remains unmapped, unresolved provenance fails loudly, and final decoded mappings encode to ECMA-426 version-3 maps with `sourcesContent`.

`Parser and source maps` remains **IN PROGRESS** because real lowering/code-generation stages do not yet emit full token/segment mappings, embedded TypeScript/CSS adapters are not implemented, and broader WHATWG HTML ownership validation remains open.

## Public conformance state

The public conformance foundation is implemented:

- `conformance/README.md` documents the public contract.
- `conformance/manifest.json` is the test/environment binding authority.
- `tools/conformance-core.mjs` validates identities and promotion conditions.
- `tools/run-conformance.mjs` runs Node-capable public entries and refuses unsupported environment substitution.
- `tools/validate-conformance.mjs` enforces manifest/ledger/spec consistency.
- `spec/conformance.json` is the machine-readable handoff.
- `NCON-NREQ-0145` is the first wired public test.

`NREQ-0145` remains **planned**, not passing. The public test file is wired and syntax-checked, but this execution environment has not executed it against a complete authenticated repository checkout. `spec/conformance.json` records this as `wired-unverified`.

## Verification history

```text
Structural parser baseline: 11 passed / 0 failed (prior recorded delivery).
Hierarchical AST GREEN: 4 passed / 0 failed under Node v22.16.0.
Conformance harness core GREEN: 4 passed / 0 failed under Node v22.16.0.
Source-map composition RED: missing exported composer API.
Source-map composition GREEN: 4 passed / 0 failed under Node v22.16.0.
Public NCON seed/runner/validator syntax checks: passed.
```

The current environment does not provide the repository-pinned `pnpm` executable. Do not claim a full `pnpm check` or a green public `NCON-NREQ-0145` run until one actually occurs against the complete repository.

## Wayfinder / Handoff

Map: https://github.com/AahPlexX/nomos/issues/1

Resolved decisions:
- issue 2 — embedded TypeScript/CSS boundary → ADR-0005.
- issue 3 — generated source-map composition → ADR-0006.
- issue 5 — public conformance promotion workflow → ADR-0007.

Open frontier:
- issue 4 — runtime ownership and scheduler architecture.

Portable Handoff: `/tmp/nomos-phase1-handoff.md`. Canonical facts remain in this repository and the Wayfinder map.

## Immediate next action

1. Resolve runtime ownership/scheduling (Wayfinder issue 4) before starting the reactive runtime slice.
2. Implement real token/segment mapping production in lowering/code-generation and compose it through the new ADR-0006 core.
3. Implement ADR-0005 TypeScript/CSS adapters test-first after fresh dependency recheck.
4. Execute `NCON-NREQ-0145` in a complete checkout/CI evidence set; only then consider promoting `NREQ-0145`.
5. Keep TODO, changelog, decisions, specs, Wayfinder map, and Handoff synchronized.
