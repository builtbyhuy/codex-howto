'use strict';
// App-server is a different JSONL protocol, not MCP. Default CLI mode is fixture-only.
const {spawn}=require('node:child_process');const readline=require('node:readline');const fs=require('node:fs');const path=require('node:path');
async function runConversation({command,args,cwd=__dirname,timeoutMs=5000,kind='protocol-fixture'}={}){
 if(!command||!Array.isArray(args))throw new Error('Supply an explicit process command and argument array');
 const proc=spawn(command,args,{cwd,stdio:['pipe','pipe','pipe'],windowsHide:true});
 const lines=readline.createInterface({input:proc.stdout,crlfDelay:Infinity});
 const pending=new Map(),waiters=new Map(),completed=new Map(),messages=new Map(),transcript=[];
 let nextId=1,fatal=null,threadId=null,stderr='',closed=false,candidateReady=false,clientTerminated=false,processState=null;
 let closeResolve;const processClosed=new Promise(resolve=>closeResolve=resolve);
 const send=value=>{transcript.push({direction:'client',message:value});proc.stdin.write(JSON.stringify(value)+'\n');};
 function fail(error){if(fatal)return;fatal=error;for(const p of [...pending.values(),...waiters.values()]){clearTimeout(p.timer);p.reject(error);}pending.clear();waiters.clear();}
 proc.stderr.on('data',chunk=>stderr+=chunk);proc.on('error',fail);proc.stdin.on('error',fail);
 // close follows stdout draining. A completed notification is only a candidate
 // result until transport errors and natural process termination are checked.
 proc.on('close',(code,signal)=>{closed=true;processState={exitCode:code,signal,terminatedByClient:clientTerminated,stdoutDrained:true};if(!clientTerminated&&(!candidateReady||code!==0))fail(new Error('App-server exited before a checked result: '+(signal||code)));closeResolve();});
 lines.on('line',line=>{
  let message;try{message=JSON.parse(line);}catch{fail(new Error('App-server stdout contains non-JSON protocol data'));return;}
  if(!message||typeof message!=='object'||Array.isArray(message)){fail(new Error('App-server protocol message must be a JSON object'));return;}
  transcript.push({direction:'server',message});
  if(message.method&&Object.hasOwn(message,'id')){
   if(['item/commandExecution/requestApproval','item/fileChange/requestApproval'].includes(message.method))send({id:message.id,result:{decision:'decline'}});
   else send({id:message.id,error:{code:-32601,message:'Teaching client does not support this server request; no approval granted'}});
   return;
  }
  if(Object.hasOwn(message,'id')){
   const p=pending.get(message.id);if(p){pending.delete(message.id);clearTimeout(p.timer);message.error?p.reject(new Error('App-server request failed: '+message.error.message)):p.resolve(message.result);}return;
  }
  if(message.params?.threadId!==threadId)return;
  if(message.method==='item/completed'&&typeof message.params.turnId==='string'&&message.params.item?.type==='agentMessage'&&typeof message.params.item.text==='string'){
   if(!messages.has(message.params.turnId))messages.set(message.params.turnId,new Map());
   messages.get(message.params.turnId).set(message.params.item.id,message.params.item.text);
  }
  if(message.method==='turn/completed'){
   const turn=message.params.turn;if(!turn||typeof turn.id!=='string')return;
   completed.set(turn.id,turn);const w=waiters.get(turn.id);if(w){waiters.delete(turn.id);clearTimeout(w.timer);w.resolve(turn);}
  }
 });
 function request(method,params={}){return new Promise((resolve,reject)=>{if(fatal){reject(fatal);return;}const id=nextId++,timer=setTimeout(()=>{pending.delete(id);reject(new Error('App-server response timeout: '+method));},timeoutMs);pending.set(id,{resolve,reject,timer});send({id,method,params});});}
 function waitTurn(id){return new Promise((resolve,reject)=>{if(completed.has(id)){resolve(completed.get(id));return;}if(fatal){reject(fatal);return;}const timer=setTimeout(()=>{waiters.delete(id);reject(new Error('App-server turn completion timeout'));},timeoutMs);waiters.set(id,{resolve,reject,timer});});}
 let result,operationError;
 try{
  await request('initialize',{clientInfo:{name:'codex_howto_teaching_client',version:'1.0.0'}});
  send({method:'initialized',params:{}});
  const started=await request('thread/start',{cwd:path.resolve(cwd),sandbox:'read-only',approvalPolicy:'never'});
  threadId=started?.thread?.id;if(typeof threadId!=='string'||!threadId)throw new Error('thread/start returned no thread ID');
  const turn=await request('turn/start',{threadId,input:[{type:'text',text:'Read README.md and summarize its purpose in three bullets. Do not change files or run project commands.'}]});
  if(typeof turn?.turn?.id!=='string')throw new Error('turn/start returned no turn ID');
  const final=await waitTurn(turn.turn.id);
  if(final.status!=='completed')throw new Error('Turn did not complete successfully: '+final.status+(final.error?.message?' — '+final.error.message:''));
  const text=[...(messages.get(final.id)?.values()||[])].join('\n').trim();if(!text)throw new Error('Completed turn has no final agent message for the requested turn');
  if(fatal)throw fatal;
  candidateReady=true;
  result={kind,nativeCodexExecuted:kind==='native-attempt',threadId,turnId:final.id,status:final.status,text,transcript};
 }catch(error){operationError=error;}finally{
  for(const p of [...pending.values(),...waiters.values()])clearTimeout(p.timer);pending.clear();waiters.clear();
  if(!proc.stdin.destroyed)proc.stdin.end();
  if(!closed){
   let timer;await Promise.race([processClosed,new Promise(resolve=>timer=setTimeout(resolve,700))]);clearTimeout(timer);
   if(!closed&&proc.exitCode===null){clientTerminated=true;if(!proc.kill())clientTerminated=false;}
   if(!closed){await Promise.race([processClosed,new Promise(resolve=>timer=setTimeout(resolve,1000))]);clearTimeout(timer);}
  }
  lines.close();
 }
 if(operationError)throw operationError;
 if(fatal)throw fatal;
 if(!closed)throw new Error('App-server process did not close after client teardown');
 return {...result,process:processState,stderr};
}
if(require.main===module){
 const argv=process.argv.slice(2);let options;
 if(argv[0]==='--fixture'&&argv.length<=2)options={command:process.execPath,args:[path.join(__dirname,'app-server-fixture.cjs'),argv[1]||'complete'],kind:'protocol-fixture'};
 else if(argv[0]==='--native'&&argv.length===3&&path.isAbsolute(argv[1])&&path.isAbsolute(argv[2])&&fs.existsSync(argv[1])&&fs.existsSync(argv[2])&&fs.statSync(argv[2]).isDirectory())options={command:argv[1],args:['app-server'],cwd:argv[2],timeoutMs:120000,kind:'native-attempt'};
 else{console.error('Usage: node app-server-client.cjs --fixture MODE\nModes: complete, failed, approval, empty, malformed, early-exit, wrong-turn, trailing-malformed, trailing-exit, null-message, persistent\nOptional deliberate native run: --native ABSOLUTE_CODEX_EXECUTABLE ABSOLUTE_SCRATCH_PROJECT');process.exitCode=1;}
 if(options)runConversation(options).then(result=>{if(!argv.includes('--transcript'))delete result.transcript;console.log(JSON.stringify(result,null,2));}).catch(error=>{console.error(error.message);process.exitCode=1;});
}
module.exports={runConversation};
