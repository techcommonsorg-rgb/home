(() => {
  const button = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');
  if (button && menu) {
    const closeMenu = () => {
      button.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    };
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 920) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const phrase = document.querySelector('[data-hero-phrase]');
  if (phrase && !phrase.dataset.animationReady) {
    phrase.dataset.animationReady = 'true';
    const phrases = ['real projects.', 'real experience.', 'creative code.', 'Python skills.', 'fun.'];
    const typingSpeedMs = 170;
    const deletingSpeedMs = 70;
    const holdAfterTypingMs = 900;
    const holdAfterDeletingMs = 250;
    let phraseIndex = 0;
    let charIndex = phrases[0].length;
    let deleting = true;
    let timer = 0;

    const stop = () => {
      window.clearTimeout(timer);
      timer = 0;
    };
    const tick = () => {
      const current = phrases[phraseIndex];
      if (deleting) {
        charIndex -= 1;
        phrase.textContent = current.slice(0, Math.max(0, charIndex));
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          timer = window.setTimeout(tick, holdAfterDeletingMs);
          return;
        }
        timer = window.setTimeout(tick, deletingSpeedMs);
        return;
      }

      const next = phrases[phraseIndex];
      charIndex += 1;
      phrase.textContent = next.slice(0, charIndex);
      if (charIndex >= next.length) {
        deleting = true;
        timer = window.setTimeout(tick, holdAfterTypingMs);
        return;
      }
      timer = window.setTimeout(tick, typingSpeedMs);
    };
    const syncMotionPreference = () => {
      stop();
      if (reducedMotion.matches) {
        phraseIndex = 0;
        charIndex = phrases[0].length;
        deleting = true;
        phrase.textContent = phrases[0];
        return;
      }
      timer = window.setTimeout(tick, holdAfterTypingMs);
    };

    reducedMotion.addEventListener('change', syncMotionPreference);
    window.addEventListener('pagehide', () => {
      stop();
      reducedMotion.removeEventListener('change', syncMotionPreference);
    }, { once: true });
    syncMotionPreference();
  }

  const hero = document.querySelector('.hero');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  if (hero && !coarsePointer.matches && !reducedMotion.matches && !hero.dataset.pointerGlowReady) {
    hero.dataset.pointerGlowReady = 'true';
    let animationFrame = 0;
    let pointerX = 50;
    let pointerY = 15;

    const paintGlow = () => {
      hero.style.setProperty('--hero-glow-x', `${pointerX}%`);
      hero.style.setProperty('--hero-glow-y', `${pointerY}%`);
      animationFrame = 0;
    };
    const scheduleGlow = (event) => {
      const rect = hero.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width) * 100;
      pointerY = ((event.clientY - rect.top) / rect.height) * 100;
      if (!animationFrame) animationFrame = window.requestAnimationFrame(paintGlow);
    };
    const showGlow = () => hero.style.setProperty('--hero-glow-o', '1');
    const hideGlow = () => hero.style.setProperty('--hero-glow-o', '0');
    const cleanUpGlow = () => {
      hero.removeEventListener('pointermove', scheduleGlow);
      hero.removeEventListener('pointerenter', showGlow);
      hero.removeEventListener('pointerleave', hideGlow);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };

    hero.addEventListener('pointermove', scheduleGlow, { passive: true });
    hero.addEventListener('pointerenter', showGlow, { passive: true });
    hero.addEventListener('pointerleave', hideGlow, { passive: true });
    window.addEventListener('pagehide', cleanUpGlow, { once: true });
  }

  const winningProject = document.querySelector('#winners .section-heading, .winner-card');
  if (winningProject && !reducedMotion.matches && 'IntersectionObserver' in window) {
    let frame = 0;
    let canvas;
    const clearConfetti = () => {
      window.cancelAnimationFrame(frame);
      canvas?.remove();
      canvas = undefined;
    };
    const celebrate = () => {
      if (reducedMotion.matches) return;
      clearConfetti();
      canvas = document.createElement('canvas');
      canvas.className = 'winner-confetti';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.append(canvas);
      const context = canvas.getContext('2d');
      if (!context) { clearConfetti(); return; }
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.scale(ratio, ratio);
      const colours = ['#88d8ff', '#ffd166', '#d62278', '#2456e6', '#f08abc'];
      const particles = Array.from({ length: 160 }, (_, index) => ({
        x: Math.random() * width,
        y: -Math.random() * height * .8,
        vx: (Math.random() - .5) * 100,
        vy: 60 + Math.random() * 100,
        spin: (Math.random() - .5) * 12,
        angle: Math.random() * Math.PI,
        size: 8 + Math.random() * 7,
        colour: colours[index % colours.length]
      }));
      let start;
      let previous;
      const paint = (now) => {
        if (reducedMotion.matches) { clearConfetti(); return; }
        start ??= now;
        previous ??= now;
        const elapsed = (now - start) / 1000;
        const step = Math.min((now - previous) / 1000, .04);
        previous = now;
        context.clearRect(0, 0, width, height);
        context.globalAlpha = Math.min(1, Math.max(0, (5 - elapsed) / 1.2));
        particles.forEach((particle) => {
          particle.x += particle.vx * step;
          particle.y += particle.vy * step;
          particle.vy += 100 * step;
          particle.angle += particle.spin * step;
          context.save();
          context.translate(particle.x, particle.y);
          context.rotate(particle.angle);
          context.fillStyle = particle.colour;
          context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
          context.restore();
        });
        if (elapsed < 5) frame = window.requestAnimationFrame(paint);
        else clearConfetti();
      };
      frame = window.requestAnimationFrame(paint);
    };
    let wasVisible = false;
    const winnerObserver = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !wasVisible) celebrate();
      wasVisible = visible;
    }, { threshold: .1 });
    winnerObserver.observe(winningProject);
    window.addEventListener('pagehide', () => {
      winnerObserver.disconnect();
      clearConfetti();
    }, { once: true });
  }

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const revealGroups = document.querySelectorAll('.program-grid, .detail-grid, .format-grid, .principle-grid, .stat-grid, .community-actions, .magazine-details, .footer-grid');
    const revealItems = document.querySelectorAll('.section-heading, .section > .shell:not(.program-grid):not(.edition-archive), .program-card, .detail-card, .format-card, .principle-card, .stat-grid > div, .community-link, .winner-card, .action-panel, .footer-grid > div');

    revealGroups.forEach((group) => {
      Array.from(group.children).forEach((item, index) => {
        item.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 90}ms`);
      });
    });
    revealItems.forEach((item) => item.classList.add('reveal-item'));

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
    window.requestAnimationFrame(() => document.documentElement.classList.add('motion-ready'));
  }

})();
