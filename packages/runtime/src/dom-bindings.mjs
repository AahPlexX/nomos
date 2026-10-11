import { createDomEffect } from './reactivity.mjs';

export function bindText(node, compute, options = {}) {
  if (!node || (typeof node !== 'object' && typeof node !== 'function') || !('textContent' in node)) {
    throw new TypeError('bindText requires a text-capable node');
  }
  if (typeof compute !== 'function') throw new TypeError('bindText compute must be a function');
  return createDomEffect(() => {
    node.textContent = compute();
  }, options);
}
