# Project status and handoff

**Last verified:** 2026-10-14 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Compiler lowering, runtime browser DOM/attributes, standard-HTML assignment policy, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler/runtime state

The front end has lossless sections, exact UTF-16 positions, flat/hierarchical template structures, typed exact-span five-form attribute IR, 21 certified WHATWG ownership scenarios, ECMA-426 mapping primitives, TypeScript-backed script/expression lowering, browser-parsed DOM/text interpolation, executable standard-HTML assignment for all four required runtime attribute forms, and a published/tested standard-HTML property-assignment table for current-state/native-control seams.

Runtime retains the single ADR-0008 owner/dependency/scheduler model. `mountTemplate`, `bindText`, `bindAttribute`, and grouped `bindAttributes` all use that same ownership/scheduling path; no second DOM-reactivity system was introduced.

Accepted architecture remains ADR-0005/0006/0007/0008. All Wayfinder architecture tickets are resolved. All eleven PRD Open Decisions remain separate and open.

## Standard HTML attribute binding — 4/4 complete

The four required runtime-assigned forms execute on standard HTML elements:

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

## Built-in standard-HTML property-assignment table — published/tested

`packages/shared/src/html-attribute-policy.mjs` now exports the immutable `STANDARD_HTML_PROPERTY_ASSIGNMENTS` table and `resolveStandardHtmlPropertyAssignment()`.

The table explicitly distinguishes ordinary content-attribute behavior from browser current-state properties:

- `input.value` uses property semantics only for HTML input states whose value IDL attribute is in **value mode**; omitted/invalid type resolves as Text, while hidden, checkbox/radio, file, and button-like states are not misclassified;
- checkbox/radio `checked` maps to current checkedness and supplies the `bind:checked`/`bind:group` seam;
- file `files` is binding-only and supplies the `bind:files` seam;
- `textarea.value`, `select.value`, `option.selected`, `output.value`, and audio/video `muted` are recorded as current-state property assignments;
- `details.open` and `dialog.open` remain authored-attribute-oriented because they reflect the `open` content attribute, while publishing the property seam required by `bind:open`;
- ordinary names such as `class`, `for`, `tabindex`, `aria-*`, `data-*`, reflected booleans, and reflected numeric values do not acquire accidental property assignment.

This slice publishes and tests the contract only. Existing dynamic/spread DOM mutation remains content-attribute based until the dedicated property/native-control implementation defines cleanup, source-order interaction, and two-way event semantics. This avoids silently changing the already-green 4/4 attribute contract.

Focused TDD produced the intended RED on missing exports and then **5/5** green under Node `22.16.0`. The repository CI run is recorded below once the synchronized state lands.

## Safety boundaries that remain

- dynamic custom-element assignment, including spread, remains guarded while `OD-008` is open;
- expression-derived URL-bearing attributes remain guarded until the URL protocol validator exists;
- inline event-handler attributes remain rejected; event behavior belongs to `on:`;
- property-backed authored/current-state writes and two-way native-control behavior remain a dedicated follow-on slice that must consume the published table.

**Attribute-binding function status: 4/4 runtime forms complete.**  
**Property-assignment policy status: published/tested; mutation activation pending dedicated lowering/runtime work.**

## Browser-parsed DOM

Static HTML is parsed through `HTMLTemplateElement`. Text slots use collision-free comments replaced with real `Text` nodes. Attribute-bound elements use temporary data attributes removed immediately after clone discovery. Cloned roots remain owner-managed and are removed on disposal. Trusted Types enforcement uses policy name `nomos`.

## Verification state

Pinned CI uses Ubuntu 24.04, Node `22.16.0`, pnpm `12.10.1`, TypeScript compatibility API `6.0.2`, and the available Chrome stable in the runner. The spread implementation evidence run used Chrome `154.0.8037.97`.

Key evidence:

- Browser-DOM RED `38122206062`; GREEN `38122323711` established static DOM/text materialization.
- Attribute-IR GREEN `38122979344` established parser **66/66** and typed five-form IR.
- Dynamic/mixed/shorthand behavioral RED `38168546695`; corrected browser-verified GREEN `38169465234` established the first **3/4** runtime forms.
- Spread behavioral RED `38637069602`: parser and the pre-existing browser path stayed green while runtime failed because `bindAttributes` was absent and compiler lowering still guarded spread.
- Spread implementation GREEN `38638143259`: parser **66/66**, focused DOM/browser units **11/11**, real Chrome `154.0.8037.97` under Trusted Types, lowering **16/16**, runtime **26/26**.
- Property-assignment table focused RED→GREEN: missing table exports failed first; immutable/type-sensitive policy then passed **5/5** on Node `22.16.0`. Full synchronized CI evidence is pending the state-document commit.

Development/CI regression evidence does **not** automatically promote normative `NCON-*` rows; ADR-0007 remains authoritative.

## Public conformance state

`NCON-NREQ-0145` remains wired but planned; passing requirement count remains zero.

## Dependency state

No dependency was added for this slice. Current registry verification on 2026-10-14 confirmed `@typescript/typescript6@6.0.2` and planned `lightningcss@1.33.0` remain current stable package baselines with no known vulnerabilities reported by the configured npm security source.

## Wayfinder / Handoff

Map: https://github.com/AahPlexX/nomos/issues/1

Resolved: issue 2 → ADR-0005; issue 3 → ADR-0006; issue 4 → ADR-0008; issue 5 → ADR-0007. No Wayfinder architecture ticket remains open.

Canonical durable facts are repository machine specs, ADRs, CI, and this status record.

## Immediate next action

1. Implement and test dynamic URL protocol safety validation before enabling expression-derived URL-bearing attributes; the PRD specifically requires refusing expression-derived `javascript:` URLs.
2. Consume the published property-assignment table in the dedicated authored-current-state/native-control slice, with cleanup/source-order behavior specified before enabling property writes.
3. Begin `on:` events and `bind:` native-control semantics once the URL boundary and property-write mechanics are executable.
4. Continue structural blocks/components, reactive destructuring, and the CSS adapter as prerequisites permit.
5. Keep `state.snapshot` blocked until its explicit contract/`OD-004` is resolved.
