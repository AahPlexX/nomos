# Changelog

All material repository changes are recorded here. This file tracks project state, not semantic-version release notes yet.

## 2026-10-08 — Phase 0 thesis slice

- Preserved the authoritative PRD byte-for-byte, established governance, grammar/reactive/learning contracts, representative components, parser corpus, whitespace semantics, capability/learnability protocols, and 239-requirement traceability.
- Phase 0 contract, traceability, and semantics gates reached green; preserved PRD SHA is `b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690`.

## 2026-10-08 — Product-owner Phase 0 gate amendment

- PRD Amendment 0001 removed the unavailable five-external-reviewer prerequisite while retaining contradiction-free semantics and immutable source provenance.
- Phase 0 closed and Phase 1 opened with synchronized machine/handoff state.

## 2026-10-08 — Phase 1 parser/source-map and conformance foundations

- Added lossless component section parsing, exact UTF-16 positions, structural diagnostics, ECMA-426 mapping foundations, structural parser-corpus certification, and hierarchical template ownership AST.
- ADR-0004/0005/0006 established source position/map, embedded-language, and stage-local source-map composition boundaries.
- ADR-0007 established public `NCON-*` identity/environment/promotion rules and the first wired compiler conformance seed; no row was promoted without required evidence.

## 2026-10-09 to 2026-10-10 — HTML ownership and source-map core

- Added decoded mapping validation/composition, explicit unmapped scaffolding, and ECMA-426 version-3 encoding with `sourcesContent`.
- Expanded WHATWG ownership validation across paragraph/list/button, table foster parenting, implied wrappers, table-section transitions, close-chain repair, nested anchors/`nobr`, and high-impact adoption-agency recovery.
- Machine-readable ownership coverage reached 21 certified rewrite scenarios while intentionally avoiding a duplicate browser parser.

## 2026-10-10 — Runtime ownership, deep state, and scheduler

- ADR-0008 resolved the owner/scheduler architecture with one fine-grained graph, one owner tree, lazy derives, and DOM-before-sync microtask scheduling.
- Implemented scalar/deep/raw state, plain object/array/Map/Set tracking, stable cycle-safe proxies, dynamic dependencies, derive-write guards, `untrack`, sync cleanup, owner disposal, and named cycle diagnostics.
- Proper runtime behavioral RED→GREEN evidence was recorded before the runtime foundation was marked implemented.

## 2026-10-10 — TypeScript reactive script lowering and pinned CI

- Exact-pinned `@typescript/typescript6@6.0.2` as the programmatic TypeScript adapter.
- Added `EmbeddedScript`, symbol-aware `state` / `state.raw` / `derive` lowering, transparent reads, supported root writes/updates, collision-free helpers, and original-`.nomos` TypeScript source maps.
- Added internal `updateState` and reactive direct-root `for...of` / `for...in` assignment-target lowering.
- Added `.github/workflows/ci.yml` with Node `22.16.0`, pnpm `12.10.1`, and exact dependency installation; corrected initial Corepack bootstrap to `pnpm/action-setup@v6.1.0`.

## 2026-10-11 — EmbeddedExpression, browser DOM, and typed attribute IR

- Added TypeScript-backed `EmbeddedExpression`, text-binding IR, and owner-backed `bindText` without introducing a second expression parser or scheduler.
- Added browser-parsed template DOM materialization via `HTMLTemplateElement`, deterministic text markers, owned cloned roots, and Trusted Types policy `nomos`.
- Added exact-span IR for all five ratified attribute forms: static, dynamic, mixed, shorthand, spread; directives remain separate.
- Enabled the parser CI gate and repaired duplicate same-span table ownership reporting without weakening validation.
- Browser DOM RED `38122206062` / GREEN `38122323711`; attribute IR RED `38122824413` / GREEN `38122979344`.

## 2026-10-11 — Standard HTML dynamic attribute assignment

### Added

- `template-dom-lowering.mjs` now lowers dynamic `name={expression}`, mixed quoted values, and shorthand `{identifier}` attributes on standard HTML elements.
- Attribute expressions reuse the TypeScript 6 `EmbeddedExpression` adapter and existing reactive `read` ABI rather than adding a second expression system.
- Dynamic-attribute elements use collision-free temporary element markers inside the browser-parsed skeleton; runtime `mountTemplate` discovers elements, removes markers, and returns deterministic element slots.
- Internal `bindAttribute` runs on the ADR-0008 DOM-observer phase and stops automatically after owner disposal.
- Ordinary content attributes remove on `null`/`undefined` and otherwise use `String(value)` + `setAttribute`.
- Certified boolean HTML attributes use presence/absence semantics; `inert` is covered by executable tests.
- Attribute setup/expression source-map points are emitted during generation.

### Safety boundaries

- Spread attributes remain explicitly guarded pending source-order merge/precedence semantics.
- Dynamic custom-element assignment remains guarded while `OD-008` is open.
- Dynamic URL-bearing attributes remain guarded until the URL protocol validator exists.
- Inline event-handler attributes are rejected; event semantics remain dedicated to `on:`.
- Native-control property-backed live state remains a later `bind:` slice.

### TDD and verification

- The first runtime test attempt exposed a test-linking issue due to a not-yet-existing named export; that attempt is not counted as behavioral RED.
- Behavioral RED `38168546695`: parser **66/66** and real Chrome stayed green; focused DOM units were **3/7**, failing by assertion for absent `bindAttribute` and still-guarded dynamic attributes.
- GREEN `38168894701`: parser **66/66**, DOM **7/7 + Chrome 154.0.8037.97 under Trusted Types**, lowering **16/16**, runtime **23/23**, prior machine validator green.
- Runtime attribute-function coverage is now **3/4 required dynamic forms**: dynamic, mixed, shorthand complete; spread remains.

### Next frontier

- Define spread merge precedence test-first and complete 4/4 runtime attribute forms.
- Publish/test the built-in attribute/property assignment table, then implement URL protocol validation and proceed to `on:` / `bind:` behavior.
