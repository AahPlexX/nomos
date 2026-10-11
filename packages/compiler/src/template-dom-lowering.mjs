import { lowerEmbeddedExpression } from './expression-lowering.mjs';
import { lowerTemplateTextBindings } from './template-lowering.mjs';
import { createSourceMapFromDecodedMappings } from './source-map.mjs';

const MARKER_BASE = 'nomos:text:';
const ELEMENT_MARKER_BASE = 'data-nomos-el';
const UNSAFE_INTERPOLATION_ANCESTORS = new Set([
  'iframe', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style',
  'template', 'textarea', 'title', 'xmp',
]);
const BOOLEAN_HTML_ATTRIBUTES = new Set([
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls',
  'default', 'defer', 'disabled', 'formnovalidate', 'inert', 'ismap', 'itemscope',
  'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline',
  'readonly', 'required', 'reversed', 'selected',
]);
const URL_HTML_ATTRIBUTES = new Set([
  'action', 'cite', 'formaction', 'href', 'poster', 'src',
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

  const unsupported = collectUnsupportedTemplateFeatures(component);
  if (unsupported.length > 0) return failedResult(filename, targetIdentifier, unsupported);

  const text = lowerTemplateTextBindings(source, component, { script, filename });
  if (text.diagnostics.length > 0) return failedResult(filename, targetIdentifier, text.diagnostics, text.bindings);

  const used = collectReservedAsciiNames(source);
  for (const entry of text.runtimeImports) used.add(entry.local);
  for (const binding of text.bindings) used.add(binding.nodeIdentifier);
  used.add(targetIdentifier);

  const existingRead = text.runtimeImports.find((entry) => entry.imported === 'read')?.local;
  const attributeReadLocal = existingRead ?? uniqueName('__n_read', used);
  const attributes = lowerAttributeBindings(source, component, {
    script,
    filename,
    readLocal: attributeReadLocal,
  });
  if (attributes.diagnostics.length > 0) {
    return failedResult(filename, targetIdentifier, attributes.diagnostics, text.bindings, attributes.bindings);
  }

  const markerPrefix = collisionFreeMarkerPrefix(source);
  const elementMarkerAttribute = attributes.elementCount > 0 ? collisionFreeElementMarker(source) : null;
  const staticHtml = buildStaticHtml(source, component, text.bindings, markerPrefix, attributes.bindings, elementMarkerAttribute);

  const mountTemplateLocal = uniqueName('__n_mountTemplate', used);
  const bindAttributeLocal = attributes.bindings.length > 0 ? uniqueName('__n_bindAttribute', used) : null;
  const viewIdentifier = uniqueName('__n_view', used);
  const runtimeImports = [{ imported: 'mountTemplate', local: mountTemplateLocal }, ...text.runtimeImports];
  if (attributes.bindings.length > 0) runtimeImports.push({ imported: 'bindAttribute', local: bindAttributeLocal });
  if (!existingRead && attributes.bindings.some((binding) => binding.reactiveReadCount > 0)) {
    runtimeImports.push({ imported: 'read', local: attributeReadLocal });
  }

  const lines = [];
  const decodedMappings = [];
  const firstTemplate = (component.sections ?? []).find((section) => section.kind === 'template');
  const mountOptions = {
    markerPrefix,
    markerCount: text.bindings.length,
    ...(attributes.elementCount > 0 ? { elementMarkerAttribute, elementCount: attributes.elementCount } : {}),
  };
  lines.push(`const ${viewIdentifier} = ${mountTemplateLocal}(${targetIdentifier}, ${JSON.stringify(staticHtml)}, ${JSON.stringify(mountOptions)});`);
  decodedMappings.push({ generated: { line: 0, column: 0 }, original: firstTemplate ? originalPosition(filename, firstTemplate.span.start) : null });

  for (const [index, binding] of text.bindings.entries()) {
    const declarationLine = lines.length;
    lines.push(`const ${binding.nodeIdentifier} = ${viewIdentifier}.bindings[${index}];`);
    decodedMappings.push({ generated: { line: declarationLine, column: 0 }, original: originalPosition(filename, binding.expression.span.start) });
    const setupLine = lines.length;
    lines.push(binding.setupCode);
    decodedMappings.push({ generated: { line: setupLine, column: 0 }, original: originalPosition(filename, binding.expression.span.start) });
    for (const mapping of binding.decodedMappings) {
      decodedMappings.push({
        generated: { line: setupLine + mapping.generated.line, column: mapping.generated.column },
        original: mapping.original ? { ...mapping.original } : null,
        ...(mapping.name === undefined ? {} : { name: mapping.name }),
      });
    }
  }

  const elementIdentifiers = new Map();
  for (const binding of attributes.bindings) {
    let elementIdentifier = elementIdentifiers.get(binding.elementIndex);
    if (!elementIdentifier) {
      elementIdentifier = uniqueName(`__n_element_${binding.elementIndex}`, used);
      elementIdentifiers.set(binding.elementIndex, elementIdentifier);
      const declarationLine = lines.length;
      lines.push(`const ${elementIdentifier} = ${viewIdentifier}.elements[${binding.elementIndex}];`);
      decodedMappings.push({ generated: { line: declarationLine, column: 0 }, original: originalPosition(filename, binding.span.start) });
    }
    const setupLine = lines.length;
    const setupCode = `${bindAttributeLocal}(${elementIdentifier}, ${JSON.stringify(binding.name)}, () => (${binding.expressionCode}), { name: ${JSON.stringify(`attr:${binding.name}`)}, boolean: ${binding.boolean} });`;
    lines.push(setupCode);
    decodedMappings.push({ generated: { line: setupLine, column: 0 }, original: originalPosition(filename, binding.span.start) });
    const expressionColumn = setupCode.indexOf(binding.expressionCode);
    if (expressionColumn >= 0 && binding.mappingPosition) {
      decodedMappings.push({ generated: { line: setupLine, column: expressionColumn }, original: originalPosition(filename, binding.mappingPosition) });
    }
  }

  const code = lines.join('\n');
  const map = createSourceMapFromDecodedMappings(decodedMappings, {
    generatedFile: `${filename}.template.js`,
    sourceContents: { [filename]: source },
  });

  return {
    type: 'TemplateDomLowering', code, map, decodedMappings, staticHtml,
    markerPrefix, markerCount: text.bindings.length, bindings: text.bindings,
    attributeBindings: attributes.bindings,
    elementMarkerAttribute,
    elementCount: attributes.elementCount,
    diagnostics: [], runtimeModule: text.runtimeModule, runtimeImports,
    targetIdentifier, viewIdentifier,
  };
}

function lowerAttributeBindings(source, component, { script, filename, readLocal }) {
  const bindings = [];
  const diagnostics = [];
  const reactiveBindings = script?.bindings ?? [];
  let elementIndex = 0;

  for (const section of component.sections ?? []) {
    if (section.kind !== 'template' || !section.ast) continue;
    visit(section.ast);
  }
  return { bindings, diagnostics, elementCount: elementIndex };

  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'Element') {
      const dynamic = (node.attributes ?? []).filter((attribute) => attribute.kind === 'dynamic' || attribute.kind === 'mixed' || attribute.kind === 'shorthand');
      if (dynamic.length > 0) {
        const currentElement = elementIndex++;
        for (const attribute of dynamic) {
          const lowered = lowerAttributeValue(attribute);
          diagnostics.push(...lowered.diagnostics);
          if (lowered.code == null) continue;
          bindings.push({
            type: 'AttributeBinding', kind: attribute.kind, name: attribute.name,
            span: cloneSpan(attribute.span), elementIndex: currentElement,
            boolean: BOOLEAN_HTML_ATTRIBUTES.has(attribute.name.toLowerCase()),
            expressionCode: lowered.code,
            reactiveReadCount: lowered.reactiveReadCount,
            mappingPosition: lowered.mappingPosition,
          });
        }
      }
      for (const child of node.children ?? []) visit(child);
      return;
    }
    for (const child of node.children ?? []) visit(child);
    for (const branch of node.branches ?? []) visit(branch);
  }

  function lowerAttributeValue(attribute) {
    if (attribute.kind === 'mixed') {
      let reactiveReadCount = 0;
      let mappingPosition = null;
      const pieces = ['""'];
      for (const part of attribute.parts ?? []) {
        if (part.type === 'TextPart') pieces.push(JSON.stringify(part.raw));
        else {
          const lowered = lowerExpression(part);
          if (lowered.diagnostics.length) return { code: null, diagnostics: lowered.diagnostics, reactiveReadCount: 0, mappingPosition: null };
          reactiveReadCount += lowered.reactiveReadCount;
          mappingPosition ??= part.bodySpan.start;
          pieces.push(`(${lowered.code})`);
        }
      }
      return { code: pieces.join(' + '), diagnostics: [], reactiveReadCount, mappingPosition: mappingPosition ?? attribute.valueSpan?.start ?? attribute.span.start };
    }
    const expression = attribute.expression;
    const lowered = lowerExpression(expression);
    return { ...lowered, mappingPosition: expression.bodySpan.start };
  }

  function lowerExpression(expression) {
    return lowerEmbeddedExpression({
      type: 'EmbeddedExpression', raw: expression.raw,
      span: cloneSpan(expression.span), bodySpan: cloneSpan(expression.bodySpan),
      filename, virtualFilename: `${filename}.__attr_${expression.bodySpan.start.offset}.ts`,
      adapter: { package: '@typescript/typescript6' },
    }, { bindings: reactiveBindings, helperName: readLocal, source });
  }
}

function collectUnsupportedTemplateFeatures(component) {
  const diagnostics = [];
  for (const section of component.sections ?? []) {
    if (section.kind !== 'template' || !section.ast) continue;
    visit(section.ast, []);
  }
  return diagnostics;

  function visit(node, ancestors) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'Element') {
      if (node.category === 'component') diagnostics.push(unsupportedDiagnostic('component', node.span, `Component <${node.name}> lowering is not part of the current DOM slice.`));
      if (node.directives?.length) for (const directive of node.directives) diagnostics.push(unsupportedDiagnostic('directive', directive.span, `Directive ${directive.kind}:${directive.name} requires its dedicated lowering stage.`));
      for (const attribute of node.attributes ?? []) {
        const name = attribute.name?.toLowerCase();
        if (attribute.kind === 'spread') diagnostics.push(unsupportedDiagnostic('spread-attribute', attribute.span, 'Spread attributes require explicit merge/precedence semantics before lowering.'));
        if (name?.startsWith('on')) diagnostics.push(unsupportedDiagnostic('inline-event-attribute', attribute.span, 'Inline event-handler attributes are not emitted; use on: directives.'));
        if ((attribute.kind === 'dynamic' || attribute.kind === 'mixed' || attribute.kind === 'shorthand') && node.category !== 'html') {
          diagnostics.push(unsupportedDiagnostic('dynamic-custom-element-attribute', attribute.span, 'Dynamic non-standard-element attributes are guarded while custom-element assignment semantics remain unresolved.'));
        }
        if ((attribute.kind === 'dynamic' || attribute.kind === 'mixed' || attribute.kind === 'shorthand') && name && URL_HTML_ATTRIBUTES.has(name)) {
          diagnostics.push(unsupportedDiagnostic('dynamic-url-attribute-unvalidated', attribute.span, `Dynamic ${name} requires the URL safety validator before lowering.`));
        }
      }
      const nextAncestors = [...ancestors, node.name.toLowerCase()];
      for (const child of node.children ?? []) visit(child, nextAncestors);
      return;
    }
    if (node.type === 'Interpolation') {
      const unsafe = [...ancestors].reverse().find((name) => UNSAFE_INTERPOLATION_ANCESTORS.has(name));
      if (unsafe) diagnostics.push(unsupportedDiagnostic('interpolation-context', node.span, `Interpolation inside <${unsafe}> cannot use comment-marker text lowering.`));
      return;
    }
    if (node.type === 'RawHtml') { diagnostics.push(unsupportedDiagnostic('raw-html', node.span, 'Raw HTML requires its dedicated trusted-HTML lowering path.')); return; }
    if (node.type === 'IfBlock' || node.type === 'EachBlock' || node.type === 'AwaitBlock') { diagnostics.push(unsupportedDiagnostic('structural-block', node.span, `${node.type} requires branch/list ownership lowering before DOM materialization.`)); return; }
    for (const child of node.children ?? []) visit(child, ancestors);
    for (const branch of node.branches ?? []) visit(branch, ancestors);
  }
}

function unsupportedDiagnostic(feature, span, message) {
  return { source: 'nomos', code: 'NOMOS-LOWER-UNSUPPORTED-TEMPLATE-FEATURE', category: 'error', feature, message, span: cloneSpan(span) };
}

function failedResult(filename, targetIdentifier, diagnostics, bindings = [], attributeBindings = []) {
  return {
    type: 'TemplateDomLowering', code: null, map: null, decodedMappings: [], staticHtml: null,
    markerPrefix: null, markerCount: 0, bindings, attributeBindings,
    elementMarkerAttribute: null, elementCount: 0,
    diagnostics, runtimeModule: 'nomos/internal/runtime', runtimeImports: [],
    targetIdentifier, viewIdentifier: null, filename,
  };
}

function collisionFreeMarkerPrefix(source) {
  let prefix = MARKER_BASE;
  while (source.includes(`<!--${prefix}`)) prefix = `_${prefix}`;
  return prefix;
}

function collisionFreeElementMarker(source) {
  let name = ELEMENT_MARKER_BASE;
  let suffix = 1;
  while (new RegExp(`\\b${escapeRegExp(name)}(?:\\s|=)`, 'i').test(source)) name = `${ELEMENT_MARKER_BASE}-${suffix++}`;
  return name;
}

function buildStaticHtml(source, component, textBindings, markerPrefix, attributeBindings, elementMarkerAttribute) {
  const edits = textBindings.map((binding, index) => ({
    start: binding.expression.span.start.offset, end: binding.expression.span.end.offset,
    replacement: `<!--${markerPrefix}${index}-->`,
  }));
  const marked = new Set();
  for (const binding of attributeBindings) {
    edits.push({
      start: binding.span.start.offset, end: binding.span.end.offset,
      replacement: marked.has(binding.elementIndex) ? '' : `${elementMarkerAttribute}="${binding.elementIndex}"`,
    });
    marked.add(binding.elementIndex);
  }
  edits.sort((a, b) => a.start - b.start || a.end - b.end);

  let html = '';
  for (const section of component.sections ?? []) {
    if (section.kind !== 'template') continue;
    let cursor = section.span.start.offset;
    for (const edit of edits) {
      if (edit.start < section.span.start.offset || edit.end > section.span.end.offset) continue;
      if (edit.start < cursor) throw new Error('Template lowering edits overlap.');
      html += source.slice(cursor, edit.start) + edit.replacement;
      cursor = edit.end;
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
function uniqueName(base, used) { let name = base; let suffix = 1; while (used.has(name)) name = `${base}_${suffix++}`; used.add(name); return name; }
function originalPosition(filename, position) { return { source: filename, line: position.line - 1, column: position.column - 1 }; }
function cloneSpan(span) { return { start: { ...span.start }, end: { ...span.end } }; }
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
