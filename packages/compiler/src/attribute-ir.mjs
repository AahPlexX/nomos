const DIRECTIVE_PREFIXES = new Set(['on', 'bind', 'use', 'let']);

/**
 * Parse the attributes owned by one already-identified element start tag.
 * This is durable Nomos IR: values remain raw source text and all spans point
 * into the original .nomos source. Directives stay on Element.directives.
 */
export function parseElementAttributes(source, openSpan, tagName, lineStarts = buildLineStarts(source)) {
  if (typeof source !== 'string') throw new TypeError('source must be a string');
  if (!openSpan?.start || !openSpan?.end) throw new TypeError('openSpan must contain start/end positions');
  if (typeof tagName !== 'string' || tagName.length === 0) throw new TypeError('tagName is required');

  const attributes = [];
  let index = openSpan.start.offset + 1 + tagName.length;
  const end = openSpan.end.offset - 1;

  while (index < end) {
    while (index < end && isWhitespace(source[index])) index += 1;
    if (index >= end || source[index] === '/') break;

    if (source[index] === '{') {
      const braceEnd = scanBraceEnd(source, index, end);
      const prefix = source.startsWith('{...', index) ? 'spread' : 'shorthand';
      const bodyStart = prefix === 'spread' ? index + 4 : index + 1;
      const bodyEnd = Math.max(bodyStart, braceEnd - 1);
      const raw = source.slice(bodyStart, bodyEnd).trim();
      const leading = source.slice(bodyStart, bodyEnd).indexOf(raw);
      const exactBodyStart = raw.length === 0 ? bodyStart : bodyStart + Math.max(0, leading);
      const exactBodyEnd = exactBodyStart + raw.length;
      attributes.push({
        type: 'Attribute',
        kind: prefix,
        name: prefix === 'shorthand' ? raw : null,
        span: makeSpan(lineStarts, index, braceEnd),
        nameSpan: prefix === 'shorthand' ? makeSpan(lineStarts, exactBodyStart, exactBodyEnd) : null,
        expression: expressionRecord(source, lineStarts, index, braceEnd, exactBodyStart, exactBodyEnd),
      });
      index = braceEnd;
      continue;
    }

    const attributeStart = index;
    while (index < end && !isWhitespace(source[index]) && !['=', '>', '/'].includes(source[index])) index += 1;
    const nameEnd = index;
    const name = source.slice(attributeStart, nameEnd);
    if (!name) {
      index += 1;
      continue;
    }

    while (index < end && isWhitespace(source[index])) index += 1;
    const hasEquals = source[index] === '=';
    if (!hasEquals) {
      if (!isDirectiveName(name)) {
        attributes.push({
          type: 'Attribute', kind: 'static', name,
          span: makeSpan(lineStarts, attributeStart, nameEnd),
          nameSpan: makeSpan(lineStarts, attributeStart, nameEnd),
          value: null, rawValue: null, valueSpan: null, quote: null,
        });
      }
      continue;
    }

    index += 1;
    while (index < end && isWhitespace(source[index])) index += 1;
    const valueStart = index;
    let valueEnd;

    if (source[index] === '"' || source[index] === "'") {
      const quote = source[index];
      const close = scanQuotedEnd(source, index, end, quote);
      valueEnd = close;
      if (!isDirectiveName(name)) {
        const contentStart = valueStart + 1;
        const contentEnd = Math.max(contentStart, valueEnd - 1);
        const parts = parseMixedParts(source, lineStarts, contentStart, contentEnd);
        if (parts.some((part) => part.type === 'ExpressionPart')) {
          attributes.push({
            type: 'Attribute', kind: 'mixed', name, quote,
            span: makeSpan(lineStarts, attributeStart, valueEnd),
            nameSpan: makeSpan(lineStarts, attributeStart, nameEnd),
            valueSpan: makeSpan(lineStarts, valueStart, valueEnd),
            parts,
          });
        } else {
          attributes.push({
            type: 'Attribute', kind: 'static', name, quote,
            span: makeSpan(lineStarts, attributeStart, valueEnd),
            nameSpan: makeSpan(lineStarts, attributeStart, nameEnd),
            value: source.slice(contentStart, contentEnd),
            rawValue: source.slice(contentStart, contentEnd),
            valueSpan: makeSpan(lineStarts, valueStart, valueEnd),
          });
        }
      }
      index = valueEnd;
      continue;
    }

    if (source[index] === '{') {
      valueEnd = scanBraceEnd(source, index, end);
      if (!isDirectiveName(name)) {
        const bodyStart = index + 1;
        const bodyEnd = Math.max(bodyStart, valueEnd - 1);
        attributes.push({
          type: 'Attribute', kind: 'dynamic', name,
          span: makeSpan(lineStarts, attributeStart, valueEnd),
          nameSpan: makeSpan(lineStarts, attributeStart, nameEnd),
          valueSpan: makeSpan(lineStarts, valueStart, valueEnd),
          expression: expressionRecord(source, lineStarts, index, valueEnd, bodyStart, bodyEnd),
        });
      }
      index = valueEnd;
      continue;
    }

    while (index < end && !isWhitespace(source[index]) && source[index] !== '>') index += 1;
    valueEnd = index;
    if (!isDirectiveName(name)) {
      attributes.push({
        type: 'Attribute', kind: 'static', name, quote: null,
        span: makeSpan(lineStarts, attributeStart, valueEnd),
        nameSpan: makeSpan(lineStarts, attributeStart, nameEnd),
        value: source.slice(valueStart, valueEnd),
        rawValue: source.slice(valueStart, valueEnd),
        valueSpan: makeSpan(lineStarts, valueStart, valueEnd),
      });
    }
  }

  return attributes;
}

function parseMixedParts(source, lineStarts, start, end) {
  const parts = [];
  let cursor = start;
  while (cursor < end) {
    const brace = source.indexOf('{', cursor);
    if (brace < 0 || brace >= end) {
      if (cursor < end) parts.push(textPart(source, lineStarts, cursor, end));
      break;
    }
    if (brace > cursor) parts.push(textPart(source, lineStarts, cursor, brace));
    const braceEnd = scanBraceEnd(source, brace, end);
    const bodyStart = brace + 1;
    const bodyEnd = Math.max(bodyStart, braceEnd - 1);
    parts.push({
      type: 'ExpressionPart',
      raw: source.slice(bodyStart, bodyEnd),
      span: makeSpan(lineStarts, brace, braceEnd),
      bodySpan: makeSpan(lineStarts, bodyStart, bodyEnd),
    });
    cursor = braceEnd;
  }
  if (start === end) return [{ type: 'TextPart', raw: '', span: makeSpan(lineStarts, start, end) }];
  return parts;
}

function textPart(source, lineStarts, start, end) {
  return { type: 'TextPart', raw: source.slice(start, end), span: makeSpan(lineStarts, start, end) };
}

function expressionRecord(source, lineStarts, outerStart, outerEnd, bodyStart, bodyEnd) {
  return {
    raw: source.slice(bodyStart, bodyEnd),
    span: makeSpan(lineStarts, outerStart, outerEnd),
    bodySpan: makeSpan(lineStarts, bodyStart, bodyEnd),
  };
}

function scanQuotedEnd(source, start, limit, quote) {
  let escaped = false;
  for (let index = start + 1; index < limit; index += 1) {
    const char = source[index];
    if (escaped) { escaped = false; continue; }
    if (char === '\\') { escaped = true; continue; }
    if (char === quote) return index + 1;
  }
  return limit;
}

function scanBraceEnd(source, start, limit) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = start; index < limit; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === '\n' || char === '\r') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') { blockComment = false; index += 1; }
      continue;
    }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (char === '\\') { escaped = true; continue; }
      if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') { lineComment = true; index += 1; continue; }
    if (char === '/' && next === '*') { blockComment = true; index += 1; continue; }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }
  return limit;
}

function isDirectiveName(name) {
  const colon = name.indexOf(':');
  return colon > 0 && DIRECTIVE_PREFIXES.has(name.slice(0, colon));
}

function isWhitespace(char) {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '\f';
}

function buildLineStarts(source) {
  const starts = [0];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '\r') {
      if (source[index + 1] === '\n') index += 1;
      starts.push(index + 1);
    } else if (source[index] === '\n') starts.push(index + 1);
  }
  return starts;
}

function makeSpan(lineStarts, start, end) {
  return { start: position(lineStarts, start), end: position(lineStarts, end) };
}

function position(lineStarts, offset) {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (lineStarts[mid] <= offset) low = mid + 1;
    else high = mid - 1;
  }
  const lineIndex = Math.max(0, high);
  return { offset, line: lineIndex + 1, column: offset - lineStarts[lineIndex] + 1 };
}
