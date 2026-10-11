# Runtime ownership and scheduling research

**Date:** 2026-10-10  
**Scope:** Wayfinder issue #4; Phase 1 state/derive/sync ownership and scheduling architecture  
**Status:** decision input for ADR-0008

## Binding Nomos constraints

The preserved PRD and `docs/phase-0/REACTIVE-CONTRACT.md` already fix the semantics that matter here: state writes are synchronous; `derive()` is read-only, lazy, memoized, synchronously dependency-tracked, and glitch-free; development runtime checks reject unresolved writes from a derive; `sync()` starts only after its owner mounts, tracks only synchronous reads, cleans up before rerun/disposal, and reruns after affected DOM updates; DOM work and sync reruns batch into a microtask flush; non-terminating reactive cycles must identify participating states and synchronization owners; disposal is child owners first, local cleanup in reverse creation order, then owned DOM; and the public runtime has no rerender phase or second state model.

## Authoritative implementation references

Research revalidated on 2026-10-10:

1. `queueMicrotask()` is the platform primitive matching Nomos's required microtask flush without Promise-allocation tricks.
2. Solid's current owner/root and memo documentation corroborates an explicit ownership tree plus memoized fine-grained derivation.
3. Vue's current post-flush watcher documentation corroborates an explicit post-DOM synchronization phase.

Nomos does not take a runtime dependency on Solid, Vue, or TC39 Signals. Their semantics are not identical to the ratified Nomos contract, and adapting their owner/scheduler rules would create more code and conformance risk than the small native core requires.

## Chosen graph

Sources are versioned state cells and versioned derived nodes. Consumers are compiler-internal DOM observers and sync observers. Every observer records the exact source versions seen during its last successful run; dynamic dependencies are removed before rerun and recaptured from synchronous reads.

A state write immediately updates value/version unless `Object.is(old, next)` is true. Derived nodes are not eagerly recomputed: a dirty derive recomputes on read or when a scheduled consumer checks whether its derived dependency actually changed. Equal derived output leaves the derived version unchanged so downstream scheduled work can be skipped.

## Ownership

One tree is sufficient: owner → child owners, local cleanup stack, owned DOM removers, and owned observers. Component instances, conditional/list/async branches, attachments, and later query subscriptions all map to this same owner shape.

Mounting activates pending observers. Disposal is children first, then local cleanup in reverse creation order, then owned DOM. Sync cleanup is registered through the same local cleanup mechanism.

## Scheduler

One scheduler has two ordered microtask phases: DOM first, sync second. If a sync writes state and creates new DOM work, remaining sync work yields back to the DOM phase before continuing. Testing/interoperability can force the same flush function directly; this is not a public application-runtime concept.

Tracking is active only while an observer callback executes synchronously. An async callback returns its Promise before its first continuation, so reads after `await` occur after the active observer is cleared without Promise instrumentation or async-context propagation.

## Cycle diagnostics

The development scheduler records state writes performed by sync observers together with owner/sync debug labels. A non-stabilizing flush throws a dedicated error naming accumulated states and synchronization owners. The numeric iteration guard is an implementation safety limit, not public semantics.

## Dependency decision

No third-party reactive runtime dependency is added for this slice. The required graph is small, Nomos has contract-specific scheduling/ownership behavior, and adapting another framework would retain nearly all custom scheduler/owner code while adding upgrade and semantic risk. Platform `Map`, `Set`, and `queueMicrotask()` already provide the needed low-level mechanisms.

Dependencies remain appropriate for separate problems where they remove meaningful burden without defining Nomos semantics, such as the approved TypeScript and Lightning CSS adapters.

## Current implementation boundary

ADR-0008's first executable slice establishes scalar/source graph behavior, dynamic dependencies, derives, owner lifecycle, DOM/sync scheduling, async tracking cutoff, untracking, and cycle diagnostics.

Deep Proxy tracking for plain objects/arrays/Map/Set, `state.raw`, snapshot semantics, compiler lowering, request ownership/cancellation, and generated DOM bindings remain separate contract slices. `state.snapshot` must not be declared conformant before its required built-in/cycle/non-cloneable/error semantics are specified, and `OD-004` remains open.
