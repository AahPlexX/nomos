# `NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE`

**Severity:** error  
**Stage:** template DOM lowering  
**Status:** Phase 1 development boundary

Nomos emits this diagnostic when the current DOM lowering slice encounters valid template syntax whose dedicated lowering semantics are not implemented yet. The compiler stops before producing executable DOM code instead of silently compiling the feature with incomplete or incorrect behavior.

Current guarded feature categories are:

- `dynamic-attribute-or-shorthand` — dynamic, mixed, shorthand, or spread start-tag syntax awaiting typed attribute IR/lowering;
- `directive` — `on:`, `bind:`, `use:`, or `let:` awaiting their dedicated lowering paths;
- `structural-block` — `if`, `each`, or `await` ownership and branch/list lowering;
- `component` — component-instance lowering and live-input ownership;
- `raw-html` — explicit raw-HTML lowering and Trusted Types policy handling;
- `interpolation-context` — interpolation in raw-text, RCDATA, or nested `<template>` contexts where the current comment-marker text-slot strategy is not valid.

## Repair

For framework development, implement the named dedicated lowering stage and replace the guarded path with contract tests before removing the diagnostic for that category.

For current callers of the incomplete Phase 1 compiler, restrict the template to already implemented static HTML plus ordinary text interpolations.

This diagnostic is not a user-configurable lint preference. It protects code-generation correctness while Phase 1 is incomplete. It does not resolve any PRD Open Decision.
