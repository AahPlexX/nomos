# ADR-0003: Preserve author whitespace and delegate visual processing to HTML/CSS

- **Status:** Accepted for the Nomos 1.0 source contract
- **Date:** 2026-10-08
- **PRD basis:** Template Language → HTML Correctness; Standards First

## Context

The PRD requires whitespace behavior to be documented by grammar fixtures rather than inferred from implementation. A compiler that trims formatting whitespace for aesthetics would make ordinary HTML behave differently inside `.nomos` files and would create hidden DOM differences.

Current platform standards distinguish document data from visual whitespace processing. HTML preserves whitespace as text content, while CSS `white-space` processing controls visual collapsing and wrapping. HTML syntax also defines parsing exceptions, including normalizing source newlines and ignoring one leading LF immediately after `pre` and `textarea` start tags.

## Decision

Nomos uses HTML-source-compatible whitespace semantics:

1. Normalize CRLF and CR source newlines to LF before template text semantics are evaluated.
2. Preserve literal text-node whitespace; the compiler performs no aesthetic trimming of indentation, inter-element whitespace, or text adjacent to interpolation/structural regions.
3. Structural template delimiters emit no text themselves. Literal whitespace surrounding them remains source text.
4. Interpolation does not trim adjacent literal text.
5. Match the HTML syntax exception that strips one immediate leading LF after `pre` and `textarea` start tags.
6. Delegate visual collapse/wrapping to CSS `white-space` processing.
7. CSR, SSG, and hydration must eventually use the same normalized text semantics so whitespace cannot create hydration-only differences.

## Consequences

- Ordinary HTML intuition remains valid inside `.nomos` templates.
- Formatting can create whitespace text nodes, just as in HTML; DOM code must use element-oriented APIs when it does not intend to observe them.
- Minification may shorten generated representation only when it provably preserves the same DOM text semantics.
- The Phase 1 parser must consume the Phase 0 whitespace fixtures as conformance inputs.

## Evidence basis

Rechecked 2026-10-08 against the WHATWG HTML Standard, W3C CSS Text, and MDN's whitespace/DOM documentation.
