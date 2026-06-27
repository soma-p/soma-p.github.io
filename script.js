/* Pranav Soma - portfolio interactions (vanilla, light, reduced-motion safe) */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (location.search.includes('shot')) {
    document.documentElement.classList.add('shotmode');
    const um = /up=(\d+)/.exec(location.search);
    if (um) { const m = $('main') || document.body; m.style.transform = 'translateY(-' + um[1] + 'px)'; }
  }

  /* nav: shadow + mobile menu */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  const toggle = $('#navToggle'), links = $('#navLinks');
  toggle?.addEventListener('click', () => links.classList.toggle('open'));
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

  /* scroll progress bar */
  const prog = $('#progress');
  const onProg = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    if (prog) prog.style.width = (p * 100) + '%';
  };
  onProg(); addEventListener('scroll', onProg, { passive: true });

  /* reveal on scroll */
  const io = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  setTimeout(() => $$('.reveal:not(.in)').forEach(el => el.classList.add('in')), 2400);

  /* interlude word reveal (staggered) */
  const iio = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const ws = $$('.w', e.target);
      ws.forEach((w, i) => { w.style.transitionDelay = (i * 0.045) + 's'; });
      e.target.classList.add('in');
      iio.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  $$('.ilude').forEach(el => { if (reduce) el.classList.add('in'); else iio.observe(el); });

  /* count-up metrics */
  const fmt = (v, dec, comma) => {
    let s = dec ? v.toFixed(dec) : Math.round(v).toString();
    if (comma) s = Number(s).toLocaleString('en-US');
    return s;
  };
  const run = (el) => {
    const target = Number.parseFloat(el.dataset.count);
    const dec = Number.parseInt(el.dataset.dec || '0', 10);
    const comma = el.dataset.comma === '1';
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const done = () => { el.textContent = pre + fmt(target, dec, comma) + suf; };
    if (reduce) return done();
    const t0 = performance.now(), dur = 1500;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + fmt(target * e, dec, comma) + suf;
      if (k < 1) requestAnimationFrame(tick); else done();
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('.n[data-count]').forEach(el => cio.observe(el));

  /* click-to-copy email */
  const el = $('#emailLink');
  el?.addEventListener('click', (ev) => {
    if (!navigator.clipboard) return;
    ev.preventDefault();
    navigator.clipboard.writeText(el.dataset.email).then(() => {
      const old = el.textContent; el.textContent = 'Copied to clipboard';
      setTimeout(() => { el.textContent = old; }, 1500);
    }).catch(() => { location.href = 'mailto:' + el.dataset.email; });
  });
})();
