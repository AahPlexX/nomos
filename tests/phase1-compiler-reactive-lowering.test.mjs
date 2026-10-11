import test from 'node:test';
import assert from 'node:assert/strict';
import { lowerScript } from '../packages/compiler/src/script-lowering.mjs';

test('lowers aliased state and derive imports with transparent reads/writes', () => {
  const result = lowerScript(`import { state as s, derive as d } from 'nomos';\nlet count = s(1);\nconst doubled = d(() => count * 2);\nfunction inc(){ count += 1; return count; }\nconsole.log(doubled);`);
  assert.equal(result.diagnostics.length, 0);
  assert.match(result.code, /createStateCell as __n_state/);
  assert.match(result.code, /createDerived as __n_derive/);
  assert.match(result.code, /let count = __n_state\(1, \{ name: "count" \}\)/);
  assert.match(result.code, /__n_write\(count, __n_read\(count\) \+ 1\)/);
  assert.match(result.code, /return __n_read\(count\)/);
  assert.match(result.code, /console\.log\(__n_read\(doubled\)\)/);
});

test('respects shadowing instead of identifier spelling', () => {
  const result = lowerScript(`import { state } from 'nomos';\nlet value = state(1);\nfunction local(state){ return state(2) + value; }`);
  assert.equal(result.diagnostics.length, 0);
  assert.match(result.code, /return state\(2\) \+ __n_read\(value\)/);
});

test('lowers state.raw and nested property mutation through the deep proxy', () => {
  const result = lowerScript(`import { state } from 'nomos';\nlet raw = state.raw({ n: 1 });\nlet deep = state({ n: 1 });\ndeep.n = raw.n;`);
  assert.equal(result.diagnostics.length, 0);
  assert.match(result.code, /__n_state\(\{ n: 1 \}, \{ name: "raw", raw: true \}\)/);
  assert.match(result.code, /__n_read\(deep\)\.n = __n_read\(raw\)\.n/);
});

test('supports prefix/postfix updates and root replacement', () => {
  const result = lowerScript(`import { state } from 'nomos'; let n=state(1); let a=n++; let b=++n; n = 9;`);
  assert.equal(result.diagnostics.length, 0);
  assert.match(result.code, /let a = __n_update\(n, 1, true\)/);
  assert.match(result.code, /let b = __n_update\(n, 1, false\)/);
  assert.match(result.code, /__n_write\(n, 9\)/);
});

test('rejects writes to derives', () => {
  const result = lowerScript(`import { derive } from 'nomos'; const total=derive(()=>1); total = 2;`);
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].code, 'NOMOS-REACTIVE-DERIVE-WRITE');
  assert.match(result.diagnostics[0].message, /Cannot write to derived value total/);
});

test('emits a real stage-local source map with embedded source content', () => {
  const source = `import { state } from 'nomos';\nlet count=state(0);\ncount += 1;`;
  const result = lowerScript(source, { filename: 'Counter.nomos.ts' });
  assert.equal(result.diagnostics.length, 0);
  assert.equal(result.map.version, 3);
  assert.deepEqual(result.map.sourcesContent, [source]);
  assert.match(result.map.mappings, /./);
});

test('component lowering preserves .nomos source coordinates and full sourcesContent', async () => {
  const { lowerComponentScript } = await import('../packages/compiler/src/script-lowering.mjs');
  const source = `<h1>Before</h1>\r\n<script lang="ts">\r\nimport { state } from 'nomos';\r\nlet count = state(0);\r\ncount++;\r\n</script>\r\n<p>After</p>`;
  const scriptStart = source.indexOf('<script');
  const scriptEnd = source.indexOf('</script>') + '</script>'.length;
  const component = { filename: 'Counter.nomos', sections: [{
    kind: 'script',
    raw: source.slice(scriptStart, scriptEnd),
    span: { start: { offset: scriptStart }, end: { offset: scriptEnd } },
  }] };
  const result = lowerComponentScript(source, component);
  assert.equal(result.diagnostics.length, 0);
  assert.equal(result.embedded.bodySpan.start.offset, source.indexOf('>', scriptStart) + 1);
  assert.equal(result.embedded.raw.indexOf('import'), 2);
  assert.deepEqual(result.map.sources, ['Counter.nomos']);
  assert.deepEqual(result.map.sourcesContent, [source]);
  assert.match(result.code, /__n_update\(count, 1, true\)/);
});

test('generated helper names avoid user binding collisions', () => {
  const result = lowerScript(`import { state } from 'nomos'; const __n_state = 'user'; let count = state(0); console.log(__n_state, count);`);
  assert.equal(result.diagnostics.length, 0);
  assert.match(result.code, /createStateCell as __n_state_1/);
  assert.match(result.code, /console\.log\(__n_state, __n_read\(count\)\)/);
});

test('statically rejects state writes during derive evaluation', () => {
  const result = lowerScript(`import { state, derive } from 'nomos'; let count=state(0); const bad=derive(()=>{ count += 1; return count; });`);
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].code, 'NOMOS-REACTIVE-DERIVE-WRITE');
  assert.match(result.diagnostics[0].message, /Cannot write reactive state count while a derive is evaluating/);
});

test('does not flag state writes inside a nested function merely returned by derive', () => {
  const result = lowerScript(`import { state, derive } from 'nomos'; let count=state(0); const fn=derive(()=>()=>{ count += 1; return count; });`);
  assert.equal(result.diagnostics.length, 0);
});

test('lowers a reactive root used as a for-of assignment target', () => {
  const result = lowerScript(`import { state } from 'nomos'; let item = state(0); const seen = []; for (item of [2, 3]) { seen.push(item); }`);
  assert.equal(result.diagnostics.length, 0);
  assert.doesNotMatch(result.code, /for\s*\(\s*__n_read\(item\)\s+of/);
  assert.match(result.code, /for\s*\([^)]*\s+of\s+\[2, 3\]\)/);
  assert.match(result.code, /__n_write\(item,/);
  assert.match(result.code, /seen\.push\(__n_read\(item\)\)/);
});

test('lowers a reactive root used as a for-in assignment target without changing shadowed loop declarations', () => {
  const reactive = lowerScript(`import { state } from 'nomos'; let key = state(''); const seen = []; for (key in { a: 1 }) { seen.push(key); }`);
  assert.equal(reactive.diagnostics.length, 0);
  assert.doesNotMatch(reactive.code, /for\s*\(\s*__n_read\(key\)\s+in/);
  assert.match(reactive.code, /__n_write\(key,/);
  assert.match(reactive.code, /seen\.push\(__n_read\(key\)\)/);

  const shadowed = lowerScript(`import { state } from 'nomos'; let key = state('outer'); for (let key in { a: 1 }) { console.log(key); }`);
  assert.equal(shadowed.diagnostics.length, 0);
  assert.match(shadowed.code, /for \(let key in \{ a: 1 \}\)/);
  assert.match(shadowed.code, /console\.log\(key\)/);
});
