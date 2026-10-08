# ADR-0004: Source-position and source-map baseline

**Status:** Accepted  
**Date:** 2026-10-08  
**Scope:** Phase 1 compiler front end

## Context

The PRD requires the compiler to preserve exact source positions and emit source maps. Nomos also needs one coordinate model that can be shared by compiler diagnostics, editor tooling, generated-code inspection, and later Vite integration.

ECMA-426 is the current source-map format specification. For JavaScript and CSS maps it defines columns in UTF-16 code units. Nomos source is represented by JavaScript strings inside the compiler, whose offsets are also UTF-16 code-unit offsets.

## Decision

1. Parser spans preserve offsets into the original, unnormalized source string. No newline rewriting occurs before source positions are captured.
2. Span offsets are zero-based UTF-16 code-unit offsets. Human-facing diagnostic `line` and `column` fields are one-based; columns count UTF-16 code units.
3. CRLF is one logical line break while still occupying two raw source offsets.
4. Generated JavaScript/CSS source maps use ECMA-426's version-3 JSON shape and zero-based UTF-16 mapping columns.
5. `sourcesContent` is included in development/compiler maps unless a later packaging policy explicitly removes it.
6. The first Phase 1 map primitive is an identity line-start map for pass-through/virtual code. Later lowering passes must compose token-level segments rather than discard prior mappings.

## Consequences

- Diagnostics and editor/source-map coordinates can be converted without changing encoding units.
- Raw offsets remain stable for slicing the exact author source, including CRLF input.
- Unicode characters outside the BMP consume two offset/column units, matching JavaScript/CSS source-map semantics.
- The identity map is only a baseline primitive; it does not by itself satisfy final generated-code mapping quality.

## References

- ECMA-426 Source Map Format Specification: https://tc39.es/source-map/
- Vite build source-map option: https://vite.dev/config/build-options.html#build-sourcemap
