# Project status and handoff

**Last verified:** 2026-10-10 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Compiler lowering, runtime reactivity, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler state

The compiler front end now has lossless section partitioning, exact UTF-16 source positions, flat and hierarchical template structures, 21 certified WHATWG ownership-rewrite scenarios, ECMA-426 mapping primitives, an executable TypeScript `EmbeddedScript` adapter, and the first reactive script-lowering bridge.

Accepted architecture remains ADR-0005/0006/0007/0008. All tracked Wayfinder architecture decisions are resolved; the eleven PRD Open Decisions remain separate and unchanged.

### Reactive script lowering

`packages/compiler/src/script-lowering.mjs` now:

- exact-pins and consumes `@typescript/typescript6@6.0.2` through the root dependency contract;
- recognizes imported `state` / `derive` by TypeScript symbol identity, including aliases and lexical shadowing;
- creates durable `EmbeddedScript` metadata with exact original `.nomos` body coordinates;
- lowers `state`, `state.raw`, `derive`, transparent reads, root assignment/compound assignment, and prefix/postfix updates to the internal runtime ABI;
- routes nested object/array/Map/Set property mutation through the existing deep-state proxy rather than a second mutation system;
- generates collision-free internal helper names;
- emits `NOMOS-REACTIVE-DERIVE-WRITE` for writes to derives and statically visible state writes during synchronous derive evaluation;
- emits TypeScript version-3 source maps and rebases component-script map identity/`sourcesContent` to the full original `.nomos` source while preserving original line/UTF-16-column coordinates.

The internal compiler ABI is concrete at `packages/runtime/src/internal.mjs`; it does not add a public root concept.

Remaining compiler work includes `EmbeddedExpression`/template expression lowering, the CSS adapter, generated DOM bindings, template/DOM mapping production, and the narrow remaining HTML ownership cases.

## Current runtime state

ADR-0008's owner graph and two-phase microtask scheduler remain intact. Runtime support includes scalar state, deep property/index/membership/size/iteration tracking for plain objects/arrays/Map/Set, `state.raw` runtime semantics, stable cycle-safe proxies, lazy derives, sync cleanup/ownership, cycle diagnostics, and the new internal `updateState` helper used by compiler-generated prefix/postfix updates.

`state.snapshot` remains intentionally unimplemented while its required behavior contract and `OD-004` remain unresolved. Query/request cancellation ownership and generated DOM binding integration are also still open.

## Public conformance state

The ADR-0007 public conformance foundation remains implemented. `NCON-NREQ-0145` is wired but `NREQ-0145` remains **planned**, not passing. Development tests do not promote normative requirement rows.

## Verification history — current frontier

```text
Reactive script lowering RED: lowering module absent -> ERR_MODULE_NOT_FOUND.
Reactive script lowering GREEN: 10 passed / 0 failed under Node v22.16.0 using the locally available TypeScript compiler API as an API-compatibility harness.
Runtime compiler ABI RED: updateState export absent.
Runtime compiler ABI + existing runtime regressions GREEN: 20 passed / 0 failed under Node v22.16.0.
Lowering/runtime modules pass Node syntax validation.
Exact current package baseline rechecked: @typescript/typescript6 6.0.2, Apache-2.0; TypeScript 7.0 still has no stable programmatic API.
```

The repository now exact-pins `@typescript/typescript6@6.0.2`. This execution environment does not provide a fresh pnpm install of that exact dependency, so do not claim a whole-repository pinned-dependency `pnpm check` until one actually runs. Likewise, do not claim public `NCON-*` green evidence until the ADR-0007 evidence conditions are met.

## Wayfinder / Handoff

Map: https://github.com/AahPlexX/nomos/issues/1

Resolved:
- issue 2 — embedded TypeScript/CSS boundary → ADR-0005.
- issue 3 — generated source-map composition → ADR-0006.
- issue 4 — runtime ownership/scheduler architecture → ADR-0008.
- issue 5 — public conformance promotion workflow → ADR-0007.

Portable Handoff: `/tmp/nomos-phase1-handoff.md`. Canonical facts remain in this repository, machine specs, ADRs, and the Wayfinder map.

## Immediate next action

1. Lower template interpolations/text bindings onto the DOM-observer phase, producing source-map segments during the same lowering pass.
2. Implement `EmbeddedExpression` parsing/lowering using the now-installed TypeScript compatibility adapter instead of building another expression parser.
3. Add attribute binding lowering after text binding semantics are proven.
4. Implement the Lightning CSS adapter when the scoped-CSS slice consumes it, after a fresh exact version/license/security check.
5. Extend public runtime/compiler conformance at requirement boundaries; promote ledger rows only under ADR-0007 evidence rules.
6. Keep `state.snapshot` blocked until its explicit contract/OD-004 is resolved rather than guessing semantics.
