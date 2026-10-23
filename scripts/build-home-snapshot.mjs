// Deterministic home reading snapshot; the interactive app replaces it at boot.
// Only the content inside root index.html's #main-content element is owned here.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {referenceHome, referenceProgress} from '../assets/atelier/home.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const sourceFiles = ['content/part-a.json', 'content/part-b.json', 'content/part-c.json', 'content/labs.json', 'assets/atelier/home.mjs', 'assets/atelier/workbench.mjs'];
const sourceBuffers = Object.fromEntries(sourceFiles.map(file => [file, fs.readFileSync(path.join(root, file))]));
const sourceHashes = Object.fromEntries(sourceFiles.map(file => [file, sha(sourceBuffers[file])]));
const modules = sourceFiles.slice(0, 3).flatMap(file => JSON.parse(sourceBuffers[file].toString('utf8')));
const lessons = modules.flatMap(module => module.lessons);
const labs = JSON.parse(sourceBuffers['content/labs.json'].toString('utf8'));
const lessonIds = new Set(lessons.map(lesson => lesson.id));
assert.equal(modules.length, 10);
assert.equal(lessons.length, 60);
assert.equal(lessonIds.size, 60);
assert.equal(labs.length, 7);
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon = name => {
  assert.match(name, /^[a-z0-9-]+$/);
  assert.ok(fs.existsSync(path.join(root, 'assets', 'icons', name + '.svg')));
  return `<span class="icon" style="--icon:url('data:image/svg+xml;base64,${fs.readFileSync(path.join(root,'assets/icons',name+'.svg')).toString('base64')}')" aria-hidden="true"></span>`;
};
const ctx = {
  modules,
  lessons,
  labs,
  levels: [...new Set(modules.map(module => module.level))],
  status: () => 'new',
  counts: (items = lessons) => ({done:0, started:0, left:items.length, total:items.length, percent:0}),
  continueLesson: () => lessons[0],
  openModules: new Set(modules.map(module => module.id)),
  icon,
};
let snapshot = referenceHome(ctx);
const progress = referenceProgress(ctx);
assert.equal(snapshot.split(progress).length, 2, 'Expected one exact home progress component.');
snapshot = snapshot.replace(progress, `<div class="a-progress a-static-progress"><h3>Reading edition</h3><p class="a-next-title">All 60 English lessons are available without JavaScript. This view does not read or save your progress.</p><a class="a-button a-button-primary" href="assets/reading/index.html">Read the complete course →</a><p class="a-progress-bottom">Use the interactive course for quiz feedback, copy controls and saved completion.</p></div>`);
snapshot = snapshot.replace('<div class="a-home">', '<div class="a-home" data-static-snapshot="reading">');
snapshot = snapshot.replace(/href="#lesson\/(s\d{2}-\d{2})(?:\?[^"<>]*)?"/g, (_, id) => {
  assert.ok(lessonIds.has(id), 'Snapshot linked an unknown lesson.');
  return `href="assets/reading/${id}.html"`;
});
snapshot = snapshot.replace(/href="#roadmap\?part=(level-(?:beginner|intermediate|advanced))"/g, 'href="#$1"');
snapshot = snapshot.replace(/href="#guide\/(en|vi|zh|ja|uk)"/g, 'href="docs/guides/$1/README.md"');
snapshot = snapshot.replaceAll('href="#sources"', 'href="docs/content-provenance.md"');
snapshot = snapshot.replace(/href="#reference(?:\?[^"]*)?"/g,'href="assets/reading/index.html"');
snapshot = snapshot.replace(/href="#reference(?:\?[^"]*)?"/g,'href="assets/reading/index.html"');
snapshot = snapshot.replaceAll('href="#labs"', 'href="assets/reading/index.html"');
snapshot = snapshot.replace('Explore all seven projects', 'Read the practice lessons');
// A static snapshot cannot know a reader's saved state. Keep course structure,
// but replace the all-new presentation rather than presenting it as real progress.
snapshot = snapshot.replace(/<span data-pill>Not started<\/span>/g, '<span data-pill>Reading edition</span>');
snapshot = snapshot.replace(/<span class="a-lesson-state" data-lstatus>Not started<\/span>/g, '');
const meters = [...snapshot.matchAll(/<div class="a-module-meter">[\s\S]*?<\/div>/g)];
assert.equal(meters.length, modules.length, 'Module progress layout changed; review the snapshot adapter.');
snapshot = snapshot.replace(/<div class="a-module-meter">[\s\S]*?<\/div>/g, '');
let disabledButtons = 0;
let disabledCheckboxes = 0;
let disabledTabs = 0;
snapshot = snapshot.replace(/<button\b[^>]*>/g, opening => {
  disabledButtons++;
  const checkbox = /role="checkbox"/.test(opening);
  const tab = /role="tab"/.test(opening);
  if (checkbox) disabledCheckboxes++;
  if (tab) disabledTabs++;
  const title = checkbox ? 'Completion tracking is available in the interactive course.'
    : tab ? 'Static task preview. Exploring workflow tabs requires the interactive course.'
      : /data-copy=/.test(opening) ? 'Select and copy this request text manually in the reading view.'
        : /data-action="expand"/.test(opening) ? 'All lessons are already shown in the reading view.'
          : 'This control requires the interactive course.';
  let result = opening.slice(0, -1) + ` disabled aria-disabled="true" title="${esc(title)}">`;
  if (checkbox) result = result.replace(' role="checkbox"', '').replace(/ aria-checked="[^"]*"/, '').replace(/ aria-label="[^"]*"/, ' aria-hidden="true"');
  return result;
});
snapshot = snapshot.replace('aria-label="Explore the illustrative workflow"', 'aria-label="Static illustrative workflow; task preview"');
snapshot = snapshot.replace('From a clear brief to a change you can verify.</p>', 'From a clear brief to a change you can verify. Static preview; no commands run.</p>');
assert.equal(disabledCheckboxes, 60, 'Every completion control must be disabled in the snapshot.');
assert.equal(disabledTabs, 3, 'Every workbench tab must be disabled in the snapshot.');
assert.ok(!snapshot.includes('Saved in this browser') && !snapshot.includes('id="ring-fg"') && !snapshot.includes('href="#lesson/'), 'A live-progress or interactive-lesson hook leaked into the snapshot.');
assert.ok(!/<ul class="lessons a-lessons"[^>]*\bhidden\b/.test(snapshot), 'Every lesson list must be expanded without JavaScript.');
assert.equal([...snapshot.matchAll(/<ul class="lessons a-lessons"/g)].length, 10);
const linkedIds = new Set([...snapshot.matchAll(/href="assets\/reading\/(s\d{2}-\d{2})\.html"/g)].map(match => match[1]));
assert.deepEqual([...linkedIds].sort(), [...lessonIds].sort(), 'Every course lesson must have a static link.');
for (const id of linkedIds) assert.ok(fs.existsSync(path.join(root, 'assets', 'reading', id + '.html')), 'Build reading pages before the home snapshot.');
assert.equal([...snapshot.matchAll(/<button\b/g)].length, [...snapshot.matchAll(/<button\b[^>]*\sdisabled(?:\s|>)/g)].length, 'A JavaScript-only control remains enabled.');
assert.ok(!/url\(['"]?\/?assets\/icons\//.test(snapshot), 'Static mask icons must embed the licensed local SVGs to work at any deployment path.');

const aggregateSourceHash = sha(JSON.stringify(sourceHashes));
const innerHTML = `<div class="loading-state route-loading" role="status">Opening your learning workspace… <a href="assets/reading/index.html">Read the complete course</a></div>\n<!-- Generated by scripts/build-home-snapshot.mjs; source ${aggregateSourceHash}. -->\n${snapshot}\n<!-- End generated reading home. -->`;
const indexPath = path.join(root, 'index.html');
const before = fs.readFileSync(indexPath);
const original = before.toString('utf8');
assert.equal(Buffer.from(original).compare(before), 0, 'Index must be valid UTF-8 before bounded text replacement.');
const openings = [...original.matchAll(/<main\b[^>]*\bid=(["'])main-content\1[^>]*>/gi)];
assert.equal(openings.length, 1, 'Expected exactly one #main-content element.');
const innerStart = openings[0].index + openings[0][0].length;
const innerEnd = original.indexOf('</main>', innerStart);
assert.ok(innerEnd > innerStart, 'Could not locate the main closing tag.');
assert.ok(!/<main\b/i.test(original.slice(innerStart, innerEnd)), 'Nested main elements are not supported.');
const prefix = original.slice(0, innerStart);
const suffix = original.slice(innerEnd);
const updated = prefix + innerHTML + suffix;
if (checkOnly) {
  assert.equal(original.slice(innerStart, innerEnd), innerHTML, 'Home snapshot needs rebuilding.');
} else {
  const backupDir = path.join(os.tmpdir(), 'codex-howto-atelier-guard-20261022');
  fs.mkdirSync(backupDir, {recursive:true});
  const backupPath = path.join(backupDir, 'home-snapshot-before-index.html');
  if (!fs.existsSync(backupPath)) fs.writeFileSync(backupPath, before);
  fs.writeFileSync(indexPath, updated);
}
const actual = fs.readFileSync(indexPath, 'utf8');
assert.equal(actual.slice(0, innerStart), prefix, 'Content before main was changed.');
assert.equal(actual.slice(actual.length - suffix.length), suffix, 'Content after main was changed.');
for (const file of sourceFiles) assert.equal(sha(fs.readFileSync(path.join(root, file))), sourceHashes[file], 'Snapshot source changed during generation.');
const evidence = {
  schemaVersion:1,
  checkedAtUtc:new Date().toISOString(),
  command:checkOnly ? 'node scripts/build-home-snapshot.mjs --check' : 'node scripts/build-home-snapshot.mjs',
  status:'verified',
  scope:'Server-readable home snapshot and static lesson entry points; not full interaction parity without JavaScript.',
  modules:modules.length,
  lessons:lessons.length,
  practiceProjects:labs.length,
  expandedModules:10,
  uniqueStaticLessonLinks:linkedIds.size,
  disabledButtons,
  disabledCheckboxes,
  disabledWorkbenchTabs:disabledTabs,
  snapshotSha256:sha(innerHTML),
  indexSha256:sha(actual),
  prefixSha256:sha(prefix),
  suffixSha256:sha(suffix),
  outsideMainUnchanged:true,
  sourceHashes,
  aggregateSourceHash,
  caveats:[
    'The snapshot does not read saved progress and does not claim completion or saved state.',
    'The app replaces this home snapshot when JavaScript boots; interactive progress and quiz semantics remain owned by app.js.',
    'Workbench tabs, completion checkboxes, assessment, copy and disclosure controls are disabled; every curriculum lesson is expanded.',
    'Language links open the existing Markdown introductions; detailed lessons link to static English HTML.',
    'Header and footer lie outside this bounded edit. Their JavaScript routes and controls were not changed by this generator.',
    'Generation, link inventory and byte boundaries were checked; JavaScript-disabled visual and keyboard review remains separate.',
  ],
};
fs.mkdirSync(path.join(root, 'evidence'), {recursive:true});
const reportDir=fs.mkdtempSync(path.join(root, 'evidence', 'home-snapshot-'));
fs.writeFileSync(path.join(reportDir, 'report.json'), JSON.stringify(evidence, null, 2) + '\n');
process.stdout.write(JSON.stringify({status:evidence.status, mode:checkOnly?'check':'build', modules:10, lessons:60, staticLessonLinks:linkedIds.size, disabledButtons, outsideMainUnchanged:true, snapshotBytes:Buffer.byteLength(innerHTML)}) + '\n');
