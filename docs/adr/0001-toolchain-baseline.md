# ADR-0001: Toolchain baseline during the TypeScript 7 transition

- **Status:** Accepted for current development baseline
- **Date:** 2026-10-08
- **Revalidation:** Before installing/upgrading affected dependencies and for each Nomos minor release

## Context

Nomos requires a Vite-based component compiler integration and complete TypeScript/template tooling. Current official sources confirm Vite 8 exposes custom transform, virtual-module, and HMR hooks. TypeScript 7.0 is released but does not yet provide the stable programmatic API required by language/compiler tooling; Microsoft documents `@typescript/typescript6` as the compatibility package for API-dependent tools during the transition.

Registry verification on 2026-10-08 observed `vite@8.3.4`, `typescript@7.0.2`, `@typescript/typescript6@6.0.2`, `@volar/language-core@2.4.28`, `@volar/language-service@2.4.28`, and `pnpm@12.10.1`. The checked set returned no known vulnerabilities from the connected vulnerability source.

## Decision

- Project/user TypeScript compilation may target TypeScript 7 once introduced.
- Compiler/language tooling that requires the legacy programmatic API may use `@typescript/typescript6` until a stable TS7 API satisfies Nomos requirements and CI proves the migration.
- This compatibility choice is internal tooling and must not change `.nomos` source semantics.
- Vite 8 is the intended build integration line; dependency installation is deferred until a Phase 1 task actually consumes it.
- Exact versions are required when dependencies are added.
- Root engine policy is Node `>=22.13.0`, satisfying current pnpm installation requirements and Vite 8's Node 22 floor.

## Consequences

Nomos avoids coupling Phase 0 semantics to an unstable TypeScript API and avoids adding packages before executable code needs them. A future TS7 API migration requires its own compatibility evidence and ADR update.

## Sources rechecked

- Vite official plugin/getting-started documentation, 2026-10-08.
- Microsoft TypeScript 7.0 announcement and TypeScript 6 documentation, 2026-10-08.
- npm registry metadata and connected vulnerability scan, 2026-10-08.
