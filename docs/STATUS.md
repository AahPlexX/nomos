# Project status and handoff

**Last verified:** 2026-10-11 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Compiler lowering, runtime browser DOM/attributes, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler state

The front end has lossless sections, exact UTF-16 positions, flat/hierarchical template structures, typed exact-span five-form attribute IR, 21 certified WHATWG ownership scenarios, ECMA-426 mapping primitives, TypeScript-backed script/expression lowering, browser-parsed static DOM/text interpolation, and the first executable standard-HTML attribute assignment slice.

Accepted architecture remains ADR-0005/0006/0007/0008. All Wayfinder architecture tickets are resolved. All eleven PRD Open Decisions remain separate and open.

### Standard HTML attribute binding

`template-dom-lowering.mjs` now consumes the existing typed attribute IR for three runtime-assigned forms on standard HTML elements:

- dynamic `name={expression}`;
- mixed `name="text {expression}"`;
- shorthand `{identifier}`.

Dynamic-attribute elements receive collision-free temporary element markers in the static browser-parsed skeleton. Runtime `mountTemplate` discovers those elements after cloning, removes the marker attributes, and exposes deterministic element slots. Internal `bindAttribute` runs on the existing ADR-0008 DOM-observer phase.

Ordinary content attributes remove on `null`/`undefined` and otherwise use string content-attribute semantics. Certified HTML boolean attributes use presence/absence semantics; `inert` is covered by the executable contract. Source-map points are emitted for attribute setup and expression starts during the same generation pass.

Safety boundaries remain explicit rather than guessed:

- spread `{...expression}` remains guarded until merge/precedence semantics are defined and tested;
- dynamic custom-element assignment remains guarded while `OD-008` is open;
- expression-derived URL-bearing attributes remain guarded until the URL protocol validator is implemented;
- inline event-handler attributes remain rejected; event behavior belongs to `on:` lowering;
- property-backed native-control live state remains a later `bind:`/native-control slice.

**Attribute-binding function status: 3/4 runtime forms complete** (dynamic, mixed, shorthand complete; spread remaining).

### Browser-parsed template DOM

Static HTML remains one browser-parsed `HTMLTemplateElement` skeleton. Text slots use collision-free comments replaced with real `Text` nodes. Attribute-bound elements use collision-free temporary data attributes removed immediately after clone discovery. Cloned roots stay owner-managed and are removed on disposal. Trusted Types enforcement uses the required `nomos` policy name.

## Verification state

GitHub Actions is the pinned Phase 1 verification surface using Node `22.16.0`, pnpm `12.10.1`, TypeScript compatibility API `6.0.2`, and Chrome `154.0.8037.97`.

- Browser-DOM RED `38122206062`; GREEN `38122323711` established static DOM/text materialization.
- Attribute-IR/table GREEN `38122979344` established parser **66/66** and typed five-form IR.
- Latest pre-binding clean head `38123250039`: parser **66/66**, DOM **3/3 + Chrome/Trusted Types**, lowering **16/16**, runtime **21/21**, machine validator **70 artifacts**.
- Attribute-binding behavioral RED `38168546695`: parser and real Chrome stayed green; focused DOM units were **3/7**, with failures caused by absent `bindAttribute` and still-guarded dynamic attributes.
- Attribute-binding GREEN `38168894701`: parser **66/66**, focused DOM **7/7 + real Chrome/Trusted Types**, lowering **16/16**, runtime **23/23**, prior 70-artifact machine validator green.

Development/CI evidence does **not** automatically promote normative `NCON-*` rows; ADR-0007 remains authoritative.

## Public conformance state

`NCON-NREQ-0145` remains wired but planned; passing requirement count remains zero.

## Wayfinder / Handoff

Map: https://github.com/AahPlexX/nomos/issues/1

Resolved: issue 2 → ADR-0005; issue 3 → ADR-0006; issue 4 → ADR-0008; issue 5 → ADR-0007. No Wayfinder architecture ticket remains open.

Portable Handoff: `/tmp/nomos-phase1-handoff.md`. Canonical facts are repository machine specs, ADRs, CI, and this status record.

## Immediate next action

1. Define spread-attribute source-order merge/precedence semantics test-first and implement the fourth required runtime attribute form without weakening the existing safety guards.
2. Publish/test the built-in attribute/property assignment table before property-backed native-control expansion.
3. Implement the dynamic URL protocol safety validator before allowing expression-derived URL-bearing attributes.
4. Begin `on:` events and `bind:` native-control semantics after assignment policy is explicit.
5. Continue structural blocks/components, reactive destructuring, and the CSS adapter as prerequisites permit.
6. Keep `state.snapshot` blocked until its explicit contract/`OD-004` is resolved.
