/* ============================================================
   PORTFOLIO — script.js
   Clean, performant, accessible JavaScript
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // Mark document as JS-loaded so CSS animations are safe to apply
  document.documentElement.classList.add('js-loaded');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Helpers ─────────────────────────────────────────────── */

  /**
   * Throttle a function to run at most once per animation frame.
   * @param {Function} fn
   * @returns {Function}
   */
  function throttleRAF(fn) {
    let rafId = null;
    return function (...args) {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        fn.apply(this, args);
        rafId = null;
      });
    };
  }

  /** localStorage can throw (privacy modes, blocked storage), so wrap it. */
  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* ignore */ }
    },
  };

  /* ── Theme Toggle ────────────────────────────────────────── */
  // The initial theme is applied by the inline script in <head> (no flash).
  const root        = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeMeta   = document.querySelector('meta[name="theme-color"]');
  const lightQuery  = window.matchMedia('(prefers-color-scheme: light)');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeMeta?.setAttribute('content', theme === 'light' ? '#f5f7ff' : '#0a0d14');
    themeToggle?.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }

  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storage.set('theme', next);
  });

  // Follow OS theme changes until the visitor picks a theme themselves
  lightQuery.addEventListener?.('change', (e) => {
    const saved = storage.get('theme');
    if (saved !== 'light' && saved !== 'dark') applyTheme(e.matches ? 'light' : 'dark');
  });

  /* ── Mobile Navigation ───────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  function setMenu(open) {
    hamburger?.classList.toggle('open', open);
    navLinks?.classList.toggle('open', open);
    hamburger?.setAttribute('aria-expanded', String(open));
    hamburger?.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  }

  const closeMenu = () => setMenu(false);

  hamburger?.addEventListener('click', () => {
    setMenu(!navLinks?.classList.contains('open'));
  });

  // Close menu on link click, outside click, or Escape
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (
      navLinks?.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger?.contains(e.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks?.classList.contains('open')) {
      closeMenu();
      hamburger?.focus();
    }
  });

  // If the window grows past the mobile breakpoint, reset the menu state
  window.matchMedia('(min-width: 769px)').addEventListener?.('change', (e) => {
    if (e.matches) closeMenu();
  });

  /* ── Navbar Scroll Behaviour ─────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');

  const onScroll = throttleRAF(() => {
    const scrollY = window.scrollY;
    navbar?.classList.toggle('scrolled', scrollY > 40);
    backToTop?.classList.toggle('visible', scrollY > 400);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Active Nav Link (scroll spy) ────────────────────────── */
  // Marks the section crossing the middle of the viewport, without
  // measuring layout on every scroll frame.
  const navLinkById = new Map(
    [...document.querySelectorAll('.nav-links a[href^="#"]')]
      .map(a => [a.getAttribute('href').slice(1), a])
  );

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinkById.forEach(link => {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        });
        const link = navLinkById.get(entry.target.id);
        if (link) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'location');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  document.querySelectorAll('main section[id]').forEach(section => spy.observe(section));

  /* ── Back to Top ─────────────────────────────────────────── */
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ── Scroll Animations (Intersection Observer) ───────────── */
  const animatedSelector = '[data-aos], .timeline-item, .skill-category, .cert-card, .edu-card';
  const animatedEls = document.querySelectorAll(animatedSelector);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // Stagger siblings for a cascade effect
        const parent   = entry.target.parentElement;
        const siblings = parent ? [...parent.querySelectorAll(animatedSelector)] : [];
        const index    = siblings.indexOf(entry.target);
        const delay    = prefersReducedMotion ? 0 : Math.max(0, index * 80);

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  animatedEls.forEach(el => observer.observe(el));

  /* ── Typed Text Effect ───────────────────────────────────── */
  // The page loads showing the full first title ("Software Engineer"), so a
  // first glance never lands on a half-typed word. Screen readers get the
  // static text in .visually-hidden; this animation is decorative only.
  const phrases = [
    'Software Engineer',
    'Backend Specialist',
    'Microservices Architect',
    'Prompt Engineer',
    'Agentic AI Developer',
  ];

  const typedEl = document.getElementById('typed-text');
  const heroEl  = document.getElementById('hero');

  if (typedEl && !prefersReducedMotion) {
    let phraseIndex = 0;
    let charIndex   = phrases[0].length;
    let isDeleting  = true;
    let timerId     = null;
    let heroVisible = true;

    typedEl.textContent = phrases[0];

    function tick() {
      const current = phrases[phraseIndex];

      charIndex += isDeleting ? -1 : 1;
      typedEl.textContent = current.slice(0, charIndex);

      const jitter = Math.floor(Math.random() * 30) - 15; // ±15ms
      let delay = isDeleting ? 55 + jitter : 95 + jitter;

      if (!isDeleting && charIndex === current.length) {
        delay = 1800;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 350;
      }

      schedule(delay);
    }

    function schedule(delay) {
      clearTimeout(timerId);
      timerId = (document.hidden || !heroVisible) ? null : setTimeout(tick, delay);
    }

    schedule(2500);

    // Pause while the tab is hidden or the hero is scrolled out of view (saves CPU)
    document.addEventListener('visibilitychange', () => schedule(400));

    if (heroEl) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting === heroVisible) return;
        heroVisible = entry.isIntersecting;
        schedule(400);
      }).observe(heroEl);
    }
  }

  /* ── Total Experience Calculator ────────────────────────── */
  (function renderExperience() {
    const now    = new Date();
    const nowY   = now.getFullYear();
    const nowM   = now.getMonth() + 1; // 1-indexed

    // Simple: from career start (Aug 2018) to present month inclusive
    const startY = 2018, startM = 8;
    const totalMonths = (nowY * 12 + nowM) - (startY * 12 + startM);

    const years  = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const label = months === 0
      ? `${years} yrs`
      : `${years} yrs ${months} ${months === 1 ? 'month' : 'months'}`;

    const el = document.getElementById('experience-total');
    if (el) el.textContent = `⏱ ${label}`;
  })();

  /* ── Role Duration Labels ────────────────────────────────── */
  (function renderDurations() {
    function calcDuration(start, end) {
      const [sy, sm] = start.split('-').map(Number);
      const now = new Date();
      const ey  = end === 'present' ? now.getFullYear() : Number(end.split('-')[0]);
      const em  = end === 'present' ? now.getMonth() + 1 : Number(end.split('-')[1]) + 1;

      const totalMonths = (ey * 12 + em) - (sy * 12 + sm);
      const years  = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;

      const parts = [];
      if (years  > 0) parts.push(`${years} ${years  === 1 ? 'yr'    : 'yrs'}`);
      if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
      return parts.length ? parts.join(' ') : '< 1 month';
    }

    document.querySelectorAll('.role-duration').forEach(el => {
      const start = el.dataset.start;
      const end   = el.dataset.end;
      if (start && end) el.textContent = calcDuration(start, end);
    });
  })();

  /* ── Footer Year ─────────────────────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

}); // end DOMContentLoaded
