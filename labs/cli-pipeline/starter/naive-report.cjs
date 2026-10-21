'use strict';
// Deliberately broken exercise starter. Do not use it for real task acceptance.
const fs = require('node:fs');
const event = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
console.log(event.type === 'turn.completed' ? 'Success' : 'Unknown');
// Defects to investigate: JSONL is not one object; producer status is missing;
// a final-looking message, failed event or truncated stream is not handled.
