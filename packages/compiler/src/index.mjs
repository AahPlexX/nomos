import { parseComponent as parseSections } from './parser.mjs';
import { analyzeTemplateSections } from './template-syntax.mjs';

export function parseComponent(source, options) {
  return analyzeTemplateSections(source, parseSections(source, options));
}

export { createIdentitySourceMap } from './source-map.mjs';
