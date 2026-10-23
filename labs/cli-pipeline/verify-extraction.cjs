'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {validateExtraction}=require('./validate-extraction.cjs');
const {invocation}=require('./capture-codex.cjs');
function verifyExtraction(){
 const read=p=>fs.readFileSync(path.join(__dirname,'exercises',p),'utf8');
 const results=[];
 for(const project of ['red','blue']){
  const checked=validateExtraction(read(`answers/${project}-valid.json`),read(`projects/${project}/README.md`));assert.equal(checked.facts,'verified against fixture');results.push({id:`${project}-current-facts`,...checked});
  const plan=invocation(project,path.join('fictional-output',project));assert.equal(plan.args[plan.args.indexOf('--cd')+1],path.join(__dirname,'exercises/projects',project));assert(plan.args.includes('read-only'));assert(!plan.args.includes('--yolo'));results.push({id:`${project}-invocation-plan`,cwd:plan.cwd,output:plan.outputDirectory,clientExecuted:false});
 }
 const wrong=validateExtraction(read('answers/red-invented.json'),read('projects/red/README.md'));assert.equal(wrong.structure,'valid');assert.equal(wrong.facts,'rejected');results.push({id:'schema-shaped-lie',...wrong});
 const wrongDirectory=validateExtraction(read('answers/red-valid.json'),read('projects/blue/README.md'));assert.equal(wrongDirectory.facts,'rejected');results.push({id:'wrong-project-output',...wrongDirectory});
 for(const file of ['missing-field.json','malformed.txt']){const r=validateExtraction(read(`answers/${file}`),read('projects/red/README.md'));assert.equal(r.structure,'invalid');results.push({id:file,...r});}
 const missing=validateExtraction(read('answers/red-valid.json'),'# Empty project\n');assert.equal(missing.facts,'unverifiable');results.push({id:'missing-source-contract',...missing});
 return {kind:'offline final-object validation and invocation planning; no Codex child started',cases:results};
}
if(require.main===module){try{console.log(JSON.stringify(verifyExtraction(),null,2));}catch(e){console.error(e.stack);process.exitCode=1;}}
module.exports={verifyExtraction};
