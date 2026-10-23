'use strict';
(async()=>{
const {lessonOutline}=await import('../assets/atelier/lesson-outline.mjs');
// Deterministic, dependency-free reading pages. This never mutates course data.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const prism=require('../assets/atelier/vendor/prism.js');
const syntax=(code,lang)=>{lang=lang==='jsonl'?'json':lang;return prism.languages[lang]?prism.highlight(code,prism.languages[lang],lang):esc(code);};
const root = path.resolve(__dirname, '..');
const {withoutJSONLD}=require('../assets/atelier/structured-data.cjs');
const origin='https://builtbyhuy.github.io/codex-howto/';
const outputDir = path.join(root, 'assets', 'reading');
const checkOnly = process.argv.includes('--check');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const inline = value => esc(value).replace(/`([^`]+)`/g, '<code>$1</code>');
const sourceFiles = ['content/part-a.json', 'content/part-b.json', 'content/part-c.json', 'content/diagrams.json', 'content/diagram-overviews.json', 'content/source-map.json','assets/atelier/lesson-outline.mjs'];
const sourceBytes = Object.fromEntries(sourceFiles.map(file => [file, fs.readFileSync(path.join(root, file))]));
const sourceHashes = Object.fromEntries(sourceFiles.map(file => [file, hash(sourceBytes[file])]));
const read = file => JSON.parse(sourceBytes[file].toString('utf8'));
const modules = sourceFiles.slice(0, 3).flatMap(read);
const lessons = modules.flatMap(module => module.lessons);
const diagrams = read('content/diagrams.json').lessons;
const overviews = read('content/diagram-overviews.json').lessons;
const originalTopics = new Map(read('content/source-map.json').modules.flatMap(module => module.lessons).map(lesson => [lesson.key, lesson]));
assert.equal(modules.length, 10, 'The static index must reflect the actual ten modules.');
assert.equal(lessons.length, 60, 'The fallback requires the complete sixty-lesson edition.');
assert.equal(new Set(lessons.map(lesson => lesson.id)).size, 60, 'Lesson IDs must remain unique.');

function relativeFromCourse(file) {
  assert.match(file, /^[a-zA-Z0-9_./-]+$/, 'Unexpected local resource path.');
  assert.ok(!file.startsWith('/') && !file.split('/').includes('..'), 'Resource must stay inside the course.');
  return '../../' + file;
}
function externalURL(url) {
  const parsed = new URL(url);
  assert.equal(parsed.protocol, 'https:', 'Only HTTPS documentation/source links are allowed.');
  return esc(parsed.href);
}
function codeBlock(label, language, code, track, key, options = {}) {
  const title = options.labelAuthored === false ? esc(label) : track(label, key + '.label');
  const kind = options.languageAuthored === false ? esc(language) : track(language, key + '.language');
  track(code, options.codeKey || key + '.code', false);
  return `<div class="code-block"><div class="code-header"><span>${title} <small>${kind}</small></span></div><pre><code>${syntax(code,language)}</code></pre></div>`;
}
function documentHTML(title, body, description, filename='index.html') {
  const url=origin+'assets/reading/'+filename;
  const items=[{name:'Howto codex',item:origin},{name:'Reading curriculum',item:origin+'assets/reading/index.html'}];
  if(filename!=='index.html')items.push({name:title,item:url});
  const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,...item}))};
  const json=JSON.stringify(breadcrumb).replace(/</g,'\\u003c');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <script type="application/ld+json">${json}</script>
  <title>${esc(title)} — Howto codex</title>
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../atelier/reader-base.css">
  <link rel="stylesheet" href="../atelier/site.css">
<link rel="stylesheet" href="../atelier/refinements.css"></head>
<body data-page="static">
  <a class="skip-link" href="#main-content">Skip to lesson content</a>
  <header class="static-masthead"><a href="../../index.html">Howto codex</a><nav aria-label="Reading navigation"><a href="index.html">All reading lessons</a><a href="../../index.html#roadmap">Interactive course</a></nav></header>
  ${body}
  <footer class="static-footer"><p>An independent community course. <a href="../../THIRD-PARTY-NOTICES.md">Sources and licenses</a> · <a href="index.html">Reading curriculum</a> · <a href="../../index.html">Course home</a></p><p>Static reading pages contain the authored lesson material. Interactive quizzes, saved progress, copy controls and app navigation require the interactive course.</p></footer>
</body>
</html>
`;
}

const lessonEvidence = [];
function renderLesson(lesson, index) {
  const module = modules.find(item => item.lessons.some(item => item.id === lesson.id));
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const diagram = diagrams[lesson.id];
  const overview = overviews[lesson.id];
  const original = originalTopics.get(lesson.sourceKey);
  assert.ok(diagram && overview && original, `Missing diagram or provenance for ${lesson.id}.`);
  const fragments = [];
  const track = (value, key, useInline = true) => {
    assert.equal(typeof value, 'string', `Authored field ${lesson.id}.${key} must be text.`);
    const markup = useInline ? inline(value) : esc(value);
    fragments.push({key, markup});
    return markup;
  };
  const paragraph = (value, key) => `<p>${track(value, key)}</p>`;
  const list = (items, tag, prefix) => `<${tag}>${items.map((item, i) => `<li>${track(item, prefix + '.' + i)}</li>`).join('')}</${tag}>`;
  const examples = [lesson.example, ...(lesson.examples || [])];
  const worked = lesson.worked;
  const lab = lesson.lab;
  const downloads = lab ? [lab.path, ...(lab.relatedPaths || [])] : [];
  const nav = `<nav class="lesson-navigation" aria-label="Previous and next reading lessons">${previous ? `<a href="${previous.id}.html"><span>← Previous lesson</span><strong>${esc(previous.title)}</strong></a>` : '<a href="index.html"><span>← Back to</span><strong>Reading curriculum</strong></a>'}${next ? `<a href="${next.id}.html"><span>Next lesson →</span><strong>${esc(next.title)}</strong></a>` : '<a href="index.html"><span>Course complete →</span><strong>Review the curriculum</strong></a>'}</nav>`;
  const body = `<main class="static-reader" id="main-content"><article class="lesson-article" aria-labelledby="lesson-title">
<header class="lesson-heading"><div class="breadcrumb"><a href="index.html">← Reading curriculum</a><span>Lesson ${String(index + 1).padStart(2, '0')} / ${lessons.length}</span></div><p class="eyebrow">Static reading edition · ${esc(lesson.id)}</p><h1 id="lesson-title">${track(lesson.title, 'title')}</h1><div class="lesson-top-meta"><span>${esc(module.title)}</span><span>${lesson.minutes} min estimated</span><span class="surface-badge">${track(lesson.surface, 'surface')}</span></div><p class="lesson-goal">${track(lesson.goal, 'goal')}</p></header>
<aside class="notice static-reading-notice"><strong>Read the complete lesson without JavaScript.</strong><p>Examples are selectable text; this page does not run commands. <a href="../../index.html#lesson/${lesson.id}">Open the interactive lesson</a> for the quiz, copy controls and saved progress. Reading this page does not mark the lesson complete.</p></aside>
<nav class="static-toc" aria-label="On this page">${lessonOutline(lesson).map(([id,title])=>`<a href="#${id}">${esc(title)}</a>`).join(' · ')}</nav>
<section class="article-section" id="understand"><h2>Understand the approach</h2>${lesson.body.map((text, i) => paragraph(text, 'body.' + i)).join('')}</section>
<figure class="lesson-diagram"><div class="diagram-heading"><h2>${track(diagram.title, 'diagram.title')}</h2></div><div class="diagram-viewport"><picture><source media="(max-width:700px)" srcset="${relativeFromCourse(overview.mobileAsset)}" width="${overview.mobileWidth}" height="${overview.mobileHeight}"><img src="${relativeFromCourse(overview.asset)}" alt="${esc(overview.text)}" width="${overview.width}" height="${overview.height}" loading="lazy"></picture></div><figcaption>${paragraph(diagram.text, 'diagram.text')}${overview.text === diagram.text ? '' : paragraph(overview.text, 'overview.text')}<p><a href="${relativeFromCourse(diagram.asset)}">Open the full diagram</a></p></figcaption></figure>
${(lesson.sections || []).map((section, i) => `<section class="article-section" id="section-${i}"><h2>${track(section.title, 'sections.' + i + '.title')}</h2>${section.paragraphs.map((text, j) => paragraph(text, 'sections.' + i + '.paragraphs.' + j)).join('')}</section>`).join('')}
<details class="lesson-note static-client-note" open><summary>About your environment</summary><div>${paragraph(lesson.note, 'note')}</div></details>
<section class="article-section" id="steps"><h2>Try it step by step</h2>${list(lesson.steps, 'ol', 'steps')}</section>
<section class="article-section" id="example"><h2>A useful starting example</h2><p class="fine-print">Illustration · adapt before use.</p>${examples.map((example, i) => codeBlock(example.label, example.language, example.code, track, i ? 'examples.' + (i - 1) : 'example')).join('')}</section>
${worked ? `<section class="article-section worked-example" id="worked"><span class="eyebrow">From input to result</span><h2>${track(worked.title, 'worked.title')}</h2>${paragraph(worked.scenario, 'worked.scenario')}${codeBlock('Worked input', worked.language, worked.code, track, 'worked', {labelAuthored:false})}<div class="expected-output"><span class="output-label">Expected result · compare with your run</span><pre><code>${track(worked.output, 'worked.output', false)}</code></pre></div>${paragraph(worked.explanation, 'worked.explanation')}</section>` : ''}
<section class="article-section practice-box" id="practice"><span class="practice-label">Hands-on exercise</span><h2>Your turn</h2>${paragraph(lesson.exercise, 'exercise')}<p class="fine-print">Try the exercise before opening its reference answer. Use a disposable practice folder.</p></section>
${lab ? `<section class="article-section lab-workbench" id="lab"><div class="lab-workbench-heading"><span class="practice-label">Run the practice</span><h2>${track(lab.title, 'lab.title')}</h2><p>Extract into a new practice folder and keep the included labs folder. Run these commands from that extraction root, or from the course folder, using an existing Node.js installation.</p>${downloads.length > 1 ? '<p>This exercise uses both packs. Extract each into the same practice root, keeping their separate folders under labs.</p>' : ''}<div class="lab-downloads">${downloads.map((file, i) => `<a class="button" href="${relativeFromCourse(file + '.zip')}" download>${i ? 'Download companion: ' + esc(file.split('/').pop()) : 'Download this lab'} ↓</a>`).join('')}</div></div><ol class="lab-commands">${lab.commands.map((command, i) => `<li>${codeBlock('Command ' + (i + 1), 'text', command.command, track, 'lab.commands.' + i, {labelAuthored:false,languageAuthored:false,codeKey:'lab.commands.' + i + '.command'})}<p><strong>Check:</strong> ${track(command.expected, 'lab.commands.' + i + '.expected')}</p></li>`).join('')}</ol><div class="lab-files"><strong>Inspect the actual files</strong>${lab.files.map((file, i) => `<a class="file-link" href="${relativeFromCourse(file.path)}">${track(file.label, 'lab.files.' + i + '.label')} ↗</a>`).join('')}</div><p class="lab-takeaway">${track(lab.takeaway, 'lab.takeaway')}</p></section>` : ''}
<section class="article-section" id="check"><h2>Check your result</h2>${list(lesson.checks, 'ul', 'checks')}</section>
${lesson.solution ? `<details class="reference-solution" id="solution"><summary>Reference answer &amp; rubric <small>Try the exercise before opening</small></summary><div>${paragraph(lesson.solution.summary, 'solution.summary')}${list(lesson.solution.steps, 'ol', 'solution.steps')}</div></details>` : ''}
<section class="article-section knowledge-check" id="quiz"><span class="eyebrow">Think it through</span><h2>Check your understanding</h2>${paragraph(lesson.quiz.question, 'quiz.question')}${list(lesson.quiz.options, 'ol', 'quiz.options')}<details class="static-quiz-answer"><summary>Reveal the answer and explanation</summary><div><p><strong>Answer ${lesson.quiz.answer + 1}:</strong> ${inline(lesson.quiz.options[lesson.quiz.answer])}</p>${paragraph(lesson.quiz.explanation, 'quiz.explanation')}</div></details><p><a href="../../index.html#lesson/${lesson.id}?part=quiz">Take this quiz in the interactive lesson</a> to save your answer in the browser.</p></section>
${lesson.troubleshooting ? `<section class="article-section troubleshooting" id="troubleshooting"><h2>When it does not work</h2>${lesson.troubleshooting.map((item, i) => `<details><summary>${track(item.symptom, 'troubleshooting.' + i + '.symptom')}</summary><div><p><strong>Likely cause:</strong> ${track(item.cause, 'troubleshooting.' + i + '.cause')}</p><p><strong>What to try:</strong> ${track(item.fix, 'troubleshooting.' + i + '.fix')}</p></div></details>`).join('')}</section>` : ''}
<section class="article-section" id="mistakes"><h2>Common mistakes</h2>${list(lesson.mistakes, 'ul', 'mistakes')}</section>
<details class="mapping-note"><summary>Source mapping &amp; differences · ${esc(lesson.equivalence.status)}</summary><div>${paragraph(lesson.equivalence.summary, 'equivalence.summary')}<a href="${externalURL(original.originalUrl)}">Source topic: ${esc(original.title)} ↗</a></div></details>
<section class="article-section article-sources" id="lesson-sources"><h2>Go to the source</h2><p class="fine-print">Official documentation, checked 21 October 2026. Product names, controls and availability may vary with your version, platform or account.</p><ul class="source-links">${lesson.sources.map((source, i) => `<li><a href="${externalURL(source.url)}">${track(source.title, 'sources.' + i + '.title')} ↗</a></li>`).join('')}</ul></section>
<div class="lesson-completion"><a class="button button-solid" href="../../index.html#lesson/${lesson.id}">Continue in the interactive lesson →</a><p>Completion and quiz progress are saved<br>only in the interactive course.</p></div>
${nav}
</article></main>`;
  const html = documentHTML(lesson.title, body, lesson.goal, lesson.id+'.html');
  const equivalentMarkup=value=>value.replace(/<\/?span\b[^>]*>/g,'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&gt;/g,'>');
  const textMarkup=equivalentMarkup(html);
  for (const fragment of fragments) assert.ok(textMarkup.includes(equivalentMarkup(fragment.markup)), `Missing authored field ${lesson.id}.${fragment.key}.`);
  const leafFields = [];
  function checkLeaves(value, key = '') {
    if (typeof value === 'string') {
      if (key === 'sourceKey') return; // Internal mapping key; the human-readable provenance is rendered above.
      const candidates = [esc(value), inline(value)];
      if (/^https:\/\//.test(value)) candidates.push(externalURL(value));
      assert.ok(candidates.some(fragment => textMarkup.includes(equivalentMarkup(fragment))), `Authored source text omitted from ${lesson.id}.${key}.`);
      leafFields.push(key);
    } else if (Array.isArray(value)) value.forEach((item, i) => checkLeaves(item, key + '.' + i));
    else if (value && typeof value === 'object') for (const [field, item] of Object.entries(value)) checkLeaves(item, key ? key + '.' + field : field);
  }
  checkLeaves(lesson);
  assert.ok(!/<(?:script|form|button)\b|<[a-z][^>]*\son[a-z]+\s*=/i.test(withoutJSONLD(html)), `The static page must not require executable controls: ${lesson.id}.`);
  lessonEvidence.push({id:lesson.id, moduleId:module.id, authoredFragmentsChecked:fragments.length, authoredKeys:fragments.map(fragment => fragment.key), allAuthoredStringFieldsChecked:leafFields.length, excludedInternalFields:['sourceKey'], bytes:Buffer.byteLength(html), sha256:hash(html), hasNativeReferenceAnswer:Boolean(lesson.solution), hasLabDownloads:downloads.length});
  return html;
}

function renderIndex() {
  const minutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
  const body = `<main class="static-reader static-course-index" id="main-content"><header class="static-course-header"><p class="eyebrow">Howto codex · Reading edition</p><h1>A complete reading path.</h1><p>${modules.length} modules, ${lessons.length} detailed lessons in English. Estimated practice time: ${Math.floor(minutes / 60)}h ${minutes % 60}m.</p></header><aside class="notice"><strong>Read every lesson without JavaScript.</strong><p>These pages contain the existing course explanations, examples, exercises, answers, diagram text and practice downloads. Use <a href="../../index.html#roadmap">the interactive course</a> for saved progress, quiz feedback, copy controls and the app-style reader. This reading edition does not save completion or simulate interactive controls.</p><p>The five translated getting-started guides introduce the course; the sixty detailed lessons remain in English. <a href="../../index.html#languages">Choose a getting-started language</a>.</p></aside><div class="static-modules">${modules.map(module => `<section class="static-module" aria-labelledby="module-${module.id}"><p class="eyebrow">Module ${esc(module.id)} · ${esc(module.level)}</p><h2 id="module-${module.id}">${esc(module.title)}</h2><p>${inline(module.description)}</p><p class="fine-print">${module.lessons.length} lessons · ${module.minutes} min estimated</p><ol>${module.lessons.map(lesson => `<li><a href="${lesson.id}.html">${esc(lesson.title)}</a> <span class="fine-print">${lesson.minutes} min estimated</span></li>`).join('')}</ol></section>`).join('')}</div></main>`;
  return documentHTML('Reading curriculum', body, 'Read all sixty English Howto codex lessons without JavaScript, with complete examples, exercises, answers and downloadable practice files.');
}

const generated = new Map(lessons.map((lesson, index) => [lesson.id + '.html', renderLesson(lesson, index)]));
generated.set('index.html', renderIndex());
const pendingLocalFiles = new Set();
let internalLinksChecked = 0;
for (const [name, html] of generated) {
  assert.match(name, /^(?:s\d{2}-\d{2}|index)\.html$/);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs in ' + name);
  for (const [, value] of html.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)) {
    const decoded = value.replace(/&amp;/g, '&');
    const url = new URL(decoded, 'https://static.invalid/assets/reading/' + name);
    if (url.origin !== 'https://static.invalid') continue;
    internalLinksChecked++;
    const relative = decodeURIComponent(url.pathname.slice(1));
    const target = path.resolve(root, relative);
    assert.ok(target.startsWith(root + path.sep), 'Static link escaped course root.');
    if (relative.startsWith('assets/reading/')) {
      const targetName = relative.slice('assets/reading/'.length);
      assert.ok(generated.has(targetName), 'Broken reading navigation: ' + value);
      if (url.hash) assert.ok(generated.get(targetName).includes('id="' + url.hash.slice(1) + '"'), 'Broken static section link.');
    } else if (!fs.existsSync(target)) pendingLocalFiles.add(relative);
  }
}
if (checkOnly) {
  assert.equal(pendingLocalFiles.size, 0, 'Local dependencies missing: ' + [...pendingLocalFiles].join(', '));
  const actual = fs.readdirSync(outputDir).filter(file => file.endsWith('.html')).sort();
  assert.deepEqual(actual, [...generated.keys()].sort(), 'Generated fallback HTML inventory differs.');
  for (const [name, html] of generated) assert.equal(fs.readFileSync(path.join(outputDir, name), 'utf8'), html, 'Fallback needs rebuilding: ' + name);
} else {
  fs.mkdirSync(outputDir, {recursive:true});
  for (const [name, html] of generated) fs.writeFileSync(path.join(outputDir, name), html);
}
for (const file of sourceFiles) assert.equal(hash(fs.readFileSync(path.join(root, file))), sourceHashes[file], 'Course data changed during generation.');
const evidence = {schemaVersion:1, generatedAtUtc:new Date().toISOString(), command:checkOnly?'node scripts/build-reading-fallback.cjs --check':'node scripts/build-reading-fallback.cjs', status:pendingLocalFiles.size?'generated-with-pending-stylesheet':'verified', scope:'Static reading fallback, not full progressive-enhancement or source-site equivalence.', modules:modules.length, lessons:lessons.length, generatedPages:generated.size, executableScripts:0, jsonLDScripts:generated.size, interactiveControls:0, sourceHashes, courseSourcesUnchanged:true, internalLinksChecked, pendingLocalFiles:[...pendingLocalFiles], nativeAnswers:true, totalBytes:[...generated.values()].reduce((sum, html) => sum + Buffer.byteLength(html), 0), indexSha256:hash(generated.get('index.html')), files:lessonEvidence, caveats:['Static pages do not save completion, quiz choices or theme preferences.','Quiz questions/options/explanations are readable, with a native reveal; interactive answer submission remains in the main course.','Copy controls and diagram zoom are replaced by selectable text and image/file links.','Translated getting-started guides are separate; detailed lessons remain English.','Exact text, resource existence and generation were checked; visual appearance with JavaScript disabled still requires browser review.','Adding a static reading fallback does not make the hash-routed interactive home itself readable without JavaScript.']};
fs.mkdirSync(path.join(root, 'evidence'), {recursive:true});
if(process.env.STRUCTURED_DATA_EVIDENCE) { fs.mkdirSync(process.env.STRUCTURED_DATA_EVIDENCE,{recursive:true}); fs.writeFileSync(path.join(process.env.STRUCTURED_DATA_EVIDENCE, 'reading-'+(checkOnly?'check':'build')+'.json'), JSON.stringify(evidence, null, 2) + '\n'); }
process.stdout.write(JSON.stringify({status:evidence.status, pages:generated.size, lessons:lessons.length, bytes:evidence.totalBytes, localLinks:internalLinksChecked, pendingLocalFiles:evidence.pendingLocalFiles, mode:checkOnly?'check':'build'}) + '\n');

})().catch(error=>{console.error(error);process.exitCode=1;});
