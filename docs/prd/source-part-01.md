# Nomos Product Requirements Document

**Document status:** Product and technical requirements baseline  
**Product status:** Pre-implementation; working name not cleared  
**Information date:** October 7, 2026  
**Target release:** Nomos 1.0  
**Audience:** Product owners, framework engineers, compiler engineers, tooling engineers, technical writers, test engineers, accessibility specialists, security reviewers, and coding agents

## Executive Summary

Nomos is a proposed HTML-first, compiler-driven, TypeScript-native framework for building client-rendered and statically generated web applications. It combines components, fine-grained state, routing, asynchronous data, forms, accessibility-oriented UI primitives, diagnostics, and build tooling behind one canonical authoring model.

The central product hypothesis is that framework complexity can be reduced by limiting the number of user-facing concepts rather than merely shortening syntax. Nomos therefore uses one component format, one reactive model, one router, one remote-data model, one form model, and additive learning levels. The compiler absorbs dependency tracking, cleanup ownership, targeted DOM updates, code splitting, and diagnostics while keeping generated behavior inspectable.

The product is technically feasible using current web and tooling foundations. Vite 8 provides a stable Rolldown-based build platform, Volar supports language tooling for embedded file formats, Standard Schema provides a validation-library-neutral interface, and current browsers provide a substantial native base for dialogs, popovers, navigation, view transitions, custom elements, CSP, and Trusted Types.[^1][^2][^3][^4]

Nomos 1.0 is intentionally limited to client-side rendering, static-site generation, and hydration of statically rendered pages. Request-time server rendering, streaming, server functions, and server-runtime adapters are deferred to Nomos 1.x. Every 1.0 capability must be demonstrated by conformance tests and a production-style reference application before release.

## Document Authority

This document defines the product requirements and public behavioral contract for Nomos 1.0. Requirements use the following terms:

- **MUST:** Required for conformance and release.
- **MUST NOT:** Prohibited for conformance and release.
- **SHOULD:** Expected unless an approved architecture decision records a stronger reason not to comply.
- **MAY:** Optional and non-normative.

Every MUST or MUST NOT requirement must map to at least one automated test in the public `nomos-conformance` suite. A requirement without a test mapping is not release-complete.

The public compatibility surface consists of:

- `.nomos` source syntax and semantics.
- Runtime exports documented in this PRD.
- Diagnostic codes and machine-readable diagnostic shape.
- Configuration and project-manifest schemas.
- Router, forms, testing, element, and interoperability APIs.
- Documented command-line and MCP interfaces.

Generated JavaScript, internal package structure, compiler intermediate representations, and undocumented metadata are not public APIs.

## Product Definition

### Positioning

> Build production web applications with HTML, CSS, and TypeScript. Declare changing values, derive everything else, and let the compiler coordinate updates, cleanup, loading states, and code splitting.

### Problem

Modern front-end development often requires developers to coordinate component composition, local and shared state, derived values, side effects, asynchronous work, routing, forms, rendering modes, build configuration, accessibility, and performance behavior. In the 2025 State of JavaScript survey, the highest-ranked front-end framework pain points included excessive complexity, performance, state management, choice overload, breaking changes, browser support, dependency burden, bloat, and speed of change.[^5]

Nomos addresses that problem through bounded concepts and integrated defaults. It does not claim that application architecture becomes intrinsically simple or that beginners immediately acquire professional engineering judgment.

### Product Hypotheses

The following statements are hypotheses to validate rather than market as established facts:

- A single reactive model reduces framework-specific concepts without limiting production capability.
- Additive learning levels improve early success and later retention.
- Plain-language diagnostics reduce repeated errors and documentation lookups.
- Integrated routing, data, and forms reduce configuration and dependency burden.
- Inspectable compilation increases trust in compiler-managed behavior.
- Agent-readable contracts improve automated changes without degrading human authoring.

### Target Users

| User group | Primary need | Required product response |
|---|---|---|
| First-time programmer | Reach visible, interactive results without learning multiple framework models | HTML-first files, additive levels, constrained diagnostics, canonical tutorial |
| Early-career developer | Build complete applications without assembling a fragmented stack | Integrated router, data, forms, testing, accessibility checks |
| Experienced front-end engineer | Predictable semantics, control, performance, interoperability | Explicit ownership, ordinary browser APIs, inspectable output, escape hatches |
| Library author | Typed components that work across host environments | Custom-element output, manifests, wrappers, stable public contracts |
| Tool or coding-agent author | Machine-readable project meaning and diagnostics | JSON schemas, project manifest, SARIF, MCP tools |

### User Outcomes

Nomos 1.0 succeeds when users can:

- Create a static page using only HTML and CSS.
- Add interaction by introducing state and event handling without changing the static structure.
- Compose typed components with one-way data flow.
- Build routes, remote queries, mutations, and accessible forms without mandatory third-party framework packages.
- Understand why a source line updates the DOM.
- Embed a Nomos component in a standards-based host.
- Deploy CSR or SSG output to a static host.

## Goals and Non-Goals

### Goals

Nomos 1.0 MUST provide:

- HTML-first single-file components.
- TypeScript-first scripts and complete template type checking.
- Fine-grained local and shared reactive state.
- Explicit derived values and external synchronization.
- Conditional, keyed-list, and asynchronous rendering.
- Typed inputs, callback outputs, slots, and constrained context.
- Scoped CSS, global CSS, ordinary CSS-tool integration, and typed design tokens.
- A file router with nested layouts and typed route inputs.
- Remote queries, mutations, caching, cancellation, and stale-response protection.
- Native-form integration and schema-based validation.
- Accessible UI primitives for common complex widgets.
- CSR, SSG, and hydration for interactive statically generated pages.
- Vite integration, HMR, tests, devtools, diagnostics, and source maps.
- Custom-element output and framework-independent mounting.
- Machine-readable project and capability manifests.
- Additive learning levels and strictness profiles.

### Non-Goals

Nomos 1.x MUST NOT introduce:

- A new general-purpose programming language.
- A custom package manager.
- A custom CSS language.
- A second canonical component syntax.
- Multiple official state systems.
- A proprietary deployment cloud.
- Native-mobile parity.
- A broad visual component library.
- A public compiler-transform API before at least three real integrations demonstrate a need.
- Resumability before conventional SSR and hydration are correct and measurable.

## Product Principles

### One Canonical Path

| Need | Canonical Nomos mechanism |
|---|---|
| Mutable value | `state()` |
| Calculated value | `derive()` |
| External synchronization | `sync()` |
| User event | Ordinary function attached with `on:` |
| Two-way native-control value | `bind:` |
| Remote read | `query()` |
| User-triggered mutation | `action()` |
| Shared application state | Exported state object or stateful class in `.nomos.ts` |
| Parent-to-child communication | Typed inputs |
| Child-to-parent communication | Callback input named `on*` |
| Visual composition | Slots |
| Cross-tree infrastructure | Typed `context()` |
| Navigation | Built-in file router and ordinary links |
| Form submission | Native `<form>` with an Action value |
| Loading and error region | `Boundary` |
| Direct element integration | `use:` attachment or `bind:this` |

### Standards First

Generated output MUST preserve semantic HTML, native events, forms, URLs, focus behavior, and browser APIs unless a documented requirement makes an abstraction necessary. Native semantics do not remove the need for accessibility behavior: for example, an accessible modal still requires deliberate initial focus, contained tab navigation, Escape behavior, and logical focus restoration.[^6][^7]

### Complexity Budget

The stable `nomos` root package MUST expose no more than 12 runtime concepts. A proposal for a new root export MUST identify the existing concept it replaces or move to a scoped subpackage.

Nomos MUST NOT require:

- Hook call-order rules.
- User-authored dependency arrays.
- Classes or decorators for ordinary components.
- A separate state-management package.
- A separate form package for core form behavior.
- A separate client-cache package for core query behavior.

### Inspectability

Compiler-managed behavior MUST be inspectable through source maps, generated-code views, a dependency graph, DOM-operation views, and line-level explanations. Optimization MUST NOT make the documented semantics unobservable or nondeterministic.

## Current Technical Baseline

The following baseline constrains architecture decisions as of October 7, 2026:

- Vite 8 is stable and uses Rolldown as its unified bundler; Vite exposes transformation, virtual-module, and HMR hooks appropriate for a component compiler integration.[^8][^1]
- TypeScript 7 is available, but the TypeScript team stated during the 7.0 transition that a stable programmatic API would arrive no earlier than 7.1 and provided a TypeScript 6 compatibility package for API-dependent tools.[^9][^10]
- Volar is designed for embedded-language tooling and exposes virtual-code mappings suitable for HTML, CSS, and TypeScript inside a component file.[^2][^11][^12]
- Standard Schema defines a common TypeScript validation interface that tools can consume without library-specific adapters.[^3][^13]
- React Compiler 1.0 is stable, confirming that compiler-directed framework optimization is production-viable, though its architecture and semantics are not Nomos requirements.[^14]
- Svelte's component-level `await` support remains explicitly experimental in Svelte 5 documentation, reinforcing the decision to ship a separate explicit query abstraction in Nomos 1.0.[^15]
- Angular 22 is the active major line, and its template error-boundary feature is documented as developer preview; Nomos therefore treats boundaries as a feature requiring its own conformance proof rather than assuming ecosystem-wide settled semantics.[^16][^17]
- The TC39 Signals proposal remains Stage 1 and MUST NOT be a Nomos platform dependency.[^18]
- Same-document View Transitions are broadly available in current browsers but still require fallback behavior for older targets.[^19][^20]

Third-party status statements MUST be revalidated for every Nomos minor release. They MUST NOT determine source semantics unless incorporated through an approved RFC and conformance tests.

## Component Model

### Files

| File or path | Meaning |
|---|---|
| `*.nomos` | Component file |
| `*.nomos.ts` | Compiled reactive TypeScript module |
| `*.ts` | Ordinary TypeScript without Nomos source rewriting |
| `*.server.ts` | Server-only module; browser reachability is an error |
| `src/routes/**` | File-based routes |
| `src/tokens.css` | Optional indexed design-token file |
| `nomos.config.ts` | Project configuration |

A generated project MUST contain `src/routes`, `src/lib`, `public`, `nomos.config.ts`, and `tsconfig.json`. `src/tokens.css` MAY be omitted when design-token checking is disabled.

### Component Anatomy

A `.nomos` file MAY contain:

- At most one top-level `<script>` block.
- Component markup.
- One or more `<style>` blocks.

All sections are optional. A file containing only HTML and CSS is valid.

Scripts use TypeScript by default. `lang="js"` opts into JavaScript. Nomos primitives MUST be recognized by resolved import binding, not by identifier spelling, so renamed imports work and unrelated local functions are not transformed.

A component setup script executes once per component instance. Reactive bindings update after setup; the user model contains no component rerender phase.

### Inputs and Outputs

`inputs<T>()` declares typed component inputs. Destructured input reads MUST remain live when the parent supplies a new value. Inputs are read-only inside the child.

Child-to-parent communication uses callback inputs named `on*`. Nomos MUST NOT provide a second component-event system. Custom-element output MAY additionally dispatch corresponding `CustomEvent` objects for host interoperability.

### Slots

Components MUST support:

- One default slot.
- Named slots.
- Fallback slot content.
- Typed scoped-slot values.

Slotted content belongs to the parent reactive scope. Scoped-style ownership MUST be deterministic and covered by conformance fixtures.

### Context

`context<T>(name)` creates a typed key with `provide(value)` and `use()` operations. Context is restricted by guidance and diagnostics to cross-cutting infrastructure such as locale, theme, session, and router state. Ordinary application data SHOULD use inputs or explicit module state.

## Reactive Model

### Contract

The user-facing contract consists of four statements:

1. A state value may change.
2. A derived value is calculated from reactive values it reads.
3. Markup updates when values it reads change.
4. Synchronization exists only to coordinate with an external system.

### State

`state(initial)` creates mutable reactive state in a compiled `.nomos` or `.nomos.ts` file. Reading tracks a dependency. Assignment, compound assignment, increment, decrement, and supported property mutation notify dependents.

Plain objects, arrays, `Map`, and `Set` MUST support deep reactive tracking. Class instances, dates, DOM nodes, typed arrays, promises, errors, functions, weak collections, and frozen objects MUST be stored by reference; their internal mutation is not reactive unless wrapped by user code.

`state.raw(initial)` disables deep tracking. `state.snapshot(value)` produces a detached non-proxy value suitable for structured data interchange. Snapshot support MUST define behavior for supported built-ins, repeated references, cycles, non-cloneable values, and errors before implementation is considered conformant.

Writes for which `Object.is(oldValue, newValue)` is true MUST NOT notify dependents.

### Derivation

`derive(() => value)` creates a read-only, lazy, memoized derived value. Dependencies are captured automatically from synchronous reads. A derive MUST be glitch-free: every read observes a state-consistent result after preceding synchronous writes.

Writing reactive state from a derive is an error. The compiler MUST report statically detectable cases, and development runtime checks MUST catch unresolved cases.

### Synchronization
