# Phase 1 parser, embedded languages, lowering, and source maps

**Status:** IN PROGRESS  
**Last updated:** 2026-10-11

## Implemented compiler-front-end layers

1. `parser.mjs` — lossless top-level section partitioning and exact UTF-16 source positions.
2. `template-syntax.mjs` — flat structural syntax stream for diagnostics and source ownership.
3. `html-table-ownership.mjs` / `table-structure-validation.mjs` — certified WHATWG table ownership rules and diagnostics.
4. `html-formatting-ownership.mjs` / `formatting-structure-validation.mjs` — high-impact formatting/adoption-agency ownership validation.
5. `template-ast.mjs` — hierarchical ownership transform while preserving the flat stream.
6. `script-lowering.mjs` — TypeScript-backed `EmbeddedScript` adapter and symbol-aware lowering for `state`, `state.raw`, and `derive`.
7. `expression-lowering.mjs` — TypeScript-backed `EmbeddedExpression` records, symbol-aware reactive reads, lexical-shadowing preservation, and source-translated syntax diagnostics for text interpolations.
8. `template-lowering.mjs` — `TextBinding` IR, collision-safe runtime helper aliases, owner-backed binding setup statements, and first template expression mapping production.
9. `source-map.mjs` — ECMA-426 identity support, decoded mapping validation/composition, unmapped-scaffolding preservation, and version-3 encoding.

The parser structurally certifies the Phase 0 fixture corpus and records **21 certified WHATWG ownership-rewrite scenarios**. Coverage remains intentionally narrower than a duplicate browser parser; unresolved ownership work is limited to material active-formatting reconstruction and lower-frequency special/table/template insertion modes.

## Embedded TypeScript implementation

ADR-0005 remains the architecture boundary: Nomos owns durable `EmbeddedScript` / `EmbeddedExpression` records and exact `.nomos` spans; TypeScript AST/Program/checker objects remain adapter internals.

### EmbeddedScript

The script boundary is executable:

- root dependency is exact-pinned to `@typescript/typescript6@6.0.2`;
- `EmbeddedScript` owns raw body text, exact body span, language (`ts` or explicit `js`), original filename, virtual filename, and adapter metadata;
- source-level primitive recognition follows TypeScript symbols from actual `nomos` imports, including aliases and lexical shadowing;
- `state`, `state.raw`, `derive`, transparent reads, root writes, prefix/postfix updates, and direct reactive-root `for...of` / `for...in` assignment targets lower to the internal runtime ABI;
- nested property writes continue through the deep-state proxy;
- helper and loop-temporary identifiers are collision-safe;
- writes to derives and statically visible state writes during synchronous derive evaluation emit `NOMOS-REACTIVE-DERIVE-WRITE`.

Reactive destructuring assignment targets remain unfinished.

### EmbeddedExpression and text binding IR

The first expression slice is also executable:

- each interpolation produces an `EmbeddedExpression` owning its exact brace span, expression-body span, raw TypeScript expression text, original filename, deterministic virtual filename, and adapter version metadata;
- TypeScript parses the expression inside a deterministic synthetic wrapper rather than Nomos implementing a separate expression parser;
- reactive bindings supplied by script lowering are represented as synthetic declarations and resolved through TypeScript symbol identity;
- lexical shadowing inside the expression therefore prevents accidental reactive rewriting;
- reactive reads lower to the existing internal `read(...)` ABI;
- TypeScript syntax diagnostics are translated back to original `.nomos` offsets/spans;
- successful interpolation lowering produces `TextBinding` IR and an owner-backed `bindText(...)` setup statement.

This is not yet complete template semantic type checking. Nonreactive script constants/imports remain lexical references in generated expression code; a later integrated component/type-checking stage must provide the complete template-visible scope and diagnostics required by the PRD.

## Generated source maps

ADR-0006 remains authoritative. The exact decoded-map composition core is unchanged.

Reactive script lowering produces TypeScript-emitter version-3 source maps rebased to the original `.nomos` source while retaining full `sourcesContent`.

The text-binding slice now emits the first template-stage mappings as well. Every successful `TextBinding` records one exact decoded mapping point from the start of its generated expression code to the start of the original `.nomos` interpolation body. That point is encoded as an ECMA-426 version-3 source map with full original source content.

This is intentionally **partial mapping production**, not token-complete template/DOM mapping. Static DOM scaffolding remains unmapped and actual DOM node materialization/attribute code generation are not implemented yet. Their mappings must be produced in those generation passes and composed through the existing ADR-0006 primitives rather than reconstructed afterward.

## Verification history relevant to the current frontier

- Source-map composition core: 4/4 focused tests under Node `v22.16.0` after recorded RED.
- HTML ownership: 21 machine-recorded certified rewrite scenarios.
- Reactive script lowering: prior recorded module-absent RED; script-focused GREEN established before pinned CI.
- Pinned CI later verified script lowering/ABI at 14/14 and runtime at 20/20.
- Text-binding RED run `38120782593`: exact pinned environment reached tests; 14 existing lowering/ABI tests passed and the feature suite failed because `template-lowering.mjs` did not exist.
- Text-binding GREEN run `38120937878`: lowering/ABI/expression **16/16**, runtime **21/21**, and the then-current Phase 1 machine-state validator green.

## Remaining before `Parser and source maps` can close

- real DOM node materialization and dynamic/mixed/shorthand/spread attribute generation with mappings produced in the same passes;
- complete template semantic/type-check integration beyond the first text-expression slice;
- `EmbeddedStylesheet` adapter using exact-pinned Lightning CSS when executable code consumes it;
- remaining material HTML ownership edge cases;
- public `NCON-*` coverage and green evidence for applicable requirements;
- later Vite/HMR integration without silently resolving `OD-003`.

Machine authority: `spec/compiler-front-end.json`, `spec/runtime-core.json`, and `spec/phase-status.json`. Wayfinder map: https://github.com/AahPlexX/nomos/issues/1.
