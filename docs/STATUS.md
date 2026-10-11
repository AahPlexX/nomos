# Project status and handoff

**Last verified:** 2026-10-10 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Compiler lowering, runtime reactivity, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler state

The compiler front end has lossless section partitioning, exact UTF-16 source positions, flat and hierarchical template structures, 21 certified WHATWG ownership-rewrite scenarios, ECMA-426 mapping primitives, an executable TypeScript `EmbeddedScript` adapter, and reactive script lowering.

Accepted architecture remains ADR-0005/0006/0007/0008. All tracked Wayfinder architecture decisions are resolved; the eleven PRD Open Decisions remain separate and unchanged.

### Reactive script lowering

`packages/compiler/src/script-lowering.mjs` now:

- exact-pins and consumes `@typescript/typescript6@6.0.2`;
- recognizes imported `state` / `derive` by TypeScript symbol identity, including aliases and lexical shadowing;
- creates durable `EmbeddedScript` metadata with exact original `.nomos` body coordinates;
- lowers `state`, `state.raw`, `derive`, transparent reads, root assignment/compound assignment, prefix/postfix updates, and direct reactive-root `for...of` / `for...in` assignment targets to the internal runtime ABI;
- routes nested object/array/Map/Set property mutation through the existing deep-state proxy rather than a second mutation system;
- uses collision-free generated helper and loop-temporary names;
- emits `NOMOS-REACTIVE-DERIVE-WRITE` for writes to derives and statically visible state writes during synchronous derive evaluation, including loop assignment targets;
- emits TypeScript version-3 source maps and rebases component-script map identity/`sourcesContent` to the full original `.nomos` source while preserving original line/UTF-16-column coordinates.

The internal compiler ABI is concrete at `packages/runtime/src/internal.mjs`; it does not add a public root concept.

Remaining compiler work includes destructuring assignment-target lowering, `EmbeddedExpression`/template expression lowering, the CSS adapter, generated DOM bindings, template/DOM mapping production, and the narrow remaining HTML ownership cases.

## Current runtime state

ADR-0008's owner graph and two-phase microtask scheduler remain intact. Runtime support includes scalar state, deep property/index/membership/size/iteration tracking for plain objects/arrays/Map/Set, `state.raw` runtime semantics, stable cycle-safe proxies, lazy derives, sync cleanup/ownership, cycle diagnostics, and the internal `updateState` helper used by compiler-generated prefix/postfix updates.

`state.snapshot` remains intentionally unimplemented while its required behavior contract and `OD-004` remain unresolved. Query/request cancellation ownership and generated DOM binding integration are also still open.

## Verification state

GitHub Actions now provides the pinned dependency-backed Phase 1 verification surface at `.github/workflows/ci.yml`.

Verified run `38102821673` used:

- Node `22.16.0`;
- pnpm `12.10.1`;
- `@typescript/typescript6@6.0.2`;
- lowering + compiler/runtime ABI: **14 passed / 0 failed**;
- runtime wildcard suite: **20 passed / 0 failed**;
- Phase 1 machine-state validator: green.

The first workflow attempt failed before tests because Node Corepack could not activate the pnpm 12.10.1 binary from its cache. The workflow was corrected to use `pnpm/action-setup@v6.1.0`. Therefore the loop-target regression tests were written before the fix, but a true executable RED for those tests was not observed; do not relabel that slice as a complete red-green TDD cycle.

This dependency-backed CI evidence replaces the previous limitation that exact-pinned lowering could not be executed in this working environment. It does **not** promote any normative `NCON-*` requirement; ADR-0007 public evidence rules still apply separately.

## Public conformance state

The ADR-0007 public conformance foundation remains implemented. `NCON-NREQ-0145` is wired but `NREQ-0145` remains **planned**, not passing. Development/CI regression tests do not automatically promote normative requirement rows.

## Wayfinder / Handoff

Map: https://github.com/AahPlexX/nomos/issues/1

Resolved:
- issue 2 — embedded TypeScript/CSS boundary → ADR-0005.
- issue 3 — generated source-map composition → ADR-0006.
- issue 4 — runtime ownership/scheduler architecture → ADR-0008.
- issue 5 — public conformance promotion workflow → ADR-0007.

No Wayfinder architecture decision ticket remains open. The eleven PRD Open Decisions remain separate and unchanged.

Portable Handoff: `/tmp/nomos-phase1-handoff.md`. Canonical facts remain in this repository, machine specs, ADRs, CI, and the Wayfinder map.

## Immediate next action

1. Lower template interpolations/text bindings onto the DOM-observer phase, producing source-map segments during the same lowering pass.
2. Implement `EmbeddedExpression` parsing/lowering using the existing TypeScript compatibility adapter instead of building another expression parser.
3. Add attribute binding lowering after text binding semantics are proven.
4. Add destructuring assignment-target lowering when required by the reactive script conformance surface.
5. Implement the Lightning CSS adapter when the scoped-CSS slice consumes it, after a fresh exact version/license/security check.
6. Extend public runtime/compiler conformance at requirement boundaries; promote ledger rows only under ADR-0007 evidence rules.
7. Keep `state.snapshot` blocked until its explicit contract/OD-004 is resolved rather than guessing semantics.
