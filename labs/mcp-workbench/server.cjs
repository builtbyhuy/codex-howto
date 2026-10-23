'use strict';
// A deliberately small, read-only MCP stdio server. stdout is protocol only.
const fs=require('node:fs');
const path=require('node:path');
const readline=require('node:readline');
const DATA=path.join(__dirname,'data','tasks.json');
const VERSIONS=['2025-11-25','2025-06-18','2025-03-26','2024-11-05'];
const URI='practice://taskboard/tasks';
const tools=[
 {name:'list_tasks',description:'Read fictional local tasks, optionally filtering title text.',inputSchema:{type:'object',properties:{query:{type:'string'}},additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false}},
 {name:'get_task',description:'Read one fictional task by its exact ID. Unknown IDs are explicit errors.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false}},
 {name:'read_task_snapshot',description:'Read the same local snapshot exposed as an MCP resource; useful when a host exposes tools but not a resource picker.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false}}
];
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const result=(id,r)=>({jsonrpc:'2.0',id,result:r});
const error=(id,code,message)=>({jsonrpc:'2.0',id,error:{code,message}});
const textResult=(value,isError=false)=>({content:[{type:'text',text:JSON.stringify(value)}],isError});
function loadTasks(){
 const data=JSON.parse(fs.readFileSync(DATA,'utf8'));
 if(!Array.isArray(data)||data.some(t=>!object(t)||typeof t.id!=='string'||typeof t.title!=='string'))throw new Error('Invalid local task data');
 return data;
}
function createSession(){
 let initialized=false,ready=false;
 return function handle(message){
  const hasId=object(message)&&Object.hasOwn(message,'id');
  const id=hasId&&(typeof message.id==='string'||typeof message.id==='number')?message.id:null;
  if(!object(message)||message.jsonrpc!=='2.0'||typeof message.method!=='string'||(hasId&&!(typeof message.id==='string'||typeof message.id==='number')))return error(id,-32600,'Invalid JSON-RPC request');
  if(message.params!==undefined&&!object(message.params))return hasId?error(id,-32602,'MCP params must be an object'):undefined;
  const p=message.params||{};
  if(!hasId){
   if(message.method==='notifications/initialized'&&initialized)ready=true;
   return undefined; // Notifications never receive responses.
  }
  if(message.method==='ping')return result(id,{});
  if(message.method==='initialize'){
   if(initialized)return error(id,-32600,'Session is already initialized');
   if(typeof p.protocolVersion!=='string'||!object(p.capabilities)||!object(p.clientInfo)||typeof p.clientInfo.name!=='string'||typeof p.clientInfo.version!=='string')return error(id,-32602,'initialize requires protocolVersion, capabilities and clientInfo');
   initialized=true;
   return result(id,{protocolVersion:VERSIONS.includes(p.protocolVersion)?p.protocolVersion:VERSIONS[0],capabilities:{tools:{},resources:{}},serverInfo:{name:'codex-howto-local-workbench',version:'1.0.0'},instructions:'Fictional local read-only data; no account or external service.'});
  }
  if(!ready)return error(id,-32002,'Initialize and send notifications/initialized first');
  if(message.method==='tools/list')return result(id,{tools});
  if(message.method==='resources/list')return result(id,{resources:[{uri:URI,name:'task-snapshot',description:'Fictional taskboard snapshot',mimeType:'application/json'}]});
  if(message.method==='resources/read'){
   if(typeof p.uri!=='string')return error(id,-32602,'resources/read requires a URI');
   if(p.uri!==URI)return error(id,-32002,'Unknown resource URI');
   try{return result(id,{contents:[{uri:URI,mimeType:'application/json',text:JSON.stringify(loadTasks())}]});}
   catch{return error(id,-32603,'Local resource could not be read');}
  }
  if(message.method==='tools/call'){
   if(typeof p.name!=='string'||(p.arguments!==undefined&&!object(p.arguments)))return error(id,-32602,'tools/call requires a name and object arguments');
   const tool=tools.find(t=>t.name===p.name);
   if(!tool)return error(id,-32602,'Unknown tool: '+p.name);
   const args=p.arguments||{};
   const allowed=Object.keys(tool.inputSchema.properties);
   if(Object.keys(args).some(k=>!allowed.includes(k)))return result(id,textResult({error:'Unknown argument',allowed},true));
   if(p.name==='get_task'&&(typeof args.id!=='string'||args.id.trim()===''))return result(id,textResult({error:'id must be a nonempty string'},true));
   if(p.name==='list_tasks'&&args.query!==undefined&&typeof args.query!=='string')return result(id,textResult({error:'query must be a string'},true));
   try{
    const tasks=loadTasks();
    if(p.name==='get_task'){
     const task=tasks.find(t=>t.id===args.id);
     return result(id,task?textResult({task}):textResult({error:'Unknown task ID',id:args.id},true));
    }
    if(p.name==='list_tasks'){
     const q=(args.query||'').trim().toLocaleLowerCase('en');
     const selected=tasks.filter(t=>t.title.toLocaleLowerCase('en').includes(q));
     return result(id,textResult({tasks:selected,total:selected.length}));
    }
    return result(id,textResult({uri:URI,tasks}));
   }catch{return result(id,textResult({error:'Local dataset unavailable or malformed'},true));}
  }
  return error(id,-32601,'Method not found: '+message.method);
 };
}
if(require.main===module){
 const handle=createSession();
 const input=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
 input.on('line',line=>{
  let message;
  try{message=JSON.parse(line);}catch{process.stdout.write(JSON.stringify(error(null,-32700,'Parse error'))+'\n');return;}
  try{const response=handle(message);if(response!==undefined)process.stdout.write(JSON.stringify(response)+'\n');}
  catch{process.stderr.write('Unexpected server failure\n');if(object(message)&&Object.hasOwn(message,'id'))process.stdout.write(JSON.stringify(error(message.id,-32603,'Internal error'))+'\n');}
 });
}
module.exports={createSession,URI,tools,VERSIONS};


