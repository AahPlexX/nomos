# Phase 0 external reviewer packet

**Status:** OPTIONAL / NON-BLOCKING HISTORICAL REVIEW MATERIAL  
**Superseded gate:** PRD Amendment 0001 removed the five-experienced-external-reviewer requirement from Phase 0 exit on 2026-10-08.

This packet is retained because it can still be useful for voluntary usability/predictability review. It must not be interpreted by a future agent as a current phase gate.

## Optional reviewer qualification

If voluntary external review is performed, prefer independent reviewers with meaningful professional experience building or reviewing front-end frameworks, compilers, reactive UI systems, or equivalent production web infrastructure. Record only non-identifying background needed to contextualize feedback.

## Frozen review inputs

A voluntary reviewer may read: `PRD.md` plus preserved source/amendments, the reactive contract, grammar, whitespace contract/ADR, levels/runtime API, representative Phase 0 examples, parser fixtures, and open-decision register.

## Prediction prompts

The original twelve prompts remain useful for checking predictability: component setup/rerender behavior; scheduling; illegal derive writes; keyed-list state preservation; live inputs; query cancellation/stale results; Boundary ownership; native form/focus behavior; owner-disposal ordering; inline whitespace; leading LF in `pre`/`textarea`; and recognition that none of the eleven Open Decisions are resolved.

## Evidence use

Any voluntary review finding that exposes a real contradiction or ambiguity must enter the normal PRD/ADR/spec/test/documentation workflow. There is no minimum reviewer count and no reviewer-completion threshold for Phase 0 or Phase 1 entry.
