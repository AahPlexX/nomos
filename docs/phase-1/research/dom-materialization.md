# Research: browser-parsed template DOM materialization

**Research/implementation date:** 2026-10-11  
**Scope:** Phase 1 static HTML + text-interpolation materialization

## Question

How should the first Nomos DOM code-generation slice materialize static HTML and interpolation text nodes without duplicating browser parsing behavior or sacrificing ownership, source mapping, namespaces, or CSP/Trusted Types compatibility?

## Primary-source basis

- WHATWG DOM: https://dom.spec.whatwg.org/
- MDN `Document.createTextNode()`: https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode
- MDN `Node.appendChild()`: https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
- MDN Trusted Types API: https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API
- MDN `TrustedTypePolicyFactory.createPolicy()`: https://developer.mozilla.org/en-US/docs/Web/API/TrustedTypePolicyFactory/createPolicy
- MDN CSP `trusted-types`: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/trusted-types

The original PRD already requires Nomos to document that a host enforcing Trusted Types must allow the `nomos` policy name when Nomos creates that policy. This slice implements that existing contract; it does not create a new product decision.

## Rejected implementation path

Materializing every source `Text` AST node with `document.createTextNode(rawSource)` is simple but semantically wrong for general HTML source. Raw `.nomos` template text still contains HTML source syntax such as character references. Creating text nodes directly from that source would display source spellings such as `&amp;` instead of allowing the HTML parser to produce `&`. Reimplementing entity decoding, namespace transitions, special element parsing, and other HTML parsing details in Nomos would create a second browser parser and increase correctness risk.

## Implemented path

1. The compiler preserves supported static template source as an HTML skeleton.
2. Each supported text interpolation span is replaced with a deterministic, collision-free comment marker.
3. The runtime assigns the compiler-owned skeleton to an `HTMLTemplateElement`, letting the browser perform HTML parsing and namespace construction.
4. The runtime clones `template.content`, replaces only Nomos text markers with empty `Text` nodes, and returns those nodes as binding slots.
5. The compiler wires the existing TypeScript-backed `TextBinding` expressions to those slots through internal `bindText`.
6. The cloned root nodes are registered with the existing ADR-0008 owner so disposal removes them deterministically.
7. When Trusted Types exists, the runtime uses a per-window cached `nomos` policy to create the required `TrustedHTML` value for this compiler-owned static skeleton. Policy creation failure states that the host CSP must allow the `nomos` policy name rather than bypassing enforcement.

## Safety boundary

The static skeleton contains no supported runtime values. Dynamic/mixed/shorthand/spread attributes, directives, raw HTML, structural blocks, component nodes, and interpolation contexts where comment markers are not safe are rejected before code generation with `NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE`.

This deliberately prevents a partial compiler from silently emitting incorrect DOM while later lowering stages are still under development.

## Verification

TDD RED run `38122206062` reached the exact pinned environment and failed because `compiler.lowerTemplateDom` and `runtimeInternal.mountTemplate` did not exist.

GREEN run `38122323711` verified:

- three focused DOM-lowering boundary tests;
- real Chrome `154.0.8037.97` execution;
- Trusted Types enforcement with `require-trusted-types-for 'script'; trusted-types nomos`;
- HTML character-reference decoding in static text and attributes;
- SVG namespace preservation;
- dynamic text interpolation;
- owner disposal removing cloned roots;
- no regressions in the existing lowering, runtime, or Phase 1 machine-state gates.

## Consequences

- Nomos reuses browser HTML semantics instead of duplicating them.
- The first DOM path already uses deterministic markers compatible with later hydration design work, without claiming hydration is implemented.
- Static DOM and text interpolation now execute in a real browser.
- Attribute, event, structural, component, raw-HTML, SSG, and hydration lowering remain separate slices.
- No PRD Open Decision is resolved by this implementation.
