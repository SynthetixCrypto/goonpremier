(function () {
  'use strict';
  var root = document.documentElement;
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('nav-toggle');
  function closeMenu() {
    if (!nav || !toggle) return;
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('.nav-links a').forEach(function (link) { link.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); toggle.focus(); }
    });
    window.matchMedia('(min-width: 781px)').addEventListener('change', closeMenu);
  }
  var captions = {
    hud: '<strong>In game.</strong> Your map, inventory, gear and potion timers in one HUD.',
    menu: '<strong>Modules.</strong> Right Shift opens the menu. Click to toggle; right-click for settings.',
    settings: '<strong>HUD settings.</strong> Choose the panels you want, then open the editor to arrange them.'
  };
  var tabs = Array.from(document.querySelectorAll('.tab'));
  var viewer = document.getElementById('viewer');
  var caption = document.getElementById('caption');
  function select(tab, focus) {
    if (!viewer) return;
    var shot = tab.getAttribute('data-shot');
    tabs.forEach(function (t) { var active = t === tab; t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1; });
    viewer.querySelectorAll('.stage img').forEach(function (img) { img.classList.toggle('active', img.getAttribute('data-shot') === shot); });
    viewer.setAttribute('aria-labelledby', tab.id);
    caption.innerHTML = captions[shot] || '';
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
    tab.addEventListener('click', function () { select(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { e.preventDefault(); select(tabs[next], true); }
    });
  });
  var swatches = Array.from(document.querySelectorAll('.swatch'));
  var selectedTheme = 'Noir';
  function file(key, theme, size) { return 'assets/img/shot-' + key + (theme === 'Noir' ? '' : '-' + theme.toLowerCase()) + '-' + size + '.webp'; }
  function applyTheme(swatch) {
    var theme = swatch.getAttribute('data-theme');
    selectedTheme = theme;
    var color = swatch.style.getPropertyValue('--s1').trim();
    root.style.setProperty('--a1', color);
    root.style.setProperty('--a2', swatch.style.getPropertyValue('--s2'));
    var hex = color.replace('#', '');
    function channel(i) { var c = parseInt(hex.substr(i, 2), 16) / 255; return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }
    var luminance = .2126 * channel(0) + .7152 * channel(2) + .0722 * channel(4);
    root.style.setProperty('--on-accent', luminance > .179 ? '#101113' : '#fff');
    swatches.forEach(function (s) { s.setAttribute('aria-pressed', String(s === swatch)); });
    var name = document.getElementById('theme-name');
    if (name) name.textContent = theme;
    document.querySelectorAll('img[data-themed], img[data-theme-shot]').forEach(function (img) {
      var key = img.getAttribute('data-theme-shot') || img.getAttribute('data-shot');
      var src = file(key, theme, 1600);
      var srcset = file(key, theme, 800) + ' 800w, ' + src + ' 1600w';
      if (img.getAttribute('src') === src) return;
      var preload = new Image();
      preload.onload = function () {
        if (selectedTheme !== theme) return;
        img.srcset = srcset; img.src = src;
      };
      preload.src = src;
    });
    try { localStorage.setItem('goon-theme', theme); } catch (e) { /* Preview works without storage. */ }
  }
  swatches.forEach(function (swatch) { swatch.addEventListener('click', function () { applyTheme(swatch); }); });
  try {
    var saved = localStorage.getItem('goon-theme');
    var initial = swatches.find(function (s) { return s.getAttribute('data-theme') === saved; });
    if (initial) applyTheme(initial);
  } catch (e) { /* Use Noir. */ }
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
