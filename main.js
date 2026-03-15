/* =====================================================
   ROMANTIC INVITATION — main.js
   Vanilla JS only | No external libraries
===================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------
     INTRO PARTICLE CANVAS
     Floating sparkles on the dark intro background
  --------------------------------------------------- */
  const pCanvas = document.getElementById('particle-canvas');
  const pCtx    = pCanvas.getContext('2d');
  let pW, pH, introParticles = [];

  function resizeParticleCanvas() {
    pW = pCanvas.width  = window.innerWidth;
    pH = pCanvas.height = window.innerHeight;
  }

  function createIntroParticle() {
    return {
      x:     Math.random() * pW,
      y:     Math.random() * pH,
      r:     Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.1,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:    -(Math.random() * 0.5 + 0.15),
      flicker: Math.random() * Math.PI * 2
    };
  }

  function initIntroParticles() {
    introParticles = [];
    for (let i = 0; i < 120; i++) introParticles.push(createIntroParticle());
  }

  function drawIntroParticles() {
    pCtx.clearRect(0, 0, pW, pH);
    introParticles.forEach(p => {
      p.flicker += 0.04;
      const a = p.alpha * (0.6 + 0.4 * Math.sin(p.flicker));
      pCtx.save();
      pCtx.globalAlpha = a;
      // Darker saturated tones visible on light/cream background
      pCtx.fillStyle = p.r > 2 ? '#a07020' : '#b83060';
      pCtx.shadowBlur  = 4;
      pCtx.shadowColor = p.r > 2 ? '#7a5010' : '#8a1a40';
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.restore();
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -5) { Object.assign(p, createIntroParticle(), { y: pH + 5 }); }
    });
  }

  let introRafId;
  function introLoop() {
    drawIntroParticles();
    introRafId = requestAnimationFrame(introLoop);
  }

  /* ---------------------------------------------------
     EXPLOSION BURST
     Cinematic particle burst after heart click
  --------------------------------------------------- */
  let burst = [];

  function triggerExplosion(cx, cy) {
    burst = [];
    const COUNT = 140;
    for (let i = 0; i < COUNT; i++) {
      const angle  = (Math.PI * 2 / COUNT) * i + (Math.random() - 0.5) * 0.3;
      const speed  = Math.random() * 9 + 3;
      const isHeart = i % 5 === 0;
      burst.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r:  isHeart ? 6 : (Math.random() * 3 + 1),
        alpha: 1,
        decay: Math.random() * 0.018 + 0.012,
        color: ['#ff9ecb','#e0437a','#f0d080','#ffb3d1','#ffffff'][Math.floor(Math.random() * 5)],
        heart: isHeart,
        spin: Math.random() * 0.2 - 0.1
      });
    }
  }

  function drawBurst() {
    if (!burst.length) return false;
    let alive = false;
    pCtx.save();
    burst.forEach(p => {
      if (p.alpha <= 0) return;
      alive = true;
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.18;   // gravity
      p.vx *= 0.98;
      p.alpha -= p.decay;
      pCtx.globalAlpha = Math.max(0, p.alpha);
      pCtx.fillStyle   = p.color;
      pCtx.shadowBlur  = 10;
      pCtx.shadowColor = p.color;
      if (p.heart) {
        drawHeartShape(pCtx, p.x, p.y, p.r + Math.sin(Date.now() * 0.01) * 0.5);
      } else {
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        pCtx.fill();
      }
    });
    pCtx.restore();
    return alive;
  }

  function drawHeartShape(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.6);
    ctx.bezierCurveTo( r, -r * 1.4,  r * 2,  r * 0.2, 0,  r * 1.2);
    ctx.bezierCurveTo(-r * 2,  r * 0.2, -r, -r * 1.4, 0, -r * 0.6);
    ctx.fill();
    ctx.restore();
  }

  /* ---------------------------------------------------
     OPEN TRANSITION
  --------------------------------------------------- */
  const intro          = document.getElementById('intro');
  const mainContent    = document.getElementById('main-content');
  let   opened = false;

  function openSite() {
    if (opened) return;
    opened = true;

    const seal    = document.getElementById('env-seal');
    const topFlap = document.getElementById('env-flap-top');
    const letter  = document.getElementById('env-letter');
    const envWrap = document.getElementById('envelope-wrapper');

    // 1. Seal fades out
    if (seal) seal.classList.add('hidden');

    // 2. Top flap swings open
    setTimeout(() => {
      if (topFlap) topFlap.classList.add('open');
    }, 280);

    // 3. Letter rises up out of envelope
    setTimeout(() => {
      if (letter) letter.classList.add('rising');
    }, 820);

    // 4. Particle burst from envelope center
    const rect = envWrap
      ? envWrap.getBoundingClientRect()
      : { left: window.innerWidth / 2 - 1, top: window.innerHeight / 2 - 1, width: 2, height: 2 };
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    triggerExplosion(cx, cy);

    // 5. Burst loop runs on top of normal particle loop
    let burstRaf;
    function burstLoop() {
      drawIntroParticles();
      const alive = drawBurst();
      if (alive) {
        burstRaf = requestAnimationFrame(burstLoop);
      } else {
        cancelAnimationFrame(burstRaf);
        finishTransition();
      }
    }
    cancelAnimationFrame(introRafId);
    burstRaf = requestAnimationFrame(burstLoop);

    // 6. Start fading intro after letter has risen
    setTimeout(() => {
      intro.classList.add('fade-out');
    }, 1500);
  }

  function finishTransition() {
    // 4. Show main content
    intro.addEventListener('transitionend', () => {
      intro.style.display = 'none';
    }, { once: true });
    mainContent.classList.remove('hidden');
    startBgCanvas();
    triggerFadeUps();
    triggerBirds();
  }

  /* ---------------------------------------------------
     BIRDS — iki sərçə yaxınlaşıb sarılır
  --------------------------------------------------- */
  function triggerBirds() {
    const bL = document.getElementById('bird-left');
    const bR = document.getElementById('bird-right');
    const bH = document.getElementById('birds-heart');
    if (!bL || !bR || !bH) return;

    // Kiçik gecikmə — səhifə fade-in ilə eyni başlasın
    setTimeout(() => {
      bL.classList.add('birds-enter');
      bR.classList.add('birds-enter');
      bH.classList.add('pop');
    }, 300);

    // birds-enter bitdikdən sonra snuggle tilt başlasın (1.6s + 300ms gecikmə)
    setTimeout(() => {
      bL.classList.add('snuggle');
      bR.classList.add('snuggle');
    }, 2100);
  }

  intro.addEventListener('click', openSite);

  /* ---------------------------------------------------
     BACKGROUND CANVAS (floating hearts + sparkles)
  --------------------------------------------------- */
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx    = bgCanvas.getContext('2d');
  let   bgW, bgH, bgParticles = [];

  function resizeBgCanvas() {
    bgW = bgCanvas.width  = window.innerWidth;
    bgH = bgCanvas.height = window.innerHeight;
  }

  function createBgParticle() {
    const types = ['circle', 'circle', 'circle', 'heart'];
    return {
      x:     Math.random() * bgW,
      y:     bgH + 20,
      r:     Math.random() * 3 + 1,
      alpha: Math.random() * 0.35 + 0.05,
      vx:    (Math.random() - 0.5) * 0.4,
      vy:    -(Math.random() * 0.6 + 0.2),
      flicker: Math.random() * Math.PI * 2,
      type:  types[Math.floor(Math.random() * types.length)],
      color: ['#a07020','#c96880','#b83060','#7a566a'][Math.floor(Math.random() * 4)]
    };
  }

  function initBgParticles() {
    bgParticles = [];
    for (let i = 0; i < 80; i++) {
      const p = createBgParticle();
      p.y = Math.random() * bgH; // scatter on start
      bgParticles.push(p);
    }
  }

  function drawBgParticles() {
    bgCtx.clearRect(0, 0, bgW, bgH);
    bgParticles.forEach(p => {
      p.flicker += 0.025;
      const a = p.alpha * (0.7 + 0.3 * Math.sin(p.flicker));
      bgCtx.save();
      bgCtx.globalAlpha = a;
      bgCtx.fillStyle   = p.color;
      bgCtx.shadowBlur  = 8;
      bgCtx.shadowColor = p.color;
      if (p.type === 'heart') {
        drawHeartShape(bgCtx, p.x, p.y, p.r * 1.8);
      } else {
        bgCtx.beginPath();
        bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        bgCtx.fill();
      }
      bgCtx.restore();
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -20) {
        Object.assign(p, createBgParticle());
      }
    });
  }

  function startBgCanvas() {
    resizeBgCanvas();
    initBgParticles();
    function bgLoop() {
      drawBgParticles();
      requestAnimationFrame(bgLoop);
    }
    bgLoop();
  }

  /* ---------------------------------------------------
     SCROLL / INTERSECTION FADE-UP
  --------------------------------------------------- */
  function triggerFadeUps() {
    const els = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    els.forEach((el, i) => {
      // slight stagger
      el.style.transitionDelay = (i * 0.12) + 's';
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------
     INIT
  --------------------------------------------------- */
  resizeParticleCanvas();
  initIntroParticles();
  introLoop();

  window.addEventListener('resize', () => {
    resizeParticleCanvas();
    if (!mainContent.classList.contains('hidden')) resizeBgCanvas();
  });

})();
