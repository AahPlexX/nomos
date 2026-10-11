# Phase 1 parser, embedded languages, lowering, and source maps

**Status:** IN PROGRESS  
**Last updated:** 2026-10-11

## Implemented compiler-front-end layers

1. `parser.mjs` — lossless top-level section partitioning and exact UTF-16 source positions.
2. `template-syntax.mjs` — flat structural syntax stream for diagnostics and source ownership.
3. `attribute-ir.mjs` — typed exact-span IR for static, dynamic, mixed, shorthand, and spread attributes; directives remain separate.
4. `html-table-ownership.mjs` / `table-structure-validation.mjs` — certified WHATWG table ownership rules, stack repair, and same-span generic-diagnostic replacement.
5. `html-formatting-ownership.mjs` / `formatting-structure-validation.mjs` — high-impact formatting/adoption-agency ownership validation.
6. `template-ast.mjs` — hierarchical ownership transform consuming typed attribute IR while retaining the flat syntax stream for diagnostics/debugging.
7. `script-lowering.mjs` — TypeScript-backed `EmbeddedScript` and symbol-aware reactive lowering.
8. `expression-lowering.mjs` — TypeScript-backed `EmbeddedExpression`, symbol-aware reactive reads, shadowing preservation, and source-translated syntax diagnostics.
9. `template-lowering.mjs` — `TextBinding` IR and owner-backed binding setup statements.
10. `template-dom-lowering.mjs` — static browser-parsed HTML skeleton, interpolation markers, executable `mountTemplate`/`bindText` code, explicit unsupported-feature guards, and template mapping points.
11. `source-map.mjs` — ECMA-426 identity support, decoded mapping validation/composition, unmapped-scaffolding preservation, and version-3 encoding.

The pinned parser gate now runs on every main push. Latest run `38122979344` is **66/66** green. The parser still records 21 certified WHATWG ownership-rewrite scenarios; coverage remains intentionally narrower than a duplicate browser parser.

## Typed attribute IR

The ratified grammar has five non-directive forms and the hierarchical AST now preserves all five rather than retaining only attribute names:

- `static`: exact name/span plus nullable value/value span and quote metadata;
- `dynamic`: exact attribute/name/value spans plus expression raw text/body span;
- `mixed`: exact quoted value with ordered `TextPart` / `ExpressionPart` segments;
- `shorthand`: exact `{identifier}` span and expression record;
- `spread`: exact `{...expression}` span and expression record.

Nested brace expressions are preserved. Raw source remains authoritative; this stage does not decode HTML entities or assign DOM semantics. Directives remain on `Element.directives`.

## Ownership diagnostic precedence

The newly enabled CI parser gate exposed six existing integration cases where generic table foster-parenting and the specialized table validator both diagnosed the same start-tag token. The fix does not disable either validator. When a specialized table rewrite is detected, `table-structure-validation.mjs` removes only an existing `NOMOS-PARSE-HTML-OWNERSHIP` diagnostic with the exact same source span, then emits the more precise table diagnostic. All parser tests, including the formerly failing integration cases, now pass.

## Embedded TypeScript implementation

ADR-0005 remains the boundary: Nomos owns durable embedded records and exact `.nomos` spans; TypeScript AST/Program/checker objects remain adapter internals. `@typescript/typescript6@6.0.2` remains exact-pinned. Script/expression lowering share the same adapter rather than duplicating an expression parser.

## Browser-parsed DOM materialization

Supported static template source is retained as one HTML skeleton, dynamic text interpolation spans become collision-free comment markers, and runtime `mountTemplate` lets `HTMLTemplateElement` perform actual HTML parsing before replacing markers with live `Text` binding nodes. Cloned roots are ADR-0008-owned and are removed on disposal. Trusted Types enforcement uses the existing `nomos` policy-name contract.

Typed attribute IR is now available, but dynamic/mixed/shorthand/spread **runtime assignment is still intentionally rejected** until its assignment policy/lowering is implemented. Custom-element property/pre-upgrade behavior remains untouched while `OD-008` is open.

## Generated source maps

ADR-0006 remains authoritative. Script maps target original `.nomos`; text/template DOM lowering emits explicit mapping points during generation. Template mapping remains partial, not token-complete. Attribute/event/structural/component stages must add their own mapping points when implemented rather than reconstructing provenance later.

## Verification history at the current frontier

- Source-map composition core: 4/4 focused tests after recorded RED.
- Text-expression RED `38120782593`; GREEN `38120937878`: lowering **16/16**, runtime **21/21**.
- Browser-DOM RED `38122206062`; GREEN `38122323711`: DOM **3/3** plus real Chrome `154.0.8037.97` under Trusted Types enforcement.
- Attribute IR RED `38122824413`: the intended attribute tests failed and the newly enabled parser gate exposed six latent duplicate ownership failures.
- Attribute/table GREEN `38122979344`: parser **66/66**, DOM **3/3 + real Chrome**, lowering **16/16**, runtime **21/21**, machine validator green. No regression expectations were weakened.

## Remaining before `Parser and source maps` can close

- dynamic/mixed/shorthand/spread attribute lowering and the built-in attribute/property assignment table;
- events/native-control bindings;
- structural blocks, lists, components, and complete template semantic/type checking;
- richer mappings emitted by those stages;
- `EmbeddedStylesheet` adapter using exact-pinned Lightning CSS when executable code consumes it;
- remaining material HTML ownership edge cases;
- public `NCON-*` evidence at complete requirement boundaries;
- later Vite/HMR integration without silently resolving `OD-003`.

Machine authority: `spec/compiler-front-end.json`, `spec/runtime-core.json`, and `spec/phase-status.json`. Wayfinder map: https://github.com/AahPlexX/nomos/issues/1.
