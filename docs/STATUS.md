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

The first executable compiler slice is implemented under `packages/compiler/src/`:

- `parser.mjs` partitions top-level script/style/template sections without mutating source text;
- section spans preserve raw zero-based UTF-16 offsets plus one-based line/column coordinates;
- CRLF counts as one logical line break while offsets retain both source code units;
- nested element/structural-block script/style markup is not mistaken for a component section;
- duplicate top-level scripts produce stable non-disableable `NOMOS-PARSE-DUPLICATE-SCRIPT` diagnostics;
- unclosed top-level script/style sections produce `NOMOS-PARSE-UNCLOSED-SECTION` diagnostics;
- parser diagnostics already expose the PRD-required shape fields needed by later centralization: code, severity, message, explanation, repair, span, level, documentation URL, JSON, SARIF, and autofix metadata;
- `source-map.mjs` emits deterministic ECMA-426 version-3 identity line-start maps with `sourcesContent` for pass-through/virtual-code stages;
- ADR-0004 freezes the UTF-16/source-map coordinate baseline, and `spec/compiler-front-end.json` records implemented versus planned front-end capabilities.

The current implementation is intentionally not yet a complete parser. Template AST construction, HTML ownership validation, structural-block termination, directive validation, embedded TypeScript/CSS structures, token-level generated mappings, and full Phase 0 corpus certification remain open and are enumerated in `TODO.md` and `docs/phase-1/PARSER-AND-SOURCEMAPS.md`.

## Current TDD evidence

```text
node --test tests/phase1-parser.test.mjs
Initial RED: module-not-found before compiler parser/source-map implementation.
Nested-section regression RED: 5 passed / 1 failed when nested <script>/<style> were incorrectly classified as top-level sections.
GREEN after scanner fix and Unicode/fixture coverage: 8 passed / 0 failed.

node tools/validate-phase1.mjs
Phase 1 front-end check passed locally: 10 required artifacts; parser/source-map slice remains IN PROGRESS.
```

The execution container uses Node `v22.16.0`. It still does not provide the repository's pinned `pnpm` executable, so verification for this slice uses the underlying zero-dependency Node commands rather than claiming a `pnpm check` run that did not occur.

## Standards/toolchain evidence refreshed 2026-10-08

- ECMA-426 is the current authoritative source-map specification and defines JavaScript/CSS map columns in UTF-16 code units.
- Vite's current build contract exposes standard source-map generation and expects transform/build tooling to preserve source maps rather than invent a framework-specific map format.
- TypeScript's current documentation continues to expose standard JavaScript/declaration source-map outputs; embedded TypeScript parsing remains a later subtask under the already-recorded TS7/TS6-compatibility ADR.

## Requirement traceability note

`NREQ-0145` (parse component sections and preserve exact source positions) now has development-test evidence, and `NREQ-0150` (emit source maps) has a baseline map primitive. Both rows intentionally remain `planned` until their exact public `NCON-*` conformance IDs are wired into the conformance harness. This is deliberate, not stale traceability.

## Open decisions and blockers

- All eleven PRD Open Decisions remain open in `spec/open-decisions.json`; this parser slice resolves none of them.
- Final product and extension naming remain provisional.
- External-contribution governance/license ratification remains separate from the existing license file.
- No external-review dependency blocks Phase 1.
- Parser/source-map completion is blocked only by the explicit remaining subtasks above, not by an undocumented dependency.

## Immediate next action

1. Extend `parseComponent` into the typed template AST while retaining exact spans for every production.
2. Drive the three remaining Phase 0 invalid parser fixtures (`HTML-OWNERSHIP`, `UNTERMINATED-BLOCK`, `UNKNOWN-DIRECTIVE`) from RED to GREEN.
3. Certify all seven Phase 0 valid fixtures against the executable parser.
4. Only then promote the corresponding exact `NCON-*` requirement rows and mark the parser half of the Phase 1 deliverable complete; generated-code token mapping remains a separate required source-map subtask.
