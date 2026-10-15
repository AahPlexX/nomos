import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as compiler from '../packages/compiler/src/index.mjs';
import * as runtimeInternal from '../packages/runtime/src/internal.mjs';

const missing = [];
if (typeof compiler.lowerTemplateDom !== 'function') missing.push('compiler.lowerTemplateDom');
if (typeof runtimeInternal.mountTemplate !== 'function') missing.push('runtimeInternal.mountTemplate');
if (typeof runtimeInternal.bindAttribute !== 'function') missing.push('runtimeInternal.bindAttribute');
if (typeof runtimeInternal.bindAttributes !== 'function') missing.push('runtimeInternal.bindAttributes');
assert.deepEqual(missing, [], `template DOM materialization seam is incomplete: ${missing.join(', ')}`);

const source = `<main data-label="A &amp; B" data-count={count} {...attrs} class="count {count}" inert={inert}>A &amp; B {1 + 2}<svg><circle></circle></svg></main><a href={href}>Docs</a>`;
const component = compiler.parseComponent(source, { filename: 'BrowserDom.nomos' });
const lowered = compiler.lowerTemplateDom(source, component, {
  filename: 'BrowserDom.nomos',
  targetIdentifier: 'target',
});
assert.equal(lowered.diagnostics.length, 0);
assert.ok(lowered.code);
assert.equal(lowered.attributeBindings.length, 5);
assert.equal(lowered.attributeGroups.length, 1);

const runtimeImportClause = lowered.runtimeImports
  .map(({ imported, local }) => `${imported} as ${local}`)
  .join(', ');
const elementMarkerAttributeLiteral = JSON.stringify(lowered.elementMarkerAttribute);

const browserModule = `
import { ${runtimeImportClause} } from '/packages/runtime/src/internal.mjs';
import { createOwner, disposeOwner, mountOwner, runWithOwner } from '/packages/runtime/src/reactivity.mjs';

const target = document.querySelector('#app');
const owner = createOwner(null, { name: 'browser-root' });
const count = 4;
const attrs = { 'data-count': 9, class: 'spread-class', inert: false, 'data-spread': 'ok' };
const inert = true;
const href = '/safe-docs';
const elementMarkerAttribute = ${elementMarkerAttributeLiteral};

try {
  runWithOwner(owner, () => {
${indent(lowered.code, 4)}
  });
  mountOwner(owner);
  await new Promise((resolve) => queueMicrotask(resolve));

  const main = target.querySelector('main');
  if (!main) throw new Error('main element was not materialized');
  if (main.getAttribute('data-label') !== 'A & B') throw new Error('static attribute entity decoding diverged from HTML parsing');
  if (main.getAttribute('data-count') !== '9') throw new Error('spread did not override an earlier explicit attribute: ' + main.getAttribute('data-count'));
  if (main.getAttribute('data-spread') !== 'ok') throw new Error('spread-only ordinary attribute mismatch');
  if (main.getAttribute('class') !== 'count 4') throw new Error('later explicit attribute did not override spread: ' + main.getAttribute('class'));
  if (!main.hasAttribute('inert') || main.getAttribute('inert') !== '') throw new Error('later explicit boolean attribute did not override spread');
  if (elementMarkerAttribute && main.hasAttribute(elementMarkerAttribute)) throw new Error('temporary Nomos element marker leaked into mounted DOM');
  if (main.textContent !== 'A & B 3') throw new Error('static/dynamic text materialization mismatch: ' + JSON.stringify(main.textContent));
  const circle = main.querySelector('circle');
  if (!circle) throw new Error('SVG child was not materialized');
  if (circle.namespaceURI !== 'http://www.w3.org/2000/svg') throw new Error('SVG namespace was not preserved: ' + circle.namespaceURI);

  const anchor = target.querySelector('a');
  if (!anchor) throw new Error('dynamic URL anchor was not materialized');
  if (anchor.getAttribute('href') !== '/safe-docs') throw new Error('dynamic URL attribute did not use the runtime binding path: ' + anchor.getAttribute('href'));
  if (elementMarkerAttribute && anchor.hasAttribute(elementMarkerAttribute)) throw new Error('temporary Nomos URL element marker leaked into mounted DOM');

  disposeOwner(owner);
  if (target.childNodes.length !== 0) throw new Error('owned template roots were not removed on disposal');
  document.documentElement.dataset.nomosResult = 'pass';
} catch (error) {
  document.documentElement.dataset.nomosResult = 'fail';
  document.body.append(document.createElement('pre')).textContent = error?.stack ?? String(error);
}
`;

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Nomos DOM verification</title></head><body><div id="app"></div><script type="module" src="/test.js"></script></body></html>`;
const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const server = createServer(async (request, response) => {
  try {
    if (request.url === '/' || request.url === '/index.html') {
      response.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'content-security-policy': "require-trusted-types-for 'script'; trusted-types nomos",
      });
      response.end(html);
      return;
    }
    if (request.url === '/test.js') {
      response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
      response.end(browserModule);
      return;
    }
    if (request.url?.startsWith('/packages/') && request.url.endsWith('.mjs')) {
      const relative = normalize(request.url.slice(1));
      const absolute = resolve(repoRoot, relative);
      const allowedRoots = [resolve(repoRoot, 'packages/runtime/src'), resolve(repoRoot, 'packages/shared/src')];
      if (!allowedRoots.some((root) => absolute === root || absolute.startsWith(root + '/'))) {
        response.writeHead(403).end('forbidden');
        return;
      }
      const content = await readFile(absolute, 'utf8');
      response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
      response.end(content);
      return;
    }
    response.writeHead(404).end('not found');
  } catch (error) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(error?.stack ?? String(error));
  }
});

await new Promise((resolveListen, rejectListen) => {
  server.once('error', rejectListen);
  server.listen(0, '127.0.0.1', resolveListen);
});

const profile = await mkdtemp(join(tmpdir(), 'nomos-chrome-'));
try {
  const chrome = await findChrome();
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}/`;
  const result = await run(chrome, [
    '--headless=new', '--no-sandbox', '--disable-gpu', `--user-data-dir=${profile}`,
    '--virtual-time-budget=1500', '--dump-dom', url,
  ]);
  if (result.code !== 0) throw new Error(`Chrome exited ${result.code}:\n${result.stderr}`);
  assert.match(result.stdout, /data-nomos-result="pass"/, `browser DOM verification did not pass:\n${result.stdout}\n${result.stderr}`);
  console.log(`Browser DOM verification passed with ${await chromeVersion(chrome)} under Trusted Types enforcement.`);
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
  await rm(profile, { recursive: true, force: true });
}

function indent(text, spaces) {
  const prefix = ' '.repeat(spaces);
  return text.split('\n').map((line) => prefix + line).join('\n');
}

async function findChrome() {
  const candidates = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
  for (const candidate of candidates) {
    try { await access(candidate, fsConstants.X_OK); return candidate; } catch {}
  }
  throw new Error('Chrome/Chromium is required for the Phase 1 browser DOM verification gate.');
}

function run(command, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = ''; let stderr = '';
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', rejectRun);
    child.once('close', (code) => resolveRun({ code, stdout, stderr }));
  });
}

async function chromeVersion(chrome) {
  const result = await run(chrome, ['--version']);
  return result.stdout.trim() || result.stderr.trim() || 'unknown Chrome version';
}