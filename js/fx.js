/* Effects: sound (music-box), background (fireflies / petals), fireworks, confetti */
(function () {
  'use strict';
  var U = {
    rand: function (a, b) { return a + Math.random() * (b - a); },
    clamp: function (v, a, b) { return Math.min(b, Math.max(a, v)); },
    wait: function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); },
    shuffle: function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    reduce: !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches),
    isMobile: innerWidth < 700
  };
  var rand = U.rand, clamp = U.clamp;

  /* =====================================================
     SOUND: a tiny music-box synth, no files needed
     ===================================================== */
  var Snd = (function () {
    var ac = null, muted = false;
    var PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
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
      g.gain.exponentialRampToValueAtTime(v || 0.05, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (d || 1));
      o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + (d || 1) + 0.05);
    }
    function box(f, delay, vol) { /* celesta / music-box tone */
      tone(f, 1.7, (vol || 0.055), 'sine', delay);
      tone(f * 2.0, 0.9, (vol || 0.055) * 0.4, 'sine', delay);
      tone(f * 4.01, 0.35, (vol || 0.055) * 0.15, 'sine', delay);
    }
    function noise(dur) {
      var a = ctx(), n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      var s = a.createBufferSource(); s.buffer = buf; return s;
    }
    var HB = [[392, .75], [392, .25], [440, 1], [392, 1], [523.25, 1], [493.88, 2],
      [392, .75], [392, .25], [440, 1], [392, 1], [587.33, 1], [523.25, 2],
      [392, .75], [392, .25], [783.99, 1], [659.25, 1], [523.25, 1], [493.88, 1], [440, 1],
      [698.46, .75], [698.46, .25], [659.25, 1], [523.25, 1], [587.33, 1], [523.25, 2]];
    return {
      unlock: function () { ctx(); },
      chime: function (n) { box(523.25 * Math.pow(2, PENTA[(n || 0) % PENTA.length] / 12)); },
      key: function (d) { tone(392 * Math.pow(2, PENTA[d % PENTA.length] / 12), 0.45, 0.04, 'triangle'); },
      bad: function () { tone(160, 0.4, 0.06, 'sawtooth'); tone(120, 0.5, 0.05, 'sawtooth', 0.14); },
      arp: function () { [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach(function (f, i) { box(f, i * 0.1, 0.045); }); },
      crack: function () {
        if (muted) return; var a = ctx(); if (!a) return;
        var s = noise(0.25), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
        f.type = 'highpass'; f.frequency.value = 1800;
        g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
        tone(95, 0.5, 0.12, 'sine');
      },
      thump: function () { tone(80, 0.5, 0.16, 'sine'); tone(55, 0.6, 0.1, 'sine'); },
      whoosh: function (dur) {
        if (muted) return; var a = ctx(); if (!a) return;
        var s = noise(dur), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
        f.type = 'bandpass'; f.Q.value = 0.7; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2600, t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
      },
      pop: function () {
        if (muted) return; var a = ctx(); if (!a) return;
        var s = noise(0.3), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
        f.type = 'lowpass'; f.frequency.value = 900;
        g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
      },
      /* "Happy Birthday" on a music box */
      birthday: function () {
        var t = 0, beat = 0.44;
        HB.forEach(function (n) { box(n[0], t, 0.05); t += n[1] * beat; });
      },
      get muted() { return muted; },
      set muted(v) { muted = v; }
    };
  })();

  /* =====================================================
     MUSIC FILE (optional assets/music/song.mp3)
     ===================================================== */
  var Music = (function () {
    var audio = null, ready = false, wanted = false, exts = ['.mp3', '.m4a', '.ogg', '.wav'], idx = 0;
    return {
      init: function (path) {
        if (!path) return;
        var base = String(path).replace(/\.(mp3|m4a|ogg|wav)$/i, '');
        audio = new Audio(); audio.loop = true; audio.preload = 'auto'; audio.volume = 0.7;
        audio.addEventListener('canplay', function () { ready = true; if (wanted && !Snd.muted) audio.play().catch(function () { }); });
        audio.addEventListener('error', function () { idx++; if (idx < exts.length) audio.src = base + exts[idx]; else audio = null; });
        audio.src = base + exts[0];
      },
      load: function (url) {
        audio = new Audio(url); audio.loop = true; audio.preload = 'auto'; audio.volume = 0.7;
        audio.addEventListener('canplay', function () { ready = true; if (wanted && !Snd.muted) audio.play().catch(function () { }); });
      },
      unlock: function () {
        if (!audio) return;
        try { audio.muted = true; var p = audio.play(); if (p && p.then) p.then(function () { audio.pause(); audio.currentTime = 0; audio.muted = false; }).catch(function () { audio.muted = false; }); } catch (e) { audio.muted = false; }
      },
      start: function () { wanted = true; if (audio && ready && !Snd.muted) audio.play().catch(function () { }); },
      pause: function () { if (audio) audio.pause(); },
      resume: function () { if (audio && wanted && !Snd.muted) audio.play().catch(function () { }); },
      get exists() { return !!audio; },
      get playing() { return !!audio && !audio.paused; }
    };
  })();

  /* =====================================================
     BACKGROUND: golden fireflies (dark)  ->  petals + bokeh (light)
     ===================================================== */
  var BG = (function () {
    var cv = document.getElementById('bg'), cx = cv.getContext('2d'), W, H, dpr, mix = 0, target = 0;
    var flies = [], petals = [], bokeh = [];
    function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    resize(); addEventListener('resize', resize);
    var i;
    for (i = 0; i < (U.isMobile ? 38 : 70); i++) flies.push({ x: rand(0, W), y: rand(0, H), vx: rand(-.12, .12), vy: rand(-.3, -.05), r: rand(.8, 2.6), ph: rand(0, 6.28), sp: rand(.01, .03) });
    var pc = ['rgba(248,168,190,.75)', 'rgba(255,214,222,.8)', 'rgba(255,255,255,.8)', 'rgba(236,128,158,.6)', 'rgba(250,200,175,.7)'];
    function mkPetal(init) { return { x: rand(0, W), y: init ? rand(0, H) : rand(-40, -10), s: rand(7, 14), v: rand(.3, .8), sw: rand(.5, 1.4), ph: rand(0, 6.28), r: rand(0, 6.28), rv: rand(-.025, .025), c: pc[Math.floor(Math.random() * pc.length)] }; }
    for (i = 0; i < (U.isMobile ? 14 : 24); i++) petals.push(mkPetal(true));
    for (i = 0; i < 7; i++) bokeh.push({ x: rand(0, W), y: rand(0, H), r: rand(50, 130), vx: rand(-.1, .1), vy: rand(-.08, .08), c: i % 2 ? '255,170,195' : '255,215,170', a: rand(.1, .2) });
    function frame(t) {
      mix += (target - mix) * 0.035; if (Math.abs(target - mix) < .002) mix = target;
      cx.clearRect(0, 0, W, H);
      var k;
      if (mix > 0.01) {
        cx.globalAlpha = mix;
        for (k = 0; k < bokeh.length; k++) {
          var b = bokeh[k]; b.x += b.vx; b.y += b.vy; if (b.x < -b.r) b.x = W + b.r; if (b.x > W + b.r) b.x = -b.r; if (b.y < -b.r) b.y = H + b.r; if (b.y > H + b.r) b.y = -b.r;
          var g = cx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r); g.addColorStop(0, 'rgba(' + b.c + ',' + b.a + ')'); g.addColorStop(1, 'rgba(' + b.c + ',0)');
          cx.fillStyle = g; cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, 6.283); cx.fill();
        }
        for (k = 0; k < petals.length; k++) {
          var p = petals[k]; p.y += p.v; p.ph += .012; p.x += Math.sin(p.ph) * p.sw * .5; p.r += p.rv; if (p.y > H + 20) petals[k] = mkPetal(false);
          cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.beginPath(); cx.ellipse(0, 0, p.s, p.s * .55, 0, 0, 6.283); cx.fill(); cx.restore();
        }
      }
      if (mix < 0.99) {
        cx.globalAlpha = 1 - mix;
        for (k = 0; k < flies.length; k++) {
          var f = flies[k]; f.x += f.vx + Math.sin(f.ph) * .1; f.y += f.vy; f.ph += f.sp;
          if (f.y < -10) { f.y = H + 10; f.x = rand(0, W); } if (f.x < -10) f.x = W + 10; if (f.x > W + 10) f.x = -10;
          var a = .35 + .65 * (0.5 + 0.5 * Math.sin(f.ph * 3));
          cx.fillStyle = 'rgba(255,214,140,' + (a * .16).toFixed(3) + ')'; cx.beginPath(); cx.arc(f.x, f.y, f.r * 4.5, 0, 6.283); cx.fill();
          cx.fillStyle = 'rgba(255,232,180,' + a.toFixed(3) + ')'; cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, 6.283); cx.fill();
        }
      }
      cx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    if (!U.reduce) requestAnimationFrame(frame);
    return { mode: function (m) { target = m === 'light' ? 1 : 0; document.body.classList.toggle('light', m === 'light'); } };
  })();

  /* =====================================================
     FIREWORKS (rose gold)
     ===================================================== */
  var FW = (function () {
    var cv = document.getElementById('fw'), cx = cv.getContext('2d'), W, H, dpr, ps = [], rk = [], running = false, until = 0, lastL = 0;
    function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    resize(); addEventListener('resize', resize);
    var HUES = [340, 350, 330, 20, 40, 355];
    function burst(x, y, hue) {
      var n = U.isMobile ? 44 : 70; hue = hue == null ? HUES[Math.floor(Math.random() * HUES.length)] : hue;
      for (var i = 0; i < n; i++) {
        var a = i / n * 6.283 + rand(0, .2), sp = rand(1.2, 5) * (.5 + Math.random() * .7);
        ps.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, dec: rand(.011, .02), hue: hue + rand(-12, 12), s: rand(1.3, 2.5) });
      }
      kick();
    }
    function launch() { rk.push({ x: rand(W * .15, W * .85), y: H + 10, vy: -rand(8, 11.5), ty: rand(H * .14, H * .5), hue: HUES[Math.floor(Math.random() * HUES.length)] }); kick(); }
    function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
    function loop(t) {
      cx.clearRect(0, 0, W, H); cx.globalCompositeOperation = 'lighter';
      if (Date.now() < until && t - lastL > 430) { lastL = t; launch(); if (Math.random() < .5) launch(); }
      var i, j;
      for (i = rk.length - 1; i >= 0; i--) {
        var r = rk[i]; r.y += r.vy; r.vy *= .987;
        cx.fillStyle = 'hsla(' + r.hue + ',100%,82%,.9)'; cx.beginPath(); cx.arc(r.x, r.y, 2, 0, 6.283); cx.fill();
        if (r.y <= r.ty || r.vy > -2.2) { burst(r.x, r.y, r.hue); Snd.pop(); rk.splice(i, 1); }
      }
      for (j = ps.length - 1; j >= 0; j--) {
        var p = ps[j]; p.vy += .045; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.life -= p.dec;
        if (p.life <= 0) { ps.splice(j, 1); continue; }
        cx.fillStyle = 'hsla(' + p.hue + ',100%,' + (66 + p.life * 18) + '%,' + p.life.toFixed(2) + ')';
        cx.beginPath(); cx.arc(p.x, p.y, p.s * (.5 + p.life * .6), 0, 6.283); cx.fill();
      }
      cx.globalCompositeOperation = 'source-over';
      if (ps.length || rk.length || Date.now() < until) requestAnimationFrame(loop); else { running = false; cx.clearRect(0, 0, W, H); }
    }
    return { burst: burst, show: function (ms) { until = Date.now() + ms; kick(); } };
  })();

  /* =====================================================
     CONFETTI: petals, hearts, sparkles
     ===================================================== */
  function confetti(n) {
    if (U.reduce) return;
    var box = document.getElementById('confetti'), em = ['🌸', '💗', '✨', '🤍', '🌹', '💖'], cols = ['#f6a5bb', '#ffd9de', '#e6c07b', '#fff6ee', '#e8799a'];
    for (var i = 0; i < n; i++) {
      var el = document.createElement('div'); el.className = 'cf';
      if (i % 3 === 0) { el.textContent = em[i % em.length]; el.style.fontSize = rand(16, 26) + 'px'; }
      else { el.style.width = rand(7, 12) + 'px'; el.style.height = rand(10, 16) + 'px'; el.style.background = cols[i % cols.length]; el.style.borderRadius = '50% 2px 50% 2px'; }
      el.style.left = rand(0, 100) + '%';
      el.style.setProperty('--cx', rand(-90, 90) + 'px'); el.style.setProperty('--cr', rand(-540, 540) + 'deg');
      el.style.animationDuration = rand(3, 6) + 's'; el.style.animationDelay = rand(0, 1.2) + 's';
      box.appendChild(el);
      (function (x) { setTimeout(function () { x.remove(); }, 8000); })(el);
    }
  }

  window.U = U;
  window.FX = { Snd: Snd, Music: Music, BG: BG, FW: FW, confetti: confetti };
})();
