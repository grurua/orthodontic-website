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
    if (raw) {
      adminData = JSON.parse(raw);
      // Migrate old default: ensure at least 6 services on landing
      if (adminData && adminData.landing &&
          (!adminData.landing.landing_services_count || adminData.landing.landing_services_count === '3')) {
        adminData.landing.landing_services_count = '6';
      }
      if (adminData && adminData.landing &&
          (!adminData.landing.landing_results_count || adminData.landing.landing_results_count === '2')) {
        adminData.landing.landing_results_count = '6';
      }
    }
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

  // ---- Apply Admin Before/After Photos (stacked layout) ----
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
      const positions = adminData.imagePositions || {};

      if (imgs[beforeKey] && imgs[afterKey]) {
        const placeholder = slider.querySelector('.ba-placeholder');
        if (placeholder) placeholder.style.display = 'none';
        // Remove old labels
        slider.querySelectorAll('.ba-label').forEach(l => l.remove());

        const stacked = document.createElement('div');
        stacked.className = 'ba-stacked';

        // Before
        const beforeItem = document.createElement('div');
        beforeItem.className = 'ba-stacked-item';
        const beforeImg = document.createElement('img');
        beforeImg.alt = 'Before';
        beforeImg.src = imgs[beforeKey];
        if (positions[beforeKey]) beforeImg.style.objectPosition = positions[beforeKey];
        const labelBefore = document.createElement('span');
        labelBefore.className = 'ba-label ba-label-before';
        labelBefore.setAttribute('data-i18n', 'results.before');
        labelBefore.textContent = 'Before';
        beforeItem.appendChild(beforeImg);
        beforeItem.appendChild(labelBefore);

        // After
        const afterItem = document.createElement('div');
        afterItem.className = 'ba-stacked-item';
        const afterImg = document.createElement('img');
        afterImg.alt = 'After';
        afterImg.src = imgs[afterKey];
        if (positions[afterKey]) afterImg.style.objectPosition = positions[afterKey];
        const labelAfter = document.createElement('span');
        labelAfter.className = 'ba-label ba-label-after';
        labelAfter.setAttribute('data-i18n', 'results.after');
        labelAfter.textContent = 'After';
        afterItem.appendChild(afterImg);
        afterItem.appendChild(labelAfter);

        stacked.appendChild(beforeItem);
        stacked.appendChild(afterItem);
        slider.appendChild(stacked);
      }
    });
  }

  // ---- Apply Admin Social Links ----
  function applyAdminSocial() {
    if (!adminData || !adminData.social) return;
    const map = {
      social_instagram: 'instagram',
      social_facebook: 'facebook',
      social_messenger: 'messenger',
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
      // Fallback to English for dynamic keys (case detail, service, blog blocks)
      if (!val && enFallback && (key.startsWith('case_') || key.startsWith('svc_') || key.startsWith('blog_'))) {
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
      const count = landing.landing_results_count || '6';
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

      const detailUrl = `service.html?id=${svc.id}`;
      if (hasSvg) {
        card.innerHTML = `
          <div class="service-icon"><img src="${adminData.images[svgKey]}" width="48" height="48" alt="" /></div>
          <h3 data-i18n="services.${svc.key}.title"></h3>
          <p data-i18n="services.${svc.key}.desc"></p>
          <a href="${detailUrl}" class="service-card-btn" data-i18n="landing.learnMore">Learn More</a>
        `;
      } else {
        card.innerHTML = `
          <div class="service-icon"><i class="${svc.icon}"></i></div>
          <h3 data-i18n="services.${svc.key}.title"></h3>
          <p data-i18n="services.${svc.key}.desc"></p>
          <a href="${detailUrl}" class="service-card-btn" data-i18n="landing.learnMore">Learn More</a>
        `;
      }

      // Make the whole card clickable
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('.service-card-btn')) return;
        window.location.href = detailUrl;
      });

      grid.appendChild(card);
      revealObserver.observe(card);
    });
  }

  // ---- Before/After Drag Slider ----
  function createCompareSlider(beforeSrc, afterSrc, beforePos, afterPos, height) {
    const wrap = document.createElement('div');
    wrap.className = 'ba-compare';
    if (height) wrap.style.height = height;

    // Before image (full, underneath)
    const beforeImg = document.createElement('img');
    beforeImg.alt = 'Before';
    beforeImg.src = beforeSrc;
    if (beforePos) beforeImg.style.objectPosition = beforePos;
    wrap.appendChild(beforeImg);

    // After overlay (clipped)
    const afterDiv = document.createElement('div');
    afterDiv.className = 'ba-compare-after';
    afterDiv.style.clipPath = 'inset(0 0 0 50%)';
    const afterImg = document.createElement('img');
    afterImg.alt = 'After';
    afterImg.src = afterSrc;
    if (afterPos) afterImg.style.objectPosition = afterPos;
    afterDiv.appendChild(afterImg);
    wrap.appendChild(afterDiv);

    // Handle
    const handle = document.createElement('div');
    handle.className = 'ba-compare-handle';
    handle.style.left = '50%';
    wrap.appendChild(handle);

    // Labels
    const labelBefore = document.createElement('span');
    labelBefore.className = 'ba-compare-label ba-compare-label-before';
    labelBefore.setAttribute('data-i18n', 'results.before');
    labelBefore.textContent = 'Before';
    wrap.appendChild(labelBefore);

    const labelAfter = document.createElement('span');
    labelAfter.className = 'ba-compare-label ba-compare-label-after';
    labelAfter.setAttribute('data-i18n', 'results.after');
    labelAfter.textContent = 'After';
    wrap.appendChild(labelAfter);

    // Drag logic
    let dragging = false;
    function updateSlider(x) {
      const rect = wrap.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      afterDiv.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + '%';
    }

    wrap.addEventListener('mousedown', (e) => { dragging = true; updateSlider(e.clientX); });
    wrap.addEventListener('touchstart', (e) => { dragging = true; updateSlider(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('mousemove', (e) => { if (dragging) updateSlider(e.clientX); });
    document.addEventListener('touchmove', (e) => { if (dragging) updateSlider(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('mouseup', () => { dragging = false; });
    document.addEventListener('touchend', () => { dragging = false; });

    return wrap;
  }

  // ---- Case Detail Page ----
  function getCaseText(textKey, lang) {
    if (!adminData || !adminData.translations) return '';
    const t = adminData.translations[lang];
    if (t && t[textKey]) return t[textKey];
    if (lang !== 'en') {
      const en = adminData.translations.en;
      if (en && en[textKey]) return en[textKey];
    }
    return '';
  }

  function applyCaseDetail() {
    const heroSlider = document.getElementById('caseHeroSlider');
    const container = document.getElementById('caseDetailBlocks');
    if (!heroSlider && !container) return;

    const params = new URLSearchParams(window.location.search);
    const caseId = params.get('id');
    if (!caseId || !adminData || !adminData.results) return;

    const caseData = adminData.results.find(r => r.id === caseId);
    if (!caseData) return;

    const imgs = adminData.images || {};
    const pos = adminData.imagePositions || {};

    // Set title
    const titleEl = document.getElementById('caseTitle');
    const breadcrumbTitle = document.getElementById('caseBreadcrumbTitle');
    if (caseData.captionKey) {
      if (titleEl) titleEl.setAttribute('data-i18n', caseData.captionKey);
      if (breadcrumbTitle) breadcrumbTitle.setAttribute('data-i18n', caseData.captionKey);
    }

    // Set description
    const descEl = document.getElementById('caseDescription');
    if (descEl && caseData.descriptionKey) {
      const descText = getCaseText(caseData.descriptionKey, currentLang);
      if (descText) {
        descEl.setAttribute('data-i18n', caseData.descriptionKey);
        descEl.textContent = descText;
      }
    }

    // Hero before/after slider
    if (heroSlider) {
      const beforeKey = `result_${caseId}_before`;
      const afterKey = `result_${caseId}_after`;
      const beforeSrc = imgs[beforeKey];
      const afterSrc = imgs[afterKey];

      if (beforeSrc && afterSrc) {
        heroSlider.innerHTML = '';
        const slider = createCompareSlider(
          beforeSrc, afterSrc,
          pos[beforeKey], pos[afterKey],
          '480px'
        );
        heroSlider.appendChild(slider);
      }
    }

    // Treatment info grid
    const infoGrid = document.getElementById('caseInfoGrid');
    if (infoGrid && caseData.treatmentInfo) {
      const info = caseData.treatmentInfo;
      const fields = [
        { labelKey: 'case.infoProcedure', label: 'Procedure', value: info.procedure },
        { labelKey: 'case.infoDuration', label: 'Duration', value: info.duration },
        { labelKey: 'case.infoAppliance', label: 'Appliance', value: info.appliance },
        { labelKey: 'case.infoDoctor', label: 'Doctor', value: info.doctor },
      ];

      const activeFields = fields.filter(f => f.value && f.value.trim());
      if (activeFields.length > 0) {
        infoGrid.innerHTML = '';
        activeFields.forEach(f => {
          const item = document.createElement('div');
          item.className = 'case-info-item';
          item.innerHTML = `
            <div class="case-info-label" data-i18n="${f.labelKey}">${f.label}</div>
            <div class="case-info-value">${f.value}</div>
          `;
          infoGrid.appendChild(item);
        });
      }
    }

    // Render detail blocks — only show admin-managed content
    if (container) {
      const detailSection = container.closest('.case-detail');
      const blocks = caseData.detailBlocks;
      if (blocks && blocks.length > 0) {
        const fragment = document.createDocumentFragment();
        let renderedCount = 0;

        blocks.forEach((block, idx) => {
          const el = document.createElement('div');
          el.className = 'case-block';
          el.style.transitionDelay = (idx * 0.1) + 's';

          if (block.type === 'image') {
            const imgSrc = imgs[block.imageKey];
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
            const imgSrc = imgs[block.imageKey];
            const text = getCaseText(block.textKey, currentLang);
            if (imgSrc || text) {
              el.classList.add('case-block-image-text');
              if (imgSrc) {
                const img = document.createElement('img');
                img.alt = 'Case photo';
                img.src = imgSrc;
                el.appendChild(img);
              }
              if (text) {
                const p = document.createElement('p');
                p.setAttribute('data-i18n', block.textKey);
                p.textContent = text;
                el.appendChild(p);
              }
            }
          } else if (block.type === 'before_after') {
            const beforeSrc = imgs[block.beforeKey];
            const afterSrc = imgs[block.afterKey];
            if (beforeSrc && afterSrc) {
              el.classList.add('case-block-ba');
              const slider = createCompareSlider(
                beforeSrc, afterSrc,
                pos[block.beforeKey], pos[block.afterKey],
                '400px'
              );
              el.appendChild(slider);
            } else if (beforeSrc || afterSrc) {
              el.classList.add('case-block-image');
              const img = document.createElement('img');
              img.alt = beforeSrc ? 'Before' : 'After';
              img.src = beforeSrc || afterSrc;
              el.appendChild(img);
            }
          }

          // Only append if the block actually has rendered content
          if (el.children.length > 0) {
            fragment.appendChild(el);
            renderedCount++;
          }
        });

        // Only replace container content if blocks actually rendered
        if (renderedCount > 0) {
          container.innerHTML = '';
          container.appendChild(fragment);

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
        } else {
          // Blocks exist in data but none rendered (no uploaded content) — hide the section
          if (detailSection) detailSection.style.display = 'none';
        }
      } else {
        // No blocks at all — hide the entire detail section
        if (detailSection) detailSection.style.display = 'none';
      }
    }

    // Related cases
    const relatedSection = document.getElementById('caseRelated');
    const relatedGrid = document.getElementById('caseRelatedGrid');
    if (relatedSection && relatedGrid) {
      const otherCases = adminData.results.filter(r => r.id !== caseId);
      // Show up to 3 other cases
      const toShow = otherCases.slice(0, 3);
      if (toShow.length > 0) {
        relatedSection.style.display = '';
        relatedGrid.innerHTML = '';
        toShow.forEach(rc => {
          const beforeKey = `result_${rc.id}_before`;
          const afterKey = `result_${rc.id}_after`;
          const beforeSrc = imgs[beforeKey];
          const afterSrc = imgs[afterKey];

          const card = document.createElement('a');
          card.className = 'case-related-card';
          card.href = `case.html?id=${rc.id}`;

          let thumbHtml = '';
          if (beforeSrc && afterSrc) {
            thumbHtml = `
              <div class="ba-stacked">
                <div class="ba-stacked-item">
                  <img src="${beforeSrc}" alt="Before" style="${pos[beforeKey] ? 'object-position:' + pos[beforeKey] : ''}" />
                  <span class="ba-label ba-label-before" data-i18n="results.before">Before</span>
                </div>
                <div class="ba-stacked-item">
                  <img src="${afterSrc}" alt="After" style="${pos[afterKey] ? 'object-position:' + pos[afterKey] : ''}" />
                  <span class="ba-label ba-label-after" data-i18n="results.after">After</span>
                </div>
              </div>
            `;
          } else {
            thumbHtml = `
              <div class="ba-placeholder">
                <div class="ba-placeholder-half"><i class="fas fa-image"></i><span>Before</span></div>
                <div class="ba-placeholder-half"><i class="fas fa-image"></i><span>After</span></div>
              </div>
            `;
          }

          card.innerHTML = `
            ${thumbHtml}
            <div class="case-related-card-body">
              <p data-i18n="${rc.captionKey}"></p>
            </div>
          `;
          relatedGrid.appendChild(card);
        });
      }
    }
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

  // ---- Apply About Pillar Icons ----
  function applyAboutPillars() {
    if (!adminData || !adminData.about) return;
    const pillars = document.querySelectorAll('.pillar-icon i');
    const icons = [
      adminData.about.about_pillar1_icon,
      adminData.about.about_pillar2_icon,
      adminData.about.about_pillar3_icon,
      adminData.about.about_pillar4_icon,
    ];
    pillars.forEach((el, idx) => {
      if (icons[idx]) el.className = icons[idx];
    });
  }

  // ---- Blog Rendering ----
  function getBlogText(key, lang) {
    if (!adminData || !adminData.translations) return '';
    const t = adminData.translations[lang];
    if (t && t[key]) return t[key];
    if (lang !== 'en') {
      const en = adminData.translations.en;
      if (en && en[key]) return en[key];
    }
    return '';
  }

  function renderBlogCard(post, imgs) {
    const card = document.createElement('a');
    card.className = 'blog-card reveal';
    card.href = `blog-post.html?id=${post.id}`;

    const imgKey = `blog_${post.id}_featured`;
    const imgSrc = imgs[imgKey];

    let imageHtml = '';
    if (imgSrc) {
      imageHtml = `<div class="blog-card-image"><img src="${imgSrc}" alt="" /></div>`;
    } else {
      imageHtml = `<div class="blog-card-image"><div class="blog-card-placeholder"><i class="fas fa-newspaper"></i><span>No image</span></div></div>`;
    }

    const titleText = getBlogText(post.titleKey, currentLang) || 'Untitled';
    const excerptText = getBlogText(post.excerptKey, currentLang) || '';
    const dateStr = post.date || '';

    card.innerHTML = `
      ${imageHtml}
      <div class="blog-card-body">
        ${dateStr ? `<div class="blog-card-date">${dateStr}</div>` : ''}
        <h3 class="blog-card-title" data-i18n="${post.titleKey}">${titleText}</h3>
        <p class="blog-card-excerpt" data-i18n="${post.excerptKey}">${excerptText}</p>
        <span class="blog-card-link" data-i18n="blog.readMore">Read More <i class="fas fa-arrow-right"></i></span>
      </div>
    `;
    return card;
  }

  function applyBlogGrid() {
    if (!adminData || !adminData.blog || !adminData.blog.length) return;
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    const imgs = adminData.images || {};
    const isLanding = !!document.querySelector('.hero');
    const posts = isLanding ? adminData.blog.slice(0, 3) : adminData.blog;

    grid.innerHTML = '';
    posts.forEach(post => {
      const card = renderBlogCard(post, imgs);
      grid.appendChild(card);
      revealObserver.observe(card);
    });

    // Hide empty message on listing page
    const emptyEl = document.getElementById('blogEmpty');
    if (emptyEl) emptyEl.style.display = 'none';
  }

  function applyBlogPost() {
    const titleEl = document.getElementById('blogPostTitle');
    if (!titleEl) return; // not on blog-post page

    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    if (!postId || !adminData || !adminData.blog) return;

    const post = adminData.blog.find(p => p.id === postId);
    if (!post) return;

    const imgs = adminData.images || {};

    // Title
    const titleText = getBlogText(post.titleKey, currentLang) || 'Untitled';
    titleEl.textContent = titleText;
    titleEl.setAttribute('data-i18n', post.titleKey);

    // Breadcrumb
    const breadcrumb = document.getElementById('blogBreadcrumbTitle');
    if (breadcrumb) {
      breadcrumb.textContent = titleText;
      breadcrumb.setAttribute('data-i18n', post.titleKey);
    }

    // Date — hide if empty
    const dateEl = document.getElementById('blogPostDate');
    if (dateEl) {
      if (post.date) {
        dateEl.textContent = post.date;
      } else {
        dateEl.style.display = 'none';
      }
    }

    // Excerpt
    const excerptEl = document.getElementById('blogPostExcerpt');
    if (excerptEl && post.excerptKey) {
      const excerptText = getBlogText(post.excerptKey, currentLang);
      if (excerptText) {
        excerptEl.textContent = excerptText;
        excerptEl.setAttribute('data-i18n', post.excerptKey);
      } else {
        excerptEl.style.display = 'none';
      }
    }

    // Featured image — hide container if no image
    const featuredEl = document.getElementById('blogPostFeatured');
    const featuredKey = `blog_${post.id}_featured`;
    if (featuredEl) {
      if (imgs[featuredKey]) {
        const img = document.createElement('img');
        img.alt = titleText;
        img.src = imgs[featuredKey];
        featuredEl.appendChild(img);
      } else {
        featuredEl.style.display = 'none';
      }
    }

    // Content blocks
    const blocksContainer = document.getElementById('blogPostBlocks');
    if (blocksContainer && post.contentBlocks && post.contentBlocks.length > 0) {
      blocksContainer.innerHTML = '';

      post.contentBlocks.forEach((block, idx) => {
        const el = document.createElement('div');
        el.className = 'blog-block';
        el.style.transitionDelay = (idx * 0.1) + 's';

        if (block.type === 'image') {
          const imgSrc = imgs[block.imageKey];
          if (imgSrc) {
            el.classList.add('blog-block-image');
            const img = document.createElement('img');
            img.alt = '';
            img.src = imgSrc;
            el.appendChild(img);
          }
        } else if (block.type === 'text') {
          const text = getBlogText(block.textKey, currentLang);
          if (text) {
            el.classList.add('blog-block-text');
            const p = document.createElement('p');
            p.setAttribute('data-i18n', block.textKey);
            p.textContent = text;
            el.appendChild(p);
          }
        }

        blocksContainer.appendChild(el);
      });

      // Observe for reveal animation
      const blogObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            blogObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      blocksContainer.querySelectorAll('.blog-block').forEach(el => blogObserver.observe(el));
    }
  }

  // ---- Service Detail Page ----
  function getServiceText(key, lang) {
    if (!adminData || !adminData.translations) return '';
    const t = adminData.translations[lang];
    if (t && t[key]) return t[key];
    if (lang !== 'en') {
      const en = adminData.translations.en;
      if (en && en[key]) return en[key];
    }
    return '';
  }

  function applyServiceDetail() {
    const titleEl = document.getElementById('serviceDetailTitle');
    if (!titleEl) return; // not on service detail page

    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get('id');
    if (!serviceId) return;

    const services = (adminData && adminData.services) ? adminData.services : DEFAULT_SERVICES;
    const svc = services.find(s => s.id === serviceId);
    if (!svc) return;

    const imgs = (adminData && adminData.images) ? adminData.images : {};
    const titleKey = `services.${svc.key}.title`;
    const descKey = `services.${svc.key}.desc`;

    // Title
    const titleText = getServiceText(titleKey, currentLang) || svc.key;
    titleEl.textContent = titleText;
    titleEl.setAttribute('data-i18n', titleKey);

    // Breadcrumb
    const breadcrumb = document.getElementById('serviceBreadcrumbTitle');
    if (breadcrumb) {
      breadcrumb.textContent = titleText;
      breadcrumb.setAttribute('data-i18n', titleKey);
    }

    // Description
    const descEl = document.getElementById('serviceDetailDesc');
    if (descEl) {
      const descText = getServiceText(descKey, currentLang);
      if (descText) {
        descEl.textContent = descText;
        descEl.setAttribute('data-i18n', descKey);
      } else {
        descEl.style.display = 'none';
      }
    }

    // Icon
    const iconEl = document.getElementById('serviceDetailIcon');
    if (iconEl) {
      const svgKey = `service_${svc.id}_svg`;
      if (imgs[svgKey]) {
        iconEl.innerHTML = `<img src="${imgs[svgKey]}" width="56" height="56" alt="" />`;
      } else {
        iconEl.innerHTML = `<i class="${svc.icon}"></i>`;
      }
    }

    // Content blocks
    const blocksContainer = document.getElementById('serviceDetailBlocks');
    const serviceBlocks = (adminData && adminData.serviceBlocks && adminData.serviceBlocks[serviceId])
      ? adminData.serviceBlocks[serviceId]
      : [];

    if (blocksContainer && serviceBlocks.length > 0) {
      blocksContainer.innerHTML = '';

      serviceBlocks.forEach((block, idx) => {
        const el = document.createElement('div');
        el.className = 'svc-block reveal';
        el.style.transitionDelay = (idx * 0.08) + 's';

        if (block.type === 'image') {
          const imgSrc = imgs[block.imageKey];
          if (imgSrc) {
            el.classList.add('svc-block-image');
            el.innerHTML = `<img src="${imgSrc}" alt="" />`;
          }
        } else if (block.type === 'text') {
          const text = getServiceText(block.textKey, currentLang);
          if (text) {
            el.classList.add('svc-block-text');
            const p = document.createElement('p');
            p.setAttribute('data-i18n', block.textKey);
            p.textContent = text;
            el.appendChild(p);
          }
        } else if (block.type === 'image-text') {
          const imgSrc = block.imageKey ? imgs[block.imageKey] : null;
          const text = block.textKey ? getServiceText(block.textKey, currentLang) : '';
          if (imgSrc || text) {
            el.classList.add('svc-block-image-text');
            let html = '';
            if (imgSrc) {
              html += `<div class="svc-block-it-img"><img src="${imgSrc}" alt="" /></div>`;
            }
            if (text) {
              html += `<div class="svc-block-it-text"><p data-i18n="${block.textKey}">${text}</p></div>`;
            }
            el.innerHTML = html;
          }
        }

        if (el.innerHTML) {
          blocksContainer.appendChild(el);
          revealObserver.observe(el);
        }
      });
    }

    // Results widgets at the bottom
    const resultsSection = document.getElementById('serviceResultsSection');
    const resultsGrid = document.getElementById('serviceResultsGrid');
    if (resultsSection && resultsGrid && adminData && adminData.results && adminData.results.length > 0) {
      const positions = adminData.imagePositions || {};
      const toShow = adminData.results.slice(0, 4);
      let hasAny = false;

      toShow.forEach(res => {
        const beforeKey = `result_${res.id}_before`;
        const afterKey = `result_${res.id}_after`;
        const beforeSrc = imgs[beforeKey];
        const afterSrc = imgs[afterKey];

        if (beforeSrc || afterSrc) {
          hasAny = true;
          const card = document.createElement('a');
          card.className = 'result-card reveal';
          card.href = `case.html?id=${res.id}`;

          let thumbHtml = '';
          if (beforeSrc && afterSrc) {
            thumbHtml = `
              <div class="ba-stacked">
                <div class="ba-stacked-item">
                  <img src="${beforeSrc}" alt="Before" style="${positions[beforeKey] ? 'object-position:' + positions[beforeKey] : ''}" />
                  <span class="ba-label ba-label-before" data-i18n="results.before">Before</span>
                </div>
                <div class="ba-stacked-item">
                  <img src="${afterSrc}" alt="After" style="${positions[afterKey] ? 'object-position:' + positions[afterKey] : ''}" />
                  <span class="ba-label ba-label-after" data-i18n="results.after">After</span>
                </div>
              </div>`;
          } else {
            const src = beforeSrc || afterSrc;
            thumbHtml = `<div class="ba-stacked"><div class="ba-stacked-item"><img src="${src}" alt="" /></div></div>`;
          }

          const captionText = getServiceText(res.captionKey, currentLang);
          card.innerHTML = `
            <div class="ba-slider">${thumbHtml}</div>
            <div class="result-card-bottom">
              <p class="result-caption" data-i18n="${res.captionKey}">${captionText || ''}</p>
              <span class="btn-view-case" data-i18n="landing.viewCase">View Details <i class="fas fa-arrow-right"></i></span>
            </div>
          `;
          resultsGrid.appendChild(card);
          revealObserver.observe(card);
        }
      });

      if (hasAny) {
        resultsSection.style.display = '';
      }
    }
  }

  // ---- Init ----
  applyHeroPhoto();
  applyAboutPhoto();
  applyAboutPillars();
  applyDynamicServices();
  applyDynamicResultsGrid();
  applyResultPhotos();
  applyAdminSocial();
  applyAdminContact();
  applyLandingSettings();
  applyCaseDetail();
  applyBlogGrid();
  applyBlogPost();
  applyServiceDetail();
  setLang(currentLang);
})();
