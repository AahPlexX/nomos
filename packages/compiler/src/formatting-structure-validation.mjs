import {
  detectFormattingEndTagRewrite,
  detectFormattingStartTagRewrite,
} from './html-formatting-ownership.mjs';

const DOCS_URL = 'https://github.com/AahPlexX/nomos/blob/main/docs/diagnostics/NOMOS-PARSE-HTML-OWNERSHIP.md';
const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);

export function validateFormattingStructure(result) {
  if (!result || !Array.isArray(result.sections) || !Array.isArray(result.diagnostics)) {
    throw new TypeError('result must contain sections and diagnostics arrays');
  }

  for (const section of result.sections) {
    if (section.kind !== 'template' || section.syntax?.type !== 'TemplateSyntaxTree') continue;
    const stack = [];

    for (const node of section.syntax.nodes ?? []) {
      if (node.type === 'ElementOpen') {
        const incoming = node.name.toLowerCase();
        const rewrite = detectFormattingStartTagRewrite(stack, incoming);
        if (rewrite) {
          result.diagnostics.push(toStartDiagnostic(node, rewrite));
          closeThrough(stack, rewrite.closes[0]);
        }
        if (!node.selfClosing && !VOID.has(incoming)) stack.push(node.name);
        continue;
      }

      if (node.type === 'ElementClose') {
        const closing = node.name.toLowerCase();
        const rewrite = detectFormattingEndTagRewrite(stack, closing);
        if (rewrite) {
          result.diagnostics.push(toEndDiagnostic(node, rewrite));
          closeThrough(stack, rewrite.formatting);
          continue;
        }

        const found = lastIndex(stack, (name) => name.toLowerCase() === closing);
        if (found >= 0) stack.splice(found);
      }
    }
  }

  return result;
}

function toStartDiagnostic(node, rewrite) {
  const tag = node.name.toLowerCase();
  const reason = rewrite.reason === 'nested-anchor' ? 'anchor' : '`nobr` formatting element';
  return diagnostic(
    node,
    `<${tag}> implicitly closes the already-open <${tag}> ${reason}.`,
    `HTML tree construction runs formatting recovery before inserting this <${tag}>, so browser ownership differs from the literal Nomos nesting.`,
    `Close the existing <${tag}> explicitly before starting another <${tag}>.`,
  );
}

function toEndDiagnostic(node, rewrite) {
  return diagnostic(
    node,
    `Misnested </${rewrite.formatting}> triggers adoption-agency restructuring while <${rewrite.current}> is still open.`,
    `HTML tree construction may reparent or recreate active formatting elements for this end tag, so browser ownership differs from the literal Nomos nesting.`,
    `Close <${rewrite.current}> before </${rewrite.formatting}>, or otherwise make the formatting tags properly nested.`,
  );
}

function diagnostic(node, message, explanation, repair) {
  const span = cloneSpan(node.span);
  return {
    code: 'NOMOS-PARSE-HTML-OWNERSHIP', severity: 'error', message, explanation, repair,
    span, level: 0, docsUrl: DOCS_URL, disableable: false,
    autofix: { safe: false, edits: [] },
    json: { code: 'NOMOS-PARSE-HTML-OWNERSHIP', severity: 'error', span: cloneSpan(node.span), level: 0 },
    sarif: { ruleId: 'NOMOS-PARSE-HTML-OWNERSHIP', level: 'error', region: {
      startLine: node.span.start.line, startColumn: node.span.start.column,
      endLine: node.span.end.line, endColumn: node.span.end.column,
    } },
  };
}

function closeThrough(stack, tagName) {
  const lower = tagName.toLowerCase();
  const found = lastIndex(stack, (name) => name.toLowerCase() === lower);
  if (found >= 0) stack.splice(found);
}

function cloneSpan(span) { return { start: { ...span.start }, end: { ...span.end } }; }
function lastIndex(list, predicate) {
  for (let index = list.length - 1; index >= 0; index -= 1) if (predicate(list[index])) return index;
  return -1;
}
