
`sync(callback)` coordinates reactive state with external systems such as observers, timers, browser APIs, storage, or imperative libraries. The callback MAY return cleanup logic.

A sync:

- Runs only after its owner is mounted.
- Tracks synchronous reactive reads.
- Runs cleanup before rerunning and during disposal.
- Reruns after affected DOM updates complete.
- Does not track reads after an `await` boundary.

Tooling MUST diagnose derivation implemented as synchronization and offer a safe conversion where possible.

### Scheduling

State writes are synchronous. DOM changes and sync reruns are batched into a microtask flush. `flush()` is available only from testing and interoperability packages.

The runtime MUST detect non-terminating reactive cycles. The development error MUST identify the participating states and synchronization owners rather than expose only a generic iteration-limit error.

### Ownership

Every component instance, conditional branch, list item, asynchronous branch, attachment, and query subscription has an owner. Disposal runs child owners first, then local cleanup in reverse creation order, then removes owned DOM nodes.

Requests owned exclusively by a disposed owner MUST receive an aborted `AbortSignal`. Shared requests MUST continue while another live subscriber exists.

### Shared State

Reactive shared state lives in `.nomos.ts` modules. Because imported ECMAScript bindings cannot be assigned by importers, shared writable primitives MUST use one of these forms:

- A reactive object whose properties are mutated.
- A stateful class instance.
- Private state exposed through exported read and write functions.

Cross-file rewriting of reassigned exported bindings is not part of 1.0.

## Template Language

### Required Forms

The grammar MUST support:

- Escaped text interpolation.
- Dynamic, mixed, shorthand, and spread attributes.
- `if`, `else if`, and `else` blocks.
- Keyed and positional list blocks with an empty branch.
- Promise and Query await blocks with pending, success, empty, and error branches.
- Imported components and standards-based custom elements.
- Explicit raw-HTML insertion.

Template expressions are TypeScript expressions, not statements. A formal grammar and parser test corpus are Phase 0 deliverables.

### Directives

Nomos 1.0 has exactly four directive prefixes:

| Prefix | Purpose |
|---|---|
| `on:` | Native event listener |
| `bind:` | Two-way binding for supported native controls or direct references |
| `use:` | Imperative attachment with cleanup |
| `let:` | Scoped-slot value |

User-defined directive syntax is not supported. Reusable imperative behavior uses typed attachments.

### Events

`on:event={handler}` maps to `addEventListener`. Event names pass through unchanged. Handlers MUST receive element-specific event types. Listener objects and listener options MUST be supported without inventing event-modifier syntax.

Errors thrown by browser event handlers are routed to the root `onError` callback. A rendering boundary MUST NOT imply that arbitrary asynchronous browser callbacks are caught.

### Attributes and Properties

Nomos source uses real HTML names such as `class`, `for`, `tabindex`, `aria-*`, and `data-*`.

The compiler and runtime MUST publish and test the built-in element property-assignment table. Custom-element assignment MUST follow a deterministic policy that is compatible with pre-upgrade elements; values MUST NOT be silently stringified when the declared manifest contract requires a property.

### Bindings

Required bindings are:

- `bind:value` for text controls, selects, and numeric inputs.
- `bind:checked` for checkboxes and radios.
- `bind:group` for radio and checkbox groups.
- `bind:files` for file inputs.
- `bind:open` for details and dialogs.
- `bind:this` for elements and component handles.

A binding target MUST be writable state or a writable property path rooted in state.

### Lists

Keyed-list keys MUST be unique at runtime. Duplicate keys are development errors. Positional lists produce a warning in the standard profile and an error in the strict profile.

Reordering a keyed list MUST move existing nodes rather than recreate them, preserving focus, selection, and uncontrolled native-control state where browser behavior permits.

### HTML Correctness

The compiler MUST reject source structures that HTML parsing would rearrange in ways that invalidate component ownership. SVG and MathML namespaces MUST be preserved. Whitespace behavior MUST be documented by grammar fixtures rather than inferred from implementation.

## Styling

Component styles are scoped by default. A global style block is explicit. The scoping algorithm MUST have fixtures covering pseudo-classes, nested rules, at-rules, slotted content, dynamic elements, and source maps.

Nomos MUST support ordinary CSS, CSS Modules, Sass, PostCSS, and Tailwind through the build pipeline without making any one system mandatory. Vite's plugin foundation makes this integration practical, but each claimed Tier 1 integration requires its own current-version CI test.[^1][^8]

Design tokens declared as CSS custom properties in `src/tokens.css` MAY be indexed for completion and unknown-token diagnostics.

Starter templates MUST satisfy the WCAG 2.2 Reflow criterion: content and functionality remain available without two-dimensional scrolling at a width equivalent to 320 CSS pixels, except for content that intrinsically requires two-dimensional layout.[^21]

Shadow DOM is optional and applies only to custom-element builds. It MUST remain off by default because isolation changes styling, inheritance, focus, form participation, and host integration.

## Remote Data

### Query

`query(key, fetcher?, options?)` represents an idempotent remote read. The tracked key function returns a serializable query key or `null`; `null` disables the query.

A Query exposes:

- `status`: `pending`, `success`, or `error`.
- `value`.
- `error`.
- `pending`, including background refresh.
- `refresh()`.
- `retry()`.
- `set(value)` for controlled cache updates.

The default string-key fetcher uses `fetch` and passes an `AbortSignal`. Non-success HTTP responses produce a typed HTTP error. Non-string keys require an explicit fetcher.

Query keys MUST use a published canonical serialization algorithm. Supported values, object-key ordering, dates, maps, sets, repeated references, cycles, functions, symbols, and unsupported values MUST be specified and tested. Unsupported key values are development errors, not lossy serialization.

Default 1.0 policy:

- Concurrent identical reads are deduplicated.
- Cached data remains while subscribed and for five minutes after the final subscription ends.
- Remounting with cached data shows that data while refreshing in the background.
- Focus-based refetch is disabled.
- Network failures retry once with bounded backoff.
- HTTP 4xx responses do not retry automatically.
- A changed key aborts work no longer needed by any subscriber.
- Late results cannot replace newer results.
- Persistent caching is opt-in.

Every effective policy MUST be visible in devtools.

### Action

`action(handler, options?)` represents an explicit mutation. An Action is callable and exposes idle, pending, success, validation-failure, and error state.

Actions support:

- Standard Schema input validation.
- Field and form errors.
- Query invalidation.
- Optimistic cache updates with rollback.
- `block`, `queue`, and `abort-previous` concurrency modes.
- Resetting settled state.

Each concurrency mode MUST define the promise returned to every caller, including blocked, queued, aborted, successful, and failed calls. Calls MUST never remain indefinitely unresolved.

### Boundaries

A `Boundary` catches errors from descendant setup, rendering, derivation, synchronization, and owned query resolution. It coordinates a first-load pending region and provides explicit reset behavior.

Boundaries do not catch arbitrary errors from event callbacks, detached promises, or work that has escaped ownership. Documentation and diagnostics MUST distinguish owned from unowned asynchronous work.

## Forms

A native `<form>` MAY receive an Action as its action value. The compiler intercepts submission, runs browser constraint validation, converts `FormData` through a documented path grammar, applies the configured Standard Schema validator, and calls the Action.

Standard Schema is suitable for this boundary because it provides a common validator contract without requiring adapters for every validation library.[^3]

Required behavior:

- Native labels and controls remain present in output.
- Pending submission sets `aria-busy="true"` on the form.
- Submit buttons are not disabled automatically.
- Validation issues map to fields by normalized path.
- Field state exposes touched, dirty, and current error state.
- After failed submission, focus moves to the first invalid field when that movement improves rather than disrupts the user's context.
- Client validation supplements and never substitutes for server validation.
- File inputs, repeated fields, nested objects, checkbox groups, and empty values have normative conversion fixtures.

Nomos 1.0 form enhancement requires JavaScript. Progressive form submission without JavaScript is a 1.x capability dependent on server functions.

## Router

### Route Files

The router uses `src/routes` with these conventions:

| File pattern | Meaning |
|---|---|
| `page.nomos` | Route page |
| `layout.nomos` | Nested layout |
| `error.nomos` | Route error presentation |
| `load.ts` | Route or layout loader |
| `[id]` | Required dynamic segment |
| `[...path]` | Rest segment |
| `[[lang]]` | Optional segment |
| `(group)` | Organizational group omitted from the URL |

Generated `RouteInputs` types MUST reflect route parameters and loader results.

### Navigation

The router intercepts eligible same-origin links while preserving ordinary browser behavior for downloads, external relationships, targets, modifier keys, unsupported protocols, and user cancellation.

The implementation MAY use the Navigation API where supported, but MUST provide a History API fallback for the configured browser target. View Transitions are opt-in progressive enhancement and MUST be skipped when unavailable or when reduced motion is requested. Current same-document View Transitions are broadly available, but compatibility still requires fallback treatment.[^20][^19]

### Accessibility

On committed navigation, the router MUST:

- Update and announce the document title.
- Move focus according to a documented, configurable policy.
- Preserve hash-target behavior.
- Restore scroll on backward and forward traversal.
- Avoid overriding explicit user focus established during navigation.

### Loading and Prefetch

Layout and page loaders MAY run in parallel when their data dependencies permit it. An explicit `parent()` dependency serializes only the dependent portion.

Route code MAY prefetch when a link approaches likely use. Data prefetch MUST be limited to hover, focus, explicit policy, or another measurable intent signal. Users and applications MUST be able to disable prefetching, and save-data/network constraints MUST be respected.

## Rendering Modes

### Client Rendering

CSR is required for 1.0. The runtime mounts compiled components into a target element and performs direct fine-grained DOM updates.

### Static Generation

SSG is required for 1.0. Routes explicitly marked for prerendering execute loaders at build time. Dynamic routes enumerate build-time entries.

### Hydration

Interactive SSG pages hydrate existing HTML. Hydration MUST:

- Reuse compatible DOM rather than recreate the whole page.
- Use deterministic boundary markers.
- Serialize loader data without executable inline source.
- Support a documented set of data types.
- Detect mismatches in development.
- Recover at the smallest safe ownership boundary.
- Remain compatible with nonce- or hash-based strict CSP deployment.

Trusted Types enforcement restricts dangerous DOM sinks to values created by approved policies; a Nomos deployment that creates a `nomos` policy therefore requires the host CSP to allow that policy name. Nomos MUST document this host requirement and MUST NOT claim automatic compatibility with every CSP.[^22][^23]

### Deferred Server Features

The following are 1.x features and MUST NOT block 1.0:

- Request-time SSR.
- Streaming HTML.
- Server functions.
- Forms that submit successfully without client JavaScript.
- Server-runtime deployment adapters.
- Partial hydration or resumability research.

## Accessibility
