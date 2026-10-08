Benchmarks MUST include source, harness, machine details, browser versions, build modes, and raw results. Nomos MUST NOT make universal superiority claims from one benchmark.

The initial hello-world target is no more than 10 KB minified and compressed for the minimum core and DOM path. This is a product budget, not a factual claim about an implementation that does not yet exist.

## Success Metrics

### Learnability

A controlled study compares Nomos with current stable versions of React, Vue, and Svelte across participants with no programming experience, early-career experience, and senior experience.

Measure:

- Time to first interactive screen.
- Time to complete routing, query, mutation, and form tasks.
- Defects found by an identical behavioral test suite.
- Documentation lookups.
- Distinct framework concepts used.
- Successful modification after one week.
- Errors caused by moving between learning levels.

No public learnability claim may precede published methodology and results.

### Product Capability

A single reference application MUST demonstrate:

- Authentication shell.
- Nested routes.
- Search with cancellation and stale-result protection.
- Pagination.
- Optimistic updates and rollback.
- Complex accessible form behavior.
- Modal focus management and restoration.
- Drag-and-drop integration.
- Offline draft storage.
- Error recovery.
- SSG marketing route.
- Third-party chart or editor integration.
- Third-party custom element.

A feature is not complete if this application requires undocumented internals.

### Reliability

Release criteria include:

- Zero known data-loss defects in query/action concurrency tests.
- Zero known server-only import leaks.
- Deterministic conformance results across supported environments.
- Hydration mismatch recovery covered by adversarial fixtures.
- Accessibility test protocol passed by every official UI primitive.
- Every documented Tier 1 integration green against its pinned and latest-supported versions.

## Delivery Plan

### Phase 0: Thesis

Deliver:

- Formal component grammar.
- One-page reactive contract.
- Ten representative components.
- Architecture decision records.
- Level definitions and additivity tests.
- Public API budget test.
- Capability-gauntlet specification.
- Learnability-study protocol.

Exit when five experienced external reviewers can predict component behavior from examples and the conformance drafts reveal no contradictory semantics.

### Phase 1: Vertical Slice

Deliver:

- Parser and source maps.
- State, derivation, synchronization, and ownership.
- Text and attribute bindings.
- Events and native-control bindings.
- Conditions and keyed lists.
- Components and inputs.
- Scoped CSS.
- Vite integration and HMR.
- Levels 0 through 3.

Exit when a TodoMVC-class application passes deterministic browser tests, preserves valid state through HMR, and cleans up every owned effect.

### Phase 2: Application Core

Deliver:

- Router and layouts.
- Query and Action.
- Forms and field state.
- Boundaries.
- Shared state and context.
- UI primitives.
- Testing utilities.
- Initial devtools.
- Levels 4 through 7.
- Project manifest.

Exit when the client-rendered capability gauntlet passes without undocumented escape hatches.

### Phase 3: Nomos 1.0

Deliver:

- SSG and hydration.
- Route code splitting.
- Static-host deployment guidance.
- Performance, security, and accessibility suites.
- Custom-element output and manifests.
- Framework wrappers.
- MCP server and agent instructions.
- All declared Tier 1 integrations.

Exit only when all 1.0 release gates pass.

### Phase 4: Nomos 1.x

Evaluate and deliver independently:

- Request-time SSR.
- Streaming.
- Server functions.
- Non-JavaScript form submission.
- Server-runtime adapters.
- TypeScript 7 programmatic API migration.
- Time-travel devtools.

## Release Gates

Nomos 1.0 MUST NOT ship until:

- Every capability marked 1.0 is stable or removed.
- Every MUST and MUST NOT requirement has a passing conformance test.
- All level-additivity suites pass.
- The client and SSG capability gauntlets pass.
- Security, accessibility, hydration, and serialization reviews close all release blockers.
- Every Tier 1 integration passes CI.
- Static-host reference deployments pass.
- The learnability study methodology and results are published.
- Public API, configuration, manifest, diagnostic, and MCP schemas are versioned and documented.
- Migration and compatibility policies are published.

## Risks and Controls

| Risk | Impact | Control |
|---|---|---|
| Hidden compiler magic | Unpredictable production behavior | Explicit primitives, generated-code inspection, line explanations |
| Beginner promise exceeds evidence | Loss of credibility | Treat learnability as a measured hypothesis |
| Scope exceeds team capacity | Delayed or unstable release | Gated phases; remove incomplete 1.0 features rather than waive gates |
| Similarity to existing frameworks | Weak adoption reason | Demonstrate levels, diagnostics, forms, async ownership, and inspection in one gauntlet |
| Ecosystem deficit | Migration resistance | Browser standards, Vite, custom elements, manifests, ordinary packages |
| Reactive edge cases | Correctness defects | Formal ownership and scheduling contract; adversarial conformance tests |
| Query defaults surprise users | Data consistency problems | Conservative defaults, devtools visibility, explicit policy overrides |
| Accessibility claims exceed behavior | User harm and compliance risk | Manual protocols, browser tests, no automatic-conformance claims |
| Server concerns leak into client semantics | Permanent complexity | Keep server-only rules inside explicit boundaries |
| Toolchain volatility | Broken integrations | Version matrix, compatibility adapter, release-blocking CI |
| Performance marketing overreaches | Misleading claims | Open benchmark source and raw data; no universal claims |
| Name collision | Legal and discoverability risk | Treat Nomos and `.nomos` as provisional until clearance |

## Open Decisions

The following remain pre-1.0 decisions and MUST be resolved through prototypes and RFCs:

- Exact slot-presence API without expanding the core budget.
- Whether empty arrays trigger the asynchronous empty branch.
- Exact HMR compatibility signature.
- Whether `state.snapshot` remains on the root state namespace.
- Whether exhaustive pattern matching warrants another structural block.
- Canonical query-key serialization.
- Canonical SSG data-serialization format and CSP envelope.
- Exact custom-element pre-upgrade property behavior.
- TypeScript 7.1-or-later API adoption timing.
- Framework-file support status in external linters.
- Final product and extension name.

Open decisions MUST NOT be silently resolved by implementation. Each requires an architecture decision or public RFC, compatibility impact, test plan, and documentation change.

## Naming and Governance

“Nomos” and `.nomos` are working identifiers only. Before public branding, the project MUST complete:

- npm package and scope search.
- GitHub organization and repository search.
- Domain and search-confusion analysis.
- Trademark clearance in intended markets and classes.
- Review of similarly named developer and AI products.

The USPTO recommends searching for similar marks before filing, and package-name availability does not establish trademark clearance.[^28][^29]

The project is intended to use an OSI-approved permissive license. The exact license, governance model, RFC process, maintainer roles, security authority, and release authority MUST be ratified before accepting external contributions.

## Final Product Requirement

Nomos must prove value through complete applications rather than isolated syntax demonstrations. The decisive release test is whether users can build, inspect, test, integrate, and deploy the capability-gauntlet application using only the documented public model while the implementation meets its correctness, accessibility, security, interoperability, and compatibility gates.

---

## References

1. [Vite 8.0 is out!](https://vite.dev/blog/announcing-vite8) - Vite 8.0 is out! March 12, 2026. We're thrilled to announce the stable release of Vite 8! Vite 8 shi...

2. [Volar.js](https://volarjs.dev/) - VolarJS is a modern embedded language tooling framework that aims to simplify the development of lan...

3. [A common interface for TypeScript validation libraries](https://standardschema.dev/schema) - The specification consists of a single TypeScript interface StandardSchemaV1 to be implemented by an...

4. [<dialog> HTML dialog element - MDN Web Docs - Mozilla](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) - The command attribute sets the particular command that is to be sent when the <button> element is cl...

5. [Front-end Frameworks](https://2025.stateofjs.com/en-US/libraries/front-end-frameworks/) - React tops the list of things front-end developers are struggling with. Other recurring issues inclu...

6. [Dialog (Modal) Pattern | APG | WAI](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) - However, unlike most non-modal dialogs, modal dialogs do not provide means for moving keyboard focus...

7. [Developing a Keyboard Interface | APG | WAI](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) - This section covers: Understanding fundamental principles of focus movement conventions used in ARIA...

8. [Plugin API - Vite](https://v4.vite.dev/guide/api-plugin) - Next Generation Frontend Tooling

9. [Announcing TypeScript 7.0 Beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/) - Today we are absolutely thrilled to announce the release of TypeScript 7.0 Beta! If you haven't been...

10. [www.typescriptlang.orgTypeScript: JavaScript With Syntax For Types.](https://www.typescriptlang.org/?lang=en) - TypeScript extends JavaScript by adding types to the language. TypeScript speeds up your development...

11. [Languages](https://volarjs.dev/reference/languages/) - The Embedded Language Tooling Framework

12. [Embedded languages](https://volarjs.dev/core-concepts/embedded-languages/) - The Embedded Language Tooling Framework

13. [Standard Schema](https://standardschema.dev/) - The Standard Schema project is a set of interfaces that standardize the provision and consumption of...

14. [React Compiler v1.0](https://react.dev/blog/2025/10/07/react-compiler-1) - React Compiler works on both React and React Native, and automatically optimizes components and hook...

15. [await • Svelte Docs](https://svelte.dev/docs/svelte/await-expressions) - The experimental flag will be removed in Svelte 6. Synchronized updates. When ... If you're using a ...

16. [Angular versioning and releases](https://angular.dev/reference/releases) - Stability ensures that reusable components and libraries, tutorials, tools, and learned practices do...

17. [Error boundaries with @boundary • Angular](https://angular.dev/guide/templates/error-boundaries) - The web development framework for building modern apps.

18. [JavaScript Signals standard proposal](https://github.com/tc39/proposal-signals) - This proposal is on the April 2024 TC39 agenda for Stage 1. It can currently be thought of as "Stage...

19. [ViewTransition - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition) - Via the Document.activeViewTransition property. · In the case of same-document (SPA) transitions, it...

20. [Document: startViewTransition() method](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) - The startViewTransition() method of the Document interface starts a new same-document (SPA), documen...

21. [www.w3.org · WAI · WCAG22Understanding Success Criterion 1.4.10: Reflow | WAI | W3C](https://www.w3.org/WAI/WCAG22/Understanding/reflow)

22. [Content-Security-Policy: require-trusted-types-for directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/require-trusted-types-for) - The HTTP Content-Security-Policy (CSP) require-trusted-types-for directive instructs user agents to ...

23. [Content-Security-Policy: trusted-types directive - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/trusted-types) - The HTTP Content-Security-Policy (CSP) trusted-types directive is used to specify an allowlist of Tr...

24. [developer.mozilla.org › Web › SecurityCross-site scripting (XSS) - Security | MDN - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS) - A cross-site scripting (XSS) attack is one in which an attacker is able to get a target site to exec...

25. [Content Security Policy (CSP) - HTTP - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) - The primary use case for CSP is to control which resources, remain blocked on browsers that don't su...

26. [React DOM Components](https://react.dev/reference/react-dom/components) - Custom HTML elements If you render a tag with a dash, like <my-element> , React will assume you want...

27. [webcomponents/custom-elements-manifest: A file format ...](https://github.com/webcomponents/custom-elements-manifest) - A file format for describing custom elements. Contribute to webcomponents/custom-elements-manifest d...

28. [Search our trademark database](https://www.uspto.gov/trademarks/search) - A search you complete before applying for a trademark registration to make sure your trademark is av...

29. [United States Patent and Trademark Office](https://www.uspto.gov/) - In this module, we focus on Trademark Center, the required system for filing a trademark application...

