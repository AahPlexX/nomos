import { createDomEffect, ownDom } from './reactivity.mjs';

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
    const value = compute();
    if (boolean) {
      if (value) element.setAttribute(name, '');
      else element.removeAttribute(name);
      return;
    }
    if (value === null || value === undefined) element.removeAttribute(name);
    else element.setAttribute(name, String(value));
  }, options);
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
