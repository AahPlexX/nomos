# Phase 1 parser and source-map implementation

**Status:** IN PROGRESS  
**Last updated:** 2026-10-08

## Implemented slices

The compiler front end in `packages/compiler/src/` now has three deliberately separate layers:

1. `parser.mjs` — lossless top-level script/style/template section partitioning and exact source positions.
2. `template-syntax.mjs` — a flat structural syntax stream used for diagnostics, source ownership checks, and exact marker spans.
3. `template-ast.mjs` — a hierarchical ownership transform consumed by lowering/semantic analysis while leaving the flat stream intact.

Current parser guarantees:

- preserves the original source string without newline normalization before span capture;
- permits top-level `<script>`, `<style>`, and template content in arbitrary order;
- recognizes only truly top-level script/style sections, not tags nested inside elements or structural blocks;
- returns exact raw source slices using zero-based UTF-16 offsets and one-based diagnostic line/column coordinates;
- treats CRLF as one logical line break while retaining both raw code units in offsets;
- emits a flat `TemplateSyntaxTree` for every template section with exact-span element open/close, attribute/directive, interpolation/raw-HTML, and structural-block marker nodes;
- derives `section.ast` as a hierarchical `Template` tree with parent/child `Element` ownership, element-owned attribute/directive metadata, literal `Text` recovery, interpolation/raw-HTML leaves, and explicit `IfBlock` / `EachBlock` / `AwaitBlock` branches;
- preserves component/custom-element classification plus self-closing and HTML-void behavior in the hierarchical tree;
- accepts all seven valid Phase 0 parser fixtures at the current structural-validation layer;
- emits the reserved Phase 0 invalid-fixture diagnostics `NOMOS-PARSE-DUPLICATE-SCRIPT`, `NOMOS-PARSE-HTML-OWNERSHIP`, `NOMOS-PARSE-UNTERMINATED-BLOCK`, and `NOMOS-PARSE-UNKNOWN-DIRECTIVE`;
- additionally emits `NOMOS-PARSE-UNCLOSED-SECTION` for an unclosed top-level script/style section;
- diagnostics expose code, severity, message, explanation, repair, span, learning level, documentation URL, JSON projection, SARIF projection, and non-disableable/autofix metadata.

`NOMOS-PARSE-HTML-OWNERSHIP` currently guards the paragraph auto-close ownership hazard exercised by the Phase 0 adversarial corpus. Broader WHATWG tree-construction compatibility remains required; the current rule is not a claim of full browser-equivalent parsing.

Current source-map primitive guarantees:

- ECMA-426 `version: 3` JSON shape;
- explicit generated file and original source file;
- embedded `sourcesContent`;
- deterministic line-start mappings for 1:1 pass-through generated text;
- UTF-16 column semantics aligned with ECMA-426 for JavaScript/CSS maps.

## TDD evidence

Prior parser increments remain recorded in `CHANGELOG.md` and `docs/STATUS.md` (11/11 parser/structural cases green at the structural slice).

Hierarchical AST slice:

```text
Regression RED: removing template-ast.mjs -> ERR_MODULE_NOT_FOUND; exit 1.
GREEN: node --test tests/phase1-parser-ast.test.mjs -> 4 passed, 0 failed in the local verification harness.
```

The new tests cover hierarchical element ownership, element-owned metadata, recovered text, interpolation ownership, if/else branch ownership, component/custom-element categories, self-closing behavior, exact spans, and the annotator boundary that leaves non-template sections unchanged.

## Wayfinder control plane

The remaining Phase 1 architecture fog is tracked from https://github.com/AahPlexX/nomos/issues/1. Current explicit decision tickets cover embedded TypeScript/CSS representation, generated source-map composition, runtime ownership/scheduling, and public conformance-harness promotion. Already-ratified parser behavior does not wait on those tickets, but unresolved decisions must not be selected silently in implementation.

## Deliberately not complete yet

Do not mark the Phase 1 `Parser and source maps` deliverable complete. Remaining work includes:

- resolve and implement the embedded TypeScript/CSS typed-structure boundary;
- broaden HTML tree-construction ownership validation beyond the currently certified paragraph auto-close case;
- produce generated-code mappings with token/segment precision and compose mappings across lowering stages;
- wire exact public `NCON-*` conformance IDs before promoting requirement rows from `planned` to `passing`;
- wire parser results into Vite/HMR only when that Phase 1 slice is reached.

`spec/compiler-front-end.json` is the machine-readable implemented/planned boundary.
