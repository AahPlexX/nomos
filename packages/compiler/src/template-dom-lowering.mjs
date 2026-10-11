import { lowerTemplateTextBindings } from './template-lowering.mjs';
import { createSourceMapFromDecodedMappings } from './source-map.mjs';

const MARKER_BASE = 'nomos:text:';
const UNSAFE_INTERPOLATION_ANCESTORS = new Set([
  'iframe', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style',
  'template', 'textarea', 'title', 'xmp',
]);

export function lowerTemplateDom(source, component, {
  script = null,
  filename = component?.filename ?? 'component.nomos',
  targetIdentifier = 'target',
} = {}) {
  if (typeof source !== 'string') throw new TypeError('source must be a string');
  if (!component || component.type !== 'Component') throw new TypeError('component must be a parsed Component');
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(targetIdentifier)) {
    throw new TypeError('targetIdentifier must be a simple JavaScript identifier');
  }

  const unsupported = collectUnsupportedTemplateFeatures(source, component);
  if (unsupported.length > 0) return failedResult(filename, targetIdentifier, unsupported);

  const text = lowerTemplateTextBindings(source, component, { script, filename });
  if (text.diagnostics.length > 0) {
    return failedResult(filename, targetIdentifier, text.diagnostics, text.bindings);
  }

  const markerPrefix = collisionFreeMarkerPrefix(source);
  const staticHtml = buildStaticHtml(source, component, text.bindings, markerPrefix);
  const used = collectReservedAsciiNames(source);
  for (const entry of text.runtimeImports) used.add(entry.local);
  for (const binding of text.bindings) used.add(binding.nodeIdentifier);
  used.add(targetIdentifier);

  const mountTemplateLocal = uniqueName('__n_mountTemplate', used);
  const viewIdentifier = uniqueName('__n_view', used);
  const runtimeImports = [
    { imported: 'mountTemplate', local: mountTemplateLocal },
    ...text.runtimeImports,
  ];

  const lines = [];
  const decodedMappings = [];
  const firstTemplate = (component.sections ?? []).find((section) => section.kind === 'template');
  const mountLine = `const ${viewIdentifier} = ${mountTemplateLocal}(${targetIdentifier}, ${JSON.stringify(staticHtml)}, { markerPrefix: ${JSON.stringify(markerPrefix)}, markerCount: ${text.bindings.length} });`;
  lines.push(mountLine);
  decodedMappings.push({
    generated: { line: 0, column: 0 },
    original: firstTemplate ? originalPosition(filename, firstTemplate.span.start) : null,
  });

  for (const [index, binding] of text.bindings.entries()) {
    const declarationLine = lines.length;
    lines.push(`const ${binding.nodeIdentifier} = ${viewIdentifier}.bindings[${index}];`);
    decodedMappings.push({
      generated: { line: declarationLine, column: 0 },
      original: originalPosition(filename, binding.expression.span.start),
    });

    const setupLine = lines.length;
    lines.push(binding.setupCode);
    decodedMappings.push({
      generated: { line: setupLine, column: 0 },
      original: originalPosition(filename, binding.expression.span.start),
    });
    for (const mapping of binding.decodedMappings) {
      decodedMappings.push({
        generated: { line: setupLine + mapping.generated.line, column: mapping.generated.column },
        original: mapping.original ? { ...mapping.original } : null,
        ...(mapping.name === undefined ? {} : { name: mapping.name }),
      });
    }
  }

  const code = lines.join('\n');
  const map = createSourceMapFromDecodedMappings(decodedMappings, {
    generatedFile: `${filename}.template.js`,
    sourceContents: { [filename]: source },
  });

  return {
    type: 'TemplateDomLowering',
    code,
    map,
    decodedMappings,
    staticHtml,
    markerPrefix,
    markerCount: text.bindings.length,
    bindings: text.bindings,
    diagnostics: [],
    runtimeModule: text.runtimeModule,
    runtimeImports,
    targetIdentifier,
    viewIdentifier,
  };
}

function collectUnsupportedTemplateFeatures(source, component) {
  const diagnostics = [];
  for (const section of component.sections ?? []) {
    if (section.kind !== 'template' || !section.ast) continue;
    visit(section.ast, []);
  }
  return diagnostics;

  function visit(node, ancestors) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'Element') {
      if (node.category === 'component') {
        diagnostics.push(unsupportedDiagnostic('component', node.span, `Component <${node.name}> lowering is not part of the static DOM slice.`));
      }
      if (node.directives?.length) {
        for (const directive of node.directives) {
          diagnostics.push(unsupportedDiagnostic('directive', directive.span, `Directive ${directive.kind}:${directive.name} requires its dedicated lowering stage.`));
        }
      }
      const openSource = source.slice(node.openSpan.start.offset, node.openSpan.end.offset);
      if (openSource.includes('{')) {
        diagnostics.push(unsupportedDiagnostic(
          'dynamic-attribute-or-shorthand',
          node.openSpan,
          `Dynamic, mixed, shorthand, and spread attributes require the attribute-lowering stage.`,
        ));
      }
      const nextAncestors = [...ancestors, node.name.toLowerCase()];
      for (const child of node.children ?? []) visit(child, nextAncestors);
      return;
    }

    if (node.type === 'Interpolation') {
      const unsafe = [...ancestors].reverse().find((name) => UNSAFE_INTERPOLATION_ANCESTORS.has(name));
      if (unsafe) {
        diagnostics.push(unsupportedDiagnostic(
          'interpolation-context',
          node.span,
          `Interpolation inside <${unsafe}> cannot use comment-marker text lowering.`,
        ));
      }
      return;
    }

    if (node.type === 'RawHtml') {
      diagnostics.push(unsupportedDiagnostic('raw-html', node.span, 'Raw HTML requires its dedicated trusted-HTML lowering path.'));
      return;
    }

    if (node.type === 'IfBlock' || node.type === 'EachBlock' || node.type === 'AwaitBlock') {
      diagnostics.push(unsupportedDiagnostic('structural-block', node.span, `${node.type} requires branch/list ownership lowering before DOM materialization.`));
      return;
    }

    for (const child of node.children ?? []) visit(child, ancestors);
    for (const branch of node.branches ?? []) visit(branch, ancestors);
  }
}

function unsupportedDiagnostic(feature, span, message) {
  return {
    source: 'nomos',
    code: 'NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE',
    category: 'error',
    feature,
    message,
    span: cloneSpan(span),
  };
}

function failedResult(filename, targetIdentifier, diagnostics, bindings = []) {
  return {
    type: 'TemplateDomLowering',
    code: null,
    map: null,
    decodedMappings: [],
    staticHtml: null,
    markerPrefix: null,
    markerCount: 0,
    bindings,
    diagnostics,
    runtimeModule: 'nomos/internal/runtime',
    runtimeImports: [],
    targetIdentifier,
    viewIdentifier: null,
    filename,
  };
}

function collisionFreeMarkerPrefix(source) {
  let prefix = MARKER_BASE;
  while (source.includes(`<!--${prefix}`)) prefix = `_${prefix}`;
  return prefix;
}

function buildStaticHtml(source, component, bindings, markerPrefix) {
  const ordered = bindings
    .map((binding, index) => ({ binding, index }))
    .sort((a, b) => a.binding.expression.span.start.offset - b.binding.expression.span.start.offset);
  let html = '';

  for (const section of component.sections ?? []) {
    if (section.kind !== 'template') continue;
    let cursor = section.span.start.offset;
    for (const { binding, index } of ordered) {
      const start = binding.expression.span.start.offset;
      const end = binding.expression.span.end.offset;
      if (start < section.span.start.offset || end > section.span.end.offset) continue;
      html += source.slice(cursor, start);
      html += `<!--${markerPrefix}${index}-->`;
      cursor = end;
    }
    html += source.slice(cursor, section.span.end.offset);
  }
  return html;
}

function collectReservedAsciiNames(source) {
  const names = new Set();
  for (const match of source.matchAll(/[A-Za-z_$][A-Za-z0-9_$]*/g)) names.add(match[0]);
  return names;
}

function uniqueName(base, used) {
  let name = base;
  let suffix = 1;
  while (used.has(name)) name = `${base}_${suffix++}`;
  used.add(name);
  return name;
}

function originalPosition(filename, position) {
  return { source: filename, line: position.line - 1, column: position.column - 1 };
}

function cloneSpan(span) {
  return { start: { ...span.start }, end: { ...span.end } };
}
