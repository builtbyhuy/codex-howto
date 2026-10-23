'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createWorkspace, verifyReference, git, gitExecutable, gitEnvironment } = require('./workspace.cjs');
test('starter is copied into a new owned folder, never edited in place',()=>{ const result=createWorkspace(); assert.match(path.basename(result.workspace),/^codex-project-workflow-/); assert.equal(fs.readFileSync(path.join(result.workspace,'notes.cjs'),'utf8'),fs.readFileSync(path.join(__dirname,'starter/notes.cjs'),'utf8')); assert.equal(result.withGit,false); });
test('baseline fails two cases; complete reference passes six and preserves unrelated work',()=>{ const result=verifyReference(); assert.deepEqual(result.baselineChecks,{pass:4,fail:2}); assert.deepEqual(result.referenceChecks,{pass:6,fail:0}); assert.equal(result.unrelatedFiles,'preserved'); assert.equal(result.targetedRecovery,'useful paragraph preserved'); });
const gitAvailable=spawnSync(gitExecutable(),['--version'],{encoding:'utf8',windowsHide:true}).status===0;
test('optional Git stage isolates inherited context and needs no identity or commit',{skip:!gitAvailable&&'Git is not already available; file-copy workflow still works.'},()=>{
  const unrelated = createWorkspace();
  const foreignIndex = path.join(unrelated.workspace, 'unrelated-index');
  const sentinel = 'Unrelated index sentinel: must stay unchanged.';
  fs.writeFileSync(foreignIndex,sentinel);
  const inherited = { GIT_DIR:path.join(unrelated.workspace,'not-a-repository'), GIT_INDEX_FILE:foreignIndex, GIT_WORK_TREE:unrelated.workspace,
    GIT_CONFIG_COUNT:'1', GIT_CONFIG_KEY_0:'user.name', GIT_CONFIG_VALUE_0:'Must not be inherited' };
  const previous = Object.fromEntries(Object.keys(inherited).map(name=>[name,process.env[name]]));
  try {
    Object.assign(process.env,inherited);
    const result=verifyReference({withGit:true});
    assert.match(result.baseline,/^[0-9a-f]{40,64}$/);
    assert.match(fs.readFileSync(result.diffPath,'utf8'),/toLowerCase/);
    assert.equal(fs.readFileSync(foreignIndex,'utf8'),sentinel);
    const localConfig=fs.readFileSync(path.join(result.workspace,'.git/config'),'utf8');
    assert(!/\[user\]|user\.name|user\.email/.test(localConfig));
    assert.equal(git(result.workspace,['diff','--','WORK-NOTE.md']),'');
    const identity=spawnSync(gitExecutable(),['-C',result.workspace,'config','--get','user.name'],{encoding:'utf8',windowsHide:true,env:gitEnvironment(result.workspace)});
    assert.notEqual(identity.status,0);
    const head=spawnSync(gitExecutable(),['-C',result.workspace,'rev-parse','--verify','HEAD'],{encoding:'utf8',windowsHide:true,env:gitEnvironment(result.workspace)});
    assert.notEqual(head.status,0);
  } finally {
    for (const [name,value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name]; else process.env[name]=value;
    }
  }
});
test('reference CLI output contains only the intended two notes',()=>{ const result=verifyReference(); const child=spawnSync(process.execPath,['cli.cjs','  REVIEW  '],{cwd:result.workspace,encoding:'utf8',windowsHide:true}); assert.equal(child.status,0); assert.equal(child.stdout.trim(),'n1: Review launch checklist\nn3: Review documentation'); });
