import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const parts = [1, 2, 3, 4].map((part) => new URL(`docs/prd/source-part-${String(part).padStart(2, '0')}.md`, root));
const source = Buffer.concat(await Promise.all(parts.map((url) => readFile(url))));
const digest = createHash('sha256').update(source).digest('hex');
const expected = 'b07950df46be388b10497063c5aabc01a20402a13dcebea0c8ec847869147690';
assert.equal(digest, expected, 'stored PRD fragments do not reconstruct the authoritative supplied PRD');
console.log(`PRD source verified: sha256:${digest}; ${source.length} bytes.`);
