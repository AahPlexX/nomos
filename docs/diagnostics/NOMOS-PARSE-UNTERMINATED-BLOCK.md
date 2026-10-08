# NOMOS-PARSE-UNTERMINATED-BLOCK

**Severity:** error  
**Disableable:** no  
**Learning level:** 0+

A `{#if}`, `{#each}`, or `{#await}` structural block reaches the end of its template section without the matching closing block token.

## Repair

Add the matching `{/if}`, `{/each}`, or `{/await}` after the block body.
