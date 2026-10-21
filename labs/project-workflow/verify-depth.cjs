'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const {createWorkspace,git,gitExecutable}=require('./workspace.cjs');
const ROOT=__dirname;
function runChecks(workspace){
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const r=spawnSync(process.execPath,['--test','--test-reporter=tap','checks.cjs'],{cwd:workspace,shell:false,encoding:'utf8',windowsHide:true,env});
 if(r.error)throw r.error;
 const n=key=>Number(r.stdout.match(new RegExp('^# '+key+' (\\d+)$','m'))?.[1]);
 return {exit:r.status,pass:n('pass'),fail:n('fail'),output:r.stdout};
}
function verifyDepth(){
 const starterBefore=fs.readFileSync(path.join(ROOT,'starter/notes.cjs'));
 const result={kind:'offline artifact and behavior verification; not a captured Codex session',cases:[]};
 const add=(id,evidence)=>result.cases.push({id,...evidence});
 const initial=createWorkspace();
 const notes=JSON.parse(fs.readFileSync(path.join(initial.workspace,'notes.json'),'utf8'));
 assert.deepEqual(notes.map(n=>n.id),['n1','n2','n3','n4']);
 assert(!fs.existsSync(path.join(initial.workspace,'package.json')));
 assert.match(fs.readFileSync(path.join(initial.workspace,'README.md'),'utf8'),/npm test/);
 add('source-facts',{workspace:initial.workspace,ids:notes.map(n=>n.id),unsupportedClaim:'npm test without package.json',deployment:'not documented'});
 const ticket=JSON.parse(fs.readFileSync(path.join(ROOT,'exercises/ticket.json'),'utf8'));
 assert.equal(ticket.id,'DEMO-123');assert.equal(ticket.status,'Open');assert.equal(ticket.source,'local fictional fixture');
 add('ticket-boundary',{record:ticket.id,status:ticket.status,missingRecord:'DEMO-999',liveLookup:false});
 const skill=fs.readFileSync(path.join(ROOT,'solution/.agents/skills/readme-check/SKILL.md'),'utf8');
 assert.match(skill,/^---\r?\nname: readme-check\r?\ndescription:/);
 assert.match(skill,/Claim, Evidence, Finding, and Suggested correction/);
 assert.match(skill,/Do not edit files/);
 add('skill-artifact',{metadata:'present',output:'four-column evidence table',clientDiscovery:'not executed; learner observation required'});
 const h=path.join(ROOT,'exercises/hierarchy');
 for(const [file,phrase]of [['AGENTS.md','Preserve WORK-NOTE.md'],['docs/AGENTS.md','descriptive headings'],['docs/AGENTS.override.md','under eight words'],['sibling/AGENTS.md','SIBLING']])assert(fs.readFileSync(path.join(h,file),'utf8').includes(phrase));
 add('hierarchy-fixture',{projectRoot:'fixture AGENTS.md',docsSelection:'AGENTS.override.md',excluded:['docs/AGENTS.md','sibling/AGENTS.md'],liveDiscovery:'not executed; expected answer only'});
 for(const [candidate,pass,fail]of [['a',6,0],['b',5,1]]){
  const w=createWorkspace();fs.copyFileSync(path.join(ROOT,`exercises/candidate-${candidate}.cjs`),path.join(w.workspace,'notes.cjs'));
  const checked=runChecks(w.workspace);assert.equal(checked.pass,pass);assert.equal(checked.fail,fail);
  assert.equal(checked.exit,fail?1:0);
  const query=spawnSync(process.execPath,['cli.cjs','  REVIEW  '],{cwd:w.workspace,shell:false,encoding:'utf8',windowsHide:true});
  assert.equal(query.status,0);assert.match(query.stdout,/^n1: /);assert.match(query.stdout,/\nn3: /);
  for(const name of ['checks.cjs','notes.json','WORK-NOTE.md'])assert.deepEqual(fs.readFileSync(path.join(w.workspace,name)),fs.readFileSync(path.join(ROOT,'starter',name)));
  add(`candidate-${candidate}`,{workspace:w.workspace,checks:{pass,fail,exit:checked.exit},query:query.stdout.trim(),reason:candidate==='a'?'original object identity preserved':'identity check rejects copied and lowercased objects'});
 }
 const fixed=path.join(initial.workspace,'README.md');
 const baseline=fs.readFileSync(fixed,'utf8');
 const useful='\nUseful review: preserve this paragraph.\n';
 const corrected=baseline.replace('npm test','node --test checks.cjs')+useful;
 fs.writeFileSync(fixed,corrected.replace('# Orbit Notes','# Rejected heading experiment'));
 fs.writeFileSync(fixed,fs.readFileSync(fixed,'utf8').replace(/^# Rejected heading experiment/m,'# Orbit Notes'));
 assert.equal(fs.readFileSync(fixed,'utf8'),corrected);
 add('narrow-recovery',{workspace:initial.workspace,heading:'restored',correctedCheck:'preserved',usefulParagraph:'preserved'});
 const available=spawnSync(gitExecutable(),['--version'],{shell:false,encoding:'utf8',windowsHide:true}).status===0;
 if(available){
  const w=createWorkspace({withGit:true});const file=n=>path.join(w.workspace,n);
  const staged=git(w.workspace,['diff','--cached','--name-only']).split(/\r?\n/);
  assert.equal(staged.length,8);
  fs.writeFileSync(file('README.md'),corrected);fs.writeFileSync(file('notes-draft.md'),'Fictional local draft.\n');
  const before=git(w.workspace,['status','--short']);assert.match(before,/AM README\.md/);assert.match(before,/\?\? notes-draft\.md/);
  const tracked=git(w.workspace,['diff','--','README.md']);assert(!tracked.includes('Fictional local draft'));
  assert.equal(git(w.workspace,['show',':README.md']),baseline.trimEnd());
  git(w.workspace,['restore','--worktree','--','README.md']);
  assert.equal(fs.readFileSync(file('README.md'),'utf8'),baseline);assert(fs.existsSync(file('notes-draft.md')));
  assert(!fs.readFileSync(file('README.md'),'utf8').includes(useful.trim()));
  add('git-coverage-and-whole-file-counterexample',{workspace:w.workspace,indexTree:w.baseline,stagedPaths:staged,statusBefore:before,statusAfter:git(w.workspace,['status','--short']),wholeRestore:'drops both useful paragraph and check correction',untrackedDraft:'retained',commitCreated:false});
 }else add('git-coverage-and-whole-file-counterexample',{skipped:'Git unavailable; no installation attempted'});
 fs.copyFileSync(path.join(ROOT,'solution/notes.cjs'),path.join(initial.workspace,'notes.cjs'));
 const refreshed=runChecks(initial.workspace);assert.equal(refreshed.pass,6);assert.equal(refreshed.fail,0);
 add('stale-checkpoint',{workspace:initial.workspace,oldCheckpoint:{pass:4,fail:2},currentCheck:{pass:refreshed.pass,fail:refreshed.fail},memorySettingChanged:false});
 assert.deepEqual(fs.readFileSync(path.join(ROOT,'starter/notes.cjs')),starterBefore);
 result.shippedStarter='unchanged and intentionally broken';return result;
}
if(require.main===module){try{console.log(JSON.stringify(verifyDepth(),null,2));}catch(e){console.error(e.stack);process.exitCode=1;}}
module.exports={verifyDepth};
