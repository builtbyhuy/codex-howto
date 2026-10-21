// Original motion for the course. The hero is an illustration, never a Codex run.
let activeMount = null;

function within(scope, selector) {
  return [...(scope.matches?.(selector) ? [scope] : []), ...scope.querySelectorAll(selector)];
}

function rememberAttribute(element, name, cleanups) {
  const previous = element.getAttribute(name);
  cleanups.push(() => previous === null ? element.removeAttribute(name) : element.setAttribute(name, previous));
}

function makeDemo(element, context) {
  const input = element.querySelector('[data-demo-input]');
  const steps = [...element.querySelectorAll('[data-demo-step]')];
  const result = element.querySelector('[data-demo-result]');
  const control = element.querySelector('[data-demo-control]');
  if (!input || !steps.length || !result || !control) return null;

  const { win, doc, preference, cleanups } = context;
  const fullText = input.dataset.text || input.textContent;
  const originalText = input.textContent;
  const originalMinHeight = input.style.minHeight;
  const originalControlText = control.textContent;
  const originalDisabled = control.disabled;
  const characters = win.Intl?.Segmenter
    ? [...new win.Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(fullText)].map(part => part.segment)
    : Array.from(fullText);
  const ownCleanups = [];
  let disposed = false;
  let timer = null;
  let scheduledAt = 0;
  let remaining = 0;
  let actions = [];
  let actionIndex = 0;
  let userPaused = false;
  let finished = false;
  let lastWidth = 0;

  for (const name of ['data-demo-ready', 'data-motion-state', 'data-demo-phase']) rememberAttribute(element, name, ownCleanups);
  for (const name of ['aria-label', 'aria-pressed', 'title']) rememberAttribute(control, name, ownCleanups);
  for (const node of [input, ...steps, result]) rememberAttribute(node, 'aria-hidden', ownCleanups);
  rememberAttribute(input, 'data-demo-typing', ownCleanups);
  for (const node of [...steps, result]) {
    rememberAttribute(node, 'data-state', ownCleanups);
    rememberAttribute(node, 'data-demo-visible', ownCleanups);
  }

  // Screen readers receive the complete sequence, not every typed character.
  let transcript = element.querySelector('[data-demo-transcript]');
  if (!transcript) {
    transcript = doc.createElement('p');
    transcript.className = 'motion-transcript';
    transcript.dataset.demoTranscript = '';
    transcript.textContent = `Illustration only; no commands run. ${fullText} ${steps.map(step => step.textContent.trim()).join(' ')} ${result.textContent.trim()}`;
    element.append(transcript);
    ownCleanups.push(() => transcript.remove());
  }
  [input, ...steps, result].forEach(node => node.setAttribute('aria-hidden', 'true'));
  element.dataset.demoReady = 'true';

  function reserveInputHeight() {
    if (disposed || !input.isConnected) return;
    const width = input.getBoundingClientRect().width;
    if (width <= 0) return;
    const current = input.textContent;
    input.style.minHeight = originalMinHeight;
    input.textContent = fullText;
    const box = win.getComputedStyle(input);
    const inset = box.boxSizing === 'border-box' ? 0 : ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((sum, property) => sum + (parseFloat(box[property]) || 0), 0);
    const height = input.getBoundingClientRect().height - inset;
    input.textContent = current;
    if (height > 0) input.style.minHeight = `${Math.ceil(height)}px`;
    lastWidth = width;
  }

  function updateControl() {
    if (disposed) return;
    const reduced = preference.matches;
    const label = reduced ? 'Motion off' : finished ? 'Replay illustration' : userPaused ? 'Resume illustration' : 'Pause illustration';
    control.textContent = label;
    control.setAttribute('aria-label', reduced ? 'Illustration complete. Reduced motion is enabled.' : label);
    control.disabled = reduced;
    // This is a three-state action button, not a pressed/unpressed toggle.
    control.removeAttribute('aria-pressed');
    if (reduced) control.title = 'All steps are shown because reduced motion is enabled.';
    else control.removeAttribute('title');
    element.dataset.motionState = finished ? 'finished' : userPaused || doc.hidden ? 'paused' : 'running';
  }

  function stopClock(preserveRemaining = false) {
    if (timer !== null) {
      win.clearTimeout(timer);
      timer = null;
      if (preserveRemaining) remaining = Math.max(0, remaining - (win.performance.now() - scheduledAt));
    }
  }

  function schedule() {
    if (disposed || finished || userPaused || doc.hidden || preference.matches || timer !== null) return;
    scheduledAt = win.performance.now();
    timer = win.setTimeout(() => {
      timer = null;
      if (disposed || finished || userPaused || doc.hidden || preference.matches) return;
      const action = actions[actionIndex++];
      if (!action) return;
      action.run();
      if (!finished) {
        remaining = actions[actionIndex]?.delay || 0;
        schedule();
      }
    }, remaining);
  }

  function showComplete() {
    stopClock();
    finished = true;
    userPaused = false;
    input.textContent = fullText;
    input.dataset.demoTyping = 'false';
    steps.forEach(step => { step.dataset.state = 'done'; step.dataset.demoVisible = 'true'; });
    result.dataset.state = 'done';
    result.dataset.demoVisible = 'true';
    element.dataset.demoPhase = 'complete';
    updateControl();
  }

  function start() {
    stopClock();
    if (preference.matches) { showComplete(); return; }
    finished = false;
    userPaused = false;
    actionIndex = 0;
    input.dataset.demoTyping = 'true';
    reserveInputHeight();
    input.textContent = '';
    steps.forEach(step => { step.dataset.state = 'pending'; step.dataset.demoVisible = 'false'; });
    result.dataset.state = 'pending';
    result.dataset.demoVisible = 'false';
    element.dataset.demoPhase = 'typing';
    actions = characters.map((_, index) => ({
      delay: index === 0 ? 360 : 30,
      run: () => { input.textContent = characters.slice(0, index + 1).join(''); }
    }));
    actions.push({ delay: 330, run: () => {
      input.dataset.demoTyping = 'false';
      element.dataset.demoPhase = 'activity';
      steps[0].dataset.state = 'active';
      steps[0].dataset.demoVisible = 'true';
    } });
    for (let index = 1; index < steps.length; index++) actions.push({
      delay: 850,
      run: () => {
        steps[index - 1].dataset.state = 'done';
        steps[index].dataset.state = 'active';
        steps[index].dataset.demoVisible = 'true';
      }
    });
    actions.push({ delay: 900, run: showComplete });
    remaining = actions[0]?.delay || 0;
    updateControl();
    schedule();
  }

  function onControl() {
    if (disposed || preference.matches) return;
    if (finished) { start(); return; }
    userPaused = !userPaused;
    if (userPaused) stopClock(true);
    else schedule();
    updateControl();
  }
  function onVisibility() {
    if (disposed || finished) return;
    if (doc.hidden) stopClock(true);
    else schedule();
    updateControl();
  }
  function onPreference() {
    if (preference.matches) showComplete();
    else updateControl(); // Changing preference never restarts a finished animation.
  }
  control.addEventListener('click', onControl);
  doc.addEventListener('visibilitychange', onVisibility);
  ownCleanups.push(() => control.removeEventListener('click', onControl));
  ownCleanups.push(() => doc.removeEventListener('visibilitychange', onVisibility));

  if (win.ResizeObserver) {
    const resize = new win.ResizeObserver(() => {
      if (!disposed && Math.abs(input.getBoundingClientRect().width - lastWidth) > 1) reserveInputHeight();
    });
    resize.observe(input);
    ownCleanups.push(() => resize.disconnect());
  } else {
    win.addEventListener('resize', reserveInputHeight);
    ownCleanups.push(() => win.removeEventListener('resize', reserveInputHeight));
  }
  doc.fonts?.ready.then(() => { if (!disposed) reserveInputHeight(); });
  start();

  cleanups.push(() => {
    disposed = true;
    stopClock();
    ownCleanups.reverse().forEach(cleanup => cleanup());
    input.textContent = originalText;
    input.style.minHeight = originalMinHeight;
    control.textContent = originalControlText;
    control.disabled = originalDisabled;
  });
  return { onPreference };
}

function makeReveals(scope, context) {
  const { win, doc, preference, cleanups } = context;
  const nodes = within(scope, '[data-reveal]').filter(node => !node.closest('.lesson, .lesson-reader, .reader-body, [data-reading-content]'));
  let observer = null;
  let disposed = false;
  function reveal(node, instant = false) {
    if (disposed) return;
    if (instant) node.dataset.revealInstant = 'true';
    node.dataset.revealState = 'visible';
    observer?.unobserve(node);
  }
  for (const node of nodes) {
    for (const name of ['data-reveal-state', 'data-reveal-instant']) rememberAttribute(node, name, cleanups);
  }
  if (!preference.matches && win.IntersectionObserver) {
    observer = new win.IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
    }, { threshold: 0.04, rootMargin: '0px 0px -24px 0px' });
    nodes.forEach(node => {
      const bounds = node.getBoundingClientRect();
      const focused = node.contains(doc.activeElement);
      if (focused || (bounds.top < win.innerHeight && bounds.bottom > 0)) reveal(node, true);
      else { node.dataset.revealState = 'pending'; observer.observe(node); }
    });
  } else nodes.forEach(node => reveal(node, true));

  function onFocus(event) {
    for (const node of nodes) if (node.contains(event.target)) reveal(node, true);
  }
  function onPreference() {
    if (preference.matches) {
      nodes.forEach(node => reveal(node, true));
      observer?.disconnect();
    }
  }
  // A keyboard focus must never land on an invisible interactive element.
  scope.addEventListener('focusin', onFocus, true);
  cleanups.push(() => { disposed = true; observer?.disconnect(); scope.removeEventListener('focusin', onFocus, true); });
  return { onPreference };
}

/** Mount after a route's DOM is in place. Calling again safely replaces the mount. */
export function mountCourseMotion(scope = document) {
  disposeCourseMotion();
  const doc = scope.nodeType === 9 ? scope : scope.ownerDocument;
  const win = doc?.defaultView;
  if (!win || !scope.querySelectorAll) return () => {};
  const preference = win.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanups = [];
  const context = { win, doc, preference, cleanups };
  const instances = within(scope, '.session-demo[data-demo]').map(node => makeDemo(node, context)).filter(Boolean);
  instances.push(makeReveals(scope, context));
  const onPreference = () => instances.forEach(instance => instance.onPreference());
  preference.addEventListener('change', onPreference);
  cleanups.push(() => preference.removeEventListener('change', onPreference));
  const mount = { cleanups };
  activeMount = mount;
  return () => { if (activeMount === mount) disposeCourseMotion(); };
}

/** Cancel timers/listeners/observers before replacing route content. */
export function disposeCourseMotion() {
  const current = activeMount;
  activeMount = null;
  current?.cleanups.reverse().forEach(cleanup => cleanup());
}
