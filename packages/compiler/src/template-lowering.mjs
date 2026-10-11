import ts from '@typescript/typescript6';
import { createEmbeddedExpression, lowerEmbeddedExpression } from './expression-lowering.mjs';
import { createSourceMapFromDecodedMappings } from './source-map.mjs';

export function lowerTemplateTextBindings(source, component, { script = null, filename = component?.filename ?? 'component.nomos' } = {}) {
  if (typeof source !== 'string') throw new TypeError('source must be a string');
  if (!component || component.type !== 'Component') throw new TypeError('component must be a parsed Component');

  const interpolationNodes = [];
  for (const section of component.sections ?? []) {
    if (section.kind === 'template' && section.ast) collectInterpolations(section.ast, interpolationNodes);
  }

  const embedded = interpolationNodes.map((node) => createEmbeddedExpression(source, node, filename));
  const used = collectUsedIdentifiers(script?.embedded?.raw ?? '', false);
  for (const expression of embedded) {
    for (const name of collectUsedIdentifiers(expression.raw, true)) used.add(name);
  }

  const bindTextLocal = uniqueName('__n_bindText', used);
  const readLocal = uniqueName('__n_read', used);
  const bindings = [];
  const diagnostics = [];
  const reactiveBindings = script?.bindings ?? [];

  for (const [index, expression] of embedded.entries()) {
    const lowered = lowerEmbeddedExpression(expression, {
      bindings: reactiveBindings,
      helperName: readLocal,
      source,
    });
    diagnostics.push(...lowered.diagnostics);
    if (lowered.diagnostics.length > 0 || lowered.code == null) continue;

    const nodeIdentifier = uniqueName(`__n_text_${index}`, used);
    const id = `text-${index}`;
    const setupCode = `${bindTextLocal}(${nodeIdentifier}, () => (${lowered.code}), { name: ${JSON.stringify(id)} });`;
    const generatedColumn = setupCode.indexOf(lowered.code);
    const decodedMappings = [{
      generated: { line: 0, column: generatedColumn },
      original: {
        source: filename,
        line: expression.bodySpan.start.line - 1,
        column: expression.bodySpan.start.column - 1,
      },
    }];
    const map = createSourceMapFromDecodedMappings(decodedMappings, {
      generatedFile: `${filename}.${id}.js`,
      sourceContents: { [filename]: source },
    });

    bindings.push({
      type: 'TextBinding',
      id,
      nodeIdentifier,
      runtimeHelper: 'bindText',
      expression,
      expressionCode: lowered.code,
      reactiveReadCount: lowered.reactiveReadCount,
      setupCode,
      decodedMappings,
      map,
    });
  }

  const runtimeImports = [];
  if (bindings.length > 0) {
    runtimeImports.push({ imported: 'bindText', local: bindTextLocal });
    if (bindings.some((binding) => binding.reactiveReadCount > 0)) {
      runtimeImports.push({ imported: 'read', local: readLocal });
    }
  }

  return {
    type: 'TemplateTextLowering',
    bindings,
    diagnostics,
    runtimeModule: 'nomos/internal/runtime',
    runtimeImports,
    typescriptVersion: ts.version,
  };
}

function collectInterpolations(node, out) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'Interpolation') out.push(node);
  for (const child of node.children ?? []) collectInterpolations(child, out);
  for (const branch of node.branches ?? []) collectInterpolations(branch, out);
}

function collectUsedIdentifiers(source, asExpression) {
  const text = asExpression ? `const __nomos_used = (${source});` : source;
  const file = ts.createSourceFile('nomos-used.ts', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const used = new Set();
  const visit = (node) => {
    if (ts.isIdentifier(node)) used.add(node.text);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return used;
}

function uniqueName(base, used) {
  let name = base;
  let suffix = 1;
  while (used.has(name)) name = `${base}_${suffix++}`;
  used.add(name);
  return name;
}
