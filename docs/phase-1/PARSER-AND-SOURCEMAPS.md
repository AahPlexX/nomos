# Phase 1 parser, embedded languages, lowering, and source maps

**Status:** IN PROGRESS  
**Last updated:** 2026-10-11

## Implemented compiler-front-end layers

1. `parser.mjs` — lossless top-level section partitioning and exact UTF-16 source positions.
2. `template-syntax.mjs` — flat structural syntax stream for diagnostics and source ownership.
3. `html-table-ownership.mjs` / `table-structure-validation.mjs` — certified WHATWG table ownership rules and diagnostics.
4. `html-formatting-ownership.mjs` / `formatting-structure-validation.mjs` — high-impact formatting/adoption-agency ownership validation.
5. `template-ast.mjs` — hierarchical ownership transform while preserving the flat stream.
6. `script-lowering.mjs` — TypeScript-backed `EmbeddedScript` and symbol-aware reactive lowering.
7. `expression-lowering.mjs` — TypeScript-backed `EmbeddedExpression`, symbol-aware reactive reads, shadowing preservation, and source-translated syntax diagnostics.
8. `template-lowering.mjs` — `TextBinding` IR and owner-backed binding setup statements.
9. `template-dom-lowering.mjs` — static browser-parsed HTML skeleton, collision-free interpolation markers, executable `mountTemplate`/`bindText` code, explicit unsupported-feature guards, and combined template mapping points.
10. `source-map.mjs` — ECMA-426 identity support, decoded mapping validation/composition, unmapped-scaffolding preservation, and version-3 encoding.

The parser structurally certifies the Phase 0 fixture corpus and records **21 certified WHATWG ownership-rewrite scenarios**. Coverage remains intentionally narrower than a duplicate browser parser.

## Embedded TypeScript implementation

ADR-0005 remains the boundary: Nomos owns durable `EmbeddedScript` / `EmbeddedExpression` records and exact `.nomos` spans; TypeScript AST/Program/checker objects remain adapter internals.

- `@typescript/typescript6@6.0.2` is exact-pinned.
- Script lowering recognizes Nomos primitives by TypeScript symbol identity and lowers the implemented reactive reads/writes to the internal ABI.
- Expression lowering uses the same TypeScript adapter rather than a separate Nomos expression parser.
- Template interpolation diagnostics are translated to original `.nomos` offsets/spans.
- Reactive destructuring targets and complete template-visible semantic/type checking remain unfinished.

## Browser-parsed DOM materialization

The first executable template DOM slice deliberately delegates static HTML semantics to the browser rather than reconstructing them from raw AST text:

1. supported template source is retained as a static HTML skeleton;
2. each supported interpolation span is replaced with a deterministic collision-free comment marker;
3. runtime `mountTemplate` parses that skeleton through `HTMLTemplateElement` and clones `template.content`;
4. Nomos markers become empty `Text` nodes exposed as binding slots;
5. generated `bindText` setup attaches existing TypeScript-backed expression computations to those slots;
6. cloned top-level roots are registered with ADR-0008 ownership and are removed on disposal.

This route preserves browser character-reference decoding, namespace construction, and other static HTML parsing behavior instead of creating a second parser inside Nomos. The rationale and primary sources are cached in `docs/phase-1/research/dom-materialization.md`.

Trusted Types enforcement is supported by creating/caching a `nomos` policy for the compiler-owned static skeleton. If the host CSP does not allow that policy name, runtime fails explicitly rather than bypassing enforcement.

Until dedicated lowerers exist, `NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE` stops generation for dynamic/mixed/shorthand/spread attributes, directives, raw HTML, structural blocks, component nodes, and interpolation contexts incompatible with comment markers.

## Generated source maps

ADR-0006 remains authoritative.

- Reactive script lowering produces TypeScript-emitter version-3 maps rebased to original `.nomos` source with full `sourcesContent`.
- `TextBinding` emits the expression-start → original interpolation-body-start mapping.
- `lowerTemplateDom` now emits one template-stage map containing explicit points for the mount statement, each binding-slot declaration/setup statement, and each lowered expression start.

Template mapping remains intentionally **partial**, not token-complete. Static generated string/scaffolding regions without a meaningful one-to-one source position remain unmapped. Attribute/event/structural/component stages must emit their own mapping points when implemented rather than reconstructing provenance after code generation.

## Verification history at the current frontier

- Source-map composition core: 4/4 focused tests after recorded RED.
- HTML ownership: 21 machine-recorded certified rewrite scenarios.
- Text-expression RED `38120782593`; GREEN `38120937878` with lowering **16/16** and runtime **21/21**.
- Browser-DOM RED `38122206062`: exact environment reached the focused gates; both failed on missing `lowerTemplateDom` / `mountTemplate`.
- Browser-DOM GREEN `38122323711`:
  - focused DOM boundary tests **3/3**;
  - real Chrome `154.0.8037.97` under Trusted Types enforcement;
  - character-reference decoding, SVG namespace preservation, dynamic text, and owner disposal verified;
  - existing lowering **16/16**, runtime **21/21**, and machine validator green on the pre-document-sync state.

## Remaining before `Parser and source maps` can close

- typed exact-span attribute-value IR and dynamic/mixed/shorthand/spread lowering;
- events/native-control bindings and their assignment policy;
- structural blocks, lists, components, and complete template semantic/type checking;
- richer token-level mappings emitted by those stages;
- `EmbeddedStylesheet` adapter using exact-pinned Lightning CSS when executable code consumes it;
- remaining material HTML ownership edge cases;
- public `NCON-*` coverage/evidence at complete requirement boundaries;
- later Vite/HMR integration without silently resolving `OD-003`.

Machine authority: `spec/compiler-front-end.json`, `spec/runtime-core.json`, and `spec/phase-status.json`. Wayfinder map: https://github.com/AahPlexX/nomos/issues/1.
