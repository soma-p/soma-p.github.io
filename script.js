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

  /* 2) ORCA waveform (mirrored audio panel) */
  (() => {
    const cv = $('#orcaWave'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, hover = 0, amp = 0.55; const N = 60;
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const host = cv.closest('.card');
    host?.addEventListener('mouseenter', () => hover = 1); host?.addEventListener('mouseleave', () => hover = 0);
    const roundBar = (x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fill(); };
    const draw = (t) => {
      c.clearRect(0, 0, W, H); const mid = H / 2, bw = W / N;
      for (let i = 0; i < N; i++) {
        const env = Math.sin((i / (N - 1)) * Math.PI);
        const s = (Math.sin(t * 0.0035 + i * 0.45) * 0.5 + 0.5) * (Math.sin(t * 0.0019 + i * 0.23) * 0.5 + 0.5);
        const h = Math.max(3, (0.08 + amp * (0.2 + 0.8 * s)) * (H * 0.46) * (0.45 + 0.55 * env));
        const w = bw * 0.5, x = i * bw + (bw - w) / 2;
        const g = c.createLinearGradient(0, mid - h, 0, mid + h);
        g.addColorStop(0, '#34D399'); g.addColorStop(0.5, '#10B981'); g.addColorStop(1, '#0E7A53');
        c.fillStyle = g; roundBar(x, mid - h, w, h * 2, w / 2);
      }
    };
    const frame = (t) => { if (run) { amp += ((hover ? 0.95 : 0.55) - amp) * 0.06; draw(t); } requestAnimationFrame(frame); };
    if (reduce) { size(); draw(0); } else { requestAnimationFrame(frame); onView(cv, v => run = v); }
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

  /* 4) agentic node-graph workflow */
  (() => {
    const cv = $('#agenticFlow'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, pulse = 0, nodes = [];
    const labels = ['Request', 'Plan', 'Tools · MCP', 'Execute', 'Verify', 'Respond'];
    const layout = () => {
      const n = labels.length, padX = Math.max(46, W * 0.07), padY = 40, uw = W - padX * 2;
      nodes = labels.map((lab, i) => ({ x: padX + uw * (i / (n - 1)), y: (i % 2 === 0) ? padY : H - padY, lab }));
    };
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); layout(); };
    size(); addEventListener('resize', size);
    const arrow = (a, b, t) => { const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t, ang = Math.atan2(b.y - a.y, b.x - a.x); c.save(); c.translate(px, py); c.rotate(ang); c.fillStyle = 'rgba(79,191,139,.85)'; c.beginPath(); c.moveTo(-5, -4.5); c.lineTo(5, 0); c.lineTo(-5, 4.5); c.closePath(); c.fill(); c.restore(); };
    const draw = () => {
      c.clearRect(0, 0, W, H);
      for (let i = 0; i < nodes.length - 1; i++) { const a = nodes[i], b = nodes[i + 1]; c.strokeStyle = 'rgba(79,191,139,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); arrow(a, b, 0.6); }
      const seg = nodes.length - 1, fp = (pulse % 1) * seg, si = Math.floor(fp), ft = fp - si;
      if (si < nodes.length - 1) { const a = nodes[si], b = nodes[si + 1]; c.fillStyle = '#34D399'; c.shadowColor = '#34D399'; c.shadowBlur = 14; c.beginPath(); c.arc(a.x + (b.x - a.x) * ft, a.y + (b.y - a.y) * ft, 5, 0, 7); c.fill(); c.shadowBlur = 0; }
      nodes.forEach(nd => {
        c.fillStyle = '#0E7A53'; c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 1.5; c.beginPath(); c.arc(nd.x, nd.y, 7, 0, 7); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.88)'; c.font = '600 11px "Space Grotesk",sans-serif'; c.textAlign = 'center'; c.textBaseline = (nd.y < H / 2) ? 'bottom' : 'top';
        c.fillText(nd.lab, nd.x, (nd.y < H / 2) ? nd.y - 12 : nd.y + 12);
      });
    };
    const frame = () => { if (run) { pulse += 0.006; draw(); } requestAnimationFrame(frame); };
    if (reduce) { size(); draw(); } else { requestAnimationFrame(frame); onView(cv, v => run = v); }
  })();

  /* 5) RAIN card: diagonal droplets */
  (() => {
    const cv = $('#rainCanvas'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, drops = [];
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const init = () => { size(); drops = Array.from({ length: Math.max(18, Math.round(W * H / 2400)) }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 7 + Math.random() * 11, v: 2.2 + Math.random() * 2.6 })); };
    init(); addEventListener('resize', init);
    const dx = 0.5;
    const draw = () => { if (run) { c.clearRect(0, 0, W, H); c.lineWidth = 1.6; c.lineCap = 'round'; drops.forEach(d => { const g = c.createLinearGradient(d.x, d.y, d.x - d.l * dx, d.y + d.l); g.addColorStop(0, 'rgba(96,165,250,0)'); g.addColorStop(1, 'rgba(59,130,246,.75)'); c.strokeStyle = g; c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x - d.l * dx, d.y + d.l); c.stroke(); d.y += d.v; d.x += d.v * dx; if (d.y > H + 12) { d.y = -12; d.x = Math.random() * (W + 60); } }); } requestAnimationFrame(draw); };
    if (reduce) { init(); } else { requestAnimationFrame(draw); onView(cv, v => run = v); }
  })();

  /* 6) AI Alliance card: network */
  (() => {
    const cv = $('#netCanvas'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, pts = [];
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const init = () => { size(); pts = Array.from({ length: Math.max(10, Math.round(W * H / 5200)) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 })); };
    init(); addEventListener('resize', init);
    const draw = () => {
      if (run) {
        c.clearRect(0, 0, W, H);
        pts.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; });
        for (let i = 0; i < pts.length; i++) { for (let j = i + 1; j < pts.length; j++) { const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 74) { c.strokeStyle = `rgba(14,122,83,${(1 - d / 74) * 0.5})`; c.lineWidth = 1; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); } } }
        pts.forEach(p => { c.fillStyle = 'rgba(14,122,83,.85)'; c.beginPath(); c.arc(p.x, p.y, 1.9, 0, 7); c.fill(); });
      }
      requestAnimationFrame(draw);
    };
    if (reduce) { init(); draw(); run = false; } else { requestAnimationFrame(draw); onView(cv, v => run = v); }
  })();

  /* 7) CSE card: pixel-art beach */
  (() => {
    const g = $('#pixgrid'); if (!g) return;
    const cols = 12, rows = 8; g.style.gridTemplateColumns = `repeat(${cols},1fr)`; g.style.gridTemplateRows = `repeat(${rows},1fr)`;
    const beach = (col, row) => {
      const ds = Math.hypot(col - 9.4, row - 1.3);
      if (ds < 1.7) return '#FFD84D';                         // sun
      if (ds < 2.5) return '#FFE89A';                         // sun glow
      if (row <= 2) return row === 2 ? '#BFE6F5' : '#9BD3F0'; // sky
      if (row === 3) return col % 4 === 0 ? '#7FD4E6' : '#3FB4D0'; // sea + whitecaps
      if (row === 4) return '#2E97BC';                        // sea
      if (row === 5) return '#F1E3B4';                        // wet sand
      return (col % 3 === 0) ? '#E2CE92' : '#E9D8A2';         // sand texture
    };
    const frag = document.createDocumentFragment();
    for (let r = 0; r < rows; r++) { for (let cl = 0; cl < cols; cl++) { const px = document.createElement('span'); px.className = 'px'; px.style.background = beach(cl, r); px.style.transitionDelay = ((r * 0.03) + Math.random() * 0.16).toFixed(2) + 's'; frag.appendChild(px); } }
    g.appendChild(frag);
  })();

  /* 8) scroll companion robot buddy */
  (() => {
    const buddy = $('#buddy'); if (!buddy) return;
    if (reduce || innerWidth < 900) { buddy.style.display = 'none'; return; }
    const bubble = $('#buddyBubble');
    const stops = [
      { sel: '#top', side: 0.92, y: 0.5, msg: "hey, I'll show you around" },
      { sel: '#work', side: 0.04, y: 0.42, msg: "here's where I've worked" },
      { sel: '#research', side: 0.92, y: 0.46, msg: "poke the map, it's live" },
      { sel: '#projects', side: 0.04, y: 0.5, msg: "stuff I build for fun" },
      { sel: '#gallery', side: 0.92, y: 0.5, msg: "a few good moments" },
      { sel: '#leadership', side: 0.04, y: 0.45, msg: "communities I started" },
      { sel: '#honors', side: 0.92, y: 0.5, msg: "some wins" },
      { sel: '#about', side: 0.04, y: 0.5, msg: "a bit about me" },
      { sel: '#contact', side: 0.92, y: 0.55, msg: "let's talk!" },
    ].map(s => ({ ...s, el: $(s.sel) })).filter(s => s.el);
    if (!stops.length) { buddy.style.display = 'none'; return; }
    let tx = innerWidth * 0.9, ty = innerHeight * 0.5, cx = tx, cy = ty, curMsg = '';
    const pick = () => {
      const mid = scrollY + innerHeight * 0.5; let best = stops[0];
      for (const s of stops) { if (s.el.getBoundingClientRect().top + scrollY <= mid) best = s; }
      tx = best.side * (innerWidth - 82) + 10; ty = best.y * innerHeight;
      buddy.classList.toggle('flip', best.side > 0.5);
      if (best.msg !== curMsg) { curMsg = best.msg; bubble.textContent = best.msg; }
    };
    addEventListener('scroll', pick, { passive: true }); addEventListener('resize', pick); pick();
    bubble.classList.add('show');
    const loop = () => { cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07; buddy.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`; requestAnimationFrame(loop); };
    loop();
  })();

  /* 9) BioVeritas DNA helix */
  (() => {
    const cv = $('#dnaCanvas'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, t = 0;
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const draw = () => {
      c.clearRect(0, 0, W, H);
      const cxv = W / 2, amp = W * 0.34, N = 9, gap = H / (N + 1);
      for (let i = 0; i < N; i++) {
        const y = gap * (i + 1), ph = t + i * 0.62;
        const x1 = cxv + Math.sin(ph) * amp, x2 = cxv - Math.sin(ph) * amp, front = Math.cos(ph) >= 0;
        c.strokeStyle = 'rgba(14,122,83,.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x1, y); c.lineTo(x2, y); c.stroke();
        c.fillStyle = '#0E7A53'; c.beginPath(); c.arc(x1, y, front ? 3.6 : 2.2, 0, 7); c.fill();
        c.fillStyle = '#34D399'; c.beginPath(); c.arc(x2, y, front ? 2.2 : 3.6, 0, 7); c.fill();
      }
    };
    const frame = () => { if (run) { t += 0.04; draw(); } requestAnimationFrame(frame); };
    if (reduce) { size(); draw(); } else { requestAnimationFrame(frame); onView(cv, v => run = v); }
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
