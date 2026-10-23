'use strict';
// Outcome contracts: stable questions, complete navigable reading, usable practice dependencies.
// No browser/runtime dependencies; public contributors can run this from a clean export.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),os=require('node:os');
const root=path.resolve(__dirname,'..');
const identities=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/study-identities.json'),'utf8'));
const countProof=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/s07-count-proof.json'),'utf8'));
function check(base){
 const read=f=>fs.readFileSync(path.join(base,f),'utf8');
 const modules=['a','b','c'].flatMap(p=>JSON.parse(read(`content/part-${p}.json`)));
 const lessons=modules.flatMap(m=>m.lessons);
 const pluginLesson=structuredClone(lessons.find(l=>l.id==='s07-05'));assert.equal(pluginLesson.lab.commands[0].expected,countProof.corrected,'Independently confirmed actual count');pluginLesson.lab.commands[0].expected=countProof.old;assert.equal(require('node:crypto').createHash('sha256').update(JSON.stringify(pluginLesson)).digest('hex'),countProof.normalizedLessonHash,'Only the permitted expected prose changed in s07-05');
 assert.deepEqual(JSON.parse(read('study/codex-study/references/course.json')),modules,'Tutor pack carries complete current lessons');
 assert.deepEqual(lessons.map(l=>({id:l.id,sourceKey:l.sourceKey,quiz:l.quiz})),identities,'Protected quiz semantics and identity');
 const steps=JSON.parse(read('study/milestones.json'));
 assert.equal(steps.length,10);assert.equal(new Set(steps.map(s=>s.module)).size,10);
 const seen=new Set();
 for(const s of steps){
  assert.ok(modules.find(m=>m.id===s.module),'Known module');
  assert.ok(s.requires.every(id=>seen.has(id)),'Topological prerequisite order');seen.add(s.module);
  assert.ok(lessons.find(l=>l.id===s.lesson),'Study lesson link exists');
  assert.ok(fs.statSync(path.join(base,s.practice)).isFile(),'Practice destination exists');
  for(const k of ['recall','transfer','exit'])assert.ok(typeof s[k]==='string'&&s[k].length>35,'Missing grounded '+k);
  assert.ok(Array.isArray(s.transferRubric)&&s.transferRubric.length>=3&&s.transferRubric.every(c=>typeof c==='string'&&c.length>35),'Missing grounded transfer rubric');
  const topic=modules.find(m=>m.id===s.module),publicBase='https://builtbyhuy.github.io/codex-howto/';
  assert.deepEqual(Object.keys(s.readingUrls).sort(),topic.lessons.map(l=>l.id).sort(),'Every lesson has an explicit public destination');
  for(const l of topic.lessons){assert.equal(s.readingUrls[l.id],publicBase+'assets/reading/'+l.id+'.html','Stable reading destination');assert.ok(fs.existsSync(path.join(base,'assets/reading',l.id+'.html')),'Reading destination exists');}
  assert.equal(s.practiceUrl,publicBase+s.practice,'Explicit practice destination');
  assert.ok(s.immediateTask.includes(s.module==='01'?'read-only':'exit evidence'),'Authored immediate practice');
  if(s.module==='01')for(const term of ['Orbit Notes','folder','n1, n2, n3, n4','unknown','npm test'])assert.ok(s.immediateTask.includes(term),'Beginner milestone '+term);
  assert.ok(s.minutes.length===2&&s.minutes[0]>=15&&s.minutes[1]<=120&&s.minutes[1]>=s.minutes[0],'Bounded estimate');
 }
 assert.deepEqual([...seen].sort(),modules.map(m=>m.id).sort(),'All ten modules covered');
 assert.deepEqual(JSON.parse(read('study/codex-study/references/milestones.json')),steps,'Tutor milestones are current');
 const skill=read('study/codex-study/SKILL.md');for(const term of ['one question at a time','skip','correctness separately from reasoning','misconception','exit check','references/course.json'])assert.ok(skill.includes(term),'Tutor workflow contract '+term);
 const roadmap=read('LEARNING-ROADMAP.md');
 for(const term of ['Beginner','Intermediate','Advanced','unassessed','before reading','during reading','after reading','stores no progress'])assert.ok(roadmap.includes(term),'Learner path intent/limits: '+term);
 for(const l of lessons){
  const doc=read(`docs/lessons/${l.id}.md`);
  for(const text of [l.title,l.exercise,l.quiz.question,l.quiz.explanation])assert.ok(doc.includes(String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')),'Reading edition includes source '+l.id);
  assert.ok(doc.includes('## Checks for understanding')&&doc.includes('## Reference solution'),'Grounded lesson rubric '+l.id);
  assert.ok(doc.indexOf('## Understand the concept')<doc.indexOf('## Your practice task'),'Explanation before practice '+l.id);
  assert.ok(doc.indexOf('<details><summary>Reference solution')<doc.indexOf('## Reference solution'),'Attempt-first practical reference '+l.id);
  assert.ok(!/^## (body|sections|example|lab)$/m.test(doc),'No authoring-field headings');
  for(const file of l.lab.files)assert.ok(doc.includes(`](../../${file.path})`),'Distinct navigable practice source '+file.path);
  for(const example of [l.example,...(l.examples||[])])assert.ok(doc.includes(example.code),'Code bytes preserved '+l.id);
  assert.ok(read('CATALOG.md').includes(`docs/lessons/${l.id}.md`),'Catalog lesson link '+l.id);
 }
 for(const file of ['CATALOG.md','LEARNING-ROADMAP.md',...lessons.map(l=>`docs/lessons/${l.id}.md`)]){
  for(const m of read(file).matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(m[1]))continue;
   const dest=path.resolve(base,path.dirname(file),m[1].split('#')[0]);
   assert.ok(dest.startsWith(base+path.sep)&&fs.existsSync(dest),'Reading link resolves: '+file+' -> '+m[1]);
  }
 }
 for(const lang of ['en','vi','zh','ja','uk']){const guide=read(`docs/guides/${lang}/README.md`);assert.ok(guide.includes('https://builtbyhuy.github.io/codex-howto/'));assert.ok(!guide.includes('chatgpt.site'),'No rejected active guide destination');}
 return {status:'PASS',modules:10,lessons:60,claims:'Source and navigation checks only; no learner or native activation outcome'};
}
function controls(){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'howto-study-controls-'));
 for(const folder of ['content','study','docs/lessons','docs/guides','labs','assets/reading'])fs.cpSync(path.join(root,folder),path.join(temp,folder),{recursive:true});
 for(const file of ['README.md','CATALOG.md','LEARNING-ROADMAP.md'])fs.copyFileSync(path.join(root,file),path.join(temp,file));
 const steps=JSON.parse(fs.readFileSync(path.join(temp,'study/milestones.json')));
 for(const s of steps){const dest=path.join(temp,s.practice);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,s.practice),dest);}
 assert.equal(check(temp).status,'PASS');
 const copied=fs.mkdtempSync(path.join(os.tmpdir(),'howto-copy-only-coach-'));fs.cpSync(path.join(root,'study/codex-study'),path.join(copied,'codex-study'),{recursive:true});
 assert.ok(!fs.existsSync(path.join(copied,'labs')),'Copy-only coach does not claim local labs');
 const portable=JSON.parse(fs.readFileSync(path.join(copied,'codex-study/references/milestones.json')));
 assert.equal(portable[0].readingUrls['s01-01'],'https://builtbyhuy.github.io/codex-howto/assets/reading/s01-01.html');assert.equal(portable[0].practiceUrl,'https://builtbyhuy.github.io/codex-howto/labs/project-workflow/README.md');
 assert.ok(fs.readFileSync(path.join(copied,'codex-study/SKILL.md'),'utf8').includes('Never construct course destinations'));
 const part=path.join(temp,'content/part-a.json'),original=fs.readFileSync(part,'utf8'),data=JSON.parse(original);
 data[0].lessons[0].quiz.answer=(data[0].lessons[0].quiz.answer+1)%3;fs.writeFileSync(part,JSON.stringify(data));assert.throws(()=>check(temp),/Protected quiz|Tutor pack/);fs.writeFileSync(part,original);
 const plan=path.join(temp,'study/milestones.json'),planBytes=fs.readFileSync(plan);steps[0].lesson='s99-99';fs.writeFileSync(plan,JSON.stringify(steps));assert.throws(()=>check(temp),/Study lesson link/);fs.writeFileSync(plan,planBytes);
 const badDestination=JSON.parse(planBytes);badDestination[0].readingUrls['s01-01']='https://builtbyhuy.github.io/codex-howto/01-slash-commands/README.md';fs.writeFileSync(plan,JSON.stringify(badDestination));assert.throws(()=>check(temp),/Stable reading destination/);fs.writeFileSync(plan,planBytes);
 const badPractice=JSON.parse(planBytes);badPractice[0].practiceUrl='https://builtbyhuy.github.io/codex-howto/missing-lab';fs.writeFileSync(plan,JSON.stringify(badPractice));assert.throws(()=>check(temp),/Explicit practice destination/);fs.writeFileSync(plan,planBytes);
 const missingTransfer=JSON.parse(planBytes);missingTransfer[0].transferRubric=[];fs.writeFileSync(plan,JSON.stringify(missingTransfer));assert.throws(()=>check(temp),/Missing grounded transfer rubric/);fs.writeFileSync(plan,planBytes);
 const doc=path.join(temp,'docs/lessons/s01-01.md'),docBytes=fs.readFileSync(doc,'utf8');fs.writeFileSync(doc,docBytes.replace('## Reference solution','## removed'));assert.throws(()=>check(temp),/Grounded lesson rubric/);fs.writeFileSync(doc,docBytes);
 assert.equal(check(temp).status,'PASS');
 return {validControl:'PASS',wrongAnswer:'REJECTED',brokenLesson:'REJECTED',missingRubric:'REJECTED',missingTransferRubric:'REJECTED',invalidReadingDestination:'REJECTED',invalidPracticeDestination:'REJECTED',directory:temp};
}
function quickstart(base){
 const {workspace}=require(path.join(base,'labs/project-workflow/workspace.cjs')).createWorkspace({withGit:false});
 const file=name=>path.join(workspace,name),before=Object.fromEntries(['notes.json','checks.cjs','WORK-NOTE.md'].map(f=>[f,fs.readFileSync(file(f),'utf8')]));
 const notes=JSON.parse(before['notes.json']);
 const assess=()=>{delete require.cache[require.resolve(file('notes.cjs'))];const {searchNotes}=require(file('notes.cjs'));const cases=[()=>assert.deepEqual(searchNotes(notes,'').map(n=>n.id),['n1','n2','n3','n4']),()=>assert.deepEqual(searchNotes(notes,'REVIEW').map(n=>n.id),['n1','n3']),()=>assert.deepEqual(searchNotes(notes,'  Review  ').map(n=>n.id),['n1','n3']),()=>assert.deepEqual(searchNotes(notes,'workshop').map(n=>n.id),['n2']),()=>assert.deepEqual(searchNotes(notes,'invoice'),[]),()=>{assert.equal(searchNotes(notes,'')[0],notes[0]);assert.equal(JSON.stringify(notes),JSON.stringify(JSON.parse(before['notes.json'])));}];return cases.reduce((r,test)=>{try{test();r.pass++;}catch(e){if(e.code!=='ERR_ASSERTION')throw e;r.fail++;}return r;},{pass:0,fail:0});};
 assert.deepEqual(assess(),{pass:4,fail:2},'Disposable starter has exactly two intended defects');
 fs.copyFileSync(path.join(base,'labs/project-workflow/solution/notes.cjs'),file('notes.cjs'));
 assert.deepEqual(assess(),{pass:6,fail:0},'Reference fixes the demonstrated task');
 for(const [f,text]of Object.entries(before))assert.equal(fs.readFileSync(file(f),'utf8'),text,'Unrelated scratch source preserved');
 return {status:'PASS',workspace,starter:{pass:4,fail:2},reference:{pass:6,fail:0},scope:'Direct independent contract assertions in a disposable source copy; no ZIP, child processes or native Codex'};
}
if(require.main===module){try{const base=path.resolve(process.argv.slice(2).find(a=>!a.startsWith('--'))||root);console.log(JSON.stringify({check:check(base),quickstart:quickstart(base),controls:process.argv.includes('--controls')?controls(): 'Run --controls for temporary fault injection'},null,2));}catch(e){console.error(e.stack);process.exitCode=1;}}
module.exports={check,controls,quickstart};
