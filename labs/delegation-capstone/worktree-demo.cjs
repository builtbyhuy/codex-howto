'use strict';
// Real Git/worktree/check execution in a new OS-temp copy; zero agents are spawned.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
function gitExecutable(){const bundled=path.resolve(path.dirname(process.execPath),'..','..','native/git/cmd/git.exe');return process.env.CODEX_TEST_GIT||(fs.existsSync(bundled)?bundled:'git');}
function isolatedEnvironment(){const env={...process.env};for(const key of Object.keys(env))if(/^GIT_/i.test(key))delete env[key];env.GIT_CONFIG_NOSYSTEM='1';env.GIT_CONFIG_GLOBAL=process.platform==='win32'?'NUL':'/dev/null';return env;}
function worktreeDemo(){
 const parent=process.env.CODEX_LAB_TEMP||os.tmpdir();
 const base=fs.mkdtempSync(path.join(parent,'delegation-worktree-')),local=path.join(base,'local'),worktree=path.join(base,'worker'),patch=path.join(base,'candidate.patch');
 fs.cpSync(__dirname,local,{recursive:true,filter:src=>!['.git','node_modules'].includes(path.basename(src))});
 const git=gitExecutable(),env=isolatedEnvironment();
 function run(command,args,cwd){const r=spawnSync(command,args,{cwd,env,encoding:'utf8',windowsHide:true});if(r.error)throw r.error;return r;}
 function g(args,cwd=local){const r=run(git,args,cwd);if(r.status!==0)throw new Error('Scratch git '+args[0]+': '+r.stderr.trim());return r.stdout.trim();}
 function candidate(cwd){const r=run(process.execPath,['run.cjs','starter'],cwd);return {exit:r.status,...JSON.parse(r.stdout)};}
 g(['init','--initial-branch=main']);g(['add','.']);
 g(['-c','user.name=Course Lab','-c','user.email=course-lab@example.invalid','-c','commit.gpgsign=false','commit','-m','Disposable capstone baseline']);
 const baseline=g(['rev-parse','HEAD']);g(['worktree','add','--detach',worktree,'HEAD']);
 const before=candidate(local),initialWorker=candidate(worktree);
 // A-only candidate proves why the parent must wait for B as well.
 fs.copyFileSync(path.join(worktree,'solution/normalize.cjs'),path.join(worktree,'starter/normalize.cjs'));
 const onlyA=candidate(worktree);
 fs.copyFileSync(path.join(worktree,'solution/report.cjs'),path.join(worktree,'starter/report.cjs'));
 const fixedWorker=candidate(worktree),parentBeforeIntegration=candidate(local);
 const workerChecks=run(process.execPath,['--test','candidate.test.cjs'],worktree);
 if(workerChecks.status!==0)throw new Error('Worker candidate checks failed: '+workerChecks.stdout+workerChecks.stderr);
 const changed=g(['diff','--name-only'],worktree).split(/\r?\n/).filter(Boolean).sort();
 if(JSON.stringify(changed)!==JSON.stringify(['starter/normalize.cjs','starter/report.cjs']))throw new Error('Unexpected patch ownership: '+changed.join(','));
 g(['diff','--binary','--output',patch],worktree);g(['apply','--check',patch]);g(['apply',patch]);
 const integrated=candidate(local),parentChecks=run(process.execPath,['--test','candidate.test.cjs'],local);
 if(parentChecks.status!==0||!integrated.passed)throw new Error('Integrated destination did not pass');
 return {kind:'real-disposable-git-worktree',actualAgentsSpawned:0,base,local,worktree,baseline,changedFiles:changed,states:{before:before.report,initialWorker:initialWorker.report,onlyA:onlyA.report,fixedWorker:fixedWorker.report,parentBeforeIntegration:parentBeforeIntegration.report,integrated:integrated.report},workerCandidateExit:workerChecks.status,destinationCandidateExit:parentChecks.status,worktreeList:g(['worktree','list','--porcelain']),ownerRepositoryChanged:false,globalIdentityChanged:false};
}
if(require.main===module){try{console.log(JSON.stringify(worktreeDemo(),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={worktreeDemo,isolatedEnvironment};
