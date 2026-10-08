const VOID_HTML_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/**
 * Convert the lossless flat TemplateSyntaxTree into a hierarchical template AST.
 * The flat stream remains available for diagnostics/debugging; this tree is the
 * ownership model consumed by lowering and semantic analysis.
 */
export function attachTemplateAsts(source, result) {
  if (typeof source !== 'string') throw new TypeError('source must be a string');
  for (const section of result.sections ?? []) {
    if (section.kind !== 'template' || section.syntax?.type !== 'TemplateSyntaxTree') continue;
    section.ast = buildTemplateAst(source, section.syntax);
  }
  return result;
}

export function buildTemplateAst(source, syntax) {
  if (typeof source !== 'string') throw new TypeError('source must be a string');
  if (!syntax || syntax.type !== 'TemplateSyntaxTree') {
    throw new TypeError('syntax must be a TemplateSyntaxTree');
  }

  const lineStarts = buildLineStarts(source);
  const root = {
    type: 'Template',
    span: syntax.span,
    children: [],
  };

  const structural = syntax.nodes
    .filter((node) => node.type !== 'Attribute' && node.type !== 'Directive')
    .slice()
    .sort(compareNodes);
  const ownedMetadata = syntax.nodes.filter((node) => node.type === 'Attribute' || node.type === 'Directive');

  const stack = [{ kind: 'container', node: root, children: root.children }];
  let cursor = syntax.span.start.offset;

  for (const token of structural) {
    if (token.span.start.offset > cursor) {
      appendText(source, lineStarts, currentChildren(stack), cursor, token.span.start.offset);
    }

    switch (token.type) {
      case 'ElementOpen': {
        const metadata = ownedMetadata.filter((node) =>
          node.span.start.offset >= token.span.start.offset &&
          node.span.end.offset <= token.span.end.offset);
        const element = {
          type: 'Element',
          name: token.name,
          category: token.category,
          selfClosing: Boolean(token.selfClosing),
          void: token.category === 'html' && VOID_HTML_ELEMENTS.has(token.name.toLowerCase()),
          span: cloneSpan(token.span),
          openSpan: cloneSpan(token.span),
          closeSpan: null,
          attributes: metadata.filter((node) => node.type === 'Attribute').map(toAttribute),
          directives: metadata.filter((node) => node.type === 'Directive').map(toDirective),
          children: [],
        };
        currentChildren(stack).push(element);
        if (!element.selfClosing && !element.void) {
          stack.push({ kind: 'element', node: element, children: element.children });
        }
        break;
      }

      case 'ElementClose': {
        const matchIndex = findStackIndex(stack, (entry) => entry.kind === 'element' &&
          entry.node.name.toLowerCase() === token.name.toLowerCase());
        if (matchIndex >= 0) {
          const entry = stack[matchIndex];
          entry.node.closeSpan = cloneSpan(token.span);
          entry.node.span = spanFrom(entry.node.span.start, token.span.end);
          stack.splice(matchIndex);
        }
        break;
      }

      case 'Interpolation':
        currentChildren(stack).push({ type: 'Interpolation', span: cloneSpan(token.span) });
        break;

      case 'RawHtml':
        currentChildren(stack).push({ type: 'RawHtml', span: cloneSpan(token.span) });
        break;

      case 'BlockOpen': {
        const block = {
          type: blockType(token.kind),
          kind: token.kind,
          span: cloneSpan(token.span),
          openSpan: cloneSpan(token.span),
          closeSpan: null,
          branches: [],
        };
        const branch = createInitialBranch(token);
        block.branches.push(branch);
        currentChildren(stack).push(block);
        stack.push({ kind: 'block', node: block, children: branch.children, branch });
        break;
      }

      case 'BlockBranch': {
        const blockIndex = findStackIndex(stack, (entry) => entry.kind === 'block');
        if (blockIndex >= 0) {
          stack.splice(blockIndex + 1);
          const entry = stack[blockIndex];
          const branch = {
            type: 'Branch',
            kind: normalizeBranchKind(entry.node.kind, token.kind),
            markerSpan: cloneSpan(token.span),
            span: cloneSpan(token.span),
            children: [],
          };
          entry.node.branches.push(branch);
          entry.children = branch.children;
          entry.branch = branch;
        }
        break;
      }

      case 'BlockClose': {
        const blockIndex = findStackIndex(stack, (entry) => entry.kind === 'block' && entry.node.kind === token.kind);
        if (blockIndex >= 0) {
          const entry = stack[blockIndex];
          entry.node.closeSpan = cloneSpan(token.span);
          entry.node.span = spanFrom(entry.node.span.start, token.span.end);
          for (const branch of entry.node.branches) {
            const branchEnd = branch.children.at(-1)?.span?.end ?? branch.markerSpan.end;
            branch.span = spanFrom(branch.markerSpan.start, branchEnd);
          }
          stack.splice(blockIndex);
        }
        break;
      }

      default:
        throw new Error(`Unsupported structural token type: ${token.type}`);
    }

    cursor = Math.max(cursor, token.span.end.offset);
  }

  if (cursor < syntax.span.end.offset) {
    appendText(source, lineStarts, currentChildren(stack), cursor, syntax.span.end.offset);
  }

  return root;
}

function createInitialBranch(token) {
  const kind = token.kind === 'if' ? 'then' : token.kind === 'each' ? 'body' : 'pending';
  return {
    type: 'Branch',
    kind,
    markerSpan: cloneSpan(token.span),
    span: cloneSpan(token.span),
    children: [],
  };
}

function normalizeBranchKind(blockKind, tokenKind) {
  if (blockKind === 'if') return tokenKind;
  if (blockKind === 'each' && tokenKind === 'else') return 'empty';
  return tokenKind;
}

function blockType(kind) {
  if (kind === 'if') return 'IfBlock';
  if (kind === 'each') return 'EachBlock';
  if (kind === 'await') return 'AwaitBlock';
  throw new Error(`Unsupported block kind: ${kind}`);
}

function toAttribute(node) {
  return { type: 'Attribute', name: node.name, span: cloneSpan(node.span) };
}

function toDirective(node) {
  return { type: 'Directive', kind: node.kind, name: node.name, span: cloneSpan(node.span) };
}

function appendText(source, lineStarts, children, start, end) {
  if (end <= start) return;
  children.push({
    type: 'Text',
    value: source.slice(start, end),
    span: makeSpan(lineStarts, start, end),
  });
}

function currentChildren(stack) {
  return stack.at(-1).children;
}

function findStackIndex(stack, predicate) {
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    if (predicate(stack[index])) return index;
  }
  return -1;
}

function compareNodes(a, b) {
  return a.span.start.offset - b.span.start.offset || b.span.end.offset - a.span.end.offset;
}

function cloneSpan(span) {
  return {
    start: { ...span.start },
    end: { ...span.end },
  };
}

function spanFrom(start, end) {
  return { start: { ...start }, end: { ...end } };
}

function makeSpan(lineStarts, start, end) {
  return { start: position(lineStarts, start), end: position(lineStarts, end) };
}

function buildLineStarts(source) {
  const starts = [0];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '\r') {
      if (source[index + 1] === '\n') index += 1;
      starts.push(index + 1);
    } else if (source[index] === '\n') {
      starts.push(index + 1);
    }
  }
  return starts;
}

function position(lineStarts, offset) {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (lineStarts[mid] <= offset) low = mid + 1;
    else high = mid - 1;
  }
  const lineIndex = Math.max(0, high);
  return { offset, line: lineIndex + 1, column: offset - lineStarts[lineIndex] + 1 };
}
