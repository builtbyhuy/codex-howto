'use strict';
const fs=require('node:fs');const path=require('node:path');
const proposed=JSON.parse(fs.readFileSync(path.join(__dirname,'legacy-launch.json'),'utf8'));
const removed=proposed.command==='codex'&&proposed.args.includes('mcp-server');
console.log(JSON.stringify({kind:'static-migration-audit',executedLaunch:false,removedCommand:removed,direction:proposed.direction,recommendation:'For the bounded README summary evaluate codex exec; app-server is a different protocol with current support limits. External MCP consumption remains separate.'},null,2));

