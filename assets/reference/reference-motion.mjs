/*
 * Source-derived landing interactions, adapted for the Codex route lifecycle.
 * Upstream: luongnv89/claude-howto, commit
 * 188f468893231cbe4525f45e657d554746232072,
 * scripts/website_templates/landing.js (MIT, copyright 2024 luongnv89).
 * Full notice: assets/reference/SOURCE-NOTICE.md.
 * The course model owns progress, disclosures, theme choice and navigation.
 * This module only presents their existing state and runs the illustration.
 */

let activeMount = null;

function elementsWithin(scope, selector) {
  return [
    ...(scope.matches?.(selector) ? [scope] : []),
    ...scope.querySelectorAll(selector),
  ];
}

function rememberAttribute(element, name, cleanups) {
  const previous = element.getAttribute(name);
  cleanups.push(() => previous === null
    ? element.removeAttribute(name)
    : element.setAttribute(name, previous));
}

function listen(target, event, callback, cleanups, options) {
  target.addEventListener(event, callback, options);
  cleanups.push(() => target.removeEventListener(event, callback, options));
}

function makeReveals(scope, context) {
  const { win, preference, cleanups } = context;
  const nodes = elementsWithin(scope, '.reveal');
  let observer = null;
  let disposed = false;

  function reveal(node, instant = false) {
    if (disposed) return;
    if (instant) node.dataset.referenceInstant = 'true';
    node.classList.add('in');
    observer?.unobserve(node);
  }

  if (!preference.matches && win.IntersectionObserver) {
    observer = new win.IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    nodes.forEach(node => {
      // Previously revealed rows stay visible during a state-only repaint.
      if (!node.classList.contains('in')) observer.observe(node);
    });
  } else {
    nodes.forEach(node => reveal(node, true));
  }

  function onFocus(event) {
    nodes.forEach(node => {
      if (node.contains(event.target)) reveal(node, true);
    });
  }

  function onPreference() {
    if (!preference.matches) return;
    nodes.forEach(node => reveal(node, true));
    observer?.disconnect();
  }

  listen(scope, 'focusin', onFocus, cleanups, true);
  cleanups.push(() => {
    disposed = true;
    observer?.disconnect();
    // Route disposal must never leave a visible route hidden if retained.
    nodes.forEach(node => node.classList.add('in'));
  });
  return { onPreference };
}

function makeTrack(scope, context) {
  const { win, cleanups } = context;
  const subway = scope.querySelector('#subway');
  const fill = subway?.querySelector('#track-fill');
  if (!subway || !fill) return;
  let frame = null;
  let disposed = false;

  function paint() {
    frame = null;
    if (disposed || !subway.isConnected) return;
    const rect = subway.getBoundingClientRect();
    if (!rect.height) return;
    let statusProgress = 0;
    subway.querySelectorAll('.station[data-status]').forEach(station => {
      if (['not-started', 'new'].includes(station.dataset.status)) return;
      const node = station.querySelector('.node') || station;
      const offset = node.getBoundingClientRect().top - rect.top;
      if (offset > 0) statusProgress = Math.max(statusProgress, Math.min(1, offset / rect.height));
    });
    const scrollProgress = Math.min(1, Math.max(0, (win.innerHeight * .8 - rect.top) / rect.height));
    fill.style.height = `${Math.max(scrollProgress, statusProgress) * 100}%`;
  }

  function schedule() {
    if (!disposed && frame === null) frame = win.requestAnimationFrame(paint);
  }

  listen(win, 'scroll', schedule, cleanups, { passive: true });
  listen(win, 'resize', schedule, cleanups);
  listen(scope, 'reference-progress', schedule, cleanups);
  if (win.ResizeObserver) {
    const resize = new win.ResizeObserver(schedule);
    resize.observe(subway);
    cleanups.push(() => resize.disconnect());
  }
  const mutation = new win.MutationObserver(schedule);
  mutation.observe(subway, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-status', 'hidden', 'aria-expanded'],
    childList: true,
  });
  cleanups.push(() => mutation.disconnect());
  cleanups.push(() => {
    disposed = true;
    if (frame !== null) win.cancelAnimationFrame(frame);
  });
  paint();
}

function makeInitialRing(scope, context) {
  const { win, preference, cleanups } = context;
  const ring = scope.querySelector('#ring-fg[data-progress]');
  if (!ring || preference.matches) return;
  const target = Number(ring.dataset.progress);
  if (!Number.isFinite(target) || target <= 0 || target > 100) return;
  const circumference = 2 * Math.PI * Number(ring.getAttribute('r') || 52);
  ring.style.strokeDashoffset = String(circumference);
  // Commit the source's initial empty stroke before applying the saved value.
  ring.getBoundingClientRect();
  const frame = win.requestAnimationFrame(() => {
    const latest = Number(ring.dataset.progress);
    ring.style.strokeDashoffset = String(circumference * (1 - Math.min(100, Math.max(0, latest)) / 100));
  });
  cleanups.push(() => win.cancelAnimationFrame(frame));
}

function makeTerminal(scope, context) {
  const { win, doc, preference, cleanups } = context;
  const terminal = scope.querySelector('#terminal');
  if (!terminal) return null;
  const frame = terminal.closest('.term') || terminal;
  const panel = terminal.closest('.hero-term') || frame.parentElement;
  const control = panel?.querySelector('[data-terminal-control]');
  const lines = [...terminal.querySelectorAll('.t-line')].map(line => {
    const textNode = line.querySelector('.t-tt');
    const text = textNode?.textContent || '';
    const characters = win.Intl?.Segmenter
      ? [...new win.Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(part => part.segment)
      : Array.from(text);
    return { line, textNode, text, characters, initialVisibility: line.style.visibility };
  });
  if (!lines.length) return null;

  let timer = null;
  let scheduledAt = 0;
  let remaining = 0;
  let actions = [];
  let actionIndex = 0;
  let userPaused = false;
  let finished = false;
  let disposed = false;
  let generation = 0;
  const ownCleanups = [];
  rememberAttribute(frame, 'data-terminal-state', ownCleanups);

  const originalControlText = control?.textContent;
  const originalControlDisabled = control?.disabled;
  if (control) {
    for (const name of ['aria-label', 'aria-pressed', 'title']) rememberAttribute(control, name, ownCleanups);
  }

  let transcript = panel?.querySelector('[data-terminal-transcript]');
  if (!transcript && panel) {
    transcript = doc.createElement('p');
    transcript.className = 'sr-only';
    transcript.dataset.terminalTranscript = '';
    transcript.textContent = `Illustration only; no commands run. ${lines.map(item => item.line.textContent.trim()).join(' ')}`;
    panel.append(transcript);
    ownCleanups.push(() => transcript.remove());
  }
  if (transcript) {
    lines.forEach(item => {
      rememberAttribute(item.line, 'aria-hidden', ownCleanups);
      item.line.setAttribute('aria-hidden', 'true');
    });
  }

  function updateControl() {
    frame.dataset.terminalState = preference.matches
      ? 'reduced'
      : userPaused || doc.hidden ? 'paused' : finished ? 'complete' : 'running';
    if (!control) return;
    const label = preference.matches
      ? 'Motion off'
      : finished ? 'Replay illustration'
        : userPaused ? 'Resume illustration' : 'Pause illustration';
    control.textContent = label;
    control.setAttribute('aria-label', preference.matches
      ? 'Illustration complete. Reduced motion is enabled.' : label);
    control.removeAttribute('aria-pressed');
    control.disabled = preference.matches;
    if (preference.matches) control.title = 'All steps are shown because reduced motion is enabled.';
    else control.removeAttribute('title');
  }

  function stop(preserveRemaining = false) {
    if (timer === null) return;
    win.clearTimeout(timer);
    timer = null;
    if (preserveRemaining) remaining = Math.max(0, remaining - (win.performance.now() - scheduledAt));
  }

  function schedule() {
    if (disposed || userPaused || doc.hidden || preference.matches || timer !== null || !actions[actionIndex]) return;
    scheduledAt = win.performance.now();
    timer = win.setTimeout(() => {
      timer = null;
      if (disposed || userPaused || doc.hidden || preference.matches) return;
      const currentGeneration = generation;
      const action = actions[actionIndex++];
      action.run();
      if (generation !== currentGeneration || disposed) return;
      remaining = Math.max(0, (actions[actionIndex]?.at || action.at) - action.at);
      schedule();
    }, remaining);
  }

  function showComplete() {
    stop();
    generation++;
    finished = true;
    userPaused = false;
    lines.forEach(item => {
      item.line.style.visibility = 'visible';
      item.line.classList.remove('t-caret');
      if (item.textNode) {
        item.textNode.textContent = item.text;
        item.textNode.classList.remove('t-typing');
      }
    });
    updateControl();
  }

  function start() {
    stop();
    generation++;
    if (preference.matches) { showComplete(); return; }
    userPaused = false;
    finished = false;
    actions = [];
    actionIndex = 0;
    let at = 350;
    lines.forEach(item => {
      item.line.style.visibility = 'hidden';
      item.line.classList.remove('t-caret');
      if (item.textNode) {
        item.textNode.textContent = '';
        item.textNode.classList.remove('t-typing');
        const startAt = at;
        for (let count = 0; count <= item.characters.length; count++) {
          actions.push({ at: startAt + count * 38, run: () => {
            item.line.style.visibility = 'visible';
            item.textNode.textContent = item.characters.slice(0, count).join('');
            item.textNode.classList.add('t-typing');
          } });
        }
        at += item.characters.length * 38 + 420;
        actions.push({ at: at - 380, run: () => item.textNode.classList.remove('t-typing') });
      } else {
        actions.push({ at, run: () => { item.line.style.visibility = 'visible'; } });
        at += 260;
      }
    });
    actions.push({ at, run: () => {
      const last = lines.at(-1);
      if (last?.textNode) last.line.classList.add('t-caret');
      finished = true;
      updateControl();
    } });
    // Preserve the source's quiet hold and loop, with an explicit replay action.
    actions.push({ at: at + 6500, run: start });
    actions.sort((a, b) => a.at - b.at);
    remaining = actions[0].at;
    updateControl();
    schedule();
  }

  function onControl() {
    if (disposed || preference.matches) return;
    if (finished) { start(); return; }
    userPaused = !userPaused;
    if (userPaused) stop(true);
    else schedule();
    updateControl();
  }

  function onVisibility() {
    if (doc.hidden) stop(true);
    else schedule();
    updateControl();
  }

  function onPreference() {
    if (preference.matches) showComplete();
    else updateControl(); // A preference change does not unexpectedly restart it.
  }

  if (control) listen(control, 'click', onControl, ownCleanups);
  listen(doc, 'visibilitychange', onVisibility, ownCleanups);
  cleanups.push(() => {
    disposed = true;
    generation++;
    stop();
    ownCleanups.reverse().forEach(cleanup => cleanup());
    lines.forEach(item => {
      item.line.style.visibility = item.initialVisibility;
      item.line.classList.remove('t-caret');
      if (item.textNode) {
        item.textNode.textContent = item.text;
        item.textNode.classList.remove('t-typing');
      }
    });
    if (control) {
      control.textContent = originalControlText;
      control.disabled = originalControlDisabled;
    }
  });
  start();
  return { onPreference };
}

/** Mount after home markup is present; safe to replace on every route render. */
export function mountReferenceMotion(scope = document) {
  disposeReferenceMotion();
  const doc = scope.nodeType === 9 ? scope : scope.ownerDocument;
  const win = doc?.defaultView;
  if (!win || !scope.querySelectorAll) return () => {};
  const preference = win.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanups = [];
  const context = { win, doc, preference, cleanups };
  doc.documentElement.classList.add('js');
  const instances = [makeReveals(scope, context), makeTerminal(scope, context)].filter(Boolean);
  makeTrack(scope, context);
  makeInitialRing(scope, context);
  const onPreference = () => instances.forEach(instance => instance.onPreference());
  listen(preference, 'change', onPreference, cleanups);
  const mount = { cleanups };
  activeMount = mount;
  return () => {
    if (activeMount === mount) disposeReferenceMotion();
  };
}

/** Clean timers, animation frames, observers and listeners before replacing DOM. */
export function disposeReferenceMotion() {
  const mount = activeMount;
  activeMount = null;
  mount?.cleanups.reverse().forEach(cleanup => cleanup());
}

/** Wrap the existing theme mutation; the course remains the storage owner. */
export function animateReferenceTheme(changeTheme, doc = document) {
  const win = doc.defaultView;
  const root = doc.documentElement;
  const reduced = win?.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    root.classList.add('theme-anim');
    win.setTimeout(() => root.classList.remove('theme-anim'), 350);
  }
  changeTheme();
}
