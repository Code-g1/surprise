(function () {
  'use strict';
  var U = window.U, FX = window.FX, Snd = FX.Snd, Music = FX.Music, BG = FX.BG, FW = FX.FW, confetti = FX.confetti;
  var Seal = window.Seal, Heart = window.Heart;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var rand = U.rand, clamp = U.clamp, wait = U.wait, shuffle = U.shuffle, reduce = U.reduce, isMobile = U.isMobile;
  var C = null;                       /* her private content (only exists after the seal is broken) */
  var assetsP = null;

  var GATE_LINES = [
    'Something was left here, for someone…',
    'Written for only one person in the whole world.',
    "If it's you… you already know the four numbers."
  ];
  var HINT = 'Hint: four numbers that only we two know 💕';

  var ordinal = function (n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  var fill = function (t) {
    return String(t == null ? '' : t).replace(/\{name\}/g, C.herName).replace(/\{him\}/g, C.hisName)
      .replace(/\{age\}/g, C.age).replace(/\{ordinal\}/g, ordinal(C.age));
  };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function show(id) { $$('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); }); }

  var soundBtn = $('#sound-btn');
  soundBtn.addEventListener('click', function () {
    Snd.muted = !Snd.muted; soundBtn.classList.toggle('off', Snd.muted);
    if (Snd.muted) Music.pause(); else Music.resume();
  });

  /* =====================================================
     1. THE MYSTERY GATE
     ===================================================== */
  var fast = false;
  $('#s-gate').addEventListener('pointerdown', function () { fast = true; });
  async function typeLine(text) {
    var el = $('#gate-line'); el.classList.remove('out'); el.textContent = ''; el.classList.add('typing'); fast = false;
    for (var k = 0; k < text.length; k++) { el.textContent += text[k]; await wait(fast ? 0 : (/[.,…]/.test(text[k]) ? 300 : 48)); }
    el.classList.remove('typing');
    await wait(fast ? 300 : 1500);
    el.classList.add('out'); await wait(700);
  }
  (async function gate() {
    await wait(700);
    for (var i = 0; i < GATE_LINES.length; i++) await typeLine(GATE_LINES[i]);
    $('#gate-line').style.display = 'none';
    $('#seal-btn').hidden = false;
  })();
  document.addEventListener('pointermove', function (e) {
    if (!$('#s-gate').classList.contains('active')) return;
    var b = $('.env-body'); if (!b) return;
    b.style.setProperty('--rx', (8 - (e.clientY / innerHeight - .5) * 18) + 'deg');
    b.style.setProperty('--ry', (-12 + (e.clientX / innerWidth - .5) * 26) + 'deg');
  });
  $('#seal-btn').addEventListener('click', function () {
    Snd.unlock(); Snd.chime(2);
    $('#seal-btn').style.transition = 'opacity .6s, transform .8s'; $('#seal-btn').style.opacity = 0; $('#seal-btn').style.transform = 'scale(1.25) translateY(-20px)';
    wait(650).then(function () { show('s-lock'); $('#lock-sub').textContent = 'Only she knows the four numbers…'; });
  });

  /* =====================================================
     2. BREAK THE SEAL (the passcode)
     ===================================================== */
  var entry = '', busy = false, wrong = 0;
  var slots = $('#slots'), lockMsg = $('#lock-msg'), lockSeal = $('#lock-seal'), keypad = $('#keypad');
  function paint(cls) {
    $$('i', slots).forEach(function (d, i) { d.classList.toggle('f', i < entry.length); });
    slots.className = 'slots' + (cls ? ' ' + cls : '');
  }
  function press(k) {
    if (busy) return;
    if (k === 'clear') { entry = ''; paint(); return; }
    if (entry.length >= 4) return;
    entry += k; Snd.key(+k); paint();
    if (entry.length === 4) tryCode();
  }
  async function tryCode() {
    busy = true; keypad.classList.add('off'); lockSeal.classList.add('busy');
    lockMsg.textContent = 'The seal is listening…';
    var started = Date.now();
    try {
      if (!Seal.available()) throw new Error('insecure');
      C = await Seal.unlock(entry);
    } catch (e) {
      var wantWait = 900 - (Date.now() - started); if (wantWait > 0) await wait(wantWait);
      lockSeal.classList.remove('busy'); keypad.classList.remove('off');
      var m = e && e.message || '';
      if (m === 'bad') {
        wrong++; Snd.bad(); paint('bad');
        lockMsg.textContent = wrong >= 2 ? HINT : 'The seal stays closed… only the right heart can open it.';
      } else if (m === 'nosecret') {
        paint('bad'); lockMsg.textContent = 'You might have guessed or known the password by accident but you are not the person this world was made for.';
      } else if (m === 'insecure') {
        paint('bad'); lockMsg.textContent = 'Please open this from the https:// website link, not from a saved file.';
      } else {
        paint('bad'); lockMsg.textContent = 'Something went wrong while opening. Please check your internet and try again.';
      }
      await wait(750); entry = ''; paint(); busy = false;
      return;
    }
    unseal();
  }
  $$('#keypad button').forEach(function (b) { b.addEventListener('click', function () { press(b.getAttribute('data-k')); }); });
  document.addEventListener('keydown', function (e) {
    if (!$('#s-lock').classList.contains('active')) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace' || e.key === 'Escape') press('clear');
  });

  function sparkleBurst(x, y, n) {
    var em = ['✨', '💗', '🌸', '✦', '🤍'];
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span'); s.className = 'sparkle'; s.textContent = em[i % em.length];
      s.style.left = x + 'px'; s.style.top = y + 'px';
      var a = rand(0, 6.283), d = rand(60, 170);
      s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d - 30 + 'px');
      document.body.appendChild(s); setTimeout(function (el) { el.remove(); }.bind(null, s), 1200);
    }
  }

  async function unseal() {
    slots.className = 'slots ok'; $$('i', slots).forEach(function (d) { d.classList.add('f'); });
    lockSeal.classList.remove('busy'); lockSeal.classList.add('crack');
    $('#lock-title').textContent = 'The seal is broken'; $('#lock-sub').textContent = ''; lockMsg.textContent = '';
    Snd.crack(); Snd.arp();
    var r = lockSeal.getBoundingClientRect(); sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 22);
    document.title = 'For ' + C.herName + ' 💌';
    $('#f-name').textContent = C.herName; $('#f-him').textContent = C.hisName;
    soundBtn.hidden = false;
    assetsP = loadAssets();
    await wait(1700);
    $('#flash').classList.add('go');
    await wait(500);
    BG.mode('light'); show('s-stage'); Heart.start();
    stageSequence();
  }

  /* =====================================================
     3. THE REVEAL: 3D heart + 3D words
     ===================================================== */
  Heart.init($('#heart'), $('#heart-slot'));
  var tilt = { x: 0, y: 0 };
  document.addEventListener('pointermove', function (e) { tilt.x = e.clientX / innerWidth - .5; tilt.y = e.clientY / innerHeight - .5; });

  function build3D(container, lines, delay0) {
    var depth = isMobile ? 9 : 12, step = isMobile ? 2.3 : 2.8, idx = delay0 || 0;
    lines.forEach(function (text) {
      var row = document.createElement('div'); var t3 = document.createElement('div'); t3.className = 't3';
      var start = idx;
      for (var k = depth; k >= 0; k--) {
        var layer = document.createElement('div');
        layer.className = 'layer ' + (k === 0 ? 'front' : 'back');
        layer.style.transform = 'translateZ(' + (-k * step) + 'px)';
        if (k > 0) layer.style.setProperty('--c', 'hsl(338,52%,' + (42 - k * (22 / depth)) + '%)');
        if (k === depth) layer.style.textShadow = '0 20px 26px rgba(110,20,55,.32)';
        for (var c = 0; c < text.length; c++) {
          var ch = document.createElement('span'); ch.className = 'ch'; ch.textContent = text[c] === ' ' ? ' ' : text[c];
          ch.style.setProperty('--i', start + c); layer.appendChild(ch);
        }
        t3.appendChild(layer);
      }
      idx += text.length; row.appendChild(t3); container.appendChild(row);
    });
    return idx;
  }
  var swayRaf = 0;
  function swayLoop(t) {
    var ry = Math.sin(t * .0009) * 13 + tilt.x * 18, rx = -tilt.y * 9 + Math.sin(t * .0007) * 3.5;
    $$('.t3').forEach(function (el) { el.style.transform = 'rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg)'; });
    swayRaf = requestAnimationFrame(swayLoop);
  }

  var tapBag = [], tapTimer = null;
  Heart.onTap(function () {
    if (!tapBag.length) tapBag = shuffle(C.tapMessages && C.tapMessages.length ? C.tapMessages : ['I love you.']);
    var m = $('#tap-msg'); m.textContent = fill(tapBag.pop()); m.classList.add('on');
    Snd.chime(Math.floor(rand(0, 9)));
    clearTimeout(tapTimer); tapTimer = setTimeout(function () { m.classList.remove('on'); }, 4200);
  });

  async function stageSequence() {
    Heart.reveal(); Snd.chime(4); Snd.whoosh(1.6);
    if (!reduce) swayRaf = requestAnimationFrame(swayLoop);
    await wait(1900);
    var next = build3D($('#words-top'), ['Happy ' + ordinal(C.age), 'Birthday'], 0);
    if (!Music.exists) Snd.birthday();
    await wait(2300);
    build3D($('#words-name'), [C.herName], 0);
    Snd.arp(); confetti(60);
    await wait(2100);
    var cap = $('#stage-cap'); cap.textContent = fill(C.stageCaption || ''); cap.classList.add('on');
    var tm = $('#tap-msg'); tm.textContent = 'tap the heart ♥'; tm.classList.add('on');
    await wait(1400);
    $('#open-btn').hidden = false;
  }

  $('#open-btn').addEventListener('click', async function () {
    Snd.arp(); Music.start();
    $('#flash').classList.add('go');
    await wait(450);
    cancelAnimationFrame(swayRaf); Heart.stop();
    show('none'); $('#s-main').hidden = false; window.scrollTo(0, 0);
    await buildMain();
  });

  /* =====================================================
     ASSETS: decrypt photos / videos / song
     ===================================================== */
  function loadAssets() {
    return (async function () {
      var photos = await Promise.all((C.photos || []).map(async function (p) {
        try { return { url: await Seal.blobUrl(p.id, p.mime), ratio: p.h / p.w, caption: fill(p.caption || '') }; } catch (e) { return null; }
      }));
      var videos = await Promise.all((C.videos || []).map(async function (v) {
        try { return { id: v.id, mime: v.mime, title: fill(v.title || ''), caption: fill(v.caption || ''), poster: v.poster ? await Seal.blobUrl(v.poster, 'image/jpeg') : '', url: null }; } catch (e) { return null; }
      }));
      if (C.music) { try { Music.load(await Seal.blobUrl(C.music.id, C.music.mime)); } catch (e) { } }
      return { photos: photos.filter(Boolean), videos: videos.filter(Boolean) };
    })();
  }

  async function buildMain() {
    var A = await assetsP;
    buildAlbum(A); setupLetter(); setupPetals(); setupFinale();
    observeReveals();
  }
  function observeReveals() {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* =====================================================
     ALBUM: a gallery you tap, nothing to scroll through
     ===================================================== */
  var lbList = [], lbI = 0, slideT = null;
  function buildAlbum(A) {
    var grid = $('#grid'); grid.innerHTML = '';
    var items = [];
    A.photos.forEach(function (p, i) { items.push({ t: 'p', d: p, i: i }); });
    var pos = [4, 9]; A.videos.forEach(function (v, k) { items.splice(Math.min(items.length, pos[k] == null ? items.length : pos[k]), 0, { t: 'v', d: v }); });
    lbList = A.photos;
    items.forEach(function (it, n) {
      var b = document.createElement('button'); b.className = 'tile'; b.type = 'button';
      b.dataset.ratio = it.t === 'p' ? it.d.ratio : 1.22;
      b.style.setProperty('--r', ((n % 2 ? 1 : -1) * rand(.2, 1.1)).toFixed(2) + 'deg');
      b.style.transitionDelay = ((n % 4) * 90) + 'ms';
      if (it.t === 'p') {
        b.innerHTML = '<img alt="' + esc(it.d.caption || 'Our photo') + '" src="' + it.d.url + '"><span class="shine"></span>' + (it.d.caption ? '<span class="cap">' + esc(it.d.caption) + '</span>' : '');
        b.addEventListener('click', function () { openLB(it.i); });
      } else {
        b.innerHTML = (it.d.poster ? '<img alt="" src="' + it.d.poster + '">' : '<div style="width:100%;height:100%;background:linear-gradient(150deg,#f4b7c6,#e07a9a)"></div>') +
          '<span class="vplay"><i>▶</i><span>' + esc(it.d.title || 'Watch') + '</span></span><span class="shine"></span>';
        b.addEventListener('click', function () { openVideo(it.d); });
      }
      b.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = b.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        b.style.setProperty('--ry', (x * 12).toFixed(1) + 'deg'); b.style.setProperty('--rx', (-y * 12).toFixed(1) + 'deg');
      });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--ry', '0deg'); b.style.setProperty('--rx', '0deg'); });
      grid.appendChild(b);
    });
    layoutGrid();
    addEventListener('resize', layoutGrid);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    $$('.tile', grid).forEach(function (t) { io.observe(t); });
  }
  function layoutGrid() {
    var g = $('#grid'); if (!g) return;
    var cs = getComputedStyle(g), gap = parseFloat(cs.rowGap) || 10, rowH = 6, cols = cs.gridTemplateColumns.split(' ').length;
    var colW = (g.clientWidth - gap * (cols - 1)) / cols;
    $$('.tile', g).forEach(function (t) {
      var h = (colW - 12) * parseFloat(t.dataset.ratio) + 12;
      t.style.gridRowEnd = 'span ' + Math.ceil((h + gap) / (rowH + gap));
    });
  }

  function openLB(i) {
    lbI = i; $('#lightbox').hidden = false; document.body.style.overflow = 'hidden'; paintLB();
  }
  function paintLB() {
    var p = lbList[lbI]; $('#lb-img').src = p.url; $('#lb-cap').textContent = p.caption; $('#lb-count').textContent = (lbI + 1) + ' / ' + lbList.length;
  }
  function stepLB(d) { if (!lbList.length) return; lbI = (lbI + d + lbList.length) % lbList.length; paintLB(); }
  function stopSlide() { clearInterval(slideT); slideT = null; $('#lb-play').textContent = '▶ slideshow'; }
  function closeLB() { stopSlide(); $('#lightbox').hidden = true; document.body.style.overflow = ''; }
  $('#lb-close').addEventListener('click', closeLB);
  $('#lb-prev').addEventListener('click', function () { stepLB(-1); });
  $('#lb-next').addEventListener('click', function () { stepLB(1); });
  $('#lb-play').addEventListener('click', function () {
    if (slideT) { stopSlide(); return; }
    $('#lb-play').textContent = '❚❚ pause'; slideT = setInterval(function () { stepLB(1); }, 3200);
  });
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

  var musicWasOn = false;
  async function openVideo(v) {
    var vm = $('#vidmodal'), vid = $('#vm-video');
    musicWasOn = Music.playing; Music.pause();
    $('#vm-cap').textContent = v.url ? (v.caption || v.title) : 'Unlocking this memory…';
    vm.hidden = false; document.body.style.overflow = 'hidden';
    try {
      if (!v.url) v.url = await Seal.blobUrl(v.id, v.mime);
      if (vm.hidden) return;
      $('#vm-cap').textContent = v.caption || v.title || '';
      vid.src = v.url; vid.play().catch(function () { });
    } catch (e) { $('#vm-cap').textContent = 'Sorry, this video could not be opened.'; }
  }
  function closeVideo() {
    var vid = $('#vm-video'); vid.pause(); vid.removeAttribute('src'); vid.load();
    $('#vidmodal').hidden = true; document.body.style.overflow = '';
    if (musicWasOn) Music.resume();
  }
  $('#vm-close').addEventListener('click', closeVideo);
  $('#vidmodal').addEventListener('click', function (e) { if (e.target.id === 'vidmodal') closeVideo(); });

  /* =====================================================
     LETTER
     ===================================================== */
  function setupLetter() {
    var env = $('#envelope'), letter = $('#letter'), txt = $('#letter-text'), skip = $('#letter-skip');
    var full = fill(C.letter || '').trim(), timer = null, pos = 0;
    function finish() { clearInterval(timer); pos = full.length; txt.textContent = full; txt.classList.remove('typing'); skip.hidden = true; }
    env.addEventListener('click', async function () {
      if (env.classList.contains('opened')) return;
      env.classList.add('opened'); Snd.chime(3);
      await wait(reduce ? 0 : 900);
      letter.hidden = false; Snd.chime(6);
      letter.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      if (reduce) { finish(); return; }
      txt.classList.add('typing');
      timer = setInterval(function () { pos++; txt.textContent = full.slice(0, pos); if (pos >= full.length) finish(); }, 32);
    });
    skip.addEventListener('click', finish);
    letter.addEventListener('click', function () { if (pos < full.length) finish(); });
  }

  /* =====================================================
     GAME: pluck the petals
     ===================================================== */
  function setupPetals() {
    var NS = 'http://www.w3.org/2000/svg', svg = $('#flower'), N = 12, CX = 100, CY = 106;
    function el(n, a, parent) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); (parent || svg).appendChild(e); return e; }
    var defs = el('defs', {});
    var pg = el('linearGradient', { id: 'pg', x1: '0', y1: '1', x2: '0', y2: '0' }, defs);
    el('stop', { offset: '0', 'stop-color': '#e8799a' }, pg); el('stop', { offset: '.6', 'stop-color': '#f7a9bd' }, pg); el('stop', { offset: '1', 'stop-color': '#ffdce5' }, pg);
    var cg = el('radialGradient', { id: 'cg', cx: '40%', cy: '35%', r: '70%' }, defs);
    el('stop', { offset: '0', 'stop-color': '#fff1b8' }, cg); el('stop', { offset: '1', 'stop-color': '#e0a23c' }, cg);
    /* stem + leaves */
    el('path', { d: 'M100 118 C 98 170, 106 220, 100 286', fill: 'none', stroke: '#7da87a', 'stroke-width': 5, 'stroke-linecap': 'round' });
    el('path', { d: 'M100 204 C 70 194, 56 172, 60 152 C 84 158, 100 178, 100 204Z', fill: '#9bc596', stroke: '#7da87a', 'stroke-width': 1.5 });
    el('path', { d: 'M101 238 C 130 230, 146 210, 142 192 C 120 196, 102 214, 101 238Z', fill: '#9bc596', stroke: '#7da87a', 'stroke-width': 1.5 });
    var petalsG = el('g', {});
    var core = el('g', { class: 'fl-core' });
    el('circle', { cx: CX, cy: CY, r: 20, fill: 'url(#cg)', stroke: '#c98a2c', 'stroke-width': 1.2 }, core);
    for (var d = 0; d < 16; d++) { var a = rand(0, 6.283), rr = rand(2, 14); el('circle', { cx: CX + Math.cos(a) * rr, cy: CY + Math.sin(a) * rr, r: rand(.8, 1.6), fill: '#b9741f', opacity: .55 }, core); }

    var card = $('#petal-msg'), leftEl = $('#petals-left'), regrow = $('#regrow'), wrap = $('#flower-wrap');
    var bag = [], last = '', left = N, groups = [];
    function next() {
      var pool = C.petalMessages && C.petalMessages.length ? C.petalMessages : ['I love you.'];
      if (!bag.length) { bag = shuffle(pool); if (bag.length > 1 && bag[bag.length - 1] === last) bag.unshift(bag.pop()); }
      last = bag.pop(); return last;
    }
    function say(t, gold) { card.textContent = fill(t); card.className = 'msg-card' + (gold ? ' gold' : ''); void card.offsetWidth; card.classList.add('swap'); }
    function pluck(g, ang) {
      if (g.classList.contains('gone')) return;
      var vx = rand(-80, 80), vy = rand(110, 220), rad = ang * Math.PI / 180;
      var path = $('path', g);
      path.style.setProperty('--dx', (vx * Math.cos(rad) + vy * Math.sin(rad)).toFixed(1) + 'px');
      path.style.setProperty('--dy', (-vx * Math.sin(rad) + vy * Math.cos(rad)).toFixed(1) + 'px');
      path.style.setProperty('--rot', rand(-160, 160).toFixed(0) + 'deg');
      g.classList.remove('sprout'); g.classList.add('gone');
      left--; leftEl.textContent = left; Snd.chime(N - left - 1); if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) { } }
      if (left === 0) {
        wrap.classList.add('done'); say(C.petalFinale || 'I love you.', true); Snd.arp(); FW.show(3600); confetti(50); regrow.hidden = false;
      } else say(next());
    }
    for (var i = 0; i < N; i++) (function (i) {
      var ang = i * 360 / N;
      var g = el('g', { class: 'petal', transform: 'rotate(' + ang + ' ' + CX + ' ' + CY + ')' }, petalsG);
      el('path', { d: 'M100 108 C 83 86, 81 38, 100 14 C 119 38, 117 86, 100 108 Z', fill: 'url(#pg)', stroke: '#e0678c', 'stroke-width': 1.2 }, g);
      g.addEventListener('pointerdown', function (e) { e.preventDefault(); pluck(g, ang); });
      groups.push({ g: g, ang: ang });
    })(i);
    petalsG.parentNode.appendChild(core); /* keep the golden centre on top */
    regrow.addEventListener('click', function () {
      left = N; leftEl.textContent = N; wrap.classList.remove('done'); regrow.hidden = true;
      groups.forEach(function (o, k) { o.g.classList.remove('gone'); o.g.classList.add('sprout'); o.g.style.setProperty('--d', (k * 60) + 'ms'); });
      Snd.chime(7); say('Tap a petal ✦ (new messages this time!)');
    });
  }

  /* =====================================================
     FINALE: promises + wax seal
     ===================================================== */
  function setupFinale() {
    var ol = $('#promises'); ol.innerHTML = '';
    (C.promises || []).forEach(function (p, i) { var li = document.createElement('li'); li.textContent = fill(p); li.style.transitionDelay = (i * 0.45 + 0.3) + 's'; ol.appendChild(li); });
    $('#final-sub').textContent = fill(C.finalSub || '');
    var btn = $('#seal-it'), stamped = false;
    btn.addEventListener('click', async function () {
      if (stamped) return; stamped = true;
      btn.classList.add('stamped'); $('#sp-txt').textContent = 'sealed with love ♥'; Snd.thump();
      var r = btn.getBoundingClientRect(); sparkleBurst(r.left + r.width / 2, r.top + 60, 20);
      await wait(350); Snd.arp(); FW.show(6500); confetti(100);
      var after = $('#after'); after.hidden = false;
      if (C.togetherSince) {
        var dt = new Date(C.togetherSince + 'T00:00:00');
        if (!isNaN(dt)) { var days = Math.floor((Date.now() - dt.getTime()) / 86400000); if (days >= 0) { var t = $('#together'); t.hidden = false; t.innerHTML = 'We have been together for <b>' + days + '</b> days, and every one of them is my favorite.'; } }
      }
      await wait(900);
      after.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
    $('#replay').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); confetti(40); });
  }
})();
