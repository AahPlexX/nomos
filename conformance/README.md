# Nomos public conformance suite

This directory is the stable public home of `NCON-*` tests reserved by `spec/requirements.json`.

## Contract

- One requirement row reserves one exact public test identity such as `NCON-NREQ-0145`.
- `conformance/manifest.json` binds that identity to its requirement, test file, and every environment required for promotion.
- A row may move from `planned` to `passing` only after the exact public test is green in **all** declared environments within the same evidence set.
- Merely adding a test file, running a private development test, or passing a unit substitute for a browser-required behavior is insufficient.
- Browser-required behavior must run in a real browser. Unit-only DOM emulation cannot satisfy a browser environment.
- Promotion of `spec/requirements.json` remains an explicit reviewed repository mutation after green evidence; tests do not rewrite the ledger automatically.

## Commands

- `node tools/run-conformance.mjs` — run every currently wired Node conformance test.
- `node tools/run-conformance.mjs NCON-NREQ-0145` — run one exact public test identity.
- `node tools/validate-conformance.mjs` — verify manifest/ledger/contract consistency.

The runner currently executes `node` entries. Browser profiles will be added with the browser harness rather than silently routed through Node.

## Current seed

`NCON-NREQ-0145` is wired to the compiler section/source-position requirement but remains `wired-unverified`; `NREQ-0145` therefore remains `planned` until a complete checkout/CI run provides green evidence.
