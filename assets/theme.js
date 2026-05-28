/* myopen.app theme toggle.
   Stores 'light' | 'dark' in localStorage.
   Click toggles based on the current visual state. */
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

  // Apply saved preference before first paint to avoid a flash.
  apply(localStorage.getItem(KEY));

  function bind() {
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark' ||
        (!root.hasAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const upcoming = isDark ? 'light' : 'dark';
      localStorage.setItem(KEY, upcoming);
      apply(upcoming);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
