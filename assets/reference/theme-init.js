// Apply the retained theme before styles paint. No account or Codex settings.
(()=>{let dark=false;try{const saved=localStorage.getItem('codex-howto-theme-v1');dark=saved?saved==='dark':matchMedia('(prefers-color-scheme: dark)').matches;}catch{}document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.classList.toggle('dark',dark);document.documentElement.classList.add('js');})();
// A deferred module must not briefly paint the home at a lesson/guide URL.
// With JavaScript disabled this class is absent and the reading home stays usable.
(()=>{const path=location.hash.slice(1).split('?')[0];if(!['','roadmap','path','why','vs-docs','get-started','languages','main-content'].includes(path))document.documentElement.classList.add('boot-deep-link');})();
