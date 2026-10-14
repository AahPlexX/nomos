# Research: browser-parsed template DOM materialization

**Initial research/implementation date:** 2026-10-11  
**Current status refreshed:** 2026-10-14  
**Scope:** Phase 1 browser-parsed HTML skeleton, text slots, and deterministic runtime element slots

## Question

How should Nomos materialize template DOM without duplicating browser parsing behavior or sacrificing ownership, source mapping, namespaces, or CSP/Trusted Types compatibility?

## Primary-source basis

- WHATWG DOM: https://dom.spec.whatwg.org/
- WHATWG HTML parsing model: https://html.spec.whatwg.org/multipage/parsing.html
- MDN `Document.createTextNode()`: https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode
- MDN `Node.appendChild()`: https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
- MDN Trusted Types API: https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API
- MDN `TrustedTypePolicyFactory.createPolicy()`: https://developer.mozilla.org/en-US/docs/Web/API/TrustedTypePolicyFactory/createPolicy
- MDN CSP `trusted-types`: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/trusted-types

The original PRD already requires Nomos to document that a host enforcing Trusted Types must allow the `nomos` policy name when Nomos creates that policy. This implementation uses that existing contract; it does not create a new product decision.

## Rejected implementation path

Materializing every source `Text` AST node with `document.createTextNode(rawSource)` is semantically wrong for general HTML source. Raw `.nomos` template text still contains HTML source syntax such as character references. Creating text nodes directly from that source would display source spellings such as `&amp;` instead of allowing the HTML parser to produce `&`. Reimplementing entity decoding, namespace transitions, special element parsing, and other HTML parsing details in Nomos would create a second browser parser and increase correctness risk.

## Implemented browser-parser path

1. The compiler preserves supported static template source as an HTML skeleton.
2. Each supported text interpolation span is replaced with a deterministic, collision-free comment marker.
3. Elements needing runtime attribute assignment receive deterministic collision-free temporary marker attributes.
4. The runtime assigns the compiler-owned skeleton to an `HTMLTemplateElement`, letting the browser perform HTML parsing and namespace construction.
5. The runtime clones `template.content`, replaces Nomos text markers with empty `Text` nodes, discovers marked elements, removes temporary element markers, and returns both kinds of binding slots.
6. The compiler wires TypeScript-backed text expressions through internal `bindText` and attribute expressions through `bindAttribute` or grouped `bindAttributes`.
7. The cloned root nodes are registered with the existing ADR-0008 owner so disposal removes them deterministically.
8. When Trusted Types exists, the runtime uses a per-window cached `nomos` policy to create the required `TrustedHTML` value for the compiler-owned static skeleton. Policy creation failure states that host CSP must allow the `nomos` policy name rather than bypassing enforcement.

## Current dynamic boundary

The 2026-10-11 first slice intentionally rejected every runtime attribute form. That historical boundary has since advanced.

As of 2026-10-14, all four required standard-HTML runtime attribute forms are implemented:

- dynamic;
- mixed;
- shorthand;
- spread with source-ordered grouped precedence.

Spread-containing elements use one grouped observer so authored left-to-right precedence is deterministic and dropped spread keys can restore earlier browser-parsed/static or dynamic fallbacks. Full attribute semantics and primary-source research are documented in `docs/phase-1/research/html-attribute-assignment.md`.

Still guarded before code generation or runtime mutation where appropriate:

- dynamic/spread custom-element assignment while `OD-008` is open;
- dynamic URL-bearing attributes until the protocol validator exists;
- inline event-handler attributes (use future `on:` semantics);
- directives whose dedicated lowering is not implemented;
- raw HTML;
- structural blocks;
- component nodes;
- interpolation contexts where comment-marker text slots are unsafe.

## Verification history

Initial DOM TDD RED `38122206062` reached the pinned environment and failed because `compiler.lowerTemplateDom` and `runtimeInternal.mountTemplate` did not exist. GREEN `38122323711` established browser parsing, text interpolation, SVG namespace preservation, Trusted Types, and owner cleanup.

Attribute materialization later progressed through browser-verified 3/4 assignment and then spread completion. Spread implementation GREEN `38638143259` verified:

- parser **66/66**;
- focused DOM/browser units **11/11**;
- real Chrome `154.0.8037.97` under Trusted Types;
- spread-over-earlier-explicit precedence;
- later-explicit-over-spread precedence;
- spread-only ordinary attribute assignment;
- marker removal and owner cleanup;
- lowering **16/16**;
- runtime **26/26**.

## Consequences

- Nomos reuses browser HTML semantics instead of duplicating them.
- Deterministic text and element markers support progressively richer lowering while remaining compatible with later hydration design work; hydration itself is not claimed implemented.
- Static DOM, text interpolation, and all four required standard-HTML runtime attribute forms execute in a real browser.
- Event, native-control property, structural, component, raw-HTML, SSG, and hydration lowering remain separate slices.
- No PRD Open Decision is resolved by this implementation.
