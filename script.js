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

  /* hero rotating tagline */
  (() => {
    const el = $('#heroRot'); if (!el || reduce) return;
    const phrases = ['build AI & ship it.', 'ship to 8,000 students.', 'lead a 7,000-person platform.', 'put voice agents in production.', 'train models on a supercomputer.'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % phrases.length;
      el.textContent = phrases[i];
      el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    }, 2800);
  })();

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
  $$('.hp-frame img, .card.feature .fmedia img, .gal img').forEach(im => {
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

  /* 1) hero neural flow-field — drifting constellation with travelling data pulses */
  (() => {
    const cv = $('#heroBg'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, mx = -1e4, my = -1e4, nodes = [], pulses = [], t = 0;
    const D = 132;                                          // connection radius
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const init = () => {
      size();
      const n = Math.max(26, Math.min(70, Math.round(W * H / 16000)));
      nodes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 1.1 + Math.random() * 1.8 }));
      pulses = [];
    };
    init(); addEventListener('resize', init);
    const host = cv.closest('.hero') || cv.parentElement;
    host.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener('mouseleave', () => { mx = -1e4; my = -1e4; });
    const flow = (x, y) => (Math.sin(x * 0.006 + t * 0.00031) + Math.cos(y * 0.0065 - t * 0.00027)) * Math.PI;
    const spawn = () => {
      if (pulses.length > 5) return;
      const a = (Math.random() * nodes.length) | 0; let b = -1, best = D;
      for (let j = 0; j < nodes.length; j++) { if (j === a) continue; const d = Math.hypot(nodes[a].x - nodes[j].x, nodes[a].y - nodes[j].y); if (d < best) { best = d; b = j; } }
      if (b >= 0) pulses.push({ a, b, p: 0, sp: 0.012 + Math.random() * 0.012 });
    };
    const glow = () => { const g = c.createRadialGradient(W * 0.82, H * 0.18, 0, W * 0.82, H * 0.18, Math.max(W, H) * 0.7); g.addColorStop(0, 'rgba(52,211,153,.16)'); g.addColorStop(1, 'rgba(52,211,153,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
    const draw = () => {
      c.clearRect(0, 0, W, H); glow();
      const px = (mx > -1e3 ? mx - W / 2 : 0) * 0.012, py = (my > -1e3 ? my - H / 2 : 0) * 0.012;
      nodes.forEach(nd => {
        const a = flow(nd.x, nd.y); nd.x += Math.cos(a) * 0.28; nd.y += Math.sin(a) * 0.28;
        if (mx > -1e3) { const dx = nd.x - mx, dy = nd.y - my, d = Math.hypot(dx, dy); if (d < 110 && d > 0.1) { nd.x += dx / d * (1 - d / 110) * 0.9; nd.y += dy / d * (1 - d / 110) * 0.9; } }
        if (nd.x < -12) nd.x = W + 12; else if (nd.x > W + 12) nd.x = -12;
        if (nd.y < -12) nd.y = H + 12; else if (nd.y > H + 12) nd.y = -12;
      });
      // edges
      c.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < D) { c.strokeStyle = `rgba(14,122,83,${(1 - d / D) * 0.45})`; c.beginPath(); c.moveTo(a.x + px, a.y + py); c.lineTo(b.x + px, b.y + py); c.stroke(); }
      }
      // travelling data pulses
      pulses.forEach(pu => {
        const a = nodes[pu.a], b = nodes[pu.b]; pu.p += pu.sp;
        const x = a.x + (b.x - a.x) * pu.p + px, y = a.y + (b.y - a.y) * pu.p + py;
        c.fillStyle = '#34D399'; c.shadowColor = '#34D399'; c.shadowBlur = 12; c.beginPath(); c.arc(x, y, 2.6, 0, 7); c.fill(); c.shadowBlur = 0;
      });
      pulses = pulses.filter(pu => pu.p < 1);
      // nodes
      nodes.forEach(nd => { c.fillStyle = 'rgba(14,122,83,.85)'; c.beginPath(); c.arc(nd.x + px, nd.y + py, nd.r, 0, 7); c.fill(); });
    };
    const frame = () => { if (run) { t += 16; if (Math.random() < 0.04) spawn(); draw(); } requestAnimationFrame(frame); };
    if (reduce) { init(); draw(); } else { requestAnimationFrame(frame); onView(cv, v => { run = v; }); }
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

  /* 4) agentic workflow — a loop that orbits the text */
  (() => {
    const cv = $('#agenticFlow'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, pulse = 0, cx = 0, cy = 0, rx = 0, ry = 0;
    const labels = ['Request', 'Plan', 'Tools · MCP', 'Execute', 'Verify', 'Respond'];
    const N = labels.length, A0 = -Math.PI / 2;           // first node at top
    const pt = (a) => ({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
    const layout = () => { cx = W / 2; cy = H / 2; rx = Math.max(70, W / 2 - 56); ry = Math.max(50, H / 2 - 30); };
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); layout(); };
    size(); addEventListener('resize', size);
    const arrowAt = (a, alpha) => {                       // arrowhead riding the ellipse, pointing along travel
      const p = pt(a), tang = Math.atan2(ry * Math.cos(a), -rx * Math.sin(a));
      c.save(); c.translate(p.x, p.y); c.rotate(tang); c.fillStyle = `rgba(79,191,139,${alpha})`;
      c.beginPath(); c.moveTo(-5, -5); c.lineTo(6, 0); c.lineTo(-5, 5); c.closePath(); c.fill(); c.restore();
    };
    const draw = () => {
      c.clearRect(0, 0, W, H);
      // faint orbit track
      c.strokeStyle = 'rgba(79,191,139,.16)'; c.lineWidth = 1.4;
      c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.stroke();
      // arrowheads at the midpoint of each hop
      for (let i = 0; i < N; i++) arrowAt(A0 + (i + 0.5) * (2 * Math.PI / N), 0.7);
      // travelling comet pulse (head + fading trail)
      for (let k = 0; k < 10; k++) {
        const a = A0 + (pulse - k * 0.018) * 2 * Math.PI, p = pt(a), al = (1 - k / 10);
        c.fillStyle = `rgba(52,211,153,${al * 0.5})`; c.beginPath(); c.arc(p.x, p.y, 4.5 - k * 0.3, 0, 7); c.fill();
      }
      const head = pt(A0 + pulse * 2 * Math.PI);
      c.fillStyle = '#34D399'; c.shadowColor = '#34D399'; c.shadowBlur = 16; c.beginPath(); c.arc(head.x, head.y, 5, 0, 7); c.fill(); c.shadowBlur = 0;
      // nodes + labels offset radially outward
      for (let i = 0; i < N; i++) {
        const a = A0 + i * (2 * Math.PI / N), p = pt(a), ux = Math.cos(a), uy = Math.sin(a);
        c.fillStyle = '#0E7A53'; c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1.5;
        c.beginPath(); c.arc(p.x, p.y, 6, 0, 7); c.fill(); c.stroke();
        c.font = '600 10.5px "Space Grotesk",sans-serif';
        c.textAlign = ux > 0.25 ? 'left' : ux < -0.25 ? 'right' : 'center';
        c.textBaseline = uy > 0.25 ? 'top' : uy < -0.25 ? 'bottom' : 'middle';
        const lx = p.x + ux * 12, ly = p.y + uy * 11;
        c.fillStyle = 'rgba(13,23,18,.85)'; const tw = c.measureText(labels[i]).width;
        const ox = c.textAlign === 'left' ? 0 : c.textAlign === 'right' ? -tw : -tw / 2;
        c.fillRect(lx + ox - 4, ly + (uy > 0.25 ? -1 : uy < -0.25 ? -13 : -7), tw + 8, 14);
        c.fillStyle = 'rgba(159,240,200,.92)'; c.fillText(labels[i], lx, ly);
      }
    };
    const frame = () => { if (run) { pulse = (pulse + 0.0018) % 1; draw(); } requestAnimationFrame(frame); };
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
    const draw = () => { if (run) { c.clearRect(0, 0, W, H); c.lineWidth = 1.6; c.lineCap = 'round'; drops.forEach(d => { const g = c.createLinearGradient(d.x, d.y, d.x - d.l * dx, d.y + d.l); g.addColorStop(0, 'rgba(96,165,250,0)'); g.addColorStop(1, 'rgba(59,130,246,.75)'); c.strokeStyle = g; c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x + d.l * dx, d.y + d.l); c.stroke(); d.y += d.v; d.x += d.v * dx; if (d.y > H + 12) { d.y = -12; d.x = Math.random() * (W + 60); } }); } requestAnimationFrame(draw); };
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
    const cols = 24, rows = 15; g.style.gridTemplateColumns = `repeat(${cols},1fr)`; g.style.gridTemplateRows = `repeat(${rows},1fr)`;
    const beach = (col, row) => {
      const sd = Math.hypot(col - cols * 0.79, (row - rows * 0.18) * 1.5);
      if (sd < cols * 0.12) return '#FFD84D';                          // sun
      if (sd < cols * 0.18) return '#FFE08A';                          // sun glow
      if (row < rows * 0.30) return row > rows * 0.24 ? '#BFE6F5' : '#9BD3F0';     // sky
      if (row < rows * 0.40) return (col % 6 === Math.floor(row) % 6) ? '#A9E4F0' : '#3FB4D0'; // whitecaps
      if (row < rows * 0.56) return row < rows * 0.48 ? '#2E97BC' : '#27839F';     // sea depth
      if (row < rows * 0.64) return '#F1E3B4';                         // wet sand
      return (col % 4 === 0 || row % 3 === 0) ? '#E2CE92' : '#EBDAA4'; // sand grain
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

  /* 9) BioVeritas DNA helix — twin backbones, colour-coded base pairs, verification scan */
  (() => {
    const cv = $('#dnaCanvas'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, t = 0;
    const pairCols = ['#0E7A53', '#34D399', '#5BBF8B', '#1FA06A'];   // A·T / G·C palette
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const strand = (sign, alpha, lw) => {                            // continuous sinusoidal backbone
      const cxv = W / 2, amp = W * 0.32;
      c.strokeStyle = `rgba(14,122,83,${alpha})`; c.lineWidth = lw; c.beginPath();
      for (let y = 4; y <= H - 4; y += 2) { const x = cxv + sign * Math.sin(t + y * 0.085) * amp; if (y === 4) c.moveTo(x, y); else c.lineTo(x, y); }
      c.stroke();
    };
    const draw = () => {
      c.clearRect(0, 0, W, H);
      const cxv = W / 2, amp = W * 0.32, N = 11, gap = H / (N + 1);
      const scanY = (1 - ((t * 0.5) % 4) / 4) * H;                   // scan band sweeps upward
      strand(1, 0.5, 2.4); strand(-1, 0.28, 1.8);                    // back strand fainter
      for (let i = 0; i < N; i++) {
        const y = gap * (i + 1), ph = t + y * 0.085;
        const x1 = cxv + Math.sin(ph) * amp, x2 = cxv - Math.sin(ph) * amp, front = Math.cos(ph) >= 0;
        const lit = Math.abs(y - scanY) < 9;
        c.strokeStyle = lit ? 'rgba(140,240,190,.95)' : 'rgba(14,122,83,.32)';
        c.lineWidth = lit ? 2.6 : 1.8; c.beginPath(); c.moveTo(x1, y); c.lineTo(x2, y); c.stroke();
        const col = pairCols[i % pairCols.length];
        c.fillStyle = lit ? '#9ff0c8' : col; c.beginPath(); c.arc(x1, y, front ? 3.4 : 2.1, 0, 7); c.fill();
        c.fillStyle = lit ? '#9ff0c8' : pairCols[(i + 1) % pairCols.length]; c.beginPath(); c.arc(x2, y, front ? 2.1 : 3.4, 0, 7); c.fill();
      }
      c.strokeStyle = 'rgba(140,240,190,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(2, scanY); c.lineTo(W - 2, scanY); c.stroke();
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
