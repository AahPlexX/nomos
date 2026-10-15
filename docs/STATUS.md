# Project status and handoff

**Last verified:** 2026-10-14 (America/Chicago)  
**Remote:** `AahPlexX/nomos`  
**Required delivery branch:** `origin/main`  
**Current phase:** 1 — Vertical Slice  
**Phase state:** IN PROGRESS  
**Active slice:** Compiler lowering, runtime browser DOM/attributes, standard-HTML assignment policy, dynamic URL safety, and public conformance infrastructure  
**Phase 0:** COMPLETE under PRD Amendment 0001

## Current compiler/runtime state

The front end has lossless sections, exact UTF-16 positions, flat/hierarchical template structures, typed exact-span five-form attribute IR, 21 certified WHATWG ownership scenarios, ECMA-426 mapping primitives, TypeScript-backed script/expression lowering, browser-parsed DOM/text interpolation, executable standard-HTML assignment for all four required runtime attribute forms, a published/tested standard-HTML property-assignment table, and the first executable dynamic-URL safety core.

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
- spread-discovered `on*` names fail before any DOM mutation;
- URL-bearing names in the initial safety set are value-validated before any DOM mutation rather than rejected solely by name.

The static fallback captured for a grouped element comes from the already browser-parsed DOM, preserving HTML entity decoding rather than reconstructing source text.

## Built-in standard-HTML property-assignment table — published/tested

`packages/shared/src/html-attribute-policy.mjs` exports the immutable `STANDARD_HTML_PROPERTY_ASSIGNMENTS` table and `resolveStandardHtmlPropertyAssignment()`.

The table explicitly distinguishes ordinary content-attribute behavior from browser current-state properties:

- `input.value` uses property semantics only for HTML input states whose value IDL attribute is in **value mode**; omitted/invalid type resolves as Text, while hidden, checkbox/radio, file, and button-like states are not misclassified;
- checkbox/radio `checked` maps to current checkedness and supplies the `bind:checked`/`bind:group` seam;
- file `files` is binding-only and supplies the `bind:files` seam;
- `textarea.value`, `select.value`, `option.selected`, `output.value`, and audio/video `muted` are recorded as current-state property assignments;
- `details.open` and `dialog.open` remain authored-attribute-oriented because they reflect the `open` content attribute, while publishing the property seam required by `bind:open`;
- ordinary names such as `class`, `for`, `tabindex`, `aria-*`, `data-*`, reflected booleans, and reflected numeric values do not acquire accidental property assignment.

This table still publishes/tests the contract before property mutation activation. Existing dynamic/spread DOM mutation remains content-attribute based until the dedicated property/native-control implementation defines cleanup, source-order interaction, and two-way event semantics.

Focused table TDD produced the intended RED on missing exports and then **5/5** green under Node `22.16.0`.

## Dynamic URL safety — runtime core implemented, compiler/full grammar coverage still in progress

The PRD requires expression-derived `javascript:` URLs in URL-bearing attributes to be refused. The shared HTML policy now exposes `assertSafeDynamicUrlAttributeValue()` and the runtime invokes it before URL-valued DOM mutation.

Current executable safety contract:

- the initial guarded single-URL name set remains `action`, `cite`, `formaction`, `href`, `poster`, and `src`;
- values are classified with the platform `URL` parser against an inert HTTPS base used only to determine the resulting scheme;
- WHATWG URL normalization therefore catches ASCII-case changes, leading/trailing controls/spaces, and embedded ASCII tab/newline obfuscation before checking `protocol === "javascript:"`;
- ordinary safe absolute URLs, relative URLs, fragments, `mailto:` URLs, and strings that merely contain `javascript:` in a path/query remain allowed;
- `bindAttribute` validates before mutation;
- grouped `bindAttributes` computes and validates the full desired spread plan before any removals/sets, so a rejected URL cannot partially update safe sibling attributes;
- spread-discovered URL names in the initial set are now allowed when their winning values are safe.

The end-to-end PRD URL requirement is **not yet marked complete**. Statically named expression-derived URL attributes such as `<a href={url}>` are still deliberately compiler-guarded by `dynamic-url-attribute-unvalidated`, and the HTML index includes additional URL/list candidate grammars that require deliberate coverage rather than unsafe name-only assumptions. The next URL step is to wire known compiler bindings through the runtime validator and then close the remaining URL-bearing grammar audit.

Focused URL TDD first failed on the intentionally missing validator export; the helper then passed **2/2** locally on Node `22.16.0`. Repository run `38662076485` passed parser, browser DOM/Trusted Types, lowering, runtime, and Phase-1 machine-state gates with the runtime URL tests present. The DOM-slice unit gate has subsequently been expanded to include the dedicated URL-safety test file; its synchronized-state run is the next verification checkpoint.

## Safety boundaries that remain

- dynamic custom-element assignment, including spread, remains guarded while `OD-008` is open;
- statically named expression-derived URL attributes remain compiler-guarded until they are routed through the runtime validator;
- URL-bearing grammars beyond the initial six-name single-URL set remain under active audit;
- inline event-handler attributes remain rejected; event behavior belongs to `on:`;
- property-backed authored/current-state writes and two-way native-control behavior remain a dedicated follow-on slice that must consume the published table.

**Attribute-binding function status: 4/4 runtime forms complete.**  
**Property-assignment policy status: published/tested; mutation activation pending dedicated lowering/runtime work.**  
**Dynamic URL status: runtime scheme-safety core implemented; compiler enablement and complete HTML URL-bearing coverage still in progress.**

## Browser-parsed DOM

Static HTML is parsed through `HTMLTemplateElement`. Text slots use collision-free comments replaced with real `Text` nodes. Attribute-bound elements use temporary data attributes removed immediately after clone discovery. Cloned roots remain owner-managed and are removed on disposal. Trusted Types enforcement uses policy name `nomos`.

## Verification state

Pinned CI uses Ubuntu 24.04, Node `22.16.0`, pnpm `12.10.1`, TypeScript compatibility API `6.0.2`, and Chrome stable in the runner.

Key evidence:

- Browser-DOM RED `38122206062`; GREEN `38122323711` established static DOM/text materialization.
- Attribute-IR GREEN `38122979344` established parser **66/66** and typed five-form IR.
- Dynamic/mixed/shorthand behavioral RED `38168546695`; corrected browser-verified GREEN `38169465234` established the first **3/4** runtime forms.
- Spread behavioral RED `38637069602`: parser and the pre-existing browser path stayed green while runtime failed because `bindAttributes` was absent and compiler lowering still guarded spread.
- Spread implementation GREEN `38638143259`: parser **66/66**, focused DOM/browser units **11/11**, real Chrome `154.0.8037.97` under Trusted Types, lowering **16/16**, runtime **26/26**.
- Property-assignment table focused RED→GREEN: missing table exports failed first; immutable/type-sensitive policy then passed **5/5** on Node `22.16.0`.
- Assignment-policy synchronized CI advanced through run `38662076485`; that run also includes the first dynamic-URL runtime safety core and passed every workflow step.

Development/CI regression evidence does **not** automatically promote normative `NCON-*` rows; ADR-0007 remains authoritative.

## Public conformance state

`NCON-NREQ-0145` remains wired but planned; passing requirement count remains zero.

## Dependency state

No dependency was added for either the assignment-table or URL-safety work. Current registry verification on 2026-10-14 confirmed `@typescript/typescript6@6.0.2` and planned `lightningcss@1.33.0` remain current stable package baselines with no known vulnerabilities reported by the configured npm security source.

## Wayfinder / Handoff

Map: https://github.com/AahPlexX/nomos/issues/1

Resolved: issue 2 → ADR-0005; issue 3 → ADR-0006; issue 4 → ADR-0008; issue 5 → ADR-0007. No Wayfinder architecture ticket remains open.

Canonical durable facts are repository machine specs, ADRs, CI, and this status record.

## Immediate next action

1. Finish the dynamic-URL slice by removing the statically named compiler guard only where the runtime validator applies, and add lowering/browser evidence that safe expression-derived URLs work while normalized `javascript:` values fail before mutation.
2. Complete the standards audit for remaining HTML URL-bearing list/token candidate attributes rather than broadening the name set heuristically.
3. Consume the published property-assignment table in the dedicated authored-current-state/native-control slice, with cleanup/source-order behavior specified before enabling property writes.
4. Begin `on:` events and `bind:` native-control semantics once URL safety and property-write mechanics are executable end-to-end.
5. Continue structural blocks/components, reactive destructuring, and the CSS adapter as prerequisites permit; keep `state.snapshot` blocked until its explicit contract/`OD-004` is resolved.
