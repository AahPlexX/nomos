/**
 * Create an ECMA-426 compatible source map for generated output whose line
 * starts correspond 1:1 with the original source. This is the Phase 1
 * baseline map; later lowering passes compose finer-grained segments onto it.
 */
export function createIdentitySourceMap(source, { sourceFile, generatedFile }) {
  if (typeof source !== 'string') throw new TypeError('source must be a string');
  if (!sourceFile || !generatedFile) throw new TypeError('sourceFile and generatedFile are required');

  const lineCount = countLogicalLines(source);
  const mappings = Array.from({ length: lineCount }, (_, index) => (index === 0 ? 'AAAA' : 'AACA')).join(';');

  return {
    version: 3,
    file: generatedFile,
    sources: [sourceFile],
    sourcesContent: [source],
    names: [],
    mappings,
  };
}

function countLogicalLines(source) {
  let lines = 1;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '\r') {
      lines += 1;
      if (source[index + 1] === '\n') index += 1;
    } else if (char === '\n') {
      lines += 1;
    }
  }
  return lines;
}
