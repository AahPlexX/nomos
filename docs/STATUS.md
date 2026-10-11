# Project status and handoff

**Last verified:** 2026-10-11 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Compiler lowering, runtime reactivity/browser DOM, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler state

The front end has lossless section partitioning, exact UTF-16 positions, flat/hierarchical template structures, 21 certified WHATWG ownership-rewrite scenarios, ECMA-426 mapping primitives, executable TypeScript `EmbeddedScript`/`EmbeddedExpression` adapters, reactive script lowering, and a real browser-executed static-template/text-interpolation DOM path.

Accepted architecture remains ADR-0005/0006/0007/0008. All Wayfinder architecture tickets are resolved. The eleven PRD Open Decisions remain separate and unchanged.

### Script and expression lowering

- `@typescript/typescript6@6.0.2` remains exact-pinned.
- `script-lowering.mjs` recognizes `state` / `derive` imports by TypeScript symbol identity, preserves lexical shadowing, lowers `state`, `state.raw`, `derive`, transparent reads, supported root writes/updates, and direct reactive-root `for...of` / `for...in` targets to the internal runtime ABI.
- `expression-lowering.mjs` creates durable `EmbeddedExpression` records with exact original `.nomos` spans and translates TypeScript syntax diagnostics back to those spans.
- `template-lowering.mjs` creates `TextBinding` IR and reuses the same internal `read`/`bindText` ABI.
- Reactive destructuring assignment targets and complete template-visible semantic/type checking remain unfinished.

### Browser-parsed template DOM

`packages/compiler/src/template-dom-lowering.mjs` and `packages/runtime/src/dom-bindings.mjs` now implement the first executable DOM slice:

- supported static template source is emitted as one HTML skeleton;
- interpolation spans become collision-free comment markers;
- runtime `mountTemplate` parses the skeleton through an `HTMLTemplateElement`, clones its content, replaces markers with real `Text` nodes, and returns those nodes as binding slots;
- existing `TextBinding` expressions attach through `bindText` and the ADR-0008 DOM-observer phase;
- cloned roots are registered with the current owner and removed on disposal;
- Trusted Types enforcement is supported through a per-window cached `nomos` policy; host CSP must allow that policy name, matching the existing PRD requirement;
- source-map points for template mount, binding slots/setup, and expression starts are emitted during the same lowering pass.

The compiler deliberately rejects dynamic/mixed/shorthand/spread attributes, directives, raw HTML, structural blocks, component nodes, and interpolation contexts unsafe for comment markers. Those failures use `NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE` rather than silently generating incorrect DOM.

This is **not** complete template lowering. Attribute IR/lowering, events/bindings, structural blocks, components, raw HTML, full token-level mappings, SSG, and hydration remain future slices.

## Current runtime state

ADR-0008's single owner graph and DOM-before-sync microtask scheduler remain unchanged. Runtime support includes scalar/deep state, `state.raw`, lazy derives, dynamic dependencies, sync cleanup, cycle diagnostics, `bindText`, and the new internal `mountTemplate` helper.

`mountTemplate` adds no public root API concept. It uses browser HTML parsing for static source instead of duplicating entity/namespace/tree-construction behavior in Nomos.

`state.snapshot` remains intentionally unimplemented while its behavior contract and `OD-004` remain unresolved. Query/request cancellation ownership is also still open.

## Verification state

GitHub Actions is the pinned Phase 1 verification surface at `.github/workflows/ci.yml`.

### Browser DOM TDD evidence

RED run `38122206062`:

- Node `22.16.0`, pnpm `12.10.1`, exact dependencies, and Chrome all initialized successfully;
- Chrome reported `154.0.8037.97`;
- the focused unit and browser gates failed on the intended missing behavior: `compiler.lowerTemplateDom` and `runtimeInternal.mountTemplate` did not exist.

GREEN run `38122323711`:

- focused DOM lowering boundary tests: **3/3**;
- real Chrome execution under `require-trusted-types-for 'script'; trusted-types nomos`: green;
- verified native character-reference decoding, SVG namespace preservation, dynamic text interpolation, and owned-root disposal;
- existing lowering/ABI/expression suite: **16/16**;
- runtime wildcard suite: **21/21**;
- Phase 1 machine-state validator: green on the pre-document-sync state.

Development/CI evidence does **not** automatically promote normative `NCON-*` rows; ADR-0007 governs public conformance separately.

## Public conformance state

The ADR-0007 foundation remains implemented. `NCON-NREQ-0145` is wired, but `NREQ-0145` remains **planned**, not passing.

## Wayfinder / Handoff

Map: https://github.com/AahPlexX/nomos/issues/1

Resolved:
- issue 2 — embedded language boundary → ADR-0005.
- issue 3 — generated source-map composition → ADR-0006.
- issue 4 — runtime ownership/scheduler → ADR-0008.
- issue 5 — public conformance promotion → ADR-0007.

No Wayfinder architecture ticket remains open. All eleven PRD Open Decisions remain open.

Portable Handoff: `/tmp/nomos-phase1-handoff.md`. Canonical facts are the repository machine specs, ADRs, CI, and this status record.

## Immediate next action

1. Promote template attributes from name-only metadata into typed attribute-value IR with exact spans for static, dynamic, mixed, shorthand, and spread forms.
2. Lower the first safe standard-HTML dynamic attribute subset onto cloned elements using deterministic element markers; do **not** resolve custom-element pre-upgrade property policy `OD-008` implicitly.
3. Expand template generated mappings in the same attribute-generation pass.
4. Add events/native-control bindings after the attribute/property-assignment contract is explicit.
5. Continue structural blocks/components, reactive destructuring, and the Lightning CSS adapter as their prerequisite seams become ready.
6. Extend public conformance only at complete requirement boundaries under ADR-0007.
7. Keep `state.snapshot` blocked until its explicit contract/`OD-004` is resolved.
