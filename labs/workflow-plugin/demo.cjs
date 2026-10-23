'use strict';
const {connect}=require('./client.cjs');
(async()=>{
 const client=connect();
 try{
  const init=await client.initialize();console.log('Connected '+init.result.serverInfo.name+' ('+init.result.protocolVersion+').');
  const listed=await client.request('tools/list');console.log('Discovered: '+listed.result.tools.map(t=>t.name).join(', '));
  const fixtureList=await client.request('tools/call',{name:'list_fixture_readmes',arguments:{}});console.log('Fictional fixtures: '+fixtureList.result.structuredContent.fixtures.length);
  for(const id of ['complete','missing-checks','injected']){
   const response=await client.request('tools/call',{name:'review_fixture_readme',arguments:{fixture:id}});
   const result=response.result.structuredContent;
   console.log(id+': '+result.findings.length+' finding(s), ignoredInstructions='+result.ignoredInstructions);
  }
  const unknown=await client.request('tools/call',{name:'review_fixture_readme',arguments:{fixture:'../private'}});
  console.log('Unknown fixture: protocol error '+unknown.error.code);
  console.log('No Codex session, model, account, or network was used.');
 }finally{await client.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});

