# Project status and handoff

**Last verified:** 2026-10-08 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Parser and source maps  
**Phase 0:** COMPLETE under PRD Amendment 0001  
**Product name:** provisional; clearance not complete

## Authority

The October 7 PRD remains byte-for-byte preserved in four source fragments with SHA-256 `b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`. PRD Amendment 0001 removes only the unavailable five-external-reviewer Phase 0 gate. All eleven PRD Open Decisions remain open. `spec/phase-status.json` is the machine-readable phase handoff.

## Current Phase 1 compiler state

Implemented and recorded on `main`:

- lossless top-level section scanning with exact raw UTF-16 positions and CRLF-aware diagnostic coordinates;
- flat `TemplateSyntaxTree` structural stream and stable parser diagnostics;
- structural certification of all seven valid and four invalid Phase 0 parser fixtures;
- separate hierarchical `Template` AST transform with element/block ownership, element-owned metadata, text recovery, component/custom-element categories, and exact spans;
- ECMA-426 version-3 identity line-start source-map primitive with `sourcesContent`;
- ADR-0004 for coordinates/source maps;
- ADR-0005 for the embedded TypeScript/CSS adapter boundary.

The parser/source-map deliverable remains **IN PROGRESS**. Remaining work is the executable TypeScript/CSS adapters, broader WHATWG HTML tree-construction ownership validation, token/segment generated-map composition, and exact public `NCON-*` conformance wiring.

## Embedded-language boundary — resolved

Wayfinder ticket: https://github.com/AahPlexX/nomos/issues/2  
Research: `docs/phase-1/research/embedded-language-representation.md`  
Decision: `docs/adr/0005-embedded-language-adapter-boundary.md`

Primary-source research established:

- TypeScript 7.0 intentionally ships without a programmatic API; Microsoft provides `@typescript/typescript6` for tools requiring the TypeScript 6 API while the 7.1+ API is still changing.
- TypeScript `SourceFile`/`Program` remain suitable current internal adapter structures, but are not Nomos's durable compiler IR.
- Lightning CSS exposes typed rule/value visitors plus source-map input/output, but its visitor/AST/location conventions are adapter details rather than Nomos source semantics.
- Nomos therefore owns `EmbeddedScript`, `EmbeddedExpression`, and `EmbeddedStylesheet` wrapper contracts and exact source spans. TypeScript/Lightning CSS structures remain opaque/versioned internals.
- Current verified dependency baselines are `@typescript/typescript6@6.0.2` (Apache-2.0) and `lightningcss@1.33.0` (MPL-2.0). They are **not added yet**; dependency installation is deferred until executable adapter code consumes them and must be rechecked then.
- ADR-0005 does not resolve `OD-009` (TypeScript 7.1+ adoption timing).

## Verification evidence

```text
Structural parser baseline: 11 passed / 0 failed (prior recorded delivery).
Hierarchical AST regression RED: removing template-ast.mjs -> ERR_MODULE_NOT_FOUND; exit 1.
Hierarchical AST GREEN: 4 passed / 0 failed under Node v22.16.0.
```

The environment still does not provide the repository-pinned `pnpm` executable. Do not claim a `pnpm check` run unless one is actually executed. `check:phase1:parser` targets all `tests/phase1-parser*.test.mjs` files using Node 22 glob support.

## Wayfinder / Handoff control plane

Canonical map: https://github.com/AahPlexX/nomos/issues/1

- Embedded TypeScript/CSS representation boundary: resolved by ADR-0005 / issue 2.
- Generated source-map composition contract: https://github.com/AahPlexX/nomos/issues/3
- Runtime ownership/scheduler architecture: https://github.com/AahPlexX/nomos/issues/4
- Public conformance-harness promotion workflow: https://github.com/AahPlexX/nomos/issues/5

Portable session handoff: `/tmp/nomos-phase1-handoff.md` (temporary host artifact; canonical facts remain in this repository and Wayfinder map).

## Requirement traceability

`NREQ-0145` and `NREQ-0150` have development evidence but remain `planned` until their exact reserved public `NCON-*` tests are wired and green. Development tests do not silently promote conformance status.

## Immediate next action

1. Implement the ADR-0005 TypeScript adapter wrappers test-first, rechecking and exact-pinning `@typescript/typescript6` only when the executable slice consumes it.
2. Implement the CSS adapter wrapper test-first, rechecking and exact-pinning Lightning CSS only when consumed.
3. Keep the external adapter nodes opaque and prove source-span/offset translation independently.
4. Continue Wayfinder source-map research through issue 3 without preselecting the mapping composition contract.
5. Synchronize TODO, changelog, decisions, machine specs, status, map, and handoff after every material slice.
