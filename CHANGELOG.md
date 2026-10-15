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

- Added standard-HTML dynamic, mixed, and shorthand assignment using the existing TypeScript expression adapter, deterministic element slots, owner-backed `bindAttribute`, boolean presence/absence semantics, and attribute mapping points.
- Kept custom-element assignment behind `OD-008`, dynamic URL-bearing attributes behind the URL-safety gate, inline event-handler attributes rejected, and property-backed native controls reserved for `bind:`.
- Behavioral RED `38168546695`; corrected browser-verified GREEN `38169465234` established the first 3/4 required runtime attribute forms.

## 2026-10-14 — Source-ordered spread attributes complete 4/4 runtime forms

### Contract and implementation

- Standard-HTML `{...expression}` now lowers through the typed spread IR rather than the unsupported-feature path.
- Spread-containing elements compile to one owner-backed `bindAttributes` plan so collision precedence cannot depend on independent observer scheduling.
- Authored attributes are evaluated left-to-right and later entries win.
- `null` / `undefined` spread sources are no-ops; other sources contribute enumerable own string-key properties only.
- Attribute names are ASCII-normalized for standard HTML before collision handling.
- Spread values reuse existing ordinary and boolean content-attribute semantics.
- When a spread drops a key, the grouped plan recomputes from source order, restoring an earlier static/dynamic fallback or removing the stale key.
- Static grouped fallbacks are captured from the browser-parsed element so HTML entity decoding remains authoritative.
- Added shared `packages/shared/src/html-attribute-policy.mjs` to keep compiler/runtime boolean, URL, event-name, and normalization policy synchronized.
- Runtime spread keys beginning with `on` or matching the currently guarded URL-bearing set are rejected before DOM mutation.
- Dynamic custom-element spread remains guarded under `OD-008`.
- Spread expression/setup source-map points are emitted by the existing template DOM generation pass.

### TDD and verification

- Behavioral RED `38637069602`: parser and existing Chrome materialization remained green while grouped runtime spread binding was absent and compiler spread lowering still emitted the unsupported guard.
- The first implementation attempt exposed two stale test-contract assumptions: one mapping assertion targeted the middle of the identifier, and an older DOM test still expected standard-HTML spread to be unsupported. Both were corrected without weakening directive/structural guards.
- Implementation GREEN `38638143259`: parser **66/66**, focused DOM/browser units **11/11**, Chrome `154.0.8037.97` under Trusted Types, lowering **16/16**, runtime **26/26**.
- All four required runtime-assigned standard-HTML forms are now implemented: dynamic, mixed, shorthand, spread.

### Next frontier

- Publish/test the complete built-in standard-HTML attribute/property assignment table.
- Implement the dynamic URL protocol safety validator.
- Then proceed to `on:` event lowering and `bind:` native-control semantics without guessing custom-element behavior under `OD-008`.

## 2026-10-14 — Standard-HTML property-assignment contract published

### Standards-backed contract

- Added immutable `STANDARD_HTML_PROPERTY_ASSIGNMENTS` and `resolveStandardHtmlPropertyAssignment()` to the existing shared HTML policy module rather than creating a second compiler/runtime policy source.
- The table distinguishes current-state IDL properties from ordinary reflected/content attributes and records the intended authored-dynamic and `bind:` seams without yet changing the existing DOM mutation path.
- Input `value` handling is type-sensitive: Text/Search/Tel/URL/Email/Password and date/time/numeric/range/color states use current-value property semantics; omitted or invalid types resolve as Text; hidden, checkbox/radio, file, and button-like states are not misclassified.
- Checkbox/radio `checked` records current checkedness and the `bind:checked` / `bind:group` seam; file `files` is binding-only for `bind:files`.
- `textarea.value`, `select.value`, `option.selected`, `output.value`, and audio/video `muted` are recorded as current-state property assignments.
- `details.open` and `dialog.open` remain authored-attribute-oriented because the IDL properties reflect the content attribute, while the table exposes the `bind:open` property seam.
- Ordinary names such as `class`, `for`, `tabindex`, `aria-*`, `data-*`, reflected booleans, and reflected numeric values retain attribute-oriented behavior.

### TDD and compatibility boundary

- Focused TDD first failed on the intentionally missing table exports, then passed **5/5** after implementation under Node `22.16.0`.
- Table objects, binding arrays, and input-type condition arrays are frozen and contract-tested.
- Existing dynamic/mixed/shorthand/spread DOM mutation remains unchanged in this slice. Property mutation activation is deferred until cleanup, source-order interaction, and two-way native-control semantics are explicit.
- No dependency was added. Current registry checks reconfirmed `@typescript/typescript6@6.0.2` and planned `lightningcss@1.33.0` with no known vulnerabilities in the configured npm security source.

### Next frontier

- Implement dynamic URL protocol safety validation before enabling expression-derived URL-bearing attributes.
- Then consume the published table in the dedicated property/native-control implementation and proceed into `on:` / `bind:` integration.

## 2026-10-14 — Dynamic URL scheme-safety runtime core

### Standards-backed safety core

- Added `assertSafeDynamicUrlAttributeValue()` to the shared HTML attribute policy without introducing a sanitizer dependency or a second URL parser.
- The initial guarded single-URL attribute set is `action`, `cite`, `formaction`, `href`, `poster`, and `src`.
- Dynamic values are classified with the platform WHATWG `URL` parser against an inert HTTPS base used only for scheme classification.
- Values whose normalized protocol is `javascript:` are refused. This catches mixed ASCII case, leading/trailing controls/spaces, and embedded ASCII tab/newline obfuscation handled by the URL parser.
- Safe absolute, relative, fragment, and `mailto:` values remain allowed, as do ordinary URLs whose path/query merely contains the text `javascript:`.
- Invalid/non-parseable values are not reclassified as dangerous by a heuristic substring test; existing browser/content-attribute behavior remains authoritative outside the explicit `javascript:` refusal contract.

### DOM integration

- `bindAttribute` validates URL-valued updates before `setAttribute`/`removeAttribute` mutation.
- Grouped `bindAttributes` validates URL values while building the complete desired source-order map, before stale-key removals or attribute sets.
- Spread-provided URL names in the initial safety set are therefore allowed when safe instead of being rejected solely by name.
- Inline `on*` spread keys remain name-blocked and continue to require dedicated `on:` semantics.

### TDD and verification

- URL safety focused RED: the test contract initially failed because `assertSafeDynamicUrlAttributeValue` did not exist.
- Focused helper GREEN: **2/2** on Node `22.16.0` for normalized `javascript:` refusal plus safe/misleading-substring acceptance.
- Added `tests/phase1-runtime-url-safety.test.mjs` covering helper normalization, independent `bindAttribute`, safe spread URL assignment, and pre-mutation grouped rejection.
- Updated the legacy spread unsafe-name test so inline events remain name-guarded while URL safety is value-based.
- Repository run `38662076485` passed parser, template DOM/Trusted Types, lowering, runtime, and Phase-1 machine-state gates with the URL runtime tests present.
- Synchronized run `38662666873` then passed parser, the expanded DOM/Trusted Types slice with `tests/phase1-runtime-url-safety.test.mjs` included directly, lowering, runtime, and Phase-1 machine-state validation.

## 2026-10-14 — Statically named initial dynamic URL path enabled

### Compiler/runtime integration

- Removed only the obsolete `dynamic-url-attribute-unvalidated` compiler guard and its unused policy import after the runtime URL validator existed and was already covered.
- Dynamic, mixed, and shorthand values for the initial single-URL set (`action`, `cite`, `formaction`, `href`, `poster`, `src`) now lower through the same owner-backed `bindAttribute` / `bindAttributes` path as other standard-HTML runtime attributes.
- The compiler does not duplicate URL parsing or scheme policy; runtime `assertSafeDynamicUrlAttributeValue()` remains the enforcement point before DOM mutation.
- Custom-element assignment remains guarded under `OD-008`; inline event attributes remain rejected; property-backed current-state/native-control writes remain deferred to their dedicated table-driven slice.

### TDD and browser verification

- Behavioral RED `38670030444`: pinned toolchain and parser remained green; the DOM slice failed exactly because the statically named URL lowering expectation was blocked by the existing compiler guard.
- Compiler GREEN `38670340262`: removing only that obsolete guard made the new lowering contract pass without changing runtime URL safety semantics.
- Browser-confirmed GREEN `38670385218`: parser, expanded DOM/Trusted Types slice, lowering, runtime, and Phase-1 machine-state validation all passed; real Chrome materialized and assigned a safe expression-derived `href` through the compiler/runtime path.

### Remaining URL boundary

- The PRD-wide URL requirement remains in progress. Current HTML includes URL-bearing grammars that are not one URL string: `ping` is a whitespace-separated URL list, while `srcset`/`imagesrcset` are responsive-image candidate lists. Those require grammar-aware validation rather than broadening the single-URL helper by attribute name.
- The next URL slice is therefore a standards audit and dedicated RED→GREEN contracts for remaining URL-bearing list/token/candidate grammars where expression-derived values can represent navigable/fetched URLs.
