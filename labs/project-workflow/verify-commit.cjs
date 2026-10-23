'use strict';
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const {createWorkspace,git}=require('./workspace.cjs');
function verifyCommit(){
 const created=createWorkspace({withGit:true});
 const owned=fs.realpathSync(created.workspace);const parent=fs.realpathSync(path.dirname(owned));
 assert.equal(path.dirname(owned),parent);assert(path.basename(owned).startsWith('codex-project-workflow-'));
 const file=n=>path.join(owned,n);const configBefore=fs.readFileSync(file('.git/config'));
 const identity=['-c','user.name=Course Practice','-c','user.email=practice@example.invalid','-c','commit.gpgSign=false'];
 fs.writeFileSync(file('notes-draft.md'),'Untracked fictional draft; excluded from the practice commit.\n');
 git(owned,[...identity,'commit','--quiet','-m','Record intentionally broken practice baseline']);
 const baseline=git(owned,['rev-parse','HEAD']);
 const baselineFiles=git(owned,['ls-tree','--name-only','HEAD']).split(/\r?\n/);assert.equal(baselineFiles.length,8);assert(!baselineFiles.includes('notes-draft.md'));
 const baselineReadme=git(owned,['show','HEAD:README.md']);assert(baselineReadme.includes('npm test'));
 for(const n of ['notes.cjs','README.md'])fs.copyFileSync(path.join(__dirname,'solution',n),file(n));
 git(owned,['add','--','notes.cjs','README.md']);
 const staged=git(owned,['diff','--cached','--name-only']).split(/\r?\n/);assert.deepEqual(staged,['README.md','notes.cjs']);
 const pending=git(owned,['status','--short']);assert(pending.includes('?? notes-draft.md'));
 git(owned,[...identity,'commit','--quiet','-m','Record focused practice fix']);
 const candidate=git(owned,['rev-parse','HEAD']);assert.notEqual(candidate,baseline);
 assert(git(owned,['show','HEAD:README.md']).includes('node --test checks.cjs'));
 assert(git(owned,['show',`${baseline}:README.md`]).includes('npm test'));
 assert(git(owned,['show','HEAD:notes.cjs']).includes('toLowerCase'));
 assert.equal(git(owned,['diff','--name-only',baseline,candidate]),'README.md\nnotes.cjs');
 assert.equal(git(owned,['status','--short']),'?? notes-draft.md');
 fs.appendFileSync(file('README.md'),'\nA later unstaged fictional observation.\n');
 const after=git(owned,['status','--short']);assert(after.includes(' M README.md'));assert(after.includes('?? notes-draft.md'));
 assert(!git(owned,['show','HEAD:README.md']).includes('A later unstaged'));
 assert.deepEqual(fs.readFileSync(file('.git/config')),configBefore);
 assert.equal(git(owned,['remote']), '');
 return {workspace:owned,baselineCommit:baseline,candidateCommit:candidate,committedPaths:baselineFiles,changedInCandidate:staged,statusBeforeCandidateCommit:pending,statusAfterCommitsAndLaterEdit:after,untrackedDraft:'excluded from both commits',laterUnstagedObservation:'not in HEAD',configBytes:'unchanged; identity only in invocation',identity:'fictional Course Practice <practice@example.invalid>',remotes:[],scope:'new owned repository only; no cleanup, owner repository or Codex task'};
}
if(require.main===module){try{console.log(JSON.stringify(verifyCommit(),null,2));}catch(e){console.error(e.stack);process.exitCode=1;}}
module.exports={verifyCommit};
