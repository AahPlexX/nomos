# Nomos execution queue

**Last updated:** 2026-10-08  
**Binding scope:** `PRD.md`  
**Current phase:** Phase 0 — Thesis

Status keys: `[x]` verified complete, `[>]` in progress, `[ ]` not complete, `[!]` blocked by an explicit decision/gate.

## Phase 0 deliverables

- [>] Formal component grammar.
  - [x] Initial EBNF contract checked in.
  - [ ] Parser-valid fixture corpus.
  - [ ] Parser-invalid/adversarial fixture corpus.
  - [ ] Whitespace/HTML-ownership grammar fixtures.
- [x] One-page reactive contract drafted from the PRD.
- [x] Ten representative `.nomos` components present.
- [>] Architecture decision records.
  - [x] Toolchain/API compatibility baseline recorded.
  - [x] Direct-to-main/document-freshness execution policy recorded.
  - [ ] ADRs for every Phase 0 decision discovered during prototypes.
- [x] Learning-level definitions encoded.
- [x] Additivity test proves every higher level contains prior concepts.
- [x] Public root API budget encoded and tested (`<= 12`; proposed root currently 10).
- [x] Capability-gauntlet specification drafted.
- [x] Learnability-study protocol drafted.
- [>] Normative requirement traceability.
  - [ ] Extract all PRD `MUST` / `MUST NOT` statements into stable requirement IDs.
  - [ ] Map each requirement to an automated conformance test id or explicit future-phase planned test id.
  - [ ] Add a checker that rejects unmapped normative requirements before release-complete status can be set.

## Phase 0 exit gate

- [ ] Five experienced external reviewers can predict component behavior from examples.
- [ ] Conformance drafts reveal no contradictory semantics.
- [ ] Exit review recorded with reviewer evidence and any resulting PRD/ADR changes.

**Phase 0 must remain IN PROGRESS until every exit-gate item above is evidenced.**

## Phase 1 — do not start yet

The Phase 1 vertical slice is queued but gated by Phase 0 exit. Do not begin parser/runtime implementation merely because the Phase 0 document list exists.
