'use strict';
const fs=require('node:fs');
const path=require('node:path');
function validateExtraction(input,source){
 const result={structure:'invalid',facts:'not checked',errors:[]};
 let value;
 try{value=JSON.parse(input.replace(/^\uFEFF/,''));}catch{result.errors.push('Input is not one valid final JSON object. JSONL events belong in report.cjs.');return result;}
 const keys=['project_name','documented_checks','deployment_url','unknowns'];
 if(!value||Array.isArray(value)||typeof value!=='object'){result.errors.push('Expected an object.');return result;}
 for(const key of keys)if(!Object.hasOwn(value,key))result.errors.push(`Missing required field: ${key}`);
 for(const key of Object.keys(value))if(!keys.includes(key))result.errors.push(`Unexpected field: ${key}`);
 if(typeof value.project_name!=='string')result.errors.push('project_name must be a string.');
 for(const key of ['documented_checks','unknowns'])if(!Array.isArray(value[key])||value[key].some(v=>typeof v!=='string'))result.errors.push(`${key} must be an array of strings.`);
 if(value.deployment_url!==null&&typeof value.deployment_url!=='string')result.errors.push('deployment_url must be a string or null.');
 if(result.errors.length)return result;
 result.structure='valid';
 // The fixed exercise format is deliberately explicit; this is not a general README parser.
 const project=source.match(/^Project: (.+)$/m)?.[1]?.trim();
 const checks=[...source.matchAll(/^Check: (.+)$/gm)].map(m=>m[1].trim());
 if(!project||!checks.length||!/^Deployment: not documented\s*$/m.test(source)){result.errors.push('Source is outside the documented exercise format.');result.facts='unverifiable';return result;}
 if(value.project_name!==project)result.errors.push('project_name disagrees with the current source.');
 if(JSON.stringify(value.documented_checks)!==JSON.stringify(checks))result.errors.push('documented_checks disagrees with the current source.');
 if(value.deployment_url!==null)result.errors.push('deployment_url is invented; the source does not document one.');
 if(!value.unknowns.includes('deployment_url'))result.errors.push('unknowns must include deployment_url.');
 result.facts=result.errors.length?'rejected':'verified against fixture';return result;
}
function main(argv){
 if(argv.length!==4||argv[0]!=='--input'||argv[2]!=='--source'){console.error('Usage: node validate-extraction.cjs --input final.json --source README.md');return 2;}
 try{const result=validateExtraction(fs.readFileSync(path.resolve(argv[1]),'utf8'),fs.readFileSync(path.resolve(argv[3]),'utf8'));console.log(JSON.stringify(result,null,2));return result.structure!=='valid'?2:result.facts!=='verified against fixture'?3:0;}
 catch(e){console.error(`Cannot validate: ${e.message}`);return 4;}
}
if(require.main===module)process.exitCode=main(process.argv.slice(2));
module.exports={validateExtraction,main};
