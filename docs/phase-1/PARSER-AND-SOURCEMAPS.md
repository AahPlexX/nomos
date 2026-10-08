# Phase 1 parser and source-map implementation

**Status:** IN PROGRESS  
**Last updated:** 2026-10-08

## Implemented compiler-front-end layers

1. `parser.mjs` — lossless top-level section partitioning and exact source positions.
2. `template-syntax.mjs` — flat structural syntax stream for diagnostics and source ownership.
3. `template-ast.mjs` — hierarchical ownership transform for lowering/semantic analysis while preserving the flat stream.
4. `source-map.mjs` — current ECMA-426 identity line-start primitive for genuinely 1:1 pass-through code.

The executable parser structurally certifies all seven valid and four invalid Phase 0 fixtures and provides the stable parser diagnostics recorded under `docs/diagnostics/`.

## Embedded TypeScript/CSS boundary

ADR-0005 and `docs/phase-1/research/embedded-language-representation.md` resolve Wayfinder issue 2. Nomos owns stable source-span/raw-text wrapper IR. TypeScript `SourceFile`/`Program` and Lightning CSS visitor structures are opaque adapter internals. Executable adapters remain unimplemented. Current verified dependency baselines (`@typescript/typescript6@6.0.2`, `lightningcss@1.33.0`) are not installed until consuming code rechecks and exact-pins them.

## Generated source-map composition

ADR-0006 and `docs/phase-1/research/source-map-composition.md` resolve Wayfinder issue 3.

Contract:

- every position-changing compiler stage maps output to its immediate input;
- position-preserving stages may forward the existing map;
- generated-only scaffolding is explicitly unmapped;
- stage maps compose in pipeline order until mapped final segments resolve to the original `.nomos` source;
- final maps include original source content and are validated before Vite/Rolldown handoff;
- generated/original JavaScript and CSS columns use ADR-0004 UTF-16 semantics;
- Phase 1 does not depend on experimental scope/range extensions.

The current identity line-start map is therefore only a pass-through primitive, not completion of generated-code mapping.

## Verification history

- Parser/source-map baseline: 8/8 green after nested-section regression fix.
- Structural parser: RED 8/3 → GREEN 11/0.
- Hierarchical AST: regression RED via missing transform → GREEN 4/4 focused hierarchy/annotator tests.

## Remaining before `Parser and source maps` can close

- executable TypeScript/CSS adapters behind ADR-0005;
- broader WHATWG HTML tree-construction ownership validation;
- decoded segment-map and stage-composition implementation behind ADR-0006;
- exact public `NCON-*` conformance wiring before requirement promotion;
- later Vite/HMR integration without silently resolving `OD-003`.

Machine authority: `spec/compiler-front-end.json` and `spec/phase-status.json`. Wayfinder map: https://github.com/AahPlexX/nomos/issues/1.
