# Project status and handoff

**Last verified:** 2026-10-08 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Parser and source maps  
**Phase 0:** COMPLETE under PRD Amendment 0001  
**Product name:** provisional; clearance not complete

## Authority and phase transition

The original October 7 PRD remains byte-for-byte preserved in four source fragments with SHA-256 `b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`.

On 2026-10-08 the product owner explicitly instructed the project to disregard the Phase 0 requirement for five experienced external reviewers because none are available. `docs/prd/amendments/0001-remove-phase0-external-review-gate.md` records that directive without rewriting historical source. The amendment removes only that review prerequisite; the contradiction-free semantic gate remains.

`spec/phase-status.json` is the machine-readable phase handoff. Phase 0 is complete and Phase 1 is active.

## Phase 1 parser/source-map implementation

The executable compiler front end under `packages/compiler/src/` currently provides:

- `parser.mjs` for lossless top-level script/style/template section partitioning without source normalization;
- raw zero-based UTF-16 offsets plus one-based line/column coordinates, with CRLF treated as one logical line break while retaining both raw code units;
- top-level ownership scanning that does not mistake script/style-like markup nested inside elements or structural blocks for component sections;
- `template-syntax.mjs` as a separate structural-analysis layer so the verified section scanner remains unchanged;
- a flat typed `TemplateSyntaxTree` with exact-span element open/close, attribute/directive, interpolation/raw-HTML, and structural-block marker nodes;
- structural acceptance of all seven Phase 0 valid parser fixtures;
- the expected stable diagnostic for all four Phase 0 invalid parser fixtures: `NOMOS-PARSE-DUPLICATE-SCRIPT`, `NOMOS-PARSE-HTML-OWNERSHIP`, `NOMOS-PARSE-UNTERMINATED-BLOCK`, and `NOMOS-PARSE-UNKNOWN-DIRECTIVE`;
- `NOMOS-PARSE-UNCLOSED-SECTION` for an unclosed top-level script/style section;
- diagnostics carrying code, severity, message, explanation, repair, span, level, documentation URL, JSON, SARIF, disableability, and autofix metadata;
- `source-map.mjs` with a deterministic ECMA-426 version-3 identity line-start map and embedded `sourcesContent` for pass-through/virtual-code stages;
- ADR-0004 plus `spec/compiler-front-end.json` as the durable coordinate/map and implemented/planned boundary.

The parser/source-map deliverable is intentionally **not complete**. The flat structural syntax tree must still become the final hierarchical typed AST; embedded TypeScript/CSS representations, broader HTML tree-construction ownership validation, token-level generated mappings, and exact public `NCON-*` conformance wiring remain open in `TODO.md` and `docs/phase-1/PARSER-AND-SOURCEMAPS.md`.

## Current TDD evidence

```text
Initial parser RED: compiler entry modules absent.
First parser GREEN: 5 passed / 0 failed.
Nested-section regression RED: 5 passed / 1 failed.
Scanner/Unicode/fixture GREEN: 8 passed / 0 failed.
Second structural-parser RED: 8 passed / 3 failed before template syntax and remaining adversarial diagnostics existed.
Second structural-parser GREEN: 11 passed / 0 failed after implementation.

node tools/validate-phase1.mjs
Phase 1 front-end artifact contract passes locally while keeping parser/source-map status IN PROGRESS.
```

The execution container uses Node `v22.16.0`. It still does not provide the repository's pinned `pnpm` executable, so verification for this slice uses the underlying zero-dependency Node commands rather than claiming a `pnpm check` run that did not occur.

## Standards/toolchain evidence refreshed 2026-10-08

- ECMA-426 is the current authoritative source-map specification and defines JavaScript/CSS map columns in UTF-16 code units.
- Vite's current build contract exposes standard source-map generation and expects transform/build tooling to preserve source maps rather than invent a framework-specific map format.
- WHATWG HTML tree-construction rules inform the currently certified paragraph auto-close ownership diagnostic; this does not imply full HTML tree-construction validation yet.
- TypeScript's current documentation continues to expose standard JavaScript/declaration source-map outputs; embedded TypeScript parsing remains a later subtask under the already-recorded TS7/TS6-compatibility ADR.

## Requirement traceability note

`NREQ-0145` (parse component sections and preserve exact source positions) has development-test evidence, and `NREQ-0150` (emit source maps) has a baseline map primitive. Both rows intentionally remain `planned` until their exact public `NCON-*` conformance IDs are wired into the conformance harness. Development tests are not silently promoted to public conformance evidence.

## Open decisions and blockers

- All eleven PRD Open Decisions remain open in `spec/open-decisions.json`; this parser slice resolves none of them.
- Final product and extension naming remain provisional.
- External-contribution governance/license ratification remains separate from the existing license file.
- No external-review dependency blocks Phase 1.
- Parser/source-map completion is blocked only by the explicit remaining subtasks above, not by an undocumented dependency.

## Immediate next action

1. Promote the current flat `TemplateSyntaxTree` into the hierarchical typed template AST required by lowering and semantic analysis while preserving exact spans.
2. Parse embedded TypeScript and CSS into typed/structured compiler representations using the approved toolchain baseline.
3. Broaden HTML ownership validation beyond the certified paragraph auto-close adversarial case.
4. Add token/segment-precision generated-code mappings and mapping composition.
5. Wire exact public `NCON-*` tests before changing any corresponding requirement row from `planned` to `passing`.
