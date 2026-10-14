# Research: standard HTML dynamic and spread attribute assignment

**Research date:** 2026-10-14  
**Implementation slice:** Phase 1 text and attribute bindings

## Primary sources

- Preserved Nomos PRD — requires static, dynamic, mixed, shorthand, and spread attribute syntax while leaving custom-element pre-upgrade behavior open under `OD-008`.
- WHATWG HTML — boolean attributes: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
- WHATWG HTML — attribute index/classifications: https://html.spec.whatwg.org/multipage/indices.html#attributes-3
- WHATWG HTML — `inert`: https://html.spec.whatwg.org/multipage/interaction.html#the-inert-attribute
- WHATWG DOM — `Element` attribute APIs and HTML namespace name normalization: https://dom.spec.whatwg.org/#interface-element
- ECMAScript — `CopyDataProperties` / object spread semantics: https://tc39.es/ecma262/#sec-copydataproperties

## Implemented ordinary attribute policy

For dynamic, mixed, shorthand, and spread-provided ordinary content attributes on standard HTML elements:

- `null` and `undefined` remove the content attribute when they are the winning authored value for that name;
- every other value is converted with JavaScript `String(value)` and passed to `setAttribute`;
- `false` is therefore the literal string `"false"` for a non-boolean attribute.

The compiler/runtime boundary stays attribute-oriented. Property synchronization is not inferred merely because an HTML property with a similar name exists.

## Implemented boolean attribute policy

HTML boolean attributes are true by presence and false by absence; values such as `"false"` do not mean false. Nomos therefore uses:

- truthy computed value → set the content attribute to the empty string;
- falsy computed value → remove the content attribute.

The first-party boolean table is centralized in `packages/shared/src/html-attribute-policy.mjs` so compiler and runtime cannot drift. `hidden` is intentionally not treated as a simple boolean attribute because current HTML semantics are enumerated rather than simple presence/absence.

## Implemented spread contract

The preserved PRD requires `{...expression}` but does not prescribe collision precedence. Phase 1 now defines one deterministic standard-HTML contract, backed by executable tests.

### Source order and collisions

Authored attribute entries are processed left-to-right. A later entry with the same normalized standard-HTML attribute name wins over an earlier entry, regardless of whether the entries are static, dynamic, mixed, shorthand, or spread-provided.

Examples of the rule:

- `data-x={before} {...attrs}` → a `data-x` key in `attrs` wins;
- `{...attrs} data-x={after}` → the explicit `data-x` wins;
- if `attrs` later stops containing `data-x`, the earlier `before` value is restored;
- if there is no earlier source-order contributor, a dropped spread key is removed.

A present spread key whose value is `null`/`undefined` is still a source-order contribution for an ordinary attribute and therefore wins by removing the attribute. A present falsy key for a certified boolean attribute similarly wins by making the boolean attribute absent.

### Spread source enumeration

Nomos follows the relevant ECMAScript object-spread source behavior while adapting the result to DOM attribute names:

- `null` / `undefined` spread sources contribute no keys;
- other sources are converted with `Object(source)`;
- only enumerable own string-key properties participate (`Object.keys` behavior);
- inherited, non-enumerable, and Symbol-keyed properties do not become HTML attributes.

ECMAScript object spread can copy enumerable Symbol keys, but Nomos intentionally excludes them because DOM content-attribute names are strings.

### HTML name normalization

For standard HTML elements, attribute collision identity is ASCII-normalized through the shared policy module before source-order resolution. This matches the HTML/DOM case-insensitive name model instead of allowing `CLASS` and `class` to become separate framework binding slots.

### One grouped observer per spread-containing element

An element containing any spread lowers to one `bindAttributes` plan rather than multiple independent `bindAttribute` observers. The grouped observer:

1. evaluates the complete authored plan in source order;
2. validates all runtime-discovered spread names;
3. computes the final desired attribute map;
4. only then mutates the element.

This makes precedence independent of scheduler ordering and allows dropped spread keys to restore earlier fallbacks deterministically.

Static contributors inside a grouped plan capture their baseline value from the browser-parsed cloned element, preserving HTML entity decoding and browser parsing behavior.

## Security boundaries

### Runtime-discovered spread keys

A spread can introduce names the compiler cannot see statically. Before any DOM mutation in a recomputation, the grouped plan rejects:

- names beginning with `on` — event behavior belongs to `on:` directives;
- currently guarded URL-bearing names such as `href`, `src`, `action`, `formaction`, `poster`, and `cite` — these remain blocked until Nomos implements its URL protocol validator.

The pre-mutation validation is contract-tested so an unsafe spread object cannot partially update safe attributes before throwing.

### Custom elements

Dynamic/spread assignment on custom elements remains guarded because `OD-008` explicitly keeps pre-upgrade property behavior open. This work does not choose attributes-vs-properties for custom elements.

### Native-control properties

Live native-control state such as `input.value` / `checked` is not conflated with ordinary content-attribute assignment. Property-backed two-way behavior remains in the dedicated `bind:` / native-control slice.

## Implementation architecture

- Durable attribute IR remains the source representation.
- Attribute/spread expressions reuse the TypeScript 6 `EmbeddedExpression` adapter.
- Runtime-assigned elements receive collision-free temporary marker attributes in the browser-parsed skeleton.
- `mountTemplate` collects those elements after cloning and removes markers immediately.
- Non-spread elements continue using focused `bindAttribute` observers.
- Spread-containing elements use one owner-backed `bindAttributes` observer.
- Shared policy lives in `packages/shared/src/html-attribute-policy.mjs`.
- Attribute and spread expression mapping points are emitted during the same lowering pass.

## Current coverage

Runtime-assigned ratified standard-HTML forms: **4/4**.

- dynamic — implemented;
- mixed — implemented;
- shorthand — implemented;
- spread — implemented with source-order precedence and runtime name guards.

Still separate and incomplete: the comprehensive built-in attribute/property assignment table, dynamic URL protocol validation, `on:` events, `bind:` native controls, and custom-element policy under `OD-008`.

This slice resolves none of the eleven PRD Open Decisions.
