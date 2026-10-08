# Research: generated source-map composition contract

**Date:** 2026-10-08  
**Wayfinder ticket:** https://github.com/AahPlexX/nomos/issues/3

## Question

What segment and composition contract should Nomos use across parsing, lowering, generated JavaScript/CSS, and Vite integration so source maps remain deterministic, composable, and standards-compatible?

## Primary-source findings

ECMA-426 defines version-3 source maps as generated line/column mappings to original source line/column positions. A one-field segment deliberately represents generated code with no corresponding original source; mapped segments identify an original source and position, with an optional mapped name. `sourcesContent` may embed original source text.

- https://tc39.es/ecma426/2024/

Vite 8's plugin documentation states that Vite plugins extend the Rolldown plugin interface and shows custom-file transforms returning `{ code, map }`, with a source map supplied when available.

- https://vite.dev/guide/api-plugin.html

Rolldown's current plugin documentation requires correct source mappings and notes that source-derived SFC submodules should remain mappable to their real filesystem source rather than being treated like unrelated `\0` virtual modules. Rolldown also validates source/name indices while converting plugin maps and can fail builds for malformed references.

- https://rolldown.rs/apis/plugin-api

Rollup's transform contract, which remains closely related to Rolldown's plugin model, states that transforms which move code should generate source maps and documents returning maps from individual transform stages.

- https://rollupjs.org/plugin-development/

Parcel's first-party source-map library demonstrates the established model of creating indexed mappings and combining maps, but an open issue also demonstrates why composition behavior must be covered by Nomos's own deterministic tests rather than trusted implicitly.

- https://github.com/parcel-bundler/source-map
- https://github.com/parcel-bundler/source-map/issues/114

## Decision recommendation

Nomos should use a stage-local decoded mapping model and compose every code-changing stage back to the original `.nomos` source before returning generated code to Vite.

### Internal contract

Each generated artifact owns:

- generated code;
- generated filename/module identity;
- an ordered decoded segment list;
- immediate input source identity/content;
- optional upstream map from that immediate input to an earlier source.

Each segment records:

- generated line and UTF-16 column;
- either an original source + original line/UTF-16 column, or `null` for intentionally generated/unmapped scaffolding;
- an optional original name only when the name is semantically meaningful.

### Stage rules

1. A stage that changes positions emits a map from its output to its immediate input.
2. A stage that leaves positions unchanged may forward the prior map rather than manufacturing redundant mappings.
3. Compiler-created scaffolding with no meaningful `.nomos` origin is explicitly unmapped, rather than falsely pointing at a nearby token.
4. Stage maps are composed in order until every mapped final segment resolves to the original `.nomos` source.
5. The final map embeds the original `.nomos` text in `sourcesContent` for deterministic debugging/tooling.
6. Nomos validates that every source/name index is valid before handing the map to Vite/Rolldown.
7. Generated positions and JavaScript/CSS original columns use the UTF-16 convention already fixed by ADR-0004.
8. Phase 1 does not depend on experimental/proposed scope/range extensions; standard version-3 mappings are the compatibility baseline.

## Consequences

- Parser/lowering/codegen stages can be tested independently and composed without losing provenance.
- Generated helpers are not misleadingly attributed to user code.
- Vite receives one standards-native map whose original source is the real `.nomos` file.
- The contract does not choose a particular source-map manipulation dependency; an implementation library may be evaluated separately against this contract.
- This decision does not settle HMR compatibility (`OD-003`) or any other PRD Open Decision.
