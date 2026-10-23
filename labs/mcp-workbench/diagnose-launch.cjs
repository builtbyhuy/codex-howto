'use strict';
const path=require('node:path');const {startClient}=require('./client.cjs');
async function diagnose(mode='ok'){
 if(!['ok','missing-executable','missing-script','bad-handshake'].includes(mode))throw new Error('Choose ok, missing-executable, missing-script or bad-handshake');
 const options=mode==='missing-executable'?{command:path.join(__dirname,'does-not-exist-node'),args:[]}:mode==='missing-script'?{args:[path.join(__dirname,'does-not-exist-server.cjs')]}:{};
 const client=startClient(options);
 try{
  if(mode==='bad-handshake'){
   const response=await client.request('tools/list');return {mode,boundary:'initialization',protocolError:response.error.code,expected:-32002};
  }
  await client.initialize();const r=await client.request('tools/list');return {mode,boundary:'ready',tools:r.result.tools.map(t=>t.name)};
 }catch(e){return {mode,boundary:mode==='missing-executable'?'process-launch':'process-exit',errorCode:e.code||null,message:e.message};}
 finally{await client.close();}
}
if(require.main===module)diagnose(process.argv[2]||'ok').then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={diagnose};
