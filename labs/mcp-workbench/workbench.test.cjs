'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {startClient}=require('./client.cjs');
const {createSession,URI}=require('./server.cjs');
async function using(fn){const c=startClient();try{await c.initialize();await fn(c);}finally{await c.close();}}
const payload=r=>JSON.parse(r.result.content[0].text);
test('real subprocess negotiates and discovers three read-only tools',()=>using(async c=>{const r=await c.request('tools/list');assert.equal(r.result.tools.length,3);assert.ok(r.result.tools.every(t=>t.annotations.readOnlyHint));assert.deepEqual(c.stray,[]);}));
test('tools/call normalizes search and reads actual fixture values',()=>using(async c=>{const r=await c.request('tools/call',{name:'list_tasks',arguments:{query:' README '}});assert.equal(r.result.isError,false);assert.equal(payload(r).tasks[0].id,'T-101');assert.equal(payload(r).total,1);}));
test('known and unknown IDs are distinguished from an empty successful search',()=>using(async c=>{assert.equal(payload(await c.request('tools/call',{name:'get_task',arguments:{id:'T-102'}})).task.status,'done');const u=await c.request('tools/call',{name:'get_task',arguments:{id:'T-999'}});assert.equal(u.result.isError,true);const e=await c.request('tools/call',{name:'list_tasks',arguments:{query:'no-such-title'}});assert.equal(e.result.isError,false);assert.equal(payload(e).total,0);}));
test('tool validation, unknown names and malformed request parameters differ',()=>using(async c=>{assert.equal((await c.request('tools/call',{name:'get_task',arguments:{id:3}})).result.isError,true);assert.equal((await c.request('tools/call',{name:'erase_all',arguments:{}})).error.code,-32602);assert.equal((await c.raw(JSON.stringify({jsonrpc:'2.0',id:900,method:'tools/call',params:[]}),900)).error.code,-32602);}));
test('resource list/read returns identical local records; unknown URI fails',()=>using(async c=>{const list=await c.request('resources/list');assert.equal(list.result.resources[0].uri,URI);const r=await c.request('resources/read',{uri:URI});assert.deepEqual(JSON.parse(r.result.contents[0].text),JSON.parse(fs.readFileSync(path.join(__dirname,'data','tasks.json'))));assert.ok((await c.request('resources/read',{uri:'practice://unknown'})).error);}));
test('parse error and unknown method preserve the process for the next request',()=>using(async c=>{assert.equal((await c.raw('{broken',null)).error.code,-32700);assert.equal((await c.request('invented/method')).error.code,-32601);assert.ok((await c.request('ping')).result);assert.deepEqual(c.stray,[]);assert.equal(c.stderr,'');}));
test('lifecycle rejects tool discovery before initialization',()=>{const h=createSession();assert.equal(h({jsonrpc:'2.0',id:1,method:'tools/list'}).error.code,-32002);assert.equal(h({jsonrpc:'2.0',method:'notifications/cancelled'}),undefined);});
test('all supported tool calls preserve the dataset and transcript has ordered handshake',()=>using(async c=>{const f=path.join(__dirname,'data','tasks.json'),before=fs.readFileSync(f,'utf8');await c.request('tools/call',{name:'read_task_snapshot',arguments:{}});await c.request('tools/call',{name:'list_tasks',arguments:{}});assert.equal(fs.readFileSync(f,'utf8'),before);assert.equal(JSON.parse(c.transcript[0].line).method,'initialize');assert.equal(c.transcript[2].message.method,'notifications/initialized');}));


