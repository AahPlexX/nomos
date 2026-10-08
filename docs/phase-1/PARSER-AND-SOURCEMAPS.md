# Phase 1 parser and source-map implementation

**Status:** IN PROGRESS  
**Last updated:** 2026-10-08

## Implemented layers

The compiler front end deliberately separates:

1. `parser.mjs` — lossless top-level section partitioning and exact source positions.
2. `template-syntax.mjs` — flat structural syntax used for diagnostics and marker/source ownership.
3. `template-ast.mjs` — hierarchical template ownership consumed by lowering/semantic analysis while preserving the flat stream.

Current guarantees include exact UTF-16 source spans, CRLF-aware diagnostics, structural validation of the complete Phase 0 parser corpus, stable reserved parser diagnostics, hierarchical element/block ownership with exact spans, and the ADR-0004 ECMA-426 identity-map baseline.

## Embedded-language boundary

Research: `docs/phase-1/research/embedded-language-representation.md`  
Decision: `docs/adr/0005-embedded-language-adapter-boundary.md`  
Wayfinder ticket: https://github.com/AahPlexX/nomos/issues/2

ADR-0005 establishes a Nomos-owned adapter boundary:

- `EmbeddedScript` and `EmbeddedExpression` own exact `.nomos` spans/raw text and isolate the current TypeScript programmatic parser behind opaque adapter handles.
- `EmbeddedStylesheet` owns exact style-section spans/raw text and isolates Lightning CSS typed visitor/transform structures behind the same kind of boundary.
- Nomos source spans are authoritative; third-party location objects cannot overwrite them.
- TypeScript 6 `SourceFile` / `Program` and Lightning CSS visitor structures are implementation details, not durable/public Nomos IR.
- The verified dependency baselines are `@typescript/typescript6@6.0.2` and `lightningcss@1.33.0`, but neither is added until executable adapter code consumes it and the dependency policy is rechecked.
- This decision does not resolve `OD-009` (TypeScript 7.1+ API adoption timing).

## Source-map state

The current primitive is an ECMA-426 `version: 3` identity line-start map with `sourcesContent`. Token/segment generated-code mapping and cross-stage composition remain open under Wayfinder issue 3.

## Verification history

- First parser slice: 8/8 green after the nested-section regression fix.
- Structural parser slice: RED 8/3 -> GREEN 11/0.
- Hierarchical AST slice: regression RED via missing transform module -> GREEN 4/4 focused hierarchy/annotator tests.

The environment used for these slices has Node `v22.16.0` but no pinned `pnpm` executable; do not claim a full `pnpm check` run without fresh evidence.

## Deliberately not complete

`Parser and source maps` stays IN PROGRESS until all of the following are evidenced:

- executable TypeScript and CSS adapters behind ADR-0005;
- broader WHATWG HTML tree-construction ownership validation beyond the certified paragraph case;
- token/segment generated source maps and composition across lowering stages;
- exact public `NCON-*` conformance wiring before any associated requirement row is promoted from `planned` to `passing`;
- later Vite/HMR integration when that Phase 1 slice is reached.

Machine authority for the implemented/planned boundary: `spec/compiler-front-end.json` and `spec/phase-status.json`.
