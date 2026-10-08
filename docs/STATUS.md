# Project status and handoff

**Last verified:** 2026-10-08 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Parser and source maps  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler state

The parser front end now has lossless section partitioning, exact UTF-16 source positions, a flat structural syntax stream, a hierarchical template AST, complete structural coverage of the Phase 0 parser fixture corpus, and an ECMA-426 identity-map baseline.

Two Wayfinder research decisions are now resolved:

1. **Embedded language boundary** — ADR-0005 (`docs/adr/0005-embedded-language-adapter-boundary.md`). Nomos owns stable embedded-language wrapper IR and exact source spans; TypeScript/Lightning CSS structures are opaque implementation adapters. Current package baselines are `@typescript/typescript6@6.0.2` and `lightningcss@1.33.0`, but neither is installed until executable adapter code consumes it and dependency policy is rechecked. This does not resolve `OD-009`.
2. **Generated source-map composition** — ADR-0006 (`docs/adr/0006-stage-local-source-map-composition.md`). Every code-changing stage maps output to its immediate input; generated-only scaffolding is explicitly unmapped; stage maps compose back to the original `.nomos`; the final ECMA-426 map is validated before Vite/Rolldown handoff. This does not resolve `OD-003`.

`Parser and source maps` remains **IN PROGRESS**. Remaining work is executable TypeScript/CSS adapters, broader WHATWG HTML tree-construction validation, the actual stage-local segment composer, and exact public `NCON-*` wiring.

## Verification history

```text
Structural parser baseline: 11 passed / 0 failed (prior recorded delivery).
Hierarchical AST regression RED: missing template-ast module -> ERR_MODULE_NOT_FOUND; exit 1.
Hierarchical AST GREEN: 4 passed / 0 failed under Node v22.16.0.
```

The current environment does not provide the repository-pinned `pnpm` executable. Do not claim a full `pnpm check` unless one is actually run.

## Wayfinder / Handoff

Map: https://github.com/AahPlexX/nomos/issues/1

Resolved research decisions:
- issue 2 — embedded TypeScript/CSS boundary → ADR-0005.
- issue 3 — generated source-map composition → ADR-0006.

Open frontier:
- issue 4 — runtime ownership and scheduler architecture.
- issue 5 — public conformance-harness promotion workflow.

Portable Handoff: `/tmp/nomos-phase1-handoff.md`. Canonical facts remain in this repository and the Wayfinder map.

## Requirement traceability

`NREQ-0145` and `NREQ-0150` remain `planned` despite development evidence. They may move to `passing` only when their exact reserved public `NCON-*` tests are wired and green.

## Immediate next action

1. Implement ADR-0005 TypeScript/CSS adapters test-first, exact-pinning dependencies only after fresh license/version/vulnerability recheck at the consuming slice.
2. Implement ADR-0006 decoded segment and composition primitives test-first.
3. Resolve the public conformance-harness workflow (Wayfinder issue 5) before promoting any requirement row.
4. Resolve runtime ownership/scheduling (issue 4) before starting the reactive runtime slice.
5. Keep TODO, changelog, decisions, specs, Wayfinder map, and Handoff synchronized.
