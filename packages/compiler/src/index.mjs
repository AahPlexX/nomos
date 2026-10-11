import { parseComponent as parseSections } from './parser.mjs';
import { analyzeTemplateSections } from './template-syntax.mjs';
import { validateTableStructure } from './table-structure-validation.mjs';
import { validateFormattingStructure } from './formatting-structure-validation.mjs';
import { attachTemplateAsts } from './template-ast.mjs';

export function parseComponent(source, options) {
  const parsed = parseSections(source, options);
  analyzeTemplateSections(source, parsed);
  validateTableStructure(parsed);
  validateFormattingStructure(parsed);
  return attachTemplateAsts(source, parsed);
}

export { buildTemplateAst } from './template-ast.mjs';
export { detectTableStartTagRewrite } from './html-table-ownership.mjs';
export { validateTableStructure } from './table-structure-validation.mjs';
export {
  detectFormattingEndTagRewrite,
  detectFormattingStartTagRewrite,
  isFormattingElement,
} from './html-formatting-ownership.mjs';
export { validateFormattingStructure } from './formatting-structure-validation.mjs';
export {
  createEmbeddedScript,
  lowerComponentScript,
  lowerScript,
} from './script-lowering.mjs';
export {
  composeDecodedMappings,
  createIdentitySourceMap,
  createSourceMapFromDecodedMappings,
  validateDecodedMappings,
} from './source-map.mjs';
