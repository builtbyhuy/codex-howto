'use strict';
// Local subprocess client, used by tests and the demo. It never launches Codex.
const {spawn}=require('node:child_process'),readline=require('node:readline'),path=require('node:path');
function connect(){
 const processHandle=spawn(process.execPath,[path.join(__dirname,'server.cjs')],{stdio:['pipe','pipe','pipe'],windowsHide:true});
 const pending=new Map();let next=1,stderr='';
 processHandle.stderr.on('data',chunk=>stderr+=chunk.toString());
 const lines=readline.createInterface({input:processHandle.stdout,crlfDelay:Infinity});
 lines.on('line',line=>{
  let response;try{response=JSON.parse(line);}catch{return;}
  const entry=pending.get(response.id);if(entry){clearTimeout(entry.timer);pending.delete(response.id);entry.resolve(response);}
 });
 processHandle.on('error',error=>{for(const entry of pending.values()){clearTimeout(entry.timer);entry.reject(error);}pending.clear();});
 processHandle.on('exit',()=>{for(const entry of pending.values()){clearTimeout(entry.timer);entry.reject(new Error('Server exited before reply.'));}pending.clear();});
 return {
  request(method,params={}){
   const id=next++;
   return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Local request timeout: '+method));},3000);
    pending.set(id,{resolve,reject,timer});
    processHandle.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
   });
  },
  notify(method,params={}){processHandle.stdin.write(JSON.stringify({jsonrpc:'2.0',method,params})+'\n');},
  async initialize(){const result=await this.request('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'offline-lab-client',version:'1.0.0'}});this.notify('notifications/initialized');return result;},
  async close(){
   processHandle.stdin.end();
   await new Promise(resolve=>{if(processHandle.exitCode!==null)return resolve();const timer=setTimeout(()=>{processHandle.kill();resolve();},1500);processHandle.once('exit',()=>{clearTimeout(timer);resolve();});});
   lines.close();
  },
  diagnostics(){return stderr;}
 };
}
module.exports={connect};

