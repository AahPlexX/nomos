# NOMOS-PARSE-HTML-OWNERSHIP

**Severity:** error  
**Disableable:** no  
**Learning level:** 0+

The declared template ownership would not survive HTML tree construction. Nomos currently diagnoses these certified browser-rewrite cases:

- a block-like start tag such as `<div>` while a `<p>` remains open;
- a new `<li>` while another `<li>` remains open;
- a new `<dt>` or `<dd>` while a `<dt>` or `<dd>` remains open;
- a nested `<button>` while a `<button>` remains open.

In each case, HTML tree construction implicitly closes an already-open element before inserting the new one, so the browser tree would differ from the declared Nomos ownership tree.

## Repair

Explicitly close the element that HTML would otherwise close implicitly before the offending start tag.

This diagnostic is intentionally structural and non-disableable because Nomos cannot safely own a DOM structure the HTML parser will reconstruct differently.

## Coverage boundary

This diagnostic does not yet claim complete HTML tree-construction parity. Table insertion modes/foster parenting and other remaining WHATWG ownership rewrites are still Phase 1 work.
