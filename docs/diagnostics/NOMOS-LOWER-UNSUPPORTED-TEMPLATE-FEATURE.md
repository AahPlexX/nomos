# `NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE`

**Severity:** error  
**Stage:** template DOM lowering  
**Status:** Phase 1 development boundary

Nomos emits this diagnostic when valid template syntax reaches a lowering path whose semantics are not complete enough to generate correct executable DOM. The compiler stops instead of silently guessing behavior.

Current guarded feature categories include:

- `dynamic-custom-element-attribute` — dynamic or spread assignment on non-standard/custom elements remains guarded while `OD-008` is open;
- `dynamic-url-attribute-unvalidated` — statically visible expression-derived URL-bearing attributes require Nomos's URL protocol validator first;
- `inline-event-attribute` — inline event-handler attributes are rejected; use dedicated `on:` semantics;
- `directive` — `on:`, `bind:`, `use:`, or `let:` awaiting their dedicated lowering paths;
- `structural-block` — `if`, `each`, or `await` ownership/branch/list lowering;
- `component` — component-instance lowering and live-input ownership;
- `raw-html` — explicit raw-HTML lowering and Trusted Types policy handling;
- `interpolation-context` — interpolation in raw-text, RCDATA, or nested `<template>` contexts where comment-marker text slots are invalid.

Dynamic, mixed, shorthand, and spread attributes on standard HTML elements are no longer guarded. Spread-containing elements lower through typed attribute IR and one owner-backed source-ordered `bindAttributes` plan.

Runtime-discovered spread keys require an additional safety boundary because their names are not statically visible. The runtime grouped plan rejects `on*` and currently-unvalidated URL-bearing keys before it mutates the DOM. That runtime rejection is not represented by this compiler diagnostic because the unsafe name does not exist until the spread expression evaluates.

## Repair

Framework contributors should implement the named dedicated lowering stage with behavioral RED→GREEN coverage before removing its guard. Current callers should use only the feature subsets documented as implemented.

This diagnostic is not a user-configurable lint preference. It protects code-generation correctness while Phase 1 is incomplete and resolves no PRD Open Decision.
