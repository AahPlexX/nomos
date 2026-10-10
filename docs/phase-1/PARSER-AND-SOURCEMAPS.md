# Phase 1 parser and source-map implementation

**Status:** IN PROGRESS  
**Last updated:** 2026-10-10

## Implemented compiler-front-end layers

1. `parser.mjs` — lossless top-level section partitioning and exact source positions.
2. `template-syntax.mjs` — flat structural syntax stream for diagnostics and source ownership.
3. `html-table-ownership.mjs` — pure WHATWG table start-tag ownership/rewrite rules.
4. `table-structure-validation.mjs` — table ownership diagnostics over the flat syntax stream, including full-stack repair after browser-implied closes.
5. `template-ast.mjs` — hierarchical ownership transform for lowering/semantic analysis while preserving the flat stream.
6. `source-map.mjs` — ECMA-426 identity pass-through support plus decoded mapping validation, exact stage composition, unmapped generated scaffolding preservation, and version-3 encoding with `sourcesContent`.

The executable parser structurally certifies all seven valid and four invalid Phase 0 fixtures and provides the stable parser diagnostics recorded under `docs/diagnostics/`.

## HTML ownership validation

`NOMOS-PARSE-HTML-OWNERSHIP` now records **18 certified WHATWG tree-construction rewrite scenarios**.

Covered families include:

- block-like start tags implicitly closing an open paragraph;
- repeated `li`, `dt`/`dd`, and nested `button` implied closes;
- table foster-parenting of non-whitespace text and ordinary elements;
- browser-inserted `tbody`, `tr`, and `colgroup` wrappers;
- table cell and row auto-close behavior;
- caption, `thead`/`tbody`/`tfoot`, and `colgroup` transitions that close an active table section;
- section transitions while a row is open;
- caption transitions while a cell is open, which close the cell → row → section chain;
- caption replacement while another caption remains open.

The table diagnostic validator repairs the entire browser-closed chain after one diagnostic. This prevents a single invalid table transition from leaving stale synthetic ownership on the validation stack and producing misleading secondary diagnostics.

Explicit table wrappers, explicit section/row/cell boundaries, explicit `colgroup`, and ordinary content inside valid cells remain accepted.

Coverage remains partial. Remaining work is narrowed to formatting/adoption-agency behavior plus lower-frequency special/table/template insertion-mode interactions.

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
- Table section transitions: RED 1/7 because six transition rewrites were absent → GREEN 8/8 after implementation; combined with the multi-level stack-repair regression the focused run is GREEN 9/9 under Node `v22.16.0`.
- `tests/phase1-parser-table-transitions.test.mjs` wires the same cases through the public `parseComponent` entrypoint; a fresh full-repository `pnpm` run is not claimed in this environment.

## Remaining before `Parser and source maps` can close

- executable TypeScript/CSS adapters behind ADR-0005;
- remaining WHATWG formatting/adoption-agency and lower-frequency special/table/template insertion-mode ownership validation;
- token/segment mapping production in actual lowering and generated-code stages, composed through the implemented ADR-0006 core;
- public `NCON-*` coverage and green evidence for applicable requirements;
- later Vite/HMR integration without silently resolving `OD-003`.

Machine authority: `spec/compiler-front-end.json` and `spec/phase-status.json`. Wayfinder map: https://github.com/AahPlexX/nomos/issues/1.
