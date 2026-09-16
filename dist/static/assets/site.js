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

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const revealGroups = document.querySelectorAll('.program-grid, .detail-grid, .format-grid, .principle-grid, .stat-grid, .community-actions, .magazine-details, .footer-grid');
    const revealItems = document.querySelectorAll('.section-heading, .section > .shell:not(.program-grid), .program-card, .detail-card, .format-card, .principle-card, .stat-grid > div, .community-link, .winner-card, .action-panel, .footer-grid > div');

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
