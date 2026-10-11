import ts from '@typescript/typescript6';

const INTERNAL_RUNTIME_MODULE = 'nomos/internal/runtime';
const PRIMITIVES = new Set(['state', 'derive']);

export function lowerScript(source, { filename = 'component.nomos.ts', language = 'ts' } = {}) {
  if (typeof source !== 'string') throw new TypeError('source must be a string');
  const virtualFile = normalizeFilename(filename);
  const options = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    sourceMap: true,
    inlineSources: true,
    inlineSourceMap: false,
    noResolve: true,
    skipLibCheck: true,
    newLine: ts.NewLineKind.LineFeed,
  };
  const scriptKind = language === 'js' ? ts.ScriptKind.JS : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(virtualFile, source, ts.ScriptTarget.Latest, true, scriptKind);
  const host = createMemoryHost(options, sourceFile, source);
  const program = ts.createProgram([virtualFile], options, host);
  const checker = program.getTypeChecker();
  const analysis = analyzeReactiveBindings(sourceFile, checker);
  const diagnostics = [];
  const outputs = new Map();

  const transformers = {
    before: [createReactiveTransformer(checker, analysis, diagnostics)],
  };
  const emit = program.emit(
    sourceFile,
    (name, text) => outputs.set(name, text),
    undefined,
    false,
    transformers,
  );

  const allDiagnostics = [
    ...program.getSyntacticDiagnostics(sourceFile),
    ...emit.diagnostics,
    ...diagnostics,
  ];

  const jsEntry = [...outputs.entries()].find(([name]) => /\.js$/.test(name));
  const mapEntry = [...outputs.entries()].find(([name]) => /\.js\.map$/.test(name));
  return {
    code: jsEntry?.[1] ?? '',
    map: mapEntry ? JSON.parse(mapEntry[1]) : null,
    diagnostics: allDiagnostics.map(toDiagnostic),
    bindings: [...analysis.bindings.values()].map(({ name, kind, raw }) => ({ name, kind, raw })),
    typescriptVersion: ts.version,
  };
}

export function lowerComponentScript(source, component, { filename = component?.filename ?? 'component.nomos' } = {}) {
  if (typeof source !== 'string') throw new TypeError('source must be a string');
  const section = component?.sections?.find((candidate) => candidate.kind === 'script');
  if (!section) return null;
  const embedded = createEmbeddedScript(source, section, filename);
  const paddedSource = preserveCoordinates(source.slice(0, embedded.bodySpan.start.offset)) + embedded.raw;
  const result = lowerScript(paddedSource, {
    filename: embedded.virtualFilename,
    language: embedded.language,
  });
  if (result.map) {
    result.map.sources = [filename];
    result.map.sourcesContent = [source];
  }
  return { ...result, embedded };
}

export function createEmbeddedScript(source, section, filename = 'component.nomos') {
  if (!section || section.kind !== 'script') throw new TypeError('section must be a script section');
  const raw = section.raw;
  const openEnd = findOpeningTagEnd(raw);
  const closeStart = raw.toLowerCase().lastIndexOf('</script>');
  if (openEnd < 0 || closeStart < openEnd) throw new Error('script section is not structurally complete');
  const bodyStart = section.span.start.offset + openEnd + 1;
  const bodyEnd = section.span.start.offset + closeStart;
  const language = readScriptLanguage(raw.slice(0, openEnd + 1));
  return {
    type: 'EmbeddedScript',
    raw: source.slice(bodyStart, bodyEnd),
    bodySpan: {
      start: absolutePosition(source, bodyStart),
      end: absolutePosition(source, bodyEnd),
    },
    language,
    filename,
    virtualFilename: `${filename}.${language}`,
    adapter: { package: '@typescript/typescript6', apiVersion: ts.version },
  };
}

function findOpeningTagEnd(raw) {
  let quote = null;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '>') return index;
  }
  return -1;
}

function readScriptLanguage(openTag) {
  const match = /\blang\s*=\s*(["'])(.*?)\1/i.exec(openTag);
  return match && match[2].toLowerCase() === 'js' ? 'js' : 'ts';
}

function preserveCoordinates(prefix) {
  return prefix.replace(/[^\r\n]/g, ' ');
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

function createMemoryHost(options, sourceFile, source) {
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
  return host;
}

function analyzeReactiveBindings(sourceFile, checker) {
  const imports = new Map();
  const bindings = new Map();

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || statement.moduleSpecifier.text !== 'nomos') continue;
    const named = statement.importClause?.namedBindings;
    if (!named || !ts.isNamedImports(named)) continue;
    for (const specifier of named.elements) {
      const importedName = (specifier.propertyName ?? specifier.name).text;
      if (!PRIMITIVES.has(importedName)) continue;
      const symbol = checker.getSymbolAtLocation(specifier.name);
      if (symbol) imports.set(symbol, importedName);
    }
  }

  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const primitive = reactiveInitializerKind(node.initializer, checker, imports);
      if (primitive) {
        const symbol = checker.getSymbolAtLocation(node.name);
        if (symbol) bindings.set(symbol, { name: node.name.text, ...primitive });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return { imports, bindings, helpers: createHelperNames(sourceFile) };
}

function createHelperNames(sourceFile) {
  const used = new Set();
  const collect = (node) => {
    if (ts.isIdentifier(node)) used.add(node.text);
    ts.forEachChild(node, collect);
  };
  collect(sourceFile);
  const unique = (base) => {
    let name = base;
    let suffix = 1;
    while (used.has(name)) name = `${base}_${suffix++}`;
    used.add(name);
    return name;
  };
  return {
    state: unique('__n_state'),
    derive: unique('__n_derive'),
    read: unique('__n_read'),
    write: unique('__n_write'),
    update: unique('__n_update'),
    loop: unique('__n_loop'),
  };
}

function collectDeriveWriteDiagnostics(argument, checker, bindings, diagnostics) {
  if (!ts.isArrowFunction(argument) && !ts.isFunctionExpression(argument)) return;
  const root = argument;
  const visit = (node) => {
    if (node !== root && ts.isFunctionLike(node)) return;
    if (ts.isBinaryExpression(node) && ts.isIdentifier(node.left) && isAssignmentOperator(node.operatorToken.kind)) {
      const binding = bindings.get(checker.getSymbolAtLocation(node.left));
      if (binding?.kind === 'state') diagnostics.push(makeCompilerDiagnostic(node.left, `Cannot write reactive state ${binding.name} while a derive is evaluating.`));
    }
    if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) && ts.isIdentifier(node.operand)
      && (node.operator === ts.SyntaxKind.PlusPlusToken || node.operator === ts.SyntaxKind.MinusMinusToken)) {
      const binding = bindings.get(checker.getSymbolAtLocation(node.operand));
      if (binding?.kind === 'state') diagnostics.push(makeCompilerDiagnostic(node.operand, `Cannot write reactive state ${binding.name} while a derive is evaluating.`));
    }
    if ((ts.isForOfStatement(node) || ts.isForInStatement(node)) && ts.isIdentifier(node.initializer)) {
      const binding = bindings.get(checker.getSymbolAtLocation(node.initializer));
      if (binding?.kind === 'state') diagnostics.push(makeCompilerDiagnostic(node.initializer, `Cannot write reactive state ${binding.name} while a derive is evaluating.`));
    }
    ts.forEachChild(node, visit);
  };
  visit(root.body);
}

function reactiveInitializerKind(initializer, checker, imports) {
  if (!ts.isCallExpression(initializer)) return null;
  if (ts.isIdentifier(initializer.expression)) {
    const symbol = checker.getSymbolAtLocation(initializer.expression);
    const primitive = imports.get(symbol);
    if (primitive === 'state') return { kind: 'state', raw: false };
    if (primitive === 'derive') return { kind: 'derive', raw: false };
    return null;
  }
  if (ts.isPropertyAccessExpression(initializer.expression) && initializer.expression.name.text === 'raw') {
    const base = initializer.expression.expression;
    if (!ts.isIdentifier(base)) return null;
    const symbol = checker.getSymbolAtLocation(base);
    if (imports.get(symbol) === 'state') return { kind: 'state', raw: true };
  }
  return null;
}

function createReactiveTransformer(checker, analysis, diagnostics) {
  const factory = ts.factory;
  return (context) => {
    const visit = (node) => {
      if (ts.isSourceFile(node)) return transformSourceFile(node, context, visit, analysis);

      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
        const symbol = checker.getSymbolAtLocation(node.name);
        const binding = analysis.bindings.get(symbol);
        if (binding) {
          const originalCall = node.initializer;
          const argument = originalCall.arguments[0] ?? factory.createIdentifier('undefined');
          if (binding.kind === 'derive') collectDeriveWriteDiagnostics(argument, checker, analysis.bindings, diagnostics);
          const loweredArgument = ts.visitNode(argument, visit);
          const options = [factory.createPropertyAssignment('name', factory.createStringLiteral(binding.name))];
          if (binding.raw) options.push(factory.createPropertyAssignment('raw', factory.createTrue()));
          const initializer = factory.createCallExpression(
            factory.createIdentifier(binding.kind === 'state' ? analysis.helpers.state : analysis.helpers.derive),
            undefined,
            [loweredArgument, factory.createObjectLiteralExpression(options, false)],
          );
          return factory.updateVariableDeclaration(node, node.name, node.exclamationToken, node.type, initializer);
        }
      }

      if ((ts.isForOfStatement(node) || ts.isForInStatement(node)) && ts.isIdentifier(node.initializer)) {
        const symbol = checker.getSymbolAtLocation(node.initializer);
        const binding = analysis.bindings.get(symbol);
        if (binding) return lowerReactiveLoop(node, binding, visit, diagnostics, analysis.helpers);
      }

      if (ts.isBinaryExpression(node) && ts.isIdentifier(node.left)) {
        const symbol = checker.getSymbolAtLocation(node.left);
        const binding = analysis.bindings.get(symbol);
        if (binding) return lowerRootAssignment(node, binding, visit, diagnostics, analysis.helpers);
      }

      if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) && ts.isIdentifier(node.operand)) {
        const symbol = checker.getSymbolAtLocation(node.operand);
        const binding = analysis.bindings.get(symbol);
        if (binding && (node.operator === ts.SyntaxKind.PlusPlusToken || node.operator === ts.SyntaxKind.MinusMinusToken)) {
          if (binding.kind === 'derive') {
            diagnostics.push(makeCompilerDiagnostic(node, `Cannot write to derived value ${binding.name}.`));
            return node;
          }
          const delta = node.operator === ts.SyntaxKind.PlusPlusToken ? 1 : -1;
          return factory.createCallExpression(factory.createIdentifier(analysis.helpers.update), undefined, [
            factory.createIdentifier(binding.name),
            factory.createNumericLiteral(delta),
            node.kind === ts.SyntaxKind.PostfixUnaryExpression ? factory.createTrue() : factory.createFalse(),
          ]);
        }
      }

      if (ts.isShorthandPropertyAssignment(node)) {
        const symbol = checker.getShorthandAssignmentValueSymbol?.(node) ?? checker.getSymbolAtLocation(node.name);
        const binding = analysis.bindings.get(symbol);
        if (binding) {
          return factory.createPropertyAssignment(node.name, readExpression(binding.name, analysis.helpers));
        }
      }

      if (ts.isIdentifier(node)) {
        const symbol = checker.getSymbolAtLocation(node);
        const binding = analysis.bindings.get(symbol);
        if (binding && shouldLowerIdentifierRead(node)) return readExpression(binding.name, analysis.helpers);
      }

      return ts.visitEachChild(node, visit, context);
    };
    return (sourceFile) => ts.visitNode(sourceFile, visit);
  };
}

function transformSourceFile(sourceFile, context, visit, analysis) {
  const factory = ts.factory;
  const statements = [];
  let touched = false;

  for (const statement of sourceFile.statements) {
    const next = ts.visitNode(statement, visit);
    statements.push(next);
    if (next !== statement) touched = true;
  }

  if (analysis.bindings.size > 0) {
    statements.unshift(createInternalRuntimeImport(factory, analysis.helpers));
    touched = true;
  }
  return touched ? factory.updateSourceFile(sourceFile, statements) : sourceFile;
}

function createInternalRuntimeImport(factory, helpers) {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(false, undefined, factory.createNamedImports([
      importAlias(factory, 'createStateCell', helpers.state),
      importAlias(factory, 'createDerived', helpers.derive),
      importAlias(factory, 'read', helpers.read),
      importAlias(factory, 'write', helpers.write),
      importAlias(factory, 'updateState', helpers.update),
    ])),
    factory.createStringLiteral(INTERNAL_RUNTIME_MODULE),
    undefined,
  );
}

function importAlias(factory, imported, local) {
  return factory.createImportSpecifier(false, factory.createIdentifier(imported), factory.createIdentifier(local));
}

function lowerReactiveLoop(node, binding, visit, diagnostics, helpers) {
  const factory = ts.factory;
  if (binding.kind === 'derive') {
    diagnostics.push(makeCompilerDiagnostic(node.initializer, `Cannot write to derived value ${binding.name}.`));
    return node;
  }

  const temporary = factory.createIdentifier(helpers.loop);
  const declaration = factory.createVariableDeclarationList([
    factory.createVariableDeclaration(temporary),
  ], ts.NodeFlags.Const);
  const expression = ts.visitNode(node.expression, visit);
  const visitedBody = ts.visitNode(node.statement, visit);
  const assignment = factory.createExpressionStatement(factory.createCallExpression(
    factory.createIdentifier(helpers.write),
    undefined,
    [factory.createIdentifier(binding.name), temporary],
  ));
  const body = ts.isBlock(visitedBody)
    ? factory.updateBlock(visitedBody, [assignment, ...visitedBody.statements])
    : factory.createBlock([assignment, visitedBody], true);

  return ts.isForOfStatement(node)
    ? factory.updateForOfStatement(node, node.awaitModifier, declaration, expression, body)
    : factory.updateForInStatement(node, declaration, expression, body);
}

function lowerRootAssignment(node, binding, visit, diagnostics, helpers) {
  const factory = ts.factory;
  if (binding.kind === 'derive') {
    diagnostics.push(makeCompilerDiagnostic(node.left, `Cannot write to derived value ${binding.name}.`));
    return node;
  }
  const rhs = ts.visitNode(node.right, visit);
  if (node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
    return factory.createCallExpression(factory.createIdentifier(helpers.write), undefined, [factory.createIdentifier(binding.name), rhs]);
  }
  const binaryOperator = compoundToBinary(node.operatorToken.kind);
  if (binaryOperator == null) return node;
  return factory.createCallExpression(factory.createIdentifier(helpers.write), undefined, [
    factory.createIdentifier(binding.name),
    factory.createBinaryExpression(readExpression(binding.name, helpers), factory.createToken(binaryOperator), rhs),
  ]);
}

function compoundToBinary(kind) {
  const map = new Map([
    [ts.SyntaxKind.PlusEqualsToken, ts.SyntaxKind.PlusToken],
    [ts.SyntaxKind.MinusEqualsToken, ts.SyntaxKind.MinusToken],
    [ts.SyntaxKind.AsteriskEqualsToken, ts.SyntaxKind.AsteriskToken],
    [ts.SyntaxKind.SlashEqualsToken, ts.SyntaxKind.SlashToken],
    [ts.SyntaxKind.PercentEqualsToken, ts.SyntaxKind.PercentToken],
    [ts.SyntaxKind.AsteriskAsteriskEqualsToken, ts.SyntaxKind.AsteriskAsteriskToken],
    [ts.SyntaxKind.AmpersandEqualsToken, ts.SyntaxKind.AmpersandToken],
    [ts.SyntaxKind.BarEqualsToken, ts.SyntaxKind.BarToken],
    [ts.SyntaxKind.CaretEqualsToken, ts.SyntaxKind.CaretToken],
    [ts.SyntaxKind.LessThanLessThanEqualsToken, ts.SyntaxKind.LessThanLessThanToken],
    [ts.SyntaxKind.GreaterThanGreaterThanEqualsToken, ts.SyntaxKind.GreaterThanGreaterThanToken],
    [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken, ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken],
    [ts.SyntaxKind.AmpersandAmpersandEqualsToken, ts.SyntaxKind.AmpersandAmpersandToken],
    [ts.SyntaxKind.BarBarEqualsToken, ts.SyntaxKind.BarBarToken],
    [ts.SyntaxKind.QuestionQuestionEqualsToken, ts.SyntaxKind.QuestionQuestionToken],
  ]);
  return map.get(kind) ?? null;
}

function readExpression(name, helpers) {
  return ts.factory.createCallExpression(ts.factory.createIdentifier(helpers.read), undefined, [ts.factory.createIdentifier(name)]);
}

function shouldLowerIdentifierRead(node) {
  const parent = node.parent;
  if (!parent) return true;
  if (ts.isVariableDeclaration(parent) && parent.name === node) return false;
  if (ts.isImportSpecifier(parent) || ts.isImportClause(parent)) return false;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return false;
  if (ts.isPropertyAssignment(parent) && parent.name === node && !parent.computed) return false;
  if (ts.isMethodDeclaration(parent) && parent.name === node) return false;
  if (ts.isPropertyDeclaration(parent) && parent.name === node) return false;
  if (ts.isParameter(parent) && parent.name === node) return false;
  if (ts.isBinaryExpression(parent) && parent.left === node && isAssignmentOperator(parent.operatorToken.kind)) return false;
  if ((ts.isPrefixUnaryExpression(parent) || ts.isPostfixUnaryExpression(parent)) && parent.operand === node) return false;
  if (ts.isShorthandPropertyAssignment(parent)) return false;
  if ((ts.isForOfStatement(parent) || ts.isForInStatement(parent)) && parent.initializer === node) return false;
  return true;
}

function isAssignmentOperator(kind) {
  return kind >= ts.SyntaxKind.FirstAssignment && kind <= ts.SyntaxKind.LastAssignment;
}

function makeCompilerDiagnostic(node, message) {
  return {
    category: ts.DiagnosticCategory.Error,
    nomosCode: 'NOMOS-REACTIVE-DERIVE-WRITE',
    code: 9001,
    file: node.getSourceFile(),
    start: node.getStart(),
    length: node.getWidth(),
    messageText: message,
  };
}

function toDiagnostic(diagnostic) {
  return {
    code: diagnostic.nomosCode ?? diagnostic.code,
    category: diagnostic.category,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    start: diagnostic.start ?? null,
    length: diagnostic.length ?? null,
  };
}

function normalizeFilename(filename) {
  const normalized = filename.replace(/\\/g, '/');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}
