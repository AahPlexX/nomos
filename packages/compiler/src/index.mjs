import { parseComponent as parseSections } from './parser.mjs';
import { analyzeTemplateSections } from './template-syntax.mjs';
import { attachTemplateAsts } from './template-ast.mjs';

export function parseComponent(source, options) {
  const parsed = parseSections(source, options);
  analyzeTemplateSections(source, parsed);
  return attachTemplateAsts(source, parsed);
}

export { buildTemplateAst } from './template-ast.mjs';
export { createIdentitySourceMap } from './source-map.mjs';
