# Nomos

> **Status:** Phase 1 vertical-slice work is active. `Nomos` and `.nomos` are provisional names and are not cleared for public branding.

Nomos is an HTML-first, compiler-driven, TypeScript-native framework proposed for client-rendered and statically generated web applications. The project intentionally limits user-facing concepts and moves dependency tracking, ownership cleanup, targeted DOM updates, diagnostics, and build coordination into an inspectable compiler/runtime model.

The binding product contract is [`PRD.md`](./PRD.md): it preserves the original supplied PRD and lists effective product-owner amendments. Development state is recorded in [`docs/STATUS.md`](./docs/STATUS.md), the ordered queue in [`TODO.md`](./TODO.md), and continuation rules in [`AGENTS.md`](./AGENTS.md).

## Current phase

Phase 0 established the language and behavioral thesis: formal component grammar, additive learning levels, root runtime API budget, ten representative `.nomos` fixtures, parser/whitespace contract corpus, machine-readable normative traceability, open-decision tracking, and executable contract tests.

PRD Amendment 0001 removes the unavailable five-external-reviewer requirement from the Phase 0 exit gate while retaining the contradiction-free semantic requirement. The internal contradiction audit is clean, so Phase 0 is closed and Phase 1 — Vertical Slice is now active.

Phase 1 delivers parser/source maps, reactive state/derivation/synchronization/ownership, text/attribute bindings, events/native-control bindings, conditions/keyed lists, components/inputs, scoped CSS, Vite/HMR integration, and Levels 0–3. Its exit target remains a deterministic TodoMVC-class browser application with valid-state HMR preservation and complete owned-effect cleanup.

## Verification

The repository uses pnpm. Phase 0 contract tooling intentionally remains dependency-light.

```bash
pnpm test
pnpm check:prd
pnpm check:phase0
pnpm check
```

`pnpm` is pinned through `packageManager`; dependencies added later must use exact versions.

## Scope boundary

Nomos 1.0 targets CSR, SSG, and hydration of statically rendered pages. Request-time SSR, streaming, server functions, server-runtime adapters, and resumability remain outside the current Phase 1 implementation target unless the effective PRD is formally amended.
