'use strict';
// Explicit protocol fixture. It is not Codex and cannot invoke a model or tool.
const readline=require('node:readline');const mode=process.argv[2]||'complete';let initialized=false,thread=false;
const send=value=>process.stdout.write(JSON.stringify(value)+'\n');
if(mode==='persistent')setInterval(()=>{},1000); // Deliberately requires the client's post-result teardown.
const itemEvent=item=>({method:'item/completed',params:{threadId:'fixture-thread',turnId:'fixture-turn',completedAtMs:0,item}});
function finish(status='completed',text=true){if(text)send(itemEvent({id:'fixture-message',type:'agentMessage',text:'Fixture summary: README describes a fictional local task workbench. No Codex model was run.'}));send({method:'turn/completed',params:{threadId:'fixture-thread',turn:{id:'fixture-turn',status,items:[]}}});}
readline.createInterface({input:process.stdin,crlfDelay:Infinity}).on('line',line=>{
 const m=JSON.parse(line);
 if(m.method==='initialize'){send({id:m.id,result:{userAgent:'explicit-course-protocol-fixture',codexHome:'/fixture-only/not-created',platformFamily:'fixture',platformOs:'fixture'}});return;}
 if(m.method==='initialized'){initialized=true;return;}
 if(m.method==='thread/start'){if(!initialized){send({id:m.id,error:{code:-32000,message:'Not initialized'}});return;}if(m.params.sandbox!=='read-only'){send({id:m.id,error:{code:-32602,message:'Installed schema uses SandboxMode read-only, not SandboxPolicy readOnly'}});return;}thread=true;send({id:m.id,result:{approvalPolicy:'never',approvalsReviewer:'user',cwd:m.params.cwd,model:'fixture-model',modelProvider:'fixture',sandbox:{type:'readOnly'},thread:{id:'fixture-thread',sessionId:'fixture-thread',cliVersion:'fixture',createdAt:0,updatedAt:0,cwd:m.params.cwd,ephemeral:true,modelProvider:'fixture',preview:'Explicit protocol fixture',projectId:null,source:'appServer',status:{type:'idle'},turns:[]}}});return;}
 if(m.method==='turn/start'&&thread){
  if(mode==='early-exit'){process.exit(2);return;}
  send({id:m.id,result:{turn:{id:'fixture-turn',status:'inProgress',items:[]}}});
  if(mode==='malformed'){process.stdout.write('not JSON\n');return;}
  if(mode==='null-message'){send(null);return;}
  if(mode==='approval'){send({id:90,method:'item/fileChange/requestApproval',params:{threadId:'fixture-thread',turnId:'fixture-turn',itemId:'fixture-write',startedAtMs:0}});return;}
  setImmediate(()=>{
   if(mode==='wrong-turn')send({method:'item/completed',params:{threadId:'fixture-thread',turnId:'earlier-turn',completedAtMs:0,item:{id:'stale-message',type:'agentMessage',text:'STALE FROM OTHER TURN'}}});
   finish(mode==='failed'?'failed':'completed',!['empty','wrong-turn'].includes(mode));
   if(mode==='trailing-malformed')process.stdout.write('invalid trailing stdout\n');
   if(mode==='trailing-exit')process.stdout.write('',()=>process.exit(7));
  });return;
 }
 if(m.id===90&&m.result?.decision==='decline'){send(itemEvent({id:'fixture-write',type:'fileChange',status:'declined',changes:[]}));finish('interrupted',false);}
});
