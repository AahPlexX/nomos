import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { selectTests } from './conformance-core.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(resolve(root, 'conformance/manifest.json'), 'utf8'));
const ids = process.argv.slice(2).filter((arg) => arg.startsWith('NCON-'));
const selected = selectTests(manifest, ids);

if (selected.length === 0) {
  console.log('No conformance tests selected.');
  process.exit(0);
}

const unsupported = selected.flatMap((entry) => entry.environments.filter((environment) => environment !== 'node'));
if (unsupported.length) {
  console.error(`This runner cannot satisfy environments yet: ${[...new Set(unsupported)].join(', ')}`);
  process.exit(2);
}

const files = [...new Set(selected.map((entry) => resolve(root, entry.file)))];
const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(result.status ?? 1);
