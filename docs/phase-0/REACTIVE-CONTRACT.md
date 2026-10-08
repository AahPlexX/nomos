# Nomos reactive contract — Phase 0

The user-facing reactive model is intentionally reducible to four statements:

1. A state value may change.
2. A derived value is calculated from reactive values it reads.
3. Markup updates when values it reads change.
4. Synchronization exists only to coordinate with an external system.

## State

`state(initial)` creates mutable reactive state in compiled `.nomos` or `.nomos.ts` code. Reads establish dependencies. Supported assignment and mutation notify dependents unless `Object.is(oldValue, newValue)` is true.

Plain objects, arrays, `Map`, and `Set` are deeply tracked. Class instances, dates, DOM nodes, typed arrays, promises, errors, functions, weak collections, and frozen objects are reference-held rather than internally reactive. `state.raw` disables deep tracking. `state.snapshot` produces detached non-proxy interchange data, but its exact built-in/cycle/error behavior requires conformance specification before implementation can be called conformant.

## Derivation

`derive(() => value)` is read-only, lazy, and memoized. It automatically captures synchronous reactive reads and must be glitch-free. Writing reactive state from a derive is invalid; statically detectable cases are compiler errors and unresolved cases require a development-runtime guard.

## Synchronization

`sync(callback)` exists for external systems: timers, observers, storage, browser APIs, and imperative libraries. It runs after mount, tracks synchronous reads, cleans up before rerun and disposal, reruns after affected DOM updates, and stops tracking across an `await` boundary.

Derivation expressed as synchronization is a tooling smell and should receive a diagnostic/safe conversion where possible.

## Scheduling and ownership

State writes are synchronous. DOM changes and sync reruns batch into a microtask flush. The public application runtime does not expose a rerender phase.

Every component instance, conditional branch, list item, async branch, attachment, and query subscription has an owner. Disposal is deterministic: dispose children first, then local cleanup in reverse creation order, then owned DOM. Exclusive owned requests receive an aborted `AbortSignal`; shared work survives while another subscriber remains.

## Shared state

Shared reactive state belongs in `.nomos.ts` and uses reactive object mutation, a stateful class instance, or private state behind exported read/write functions. Cross-file rewriting of reassigned exported ECMAScript bindings is outside Nomos 1.0.

This document restates the PRD contract for Phase 0 review; it does not add semantics.
