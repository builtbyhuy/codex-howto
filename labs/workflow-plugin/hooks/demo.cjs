'use strict';
const fs=require('node:fs'),path=require('node:path'),{response}=require('./context.cjs');
for(const name of ['session-start.json','tool-success.json','tool-error.json']){
 const event=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures',name),'utf8'));
 const out=response(event);console.log(name+': '+out.hookSpecificOutput.hookEventName+' | '+out.hookSpecificOutput.additionalContext);
}
console.log('Offline fixtures only; hook delivery and trust in Codex were not exercised.');

