import {validateCourse, sanitizeProgress, EDITION, PARTS} from './content-model.mjs';
import {mountCourseMotion,disposeCourseMotion} from './course-motion.mjs';
const $ = (selector, parent = document) => parent.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const inline = value => esc(value).replace(/`([^`]+)`/g, '<code>$1</code>');
const icon = (name, extra = '') => `<span class="icon ${extra}" style="--icon:url('assets/icons/${name}.svg')" aria-hidden="true"></span>`;
const main = $('#main-content');
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
let diagramZoom=1, viewerFileText='', viewerRequest=0;
let state = {lessons:{},last:null};
let toastTimer;
let drawerOpen = false;
let contentReady = false;

try { if (localStorage.getItem(THEME_KEY) === 'dark') document.documentElement.dataset.theme = 'dark'; } catch {}
updateThemeLabel();

function updateThemeLabel() {
  const dark = document.documentElement.dataset.theme === 'dark';
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
  let notice = $('#storage-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'storage-notice'; notice.className = 'storage-notice';
    notice.setAttribute('role','status'); $('.site-header').after(notice);
  }
  notice.textContent = message;
  const indicator=$('.local-indicator');if(indicator)indicator.innerHTML='<i aria-hidden="true"></i>Session-only progress';
}
function readProgress() {
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
  } catch { warnStorage('Saved progress could not be read. You can keep learning; check your browser storage settings before closing this page.'); }
}
function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { warnStorage('Your browser is blocking saved progress. Changes will only last for this open session.'); }
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
function progressMarkup() {
  const c=counts(),next=continueLesson();
  return `<section class="progress-panel" aria-labelledby="progress-title"><div class="progress-ring" style="--progress:${c.percent};--target-progress:${c.percent}" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.percent}"><span>${c.percent}<small>%</small></span></div><div class="progress-copy"><h2 id="progress-title">Your progress, at your pace.</h2><strong>${c.done} <span>/ ${c.total} lessons complete</span></strong><div class="progress-counts"><span>${c.done} done</span><span>${c.started} in progress</span><span>${c.left} to explore</span></div></div><div class="progress-actions"><a class="text-link" id="continue-learning" href="${lessonURL(next.id)}">${c.done===c.total?'Revisit the course':c.done||c.started?'Continue learning':'Start your first lesson'} ${icon('arrow-right')}</a><button class="text-button" data-action="reset" type="button">Reset progress</button></div></section>`;
}
function renderRail() {
  const scroll = $('#rail-content').scrollTop;
  const lessonView = byId.has(view);
  document.body.dataset.page=lessonView?'lesson':view;
  for(const link of document.querySelectorAll('[data-header-nav]')){const selected=link.dataset.headerNav===(lessonView?'path':view==='home'&&location.hash.includes('path')?'path':view);link.classList.toggle('active',selected);selected?link.setAttribute('aria-current','page'):link.removeAttribute('aria-current');}
  $('#rail-content').innerHTML = lessonView ? sidebar(view) : `<div class="rail-label">Course modules</div><div class="rail-modules">${modules.map(m=>`<a class="rail-module" href="${lessonURL(m.lessons[0].id)}"><span>${m.id}</span><span>${esc(m.title)}</span>${counts(m.lessons).done===m.lessons.length?icon('check'):''}</a>`).join('')}</div><div class="rail-help"><span class="rail-help-icon">${icon('sparkles')}</span><strong>Make it practical.</strong><p>Every lesson ends with something you can try and check.</p><button type="button" data-action="assessment">Find your starting point ↗</button></div>`;
  $('#rail-content').scrollTop = scroll;
  const c = counts();
  $('#rail-progress').innerHTML = `<div class="rail-progress-heading"><span>Your progress</span><strong>${c.percent}%</strong></div><div class="rail-progress-track"><span style="width:${c.percent}%"></span></div><span class="rail-progress-caption">${c.done} of ${c.total} lessons completed</span>`;
  $('[data-nav="overview"]').classList.toggle('active', view==='home' && !location.hash.includes('path'));
  $('[data-nav="path"]').classList.toggle('active', lessonView || location.hash.includes('path'));
  $('[data-nav="sources"]').classList.toggle('active', view==='sources');
  $('[data-nav="labs"]').classList.toggle('active',view==='labs');
  $('#header-page').textContent = lessonView ? `Module ${view.slice(1,3)}` : view==='sources'?'Source library':view==='labs'?'Practice labs':'Overview';
  $('.nav-count').textContent=lessons.length;
}
function moduleMarkup(m) {
 const c=counts(m.lessons),stateName=c.done===c.total?'done':c.done||c.started?'started':'new',expanded=openModules.has(m.id);
 return `<article class="module module-card" id="module-${m.id}"><div class="module-main"><span class="module-number">${m.id}</span><div class="module-copy"><h3><a class="module-title" href="${lessonURL(m.lessons[0].id)}">${esc(m.title)}</a></h3><p class="module-description">${esc(m.description)}</p><div class="module-meta"><span>${m.lessons.length} lessons</span><span>${m.minutes} min estimated</span><span class="module-status ${stateName}">${{done:'Completed',started:'In progress',new:'Not started'}[stateName]}</span></div></div><div class="module-actions"><a class="module-open" href="${lessonURL(m.lessons[0].id)}">${c.done||c.started?'Continue':'Explore'} ${icon('arrow-right')}</a><button class="lesson-disclosure" type="button" data-action="expand" data-module="${m.id}" aria-expanded="${expanded}" aria-controls="lessons-${m.id}">View ${m.lessons.length} lessons ${icon('chevron-down')}</button></div></div><div class="module-meter" role="progressbar" aria-label="Module ${m.id} progress" aria-valuemin="0" aria-valuemax="${c.total}" aria-valuenow="${c.done}">${m.lessons.map(l=>`<span class="${status(l.id)}"></span>`).join('')}</div><div class="lesson-list" id="lessons-${m.id}" ${expanded?'':'hidden'}>${m.lessons.map(l=>`<div class="lesson-row"><span class="lesson-check ${status(l.id)}" aria-label="${statusLabel(l.id)}">${status(l.id)==='done'?'✓':''}</span><a href="${lessonURL(l.id)}">${esc(l.title)}</a><span class="lesson-duration">${l.minutes} min</span></div>`).join('')}</div></article>`;
}
function sessionDemoMarkup(){
 const prompt='Fix the note search. Match case and surrounding spaces. Keep the existing checks.';
 return `<div class="session-demo" data-demo role="region" aria-label="Illustrative Codex session"><div class="session-bar"><span class="session-window-dots" aria-hidden="true">● ● ●</span><span>Codex / Orbit Notes</span><span class="session-local">Local project</span></div><div class="session-body"><div class="session-you"><span class="session-avatar" aria-hidden="true">You</span><p data-demo-input data-text="${esc(prompt)}">${esc(prompt)}</p></div><div class="session-work"><span class="session-codex-mark" aria-hidden="true">&gt;_</span><div><p class="session-intro">A small change. A result you can check.</p><ol class="session-activity"><li data-demo-step>${icon('book-open')}<span>Read the project guidance<small>README.md · AGENTS.md</small></span><span class="activity-check" aria-hidden="true">✓</span></li><li data-demo-step>${icon('code-2')}<span>Make a focused change<small>notes.cjs · case and whitespace</small></span><span class="activity-check" aria-hidden="true">✓</span></li><li data-demo-step>${icon('check')}<span>Check the result<small>Six behavioral checks</small></span><span class="activity-check" aria-hidden="true">✓</span></li></ol><div class="session-result" data-demo-result><span class="result-dot" aria-hidden="true"></span><p>Search fixed. All six checks pass.<small>Review the diff before accepting the change.</small></p></div></div></div></div><p class="sr-only" data-demo-transcript>Illustration of the fictional Orbit Notes exercise: read the project, fix search matching and verify the six checks. This is an illustration, not a recorded Codex execution.</p><div class="session-footer"><span>Illustration · no commands run</span><button type="button" data-demo-control>Pause illustration</button></div></div>`;
}
function renderHome(){
 const c=counts(),next=continueLesson(),minutes=lessons.reduce((n,l)=>n+l.minutes,0),sources=new Set(lessons.flatMap(l=>l.sources.map(s=>s.url))).size;
 return `<div class="dashboard"><section class="course-hero" aria-labelledby="hero-title"><div class="hero-copy"><span class="eyebrow"><span class="eyebrow-line" aria-hidden="true"></span>A practical field guide</span><h1 id="hero-title">Learn Codex.<br><em>Make it your craft.</em></h1><p class="welcome-copy">Go from your first prompt to a workflow you can trust. Learn in the app, build with real files, and know how to check the result.</p><div class="feature-actions"><a class="button button-solid" id="featured-continue" href="${lessonURL(next.id)}">${c.done||c.started?'Resume learning':'Start learning'} ${icon('arrow-right')}</a><a class="text-link" href="#path">Explore the curriculum <span aria-hidden="true">↗</span></a></div><div class="course-facts"><span><strong>${modules.length}</strong> modules</span><span><strong>${lessons.length}</strong> hands-on lessons</span><span><strong>${Math.floor(minutes/60)}h ${minutes%60}m</strong> estimated</span></div><p class="hero-edition">English edition · Codex app first · Beginner to advanced</p></div><div class="hero-demonstration">${sessionDemoMarkup()}<p class="demo-caption">A preview of the habit you will practise: brief, build, verify.</p></div></section>
<section class="course-intro" data-reveal aria-labelledby="intro-title"><div><span class="eyebrow">Learn by doing</span><h2 id="intro-title">Less guessing.<br><em>More understanding.</em></h2></div><div class="intro-points"><p>One useful idea at a time. Every lesson connects a clear explanation with something you can try, inspect and improve.</p><div class="intro-features"><span>${icon('code-2')} Real practice files</span><span>${icon('check')} Answers & checks</span><span>${icon('route')} A guided path</span></div></div></section>
<section class="learning-path" id="path" aria-labelledby="path-title"><div class="section-heading" data-reveal><div><span class="eyebrow">The curriculum</span><h2 id="path-title">A path worth following.</h2><p>Three stages. ${modules.length} modules. Start at the beginning, or pick the skill you need.</p></div><button class="text-button assessment-inline" data-action="assessment" type="button">Find your starting point ${icon('arrow-right')}</button></div><div id="progress-container">${progressMarkup()}</div>${levels.map(level=>`<section class="stage-section ${level.id}" aria-labelledby="level-${level.id}" data-reveal><div class="stage-heading"><span class="stage-index">${level.label}</span><div><h3 id="level-${level.id}">${level.title}</h3><p>${level.text}</p></div></div><div class="curriculum-grid">${modules.filter(m=>m.level===level.id).map(moduleMarkup).join('')}</div></section>`).join('')}</section>
<section class="practice-section" id="practice" data-reveal aria-labelledby="practice-title"><div class="practice-intro"><span class="eyebrow">Your first useful habit</span><h2 id="practice-title">Ask clearly.<br><em>Check what changed.</em></h2><p>Begin with a read-only task. Give Codex the context it needs, then compare its answer with the actual files.</p></div><div class="practice-start"><div class="copy-snippet"><code>Read this project and explain how to run it. Do not change files yet.</code><button class="copy-button" type="button" data-copy="Read this project and explain how to run it. Do not change files yet." aria-label="Copy the read-only task prompt">Copy</button></div><a class="text-link" href="${lessonURL('s01-06')}">Learn to brief and verify a task ${icon('arrow-right')}</a></div></section>
<section class="resource-strip" id="resources" data-reveal><div><span class="eyebrow">Follow the evidence</span><h2>Grounded in the docs.</h2><p>${sources} official sources. All 60 original topics mapped, with differences explained.</p></div><a class="text-link" href="#sources">Sources & what was adapted ${icon('arrow-right')}</a></section></div>`;
}
function sidebar(current) {
  return `<div class="guide-sidebar" id="guide-sidebar"><a class="back-roadmap" href="#path">← All modules</a><label class="sidebar-label" for="lesson-search">Find a lesson</label><div class="sidebar-search-wrap">${icon('search')}<input class="sidebar-search" id="lesson-search" type="search" placeholder="Search lessons…" autocomplete="off"></div><div id="sidebar-groups">${modules.map(m=>`<section class="sidebar-group" data-search-group><h2>${m.id}. ${esc(m.title)}</h2>${m.lessons.map(l=>`<a class="sidebar-link" data-search-title="${esc(m.title+' '+l.title)}" href="${lessonURL(l.id)}" ${current===l.id?'aria-current="page"':''}><span class="lesson-check ${status(l.id)}" aria-hidden="true">${status(l.id)==='done'?'✓':''}</span><span>${esc(l.title)}</span></a>`).join('')}</section>`).join('')}</div><p class="sidebar-empty" id="sidebar-empty" role="status" aria-live="polite" hidden>No matching lessons. Try a topic such as “Git” or “context”.</p></div>`;
}
function exampleMarkup(example, id, index = 0) {
  return `<div class="code-block"><div class="code-header"><span>${esc(example.label)} <small>${esc(example.language)}</small></span><button class="copy-button" type="button" data-example="${id}" data-example-index="${index}" aria-label="Copy ${esc(example.label)}">Copy</button></div><pre><code>${esc(example.code)}</code></pre></div>`;
}
function diagramMarkup(l){
 const preview=overviews[l.id];
 return `<figure class="lesson-diagram" data-diagram-kind="${esc(l.diagram.kind)}" aria-labelledby="diagram-title"><div class="diagram-heading"><div><span class="eyebrow">At a glance</span><h3 id="diagram-title">${esc(preview.title)}</h3></div><button class="button" type="button" data-action="diagram" data-lesson="${l.id}">Open full diagram ↗</button></div><div class="diagram-viewport" tabindex="0" role="region" aria-label="${esc(preview.title)}"><picture><source media="(max-width:700px)" srcset="${esc(preview.mobileAsset)}" width="${preview.mobileWidth}" height="${preview.mobileHeight}"><img src="${esc(preview.asset)}" alt="${esc(preview.text)}" width="${preview.width}" height="${preview.height}" loading="lazy"></picture></div><figcaption><details><summary>Read this diagram as text</summary><p>${esc(preview.text)}</p>${preview.text===l.diagram.text?'':`<p>${esc(l.diagram.text)}</p>`}</details></figcaption></figure>`;
}
function workedMarkup(l){
  if(!l.worked)return '';
  const w=l.worked;
  return `<section class="article-section worked-example" id="worked"><span class="eyebrow">From input to result</span><h2>${esc(w.title)}</h2><p>${inline(w.scenario)}</p><div class="code-block"><div class="code-header"><span>${esc(w.language)} · example</span><button class="copy-button" type="button" data-worked="${l.id}" aria-label="Copy the worked example">Copy</button></div><pre><code>${esc(w.code)}</code></pre></div><div class="expected-output"><span class="output-label">Expected result · compare with your run</span><pre><code>${esc(w.output)}</code></pre></div><p>${inline(w.explanation)}</p></section>`;
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
<header class="lesson-heading"><div class="breadcrumb"><a href="#path">← Learning path</a><span>Lesson ${String(index+1).padStart(2,'0')} / ${lessons.length}</span></div><h1 id="lesson-title" tabindex="-1">${esc(l.title)}</h1><div class="lesson-top-meta"><span>${esc(m.title)}</span><span>${l.minutes} min estimated</span><span class="surface-badge">${esc(l.surface)}</span><span id="lesson-state-label">${statusLabel(l.id)}</span></div><p class="lesson-goal">${inline(l.goal)}</p></header>
<button class="toc-toggle" type="button" data-action="toc" aria-expanded="false" aria-controls="lesson-toc">In this lesson ${icon('chevron-down')}</button><nav class="lesson-toc" id="lesson-toc" aria-label="On this page"><span>In this lesson</span><a href="${lessonURL(l.id)}?part=understand">Understand</a><a href="${lessonURL(l.id)}?part=example">Example</a><a href="${lessonURL(l.id)}?part=practice">Practice</a><a href="${lessonURL(l.id)}?part=check">Check your result</a><a href="${lessonURL(l.id)}?part=quiz">Knowledge check</a></nav>
<section class="article-section" id="understand"><h2 class="sr-only">Understand the approach</h2>${l.body.map(p=>`<p>${inline(p)}</p>`).join('')}</section>
${diagramMarkup(l)}
${(l.sections||[]).map(section=>`<section class="article-section"><h2>${esc(section.title)}</h2>${section.paragraphs.map(p=>`<p>${inline(p)}</p>`).join('')}</section>`).join('')}
<aside class="lesson-note"><strong>About your environment</strong><p>${inline(l.note)}</p></aside>
<section class="article-section" id="steps"><h2>Try it step by step</h2><ol>${l.steps.map(step=>`<li>${inline(step)}</li>`).join('')}</ol></section>
<section class="article-section" id="example"><div class="article-section-heading"><h2>A useful starting example</h2><span class="tiny-label">Illustration · adapt before use</span></div>${[l.example,...(l.examples||[])].map((ex,i)=>exampleMarkup(ex,l.id,i)).join('')}${workedMarkup(l)}</section>
<section class="article-section practice-box" id="practice"><span class="practice-label">${icon('code-2')} Hands-on exercise</span><h2>Your turn</h2><p>${inline(l.exercise)}</p><p class="fine-print">Use the lab below for the files and checks. Try the task before opening the reference answer.</p></section>
${labMarkup(l)}
<section class="article-section" id="check"><h2>Check your result</h2><ul class="check-list">${l.checks.map(item=>`<li>${inline(item)}</li>`).join('')}</ul></section>
${solutionMarkup(l)}
${quizMarkup(l)}
${troubleshootingMarkup(l)}
<section class="article-section"><h2>Common mistakes</h2><ul>${l.mistakes.map(item=>`<li>${inline(item)}</li>`).join('')}</ul></section>
<details class="mapping-note ${l.equivalence.status}"><summary><span class="mapping-label">${label}</span><span>Source mapping & differences</span></summary><div><p>${inline(l.equivalence.summary)}</p><a href="${esc(source.originalUrl)}" target="_blank" rel="noopener noreferrer">Source topic: ${esc(source.title)} ↗</a></div></details>
<section class="article-section article-sources"><h2>Go to the source</h2><p class="fine-print">Official documentation, checked 21 October 2026. Product names, controls, and availability may vary with your version, platform, or account.</p><ul class="source-links">${l.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a></li>`).join('')}</ul></section>
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
<h2>Design references and licensed materials</h2><p>Claude How-To informs the course's reading rhythm and learning navigation. <a href="https://linear.app/docs" target="_blank" rel="noopener noreferrer">Linear Docs</a> also informed navigation, and <a href="https://www.boot.dev/paths/backend?tech=python-typescript" target="_blank" rel="noopener noreferrer">Boot.dev</a> informed staged curriculum organization. Their logos and artwork are not included.</p><p>Learning topic organization was adapted from <a href="https://luongnv.com/claude-howto/" target="_blank" rel="noopener noreferrer">Claude How-To by luongnv89</a>, MIT © 2024 luongnv89. The original license is included. Fraunces, Manrope and JetBrains Mono are self-hosted under OFL; Lucide SVG icons retain ISC/MIT notices. Semantic diagrams were compiled with MIT-licensed Mermaid; the course serves static SVGs. No paid resource or runtime account is needed to read this course.</p><p><a href="THIRD-PARTY-NOTICES.md">Third-party notices</a> · <a href="docs/design-sources.md">Design reference notes</a> · <a href="docs/verification.md">Verification report</a></p>
<h2>Official documentation used</h2><ul class="source-links">${[...sources.values()].map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a></li>`).join('')}</ul><h2>What completion means</h2><p>Times are practice estimates. Completion is your own assessment, not a certification. The website does not run Codex, execute the examples or inspect your local project. Check the actual result before marking a lesson complete.</p><a class="button button-solid" href="#path">Explore the learning path ${icon('arrow-right')}</a></article>`;
}

function renderLabLibrary(){
  return `<article class="lab-library source-page"><span class="eyebrow">A path from reading to doing</span><h1>Practice with real files.</h1><p class="source-lead">Seven small labs, from your first project to a connected workflow. Each has runnable checks, expected results and inspectable reference files.</p><div class="lab-library-intro"><strong>Start in the Codex app</strong><p>Download a lab into a new folder, open that folder as your practice project, and follow its lesson. The local checks use Node.js and fictional inputs. Actual client activation is a separate optional step where relevant.</p></div><div class="lab-library-grid">${labCatalog.map((lab,i)=>`<section class="lab-library-card"><div class="lab-card-meta"><span class="lab-index">${String(i+1).padStart(2,'0')}</span><span>${esc(lab.level)}</span></div><h2>${esc(lab.title)}</h2><p>${esc(lab.summary)}</p><div class="lab-outcome"><strong>The result to look for</strong><p>${esc(lab.outcome)}</p></div><details class="lab-library-commands"><summary>Run and inspect this lab</summary><p>From the course folder or the extraction root containing the labs folder:</p><div class="code-block"><div class="code-header"><span>Behavioral checks</span><button class="copy-button" data-copy="${esc(lab.testCommand)}" type="button" aria-label="Copy ${esc(lab.id)} checks">Copy</button></div><pre><code>${esc(lab.testCommand)}</code></pre></div><div class="code-block"><div class="code-header"><span>Worked demonstration</span><button class="copy-button" data-copy="${esc(lab.demoCommand)}" type="button" aria-label="Copy ${esc(lab.id)} demo">Copy</button></div><pre><code>${esc(lab.demoCommand)}</code></pre></div><p>${esc(lab.expected)}</p><div class="lab-files">${lab.files.map(file=>`<button type="button" class="file-link" data-action="lab-file" data-file="labs/${esc(lab.id)}/${esc(file)}">${esc(file)} ↗</button>`).join('')}</div></details><div class="lab-card-actions"><a class="button button-solid" href="${lessonURL(lab.entryLesson)}">Open the lesson ${icon('arrow-right')}</a><a class="text-link" href="labs/${esc(lab.id)}.zip" download>Download lab ↓</a></div></section>`).join('')}</div><p class="fine-print">A reference test passing proves only its stated cases. Follow each lab's rubric and label any client, account or workflow stage you have not actually run.</p></article>`;
}

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
function stopTerminal(){disposeCourseMotion();}
function enterView(){if(!motion.matches)main.animate([{opacity:.55},{opacity:1}],{duration:200,easing:'cubic-bezier(.2,.7,.3,1)'});}
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
function scrollToPart(part, focus = false) {
  const element = part ? document.getElementById(part) : null;
  if(element) element.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'});
  else window.scrollTo({top:0,behavior:'instant'});
  if(focus) ($('#lesson-title')||main).focus({preventScroll:true});
}
function route(force = false, trackVisit = true) {
  if(!lessons.length) return;
  viewerRequest++;
  for(const id of ['diagram-dialog','file-dialog'])if($('#'+id).open)$('#'+id).close();
  const [rawPath,query] = location.hash.slice(1).split('?');
  const aliases={'lo-trinh':'path','nguon':'sources','vi-sao':'practice','tai-lieu':'resources','bat-dau':'practice','noi-dung':'main-content'};
  const path=aliases[rawPath] || rawPath.replace(/^bai\//,'lesson/');
  const params=new URLSearchParams(query||'');
  const oldPart={'hieu':'understand','vi-du':'example','thuc-hanh':'practice','kiem-tra':'check'};
  const requestedPart=params.get('part')||params.get('phan'),part=oldPart[requestedPart]||requestedPart;
  if(drawerOpen) setDrawer(false,false);
  if(path.startsWith('lesson/')) {
    stopTerminal();
    const id=path.slice(7),l=byId.get(id);
    if(!l){view='error';main.innerHTML='<div class="error-state"><span class="eyebrow">Lesson not found</span><h1>This lesson is not on the path.</h1><p>Choose a lesson from the curriculum to continue. Your saved progress is unchanged.</p><a class="button button-solid" href="#path">Open the learning path</a></div>';document.title='Lesson not found — Codex How-To';renderRail();scrollToPart();return;}
    const same=view===id&&!force;
    if(!same){if(trackVisit){if(status(id)==='new')state.lessons[id]={status:'started',updated:Date.now()};state.last=id;saveProgress();}disposeCourseMotion();main.innerHTML=renderLesson(l);view=id;mountCourseMotion(main);enterView();document.title=l.title+' — Codex How-To';renderRail();}
    requestAnimationFrame(()=>scrollToPart(part,!same));return;
  }
  if(path==='sources'){disposeCourseMotion();stopTerminal();view='sources';main.innerHTML=renderSources();enterView();document.title='Source library — Codex How-To';renderRail();scrollToPart();return;}
  if(path==='labs'){disposeCourseMotion();stopTerminal();view='labs';main.innerHTML=renderLabLibrary();enterView();document.title='Practice labs — Codex How-To';renderRail();scrollToPart();return;}
  if(!['','path','practice','resources','main-content'].includes(path)){stopTerminal();view='error';main.innerHTML='<div class="error-state"><h1>Page not found.</h1><p>The address may have changed.</p><a class="button" href="#path">Back to the learning path</a></div>';renderRail();return;}
  if(view!=='home'||force){disposeCourseMotion();main.innerHTML=renderHome();view='home';mountCourseMotion(main);enterView();}
  document.title='Codex How-To — A practical field guide';renderRail();
  requestAnimationFrame(()=>{if(path==='main-content'){main.focus();return;}scrollToPart(path);});
}
function showAssessment() {
  if(!contentReady){notify('Open the course before choosing a starting point. Use Try again if the lesson files could not load.');return;}
  if(drawerOpen) setDrawer(false,false);
  const questions=['I can distinguish Codex in the app, CLI, and IDE.','I can give a task with a clear scope and outcome.','I have reviewed a change and checked that it works.','I have used a skill or connected tool in Codex.'];
  $('#assessment-body').innerHTML=`<h2 id="assessment-title">What have you already tried?</h2><p>Choose based on real experience. This suggests a starting point; it is not a certification test.</p><form id="assessment-form">${questions.map((q,i)=>`<fieldset class="assessment-question"><legend>${i+1}. ${q}</legend><div class="assessment-options"><label><input type="radio" name="q${i}" value="yes" required> I have done this</label><label><input type="radio" name="q${i}" value="no" required> Not sure yet</label></div></fieldset>`).join('')}<div class="dialog-actions"><button class="button button-solid" type="submit">Show my starting point</button></div></form>`;
  if(!$('#assessment-dialog').open) $('#assessment-dialog').showModal();
}
function normalizeText(text) {return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();}

document.addEventListener('click',async event=>{
  const target=event.target.closest('button,a');if(!target)return;
  if(target.classList.contains('skip-link')){event.preventDefault();main.focus();main.scrollIntoView({behavior:'instant'});return;}
  if(target.id==='theme-toggle'){const dark=document.documentElement.dataset.theme==='dark';document.documentElement.dataset.theme=dark?'light':'dark';try{localStorage.setItem(THEME_KEY,dark?'light':'dark');}catch{}updateThemeLabel();return;}
  if(target.id==='menu-toggle'){setDrawer(!drawerOpen);return;}
  if(target.hasAttribute('data-copy')||target.hasAttribute('data-lesson-copy')||target.hasAttribute('data-example')||target.hasAttribute('data-worked')||target.hasAttribute('data-lab-copy')){
    const item=byId.get(target.dataset.example||target.dataset.lessonCopy);
    const text=target.hasAttribute('data-worked')?byId.get(target.dataset.worked)?.worked?.code:target.hasAttribute('data-lab-copy')?byId.get(target.dataset.labCopy)?.lab?.commands[Number(target.dataset.command)]?.command:target.dataset.copy??[item?.example,...(item?.examples||[])][Number(target.dataset.exampleIndex)||0]?.code;
    if(typeof text!=='string')return;
    try{await navigator.clipboard.writeText(text);target.textContent='Copied ✓';notify('Example copied.');setTimeout(()=>{if(target.isConnected)target.textContent='Copy';},2000);}
    catch{notify('Automatic copy is unavailable. Select the example text and copy it manually.');}
    return;
  }
  switch(target.dataset.action){
    case 'toc':{const article=target.closest('.lesson-article'),open=target.getAttribute('aria-expanded')!=='true';article.classList.toggle('toc-open',open);target.setAttribute('aria-expanded',String(open));break;}
    case 'diagram':{
      const l=byId.get(target.dataset.lesson);if(!l)return;
      diagramZoom=1;$('#diagram-modal-title').textContent=l.diagram.title;$('#diagram-modal-description').textContent=l.diagram.text;
      const img=$('#diagram-modal-image');img.onload=positionDiagram;img.src=l.diagram.asset;img.alt=l.diagram.text;img.dataset.width=l.diagram.width;img.style.width=l.diagram.width+'px';$('#diagram-scale').textContent='100%';$('#diagram-dialog').showModal();positionDiagram();break;
    }
    case 'close-diagram':$('#diagram-dialog').close();break;
    case 'zoom-in':case 'zoom-out':case 'zoom-reset':{
      const reset=target.dataset.action==='zoom-reset';
      zoomDiagram(reset?1:diagramZoom+(target.dataset.action==='zoom-in'?.25:-.25),reset);break;
    }
    case 'zoom-fit':{
      const canvas=$('.diagram-modal-canvas'),style=getComputedStyle(canvas);
      const available=canvas.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
      zoomDiagram(Math.min(1,available/Number($('#diagram-modal-image').dataset.width)),true);break;
    }
    case 'lab-file':{
      const path=target.dataset.file;if(!/^labs\/[a-z0-9_./-]+$/i.test(path)||path.includes('..'))return;
      const request=++viewerRequest;viewerFileText='';$('#file-modal-title').textContent=path;$('#file-preview').textContent='Loading source…';$('#file-preview-status').textContent='';$('#file-dialog').showModal();
      try{const response=await fetch(path);if(!response.ok)throw new Error('Unavailable');const source=await response.text();if(source.length>1024*1024)throw new Error('Too large');if(request!==viewerRequest)return;viewerFileText=source;$('#file-preview').textContent=source;}
      catch{if(request!==viewerRequest)return;$('#file-preview').textContent='';$('#file-preview-status').textContent='This source file could not be loaded. Close this view and use the lab download or try again.';}break;
    }
    case 'close-file':viewerRequest++;$('#file-dialog').close();break;
    case 'copy-file':{
      if(!viewerFileText){notify('Wait for the source file to load.');break;}try{await navigator.clipboard.writeText(viewerFileText);notify('File contents copied.');}catch{notify('Select the source text and copy it manually.');}break;
    }
    case 'close-menu':setDrawer(false);break;
    case 'expand':{const id=target.dataset.module,expanded=target.getAttribute('aria-expanded')==='true';target.setAttribute('aria-expanded',String(!expanded));$(`#lessons-${id}`).hidden=expanded;expanded?openModules.delete(id):openModules.add(id);break;}
    case 'assessment':showAssessment();break;
    case 'close-assessment':$('#assessment-dialog').close();break;
    case 'reset':$('#reset-dialog').showModal();break;
    case 'cancel-reset':$('#reset-dialog').close();break;
    case 'confirm-reset':state={lessons:{},last:null};saveProgress();$('#reset-dialog').close();route(true);notify('Progress reset in this browser.');break;
    case 'complete':{const id=target.dataset.lesson,done=status(id)==='done';state.lessons[id]={...state.lessons[id],status:done?'started':'done',updated:Date.now()};saveProgress();target.setAttribute('aria-pressed',String(!done));target.textContent=done?'Mark lesson complete':'✓ Completed · Study again';target.classList.toggle('button-solid',done);target.classList.toggle('button-success',!done);$('#lesson-state-label').textContent=done?'In progress':'Completed';renderRail();notify(done?'Lesson moved back to in progress.':'Lesson completion saved.');break;}
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
  if(event.target.id!=='assessment-form')return;event.preventDefault();
  if(!contentReady){$('#assessment-dialog').close();notify('The course needs to finish loading first.');return;}
  const fd=new FormData(event.target),answers=[0,1,2,3].map(i=>fd.get('q'+i)==='yes');
  const id=!answers[0]?'01':!answers[1]?'02':!answers[2]?'08':!answers[3]?'03':'09',m=modules.find(m=>m.id===id);
  $('#assessment-body').innerHTML=`<div class="assessment-result"><span class="source-tag">A suggested starting point</span><h2 id="assessment-title" tabindex="-1">Start with module ${m.id}</h2><h3>${esc(m.title)}</h3><p>${esc(m.description)} You can open any other lesson; this recommendation does not skip or complete lessons for you.</p><div class="dialog-actions"><a class="button button-solid" href="${lessonURL(m.lessons[0].id)}" id="assessment-start">Open the suggested lesson</a><button class="button" data-action="assessment" type="button">Choose again</button></div></div>`;
  $('#assessment-start').addEventListener('click',()=>$('#assessment-dialog').close());$('#assessment-title').focus();
});
document.addEventListener('load',event=>{if(event.target.matches?.('.diagram-viewport img')){const frame=event.target.parentElement;frame.scrollLeft=Math.max(0,(frame.scrollWidth-frame.clientWidth)/2);}},true);
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
    state=next;saveProgress();renderRail();result.textContent='Progress imported. Open the learning path to resume.';
  }catch{result.textContent='This is not a valid progress backup for the 60-lesson edition. Your current progress was kept.';}
  event.target.value='';
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&drawerOpen){setDrawer(false);return;}
  if(event.key==='Tab'&&drawerOpen){const controls=[...$('#app-rail').querySelectorAll('a,button,input')].filter(el=>!el.hidden&&el.getClientRects().length);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
});
window.addEventListener('hashchange',()=>route());
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY||event.key===null){readProgress();route(true,false);}});
narrow.addEventListener('change',()=>setDrawer(false,false));

async function boot() {
  try {
    contentReady=false;
    $('.header-assessment').disabled=true;
    setDrawer(false,false);
    main.innerHTML='<div class="loading-state" role="status">Opening your learning workspace…</div>';
    const responses=await Promise.all([...PARTS.map(part=>`content/${part}.json`),'content/source-map.json','content/diagrams.json','content/labs.json','content/diagram-overviews.json'].map(url=>fetch(url)));
    if(responses.some(response=>!response.ok))throw new Error('Content unavailable');
    const documents=await Promise.all(responses.map(response=>response.json()));
    overviews=documents.pop().lessons;
    labCatalog=documents.pop();const diagrams=documents.pop();catalog=documents.pop();
    modules=validateCourse(documents.flat(),catalog,diagrams);
    lessons=modules.flatMap(m=>m.lessons);byId=new Map(lessons.map(l=>[l.id,l]));
    contentReady=true;
    $('.header-assessment').disabled=false;
    readProgress();view='';route();
  } catch {
    view='error';main.innerHTML='<div class="error-state" role="alert"><span class="eyebrow">Content unavailable</span><h1>Let’s try opening the course again.</h1><p>The lesson files could not be read. Check that the local server is running and the content folder is present. Your saved progress has not been deleted.</p><button class="button button-solid" type="button" data-action="retry">Try again</button></div>';
  }
}
boot();

$('#file-dialog').addEventListener('close',()=>{viewerRequest++;});
