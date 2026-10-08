# Research: public conformance promotion workflow

**Date:** 2026-10-08  
**Wayfinder ticket:** https://github.com/AahPlexX/nomos/issues/5

## Question

How should Nomos package and execute public `NCON-*` conformance tests so a requirement row moves from `planned` to `passing` only when the exact reserved public test identity is green across every intended environment?

## Primary-source findings

### Node test execution

Node's built-in test runner is stable and supports `--test-name-pattern` for exact/name-pattern filtering. Test-file selection and test-name selection are distinct, so Nomos should maintain an explicit manifest from `NCON-*` identity to test file rather than infer file discovery from a name filter.

Sources:
- https://nodejs.org/download/release/latest-v22.x/docs/api/test.html
- https://nodejs.org/api/cli.html

### Environment matrices

GitHub Actions matrix jobs are designed to execute a test job across declared environment combinations. Nomos can therefore model required environments as data in its conformance manifest and later mirror that list into CI jobs instead of embedding promotion semantics in workflow prose.

Sources:
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations
- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax

### Browser-required behavior

The Nomos PRD already states that official integration tests use browser execution where DOM behavior matters and that unit-only DOM emulation is insufficient for release-critical focus, parsing, hydration, and event behavior. The conformance system therefore must not count a Node/jsdom-style substitute as satisfying a manifest entry that declares a browser environment.

Authority: preserved PRD, `docs/prd/source-part-03.md` → Tooling / Testing.

## Decision input

The conformance system should have four independent responsibilities:

1. **Identity:** `spec/requirements.json` reserves each exact `NCON-*` ID.
2. **Binding:** `conformance/manifest.json` binds that ID to its requirement, public test file, and required environments.
3. **Execution:** runners execute only the environments they truly support and fail rather than silently substituting another environment.
4. **Promotion:** `planned` → `passing` is an explicit repository mutation allowed only after every environment declared for that exact ID is green in one evidence set.

A test file existing on disk is not green evidence. A development test with a different identity is not green evidence. Passing one environment when the manifest requires more than one is not green evidence.
