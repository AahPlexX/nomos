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
- CI run `38102821673` verified lowering/ABI **14/14**, runtime **20/20**, and the Phase 1 machine validator.

## 2026-10-11 — EmbeddedExpression and text-binding runtime seam

- Added durable `EmbeddedExpression` extraction with exact original `.nomos` spans and TypeScript 6 adapter metadata.
- Template expressions use TypeScript parsing/symbol identity rather than a second expression parser; lexical shadowing remains ordinary TypeScript.
- Invalid interpolation syntax translates TypeScript diagnostics back to original `.nomos` spans.
- Added `TextBinding` IR, collision-safe `bindText`/`read` helper aliases, and first template expression mapping points.
- Added internal owner-backed `bindText` on the existing ADR-0008 DOM observer/scheduler.
- RED `38120782593`: pinned environment reached tests; the feature suite failed on absent `template-lowering.mjs` after 14 existing lowering/ABI tests passed.
- GREEN `38120937878`: lowering/ABI/expression **16/16**, runtime **21/21**.

## 2026-10-11 — Browser-parsed static DOM materialization

### Architecture

- Added `packages/compiler/src/template-dom-lowering.mjs` and internal runtime `mountTemplate`.
- Rejected per-source-text `createTextNode(...)` generation because raw HTML source would require Nomos to duplicate character-reference, namespace, and other browser parsing semantics.
- The compiler now preserves supported static HTML as one skeleton, substitutes collision-free comment markers for dynamic text interpolations, and emits generated mount/binding/setup code plus source-map points in the same pass.
- Runtime `mountTemplate` parses the compiler-owned skeleton through `HTMLTemplateElement`, clones `template.content`, replaces markers with real `Text` nodes, registers cloned roots with the existing owner, and exposes text binding slots.
- Trusted Types enforcement uses a per-window cached `nomos` policy. Failure to create that policy states that host CSP must allow the `nomos` policy name, matching the existing PRD contract.
- No new public root API concept or third-party DOM dependency was added.

### Correctness boundary

- Added `NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE` so the incomplete Phase 1 compiler refuses rather than miscompiles dynamic/mixed/shorthand/spread attributes, directives, raw HTML, structural blocks, component nodes, and interpolation contexts unsafe for comment-marker lowering.
- Static custom elements may pass through browser parsing, but dynamic custom-element property behavior remains untouched while `OD-008` is open.
- Template maps now cover explicit mount, binding-slot/setup, and expression-start points but remain intentionally non-token-complete.

### TDD and browser evidence

- RED run `38122206062`: Ubuntu 24.04, Node `22.16.0`, pnpm `12.10.1`, exact dependencies, and Chrome `154.0.8037.97` initialized successfully; focused unit and browser checks failed on the intended missing `compiler.lowerTemplateDom` / `runtimeInternal.mountTemplate` seam.
- GREEN run `38122323711`: focused DOM boundary suite **3/3**; real Chrome verification passed under `require-trusted-types-for 'script'; trusted-types nomos`.
- The browser gate verified native HTML character-reference decoding, static-attribute decoding, SVG namespace preservation, dynamic text interpolation, and owner disposal removing cloned roots.
- Existing lowering remained **16/16**, runtime **21/21**, and the Phase 1 machine validator remained green before this documentation/spec synchronization.
- These are development/regression results and do not automatically promote public `NCON-*` rows under ADR-0007.

### Next frontier

- Typed exact-span attribute-value IR for static, dynamic, mixed, shorthand, and spread attributes.
- Safe standard-HTML dynamic attribute lowering and a published/tested assignment table without silently resolving `OD-008` custom-element pre-upgrade policy.
- Events/native-control bindings, structural blocks, components, richer template mappings, reactive destructuring, CSS adapter, and later public conformance promotion at complete requirement boundaries.
