import {highlightView,highlightCode,renderReference,mountLearningTools} from './assets/atelier/learning-tools.mjs';
import {mountStudy} from './assets/atelier/study.mjs';
import {lessonOutline} from './assets/atelier/lesson-outline.mjs';
import {showDialog,installInteractions,arrive,disposeReader,mountReader} from './assets/atelier/interactions.mjs';
import {validateCourse, sanitizeProgress, EDITION, PARTS} from './content-model.mjs';
import {mountCourseMotion,disposeCourseMotion} from './course-motion.mjs';
import {referenceHome,referenceModule,referenceProgress,continueLabel,paintHomeDetails} from './assets/atelier/home.mjs';
import {guidePage,guideMarkdown} from './assets/reference/guide-render.mjs';
import {mountReferenceMotion,disposeReferenceMotion,animateReferenceTheme} from './assets/atelier/motion.mjs';
const $ = (selector, parent = document) => parent.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const inline = value => esc(value).replace(/`([^`]+)`/g, '<code>$1</code>');
const icon = (name, extra = '') => `<span class="icon ${extra}" style="--icon:url('${esc(new URL('assets/icons/'+name+'.svg',document.baseURI).href)}')" aria-hidden="true"></span>`;
const main = $('#main-content');
// Text enlargement can wrap navigation. Keep fixed reading rails below its real height.
if(globalThis.ResizeObserver){new ResizeObserver(entries=>{const height=entries[0]?.target.getBoundingClientRect().height;if(height)document.documentElement.style.setProperty('--actual-header-height',height+'px');}).observe($('.site-header'));}
// Native reading destinations remain useful before JavaScript boots.
for(const link of document.querySelectorAll('[data-interactive-href]'))link.setAttribute('href',link.dataset.interactiveHref);
const STORAGE_KEY = 'codex-howto-progress-v2';
const THEME_KEY = 'codex-howto-theme-v1';
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 1000px)');
const levels = [
  {id:'beginner',label:'Stage 01',title:'Build your foundations',text:'Start in the app. Learn commands, project guidance, safe recovery, and the CLI.'},
  {id:'intermediate',label:'Stage 02',title:'Build connected workflows',text:'Reuse skills, understand hooks, connect tools, and delegate with clear boundaries.'},
  {id:'advanced',label:'Stage 03',title:'Make it your workflow',text:'Plan complex work, control permissions, and package tested capabilities for reuse.'}
];
const topicIcons = ['terminal','sparkles','book-open','code-2','git-branch','sparkles','plug','shield','terminal','route'];
const openModules = new Set();
let modules = [], lessons = [], byId = new Map(), catalog, labCatalog=[], overviews={}, view = '';
let diagramZoom=1, viewerFileText='', viewerRequest=0, studyRequest=0;
let viewerPath='',viewerHistory=[];
let state = {lessons:{},last:null};
let toastTimer;
const copyRequests=new WeakMap();
let drawerOpen = false;
let homeMenuOpen=false,guideRequest=0;
let contentReady = false;
let learningTools;
let restoringHomePreview=false;
let storageAvailable=true;
let progressReadBlocked=false;
let progressWriteDenied=false;
installInteractions();

const systemTheme=matchMedia('(prefers-color-scheme: dark)');
let themeChoice=null;
function applyThemeChoice(choice,animate=false){themeChoice=['light','dark'].includes(choice)?choice:null;const change=()=>{document.documentElement.dataset.theme=themeChoice||(systemTheme.matches?'dark':'light');updateThemeLabel();};animate?animateReferenceTheme(change):change();}
try{applyThemeChoice(localStorage.getItem(THEME_KEY));}catch{applyThemeChoice(null);}
systemTheme.addEventListener('change',()=>{if(themeChoice===null)applyThemeChoice(null,true);});

function updateThemeLabel() {
  const dark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.classList.toggle('dark',dark);
  $('#theme-toggle').setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  $('#theme-toggle').setAttribute('aria-pressed', String(dark));
}
function notify(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3600);
}
function warnStorage(message) {
  storageAvailable=false;
  let notice = $('#storage-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'storage-notice'; notice.className = 'storage-notice';
    notice.setAttribute('role','status'); $('.site-header').after(notice);
  }
  notice.textContent = message;
  const indicator=$('.local-indicator');if(indicator)indicator.innerHTML='<i aria-hidden="true"></i>Session-only progress';
  syncStorageCopy();
}
function syncStorageCopy(){
  if(storageAvailable)return;
  const saved=$('.a-progress-bottom>span');if(saved)saved.textContent='Session-only progress';
  const summary=$('.a-path-summary');if(summary)summary.textContent='Your place is kept for this open session only. Export a backup before closing.';
}
function readProgress() {
  progressReadBlocked=false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state={lessons:{},last:null};
      if(localStorage.getItem('codex-howto-progress-v1')) {
        let notice=$('#edition-notice');
        if(!notice){notice=document.createElement('div');notice.id='edition-notice';notice.className='storage-notice';$('.site-header').after(notice);}
        notice.textContent='Welcome to the full 60-topic edition. Your earlier 30-lesson progress is kept separately; reorganized lessons start fresh so completion is not assigned to a different topic.';
      }
      return;
    }
    state = sanitizeProgress(JSON.parse(raw),lessons);
    // External recovery proves persisted data is valid, not that a denied writer can write.
    if(!progressWriteDenied)restoreStorageStatus();
    else warnStorage('Your browser is blocking saved progress. Changes will only last for this open session.');
  } catch { state={lessons:{},last:null};progressReadBlocked=true;warnStorage('Saved progress could not be read and may be corrupt. The original record is preserved. You can learn for this session; explicitly import a valid backup or reset progress to replace it.'); }
}
function restoreStorageStatus(){
  storageAvailable=true;
  $('#storage-notice')?.remove();
  const indicator=$('.local-indicator');if(indicator)indicator.innerHTML='<i aria-hidden="true"></i>Saved in this browser';
  const saved=$('.a-progress-bottom>span');if(saved)saved.textContent='Saved in this browser';
  const summary=$('.a-path-summary');if(summary)summary.textContent='One useful task at a time. Your place is saved.';
}
function saveProgress(replaceUnreadable=false) {
  if(progressReadBlocked&&!replaceUnreadable)return false;
  try {
    const raw=JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY,raw);
    if(localStorage.getItem(STORAGE_KEY)!==raw)throw new Error('Progress write could not be confirmed');
    progressReadBlocked=false;progressWriteDenied=false;restoreStorageStatus();
    return true;
  }
  catch { progressWriteDenied=true;warnStorage(progressReadBlocked?'Saved progress could not be read and may be corrupt. The original record is preserved; browser storage is also blocking recovery. Changes are session-only.':'Your browser is blocking saved progress. Changes will only last for this open session.'); return false; }
}
function status(id) { return state.lessons[id]?.status || 'new'; }
function counts(items = lessons) {
  const done = items.filter(l => status(l.id)==='done').length;
  const started = items.filter(l => status(l.id)==='started').length;
  return {done,started,left:items.length-done-started,total:items.length,percent:items.length?Math.round(done/items.length*100):0};
}
function continueLesson() {
  if (state.last && status(state.last)!=='done') return byId.get(state.last);
  const started = lessons.filter(l=>status(l.id)==='started').sort((a,b)=>(state.lessons[b.id]?.updated||0)-(state.lessons[a.id]?.updated||0));
  return started[0] || lessons.find(l=>status(l.id)!=='done') || lessons[0];
}
function lessonURL(id) { return `#lesson/${id}`; }
function statusLabel(id) { return {new:'Not started',started:'In progress',done:'Completed'}[status(id)]; }
function homeContext(){return {modules,lessons,levels,labs:labCatalog,status,counts,continueLesson,openModules,icon};}
function progressMarkup(){return referenceProgress(homeContext());}
function paintRoadmap(){
 const c=counts(),next=continueLesson(),names={new:'not-started',started:'in-progress',done:'done'};
 const ring=$('#ring-fg');if(ring){ring.dataset.progress=String(c.percent);ring.style.strokeDashoffset=String(2*Math.PI*52*(1-c.percent/100));$('.ring-wrap').setAttribute('aria-valuenow',c.percent);$('#ring-pct').textContent=c.percent+'%';$('#c-done').textContent=c.done;$('#c-prog').textContent=c.started;$('#c-todo').textContent=c.left;}
 for(const m of modules){const station=$('.station[data-module="'+m.id+'"]');if(!station)continue;const p=counts(m.lessons),s=p.done===p.total?'done':p.done||p.started?'started':'new';station.dataset.status=names[s];$('[data-pill]',station).textContent={new:'Not started',started:'In progress',done:'Completed'}[s];$('[data-bar]',station).style.width=p.percent+'%';$('[data-count]',station).textContent=p.done+'/'+p.total;
  for(const l of m.lessons){const row=$('.lesson[data-lesson="'+l.id+'"]',station),state=status(l.id);row.dataset.status=names[state];$('.check',row).setAttribute('aria-checked',state==='done'?'true':state==='started'?'mixed':'false');$('.check',row).setAttribute('aria-label',"Mark '"+l.title+"' "+(state==='done'?'as in progress':'as done'));$('[data-lstatus]',row).textContent=statusLabel(l.id);}}
 paintHomeDetails(homeContext());main.dispatchEvent(new CustomEvent('reference-progress'));renderRail();
}
function renderRail() {
  const scroll = $('#rail-content').scrollTop;
  const lessonView = byId.has(view);
  if(lessons.length){const next=continueLesson(),c=counts(),link=$('.a-nav-actions>.a-button'),label=c.done===c.total?'Revisit the course':c.started||c.done?'Continue learning':'Start learning';link.href=lessonURL(next.id);link.textContent=label;link.setAttribute('aria-label',label+': '+next.title);}
  document.body.dataset.page=lessonView?'lesson':view;
  for(const link of document.querySelectorAll('[data-header-nav]')){const selected=link.dataset.headerNav===(lessonView?'path':view==='home'&&/(?:path|roadmap)/.test(location.hash)?'path':view);link.classList.toggle('active',selected);selected?link.setAttribute('aria-current','page'):link.removeAttribute('aria-current');}
  $('#rail-content').innerHTML = lessonView ? sidebar(view) : `<div class="rail-label">Course modules</div><div class="rail-modules">${modules.map(m=>`<a class="rail-module" href="${lessonURL(m.lessons[0].id)}"><span>${m.id}</span><span>${esc(m.title)}</span>${counts(m.lessons).done===m.lessons.length?icon('check'):''}</a>`).join('')}</div><div class="rail-help"><span class="rail-help-icon">${icon('sparkles')}</span><strong>Make it practical.</strong><p>Every lesson ends with something you can try and check.</p><button type="button" data-action="assessment">Find your starting point ↗</button></div>`;
  $('#rail-content').scrollTop = scroll;
  const c = counts();
  $('#rail-progress').innerHTML = `<div class="rail-progress-heading"><span>Your progress</span><strong>${c.percent}%</strong></div><div class="rail-progress-track"><span style="width:${c.percent}%"></span></div><span class="rail-progress-caption">${c.done} of ${c.total} lessons completed</span>`;
  $('[data-nav="overview"]').classList.toggle('active', view==='home' && !/(?:path|roadmap)/.test(location.hash));
  $('[data-nav="path"]').classList.toggle('active', lessonView || /(?:path|roadmap)/.test(location.hash));
  $('[data-nav="sources"]').classList.toggle('active', view==='sources');
  $('[data-nav="labs"]').classList.toggle('active',view==='labs');
  $('[data-nav="study"]').classList.toggle('active',view==='study');
  $('#header-page').textContent = lessonView ? `Module ${view.slice(1,3)}` : view==='sources'?'Source library':view==='labs'?'Practice labs':view==='study'?'Focused study':'Overview';
  $('.nav-count').textContent=lessons.length;
  syncStorageCopy();
}
function moduleMarkup(m){return referenceModule(m,homeContext());}
function renderHome(){const markup=referenceHome(homeContext());return storageAvailable?markup:markup.replace('Saved in this browser','Session-only progress').replace('One useful task at a time. Your place is saved.','Your place is kept for this open session only. Export a backup before closing.');}
async function renderTranslatedGuide(lang){
 const request=++guideRequest;stopTerminal();view='guide';renderRail();document.documentElement.lang=lang;
 main.innerHTML='<div class="loading-state" role="status">Opening the getting-started guide…</div>';
 try{const response=await fetch('docs/guides/'+lang+'/README.md');if(!response.ok)throw Error('Guide unavailable');const text=await response.text();if(request!==guideRequest||view!=='guide')return;main.innerHTML=guidePage(lang,text);enterView();document.title='Getting started · '+lang+' — Howto codex';scrollToPart();}
 catch{if(request!==guideRequest)return;main.innerHTML='<div class="error-state" role="alert"><h1>This guide could not be opened.</h1><p>Try another language or return to the learning path. Your progress is unchanged.</p><a class="button" href="#languages">Guide languages</a></div>';}
}
function sidebar(current) {
  return `<div class="guide-sidebar" id="guide-sidebar"><a class="back-roadmap" href="#path">← All modules</a><label class="sidebar-label" for="lesson-search">Find a lesson</label><div class="sidebar-search-wrap">${icon('search')}<input class="sidebar-search" id="lesson-search" type="search" placeholder="Search lessons…" autocomplete="off"></div><div id="sidebar-groups">${modules.map(m=>`<section class="sidebar-group" data-search-group><h2>${m.id}. ${esc(m.title)}</h2>${m.lessons.map(l=>`<a class="sidebar-link" data-search-title="${esc(m.title+' '+l.title)}" href="${lessonURL(l.id)}" ${current===l.id?'aria-current="page"':''}><span class="lesson-check ${status(l.id)}" aria-hidden="true">${status(l.id)==='done'?'✓':''}</span><span>${esc(l.title)}</span></a>`).join('')}</section>`).join('')}</div><p class="sidebar-empty" id="sidebar-empty" role="status" aria-live="polite" hidden>No matching lessons. Try a topic such as “Git” or “context”.</p></div>`;
}
function exampleMarkup(example, id, index = 0) {
  return `<div class="code-block"><div class="code-header"><span>${esc(example.label)} <small>${esc(example.language)}</small></span><button class="copy-button" type="button" data-example="${id}" data-example-index="${index}" aria-label="Copy ${esc(example.label)}">Copy</button></div><pre><code data-language="${esc(example.language)}">${esc(example.code)}</code></pre></div>`;
}
function diagramMarkup(l){
 const preview=overviews[l.id];
 return `<figure class="lesson-diagram" data-diagram-kind="${esc(l.diagram.kind)}" aria-labelledby="diagram-title"><div class="diagram-heading"><div><span class="eyebrow">At a glance</span><h3 id="diagram-title">${esc(preview.title)}</h3></div><button class="button" type="button" data-action="diagram" data-lesson="${l.id}">Open full diagram ↗</button></div><div class="diagram-viewport" tabindex="0" role="region" aria-label="${esc(preview.title)}"><picture><source media="(max-width:700px)" srcset="${esc(preview.mobileAsset)}" width="${preview.mobileWidth}" height="${preview.mobileHeight}"><img src="${esc(preview.asset)}" alt="${esc(preview.text)}" width="${preview.width}" height="${preview.height}" loading="lazy"></picture></div><figcaption><details><summary>Read this diagram as text</summary><p>${esc(preview.text)}</p>${preview.text===l.diagram.text?'':`<p>${esc(l.diagram.text)}</p>`}</details></figcaption></figure>`;
}
function workedMarkup(l){
  if(!l.worked)return '';
  const w=l.worked;
  return `<section class="article-section worked-example" id="worked"><span class="eyebrow">From input to result</span><h2>${esc(w.title)}</h2><p>${inline(w.scenario)}</p><div class="code-block"><div class="code-header"><span>${esc(w.language)} · example</span><button class="copy-button" type="button" data-worked="${l.id}" aria-label="Copy the worked example">Copy</button></div><pre><code data-language="${esc(w.language)}">${esc(w.code)}</code></pre></div><div class="expected-output"><span class="output-label">Expected result · compare with your run</span><pre><code>${esc(w.output)}</code></pre></div><p>${inline(w.explanation)}</p></section>`;
}
function labMarkup(l){
  if(!l.lab)return '';
  const lab=l.lab;
  const downloads=[lab.path,...(lab.relatedPaths||[])];
  const related=downloads.length>1?'<p>This exercise uses both packs. Extract each into the same practice root, keeping their separate folders under labs.</p>':'';
  return `<section class="article-section lab-workbench" id="lab"><div class="lab-workbench-heading"><span class="practice-label">${icon('terminal')} Run the practice</span><h2>${esc(lab.title)}</h2><p>Extract into a new practice folder and keep the included labs folder. Run these commands from that extraction root, or from the course folder, using an existing Node.js installation.</p>${related}<div class="lab-downloads">${downloads.map((path,i)=>`<a class="button" href="${esc(path)}.zip" download>${i?'Download companion: '+esc(path.split('/').pop()):'Download this lab'} ↓</a>`).join('')}</div></div><ol class="lab-commands">${lab.commands.map((c,i)=>`<li><div class="code-block"><div class="code-header"><span>Command ${i+1}</span><button class="copy-button" type="button" data-lab-copy="${l.id}" data-command="${i}" aria-label="Copy lab command ${i+1}">Copy</button></div><pre><code>${esc(c.command)}</code></pre></div><p><strong>Check:</strong> ${inline(c.expected)}</p></li>`).join('')}</ol><div class="lab-files"><strong>Inspect the actual files</strong>${lab.files.map(f=>`<button type="button" class="file-link" data-action="lab-file" data-file="${esc(f.path)}">${icon('code-2')}${esc(f.label)} ↗</button>`).join('')}</div><p class="lab-takeaway">${inline(lab.takeaway)}</p></section>`;
}
function solutionMarkup(l){
  if(!l.solution)return '';
  return `<details class="reference-solution" id="solution"><summary><span>Reference answer & rubric</span><small>Try the exercise before opening</small></summary><div><p>${inline(l.solution.summary)}</p><ol>${l.solution.steps.map(s=>`<li>${inline(s)}</li>`).join('')}</ol></div></details>`;
}
function troubleshootingMarkup(l){
  if(!l.troubleshooting)return '';
  return `<section class="article-section troubleshooting" id="troubleshooting"><h2>When it does not work</h2>${l.troubleshooting.map(t=>`<details><summary>${esc(t.symptom)}</summary><div><p><strong>Likely cause:</strong> ${inline(t.cause)}</p><p><strong>What to try:</strong> ${inline(t.fix)}</p></div></details>`).join('')}</section>`;
}
function quizMarkup(l) {
  const selected=state.lessons[l.id]?.answer;
  return `<section class="article-section knowledge-check" id="quiz"><span class="eyebrow">Think it through</span><h2>Check your understanding</h2><form class="lesson-quiz" data-quiz="${l.id}"><fieldset><legend>${inline(l.quiz.question)}</legend>${l.quiz.options.map((option,i)=>`<label class="quiz-option"><input type="radio" name="answer" value="${i}" required ${selected===i?'checked':''}><span>${inline(option)}</span></label>`).join('')}</fieldset><button class="button" type="submit">Check my answer</button><div class="quiz-feedback" role="status" aria-live="polite">${Number.isInteger(selected)?quizFeedback(l,selected):''}</div></form></section>`;
}
function quizFeedback(l, answer) {
  return `<strong>${answer===l.quiz.answer?'That’s right.':'Try a different approach.'}</strong><p>${inline(l.quiz.explanation)}</p>`;
}
function renderLesson(l) {
  const m=modules.find(m=>m.lessons.some(item=>item.id===l.id)), index=lessons.indexOf(l), previous=lessons[index-1], next=lessons[index+1], done=status(l.id)==='done';
  const source=catalog.modules.flatMap(m=>m.lessons).find(s=>s.key===l.sourceKey);
  const label={equivalent:'Equivalent capability',different:'Different in Codex',alternative:'Alternative workflow'}[l.equivalence.status];
  return `<div class="reader-layout"><article class="lesson-article" aria-labelledby="lesson-title">
<div class="reading-progress" aria-hidden="true"><i></i></div><header class="lesson-heading"><div class="breadcrumb"><a href="#path">← Learning path</a><span>Lesson ${String(index+1).padStart(2,'0')} / ${lessons.length}</span></div><h1 id="lesson-title" tabindex="-1">${esc(l.title)}</h1><div class="lesson-top-meta"><span>${esc(m.title)}</span><span>${l.minutes} min estimated</span><span class="surface-badge">${esc(l.surface)}</span><span id="lesson-state-label">${statusLabel(l.id)}</span></div><p class="lesson-goal">${inline(l.goal)}</p><div class="lesson-journey"><span>Module ${modules.indexOf(m)+1} of 10 · Lesson ${m.lessons.indexOf(l)+1} of ${m.lessons.length}</span><a href="#reference?part=ref-${m.id}">Open field reference ↗</a></div></header>
<button class="toc-toggle" type="button" data-action="toc" aria-expanded="false" aria-controls="lesson-toc">In this lesson ${icon('chevron-down')}</button><nav class="lesson-toc" id="lesson-toc" aria-label="On this page"><span>In this lesson</span>${lessonOutline(l).map(([id,title])=>`<a href="${lessonURL(l.id)}?part=${id}">${esc(title)}</a>`).join('')}</nav>
<section class="article-section" id="understand"><h2 class="sr-only">Understand the approach</h2>${l.body.map(p=>`<p>${inline(p)}</p>`).join('')}</section>
${diagramMarkup(l)}
${(l.sections||[]).map((section,i)=>`<section class="article-section" id="section-${i}"><h2>${esc(section.title)}</h2>${section.paragraphs.map(p=>`<p>${inline(p)}</p>`).join('')}</section>`).join('')}
<aside class="lesson-note"><strong>About your environment</strong><p>${inline(l.note)}</p></aside>
<section class="article-section" id="steps"><h2>Try it step by step</h2><ol>${l.steps.map(step=>`<li>${inline(step)}</li>`).join('')}</ol></section>
<section class="article-section" id="example"><div class="article-section-heading"><h2>A useful starting example</h2><span class="tiny-label">Illustration · adapt before use</span></div>${[l.example,...(l.examples||[])].map((ex,i)=>exampleMarkup(ex,l.id,i)).join('')}${workedMarkup(l)}</section>
<section class="article-section practice-box" id="practice"><span class="practice-label">${icon('code-2')} Hands-on exercise</span><h2>Your turn</h2><p>${inline(l.exercise)}</p><p class="fine-print">Use the lab below for the files and checks. Try the task before opening the reference answer.</p></section>
${labMarkup(l)}
<section class="article-section" id="check"><h2>Check your result</h2><ul class="check-list">${l.checks.map(item=>`<li>${inline(item)}</li>`).join('')}</ul></section>
${solutionMarkup(l)}
${quizMarkup(l)}
${troubleshootingMarkup(l)}
<section class="article-section" id="mistakes"><h2>Common mistakes</h2><ul>${l.mistakes.map(item=>`<li>${inline(item)}</li>`).join('')}</ul></section>
<details class="mapping-note ${l.equivalence.status}"><summary><span class="mapping-label">${label}</span><span>Source mapping & differences</span></summary><div><p>${inline(l.equivalence.summary)}</p><a href="${esc(source.originalUrl)}" target="_blank" rel="noopener noreferrer">Source topic: ${esc(source.title)} ↗</a></div></details>
<section class="article-section article-sources" id="lesson-sources"><h2>Go to the source</h2><p class="fine-print">Official documentation, checked 21 October 2026. Product names, controls, and availability may vary with your version, platform, or account.</p><ul class="source-links">${l.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a></li>`).join('')}</ul></section>
<div class="lesson-completion"><button class="button ${done?'button-success':'button-solid'}" id="complete-lesson" type="button" data-action="complete" data-lesson="${l.id}" aria-pressed="${done}">${done?'✓ Completed · Study again':'Mark lesson complete'}</button><p>Complete it after you have<br>practiced and checked the result.</p></div>
<nav class="lesson-navigation" aria-label="Previous and next lessons">${previous?`<a href="${lessonURL(previous.id)}"><span>← Previous lesson</span><strong>${esc(previous.title)}</strong></a>`:'<a href="#path"><span>← Back to</span><strong>Learning path</strong></a>'}${next?`<a href="${lessonURL(next.id)}"><span>Next lesson →</span><strong>${esc(next.title)}</strong></a>`:'<a href="#path"><span>You reached the end →</span><strong>Review your progress</strong></a>'}</nav></article></div>`;
}
function renderSources() {
  const sources=new Map();
  for(const l of lessons)for(const s of l.sources)if(!sources.has(s.url))sources.set(s.url,s);
  const sourceLessons=catalog.modules.flatMap(m=>m.lessons);
  return `<article class="source-page"><span class="eyebrow">Source library</span><h1>Every topic. A clear trail.</h1><p class="source-lead">60 original roadmap topics, reworked into a practical English Codex curriculum. The app comes first; CLI and IDE differences are called out.</p>
<div class="notice"><strong>Adapted topic by topic, not a product-name replacement.</strong><p>All 60 source topics are mapped below. “Equivalent” means a similar capability exists, “Different” means configuration or behavior changes, and “Alternative” means the original mechanism should not be assumed in Codex. Examples and practice tasks were authored for this edition.</p><a href="docs/content-provenance.md">Content provenance and editorial method ↗</a></div>
<h2>Start with a real practice project</h2><p>Orbit Notes starts with four passing and two failing checks. Fix the search, preserve unrelated edits, then review the evidence. Six further labs cover event streams, skills, MCP, delegation, hooks and a complete workflow package.</p><p><a class="button button-solid" href="labs/project-workflow.zip" download>Download first practice project ↓</a> <a class="text-link" href="#labs">Explore all seven practice labs →</a></p>
<h2>Your progress belongs to you</h2><p>There is no account or analytics service. Progress, quiz selections and theme stay in this browser. Export a backup before clearing browser data. Import replaces the current edition’s progress only after validating the file. The earlier 30-lesson edition retains its own storage key.</p><div class="progress-tools"><button class="button" type="button" data-action="export">Export progress</button><label class="button file-import">Import progress<input id="progress-import" type="file" accept="application/json,.json"></label></div><p id="import-result" role="status" aria-live="polite"></p>
<h2>The 60-topic coverage map</h2><p>Reference snapshot <code>${esc(catalog.reference.commit.slice(0,7))}</code>, checked 21 October 2026. Open a source topic to compare its purpose; open the Codex lesson to learn the adapted workflow.</p>
<div class="coverage-list">${modules.map(m=>`<section><h3>${m.id}. ${esc(m.title)} <small>${m.lessons.length} lessons</small></h3>${m.lessons.map(l=>{const s=sourceLessons.find(s=>s.key===l.sourceKey);return `<div class="coverage-row"><div><span class="mapping-label">${esc(l.equivalence.status)}</span><a href="${lessonURL(l.id)}">${esc(l.title)}</a><p>${esc(l.equivalence.summary)}</p></div><a class="coverage-original" href="${esc(s.originalUrl)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a></div>`;}).join('')}</section>`).join('')}</div>
<h2>Product names and current documentation</h2><p>Older Codex links may redirect to ChatGPT Learn. Codex in the desktop app, Codex CLI and an IDE extension have different surfaces. Account, platform, organization policy and version can affect availability. Follow the environment note in each lesson; a documented feature is not a promise that it is enabled in your installation.</p>
<h2>Design references and licensed materials</h2><p>The current field-guide design uses an original cool-white layout, Fraunces display headings and Manrope body text, restrained cobalt accents and an illustrative Task → Change → Check workbench. <a href="https://linear.app/method" target="_blank" rel="noopener noreferrer">Linear Method</a> informed editorial hierarchy, <a href="https://www.framer.com/academy/" target="_blank" rel="noopener noreferrer">Framer Academy</a> informed course navigation, and <a href="https://codecrafters.io/" target="_blank" rel="noopener noreferrer">CodeCrafters</a> informed the emphasis on inspectable practice. Their code, logos and artwork are not included.</p><p>Learning topic organization was adapted from <a href="https://luongnv.com/claude-howto/" target="_blank" rel="noopener noreferrer">Claude How-To by luongnv89</a>, MIT © 2024 luongnv89, at commit 188f468. The earlier source-derived presentation and its complete MIT notice remain in assets/reference/ for provenance; its landing stylesheet and typewriter motion are no longer loaded. The current presentation is maintained under assets/atelier/. Fraunces, Manrope and JetBrains Mono are self-hosted under OFL with their notices preserved. Lucide SVG icons retain ISC/MIT notices. Semantic diagrams were compiled with MIT-licensed Mermaid; the course serves static SVGs. No paid resource or runtime account is needed to read this course.</p><p><a href="THIRD-PARTY-NOTICES.md">Third-party notices</a> · <a href="docs/design-sources.md">Design reference notes</a> · <a href="docs/verification.md">Verification report</a> · <a href="assets/reading/index.html">Read without JavaScript</a></p>
<h2>Official documentation used</h2><ul class="source-links">${[...sources.values()].map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a></li>`).join('')}</ul><h2>What completion means</h2><p>Times are practice estimates. Completion is your own assessment, not a certification. The website does not run Codex, execute the examples or inspect your local project. Check the actual result before marking a lesson complete.</p><a class="button button-solid" href="#path">Explore the learning path ${icon('arrow-right')}</a></article>`;
}

function renderLabLibrary(){
  return `<article class="lab-library source-page"><span class="eyebrow">A path from reading to doing</span><h1>Practice with real files.</h1><p class="source-lead">Seven small labs, from your first project to a connected workflow. Each has runnable checks, expected results and inspectable reference files.</p><div class="lab-library-intro"><strong>Start in the Codex app</strong><p>Download a lab into a new folder, open that folder as your practice project, and follow its lesson. The local checks use Node.js and fictional inputs. Actual client activation is a separate optional step where relevant.</p></div><div class="lab-library-grid">${labCatalog.map((lab,i)=>`<section class="lab-library-card"><div class="lab-card-meta"><span class="lab-index">${String(i+1).padStart(2,'0')}</span><span>${esc(lab.level)}</span></div><h2>${esc(lab.title)}</h2><p>${esc(lab.summary)}</p><div class="lab-outcome"><strong>The result to look for</strong><p>${esc(lab.outcome)}</p></div><details class="lab-library-commands"><summary>Run and inspect this lab</summary><p>From the course folder or the extraction root containing the labs folder:</p><div class="code-block"><div class="code-header"><span>Behavioral checks</span><button class="copy-button" data-copy="${esc(lab.testCommand)}" type="button" aria-label="Copy ${esc(lab.id)} checks">Copy</button></div><pre><code>${esc(lab.testCommand)}</code></pre></div><div class="code-block"><div class="code-header"><span>Worked demonstration</span><button class="copy-button" data-copy="${esc(lab.demoCommand)}" type="button" aria-label="Copy ${esc(lab.id)} demo">Copy</button></div><pre><code>${esc(lab.demoCommand)}</code></pre></div><p>${esc(lab.expected)}</p><div class="lab-files">${lab.files.map(file=>`<button type="button" class="file-link" data-action="lab-file" data-file="labs/${esc(lab.id)}/${esc(file)}">${esc(file)} ↗</button>`).join('')}</div></details><div class="lab-card-actions"><a class="button button-solid" href="${lessonURL(lab.entryLesson)}">Open the lesson ${icon('arrow-right')}</a><a class="text-link" href="labs/${esc(lab.id)}.zip" download>Download lab ↓</a></div></section>`).join('')}</div><p class="fine-print">A reference test passing proves only its stated cases. Follow each lab's rubric and label any client, account or workflow stage you have not actually run.</p></article>`;
}

function setHomeMenu(open){homeMenuOpen=open;$('#nav-menu').classList.toggle('open',open);$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation');if(open)$('#nav-menu a').focus();}
function closeHomeMenu(restore=true){if(!homeMenuOpen)return;setHomeMenu(false);if(restore)$('#menu-toggle').focus();}
function setDrawer(open, restoreFocus = true) {
  drawerOpen = open && narrow.matches;
  $('#app-rail').inert = narrow.matches && !drawerOpen;
  $('#app-rail').classList.toggle('open',drawerOpen);
  $('.rail-backdrop').hidden = !drawerOpen;
  document.body.classList.toggle('drawer-open',drawerOpen);
  $('#menu-toggle').setAttribute('aria-expanded',String(drawerOpen));
  document.querySelectorAll('[data-action=sidebar]').forEach(button=>button.setAttribute('aria-expanded',String(drawerOpen)));
  $('#menu-toggle').setAttribute('aria-label',drawerOpen?'Close navigation':'Open navigation');
  main.inert = drawerOpen;
  $('.site-footer').inert = drawerOpen;
  if (drawerOpen) $('.rail-close').focus();
  else if (restoreFocus && narrow.matches) $('#menu-toggle').focus({preventScroll:true});
}
function stopTerminal(){disposeReader();disposeCourseMotion();disposeReferenceMotion();}
function enterView(){arrive(main,{distance:0,duration:160});}
function positionDiagram(){
  requestAnimationFrame(()=>{
    if(!$('#diagram-dialog').open)return;
    $('#diagram-dialog').scrollTop=0;
    const canvas=$('.diagram-modal-canvas');
    canvas.scrollLeft=Math.max(0,(canvas.scrollWidth-canvas.clientWidth)/2);
    canvas.scrollTop=0;
  });
}
function zoomDiagram(value,reset=false){
  const canvas=$('.diagram-modal-canvas'),img=$('#diagram-modal-image');
  const centerX=(canvas.scrollLeft+canvas.clientWidth/2)/canvas.scrollWidth;
  const centerY=(canvas.scrollTop+canvas.clientHeight/2)/canvas.scrollHeight;
  diagramZoom=Math.min(2.5,Math.max(.05,value));
  img.style.width=Number(img.dataset.width)*diagramZoom+'px';
  $('#diagram-scale').textContent=Math.round(diagramZoom*100)+'%';
  if(reset){positionDiagram();return;}
  requestAnimationFrame(()=>{
    canvas.scrollLeft=centerX*canvas.scrollWidth-canvas.clientWidth/2;
    canvas.scrollTop=centerY*canvas.scrollHeight-canvas.clientHeight/2;
  });
}
function fitDiagram(){
  const canvas=$('.diagram-modal-canvas'),style=getComputedStyle(canvas);
  const available=canvas.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
  zoomDiagram(Math.min(1,available/Number($('#diagram-modal-image').dataset.width)),true);
}
function scrollToPart(part, focus = false) {
  const element = part ? document.getElementById(part) : null;
  if(element?.matches('details')) element.open=true;
  if(element) window.scrollTo({top:Math.max(0,element.getBoundingClientRect().top+window.scrollY-$('.site-header').getBoundingClientRect().height-24),behavior:motion.matches?'instant':'smooth'});
  else window.scrollTo({top:0,behavior:'instant'});
  if(focus) ($('#lesson-title')||main).focus({preventScroll:true});
}
function route(force = false, trackVisit = true) {
  if(!lessons.length) return;
  disposeReader();viewerRequest++;guideRequest++;const studyToken=++studyRequest;document.documentElement.lang='en';
  closeHomeMenu(false);
  $('.a-guide-select')?.removeAttribute('open');
  for(const id of ['diagram-dialog','file-dialog','assessment-dialog','search-dialog'])if($('#'+id)?.open)$('#'+id).close();
  const [rawPath,query] = location.hash.slice(1).split('?');
  const aliases={path:'roadmap',practice:'get-started',resources:'vs-docs','lo-trinh':'roadmap','nguon':'sources','vi-sao':'why','tai-lieu':'vs-docs','bat-dau':'get-started','noi-dung':'main-content'};
  const path=aliases[rawPath] || rawPath.replace(/^bai\//,'lesson/');
  const params=new URLSearchParams(query||'');
  const oldPart={'hieu':'understand','vi-du':'example','thuc-hanh':'practice','kiem-tra':'check'};
  const requestedPart=params.get('part')||params.get('phan'),part=oldPart[requestedPart]||requestedPart;
  if(drawerOpen) setDrawer(false,false);
  if(/^guide\/(en|vi|zh|ja|uk)$/.test(path)){renderTranslatedGuide(path.split('/')[1]);return;}
  if(path.startsWith('lesson/')) {
    stopTerminal();
    const id=path.slice(7),l=byId.get(id);
    if(!l){view='error';main.innerHTML='<div class="error-state"><span class="eyebrow">Lesson not found</span><h1>This lesson is not on the path.</h1><p>Choose a lesson from the curriculum to continue. Your saved progress is unchanged.</p><a class="button button-solid" href="#path">Open the learning path</a></div>';document.title='Lesson not found — Howto codex';renderRail();scrollToPart();return;}
    const same=view===id&&!force;
    if(!same){if(trackVisit){if(status(id)==='new')state.lessons[id]={status:'started',updated:Date.now()};state.last=id;saveProgress();}disposeCourseMotion();main.innerHTML=renderLesson(l);highlightView(main);view=id;mountCourseMotion(main);mountReader(main);enterView();document.title=l.title+' — Howto codex';renderRail();}
    if(same)mountReader(main);requestAnimationFrame(()=>scrollToPart(part,!same));return;
  }
  if(path==='reference'){stopTerminal();view='reference';main.innerHTML=renderReference(modules);highlightView(main);enterView();document.title='Field reference — Howto codex';renderRail();scrollToPart(part);return;}
  if(path==='study'){disposeCourseMotion();stopTerminal();view='study';main.innerHTML='<p role="status">Loading focused study…</p>';document.title='Focused study — Howto codex';renderRail();mountStudy(main,modules,()=>studyToken===studyRequest).catch(()=>{if(studyToken===studyRequest)main.innerHTML='<h1>Study unavailable</h1><p>Reload to retry, or use the <a href="LEARNING-ROADMAP.md">reading study path</a>. Progress is unchanged.</p>';});return;}
  if(path==='sources'){disposeCourseMotion();stopTerminal();view='sources';main.innerHTML=renderSources();enterView();document.title='Source library — Howto codex';renderRail();scrollToPart();return;}
  if(path==='labs'){disposeCourseMotion();stopTerminal();view='labs';main.innerHTML=renderLabLibrary();highlightView(main);enterView();document.title='Practice labs — Howto codex';renderRail();scrollToPart();return;}
  if(!['','roadmap','why','vs-docs','get-started','languages','main-content'].includes(path)){stopTerminal();view='error';main.innerHTML='<div class="error-state"><h1>Page not found.</h1><p>The address may have changed.</p><a class="button" href="#path">Back to the learning path</a></div>';renderRail();return;}
  if(view!=='home'||force){stopTerminal();main.innerHTML=renderHome();view='home';renderRail();mountReferenceMotion(main,{entrance:!restoringHomePreview});restoringHomePreview=false;}
  document.title='Howto codex — A practical field guide';renderRail();
  requestAnimationFrame(()=>{if(path==='main-content'){main.focus();return;}scrollToPart(path==='roadmap'&&/^level-(beginner|intermediate|advanced)$/.test(part||'')?part:path);});
}
function showAssessment() {
  if(!contentReady){notify('Open the course before choosing a starting point. Use Try again if the lesson files could not load.');return;}
  if(drawerOpen) setDrawer(false,false);
  learningTools?.showAssessment();
}
function normalizeText(text) {return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();}

function practiceFileView(reading){
  $('#file-reading').hidden=!reading;$('#file-preview').hidden=reading;
  for(const button of document.querySelectorAll('[data-file-view]')){const active=(button.dataset.fileView==='reading')===reading;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}
}
async function openPracticeFile(path,{back=false}={}){
  if(!/^labs\/[a-z0-9_./-]+$/i.test(path)||path.includes('..'))return;
  const nested=$('#file-dialog').open;
  if(!nested)viewerHistory=[];else if(!back&&viewerPath)viewerHistory.push(viewerPath);
  viewerPath=path;
  const request=++viewerRequest;viewerFileText='';$('#file-modal-title').textContent=path.split('/').at(-1);$('#file-preview-path').textContent=path;
  $('#file-preview').hidden=false;$('#file-preview').textContent='Loading source…';$('#file-reading').hidden=true;$('#file-reading').innerHTML='';$('#file-view-tabs').hidden=true;
  $('#file-back').hidden=!viewerHistory.length;$('#file-preview-status').textContent='';$('#file-preview-caption').textContent='Preview only. Opening this file does not run it.';showDialog($('#file-dialog'));
  try{
    const response=await fetch(path);if(!response.ok)throw Error('Unavailable');const source=await response.text();if(source.length>1024*1024)throw Error('Too large');if(request!==viewerRequest)return;
    viewerFileText=source;
    const ext=path.split('.').at(-1).toLowerCase(),languages={cjs:'javascript',mjs:'javascript',js:'javascript',md:'markdown',json:'json',jsonl:'json',toml:'toml',yml:'yaml',yaml:'yaml',py:'python',ps1:'powershell'};
    $('#file-preview').innerHTML=highlightCode(source,languages[ext]||'text');
    if(ext==='md'){$('#file-reading').innerHTML=guideMarkdown(source,{labPath:path});highlightView($('#file-reading'));$('#file-view-tabs').hidden=false;practiceFileView(true);$('#file-preview-caption').textContent='Reading guide. Examples run only when you choose to use them in your own practice folder.';}
    $('#file-dialog').scrollTop=0;$('#file-preview').scrollTop=0;
    if(nested){$('#file-modal-title').tabIndex=-1;$('#file-modal-title').focus({preventScroll:true});}
  }catch{if(request!==viewerRequest)return;$('#file-preview').textContent='';$('#file-preview-status').textContent='This source file could not be loaded. Close this view and use the lab download or try again.';}
}
$('#file-view-tabs').addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
  const tabs=[...document.querySelectorAll('[data-file-view]')],current=tabs.indexOf(document.activeElement),index=event.key==='Home'?0:event.key==='End'?1:1-Math.max(0,current);
  practiceFileView(index===0);tabs[index].focus();
});

document.addEventListener('click',async event=>{
  const guideSelect=$('.a-guide-select');if(guideSelect?.open&&!guideSelect.contains(event.target))guideSelect.open=false;
  const target=event.target.closest('button,a');if(!target)return;
  if(target.classList.contains('skip-link')){event.preventDefault();main.focus();main.scrollIntoView({behavior:'instant'});return;}
  if(homeMenuOpen&&target.closest('#nav-menu')&&target.tagName==='A')closeHomeMenu(false);
  if(target.tagName==='A'&&target.getAttribute('href')===location.hash){event.preventDefault();route(false,false);return;}
  if(target.id==='theme-toggle'){const choice=(themeChoice||document.documentElement.dataset.theme)==='dark'?'light':'dark';applyThemeChoice(choice,true);try{localStorage.setItem(THEME_KEY,choice);}catch{}return;}
  if(target.id==='menu-toggle'){if(byId.has(view))setDrawer(!drawerOpen);else setHomeMenu(!homeMenuOpen);return;}
  if(target.hasAttribute('data-copy')||target.hasAttribute('data-lesson-copy')||target.hasAttribute('data-example')||target.hasAttribute('data-worked')||target.hasAttribute('data-lab-copy')){
    const item=byId.get(target.dataset.example||target.dataset.lessonCopy);
    const text=target.hasAttribute('data-worked')?byId.get(target.dataset.worked)?.worked?.code:target.hasAttribute('data-lab-copy')?byId.get(target.dataset.labCopy)?.lab?.commands[Number(target.dataset.command)]?.command:target.dataset.copy??[item?.example,...(item?.examples||[])][Number(target.dataset.exampleIndex)||0]?.code;
    if(typeof text!=='string')return;
    const request=(copyRequests.get(target)||0)+1;copyRequests.set(target,request);const original=target.dataset.copyLabel||target.textContent;target.dataset.copyLabel=original;
    try{await navigator.clipboard.writeText(text);if(copyRequests.get(target)!==request||!target.isConnected)return;target.textContent='Copied ✓';notify('Example copied.');setTimeout(()=>{if(target.isConnected&&copyRequests.get(target)===request)target.textContent=original;},2000);}
    catch{if(copyRequests.get(target)===request)notify('Automatic copy is unavailable. Select the example text and copy it manually.');}
    return;
  }
  switch(target.dataset.action){
    case 'toc':{const article=target.closest('.lesson-article'),open=target.getAttribute('aria-expanded')!=='true';article.classList.toggle('toc-open',open);target.setAttribute('aria-expanded',String(open));break;}
    case 'diagram':{
      const l=byId.get(target.dataset.lesson);if(!l)return;
      diagramZoom=1;$('#diagram-modal-title').textContent=l.diagram.title;$('#diagram-modal-description').textContent=l.diagram.text;
      const img=$('#diagram-modal-image');img.onload=positionDiagram;img.src=l.diagram.asset;img.alt=l.diagram.text;img.dataset.width=l.diagram.width;img.style.width=l.diagram.width+'px';showDialog($('#diagram-dialog'));fitDiagram();break;
    }
    case 'close-diagram':$('#diagram-dialog').close();break;
    case 'zoom-in':case 'zoom-out':case 'zoom-reset':{
      const reset=target.dataset.action==='zoom-reset';
      zoomDiagram(reset?1:diagramZoom+(target.dataset.action==='zoom-in'?.25:-.25),reset);break;
    }
    case 'zoom-fit':fitDiagram();break;
    case 'lab-file':{
      event.preventDefault();await openPracticeFile(target.dataset.file);break;
    }
    case 'file-reading':practiceFileView(true);break;
    case 'file-source':practiceFileView(false);break;
    case 'file-back':{const path=viewerHistory.pop();if(path)await openPracticeFile(path,{back:true});break;}
    case 'close-file':viewerRequest++;$('#file-dialog').close();break;
    case 'copy-file':{
      if(!viewerFileText){notify('Wait for the source file to load.');break;}try{await navigator.clipboard.writeText(viewerFileText);notify('File contents copied.');}catch{notify('Select the source text and copy it manually.');}break;
    }
    case 'close-menu':setDrawer(false);break;
    case 'expand':{const id=target.dataset.module,expanded=target.getAttribute('aria-expanded')==='true';target.setAttribute('aria-expanded',String(!expanded));target.setAttribute('aria-label',(expanded?'Show':'Hide')+' lessons in '+modules.find(m=>m.id===id).title);$('#lessons-'+id).hidden=expanded;expanded?openModules.delete(id):openModules.add(id);main.dispatchEvent(new CustomEvent('reference-progress'));break;}
    case 'roadmap-complete':{const id=target.dataset.lesson;if(!byId.has(id))break;state.lessons[id]={...state.lessons[id],status:status(id)==='done'?'started':'done',updated:Date.now()};saveProgress();paintRoadmap();break;}
    case 'assessment':showAssessment();break;
    case 'close-assessment':$('#assessment-dialog').close();break;
    case 'reset':showDialog($('#reset-dialog'));break;
    case 'cancel-reset':$('#reset-dialog').close();break;
    case 'confirm-reset':{state={lessons:{},last:null};const saved=saveProgress(true);$('#reset-dialog').close();route(true);notify(saved?'Progress reset in this browser.':'Progress reset for this session only. The saved backup could not be changed.');break;}
    case 'complete':{const id=target.dataset.lesson,done=status(id)==='done';state.lessons[id]={...state.lessons[id],status:done?'started':'done',updated:Date.now()};const saved=saveProgress();target.setAttribute('aria-pressed',String(!done));target.textContent=done?'Mark lesson complete':'✓ Completed · Study again';target.classList.toggle('button-solid',done);target.classList.toggle('button-success',!done);$('#lesson-state-label').textContent=done?'In progress':'Completed';renderRail();notify(saved?(done?'Lesson moved back to in progress.':'Lesson completion saved.'):'Lesson updated for this session only; progress was not saved.');break;}
    case 'sidebar':setDrawer(true);break;
    case 'retry':boot();break;
    case 'export':{
      const blob=new Blob([JSON.stringify({edition:EDITION,exportedAt:new Date().toISOString(),progress:state},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='codex-howto-progress.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Progress backup downloaded.');break;
    }
  }
});
document.addEventListener('input',event=>{
  if(event.target.id!=='lesson-search')return;
  const query=normalizeText(event.target.value);let total=0;
  document.querySelectorAll('[data-search-group]').forEach(group=>{let visible=0;group.querySelectorAll('[data-search-title]').forEach(link=>{link.hidden=!normalizeText(link.dataset.searchTitle).includes(query);if(!link.hidden)visible++;});group.hidden=!visible;total+=visible;});
  $('#sidebar-empty').hidden=total>0;
});
document.addEventListener('submit',event=>{
  if(event.target.matches('.lesson-quiz')){
    event.preventDefault();const id=event.target.dataset.quiz,l=byId.get(id),answer=Number(new FormData(event.target).get('answer'));
    if(!l||!Number.isInteger(answer)||answer<0||answer>=l.quiz.options.length)return;
    state.lessons[id]={...state.lessons[id],status:status(id)==='done'?'done':'started',answer,updated:Date.now()};saveProgress();$('.quiz-feedback',event.target).innerHTML=quizFeedback(l,answer);return;
  }

});
document.addEventListener('load',event=>{if(event.target.matches?.('.diagram-viewport img')){const frame=event.target.parentElement;frame.scrollLeft=Math.max(0,(frame.scrollWidth-frame.clientWidth)/2);}},true);
document.addEventListener('error',event=>{if(event.target.matches?.('.diagram-viewport img')){const figure=event.target.closest('figure');if(figure.querySelector('.diagram-load-notice'))return;event.target.hidden=true;figure.querySelector('source')?.remove();const text=figure.querySelector('details');if(text)text.open=true;const note=document.createElement('p');note.className='diagram-load-notice';note.setAttribute('role','status');note.textContent='The diagram image could not load. Its complete text description is available below.';figure.querySelector('.diagram-viewport').append(note);}},true);
document.addEventListener('change',async event=>{
  if(event.target.id!=='progress-import')return;
  const file=event.target.files?.[0];if(!file)return;
  const result=$('#import-result');
  try{
    if(file.size>1024*1024)throw new Error('File too large');
    const data=JSON.parse(await file.text());
    if(data.edition!==EDITION)throw new Error('Wrong edition');
    const next=sanitizeProgress(data.progress,lessons);
    if(Object.entries(data.progress.lessons).some(([id,v])=>!byId.has(id)||!['started','done'].includes(v?.status)||(v.answer!==undefined&&(!Number.isInteger(v.answer)||v.answer<0||v.answer>=byId.get(id).quiz.options.length))))throw new Error('Invalid lesson');
    state=next;const saved=saveProgress(true);renderRail();result.textContent=saved?'Progress imported. Open the learning path to resume.':'Progress imported for this session only. Browser storage is unavailable; keep your backup before closing this page.';
  }catch{result.textContent='This is not a valid progress backup for the 60-lesson edition. Your current progress was kept.';}
  event.target.value='';
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&$('.a-guide-select')?.open){$('.a-guide-select').open=false;$('.a-guide-select summary').focus();return;}
  if(event.key==='Escape'&&homeMenuOpen){closeHomeMenu();return;}
  if(event.key==='Escape'&&drawerOpen){setDrawer(false);return;}
  if(event.key==='Tab'&&drawerOpen){const controls=[...$('#app-rail').querySelectorAll('a,button,input')].filter(el=>!el.hidden&&el.getClientRects().length);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
});
window.addEventListener('hashchange',()=>route());
function syncProgressView(){
 readProgress();
 if(view==='home'){paintRoadmap();return;}
 const l=byId.get(view);
 if(l){const done=status(l.id)==='done',button=$('#complete-lesson');button.setAttribute('aria-pressed',String(done));button.textContent=done?'✓ Completed · Study again':'Mark lesson complete';button.classList.toggle('button-success',done);button.classList.toggle('button-solid',!done);$('#lesson-state-label').textContent=statusLabel(l.id);const answer=state.lessons[l.id]?.answer;for(const radio of main.querySelectorAll('.lesson-quiz input'))radio.checked=Number(radio.value)===answer;$('.quiz-feedback').innerHTML=Number.isInteger(answer)?quizFeedback(l,answer):'';}
 renderRail();
}
window.addEventListener('storage',event=>{if(event.key===THEME_KEY||event.key===null)applyThemeChoice(event.key===null?null:event.newValue,true);if(event.key===STORAGE_KEY||event.key===null)syncProgressView();});
window.addEventListener('pageshow',event=>{if(!event.persisted||!contentReady)return;const position=window.scrollY;readProgress();try{applyThemeChoice(localStorage.getItem(THEME_KEY));}catch{}route(true,false);requestAnimationFrame(()=>window.scrollTo({top:position,behavior:'instant'}));});
narrow.addEventListener('change',()=>{setDrawer(false,false);closeHomeMenu(false);});

async function boot() {
  try {
    contentReady=false;
    $('.header-assessment').disabled=true;
    setDrawer(false,false);
    const firstPath=location.hash.slice(1).split('?')[0];
    restoringHomePreview=!!main.querySelector('[data-static-snapshot]')&&['','roadmap','path','why','vs-docs','get-started','languages','main-content'].includes(firstPath);
    main.setAttribute('aria-busy','true');
    if(restoringHomePreview) main.insertAdjacentHTML('beforeend','<p class="sr-only" role="status">Opening the interactive learning workspace. The reading preview remains available.</p>');
    else main.innerHTML='<div class="loading-state" role="status">Opening your learning workspace…</div>';
    const responses=await Promise.all([...PARTS.map(part=>`content/${part}.json`),'content/source-map.json','content/diagrams.json','content/labs.json','content/diagram-overviews.json'].map(url=>fetch(url)));
    if(responses.some(response=>!response.ok))throw new Error('Content unavailable');
    const documents=await Promise.all(responses.map(response=>response.json()));
    overviews=documents.pop().lessons;
    labCatalog=documents.pop();const diagrams=documents.pop();catalog=documents.pop();
    modules=validateCourse(documents.flat(),catalog,diagrams);
    lessons=modules.flatMap(m=>m.lessons);byId=new Map(lessons.map(l=>[l.id,l]));
    contentReady=true;
    main.removeAttribute('aria-busy');
    document.documentElement.classList.add('app-ready');
    if(!learningTools)learningTools=mountLearningTools({lessons,modules,showDialog});
    $('.header-assessment').disabled=false;
    readProgress();view='';route();
  } catch {
    restoringHomePreview=false;main.removeAttribute('aria-busy');
    view='error';main.innerHTML='<div class="error-state" role="alert"><span class="eyebrow">Content unavailable</span><h1>Let’s try opening the course again.</h1><p>The lesson files could not be read. Check that the local server is running and the content folder is present. Your saved progress has not been deleted.</p><button class="button button-solid" type="button" data-action="retry">Try again</button></div>';
  }
}
boot();

$('#file-dialog').addEventListener('close',()=>{viewerRequest++;});
