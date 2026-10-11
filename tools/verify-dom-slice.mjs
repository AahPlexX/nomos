import { spawnSync } from 'node:child_process';

const checks = [
  ['unit', [process.execPath, '--test', 'tests/phase1-template-dom-materialization.test.mjs']],
  ['browser', [process.execPath, 'tools/verify-browser-dom.mjs']],
];

let failed = false;
for (const [label, [command, ...args]] of checks) {
  console.log(`\n[dom-slice:${label}] ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) {
    console.error(result.error);
    failed = true;
  } else if (result.status !== 0) {
    failed = true;
  }
}

if (failed) process.exitCode = 1;
