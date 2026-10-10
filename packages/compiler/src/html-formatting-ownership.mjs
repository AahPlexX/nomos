const FORMATTING = new Set([
  'a', 'b', 'big', 'code', 'em', 'font', 'i', 'nobr', 's', 'small', 'strike', 'strong', 'tt', 'u',
]);

export function detectFormattingStartTagRewrite(elements, incomingTag) {
  if (!Array.isArray(elements)) throw new TypeError('elements must be an array');
  if (typeof incomingTag !== 'string') throw new TypeError('incomingTag must be a string');

  const incoming = incomingTag.toLowerCase();
  if (incoming !== 'a' && incoming !== 'nobr') return null;

  const found = lastIndex(elements, (name) => String(name).toLowerCase() === incoming);
  if (found < 0) return null;

  return {
    kind: 'implicit-close',
    closes: [incoming],
    reason: incoming === 'a' ? 'nested-anchor' : 'nested-nobr',
  };
}

export function detectFormattingEndTagRewrite(elements, closingTag) {
  if (!Array.isArray(elements)) throw new TypeError('elements must be an array');
  if (typeof closingTag !== 'string') throw new TypeError('closingTag must be a string');

  const closing = closingTag.toLowerCase();
  if (!FORMATTING.has(closing)) return null;

  const found = lastIndex(elements, (name) => String(name).toLowerCase() === closing);
  if (found < 0 || found === elements.length - 1) return null;

  return {
    kind: 'adoption-agency',
    formatting: closing,
    current: String(elements.at(-1)).toLowerCase(),
  };
}

export function isFormattingElement(tagName) {
  return typeof tagName === 'string' && FORMATTING.has(tagName.toLowerCase());
}

function lastIndex(list, predicate) {
  for (let index = list.length - 1; index >= 0; index -= 1) {
    if (predicate(list[index])) return index;
  }
  return -1;
}
