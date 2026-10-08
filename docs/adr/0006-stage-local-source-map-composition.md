# ADR-0006: Stage-local source-map composition

- **Status:** Accepted for Phase 1 compiler front end
- **Date:** 2026-10-08
- **Wayfinder evidence:** `docs/phase-1/research/source-map-composition.md`, https://github.com/AahPlexX/nomos/issues/3
- **Revalidation:** Before replacing the mapping engine or changing Vite/Rolldown integration semantics

## Context

ADR-0004 fixed Nomos's coordinate conventions and ECMA-426 compatibility baseline. Phase 1 still needs a deterministic rule for composing parser/lowering/codegen provenance into one source map for Vite.

ECMA-426 supports both mapped segments and intentionally unmapped generated segments. Vite 8 uses the Rolldown plugin interface and expects transformed custom file types to return a source map when available. Rolldown validates source/name references strictly when accepting plugin maps.

## Decision

Nomos uses stage-local decoded mappings and composes each code-changing stage back to the original `.nomos` source before build-tool handoff.

Each generated stage returns a generated artifact containing code plus an ordered decoded mapping set from the generated output to that stage's immediate input.

A mapping segment stores:

- generated line and UTF-16 column;
- original source identity plus original line/UTF-16 column, or no original position for intentionally generated scaffolding;
- an optional original name only when semantically meaningful.

Rules:

1. A code-changing stage emits a map to its immediate input.
2. A position-preserving stage forwards the existing map rather than adding a redundant mapping layer.
3. Compiler-only scaffolding is represented as unmapped generated code rather than mapped to an arbitrary nearby source token.
4. Maps compose in pipeline order until mapped final segments resolve to the real `.nomos` source.
5. Final maps include original `.nomos` content through `sourcesContent`.
6. Source/name indices are validated before maps leave the compiler.
7. Generated/original JavaScript and CSS columns follow ADR-0004's UTF-16 convention.
8. Phase 1 relies on standard ECMA-426 version-3 mappings, not experimental scope/range extensions.

## Integration boundary

The Vite transform boundary receives generated code plus the fully composed ECMA-426 map. Source-derived Nomos output remains traceable to the real `.nomos` source. Virtual-module/HMR topology is a later integration concern and this ADR does not resolve `OD-003`.

## Consequences

- Individual compiler stages are independently testable for mapping correctness.
- Generated helper code cannot masquerade as user-authored code in debugging tools.
- A source-map implementation dependency, if any, must conform to this contract and can be swapped without changing Nomos source semantics.
- The current identity line-start primitive remains valid only for truly 1:1 pass-through stages; generated code requires segment-level mappings.
- This ADR closes no PRD Open Decision.

## Primary sources

- https://tc39.es/ecma426/2024/
- https://vite.dev/guide/api-plugin.html
- https://rolldown.rs/apis/plugin-api
- https://rollupjs.org/plugin-development/
- https://github.com/parcel-bundler/source-map
- https://github.com/parcel-bundler/source-map/issues/114
