# ADR-0005: Nomos-owned embedded-language adapter boundary

- **Status:** Accepted for Phase 1 compiler front end
- **Date:** 2026-10-08
- **Wayfinder evidence:** `docs/phase-1/research/embedded-language-representation.md`, https://github.com/AahPlexX/nomos/issues/2
- **Revalidation:** Before changing the TypeScript programmatic API generation or replacing/upgrading the CSS parser adapter

## Context

Phase 1 must parse TypeScript, template expressions, and CSS into typed compiler structures while preserving exact `.nomos` source positions. The current toolchain is in transition: TypeScript 7.0 has no stable programmatic API, while Microsoft explicitly provides `@typescript/typescript6` for tools that still need programmatic compiler access. Lightning CSS provides standards-oriented typed CSS parsing/visitor APIs and source-map composition support, but its external API and locations must not become the durable Nomos compiler contract.

ADR-0001 already permits TypeScript 6 compatibility tooling during the TypeScript 7 transition. ADR-0004 makes Nomos's own raw UTF-16 source coordinates authoritative.

## Decision

Nomos owns the durable embedded-language IR. Third-party compiler/parser structures are opaque, versioned adapter internals.

### TypeScript

Nomos defines stable wrapper records for embedded scripts and template expressions. These wrappers own:

- exact `.nomos` source span and raw source text;
- language mode and virtual/source identity;
- adapter/version metadata;
- deterministic offset translation for any synthetic expression wrapper;
- an internal opaque parser handle that is not part of the public Nomos compiler contract.

During the current transition, the internal parser handle may be a TypeScript 6 `SourceFile` from exact-pinned `@typescript/typescript6`. Whole-program semantic analysis may use a TypeScript `Program`/checker context when needed. A future TypeScript 7.1+ API migration must adapt behind this boundary and requires its own evidence; this ADR does not resolve `OD-009`.

### CSS

Nomos defines a stable embedded-stylesheet wrapper owning exact source span/text, style mode, source identity, and adapter/version metadata. Lightning CSS may be used internally for typed CSS parsing/visitation/transformation, but Nomos stores only the semantic facts needed by its own compiler in Nomos-owned structures.

Lightning CSS AST/visitor objects are not persistent Nomos IR. Nomos source spans remain authoritative even when the adapter supplies secondary locations.

## Dependency baseline when implementation consumes the adapters

Fresh primary-source/package verification on 2026-10-08 found:

- `@typescript/typescript6@6.0.2` — Apache-2.0;
- `lightningcss@1.33.0` — MPL-2.0.

Do not add either package merely because this ADR exists. Add an exact-pinned dependency only in the implementation slice that exercises it, with the repository-required vulnerability/license recheck at that time.

## Consequences

- Nomos's compiler IR is insulated from the TypeScript 7.1 API migration and Lightning CSS API churn.
- Template/source-map code continues to reason from one authoritative raw-span model.
- TypeScript/CSS adapter tests can prove translation correctness independently of lowering.
- Third-party node identity and location conventions cannot silently become source-language semantics.
- This ADR closes no PRD Open Decision.

## Primary sources

- https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
- https://www.npmjs.com/package/@typescript/typescript6
- https://github.com/parcel-bundler/lightningcss
- https://lightningcss.dev/transforms.html
- https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts
- https://www.npmjs.com/package/lightningcss
- https://github.com/parcel-bundler/lightningcss/issues/1149
