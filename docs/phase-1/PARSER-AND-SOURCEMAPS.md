# Phase 1 parser and source-map implementation

**Status:** IN PROGRESS  
**Last updated:** 2026-10-08

## Implemented slices

The compiler front end in `packages/compiler/src/` now provides lossless top-level section partitioning, a typed structural template-syntax foundation, stable structural diagnostics, and an ECMA-426-shaped identity source-map primitive.

Current parser guarantees:

- preserves the original source string without newline normalization before span capture;
- permits top-level `<script>`, `<style>`, and template content in arbitrary order;
- recognizes only truly top-level script/style sections, not tags nested inside elements or structural blocks;
- returns exact raw source slices using zero-based UTF-16 offsets and one-based diagnostic line/column coordinates;
- treats CRLF as one logical line break while retaining both raw code units in offsets;
- emits a `TemplateSyntaxTree` for every template section with exact-span `ElementOpen`, `ElementClose`, `Attribute`, `Directive`, `Interpolation`, `RawHtml`, `BlockOpen`, `BlockBranch`, and `BlockClose` nodes;
- accepts the seven valid Phase 0 parser fixtures at this structural-validation layer;
- emits the reserved Phase 0 invalid-fixture diagnostics `NOMOS-PARSE-DUPLICATE-SCRIPT`, `NOMOS-PARSE-HTML-OWNERSHIP`, `NOMOS-PARSE-UNTERMINATED-BLOCK`, and `NOMOS-PARSE-UNKNOWN-DIRECTIVE`;
- additionally emits `NOMOS-PARSE-UNCLOSED-SECTION` for an unclosed top-level script/style section;
- diagnostics expose code, severity, message, explanation, repair, span, learning level, documentation URL, JSON projection, SARIF projection, and non-disableable/autofix metadata.

`NOMOS-PARSE-HTML-OWNERSHIP` currently guards the HTML paragraph auto-close ownership hazard exercised by the Phase 0 adversarial corpus. Broader HTML tree-construction compatibility remains part of subsequent parser hardening and must not be inferred from this one structural rule.

Current source-map primitive guarantees:

- ECMA-426 `version: 3` JSON shape;
- explicit generated file and original source file;
- embedded `sourcesContent`;
- deterministic line-start mappings for 1:1 pass-through generated text;
- UTF-16 column semantics aligned with ECMA-426 for JavaScript/CSS maps.

## TDD evidence

The combined Phase 1 parser test surface now has eleven cases: the original eight cases in `tests/phase1-parser.test.mjs` plus three structural/corpus cases in `tests/phase1-parser-structural.test.mjs`. The second parser increment was observed RED at 8 passed / 3 failed before structural syntax/diagnostics existed, then GREEN at 11 passed / 0 failed after implementation. Coverage includes all seven valid and all four invalid Phase 0 parser fixtures in addition to source-position, nested-section, Unicode, CRLF, and identity-map cases.

## Deliberately not complete yet

Do not mark the Phase 1 `Parser and source maps` deliverable complete. The structural syntax tree is not yet the final compiler AST. Remaining work includes:

- promote flat structural syntax into hierarchical typed template structures suitable for lowering and semantic analysis;
- parse embedded TypeScript and CSS into typed/structured representations through the approved toolchain;
- broaden HTML tree-construction ownership validation beyond the currently certified adversarial case;
- produce generated-code mappings with token/segment precision and compose mappings across lowering stages;
- wire exact public `NCON-*` conformance IDs before promoting requirement rows from `planned` to `passing`;
- wire parser results into Vite/HMR only when that Phase 1 slice is reached.

`spec/compiler-front-end.json` is the machine-readable implemented/planned boundary.
