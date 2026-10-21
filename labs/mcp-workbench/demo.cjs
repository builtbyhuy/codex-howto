'use strict';
const {startClient}=require('./client.cjs');
async function demo(){
 const c=startClient();const summary={};
 try{
  const init=await c.initialize();summary.protocol=init.result.protocolVersion;
  const list=await c.request('tools/list');summary.tools=list.result.tools.map(t=>t.name);
  const found=await c.request('tools/call',{name:'list_tasks',arguments:{query:' README '}});
  summary.search=JSON.parse(found.result.content[0].text);
  const unknown=await c.request('tools/call',{name:'get_task',arguments:{id:'T-999'}});
  summary.unknownTask={isError:unknown.result.isError,...JSON.parse(unknown.result.content[0].text)};
  const resources=await c.request('resources/list');
  const read=await c.request('resources/read',{uri:resources.result.resources[0].uri});
  summary.resourceRows=JSON.parse(read.result.contents[0].text).length;
  summary.unknownMethod=(await c.request('not/a/method')).error.code;
  summary.malformed=(await c.raw('{not-json',null)).error.code;
  if(process.argv.includes('--transcript'))for(const item of c.transcript)console.log(JSON.stringify(item));
  else console.log(JSON.stringify(summary,null,2));
 }finally{await c.close();}
}
demo().catch(e=>{console.error(e.message);process.exitCode=1;});


