'use strict';
// Real CLI metadata/install commands, with a child-only CODEX_HOME. No model or login command.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {PACKAGE,MARKETPLACE,inside,readWorkspace}=require('./native-workspace.cjs');
const ACTIONS=Object.freeze(['version','add-marketplace','marketplaces','available','install','installed','remove','remove-marketplace']);
function argumentsFor(action,workspace){
 const plugin=PACKAGE+'@'+MARKETPLACE;
 const commands={version:['--version'],'add-marketplace':['plugin','marketplace','add',workspace.marketplaceRoot,'--json'],marketplaces:['plugin','marketplace','list','--json'],available:['plugin','list','--marketplace',MARKETPLACE,'--available','--json'],install:['plugin','add',plugin,'--json'],installed:['plugin','list','--marketplace',MARKETPLACE,'--json'],remove:['plugin','remove',plugin,'--json'],'remove-marketplace':['plugin','marketplace','remove',MARKETPLACE,'--json']};
 if(!Object.hasOwn(commands,action))throw new Error('Choose one action: '+ACTIONS.join(', '));return commands[action];
}
function runNative(action,workspacePath,executable='codex'){
 const workspace=readWorkspace(workspacePath),args=argumentsFor(action,workspace);
 const env={...process.env,CODEX_HOME:workspace.codexHome,OPENAI_API_KEY:'',CODEX_API_KEY:'',CHATGPT_ACCESS_TOKEN:''};
 const result=spawnSync(executable,args,{cwd:workspace.marketplaceRoot,env,encoding:'utf8',windowsHide:true,timeout:30000});
 if(result.error)throw new Error('Codex CLI could not run: '+result.error.message+'. Use an installed codex executable, or pass --codex followed by its full path.');
 const observation={checkedAt:new Date().toISOString(),action,executable,args,exitCode:result.status,stdout:result.stdout.trim(),stderr:result.stderr.trim(),scope:'Disposable child-process CODEX_HOME; no login or model request.'};
 if(result.status===0&&action==='install'){
  const receipt=JSON.parse(result.stdout),installedPath=fs.realpathSync(receipt.installedPath);
  if(!inside(workspace.codexHome,installedPath))throw new Error('Installed path is outside the disposable Codex home. Stop this experiment.');
  observation.installedPath=installedPath;
 }
 fs.appendFileSync(path.join(workspace.root,'native-observations.jsonl'),JSON.stringify(observation)+'\n');
 return observation;
}
if(require.main===module){
 try{
  const args=process.argv.slice(2),action=args.shift(),workspace=args.shift();let executable='codex';
  if(args.length){if(args.shift()!=='--codex'||args.length!==1)throw new Error('Usage: node native-client.cjs ACTION ABSOLUTE_WORKSPACE [--codex EXECUTABLE]');executable=args.shift();}
  const result=runNative(action,workspace,executable);console.log(JSON.stringify(result,null,2));process.exitCode=result.exitCode??1;
 }catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={ACTIONS,argumentsFor,runNative};
