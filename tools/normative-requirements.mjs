const LIST_ITEM = /^\s*(?:[-*+]|\d+\.)\s+/;
const NORMATIVE_KEYWORD = /\b(MUST NOT|MUST)\b/g;
const SENTENCE_BOUNDARY = /(?<=[.!?])\s+(?=[A-Z`“])/;

function cleanListItem(line) {
  return line.replace(LIST_ITEM, '').trim();
}

function splitSentences(line) {
  return line.trim().split(SENTENCE_BOUNDARY).map((part) => part.trim()).filter(Boolean);
}

function normativeMatches(text) {
  return [...text.matchAll(NORMATIVE_KEYWORD)];
}

function isAuthorityDefinition(line) {
  return line.startsWith('- **MUST:**') ||
    line.startsWith('- **MUST NOT:**') ||
    line.startsWith('Every MUST or MUST NOT requirement must map to');
}

export function extractNormativeRequirements(source) {
  const lines = source.split(/\r?\n/);
  const requirements = [];
  let section = 'Document';
  let subsection = '';

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const sourceLine = index + 1;

    if (line.startsWith('## ')) {
      section = line.slice(3).trim();
      subsection = '';
    } else if (line.startsWith('### ')) {
      subsection = line.slice(4).trim();
    }

    if (isAuthorityDefinition(line) || !line.includes('MUST')) continue;

    const leadMatches = normativeMatches(line);
    if (leadMatches.length === 0) continue;

    if (line.endsWith(':')) {
      const inherited = [];
      let cursor = index + 1;
      while (cursor < lines.length) {
        const candidate = lines[cursor];
        if (!candidate.trim()) {
          cursor += 1;
          continue;
        }
        if (!LIST_ITEM.test(candidate)) break;
        inherited.push({ sourceLine: cursor + 1, text: cleanListItem(candidate) });
        cursor += 1;
      }

      if (inherited.length > 0) {
        const governingOperator = leadMatches.at(-1);
        for (const item of inherited) {
          requirements.push({
            keyword: governingOperator[1],
            operatorIndex: 1,
            text: item.text,
            sourceLine: item.sourceLine,
            governingClause: line,
            governingLine: sourceLine,
            section,
            subsection,
            provenance: 'inherited'
          });
        }
        index = cursor - 1;
        continue;
      }
    }

    for (const sentence of splitSentences(line)) {
      const matches = normativeMatches(sentence);
      matches.forEach((match, operatorIndex) => {
        requirements.push({
          keyword: match[1],
          operatorIndex: operatorIndex + 1,
          text: sentence,
          sourceLine,
          governingClause: null,
          governingLine: null,
          section,
          subsection,
          provenance: 'direct'
        });
      });
    }
  }

  return requirements;
}
