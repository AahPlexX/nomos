# ADR-0008 — Runtime ownership and scheduler architecture

**Status:** Accepted  
**Date:** 2026-10-10  
**Wayfinder:** issue #4

## Context

Phase 0 already ratified synchronous state writes, lazy/glitch-free derivation, post-DOM synchronization, microtask batching, deterministic owner disposal, and named cycle diagnostics. Phase 1 needs a concrete runtime architecture that implements those semantics without adding a second state model or new root API concepts.

## Decision

Nomos uses one fine-grained reactive graph and one owner tree.

### Reactive graph

- State cells are versioned mutable sources.
- Derived nodes are versioned, lazy, memoized sources/observers.
- DOM bindings and `sync()` are observers.
- Reads capture dependencies dynamically and store the source version seen by the observer.
- Writes update state synchronously and synchronously invalidate dependents.
- `Object.is`-equal state writes do not invalidate.
- Dirty derives recompute on demand. Their version advances only when the derived value changes.
- Development runtime rejects state writes while a derive evaluates.

### Scheduling

- The first pending reactive consumer schedules one platform `queueMicrotask()` flush.
- A flush drains DOM observers before sync observers.
- If sync work produces more DOM work, sync processing yields back to the DOM phase before continuing.
- Testing/interoperability may force the same flush implementation; no public application `flush()` or rerender phase is introduced.
- Async `sync()` tracking ends when its callback returns the Promise; reads performed by continuations after `await` are therefore untracked.

### Ownership

- All runtime lifetimes use a single parent/child owner structure.
- Each owner stores child owners, local cleanups, owned DOM removers, and owned observers.
- Mount activates pending owned observers.
- Disposal order is children first, local cleanup in reverse creation order, then owned DOM.
- Sync cleanup is ordinary owned cleanup, not a parallel lifecycle mechanism.

### Cycle detection

Development flushes retain state and sync-owner debug labels. A non-stabilizing sync loop throws a dedicated error naming participating states and synchronization owners.

## Dependency decision

Do not adopt a third-party reactivity engine for the runtime core. The contract-specific scheduler and ownership behavior would still need custom adaptation, making such a dependency net-negative for implementation time, bundle size, debuggability, and conformance precision.

Use platform primitives (`Map`, `Set`, `queueMicrotask`) for this core. Continue using dependencies where they remove substantial unrelated complexity without defining Nomos semantics.

## Consequences

### Positive

- Synchronous state semantics and lazy derives remain simple and inspectable.
- DOM-before-sync ordering is explicit and testable.
- Dynamic dependency changes do not require user-authored dependency arrays.
- One owner model can serve components, branches, attachments, and later query subscriptions.
- Compiler-generated DOM bindings can target the same observer API without creating a rerender phase.

### Constraints

- Compiler lowering must translate transparent Nomos state/derive reads and state writes to the internal cell read/write ABI; raw uncompiled primitive `state()` expressions are not the execution model.
- Deep object/collection tracking remains a separate layer over the same graph.
- Shared/exclusive request cancellation extends the owner resource model in the query slice.
- `state.snapshot` semantics and placement remain governed by existing unresolved contract work; this ADR does not resolve `OD-004`.

## Rejected alternatives

1. **Eager derivation.** Rejected because the PRD requires lazy derives and eager propagation performs avoidable work.
2. **Single unordered effect queue.** Rejected because `sync()` must rerun after affected DOM updates.
3. **Separate lifecycle systems for components/effects/queries.** Rejected because the PRD already defines one ownership/disposal model and separate systems duplicate cleanup logic.
4. **Promise-based microtask shims.** Rejected in favor of the dedicated `queueMicrotask()` platform API.
5. **External signals/reactivity runtime.** Rejected for this core because adapter code would be larger and less precise than the required native graph.

## Verification

Initial runtime contract tests cover synchronous writes and `Object.is` suppression; lazy/memoized/glitch-free derives; dynamic dependencies; derive write guards; DOM-before-sync ordering; automatic microtask delivery; post-`await` tracking cutoff; `untrack()`; deterministic disposal; sync cleanup; and named cycle diagnostics.

This ADR resolves Wayfinder issue #4. It closes none of the eleven PRD Open Decisions.
