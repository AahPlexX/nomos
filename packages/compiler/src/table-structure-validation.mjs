import { detectTableStartTagRewrite } from './html-table-ownership.mjs';

const DOCS_URL = 'https://github.com/AahPlexX/nomos/blob/main/docs/diagnostics/NOMOS-PARSE-HTML-OWNERSHIP.md';
const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);

export function validateTableStructure(result) {
  if (!result || !Array.isArray(result.sections) || !Array.isArray(result.diagnostics)) throw new TypeError('result must contain sections and diagnostics arrays');

  for (const section of result.sections) {
    if (section.kind !== 'template' || section.syntax?.type !== 'TemplateSyntaxTree') continue;
    const stack = [];
    for (const node of section.syntax.nodes ?? []) {
      if (node.type === 'ElementOpen') {
        const incoming = node.name.toLowerCase();
        const rewrite = detectTableStartTagRewrite(stack, incoming);
        if (rewrite) {
          result.diagnostics.push(toDiagnostic(node, rewrite));
          repairStack(stack, rewrite);
        }
        if (!node.selfClosing && !VOID.has(incoming)) stack.push(node.name);
      } else if (node.type === 'ElementClose') {
        const found = lastIndex(stack, (name) => name.toLowerCase() === node.name.toLowerCase());
        if (found >= 0) stack.splice(found);
      }
    }
  }
  return result;
}

function toDiagnostic(node, rewrite) {
  const tag = node.name;
  let message;
  let explanation;
  let repair;
  if (rewrite.kind === 'implied-wrapper') {
    const wrappers = rewrite.wrappers.map((name) => `<${name}>`).join(' and ');
    message = `<${tag}> requires browser-inserted ${wrappers} in this table context.`;
    explanation = `HTML tree construction inserts ${wrappers} before <${tag}>, so the browser tree would differ from the declared Nomos ownership tree.`;
    repair = `Write the required ${wrappers} explicitly before <${tag}>.`;
  } else {
    const closed = rewrite.closes.map((name) => `<${name}>`).join(' and ');
    message = `<${tag}> implicitly closes the currently open ${closed} in this table context.`;
    explanation = `HTML tree construction closes ${closed} before inserting <${tag}>, so the browser tree would differ from the declared Nomos ownership tree.`;
    repair = `Close ${closed} explicitly before <${tag}>.`;
  }
  return {
    code: 'NOMOS-PARSE-HTML-OWNERSHIP', severity: 'error', message, explanation, repair,
    span: cloneSpan(node.span), level: 0, docsUrl: DOCS_URL, disableable: false,
    autofix: { safe: false, edits: [] },
    json: { code: 'NOMOS-PARSE-HTML-OWNERSHIP', severity: 'error', span: cloneSpan(node.span), level: 0 },
    sarif: { ruleId: 'NOMOS-PARSE-HTML-OWNERSHIP', level: 'error', region: {
      startLine: node.span.start.line, startColumn: node.span.start.column,
      endLine: node.span.end.line, endColumn: node.span.end.column,
    } },
  };
}

function repairStack(stack, rewrite) {
  if (rewrite.kind !== 'implicit-close' || rewrite.closes.length === 0) return;
  const closed = new Set(rewrite.closes.map((name) => name.toLowerCase()));
  let earliest = -1;
  for (let index = 0; index < stack.length; index += 1) {
    if (closed.has(stack[index].toLowerCase())) {
      earliest = index;
      break;
    }
  }
  if (earliest >= 0) stack.splice(earliest);
}

function cloneSpan(span) { return { start: { ...span.start }, end: { ...span.end } }; }
function lastIndex(list, predicate) {
  for (let index = list.length - 1; index >= 0; index -= 1) if (predicate(list[index])) return index;
  return -1;
}
