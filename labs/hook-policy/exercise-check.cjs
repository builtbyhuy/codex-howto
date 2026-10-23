'use strict';
const fs=require('node:fs'),path=require('node:path');
const baseline=require('./guard.cjs');
const candidateFlag=process.argv.indexOf('--candidate');
const candidateFile=process.argv.includes('--solution')?path.join(__dirname,'solution/guard.cjs'):candidateFlag>=0?path.resolve(process.argv[candidateFlag+1]||''):path.join(__dirname,'learner.cjs');
try{
 const candidate=require(candidateFile);
 if(typeof candidate.evaluate!=='function')throw new Error('Candidate must export evaluate(event).');
 let failures=0;
 for(const file of fs.readdirSync(path.join(__dirname,'fixtures')).filter(name=>name.endsWith('.json')&&name!=='extension.json')){
  const event=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures',file),'utf8'));
  const expected=baseline.evaluate(event),actual=candidate.evaluate(event);
  if(actual.classification!==expected.classification){console.log('Regression failed: '+file+' expected '+expected.classification+', got '+actual.classification);failures++;}
 }
 const extension=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/extension.json'),'utf8'));
 const generated=candidate.evaluate(extension);
 console.log('generated/report.js: '+generated.classification);
 if(generated.classification!=='deny'){console.log('Exercise pending: edit learner.cjs; keep the frozen baseline unchanged. Reference: --solution');failures++;}
 const lookalike=structuredClone(extension);lookalike.tool_input.command=lookalike.tool_input.command.replace('generated/report.js','src/generated-helper.js');
 if(candidate.evaluate(lookalike).classification!=='allow'){console.log('Regression failed: src/generated-helper.js must remain allowed.');failures++;}
 if(failures)process.exitCode=1;
 else console.log('Extension criterion and candidate regression checks passed.');
}catch(error){console.error('Candidate check failed: '+error.message);process.exitCode=1;}

