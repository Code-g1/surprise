(function () {
  'use strict';
  var C = window.GIFT;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  function fill(t) {
    return String(t)
      .replace(/\{name\}/g, C.herName).replace(/\{him\}/g, C.hisName)
      .replace(/\{age\}/g, C.age).replace(/\{ordinal\}/g, ordinal(C.age));
  }
  function esc(t) { return String(t).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  /* ---------- fill names ---------- */
  document.title = 'For ' + C.herName + ' 💌';
  $('#gift-title').textContent = 'For you, ' + C.herName + '.';
  $('#age-ord').textContent = ordinal(C.age);
  $('#hero-name').textContent = C.herName;
  $('.eyebrow').textContent = C.birthday;
  $('#fin-name').textContent = C.herName;
  $('#fin-him').textContent = C.hisName;

  /* ---------- screens ---------- */
  function show(id) {
    $$('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
    document.body.classList.toggle('locked-scroll', id !== 'screen-main');
    window.scrollTo(0, 0);
  }

  /* ---------- roses ---------- */
  var ROSES = [
    ['#f6a9bd', '#fcd3de', '#d4577b'],
    ['#f2a58c', '#f9cdb9', '#cf6b52'],
    ['#fff3ea', '#ffffff', '#e0bfae']
  ];
  function roseSVG(i, size) {
    var c = ROSES[i % 3], o = '', k;
    for (k = 0; k < 7; k++) {
      var a = k * 360 / 7;
      o += '<circle cx="50" cy="22" r="21" transform="rotate(' + a + ' 50 50)" fill="' + c[0] + '" stroke="' + c[2] + '" stroke-opacity=".55" stroke-width="1.5"/>';
    }
    for (k = 0; k < 5; k++) {
      var b = k * 72 + 20;
      o += '<circle cx="50" cy="34" r="16" transform="rotate(' + b + ' 50 50)" fill="' + c[1] + '" stroke="' + c[2] + '" stroke-opacity=".5" stroke-width="1.3"/>';
    }
    o += '<circle cx="50" cy="50" r="13" fill="' + c[0] + '" stroke="' + c[2] + '" stroke-opacity=".6" stroke-width="1.4"/>' +
      '<path d="M50 40 C 60 42, 60 56, 49 58 C 41 58, 40 48, 48 46 C 53 45, 55 50, 51 52" fill="none" stroke="' + c[2] + '" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>';
    return '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '">' + o + '</svg>';
  }

  function roseBurst(mid) {
    var layer = $('#rose-layer');
    layer.className = '';
    layer.innerHTML = '';
    var count = reduce ? 0 : (window.innerWidth < 600 ? 34 : 56);
    for (var i = 0; i < count; i++) {
      var size = rand(100, 190);
      var el = document.createElement('div');
      el.className = 'rose';
      el.style.left = rand(-8, 96) + '%';
      el.style.top = rand(-6, 98) + '%';
      el.style.marginLeft = -size / 2 + 'px';
      el.style.marginTop = -size / 2 + 'px';
      el.style.setProperty('--rot', rand(-50, 50) + 'deg');
      el.style.animationDelay = rand(0, 0.55) + 's';
      el.innerHTML = roseSVG(i, size);
      layer.appendChild(el);
    }
    wait(reduce ? 0 : 1250).then(function () {
      mid();
      layer.classList.add('out');
      return wait(1000);
    }).then(function () { layer.innerHTML = ''; });
  }

  /* ---------- music ---------- */
  var audio = null, musicBtn = $('#music-btn'), musicReady = false;
  function setupMusic() {
    if (!C.music) return;
    var exts = ['.mp3', '.m4a', '.ogg', '.wav'], idx = 0;
    var base = C.music.replace(/\.(mp3|m4a|ogg|wav)$/i, '');
    audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.addEventListener('canplay', function () { musicReady = true; });
    audio.addEventListener('error', function () {
      idx++;
      if (idx < exts.length) { audio.src = base + exts[idx]; } else { audio = null; }
    });
    audio.src = base + exts[0];
  }
  function unlockAudio() {
    if (!audio) return;
    try {
      audio.muted = true;
      var p = audio.play();
      if (p && p.then) p.then(function () { audio.pause(); audio.currentTime = 0; audio.muted = false; }).catch(function () { audio.muted = false; });
    } catch (e) { audio.muted = false; }
  }
  function startMusic() {
    if (!audio) return;
    var go = function () {
      if (!musicReady) { return false; }
      musicBtn.hidden = false;
      var p = audio.play();
      if (p && p.then) p.then(function () { musicBtn.classList.add('on'); }).catch(function () { musicBtn.classList.remove('on'); });
      return true;
    };
    if (!go()) {
      audio.addEventListener('canplay', function once() { audio.removeEventListener('canplay', once); go(); });
    }
  }
  musicBtn.addEventListener('click', function () {
    if (!audio) return;
    if (audio.paused) { audio.play(); musicBtn.classList.add('on'); }
    else { audio.pause(); musicBtn.classList.remove('on'); }
  });
  setupMusic();

  /* ---------- 1. gift ---------- */
  var giftBtn = $('#gift-btn'), opened = false;
  giftBtn.addEventListener('click', function () {
    if (opened) return; opened = true;
    unlockAudio();
    giftBtn.classList.add('open');
    wait(reduce ? 0 : 650).then(function () {
      roseBurst(function () { show('screen-intro'); startQuotes(); });
    });
  });

  /* ---------- 2. intro quotes ---------- */
  var qi = 0, qTimer = null;
  var qText = $('#quote-text'), qDots = $('#quote-dots');
  C.introQuotes.forEach(function (_, i) {
    var d = document.createElement('i');
    d.addEventListener('click', function () { setQuote(i); startQuotes(); });
    qDots.appendChild(d);
  });
  function setQuote(i) {
    qi = i;
    qText.classList.add('fade');
    setTimeout(function () {
      qText.innerHTML = esc(fill(C.introQuotes[qi])).replace(/\*(.+?)\*/g, '<em class="hl">$1</em>');
      qText.classList.remove('fade');
    }, reduce ? 0 : 350);
    $$('i', qDots).forEach(function (d, k) { d.classList.toggle('on', k === qi); });
  }
  function startQuotes() {
    clearInterval(qTimer);
    setQuote(qi);
    qTimer = setInterval(function () { setQuote((qi + 1) % C.introQuotes.length); }, 4200);
  }
  $('#to-lock').addEventListener('click', function () {
    clearInterval(qTimer);
    show('screen-lock');
    $('#lock-msg').textContent = C.hint || '';
  });

  /* ---------- 3. lock ---------- */
  var entry = '', busy = false;
  var pinDots = $('#pin-dots'), lockMsg = $('#lock-msg');
  function paintDots(cls) {
    $$('i', pinDots).forEach(function (d, i) { d.classList.toggle('filled', i < entry.length); });
    pinDots.className = 'pin-dots' + (cls ? ' ' + cls : '');
  }
  function press(k) {
    if (busy) return;
    if (k === 'clear') { entry = ''; paintDots(); return; }
    if (entry.length >= 4) return;
    entry += k; paintDots();
    if (entry.length === 4) { busy = true; setTimeout(check, 260); }
  }
  function check() {
    if (window.hashCode(C.salt + entry) === C.passcodeHash) {
      pinDots.className = 'pin-dots ok';
      $$('i', pinDots).forEach(function (d) { d.classList.add('filled'); });
      $('#padlock').classList.add('open');
      $('#lock-title').textContent = 'Unlocked';
      lockMsg.textContent = 'Welcome, my love 💖';
      wait(1300).then(function () { show('screen-loading'); return wait(reduce ? 300 : 2600); })
        .then(function () { show('screen-main'); enterMain(); startMusic(); });
    } else {
      paintDots('bad');
      lockMsg.textContent = "Hmm, that's not it… think of our special numbers 💭";
      wait(650).then(function () { entry = ''; paintDots(); busy = false; });
    }
  }
  $$('#keypad button').forEach(function (b) {
    b.addEventListener('click', function () { press(b.getAttribute('data-k')); });
  });
  document.addEventListener('keydown', function (e) {
    if (!$('#screen-lock').classList.contains('active')) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace' || e.key === 'Escape') press('clear');
  });

  /* wreath for loading screen */
  (function () {
    var w = $('#wreath');
    for (var i = 0; i < 8; i++) {
      var el = document.createElement('div');
      el.className = 'rose';
      var a = i * 45 * Math.PI / 180;
      el.style.transform = 'translate(' + Math.sin(a) * 52 + 'px,' + (-Math.cos(a) * 52) + 'px)';
      el.innerHTML = roseSVG(i, 52);
      w.appendChild(el);
    }
  })();

  /* ---------- confetti ---------- */
  function confetti(n) {
    if (reduce) return;
    var box = $('#confetti'), em = ['💖', '🌸', '✨', '💗', '🌹', '🎀'], cols = ['#f6a9bd', '#fcd3de', '#f2a58c', '#ffd98a', '#e8758f'];
    for (var i = 0; i < n; i++) {
      var el = document.createElement('div');
      el.className = 'cf';
      if (i % 3 === 0) { el.textContent = em[i % em.length]; el.style.fontSize = rand(16, 26) + 'px'; }
      else { el.style.width = rand(7, 12) + 'px'; el.style.height = rand(10, 16) + 'px'; el.style.background = cols[i % cols.length]; el.style.borderRadius = '2px'; }
      el.style.left = rand(0, 100) + '%';
      el.style.setProperty('--cx', rand(-90, 90) + 'px');
      el.style.setProperty('--cr', rand(-540, 540) + 'deg');
      el.style.animationDuration = rand(3, 6) + 's';
      el.style.animationDelay = rand(0, 1.2) + 's';
      box.appendChild(el);
      (function (x) { setTimeout(function () { x.remove(); }, 8000); })(el);
    }
  }

  /* ---------- 5. main ---------- */
  var built = false;
  function enterMain() {
    if (!built) { built = true; buildWall(); buildVideos(); setupLetter(); setupGame(); setupTogether(); }
    setTimeout(function () { confetti(70); }, 400);
    observeReveals();
  }

  function observeReveals() {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* progressive extension loader: tries photo-01.jpg, .jpeg, .png ... */
  var IMG_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG'];
  var VID_EXT = ['.mp4', '.webm', '.MP4', '.mov', '.MOV'];
  function tryLoad(el, base, exts, onFail) {
    var i = 0;
    el.addEventListener('error', function () {
      i++;
      if (i < exts.length) el.src = base + exts[i]; else onFail();
    });
    el.src = base + exts[0];
  }

  function buildWall() {
    var wall = $('#wall'), tilt = [-4, 3, -2, 5, -5, 2, 4, -3, 3, -4, 2, -2];
    C.photos.forEach(function (p, i) {
      var fig = document.createElement('figure');
      fig.className = 'polaroid';
      fig.style.setProperty('--r', tilt[i % tilt.length] + 'deg');
      fig.style.setProperty('--y', (i % 3 === 1 ? 10 : 0) + 'px');
      fig.style.setProperty('--d', (i * 0.09) + 's');
      var img = new Image();
      img.alt = p.caption || ('Photo ' + (i + 1));
      img.decoding = 'async';
      img.loading = i < 4 ? 'eager' : 'lazy';
      var cap = document.createElement('figcaption');
      cap.textContent = fill(p.caption || '');
      fig.appendChild(img); fig.appendChild(cap);
      wall.appendChild(fig);
      img.addEventListener('load', function () { fig.dataset.ok = '1'; fig.addEventListener('click', function () { openLB(fig); }); });
      tryLoad(img, 'assets/photos/' + p.file, IMG_EXT, function () {
        if (C.showPlaceholders) {
          var ph = document.createElement('div');
          ph.className = 'ph';
          ph.innerHTML = '<span class="ph-heart">♥</span><span>Photo ' + (i + 1) + '<br>goes here</span>';
          img.replaceWith(ph);
          fig.classList.add('ph-card');
        } else { fig.remove(); }
      });
    });
  }

  function buildVideos() {
    var box = $('#vids');
    C.videos.forEach(function (v, i) {
      var fig = document.createElement('figure');
      fig.className = 'vid reveal';
      fig.style.setProperty('--r', (i % 2 ? 1.6 : -1.6) + 'deg');
      var vid = document.createElement('video');
      vid.controls = true; vid.playsInline = true; vid.preload = 'metadata';
      vid.setAttribute('playsinline', ''); vid.setAttribute('webkit-playsinline', '');
      var cap = document.createElement('figcaption');
      cap.innerHTML = (v.title ? '<span class="vtitle">' + esc(fill(v.title)) + '</span>' : '') + esc(fill(v.caption || ''));
      fig.appendChild(vid); fig.appendChild(cap);
      box.appendChild(fig);
      // pause other video when one starts
      vid.addEventListener('play', function () { $$('video').forEach(function (o) { if (o !== vid) o.pause(); }); if (audio && !audio.paused) { audio.pause(); musicBtn.classList.remove('on'); } });
      var n = 0, base = 'assets/videos/' + v.file;
      vid.addEventListener('error', function () {
        n++;
        if (n < VID_EXT.length) { vid.src = base + VID_EXT[n]; return; }
        if (C.showPlaceholders) {
          var ph = document.createElement('div');
          ph.className = 'ph';
          ph.innerHTML = '<span class="ph-heart">▶</span><span>Video ' + (i + 1) + ' goes here</span>';
          vid.replaceWith(ph);
        } else { fig.remove(); }
      });
      vid.src = base + VID_EXT[0] + '#t=0.1';
    });
  }

  /* lightbox */
  var lbList = [], lbI = 0;
  function openLB(fig) {
    lbList = $$('#wall .polaroid').filter(function (f) { return f.dataset.ok === '1'; });
    lbI = lbList.indexOf(fig);
    $('#lightbox').hidden = false;
    document.body.style.overflow = 'hidden';
    paintLB();
  }
  function paintLB() {
    var f = lbList[lbI], im = $('img', f);
    $('#lb-img').src = im.currentSrc || im.src;
    $('#lb-cap').textContent = $('figcaption', f).textContent;
    $('#lb-count').textContent = (lbI + 1) + ' / ' + lbList.length;
  }
  function stepLB(d) { if (!lbList.length) return; lbI = (lbI + d + lbList.length) % lbList.length; paintLB(); }
  function closeLB() { $('#lightbox').hidden = true; document.body.style.overflow = ''; }
  $('#lb-close').addEventListener('click', closeLB);
  $('#lb-prev').addEventListener('click', function () { stepLB(-1); });
  $('#lb-next').addEventListener('click', function () { stepLB(1); });
  $('#lightbox').addEventListener('click', function (e) { if (e.target.id === 'lightbox') closeLB(); });
  document.addEventListener('keydown', function (e) {
    if ($('#lightbox').hidden) return;
    if (e.key === 'Escape') closeLB(); if (e.key === 'ArrowLeft') stepLB(-1); if (e.key === 'ArrowRight') stepLB(1);
  });
  (function () {
    var sx = null, lb = $('#lightbox');
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) stepLB(dx < 0 ? 1 : -1);
    });
  })();

  /* letter */
  function setupLetter() {
    var env = $('#envelope'), letter = $('#letter'), txt = $('#letter-text'), skip = $('#letter-skip');
    var full = fill(C.letter).trim(), timer = null, pos = 0;
    function finish() { clearInterval(timer); txt.textContent = full; txt.classList.remove('typing'); skip.hidden = true; }
    env.addEventListener('click', function () {
      if (env.classList.contains('opened')) return;
      env.classList.add('opened');
      wait(reduce ? 0 : 700).then(function () {
        letter.hidden = false;
        letter.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        if (reduce) { finish(); return; }
        txt.classList.add('typing');
        timer = setInterval(function () {
          pos += 1;
          txt.textContent = full.slice(0, pos);
          if (pos >= full.length) finish();
        }, 34);
      });
    });
    skip.addEventListener('click', finish);
    letter.addEventListener('click', function () { if (pos < full.length) { pos = full.length; finish(); } });
  }

  /* ---------- game ---------- */
  function setupGame() {
    var field = $('#field'), startBtn = $('#game-start'), msgBox = $('#game-msg'), scoreEl = $('#score'), gameEl = $('#game');
    var score = 0, running = false, spawnT = null, hideT = null, visible = false;
    var bag = [], goldBag = [];
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    var last = '';
    function next(list, bagName) {
      if (bagName === 'g') { if (!goldBag.length) goldBag = shuffle(list); return goldBag.pop(); }
      if (!bag.length) { bag = shuffle(list); if (bag.length > 1 && bag[bag.length - 1] === last) bag.unshift(bag.pop()); }
      last = bag.pop(); return last;
    }
    var HEARTS = ['💗', '💖', '💕', '❤️', '🩷', '💘'];

    function spawn() {
      if (!running || !visible || document.hidden) return;
      var h = document.createElement('div');
      var gold = (score + 1) % 7 === 0 && !field.querySelector('.heart.gold');
      var size = gold ? rand(46, 54) : rand(30, 46);
      var w = field.clientWidth, hh = field.clientHeight;
      h.className = 'heart' + (gold ? ' gold' : '');
      h.textContent = gold ? '💛' : HEARTS[Math.floor(Math.random() * HEARTS.length)];
      h.style.fontSize = size + 'px';
      h.style.left = rand(8, Math.max(20, w - size - 18)) + 'px';
      h.style.setProperty('--h', hh + 'px');
      h.style.setProperty('--sway', rand(-34, 34) + 'px');
      h.style.animationDuration = (gold ? rand(5.5, 7) : rand(4.6, 7.4)) + 's';
      h.addEventListener('animationend', function (e) { if (e.animationName === 'fall') h.remove(); else if (e.animationName === 'pop') h.remove(); });
      var catchIt = function (e) {
        e.preventDefault();
        if (h.classList.contains('pop')) return;
        var r = h.getBoundingClientRect(), fr = field.getBoundingClientRect();
        var cx = r.left - fr.left + r.width / 2, cy = r.top - fr.top + r.height / 2;
        h.style.left = (r.left - fr.left) + 'px';
        h.style.top = (r.top - fr.top) + 'px';
        h.style.animation = 'none';
        h.style.transform = 'none';
        void h.offsetWidth;
        h.classList.add('pop');
        sparkles(cx, cy);
        score++; scoreEl.textContent = score;
        say(fill(gold ? next(C.goldenMessages, 'g') : next(C.gameMessages)), gold);
        if (gold) confetti(40);
        if (navigator.vibrate) { try { navigator.vibrate(18); } catch (er) { } }
      };
      h.addEventListener('pointerdown', catchIt);
      field.appendChild(h);
    }
    function sparkles(x, y) {
      var s = ['✨', '💖', '✦', '♥'];
      for (var i = 0; i < 7; i++) {
        var el = document.createElement('span');
        el.className = 'sparkle'; el.textContent = s[i % s.length];
        el.style.left = x + 'px'; el.style.top = y + 'px';
        var a = Math.random() * 6.28, d = rand(30, 70);
        el.style.setProperty('--dx', Math.cos(a) * d + 'px'); el.style.setProperty('--dy', Math.sin(a) * d + 'px');
        field.appendChild(el);
        setTimeout(function (e) { e.remove(); }.bind(null, el), 800);
      }
    }
    function say(t, gold) {
      msgBox.textContent = t;
      msgBox.className = 'game-msg show' + (gold ? ' gold' : '');
      clearTimeout(hideT);
      hideT = setTimeout(function () { msgBox.classList.remove('show'); }, gold ? 6500 : 5200);
    }
    function start() {
      running = true; startBtn.hidden = true; score = 0; scoreEl.textContent = '0';
      clearInterval(spawnT); spawnT = setInterval(spawn, 760);
      spawn();
    }
    startBtn.addEventListener('click', start);
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.15 }).observe(gameEl);
  }

  function setupTogether() {
    if (!C.togetherSince) return;
    var d = new Date(C.togetherSince + 'T00:00:00');
    if (isNaN(d)) return;
    var days = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (days < 0) return;
    var el = $('#together');
    el.hidden = false;
    el.innerHTML = 'We have been together for <b>' + days + '</b> days, and every one of them is my favorite.';
  }

  $('#replay').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); confetti(50); });

  /* ---------- falling petals background ---------- */
  (function () {
    if (reduce) return;
    var cv = $('#petals'), cx = cv.getContext('2d'), W, H, dpr = Math.min(window.devicePixelRatio || 1, 2), P = [];
    function size() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    var cols = ['rgba(246,169,189,.55)', 'rgba(242,165,140,.5)', 'rgba(255,240,232,.7)', 'rgba(232,117,143,.4)'];
    for (var i = 0; i < (W < 600 ? 16 : 28); i++) P.push(mk(true));
    function mk(init) {
      return { x: rand(0, W), y: init ? rand(0, H) : rand(-40, -10), s: rand(6, 13), v: rand(.25, .75), sw: rand(.5, 1.4), ph: rand(0, 6.28), r: rand(0, 6.28), rv: rand(-.02, .02), c: cols[Math.floor(Math.random() * cols.length)] };
    }
    function tick() {
      cx.clearRect(0, 0, W, H);
      P.forEach(function (p, i) {
        p.y += p.v; p.ph += .012; p.x += Math.sin(p.ph) * p.sw * .5; p.r += p.rv;
        if (p.y > H + 20) P[i] = mk(false);
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
        cx.beginPath(); cx.ellipse(0, 0, p.s, p.s * .55, 0, 0, 6.283); cx.fill(); cx.restore();
      });
      requestAnimationFrame(tick);
    }
    tick();
  })();
})();
