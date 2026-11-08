(function () {
  'use strict';
  var C = window.GIFT;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = innerWidth < 700;
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var ordinal = function (n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  var fill = function (t) {
    return String(t).replace(/\{name\}/g, C.herName).replace(/\{him\}/g, C.hisName)
      .replace(/\{age\}/g, C.age).replace(/\{ordinal\}/g, ordinal(C.age));
  };
  var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

  /* ---------- fill names ---------- */
  document.title = 'A universe for ' + C.herName + ' ✦';
  $('#m-name').textContent = C.herName.toUpperCase();
  $('#t-him').textContent = C.hisName;
  $('#const-name').textContent = C.herName;
  $('#f-name').textContent = C.herName;
  $('#f-him').textContent = C.hisName;
  $('#c-name').textContent = C.herName;
  $('#c-date').textContent = C.birthday;
  $('#c-cat').textContent = C.certificate.catalog;
  $('#c-bri').textContent = C.certificate.brightness;
  $('#c-dis').textContent = fill(C.certificate.distance);
  $('#c-him').textContent = C.hisName;
  $('#c-own').textContent = fill(C.certificate.owner);

  function show(id) {
    $$('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
  }

  /* =====================================================
     SOUND (tiny synth, no files needed) + MUSIC
     ===================================================== */
  var Snd = (function () {
    var ac = null, muted = false;
    function ctx() {
      if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
      if (ac && ac.state === 'suspended') ac.resume();
      return ac;
    }
    function tone(f, d, v, type, delay) {
      if (muted) return; var a = ctx(); if (!a) return;
      var t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v || 0.06, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (d || 1));
      o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + (d || 1) + 0.05);
    }
    function noise(dur) {
      var a = ctx(), n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      var s = a.createBufferSource(); s.buffer = buf; return s;
    }
    var S = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26];
    return {
      unlock: function () { ctx(); },
      bell: function (f) { tone(f, 1.7, 0.06, 'sine'); tone(f * 2.01, 1.1, 0.022, 'triangle'); },
      step: function (i) { this.bell(523.25 * Math.pow(2, S[i % S.length] / 12)); },
      key: function (d) { tone(440 + d * 45, 0.18, 0.035, 'sine'); },
      bad: function () { tone(150, 0.35, 0.07, 'sawtooth'); tone(120, 0.4, 0.06, 'sawtooth', 0.12); },
      ok: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 1.2, 0.05, 'sine', i * 0.09); }); },
      arp: function () { [523, 659, 784, 1047, 1319, 1568].forEach(function (f, i) { tone(f, 1.6, 0.05, 'sine', i * 0.11); }); },
      tick: function () { tone(880, 0.12, 0.04, 'square'); },
      whoosh: function (dur) {
        if (muted) return; var a = ctx(); if (!a) return;
        var s = noise(dur), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
        f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.setValueAtTime(180, t); f.frequency.exponentialRampToValueAtTime(3200, t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.14, t + dur * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
      },
      pop: function () {
        if (muted) return; var a = ctx(); if (!a) return;
        var s = noise(0.3), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
        f.type = 'lowpass'; f.frequency.value = 900;
        g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
      },
      get muted() { return muted; },
      set muted(v) { muted = v; }
    };
  })();

  var Music = (function () {
    var audio = null, ready = false, wanted = false;
    var exts = ['.mp3', '.m4a', '.ogg', '.wav'], idx = 0;
    function init() {
      if (!C.music) return;
      var base = C.music.replace(/\.(mp3|m4a|ogg|wav)$/i, '');
      audio = new Audio(); audio.loop = true; audio.preload = 'auto'; audio.volume = 0.7;
      audio.addEventListener('canplay', function () { ready = true; if (wanted && !Snd.muted) audio.play().catch(function () { }); });
      audio.addEventListener('error', function () { idx++; if (idx < exts.length) audio.src = base + exts[idx]; else audio = null; });
      audio.src = base + exts[0];
    }
    return {
      init: init,
      unlock: function () {
        if (!audio) return;
        try { audio.muted = true; var p = audio.play(); if (p && p.then) p.then(function () { audio.pause(); audio.currentTime = 0; audio.muted = false; }).catch(function () { audio.muted = false; }); } catch (e) { audio.muted = false; }
      },
      start: function () { wanted = true; if (audio && ready && !Snd.muted) audio.play().catch(function () { }); },
      pause: function () { if (audio) audio.pause(); },
      resume: function () { if (audio && wanted && !Snd.muted) audio.play().catch(function () { }); },
      get exists() { return !!audio; }
    };
  })();
  Music.init();

  var soundBtn = $('#sound-btn');
  soundBtn.addEventListener('click', function () {
    Snd.muted = !Snd.muted;
    soundBtn.classList.toggle('off', Snd.muted);
    if (Snd.muted) Music.pause(); else Music.resume();
  });

  /* =====================================================
     SKY: 3D starfield with warp speed
     ===================================================== */
  var Sky = (function () {
    var cv = $('#sky'), cx = cv.getContext('2d'), W, H, dpr, stars = [], speed = 0.5, target = 0.5;
    var cols = ['255,246,224', '255,200,225', '200,190,255', '255,255,255', '255,225,170'];
    function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function mk(s, fresh) {
      s.x = rand(-2.4, 2.4); s.y = rand(-2.4, 2.4); s.z = fresh ? rand(0.06, 1) : 1; s.pz = s.z; s.c = cols[Math.floor(Math.random() * cols.length)]; s.tw = rand(0, 6.28); return s;
    }
    resize(); addEventListener('resize', resize);
    var n = isMobile ? 210 : 340;
    for (var i = 0; i < n; i++) stars.push(mk({}, true));
    var t0 = 0;
    function frame(t) {
      speed += (target - speed) * 0.05;
      cx.clearRect(0, 0, W, H);
      cx.lineCap = 'round';
      var kx = W * 0.21, ky = H * 0.21;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.pz = s.z; s.z -= speed * 0.0009;
        if (s.z <= 0.04) { mk(s, false); continue; }
        var sx = W / 2 + s.x / s.z * kx, sy = H / 2 + s.y / s.z * ky;
        if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) { mk(s, false); continue; }
        var px = W / 2 + s.x / s.pz * kx, py = H / 2 + s.y / s.pz * ky;
        var near = 1 - s.z, a = clamp(near * 1.5 + 0.12, 0.1, 1) * (0.78 + 0.22 * Math.sin(t * 0.002 + s.tw));
        cx.strokeStyle = 'rgba(' + s.c + ',' + a.toFixed(3) + ')';
        cx.lineWidth = near * 2.4 + 0.5;
        cx.beginPath(); cx.moveTo(px, py); cx.lineTo(sx + 0.01, sy); cx.stroke();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return { to: function (v) { target = v; }, get speed() { return speed; } };
  })();

  /* =====================================================
     FIREWORKS + CONFETTI
     ===================================================== */
  var FW = (function () {
    var cv = $('#fw'), cx = cv.getContext('2d'), W, H, dpr, ps = [], rk = [], running = false, until = 0, lastL = 0;
    function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    resize(); addEventListener('resize', resize);
    function burst(x, y, hue) {
      var n = isMobile ? 44 : 70; hue = hue == null ? rand(0, 360) : hue;
      for (var i = 0; i < n; i++) {
        var a = i / n * 6.283 + rand(0, 0.2), sp = rand(1.2, 5.2) * (0.5 + Math.random() * 0.7);
        ps.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, dec: rand(0.011, 0.02), hue: hue + rand(-18, 18), s: rand(1.3, 2.6) });
      }
      kick();
    }
    function launch() { rk.push({ x: rand(W * 0.15, W * 0.85), y: H + 10, vy: -rand(8, 11.5), ty: rand(H * 0.14, H * 0.5), hue: rand(300, 360) % 360 + (Math.random() < .4 ? 40 : 0) }); kick(); }
    function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
    function loop(t) {
      cx.clearRect(0, 0, W, H); cx.globalCompositeOperation = 'lighter';
      if (Date.now() < until && t - lastL > 420) { lastL = t; launch(); if (Math.random() < 0.5) launch(); }
      for (var i = rk.length - 1; i >= 0; i--) {
        var r = rk[i]; r.y += r.vy; r.vy *= 0.987;
        cx.fillStyle = 'hsla(' + r.hue + ',100%,80%,.9)'; cx.beginPath(); cx.arc(r.x, r.y, 2, 0, 6.283); cx.fill();
        if (r.y <= r.ty || r.vy > -2.2) { burst(r.x, r.y, r.hue); Snd.pop(); rk.splice(i, 1); }
      }
      for (var j = ps.length - 1; j >= 0; j--) {
        var p = ps[j]; p.vy += 0.045; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy; p.life -= p.dec;
        if (p.life <= 0) { ps.splice(j, 1); continue; }
        cx.fillStyle = 'hsla(' + p.hue + ',100%,' + (62 + p.life * 20) + '%,' + p.life.toFixed(2) + ')';
        cx.beginPath(); cx.arc(p.x, p.y, p.s * (0.5 + p.life * 0.6), 0, 6.283); cx.fill();
      }
      cx.globalCompositeOperation = 'source-over';
      if (ps.length || rk.length || Date.now() < until) requestAnimationFrame(loop); else { running = false; cx.clearRect(0, 0, W, H); }
    }
    return { burst: burst, show: function (ms) { until = Date.now() + ms; kick(); } };
  })();

  function confetti(n) {
    if (reduce) return;
    var box = $('#confetti'), em = ['💖', '🌸', '✨', '💗', '⭐', '🎀'], cols = ['#ff9ec4', '#ffd9a0', '#c9a0ff', '#fff6e0', '#ff6f9f'];
    for (var i = 0; i < n; i++) {
      var el = document.createElement('div'); el.className = 'cf';
      if (i % 3 === 0) { el.textContent = em[i % em.length]; el.style.fontSize = rand(16, 26) + 'px'; }
      else { el.style.width = rand(7, 12) + 'px'; el.style.height = rand(10, 16) + 'px'; el.style.background = cols[i % cols.length]; el.style.borderRadius = '2px'; }
      el.style.left = rand(0, 100) + '%';
      el.style.setProperty('--cx', rand(-90, 90) + 'px'); el.style.setProperty('--cr', rand(-540, 540) + 'deg');
      el.style.animationDuration = rand(3, 6) + 's'; el.style.animationDelay = rand(0, 1.2) + 's';
      box.appendChild(el);
      (function (x) { setTimeout(function () { x.remove(); }, 8000); })(el);
    }
  }

  /* =====================================================
     ASSETS (photos + videos found by trying file endings)
     ===================================================== */
  var IMG_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG'];
  var VID_EXT = ['.mp4', '.webm', '.MP4', '.mov', '.MOV'];
  /* Accepts "photo-01" (looked up in the assets folder, endings tried automatically),
     "IMG_123.jpg" (exact file in the assets folder) or "surprise/IMG_123.jpg" (any path from the site root). */
  var HAS_EXT = /\.(jpe?g|png|webp|gif|mp4|webm|mov)$/i;
  function candidates(file, folder, exts) {
    file = String(file).replace(/^\.?\//, '');
    var base = file.indexOf('/') >= 0 ? file : folder + file;
    if (HAS_EXT.test(base)) return [base];
    return exts.map(function (e) { return base + e; });
  }
  function probeImage(file) {
    return new Promise(function (res) {
      var list = candidates(file, 'assets/photos/', IMG_EXT), i = 0;
      (function next() {
        if (i >= list.length) return res(null);
        var im = new Image();
        im.onload = function () { res({ src: im.src, w: im.naturalWidth, h: im.naturalHeight }); };
        im.onerror = function () { i++; next(); };
        im.src = list[i];
      })();
    });
  }
  function probeVideo(file) {
    return new Promise(function (res) {
      var list = candidates(file, 'assets/videos/', VID_EXT), i = 0, done = false;
      setTimeout(function () { if (!done) { done = true; res(null); } }, 9000);
      (function next() {
        if (done) return;
        if (i >= list.length) { done = true; return res(null); }
        var v = document.createElement('video'); v.preload = 'metadata'; v.muted = true;
        v.onloadedmetadata = function () { if (!done) { done = true; res({ src: list[i] }); } };
        v.onerror = function () { i++; next(); };
        v.src = list[i];
      })();
    });
  }
  var assetsP = null;
  function loadAssets() {
    if (assetsP) return assetsP;
    var ps = Promise.all(C.photos.map(function (p) { return probeImage(p.file); }));
    var vs = Promise.all(C.videos.map(function (v) { return probeVideo(v.file); }));
    assetsP = Promise.all([ps, vs]).then(function (r) {
      return {
        photos: C.photos.map(function (p, i) { var f = r[0][i]; return { ok: !!f, src: f && f.src, w: f && f.w, h: f && f.h, caption: p.caption || '', n: i + 1 }; }),
        videos: C.videos.map(function (v, i) { var f = r[1][i]; return { ok: !!f, src: f && f.src, title: v.title || '', caption: v.caption || '', n: i + 1 }; })
      };
    });
    return assetsP;
  }

  /* =====================================================
     1. INTRO
     ===================================================== */
  var fast = false;
  $('#s-intro').addEventListener('pointerdown', function () { fast = true; });
  async function typeLine(text) {
    var el = $('#intro-line'); el.classList.remove('out'); el.textContent = ''; el.classList.add('typing'); fast = false;
    for (var k = 0; k < text.length; k++) {
      el.textContent += text[k];
      await wait(fast ? 0 : (/[.,…]/.test(text[k]) ? 260 : 50));
    }
    el.classList.remove('typing');
    await wait(fast ? 250 : 1400);
    el.classList.add('out'); await wait(650);
  }
  var started = false;
  $('#start-star').addEventListener('click', async function () {
    if (started) return; started = true;
    Snd.unlock(); Music.unlock(); Snd.bell(784);
    loadAssets();
    $('#start-star').style.display = 'none'; $('#start-txt').style.display = 'none';
    Sky.to(1.6);
    for (var i = 0; i < C.introLines.length; i++) await typeLine(fill(C.introLines[i]));
    Sky.to(0.6);
    show('s-lock'); $('#lock-msg').textContent = C.hint || '';
  });

  /* =====================================================
     2. LOCK
     ===================================================== */
  var entry = '', busy = false;
  var slots = $('#slots'), lockMsg = $('#lock-msg'), orb = $('#orb');
  function paint(cls) {
    $$('i', slots).forEach(function (d, i) { d.classList.toggle('f', i < entry.length); });
    slots.className = 'slots' + (cls ? ' ' + cls : '');
  }
  function press(k) {
    if (busy) return;
    if (k === 'clear') { entry = ''; paint(); return; }
    if (entry.length >= 4) return;
    entry += k; Snd.key(+k); paint();
    if (entry.length === 4) { busy = true; setTimeout(check, 280); }
  }
  function check() {
    if (window.hashCode(C.salt + entry) === C.passcodeHash) { launch(); }
    else {
      Snd.bad(); paint('bad'); orb.classList.add('bad');
      lockMsg.textContent = "Access denied. That's not our code… think of our special numbers 💭";
      wait(700).then(function () { entry = ''; paint(); orb.classList.remove('bad'); busy = false; });
    }
  }
  $$('#keypad button').forEach(function (b) { b.addEventListener('click', function () { press(b.getAttribute('data-k')); }); });
  document.addEventListener('keydown', function (e) {
    if (!$('#s-lock').classList.contains('active')) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace' || e.key === 'Escape') press('clear');
  });

  /* =====================================================
     3. LAUNCH (warp jump)
     ===================================================== */
  async function launch() {
    slots.className = 'slots ok'; $$('i', slots).forEach(function (d) { d.classList.add('f'); });
    orb.classList.add('ok'); $('#lock-title').textContent = 'Code accepted'; lockMsg.textContent = 'Welcome aboard, ' + C.herName + ' ✦';
    Snd.ok(); soundBtn.hidden = false; Music.start();
    await wait(1300);
    show('s-launch');
    var lines = ['Hold on tight, ' + C.herName + '…', 'Engines ready…', 'Launching…'];
    Sky.to(48); Snd.whoosh(3);
    for (var n = 3; n >= 1; n--) {
      var c = $('#count'); c.textContent = n; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
      $('#launch-txt').textContent = lines[3 - n]; Snd.tick();
      await wait(950);
    }
    $('#flash').classList.add('go');
    await wait(380);
    Sky.to(0.7);
    birth();
  }

  /* =====================================================
     4. STAR REVEAL (particles: name -> heart -> birthday)
     ===================================================== */
  function fitPts(pts, P) {
    var out = [], len = pts.length; if (!len) return out;
    pts = shuffle(pts);
    for (var i = 0; i < P; i++) {
      var q = pts[i % len];
      out.push(i < len ? q : [q[0] + rand(-2, 2), q[1] + rand(-2, 2)]);
    }
    return out;
  }
  function sampleText(lines, W, H, P) {
    var o = document.createElement('canvas'); o.width = W; o.height = H;
    var x = o.getContext('2d'), size = Math.min(W * 0.34, 190);
    var font = function (s) { return '700 ' + s + 'px "Dancing Script","Brush Script MT",cursive'; };
    x.font = font(size);
    var wmax = 1; lines.forEach(function (l) { wmax = Math.max(wmax, x.measureText(l).width); });
    size = Math.min(size, size * (W * 0.86) / wmax, H * 0.34 / lines.length);
    x.font = font(size); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    var lh = size * 1.1, y0 = H * 0.4 - (lines.length - 1) * lh / 2;
    lines.forEach(function (l, i) { x.fillText(l, W / 2, y0 + i * lh); });
    var d = x.getImageData(0, 0, W, H).data, pts = [], step = Math.max(2, Math.round(size / 40));
    for (var y = 0; y < H; y += step) for (var xx = 0; xx < W; xx += step) if (d[(y * W + xx) * 4 + 3] > 128) pts.push([xx, y]);
    return fitPts(pts, P);
  }
  function heartPts(W, H, P) {
    var S = Math.min(W * 0.66, H * 0.38), u = S / 2.3, cx0 = W / 2, cy0 = H * 0.38, pts = [], st = 3.5;
    for (var gx = cx0 - 1.3 * u; gx < cx0 + 1.3 * u; gx += st) for (var gy = cy0 - 1.45 * u; gy < cy0 + 1.2 * u; gy += st) {
      var nx = (gx - cx0) / u, ny = -(gy - cy0) / u, a = nx * nx + ny * ny - 1;
      if (a * a * a - nx * nx * ny * ny * ny <= 0) pts.push([gx, gy]);
    }
    return fitPts(pts, P);
  }
  var birthRun = false;
  async function birth() {
    show('s-birth');
    var cap = $('#birth-cap'), btn = $('#begin-btn');
    var say = async function (t) { cap.style.opacity = 0; await wait(400); cap.textContent = fill(t); cap.style.opacity = 1; };
    btn.onclick = beginJourney;
    if (reduce) { cap.textContent = fill(C.birthLines[3] || ''); btn.hidden = false; return; }
    var cv = $('#birth'), cx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    try { await Promise.race([document.fonts.load('700 100px "Dancing Script"'), wait(1500)]); } catch (e) { }
    var P = isMobile ? 1150 : 1700;
    var sets = [sampleText([C.herName], W, H, P), heartPts(W, H, P), sampleText(['Happy ' + ordinal(C.age), 'Birthday'], W, H, P)];
    var pal = ['255,158,196', '255,217,160', '255,240,220', '255,255,255', '210,170,255'];
    var ps = [], i;
    for (i = 0; i < P; i++) {
      var a = rand(0, 6.283), r = Math.max(W, H) * rand(0.6, 1.1);
      ps.push({ x: W / 2 + Math.cos(a) * r, y: H * 0.4 + Math.sin(a) * r, vx: 0, vy: 0, tx: W / 2, ty: H / 2, c: pal[i % pal.length], r: rand(1, 2.1), ph: rand(0, 6.28) });
    }
    function assign(k) { var s = sets[k]; for (var j = 0; j < P; j++) { ps[j].tx = s[j][0]; ps[j].ty = s[j][1]; ps[j].vx += rand(-3, 3); ps[j].vy += rand(-3, 3); } }
    var mx = null, my = null;
    cv.onpointermove = function (e) { var b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; };
    cv.onpointerdown = cv.onpointermove; cv.onpointerup = cv.onpointerleave = function () { mx = my = null; };
    birthRun = true;
    function loop(t) {
      if (!birthRun) return;
      cx.clearRect(0, 0, W, H); cx.globalCompositeOperation = 'lighter';
      for (var j = 0; j < ps.length; j++) {
        var p = ps[j];
        p.vx = (p.vx + (p.tx - p.x) * 0.02) * 0.88; p.vy = (p.vy + (p.ty - p.y) * 0.02) * 0.88;
        if (mx !== null) { var ex = p.x - mx, ey = p.y - my, d2 = ex * ex + ey * ey; if (d2 < 9000) { var f = (1 - d2 / 9000) * 2.6, d = Math.sqrt(d2) + 1; p.vx += ex / d * f; p.vy += ey / d * f; } }
        p.x += p.vx; p.y += p.vy;
        var rr = p.r * (0.85 + 0.35 * Math.sin(t * 0.004 + p.ph));
        cx.fillStyle = 'rgba(' + p.c + ',.9)'; cx.beginPath(); cx.arc(p.x, p.y, rr, 0, 6.283); cx.fill();
      }
      cx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    say(C.birthLines[0]); assign(0); Snd.whoosh(2);
    await wait(3400); say(C.birthLines[1]);
    await wait(2800); say(C.birthLines[2]); assign(1); Snd.bell(659);
    await wait(3700); say(C.birthLines[3]); assign(2); Snd.arp(); confetti(50);
    await wait(2600);
    cap.style.opacity = 0; await wait(500);
    cap.textContent = C.birthFinal; cap.style.opacity = 1;
    btn.hidden = false;
  }

  /* =====================================================
     5. MAIN: flight through memories
     ===================================================== */
  var nodes = [], count = 0, GAP = 1000, FOCUS = 40;
  var flightBuilt = false, mouseX = 0, mouseY = 0, curP = 0, lastY = 0, lbList = [], lbI = 0;
  var world = $('#world'), flight = $('#flight');

  async function beginJourney() {
    $('#begin-btn').hidden = true; birthRun = false;
    var A = await loadAssets();
    if (!flightBuilt) { flightBuilt = true; buildFlight(A); setupLetter(); setupGame(); setupFinale(); }
    $('#s-main').hidden = false;
    show('none'); window.scrollTo(0, 0);
    Sky.to(0.8);
    observeReveals();
    requestAnimationFrame(tick);
  }

  function nodeEl(cls, html) { var d = document.createElement('div'); d.className = 'node ' + cls; if (html) d.innerHTML = html; return d; }
  function place(el, x, y, z, rot) {
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px) translate(-50%,-50%) rotate(' + (rot || 0) + 'deg)';
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function buildFlight(A) {
    world.innerHTML = ''; nodes = [];
    var vw = innerWidth, vh = innerHeight;
    var photos = A.photos.filter(function (p) { return p.ok || C.showPlaceholders; });
    var vids = A.videos.filter(function (v) { return v.ok || C.showPlaceholders; });
    var seq = [];
    photos.forEach(function (p, i) {
      if (i % 4 === 0 && C.chapters[i / 4]) seq.push({ t: 'chap', d: C.chapters[i / 4] });
      seq.push({ t: 'photo', d: p, i: i });
    });
    if (vids.length) { if (C.chapters[3]) seq.push({ t: 'chap', d: C.chapters[3] }); vids.forEach(function (v) { seq.push({ t: 'vid', d: v }); }); }
    seq.push({ t: 'chap', d: { tag: '✦', text: C.endNote } });
    count = seq.length;
    lbList = photos.filter(function (p) { return p.ok; });

    seq.forEach(function (s, k) {
      var z = -k * GAP, el, x = 0, y = 0, rot = 0, interactive = false;
      if (s.t === 'chap') {
        y = -vh * 0.2;
        el = nodeEl('chap', '<small>' + esc(fill(s.d.tag)) + '</small><p>' + esc(fill(s.d.text)) + '</p>');
      } else if (s.t === 'photo') {
        var p = s.d, i = s.i; x = (i % 2 ? 1 : -1) * Math.min(vw * 0.06, 54); y = ((i * 53) % 7 - 3) * 7; rot = (i % 2 ? 1 : -1) * (2.5 + (i % 3) * 1.4);
        el = nodeEl('memory');
        el.style.margin = '0';
        var badge = '<span class="num">' + p.n + '</span>';
        if (p.ok) {
          el.innerHTML = badge + '<img alt="' + esc(p.caption || 'Photo ' + p.n) + '" src="' + esc(p.src) + '"><figcaption>' + esc(fill(p.caption)) + '</figcaption>';
          var li = lbList.indexOf(p);
          el.addEventListener('click', function () { openLB(li); });
          interactive = true;
        } else {
          el.classList.add('ph'); el.innerHTML = badge + '<div class="ph-box"><b>♥</b><span>Photo ' + p.n + '<br>goes here</span></div>';
        }
      } else if (s.t === 'vid') {
        var v = s.d; el = nodeEl('portal' + (v.ok ? '' : ' ph'));
        el.innerHTML = '<span class="play">▶</span><span class="pt">' + esc(fill(v.title || 'Video ' + v.n)) + '</span><span class="ps">' + (v.ok ? 'tap to play' : 'goes here') + '</span>';
        if (v.ok) { el.addEventListener('click', function () { openVideo(v); }); interactive = true; }
        rot = 0;
      }
      place(el, x, y, z, rot);
      world.appendChild(el);
      nodes.push({ el: el, z: z, hit: interactive });

      // ring between stations
      if (k < seq.length - 1) {
        var ring = nodeEl('ring'); var sz = Math.min(vw, vh) * 1.0;
        ring.style.width = ring.style.height = sz + 'px';
        place(ring, 0, 0, z - GAP * 0.5, 0); world.appendChild(ring); nodes.push({ el: ring, z: z - GAP * 0.5, hit: false });
      }
    });

    // floating orbs for the feeling of speed
    var oc = isMobile ? 34 : 60, colors = ['#fff6e0', '#ffb3d0', '#d9c2ff', '#ffe0a8'];
    for (var o = 0; o < oc; o++) {
      var el2 = nodeEl('orbn'), sz2 = rand(4, 13), col = colors[o % colors.length];
      el2.style.width = el2.style.height = sz2 + 'px'; el2.style.background = col; el2.style.boxShadow = '0 0 ' + sz2 * 2.4 + 'px ' + col;
      var oz = rand(-(count) * GAP, 300);
      place(el2, rand(-vw * 0.85, vw * 0.85), rand(-vh * 0.7, vh * 0.7), oz, 0);
      world.appendChild(el2); nodes.push({ el: el2, z: oz, hit: false });
    }
    sizeFlight();
    addEventListener('resize', sizeFlight);
  }
  function sizeFlight() { flight.style.height = ((count - 1) * 0.8 * innerHeight + innerHeight) + 'px'; }

  function ease(fr) { if (fr < 0.3) return 0; if (fr > 0.7) return 1; var s = (fr - 0.3) / 0.4; return s * s * (3 - 2 * s); }
  function camFor(p) {
    var t = p * (count - 1), f = Math.floor(t), fr = t - f;
    if (f >= count - 1) { f = count - 1; fr = 0; }
    return (f + ease(fr)) * GAP + FOCUS;
  }
  function vis(zz) {
    if (zz < -3200 || zz > 560) return 0;
    var a = zz < -2300 ? (zz + 3200) / 900 : 1, b = zz > 240 ? (560 - zz) / 320 : 1;
    return clamp(Math.min(a, b), 0, 1);
  }
  addEventListener('pointermove', function (e) { mouseX = e.clientX / innerWidth - 0.5; mouseY = e.clientY / innerHeight - 0.5; });
  var mx2 = 0, my2 = 0, fcue = $('#fly-cue'), prog = $('#progress');
  function tick(t) {
    if ($('#s-main').hidden) return;
    var y = window.scrollY, top = flight.offsetTop, fh = Math.max(1, flight.offsetHeight - innerHeight);
    var target = clamp((y - top) / fh, 0, 1);
    var dy = Math.abs(y - lastY); lastY = y;
    if (y < top + fh + innerHeight * 1.2) {
      curP += (target - curP) * 0.14; if (Math.abs(target - curP) < 0.0002) curP = target;
      mx2 += (mouseX - mx2) * 0.06; my2 += (mouseY - my2) * 0.06;
      var cam = camFor(curP);
      world.style.transform = 'rotateX(' + (-my2 * 5).toFixed(2) + 'deg) rotateY(' + (mx2 * 7).toFixed(2) + 'deg) rotateZ(' + (Math.sin(curP * 9) * 1.4).toFixed(2) + 'deg) translateZ(' + cam.toFixed(1) + 'px)';
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i], op = vis(n.z + cam), st = n.el.style;
        if (op <= 0.01) { if (st.visibility !== 'hidden') st.visibility = 'hidden'; continue; }
        st.visibility = 'visible'; st.opacity = op.toFixed(3);
        if (n.hit) st.pointerEvents = op > 0.7 ? 'auto' : 'none';
      }
      prog.style.width = (curP * 100).toFixed(1) + '%';
      Sky.to(0.8 + Math.min(dy * 0.5, 16));
      if (y > top + 20) fcue.classList.add('gone');
    }
    requestAnimationFrame(tick);
  }

  /* auto-fly */
  var auto = false, autoBtn = $('#autofly');
  function autoLoop() {
    if (!auto) return;
    var end = flight.offsetTop + flight.offsetHeight - innerHeight;
    if (window.scrollY >= end - 2) { stopAuto(); return; }
    window.scrollBy(0, 3.2); requestAnimationFrame(autoLoop);
  }
  function stopAuto() { auto = false; autoBtn.textContent = '▶ Auto-fly'; }
  autoBtn.addEventListener('click', function () {
    if (auto) { stopAuto(); return; }
    auto = true; autoBtn.textContent = '❚❚ Pause'; requestAnimationFrame(autoLoop);
  });
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { addEventListener(ev, function () { if (auto) stopAuto(); }, { passive: true }); });

  function observeReveals() {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* photo viewer */
  function openLB(i) {
    if (i < 0) return; lbI = i; $('#lightbox').hidden = false; document.body.style.overflow = 'hidden'; paintLB();
  }
  function paintLB() {
    var p = lbList[lbI]; $('#lb-img').src = p.src; $('#lb-cap').textContent = fill(p.caption); $('#lb-count').textContent = (lbI + 1) + ' / ' + lbList.length;
  }
  function stepLB(d) { if (!lbList.length) return; lbI = (lbI + d + lbList.length) % lbList.length; paintLB(); }
  function closeLB() { $('#lightbox').hidden = true; document.body.style.overflow = ''; }
  $('#lb-close').addEventListener('click', closeLB);
  $('#lb-prev').addEventListener('click', function () { stepLB(-1); });
  $('#lb-next').addEventListener('click', function () { stepLB(1); });
  $('#lightbox').addEventListener('click', function (e) { if (e.target.id === 'lightbox') closeLB(); });
  document.addEventListener('keydown', function (e) {
    if (!$('#lightbox').hidden) { if (e.key === 'Escape') closeLB(); if (e.key === 'ArrowLeft') stepLB(-1); if (e.key === 'ArrowRight') stepLB(1); }
    if (!$('#vidmodal').hidden && e.key === 'Escape') closeVideo();
  });
  (function () {
    var sx = null, lb = $('#lightbox');
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) stepLB(dx < 0 ? 1 : -1); });
  })();

  /* video viewer */
  var musicWasOn = false;
  function openVideo(v) {
    var vm = $('#vidmodal'), vid = $('#vm-video');
    musicWasOn = true; Music.pause();
    $('#vm-cap').textContent = fill(v.caption || v.title || '');
    vm.hidden = false; document.body.style.overflow = 'hidden';
    vid.src = v.src; vid.play().catch(function () { });
  }
  function closeVideo() {
    var vid = $('#vm-video'); vid.pause(); vid.removeAttribute('src'); vid.load();
    $('#vidmodal').hidden = true; document.body.style.overflow = '';
    if (musicWasOn) Music.resume();
  }
  $('#vm-close').addEventListener('click', closeVideo);
  $('#vidmodal').addEventListener('click', function (e) { if (e.target.id === 'vidmodal') closeVideo(); });

  /* =====================================================
     LETTER (incoming transmission)
     ===================================================== */
  function setupLetter() {
    var btn = $('#receive'), sig = $('#signal'), letter = $('#letter'), txt = $('#letter-text'), skip = $('#letter-skip');
    var full = fill(C.letter).trim(), timer = null, pos = 0;
    function finish() { clearInterval(timer); pos = full.length; txt.textContent = full; txt.classList.remove('typing'); skip.hidden = true; }
    btn.addEventListener('click', async function () {
      btn.hidden = true; sig.hidden = false; Snd.bell(880); Snd.whoosh(1.4);
      await wait(reduce ? 200 : 1800);
      sig.hidden = true; letter.hidden = false; Snd.bell(1175);
      letter.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      if (reduce) { finish(); return; }
      txt.classList.add('typing');
      timer = setInterval(function () { pos++; txt.textContent = full.slice(0, pos); if (pos >= full.length) finish(); }, 34);
    });
    skip.addEventListener('click', finish);
    letter.addEventListener('click', function () { if (pos < full.length) finish(); });
  }

  /* =====================================================
     GAME: light up 12 stars into a heart
     ===================================================== */
  function setupGame() {
    var NS = 'http://www.w3.org/2000/svg', svg = $('#const-svg'), N = 12;
    function el(n, a, parent) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); (parent || svg).appendChild(e); return e; }
    function heart(t) { var x = 16 * Math.pow(Math.sin(t), 3), y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); return [50 + x * 2.7, 50 + (y - 2.5) * 2.7]; }
    var defs = el('defs', {});
    var f = el('filter', { id: 'glow', x: '-80%', y: '-80%', width: '260%', height: '260%' }, defs);
    el('feGaussianBlur', { stdDeviation: '1.1', result: 'b' }, f);
    var fm = el('feMerge', {}, f); el('feMergeNode', { in: 'b' }, fm); el('feMergeNode', { in: 'SourceGraphic' }, fm);
    var g = el('linearGradient', { id: 'hg', x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
    el('stop', { offset: '0', 'stop-color': '#ff9ec4' }, g); el('stop', { offset: '1', 'stop-color': '#a76bff' }, g);
    for (var d = 0; d < 46; d++) el('circle', { cx: rand(0, 100), cy: rand(0, 100), r: rand(0.15, 0.5), class: 'dust' });

    var path = ''; for (var i = 0; i <= 120; i++) { var q = heart(i / 120 * 6.2832); path += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
    el('path', { d: path + 'Z', class: 'heart-fill' });
    var linesG = el('g', {}), starsG = el('g', {});
    var pts = [], lit = [], drawn = {}, count = 0, done = false;
    var bag = [], last = '', wishBag = [];
    function next() {
      if (!bag.length) { bag = shuffle(C.starMessages); if (bag.length > 1 && bag[bag.length - 1] === last) bag.unshift(bag.pop()); }
      last = bag.pop(); return last;
    }
    var card = $('#star-msg'), litEl = $('#lit'), resetBtn = $('#const-reset'), wrap = $('#const');
    function say(t, gold) {
      card.textContent = fill(t); card.className = 'msg-card' + (gold ? ' gold' : ''); void card.offsetWidth; card.classList.add('swap');
    }
    function line(a, b) {
      var key = Math.min(a, b) + '-' + Math.max(a, b); if (drawn[key]) return; drawn[key] = 1;
      el('line', { x1: pts[a][0], y1: pts[a][1], x2: pts[b][0], y2: pts[b][1], class: 'ln', pathLength: 100 }, linesG);
    }
    function lightStar(i, gEl) {
      if (lit[i]) return; lit[i] = true; gEl.classList.add('lit'); count++; litEl.textContent = count;
      Snd.step(count - 1); if (navigator.vibrate) { try { navigator.vibrate(15); } catch (e) { } }
      var prev = (i + N - 1) % N, nxt = (i + 1) % N; if (lit[prev]) line(prev, i); if (lit[nxt]) line(i, nxt);
      if (count === N) { finishGame(); } else say(next());
    }
    function finishGame() {
      done = true; wrap.classList.add('done'); say(C.constellationFinale, true);
      Snd.arp(); FW.show(4200); confetti(40); resetBtn.hidden = false;
    }
    var gEls = [];
    /* place the 12 stars evenly along the outline (by length, not by angle) */
    var dense = [], cum = [0], total = 0, di;
    for (di = 0; di <= 800; di++) dense.push(heart(di / 800 * 6.2832));
    for (di = 1; di < dense.length; di++) { total += Math.hypot(dense[di][0] - dense[di - 1][0], dense[di][1] - dense[di - 1][1]); cum.push(total); }
    for (var s = 0, k = 0; s < N; s++) {
      var want = total * s / N;
      while (k < cum.length - 1 && cum[k] < want) k++;
      pts.push(dense[k]);
    }
    pts.forEach(function (p, s) {
      var gr = el('g', { class: 'cs', tabindex: '0', role: 'button', 'aria-label': 'Star ' + (s + 1) }, starsG);
      el('circle', { cx: p[0], cy: p[1], r: 4.4, class: 'halo' }, gr);
      el('circle', { cx: p[0], cy: p[1], r: 1.7, class: 'core' }, gr);
      el('circle', { cx: p[0], cy: p[1], r: 8, fill: 'transparent' }, gr);
      gr.addEventListener('pointerdown', function (e) { e.preventDefault(); lightStar(s, gr); });
      gr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') lightStar(s, gr); });
      gEls.push(gr);
    });
    resetBtn.addEventListener('click', function () {
      lit = []; drawn = {}; count = 0; done = false; litEl.textContent = '0'; wrap.classList.remove('done');
      linesG.innerHTML = ''; gEls.forEach(function (x) { x.classList.remove('lit'); });
      resetBtn.hidden = true; say('Tap a glowing star ✦ (new messages this time!)');
    });

    /* shooting stars */
    var inView = false;
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0.2 }).observe(wrap);
    setInterval(function () {
      if (!inView || document.hidden || wrap.querySelector('.shoot')) return;
      var sEl = document.createElement('button'); sEl.className = 'shoot'; sEl.setAttribute('aria-label', 'Shooting star, make a wish');
      sEl.style.top = rand(2, 40) + '%';
      sEl.addEventListener('pointerdown', function (e) {
        e.preventDefault(); var r = sEl.getBoundingClientRect(); FW.burst(r.left + 20, r.top + 20, 45); Snd.bell(1568);
        if (!wishBag.length) wishBag = shuffle(C.wishMessages); say(wishBag.pop(), true); sEl.remove();
      });
      sEl.addEventListener('animationend', function () { sEl.remove(); });
      wrap.appendChild(sEl);
    }, 6500);
  }

  /* =====================================================
     FINALE: cake, wish, fireworks, certificate
     ===================================================== */
  function setupFinale() {
    var NS = 'http://www.w3.org/2000/svg', svg = $('#cake'), digits = String(C.age).split('');
    var h = '<defs><radialGradient id="fl" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff9d6"/><stop offset=".5" stop-color="#ffc857"/><stop offset="1" stop-color="#ff7a3d"/></radialGradient>' +
      '<linearGradient id="cd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb3d0"/><stop offset="1" stop-color="#ff7fb0"/></linearGradient></defs>';
    h += '<ellipse cx="130" cy="232" rx="120" ry="14" fill="#d9c8ee" opacity=".9"/>';
    h += '<rect x="30" y="152" width="200" height="76" rx="14" fill="#ff9ec4"/><rect x="58" y="108" width="144" height="50" rx="12" fill="#ffd9b8"/>';
    h += '<ellipse cx="130" cy="154" rx="100" ry="12" fill="#ffe3ee"/><ellipse cx="130" cy="110" rx="72" ry="10" fill="#fff3f7"/>';
    for (var d = 0; d < 7; d++) h += '<circle cx="' + (48 + d * 27) + '" cy="164" r="7" fill="#ffe3ee"/>';
    for (var e = 0; e < 5; e++) h += '<circle cx="' + (76 + e * 27) + '" cy="120" r="6" fill="#fff3f7"/>';
    h += '<g fill="#fff6e0" opacity=".9"><circle cx="64" cy="196" r="3"/><circle cx="110" cy="204" r="3"/><circle cx="160" cy="198" r="3"/><circle cx="200" cy="206" r="3"/></g>';
    var cw = 34, gap = 8, total = digits.length * cw + (digits.length - 1) * gap, x0 = 130 - total / 2;
    digits.forEach(function (dg, i) {
      var cx = x0 + i * (cw + gap) + cw / 2, tilt = i % 2 ? 3 : -3;
      h += '<g transform="rotate(' + tilt + ' ' + cx + ' 104)">' +
        '<rect x="' + (cx - cw / 2) + '" y="40" width="' + cw + '" height="68" rx="8" fill="url(#cd)" stroke="#fff" stroke-opacity=".5"/>' +
        '<text x="' + cx + '" y="90" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="500" font-size="38" fill="#fff">' + dg + '</text>' +
        '<line x1="' + cx + '" y1="40" x2="' + cx + '" y2="32" stroke="#6a3d4a" stroke-width="2"/>' +
        '<path class="flame" d="M' + cx + ' 4 C ' + (cx + 11) + ' 18, ' + (cx + 9) + ' 32, ' + cx + ' 34 C ' + (cx - 9) + ' 32, ' + (cx - 11) + ' 18, ' + cx + ' 4 Z" fill="url(#fl)"/>' +
        '<circle class="smoke" cx="' + cx + '" cy="26" r="6"/></g>';
    });
    svg.innerHTML = h;
    var blown = false;
    $('#cake-btn').addEventListener('click', async function () {
      if (blown) return; blown = true;
      svg.classList.add('out'); Snd.pop(); $('#wish-hint').hidden = true;
      await wait(1000);
      Snd.arp(); FW.show(7500); confetti(90);
      var after = $('#after'); after.hidden = false;
      if (C.togetherSince) {
        var dt = new Date(C.togetherSince + 'T00:00:00');
        if (!isNaN(dt)) { var days = Math.floor((Date.now() - dt.getTime()) / 86400000); if (days >= 0) { var t = $('#together'); t.hidden = false; t.innerHTML = 'We have been together for <b>' + days + '</b> days, and every one of them is my favorite.'; } }
      }
      await wait(700);
      after.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
    $('#replay').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); confetti(40); });
  }
})();
