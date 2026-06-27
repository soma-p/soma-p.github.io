/* ============================================================
   PRANAV KUMAR SOMA — "FIELD INSTRUMENT" interactions
   Vanilla JS · one rAF loop · IntersectionObserver · reduced-motion safe
   ============================================================ */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // screenshot/print helper: ?shot reveals everything immediately; &y=N scrolls
  if (location.search.includes('shot')) {
    document.documentElement.classList.add('shotmode');
    const um = /up=(\d+)/.exec(location.search);
    if (um) {
      const m = document.querySelector('main');
      if (m) { m.style.transform = 'translateY(-' + um[1] + 'px)'; }
    }
  }

  /* ---------- nav shadow + mobile menu ---------- */
  const nav = $('#nav');
  const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  onScrollNav();
  addEventListener('scroll', onScrollNav, { passive: true });
  const toggle = $('#navToggle'), links = $('#navLinks');
  toggle?.addEventListener('click', () => links.classList.toggle('open'));
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  // safety net: never leave content hidden if IO misses (also aids print/headless)
  setTimeout(() => $$('.reveal:not(.in)').forEach(el => el.classList.add('in')), 2200);

  /* ---------- scroll progress: top bar + rail spine ---------- */
  const topbar = $('#topbar'), spine = $('#spineFill');
  const onProg = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    if (topbar) topbar.style.width = (p * 100) + '%';
    if (spine) spine.style.height = (p * 100) + '%';
  };
  onProg();
  addEventListener('scroll', onProg, { passive: true });

  /* ---------- section index / flag / ground ---------- */
  const railIndex = $('#railIndex'), railFlag = $('#railFlag');
  const sections = $$('[data-index]');
  const secObs = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (railIndex) railIndex.textContent = el.dataset.index || '00';
      if (railFlag) railFlag.textContent = el.dataset.flag || '';
      const ground = el.dataset.ground || 'paper';
      const dark = ground === 'slate';
      document.body.dataset.railDark = dark ? '1' : '';
      // invert custom cursor over slate
      cursor && cursor.style.setProperty('--c', dark ? '#F4EFE6' : '#E0512B');
    });
  }, { threshold: 0.5 });
  sections.forEach(s => secObs.observe(s));

  /* ---------- count-up metrics ---------- */
  const fmt = (v, dec, comma) => {
    let s = dec ? v.toFixed(dec) : Math.round(v).toString();
    if (comma) s = Number(s).toLocaleString('en-US');
    return s;
  };
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const comma = el.dataset.comma === '1';
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + fmt(target, dec, comma) + suf; return; }
    const dur = 1400, t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + fmt(target * e, dec, comma) + suf;
      if (k < 1) requestAnimationFrame(tick);
      else el.textContent = pre + fmt(target, dec, comma) + suf;
    };
    requestAnimationFrame(tick);
  };
  const countObs = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) { runCount(e.target); countObs.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('.num[data-count]').forEach(el => countObs.observe(el));

  /* ---------- live clock + telemetry ---------- */
  const clock = $('#clock'), telemetry = $('#telemetry');
  const tickClock = () => {
    try {
      const t = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'America/Los_Angeles' });
      if (clock) clock.textContent = t + ' PST';
      if (telemetry) telemetry.textContent = 'SAN DIEGO ⇄ SF BAY AREA · ' + t;
    } catch (_) {}
  };
  tickClock(); setInterval(tickClock, 1000);

  /* ---------- copy email ---------- */
  const ec = $('#emailCopy');
  ec?.addEventListener('click', async () => {
    const st = ec.querySelector('.ec-state');
    try { await navigator.clipboard.writeText(ec.dataset.email); st.textContent = 'COPIED ✓'; }
    catch (_) { st.textContent = ec.dataset.email; }
    setTimeout(() => { st.textContent = 'COPY'; }, 1800);
  });

  /* ---------- instrument cursor ---------- */
  const cursor = $('#cursor'), cread = $('#cursorRead');
  if (fine && !reduce && cursor) {
    document.body.classList.add('cursor-on');
    cursor.classList.add('on');
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const hotSel = 'a,button,.card,.trow,.g,.lead-card,.amb';
    addEventListener('mouseover', (e) => {
      const hot = e.target.closest(hotSel);
      cursor.classList.toggle('hot', !!hot);
      if (cread) {
        const verb = e.target.closest('a[target="_blank"]') ? 'OPEN ↗'
          : e.target.closest('a,button') ? 'VIEW'
            : hot ? '＋' : '';
        cread.textContent = verb;
      }
    });
    const lerp = () => {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      const c = cursor.style.getPropertyValue('--c') || '#E0512B';
      cursor.style.borderColor = c; if (cread) cread.style.color = c;
      requestAnimationFrame(lerp);
    };
    lerp();
  }

  /* ---------- hero node-field (k-means settle) ---------- */
  const setupGraph = (canvas, opts = {}) => {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    let W, H, dpr = Math.min(2, window.devicePixelRatio || 1);
    const N = opts.n || 60, K = opts.k || 5;
    let nodes = [], centroids = [], settle = 0, running = true, mx = -1e3, my = -1e3;
    const rand = (a, b) => a + Math.random() * (b - a);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const init = () => {
      resize();
      nodes = Array.from({ length: N }, () => ({
        x: rand(0, W), y: rand(0, H), vx: rand(-.15, .15), vy: rand(-.15, .15), c: 0
      }));
      centroids = Array.from({ length: K }, () => ({ x: rand(W * .25, W * .9), y: rand(H * .15, H * .9) }));
    };
    init();
    addEventListener('resize', init);
    canvas.closest('section')?.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
    });
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      settle = Math.min(1, settle + 0.004);
      // assign + nudge toward nearest centroid as it settles
      nodes.forEach(n => {
        let best = 0, bd = 1e9;
        centroids.forEach((c, i) => { const d = (c.x - n.x) ** 2 + (c.y - n.y) ** 2; if (d < bd) { bd = d; best = i; } });
        n.c = best;
        const c = centroids[best];
        n.vx += (c.x - n.x) * 0.00018 * settle;
        n.vy += (c.y - n.y) * 0.00018 * settle;
        // cursor repulsion
        const dx = n.x - mx, dy = n.y - my, dd = dx * dx + dy * dy;
        if (dd < 9000) { const f = (1 - dd / 9000) * 0.6; n.vx += (dx / Math.sqrt(dd + 1)) * f; n.vy += (dy / Math.sqrt(dd + 1)) * f; }
        n.vx *= 0.96; n.vy *= 0.96;
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) { n.vx *= -1; }
        if (n.y < 0 || n.y > H) { n.vy *= -1; }
        n.x = Math.max(0, Math.min(W, n.x)); n.y = Math.max(0, Math.min(H, n.y));
      });
      // move centroids to mean
      centroids.forEach((c, i) => {
        let sx = 0, sy = 0, k = 0;
        nodes.forEach(n => { if (n.c === i) { sx += n.x; sy += n.y; k++; } });
        if (k) { c.x += (sx / k - c.x) * 0.02; c.y += (sy / k - c.y) * 0.02; }
      });
      // edges to centroid
      ctx.lineWidth = 1;
      nodes.forEach(n => {
        const c = centroids[n.c];
        const a = 0.05 + 0.10 * settle;
        ctx.strokeStyle = `rgba(26,23,20,${a})`;
        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(c.x, c.y); ctx.stroke();
      });
      // nodes
      nodes.forEach(n => {
        ctx.fillStyle = 'rgba(128,120,104,.55)';
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.6, 0, 7); ctx.fill();
      });
      // centroids in signal
      centroids.forEach(c => {
        ctx.fillStyle = `rgba(224,81,43,${0.35 + 0.5 * settle})`;
        ctx.beginPath(); ctx.arc(c.x, c.y, 3.2, 0, 7); ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    if (reduce) { // static end-state
      settle = 1;
      for (let i = 0; i < 220; i++) {
        nodes.forEach(n => { const c = centroids[n.c]; n.x += (c.x - n.x) * .05; n.y += (c.y - n.y) * .05; });
        centroids.forEach((c, i2) => { let sx = 0, sy = 0, k = 0; nodes.forEach(n => { if (n.c === i2) { sx += n.x; sy += n.y; k++; } }); if (k) { c.x = sx / k; c.y = sy / k; } });
        nodes.forEach(n => { let b = 0, bd = 1e9; centroids.forEach((c, j) => { const d = (c.x - n.x) ** 2 + (c.y - n.y) ** 2; if (d < bd) { bd = d; b = j; } }); n.c = b; });
      }
      running = false; ctx.clearRect(0, 0, W, H);
      nodes.forEach(n => { const c = centroids[n.c]; ctx.strokeStyle = 'rgba(26,23,20,.12)'; ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(c.x, c.y); ctx.stroke(); ctx.fillStyle = 'rgba(128,120,104,.55)'; ctx.beginPath(); ctx.arc(n.x, n.y, 1.6, 0, 7); ctx.fill(); });
      centroids.forEach(c => { ctx.fillStyle = 'rgba(224,81,43,.85)'; ctx.beginPath(); ctx.arc(c.x, c.y, 3.2, 0, 7); ctx.fill(); });
      return { stop() {}, start() {} };
    }
    const vis = new IntersectionObserver((e) => { running = e[0].isIntersecting; if (running) draw(); }, { threshold: 0 });
    vis.observe(canvas);
    draw();
    document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) draw(); });
    return { };
  };
  setupGraph($('#heroCanvas'), { n: innerWidth < 760 ? 28 : 64, k: 5 });

  /* ---------- redistricting mini-canvas (partition swatches) ---------- */
  const map = $('#mapCanvas');
  if (map) {
    const ctx = map.getContext('2d');
    const dpr = Math.min(2, devicePixelRatio || 1);
    const palette = ['#E0512B', '#C8A24B', '#A9B5AE', '#6E8B82', '#8a6f5e'];
    const render = () => {
      const r = map.getBoundingClientRect(); map.width = r.width * dpr; map.height = r.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.max(18, Math.floor(r.width / 16)), rows = Math.max(5, Math.floor(r.height / 16));
      const cw = r.width / cols, ch = r.height / rows;
      // a few seeds; color each cell by nearest seed (voronoi-ish district partition)
      const seeds = palette.map((c) => ({ x: Math.random() * r.width, y: Math.random() * r.height, c }));
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = i * cw + cw / 2, y = j * ch + ch / 2;
        let bd = 1e9, col = palette[0];
        seeds.forEach(s => { const d = (s.x - x) ** 2 + (s.y - y) ** 2; if (d < bd) { bd = d; col = s.c; } });
        ctx.fillStyle = col; ctx.globalAlpha = 0.16; ctx.fillRect(i * cw, j * ch, cw - 1, ch - 1);
      }
      ctx.globalAlpha = 1;
    };
    const o = new IntersectionObserver((e) => { if (e[0].isIntersecting) { render(); o.disconnect(); } }, { threshold: .2 });
    o.observe(map);
    addEventListener('resize', () => { clearTimeout(map._t); map._t = setTimeout(render, 200); });
  }
})();
