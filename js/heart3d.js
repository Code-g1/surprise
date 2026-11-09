/* A real 3D heart: inflated mesh, lit and depth-sorted on a 2D canvas (no libraries).
   Drag to spin it. Tap it for a burst of love. */
(function () {
  'use strict';
  var U = window.U, rand = U.rand;
  var NT = 64, NS = 11, D = 0.62, YC = -0.135;
  var hx = function (t) { return 16 * Math.pow(Math.sin(t), 3) / 17; };
  var hy = function (t) { return (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17; };

  /* ---------- build the mesh once ---------- */
  var ROW = NT + 1, PER = (NS + 1) * ROW, VN = PER * 2;
  var VX = new Float32Array(VN), VY = new Float32Array(VN), VZ = new Float32Array(VN);
  (function () {
    for (var j = 0; j <= NS; j++) {
      var phi = j / NS * Math.PI / 2, r = Math.sin(phi), z = D * Math.cos(phi);
      for (var i = 0; i <= NT; i++) {
        var t = i / NT * Math.PI * 2, k = j * ROW + i;
        VX[k] = hx(t) * r; VY[k] = hy(t) * r - YC; VZ[k] = z;
        VX[PER + k] = VX[k]; VY[PER + k] = VY[k]; VZ[PER + k] = -z;
      }
    }
  })();
  var FN = NT * NS * 2;
  var FA = new Int32Array(FN), FB = new Int32Array(FN), FC = new Int32Array(FN), FD = new Int32Array(FN);
  var FNX = new Float32Array(FN), FNY = new Float32Array(FN), FNZ = new Float32Array(FN);
  var FCX = new Float32Array(FN), FCY = new Float32Array(FN), FCZ = new Float32Array(FN);
  var FR = new Uint8Array(FN), FG = new Uint8Array(FN), FBL = new Uint8Array(FN);
  (function () {
    var f = 0;
    for (var side = 0; side < 2; side++) {
      var off = side * PER;
      for (var j = 0; j < NS; j++) for (var i = 0; i < NT; i++) {
        var a = off + j * ROW + i, b = off + j * ROW + i + 1, c = off + (j + 1) * ROW + i + 1, d = off + (j + 1) * ROW + i;
        FA[f] = a; FB[f] = b; FC[f] = c; FD[f] = d;
        var d1x = VX[c] - VX[a], d1y = VY[c] - VY[a], d1z = VZ[c] - VZ[a];
        var d2x = VX[d] - VX[b], d2y = VY[d] - VY[b], d2z = VZ[d] - VZ[b];
        var nx = d1y * d2z - d1z * d2y, ny = d1z * d2x - d1x * d2z, nz = d1x * d2y - d1y * d2x;
        var len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= len; ny /= len; nz /= len;
        if (side === 0 && nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
        if (side === 1 && nz > 0) { nx = -nx; ny = -ny; nz = -nz; }
        FNX[f] = nx; FNY[f] = ny; FNZ[f] = nz;
        FCX[f] = (VX[a] + VX[b] + VX[c] + VX[d]) / 4; FCY[f] = (VY[a] + VY[b] + VY[c] + VY[d]) / 4; FCZ[f] = (VZ[a] + VZ[b] + VZ[c] + VZ[d]) / 4;
        var h = U.clamp((FCY[f] + 0.85) / 1.6, 0, 1); /* low = deep rose, high = bright blush */
        FR[f] = 196 + h * 59; FG[f] = 48 + h * 82; FBL[f] = 92 + h * 66;
        f++;
      }
    }
  })();
  var SX = new Float32Array(VN), SY = new Float32Array(VN), SZ = new Float32Array(VN);
  var DEPTH = new Float32Array(FN), LUM = new Float32Array(FN), SPEC = new Float32Array(FN);

  /* ---------- state ---------- */
  var cv, cx, slot, W, H, dpr, running = false, raf = 0;
  var yaw = 0.5, vel = 0.012, pitch = 0.16, drag = false, lastX = 0, downX = 0, downY = 0, downT = 0, moved = 0;
  var appear = 0, appearing = false, appearT0 = 0, pulse = 0;
  var halo = [], minis = [];
  for (var hi = 0; hi < 46; hi++) halo.push({ a: rand(0, 6.283), r: rand(1.22, 1.55), y: rand(-.22, .22), s: rand(1.2, 3.2), sp: rand(.2, .6), gold: Math.random() < .55, tw: rand(0, 6.28) });
  var onTap = null;

  function resize() {
    if (!cv) return; dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function easeOutBack(x) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }

  function miniHeart(x, y, s, col, a) {
    cx.globalAlpha = a; cx.fillStyle = col; cx.beginPath(); cx.moveTo(x, y + s * .35);
    cx.bezierCurveTo(x + s, y - s * .35, x + s * .55, y - s * 1.05, x, y - s * .45);
    cx.bezierCurveTo(x - s * .55, y - s * 1.05, x - s, y - s * .35, x, y + s * .35); cx.fill(); cx.globalAlpha = 1;
  }

  var order = [];
  function draw(t) {
    if (!running) return;
    cx.clearRect(0, 0, W, H);
    var tt = t / 1000;
    /* heartbeat */
    var ph = tt * 6.283 / 1.15;
    var beat = Math.pow(Math.max(0, Math.sin(ph)), 14) * .9 + Math.pow(Math.max(0, Math.sin(ph - .95)), 14) * .5;
    if (appearing) { var p = U.clamp((t - appearT0) / 1700, 0, 1); appear = easeOutBack(p); if (p >= 1) appearing = false; }
    pulse *= .94;
    var r = slot.getBoundingClientRect();
    var S = Math.min(r.width * .46, r.height * .46) * (appear > 0 ? appear : 0) * (1 + .05 * beat + .13 * pulse);
    var cxp = r.left + r.width / 2, cyp = r.top + r.height / 2;
    if (S < 2) { raf = requestAnimationFrame(draw); return; }

    /* spin + inertia */
    if (!drag) { vel += (0.011 - vel) * .02; yaw += vel; }
    var cy_ = Math.cos(yaw), sy_ = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), PERSP = 3.4;

    /* soft glow + ground shadow */
    var g = cx.createRadialGradient(cxp, cyp, S * .2, cxp, cyp, S * 2.3);
    g.addColorStop(0, 'rgba(255,150,185,' + (.34 + .14 * beat + .1 * pulse).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,150,185,0)');
    cx.fillStyle = g; cx.beginPath(); cx.arc(cxp, cyp, S * 2.3, 0, 6.283); cx.fill();
    cx.save(); cx.translate(cxp, cyp + S * 1.42); cx.scale(1, .16);
    var sg = cx.createRadialGradient(0, 0, 0, 0, 0, S * 1.1); sg.addColorStop(0, 'rgba(150,40,80,.28)'); sg.addColorStop(1, 'rgba(150,40,80,0)');
    cx.fillStyle = sg; cx.beginPath(); cx.arc(0, 0, S * 1.1, 0, 6.283); cx.fill(); cx.restore();

    /* halo particles (back half) */
    var hp = [], i, q;
    for (i = 0; i < halo.length; i++) {
      q = halo[i]; var a = q.a + tt * q.sp;
      var hx0 = Math.cos(a) * q.r, hz0 = Math.sin(a) * q.r, hy0 = q.y + Math.sin(tt * .8 + q.tw) * .04;
      var x1 = hx0, y1 = hy0 * cp - hz0 * sp, z1 = hy0 * sp + hz0 * cp; /* ring tilted by pitch */
      hp.push({ x: x1, y: y1, z: z1, q: q });
    }
    function drawHalo(front) {
      for (var n = 0; n < hp.length; n++) {
        var o = hp[n]; if ((o.z >= 0) !== front) continue;
        var k = PERSP / (PERSP - o.z), px = cxp + o.x * S * k, py = cyp - o.y * S * k;
        var tw = .55 + .45 * Math.sin(tt * 3 + o.q.tw), sz = o.q.s * k * (S / 130 + .35);
        cx.fillStyle = o.q.gold ? 'rgba(255,226,160,' + (.35 * tw).toFixed(3) + ')' : 'rgba(255,255,255,' + (.4 * tw).toFixed(3) + ')';
        cx.beginPath(); cx.arc(px, py, sz * 2.6, 0, 6.283); cx.fill();
        cx.fillStyle = o.q.gold ? 'rgba(255,238,190,' + (.95 * tw).toFixed(3) + ')' : 'rgba(255,255,255,' + (.95 * tw).toFixed(3) + ')';
        cx.beginPath(); cx.arc(px, py, sz, 0, 6.283); cx.fill();
      }
    }
    drawHalo(false);

    /* transform vertices */
    for (i = 0; i < VN; i++) {
      var x = VX[i], y = VY[i], z = VZ[i];
      var x1_ = x * cy_ + z * sy_, z1_ = -x * sy_ + z * cy_;
      var y2 = y * cp - z1_ * sp, z2 = y * sp + z1_ * cp;
      var kk = PERSP / (PERSP - z2);
      SX[i] = cxp + x1_ * S * kk; SY[i] = cyp - y2 * S * kk; SZ[i] = z2;
    }
    /* faces: cull, light, sort */
    var Lx = -.45, Ly = .55, Lz = .70, ll = Math.sqrt(Lx * Lx + Ly * Ly + Lz * Lz); Lx /= ll; Ly /= ll; Lz /= ll;
    var Hx = Lx, Hy = Ly, Hz = Lz + 1, hl = Math.sqrt(Hx * Hx + Hy * Hy + Hz * Hz); Hx /= hl; Hy /= hl; Hz /= hl;
    order.length = 0;
    for (var f = 0; f < FN; f++) {
      var nx = FNX[f], ny = FNY[f], nz = FNZ[f];
      var nx1 = nx * cy_ + nz * sy_, nz1 = -nx * sy_ + nz * cy_;
      var ny2 = ny * cp - nz1 * sp, nz2 = ny * sp + nz1 * cp;
      if (nz2 <= 0) continue;
      var diff = Math.max(0, nx1 * Lx + ny2 * Ly + nz2 * Lz);
      var sdot = Math.max(0, nx1 * Hx + ny2 * Hy + nz2 * Hz);
      LUM[f] = diff; SPEC[f] = Math.pow(sdot, 34) * .95 + Math.pow(1 - nz2, 2.4) * .18;
      var cxx = FCX[f], cz = FCZ[f], cz1 = -cxx * sy_ + cz * cy_, cyy = FCY[f];
      DEPTH[f] = cyy * sp + cz1 * cp;
      order.push(f);
    }
    order.sort(function (a, b) { return DEPTH[a] - DEPTH[b]; });
    cx.lineJoin = 'round'; cx.lineWidth = .8;
    for (i = 0; i < order.length; i++) {
      f = order[i];
      var rr = Math.min(255, FR[f] * (.38 + .78 * LUM[f]) + 255 * SPEC[f] * .9 + 24);
      var gg = Math.min(255, FG[f] * (.38 + .78 * LUM[f]) + 235 * SPEC[f] * .9 + 6);
      var bb = Math.min(255, FBL[f] * (.38 + .78 * LUM[f]) + 235 * SPEC[f] * .9 + 12);
      var col = 'rgb(' + (rr | 0) + ',' + (gg | 0) + ',' + (bb | 0) + ')';
      cx.fillStyle = col; cx.strokeStyle = col;
      cx.beginPath(); cx.moveTo(SX[FA[f]], SY[FA[f]]); cx.lineTo(SX[FB[f]], SY[FB[f]]); cx.lineTo(SX[FC[f]], SY[FC[f]]); cx.lineTo(SX[FD[f]], SY[FD[f]]); cx.closePath(); cx.fill(); cx.stroke();
    }
    drawHalo(true);

    /* mini hearts floating up from taps */
    for (i = minis.length - 1; i >= 0; i--) {
      var m = minis[i]; m.x += m.vx; m.y += m.vy; m.vy *= .995; m.life -= .012;
      if (m.life <= 0) { minis.splice(i, 1); continue; }
      miniHeart(m.x, m.y, m.s, m.c, Math.min(1, m.life * 1.6));
    }
    raf = requestAnimationFrame(draw);
  }

  /* ---------- input ---------- */
  function down(e) { drag = true; lastX = downX = e.clientX; downY = e.clientY; downT = Date.now(); moved = 0; vel = 0; try { cv.setPointerCapture(e.pointerId); } catch (er) { } }
  function move(e) { if (!drag) return; var dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx) + Math.abs(e.movementY || 0); yaw += dx * .013; vel = dx * .013; }
  function up(e) {
    if (!drag) return; drag = false;
    if (moved < 10 && Date.now() - downT < 450 && appear > .6) burst(e.clientX, e.clientY);
  }
  function burst(x, y) {
    pulse = 1;
    var r = slot.getBoundingClientRect(), cxp = r.left + r.width / 2, cyp = r.top + r.height / 2, cols = ['#ff7fa3', '#ffb3c6', '#e8506f', '#ffd6e0', '#e6c07b'];
    for (var i = 0; i < 16; i++) minis.push({ x: cxp + rand(-20, 20), y: cyp + rand(-10, 20), vx: rand(-1.6, 1.6), vy: -rand(1.2, 3.4), s: rand(7, 16), c: cols[i % cols.length], life: 1 });
    if (onTap) onTap();
  }

  window.Heart = {
    init: function (canvas, slotEl) {
      cv = canvas; cx = cv.getContext('2d'); slot = slotEl; resize(); addEventListener('resize', resize);
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', function () { drag = false; });
    },
    start: function () { if (running) return; running = true; resize(); raf = requestAnimationFrame(draw); },
    stop: function () { running = false; cancelAnimationFrame(raf); },
    reveal: function () { appear = 0; appearing = true; appearT0 = performance.now(); },
    onTap: function (fn) { onTap = fn; },
    get ready() { return appear > .6; }
  };
})();
