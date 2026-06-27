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
  setTimeout(() => $$('.reveal:not(.in), .reveal-img:not(.in)').forEach(el => el.classList.add('in')), 2000);

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

  /* text scramble on the name */
  const scramble = (el) => {
    const text = el.dataset.text || el.textContent;
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*/';
    const ends = [...text].map((_, i) => 8 + i * 3 + Math.floor(Math.random() * 6));
    const max = Math.max(...ends) + 1;
    let f = 0;
    const up = () => {
      let out = '';
      for (let i = 0; i < text.length; i++) {
        out += f >= ends[i] ? text[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      el.textContent = out;
      if (f++ <= max) requestAnimationFrame(up); else el.textContent = text;
    };
    up();
  };
  if (!reduce) $$('.scramble').forEach((el, i) => setTimeout(() => scramble(el), 120 + i * 130));

  /* magnetic buttons */
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    $$('.btn, .nav-cta').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.35;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.45;
        el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* image mask-wipe reveals */
  $$('.hero-photo img, .card.feature .fmedia img, .gal img').forEach(im => {
    im.classList.add('reveal-img'); io.observe(im);
  });

  /* smooth scroll (Lenis), with anchor handling */
  const shot = document.documentElement.classList.contains('shotmode');
  if (!reduce && !shot && window.Lenis) {
    const lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.documentElement.style.scrollBehavior = 'auto';
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) { const t = $(id); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -68 }); } }
    }));
  }

  /* ===== centerpieces ===== */
  const onView = (node, cb) => { new IntersectionObserver(es => cb(es[0].isIntersecting), { threshold: 0 }).observe(node); };

  /* 1) dazzling hero gradient field */
  (() => {
    const cv = $('#heroBg'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, mx = -1e4, my = -1e4, blobs = [];
    const pal = ['#0E7A53', '#34D399', '#10B981', '#14B8A6', '#065F46'];
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const init = () => { size(); blobs = pal.map(col => ({ col, bx: W * (0.15 + 0.8 * Math.random()), by: H * (0.1 + 0.8 * Math.random()), r: Math.max(W, H) * (0.34 + Math.random() * 0.26), sp: 0.00016 + Math.random() * 0.0002, ph: Math.random() * 6.28, ox: 0, oy: 0 })); };
    init(); addEventListener('resize', init);
    const host = cv.parentElement;
    host.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener('mouseleave', () => { mx = -1e4; my = -1e4; });
    const paint = (b, px, py) => { const g = c.createRadialGradient(px, py, 0, px, py, b.r); g.addColorStop(0, b.col + 'b3'); g.addColorStop(1, b.col + '00'); c.fillStyle = g; c.beginPath(); c.arc(px, py, b.r, 0, 7); c.fill(); };
    const frame = (t) => {
      if (run) {
        c.clearRect(0, 0, W, H);
        blobs.forEach(b => {
          const px = b.bx + Math.sin(t * b.sp + b.ph) * W * 0.15 + b.ox;
          const py = b.by + Math.cos(t * b.sp * 1.13 + b.ph) * H * 0.15 + b.oy;
          if (mx > -1e3) { const dx = mx - px, dy = my - py, d = Math.hypot(dx, dy); if (d < 340) { b.ox += dx * 0.0005 * (1 - d / 340); b.oy += dy * 0.0005 * (1 - d / 340); } }
          b.ox *= 0.95; b.oy *= 0.95; paint(b, px, py);
        });
      }
      requestAnimationFrame(frame);
    };
    if (reduce) { blobs.forEach(b => paint(b, b.bx, b.by)); } else { requestAnimationFrame(frame); onView(cv, v => { run = v; }); }
  })();

  /* 2) ORCA waveform */
  (() => {
    const cv = $('#orcaWave'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, hover = 0, amp = 0.5; const N = 46;
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const host = cv.closest('.card');
    host?.addEventListener('mouseenter', () => hover = 1); host?.addEventListener('mouseleave', () => hover = 0);
    const bar = (t) => {
      c.clearRect(0, 0, W, H); const bw = W / N;
      for (let i = 0; i < N; i++) {
        const s = (Math.sin(t * 0.004 + i * 0.5) * 0.5 + 0.5) * (Math.sin(t * 0.0021 + i * 0.27) * 0.5 + 0.5);
        const h = Math.max(2, (0.1 + amp * (0.18 + 0.82 * s)) * H);
        const x = i * bw + bw * 0.16; const g = c.createLinearGradient(0, H - h, 0, H);
        g.addColorStop(0, '#4FBF8B'); g.addColorStop(1, '#0E7A53'); c.fillStyle = g;
        c.fillRect(x, H - h, bw * 0.68, h);
      }
    };
    const frame = (t) => { if (run) { amp += ((hover ? 1 : 0.5) - amp) * 0.06; bar(t); } requestAnimationFrame(frame); };
    if (reduce) { size(); amp = 0.6; bar(0); } else { requestAnimationFrame(frame); onView(cv, v => run = v); }
  })();

  /* 3) interactive redistricting */
  (() => {
    const cv = $('#mapCanvas'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    const btn = $('#redrawMap');
    const cols = ['#0E7A53', '#14B8A6', '#34D399', '#10B981', '#0D9488', '#65A30D', '#047857', '#5EEAD4'];
    let W = 0, H = 0, cell = 16, nx = 0, ny = 0, seeds = [], grid = [], reveal = 0, anim = false; const K = 8;
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height || 172; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); cell = Math.max(11, Math.round(W / 46)); nx = Math.ceil(W / cell); ny = Math.ceil(H / cell); };
    const gen = (sx, sy) => {
      size();
      seeds = Array.from({ length: K }, (_, i) => ({ x: (i === 0 && sx != null) ? sx : Math.random() * W, y: (i === 0 && sy != null) ? sy : Math.random() * H, c: cols[i % cols.length] }));
      grid = new Array(nx * ny);
      for (let gy = 0; gy < ny; gy++) for (let gx = 0; gx < nx; gx++) {
        const px = gx * cell + cell / 2, py = gy * cell + cell / 2; let best = 0, bd = 1e9;
        seeds.forEach((s, si) => { const d = (s.x - px) ** 2 + (s.y - py) ** 2; if (d < bd) { bd = d; best = si; } });
        grid[gy * nx + gx] = best;
      }
      reveal = 0; anim = true;
    };
    const draw = () => {
      c.clearRect(0, 0, W, H); const cut = reveal * (nx + 2);
      for (let gy = 0; gy < ny; gy++) for (let gx = 0; gx < nx; gx++) {
        if (gx > cut) continue;
        c.globalAlpha = Math.max(0, Math.min(1, cut - gx)); c.fillStyle = seeds[grid[gy * nx + gx]].c;
        c.fillRect(gx * cell, gy * cell, cell + 0.6, cell + 0.6);
      }
      c.globalAlpha = 1;
      seeds.forEach(s => { if (s.x > cut * cell) return; c.fillStyle = '#fff'; c.beginPath(); c.arc(s.x, s.y, 3.2, 0, 7); c.fill(); c.lineWidth = 1.4; c.strokeStyle = 'rgba(0,0,0,.45)'; c.stroke(); });
    };
    const loop = () => { if (anim) { reveal += 0.045; if (reveal >= 1) { reveal = 1; anim = false; } draw(); requestAnimationFrame(loop); } };
    const trigger = (sx, sy) => { gen(sx, sy); requestAnimationFrame(loop); };
    addEventListener('resize', () => { if (grid.length) { gen(); reveal = 1; anim = false; draw(); } });
    btn?.addEventListener('click', () => trigger());
    cv.addEventListener('click', e => { const r = cv.getBoundingClientRect(); trigger(e.clientX - r.left, e.clientY - r.top); });
    if (reduce) { gen(); reveal = 1; anim = false; draw(); } else { trigger(); }
  })();

  /* 4) agentic workflow arrows */
  (() => {
    const card = $('#agenticCard'); if (!card) return;
    const NS = 'http://www.w3.org/2000/svg', XL = 'http://www.w3.org/1999/xlink';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'flow-arrows'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('preserveAspectRatio', 'none');
    card.appendChild(svg);
    const uid = 'apath';
    const rr = (x, y, w, h, r) => `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
    const build = () => {
      const w = card.clientWidth, h = card.clientHeight; if (!w || !h) return;
      const p = 1.5, d = rr(p, p, w - 2 * p, h - 2 * p, 19);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.innerHTML = '';
      const mk = (cls) => { const el = document.createElementNS(NS, 'path'); el.setAttribute('d', d); el.setAttribute('class', cls); return el; };
      svg.appendChild(mk('flow-base')); svg.appendChild(mk('flow-dash'));
      const mp = mk(''); mp.setAttribute('id', uid); mp.setAttribute('fill', 'none'); mp.setAttribute('stroke', 'none'); svg.appendChild(mp);
      if (reduce) return;
      for (let i = 0; i < 4; i++) {
        const head = document.createElementNS(NS, 'path'); head.setAttribute('d', 'M-7,-4 L4,0 L-7,4 Z'); head.setAttribute('class', 'flow-head');
        const am = document.createElementNS(NS, 'animateMotion'); am.setAttribute('dur', '8s'); am.setAttribute('repeatCount', 'indefinite'); am.setAttribute('rotate', 'auto'); am.setAttribute('begin', `-${i * 2}s`);
        const mpath = document.createElementNS(NS, 'mpath'); mpath.setAttributeNS(XL, 'href', '#' + uid); mpath.setAttribute('href', '#' + uid);
        am.appendChild(mpath); head.appendChild(am); svg.appendChild(head);
      }
    };
    build(); addEventListener('resize', build); setTimeout(build, 350); setTimeout(build, 1300);
  })();

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
