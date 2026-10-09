const DOCS_BASE = 'https://github.com/AahPlexX/nomos/blob/main/docs/diagnostics/';
const DIRECTIVES = new Set(['on', 'bind', 'use', 'let']);
const XML_PREFIXES = new Set(['xml', 'xmlns', 'xlink']);
const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const P_BREAKERS = new Set([
  'address','article','aside','blockquote','center','details','dialog','dir','div','dl','fieldset',
  'figcaption','figure','footer','header','hgroup','main','menu','nav','ol','p','search','section',
  'summary','ul','h1','h2','h3','h4','h5','h6','pre','listing','form','li','dd','dt','table','hr',
]);

export function analyzeTemplateSections(source, result) {
  const lineStarts = buildLineStarts(source);
  for (const section of result.sections) {
    if (section.kind !== 'template') continue;
    section.syntax = analyzeRange(source, section.span.start.offset, section.span.end.offset, lineStarts, result.diagnostics);
  }
  return result;
}

function analyzeRange(source, start, end, lineStarts, diagnostics) {
  const nodes = [];
  const elements = [];
  const blocks = [];
  let index = start;
  while (index < end) {
    if (source.startsWith('<!--', index)) {
      const close = source.indexOf('-->', index + 4);
      index = close < 0 || close >= end ? end : close + 3;
      continue;
    }
    const openBlock = blockOpen(source, index);
    if (openBlock && openBlock.end <= end) {
      const node = { type: 'BlockOpen', kind: openBlock.kind, span: span(source, lineStarts, index, openBlock.end) };
      nodes.push(node); blocks.push(node); index = openBlock.end; continue;
    }
    const branch = blockBranch(source, index);
    if (branch && branch.end <= end) {
      nodes.push({ type: 'BlockBranch', kind: branch.kind, span: span(source, lineStarts, index, branch.end) });
      index = branch.end; continue;
    }
    const closeBlock = blockClose(source, index);
    if (closeBlock && closeBlock.end <= end) {
      nodes.push({ type: 'BlockClose', kind: closeBlock.kind, span: span(source, lineStarts, index, closeBlock.end) });
      const found = lastIndex(blocks, (entry) => entry.kind === closeBlock.kind);
      if (found >= 0) blocks.splice(found, 1);
      index = closeBlock.end; continue;
    }
    if (source.startsWith('{@html', index)) {
      const close = Math.min(skipBraces(source, index), end);
      nodes.push({ type: 'RawHtml', span: span(source, lineStarts, index, close) });
      index = close; continue;
    }
    if (source[index] === '{') {
      const close = Math.min(skipBraces(source, index), end);
      nodes.push({ type: 'Interpolation', span: span(source, lineStarts, index, close) });
      index = close; continue;
    }
    if (source[index] !== '<') { index += 1; continue; }
    if (source.startsWith('</', index)) {
      const tag = readTag(source, index, true);
      if (!tag || tag.end > end) { index += 1; continue; }
      nodes.push({ type: 'ElementClose', name: tag.name, span: span(source, lineStarts, index, tag.end) });
      const found = lastIndex(elements, (name) => name.toLowerCase() === tag.name.toLowerCase());
      if (found >= 0) elements.splice(found);
      index = tag.end; continue;
    }
    if (source.startsWith('<!', index) || source.startsWith('<?', index)) {
      const close = tagEnd(source, index); index = close < 0 || close >= end ? end : close + 1; continue;
    }
    const tag = readTag(source, index, false);
    if (!tag || tag.end > end) { index += 1; continue; }
    const lower = tag.name.toLowerCase();
    const pIndex = lastIndex(elements, (name) => name.toLowerCase() === 'p');
    if (pIndex >= 0 && P_BREAKERS.has(lower)) {
      diagnostics.push(diagnostic(source, lineStarts, 'NOMOS-PARSE-HTML-OWNERSHIP', index, tag.end,
        `<${tag.name}> cannot remain owned by the currently open <p> in the HTML parse tree.`,
        `HTML parsing implicitly closes the <p> before <${tag.name}>, so the browser tree would differ from the declared Nomos ownership tree.`,
        'Close the <p> before this element or move the element outside the paragraph.'));
      elements.splice(pIndex);
    }
    const impliedClose = findImpliedStartTagClose(elements, lower);
    if (impliedClose) {
      diagnostics.push(diagnostic(source, lineStarts, 'NOMOS-PARSE-HTML-OWNERSHIP', index, tag.end,
        `<${tag.name}> implicitly closes the currently open <${impliedClose.name}> in the HTML parse tree.`,
        `HTML tree construction closes <${impliedClose.name}> before inserting <${tag.name}>, so the browser tree would differ from the declared Nomos ownership tree.`,
        `Close the <${impliedClose.name}> before this <${tag.name}>.`));
      elements.splice(impliedClose.index);
    }
    nodes.push({ type: 'ElementOpen', name: tag.name, category: classify(tag.name), selfClosing: tag.selfClosing, span: span(source, lineStarts, index, tag.end) });
    for (const attr of attributes(source, index + 1 + tag.name.length, tag.end - 1)) {
      if (attr.name.includes(':')) {
        const [prefix, ...rest] = attr.name.split(':');
        if (DIRECTIVES.has(prefix)) {
          nodes.push({ type: 'Directive', kind: prefix, name: rest.join(':'), span: span(source, lineStarts, attr.start, attr.end) });
        } else if (!XML_PREFIXES.has(prefix)) {
          diagnostics.push(diagnostic(source, lineStarts, 'NOMOS-PARSE-UNKNOWN-DIRECTIVE', attr.start, attr.end,
            `Unknown directive prefix "${prefix}:".`,
            'Nomos 1.0 recognizes exactly on:, bind:, use:, and let: directive prefixes.',
            'Use a supported Nomos directive or a standard non-directive attribute.'));
        }
      } else {
        nodes.push({ type: 'Attribute', name: attr.name, span: span(source, lineStarts, attr.start, attr.end) });
      }
    }
    if (!tag.selfClosing && !VOID.has(lower)) elements.push(tag.name);
    index = tag.end;
  }
  for (const block of blocks) {
    diagnostics.push(diagnostic(source, lineStarts, 'NOMOS-PARSE-UNTERMINATED-BLOCK', block.span.start.offset, end,
      `Unterminated {#${block.kind}} structural block.`,
      `The {#${block.kind}} block reaches the end of this template section without a matching {/${block.kind}}.`,
      `Add {/${block.kind}} after the block body.`));
  }
  return { type: 'TemplateSyntaxTree', span: span(source, lineStarts, start, end), nodes };
}

function findImpliedStartTagClose(elements, incoming) {
  let index = -1;
  if (incoming === 'li') {
    index = lastIndex(elements, (name) => name.toLowerCase() === 'li');
  } else if (incoming === 'dd' || incoming === 'dt') {
    index = lastIndex(elements, (name) => {
      const lower = name.toLowerCase();
      return lower === 'dd' || lower === 'dt';
    });
  } else if (incoming === 'button') {
    index = lastIndex(elements, (name) => name.toLowerCase() === 'button');
  }
  return index >= 0 ? { index, name: elements[index] } : null;
}

function blockOpen(source, start) {
  for (const kind of ['if','each','await']) if (source.startsWith(`{#${kind}`, start)) return { kind, end: skipBraces(source, start) };
  return null;
}
function blockClose(source, start) {
  for (const kind of ['if','each','await']) { const token = `{/${kind}}`; if (source.startsWith(token, start)) return { kind, end: start + token.length }; }
  return null;
}
function blockBranch(source, start) {
  for (const [kind, token] of [['else-if','{:else if'],['else','{:else}'],['then','{:then'],['empty','{:empty}'],['catch','{:catch']]) {
    if (source.startsWith(token, start)) return { kind, end: token.endsWith('}') ? start + token.length : skipBraces(source, start) };
  }
  return null;
}
function readTag(source, start, closing) {
  const nameStart = start + (closing ? 2 : 1);
  const match = /^[A-Za-z][A-Za-z0-9:._-]*/.exec(source.slice(nameStart));
  if (!match) return null;
  const close = tagEnd(source, start); if (close < 0) return null;
  let cursor = close - 1; while (cursor > nameStart && ws(source[cursor])) cursor -= 1;
  return { name: match[0], end: close + 1, selfClosing: !closing && source[cursor] === '/' };
}
function attributes(source, start, end) {
  const out = []; let i = start;
  while (i < end) {
    while (i < end && ws(source[i])) i += 1;
    if (i >= end || source[i] === '/') break;
    if (source[i] === '{') { i = Math.min(skipBraces(source, i), end); continue; }
    const attrStart = i;
    while (i < end && !ws(source[i]) && !['=','>','/'].includes(source[i])) i += 1;
    const name = source.slice(attrStart, i); if (!name) { i += 1; continue; }
    const nameEnd = i;
    while (i < end && ws(source[i])) i += 1;
    if (source[i] === '=') {
      i += 1; while (i < end && ws(source[i])) i += 1;
      if (source[i] === '"' || source[i] === "'") {
        const q = source[i++]; while (i < end && source[i] !== q) i += source[i] === '\\' ? 2 : 1; if (source[i] === q) i += 1;
      } else if (source[i] === '{') i = Math.min(skipBraces(source, i), end);
      else while (i < end && !ws(source[i]) && source[i] !== '>') i += 1;
    }
    out.push({ name, start: attrStart, end: Math.max(nameEnd, i) });
  }
  return out;
}
function skipBraces(source, start) {
  let depth = 0, quote = null, escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1; else if (ch === '}' && --depth === 0) return i + 1;
  }
  return source.length;
}
function tagEnd(source, start) {
  let quote = null;
  for (let i = start + 1; i < source.length; i += 1) {
    const ch = source[i]; if (quote) { if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") quote = ch; else if (ch === '>') return i;
  }
  return -1;
}
function diagnostic(source, lineStarts, code, start, end, message, explanation, repair) {
  const location = span(source, lineStarts, start, end);
  return { code, severity:'error', message, explanation, repair, span:location, level:0,
    docsUrl:`${DOCS_BASE}${code}.md`, disableable:false, autofix:{safe:false,edits:[]},
    json:{code,severity:'error',span:location,level:0},
    sarif:{ruleId:code,level:'error',region:{startLine:location.start.line,startColumn:location.start.column,endLine:location.end.line,endColumn:location.end.column}} };
}
function classify(name) { return /^[A-Z]/.test(name) ? 'component' : name.includes('-') ? 'custom-element' : 'html'; }
function buildLineStarts(source) { const starts=[0]; for(let i=0;i<source.length;i+=1){ if(source[i]==='\r'){if(source[i+1]==='\n')i+=1;starts.push(i+1);}else if(source[i]==='\n')starts.push(i+1);} return starts; }
function position(lineStarts, offset) { let lo=0,hi=lineStarts.length-1; while(lo<=hi){const mid=(lo+hi)>>1;if(lineStarts[mid]<=offset)lo=mid+1;else hi=mid-1;}const li=Math.max(0,hi);return {offset,line:li+1,column:offset-lineStarts[li]+1}; }
function span(source, lineStarts, start, end) { if(start<0||end>source.length||end<start) throw new RangeError('invalid source span'); return {start:position(lineStarts,start),end:position(lineStarts,end)}; }
function lastIndex(list, predicate) { for(let i=list.length-1;i>=0;i-=1) if(predicate(list[i])) return i; return -1; }
function ws(ch) { return ch===' '||ch==='\t'||ch==='\n'||ch==='\r'||ch==='\f'; }
