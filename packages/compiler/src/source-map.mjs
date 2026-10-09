const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Create an ECMA-426 compatible source map for generated output whose line
 * starts correspond 1:1 with the original source.
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

/**
 * Validate Nomos's decoded mapping representation.
 * Lines/columns are zero-based UTF-16 code-unit positions.
 */
export function validateDecodedMappings(mappings) {
  if (!Array.isArray(mappings)) throw new TypeError('mappings must be an array');
  let previous = null;

  for (const [index, mapping] of mappings.entries()) {
    if (!mapping || typeof mapping !== 'object') throw new TypeError(`mapping ${index} must be an object`);
    validatePosition(mapping.generated, `mapping ${index} generated`);

    if (previous && comparePosition(previous.generated, mapping.generated) >= 0) {
      throw new Error(`mapping ${index} violates strict generated order`);
    }

    if (mapping.original !== null) {
      if (!mapping.original || typeof mapping.original !== 'object') {
        throw new TypeError(`mapping ${index} original must be null or an object`);
      }
      if (typeof mapping.original.source !== 'string' || mapping.original.source.length === 0) {
        throw new TypeError(`mapping ${index} original.source must be a non-empty string`);
      }
      validatePosition(mapping.original, `mapping ${index} original`);
    }

    if (mapping.name !== undefined && (typeof mapping.name !== 'string' || mapping.name.length === 0)) {
      throw new TypeError(`mapping ${index} name must be a non-empty string when present`);
    }
    if (mapping.original === null && mapping.name !== undefined) {
      throw new Error(`mapping ${index} cannot attach a name to an unmapped segment`);
    }

    previous = mapping;
  }

  return mappings;
}

/**
 * Compose mappings from a final artifact -> intermediate source with mappings
 * from that intermediate source -> its original source. Composition is exact:
 * every referenced intermediate position must exist as a generated mapping
 * point in the upstream set. This avoids fabricating provenance between points.
 */
export function composeDecodedMappings(finalToIntermediate, intermediateToOriginal, { intermediateSource } = {}) {
  validateDecodedMappings(finalToIntermediate);
  validateDecodedMappings(intermediateToOriginal);
  if (typeof intermediateSource !== 'string' || intermediateSource.length === 0) {
    throw new TypeError('intermediateSource is required');
  }

  const lookup = new Map();
  for (const mapping of intermediateToOriginal) {
    lookup.set(positionKey(mapping.generated), mapping);
  }

  const composed = finalToIntermediate.map((mapping, index) => {
    if (mapping.original === null) {
      return { generated: clonePosition(mapping.generated), original: null };
    }
    if (mapping.original.source !== intermediateSource) {
      throw new Error(`mapping ${index} references ${mapping.original.source}; expected intermediate source ${intermediateSource}`);
    }

    const upstream = lookup.get(positionKey(mapping.original));
    if (!upstream) {
      throw new Error(`mapping ${index} cannot resolve intermediate position ${mapping.original.line}:${mapping.original.column}`);
    }
    if (upstream.original === null) {
      return { generated: clonePosition(mapping.generated), original: null };
    }

    const result = {
      generated: clonePosition(mapping.generated),
      original: cloneOriginal(upstream.original),
    };
    const name = mapping.name ?? upstream.name;
    if (name !== undefined) result.name = name;
    return result;
  });

  validateDecodedMappings(composed);
  return composed;
}

/** Encode validated decoded mappings as an ECMA-426 version-3 source map. */
export function createSourceMapFromDecodedMappings(mappings, { generatedFile, sourceContents } = {}) {
  validateDecodedMappings(mappings);
  if (typeof generatedFile !== 'string' || generatedFile.length === 0) {
    throw new TypeError('generatedFile is required');
  }
  if (!sourceContents || typeof sourceContents !== 'object' || Array.isArray(sourceContents)) {
    throw new TypeError('sourceContents must be an object keyed by source filename');
  }

  const sources = [];
  const sourceIndex = new Map();
  const names = [];
  const nameIndex = new Map();

  for (const mapping of mappings) {
    if (mapping.original !== null && !sourceIndex.has(mapping.original.source)) {
      sourceIndex.set(mapping.original.source, sources.length);
      sources.push(mapping.original.source);
    }
    if (mapping.name !== undefined && !nameIndex.has(mapping.name)) {
      nameIndex.set(mapping.name, names.length);
      names.push(mapping.name);
    }
  }

  const sourcesContent = sources.map((source) => {
    if (!Object.hasOwn(sourceContents, source)) {
      throw new Error(`missing sourcesContent for ${source}`);
    }
    const content = sourceContents[source];
    if (typeof content !== 'string') throw new TypeError(`sourcesContent for ${source} must be a string`);
    return content;
  });

  return {
    version: 3,
    file: generatedFile,
    sources,
    sourcesContent,
    names,
    mappings: encodeMappings(mappings, sourceIndex, nameIndex),
  };
}

function encodeMappings(mappings, sourceIndex, nameIndex) {
  const byLine = new Map();
  let maxLine = 0;
  for (const mapping of mappings) {
    const line = mapping.generated.line;
    maxLine = Math.max(maxLine, line);
    if (!byLine.has(line)) byLine.set(line, []);
    byLine.get(line).push(mapping);
  }

  let previousSource = 0;
  let previousOriginalLine = 0;
  let previousOriginalColumn = 0;
  let previousName = 0;
  const lines = [];

  for (let line = 0; line <= maxLine; line += 1) {
    const segments = byLine.get(line) ?? [];
    let previousGeneratedColumn = 0;
    const encoded = [];

    for (const mapping of segments) {
      const fields = [mapping.generated.column - previousGeneratedColumn];
      previousGeneratedColumn = mapping.generated.column;

      if (mapping.original !== null) {
        const currentSource = sourceIndex.get(mapping.original.source);
        fields.push(currentSource - previousSource);
        previousSource = currentSource;
        fields.push(mapping.original.line - previousOriginalLine);
        previousOriginalLine = mapping.original.line;
        fields.push(mapping.original.column - previousOriginalColumn);
        previousOriginalColumn = mapping.original.column;

        if (mapping.name !== undefined) {
          const currentName = nameIndex.get(mapping.name);
          fields.push(currentName - previousName);
          previousName = currentName;
        }
      }

      encoded.push(fields.map(encodeVlq).join(''));
    }

    lines.push(encoded.join(','));
  }

  return lines.join(';');
}

function encodeVlq(value) {
  let vlq = value < 0 ? ((-value) << 1) | 1 : value << 1;
  let output = '';
  do {
    let digit = vlq & 31;
    vlq >>>= 5;
    if (vlq > 0) digit |= 32;
    output += BASE64[digit];
  } while (vlq > 0);
  return output;
}

function validatePosition(position, label) {
  if (!position || typeof position !== 'object') throw new TypeError(`${label} must be an object`);
  for (const field of ['line', 'column']) {
    if (!Number.isInteger(position[field]) || position[field] < 0) {
      throw new RangeError(`${label}.${field} must be a non-negative integer`);
    }
  }
}

function comparePosition(a, b) {
  return a.line - b.line || a.column - b.column;
}

function positionKey(position) {
  return `${position.line}:${position.column}`;
}

function clonePosition(position) {
  return { line: position.line, column: position.column };
}

function cloneOriginal(original) {
  return { source: original.source, line: original.line, column: original.column };
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
