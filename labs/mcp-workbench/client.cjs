'use strict';
const {spawn}=require('node:child_process');
const path=require('node:path');
const readline=require('node:readline');
function startClient({command=process.execPath,args=[path.join(__dirname,'server.cjs')],timeoutMs=3000}={}){
 const child=spawn(command,args,{stdio:['pipe','pipe','pipe'],windowsHide:true});
 const pending=new Map();const transcript=[];const stray=[];let nextId=1,stderr='',fatal=null;
 child.stderr.on('data',d=>stderr+=d);
 const lines=readline.createInterface({input:child.stdout,crlfDelay:Infinity});
 lines.on('line',line=>{
  let m;try{m=JSON.parse(line);}catch(e){stray.push(line);return;}
  transcript.push({direction:'server',message:m});
  const entry=pending.get(m.id);
  if(entry){pending.delete(m.id);clearTimeout(entry.timer);entry.resolve(m);}
 });
 function fail(e){fatal=e;for(const p of pending.values()){clearTimeout(p.timer);p.reject(e);}pending.clear();}
 child.on('error',fail);child.stdin.on('error',fail);
 child.on('exit',()=>fail(new Error('Server exited before response')));
 function raw(line,id){
  return new Promise((resolve,reject)=>{
   if(fatal){reject(fatal);return;}
   const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Response timeout for '+id));},timeoutMs);
   pending.set(id,{resolve,reject,timer});
   transcript.push({direction:'client',line});
   child.stdin.write(line+'\n');
  });
 }
 async function request(method,params={}){
  const id=nextId++;return raw(JSON.stringify({jsonrpc:'2.0',id,method,params}),id);
 }
 function notify(method,params={}){
  const m={jsonrpc:'2.0',method,params};transcript.push({direction:'client',message:m});child.stdin.write(JSON.stringify(m)+'\n');
 }
 async function initialize(){
  const r=await request('initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'course-local-client',version:'1.0.0'}});
  if(r.error)throw new Error(r.error.message);notify('notifications/initialized');return r;
 }
 async function close(){child.stdin.end();if(child.exitCode===null)await new Promise(resolve=>{child.once('exit',resolve);setTimeout(()=>{child.kill();resolve();},1000).unref();});lines.close();}
 return {request,raw,notify,initialize,close,transcript,stray,get stderr(){return stderr;}};
}
module.exports={startClient};


