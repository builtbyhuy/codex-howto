'use strict';
// stdout is an INACTIVE draft. No Codex config, registration, or network is touched.
const path=require('node:path');
function connectionDraft({nodePath=process.execPath,serverPath=path.join(__dirname,'server.cjs'),docs=false}={}){
 if(docs)return '# Inactive HTTP example; review existing configuration before applying.\n[mcp_servers.openaiDeveloperDocs]\nurl = "https://developers.openai.com/mcp"\n';
 if(!path.isAbsolute(nodePath)||!path.isAbsolute(serverPath))throw new Error('STDIO executable and script must be absolute paths on the selected host');
 return '# Inactive host-specific draft; generated from this Node executable and lab path.\n[mcp_servers.practice_tasks]\ncommand = '+JSON.stringify(nodePath)+'\nargs = ['+JSON.stringify(serverPath)+']\nstartup_timeout_sec = 10\ntool_timeout_sec = 30\nenabled_tools = ["list_tasks", "get_task", "read_task_snapshot"]\n';
}
if(require.main===module){try{if(process.argv.slice(2).some(a=>a!=='--docs'))throw new Error('Usage: node prepare-connection.cjs [--docs]');process.stdout.write(connectionDraft({docs:process.argv.includes('--docs')}));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={connectionDraft};
