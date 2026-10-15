# Nomos

> **Status:** Phase 1 vertical-slice work is active. `Nomos` and `.nomos` are provisional names and are not cleared for public branding.

Nomos is an HTML-first, compiler-driven, TypeScript-native framework proposed for client-rendered and statically generated web applications. The project intentionally limits user-facing concepts and moves dependency tracking, ownership cleanup, targeted DOM updates, diagnostics, and build coordination into an inspectable compiler/runtime model.

The binding product contract is [`PRD.md`](./PRD.md): it preserves the original supplied PRD and lists effective product-owner amendments. Development state is recorded in [`docs/STATUS.md`](./docs/STATUS.md), the ordered queue in [`TODO.md`](./TODO.md), and continuation rules in [`AGENTS.md`](./AGENTS.md).

## Current phase

Phase 0 established the language and behavioral thesis: formal component grammar, additive learning levels, root runtime API budget, ten representative `.nomos` fixtures, parser/whitespace contract corpus, machine-readable normative traceability, open-decision tracking, and executable contract tests.

PRD Amendment 0001 removes the unavailable five-external-reviewer requirement from the Phase 0 exit gate while retaining the contradiction-free semantic requirement. The internal contradiction audit is clean, so Phase 0 is closed and Phase 1 — Vertical Slice is active.

The current Phase 1 browser-DOM checkpoint implements text interpolation plus **4/4 required standard-HTML runtime attribute forms**: dynamic, mixed, shorthand, and source-ordered spread. Spread-containing elements use one owner-backed grouped plan with deterministic left-to-right precedence; runtime-discovered event-handler and currently-unvalidated URL-bearing spread keys remain blocked before DOM mutation. Custom-element dynamic/spread behavior is intentionally still guarded while `OD-008` is open.

The built-in standard-HTML property-assignment table is now published and tested. It records the browser current-state seams required for input/textarea/select values, checkedness, files, option selectedness, output values, media muting, and reflected `open`, including input-type-specific value modes. Existing dynamic/spread mutation remains attribute-oriented until the dedicated property/native-control implementation consumes that table with explicit cleanup and two-way semantics.

The immediate next frontier is the dynamic URL protocol validator, followed by property-backed authored/native-control activation plus `on:` event lowering and `bind:` semantics. Phase 1 overall still includes conditions/keyed lists, components/inputs, scoped CSS, Vite/HMR integration, and Levels 0–3. Its exit target remains a deterministic TodoMVC-class browser application with valid-state HMR preservation and complete owned-effect cleanup.

## Verification

The repository uses pnpm. Phase 0 contract tooling intentionally remains dependency-light.

```bash
pnpm test
pnpm check:prd
pnpm check:phase0
pnpm check
```

`pnpm` is pinned through `packageManager`; dependencies added later must use exact versions. GitHub Actions is the pinned Phase 1 verification surface, including real Chrome/Trusted Types checks for browser DOM behavior.

## Scope boundary

Nomos 1.0 targets CSR, SSG, and hydration of statically rendered pages. Request-time SSR, streaming, server functions, server-runtime adapters, and resumability remain outside the current Phase 1 implementation target unless the effective PRD is formally amended.
