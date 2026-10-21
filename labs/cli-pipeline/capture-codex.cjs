'use strict';
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const PROJECTS=path.join(__dirname,'exercises/projects');
const SCHEMA=path.join(__dirname,'exercises/report-schema.json');
const PROMPT='Read only README.md in the selected project. Extract the Project and Check lines exactly. The fixture does not document a deployment URL: set deployment_url to null and include deployment_url in unknowns. Do not run the documented check, edit project files, browse, or contact services.';
function invocation(project,out){
 if(!['red','blue'].includes(project))throw new Error('Choose --project red or blue.');
 return {project,cwd:path.join(PROJECTS,project),outputDirectory:out,executable:'codex',args:['--ask-for-approval','never','exec','--cd',path.join(PROJECTS,project),'--sandbox','read-only','--skip-git-repo-check','--json','--output-schema',SCHEMA,'--output-last-message',path.join(out,'final.json'),PROMPT]};
}
function main(argv){
 if(argv.length<2||argv[0]!=='--project'||!['red','blue'].includes(argv[1])||argv.slice(2).some(a=>a!=='--run')||argv.filter(a=>a==='--run').length>1){console.error('Usage: node capture-codex.cjs --project red|blue [--run]');return 2;}
 const run=argv.includes('--run');const tempRoot=process.env.CODEX_COURSE_LAB_TMP||os.tmpdir();
 if(!run){const plan=invocation(argv[1],path.join(tempRoot,'<new-owned-capture-directory>'));console.log(JSON.stringify({run:false,...plan,explanation:'Dry run only. --run deliberately starts an authenticated task and creates a new output directory.'},null,2));return 0;}
 const parent=fs.realpathSync(tempRoot);const out=fs.mkdtempSync(path.join(parent,'codex-extraction-'));const plan=invocation(argv[1],out);
 const child=spawnSync(plan.executable,plan.args,{cwd:plan.cwd,shell:false,encoding:'utf8',windowsHide:true,timeout:180000,maxBuffer:1024*1024});
 fs.writeFileSync(path.join(out,'events.jsonl'),child.stdout||'');fs.writeFileSync(path.join(out,'stderr.txt'),child.stderr||'');
 const result={...plan,producerExitCode:child.status,signal:child.signal||null,error:child.error?.message||null,syntheticInput:true,executedAt:new Date().toISOString()};
 fs.writeFileSync(path.join(out,'process.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
 return child.error||child.signal||child.status!==0?1:0;
}
if(require.main===module)process.exitCode=main(process.argv.slice(2));
module.exports={invocation,PROMPT,main};
