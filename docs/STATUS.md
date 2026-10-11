# Project status and handoff

**Last verified:** 2026-10-11 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Compiler lowering, runtime browser DOM/attributes, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler/runtime state

The front end has lossless sections, exact UTF-16 positions, flat/hierarchical template structures, typed exact-span five-form attribute IR, 21 certified WHATWG ownership scenarios, ECMA-426 mapping primitives, TypeScript-backed script/expression lowering, browser-parsed static DOM/text interpolation, and executable standard-HTML dynamic attribute assignment.

Runtime retains the single ADR-0008 owner/dependency/scheduler model. `mountTemplate`, `bindText`, and internal `bindAttribute` all use that same ownership/scheduling path; no second DOM-reactivity system was introduced.

Accepted architecture remains ADR-0005/0006/0007/0008. All Wayfinder architecture tickets are resolved. All eleven PRD Open Decisions remain separate and open.

### Standard HTML attribute binding

Three of the four required runtime-assigned attribute forms are implemented on standard HTML elements:

- dynamic `name={expression}`;
- mixed `name="text {expression}"`;
- shorthand `{identifier}`.

Dynamic-attribute elements receive collision-free temporary element markers in the static browser-parsed skeleton. `mountTemplate` discovers the elements after cloning, removes those markers, and exposes deterministic element slots. `bindAttribute` runs through the existing ADR-0008 DOM-observer phase.

Ordinary content attributes remove on `null`/`undefined` and otherwise stringify. Certified HTML boolean attributes use presence/absence semantics. Attribute setup/expression mappings are emitted in the same generation pass.

Safety boundaries remain explicit:

- spread `{...expression}` remains guarded until merge/precedence semantics are defined and tested;
- dynamic custom-element assignment remains guarded while `OD-008` is open;
- expression-derived URL-bearing attributes remain guarded until the URL protocol validator exists;
- inline event-handler attributes remain rejected; event behavior belongs to `on:`;
- property-backed native-control live state remains a dedicated `bind:`/native-control slice.

**Attribute-binding function status: 3/4 runtime forms complete.**

## Browser-parsed DOM

Static HTML is parsed through `HTMLTemplateElement`. Text slots use collision-free comments replaced with real `Text` nodes. Attribute-bound elements use collision-free temporary data attributes removed immediately after clone discovery. Cloned roots remain owner-managed and are removed on disposal. Trusted Types enforcement uses policy name `nomos`.

## Verification state

Pinned CI uses Ubuntu 24.04, Node `22.16.0`, pnpm `12.10.1`, TypeScript compatibility API `6.0.2`, and Chrome `154.0.8037.97`.

Key evidence:

- Browser-DOM RED `38122206062`; GREEN `38122323711` established static DOM/text materialization.
- Attribute-IR GREEN `38122979344` established parser **66/66** and typed five-form IR.
- Attribute-binding behavioral RED `38168546695`: parser/Chrome stayed green; focused DOM units were **3/7** because `bindAttribute` and standard-HTML dynamic lowering were absent.
- Attribute-binding implementation GREEN `38168894701`: parser **66/66**, focused DOM **7/7**, lowering **16/16**, runtime **23/23**.
- First expanded browser-attribute verifier run `38169304988` caught a verifier-scope defect after Chrome had already rendered the expected attributes; production DOM output was correct.
- Corrected full browser-verified run **`38169465234`**: parser **66/66**, DOM **7/7**, real Chrome/Trusted Types green for ordinary dynamic, mixed, and boolean attributes plus marker cleanup, lowering **16/16**, runtime **23/23**, and Phase 1 validator **73 required artifacts**.

Development/CI regression evidence does **not** automatically promote normative `NCON-*` rows; ADR-0007 remains authoritative.

## Public conformance state

`NCON-NREQ-0145` remains wired but planned; passing requirement count remains zero.

## Wayfinder / Handoff

Map: https://github.com/AahPlexX/nomos/issues/1

Resolved: issue 2 → ADR-0005; issue 3 → ADR-0006; issue 4 → ADR-0008; issue 5 → ADR-0007. No Wayfinder architecture ticket remains open.

Portable handoff: `/tmp/nomos-phase1-handoff.md`. Canonical durable facts are repository machine specs, ADRs, CI, and this status record.

## Immediate next action

1. Define spread-attribute source-order merge/precedence semantics test-first and implement the fourth required runtime attribute form without weakening safety guards.
2. Publish/test the built-in attribute/property assignment table before property-backed native-control expansion.
3. Implement dynamic URL protocol safety validation before enabling expression-derived URL-bearing attributes.
4. Begin `on:` events and `bind:` native-control semantics once assignment policy is explicit.
5. Continue structural blocks/components, reactive destructuring, and the CSS adapter as prerequisites permit.
6. Keep `state.snapshot` blocked until its explicit contract/`OD-004` is resolved.
