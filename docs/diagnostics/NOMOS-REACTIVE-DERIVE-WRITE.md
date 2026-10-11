# NOMOS-REACTIVE-DERIVE-WRITE

**Severity:** error  
**Disableable:** no  
**Learning level:** 1+

A derived value must be read-only and side-effect free with respect to Nomos reactive state. The compiler reports this diagnostic when it can statically see either of these cases:

- assignment, compound assignment, increment, or decrement of a `derive()` binding;
- assignment, compound assignment, increment, or decrement of tracked state while the synchronous body of a `derive()` callback is evaluating.

The check is binding-aware. It follows the resolved imports of `state` and `derive` from `nomos`, including aliases, and does not diagnose an unrelated local function or parameter merely because it has the same spelling.

## Repair

Move state mutation to an ordinary event/function or to `sync()` when the mutation is genuinely part of external-system coordination. Keep `derive()` limited to calculating and returning a value from its reactive inputs.

A function created or returned by a derive callback is not treated as executing during derivation merely because its body contains a future state write; only the synchronous derivation path is diagnosed by this compiler check.

The development runtime retains its derive-write guard as a second line of defense for cases the compiler cannot prove statically.
