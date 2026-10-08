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

The October 7 PRD remains byte-for-byte preserved in four source fragments with SHA-256 `b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`. PRD Amendment 0001 removes only the unavailable five-external-reviewer Phase 0 gate; all other effective requirements and all eleven Open Decisions remain intact. `spec/phase-status.json` is the machine-readable phase handoff.

## Phase 1 parser/source-map state

Implemented under `packages/compiler/src/`:

- lossless top-level section scanner with exact raw UTF-16 offsets and CRLF-aware one-based diagnostic coordinates;
- flat `TemplateSyntaxTree` structural stream and stable parser diagnostics;
- structural certification of all seven valid and all four invalid Phase 0 parser fixtures;
- hierarchical `Template` AST as a separate transform, preserving the flat stream for diagnostics/debugging;
- hierarchical parent/child elements, element-owned attributes/directives, literal text recovery, interpolation/raw-HTML leaves, and explicit `if` / `each` / `await` branches with exact spans;
- component/custom-element categories, self-closing and HTML-void handling;
- ECMA-426 version-3 identity line-start source-map primitive with `sourcesContent`;
- ADR-0004 plus `spec/compiler-front-end.json` as the coordinate/map and implemented/planned boundary.

The parser/source-map deliverable remains **IN PROGRESS**. Typed embedded TypeScript/CSS structures, broader HTML tree-construction ownership validation, token/segment generated-map composition, and exact public `NCON-*` conformance wiring remain open.

## Current TDD / verification evidence

```text
Earlier structural parser baseline: 11 passed / 0 failed (recorded in prior commit state).
Hierarchical AST regression RED: template-ast module removed -> ERR_MODULE_NOT_FOUND; exit 1.
Hierarchical AST GREEN: focused hierarchy/annotator suite -> 4 passed / 0 failed under Node v22.16.0.
```

The environment still does not provide the repository-pinned `pnpm` executable. Do not claim a `pnpm check` run unless one is actually executed. Node 22 supports quoted test-file glob patterns, so `check:phase1:parser` now targets every `tests/phase1-parser*.test.mjs` file portably rather than the original file only.

## Wayfinder / Handoff control plane

Canonical Wayfinder map: https://github.com/AahPlexX/nomos/issues/1

Open decision tickets:

- embedded TypeScript/CSS representation boundary: https://github.com/AahPlexX/nomos/issues/2
- generated source-map composition contract: https://github.com/AahPlexX/nomos/issues/3
- runtime ownership/scheduler architecture: https://github.com/AahPlexX/nomos/issues/4
- public conformance-harness promotion workflow: https://github.com/AahPlexX/nomos/issues/5

A portable Handoff document for session transfer is maintained outside the repository at the host temporary path `/tmp/nomos-phase1-handoff.md`; it references, rather than duplicates, these canonical repo artifacts.

## Requirement traceability

`NREQ-0145` (parse component sections and preserve exact source positions) has development-test evidence and `NREQ-0150` (emit source maps) has a baseline map primitive. Their ledger rows remain `planned` until exact reserved public `NCON-*` tests are wired and green. Development tests do not silently promote public conformance status.

## Open decisions / blockers

- All eleven PRD Open Decisions remain open in `spec/open-decisions.json`.
- Final product and extension naming remain provisional.
- External-contribution governance/license ratification remains separate from the existing license file.
- No external-review dependency blocks Phase 1.
- No unresolved decision blocks the already-ratified hierarchical AST transform.

## Immediate next action

1. Resolve the embedded TypeScript/CSS representation ticket against current official toolchain contracts, then record the decision before coupling parser internals to it.
2. Implement typed embedded-language structures test-first once that boundary is explicit.
3. Continue source-map composition research in parallel through the Wayfinder ticket.
4. Keep `TODO.md`, `CHANGELOG.md`, machine specs, decision records, Wayfinder map, and this status synchronized with every material change.
