'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {evaluate,wire}=require('./guard.cjs');
const load=n=>JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures',n),'utf8'));
const patch=target=>'*** Begin Patch\n*** Add File: '+target+'\n+x\n*** End Patch';
const edit=target=>({...load('allow.json'),tool_input:{command:patch(target)}});
test('allowed in-root path produces no-objection context, not permission escalation',()=>{
 const result=evaluate(load('allow.json'));assert.equal(result.classification,'allow');assert.deepEqual(result.paths,['src/new-note.js']);
 assert.equal(wire(result).hookSpecificOutput.permissionDecision,undefined);assert.match(wire(result).hookSpecificOutput.additionalContext,/no policy objection/);
 const newline=load('allow.json');newline.tool_input.command+='\n';assert.equal(evaluate(newline).classification,'allow');
});
test('protected directory and environment files are denied before a patch is applied',()=>{
 for(const f of ['deny-protected.json','deny-env.json'])assert.equal(evaluate(load(f)).classification,'deny',f);
 assert.equal(evaluate(edit('docs/.env.example')).classification,'deny');
});
test('lexical traversal and root-prefix lookalikes cannot escape the practice root',()=>{
 for(const f of ['deny-traversal.json','deny-lookalike.json'])assert.equal(evaluate(load(f)).classification,'deny',f);
 assert.equal(evaluate(edit('src/../../outside.txt')).classification,'deny');
 assert.equal(evaluate(edit('.')).classification,'deny');
});
test('moves and mixed patches inventory every destination before allowing',()=>{
 for(const f of ['deny-move.json','mixed.json'])assert.equal(evaluate(load(f)).classification,'deny',f);
});
test('irrelevant tools and other events are explicitly outside policy coverage',()=>{
 assert.equal(evaluate(load('irrelevant.json')).classification,'irrelevant');assert.deepEqual(wire(evaluate(load('irrelevant.json'))),{});
 assert.equal(evaluate({hook_event_name:'SessionStart'}).classification,'irrelevant');
});
test('bad types, empty targets, ambiguous paths, and unknown patch controls deny safely',()=>{
 for(const item of [null,[],load('malformed-field.json'),edit(''),edit(' src/a.js'),edit('C:relative.txt'),edit('src\\a.js')])assert.equal(evaluate(item).classification,'invalid');
 const broken=load('allow.json');broken.tool_input.command='*** Begin Patch\n*** Surprise: x\n*** End Patch';assert.equal(evaluate(broken).classification,'invalid');
});
test('Windows fixtures use Windows root and case semantics without touching files',()=>{
 assert.equal(evaluate(load('windows-allow.json')).classification,'allow');assert.equal(evaluate(load('windows-deny.json')).classification,'deny');
 const ambiguous=load('windows-allow.json');ambiguous.tool_input.command=patch('\\rooted.txt');assert.equal(evaluate(ambiguous).classification,'invalid');
});
test('oversized and incomplete patches are invalid rather than accidentally allowed',()=>{
 const large=load('allow.json');large.tool_input.command='x'.repeat(66000);assert.equal(evaluate(large).classification,'invalid');
 const incomplete=load('allow.json');incomplete.tool_input.command='*** Begin Patch\n*** Add File: x';assert.equal(evaluate(incomplete).classification,'invalid');
});
test('malformed stdin gets a supported denial response and separate diagnostics',()=>{
 const out=spawnSync(process.execPath,[path.join(__dirname,'guard.cjs')],{input:'{bad-json',encoding:'utf8'});
 assert.equal(out.status,0);assert.equal(JSON.parse(out.stdout).hookSpecificOutput.permissionDecision,'deny');assert.match(out.stderr,/validation failed/);
});
test('missing handler is a launch failure, never falsely reported as policy denial',()=>{
 const out=spawnSync(process.execPath,[path.join(__dirname,'missing.cjs')],{input:'{}',encoding:'utf8'});
 assert.notEqual(out.status,0);assert.equal(out.stdout,'');
});
test('reference solution protects generated while baseline exercise remains observable',()=>{
 const e=load('extension.json');assert.equal(evaluate(e).classification,'allow');assert.equal(evaluate(e,{protectGenerated:true}).classification,'deny');
 assert.equal(evaluate(edit('src/generated-helper.js'),{protectGenerated:true}).classification,'allow');
 const out=spawnSync(process.execPath,[path.join(__dirname,'solution/guard.cjs')],{input:JSON.stringify(e),encoding:'utf8'});
 assert.equal(out.status,0);assert.equal(JSON.parse(out.stdout).hookSpecificOutput.permissionDecision,'deny');
});
test('draft generator is parseable and points at the actual chosen local handler',()=>{
 for(const args of [[],['--solution']]){
  const out=spawnSync(process.execPath,[path.join(__dirname,'create-config-draft.cjs'),...args],{encoding:'utf8'});
  assert.equal(out.status,0);const h=JSON.parse(out.stdout).hooks.PreToolUse[0];assert.equal(h.matcher,'^apply_patch$');assert.equal(h.hooks[0].type,'command');
  assert.ok(h.hooks[0].command.includes('guard.cjs'));
 }
});
test('editable candidate preserves baseline regressions whether pending or solved; reference passes the same gate',()=>{
 const pending=spawnSync(process.execPath,[path.join(__dirname,'exercise-check.cjs')],{encoding:'utf8'});
 assert.equal(pending.stderr,'');assert.doesNotMatch(pending.stdout,/Regression failed/);
 assert.ok(pending.status===0||(pending.status===1&&/edit learner.cjs/.test(pending.stdout)));
 const solved=spawnSync(process.execPath,[path.join(__dirname,'exercise-check.cjs'),'--solution'],{encoding:'utf8'});
 assert.equal(solved.status,0);assert.match(solved.stdout,/candidate regression checks passed/);
});

