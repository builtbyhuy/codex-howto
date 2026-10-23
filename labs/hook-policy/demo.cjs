'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {evaluate}=require('./guard.cjs');
for(const name of ['allow.json','deny-protected.json','deny-traversal.json','deny-move.json','irrelevant.json','malformed-field.json']){
 const e=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures',name),'utf8'));
 const r=evaluate(e);console.log(name+': '+r.classification+' | '+r.reason);
}
const malformed=spawnSync(process.execPath,[path.join(__dirname,'guard.cjs')],{input:'{bad-json',encoding:'utf8'});
console.log('malformed JSON: '+JSON.parse(malformed.stdout).hookSpecificOutput.permissionDecision+' | handler exit '+malformed.status);
const launch=spawnSync(process.execPath,[path.join(__dirname,'not-an-installed-handler.cjs')],{input:'{}',encoding:'utf8'});
console.log('missing handler: launch failed | exit '+launch.status+' | no policy response');

