# Phase 1 parser, embedded languages, lowering, and source maps

**Status:** IN PROGRESS  
**Last updated:** 2026-10-10

## Implemented compiler-front-end layers

1. `parser.mjs` — lossless top-level section partitioning and exact UTF-16 source positions.
2. `template-syntax.mjs` — flat structural syntax stream for diagnostics and source ownership.
3. `html-table-ownership.mjs` / `table-structure-validation.mjs` — certified WHATWG table ownership rules and diagnostics.
4. `html-formatting-ownership.mjs` / `formatting-structure-validation.mjs` — high-impact formatting/adoption-agency ownership validation.
5. `template-ast.mjs` — hierarchical ownership transform while preserving the flat stream.
6. `script-lowering.mjs` — TypeScript-backed `EmbeddedScript` adapter and symbol-aware lowering for `state`, `state.raw`, and `derive`.
7. `source-map.mjs` — ECMA-426 identity support, decoded mapping validation/composition, unmapped-scaffolding preservation, and version-3 encoding.

The parser structurally certifies the Phase 0 fixture corpus and currently records **21 certified WHATWG ownership-rewrite scenarios**. Coverage remains intentionally narrower than a duplicate browser parser; unresolved ownership work is limited to remaining active-formatting reconstruction and lower-frequency special/table/template insertion modes.

## Embedded TypeScript implementation

ADR-0005 remains the architecture boundary: Nomos owns durable `EmbeddedScript` / `EmbeddedExpression` records and exact `.nomos` spans; TypeScript AST/Program objects remain opaque adapter internals.

The script half of that boundary is now executable:

- root dependency is exact-pinned to `@typescript/typescript6@6.0.2`;
- `EmbeddedScript` owns raw body text, exact body span, `ts`/explicit `js` language, original filename, virtual filename, and adapter metadata;
- source-level primitive recognition follows TypeScript symbols from actual `nomos` imports, including aliases, instead of identifier spelling;
- shadowing therefore does not accidentally trigger Nomos transforms;
- helper identifiers are generated collision-free against user identifiers;
- `state(initial)` lowers to the internal state-cell ABI;
- `state.raw(initial)` lowers to the same cell ABI with `raw: true`;
- `derive(() => value)` lowers to the internal lazy-derived ABI;
- transparent state/derive reads lower to runtime `read` operations;
- direct root assignment, compound assignment, prefix update, and postfix update lower to runtime writes/update helpers;
- nested property writes continue through the deep-state proxy rather than a second mutation system;
- writes to a derive and statically visible state writes during synchronous derive evaluation emit `NOMOS-REACTIVE-DERIVE-WRITE`.

`EmbeddedExpression` parsing/lowering for template expressions remains planned. Lightning CSS remains planned and uninstalled until executable stylesheet adapter code consumes it.

## Generated source maps

ADR-0006 remains authoritative. The existing exact decoded-map composition core is unchanged.

Reactive script lowering now also produces real TypeScript-emitter version-3 source maps. For `.nomos` component scripts, the compiler preserves the original line/UTF-16-column coordinates by padding the pre-script prefix with coordinate-preserving whitespace before TypeScript parsing, then rewrites `sources`/`sourcesContent` back to the original `.nomos` file and full source. This avoids guessing offsets after emit.

Remaining source-map work is now specifically template/DOM lowering and final multi-stage integration; script lowering is no longer a mapping-free stage.

## Verification history relevant to the current frontier

- Source-map composition core: 4/4 focused tests under Node `v22.16.0` after recorded RED.
- HTML ownership: 21 machine-recorded certified rewrite scenarios across implied-close, table, and high-impact formatting families.
- Reactive script lowering RED: module absent (`ERR_MODULE_NOT_FOUND`).
- Reactive script lowering GREEN: 10/10 focused lowering tests under Node `v22.16.0` using the locally available TypeScript compiler API as an API-compatibility harness.
- Runtime compiler ABI RED: `updateState` export absent.
- Runtime compiler ABI + existing runtime regressions GREEN: 20/20 under Node `v22.16.0`.
- The repository exact-pins `@typescript/typescript6@6.0.2`; this environment does not provide a fresh pnpm installation of that exact package, so a whole-repository pinned-dependency run is not claimed.

## Remaining before `Parser and source maps` can close

- `EmbeddedExpression` adapter/lowering for template expressions;
- `EmbeddedStylesheet` adapter using exact-pinned Lightning CSS when executable code consumes it;
- template/DOM code generation with mapping production and composition;
- remaining material HTML ownership edge cases;
- public `NCON-*` coverage and green evidence for applicable requirements;
- later Vite/HMR integration without silently resolving `OD-003`.

Machine authority: `spec/compiler-front-end.json`, `spec/runtime-core.json`, and `spec/phase-status.json`. Wayfinder map: https://github.com/AahPlexX/nomos/issues/1.
