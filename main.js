// main.js
// ============================================================
// App bootstrap with clear sections, safe listeners, and helpers
// ============================================================

(() => {
  'use strict';

  // -----------------------------
  // CONFIG & CONSTANTS
  // -----------------------------
  const SUPPORTED_LANGS = ['ru', 'en', 'de'];
  const STORAGE_KEYS = { preferredLanguage: 'preferredLanguage' };
  const SELECTORS = {
    langBtn: '.lang-btn',
    i18n: '[data-i18n]',
    hero: '.hero',
    heroContent: '.hero-content',
    streamingBtn: '.streaming-btn',
    releaseCard: '.release-card',
    socialLink: '.social-link',
    socialIcon: '.social-icon',
    playBtn: '.play-btn',
    tagline: '.tagline',
    logoImage: '.logo-image',
    anchor: 'a[href^="#"]',
    aos: '[data-aos]',
    iframeLazy: 'iframe[data-src]',
  };
  const COLORS = {
    red_darker_transp: '#6868684d'
  }
  
  // TODO USE THIS ON PROD
  // const COLORS = {
  //   red_darker_transp: '#7a12064d'
  // };

  // Parallax registry
  const parallaxItems = []; // { el, speed, baseTransform }
  function registerParallax(el, speed = 0.5) {
    if (!el) return;
    parallaxItems.push({
      el,
      speed,
      baseTransform: el.style.transform || ''
    });
  }

  // -----------------------------
  // UTILITIES
  // -----------------------------
  const raf = window.requestAnimationFrame.bind(window);
  const on = (el, evt, fn, opts) => el.addEventListener(evt, fn, opts);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // Passive listener options for scroll/touch for smoother performance
  const passive = { passive: true };

  // -----------------------------
  // INTERNATIONALIZATION
  // -----------------------------
  let currentLanguage = 'ru';

  function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage || 'ru';
    const code = browserLang.split('-')[0].toLowerCase();
    return SUPPORTED_LANGS.includes(code) ? code : 'ru';
  }

  function getInitialLanguage() {
    return localStorage.getItem(STORAGE_KEYS.preferredLanguage) || detectBrowserLanguage();
  }

  function translatePage(lang) {
    currentLanguage = lang;

    // Guard: translations must be defined globally
    if (typeof window.translations !== 'object') {
      console.warn('[i18n] Missing global `translations` object');
      return;
    }

    qsa(SELECTORS.i18n).forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = window.translations?.[lang]?.[key];
      if (typeof value === 'string') el.textContent = value;
    });

    localStorage.setItem(STORAGE_KEYS.preferredLanguage, lang);

    // Toggle active state on language buttons
    qsa(SELECTORS.langBtn).forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    document.documentElement.setAttribute('lang', lang);

    // Broadcast in case other components need to react
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  }

  // -----------------------------
  // AOS (Animate on Scroll) via IntersectionObserver
  // -----------------------------
  const animateOnScrollObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          animateOnScrollObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
  );

  function initAOS() {
    qsa(SELECTORS.aos).forEach((el) => {
      const delay = el.getAttribute('data-aos-delay');
      if (delay) el.style.transitionDelay = `${parseInt(delay, 10)}ms`;
      animateOnScrollObserver.observe(el);
    });
  }

  // -----------------------------
  // PARALLAX (hero content)
  // -----------------------------
  let lastScrollY = window.pageYOffset || 0;
  let ticking = false;

  function tick() {
    ticking = false;

    // Apply parallax to all registered layers
    for (const item of parallaxItems) {
      const ty = lastScrollY * item.speed; // tweak speeds per layer
      item.el.style.transform = `${item.baseTransform} translateY(${ty}px)`;
    }

    updateProgressBar();   // you already have this
    updateLogoPulse();     // you already have this
  }

  let scrollRafId = null;

  function onScroll() {
    lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    // Throttle scroll handler using requestAnimationFrame
    if (!scrollRafId) {
      scrollRafId = requestAnimationFrame(() => {
        tick(); // Process parallax, progress bar, etc.
        scrollRafId = null; // Release frame lock
      });
    }
  }



  // -----------------------------
  // SMOOTH IN-PAGE ANCHOR SCROLL
  // -----------------------------
  function initSmoothAnchors() {
    qsa(SELECTORS.anchor).forEach((a) => {
      on(a, 'click', (e) => {
        const href = a.getAttribute('href');
        if (!href) return;
        const target = qs(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // -----------------------------
  // RIPPLE EFFECT (buttons)
  // -----------------------------
  function attachRipple(el) {
    on(el, 'click', (e) => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const span = document.createElement('span');
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      span.className = 'ripple';
      span.style.width = `${size}px`;
      span.style.height = `${size}px`;
      span.style.left = `${x}px`;
      span.style.top = `${y}px`;
      span.style.position = 'absolute';
      span.style.borderRadius = '50%';
      span.style.pointerEvents = 'none';
      // If your CSS defines .ripple animation, remove next line
      span.style.animation = 'ripple 600ms ease-out';
      el.style.position ||= 'relative';

      el.appendChild(span);
      setTimeout(() => span.remove(), 600);
    });
  }

  function initRipples() {
    qsa(SELECTORS.streamingBtn).forEach(attachRipple);
  }

  // -----------------------------
  // CURSOR TRAIL
  // -----------------------------
  const cursor = { x: 0, y: 0, trails: [] };

  function initCursorTrail() {
    for (let i = 0; i < 5; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      Object.assign(trail.style, {
        position: 'fixed',
        width: '8px',
        height: '8px',
        background: `rgba(171, 23, 7, ${0.5 - i * 0.1})`,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9998,
        transition: 'transform 0.1s ease-out',
        mixBlendMode: 'screen',
      });
      document.body.appendChild(trail);
      cursor.trails.push(trail);
    }

    on(document, 'mousemove', (e) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    });

    (function animate() {
      let x = cursor.x;
      let y = cursor.y;
      cursor.trails.forEach((trail, index) => {
        trail.style.transform = `translate(${x - 4}px, ${y - 4}px) scale(${1 - index * 0.15})`;
        const rect = trail.getBoundingClientRect();
        x = rect.left + 4;
        y = rect.top + 4;
      });
      raf(animate);
    })();
  }

  // -----------------------------
  // PAGE FADE-IN ON LOAD
  // -----------------------------
  function fadeInOnLoad() {
    document.body.style.opacity = '0';
    setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s ease';
      document.body.style.opacity = '1';
    }, 100);
  }

  // -----------------------------
  // RANDOM CROWS IN HERO
  // -----------------------------
  function scatterParticles() {
    const hero = qs(SELECTORS.hero);
    if (!hero) return;

    const particleFiles = ['crow1.png', 'crow2.png', 'crow3.png']; //todo use this on prod
    // const particleFiles = ['dummy.png'];
    const minScale = 0.05;
    const maxScale = 0.2;
    const layerCount = 4; // you can increase for more depth
    const count = 15 / layerCount; // total particles divided by layers

    // Create multiple layers for parallax depth
    for (let layer = 1; layer <= layerCount; layer++) {
      addParticleLayer(hero, layer, count, minScale, maxScale, particleFiles);
    }
  }

  function addParticleLayer(hero, layerNumber, count, minScale, maxScale, particleFiles) {
    // Create a single positioned layer for particles
    let particleLayer = hero.querySelector(`.hero-particles-layer-${layerNumber}`);
    if (!particleLayer) {
      particleLayer = document.createElement('div');
      particleLayer.className = `hero-particles-layer-${layerNumber}`;
      Object.assign(particleLayer.style, {
        position: 'absolute',
        inset: '0',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden', // Prevent particles from escaping the Hero section
      });
      hero.style.position ||= 'relative';
      hero.appendChild(particleLayer);
    }

    
    for (let i = 0; i < count; i++) {
      const img = createRandomParticle(minScale, maxScale, particleFiles);
      particleLayer.appendChild(img);
    }

    // Register the whole layer for parallax (match hero title/avatar speed)
    registerParallax(particleLayer, 0.2 * layerNumber); // adjust to taste
  }

  function createRandomParticle(minScale, maxScale, particleFiles) {
    const img = document.createElement('img');
    const particle = particleFiles[Math.floor(Math.random() * particleFiles.length)];
    const scale = Math.random() * (maxScale - minScale) + minScale;
    // Limit rotation so the "bottom" is still roughly pointing downwards
    // Range: -90deg (left) to +90deg (right)
    const rotation = Math.random() * 180 - 90;

    img.src = `public/particles/${particle}`;
    Object.assign(img.style, {
      position: 'absolute',
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
      transformOrigin: 'center',
      userSelect: 'none'
    });
    return img;
  }


  // -----------------------------
  // HOVER INTENSITY (visual-only sound hint)
  // -----------------------------
  function initStreamingHover() {
    qsa(SELECTORS.streamingBtn).forEach((btn) => {
      on(btn, 'mouseenter', () => btn.style.setProperty('--hover-intensity', '1'));
      on(btn, 'mouseleave', () => btn.style.setProperty('--hover-intensity', '0'));
    });
  }

  // -----------------------------
  // RELEASE CARD: PLAY BUTTON PULSE
  // -----------------------------
  function initPlayButtons() {
    qsa(SELECTORS.playBtn).forEach((btn) => {
      on(btn, 'click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => (btn.style.transform = 'scale(1.1)'), 100);
        setTimeout(() => (btn.style.transform = 'scale(1)'), 200);
      });
    });
  }

  // -----------------------------
  // SCROLL PROGRESS BAR
  // -----------------------------
  let progressBar;
  function initProgressBar() {
    progressBar = document.createElement('div');
    Object.assign(progressBar.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '3px',
      background: 'linear-gradient(90deg, var(--red-accent), var(--red-dark))',
      width: '0%',
      zIndex: 10000,
      transition: 'width 0.1s ease',
      boxShadow: '0 0 10px rgba(171, 23, 7, 0.5)',
    });
    document.body.appendChild(progressBar);
  }

  function updateProgressBar() {
    if (!progressBar) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (lastScrollY / max) * 100 : 0;
    progressBar.style.width = `${pct}%`;
  }

  // -----------------------------
  // SOCIAL LINK HOVER GLOW
  // -----------------------------
  function initSocialHover() {
    qsa(SELECTORS.socialLink).forEach((link) => {
      const icon = qs(SELECTORS.socialIcon, link);
      if (!icon) return;
      on(link, 'mouseenter', () => {
        icon.style.filter = 'brightness(1.2) drop-shadow(0 0 20px rgba(171, 23, 7, 0.6))';
      });
      on(link, 'mouseleave', () => {
        icon.style.filter = 'none';
      });
    });
  }

  // -----------------------------
  // RELEASE CARDS: ENTER ANIMATION
  // -----------------------------
  function initReleaseCards() {
    const cards = qsa(SELECTORS.releaseCard);
    if (!cards.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // stagger by DOM order (index is not reliable here, compute from dataset)
            const idx = Number(entry.target.dataset.index || 0);
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0) scale(1)';
            }, idx * 150);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    cards.forEach((card, i) => {
      card.dataset.index = String(i);
      Object.assign(card.style, {
        opacity: '0',
        transform: 'translateY(50px) scale(0.95)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      });
      obs.observe(card);
    });
  }

  // -----------------------------
  // CARD CURSOR GLOW
  // -----------------------------
  function initCardGlow() {
    const targets = qsa([SELECTORS.streamingBtn, SELECTORS.releaseCard, SELECTORS.socialLink].join(', '));
    targets.forEach((el) => {
      let glow = null;

      on(el, 'pointerenter', () => {
        if (!glow) {
          glow = document.createElement('div');
          glow.className = 'card-glow';
          Object.assign(glow.style, {
            position: 'absolute',
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${COLORS.red_darker_transp} 0%, transparent 60%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.3s ease',
            left: '0px',
            top: '0px',
            opacity: '0',
          });
          el.appendChild(glow);
          el.style.position ||= 'relative';
        }
      });

      on(el, 'pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (!glow) return;
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
        glow.style.opacity = '1';
      });

      on(el, 'pointerleave', () => {
        if (glow) glow.style.opacity = '0';
      });
    });
  }

  // -----------------------------
  // TAGLINE TYPEWRITER
  // -----------------------------
  function initTypewriter() {
    const el = qs(SELECTORS.tagline);
    if (!el) return;
    const text = el.textContent;
    el.textContent = '';
    el.style.opacity = '1';

    let i = 0;
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i++);
        setTimeout(type, 100);
      }
    }
    setTimeout(type, 1000);
  }

  // -----------------------------
  // LOGO PULSE ON SCROLL (subtle)
  // -----------------------------
  function updateLogoPulse() {
    const logo = qs(SELECTORS.logoImage);
    if (!logo) return;
    if (lastScrollY > 0 && lastScrollY < 500) {
      logo.style.transform = 'scale(1.05) rotate(2deg)';
    } else {
      logo.style.transform = 'scale(1) rotate(0deg)';
    }
  }

  // -----------------------------
  // KONAMI CODE EASTER EGG
  // -----------------------------
  function initKonami() {
    const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    const buffer = [];

    on(document, 'keydown', (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key; // normalize letters to lower
      buffer.push(key);
      if (buffer.length > sequence.length) buffer.shift();

      if (sequence.every((k, i) => buffer[i] === k)) {
        activateEasterEgg();
        buffer.length = 0;
      }
    });

    function activateEasterEgg() {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
        body.__rainbow { animation: rainbow 2s linear infinite; }
      `;
      document.head.appendChild(style);

      document.body.classList.add('__rainbow');
      setTimeout(() => {
        document.body.classList.remove('__rainbow');
        style.remove();
      }, 5000);
    }
  }

  // -----------------------------
  // PRELOAD IMAGES
  // -----------------------------
  function preloadImages(srcs) {
    srcs.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  // -----------------------------
  // LAZY-LOAD IFRAMES
  // -----------------------------
  function initLazyIframes() {
    const iframes = qsa(SELECTORS.iframeLazy);
    if (!iframes.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            if (iframe.dataset.src) {
              iframe.src = iframe.dataset.src;
              iframe.removeAttribute('data-src');
            }
            obs.unobserve(iframe);
          }
        });
      },
      { rootMargin: '200px' }
    );

    iframes.forEach((f) => obs.observe(f));
  }

  // -----------------------------
  // TOUCH SUPPORT (mobile)
  // -----------------------------
  function initTouchScrollClass() {
    let touchStartY = 0;
    on(document, 'touchstart', (e) => (touchStartY = e.touches[0].clientY), passive);
    on(
      document,
      'touchmove',
      (e) => {
        const diff = touchStartY - e.touches[0].clientY;
        if (Math.abs(diff) > 5) document.body.classList.add('scrolling');
      },
      passive
    );
    on(document, 'touchend', () => setTimeout(() => document.body.classList.remove('scrolling'), 100), passive);
  }

  // -----------------------------
  // ACCESSIBILITY: REDUCED MOTION
  // -----------------------------
  function initReducedMotion() {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      document.documentElement.classList.add('reduced-motion');
      // Prefer handling via CSS using `.reduced-motion * { animation: none !important; transition: none !important; }`
      // Avoid forcing inline styles on every element for performance.
    }
  }

  // -----------------------------
  // LANGUAGE SWITCHER UI
  // -----------------------------
  function initLangSwitcher() {
    qsa(SELECTORS.langBtn).forEach((btn) => {
      on(btn, 'click', function () {
        const lang = this.getAttribute('data-lang');
        if (!lang || lang === currentLanguage) return;
        translatePage(lang);

        // Click micro-animation
        this.style.transform = 'scale(0.9)';
        setTimeout(() => (this.style.transform = 'scale(1)'), 100);
      });
    });
  }

  // -----------------------------
  // CONSOLE EASTER EGG
  // -----------------------------
  function consoleGreeting() {
    // Keep the emojis in console only; they don't affect UI.
    // If you don't want them, remove this block.
    // eslint-disable-next-line no-console
    console.log('%c🎵 Welcome to the Artist Page! 🎵', 'font-size: 20px; color: #ab1707; font-weight: bold;');
    // eslint-disable-next-line no-console
    console.log('%cLike what you see? Follow us on social media!', 'font-size: 14px; color: #fffefa;');
  }

  // -----------------------------
  // INIT
  // -----------------------------
  on(document, 'DOMContentLoaded', () => {
    // i18n
    translatePage(getInitialLanguage());
    initLangSwitcher();
    on(window, 'languageChanged', (e) => {
      // Hook for dynamic i18n content if needed
      // eslint-disable-next-line no-console
      console.log(`Language changed to: ${e.detail.language}`);
    });

    // visual / UX
    initAOS();
    initSmoothAnchors();
    initRipples();
    initCursorTrail();
    fadeInOnLoad();
    scatterParticles();
    initStreamingHover();
    initPlayButtons();
    initProgressBar();
    initSocialHover();
    initReleaseCards();
    initCardGlow();
    initTypewriter();
    initKonami();
    initLazyIframes();
    initTouchScrollClass();
    initReducedMotion();
    consoleGreeting();

    // Preload assets
    preloadImages(['public/blue.png', 'public/yellow.png', 'public/red.png', 'public/grey.png']);

    // Register hero pieces for parallax
    registerParallax(qs('.hero-content'), 0.5);   // header title
    // If you prefer different depths, vary speeds: title 0.45, avatar 0.5, crows 0.5

    // Scroll-driven effects (parallax, progress, logo pulse)
    on(window, 'scroll', onScroll, passive);
    // trigger initial pass
    onScroll();
  });
})();
