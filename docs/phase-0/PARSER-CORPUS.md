# Parser contract corpus

**Status:** Phase 0 source-shape corpus established; parser implementation remains Phase 1.

`tests/fixtures/parser/manifest.json` is the index for source forms that the future parser must accept or reject. The structural corpus contains seven valid fixtures and four invalid/adversarial fixtures. A dedicated whitespace corpus adds five source/expectation fixtures governed by `spec/whitespace.json`.

The valid fixtures cover interpolation; static/mixed/dynamic/shorthand/spread attributes; all four directive prefixes; `if`/`else if`/`else`; keyed and positional lists with an empty branch; all await branches; imported components; custom elements; raw HTML; TypeScript and JavaScript scripts; scoped/global styles; SVG; and MathML.

The invalid fixtures reserve stable diagnostic identities for duplicate top-level scripts, HTML ownership invalidated by browser parsing, unterminated structural blocks, and unsupported directive prefixes. These are contract fixtures only: passing the Phase 0 corpus check means the cases are present and internally indexed, **not** that a parser exists or passes them yet.

Whitespace behavior is now explicit: author text is preserved after HTML newline normalization, the compiler performs no aesthetic trimming, one immediate leading LF after `pre`/`textarea` is stripped to match HTML syntax, template delimiters emit no text, interpolation does not trim adjacent text, and CSS controls visual collapsing/wrapping. See ADR-0003 and `tests/fixtures/parser/whitespace/`.
