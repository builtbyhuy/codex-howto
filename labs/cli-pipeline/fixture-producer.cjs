'use strict';
// Offline synthetic producer. It never launches Codex or accesses a network.
const fs = require('node:fs');
const path = require('node:path');
const fixtures = { success: ['success.jsonl', 0], error: ['error.jsonl', 0], fatal: ['fatal.jsonl', 0],
  malformed: ['malformed.jsonl', 0], incomplete: ['incomplete.jsonl', 0], 'producer-failure': ['success.jsonl', 7] };
const entry = fixtures[process.argv[2]];
if (!entry) { process.stderr.write('Unknown synthetic fixture.\n'); process.exitCode = 64; }
else {
  process.stderr.write('SYNTHETIC FIXTURE: no Codex service was called.\n');
  const bytes = fs.readFileSync(path.join(__dirname, 'fixtures', entry[0]));
  // Small writes exercise collection across chunk boundaries without artificial waits.
  for (let index = 0; index < bytes.length; index += 37) process.stdout.write(bytes.subarray(index, index + 37));
  process.exitCode = entry[1];
}
