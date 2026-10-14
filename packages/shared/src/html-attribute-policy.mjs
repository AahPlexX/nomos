const BOOLEAN_HTML_ATTRIBUTE_NAMES = [
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls',
  'default', 'defer', 'disabled', 'formnovalidate', 'inert', 'ismap', 'itemscope',
  'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline',
  'readonly', 'required', 'reversed', 'selected',
];
const GUARDED_DYNAMIC_URL_ATTRIBUTE_NAMES = [
  'action', 'cite', 'formaction', 'href', 'poster', 'src',
];

const BOOLEAN_HTML_ATTRIBUTES = new Set(BOOLEAN_HTML_ATTRIBUTE_NAMES);
const GUARDED_DYNAMIC_URL_ATTRIBUTES = new Set(GUARDED_DYNAMIC_URL_ATTRIBUTE_NAMES);

export function normalizeHtmlAttributeName(name) {
  const value = String(name);
  let normalized = '';
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    normalized += code >= 0x41 && code <= 0x5a ? String.fromCharCode(code + 0x20) : value[index];
  }
  return normalized;
}

export function isBooleanHtmlAttribute(name) {
  return BOOLEAN_HTML_ATTRIBUTES.has(normalizeHtmlAttributeName(name));
}

export function isGuardedDynamicUrlAttribute(name) {
  return GUARDED_DYNAMIC_URL_ATTRIBUTES.has(normalizeHtmlAttributeName(name));
}

export function isInlineEventHtmlAttribute(name) {
  return normalizeHtmlAttributeName(name).startsWith('on');
}

export function assertSafeSpreadHtmlAttributeName(name) {
  const normalized = normalizeHtmlAttributeName(name);
  if (isInlineEventHtmlAttribute(normalized)) {
    throw new Error(`Spread attribute ${JSON.stringify(normalized)} is blocked. Use an on: directive for browser events.`);
  }
  if (isGuardedDynamicUrlAttribute(normalized)) {
    throw new Error(`Spread attribute ${JSON.stringify(normalized)} is blocked until the dynamic URL protocol validator is implemented.`);
  }
  return normalized;
}
