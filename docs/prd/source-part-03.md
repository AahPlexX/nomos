
Nomos targets WCAG 2.2 AA conformance for official starters, documentation examples, and the capability-gauntlet application. The framework MUST describe this as a target and test obligation, not a guarantee that every user application is conformant.

The `nomos/ui` package ships Dialog, Menu, Tabs, Combobox, and Listbox. Each primitive MUST:

- Prefer native semantic elements where they satisfy the contract.
- Follow applicable WAI-ARIA Authoring Practices keyboard and focus guidance.
- Provide visible focus.
- Restore focus logically after dismissal.
- Work at 320 CSS pixels without avoidable two-dimensional scrolling.
- Pass automated checks and manual keyboard/screen-reader test protocols.

Native elements alone are insufficient for all composite-widget behavior; custom ARIA widgets require explicit keyboard support. Modal-dialog tests must cover initial focus, tab containment, Escape behavior, accessible naming, and focus return.[^7][^6]

Compiler diagnostics MUST cover missing alternative text, missing accessible names, invalid ARIA, click handlers on non-interactive elements, positive tab index, unnamed dialogs, and route heading structure. Diagnostics assist authors but do not certify conformance.

## Security and Privacy

### Output Safety

Nomos MUST:

- Escape interpolated text.
- Make raw HTML explicit.
- Reject or diagnose unsafe raw HTML without an approved sanitizer.
- Refuse expression-derived `javascript:` URLs in URL-bearing attributes.
- Emit no inline event handlers.
- Avoid `eval` and equivalent dynamic-code generation.
- Support nonces for serialized data and executable resources where applicable.
- Keep `.server.ts` modules out of browser-reachable graphs.

Trusted Types and a strict CSP reduce DOM-based XSS risk but are defense-in-depth rather than substitutes for encoding and sanitization.[^24][^25]

### Environment Variables

Only variables with a documented public prefix MAY be embedded in browser output. The default prefix is `NOMOS_PUBLIC_`. Compiler diagnostics MUST identify server-only environment access reachable from client code.

### Supply Chain

Official packages MUST:

- Publish provenance where registry support permits.
- Generate software bills of materials for releases.
- Use lockfile-enforced CI.
- Run dependency and license scanning.
- Publish a security contact and coordinated-disclosure policy.
- Define a supported patch and backport policy before 1.0.

### Telemetry

Nomos MUST collect no telemetry by default. Any future telemetry is opt-in, documented, inspectable, and removable without loss of core functionality.

## Tooling

### Compiler Pipeline

The compiler MUST:

1. Parse component sections and preserve exact source positions.
2. Parse TypeScript, templates, and CSS into typed internal structures.
3. Resolve Nomos primitives by import binding.
4. Analyze reads, writes, ownership, and reactive dependencies.
5. Validate templates, HTML structure, inputs, accessibility, and level rules.
6. Generate static DOM creation and targeted update operations.
7. Emit source maps.
8. Emit metadata for HMR, hydration, SSG, devtools, and manifests.

### Diagnostics

Every diagnostic MUST have:

- Stable code.
- Severity.
- Plain-language message.
- Explanation of why the behavior is invalid or risky.
- Minimal valid repair.
- Exact source span.
- Applicable learning level.
- Canonical documentation URL.
- Machine-readable JSON representation.
- SARIF representation for CI.
- Autofix metadata when a safe fix exists.

Compiler errors for invalid syntax, invalid HTML ownership, impossible level use, server leakage, or assignment to read-only derived values cannot be disabled.

### TypeScript Tooling

Template expressions, component inputs, events, bindings, routes, queries, actions, and custom elements MUST be type checked. Volar is the preferred 1.0 language-tooling foundation because it supports embedded virtual code and source mappings for mixed-language files.[^11][^2]

Until a stable TypeScript 7 programmatic API satisfies the language server and compiler, Nomos MAY use the TypeScript 6 compatibility API internally while permitting TypeScript 7 for ordinary project compilation. The exact supported matrix MUST be validated in CI and documented per release.[^9]

### CLI

Required commands:

| Command | Purpose |
|---|---|
| `nomos create` | Create a project from an official starter |
| `nomos dev` | Start development server and HMR |
| `nomos build` | Produce CSR or SSG output |
| `nomos preview` | Preview production output |
| `nomos check` | Run type, compiler, and diagnostic checks |
| `nomos lint` | Run Nomos rules |
| `nomos doctor` | Run project-level architecture checks |
| `nomos test` | Run configured tests |
| `nomos explain` | Explain a diagnostic or source line |
| `nomos inspect` | Open compiler inspection tooling |
| `nomos add` | Install an official integration preset |
| `nomos mcp` | Start the project MCP server |

### HMR

HMR SHOULD preserve local state when declaration identity and semantics remain compatible. Preservation rules MUST be based on a published signature, not implementation accident. Unsafe transformations remount only the smallest valid component boundary and explain the reason in development tooling.

### Testing

`nomos/testing` MUST provide:

- Component rendering.
- Input updates.
- Unmounting.
- Synchronous test flushing.
- Query mocking.
- User-level event simulation.

Official integration tests use browser execution where DOM behavior matters. Unit-only DOM emulation is insufficient for release-critical focus, parsing, hydration, and event behavior.

### Devtools

Nomos 1.0 devtools MUST display:

- Component and ownership tree.
- State and derived dependency graph.
- Query cache and effective policy.
- Action history.
- Binding-to-DOM mapping.
- Current learning level and strictness profile.
- Reasons for remounts and HMR state loss.

## Learning Model

### Additive Levels

| Level | Newly available concepts |
|---|---|
| 0 | HTML, CSS, static pages, links |
| 1 | Script constants and interpolation |
| 2 | State, assignment, event handling |
| 3 | Derivation, conditions, lists, bindings |
| 4 | Components, inputs, callbacks, slots |
| 5 | Dynamic routes, loaders, queries, async regions, boundaries |
| 6 | Actions, forms, fields, accessible UI primitives |
| 7 | Synchronization, attachments, context, shared state, raw state, snapshots, untracking, raw HTML, custom-element output |

A construct valid at one level MUST retain the same meaning at every higher level. The full test corpus for each level runs against every higher level.

Level gating changes available concepts, completions, diagnostics, and documentation vocabulary. It MUST NOT create a separate runtime or incompatible dialect.

### Strictness Profiles

| Profile | Purpose |
|---|---|
| `learn` | Warnings, constrained vocabulary, and safe autofixes |
| `standard` | Production-oriented defaults |
| `strict` | Strong purity, serializability, validation, architecture, and accessibility enforcement |

Profiles change enforcement, not language meaning.

## Interoperability

### Mount API

`mount(Component, { target, inputs, onError })` returns an object with `update(inputs)` and `unmount()`. It MUST work in ordinary HTML pages and server-rendered templates without requiring the Nomos router.

### Custom Elements

Configured components MAY compile to standards-based custom elements. Inputs become typed properties, compatible attributes are converted according to declarations, slots map to native slots, and callback outputs dispatch corresponding custom events.

React currently documents property and custom-event handling for custom elements, which supports this interoperability path without claiming that every host edge case is automatically solved.[^26]

Library builds MUST emit `custom-elements.json` conforming to the published Custom Elements Manifest schema. Nomos MAY consume third-party manifests to type custom-element usage.[^27]

### Host Wrappers

The CLI MAY generate thin typed wrappers for React and Vue. Wrappers MUST not become independent component implementations or introduce a second Nomos authoring model.

### Validation Libraries

Nomos accepts Standard Schema-compatible validators rather than hard-coding a specific validation package.[^3]

## Agent Interfaces

Build and check operations emit `nomos.manifest.json` with:

- Components and source locations.
- Inputs, callbacks, and slots.
- Routes and route parameters.
- Loader, query, and action contracts.
- Diagnostics.
- Rendering capabilities.
- Accessibility target.
- Configured level and profile.

The manifest schema follows semantic versioning.

`nomos mcp` exposes versioned tools to list routes and components, retrieve component contracts, run checks, explain diagnostics, and inspect compilation. Agent tools MUST consume the same compiler contracts as human tooling and MUST NOT alter source semantics.

## Public API Budget

The proposed root API is:

| Package | Runtime exports |
|---|---|
| `nomos` | `inputs`, `state`, `derive`, `sync`, `untrack`, `context`, `query`, `action`, `Boundary`, `mount`; `state.raw` and `state.snapshot` are properties of `state` |
| `nomos/router` | `navigate`, `redirect`, `notFound`, `route` |
| `nomos/forms` | `Field`, `invalid` |
| `nomos/ui` | `Dialog`, `Menu`, `Tabs`, `Combobox`, `Listbox` |
| `nomos/testing` | `render`, `flush`, `mockQuery`, `user` |
| `nomos/elements` | `defineElement` |
| `nomos/interop` | Explicit runtime primitives for ordinary TypeScript |

Types do not count against the runtime concept budget. Export counting MUST be automated so aliases or nested runtime exports cannot bypass governance.

## Architecture

Nomos uses a versioned monorepo with these responsibility boundaries:

| Package area | Responsibility |
|---|---|
| Core | Reactive graph, scheduler, ownership, context |
| DOM | Mounting, DOM creation, updates, hydration |
| Compiler | Parsing, analysis, generation, diagnostics, levels |
| Vite | Development server, transformations, HMR, build integration |
| Router | Routes, loaders, navigation, prefetch |
| Data | Queries, actions, cache, optimistic updates |
| Forms | Extraction, validation, field state |
| UI | Accessible primitives |
| Server | SSG and serialization; later SSR and streaming |
| Elements | Custom-element output, manifests, wrappers |
| Language server | Volar-based editor tooling |
| Lint | Compiler-aligned external rule adapters |
| Testing | Rendering and asynchronous test controls |
| Devtools | Runtime inspection |
| MCP | Manifest and agent tools |

The renderer creates static structure once and attaches subscriptions only to dynamic parts. No virtual-DOM or rerender model is exposed to users.

## Performance Requirements

Nomos MUST publish reproducible benchmarks for:

- Cold startup.
- Warm development startup.
- Initial application JavaScript.
- Update latency.
- Memory after steady-state interaction.
- Keyed-list operations.
- Generated code size.
- SSG throughput.
- Hydration time.
- HMR latency.

