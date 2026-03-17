/**
 * Shared JS for all pages — i18n, admin data, nav, reveal animations.
 */
(() => {
  'use strict';

  // ---- Admin Data ----
  let adminData = null;
  try {
    const raw = localStorage.getItem('admin_data');
    if (raw) adminData = JSON.parse(raw);
  } catch { /* ignore */ }

  // ---- Footer Year ----
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Apply Admin Hero Photo ----
  function applyHeroPhoto() {
    if (!adminData || !adminData.images || !adminData.images.hero_photo) return;
    const wrapper = document.getElementById('heroPhotoWrapper');
    const placeholder = document.getElementById('heroPlaceholder');
    if (wrapper && placeholder) {
      placeholder.style.display = 'none';
      const img = document.createElement('img');
      img.alt = 'Doctor Photo';
      img.onload = function () { this.classList.add('loaded'); };
      img.src = adminData.images.hero_photo;
      wrapper.appendChild(img);
    }
  }

  // ---- Apply Admin About Photo ----
  function applyAboutPhoto() {
    if (!adminData || !adminData.images || !adminData.images.about_photo) return;
    const wrapper = document.getElementById('aboutPhotoWrapper');
    const placeholder = document.getElementById('aboutPlaceholder');
    if (wrapper && placeholder) {
      placeholder.style.display = 'none';
      const img = document.createElement('img');
      img.alt = 'About Photo';
      img.src = adminData.images.about_photo;
      wrapper.appendChild(img);
    }
  }

  // ---- Apply Admin Before/After Photos ----
  function applyResultPhotos() {
    if (!adminData || !adminData.results || !adminData.images) return;
    const sliders = document.querySelectorAll('.ba-slider');
    if (!sliders.length) return;

    adminData.results.forEach((res, idx) => {
      const slider = sliders[idx];
      if (!slider) return;

      const beforeKey = `result_${res.id}_before`;
      const afterKey = `result_${res.id}_after`;
      const imgs = adminData.images;

      if (imgs[beforeKey] && imgs[afterKey]) {
        const placeholder = slider.querySelector('.ba-placeholder');
        if (placeholder) placeholder.style.display = 'none';

        const beforeImg = document.createElement('img');
        beforeImg.className = 'ba-before';
        beforeImg.alt = 'Before';
        beforeImg.src = imgs[beforeKey];

        const afterWrap = document.createElement('div');
        afterWrap.className = 'ba-after-wrap';
        const afterImg = document.createElement('img');
        afterImg.alt = 'After';
        afterImg.src = imgs[afterKey];
        afterWrap.appendChild(afterImg);

        const handle = document.createElement('div');
        handle.className = 'ba-handle';

        slider.appendChild(beforeImg);
        slider.appendChild(afterWrap);
        slider.appendChild(handle);

        initSlider(slider, afterWrap, handle);
      }
    });
  }

  // ---- Before/After Slider Logic ----
  function initSlider(slider, afterWrap, handle) {
    let dragging = false;

    function update(x) {
      const rect = slider.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      afterWrap.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + '%';
    }

    slider.addEventListener('mousedown', (e) => { dragging = true; update(e.clientX); });
    slider.addEventListener('touchstart', (e) => { dragging = true; update(e.touches[0].clientX); }, { passive: true });

    document.addEventListener('mousemove', (e) => { if (dragging) update(e.clientX); });
    document.addEventListener('touchmove', (e) => { if (dragging) update(e.touches[0].clientX); }, { passive: true });

    document.addEventListener('mouseup', () => { dragging = false; });
    document.addEventListener('touchend', () => { dragging = false; });
  }

  // ---- Apply Admin Stats ----
  function applyAdminStats() {
    if (!adminData || !adminData.stats) return;
    const map = {
      stat1_number: 'hero.stat1_number',
      stat2_number: 'hero.stat2_number',
      stat3_number: 'hero.stat3_number',
      stat4_number: 'hero.stat4_number',
    };
    Object.entries(map).forEach(([key, attr]) => {
      if (adminData.stats[key]) {
        document.querySelectorAll(`[data-i18n="${attr}"]`).forEach(el => {
          el.textContent = adminData.stats[key];
        });
      }
    });
  }

  // ---- Apply Admin Social Links ----
  function applyAdminSocial() {
    if (!adminData || !adminData.social) return;
    const map = {
      social_instagram: 'instagram',
      social_facebook: 'facebook',
      social_telegram: 'telegram',
      social_whatsapp: 'whatsapp',
      social_viber: 'viber',
      social_tiktok: 'tiktok',
      social_youtube: 'youtube',
    };
    Object.entries(map).forEach(([key, name]) => {
      const url = adminData.social[key];
      if (url) {
        document.querySelectorAll(`[data-social="${name}"]`).forEach(el => {
          el.href = url;
        });
      }
    });
  }

  // ---- Apply Admin Contact Info ----
  function applyAdminContact() {
    if (!adminData || !adminData.contact) return;
    if (adminData.contact.contact_phone) {
      const phoneLink = document.querySelector('.contact-item a[href^="tel:"]');
      if (phoneLink) {
        phoneLink.href = `tel:${adminData.contact.contact_phone.replace(/\s/g, '')}`;
        phoneLink.textContent = adminData.contact.contact_phone;
      }
    }
    if (adminData.contact.contact_email) {
      const emailLink = document.querySelector('.contact-item a[href^="mailto:"]');
      if (emailLink) {
        emailLink.href = `mailto:${adminData.contact.contact_email}`;
        emailLink.textContent = adminData.contact.contact_email;
      }
    }
  }

  // ---- i18n ----
  const langCache = {};
  let currentLang = localStorage.getItem('lang') || 'en';

  function getAdminOverrides(lang) {
    if (!adminData || !adminData.translations) return {};
    return adminData.translations[lang] || {};
  }

  async function loadLang(lang) {
    if (langCache[lang]) return langCache[lang];
    let base = {};
    try {
      const res = await fetch(`lang/${lang}.json`);
      if (res.ok) base = await res.json();
    } catch { /* ignore */ }
    langCache[lang] = { ...base, ...getAdminOverrides(lang) };
    return langCache[lang];
  }

  async function setLang(lang) {
    delete langCache[lang];
    const t = await loadLang(lang);
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!t[key]) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t[key];
      } else {
        el.textContent = t[key];
      }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const logoText = t['logo'] || 'Dr. Ana Vepkhvadze';
    document.title = `${logoText} — ${t['nav.home'] || 'Orthodontist'}`;
  }

  // ---- Navbar Scroll (only on home page with hero) ----
  const navbar = document.getElementById('navbar');
  if (navbar && !navbar.classList.contains('navbar-light')) {
    function onScroll() {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Mobile Nav ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // ---- Smooth Scroll (for same-page anchors) ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target && navbar) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - navbar.offsetHeight, behavior: 'smooth' });
      }
    });
  });

  // ---- Scroll Reveal ----
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ---- Contact Form ----
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit');
      const original = btn.textContent;
      btn.textContent = '\u2713';
      btn.style.background = '#4CAF50';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 2500);
    });
  }

  // ---- Lang Buttons ----
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  // ---- Apply Landing Page Settings ----
  function applyLandingSettings() {
    if (!adminData || !adminData.landing) return;
    const landing = adminData.landing;

    // Limit services on landing page
    const servicesGrid = document.getElementById('servicesGrid');
    if (servicesGrid && document.querySelector('.hero')) {
      const count = landing.landing_services_count || '3';
      if (count !== 'all') {
        const max = parseInt(count, 10);
        const cards = servicesGrid.querySelectorAll('.service-card');
        cards.forEach((card, i) => {
          if (i >= max) card.style.display = 'none';
        });
      }
    }

    // Limit results on landing page
    const resultsGrid = document.getElementById('resultsGrid');
    if (resultsGrid && document.querySelector('.hero')) {
      const count = landing.landing_results_count || '2';
      if (count !== 'all') {
        const max = parseInt(count, 10);
        const cards = resultsGrid.querySelectorAll('.result-card');
        cards.forEach((card, i) => {
          if (i >= max) card.style.display = 'none';
        });
      }
    }

    // Limit about highlights on landing page
    if (document.querySelector('.hero')) {
      const highlightCount = landing.landing_about_highlights || '3';
      if (highlightCount !== '3') {
        const max = parseInt(highlightCount, 10);
        const items = document.querySelectorAll('.about-highlights .highlight-item');
        items.forEach((item, i) => {
          if (i >= max) item.style.display = 'none';
        });
      }
    }
  }

  // ---- Init ----
  applyHeroPhoto();
  applyAboutPhoto();
  applyResultPhotos();
  applyAdminStats();
  applyAdminSocial();
  applyAdminContact();
  applyLandingSettings();
  setLang(currentLang);
})();
