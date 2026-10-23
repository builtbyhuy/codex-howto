'use strict';
const { verifyReference } = require('./workspace.cjs');
if (process.argv.slice(2).some(arg=>arg!=='--git')) { console.error('Usage: node verify-reference.cjs [--git]'); process.exitCode=2; }
else try { console.log(JSON.stringify(verifyReference({withGit:process.argv.includes('--git')}),null,2)); }
catch(error) { console.error(error.message); process.exitCode=1; }
