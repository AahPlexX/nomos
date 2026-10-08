# Parser contract corpus

**Status:** Phase 0 source-shape corpus established; parser implementation remains Phase 1.

`tests/fixtures/parser/manifest.json` is the index for source forms that the future parser must accept or reject. The corpus currently contains seven valid fixtures and four invalid/adversarial fixtures.

The valid fixtures cover interpolation; static/mixed/dynamic/shorthand/spread attributes; all four directive prefixes; `if`/`else if`/`else`; keyed and positional lists with an empty branch; all await branches; imported components; custom elements; raw HTML; TypeScript and JavaScript scripts; scoped/global styles; SVG; and MathML.

The invalid fixtures reserve stable diagnostic identities for duplicate top-level scripts, HTML ownership invalidated by browser parsing, unterminated structural blocks, and unsupported directive prefixes. These are contract fixtures only: passing the Phase 0 corpus check means the cases are present and internally indexed, **not** that a parser exists or passes them yet.

Whitespace rendering behavior remains an explicit Phase 0 follow-up because the PRD requires it to be documented by grammar fixtures rather than inferred from implementation.
