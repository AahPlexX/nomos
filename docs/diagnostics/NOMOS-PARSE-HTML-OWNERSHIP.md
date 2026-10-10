# NOMOS-PARSE-HTML-OWNERSHIP

**Severity:** error  
**Disableable:** no  
**Learning level:** 0+

The declared template ownership would not survive HTML tree construction. Nomos currently diagnoses 18 certified browser-rewrite scenarios across paragraph/list/button behavior and HTML table insertion modes.

Covered table cases include:

- non-whitespace text or ordinary elements foster-parented away from table ownership;
- `tr` directly under `table` causing an implied `tbody`;
- `td`/`th` directly under `table` causing implied `tbody` + `tr`;
- `td`/`th` directly under `tbody`/`thead`/`tfoot` causing an implied `tr`;
- a new table cell closing the currently open cell;
- a new row closing the currently open row;
- bare `col` directly under `table` causing an implied `colgroup`;
- caption, table-section, and `colgroup` starts closing an active table section before reprocessing;
- a new table section closing an open row and its active section;
- caption starts inside a cell closing the cell → row → section chain;
- a new caption closing an already-open caption.

In each case, browser tree construction changes ownership relative to the literal source structure. Nomos reports the offending source span instead of compiling against an ownership tree that the browser would reconstruct differently.

## Repair

For implied-close cases, explicitly close the element HTML would otherwise close before the offending start tag.

For table foster-parenting cases, move ordinary content into a valid table cell (`td` or `th`) or outside the table structure. Whitespace-only table text and ordinary content inside an explicit cell are not rejected by this rule.

For browser-inserted table wrappers, write the required `tbody`, `tr`, or `colgroup` explicitly so Nomos and the browser own the same DOM hierarchy.

For table-section/caption transitions, explicitly close the active cell, row, section, caption, or relevant chain before beginning the next table construct.

This diagnostic is intentionally structural and non-disableable because Nomos cannot safely own a DOM structure the HTML parser will reconstruct differently.

## Coverage boundary

This diagnostic does not yet claim complete HTML tree-construction parity. Remaining Phase 1 work is narrowed to formatting/adoption-agency behavior and lower-frequency special/table/template insertion-mode interactions.
