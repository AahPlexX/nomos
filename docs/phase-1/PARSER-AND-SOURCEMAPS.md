# Phase 1 parser, embedded languages, lowering, and source maps

**Status:** IN PROGRESS  
**Last updated:** 2026-10-14

## Implemented compiler-front-end layers

1. `parser.mjs` — lossless top-level section partitioning and exact UTF-16 source positions.
2. `template-syntax.mjs` — flat structural syntax stream for diagnostics and source ownership.
3. `attribute-ir.mjs` — typed exact-span IR for static, dynamic, mixed, shorthand, and spread attributes; directives remain separate.
4. HTML ownership modules — 21 certified WHATWG ownership scenarios plus same-span specialized table-diagnostic precedence.
5. `template-ast.mjs` — hierarchical ownership transform consuming typed attribute IR.
6. `script-lowering.mjs` / `expression-lowering.mjs` — TypeScript 6-backed reactive script and embedded-expression lowering.
7. `template-lowering.mjs` — text-binding IR.
8. `template-dom-lowering.mjs` — browser-parsed static skeleton, text markers, deterministic element markers, all four standard-HTML runtime attribute forms, safety guards, source-ordered grouped spread plans, and template/attribute mapping points.
9. `source-map.mjs` — ECMA-426 mapping validation/composition and version-3 encoding.
10. `packages/shared/src/html-attribute-policy.mjs` — shared standard-HTML boolean/name/URL/event attribute policy consumed by compiler and runtime.

The pinned parser gate is **66/66** green. Coverage remains intentionally narrower than a duplicate browser parser.

## Typed attributes and executable assignment

The hierarchical AST preserves all five ratified forms: static, dynamic, mixed, shorthand, spread. Raw `.nomos` spans remain authoritative and directives remain separate.

Runtime assignment now consumes all four runtime-assigned forms on standard HTML elements:

- dynamic `name={expression}`;
- mixed quoted values with text/expression parts;
- shorthand `{identifier}`;
- spread `{...expression}`.

Expressions reuse the TypeScript 6 `EmbeddedExpression` adapter. Elements requiring assignment receive collision-free temporary marker attributes in the static HTML skeleton. Runtime `mountTemplate` discovers and removes those markers after browser parsing and exposes deterministic element slots.

Elements without spread continue using focused `bindAttribute` observers. Elements with any spread use one `bindAttributes` plan containing static, explicit-runtime, and spread entries in authored order. This makes collision semantics deterministic: left-to-right evaluation, later entry wins. When a spread later drops a key, full-plan recomputation restores any earlier contributor or removes the stale key.

Spread sources treat `null` / `undefined` as no-op and otherwise consume enumerable own string keys only. Names are ASCII-normalized for standard HTML. Runtime-discovered `on*` and currently-unvalidated URL-bearing spread keys fail before DOM mutation.

Ordinary content attributes remove on `null`/`undefined` when they are the winning value and otherwise stringify. Certified boolean HTML attributes use presence/absence semantics. Full policy and primary platform references are cached in `docs/phase-1/research/html-attribute-assignment.md`.

Dynamic custom-element assignment, including spread, remains guarded under `OD-008`; statically visible dynamic URL-bearing expressions remain guarded pending the protocol safety validator; inline event attributes remain rejected; property-backed native-control state belongs to `bind:`.

## Browser-parsed DOM materialization

Supported static source remains one browser-parsed `HTMLTemplateElement` skeleton. Text interpolation spans become comment markers replaced with `Text` nodes. Attribute-bound elements use temporary marker attributes removed immediately after clone discovery. Static values used as fallbacks in grouped spread plans are captured from the browser-parsed element, preserving entity decoding. Cloned roots remain ADR-0008-owned. Trusted Types enforcement uses the existing `nomos` policy-name contract.

## Generated source maps

ADR-0006 remains authoritative. Script maps target original `.nomos`. Template DOM lowering emits explicit mapping points for mount setup, text binding setup/expression starts, ordinary attribute binding setup/expression starts, grouped spread setup, and every spread/neighbor expression start in the same generation pass. Mapping remains point-based rather than token-complete; future event/block/component stages must emit their own provenance instead of reconstructing it later.

## Verification history at the current frontier

- Parser: **66/66**.
- Dynamic/mixed/shorthand behavioral RED `38168546695`; corrected browser-verified GREEN `38169465234` established the first 3/4 runtime forms.
- Spread behavioral RED `38637069602`: existing parser/browser behavior remained green while `bindAttributes` and compiler spread lowering were absent.
- Spread implementation GREEN `38638143259`: focused DOM/browser units **11/11**, Chrome `154.0.8037.97` under Trusted Types, lowering **16/16**, runtime **26/26**.
- Public conformance promotion remains separate under ADR-0007.

## Remaining before `Parser and source maps` can close

- dynamic URL protocol safety validation and the built-in standard-HTML attribute/property assignment table;
- events/native-control bindings;
- structural blocks, lists, components, and complete template semantic/type checking;
- richer mappings emitted by those stages;
- `EmbeddedStylesheet` adapter using exact-pinned Lightning CSS when executable code consumes it;
- remaining material HTML ownership edge cases;
- public `NCON-*` evidence at complete requirement boundaries;
- Vite/HMR integration without silently resolving `OD-003`.

Machine authority: `spec/compiler-front-end.json`, `spec/runtime-core.json`, and `spec/phase-status.json`. Wayfinder map: https://github.com/AahPlexX/nomos/issues/1.
