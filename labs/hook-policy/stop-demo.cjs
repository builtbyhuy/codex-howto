'use strict';
const fs=require('node:fs'),path=require('node:path'),{createWorkspace}=require('./create-workspace.cjs'),{hash,evaluateStop}=require('./stop-review.cjs');
const w=createWorkspace({withStop:true}),event={hook_event_name:'Stop',cwd:w.root,stop_hook_active:false};
function show(label,e=event){const r=evaluateStop(e);console.log(label+': '+(r.output.decision==='block'?'continue once':'no continuation')+' | '+r.diagnostic);}
show('missing verification');
const complete='# Fictional practice guide\n\n## Running\n\nRun local checks.\n\n## Verification\n\nCompare the exact result.\n';fs.writeFileSync(path.join(w.root,'candidate.md'),complete);show('stale evidence');
fs.writeFileSync(path.join(w.root,'review-evidence.json'),JSON.stringify({artifactSha256:hash(complete),checks:[{id:'running-section',passed:true},{id:'verification-section',passed:true}]}));show('fresh matching evidence');
show('already continued',{...event,stop_hook_active:true});
console.log('Scratch artifacts: '+w.root);console.log('Actual local file checks; no Codex session, native hook delivery or model evaluation ran.');
