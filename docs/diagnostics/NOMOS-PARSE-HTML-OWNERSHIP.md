# NOMOS-PARSE-HTML-OWNERSHIP

**Severity:** error  
**Disableable:** no  
**Learning level:** 0+

The declared template ownership would not survive HTML tree construction. Nomos currently diagnoses **21 certified browser-rewrite scenarios** across paragraph/list/button behavior, major table insertion modes, and high-impact active-formatting recovery.

Covered formatting cases include:

- a nested `<a>` start tag while another anchor remains active;
- a nested `<nobr>` start tag while another `nobr` remains active;
- a misnested end tag for an active formatting element such as `a`, `b`, `em`, `i`, `strong`, or related WHATWG formatting elements while another element is still current.

In those cases the HTML parser runs active-formatting recovery or the adoption agency algorithm, which can close, recreate, or reparent formatting elements. The resulting browser DOM can therefore differ from literal source nesting.

Covered table cases include foster-parenting, implied `tbody`/`tr`/`colgroup` wrappers, row/cell auto-close, caption/section/column-group transitions, and multi-level cell → row → section close chains.

## Repair

For formatting cases, make formatting tags properly nested and explicitly close the existing `a` or `nobr` before starting another one.

For implied-close cases, explicitly close the element HTML would otherwise close before the offending start tag.

For table foster-parenting cases, move ordinary content into a valid table cell (`td` or `th`) or outside the table structure.

For browser-inserted table wrappers, write the required `tbody`, `tr`, or `colgroup` explicitly so Nomos and the browser own the same DOM hierarchy.

For table-section/caption transitions, explicitly close the active cell, row, section, caption, or relevant chain before beginning the next table construct.

This diagnostic is intentionally structural and non-disableable because Nomos cannot safely own a DOM structure the HTML parser will reconstruct differently.

## Coverage boundary

This diagnostic does not yet claim complete HTML tree-construction parity or a complete implementation of the adoption agency algorithm. Remaining Phase 1 work is narrowed to active-formatting reconstruction edge cases plus lower-frequency special/table/template insertion-mode interactions.
