# Learnability-study protocol

**Status:** Phase 0 protocol draft; no public learnability claim is authorized before methodology and results are published.

## Research question

Does Nomos's single canonical path plus additive learning levels improve task success and retention without hiding production-relevant behavior?

## Comparison set

Use current stable versions of Nomos, React, Vue, and Svelte at the time the study runs. Revalidate versions immediately before study execution and freeze the environment for all participants.

## Participant strata

Recruit separate cohorts with:

- no prior programming experience;
- early-career development experience;
- senior front-end engineering experience.

Do not pool strata in a way that hides materially different outcomes.

## Tasks

Each participant completes equivalent, behaviorally scored tasks covering:

1. first static screen;
2. first interactive state update;
3. condition/list rendering;
4. component composition and typed input;
5. routing;
6. remote query with loading/error behavior;
7. mutation;
8. accessible form behavior;
9. modification of the same project after one week.

Framework-specific syntax may differ; acceptance behavior must not.

## Measures

Capture the PRD-required measures:

- time to first interactive screen;
- time to complete routing, query, mutation, and form tasks;
- defects found by an identical behavioral test suite;
- documentation lookups;
- distinct framework concepts used;
- successful modification after one week;
- errors caused by moving between Nomos learning levels.

Also record task abandonment and assistance requests so time-only metrics do not reward silent failure.

## Bias controls

- Randomize framework/task ordering where the study design permits.
- Give equivalent hardware, browser, editor, and network conditions.
- Predefine what counts as a lookup, defect, hint, and completion.
- Keep scoring behavior-based and blind to framework where practical.
- Publish exclusions, missing data, and per-stratum results.

## Publication gate

Before making a learnability claim, publish the frozen protocol, participant counts, environment/version matrix, anonymized aggregate/raw-enough results for verification, analysis method, limitations, and all deviations from this protocol.
