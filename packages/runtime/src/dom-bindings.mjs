import { createDomEffect, ownDom } from './reactivity.mjs';
import {
  assertSafeSpreadHtmlAttributeName,
  isBooleanHtmlAttribute,
  normalizeHtmlAttributeName,
} from '../../shared/src/html-attribute-policy.mjs';

const TRUSTED_TYPES_POLICY = Symbol.for('nomos.trusted-types-policy');

export function bindText(node, compute, options = {}) {
  if (!node || (typeof node !== 'object' && typeof node !== 'function') || !('textContent' in node)) {
    throw new TypeError('bindText requires a text-capable node');
  }
  if (typeof compute !== 'function') throw new TypeError('bindText compute must be a function');
  return createDomEffect(() => {
    node.textContent = compute();
  }, options);
}

export function bindAttribute(element, name, compute, options = {}) {
  if (!element || typeof element.setAttribute !== 'function' || typeof element.removeAttribute !== 'function') {
    throw new TypeError('bindAttribute requires an attribute-capable element');
  }
  if (typeof name !== 'string' || name.length === 0) throw new TypeError('bindAttribute name must be a non-empty string');
  if (typeof compute !== 'function') throw new TypeError('bindAttribute compute must be a function');
  const boolean = options.boolean === true;

  return createDomEffect(() => {
    applyAttributeValue(element, name, compute(), boolean);
  }, options);
}

export function bindAttributes(element, plan, options = {}) {
  if (!element || typeof element.setAttribute !== 'function' || typeof element.removeAttribute !== 'function' || typeof element.getAttribute !== 'function' || typeof element.hasAttribute !== 'function') {
    throw new TypeError('bindAttributes requires an attribute-capable element');
  }
  if (!Array.isArray(plan)) throw new TypeError('bindAttributes plan must be an array');

  const normalizedPlan = plan.map((entry, index) => normalizePlanEntry(element, entry, index));
  let previousManaged = new Set();

  return createDomEffect(() => {
    const desired = new Map();

    for (const entry of normalizedPlan) {
      if (entry.kind === 'static') {
        desired.set(entry.name, entry.baseline);
        continue;
      }
      if (entry.kind === 'value') {
        desired.set(entry.name, attributeAction(entry.name, entry.compute()));
        continue;
      }

      const source = entry.compute();
      if (source === null || source === undefined) continue;
      const object = Object(source);
      for (const key of Object.keys(object)) {
        const name = assertSafeSpreadHtmlAttributeName(key);
        desired.set(name, attributeAction(name, object[key]));
      }
    }

    const nextManaged = new Set(desired.keys());
    for (const name of previousManaged) {
      if (!nextManaged.has(name)) element.removeAttribute(name);
    }
    for (const [name, action] of desired) applyAttributeAction(element, name, action);
    previousManaged = nextManaged;
  }, options);
}

function normalizePlanEntry(element, entry, index) {
  if (!entry || typeof entry !== 'object') throw new TypeError(`bindAttributes plan entry ${index} must be an object`);
  if (entry.kind === 'spread') {
    if (typeof entry.compute !== 'function') throw new TypeError(`bindAttributes spread entry ${index} compute must be a function`);
    return { kind: 'spread', compute: entry.compute };
  }
  if (entry.kind !== 'static' && entry.kind !== 'value') throw new TypeError(`bindAttributes plan entry ${index} has unsupported kind`);
  if (typeof entry.name !== 'string' || entry.name.length === 0) throw new TypeError(`bindAttributes plan entry ${index} name must be a non-empty string`);
  const name = normalizeHtmlAttributeName(entry.name);
  if (entry.kind === 'static') {
    return {
      kind: 'static',
      name,
      baseline: element.hasAttribute(name)
        ? { present: true, value: element.getAttribute(name) ?? '' }
        : { present: false, value: null },
    };
  }
  if (typeof entry.compute !== 'function') throw new TypeError(`bindAttributes value entry ${index} compute must be a function`);
  return { kind: 'value', name, compute: entry.compute };
}

function attributeAction(name, value) {
  if (isBooleanHtmlAttribute(name)) return value ? { present: true, value: '' } : { present: false, value: null };
  return value === null || value === undefined
    ? { present: false, value: null }
    : { present: true, value: String(value) };
}

function applyAttributeValue(element, name, value, boolean) {
  if (boolean) {
    if (value) element.setAttribute(name, '');
    else element.removeAttribute(name);
    return;
  }
  if (value === null || value === undefined) element.removeAttribute(name);
  else element.setAttribute(name, String(value));
}

function applyAttributeAction(element, name, action) {
  if (action.present) element.setAttribute(name, action.value ?? '');
  else element.removeAttribute(name);
}

export function mountTemplate(target, html, {
  markerPrefix = 'nomos:text:',
  markerCount = 0,
  elementMarkerAttribute = null,
  elementCount = 0,
} = {}) {
  if (!target || typeof target.appendChild !== 'function') throw new TypeError('mountTemplate target must support appendChild');
  if (typeof html !== 'string') throw new TypeError('mountTemplate html must be a string');
  if (typeof markerPrefix !== 'string' || markerPrefix.length === 0) throw new TypeError('mountTemplate markerPrefix must be a non-empty string');
  if (!Number.isInteger(markerCount) || markerCount < 0) throw new RangeError('mountTemplate markerCount must be a non-negative integer');
  if (!Number.isInteger(elementCount) || elementCount < 0) throw new RangeError('mountTemplate elementCount must be a non-negative integer');
  if (elementCount > 0 && (typeof elementMarkerAttribute !== 'string' || elementMarkerAttribute.length === 0)) {
    throw new TypeError('mountTemplate elementMarkerAttribute must be a non-empty string when elementCount is non-zero');
  }

  const document = ownerDocumentFor(target);
  const template = document.createElement('template');
  if (!template?.content || typeof template.content.cloneNode !== 'function') throw new Error('mountTemplate requires HTMLTemplateElement content support');

  template.innerHTML = trustedStaticHtml(document, html);
  const fragment = template.content.cloneNode(true);
  const bindings = new Array(markerCount);
  collectTextMarkers(fragment, document, markerPrefix, bindings, markerCount);
  for (let index = 0; index < markerCount; index += 1) {
    if (!bindings[index]) throw new Error(`Nomos text marker ${index} was not materialized by the browser parser.`);
  }

  const elements = new Array(elementCount);
  if (elementCount > 0) collectElementMarkers(fragment, elementMarkerAttribute, elements, elementCount);
  for (let index = 0; index < elementCount; index += 1) {
    if (!elements[index]) throw new Error(`Nomos element marker ${index} was not materialized by the browser parser.`);
  }

  const roots = Array.from(fragment.childNodes ?? []);
  for (const root of roots) ownDom(() => { if (root.parentNode) root.parentNode.removeChild(root); });
  target.appendChild(fragment);
  return { roots, bindings, elements };
}

function ownerDocumentFor(target) {
  if (target.nodeType === 9 && typeof target.createElement === 'function') return target;
  const document = target.ownerDocument;
  if (!document || typeof document.createElement !== 'function' || typeof document.createTextNode !== 'function') {
    throw new TypeError('mountTemplate target must belong to a Document');
  }
  return document;
}

function trustedStaticHtml(document, html) {
  const realm = document.defaultView;
  const trustedTypes = realm?.trustedTypes;
  if (!trustedTypes) return html;
  let policy = realm[TRUSTED_TYPES_POLICY];
  if (!policy) {
    try { policy = trustedTypes.createPolicy('nomos', { createHTML: (value) => value }); }
    catch (error) { throw new Error('Nomos could not create Trusted Types policy "nomos". The host CSP must allow that policy name.', { cause: error }); }
    Object.defineProperty(realm, TRUSTED_TYPES_POLICY, { configurable: false, enumerable: false, writable: false, value: policy });
  }
  if (!policy || typeof policy.createHTML !== 'function') throw new Error('Nomos Trusted Types policy cache is invalid.');
  return policy.createHTML(html);
}

function collectTextMarkers(root, document, markerPrefix, bindings, markerCount) {
  for (const child of Array.from(root.childNodes ?? [])) {
    if (child.nodeType === 8 && typeof child.data === 'string' && child.data.startsWith(markerPrefix)) {
      const suffix = child.data.slice(markerPrefix.length);
      if (/^(0|[1-9][0-9]*)$/.test(suffix)) {
        const index = Number(suffix);
        if (index >= markerCount) throw new Error(`Unexpected Nomos text marker ${index}; expected ${markerCount} marker(s).`);
        if (bindings[index]) throw new Error(`Duplicate Nomos text marker ${index}.`);
        const text = document.createTextNode('');
        child.parentNode.replaceChild(text, child);
        bindings[index] = text;
        continue;
      }
    }
    if (child.content?.nodeType === 11) collectTextMarkers(child.content, document, markerPrefix, bindings, markerCount);
    collectTextMarkers(child, document, markerPrefix, bindings, markerCount);
  }
}

function collectElementMarkers(root, markerAttribute, elements, elementCount) {
  for (const child of Array.from(root.childNodes ?? [])) {
    if (child.nodeType === 1 && typeof child.getAttribute === 'function') {
      const raw = child.getAttribute(markerAttribute);
      if (raw !== null && /^(0|[1-9][0-9]*)$/.test(raw)) {
        const index = Number(raw);
        if (index >= elementCount) throw new Error(`Unexpected Nomos element marker ${index}; expected ${elementCount} marker(s).`);
        if (elements[index]) throw new Error(`Duplicate Nomos element marker ${index}.`);
        child.removeAttribute(markerAttribute);
        elements[index] = child;
      }
    }
    collectElementMarkers(child, markerAttribute, elements, elementCount);
  }
}
