# Nomos

> **Status:** Phase 0 thesis work in progress. `Nomos` and `.nomos` are provisional names and are not cleared for public branding.

Nomos is an HTML-first, compiler-driven, TypeScript-native framework proposed for client-rendered and statically generated web applications. The project intentionally limits user-facing concepts and moves dependency tracking, ownership cleanup, targeted DOM updates, diagnostics, and build coordination into an inspectable compiler/runtime model.

The binding product contract is [`PRD.md`](./PRD.md). Development state is recorded in [`docs/STATUS.md`](./docs/STATUS.md), the ordered queue in [`TODO.md`](./TODO.md), and continuation rules in [`AGENTS.md`](./AGENTS.md).

## Current phase

Phase 0 establishes the language and behavioral thesis before implementation. Current checked-in artifacts include the formal component grammar draft, the additive learning-level contract, the root runtime API budget contract, ten representative `.nomos` fixtures, a parser contract corpus, a machine-readable normative-requirement ledger, and executable Phase 0 contract tests.

## Verification

The repository uses pnpm and intentionally has no third-party runtime or test dependency in the first Phase 0 slice.

```bash
pnpm test
pnpm check:phase0
pnpm check:traceability
```

`pnpm` is pinned through `packageManager`; dependencies added later must use exact versions.

## Scope boundary

Nomos 1.0 targets CSR, SSG, and hydration of statically rendered pages. Request-time SSR, streaming, server functions, server-runtime adapters, and resumability are not Phase 0/1 implementation targets unless the PRD is formally amended.
