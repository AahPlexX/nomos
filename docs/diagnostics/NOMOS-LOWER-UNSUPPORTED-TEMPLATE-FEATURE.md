# `NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE`

**Severity:** error  
**Stage:** template DOM lowering  
**Status:** Phase 1 development boundary

Nomos emits this diagnostic when valid template syntax reaches a lowering path whose semantics are not complete enough to generate correct executable DOM. The compiler stops instead of silently guessing behavior.

Current guarded feature categories include:

- `dynamic-custom-element-attribute` — dynamic or spread assignment on non-standard/custom elements remains guarded while `OD-008` is open;
- `inline-event-attribute` — inline event-handler attributes are rejected; use dedicated `on:` semantics;
- `directive` — `on:`, `bind:`, `use:`, or `let:` awaiting their dedicated lowering paths;
- `structural-block` — `if`, `each`, or `await` ownership/branch/list lowering;
- `component` — component-instance lowering and live-input ownership;
- `raw-html` — explicit raw-HTML lowering and Trusted Types policy handling;
- `interpolation-context` — interpolation in raw-text, RCDATA, or nested `<template>` contexts where comment-marker text slots are invalid.

Dynamic, mixed, shorthand, and spread attributes on standard HTML elements are otherwise no longer guarded. Spread-containing elements lower through typed attribute IR and one owner-backed source-ordered `bindAttributes` plan.

The historical `dynamic-url-attribute-unvalidated` guard has been retired for the initial single-URL set (`action`, `cite`, `formaction`, `href`, `poster`, `src`) because statically named dynamic/mixed/shorthand bindings now route through the same runtime URL-safety contract as spread values. The runtime rejects a normalized `javascript:` protocol before DOM mutation; real Chrome/Trusted Types coverage verifies safe statically named dynamic URL assignment.

The remaining HTML URL-bearing grammar audit is a security-coverage boundary, not an active instance of this unsupported-lowering diagnostic. Multi-value grammars such as whitespace-separated URL lists and responsive-image candidate lists require dedicated grammar-aware validation before they can be claimed covered by the PRD-wide URL safety requirement.

Runtime-discovered spread keys still require additional safety because their names are not statically visible. The grouped runtime plan rejects `on*` names before DOM mutation. For the initial single-URL safety set, spread names are allowed but their winning values are URL-parsed and rejected if the normalized protocol is `javascript:`; validation occurs while constructing the desired plan, before any removals or sets.

## Repair

Framework contributors should implement each still-guarded dedicated lowering stage with behavioral RED→GREEN coverage before removing its guard. URL-safety expansion must add grammar-specific validation and evidence where needed rather than reintroducing a blanket compiler guard or broadening the single-URL validator heuristically. Current callers should use only the feature subsets documented as implemented.

This diagnostic is not a user-configurable lint preference. It protects code-generation correctness while Phase 1 is incomplete and resolves no PRD Open Decision.
