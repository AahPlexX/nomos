const BOOLEAN_HTML_ATTRIBUTE_NAMES = [
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls',
  'default', 'defer', 'disabled', 'formnovalidate', 'inert', 'ismap', 'itemscope',
  'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline',
  'readonly', 'required', 'reversed', 'selected',
];
const GUARDED_DYNAMIC_URL_ATTRIBUTE_NAMES = [
  'action', 'cite', 'formaction', 'href', 'poster', 'src',
];
const INPUT_VALUE_MODE_TYPES = Object.freeze([
  'text', 'search', 'tel', 'url', 'email', 'password', 'date', 'month', 'week',
  'time', 'datetime-local', 'number', 'range', 'color',
]);
const INPUT_KNOWN_TYPES = new Set([
  'hidden', ...INPUT_VALUE_MODE_TYPES, 'checkbox', 'radio', 'file', 'submit', 'image',
  'reset', 'button',
]);

function freezeAssignment(entry) {
  return Object.freeze({
    ...entry,
    bindings: Object.freeze([...entry.bindings]),
    ...(entry.inputTypes ? { inputTypes: Object.freeze([...entry.inputTypes]) } : {}),
  });
}

export const STANDARD_HTML_PROPERTY_ASSIGNMENTS = Object.freeze([
  freezeAssignment({
    element: 'input', sourceName: 'value', property: 'value', authoredDynamic: 'property',
    bindings: ['value'], semantics: 'current-value', inputTypes: INPUT_VALUE_MODE_TYPES,
  }),
  freezeAssignment({
    element: 'input', sourceName: 'checked', property: 'checked', authoredDynamic: 'property',
    bindings: ['checked', 'group'], semantics: 'current-checkedness', inputTypes: ['checkbox', 'radio'],
  }),
  freezeAssignment({
    element: 'input', sourceName: 'files', property: 'files', authoredDynamic: 'binding-only',
    bindings: ['files'], semantics: 'current-file-list', inputTypes: ['file'],
  }),
  freezeAssignment({
    element: 'textarea', sourceName: 'value', property: 'value', authoredDynamic: 'property',
    bindings: ['value'], semantics: 'current-value',
  }),
  freezeAssignment({
    element: 'select', sourceName: 'value', property: 'value', authoredDynamic: 'property',
    bindings: ['value'], semantics: 'current-selection',
  }),
  freezeAssignment({
    element: 'option', sourceName: 'selected', property: 'selected', authoredDynamic: 'property',
    bindings: [], semantics: 'current-selectedness',
  }),
  freezeAssignment({
    element: 'output', sourceName: 'value', property: 'value', authoredDynamic: 'property',
    bindings: [], semantics: 'current-value',
  }),
  freezeAssignment({
    element: 'audio', sourceName: 'muted', property: 'muted', authoredDynamic: 'property',
    bindings: [], semantics: 'current-muted-state',
  }),
  freezeAssignment({
    element: 'video', sourceName: 'muted', property: 'muted', authoredDynamic: 'property',
    bindings: [], semantics: 'current-muted-state',
  }),
  freezeAssignment({
    element: 'details', sourceName: 'open', property: 'open', authoredDynamic: 'attribute',
    bindings: ['open'], semantics: 'reflected-open-state',
  }),
  freezeAssignment({
    element: 'dialog', sourceName: 'open', property: 'open', authoredDynamic: 'attribute',
    bindings: ['open'], semantics: 'reflected-open-state',
  }),
]);

export function resolveStandardHtmlPropertyAssignment(elementName, sourceName, { inputType } = {}) {
  const element = normalizeHtmlAttributeName(elementName);
  const source = normalizeHtmlAttributeName(sourceName);
  const normalizedInputType = element === 'input' ? normalizeInputType(inputType) : null;

  const entry = STANDARD_HTML_PROPERTY_ASSIGNMENTS.find((candidate) => {
    if (candidate.element !== element || candidate.sourceName !== source) return false;
    return !candidate.inputTypes || candidate.inputTypes.includes(normalizedInputType);
  });
  if (!entry) return null;
  return {
    element: entry.element,
    sourceName: entry.sourceName,
    property: entry.property,
    authoredDynamic: entry.authoredDynamic,
    bindings: [...entry.bindings],
    semantics: entry.semantics,
  };
}

function normalizeInputType(inputType) {
  if (inputType === null || inputType === undefined || inputType === '') return 'text';
  const normalized = normalizeHtmlAttributeName(inputType);
  return INPUT_KNOWN_TYPES.has(normalized) ? normalized : 'text';
}

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
