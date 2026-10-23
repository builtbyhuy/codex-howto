// Original course illustration, based on the bundled Orbit Notes practice files.
// This component never executes code, contacts Codex or changes course progress.
import {arrive} from './interactions.mjs';
let nextInstance = 0;
const mounted = new Set();
const arrow = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>';
const tick = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m3.5 8 3 3 6-6"/></svg>';
const file = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M4 2.5h5l3 3v8H4zM9 2.5v3h3"/></svg>';

export function renderWorkbench() {
  const prefix = `atelier-workbench-${++nextInstance}`;
  const tab = (name, index) => `<button type="button" role="tab" id="${prefix}-${name.toLowerCase()}-tab" aria-controls="${prefix}-${name.toLowerCase()}-panel" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-workbench-tab="${name.toLowerCase()}"><span class="wb-tab-index">0${index + 1}</span>${name}${index < 2 ? arrow : ''}</button>`;
  const panel = (name, body, active = false) => `<section class="wb-panel" role="tabpanel" id="${prefix}-${name}-panel" aria-labelledby="${prefix}-${name}-tab" tabindex="0" data-workbench-panel="${name}" ${active ? '' : 'hidden'}>${body}</section>`;
  return `<div class="atelier-workbench" data-workbench>
    <div class="wb-stage-label"><span class="wb-stage-marker" aria-hidden="true"></span>A small task. A complete workflow.</div>
    <div class="wb-window">
      <div class="wb-titlebar"><div class="wb-window-dots" aria-hidden="true"><i></i><i></i><i></i></div><span>Orbit Notes</span><span class="wb-project-tag">Practice project</span></div>
      <div class="wb-tabs" role="tablist" aria-label="Explore the illustrative workflow">${['Task', 'Change', 'Check'].map(tab).join('')}</div>
      <div class="wb-panels">
        ${panel('task', `<div class="wb-task-layout"><aside class="wb-file-tree" aria-label="Example project files"><p>EXPLORER</p><div class="wb-folder">${arrow}<span>orbit-notes</span></div><span>${file}AGENTS.md</span><span>${file}checks.cjs</span><span class="wb-tree-active">${file}notes.cjs</span><span>${file}notes.json</span></aside><div class="wb-task-main"><span class="wb-overline">Your task</span><h3>Fix the search.<br>Keep the notes.</h3><p>Make search ignore case and surrounding spaces. Preserve every note and its order.</p><div class="wb-context"><span>${file}AGENTS.md</span><span>4 sample notes</span></div><div class="wb-task-boundary">Read the project before editing.</div></div></div>`, true)}
        ${panel('change', `<div class="wb-change-main"><div class="wb-file-heading">${file}<strong>notes.cjs</strong><span>1 focused change</span></div><div class="wb-diff" role="region" aria-label="Illustrative code change from the bundled reference" tabindex="0"><pre><code><span class="wb-code-neutral"> function searchNotes(notes, query) {</span><span class="wb-code-remove">−  return notes.filter(note =&gt; note.title.includes(query));</span><span class="wb-code-add">+  const needle = query.trim().toLowerCase();</span><span class="wb-code-add">+  return notes.filter(note =&gt; note.title.toLowerCase().includes(needle));</span><span class="wb-code-neutral"> }</span></code></pre></div><div class="wb-change-caption">${tick}<span>Normalize the query. Keep the original objects and order.</span></div></div>`)}
        ${panel('check', `<div class="wb-check-main"><div class="wb-check-heading"><span class="wb-result-mark" aria-hidden="true">${tick}</span><div><span class="wb-overline">Reference result</span><h3>Small change.<br>Six checks passed.</h3></div></div><div class="wb-check-command"><span aria-hidden="true">$</span><code>node --test checks.cjs</code></div><div class="wb-check-metrics" aria-label="Reference test summary: six tests, six passed, zero failed"><div><strong>6</strong><span>tests</span></div><div><strong>6</strong><span>passed</span></div><div><strong>0</strong><span>failed</span></div></div><p class="wb-check-scope">Blank queries, case, spaces, substrings, absent terms, and preserved data.</p></div>`)}
      </div>
      <div class="wb-statusbar"><span><i aria-hidden="true"></i>Illustrative workflow · no commands run</span><a href="#lesson/s01-01">Try the first lesson ${arrow}</a></div>
    </div>
    <p class="wb-stage-caption">From a clear brief to a change you can verify.</p>
  </div>`;
}

export function mountWorkbench(scope = document) {
  disposeWorkbench();
  const roots = [...scope.querySelectorAll('[data-workbench]')];
  if (scope.matches?.('[data-workbench]')) roots.unshift(scope);
  for (const root of roots) {
    const tabs = [...root.querySelectorAll('[data-workbench-tab]')];
    const panels = [...root.querySelectorAll('[data-workbench-panel]')];
    function activate(tab, focus = false) {
      if (!tab || !tabs.includes(tab)) return;
      const selected = tab.dataset.workbenchTab;
      if (tab.getAttribute('aria-selected') === 'true') {
        if (focus) tab.focus();
        return;
      }
      for (const button of tabs) {
        const active = button === tab;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      }
      for (const panel of panels) {
        panel.hidden = panel.dataset.workbenchPanel !== selected;
        panel.inert=panel.hidden;
        panel.classList.remove('wb-enter');
        panel.getAnimations().forEach(a=>a.cancel());
        if(!panel.hidden&&!focus)arrive(panel,{distance:3,duration:160,opacity:.8});
      }
      if (focus) tab.focus();
    }
    const click = event => {
      const tab = event.target.closest('[data-workbench-tab]');
      if (tab && root.contains(tab)) activate(tab);
    };
    const keydown = event => {
      const tab = event.target.closest('[data-workbench-tab]');
      if (!tab || !tabs.includes(tab)) return;
      const index = tabs.indexOf(tab);
      const next = event.key === 'ArrowRight' ? tabs[(index + 1) % tabs.length]
        : event.key === 'ArrowLeft' ? tabs[(index + tabs.length - 1) % tabs.length]
        : event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : null;
      if (next) { event.preventDefault(); activate(next, true); }
    };
    root.addEventListener('click', click);
    root.addEventListener('keydown', keydown);
    mounted.add(() => {
      root.removeEventListener('click', click);
      root.removeEventListener('keydown', keydown);
    });
  }
}

export function disposeWorkbench() {
  for (const dispose of mounted) dispose();
  mounted.clear();
}
