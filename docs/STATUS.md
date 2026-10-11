# Project status and handoff

**Last verified:** 2026-10-10 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Compiler, runtime reactivity, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler state

The parser front end has lossless section partitioning, exact UTF-16 source positions, a flat structural syntax stream, a hierarchical template AST, complete structural coverage of the Phase 0 parser fixture corpus, partial WHATWG tree-construction ownership validation, and ECMA-426 source-map support.

Resolved compiler/conformance architecture decisions:

1. **Embedded language boundary** — ADR-0005. Nomos owns stable embedded-language wrapper IR and exact source spans; TypeScript/Lightning CSS structures are opaque implementation adapters. This does not resolve `OD-009`.
2. **Generated source-map composition** — ADR-0006. Every code-changing stage maps output to its immediate input; generated-only scaffolding is explicitly unmapped; stage maps compose back to the original `.nomos`; the final ECMA-426 map is validated before Vite/Rolldown handoff. This does not resolve `OD-003`.
3. **Public conformance promotion** — ADR-0007. `conformance/manifest.json` binds exact reserved `NCON-*` identities to public test files and required environments. A requirement may move from `planned` to `passing` only after every declared environment is green in the same evidence set; ledger mutation remains explicit and reviewed.

The ADR-0006 composition core is executable: decoded mappings are validated, exact stage mapping points compose through an intermediate source, generated-only scaffolding remains unmapped, unresolved provenance fails loudly, and final decoded mappings encode to ECMA-426 version-3 maps with `sourcesContent`.

HTML ownership validation records **21 certified browser-rewrite scenarios** across paragraph/list/button, major table insertion modes, nested anchors, nested `nobr`, and high-impact adoption-agency recovery. Remaining parser work is active-formatting reconstruction edge cases, low-frequency special/table/template insertion modes, embedded language adapters, and real lowering/code-generation mappings.

## Current runtime state

Wayfinder issue #4 is resolved by **ADR-0008 — Runtime ownership and scheduler architecture**. The runtime uses one versioned fine-grained dependency graph and one parent/child owner tree:

- state writes update synchronously;
- derives are read-only, lazy, memoized, dynamic-dependency tracked, and recompute on demand;
- development runtime rejects writes while a derive evaluates;
- DOM observers and sync observers share the same graph but flush in separate ordered phases;
- the scheduler uses one `queueMicrotask()` flush, drains DOM work before sync work, and yields back to DOM if a sync creates more DOM work;
- sync tracking ends when the synchronous callback invocation returns, so reads after `await` are not dependencies;
- sync cleanup runs before rerun and on disposal;
- owner disposal is children first, then local cleanup in reverse creation order, then owned DOM;
- non-terminating sync cycles throw a dedicated error naming participating states and synchronization owners.

Executable implementation: `packages/runtime/src/reactivity.mjs`. Machine authority: `spec/runtime-core.json`.

The runtime core remains **IN PROGRESS** overall because deep tracking for plain objects/arrays/Map/Set, `state.raw`, snapshot specification/implementation, compiler state/derive lowering, request cancellation ownership, and generated DOM binding integration are not yet complete. `state.snapshot` is intentionally not claimed conformant while its required semantics and `OD-004` remain unresolved.

## Public conformance state

The public conformance foundation is implemented. `NCON-NREQ-0145` remains the first wired public test, but `NREQ-0145` remains **planned**, not passing, until the public test is executed against a complete checkout/CI evidence set. Development runtime tests do not automatically promote normative requirement rows.

## Verification history

```text
Structural parser baseline: 11 passed / 0 failed (prior recorded delivery).
Hierarchical AST GREEN: 4 passed / 0 failed under Node v22.16.0.
Conformance harness core GREEN: 4 passed / 0 failed under Node v22.16.0.
Source-map composition GREEN: 4 passed / 0 failed under Node v22.16.0 after recorded RED.
Table/formatting ownership focused suites remain recorded green; current machine ownership count: 21 scenarios.
Runtime-core TDD RED: skeletal non-reactive implementation produced assertion failures for memoization, dynamic dependencies, derive-write guard, scheduling, async tracking, cycle detection, microtask delivery, and sync cleanup.
Runtime-core GREEN: 10 passed / 0 failed under Node v22.16.0.
Runtime core source passes Node syntax validation; runtime machine JSON parses successfully.
```

The current environment does not provide the repository-pinned `pnpm` executable. Do not claim a full `pnpm check` or a green public `NCON-*` evidence set until one actually occurs against the complete repository.

## Wayfinder / Handoff

Map: https://github.com/AahPlexX/nomos/issues/1

Resolved decisions:
- issue 2 — embedded TypeScript/CSS boundary → ADR-0005.
- issue 3 — generated source-map composition → ADR-0006.
- issue 4 — runtime ownership/scheduler architecture → ADR-0008.
- issue 5 — public conformance promotion workflow → ADR-0007.

No Wayfinder architecture decision ticket remains open. The eleven PRD Open Decisions remain separate and unchanged.

Portable Handoff: `/tmp/nomos-phase1-handoff.md`. Canonical facts remain in this repository and the Wayfinder map.

## Immediate next action

1. Implement deep tracked state for plain objects, arrays, `Map`, and `Set`, plus `state.raw`, against the ADR-0008 graph without creating a second dependency system.
2. Define the compiler lowering ABI for transparent primitive state/derive reads and writes, then connect generated DOM bindings to the DOM observer phase.
3. Implement ADR-0005 TypeScript/CSS adapters using exact-pinned dependency baselines.
4. Produce real token/segment mappings in lowering/code-generation and compose them through the ADR-0006 core.
5. Continue the narrow remaining HTML ownership edge cases when they materially block compiler correctness rather than duplicating the entire browser parser.
6. Add public runtime conformance tests at the requirement boundary and promote rows only under ADR-0007 evidence rules.
