# NOMOS-PARSE-UNCLOSED-SECTION

**Severity:** error  
**Disableable:** no  
**Learning level:** 0+

A top-level `<script>` or `<style>` section was opened but its opening tag or matching closing tag was not completed. The parser reports the exact raw source span beginning at that section's opening `<`.

## Repair

Complete the opening tag and add the corresponding `</script>` or `</style>` closing tag after the section body.
