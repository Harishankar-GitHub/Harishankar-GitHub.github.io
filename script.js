/* ============================================================
   PORTFOLIO — script.js
   Clean, performant, accessible JavaScript
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

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

  /* ── Theme Toggle ────────────────────────────────────────── */
  const root        = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon   = document.getElementById('theme-icon');

  const savedTheme = localStorage.getItem('theme') ?? 'dark';
  applyTheme(savedTheme);

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  /* ── Mobile Navigation ───────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navLinks?.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu on link click or outside click
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

  function closeMenu() {
    hamburger?.classList.remove('open');
    navLinks?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
  }

  /* ── Navbar Scroll Behaviour ─────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');
  const sections  = document.querySelectorAll('section[id]');

  const onScroll = throttleRAF(() => {
    const scrollY = window.scrollY;

    // Navbar background
    navbar?.classList.toggle('scrolled', scrollY > 40);

    // Back to top visibility
    backToTop?.classList.toggle('visible', scrollY > 400);

    // Active nav link
    updateActiveNav(scrollY);
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  function updateActiveNav(scrollY) {
    const offset = scrollY + 100;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', offset >= top && offset < top + height);
      }
    });
  }

  /* ── Back to Top ─────────────────────────────────────────── */
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Scroll Animations (Intersection Observer) ───────────── */
  const animatedEls = document.querySelectorAll(
    '[data-aos], .timeline-item, .skill-category, .cert-card, .edu-card'
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // Stagger siblings for a cascade effect
        const parent   = entry.target.parentElement;
        const siblings = parent
          ? [...parent.querySelectorAll('[data-aos], .timeline-item, .skill-category, .cert-card, .edu-card')]
          : [];
        const index  = siblings.indexOf(entry.target);
        const delay  = Math.max(0, index * 80);

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
  const phrases = [
    'Software Engineer',
    'Backend Specialist',
    'Microservices Architect',
    'Prompt Engineer',
    'Agentic AI Developer',
  ];

  const typedEl = document.getElementById('typed-text');

  if (typedEl) {
    let phraseIndex = 0;
    let charIndex   = 0;
    let isDeleting  = false;
    let timerId     = null;

    function type() {
      const current = phrases[phraseIndex];

      typedEl.textContent = isDeleting
        ? current.substring(0, charIndex - 1)
        : current.substring(0, charIndex + 1);

      isDeleting ? charIndex-- : charIndex++;

      let delay = isDeleting ? 55 : 95;

      if (!isDeleting && charIndex === current.length) {
        delay = 1800;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 350;
      }

      timerId = setTimeout(type, delay);
    }

    type();

    // Pause typing when tab is hidden (saves CPU)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearTimeout(timerId);
      } else {
        type();
      }
    });
  }

  /* ── Total Experience Calculator ────────────────────────── */
  (function renderExperience() {
    /**
     * Career intervals: [startYear, startMonth (0-indexed), endYear | null, endMonth | null]
     * Overlapping periods are merged to avoid double-counting.
     */
    const roles = [
      [2018,  7, 2018, 11], // Infosys Trainee:   Aug 2018 – Dec 2018
      [2019,  0, 2020,  8], // Infosys SE:        Jan 2019 – Sep 2020
      [2020,  9, 2021,  0], // Infosys Senior SE: Oct 2020 – Jan 2021
      [2021,  0, 2023,  7], // Philips:           Jan 2021 – Aug 2023
      [2023,  7, 2024,  6], // Epsilon:           Aug 2023 – Jul 2024
      [2024,  6, null, null], // Ericsson:         Jul 2024 – Present
    ];

    const now = Date.now();

    // Build intervals in ms
    const intervals = roles.map(([sy, sm, ey, em]) => [
      new Date(sy, sm, 1).getTime(),
      ey === null ? now : new Date(ey, em, 1).getTime(),
    ]);

    // Sort by start time
    intervals.sort((a, b) => a[0] - b[0]);

    // Merge overlapping intervals
    const merged = intervals.reduce((acc, [start, end]) => {
      if (acc.length && start <= acc[acc.length - 1][1]) {
        acc[acc.length - 1][1] = Math.max(acc[acc.length - 1][1], end);
      } else {
        acc.push([start, end]);
      }
      return acc;
    }, []);

    // Total months
    const MS_PER_MONTH  = 1000 * 60 * 60 * 24 * 30.4375;
    const totalMs       = merged.reduce((sum, [s, e]) => sum + (e - s), 0);
    const totalMonths   = Math.floor(totalMs / MS_PER_MONTH);
    const years         = Math.floor(totalMonths / 12);
    const months        = totalMonths % 12;

    const label = months === 0
      ? `${years} yrs`
      : `${years} yrs ${months} ${months === 1 ? 'month' : 'months'}`;

    const el = document.getElementById('experience-total');
    if (el) el.textContent = `⏱ ${label}`;
  })();

  /* ── Footer Year ─────────────────────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

}); // end DOMContentLoaded
