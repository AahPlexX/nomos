const TABLE_SECTIONS = new Set(['tbody', 'thead', 'tfoot']);
const TABLE_CELLS = new Set(['td', 'th']);

export function detectTableStartTagRewrite(elements, incomingTag) {
  if (!Array.isArray(elements)) throw new TypeError('elements must be an array');
  if (typeof incomingTag !== 'string') throw new TypeError('incomingTag must be a string');

  const incoming = incomingTag.toLowerCase();
  if (!['tr', 'td', 'th'].includes(incoming)) return null;

  const stack = elements.map((name) => String(name).toLowerCase());
  const tableIndex = lastIndex(stack, (name) => name === 'table');
  if (tableIndex < 0) return null;
  const context = stack.slice(tableIndex + 1);

  const openCell = lastValue(context, (name) => TABLE_CELLS.has(name));
  const hasRow = context.includes('tr');
  const hasSection = context.some((name) => TABLE_SECTIONS.has(name));

  if (TABLE_CELLS.has(incoming)) {
    if (openCell) return { kind: 'implicit-close', wrappers: [], closes: [openCell] };
    if (hasRow) return null;
    if (hasSection) return { kind: 'implied-wrapper', wrappers: ['tr'], closes: [] };
    return { kind: 'implied-wrapper', wrappers: ['tbody', 'tr'], closes: [] };
  }

  if (incoming === 'tr') {
    if (openCell) return { kind: 'implicit-close', wrappers: [], closes: [openCell, 'tr'] };
    if (hasRow) return { kind: 'implicit-close', wrappers: [], closes: ['tr'] };
    if (!hasSection) return { kind: 'implied-wrapper', wrappers: ['tbody'], closes: [] };
  }

  return null;
}

function lastIndex(list, predicate) {
  for (let index = list.length - 1; index >= 0; index -= 1) if (predicate(list[index])) return index;
  return -1;
}

function lastValue(list, predicate) {
  const index = lastIndex(list, predicate);
  return index < 0 ? null : list[index];
}
