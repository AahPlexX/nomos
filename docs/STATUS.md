# Project status and handoff

**Last verified:** 2026-10-11 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Compiler lowering, runtime reactivity, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler state

The compiler front end has lossless section partitioning, exact UTF-16 source positions, flat and hierarchical template structures, 21 certified WHATWG ownership-rewrite scenarios, ECMA-426 mapping primitives, executable TypeScript `EmbeddedScript` and first `EmbeddedExpression` adapters, reactive script lowering, and the first template text-binding IR/runtime seam.

Accepted architecture remains ADR-0005/0006/0007/0008. All tracked Wayfinder architecture decisions are resolved; the eleven PRD Open Decisions remain separate and unchanged.

### Reactive script lowering

`packages/compiler/src/script-lowering.mjs`:

- exact-pins and consumes `@typescript/typescript6@6.0.2`;
- recognizes imported `state` / `derive` by TypeScript symbol identity, including aliases and lexical shadowing;
- creates durable `EmbeddedScript` metadata with exact original `.nomos` body coordinates;
- lowers `state`, `state.raw`, `derive`, transparent reads, root assignment/compound assignment, prefix/postfix updates, and direct reactive-root `for...of` / `for...in` assignment targets to the internal runtime ABI;
- routes nested object/array/Map/Set property mutation through the existing deep-state proxy rather than a second mutation system;
- uses collision-free generated helper and loop-temporary names;
- emits `NOMOS-REACTIVE-DERIVE-WRITE` for writes to derives and statically visible state writes during synchronous derive evaluation, including loop assignment targets;
- emits TypeScript version-3 source maps rebased to the original `.nomos` source.

Reactive destructuring assignment targets remain unfinished.

### EmbeddedExpression and text bindings

`packages/compiler/src/expression-lowering.mjs` and `template-lowering.mjs` now implement the first template-expression slice without adding a second expression parser:

- every interpolation owns a durable `EmbeddedExpression` with exact outer span, body span, raw TypeScript expression text, virtual identity, and TypeScript adapter metadata;
- TypeScript parses the expression and resolves synthetic reactive declarations by symbol identity;
- reactive state/derive references lower to the existing internal `read(...)` ABI while lexical shadowing inside the expression remains ordinary TypeScript;
- invalid interpolation syntax returns TypeScript diagnostics translated back to original `.nomos` offsets/spans;
- each successful interpolation produces a `TextBinding` IR record with collision-safe node/helper identifiers and an owner-backed `bindText(...)` setup statement;
- each text binding emits an ECMA-426 version-3 map point from the generated expression start to the original `.nomos` expression-body start with full original `sourcesContent`.

This is deliberately **not** full template code generation yet. The compiler does not yet create/materialize actual DOM text nodes, lower dynamic attributes, or provide complete semantic/type checking for every template-visible script/import binding. The next slice must materialize text nodes and attach this proven binding IR to them without duplicating expression or mapping work.

## Current runtime state

ADR-0008's owner graph and two-phase microtask scheduler remain intact. Runtime support includes scalar state, deep property/index/membership/size/iteration tracking for plain objects/arrays/Map/Set, `state.raw`, lazy derives, sync cleanup/ownership, cycle diagnostics, and compiler-only helpers.

`packages/runtime/src/dom-bindings.mjs` now provides internal `bindText(node, compute, options)`. It delegates scheduling to the existing DOM-observer phase, updates `textContent`, and stops updating after owner disposal. It introduces no second scheduler or public root API concept.

`state.snapshot` remains intentionally unimplemented while its required behavior contract and `OD-004` remain unresolved. Query/request cancellation ownership and generated DOM node/attribute integration remain open.

## Verification state

GitHub Actions is the pinned dependency-backed Phase 1 verification surface at `.github/workflows/ci.yml`.

### Text-binding TDD evidence

RED run `38120782593` used the exact pinned toolchain and reached the lowering command successfully. The 14 pre-existing lowering/ABI tests passed, while the new feature suite failed with `ERR_MODULE_NOT_FOUND` for the not-yet-created `template-lowering.mjs`; runtime and machine-state steps were therefore skipped.

GREEN run `38120937878` used:

- Node `22.16.0`;
- pnpm `12.10.1`;
- `@typescript/typescript6@6.0.2`;
- lowering + compiler/runtime ABI + template-expression tests: **16 passed / 0 failed**;
- runtime wildcard suite including `bindText`: **21 passed / 0 failed**;
- Phase 1 machine-state validator: green on the pre-synchronization 57-artifact state.

A final post-synchronization CI run is required whenever the machine validator/docs change. Development/CI regression evidence does **not** promote normative `NCON-*` rows; ADR-0007 still governs public evidence separately.

## Public conformance state

The ADR-0007 public conformance foundation remains implemented. `NCON-NREQ-0145` is wired but `NREQ-0145` remains **planned**, not passing.

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

1. Materialize static text and interpolation placeholder nodes from the hierarchical template AST and connect the existing `TextBinding` IR to those nodes under one owner.
2. Produce code-generation mappings during that same materialization pass and compose them with the existing binding/source-map primitives rather than adding a later remap pass.
3. Add dynamic/mixed attribute expression lowering after text-node materialization is proven.
4. Add reactive destructuring assignment-target lowering when required by the reactive script conformance surface.
5. Implement the Lightning CSS adapter when the scoped-CSS slice consumes it, after a fresh exact version/license/security check.
6. Extend public runtime/compiler conformance only at complete requirement boundaries under ADR-0007.
7. Keep `state.snapshot` blocked until its explicit contract/OD-004 is resolved rather than guessing semantics.
