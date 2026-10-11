# Research: embedded TypeScript and CSS representation boundary

**Original research date:** 2026-10-08  
**Implementation status updated:** 2026-10-11  
**Wayfinder ticket:** https://github.com/AahPlexX/nomos/issues/2

## Question

What compiler-facing representation should Nomos use for embedded TypeScript and CSS in Phase 1 so typed analysis, exact source spans, diagnostics, and later transforms remain stable without coupling Nomos's compiler contract to transitional third-party APIs?

## Primary-source findings

### TypeScript

Microsoft's TypeScript 7.0 release announcement states that TypeScript 7.0 does not ship a programmatic API and that TypeScript 7.1 is expected to ship a new and different API. Microsoft publishes `@typescript/typescript6` so tools needing programmatic compiler access can continue using the TypeScript 6 API alongside the TypeScript 7 CLI. The announcement explicitly calls out embedded-language workflows as cases that must continue relying on TypeScript 6-era programmatic tooling for now.

Sources:

- https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
- https://www.npmjs.com/package/@typescript/typescript6

The compiler API models source text and syntax as `SourceFile` and semantic/type analysis through `Program` and the checker. These structures are useful adapter internals but are not an appropriate durable Nomos IR because the TypeScript team has already announced a different future programmatic API.

The executable baseline remains exact-pinned at `@typescript/typescript6@6.0.2`, Apache-2.0.

### CSS

Lightning CSS describes itself as a standards-oriented browser-grade CSS parser/transformer and exposes typed visitor/transform APIs plus source-map input/output.

Sources:

- https://github.com/parcel-bundler/lightningcss
- https://lightningcss.dev/transforms.html
- https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts
- https://www.npmjs.com/package/lightningcss

The Node API is visitor/transform oriented rather than a promise that returned objects are long-lived stable compiler IR. Nomos raw spans therefore remain authoritative rather than delegating ownership to adapter positions.

## Decision

Nomos owns durable embedded-language records and treats TypeScript/Lightning CSS objects as opaque implementation adapters.

### TypeScript boundary

- `EmbeddedScript` owns the exact `.nomos` script-body span, raw text, language (`ts` or explicit `js`), filename/virtual identity, and adapter metadata.
- `EmbeddedExpression` owns the exact template-expression outer/body spans, raw text, filename/virtual identity, adapter metadata, and deterministic synthetic-wrapper translation.
- TypeScript AST nodes, Program/checker objects, and transform results never become public or durable Nomos compiler IR.
- TypeScript 7 remains usable for CLI/project compilation where appropriate; moving the adapter to a future TypeScript 7.1+ API requires separate migration evidence and does not resolve `OD-009`.

### CSS boundary

- `EmbeddedStylesheet` owns the exact style span, raw CSS, global/scoped mode, source identity, and adapter metadata.
- Lightning CSS may be used internally for parsing, typed visitation, transforms, and source-map input/output.
- Nomos derives only needed semantic facts into Nomos-owned structures; external visitor/AST objects remain adapter-private.
- Nomos raw spans remain authoritative.

## Executable implementation status — 2026-10-11

The TypeScript script and first text-expression slices are executable and CI-verified against the exact dependency pin.

### Implemented script slice

- `EmbeddedScript` extraction with exact body offsets and CRLF-safe line/UTF-16-column positions;
- symbol-aware imported `state`/`derive` recognition, including aliases and lexical shadowing;
- lowering of `state`, `state.raw`, `derive`, transparent reactive reads, direct/compound writes, prefix/postfix updates, and direct reactive-root `for...of` / `for...in` assignment targets;
- collision-free compiler helpers and loop temporaries;
- static `NOMOS-REACTIVE-DERIVE-WRITE` checks for certified write forms;
- TypeScript-emitter source maps rebased to the original `.nomos` filename and full `sourcesContent`.

### Implemented text-expression slice

- `EmbeddedExpression` extraction from hierarchical interpolation nodes with exact `.nomos` outer/body spans;
- deterministic TypeScript synthetic wrapper for parsing and symbol resolution;
- synthetic reactive declarations backed by script-lowering binding metadata so reactive reads are identified by TypeScript symbol identity rather than spelling;
- lexical shadowing inside the expression preserved correctly;
- reactive reads lower to the existing compiler-internal `read(...)` ABI;
- syntax diagnostics translate from synthetic TypeScript coordinates back to original `.nomos` offsets/spans;
- text interpolation lowering emits Nomos-owned `TextBinding` IR, not durable TypeScript AST nodes;
- each binding emits a first exact mapping point from generated expression start to original interpolation-body start.

Pinned CI evidence:

- RED run `38120782593`: exact toolchain/dependency install succeeded; new expression feature failed because `template-lowering.mjs` was absent.
- GREEN run `38120937878`: lowering/ABI/expression 16/16 and runtime 21/21.

### Still pending behind the same boundary

- complete template-visible semantic/type-check scope across nonreactive script declarations/imports and component boundaries;
- expression lowering for dynamic/mixed/shorthand/spread attributes and structural-block expressions;
- actual DOM node materialization from template AST;
- reactive destructuring assignment targets in script lowering;
- `EmbeddedStylesheet` executable adapter and exact Lightning CSS installation.

The CSS baseline remains `lightningcss@1.33.0` from the last verified research pass and must be freshly rechecked at the exact installation slice.

## Consequences

- The compiler can migrate programmatic TypeScript APIs without rewriting Nomos's durable IR.
- The same TypeScript adapter now serves scripts and first template expressions, avoiding a duplicate expression parser.
- CSS parser/visitor changes remain contained behind one adapter.
- Exact source ownership stays consistent with ADR-0004 and ADR-0006.
- The TypeScript dependency is justified by executable script and expression consumers; Lightning CSS remains deferred until its executable adapter slice.
- This boundary resolves none of the eleven PRD Open Decisions.
