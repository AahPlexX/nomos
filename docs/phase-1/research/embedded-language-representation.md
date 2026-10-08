# Research: embedded TypeScript and CSS representation boundary

**Date:** 2026-10-08  
**Wayfinder ticket:** https://github.com/AahPlexX/nomos/issues/2

## Question

What compiler-facing representation should Nomos use for embedded TypeScript and CSS in Phase 1 so typed analysis, exact source spans, diagnostics, and later transforms remain stable without coupling Nomos's compiler contract to transitional third-party APIs?

## Primary-source findings

### TypeScript

Microsoft's TypeScript 7.0 release announcement states that TypeScript 7.0 does not ship a programmatic API and that TypeScript 7.1 is expected to ship a new and different API. Microsoft publishes `@typescript/typescript6` specifically so tools needing programmatic compiler access can continue using the TypeScript 6 API alongside the TypeScript 7 CLI. The announcement explicitly calls out embedded-language workflows such as Vue, MDX, Astro, Svelte, Angular, and Volar as cases that must continue relying on TypeScript 6-era programmatic tooling for now.

Sources:

- https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
- https://www.npmjs.com/package/@typescript/typescript6

The current compiler-API documentation describes `SourceFile` as the representation that owns source text plus the TypeScript AST and `Program` as the whole-application container used for semantic/type analysis. The same documentation warns that it describes TypeScript 6.0 and earlier and that TypeScript 7.1 will expose a completely different API.

As checked on 2026-10-08, `@typescript/typescript6` is version `6.0.2`, Apache-2.0, and re-exports the TypeScript 6 API.

### CSS

Lightning CSS describes itself as a standards-oriented browser-grade CSS parser/transformer and exposes typed property values. Its Node API exports AST types and supplies a typed visitor API (`StyleSheet`, rules, declarations, values, etc.) for custom analysis/transforms. Its transform API can emit source maps and consume an `inputSourceMap`.

Sources:

- https://github.com/parcel-bundler/lightningcss
- https://lightningcss.dev/transforms.html
- https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts
- https://www.npmjs.com/package/lightningcss

As checked on 2026-10-08, `lightningcss` is version `1.33.0` and MPL-2.0.

The Node API is visitor/transform oriented rather than a promise that an externally returned AST object is a long-lived stable compiler IR. Also, an open first-party 2026 issue documents an off-by-one source-location defect for one `url()` dependency case. Nomos therefore cannot delegate its authoritative source-span model to Lightning CSS locations.

Source:

- https://github.com/parcel-bundler/lightningcss/issues/1149

## Decision recommendation

Nomos should own the durable embedded-language representation and treat TypeScript/Lightning CSS objects as opaque implementation adapters.

### TypeScript adapter boundary

- A Nomos `EmbeddedScript` record owns the exact `.nomos` source span, raw text, language (`ts` or explicit `js`), filename/virtual identity, and adapter-version metadata.
- A Nomos `EmbeddedExpression` record owns the exact template-expression span and raw text plus a deterministic offset translation between the synthetic parse wrapper and the original `.nomos` span.
- Internally, the Phase 1 adapter may attach an opaque TypeScript 6 `SourceFile` produced through `@typescript/typescript6@6.0.2` and, when semantic analysis is required, associate it with a `Program`/checker context.
- TypeScript AST nodes are not Nomos's stable compiler IR and must not leak into public framework/compiler contracts.
- TypeScript 7 remains usable for project-wide CLI compilation where appropriate; adopting the future TypeScript 7.1+ programmatic API requires separate migration evidence and does **not** get decided by this boundary.

### CSS adapter boundary

- A Nomos `EmbeddedStylesheet` record owns the exact `.nomos` style-section span, raw CSS text, global/scoped mode, filename/virtual identity, and adapter-version metadata.
- `lightningcss@1.33.0` may be used internally for standards-grade parsing, typed value/rule visitation, transformation, and source-map input/output.
- Nomos derives only the semantic facts it needs into Nomos-owned structures (for example rules/selectors/declarations/references needed by scoping/lowering). Lightning CSS AST/visitor objects are adapter internals, not persistent Nomos IR.
- Nomos raw spans remain authoritative. Lightning CSS locations may be retained only as secondary adapter diagnostics/evidence and must never overwrite exact Nomos source coordinates.

## Consequences

- The compiler can move from TypeScript 6 compatibility to a future TypeScript 7.1+ API without rewriting Nomos's template/compiler IR.
- CSS parser/visitor changes are contained behind one adapter rather than propagating third-party AST shapes throughout lowering.
- Exact source ownership remains consistent with ADR-0004 and can be composed into generated-code source maps independently of third-party location quirks.
- Dependency additions remain deferred until executable adapter code consumes them; when added, exact versions and license/vulnerability checks remain mandatory.
- This decision does not resolve any of the eleven PRD Open Decisions, including the explicit TypeScript 7.1+ adoption-timing item.
