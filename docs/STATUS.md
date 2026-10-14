# Project status and handoff

**Last verified:** 2026-10-14 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Compiler lowering, runtime browser DOM/attributes, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler/runtime state

The front end has lossless sections, exact UTF-16 positions, flat/hierarchical template structures, typed exact-span five-form attribute IR, 21 certified WHATWG ownership scenarios, ECMA-426 mapping primitives, TypeScript-backed script/expression lowering, browser-parsed DOM/text interpolation, and executable standard-HTML assignment for all four required runtime attribute forms.

Runtime retains the single ADR-0008 owner/dependency/scheduler model. `mountTemplate`, `bindText`, `bindAttribute`, and grouped `bindAttributes` all use that same ownership/scheduling path; no second DOM-reactivity system was introduced.

Accepted architecture remains ADR-0005/0006/0007/0008. All Wayfinder architecture tickets are resolved. All eleven PRD Open Decisions remain separate and open.

## Standard HTML attribute binding — 4/4 complete

The four required runtime-assigned forms now execute on standard HTML elements:

- dynamic `name={expression}`;
- mixed `name="text {expression}"`;
- shorthand `{identifier}`;
- spread `{...expression}`.

Elements requiring runtime assignment receive collision-free temporary element markers in the static browser-parsed skeleton. `mountTemplate` discovers those elements after cloning, removes the markers, and exposes deterministic element slots.

### Spread contract

Spread-containing elements use one owner-backed `bindAttributes` observer so collisions cannot depend on scheduler order.

- authored attributes are evaluated left-to-right and later entries win;
- `null` / `undefined` spread sources contribute no keys;
- spreads consume enumerable own string keys only;
- standard-HTML names are ASCII-normalized before collision handling;
- ordinary spread values use nullish-removes / otherwise-stringify semantics;
- certified boolean HTML attributes use truthy-presence / falsy-absence semantics;
- when a later spread drops a key, the complete authored plan is recomputed, restoring an earlier static/dynamic fallback when one exists or removing the stale key otherwise;
- spread-discovered `on*` or currently unvalidated URL-bearing names fail before any DOM mutation.

The static fallback captured for a grouped element comes from the already browser-parsed DOM, preserving HTML entity decoding rather than reconstructing source text.

### Safety boundaries that remain

- dynamic custom-element assignment, including spread, remains guarded while `OD-008` is open;
- expression-derived URL-bearing attributes remain guarded until the URL protocol validator exists;
- inline event-handler attributes remain rejected; event behavior belongs to `on:`;
- property-backed native-control live state remains a dedicated `bind:`/native-control slice.

**Attribute-binding function status: 4/4 runtime forms complete.**

## Browser-parsed DOM

Static HTML is parsed through `HTMLTemplateElement`. Text slots use collision-free comments replaced with real `Text` nodes. Attribute-bound elements use temporary data attributes removed immediately after clone discovery. Cloned roots remain owner-managed and are removed on disposal. Trusted Types enforcement uses policy name `nomos`.

## Verification state

Pinned CI uses Ubuntu 24.04, Node `22.16.0`, pnpm `12.10.1`, TypeScript compatibility API `6.0.2`, and the available Chrome stable in the runner. The spread implementation evidence run used Chrome `154.0.8037.97`.

Key evidence:

- Browser-DOM RED `38122206062`; GREEN `38122323711` established static DOM/text materialization.
- Attribute-IR GREEN `38122979344` established parser **66/66** and typed five-form IR.
- Dynamic/mixed/shorthand behavioral RED `38168546695`; corrected browser-verified GREEN `38169465234` established the first **3/4** runtime forms.
- Spread behavioral RED `38637069602`: parser and the pre-existing browser path stayed green while runtime failed because `bindAttributes` was absent and compiler lowering still guarded spread.
- Spread implementation GREEN **`38638143259`**: parser **66/66**, focused DOM/browser units **11/11**, real Chrome `154.0.8037.97` under Trusted Types, lowering **16/16**, runtime **26/26**. The implementation run still used the pre-sync machine declaration, so the current machine specs/validator are being advanced to enforce 4/4 rather than treating that old declaration as normative evidence.

Development/CI regression evidence does **not** automatically promote normative `NCON-*` rows; ADR-0007 remains authoritative.

## Public conformance state

`NCON-NREQ-0145` remains wired but planned; passing requirement count remains zero.

## Wayfinder / Handoff

Map: https://github.com/AahPlexX/nomos/issues/1

Resolved: issue 2 → ADR-0005; issue 3 → ADR-0006; issue 4 → ADR-0008; issue 5 → ADR-0007. No Wayfinder architecture ticket remains open.

Portable handoff: `/tmp/nomos-phase1-handoff.md`. Canonical durable facts are repository machine specs, ADRs, CI, and this status record.

## Immediate next action

1. Publish and test the built-in standard-HTML attribute/property assignment table before property-backed native-control expansion.
2. Implement dynamic URL protocol safety validation before enabling expression-derived URL-bearing attributes.
3. Begin `on:` events and `bind:` native-control semantics once the assignment table and URL boundary are explicit.
4. Continue structural blocks/components, reactive destructuring, and the CSS adapter as prerequisites permit.
5. Keep `state.snapshot` blocked until its explicit contract/`OD-004` is resolved.
