# Research: standard HTML dynamic attribute assignment

**Research date:** 2026-10-11  
**Implementation slice:** Phase 1 text and attribute bindings

## Primary sources

- WHATWG HTML — common microsyntaxes / boolean attributes: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
- WHATWG HTML — indices / attribute classifications: https://html.spec.whatwg.org/multipage/indices.html#attributes-3
- WHATWG HTML — `inert`: https://html.spec.whatwg.org/multipage/interaction.html#the-inert-attribute
- DOM Standard — `Element.setAttribute` / `removeAttribute`: https://dom.spec.whatwg.org/#interface-element

## Implemented policy

The first executable assignment slice deliberately covers standard HTML content attributes whose behavior does not require custom-element upgrade semantics or native-control property synchronization.

### Ordinary content attributes

For dynamic, mixed, and shorthand attributes on standard HTML elements:

- `null` and `undefined` remove the content attribute;
- every other value is converted with JavaScript `String(value)` and passed to `setAttribute`;
- `false` is therefore the literal string `"false"` for a non-boolean attribute.

This keeps the compiler/runtime boundary explicit and avoids inventing property semantics where the author wrote an ordinary attribute.

### Boolean HTML attributes

HTML boolean attributes are true by presence and false by absence; string values such as `"false"` do not mean false. Runtime `bindAttribute(..., { boolean: true })` therefore:

- sets the attribute with the empty string when the computed value is truthy;
- removes the attribute when the computed value is falsy.

The compiler uses a conservative first-party boolean-attribute table derived from the current HTML Standard. `inert` is covered by focused executable tests. `hidden` is intentionally not treated as boolean because its current HTML semantics are enumerated rather than simple boolean presence/absence.

## Explicit safety boundaries

### Spread attributes

The grammar and IR support `{...expression}`, but runtime spread assignment remains guarded. The preserved PRD requires spread syntax but does not specify merge/precedence behavior when spreads and explicit attributes collide. That rule must be stated and tested before lowering rather than guessed.

### Custom elements

Dynamic assignment on custom elements remains guarded because `OD-008` explicitly keeps pre-upgrade property behavior open. This slice does not silently choose attributes vs properties for custom elements.

### URL-bearing attributes

Expression-derived URL-bearing attributes such as `href`, `src`, `action`, `formaction`, `poster`, and `cite` remain guarded until Nomos has the required URL protocol safety validator. This avoids permitting expression-derived `javascript:` URLs before the compiler can enforce the security contract.

### Inline event attributes

Attributes whose names begin with `on` remain rejected. Nomos event semantics belong to `on:` directives, not inline event-handler content attributes.

### Native-control properties

Live native-control state such as input `value`/`checked` is not conflated with ordinary attribute assignment. Property-backed two-way behavior belongs to the dedicated `bind:` / native-control stage.

## Implementation architecture

- Existing typed attribute IR remains the durable source representation.
- Attribute expressions reuse the TypeScript 6 `EmbeddedExpression` adapter.
- Elements requiring runtime assignment receive collision-free temporary marker attributes in the static browser-parsed skeleton.
- `mountTemplate` collects those elements after cloning and removes the markers immediately.
- `bindAttribute` uses the existing ADR-0008 DOM-observer scheduler and owner lifecycle.
- Attribute setup and expression source-map points are emitted during the same lowering pass.

## Current coverage

Runtime-assigned ratified dynamic forms: **3/4**.

- dynamic — implemented;
- mixed — implemented;
- shorthand — implemented;
- spread — guarded/pending explicit merge precedence.

This slice resolves none of the eleven PRD Open Decisions.
