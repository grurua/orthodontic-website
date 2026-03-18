/**
 * Shared JS for all pages — i18n, admin data, nav, reveal animations.
 */
(() => {
  'use strict';

  // ---- Default Services (used when no admin data exists) ----
  const DEFAULT_SERVICES = [
    { id: 's1', icon: 'fas fa-child', key: 'pediatric' },
    { id: 's2', icon: 'fas fa-teeth', key: 'braces' },
    { id: 's3', icon: 'fas fa-gem', key: 'ceramic' },
    { id: 's4', icon: 'fas fa-magic', key: 'aligners' },
    { id: 's5', icon: 'fas fa-shield-alt', key: 'splints' },
    { id: 's6', icon: 'fas fa-eye-slash', key: 'lingual' },
    { id: 's7', icon: 'fas fa-sync-alt', key: 'retainers' },
    { id: 's8', icon: 'fas fa-x-ray', key: 'digital' },
    { id: 's9', icon: 'fas fa-bone', key: 'jaw' },
  ];

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

    // Get English fallback translations for case detail text keys
    const enFallback = lang !== 'en' ? await loadLang('en') : null;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      let val = t[key];
      // Fallback to English for dynamic keys (case detail blocks)
      if (!val && enFallback && key.startsWith('case_')) {
        val = enFallback[key];
      }
      if (!val) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.textContent = val;
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

  // ---- Dynamic Services Rendering ----
  function applyDynamicServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    const isLanding = !!document.querySelector('.hero');
    const services = (adminData && adminData.services) ? adminData.services : DEFAULT_SERVICES;
    const landing = (adminData && adminData.landing) ? adminData.landing : {};
    const count = landing.landing_services_count || '6';

    // Determine which services to show
    let toShow = services;
    if (isLanding && count !== 'all') {
      const max = parseInt(count, 10);
      toShow = services.slice(0, max);
    }

    // Rebuild the grid
    grid.innerHTML = '';
    toShow.forEach(svc => {
      const card = document.createElement('div');
      card.className = 'service-card reveal';

      const svgKey = `service_${svc.id}_svg`;
      const hasSvg = adminData && adminData.images && adminData.images[svgKey];

      if (hasSvg) {
        card.innerHTML = `
          <div class="service-icon"><img src="${adminData.images[svgKey]}" width="48" height="48" alt="" /></div>
          <h3 data-i18n="services.${svc.key}.title"></h3>
          <p data-i18n="services.${svc.key}.desc"></p>
        `;
      } else {
        card.innerHTML = `
          <div class="service-icon"><i class="${svc.icon}"></i></div>
          <h3 data-i18n="services.${svc.key}.title"></h3>
          <p data-i18n="services.${svc.key}.desc"></p>
        `;
      }

      grid.appendChild(card);
      revealObserver.observe(card);
    });
  }

  // ---- Case Detail Page ----
  function getCaseText(textKey, lang) {
    if (!adminData || !adminData.translations) return '';
    const t = adminData.translations[lang];
    if (t && t[textKey]) return t[textKey];
    // Fallback to English if current lang is empty
    if (lang !== 'en') {
      const en = adminData.translations.en;
      if (en && en[textKey]) return en[textKey];
    }
    return '';
  }

  function applyCaseDetail() {
    const container = document.getElementById('caseDetailBlocks');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const caseId = params.get('id');
    if (!caseId || !adminData || !adminData.results) return;

    const caseData = adminData.results.find(r => r.id === caseId);
    if (!caseData) return;

    // Set caption in header
    const captionEl = document.getElementById('caseCaption');
    if (captionEl && caseData.captionKey) {
      captionEl.setAttribute('data-i18n', caseData.captionKey);
    }

    // Render detail blocks
    const blocks = caseData.detailBlocks;
    if (!blocks || blocks.length === 0) return;

    container.innerHTML = '';

    blocks.forEach((block, idx) => {
      const el = document.createElement('div');
      el.className = 'case-block';
      el.style.transitionDelay = (idx * 0.1) + 's';

      if (block.type === 'image') {
        const imgSrc = adminData.images && adminData.images[block.imageKey];
        if (imgSrc) {
          el.classList.add('case-block-image');
          const img = document.createElement('img');
          img.alt = 'Case photo';
          img.src = imgSrc;
          el.appendChild(img);
        }
      } else if (block.type === 'text') {
        const text = getCaseText(block.textKey, currentLang);
        if (text) {
          el.classList.add('case-block-text');
          const p = document.createElement('p');
          p.setAttribute('data-i18n', block.textKey);
          p.textContent = text;
          el.appendChild(p);
        }
      } else if (block.type === 'image_text') {
        el.classList.add('case-block-image-text');
        const imgSrc = adminData.images && adminData.images[block.imageKey];
        if (imgSrc) {
          const img = document.createElement('img');
          img.alt = 'Case photo';
          img.src = imgSrc;
          el.appendChild(img);
        }
        const text = getCaseText(block.textKey, currentLang);
        if (text) {
          const p = document.createElement('p');
          p.setAttribute('data-i18n', block.textKey);
          p.textContent = text;
          el.appendChild(p);
        }
      } else if (block.type === 'before_after') {
        const imgs = adminData.images || {};
        const beforeSrc = imgs[block.beforeKey];
        const afterSrc = imgs[block.afterKey];
        if (beforeSrc && afterSrc) {
          el.classList.add('case-block-ba');
          const slider = document.createElement('div');
          slider.className = 'ba-slider';
          const beforeImg = document.createElement('img');
          beforeImg.className = 'ba-before';
          beforeImg.alt = 'Before';
          beforeImg.src = beforeSrc;
          const afterWrap = document.createElement('div');
          afterWrap.className = 'ba-after-wrap';
          const afterImg = document.createElement('img');
          afterImg.alt = 'After';
          afterImg.src = afterSrc;
          afterWrap.appendChild(afterImg);
          const handle = document.createElement('div');
          handle.className = 'ba-handle';
          const labelBefore = document.createElement('span');
          labelBefore.className = 'ba-label ba-label-before';
          labelBefore.setAttribute('data-i18n', 'results.before');
          labelBefore.textContent = 'Before';
          const labelAfter = document.createElement('span');
          labelAfter.className = 'ba-label ba-label-after';
          labelAfter.setAttribute('data-i18n', 'results.after');
          labelAfter.textContent = 'After';
          slider.appendChild(beforeImg);
          slider.appendChild(afterWrap);
          slider.appendChild(handle);
          slider.appendChild(labelBefore);
          slider.appendChild(labelAfter);
          el.appendChild(slider);
          initSlider(slider, afterWrap, handle);
        } else if (beforeSrc || afterSrc) {
          // Show whichever image is available
          el.classList.add('case-block-image');
          const img = document.createElement('img');
          img.alt = beforeSrc ? 'Before' : 'After';
          img.src = beforeSrc || afterSrc;
          el.appendChild(img);
        }
      }

      container.appendChild(el);
    });

    // Observe for reveal animation
    const blockObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          blockObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    container.querySelectorAll('.case-block').forEach(el => blockObserver.observe(el));
  }

  // ---- Dynamic Results Grid (for results.html with dynamically added cases) ----
  function applyDynamicResultsGrid() {
    const grid = document.getElementById('resultsGrid');
    if (!grid || !adminData || !adminData.results) return;
    // Only on results.html (not landing page - landing has .hero)
    if (document.querySelector('.hero')) return;

    const existingCards = grid.querySelectorAll('.result-card');
    const existingCount = existingCards.length;
    const totalCases = adminData.results.length;

    // Update existing card links
    existingCards.forEach((card, idx) => {
      if (idx < adminData.results.length) {
        const link = card.querySelector('.btn-view-case');
        if (link) link.href = `case.html?id=${adminData.results[idx].id}`;
      }
    });

    // Add extra cards if admin has more cases than the static HTML
    for (let i = existingCount; i < totalCases; i++) {
      const res = adminData.results[i];
      const card = document.createElement('div');
      card.className = 'result-card reveal';
      card.setAttribute('data-case-idx', i);
      card.innerHTML = `
        <div class="ba-slider" data-idx="${i}">
          <div class="ba-placeholder">
            <div class="ba-placeholder-half"><i class="fas fa-image"></i><span>Before</span></div>
            <div class="ba-placeholder-half"><i class="fas fa-image"></i><span>After</span></div>
          </div>
          <span class="ba-label ba-label-before" data-i18n="results.before">Before</span>
          <span class="ba-label ba-label-after" data-i18n="results.after">After</span>
        </div>
        <div class="result-card-bottom">
          <p class="result-caption" data-i18n="${res.captionKey}"></p>
          <a href="case.html?id=${res.id}" class="btn-view-case" data-i18n="landing.viewCase">View Details <i class="fas fa-arrow-right"></i></a>
        </div>
      `;
      grid.appendChild(card);
      revealObserver.observe(card);
    }
  }

  // ---- Init ----
  applyHeroPhoto();
  applyAboutPhoto();
  applyDynamicServices();
  applyDynamicResultsGrid();
  applyResultPhotos();
  applyAdminStats();
  applyAdminSocial();
  applyAdminContact();
  applyLandingSettings();
  applyCaseDetail();
  setLang(currentLang);
})();
