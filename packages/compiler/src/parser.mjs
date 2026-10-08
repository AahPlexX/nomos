const SECTION_NAMES = ['script', 'style'];
const DOCS_BASE = 'https://github.com/AahPlexX/nomos/blob/main/docs/diagnostics/';

/**
 * Parse the top-level component sections while preserving raw source offsets.
 * This Phase 1 slice deliberately does not lower template internals yet; the
 * template payload remains lossless input for the next parser stage.
 */
export function parseComponent(source, { filename = '<anonymous>.nomos' } = {}) {
  if (typeof source !== 'string') throw new TypeError('source must be a string');

  const lineStarts = buildLineStarts(source);
  const sections = [];
  const diagnostics = [];
  let cursor = 0;
  let scriptCount = 0;

  while (cursor < source.length) {
    const next = findNextSectionStart(source, cursor);

    if (!next) {
      pushTemplate(sections, source, cursor, source.length, lineStarts);
      cursor = source.length;
      break;
    }

    if (next.index > cursor) {
      pushTemplate(sections, source, cursor, next.index, lineStarts);
    }

    const openEnd = findTagEnd(source, next.index);
    if (openEnd === -1) {
      diagnostics.push(createDiagnostic({
        code: 'NOMOS-PARSE-UNCLOSED-SECTION',
        message: `Unclosed top-level <${next.name}> section.`,
        explanation: `The <${next.name}> start tag does not have a closing angle bracket.`,
        repair: `Close the <${next.name}> start tag and add its matching </${next.name}> tag.`,
        source,
        lineStarts,
        start: next.index,
        end: source.length,
        level: 0,
      }));
      pushSection(sections, next.name, source, next.index, source.length, lineStarts, filename);
      break;
    }

    const closeToken = `</${next.name}>`;
    const closeStart = source.indexOf(closeToken, openEnd + 1);
    if (closeStart === -1) {
      diagnostics.push(createDiagnostic({
        code: 'NOMOS-PARSE-UNCLOSED-SECTION',
        message: `Unclosed top-level <${next.name}> section.`,
        explanation: `The <${next.name}> section has no matching ${closeToken}.`,
        repair: `Add ${closeToken} after the section body.`,
        source,
        lineStarts,
        start: next.index,
        end: source.length,
        level: 0,
      }));
      pushSection(sections, next.name, source, next.index, source.length, lineStarts, filename);
      break;
    }

    const end = closeStart + closeToken.length;
    const section = pushSection(sections, next.name, source, next.index, end, lineStarts, filename);

    if (next.name === 'script') {
      scriptCount += 1;
      if (scriptCount > 1) {
        diagnostics.push(createDiagnostic({
          code: 'NOMOS-PARSE-DUPLICATE-SCRIPT',
          message: 'A component may contain only one top-level <script> section.',
          explanation: 'Multiple component scripts make initialization order ambiguous and violate the component grammar.',
          repair: 'Merge the script declarations into the first top-level <script> section.',
          source,
          lineStarts,
          start: section.span.start.offset,
          end: section.span.end.offset,
          level: 0,
        }));
      }
    }

    cursor = end;
  }

  return {
    type: 'Component',
    filename,
    span: spanFor(source, lineStarts, 0, source.length),
    sections,
    diagnostics,
  };
}

function findNextSectionStart(source, from) {
  const elementStack = [];
  const blockStack = [];

  for (let index = from; index < source.length;) {
    if (source.startsWith('<!--', index)) {
      const end = source.indexOf('-->', index + 4);
      index = end === -1 ? source.length : end + 3;
      continue;
    }

    const blockOpen = readStructuralOpen(source, index);
    if (blockOpen) {
      blockStack.push(blockOpen.name);
      index = blockOpen.end;
      continue;
    }

    const blockClose = readStructuralClose(source, index);
    if (blockClose) {
      if (blockStack.at(-1) === blockClose.name) blockStack.pop();
      index = blockClose.end;
      continue;
    }

    if (source[index] === '{') {
      index = skipBraceExpression(source, index);
      continue;
    }

    if (source[index] !== '<') {
      index += 1;
      continue;
    }

    if (source.startsWith('</', index)) {
      const close = readTag(source, index, true);
      if (!close) {
        index += 1;
        continue;
      }
      const top = elementStack.at(-1);
      if (top && top.toLowerCase() === close.name.toLowerCase()) elementStack.pop();
      index = close.end;
      continue;
    }

    if (source.startsWith('<!', index) || source.startsWith('<?', index)) {
      const tagEnd = findTagEnd(source, index);
      index = tagEnd === -1 ? source.length : tagEnd + 1;
      continue;
    }

    const open = readTag(source, index, false);
    if (!open) {
      index += 1;
      continue;
    }

    const lowerName = open.name.toLowerCase();
    if (elementStack.length === 0 && blockStack.length === 0 && SECTION_NAMES.includes(lowerName)) {
      return { index, name: lowerName };
    }

    if (!open.selfClosing && !VOID_HTML_ELEMENTS.has(lowerName)) elementStack.push(open.name);
    index = open.end;
  }

  return null;
}

const VOID_HTML_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function readTag(source, start, closing) {
  const nameStart = start + (closing ? 2 : 1);
  const match = /^[A-Za-z][A-Za-z0-9:._-]*/.exec(source.slice(nameStart));
  if (!match) return null;
  const tagEnd = findTagEnd(source, start);
  if (tagEnd === -1) return null;
  let cursor = tagEnd - 1;
  while (cursor > nameStart && isAsciiWhitespace(source[cursor])) cursor -= 1;
  return {
    name: match[0],
    end: tagEnd + 1,
    selfClosing: !closing && source[cursor] === '/',
  };
}

function readStructuralOpen(source, start) {
  for (const name of ['if', 'each', 'await']) {
    const token = `{#${name}`;
    if (!source.startsWith(token, start)) continue;
    return { name, end: skipBraceExpression(source, start) };
  }
  return null;
}

function readStructuralClose(source, start) {
  for (const name of ['if', 'each', 'await']) {
    const token = `{/${name}}`;
    if (source.startsWith(token, start)) return { name, end: start + token.length };
  }
  return null;
}

function skipBraceExpression(source, start) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }

  return source.length;
}

function findTagEnd(source, start) {
  let quote = null;
  for (let index = start + 1; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '>') {
      return index;
    }
  }
  return -1;
}

function pushTemplate(sections, source, start, end, lineStarts) {
  if (end <= start) return null;
  return pushSection(sections, 'template', source, start, end, lineStarts);
}

function pushSection(sections, kind, source, start, end, lineStarts) {
  const section = {
    kind,
    raw: source.slice(start, end),
    span: spanFor(source, lineStarts, start, end),
  };
  sections.push(section);
  return section;
}

function createDiagnostic({ code, message, explanation, repair, source, lineStarts, start, end, level }) {
  const span = spanFor(source, lineStarts, start, end);
  return {
    code,
    severity: 'error',
    message,
    explanation,
    repair,
    span,
    level,
    docsUrl: `${DOCS_BASE}${code}.md`,
    disableable: false,
    autofix: { safe: false, edits: [] },
    json: { code, severity: 'error', span, level },
    sarif: {
      ruleId: code,
      level: 'error',
      region: {
        startLine: span.start.line,
        startColumn: span.start.column,
        endLine: span.end.line,
        endColumn: span.end.column,
      },
    },
  };
}

function spanFor(source, lineStarts, start, end) {
  return {
    start: positionAt(source, lineStarts, start),
    end: positionAt(source, lineStarts, end),
  };
}

function buildLineStarts(source) {
  const starts = [0];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '\r') {
      if (source[index + 1] === '\n') index += 1;
      starts.push(index + 1);
    } else if (source[index] === '\n') {
      starts.push(index + 1);
    }
  }
  return starts;
}

function positionAt(source, lineStarts, offset) {
  if (!Number.isInteger(offset) || offset < 0 || offset > source.length) {
    throw new RangeError(`offset ${offset} is outside the source`);
  }
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (lineStarts[mid] <= offset) low = mid + 1;
    else high = mid - 1;
  }
  const lineIndex = Math.max(0, high);
  return {
    offset,
    line: lineIndex + 1,
    column: offset - lineStarts[lineIndex] + 1,
  };
}

function isAsciiWhitespace(char) {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '\f';
}
