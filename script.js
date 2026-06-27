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

  /* 4) agentic workflow — a rounded-rect circuit that frames the text */
  (() => {
    const cv = $('#agenticFlow'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, pulse = 0, cx = 0, cy = 0, hw = 0, hh = 0, rad = 0, path = [], topMid = 0;
    const labels = ['Request', 'Plan', 'Tools · MCP', 'Execute', 'Verify', 'Respond'];
    const N = labels.length;
    const layout = () => {
      cx = W / 2; cy = H / 2; hw = Math.max(80, W / 2 - 50); hh = Math.max(46, H / 2 - 26); rad = Math.min(38, hh, hw);
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

  /* 5) RAIN card: diagonal droplets + occasional lightning */
  (() => {
    const cv = $('#rainCanvas'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, drops = [], flash = 0, bolt = null, cool = 80;
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const init = () => { size(); drops = Array.from({ length: Math.max(18, Math.round(W * H / 2400)) }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 7 + Math.random() * 11, v: 2.2 + Math.random() * 2.6 })); };
    init(); addEventListener('resize', init);
    const dx = 0.5;
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
    host?.addEventListener('mouseenter', strike);                 // a bolt every time you hover the panel
    const draw = () => {
      if (run) {
        c.clearRect(0, 0, W, H); c.lineWidth = 1.6; c.lineCap = 'round';
        drops.forEach(d => { const g = c.createLinearGradient(d.x, d.y, d.x - d.l * dx, d.y + d.l); g.addColorStop(0, 'rgba(96,165,250,0)'); g.addColorStop(1, 'rgba(59,130,246,.75)'); c.strokeStyle = g; c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x + d.l * dx, d.y + d.l); c.stroke(); d.y += d.v; d.x += d.v * dx; if (d.y > H + 12) { d.y = -12; d.x = Math.random() * (W + 60); } });
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
      }
      requestAnimationFrame(draw);
    };
    if (reduce) { init(); } else { requestAnimationFrame(draw); onView(cv, v => run = v); }
  })();

  /* 6) AI Alliance card: a living network — hubs, signals between chapters, radar pings */
  (() => {
    const cv = $('#netCanvas'); if (!cv) return;
    const c = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, run = true, pts = [], pulses = [], rings = [];
    const D = 80;
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const init = () => {
      size(); const n = Math.max(11, Math.round(W * H / 4600));
      pts = Array.from({ length: n }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, hub: i % 4 === 0, r: i % 4 === 0 ? 3.1 : 1.8 }));
      pulses = []; rings = [];
    };
    init(); addEventListener('resize', init);
    const spawn = () => {
      if (pulses.length > 5) return; const a = Math.floor(Math.random() * pts.length); let b = -1, best = D;
      for (let j = 0; j < pts.length; j++) { if (j === a) continue; const d = Math.hypot(pts[a].x - pts[j].x, pts[a].y - pts[j].y); if (d < best) { best = d; b = j; } }
      if (b >= 0) pulses.push({ a, b, p: 0, sp: 0.02 + Math.random() * 0.02 });
    };
    const draw = () => {
      if (run) {
        c.clearRect(0, 0, W, H);
        pts.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; });
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < D) { c.strokeStyle = `rgba(14,122,83,${(1 - d / D) * 0.5})`; c.lineWidth = 1; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); } }
        if (Math.random() < 0.06) spawn();
        if (Math.random() < 0.014) { const h = pts.find(p => p.hub) || pts[0]; if (h) rings.push({ x: h.x, y: h.y, r: 3, a: 0.7 }); }
        pulses.forEach(pu => { const a = pts[pu.a], b = pts[pu.b]; pu.p += pu.sp; const x = a.x + (b.x - a.x) * pu.p, y = a.y + (b.y - a.y) * pu.p; c.fillStyle = '#5EEAD4'; c.shadowColor = '#34D399'; c.shadowBlur = 8; c.beginPath(); c.arc(x, y, 2.3, 0, 7); c.fill(); c.shadowBlur = 0; });
        pulses = pulses.filter(pu => pu.p < 1);
        rings.forEach(rg => { rg.r += 0.7; rg.a *= 0.96; c.strokeStyle = `rgba(52,211,153,${rg.a})`; c.lineWidth = 1.2; c.beginPath(); c.arc(rg.x, rg.y, rg.r, 0, 7); c.stroke(); });
        rings = rings.filter(rg => rg.a > 0.05);
        pts.forEach(p => { if (p.hub) { c.fillStyle = 'rgba(52,211,153,.95)'; c.shadowColor = '#34D399'; c.shadowBlur = 8; } else { c.fillStyle = 'rgba(14,122,83,.85)'; c.shadowBlur = 0; } c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); c.shadowBlur = 0; });
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
    const base = $('#heroBase'), HERO_TH = 96, HERO_SCALE = 1.5;     // big, perched on its base at the top
    const heroActive = () => scrollY < HERO_TH && base && base.getBoundingClientRect().width > 0;
    // motion-trail canvas, just behind the buddy
    const tc = document.createElement('canvas'); tc.className = 'buddy-trail'; tc.setAttribute('aria-hidden', 'true');
    buddy.parentNode.insertBefore(tc, buddy);
    const g = tc.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    const sizeT = () => { tc.width = innerWidth * dpr; tc.height = innerHeight * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    sizeT();
    const sections = [
      { sel: '#top', side: 'R', y: 0.28, msg: "hey, I'll show you around!" },
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
    let path = [], pcx = cx, pcy = cy, scl = 1;
    const cur = () => { const mid = scrollY + innerHeight * 0.5; let b = sections[0]; for (const s of sections) if (s.el.getBoundingClientRect().top + scrollY <= mid) b = s; return b; };
    const setMsg = (m) => { if (m !== curMsg) { curMsg = m; bubble.textContent = m; } };
    const playEmote = (cls, ms) => { buddy.classList.add(cls); setTimeout(() => buddy.classList.remove(cls), ms); };
    const emotes = ['em-jump', 'em-nod', 'em-wiggle', 'em-spin'];
    const scheduleEmote = () => { clearTimeout(emoteT); emoteT = setTimeout(() => { if (!scrolling) { playEmote(emotes[Math.floor(Math.random() * emotes.length)], 850); scheduleEmote(); } }, 2600 + Math.random() * 2600); };

    const onScroll = () => {
      if (scrollY === lastY) return;                               // ignore spurious same-position events (Lenis rAF)
      lastY = scrollY;
      if (heroActive()) { scrolling = false; buddy.classList.remove('present', 'walking'); clearTimeout(stopT); setMsg(sections[0].msg); return; }
      scrolling = true; buddy.classList.remove('present'); clearTimeout(emoteT);
      const max = (document.documentElement.scrollHeight - innerHeight) || 1, p = clamp(scrollY / max, 0, 1);
      tx = 16 + (0.5 + 0.4 * Math.sin(p * Math.PI * 4 + 1.05)) * (innerWidth - BW - 32);   // travels across while scrolling
      ty = (0.4 - 0.16 * Math.cos(p * Math.PI * 5)) * innerHeight;
      setMsg(cur().msg);
      clearTimeout(stopT); stopT = setTimeout(onStop, 260);
    };
    const onStop = () => {                                          // dock to whichever side is closer (keeps off the text)
      if (heroActive()) return;
      scrolling = false; const s = cur();
      const side = (cx + BW / 2) < innerWidth / 2 ? 'L' : 'R';
      tx = side === 'L' ? 16 : innerWidth - BW - 16;
      ty = clamp(s.y * innerHeight, 84, innerHeight - 150);
      setMsg(s.msg);
      setTimeout(() => { if (!scrolling) { buddy.classList.add('present'); scheduleEmote(); } }, 440);
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', () => { sizeT(); onScroll(); });
    onScroll(); cx = tx; cy = ty; bubble.classList.add('show'); onStop();

    const HW = 9;                                                   // half-width of the bridge deck
    const edges = () => {                                            // left/right rail points along the path
      const n = path.length, L = [], R = [];
      for (let i = 0; i < n; i++) {
        const a = path[Math.max(0, i - 1)], b = path[Math.min(n - 1, i + 1)];
        let dx = b.x - a.x, dy = b.y - a.y; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
        const nx = -dy, ny = dx;
        L.push({ x: path[i].x + nx * HW, y: path[i].y + ny * HW });
        R.push({ x: path[i].x - nx * HW, y: path[i].y - ny * HW });
      }
      return { L, R };
    };
    const drawTrail = () => {                                       // render the path as a little plank bridge
      g.clearRect(0, 0, innerWidth, innerHeight);
      const n = path.length; if (n < 2) return;
      const { L, R } = edges();
      for (let i = 1; i < n; i++) {
        const f = i / n;
        g.fillStyle = `rgba(206,134,80,${f * 0.34})`;                // wooden deck
        g.beginPath(); g.moveTo(L[i - 1].x, L[i - 1].y); g.lineTo(L[i].x, L[i].y); g.lineTo(R[i].x, R[i].y); g.lineTo(R[i - 1].x, R[i - 1].y); g.closePath(); g.fill();
        g.strokeStyle = `rgba(110,58,32,${f * 0.65})`; g.lineWidth = 2.4; g.lineCap = 'round';   // rails
        g.beginPath(); g.moveTo(L[i - 1].x, L[i - 1].y); g.lineTo(L[i].x, L[i].y); g.stroke();
        g.beginPath(); g.moveTo(R[i - 1].x, R[i - 1].y); g.lineTo(R[i].x, R[i].y); g.stroke();
      }
      for (let i = 0; i < n; i += 3) {                              // cross planks
        const f = i / n; g.strokeStyle = `rgba(122,66,38,${f * 0.6})`; g.lineWidth = 2.8;
        g.beginPath(); g.moveTo(L[i].x, L[i].y); g.lineTo(R[i].x, R[i].y); g.stroke();
      }
      const last = path[n - 1], prev = path[Math.max(0, n - 6)], vx = last.x - prev.x, vy = last.y - prev.y, mm = Math.hypot(vx, vy) || 1;
      const ux = vx / mm, uy = vy / mm, nx = -uy, ny = ux;          // a few planks projected ahead
      for (let k = 1; k <= 3; k++) {
        const cxp = last.x + ux * 9 * k, cyp = last.y + uy * 9 * k, a = 0.3 - k * 0.08;
        g.strokeStyle = `rgba(122,66,38,${a})`; g.lineWidth = 2.6;
        g.beginPath(); g.moveTo(cxp + nx * HW, cyp + ny * HW); g.lineTo(cxp - nx * HW, cyp - ny * HW); g.stroke();
      }
    };
    const loop = () => {
      const hero = heroActive();
      let targetScale;
      if (hero) {                                                   // sit big on the base at the top of the page
        const r = base.getBoundingClientRect();
        targetScale = HERO_SCALE;
        tx = r.left + r.width / 2 - BW / 2;
        ty = r.top + r.height * 0.52 - 51.5 - 48 * targetScale;     // feet on the base surface
      } else {
        targetScale = 0.86 + 0.3 * clamp((cy / innerHeight - 0.22) / 0.34, 0, 1);
      }
      cx += (tx - cx) * (scrolling ? 0.07 : 0.1); cy += (ty - cy) * 0.09; scl += (targetScale - scl) * 0.08;
      buddy.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px) scale(${scl.toFixed(3)})`;
      const ccx = cx + BW / 2;                                       // keep its bubble inside the viewport at the edges
      buddy.classList.toggle('bub-r', ccx > innerWidth - 132);
      buddy.classList.toggle('bub-l', ccx < 132);
      const vel = Math.hypot(cx - pcx, cy - pcy); pcx = cx; pcy = cy;
      buddy.classList.toggle('walking', !hero && vel > 0.5);        // step the legs while moving
      if (!hero) {
        const fx = cx + BW / 2, fy = cy + 98 * scl;                 // ground point at its feet
        const lp = path[path.length - 1];
        if (!lp || Math.hypot(fx - lp.x, fy - lp.y) > 4) path.push({ x: fx, y: fy });
        if (path.length > 46) path.shift();
      } else if (path.length) { path = []; }                        // pull the bridge in while perched
      if (!scrolling && path.length > 1 && Math.random() < 0.28) path.shift();   // bridge recedes once it stops
      drawTrail();
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
    const RISE_IN = 106, RISE_OUT = 11; let cur = RISE_IN, tgt = RISE_IN;   // feet stay tucked behind the case
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
