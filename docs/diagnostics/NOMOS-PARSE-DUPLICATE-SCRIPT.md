# NOMOS-PARSE-DUPLICATE-SCRIPT

**Severity:** error  
**Disableable:** no  
**Learning level:** 0+

A `.nomos` component may contain at most one top-level `<script>` section. Multiple component scripts make initialization order ambiguous and violate the component grammar.

## Repair

Merge declarations into the first top-level `<script>` section and remove the additional top-level script section. Script-like markup nested inside template ownership is not counted as a component script section.
