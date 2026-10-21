'use strict';
// Synthetic candidate files, not recorded model outputs or performance measurements.
const fs=require('node:fs'),path=require('node:path'),{validateArtifact}=require('./validate-artifact.cjs');
for(const [name,file]of [['synthetic incomplete','candidate-incomplete.json'],['fixture reference','expected-review-result.json']]){
 const value=JSON.parse(fs.readFileSync(path.join(__dirname,file),'utf8')),errors=validateArtifact('review',value);
 console.log(name+': '+(errors.length?'FAIL - '+errors[0]:'PASS - matches deterministic fixture evidence'));
}
console.log('No model comparison was run; use the same inputs and this rubric for a real supported-effort experiment.');

