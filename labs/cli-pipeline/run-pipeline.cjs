'use strict';
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { consumeJsonl, markdown, EXIT, MAX_BYTES } = require('./report.cjs');

function runFixture(name, { executable = process.execPath, timeout = 5000 } = {}) {
  const child = spawnSync(executable, [path.join(__dirname, 'fixture-producer.cjs'), name], {
    shell: false, encoding: 'utf8', timeout, maxBuffer: MAX_BYTES, windowsHide: true,
  });
  if (child.error) return { report: null, stderr: child.stderr || '', exitCode: EXIT.usage, error: child.error.message };
  const report = consumeJsonl(child.stdout || '', { producerExitCode: child.status, producerSignal: child.signal });
  return { report, stderr: child.stderr || '', exitCode: report.exitCode, error: null };
}
if (require.main === module) {
  const result = runFixture(process.argv[2] || 'success');
  process.stderr.write(result.stderr);
  if (result.error) process.stderr.write(`Producer could not run: ${result.error}\n`);
  else process.stdout.write(markdown(result.report));
  process.exitCode = result.exitCode;
}
module.exports = { runFixture };
