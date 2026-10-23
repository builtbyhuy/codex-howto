'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {run}=require('./run.cjs');
const {normalizeStatus}=require('./solution/normalize.cjs');
const {buildReport}=require('./solution/report.cjs');
test('frozen baseline exposes intended failed behaviors rather than a fabricated passing baseline',()=>{const r=run('baseline');assert.equal(r.passed,false);assert.equal(r.report.done,1);assert.equal(r.report.doneMinutes,80);});
test('solution composes both work packages to the exact result',()=>{const r=run('solution');assert.equal(r.passed,true);assert.deepEqual(r.report,{total:4,done:2,doneMinutes:55});});
test('A handles padded case and rejects wrong types and values',()=>{assert.equal(normalizeStatus(' DONE '),'done');assert.equal(normalizeStatus(' OPEN '),'open');assert.throws(()=>normalizeStatus(null),TypeError);assert.throws(()=>normalizeStatus('later'),RangeError);});
test('B works independently from A using the frozen normalized contract',()=>assert.deepEqual(buildReport([{id:'x',status:'open',minutes:90},{id:'y',status:'done',minutes:5}]),{total:2,done:1,doneMinutes:5}));
test('B rejects malformed records and the candidate grader rejects missing validation mutants',()=>{
 for(const tasks of [[{id:3,status:'done',minutes:1}],[{id:'x',status:'later',minutes:1}],[{id:'x',status:'done',minutes:NaN}],[{id:'x',status:'done',minutes:-1}],[{id:'x',status:' DONE ',minutes:1}],[{id:'x',status:'done',minutes:1},{id:'x',status:'done',minutes:2}]])assert.throws(()=>buildReport(tasks),TypeError);
 const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
 const report=path.join(__dirname,'solution/report.cjs'),source=fs.readFileSync(report,'utf8');
 for(const clause of [null,"typeof t.id!=='string'||","!['open','done','blocked'].includes(t.status)||","!Number.isFinite(t.minutes)||"]){
  if(clause)assert.ok(source.includes(clause));const mutant=clause?source.replace(clause,''):source;
  const code="const Module=require('node:module');const m=new Module("+JSON.stringify(report)+");m.filename="+JSON.stringify(report)+";m._compile("+JSON.stringify(mutant)+","+JSON.stringify(report)+");require.cache["+JSON.stringify(path.join(__dirname,'starter/report.cjs'))+"]=m;require.cache["+JSON.stringify(path.join(__dirname,'starter/normalize.cjs'))+"]={exports:require("+JSON.stringify(path.join(__dirname,'solution/normalize.cjs'))+")};require("+JSON.stringify(path.join(__dirname,'candidate.test.cjs'))+");";
  const result=spawnSync(process.execPath,['-e',code],{encoding:'utf8',windowsHide:true});
  if(clause){assert.equal(result.status,1,'grader accepted removed clause: '+clause);assert.match(result.stdout,/candidate B rejects duplicate and malformed input/);assert.match(result.stdout,/pass 3/);assert.match(result.stdout,/fail 1/);}
  else{assert.equal(result.status,0,'grader rejected the complete reference solution');assert.match(result.stdout,/pass 4/);assert.match(result.stdout,/fail 0/);}
 }
});
test('B preserves caller objects and empty input has an explicit zero result',()=>{const t=[{id:'x',status:'done',minutes:5}],before=JSON.stringify(t);buildReport(t);assert.equal(JSON.stringify(t),before);assert.deepEqual(buildReport([]),{total:0,done:0,doneMinutes:0});});
test('ownership is disjoint and integration depends on both packages',()=>{const p=require('./work-packages.json');assert.ok(!p[0].owns.some(f=>p[1].owns.includes(f)));assert.deepEqual(p[2].dependsOn,['A','B']);});


