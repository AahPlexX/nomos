# Phase 1 parser and source-map implementation

**Status:** IN PROGRESS  
**Last updated:** 2026-10-10

## Implemented compiler-front-end layers

1. `parser.mjs` — lossless top-level section partitioning and exact source positions.
2. `template-syntax.mjs` — flat structural syntax stream for diagnostics and source ownership.
3. `html-table-ownership.mjs` — pure WHATWG table start-tag ownership/rewrite rules.
4. `table-structure-validation.mjs` — table ownership diagnostics over the flat syntax stream, including full-stack repair after browser-implied closes.
5. `html-formatting-ownership.mjs` — pure high-impact formatting/adoption-agency ownership rules.
6. `formatting-structure-validation.mjs` — formatting ownership diagnostics and validation-stack repair over the flat syntax stream.
7. `template-ast.mjs` — hierarchical ownership transform for lowering/semantic analysis while preserving the flat stream.
8. `source-map.mjs` — ECMA-426 identity pass-through support plus decoded mapping validation, exact stage composition, unmapped generated scaffolding preservation, and version-3 encoding with `sourcesContent`.

The executable parser structurally certifies all seven valid and four invalid Phase 0 fixtures and provides the stable parser diagnostics recorded under `docs/diagnostics/`.

## HTML ownership validation

`NOMOS-PARSE-HTML-OWNERSHIP` now records **21 certified WHATWG tree-construction rewrite scenarios**.

Previously certified coverage includes paragraph/list/button implied closes, table foster-parenting, browser-inserted `tbody`/`tr`/`colgroup` wrappers, row/cell auto-close, caption/section/column-group transitions, and multi-level cell → row → section close chains.

This pass adds three high-impact formatting families:

- a nested `a` start tag, where HTML recovery closes/removes the earlier active anchor before inserting the next anchor;
- a nested `nobr` start tag, where HTML recovery invokes the adoption agency algorithm before inserting the next `nobr`;
- a misnested end tag for an active formatting element when another element is still current, which invokes adoption-agency restructuring and can pop, recreate, or reparent nodes.

Nomos does not attempt to reproduce the complete browser adoption-agency algorithm. Instead, it rejects these certified ownership-changing source structures before browser recovery can make the DOM differ from the ownership tree used by the compiler. `docs/phase-1/research/html-formatting-ownership.md` records the current authoritative WHATWG rationale and boundary.

The table and formatting validators repair their own synthetic open-element stacks after a reported rewrite. This keeps one invalid construct from producing misleading secondary diagnostics.

Coverage remains partial. Remaining work is narrowed to active-formatting reconstruction edge cases plus lower-frequency special/table/template insertion-mode interactions.

## Embedded TypeScript/CSS boundary

ADR-0005 and `docs/phase-1/research/embedded-language-representation.md` resolve Wayfinder issue 2. Nomos owns stable source-span/raw-text wrapper IR. TypeScript `SourceFile`/`Program` and Lightning CSS visitor structures are opaque adapter internals. Executable adapters remain unimplemented. Current verified dependency baselines (`@typescript/typescript6@6.0.2`, `lightningcss@1.33.0`) are not installed until consuming code exact-pins them.

## Generated source-map composition

ADR-0006 and `docs/phase-1/research/source-map-composition.md` resolve Wayfinder issue 3.

Implemented core:

- decoded mapping positions are zero-based UTF-16 line/column pairs;
- decoded mappings are strictly ordered and validated;
- exact downstream mapping points compose through an intermediate stage to the original source;
- compiler-generated scaffolding remains explicitly unmapped;
- unresolved intermediate positions fail instead of receiving fabricated provenance;
- optional names survive composition when meaningful;
- validated decoded mappings encode to ECMA-426 version-3 `mappings`, `sources`, `sourcesContent`, and `names`.

The current composer intentionally requires exact intermediate mapping points. It does not infer or interpolate provenance between mapping segments. Real lowering/code-generation stages must therefore emit sufficient token/segment mapping points for every downstream position they reference.

## Verification history

- Parser/source-map baseline: 8/8 green after nested-section regression fix.
- Structural parser: RED 8/3 → GREEN 11/0.
- Hierarchical AST: regression RED via missing transform → GREEN 4/4 focused hierarchy/annotator tests.
- Source-map composition: RED because the new exports were absent → GREEN 4/4 focused composition/validation/encoding tests under Node `v22.16.0`.
- Expanded implied-close ownership: RED 0/3 → GREEN 3/3 under Node `v22.16.0`.
- Table foster-parenting ownership: RED 1/3 → GREEN 3/3 under Node `v22.16.0`.
- Table wrapper/row/cell rules: RED because helper/integration modules were absent → GREEN 10/10 focused tests under Node `v22.16.0`.
- Table section transitions + stack repair: RED 1/7 plus a separate 2-diagnostic stack regression → GREEN 9/9 under Node `v22.16.0`.
- Formatting rules: RED because `html-formatting-ownership.mjs` was absent → GREEN 5/5 under Node `v22.16.0`.
- Formatting diagnostics: RED because `formatting-structure-validation.mjs` was absent → combined rules + diagnostics GREEN 9/9 under Node `v22.16.0`.
- `tests/phase1-parser-formatting-integration.test.mjs` wires the same cases through the public `parseComponent` entrypoint; a fresh full-repository `pnpm` run is not claimed in this environment.

## Remaining before `Parser and source maps` can close

- executable TypeScript/CSS adapters behind ADR-0005;
- remaining active-formatting reconstruction and lower-frequency special/table/template insertion-mode ownership validation;
- token/segment mapping production in actual lowering and generated-code stages, composed through the implemented ADR-0006 core;
- public `NCON-*` coverage and green evidence for applicable requirements;
- later Vite/HMR integration without silently resolving `OD-003`.

Machine authority: `spec/compiler-front-end.json` and `spec/phase-status.json`. Wayfinder map: https://github.com/AahPlexX/nomos/issues/1.
