# Phase 0 external reviewer packet

**Gate status:** NOT YET SATISFIED  
**Required by PRD:** five experienced external reviewers must be able to predict component behavior from the Phase 0 examples, and contradictions discovered during review must be resolved.

## Reviewer qualification

Use five independent reviewers who were not authors of the Phase 0 contracts and who have meaningful professional experience building or reviewing front-end frameworks, compilers, reactive UI systems, or equivalent production web infrastructure.

Record each reviewer's role/background at a non-identifying level sufficient to establish experience. Do not record unnecessary personal data.

## Frozen review inputs

Each reviewer receives the same repository commit and reads, in order:

1. `PRD.md` and its four authoritative source fragments.
2. `docs/phase-0/REACTIVE-CONTRACT.md`.
3. `spec/nomos.ebnf`.
4. `spec/whitespace.json` and `docs/adr/0003-whitespace-semantics.md`.
5. `spec/levels.json` and `spec/runtime-api.json`.
6. all ten `examples/phase-0/*.nomos` files.
7. `tests/fixtures/parser/manifest.json` plus whitespace fixtures.
8. `spec/open-decisions.json`.

Do not give reviewers implementation code, because Phase 0 is testing predictability of the public model rather than familiarity with internals.

## Prediction prompts

Each reviewer answers independently before group discussion:

1. Which source sections execute once per component instance, and is there a component rerender phase?
2. After synchronous state writes, when do DOM updates and `sync()` reruns occur?
3. Can a `derive()` write reactive state, and what should happen if it tries?
4. When keyed list items reorder, which existing browser state should survive where browser behavior permits?
5. If a parent updates an input destructured from `inputs<T>()`, does the child read stay live?
6. If a query key changes while an older request is pending, what happens to unneeded work and to a late stale result?
7. What does a `Boundary` catch, and which event/detached async errors are outside its ownership?
8. In the form example, which native semantics remain present and what is the required failed-validation focus behavior?
9. When an owner is disposed, in what order do child owners, cleanup, and DOM removal occur?
10. For `<p>Hello <strong>Nomos</strong> world</p>`, which literal spaces exist as DOM text data, and who controls whether whitespace visually collapses?
11. What happens to one source LF immediately following a `<pre>` or `<textarea>` start tag?
12. Which of the eleven Open Decisions are already resolved by the examples? (Canonical answer: none.)

## Evidence form

For each reviewer record:

- frozen commit SHA;
- reviewer experience category;
- answer to each prompt;
- confidence (low/medium/high);
- any line they found ambiguous or contradictory;
- any behavior they could not predict from the frozen inputs.

## Gate rule

Do not close the Phase 0 reviewer gate unless:

- all five qualified reviewers completed the packet independently;
- every reviewer correctly predicts every safety/correctness-critical behavior represented by a normative `MUST`/`MUST NOT` in the prompts;
- each reviewer is correct on at least 90% of all prediction prompts; and
- every ambiguity or contradiction report has either been resolved with synchronized PRD/ADR/test/documentation changes or explicitly shown not to conflict with the authoritative contract.

Store the resulting evidence in a dated review record. Never substitute an AI self-review for this external-review gate.
