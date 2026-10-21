'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { review } = require('./skill/scripts/review.cjs');
const fixture = name => path.join(__dirname,'fixtures',name);
test('positive: nonexistent start and missing test guidance have evidence', () => {
 const r=review(fixture('broken')); assert.deepEqual(r.findings.map(f=>f.code),['UNKNOWN_SCRIPT','MISSING_TEST_GUIDANCE']); assert.equal(r.findings[0].readmeLine,4); assert.equal(r.executed,false);
});
test('negative: complete guidance produces no manufactured finding',()=>assert.deepEqual(review(fixture('complete')).findings,[]));
test('missing configuration is unknown, not nonexistent commands',()=>{const r=review(fixture('missing-config'));assert.deepEqual(r.findings,[]);assert.match(r.unknowns[0],/package.json is missing/);});
test('hostile README is data for the helper, with unchanged source files',()=>{const dir=fixture('injection');const before=fs.readFileSync(path.join(dir,'README.md'),'utf8');assert.equal(review(dir).findings.length,2);assert.equal(fs.readFileSync(path.join(dir,'README.md'),'utf8'),before);});
test('missing README is explicit',()=>assert.match(review(fixture('missing-readme')).unknowns[0],/README.md is missing/));
test('skill links, metadata, and case matrix exist',()=>{const s=fs.readFileSync(path.join(__dirname,'skill','SKILL.md'),'utf8');assert.match(s,/name: readme-evidence-review/);for(const p of ['references/rubric.md','references/reference-outputs.md','scripts/review.cjs'])assert.ok(fs.existsSync(path.join(__dirname,'skill',p)));assert.equal(require('./cases.json').length,5);});
test('npm start with a root server.js is an implicit command, not a missing script',()=>{const r=review(fixture('implicit-start'));assert.deepEqual(r.findings,[]);assert.ok(r.unknowns.some(x=>/server.js fallback/.test(x)));assert.equal(r.executed,false);});
test('npm run check counts as verification guidance without a literal test script',()=>assert.deepEqual(review(fixture('check-guidance')).findings,[]));
test('a named script under Verification and a test:unit script both provide guidance',()=>{for(const name of ['named-verification','unit-guidance'])assert.deepEqual(review(fixture(name)).findings,[],name);});
test('unsupported pnpm commands are unknown rather than a missing-guidance finding',()=>{const r=review(fixture('pnpm-guidance'));assert.deepEqual(r.findings,[]);assert.ok(r.unknowns.some(x=>/Unsupported package-manager/.test(x)));});
test('null and array package JSON produce explicit shape unknowns without crashing',()=>{for(const name of ['null-config','array-config']){const r=review(fixture(name));assert.deepEqual(r.findings,[]);assert.match(r.unknowns[0],/must contain an object/);}});
test('array scripts and non-string script values cannot support command findings',()=>{for(const name of ['array-scripts','invalid-script-value']){const r=review(fixture(name));assert.deepEqual(r.findings,[]);assert.match(r.unknowns[0],/scripts must be an object of nonempty strings/);}});
test('npm run option syntax stays unknown instead of treating an option as a script',()=>{const r=review(fixture('unsupported-npm-flags'));assert.deepEqual(r.findings,[]);assert.ok(r.unknowns.some(x=>/Unsupported npm run option/.test(x)));});


