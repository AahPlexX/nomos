# Phase 1 parser and source-map implementation

**Status:** IN PROGRESS  
**Last updated:** 2026-10-08

## Implemented slice

The compiler front end now has a lossless top-level component section parser in `packages/compiler/src/parser.mjs` and an ECMA-426-shaped identity source-map primitive in `packages/compiler/src/source-map.mjs`.

Current parser guarantees:

- preserves the original source string without newline normalization before span capture;
- permits top-level `<script>`, `<style>`, and template content in arbitrary order;
- recognizes only truly top-level script/style sections, not tags nested inside elements or structural blocks;
- returns exact raw source slices for every emitted section;
- records zero-based UTF-16 offsets plus one-based line/column diagnostic coordinates;
- treats CRLF as one logical line break while retaining both raw code units in offsets;
- emits a stable, non-disableable `NOMOS-PARSE-DUPLICATE-SCRIPT` error for a second top-level script;
- emits `NOMOS-PARSE-UNCLOSED-SECTION` for an unclosed top-level script/style section;
- returns diagnostic objects containing code, severity, plain-language message, explanation, minimal repair, exact span, learning level, documentation URL, JSON projection, SARIF projection, and autofix metadata.

Current source-map primitive guarantees:

- ECMA-426 `version: 3` JSON shape;
- explicit generated file and original source file;
- embedded `sourcesContent`;
- deterministic line-start mappings for 1:1 pass-through generated text;
- UTF-16 column semantics aligned with ECMA-426 for JavaScript/CSS maps.

## Tests

`tests/phase1-parser.test.mjs` currently covers:

1. arbitrary top-level section order and exact source slicing;
2. duplicate-script diagnostics;
3. unclosed section diagnostics;
4. CRLF raw-offset/line behavior;
5. ECMA-426 identity map shape/mappings;
6. nested element/structural-block script/style isolation;
7. UTF-16 column behavior with an astral Unicode character;
8. the existing Phase 0 duplicate-script adversarial fixture.

Local execution evidence for this slice: `8 passed; 0 failed` under Node `v22.16.0`.

## Deliberately not complete yet

Do not mark the Phase 1 `Parser and source maps` deliverable complete yet. Remaining work includes:

- parse template nodes, attributes, directives, interpolation, and structural blocks into the typed internal AST;
- validate HTML ownership rather than only preserving top-level sections;
- implement the remaining Phase 0 invalid-fixture diagnostics: `NOMOS-PARSE-HTML-OWNERSHIP`, `NOMOS-PARSE-UNTERMINATED-BLOCK`, and `NOMOS-PARSE-UNKNOWN-DIRECTIVE`;
- parse embedded TypeScript and CSS into their typed/structured representations through the approved toolchain;
- produce generated-code mappings with token/segment precision and compose mappings across lowering stages;
- run the complete Phase 0 valid/invalid parser corpus against the executable parser;
- wire parser results into Vite/HMR only when the corresponding Phase 1 slices are reached.

`spec/requirements.json` remains conservative: `NREQ-0145` and `NREQ-0150` stay `planned` until the named public conformance IDs are wired into the repository conformance harness. This implementation test evidence must not be mistaken for final conformance promotion.
