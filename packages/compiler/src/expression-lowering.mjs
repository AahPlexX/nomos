import ts from '@typescript/typescript6';

export function createEmbeddedExpression(source, interpolation, filename = 'component.nomos') {
  if (typeof source !== 'string') throw new TypeError('source must be a string');
  if (!interpolation || interpolation.type !== 'Interpolation') {
    throw new TypeError('interpolation must be an Interpolation node');
  }
  const start = interpolation.span.start.offset;
  const end = interpolation.span.end.offset;
  if (source[start] !== '{' || source[end - 1] !== '}') {
    throw new Error('interpolation span must include its outer braces');
  }
  const bodyStart = start + 1;
  const bodyEnd = end - 1;
  return {
    type: 'EmbeddedExpression',
    raw: source.slice(bodyStart, bodyEnd),
    span: cloneSpan(interpolation.span),
    bodySpan: {
      start: absolutePosition(source, bodyStart),
      end: absolutePosition(source, bodyEnd),
    },
    filename,
    virtualFilename: `${filename}.__expr_${bodyStart}.ts`,
    adapter: { package: '@typescript/typescript6', apiVersion: ts.version },
  };
}

export function lowerEmbeddedExpression(embedded, { bindings = [], helperName = '__n_read', source = '' } = {}) {
  if (!embedded || embedded.type !== 'EmbeddedExpression') {
    throw new TypeError('embedded must be an EmbeddedExpression');
  }
  const reactive = bindings.filter((binding) => binding && (binding.kind === 'state' || binding.kind === 'derive'));
  const declarations = reactive.map((binding) => `declare let ${binding.name}: unknown;`).join('\n');
  const prefix = declarations ? `${declarations}\n` : '';
  const marker = 'const __nomos_expr = (';
  const synthetic = `${prefix}${marker}${embedded.raw});`;
  const expressionStart = prefix.length + marker.length;
  const sourceFile = ts.createSourceFile(embedded.virtualFilename, synthetic, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const options = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    noResolve: true,
    skipLibCheck: true,
  };
  const program = createMemoryProgram(options, sourceFile, synthetic);
  const syntaxDiagnostics = program.getSyntacticDiagnostics(sourceFile);
  if (syntaxDiagnostics.length > 0) {
    return {
      code: null,
      diagnostics: syntaxDiagnostics.map((diagnostic) => toDiagnostic(diagnostic, embedded, expressionStart, source)),
      reactiveReadCount: 0,
    };
  }

  const checker = program.getTypeChecker();
  const reactiveSymbols = new Set();
  for (let index = 0; index < reactive.length; index += 1) {
    const statement = sourceFile.statements[index];
    const declaration = statement?.declarationList?.declarations?.[0];
    if (declaration && ts.isIdentifier(declaration.name)) {
      const symbol = checker.getSymbolAtLocation(declaration.name);
      if (symbol) reactiveSymbols.add(symbol);
    }
  }

  const expressionStatement = sourceFile.statements.at(-1);
  const declaration = expressionStatement?.declarationList?.declarations?.[0];
  if (!declaration?.initializer) throw new Error('synthetic expression wrapper is incomplete');
  const expression = ts.isParenthesizedExpression(declaration.initializer)
    ? declaration.initializer.expression
    : declaration.initializer;

  let reactiveReadCount = 0;
  const factory = ts.factory;
  const transformed = ts.transform(expression, [
    (context) => {
      const visit = (node) => {
        if (ts.isShorthandPropertyAssignment(node)) {
          const symbol = checker.getShorthandAssignmentValueSymbol?.(node) ?? checker.getSymbolAtLocation(node.name);
          if (symbol && reactiveSymbols.has(symbol)) {
            reactiveReadCount += 1;
            return factory.createPropertyAssignment(node.name, readCall(factory, helperName, node.name.text));
          }
        }
        if (ts.isIdentifier(node)) {
          const symbol = checker.getSymbolAtLocation(node);
          if (symbol && reactiveSymbols.has(symbol) && shouldLowerRead(node)) {
            reactiveReadCount += 1;
            return readCall(factory, helperName, node.text);
          }
        }
        return ts.visitEachChild(node, visit, context);
      };
      return (root) => ts.visitNode(root, visit);
    },
  ]);

  try {
    const code = ts.createPrinter({ removeComments: false }).printNode(
      ts.EmitHint.Expression,
      transformed.transformed[0],
      sourceFile,
    );
    return { code, diagnostics: [], reactiveReadCount };
  } finally {
    transformed.dispose();
  }
}

function createMemoryProgram(options, sourceFile, source) {
  const host = ts.createCompilerHost(options, true);
  const defaultGetSourceFile = host.getSourceFile.bind(host);
  const defaultReadFile = host.readFile.bind(host);
  const defaultFileExists = host.fileExists.bind(host);
  host.getSourceFile = (name, languageVersion, onError, shouldCreateNewSourceFile) => {
    if (name === sourceFile.fileName) return sourceFile;
    return defaultGetSourceFile(name, languageVersion, onError, shouldCreateNewSourceFile);
  };
  host.readFile = (name) => name === sourceFile.fileName ? source : defaultReadFile(name);
  host.fileExists = (name) => name === sourceFile.fileName || defaultFileExists(name);
  return ts.createProgram([sourceFile.fileName], options, host);
}

function readCall(factory, helperName, bindingName) {
  return factory.createCallExpression(
    factory.createIdentifier(helperName),
    undefined,
    [factory.createIdentifier(bindingName)],
  );
}

function shouldLowerRead(node) {
  const parent = node.parent;
  if (!parent) return true;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return false;
  if (ts.isPropertyAssignment(parent) && parent.name === node && !parent.computed) return false;
  if (ts.isBinaryExpression(parent) && parent.left === node && isAssignmentOperator(parent.operatorToken.kind)) return false;
  if ((ts.isPrefixUnaryExpression(parent) || ts.isPostfixUnaryExpression(parent)) && parent.operand === node) return false;
  return true;
}

function isAssignmentOperator(kind) {
  return kind >= ts.SyntaxKind.FirstAssignment && kind <= ts.SyntaxKind.LastAssignment;
}

function toDiagnostic(diagnostic, embedded, syntheticExpressionStart, source) {
  const syntheticStart = diagnostic.start ?? syntheticExpressionStart;
  const relative = Math.max(0, Math.min(embedded.raw.length, syntheticStart - syntheticExpressionStart));
  const start = embedded.bodySpan.start.offset + relative;
  const length = Math.max(0, Math.min(diagnostic.length ?? 0, embedded.bodySpan.end.offset - start));
  const result = {
    source: 'typescript',
    code: diagnostic.code,
    category: diagnostic.category,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    start,
    length,
  };
  if (source) {
    result.span = {
      start: absolutePosition(source, start),
      end: absolutePosition(source, start + length),
    };
  }
  return result;
}

function cloneSpan(span) {
  return { start: { ...span.start }, end: { ...span.end } };
}

function absolutePosition(source, offset) {
  let line = 1;
  let lineStart = 0;
  for (let index = 0; index < offset; index += 1) {
    if (source[index] === '\r') {
      if (source[index + 1] === '\n') index += 1;
      line += 1;
      lineStart = index + 1;
    } else if (source[index] === '\n') {
      line += 1;
      lineStart = index + 1;
    }
  }
  return { offset, line, column: offset - lineStart + 1 };
}
