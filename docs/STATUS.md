# Project status and handoff

**Last verified:** 2026-10-11 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Compiler lowering, runtime reactivity/browser DOM, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler state

The front end has lossless section partitioning, exact UTF-16 positions, flat/hierarchical template structures, typed exact-span attribute IR, 21 certified WHATWG ownership scenarios, ECMA-426 mapping primitives, executable TypeScript `EmbeddedScript`/`EmbeddedExpression` adapters, reactive script lowering, and a real-browser static-template/text-interpolation DOM path.

Accepted architecture remains ADR-0005/0006/0007/0008. All Wayfinder architecture tickets are resolved. All eleven PRD Open Decisions remain separate and open.

### Typed template attributes

`packages/compiler/src/attribute-ir.mjs` now preserves all five ratified non-directive attribute forms in durable Nomos IR:

- static attributes, including boolean and quoted values;
- dynamic `{expression}` values;
- mixed quoted text/interpolation values;
- shorthand `{identifier}`;
- spread `{...expression}`.

Names, complete attribute spans, value spans, mixed parts, and expression body spans remain anchored to the original `.nomos` source. Nested brace expressions are preserved. Nomos directives remain separate on `Element.directives`; the new IR does not invent directive semantics.

The pinned parser gate also exposed a latent duplicate-reporting defect: generic foster-parent validation and specialized table validation could both diagnose the same start-tag span. `table-structure-validation.mjs` now lets the specialized table rewrite replace only a same-span generic ownership diagnostic. No unrelated diagnostic is suppressed.

### Browser-parsed template DOM

`template-dom-lowering.mjs` + runtime `mountTemplate` implement the first executable DOM slice. Supported static template source becomes one browser-parsed HTML skeleton; interpolation spans become deterministic comment markers; `mountTemplate` clones `HTMLTemplateElement.content`, replaces markers with real `Text` nodes, and registers cloned roots with ADR-0008 ownership. `bindText` updates those nodes through the existing DOM-observer phase.

Trusted Types enforcement uses the existing required `nomos` policy-name contract. Source-map points are emitted for template mount, binding setup, and expression starts in the same lowering pass.

Dynamic/mixed/shorthand/spread attributes are now represented correctly but **not yet assigned at runtime**. Directives, raw HTML, structural blocks, components, and unsafe interpolation contexts also remain explicitly rejected instead of being miscompiled.

## Verification state

GitHub Actions is the pinned Phase 1 verification surface.

- Browser-DOM RED `38122206062`: exact environment reached the intended missing `lowerTemplateDom` / `mountTemplate` seam.
- Browser-DOM GREEN `38122323711`: DOM boundary **3/3**, real Chrome `154.0.8037.97` under Trusted Types enforcement, lowering **16/16**, runtime **21/21**.
- Attribute-IR RED `38122824413`: the new attribute tests failed as intended; the newly enabled parser gate also exposed six pre-existing duplicate table ownership failures.
- Attribute-IR/table-fix GREEN `38122979344`: parser **66/66**, DOM boundary **3/3 + real Chrome**, lowering **16/16**, runtime **21/21**, and the 68-artifact machine validator all passed. No tests were weakened.

Development/CI evidence does **not** automatically promote normative `NCON-*` rows; ADR-0007 governs public conformance separately.

## Public conformance state

`NCON-NREQ-0145` remains wired but `NREQ-0145` is still **planned**, not passing. Passing requirement count remains zero.

## Wayfinder / Handoff

Map: https://github.com/AahPlexX/nomos/issues/1

Resolved: issue 2 → ADR-0005; issue 3 → ADR-0006; issue 4 → ADR-0008; issue 5 → ADR-0007. No Wayfinder architecture ticket remains open.

Portable Handoff: `/tmp/nomos-phase1-handoff.md`. Canonical facts are repository machine specs, ADRs, CI, and this status record.

## Immediate next action

1. Define and test the safe standard-HTML dynamic attribute assignment policy from authoritative HTML/DOM behavior; do not guess custom-element pre-upgrade semantics while `OD-008` is open.
2. Reuse typed attribute IR and existing TypeScript expression lowering to compile the first dynamic/mixed/shorthand standard-HTML attribute subset onto deterministic element slots.
3. Emit attribute-stage source-map points during the same generation pass.
4. Publish/test the built-in assignment table before extending into property-backed native controls.
5. Add events/native-control bindings after that table is explicit.
6. Continue structural blocks/components, reactive destructuring, and the CSS adapter as their prerequisites are ready.
7. Keep `state.snapshot` blocked until its explicit contract/`OD-004` is resolved.
