# Phase 1 parser and source-map implementation

**Status:** IN PROGRESS  
**Last updated:** 2026-10-09

## Implemented compiler-front-end layers

1. `parser.mjs` — lossless top-level section partitioning and exact source positions.
2. `template-syntax.mjs` — flat structural syntax stream for diagnostics and source ownership.
3. `template-ast.mjs` — hierarchical ownership transform for lowering/semantic analysis while preserving the flat stream.
4. `source-map.mjs` — ECMA-426 identity pass-through support plus decoded mapping validation, exact stage composition, unmapped generated scaffolding preservation, and version-3 encoding with `sourcesContent`.

The executable parser structurally certifies all seven valid and four invalid Phase 0 fixtures and provides the stable parser diagnostics recorded under `docs/diagnostics/`.

## HTML ownership validation

`NOMOS-PARSE-HTML-OWNERSHIP` now covers six certified WHATWG tree-construction rewrite families:

- block-like start tags implicitly closing an open paragraph;
- a new `li` start tag implicitly closing an open `li`;
- a new `dt` or `dd` start tag implicitly closing an open `dt`/`dd`;
- a nested `button` start tag implicitly closing the open `button`;
- non-whitespace text in `table`, `tbody`, `tfoot`, `thead`, or `tr` parsing context being foster-parented away from the declared owner;
- ordinary non-table elements in those table parsing contexts being foster-parented away from the declared owner.

Ordinary content inside an explicit `td` or `th` remains accepted. These cases are rejected only where the browser-owned DOM tree would differ from the ownership declared by the Nomos template.

Coverage remains partial. Additional table insertion-mode transitions, implied wrappers/section transitions, formatting-element interactions, and other remaining special-element rewrites are not yet certified.

## Embedded TypeScript/CSS boundary

ADR-0005 and `docs/phase-1/research/embedded-language-representation.md` resolve Wayfinder issue 2. Nomos owns stable source-span/raw-text wrapper IR. TypeScript `SourceFile`/`Program` and Lightning CSS visitor structures are opaque adapter internals. Executable adapters remain unimplemented. Current verified dependency baselines (`@typescript/typescript6@6.0.2`, `lightningcss@1.33.0`) are not installed until consuming code rechecks and exact-pins them.

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
- Expanded implied-close ownership: RED 0/3 because no diagnostics were emitted for `li`, `dt`/`dd`, or nested `button` auto-closes → GREEN 3/3 under Node `v22.16.0`.
- Table foster-parenting ownership: RED 1/3 (valid cell content already passed; the two relocation cases failed) → GREEN 3/3 under Node `v22.16.0`.
- Combined focused ownership regression run after the table change: 11/11 green under Node `v22.16.0`.

## Remaining before `Parser and source maps` can close

- executable TypeScript/CSS adapters behind ADR-0005;
- remaining WHATWG HTML tree-construction ownership validation, including additional table insertion-mode and formatting-element rewrites;
- token/segment mapping production in actual lowering and generated-code stages, composed through the implemented ADR-0006 core;
- public `NCON-*` coverage and green evidence for applicable requirements;
- later Vite/HMR integration without silently resolving `OD-003`.

Machine authority: `spec/compiler-front-end.json` and `spec/phase-status.json`. Wayfinder map: https://github.com/AahPlexX/nomos/issues/1.
