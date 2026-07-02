// lang.js
document.addEventListener('DOMContentLoaded', () => {
  const langButtons = {
    es: document.getElementById('lang-es'),
    en: document.getElementById('lang-en')
  };

  const updateInternalLinks = (lang) => {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      // ignore anchors and special schemes
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      try {
        const u = new URL(href, location.href);
        // only touch same-origin links; leave external links alone
        if (u.origin === location.origin) {
          u.searchParams.set('lang', lang);
          a.setAttribute('href', u.href); // keep full URL (origin + path + search + hash)
        }
      } catch (e) {
        // ignore malformed URLs
      }
    });
  };

  const setLanguage = (lang) => {
    try { localStorage.setItem('dg_lang', lang); } catch(e) {}
    document.documentElement.lang = lang;

    // buttons
    Object.values(langButtons).forEach(btn => btn && btn.classList.remove('active'));
    if (langButtons[lang]) langButtons[lang].classList.add('active');

    // show/hide content
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.classList.toggle('hidden', el.dataset.lang !== lang);
    });

    // placeholders
    const phAttr = `data-lang-${lang}-placeholder`;
    document.querySelectorAll(`[${phAttr}]`).forEach(el => {
      el.placeholder = el.getAttribute(phAttr);
    });

    // update current URL without reload
    try {
      const cur = new URL(location.href);
      cur.searchParams.set('lang', lang);
      history.replaceState({}, '', cur.pathname + cur.search + cur.hash);
    } catch(e) {}

    // update links for future navigation
    updateInternalLinks(lang);
  };

  // Initial lang: URL > localStorage > browser default
  const urlLangRaw = new URLSearchParams(location.search).get('lang');
  const urlLang = (urlLangRaw === 'en' || urlLangRaw === 'es') ? urlLangRaw : null;
  let savedLang = null;
  try { savedLang = localStorage.getItem('dg_lang'); } catch(e) {}
  const defaultLang = (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'es';
  const initialLang = urlLang || (savedLang === 'en' || savedLang === 'es' ? savedLang : null) || defaultLang;

  // Wire buttons
  if (langButtons.es) langButtons.es.addEventListener('click', () => setLanguage('es'));
  if (langButtons.en) langButtons.en.addEventListener('click', () => setLanguage('en'));

  // Apply now
  setLanguage(initialLang);

  // Mobile menu (optional)
  const mobileBtn = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  }

  // Reveal-on-scroll (optional)
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Trigger sequential mission animation
            const parts = entry.target.querySelectorAll('.mission-part');
            parts.forEach(part => {
              const delay = parseInt(part.dataset.delay, 10) || 0;
              setTimeout(() => part.classList.add('pop-in'), delay);
            });
            // Word-by-word reveal
            const words = entry.target.querySelectorAll('.mission-word');
            words.forEach(word => {
              const delay = parseInt(word.dataset.delay, 10) || 0;
              setTimeout(() => word.classList.add('pop-in'), delay);
            });
            obs.unobserve(entry.target);
          }
        });
      }, {threshold: 0.1}).observe(el);
    } else { el.classList.add('is-visible'); }
  });
});

// --- Mission Section Canvas Animation ---
(function initMissionAnimation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var section = document.getElementById('about');
  var canvas = document.getElementById('mission-canvas');
  if (!section || !canvas) return;

  var ctx = canvas.getContext('2d');
  var TAU = Math.PI * 2;

  // Brand palette as RGB strings
  var C_DARK = '57,89,53';
  var C_BASE = '70,99,58';
  var C_MED = '87,111,80';
  var C_ACCENT = '93,113,63';
  var C_AMBER = '180,130,40';
  var C_GOLD = '160,120,50';
  var C_TEAL = '60,120,100';
  var C_SAGE = '120,140,90';

  // Abstract organic element colors
  var PARTICLE_COLORS = [C_BASE, C_MED, C_ACCENT, C_SAGE, C_TEAL, C_DARK];

  var W, H, dpr, nodes, creatures, t;
  var animationId = null;
  var initialized = false;

  function mobile() { return window.innerWidth < 768; }

  // Bias random values toward edges
  function edgeBias() {
    var r = Math.random();
    return r < 0.5 ? r * 0.4 : 0.6 + r * 0.4;
  }

  // Get wave Y position at a given x for a wave band
  function waveY(baseYFrac, ampFrac, freq, speedOff, x) {
    var phase = t * 0.002;
    var baseY = H * baseYFrac;
    var amp = H * ampFrac;
    return baseY + amp * Math.sin((x / W) * TAU * freq + phase * (1 + speedOff * 0.3))
                 + amp * 0.4 * Math.cos((x / W) * TAU * freq * 0.7 + phase * 1.5 + speedOff);
  }

  // Create an abstract organic particle that drifts along wave bands
  // Types: 'spore' (ring/circle), 'seed' (elongated capsule), 'pollen' (small dot cluster)
  function makeCreature(type, band) {
    var goRight = (band === 'top');
    var startX = goRight ? -30 : W + 30;
    var baseSpeed = W / (960 + Math.random() * 720);

    var color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

    var c = {
      type: type,
      band: band,
      x: startX,
      y: 0,
      yOffset: (Math.random() - 0.5) * H * 0.06,
      direction: goRight ? 1 : -1,
      speed: baseSpeed,
      phase: Math.random() * TAU,
      size: 0,
      maxOpacity: 0,
      color: color,
      rotation: Math.random() * TAU,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      alive: true
    };

    if (type === 'spore') {
      // Dandelion spore — thin ring with radiating lines
      c.size = 4 + Math.random() * 5;
      c.maxOpacity = 0.18 + Math.random() * 0.1;
      c.spokes = 5 + Math.floor(Math.random() * 4);
    } else if (type === 'seed') {
      // Elongated seed capsule
      c.size = 3 + Math.random() * 4;
      c.maxOpacity = 0.2 + Math.random() * 0.1;
      c.aspect = 2 + Math.random() * 1.5;
    } else { // pollen
      // Small cluster of dots
      c.size = 2 + Math.random() * 2;
      c.maxOpacity = 0.22 + Math.random() * 0.1;
      c.dots = [];
      var numDots = 3 + Math.floor(Math.random() * 4);
      for (var d = 0; d < numDots; d++) {
        c.dots.push({
          ox: (Math.random() - 0.5) * c.size * 2.5,
          oy: (Math.random() - 0.5) * c.size * 2.5,
          r: 0.5 + Math.random() * 1.2
        });
      }
    }

    return c;
  }

  // Smooth fade in/out at screen edges — creatures materialize and dissolve
  function edgeFade(x) {
    var fadeZone = W * 0.2;
    if (x < fadeZone) return Math.max(0, x / fadeZone);
    if (x > W - fadeZone) return Math.max(0, (W - x) / fadeZone);
    return 1;
  }

  // Get the center Y of a wave band
  function bandCenterY(band, x) {
    if (band === 'top') {
      // Average of top wave cluster (baseY fracs: 0.10, 0.14, 0.18)
      return (waveY(0.10, 0.08, 1.2, 0, x) + waveY(0.14, 0.07, 1.8, 1.2, x) + waveY(0.18, 0.06, 2.4, 2.5, x)) / 3;
    } else {
      // Average of bottom wave cluster (baseY fracs: 0.82, 0.86, 0.90)
      return (waveY(0.82, 0.08, 1.4, 0.8, x) + waveY(0.86, 0.07, 2.0, 2.0, x) + waveY(0.90, 0.06, 1.6, 3.2, x)) / 3;
    }
  }

  function init() {
    var rect = section.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    W = rect.width;
    H = rect.height || window.innerHeight * 0.85;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    t = 0;

    var m = mobile();
    var edgeNodeCount = m ? 10 : 18;
    var bottomNodeCount = m ? 6 : 10;
    var nodeColors = [C_BASE, C_MED, C_ACCENT, C_SAGE, C_TEAL];

    nodes = [];
    for (var i = 0; i < edgeNodeCount; i++) {
      var nx, ny;
      do {
        nx = edgeBias() * W;
        ny = edgeBias() * H;
      } while (nx > W * 0.6 && ny > H * 0.55);
      nodes.push({
        x: nx, y: ny,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: 3.5 + Math.random() * 3.5,
        opacity: 0.5 + Math.random() * 0.25,
        pulse: Math.random() * TAU,
        color: nodeColors[i % nodeColors.length]
      });
    }
    for (var ib = 0; ib < bottomNodeCount; ib++) {
      nodes.push({
        x: Math.random() * W * 0.65,
        y: H * 0.6 + Math.random() * H * 0.38,
        vx: (Math.random() - 0.5) * 0.09,
        vy: (Math.random() - 0.5) * 0.06,
        r: 3 + Math.random() * 3,
        opacity: 0.4 + Math.random() * 0.25,
        pulse: Math.random() * TAU,
        color: nodeColors[ib % nodeColors.length]
      });
    }

    // Spawn initial particles already spread across the screen
    creatures = [];
    var types = ['spore', 'seed', 'pollen', 'pollen'];
    var initialCount = m ? 4 : 10;
    for (var ci = 0; ci < initialCount; ci++) {
      var ctype = types[ci % types.length];
      var cband = ci % 2 === 0 ? 'top' : 'bottom';
      var cr = makeCreature(ctype, cband);
      // Spread them across the screen so it's not empty at start
      var progress = (ci + 0.5) / initialCount;
      if (cr.direction > 0) {
        cr.x = progress * W * 0.8; // spread left-to-right
      } else {
        cr.x = W - progress * W * 0.8; // spread right-to-left
      }
      creatures.push(cr);
    }

    initialized = true;
  }

  // --- Drawing functions ---

  function drawWaves() {
    var phase = t * 0.002;
    // Stronger waves: bigger amplitude, thicker lines
    var waves = [
      // Upper cluster — 3 intertwining waves
      [0.10, 0.08, 1.2, 0, C_BASE, 0.22, 2.0],
      [0.14, 0.07, 1.8, 1.2, C_TEAL, 0.16, 1.6],
      [0.18, 0.06, 2.4, 2.5, C_SAGE, 0.18, 1.3],
      // Lower cluster — 3 intertwining waves
      [0.82, 0.08, 1.4, 0.8, C_BASE, 0.22, 2.0],
      [0.86, 0.07, 2.0, 2.0, C_ACCENT, 0.16, 1.6],
      [0.90, 0.06, 1.6, 3.2, C_TEAL, 0.18, 1.3]
    ];
    for (var w = 0; w < waves.length; w++) {
      var wv = waves[w];
      var baseY = H * wv[0];
      var amp = H * wv[1];
      var freq = wv[2];
      var sp = wv[3];
      ctx.beginPath();
      for (var x = 0; x <= W; x += 3) {
        var y = baseY + amp * Math.sin((x / W) * TAU * freq + phase * (1 + sp * 0.3))
                      + amp * 0.4 * Math.cos((x / W) * TAU * freq * 0.7 + phase * 1.5 + sp);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(' + wv[4] + ',' + wv[5] + ')';
      ctx.lineWidth = wv[6];
      ctx.stroke();
    }
  }

  function drawNetwork() {
    var maxDist = Math.min(W, H) * 0.38;
    var edgeColors = [C_MED, C_SAGE, C_TEAL, C_ACCENT];

    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[j].x - nodes[i].x;
        var dy = nodes[j].y - nodes[i].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          var eo = 0.45 * (1 - d / maxDist);
          var ec = edgeColors[(i + j) % edgeColors.length];
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = 'rgba(' + ec + ',' + eo.toFixed(3) + ')';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }

    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      var pulse = Math.sin(t * 0.03 + n.pulse) * 1.2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, Math.max(0.5, n.r + pulse), 0, TAU);
      ctx.fillStyle = 'rgba(' + n.color + ',' + n.opacity.toFixed(3) + ')';
      ctx.fill();
    }
  }

  function updateNodes() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.x = Math.max(0, Math.min(W, n.x));
      n.y = Math.max(0, Math.min(H, n.y));
    }
  }

  function drawSpore(c, opacity) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rotation);
    var s = c.size;
    // Thin ring
    ctx.strokeStyle = 'rgba(' + c.color + ',' + opacity.toFixed(3) + ')';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, TAU);
    ctx.stroke();
    // Radiating spokes
    ctx.lineWidth = 0.4;
    ctx.strokeStyle = 'rgba(' + c.color + ',' + (opacity * 0.7).toFixed(3) + ')';
    for (var i = 0; i < c.spokes; i++) {
      var a = (i / c.spokes) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * s * 0.3, Math.sin(a) * s * 0.3);
      ctx.lineTo(Math.cos(a) * s * 1.6, Math.sin(a) * s * 1.6);
      ctx.stroke();
      // Tiny dot at tip
      ctx.beginPath();
      ctx.arc(Math.cos(a) * s * 1.6, Math.sin(a) * s * 1.6, 0.6, 0, TAU);
      ctx.fillStyle = 'rgba(' + c.color + ',' + (opacity * 0.5).toFixed(3) + ')';
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSeed(c, opacity) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rotation);
    var s = c.size * 1.2;
    var len = s * c.aspect;
    // Leaf shape via bezier curves — pointed tip, rounded base
    ctx.fillStyle = 'rgba(' + c.color + ',' + (opacity * 0.45).toFixed(3) + ')';
    ctx.beginPath();
    ctx.moveTo(0, -len);  // tip
    ctx.bezierCurveTo(s * 0.8, -len * 0.5, s * 0.9, len * 0.3, 0, len);  // right edge
    ctx.bezierCurveTo(-s * 0.9, len * 0.3, -s * 0.8, -len * 0.5, 0, -len);  // left edge
    ctx.fill();
    // Leaf outline
    ctx.strokeStyle = 'rgba(' + c.color + ',' + (opacity * 0.7).toFixed(3) + ')';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Center vein
    ctx.beginPath();
    ctx.moveTo(0, -len * 0.9);
    ctx.lineTo(0, len * 0.8);
    ctx.strokeStyle = 'rgba(' + c.color + ',' + (opacity * 0.5).toFixed(3) + ')';
    ctx.lineWidth = 0.4;
    ctx.stroke();
    // Side veins
    ctx.lineWidth = 0.3;
    ctx.strokeStyle = 'rgba(' + c.color + ',' + (opacity * 0.3).toFixed(3) + ')';
    for (var v = 0; v < 3; v++) {
      var vy = -len * 0.5 + (v * len * 0.45);
      var vx = s * 0.5 * (1 - Math.abs(vy) / len);
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.quadraticCurveTo(vx * 0.6, vy - len * 0.08, vx, vy - len * 0.05);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.quadraticCurveTo(-vx * 0.6, vy - len * 0.08, -vx, vy - len * 0.05);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPollen(c, opacity) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rotation);
    ctx.fillStyle = 'rgba(' + c.color + ',' + opacity.toFixed(3) + ')';
    for (var i = 0; i < c.dots.length; i++) {
      var d = c.dots[i];
      ctx.beginPath();
      ctx.arc(d.ox, d.oy, d.r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function updateCreature(c) {
    c.x += c.direction * c.speed;

    var clampX = Math.max(0, Math.min(W, c.x));
    var waveCenter = bandCenterY(c.band, clampX);
    var bob = Math.sin(t * 0.015 + c.phase) * H * 0.005;
    c.y = waveCenter + c.yOffset + bob;

    // Slow rotation
    c.rotation += c.rotSpeed;

    if (c.direction > 0 && c.x > W + 40) c.alive = false;
    if (c.direction < 0 && c.x < -40) c.alive = false;
  }

  function drawCreature(c) {
    var fade = edgeFade(c.x);
    var opacity = c.maxOpacity * fade;
    if (opacity < 0.01) return;

    if (c.type === 'spore') drawSpore(c, opacity);
    else if (c.type === 'seed') drawSeed(c, opacity);
    else drawPollen(c, opacity);
  }

  // Spawn new creatures periodically
  var spawnTimer = 0;
  function maybeSpawn() {
    spawnTimer++;
    var m = mobile();
    var interval = m ? 90 : 60; // ~1-1.5 seconds between spawns
    if (spawnTimer < interval) return;
    spawnTimer = 0;

    var maxCreatures = m ? 8 : 16;
    if (creatures.length >= maxCreatures) return;

    var types = ['spore', 'seed', 'pollen', 'pollen', 'pollen'];
    var type = types[Math.floor(Math.random() * types.length)];
    var band = Math.random() < 0.5 ? 'top' : 'bottom';
    creatures.push(makeCreature(type, band));
  }

  function drawVignette() {
    var cx = W / 2, cy = H / 2;
    var innerR = Math.min(W, H) * 0.15;
    var outerR = Math.max(W, H) * 0.7;
    var grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
    grad.addColorStop(0, 'rgba(240,243,239,0.55)');
    grad.addColorStop(0.35, 'rgba(240,243,239,0.3)');
    grad.addColorStop(0.7, 'rgba(240,243,239,0.05)');
    grad.addColorStop(1, 'rgba(240,243,239,0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // --- Main loop ---
  function tick() {
    ctx.clearRect(0, 0, W, H);
    t++;

    drawWaves();
    drawNetwork();
    updateNodes();

    // Update and draw creatures
    for (var i = creatures.length - 1; i >= 0; i--) {
      updateCreature(creatures[i]);
      if (!creatures[i].alive) {
        creatures.splice(i, 1);
      } else {
        drawCreature(creatures[i]);
      }
    }
    maybeSpawn();

    drawVignette();
    animationId = requestAnimationFrame(tick);
  }

  // --- Intersection Observer: pause when off-screen ---
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        if (!initialized) init();
        if (animationId === null) animationId = requestAnimationFrame(tick);
      } else {
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      }
    });
  }, { threshold: 0.05 });

  observer.observe(section);

  // --- Resize handling ---
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      init();
      if (section.getBoundingClientRect().top < window.innerHeight) {
        animationId = requestAnimationFrame(tick);
      }
    }, 200);
  });
})();
