'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {PACKAGE,MARKETPLACE,createWorkspace,readWorkspace,inside}=require('./native-workspace.cjs');
const {argumentsFor}=require('./native-client.cjs'),{checkExtension}=require('./extension/check.cjs'),{applyReference}=require('./extension/solution.cjs');
test('a generated marketplace contains a complete ordinary package and an empty isolated credential store',()=>{
 const w=createWorkspace(),r=readWorkspace(w.root);assert.equal(r.packageRoot,w.packageRoot);assert.ok(inside(w.root,w.codexHome));
 const catalog=JSON.parse(fs.readFileSync(path.join(w.marketplaceRoot,'.agents/plugins/marketplace.json'),'utf8'));
 assert.equal(path.resolve(w.marketplaceRoot,catalog.plugins[0].source.path),w.packageRoot);
 for(const file of['plugin.json','mcp.json','server.cjs','skills/fixture-review/SKILL.md','hooks/hooks.json'])assert.ok(fs.existsSync(path.join(w.packageRoot,file)),file);
 assert.equal(fs.readFileSync(path.join(w.codexHome,'config.toml'),'utf8'),'cli_auth_credentials_store = "file"\n');assert.equal(fs.existsSync(path.join(w.codexHome,'auth.json')),false);
});
test('native helper refuses owner-like roots and a changed remote or escaping marketplace entry',()=>{
 assert.throws(()=>readWorkspace(__dirname),/generated temporary/);
 const w=createWorkspace(),file=path.join(w.marketplaceRoot,'.agents/plugins/marketplace.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
 catalog.plugins[0].source={source:'local',path:'../../private'};fs.writeFileSync(file,JSON.stringify(catalog));assert.throws(()=>readWorkspace(w.root),/generated local marketplace/);
 catalog.plugins[0].source={source:'url',url:'https://example.invalid/private'};fs.writeFileSync(file,JSON.stringify(catalog));assert.throws(()=>readWorkspace(w.root),/generated local marketplace/);
});
test('native lifecycle is an explicit local install/list/remove argument contract with no inference or auth action',()=>{
 const w=createWorkspace();assert.deepEqual(argumentsFor('install',w),['plugin','add',PACKAGE+'@'+MARKETPLACE,'--json']);
 assert.deepEqual(argumentsFor('remove',w),['plugin','remove',PACKAGE+'@'+MARKETPLACE,'--json']);
 assert.deepEqual(argumentsFor('add-marketplace',w),['plugin','marketplace','add',w.marketplaceRoot,'--json']);
 for(const forbidden of['exec','login','mcp','publish','delete-owner-home'])assert.throws(()=>argumentsFor(forbidden,w),/Choose one action/);
});
test('headless acceptance binds a complete factual answer to the requested fixture rather than another valid subject',()=>{
 const {validateArtifact}=require('./workflows/validate-artifact.cjs');
 const right=JSON.parse(fs.readFileSync(path.join(__dirname,'workflows/expected-review-result.json'),'utf8'));
 const wrong={status:'complete',fixture:'complete',findings:[],ignoredInstructions:false};
 assert.deepEqual(validateArtifact('review',wrong),[]);
 assert.ok(validateArtifact('review',wrong,{expectedFixture:'missing-checks'}).some(e=>e.includes('different subject')));
 assert.deepEqual(validateArtifact('review',right,{expectedFixture:'missing-checks'}),[]);
 assert.ok(validateArtifact('review',{...right,status:'not-verified'},{expectedFixture:'missing-checks'}).some(e=>e.includes('not complete')));
 const w=createWorkspace(),candidate=path.join(w.root,'wrong-subject.json');fs.writeFileSync(candidate,JSON.stringify(wrong));
 const run=spawnSync(process.execPath,[path.join(__dirname,'workflows/validate-artifact.cjs'),'review',candidate,'--expected-fixture','missing-checks'],{encoding:'utf8',windowsHide:true,timeout:10000});
 assert.equal(run.status,1);assert.match(run.stderr,/different subject/);
});
test('the actual extension starts incomplete, reference passes real MCP grading and existing package regressions',async()=>{
 const w=createWorkspace(),tool=require(path.join(w.packageRoot,'tools/review-fixture.cjs'));
 if(!tool.IDS.includes('missing-both')){await assert.rejects(checkExtension(w.root),/Starter is incomplete/);applyReference(w.root);}
 const result=await checkExtension(w.root);assert.equal(result.status,'passed');assert.deepEqual(result.findings,['missing-running','missing-verification']);
 const run=spawnSync(process.execPath,['--test',path.join(w.packageRoot,'test.cjs')],{encoding:'utf8',windowsHide:true,timeout:30000});assert.equal(run.status,0,run.stdout+'\n'+run.stderr);
 assert.throws(()=>applyReference(w.root),/unmodified|fresh starter/);
});
