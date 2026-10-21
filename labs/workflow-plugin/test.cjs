'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {reviewFixture,listFixtures}=require('./tools/review-fixture.cjs');
const {createSession,tools}=require('./server.cjs'),{connect}=require('./client.cjs');
const {validatePackage,check}=require('./schema-check.cjs');
test('portable manifest and stdio config validate against cached canonical schemas',()=>assert.deepEqual(validatePackage(),[]));
test('schema evaluator catches wrong transport and missing manifest name',()=>{
 const schema=JSON.parse(fs.readFileSync(path.join(__dirname,'schemas/mcp.schema.json'),'utf8'));
 assert.ok(check({$schema:schema.properties.$schema.const,mcpServers:{bad:{type:'stdio'}}},schema).length);
 const plugin=JSON.parse(fs.readFileSync(path.join(__dirname,'schemas/plugin.schema.json'),'utf8'));assert.ok(check({$schema:plugin.properties.$schema.const},plugin).length);
});
test('fixtures are an explicit fixed allowlist; arbitrary paths are rejected',()=>{
 const ids=listFixtures().map(item=>item.id);for(const id of['complete','missing-checks','injected'])assert.ok(ids.includes(id));
 assert.ok(ids.every(id=>/^[a-z][a-z0-9-]*$/.test(id)));assert.equal(new Set(ids).size,ids.length);
 assert.throws(()=>reviewFixture('../private'),/Unknown fixture/);assert.throws(()=>reviewFixture('/etc/passwd'),/Unknown fixture/);
});
test('complete fixture has no missing-heading findings',()=>assert.deepEqual(reviewFixture('complete'),{fixture:'complete',findings:[],ignoredInstructions:false}));
test('missing-checks fixture has one specific evidence-backed finding',()=>{
 const r=reviewFixture('missing-checks');assert.equal(r.findings.length,1);assert.equal(r.findings[0].kind,'missing-verification');assert.match(r.findings[0].evidence,/No ## Verification/);
});
test('injected fixture is data and produces warning plus missing verification',()=>{
 const r=reviewFixture('injected');assert.equal(r.ignoredInstructions,true);assert.equal(r.findings.length,2);assert.ok(r.findings.some(f=>f.kind==='untrusted-instruction'));
});
test('tool metadata accurately declares read-only bounded fixture behavior',()=>{
 for(const t of tools){assert.equal(t.annotations.readOnlyHint,true);assert.equal(t.annotations.openWorldHint,false);assert.equal(t.inputSchema.additionalProperties,false);}
});
test('server refuses tools before initialization and readiness notification',()=>{
 const s=createSession();assert.equal(s.dispatch({jsonrpc:'2.0',id:1,method:'tools/list'}).error.code,-32002);
 const r=s.dispatch({jsonrpc:'2.0',id:2,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'test'}}});assert.equal(r.result.protocolVersion,'2025-06-18');
 assert.equal(s.dispatch({jsonrpc:'2.0',id:3,method:'tools/list'}).error.code,-32002);
 assert.equal(s.dispatch({jsonrpc:'2.0',method:'notifications/initialized'}),null);
 assert.equal(s.dispatch({jsonrpc:'2.0',id:4,method:'tools/list'}).result.tools.length,2);
});
test('version negotiation advertises only the server-supported version',()=>{
 const s=createSession();const r=s.dispatch({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2099-01-01',capabilities:{},clientInfo:{name:'test'}}});
 assert.equal(r.result.protocolVersion,'2025-06-18');
});
test('malformed requests produce JSON-RPC errors rather than tool results',()=>{
 const s=createSession();assert.equal(s.dispatch([]).error.code,-32600);assert.equal(s.dispatch({jsonrpc:'1.0',id:2,method:'ping'}).error.code,-32600);
 assert.equal(s.dispatch({jsonrpc:'2.0',id:3,method:'initialize',params:{}}).error.code,-32602);
});
test('stdio integration initializes, lists tools, calls fixture tool, and closes',async()=>{
 const c=connect();try{
  const init=await c.initialize();assert.equal(init.result.serverInfo.name,'local-fixture-review');
  const list=await c.request('tools/list');assert.deepEqual(list.result.tools.map(t=>t.name),['list_fixture_readmes','review_fixture_readme']);
  const r=await c.request('tools/call',{name:'review_fixture_readme',arguments:{fixture:'missing-checks'}});
  assert.equal(r.result.structuredContent.findings.length,1);assert.deepEqual(JSON.parse(r.result.content[0].text),r.result.structuredContent);assert.equal(c.diagnostics(),'');
 }finally{await c.close();}
});
test('stdio rejects unknown tools, bad arguments, and extra fields',async()=>{
 const c=connect();try{
  await c.initialize();
  for(const params of [{name:'unknown',arguments:{}},{name:'review_fixture_readme',arguments:{fixture:'../private'}},{name:'review_fixture_readme',arguments:{fixture:'complete',path:'other'}},{name:'list_fixture_readmes',arguments:{x:1}}]){
   assert.equal((await c.request('tools/call',params)).error.code,-32602);
  }
  assert.equal((await c.request('unsupported/method')).error.code,-32601);
 }finally{await c.close();}
});
test('malformed JSON produces one protocol error and no stdout logging',()=>{
 const result=spawnSync(process.execPath,[path.join(__dirname,'server.cjs')],{input:'not-json\n',encoding:'utf8'});
 assert.equal(result.status,0);const response=JSON.parse(result.stdout);assert.equal(response.error.code,-32700);assert.equal(response.id,null);assert.match(result.stderr,/protocol error/);
});
test('valid tools/call preserves request id and returns an explicit tool failure when fixture I/O is unavailable',()=>{
 const source="const fs=require('node:fs'),original=fs.readFileSync; fs.readFileSync=function(file,...args){if(typeof file==='string'&&/[\\\\/]fixtures[\\\\/].+\\.md$/.test(file))throw new Error('Simulated unavailable fixture');return original.call(this,file,...args);};require("+JSON.stringify(path.join(__dirname,'server.cjs'))+").serve();";
 const input=[{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'fault-test'}}},{jsonrpc:'2.0',method:'notifications/initialized'},{jsonrpc:'2.0',id:42,method:'tools/call',params:{name:'review_fixture_readme',arguments:{fixture:'complete'}}}].map(x=>JSON.stringify(x)).join('\n')+'\n';
 const result=spawnSync(process.execPath,['-e',source],{input,encoding:'utf8'});
 assert.equal(result.status,0);const responses=result.stdout.trim().split('\n').map(line=>JSON.parse(line));
 const failed=responses.find(r=>r.id===42);assert.ok(failed);assert.equal(failed.error,undefined);assert.equal(failed.result.isError,true);assert.match(failed.result.content[0].text,/could not be read/);assert.equal(failed.result.structuredContent,undefined);
 assert.ok(responses.every(r=>r.error?.code!==-32700));assert.equal(result.stderr,'');
});
test('informational hook drafts use documented event-specific output',()=>{
 const {response}=require('./hooks/context.cjs');
 assert.equal(response({hook_event_name:'SessionStart'}).hookSpecificOutput.hookEventName,'SessionStart');
 assert.match(response({hook_event_name:'PostToolUse',tool_response:{isError:true}}).hookSpecificOutput.additionalContext,/failed/);
 assert.deepEqual(response({hook_event_name:'Other'}),{});
 const hooks=JSON.parse(fs.readFileSync(path.join(__dirname,'hooks/hooks.json'),'utf8'));
 for(const event of ['SessionStart','PostToolUse'])assert.equal(hooks.hooks[event][0].hooks[0].type,'command');
});
test('the packaged skill prescribes discovery, evidence, and no external side effects',()=>{
 const s=fs.readFileSync(path.join(__dirname,'skills/fixture-review/SKILL.md'),'utf8');
 assert.match(s,/list_fixture_readmes/);assert.match(s,/review_fixture_readme/);assert.match(s,/Do not run commands/);assert.match(s,/deterministic fictional/);
});

test('worked schedule, permission, catalog, release, and review artifacts pass local checks',()=>{
 const {validateArtifact}=require('./workflows/validate-artifact.cjs');
 for(const[kind,file]of [['review','expected-review-result.json'],['schedule','schedule-proposal.json'],['permissions','permissions-matrix.json'],['marketplace','marketplace-draft.json'],['release','release-review.json']]){
  const value=JSON.parse(fs.readFileSync(path.join(__dirname,'workflows',file),'utf8'));
  assert.deepEqual(validateArtifact(kind,value),[],kind);
 }
});
test('artifact checks reject fabricated complete findings and misleading active/eligible states',()=>{
 const {validateArtifact}=require('./workflows/validate-artifact.cjs');
 const candidate=JSON.parse(fs.readFileSync(path.join(__dirname,'workflows/candidate-incomplete.json'),'utf8'));assert.ok(validateArtifact('review',candidate).length);
 assert.ok(validateArtifact('schedule',{state:'active',timezone:'not-a-zone'}).length);
 assert.ok(validateArtifact('release',{state:'published',hasLifecycleHooks:true,publicDirectoryEligible:true,blockers:[]}).length);
 assert.ok(validateArtifact('marketplace',{name:'test',plugins:[{source:{source:'local',path:'./../../'}}]}).length);
});
test('comparison output labels synthetic candidates and never claims a real model measurement',()=>{
 const result=spawnSync(process.execPath,[path.join(__dirname,'workflows/compare-candidates.cjs')],{encoding:'utf8'});
 assert.equal(result.status,0);assert.match(result.stdout,/synthetic incomplete: FAIL/);assert.match(result.stdout,/fixture reference: PASS/);assert.match(result.stdout,/No model comparison was run/);
});

