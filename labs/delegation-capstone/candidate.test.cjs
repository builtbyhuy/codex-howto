'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {normalizeStatus}=require('./starter/normalize.cjs');
const {buildReport}=require('./starter/report.cjs');
const {run}=require('./run.cjs');
test('candidate A trims statuses and rejects invalid values',()=>{assert.equal(normalizeStatus(' DONE '),'done');assert.throws(()=>normalizeStatus(null),TypeError);assert.throws(()=>normalizeStatus('later'),RangeError);});
test('candidate B sums completed effort only with independent records',()=>assert.deepEqual(buildReport([{id:'x',status:'open',minutes:90},{id:'y',status:'done',minutes:5}]),{total:2,done:1,doneMinutes:5}));
test('candidate B rejects duplicate and malformed input without mutation',()=>{for(const tasks of [null,{},[null],[{id:3,status:'done',minutes:1}],[{id:'x',status:'later',minutes:1}],[{id:'x',status:' DONE ',minutes:1}],[{id:'x',status:'done',minutes:NaN}],[{id:'x',status:'done',minutes:Infinity}],[{id:'x',status:'done',minutes:-1}],[{id:'x',status:'done',minutes:'3'}],[{id:'x',status:'done',minutes:1},{id:'x',status:'done',minutes:2}]])assert.throws(()=>buildReport(tasks),TypeError);const t=[{id:'z',status:'done',minutes:3}],before=JSON.stringify(t);buildReport(t);assert.equal(JSON.stringify(t),before);});
test('candidate integrates both modules',()=>assert.equal(run('starter').passed,true));
