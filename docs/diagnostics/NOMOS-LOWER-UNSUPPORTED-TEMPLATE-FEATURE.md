# `NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE`

**Severity:** error  
**Stage:** template DOM lowering  
**Status:** Phase 1 development boundary

Nomos emits this diagnostic when valid template syntax reaches a lowering path whose semantics are not complete enough to generate correct executable DOM. The compiler stops instead of silently guessing behavior.

Current guarded feature categories include:

- `dynamic-custom-element-attribute` — dynamic or spread assignment on non-standard/custom elements remains guarded while `OD-008` is open;
- `dynamic-url-attribute-unvalidated` — statically visible expression-derived URL-bearing attributes remain compiler-guarded until their lowering path is explicitly routed through the now-implemented runtime `javascript:` scheme validator and the remaining HTML URL-bearing grammars are audited;
- `inline-event-attribute` — inline event-handler attributes are rejected; use dedicated `on:` semantics;
- `directive` — `on:`, `bind:`, `use:`, or `let:` awaiting their dedicated lowering paths;
- `structural-block` — `if`, `each`, or `await` ownership/branch/list lowering;
- `component` — component-instance lowering and live-input ownership;
- `raw-html` — explicit raw-HTML lowering and Trusted Types policy handling;
- `interpolation-context` — interpolation in raw-text, RCDATA, or nested `<template>` contexts where comment-marker text slots are invalid.

Dynamic, mixed, shorthand, and spread attributes on standard HTML elements are otherwise no longer guarded. Spread-containing elements lower through typed attribute IR and one owner-backed source-ordered `bindAttributes` plan.

Runtime-discovered spread keys require an additional safety boundary because their names are not statically visible. The runtime grouped plan rejects `on*` names before DOM mutation. For the initial URL safety set (`action`, `cite`, `formaction`, `href`, `poster`, `src`), spread names are allowed but their winning values are URL-parsed and rejected if the normalized protocol is `javascript:`; validation occurs while constructing the desired plan, before any removals or sets. This runtime rejection is not represented by the compiler diagnostic because the unsafe value/name combination does not exist until the spread expression evaluates.

## Repair

Framework contributors should implement the named dedicated lowering stage with behavioral RED→GREEN coverage before removing its guard. For `dynamic-url-attribute-unvalidated`, removal requires routing the statically visible binding through the shared runtime URL-safety contract rather than merely deleting the guard. Current callers should use only the feature subsets documented as implemented.

This diagnostic is not a user-configurable lint preference. It protects code-generation correctness while Phase 1 is incomplete and resolves no PRD Open Decision.
