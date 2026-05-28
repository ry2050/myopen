/* myopen.app theme toggle.
   Stores 'light' | 'dark' | null(=system) in localStorage.
   Click cycles: system → light → dark → system. */
(function () {
  const KEY = 'myopen-theme';
  const root = document.documentElement;

  function apply(pref) {
    if (pref === 'light' || pref === 'dark') {
      root.setAttribute('data-theme', pref);
    } else {
      root.removeAttribute('data-theme');
    }
  }

  // Read preference early (the inline boot script in <head> may have done this
  // already to avoid a flash — this is the fallback for pages that include the
  // script in body).
  apply(localStorage.getItem(KEY));

  function next(pref) {
    if (pref === null || pref === undefined) return 'light';
    if (pref === 'light') return 'dark';
    return null;                   // back to system
  }

  function bind() {
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const current = localStorage.getItem(KEY);
      const upcoming = next(current);
      if (upcoming === null) {
        localStorage.removeItem(KEY);
      } else {
        localStorage.setItem(KEY, upcoming);
      }
      apply(upcoming);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
