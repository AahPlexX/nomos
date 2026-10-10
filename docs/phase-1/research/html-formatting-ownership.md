# HTML formatting ownership research

**Checked:** 2026-10-10  
**Primary authority:** WHATWG HTML Living Standard, parsing/tree-construction section  
**Source:** https://html.spec.whatwg.org/multipage/parsing.html

## Why Nomos needs a formatting ownership layer

Nomos declares component ownership from source structure, but `text/html` parsing has special recovery rules for active formatting elements. When those rules close, recreate, or reparent formatting elements, the browser DOM can differ from literal Nomos nesting. Nomos must reject certified ownership-changing cases instead of compiling an ownership tree the browser will not preserve.

## Certified high-impact cases in this slice

1. **Nested `a` start tags.** In the "in body" insertion mode, a new `a` start tag finds an active earlier `a`, runs the adoption agency algorithm, removes the earlier anchor if necessary, reconstructs formatting elements, and inserts the new anchor. Nomos therefore diagnoses a nested anchor before the browser can change ownership.
2. **Nested `nobr` start tags.** If `nobr` is already in scope, the parser reports a parse error, runs the adoption agency algorithm, reconstructs active formatting elements, and then inserts the new `nobr`. Nomos diagnoses the ownership mismatch.
3. **Misnested formatting end tags.** End tags for `a`, `b`, `big`, `code`, `em`, `font`, `i`, `nobr`, `s`, `small`, `strike`, `strong`, `tt`, and `u` run the adoption agency algorithm. When the closing formatting element is not the current open element, Nomos diagnoses the misnesting because the browser can pop, recreate, or reparent nodes.

The WHATWG standard explains that the adoption agency algorithm exists specifically because misnested formatting can change parentage; its non-normative `<b>1<p>2</b>3</p>` example demonstrates a block being moved and a new formatting element being created.

## Deliberate boundary

This slice does **not** claim a complete independent implementation of the adoption agency algorithm or the list-of-active-formatting-elements reconstruction machinery. It certifies the three high-value ownership-changing families above and repairs Nomos's validation stack to avoid cascaded diagnostics.

Remaining parser work includes active-formatting reconstruction edge cases, markers around cells/captions/templates, and lower-frequency special/table/template insertion-mode interactions. Those must be added only with explicit WHATWG evidence and focused RED→GREEN tests.
