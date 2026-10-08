# NOMOS-PARSE-HTML-OWNERSHIP

**Severity:** error  
**Disableable:** no  
**Learning level:** 0+

The declared template ownership would not survive HTML tree construction. The currently certified case is a block-like start tag such as `<div>` while a `<p>` remains open: HTML parsing implicitly closes the paragraph before that element, so the browser tree would differ from the declared Nomos tree.

## Repair

Close the paragraph before the offending element or move the element outside the paragraph.

This diagnostic is intentionally structural and non-disableable because Nomos cannot safely own a DOM structure the HTML parser will reconstruct differently.
