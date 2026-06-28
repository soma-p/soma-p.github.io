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

  /* nav: highlight the section you're currently in */
  const secLinks = $$('#navLinks a[href^="#"]').map(a => ({ a, sec: $(a.getAttribute('href')) })).filter(x => x.sec);
  const onActive = () => {
    const mid = scrollY + innerHeight * 0.34; let cur = null;
    for (const m of secLinks) if (m.sec.getBoundingClientRect().top + scrollY <= mid) cur = m;
    secLinks.forEach(m => m.a.classList.toggle('active', m === cur));
  };
  if (secLinks.length) { onActive(); addEventListener('scroll', onActive, { passive: true }); }

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
    let W = 0, H = 0, run = true, hover = 0, amp = 0.55, mx = -1; const N = 60;
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const host = cv.closest('.card');
    host?.addEventListener('mouseenter', () => hover = 1); host?.addEventListener('mouseleave', () => { hover = 0; mx = -1; });
    host?.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; });
    const roundBar = (x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fill(); };
    const draw = (t) => {
      c.clearRect(0, 0, W, H); const mid = H / 2, bw = W / N;
      for (let i = 0; i < N; i++) {
        const env = Math.sin((i / (N - 1)) * Math.PI);
        const s = (Math.sin(t * 0.0035 + i * 0.45) * 0.5 + 0.5) * (Math.sin(t * 0.0019 + i * 0.23) * 0.5 + 0.5);
        const cx = i * bw + bw / 2, bump = mx >= 0 ? Math.max(0, 1 - Math.abs(cx - mx) / 95) ** 2 : 0;   // bars peak toward the cursor
        const h = Math.max(3, (0.08 + amp * (0.2 + 0.8 * s)) * (H * 0.46) * (0.45 + 0.55 * env)) * (1 + bump * 1.8);
        const w = bw * 0.5, x = i * bw + (bw - w) / 2;
        const g = c.createLinearGradient(0, mid - h, 0, mid + h);
        g.addColorStop(0, bump > 0.15 ? '#9DF9D2' : '#34D399'); g.addColorStop(0.5, '#10B981'); g.addColorStop(1, '#0E7A53');
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

  /* 4) agentic workflow — a rounded-rect circuit that frames the text */
  (() => {
    const cv = $('#agenticFlow'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, pulse = 0, cx = 0, cy = 0, hw = 0, hh = 0, rad = 0, path = [], topMid = 0;
    const labels = ['Request', 'Plan', 'Tools · MCP', 'Execute', 'Verify', 'Respond'];
    const N = labels.length;
    const content = (cv.closest('.flow-around') || cv.parentElement).querySelector(':scope > div:not(.pno)');
    const layout = () => {
      const cr = cv.getBoundingClientRect(), dr = content ? content.getBoundingClientRect() : cr;   // wrap the text box with padding
      const PAD = 22, bx = dr.left - cr.left, by = dr.top - cr.top, bw = dr.width, bh = dr.height;
      cx = bx + bw / 2; cy = by + bh / 2;
      hw = Math.max(80, bw / 2 + PAD); hh = Math.max(46, bh / 2 + PAD); rad = Math.min(40, hh, hw);
      // sample the rounded-rect perimeter into equal-ish steps (clockwise from left end of top edge)
      path = []; const step = 3;
      const seg = (x1, y1, x2, y2) => { const d = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.round(d / step)); for (let i = 0; i < n; i++) path.push({ x: x1 + (x2 - x1) * i / n, y: y1 + (y2 - y1) * i / n }); };
      const arc = (ox, oy, a0, a1) => { const n = Math.max(2, Math.round(Math.abs(a1 - a0) * rad / step)); for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * i / n; path.push({ x: ox + Math.cos(a) * rad, y: oy + Math.sin(a) * rad }); } };
      seg(cx - hw + rad, cy - hh, cx + hw - rad, cy - hh);                 // top
      arc(cx + hw - rad, cy - hh + rad, -Math.PI / 2, 0);                  // TR
      seg(cx + hw, cy - hh + rad, cx + hw, cy + hh - rad);                 // right
      arc(cx + hw - rad, cy + hh - rad, 0, Math.PI / 2);                   // BR
      seg(cx + hw - rad, cy + hh, cx - hw + rad, cy + hh);                 // bottom
      arc(cx - hw + rad, cy + hh - rad, Math.PI / 2, Math.PI);             // BL
      seg(cx - hw, cy + hh - rad, cx - hw, cy - hh + rad);                 // left
      arc(cx - hw + rad, cy - hh + rad, Math.PI, Math.PI * 1.5);           // TL
      const P = 4 * (hw - rad) + 4 * (hh - rad) + 2 * Math.PI * rad;        // perimeter
      topMid = (hw - rad) / P;                                             // fraction at top-edge midpoint
    };
    const at = (f) => { const L = path.length; const i = Math.floor((((f % 1) + 1) % 1) * L) % L; return path[i] || { x: cx, y: cy }; };
    const tangentAt = (f) => { const L = path.length, i = Math.floor((((f % 1) + 1) % 1) * L) % L, a = path[(i - 2 + L) % L], b = path[(i + 2) % L]; return Math.atan2(b.y - a.y, b.x - a.x); };
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); layout(); };
    size(); addEventListener('resize', size);
    const roundRectPath = () => { c.beginPath(); c.moveTo(cx - hw + rad, cy - hh); c.arcTo(cx + hw, cy - hh, cx + hw, cy - hh + rad, rad); c.arcTo(cx + hw, cy + hh, cx + hw - rad, cy + hh, rad); c.arcTo(cx - hw, cy + hh, cx - hw, cy + hh - rad, rad); c.arcTo(cx - hw, cy - hh, cx - hw + rad, cy - hh, rad); c.closePath(); };
    const arrowAt = (f, alpha) => { const p = at(f), ang = tangentAt(f); c.save(); c.translate(p.x, p.y); c.rotate(ang); c.fillStyle = `rgba(79,191,139,${alpha})`; c.beginPath(); c.moveTo(-5, -5); c.lineTo(6, 0); c.lineTo(-5, 5); c.closePath(); c.fill(); c.restore(); };
    const F0 = () => topMid;                                              // first node anchored to top-centre
    const draw = () => {
      c.clearRect(0, 0, W, H);
      c.strokeStyle = 'rgba(79,191,139,.18)'; c.lineWidth = 1.4; roundRectPath(); c.stroke();
      for (let i = 0; i < N; i++) arrowAt(F0() + (i + 0.5) / N, 0.7);
      for (let k = 0; k < 12; k++) { const p = at(F0() + pulse - k * 0.012), al = 1 - k / 12; c.fillStyle = `rgba(52,211,153,${al * 0.5})`; c.beginPath(); c.arc(p.x, p.y, 4.6 - k * 0.28, 0, 7); c.fill(); }
      const head = at(F0() + pulse);
      c.fillStyle = '#34D399'; c.shadowColor = '#34D399'; c.shadowBlur = 16; c.beginPath(); c.arc(head.x, head.y, 5, 0, 7); c.fill(); c.shadowBlur = 0;
      for (let i = 0; i < N; i++) {
        const p = at(F0() + i / N), ux = p.x - cx, uy = p.y - cy;
        const hor = Math.abs(ux) > Math.abs(uy);                          // labels go outward along the dominant axis
        c.fillStyle = '#0E7A53'; c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.5;
        c.beginPath(); c.arc(p.x, p.y, 6, 0, 7); c.fill(); c.stroke();
        c.font = '600 10.5px "Space Grotesk",sans-serif';
        c.textAlign = hor ? (ux > 0 ? 'left' : 'right') : 'center';
        c.textBaseline = hor ? 'middle' : (uy > 0 ? 'top' : 'bottom');
        const lx = p.x + (hor ? Math.sign(ux) * 12 : 0), ly = p.y + (hor ? 0 : Math.sign(uy) * 11);
        const tw = c.measureText(labels[i]).width;
        let ox = -tw / 2; if (c.textAlign === 'left') ox = 0; else if (c.textAlign === 'right') ox = -tw;
        let oy = -7; if (c.textBaseline === 'top') oy = -1; else if (c.textBaseline === 'bottom') oy = -13;
        c.fillStyle = 'rgba(13,23,18,.85)'; c.fillRect(lx + ox - 4, ly + oy, tw + 8, 14);
        c.fillStyle = 'rgba(159,240,200,.92)'; c.fillText(labels[i], lx, ly);
      }
    };
    const frame = () => { if (run) { pulse = (pulse + 0.0016) % 1; draw(); } requestAnimationFrame(frame); };
    if (reduce) { size(); draw(); } else { requestAnimationFrame(frame); onView(cv, v => run = v); }
  })();

  /* 4b) AI Tutor card: a purple bot walks to a whiteboard and teaches math + code */
  (() => {
    const cv = $('#tutorBoard'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true;
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const lessons = [
      { t: 'a² + b² = c²', col: '#1f6f4f' },
      { t: 'def square(x): return x*x', col: '#0f766e', mono: true },
      { t: 'P(A|B) = P(B|A) P(A) / P(B)', col: '#2456c8' },
      { t: 'for i in range(n): total += i', col: '#7c3aed', mono: true },
      { t: 'ŷ = w·x + b', col: '#b0431f' },
      { t: 'arr.sort(reverse=True)', col: '#0f766e', mono: true },
      { t: '∫₀¹ x dx = ½', col: '#6d28d9' },
      { t: 'model.fit(X, y)', col: '#2456c8', mono: true },
      { t: 'H = −Σ p log p', col: '#6d28d9' },
      { t: 'print("hello, world!")', col: '#0f766e', mono: true },
      { t: 'A = π r²', col: '#b0431f' },
      { t: 'e = lim (1 + 1/n)ⁿ', col: '#1f6f4f' },
    ];
    let idx = 0, phase = 'walk', t = 0, holdT = 0, prog = 0, gx = -42, hov = false, follow = false, mx = -1e4;
    const host = cv.closest('.paper') || cv.parentElement;
    host.addEventListener('mouseenter', () => { hov = true; });
    host.addEventListener('mouseleave', () => { hov = false; });
    cv.addEventListener('mousemove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; follow = true; });   // it ambles over to the cursor
    cv.addEventListener('mouseleave', () => { follow = false; mx = -1e4; });
    host.addEventListener('click', () => { if (phase !== 'erase') { phase = 'erase'; prog = 0; } });   // click anywhere on the card → next lesson
    const rr = (x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
    const drawTutor = (fx, fy, walk, point) => {                     // a lean purple teaching bot
      c.save(); c.translate(fx, fy); c.lineJoin = 'round';
      const out = '#3B1E6E', body = '#8B5CF6', dark = '#6D28D9', glow = '#A78BFA', sw = walk ? Math.sin(t * 0.45) * 2.6 : 0;
      c.strokeStyle = out; c.lineWidth = 2.2;
      [[-5, sw], [5, -sw]].forEach(([lx, dy]) => { c.fillStyle = dark; rr(lx - 2.4, -16 + dy, 5, 13, 1.5); c.fill(); c.stroke(); c.fillStyle = '#4C1D95'; rr(lx - 4, -5 + dy, 9, 5, 1.5); c.fill(); c.stroke(); });
      c.fillStyle = body; c.lineWidth = 2.5; rr(-11, -44, 22, 30, 6); c.fill(); c.stroke();   // lean torso
      c.save(); rr(-11, -44, 22, 30, 6); c.clip(); c.globalAlpha = 0.5; c.fillStyle = dark; c.fillRect(-11, -44, 8, 30); c.globalAlpha = 1; c.restore();
      c.fillStyle = dark; rr(-15, -42, 6, 8, 2); c.fill(); c.stroke(); rr(9, -42, 6, 8, 2); c.fill(); c.stroke();   // shoulder pads
      c.fillStyle = '#241544'; rr(-6, -37, 12, 9, 2); c.fill(); c.lineWidth = 1; c.stroke();   // chest screen
      c.strokeStyle = glow; c.beginPath(); c.moveTo(-3.5, -30); c.lineTo(-1.5, -33); c.lineTo(0.5, -31); c.lineTo(2.5, -34); c.stroke();
      c.strokeStyle = out; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -27); c.lineTo(0, -15); c.stroke();
      c.lineWidth = 3.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-12, -38); c.lineTo(-16, -25); c.stroke();   // left arm
      c.fillStyle = dark; c.beginPath(); c.arc(-16, -24, 2.4, 0, 7); c.fill();
      const ex = 19 + (point ? 4 : 0), ey = -46 - (point ? 5 : 0);   // raised marker arm
      c.lineWidth = 3.8; c.beginPath(); c.moveTo(12, -40); c.lineTo(ex, ey); c.stroke();
      c.strokeStyle = '#22D3EE'; c.lineWidth = 3; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + 5, ey - 4.5); c.stroke();
      c.strokeStyle = out; c.lineCap = 'butt';
      c.fillStyle = dark; c.lineWidth = 2; rr(-3, -48, 6, 5, 1); c.fill(); c.stroke();   // neck
      c.fillStyle = body; c.lineWidth = 2.5; rr(-10, -62, 20, 15, 6); c.fill(); c.stroke();   // head
      c.fillStyle = dark; rr(-12.5, -58, 3, 7, 1.5); c.fill(); c.stroke(); rr(9.5, -58, 3, 7, 1.5); c.fill(); c.stroke();   // side panels, no antenna
      c.fillStyle = '#1C1033'; rr(-7.5, -59, 15, 9, 3); c.fill();   // visor
      c.fillStyle = '#67E8F9'; c.shadowColor = '#67E8F9'; c.shadowBlur = 5; c.beginPath(); c.arc(-3.2, -54.4, 1.7, 0, 7); c.fill(); c.beginPath(); c.arc(3.2, -54.4, 1.7, 0, 7); c.fill(); c.shadowBlur = 0;
      c.strokeStyle = '#3FC7D9'; c.lineWidth = 1; c.beginPath(); c.arc(0, -53.5, 3.4, 0.25, Math.PI - 0.25); c.stroke();   // little smile
      c.restore();
    };
    const draw = () => {
      if (run) {
        t++; c.clearRect(0, 0, W, H);
        const groundY = H - 20, bx = Math.max(W * 0.30, 118), by = 20, bw = W - bx - 16, bh = groundY - by - 14;
        c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, groundY + 2); c.lineTo(W, groundY + 2); c.stroke();
        c.fillStyle = '#fbfdfc'; c.strokeStyle = '#cfd8d3'; c.lineWidth = 2; rr(bx, by, bw, bh, 8); c.fill(); c.stroke();
        c.fillStyle = '#aeb9b3'; c.fillRect(bx + 14, by + bh, bw - 28, 5);
        c.fillStyle = '#1f6f4f'; c.fillRect(bx + bw - 54, by + bh + 1, 14, 3); c.fillStyle = '#2456c8'; c.fillRect(bx + bw - 36, by + bh + 1, 14, 3);
        const sp = hov ? 1.6 : 1, home = bx - 20;
        const rtx = (follow && mx > -1e3) ? Math.min(W - 26, Math.max(8, mx - 4)) : home;   // walks toward the cursor, else back to the board
        const step = 2.2;                                           // steady walking pace — no teleporting to the cursor
        if (Math.abs(rtx - gx) > step) gx += Math.sign(rtx - gx) * step; else gx = rtx;
        const moving = Math.abs(rtx - gx) > 0.5, atBoard = !moving && gx > home - 7;
        if (phase === 'walk') { phase = 'write'; prog = 0; }        // board keeps teaching wherever the bot wanders
        else if (phase === 'write') { prog += 0.006 * sp; if (prog >= 1) { prog = 1; phase = 'hold'; holdT = 0; } }
        else if (phase === 'hold') { if (++holdT > (hov ? 60 : 120)) { phase = 'erase'; prog = 0; } }
        else if (phase === 'erase') { prog += 0.02 * sp; if (prog >= 1) { idx = (idx + 1) % lessons.length; phase = 'write'; prog = 0; } }
        const f = lessons[idx];
        const fontFor = (sz) => f.mono ? `600 ${sz}px "SF Mono", Menlo, Consolas, monospace` : `600 ${sz}px Georgia, "Times New Roman", serif`;
        let fs = f.mono ? 16 : 19; c.font = fontFor(fs);
        while (c.measureText(f.t).width > bw - 34 && fs > 10) { fs--; c.font = fontFor(fs); }
        c.textBaseline = 'middle'; c.textAlign = 'left';
        const tw = c.measureText(f.t).width, txX = bx + 17, txY = by + bh * 0.45;
        if (phase === 'write') {                                    // typewriter: glyphs appear left→right
          const sub = f.t.slice(0, Math.max(0, Math.round(prog * f.t.length)));
          c.fillStyle = f.col; c.fillText(sub, txX, txY);
          const sw = c.measureText(sub).width; c.beginPath(); c.arc(txX + sw + 2, txY, 2.4, 0, 7); c.fill();
        } else if (phase !== 'walk') {
          c.fillStyle = f.col; c.fillText(f.t, txX, txY);
          if (phase === 'erase') {                                  // whiteboard eraser wipes it away
            const ex = txX + prog * (tw + 10);
            c.fillStyle = '#fbfdfc'; c.fillRect(txX - 4, txY - 18, ex - (txX - 4), 36);
            c.fillStyle = '#dfe6e2'; c.strokeStyle = '#b3bdb8'; c.lineWidth = 1; rr(ex - 9, txY - 13, 15, 26, 2); c.fill(); c.stroke();
          }
        }
        if (phase !== 'walk') { c.fillStyle = 'rgba(110,120,115,.32)'; c.font = '12px Georgia, serif'; c.fillText(f.mono ? '# try it yourself' : '— worked example', txX + 2, txY + 28); }
        drawTutor(gx, groundY, moving, atBoard && (phase === 'write' || phase === 'hold'));
      }
      requestAnimationFrame(draw);
    };
    if (reduce) { size(); phase = 'hold'; gx = Math.max(W * 0.30, 118) - 20; prog = 1; draw(); run = false; }
    else { requestAnimationFrame(draw); onView(cv, v => run = v); }
  })();

  /* 5) RAIN card: diagonal droplets + occasional lightning */
  (() => {
    const cv = $('#rainCanvas'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, drops = [], flash = 0, bolt = null, cool = 80, hov = false, cloudOp = 0, t = 0;
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const init = () => { size(); drops = Array.from({ length: Math.max(40, Math.round(W * H / 1150)) }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 8 + Math.random() * 13, v: 2.8 + Math.random() * 3.2 })); };
    init(); addEventListener('resize', init);
    const dx = 0.5;
    const wave = (x, off, a1, f1, a2, f2, base) => base + Math.sin((x + off) * f1) * a1 + Math.sin((x + off) * f2 + 1.3) * a2;
    const cloudLayer = (style, off, a1, f1, a2, f2, base) => {  // smooth, undulating cloud underside (no circles)
      c.fillStyle = style; c.beginPath(); c.moveTo(-24, -24); c.lineTo(W + 24, -24);
      for (let x = W + 24; x >= -24; x -= 5) c.lineTo(x, wave(x, off, a1, f1, a2, f2, base));
      c.closePath(); c.fill();
    };
    const drawClouds = (op) => {                               // overcast cover rolls in from the top
      if (op < 0.02) return;
      const baseY = H * 0.16, drift = t * 0.5;
      cloudLayer(`rgba(122,136,150,${op * 0.42})`, drift * 0.55, 6, 0.05, 11, 0.017, baseY * 0.74);   // back haze
      const grad = c.createLinearGradient(0, -8, 0, baseY + 30);
      grad.addColorStop(0, `rgba(62,74,86,${op * 0.85})`); grad.addColorStop(1, `rgba(98,112,126,${op * 0.62})`);
      cloudLayer(grad, drift, 9, 0.043, 15, 0.013, baseY + 4);                                        // main overcast band
    };
    const makeBolt = () => {                                  // jagged fork from the top
      const segs = 7 + Math.floor(Math.random() * 4), main = []; let x = W * (0.25 + Math.random() * 0.5), y = 0;
      main.push({ x, y });
      for (let i = 0; i < segs; i++) { y += H / segs * (0.7 + Math.random() * 0.6); x += (Math.random() - 0.5) * W * 0.28; main.push({ x, y }); if (y >= H) break; }
      const branch = [], bi = 2 + Math.floor(Math.random() * 2);
      if (main[bi]) { let bx = main[bi].x, by = main[bi].y; branch.push({ x: bx, y: by }); for (let k = 0; k < 3; k++) { by += H / 9; bx += (Math.random() - 0.3) * W * 0.24; branch.push({ x: bx, y: by }); } }
      return { main, branch };
    };
    const strokeBolt = (pts, w, style) => { if (!pts || pts.length < 2) return; c.strokeStyle = style; c.lineWidth = w; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y); c.stroke(); };
    const strike = () => { bolt = makeBolt(); flash = 1; cool = 110 + Math.floor(Math.random() * 160); };
    const host = cv.closest('.lead') || cv.parentElement;
    host?.addEventListener('mouseenter', () => { hov = true; strike(); });   // clouds roll in + a bolt on hover
    host?.addEventListener('mouseleave', () => { hov = false; });
    const draw = () => {
      if (run) {
        t++; cloudOp += ((hov ? 1 : 0) - cloudOp) * 0.06;
        c.clearRect(0, 0, W, H); c.lineWidth = 1.6; c.lineCap = 'round';
        const boost = 1 + cloudOp * 0.6;                          // heavier downpour while overcast
        drops.forEach(d => { const g = c.createLinearGradient(d.x, d.y, d.x - d.l * dx, d.y + d.l); g.addColorStop(0, 'rgba(96,165,250,0)'); g.addColorStop(1, 'rgba(59,130,246,.75)'); c.strokeStyle = g; c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x + d.l * dx, d.y + d.l); c.stroke(); d.y += d.v * boost; d.x += d.v * dx * boost; if (d.y > H + 12) { d.y = -12; d.x = Math.random() * (W + 60); } });
        if (cool > 0) cool--;
        if (flash <= 0.02 && cool <= 0 && Math.random() < 0.02) { bolt = makeBolt(); flash = 1; cool = 110 + Math.floor(Math.random() * 160); }
        if (flash > 0.02 && bolt) {
          c.fillStyle = `rgba(96,165,250,${flash * 0.22})`; c.fillRect(0, 0, W, H);          // brief blue sky-flash
          c.shadowColor = 'rgba(37,99,235,.85)'; c.shadowBlur = 14;
          strokeBolt(bolt.main, 4, `rgba(37,99,235,${flash})`);                              // saturated blue, reads on white
          strokeBolt(bolt.branch, 2.4, `rgba(37,99,235,${flash * 0.8})`);
          strokeBolt(bolt.main, 1.6, `rgba(191,219,254,${Math.min(1, flash + 0.3)})`);        // bright hot core
          c.shadowBlur = 0; flash *= 0.82;
        }
        drawClouds(cloudOp);
      }
      requestAnimationFrame(draw);
    };
    if (reduce) { init(); } else { requestAnimationFrame(draw); onView(cv, v => run = v); }
  })();

  /* 6) AI Alliance card: a radar scope that lights up the member universities */
  (() => {
    const cv = $('#netCanvas'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, nodes = [], pings = [], sweep = 0, hov = false, mx = -1e4, my = -1e4, cx = 0, cy = 0, maxR = 0;
    const named = ['MIT', 'Stanford', 'Caltech', 'Cornell'];
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); cx = W * 0.5; cy = H * 0.5; maxR = Math.hypot(W, H) * 0.55; };
    const init = () => {
      size(); const total = Math.max(10, Math.round(W * H / 4200));
      nodes = Array.from({ length: total }, (_, i) => {
        const ang = Math.random() * Math.PI * 2, rad = (0.16 + Math.random() * 0.8) * Math.min(W, H) * 0.5;
        return { x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad, ang: (ang % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2), lit: 0, label: i < named.length ? named[i] : null, big: i < named.length };
      });
      pings = [];
    };
    init(); addEventListener('resize', init);
    const host = cv.closest('.lead') || cv.parentElement;
    host.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener('mouseenter', () => { hov = true; });
    host.addEventListener('mouseleave', () => { hov = false; mx = -1e4; my = -1e4; });
    host.addEventListener('click', () => { if (mx > -1e3) pings.push({ x: mx, y: my, r: 4, a: 0.85 }); });
    const draw = () => {
      if (run) {
        c.clearRect(0, 0, W, H);
        c.strokeStyle = 'rgba(14,122,83,.13)'; c.lineWidth = 1;
        for (let k = 1; k <= 3; k++) { c.beginPath(); c.arc(cx, cy, maxR * k / 3.2, 0, 7); c.stroke(); }
        c.beginPath(); c.moveTo(cx - maxR, cy); c.lineTo(cx + maxR, cy); c.moveTo(cx, cy - maxR); c.lineTo(cx, cy + maxR); c.stroke();
        sweep = (sweep + (hov ? 0.05 : 0.02)) % (Math.PI * 2);       // rotating radar sweep with a fading trail
        for (let k = 0; k < 26; k++) { const a = sweep - k * 0.05; c.strokeStyle = `rgba(52,211,153,${(1 - k / 26) * 0.22})`; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR); c.stroke(); }
        c.strokeStyle = 'rgba(159,240,200,.6)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(sweep) * maxR, cy + Math.sin(sweep) * maxR); c.stroke();
        nodes.forEach(n => {                                         // a node lights up as the sweep crosses it
          const d = Math.abs(((sweep - n.ang + Math.PI) % (Math.PI * 2)) - Math.PI);
          if (d < 0.12) n.lit = 1; n.lit *= 0.97;
          if (hov && mx > -1e3) { const dm = Math.hypot(n.x - mx, n.y - my); if (dm < 90) n.lit = Math.max(n.lit, 1 - dm / 90); }
        });
        for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) { const a = nodes[i], b = nodes[j]; if (a.lit < 0.25 || b.lit < 0.25) continue; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 116) { c.strokeStyle = `rgba(52,211,153,${Math.min(a.lit, b.lit) * (1 - d / 116) * 0.65})`; c.lineWidth = 1; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); } }
        if (hov && mx > -1e3 && Math.random() < 0.04) pings.push({ x: mx, y: my, r: 4, a: 0.5 });
        pings.forEach(pg => { pg.r += 1.7; pg.a *= 0.95; c.strokeStyle = `rgba(94,234,212,${pg.a})`; c.lineWidth = 1.4; c.beginPath(); c.arc(pg.x, pg.y, pg.r, 0, 7); c.stroke(); });
        pings = pings.filter(pg => pg.a > 0.04);
        c.font = '600 9px "Space Grotesk",sans-serif'; c.textAlign = 'center';
        nodes.forEach(n => {
          const lit = n.lit; c.fillStyle = `rgba(52,211,153,${0.5 + 0.5 * lit})`;
          if (lit > 0.1) { c.shadowColor = '#34D399'; c.shadowBlur = 8 * lit; }
          c.beginPath(); c.arc(n.x, n.y, (n.big ? 3.2 : 1.9) + lit * 1.6, 0, 7); c.fill(); c.shadowBlur = 0;
          if (n.label) { c.fillStyle = `rgba(159,240,200,${0.4 + 0.6 * lit})`; c.fillText(n.label, n.x, n.y - 8); }
        });
        c.fillStyle = 'rgba(159,240,200,.9)'; c.shadowColor = '#34D399'; c.shadowBlur = 10; c.beginPath(); c.arc(cx, cy, 3.2, 0, 7); c.fill(); c.shadowBlur = 0;
      }
      requestAnimationFrame(draw);
    };
    if (reduce) { init(); draw(); run = false; } else { requestAnimationFrame(draw); onView(cv, v => run = v); }
  })();

  /* 6b) Innovate card: ideas drift up as sparks and ignite */
  (() => {
    const cv = $('#sparkCanvas'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, parts = [], hov = false, mx = -1e4, my = -1e4;
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const mk = () => ({ x: Math.random() * W, y: H + Math.random() * 24, vy: 0.25 + Math.random() * 0.6, ph: Math.random() * 6.28, r: 1 + Math.random() * 1.8, ig: 0, cool: 50 + Math.random() * 200 });
    const init = () => { size(); parts = Array.from({ length: Math.max(16, Math.round(W * H / 2500)) }, mk); };
    init(); addEventListener('resize', init);
    const host = cv.closest('.lead') || cv.parentElement;
    host.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener('mouseenter', () => { hov = true; });
    host.addEventListener('mouseleave', () => { hov = false; mx = -1e4; my = -1e4; });
    const draw = () => {
      if (run) {
        c.clearRect(0, 0, W, H);
        parts.forEach(p => {
          p.y -= p.vy; p.x += Math.sin(p.y * 0.03 + p.ph) * 0.4;
          if (hov && mx > -1e3) { const dx = mx - p.x, dy = my - p.y, d = Math.hypot(dx, dy); if (d < 105 && d > 1) { p.x += dx / d * 0.9; p.y += dy / d * 0.9; if (d < 48 && p.cool > 12) p.cool = 12; } }   // ideas swarm + spark near the cursor
          p.cool--; if (p.cool <= 0 && p.ig <= 0.02) { p.ig = 1; p.cool = 110 + Math.random() * 220; }
          p.ig *= 0.93;
          if (p.y < -12) { Object.assign(p, mk()); p.y = H + 12; }
          c.fillStyle = `rgba(150,136,250,${0.38 + 0.55 * p.ig})`; c.shadowColor = '#8B7DF2'; c.shadowBlur = 6 + p.ig * 14;
          c.beginPath(); c.arc(p.x, p.y, p.r + p.ig * 2.6, 0, 7); c.fill(); c.shadowBlur = 0;
          if (p.ig > 0.3) { c.strokeStyle = `rgba(205,196,255,${p.ig * 0.7})`; c.lineWidth = 1.2; c.beginPath(); c.arc(p.x, p.y, (1 - p.ig) * 15 + 4, 0, 7); c.stroke(); }
        });
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

  /* 8) scroll companion: copper-golem buddy — trail, side-docking, presenting, emotes */
  (() => {
    const buddy = $('#buddy'); if (!buddy) return;
    if (reduce || innerWidth < 900) { buddy.style.display = 'none'; return; }
    const bubble = $('#buddyBubble');
    const BW = 78, clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const base = $('#heroBase'), HERO_TH = 96, HERO_SCALE = 1.32;    // big, perched on its base at the top
    const heroActive = () => scrollY < HERO_TH && base && base.getBoundingClientRect().width > 0;
    const aboutBase = $('#contactBase'), ABOUT_SCALE = 0.84;         // settles onto its podium in the contact green, among the lineup
    const aboutActive = () => { if (!aboutBase) return false; const r = aboutBase.getBoundingClientRect(); return r.width > 0 && r.top < innerHeight * 0.84 && r.bottom > innerHeight * 0.18; };
    if (aboutBase) new IntersectionObserver(es => aboutBase.classList.toggle('in', es[0].isIntersecting), { threshold: 0 }).observe(aboutBase);
    const sections = [
      { sel: '#top', side: 'R', y: 0.28, msg: "whoa, that's me!" },
      { sel: '#work', side: 'L', y: 0.44, msg: "here's where I've worked!" },
      { sel: '#research', side: 'R', y: 0.44, msg: "poke the map, it's live!" },
      { sel: '#projects', side: 'L', y: 0.44, msg: "stuff I build for fun!" },
      { sel: '#gallery', side: 'R', y: 0.46, msg: "a few good moments!" },
      { sel: '#leadership', side: 'L', y: 0.44, msg: "communities I started!" },
      { sel: '#honors', side: 'R', y: 0.44, msg: "some wins!" },
      { sel: '#about', side: 'L', y: 0.46, msg: "a bit about me!" },
      { sel: '#contact', side: 'R', y: 0.5, msg: "let's talk!" },
    ].map(s => ({ ...s, el: $(s.sel) })).filter(s => s.el);
    if (!sections.length) { buddy.style.display = 'none'; return; }
    let tx = innerWidth * 0.8, ty = innerHeight * 0.3, cx = tx, cy = ty, curMsg = '', scrolling = false, stopT = 0, emoteT = 0, lastY = -1;
    let pcx = cx, pcy = cy, scl = 1;
    const cur = () => { const mid = scrollY + innerHeight * 0.5; let b = sections[0]; for (const s of sections) if (s.el.getBoundingClientRect().top + scrollY <= mid) b = s; return b; };
    const setMsg = (m) => { if (m !== curMsg) { curMsg = m; bubble.textContent = m; } };
    const playEmote = (cls, ms) => { buddy.classList.add(cls); setTimeout(() => buddy.classList.remove(cls), ms); };
    const emotes = ['em-jump', 'em-nod', 'em-wiggle', 'em-spin', 'em-look', 'em-look'];
    const scheduleEmote = () => { clearTimeout(emoteT); emoteT = setTimeout(() => { if (!scrolling) { playEmote(emotes[Math.floor(Math.random() * emotes.length)], 850); scheduleEmote(); } }, 2600 + Math.random() * 2600); };

    const onScroll = () => {
      if (scrollY === lastY) return;                               // ignore spurious same-position events (Lenis rAF)
      lastY = scrollY;
      if (heroActive()) { scrolling = false; buddy.classList.remove('present', 'walking', 'dock-r', 'dock-l'); clearTimeout(stopT); setMsg(sections[0].msg); return; }
      if (aboutActive()) { scrolling = false; buddy.classList.remove('present', 'walking', 'dock-r', 'dock-l'); clearTimeout(stopT); setMsg("let's build something!"); return; }
      scrolling = true; buddy.classList.remove('present', 'dock-r', 'dock-l'); clearTimeout(emoteT);
      const max = (document.documentElement.scrollHeight - innerHeight) || 1, p = clamp(scrollY / max, 0, 1);
      tx = 16 + (0.5 + 0.4 * Math.sin(p * Math.PI * 4 + 1.05)) * (innerWidth - BW - 32);   // travels across while scrolling
      ty = (0.4 - 0.16 * Math.cos(p * Math.PI * 5)) * innerHeight;
      setMsg(cur().msg);
      clearTimeout(stopT); stopT = setTimeout(onStop, 260);
    };
    const onStop = () => {                                          // dock to whichever side is closer (keeps off the text)
      if (heroActive() || aboutActive()) return;
      scrolling = false; const s = cur();
      const side = (cx + BW / 2) < innerWidth / 2 ? 'L' : 'R';
      buddy.classList.toggle('dock-r', side === 'R'); buddy.classList.toggle('dock-l', side === 'L');
      tx = side === 'L' ? 16 : innerWidth - BW - 16;
      ty = clamp(s.y * innerHeight, 84, innerHeight - 150);
      setMsg(s.msg);
      setTimeout(() => { if (!scrolling) { buddy.classList.add('present'); scheduleEmote(); } }, 440);
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll(); cx = tx; cy = ty; bubble.classList.add('show'); onStop();
    buddy.querySelector('.buddy-bot')?.addEventListener('click', () => {   // click it: it falls to pieces, then rebuilds
      if (buddy.classList.contains('shatter')) return;
      const prev = curMsg; buddy.classList.remove('present'); buddy.classList.add('shatter'); setMsg('...uh oh.');
      setTimeout(() => setMsg('...still here.'), 1400);
      setTimeout(() => setMsg('good as new!'), 2500);
      setTimeout(() => { buddy.classList.remove('shatter'); setMsg(prev); }, 3050);
    });

    const loop = () => {
      const hero = heroActive();
      const about = !hero && aboutActive();
      let targetScale;
      if (hero) {                                                   // sit big on the base at the top of the page
        const r = base.getBoundingClientRect();
        targetScale = HERO_SCALE;
        tx = r.left + r.width / 2 - BW / 2;
        ty = r.top + r.height * 0.52 - 52.5 - 47.4 * targetScale;   // feet on the base surface
      } else if (about) {                                           // comes down onto the podium for the finale
        const r = aboutBase.getBoundingClientRect();
        targetScale = ABOUT_SCALE;
        tx = r.left + r.width / 2 - BW / 2;
        ty = r.top + r.height * 0.5 - 52.5 - 41 * targetScale;      // feet on the podium surface
      } else {
        targetScale = 0.86 + 0.3 * clamp((cy / innerHeight - 0.22) / 0.34, 0, 1);
      }
      cx += (tx - cx) * (scrolling ? 0.07 : 0.1); cy += (ty - cy) * 0.09; scl += (targetScale - scl) * 0.08;
      buddy.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px) scale(${scl.toFixed(3)})`;
      const ccx = cx + BW / 2;                                       // keep its bubble inside the viewport at the edges
      buddy.classList.toggle('bub-r', ccx > innerWidth - 132);
      buddy.classList.toggle('bub-l', ccx < 132);
      const vel = Math.hypot(cx - pcx, cy - pcy); pcx = cx; pcy = cy;
      buddy.classList.toggle('walking', !hero && !about && vel > 0.5);  // step the legs while moving
      requestAnimationFrame(loop);
    };
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

  /* 10) Baymax steps out of his red carrying case as you scroll */
  (() => {
    const card = $('#lifeCard'); if (!card) return;
    const wrap = card.querySelector('.baymax'); const rise = card.querySelector('.bm-rise');
    if (!wrap || !rise) return;
    const RISE_IN = 106, RISE_OUT = 19; let cur = RISE_IN, tgt = RISE_IN;   // feet stay tucked behind the case
    const onScroll = () => {
      const r = card.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.86 - r.top) / (innerHeight * 0.5)));
      tgt = RISE_IN + (RISE_OUT - RISE_IN) * p; wrap.classList.toggle('out', p > 0.8);
    };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
    if (reduce) { rise.setAttribute('transform', `translate(0 ${RISE_OUT})`); wrap.classList.add('out'); return; }
    const loop = () => { cur += (tgt - cur) * 0.12; rise.setAttribute('transform', `translate(0 ${cur.toFixed(1)})`); requestAnimationFrame(loop); };
    loop();
  })();

  /* 11) projects: cards tilt toward the cursor (3D parallax) */
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    $$('#projects .card').forEach(card => {
      card.addEventListener('mouseenter', () => { card.style.transition = 'transform .12s ease-out, box-shadow .3s, border-color .3s'; });
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(720px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-5px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.transition = ''; });
    });
  }

  /* 12) about-section fleet: the past iterations walk in as the page scrolls */
  (() => {
    const fleet = $('.robot-fleet'); if (!fleet || reduce) return;
    const wraps = $$('.mb-wrap', fleet), n = wraps.length, mid = (n - 1) / 2;
    if (shot) { wraps.forEach(w => { w.style.opacity = '1'; w.style.transform = 'none'; }); return; }
    const startX = wraps.map((_, i) => (n % 2 === 1 && i === mid ? 0 : (i < mid ? -1 : 1) * (132 + Math.abs(i - mid) * 64)));
    const cl = (v, a, b) => Math.min(b, Math.max(a, v));
    const ease = (t) => t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
    let scrolling = false, stopT = 0;
    const update = () => {
      const r = fleet.getBoundingClientRect();
      const p = cl((innerHeight - r.top) / (innerHeight * 0.6), 0, 1);
      wraps.forEach((w, i) => {
        const lp = cl((p - i * 0.05) / 0.5, 0, 1), e = ease(lp);
        const x = startX[i] * (1 - e), y = startX[i] === 0 ? 30 * (1 - e) : 0;
        w.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
        w.style.opacity = cl(lp * 1.7, 0, 1).toFixed(2);
        w.firstElementChild.classList.toggle('walking', scrolling && lp > 0.02 && lp < 0.99);
      });
    };
    addEventListener('scroll', () => { scrolling = true; clearTimeout(stopT); stopT = setTimeout(() => { scrolling = false; update(); }, 170); update(); }, { passive: true });
    addEventListener('resize', update); update();
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

  /* podium pup naps; a click wakes it — eyes open — before it dozes off again */
  (() => {
    const dog = $('.lying-dog'); if (!dog) return;
    let t;
    dog.addEventListener('click', () => {
      dog.classList.add('awake');
      clearTimeout(t);
      t = setTimeout(() => dog.classList.remove('awake'), 2600);
    });
  })();
})();
