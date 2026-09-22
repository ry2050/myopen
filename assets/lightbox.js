/* ─────────────────────────────────────────────────────────────
   Screenshot lightbox

   Opt-in: a page gets this behaviour by loading lightbox.css and
   this file. It reads the existing .screenshot-rail markup and
   adds nothing to the HTML, so the rail still works with JS off.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var rail = document.querySelector('.screenshot-rail');
  if (!rail) return;

  var shots = [].slice.call(rail.querySelectorAll('.shot-frame img'));
  if (!shots.length) return;

  var items = shots.map(function (img) {
    var fig = img.closest('figure');
    var title = fig && fig.querySelector('.shot-title');
    return {
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt') || '',
      title: title ? title.textContent.trim() : ''
    };
  });

  var lang = (document.documentElement.lang || 'en').toLowerCase();
  var zh = lang.indexOf('zh') === 0;
  var T = zh
    ? { close: '關閉', prev: '上一張', next: '下一張', of: '／', dialog: '放大檢視' }
    : { close: 'Close', prev: 'Previous', next: 'Next', of: ' / ', dialog: 'Enlarged screenshot' };

  var ICON = {
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    prev: '<path d="M15 5l-7 7 7 7"/>',
    next: '<path d="M9 5l7 7-7 7"/>'
  };

  function svg(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', T.dialog);
  box.innerHTML =
    '<button type="button" class="lightbox-btn lightbox-close" aria-label="' + T.close + '">' + svg(ICON.close) + '</button>' +
    '<button type="button" class="lightbox-btn lightbox-prev" aria-label="' + T.prev + '">' + svg(ICON.prev) + '</button>' +
    '<button type="button" class="lightbox-btn lightbox-next" aria-label="' + T.next + '">' + svg(ICON.next) + '</button>' +
    '<figure class="lightbox-figure">' +
    '  <img class="lightbox-img" alt="" />' +
    '  <figcaption>' +
    '    <p class="lightbox-caption"></p>' +
    '    <p class="lightbox-count"></p>' +
    '  </figcaption>' +
    '</figure>';
  document.body.appendChild(box);

  var imgEl = box.querySelector('.lightbox-img');
  var capEl = box.querySelector('.lightbox-caption');
  var cntEl = box.querySelector('.lightbox-count');
  var btnClose = box.querySelector('.lightbox-close');
  var btnPrev = box.querySelector('.lightbox-prev');
  var btnNext = box.querySelector('.lightbox-next');

  var index = 0;
  var lastFocus = null;

  function show(i) {
    index = (i + items.length) % items.length;
    var it = items[index];
    imgEl.src = it.src;
    imgEl.alt = it.alt;
    capEl.textContent = it.title;
    cntEl.textContent = (index + 1) + T.of + items.length;
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.classList.add('is-open');
    // 背景不要跟著捲
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function isOpen() {
    return box.classList.contains('is-open');
  }

  shots.forEach(function (img, i) {
    var frame = img.closest('.shot-frame') || img;
    frame.addEventListener('click', function () { open(i); });
    // 鍵盤可達：讓每張截圖本身可以 focus 並用 Enter/Space 打開
    frame.setAttribute('tabindex', '0');
    frame.setAttribute('role', 'button');
    frame.setAttribute('aria-label', items[i].title || items[i].alt);
    frame.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(i);
      }
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', function () { show(index - 1); });
  btnNext.addEventListener('click', function () { show(index + 1); });

  // 點背景關閉（點在圖或按鈕上不關）
  box.addEventListener('click', function (e) {
    if (e.target === box || e.target.classList.contains('lightbox-figure')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowLeft') { show(index - 1); return; }
    if (e.key === 'ArrowRight') { show(index + 1); return; }
    // 焦點留在對話框內
    if (e.key === 'Tab') {
      var f = [btnClose, btnPrev, btnNext];
      var at = f.indexOf(document.activeElement);
      e.preventDefault();
      var next = e.shiftKey ? at - 1 : at + 1;
      f[(next + f.length) % f.length].focus();
    }
  });

  // 觸控左右滑
  var startX = 0, startY = 0, tracking = false;
  box.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { tracking = false; return; }
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });

  box.addEventListener('touchend', function (e) {
    if (!tracking) return;
    tracking = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - startX;
    var dy = t.clientY - startY;
    // 只認明顯的水平動作，避免跟垂直捲動打架
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    show(dx < 0 ? index + 1 : index - 1);
  }, { passive: true });
})();
