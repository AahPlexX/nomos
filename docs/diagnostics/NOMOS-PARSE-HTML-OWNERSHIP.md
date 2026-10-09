# NOMOS-PARSE-HTML-OWNERSHIP

**Severity:** error  
**Disableable:** no  
**Learning level:** 0+

The declared template ownership would not survive HTML tree construction. Nomos currently diagnoses these certified browser-rewrite cases:

- a block-like start tag such as `<div>` while a `<p>` remains open;
- a new `<li>` while another `<li>` remains open;
- a new `<dt>` or `<dd>` while a `<dt>` or `<dd>` remains open;
- a nested `<button>` while a `<button>` remains open;
- non-whitespace text directly in `table`, `tbody`, `tfoot`, `thead`, or `tr` parsing context where the HTML parser foster-parents it away from the declared owner;
- an ordinary non-table element directly in those table parsing contexts where the HTML parser foster-parents the element away from the declared owner.

In each case, browser tree construction changes ownership relative to the literal source structure. Nomos reports the offending source span instead of compiling against an ownership tree that the browser would reconstruct differently.

## Repair

For implied-close cases, explicitly close the element HTML would otherwise close before the offending start tag.

For table foster-parenting cases, move ordinary content into a valid table cell (`td` or `th`) or outside the table structure. Whitespace-only table text and ordinary content inside an explicit cell are not rejected by this rule.

This diagnostic is intentionally structural and non-disableable because Nomos cannot safely own a DOM structure the HTML parser will reconstruct differently.

## Coverage boundary

This diagnostic does not yet claim complete HTML tree-construction parity. Additional table insertion-mode transitions, implied wrappers/section transitions, formatting-element interactions, and other remaining WHATWG ownership rewrites are still Phase 1 work.
