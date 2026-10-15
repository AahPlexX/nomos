# Research: standard HTML dynamic and spread attribute assignment

**Research date:** 2026-10-14  
**Implementation slice:** Phase 1 text and attribute bindings

## Primary sources

- Preserved Nomos PRD — requires static, dynamic, mixed, shorthand, and spread attribute syntax; requires the compiler/runtime to publish and test the built-in property-assignment table; requires expression-derived `javascript:` URLs in URL-bearing attributes to be refused; leaves custom-element pre-upgrade behavior open under `OD-008`.
- WHATWG HTML — reflected content attributes / IDL attributes: https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#reflecting-content-attributes-in-idl-attributes
- WHATWG HTML — boolean attributes: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
- WHATWG HTML — attribute index/classifications: https://html.spec.whatwg.org/multipage/indices.html#attributes-3
- WHATWG HTML — URL terminology: https://html.spec.whatwg.org/multipage/urls-and-fetching.html#urls
- WHATWG HTML — hyperlinks and `ping`: https://html.spec.whatwg.org/multipage/links.html
- WHATWG HTML — responsive images / image candidate lists: https://html.spec.whatwg.org/multipage/images.html
- WHATWG HTML — input states and value IDL modes: https://html.spec.whatwg.org/multipage/input.html#the-input-element
- WHATWG HTML — select, option, textarea, output: https://html.spec.whatwg.org/multipage/form-elements.html
- WHATWG HTML — media muted/defaultMuted: https://html.spec.whatwg.org/multipage/media.html
- WHATWG HTML — details/dialog open reflection: https://html.spec.whatwg.org/multipage/interactive-elements.html
- WHATWG HTML — `inert`: https://html.spec.whatwg.org/multipage/interaction.html#the-inert-attribute
- WHATWG URL — basic URL parser and scheme normalization: https://url.spec.whatwg.org/#concept-basic-url-parser
- WHATWG DOM — `Element` attribute APIs and HTML namespace name normalization: https://dom.spec.whatwg.org/#interface-element
- ECMAScript — `CopyDataProperties` / object spread semantics: https://tc39.es/ecma262/#sec-copydataproperties
- MDN — `javascript:` URL behavior and navigation-target risk: https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/javascript

## Implemented ordinary attribute policy

For dynamic, mixed, shorthand, and spread-provided ordinary content attributes on standard HTML elements in the currently executable attribute path:

- `null` and `undefined` remove the content attribute when they are the winning authored value for that name;
- every other value is converted with JavaScript `String(value)` and passed to `setAttribute`;
- `false` is therefore the literal string `"false"` for a non-boolean attribute.

The currently executable compiler/runtime path stays attribute-oriented. The property-assignment table described below is published and tested first; property writes are not activated until the dedicated authored-current-state/native-control slice defines cleanup, source-order interaction, and two-way semantics.

## Implemented boolean attribute policy

HTML boolean attributes are true by presence and false by absence; values such as `"false"` do not mean false. Nomos therefore uses:

- truthy computed value → set the content attribute to the empty string;
- falsy computed value → remove the content attribute.

The first-party boolean table is centralized in `packages/shared/src/html-attribute-policy.mjs` so compiler and runtime cannot drift. `hidden` is intentionally not treated as a simple boolean attribute because current HTML semantics are enumerated rather than simple presence/absence.

## Published built-in property-assignment table

The PRD requires a built-in element property-assignment table before property-backed native-control work. The table is published from the same shared policy module as `STANDARD_HTML_PROPERTY_ASSIGNMENTS`, with `resolveStandardHtmlPropertyAssignment()` as the deterministic lookup surface.

The table is intentionally a contract before it is a mutation mechanism. Existing 4/4 standard-HTML attribute bindings keep their already-verified behavior until the dedicated property/native-control slice consumes the table.

### Current-state property rows

| Element / state | Source name | Property | Authored-dynamic direction | Binding seam | Why |
|---|---|---|---|---|---|
| `input` in value-mode states | `value` | `value` | property | `bind:value` | IDL `value` represents current value and sets the dirty value flag |
| `input type=checkbox|radio` | `checked` | `checked` | property | `bind:checked`, `bind:group` | content `checked` is the default; IDL `checked` is current checkedness |
| `input type=file` | `files` | `files` | binding-only | `bind:files` | selected files are exposed through the `files` IDL property; a `files` content attribute has no equivalent meaning |
| `textarea` | `value` | `value` | property | `bind:value` | child text is the default; IDL `value` is current raw/API value |
| `select` | `value` | `value` | property | `bind:value` | IDL `value` changes current selection |
| `option` | `selected` | `selected` | property | — | content `selected` is default selectedness; IDL `selected` is current selectedness |
| `output` | `value` | `value` | property | — | IDL `value` is the output element's current value |
| `audio`, `video` | `muted` | `muted` | property | — | content `muted` is the default; IDL `muted` controls current muted state |
| `details`, `dialog` | `open` | `open` | attribute | `bind:open` | `open` is reflected; authored attribute updates remain authoritative while the property seam is explicit for binding |

### Input `value` is type-sensitive

WHATWG defines four input `value` IDL modes: `value`, `default`, `default/on`, and `filename`. Nomos therefore does not treat every `<input value={...}>` as the same property target.

Current-value property semantics apply only to the input states whose value IDL mode is `value`:

- Text, Search, Telephone, URL, Email, Password;
- Date, Month, Week, Time, Local Date and Time;
- Number, Range, Color.

An omitted or invalid `type` has the HTML Text-state default and therefore resolves to current-value property semantics. Hidden and submit/image/reset/button states use default-mode value semantics; checkbox/radio use default/on; file uses filename mode. Those states are not misclassified as current-value property rows.

### Ordinary reflected/content names remain attribute-oriented

The table is an exception table, not a DOM-property-by-name heuristic. Names such as `class`, `for`, `tabindex`, `aria-*`, `data-*`, ordinary reflected booleans such as `disabled`, and reflected numeric attributes such as `progress[value]` continue to use content-attribute semantics. This prevents React-style property-name rewriting from leaking into Nomos source and preserves the PRD requirement to use real HTML names.

`bind:this` is not an element property assignment and therefore is not represented by this table. `bind:group` is a coordination semantic built on checkbox/radio current checkedness and value; it is recorded on the `checked` row but still requires dedicated group lowering/runtime behavior.

## Implemented spread contract

The preserved PRD requires `{...expression}` but does not prescribe collision precedence. Phase 1 defines one deterministic standard-HTML contract, backed by executable tests.

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
2. validates all runtime-discovered spread names and URL-valued winning contributions;
3. computes the final desired attribute map;
4. only then mutates the element.

This makes precedence independent of scheduler ordering, allows dropped spread keys to restore earlier fallbacks deterministically, and ensures URL rejection cannot partially mutate safe sibling attributes.

Static contributors inside a grouped plan capture their baseline value from the browser-parsed cloned element, preserving HTML entity decoding and browser parsing behavior.

## Dynamic URL scheme safety

### PRD security boundary

The product contract requires Nomos to refuse expression-derived `javascript:` URLs in URL-bearing attributes. It does not require a home-grown URL grammar. For values whose HTML grammar is one URL string, the implementation delegates scheme classification to the platform WHATWG `URL` parser rather than using substring checks or a custom URL parser.

The initial end-to-end single-URL name set is:

- `action`;
- `cite`;
- `formaction`;
- `href`;
- `poster`;
- `src`.

This is intentionally the first certified set, not a claim that those six exhaust every URL-bearing context in current HTML.

### Scheme classification

`assertSafeDynamicUrlAttributeValue(name, value)`:

1. returns nullish values unchanged so ordinary remove semantics remain intact;
2. parses the stringified value with `new URL(value, "https://nomos.invalid/")`;
3. uses that inert HTTPS base only so relative URLs can be classified without depending on a document URL;
4. refuses the value when the parsed protocol is exactly `javascript:`;
5. otherwise returns the original value unchanged.

The WHATWG URL parser removes leading/trailing C0 control or space characters and removes ASCII tab/newline code points before scheme-state parsing. Scheme code points are ASCII-lowercased. As a result, values such as ` JAVASCRIPT:...` and `java\nscript:...` classify as `javascript:` and are rejected without a framework-maintained normalization algorithm.

A parse failure is not converted into a heuristic failure. This slice is specifically enforcing the PRD's dangerous-scheme requirement; it does not silently invent a stricter URL-validity policy. A safe URL containing the literal text `javascript:` in its path/query is likewise not rejected because its parsed protocol is not `javascript:`.

### Runtime integration

`bindAttribute` validates the computed value before mutating the element. `bindAttributes` calls the same validator while constructing its desired source-order map; all entries are therefore evaluated/validated before stale attributes are removed or new values are set.

For spread expressions this changes the boundary from **name rejection** to **value safety** for the initial URL set:

- `{...{ href: '/docs' }}` may set `href`;
- `{...{ href: 'javascript:alert(1)' }}` throws before any DOM mutation;
- `on*` spread keys remain blocked by name and must use `on:` semantics.

### Compiler integration for statically named URLs

The former `dynamic-url-attribute-unvalidated` compiler guard is retired for the initial single-URL set. Dynamic, mixed, and shorthand standard-HTML bindings now lower through the ordinary owner-backed attribute path and rely on the shared runtime validator before mutation.

This is intentionally a routing change, not a second safety implementation:

- `template-dom-lowering.mjs` no longer imports or checks `isGuardedDynamicUrlAttribute`;
- compiler output continues to call `bindAttribute` or grouped `bindAttributes`;
- runtime `assertSafeDynamicUrlAttributeValue()` remains the one scheme-classification enforcement point;
- custom-element dynamic assignment and inline-event attributes retain their independent guards.

Behavioral RED `38670030444` proved the old guard blocked the new statically named URL expectation while parser/toolchain remained healthy. GREEN `38670340262` verified the minimal guard removal. Browser-confirmed GREEN `38670385218` then verified a safe expression-derived `href` materializes in real Chrome under Trusted Types enforcement through the compiler/runtime path.

### Remaining HTML URL-bearing grammar taxonomy

The PRD-wide URL requirement remains in progress because not every HTML URL-bearing value has the grammar “one URL string.” The remaining audit must classify each context before choosing a validator. At minimum the current standards expose materially different families:

1. **Single URL strings.** The current helper is certified for the initial six-name set. Other single-URL contexts must be audited by element/attribute semantics before being added; name coincidence alone is insufficient.
2. **Whitespace-separated URL lists.** `ping` is a space-separated list of URLs used for hyperlink auditing, with HTTP(S)-specific processing. Passing the entire raw list to `new URL(...)` would validate the wrong grammar.
3. **Image candidate lists.** `srcset` and `imagesrcset` contain image candidate strings with descriptors and parsing rules distinct from a URL list or a single URL. Each candidate URL must be considered within that grammar rather than by string-prefix heuristics.
4. **Microdata / URL-token semantics.** HTML microdata attributes and item values can involve URL concepts with context-specific tokenization and resolution. They require a separate relevance/security determination rather than automatic inclusion in the navigation/fetch URL helper.

The next URL slice must therefore produce an explicit machine-readable or code-level grammar table plus RED→GREEN tests for any newly covered categories. It must not broaden `GUARDED_DYNAMIC_URL_ATTRIBUTE_NAMES` merely because the HTML index labels an attribute “URL.”

## Security boundaries

### Runtime-discovered spread keys

A spread can introduce names the compiler cannot see statically. Before any DOM mutation in a recomputation, the grouped plan:

- rejects names beginning with `on` — event behavior belongs to `on:` directives;
- validates values for `href`, `src`, `action`, `formaction`, `poster`, and `cite` through the shared single-URL scheme classifier.

The pre-mutation validation is contract-tested so an unsafe spread object cannot partially update safe attributes before throwing.

### Custom elements

Dynamic/spread assignment on custom elements remains guarded because `OD-008` explicitly keeps pre-upgrade property behavior open. This work does not choose attributes-vs-properties for custom elements.

### Native-control properties

Live native-control state is not inferred merely because an element has a same-named JavaScript property. The published table is the only approved standard-HTML property seam. Actual property-backed authored writes and two-way `bind:` behavior remain in the dedicated follow-on slice.

## Implementation architecture

- Durable attribute IR remains the source representation.
- Attribute/spread expressions reuse the TypeScript 6 `EmbeddedExpression` adapter.
- Runtime-assigned elements receive collision-free temporary marker attributes in the browser-parsed skeleton.
- `mountTemplate` collects those elements after cloning and removes markers immediately.
- Non-spread elements continue using focused `bindAttribute` observers, including statically named initial-set dynamic URLs.
- Spread-containing elements use one owner-backed `bindAttributes` observer.
- Shared attribute/boolean/URL/event/property policy lives in `packages/shared/src/html-attribute-policy.mjs`.
- Attribute and spread expression mapping points are emitted during the same lowering pass.
- Property-table lookup and single-URL scheme classification reuse platform semantics; no new dependency or second runtime policy layer was introduced.

## Current coverage

Runtime-assigned ratified standard-HTML forms: **4/4**.

- dynamic — implemented on standard HTML, including the initial single-URL set;
- mixed — implemented on standard HTML, including the initial single-URL set;
- shorthand — implemented on standard HTML, including the initial single-URL set;
- spread — implemented with source-order precedence, inline-event name guards, and value-level URL safety for the initial six-name set.

Built-in standard-HTML property-assignment policy: **published/tested** with **5/5** focused tests.

Dynamic URL protocol safety: **initial single-URL set implemented end-to-end; full HTML URL-grammar coverage in progress**. The helper normalization contract and independent/grouped DOM bindings are covered; statically named lowering is enabled; a safe statically named `href` is real-browser verified. Remaining URL list/candidate/token grammars are deliberately not claimed complete.

Still separate and incomplete: broader URL grammar coverage, property-write activation/cleanup, `on:` events, `bind:` native controls, and custom-element policy under `OD-008`.

This slice resolves none of the eleven PRD Open Decisions.
