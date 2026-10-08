# NOMOS-PARSE-UNKNOWN-DIRECTIVE

**Severity:** error  
**Disableable:** no  
**Learning level:** 0+

An attribute uses a colon-prefixed Nomos-like directive that is not part of the 1.0 directive set. Nomos recognizes exactly `on:`, `bind:`, `use:`, and `let:`. Standard XML namespace prefixes used by web content are not treated as Nomos directives.

## Repair

Use one of the supported Nomos directive prefixes or rewrite the value as a standard attribute where that is semantically correct.
