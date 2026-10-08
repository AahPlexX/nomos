# Capability-gauntlet specification

**Status:** Phase 0 specification; implementation is a Phase 2/3 release gate.

The gauntlet is a production-style reference application that proves public Nomos APIs work together without undocumented internals. It is not a showcase of isolated syntax.

## Required capability scenarios

The application must demonstrate, through user-visible flows and browser tests:

1. Authentication shell state and protected/unprotected presentation without requiring server functions in 1.0.
2. Nested routes and layouts with typed route inputs.
3. Search using `query()` with cancellation and stale-result protection.
4. Pagination using documented query/cache behavior.
5. A mutation using `action()` with optimistic cache update and rollback.
6. A complex accessible form with native labels/controls, Standard Schema validation, field/form errors, pending state, and first-invalid-field focus policy.
7. Modal behavior proving initial focus, contained Tab navigation, Escape dismissal, accessible naming, and logical focus restoration.
8. Third-party drag-and-drop integration through documented attachments or browser APIs.
9. Offline draft storage coordinated through `sync()` without inventing a second state model.
10. Owned error recovery using `Boundary` and explicit reset behavior.
11. An SSG marketing route that hydrates only documented interactive behavior and survives development mismatch fixtures.
12. A third-party chart or editor integration through ordinary package/browser interop.
13. A third-party custom element, including typed/property behavior consistent with the eventual custom-element policy.

## Cross-cutting gates

- No undocumented internal import is permitted.
- Every flow runs under the current `standard` profile; selected suites also run under `strict` where applicable.
- Keyboard-only operation and 320 CSS px reflow are tested for every relevant flow.
- Query/action concurrency tests prove callers settle and stale results never replace newer state.
- Browser tests, not DOM emulation alone, cover focus, HTML parsing, hydration, and native event behavior.
- Devtools must make query policy, ownership, dependency mapping, and remount/HMR reasons inspectable when those features exist.

## Completion rule

A capability is not accepted merely because the gauntlet can be made to work. It is accepted only when the gauntlet uses the documented public model and the corresponding conformance tests pass.
