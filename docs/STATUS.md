# Project status and handoff

**Last verified:** 2026-10-09 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Parser, source maps, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler state

The parser front end has lossless section partitioning, exact UTF-16 source positions, a flat structural syntax stream, a hierarchical template AST, complete structural coverage of the Phase 0 parser fixture corpus, partial WHATWG tree-construction ownership validation, and ECMA-426 source-map support.

Resolved Wayfinder research decisions:

1. **Embedded language boundary** — ADR-0005. Nomos owns stable embedded-language wrapper IR and exact source spans; TypeScript/Lightning CSS structures are opaque implementation adapters. This does not resolve `OD-009`.
2. **Generated source-map composition** — ADR-0006. Every code-changing stage maps output to its immediate input; generated-only scaffolding is explicitly unmapped; stage maps compose back to the original `.nomos`; the final ECMA-426 map is validated before Vite/Rolldown handoff. This does not resolve `OD-003`.
3. **Public conformance promotion** — ADR-0007. `conformance/manifest.json` binds exact reserved `NCON-*` identities to public test files and required environments. A requirement may move from `planned` to `passing` only after every declared environment is green in the same evidence set; ledger mutation remains explicit and reviewed.

The ADR-0006 composition core is executable: decoded mappings are validated, exact stage mapping points compose through an intermediate source, generated-only scaffolding remains unmapped, unresolved provenance fails loudly, and final decoded mappings encode to ECMA-426 version-3 maps with `sourcesContent`.

HTML ownership validation now rejects four certified browser-rewrite families: paragraph auto-close before block-like starts, repeated `li`, `dt`/`dd` replacement, and nested `button`. Table foster-parenting/insertion modes and other remaining WHATWG rewrites are still open.

`Parser and source maps` remains **IN PROGRESS** because real lowering/code-generation stages do not yet emit full token/segment mappings, embedded TypeScript/CSS adapters are not implemented, and full WHATWG HTML ownership validation is not complete.

## Public conformance state

The public conformance foundation is implemented. `NCON-NREQ-0145` remains the first wired public test, but `NREQ-0145` remains **planned**, not passing, until the public test is executed against a complete checkout/CI evidence set.

## Verification history

```text
Structural parser baseline: 11 passed / 0 failed (prior recorded delivery).
Hierarchical AST GREEN: 4 passed / 0 failed under Node v22.16.0.
Conformance harness core GREEN: 4 passed / 0 failed under Node v22.16.0.
Source-map composition RED: missing exported composer API.
Source-map composition GREEN: 4 passed / 0 failed under Node v22.16.0.
Expanded HTML ownership RED: 0 passed / 3 failed because no diagnostics were emitted.
Expanded HTML ownership GREEN: 3 passed / 0 failed under Node v22.16.0.
Existing paragraph auto-close remained diagnosed; explicitly closed li/dt/dd/button cases remained valid.
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
2. Implement ADR-0005 TypeScript/CSS adapters test-first using the freshly reverified exact dependency baselines.
3. Extend HTML ownership validation into table insertion modes/foster parenting and remaining high-impact tree rewrites.
4. Produce real token/segment mappings in lowering/code-generation and compose them through the ADR-0006 core.
5. Execute `NCON-NREQ-0145` in a complete checkout/CI evidence set; only then consider promoting `NREQ-0145`.
