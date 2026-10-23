'use strict';
const fs=require('node:fs');const path=require('node:path');
function run(variant='starter'){
 if(!['baseline','starter','solution'].includes(variant))throw new Error('variant must be baseline, starter or solution');
 const {normalizeStatus}=require(path.join(__dirname,variant,'normalize.cjs'));
 const {buildReport}=require(path.join(__dirname,variant,'report.cjs'));
 const input=JSON.parse(fs.readFileSync(path.join(__dirname,'data','tasks.json')));
 const before=JSON.stringify(input);
 const normalized=input.map(t=>({...t,status:normalizeStatus(t.status)}));
 const report=buildReport(normalized);
 const checks=[
  {name:'normalizes padded DONE',passed:normalized[0].status==='done'},
  {name:'normalizes padded OPEN',passed:normalized[2].status==='open'},
  {name:'counts exactly two completed tasks',passed:report.done===2},
  {name:'sums completed effort only',passed:report.doneMinutes===55},
  {name:'preserves total and source input',passed:report.total===4&&JSON.stringify(input)===before}
 ];
 return {kind:'deterministic-integration-check',variant,report,checks,passed:checks.every(c=>c.passed)};
}
if(require.main===module){
 try{const output=run(process.argv[2]||'starter');console.log(JSON.stringify(output,null,2));if(!output.passed)process.exitCode=1;}
 catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={run};


