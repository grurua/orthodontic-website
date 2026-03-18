/**
 * Admin Panel — Full CMS for the orthodontist website.
 * All data is stored in localStorage with the key "admin_data".
 * The main site reads this data to override defaults.
 */
(() => {
  'use strict';

  // ---- Constants ----
  const STORAGE_KEY = 'admin_data';
  const PASSWORD_KEY = 'admin_password';
  const DEFAULT_PASSWORD = 'admin123';

  // Default services list matching index.html
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

  const DEFAULT_RESULTS = [
    { id: 'r1', captionKey: 'results.case1' },
    { id: 'r2', captionKey: 'results.case2' },
    { id: 'r3', captionKey: 'results.case3' },
    { id: 'r4', captionKey: 'results.case4' },
  ];

  // Translation keys grouped by section for the editor
  const TRANSLATION_SECTIONS = {
    'Navigation': ['logo', 'nav.home', 'nav.about', 'nav.services', 'nav.results', 'nav.contact'],
    'Hero': ['hero.subtitle', 'hero.title', 'hero.description', 'hero.cta', 'hero.learnMore', 'hero.photoLabel', 'hero.stat1', 'hero.stat2', 'hero.stat3', 'hero.stat4'],
    'About': ['about.subtitle', 'about.title', 'about.description', 'about.description2', 'about.photoLabel', 'about.highlight1', 'about.highlight2', 'about.highlight3'],
    'Services': ['services.subtitle', 'services.title',
      'services.pediatric.title', 'services.pediatric.desc',
      'services.braces.title', 'services.braces.desc',
      'services.ceramic.title', 'services.ceramic.desc',
      'services.aligners.title', 'services.aligners.desc',
      'services.splints.title', 'services.splints.desc',
      'services.lingual.title', 'services.lingual.desc',
      'services.retainers.title', 'services.retainers.desc',
      'services.digital.title', 'services.digital.desc',
      'services.jaw.title', 'services.jaw.desc',
    ],
    'Results': ['results.subtitle', 'results.title', 'results.description', 'results.before', 'results.after', 'results.case1', 'results.case2', 'results.case3', 'results.case4'],
    'Contact': ['contact.subtitle', 'contact.title', 'contact.addressLabel', 'contact.address', 'contact.phoneLabel', 'contact.emailLabel', 'contact.hoursLabel', 'contact.hours', 'contact.followUs', 'contact.form.name', 'contact.form.phone', 'contact.form.email', 'contact.form.message', 'contact.form.submit'],
    'Landing Page Buttons': ['landing.viewCase', 'landing.aboutBtn', 'landing.servicesBtn', 'landing.resultsBtn', 'landing.contactBtn'],
    'Case Detail': ['case.backToResults', 'case.empty'],
    'Footer': ['footer.tagline', 'footer.rights'],
  };

  // ---- Data layer ----
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : getDefaultData();
    } catch {
      return getDefaultData();
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        toast('Storage full! Try removing some images or exporting data first.', 'error');
      } else {
        toast('Failed to save data.', 'error');
      }
    }
  }

  function getDefaultData() {
    return {
      images: {},           // key -> base64 data URL
      stats: { stat1_number: '15+', stat2_number: '5000+', stat3_number: '98%', stat4_number: '10+' },
      contact: { contact_phone: '+995 555 123 456', contact_email: 'info@drsmile.ge', contact_map: '' },
      social: {
        social_instagram: '', social_facebook: '', social_telegram: '',
        social_whatsapp: '', social_viber: '', social_tiktok: '', social_youtube: '',
      },
      landing: {
        landing_about_desc: '',
        landing_about_btn: '',
        landing_about_highlights: '3',
        landing_services_count: '3',
        landing_services_btn: '',
        landing_results_count: '2',
        landing_results_btn: '',
      },
      services: DEFAULT_SERVICES.map(s => ({ ...s })),
      results: DEFAULT_RESULTS.map(r => ({ ...r })),
      translations: { en: {}, ka: {}, ru: {} },  // overrides only
    };
  }

  // ---- Translation file cache ----
  const langFileCache = {};
  async function loadLangFile(lang) {
    if (langFileCache[lang]) return langFileCache[lang];
    try {
      const res = await fetch(`lang/${lang}.json`);
      langFileCache[lang] = await res.json();
    } catch {
      langFileCache[lang] = {};
    }
    return langFileCache[lang];
  }

  // ---- State ----
  let data = loadData();
  let currentTransLang = 'en';

  // ---- DOM Ready ----
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupLogin();
    setupNavigation();
    setupSidebar();
    setupImageUploads();
    setupSaveButton();
    setupLanding();
    setupServices();
    setupResults();
    setupSocial();
    setupContact();
    setupStats();
    setupTranslations();
    setupSettings();
    populateAll();
  }

  // ========================================
  // Login
  // ========================================
  function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    const hint = document.getElementById('loginHint');

    // Check if already logged in this session
    if (sessionStorage.getItem('admin_auth') === 'true') {
      loginScreen.style.display = 'none';
      adminPanel.style.display = 'flex';
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pw = document.getElementById('loginPassword').value;
      const stored = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
      if (pw === stored) {
        sessionStorage.setItem('admin_auth', 'true');
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'flex';
        hint.textContent = '';
      } else {
        hint.textContent = 'Incorrect password. Please try again.';
      }
    });

    document.getElementById('btnLogout').addEventListener('click', () => {
      sessionStorage.removeItem('admin_auth');
      loginScreen.style.display = 'flex';
      adminPanel.style.display = 'none';
      document.getElementById('loginPassword').value = '';
    });
  }

  // ========================================
  // Navigation / Tabs
  // ========================================
  function setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const pageTitle = document.getElementById('pageTitle');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;

        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(`tab-${tab}`);
        if (panel) panel.classList.add('active');

        pageTitle.textContent = item.textContent.trim();

        // Close sidebar on mobile
        document.getElementById('sidebar').classList.remove('open');
      });
    });
  }

  function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    document.getElementById('sidebarToggle').addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    document.getElementById('sidebarClose').addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }

  // ========================================
  // Image Uploads
  // ========================================
  function setupImageUploads() {
    document.querySelectorAll('.image-upload-area').forEach(area => {
      const key = area.dataset.key;
      const preview = area.querySelector('.image-preview');
      const input = area.querySelector('.file-input');
      const removeBtn = area.querySelector('.btn-remove-img');

      preview.addEventListener('click', () => input.click());

      preview.addEventListener('dragover', (e) => { e.preventDefault(); });
      preview.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageFile(file, key);
      });

      input.addEventListener('change', () => {
        if (input.files[0]) handleImageFile(input.files[0], key);
      });

      removeBtn.addEventListener('click', () => {
        delete data.images[key];
        saveData(data);
        updateImagePreview(key);
        toast('Image removed', 'success');
      });
    });
  }

  function compressImage(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round(h * maxWidth / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  async function handleImageFile(file, key) {
    try {
      const compressed = await compressImage(file, 800, 0.7);
      data.images[key] = compressed;
      saveData(data);
      updateImagePreview(key);
      toast('Image uploaded', 'success');
      updateDashboard();
    } catch {
      toast('Failed to upload image. Please try another file.', 'error');
    }
  }

  function updateImagePreview(key) {
    const preview = document.getElementById(`preview-${key}`);
    const removeBtn = document.querySelector(`.btn-remove-img[data-key="${key}"]`);
    if (!preview) return;

    if (data.images[key]) {
      preview.style.backgroundImage = `url(${data.images[key]})`;
      preview.classList.add('has-image');
      if (removeBtn) removeBtn.style.display = 'inline-block';
    } else {
      preview.style.backgroundImage = '';
      preview.classList.remove('has-image');
      if (removeBtn) removeBtn.style.display = 'none';
    }
  }

  // Small image previews (for before/after)
  async function handleSmallImageFile(file, key) {
    try {
      const compressed = await compressImage(file, 600, 0.7);
      data.images[key] = compressed;
      saveData(data);
      updateSmallImagePreview(key);
      toast('Image uploaded', 'success');
      updateDashboard();
    } catch {
      toast('Failed to upload image. Please try another file.', 'error');
    }
  }

  function updateSmallImagePreview(key) {
    const preview = document.querySelector(`.image-preview-small[data-key="${key}"]`);
    if (!preview) return;
    if (data.images[key]) {
      preview.style.backgroundImage = `url(${data.images[key]})`;
      preview.classList.add('has-image');
    } else {
      preview.style.backgroundImage = '';
      preview.classList.remove('has-image');
    }
  }

  // ========================================
  // Landing Page Settings
  // ========================================
  function setupLanding() {
    if (!data.landing) data.landing = getDefaultData().landing;

    document.querySelectorAll('[data-admin-landing]').forEach(input => {
      input.addEventListener('input', () => {
        data.landing[input.dataset.adminLanding] = input.value;
      });
      input.addEventListener('change', () => {
        data.landing[input.dataset.adminLanding] = input.value;
      });
    });
  }

  // ========================================
  // Stats
  // ========================================
  function setupStats() {
    document.querySelectorAll('[data-admin^="stat"]').forEach(input => {
      input.addEventListener('input', () => {
        data.stats[input.dataset.admin] = input.value;
      });
    });
  }

  // ========================================
  // Contact
  // ========================================
  function setupContact() {
    document.querySelectorAll('[data-admin^="contact_"]').forEach(input => {
      input.addEventListener('input', () => {
        data.contact[input.dataset.admin] = input.value;
      });
    });
  }

  // ========================================
  // Social
  // ========================================
  function setupSocial() {
    document.querySelectorAll('[data-admin^="social_"]').forEach(input => {
      input.addEventListener('input', () => {
        data.social[input.dataset.admin] = input.value;
      });
    });
  }

  // ========================================
  // Services
  // ========================================
  function setupServices() {
    document.getElementById('btnAddService').addEventListener('click', () => {
      const id = 's' + Date.now();
      const num = data.services.length + 1;
      const key = 'custom' + num;

      data.services.push({ id, icon: 'fas fa-star', key });

      // Add default translation entries for all languages
      ['en', 'ka', 'ru'].forEach(lang => {
        if (!data.translations[lang]) data.translations[lang] = {};
        data.translations[lang][`services.${key}.title`] = 'New Service';
        data.translations[lang][`services.${key}.desc`] = 'Service description...';
      });

      saveData(data);
      renderServices();
      toast('Service added. Edit its text in the Translations tab.', 'success');
    });
  }

  function renderServices() {
    const container = document.getElementById('servicesList');
    container.innerHTML = '';

    data.services.forEach((svc, idx) => {
      const div = document.createElement('div');
      div.className = 'service-item';
      div.innerHTML = `
        <div class="service-item-header">
          <span class="service-num">${idx + 1}</span>
          <h4>${svc.key}</h4>
          <button class="btn-delete-item" data-id="${svc.id}" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Icon Class</label>
            <input type="text" value="${svc.icon}" data-svc-id="${svc.id}" data-field="icon" />
          </div>
          <div class="form-field">
            <label>Key (read-only for defaults)</label>
            <input type="text" value="${svc.key}" readonly />
          </div>
        </div>
      `;
      container.appendChild(div);

      // Icon edit
      div.querySelector(`[data-field="icon"]`).addEventListener('input', (e) => {
        const s = data.services.find(x => x.id === svc.id);
        if (s) {
          s.icon = e.target.value;
          saveData(data);
        }
      });

      // Delete
      div.querySelector('.btn-delete-item').addEventListener('click', () => {
        if (confirm('Delete this service?')) {
          data.services = data.services.filter(x => x.id !== svc.id);
          saveData(data);
          renderServices();
          toast('Service removed', 'success');
        }
      });
    });

    // Update dashboard count
    const countEl = document.getElementById('dashServiceCount');
    if (countEl) countEl.textContent = data.services.length + ' active';
  }

  // ========================================
  // Results (Before/After)
  // ========================================
  function setupResults() {
    document.getElementById('btnAddResult').addEventListener('click', () => {
      const id = 'r' + Date.now();
      const num = data.results.length + 1;
      const captionKey = `results.case${num}_${Date.now()}`;

      data.results.push({ id, captionKey });

      ['en', 'ka', 'ru'].forEach(lang => {
        if (!data.translations[lang]) data.translations[lang] = {};
        data.translations[lang][captionKey] = 'New case description';
      });

      saveData(data);
      renderResults();
      toast('Case added. Upload photos and edit caption in Translations.', 'success');
    });
  }

  function renderResults() {
    const container = document.getElementById('resultsList');
    container.innerHTML = '';

    data.results.forEach((res, idx) => {
      // Ensure detailBlocks array exists
      if (!res.detailBlocks) res.detailBlocks = [];

      const div = document.createElement('div');
      div.className = 'result-item';
      const beforeKey = `result_${res.id}_before`;
      const afterKey = `result_${res.id}_after`;

      div.innerHTML = `
        <div class="result-item-header">
          <span class="result-num">${idx + 1}</span>
          <h4>Case: ${res.captionKey}</h4>
          <button class="btn-delete-item" data-id="${res.id}" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
        <div class="result-images-row">
          <div class="image-upload-small">
            <div class="image-preview-small" data-key="${beforeKey}">
              <i class="fas fa-cloud-upload-alt"></i>
              <span>Before</span>
            </div>
            <input type="file" accept="image/*" class="file-input" data-key="${beforeKey}" style="display:none;" />
            <span class="upload-label">Before Photo</span>
          </div>
          <div class="image-upload-small">
            <div class="image-preview-small" data-key="${afterKey}">
              <i class="fas fa-cloud-upload-alt"></i>
              <span>After</span>
            </div>
            <input type="file" accept="image/*" class="file-input" data-key="${afterKey}" style="display:none;" />
            <span class="upload-label">After Photo</span>
          </div>
        </div>
        <div class="form-field">
          <label>Caption Key</label>
          <input type="text" value="${res.captionKey}" readonly />
        </div>
        <div class="detail-blocks-section">
          <h5>Detail Page Content</h5>
          <p class="field-help">Add content blocks for the case detail page. Blocks appear in order: image, text, or image with text.</p>
          <div class="detail-blocks-list" data-case-id="${res.id}"></div>
          <div class="detail-blocks-actions">
            <button class="btn-add-block" data-case-id="${res.id}" data-type="image"><i class="fas fa-image"></i> Add Image</button>
            <button class="btn-add-block" data-case-id="${res.id}" data-type="text"><i class="fas fa-font"></i> Add Text</button>
            <button class="btn-add-block" data-case-id="${res.id}" data-type="image_text"><i class="fas fa-photo-video"></i> Add Image + Text</button>
          </div>
        </div>
      `;
      container.appendChild(div);

      // Wire up small image uploads
      [beforeKey, afterKey].forEach(key => {
        const preview = div.querySelector(`.image-preview-small[data-key="${key}"]`);
        const input = div.querySelector(`.file-input[data-key="${key}"]`);
        preview.addEventListener('click', () => input.click());
        preview.addEventListener('dragover', (e) => e.preventDefault());
        preview.addEventListener('drop', (e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) handleSmallImageFile(file, key);
        });
        input.addEventListener('change', () => {
          if (input.files[0]) handleSmallImageFile(input.files[0], key);
        });
        // Restore existing image
        updateSmallImagePreview(key);
      });

      // Delete case
      div.querySelector('.btn-delete-item').addEventListener('click', () => {
        if (confirm('Delete this case?')) {
          // Clean up images (before/after + detail block images)
          delete data.images[beforeKey];
          delete data.images[afterKey];
          if (res.detailBlocks) {
            res.detailBlocks.forEach(block => {
              if (block.imageKey) delete data.images[block.imageKey];
            });
          }
          data.results = data.results.filter(x => x.id !== res.id);
          saveData(data);
          renderResults();
          toast('Case removed', 'success');
        }
      });

      // Wire up add block buttons
      div.querySelectorAll('.btn-add-block').forEach(btn => {
        btn.addEventListener('click', () => {
          const caseId = btn.dataset.caseId;
          const type = btn.dataset.type;
          const caseObj = data.results.find(r => r.id === caseId);
          if (!caseObj) return;
          if (!caseObj.detailBlocks) caseObj.detailBlocks = [];

          const blockIdx = caseObj.detailBlocks.length;
          const block = { type };

          if (type === 'image' || type === 'image_text') {
            block.imageKey = `case_${caseId}_img_${blockIdx}_${Date.now()}`;
          }
          if (type === 'text' || type === 'image_text') {
            block.textKey = `case_${caseId}_txt_${blockIdx}_${Date.now()}`;
            ['en', 'ka', 'ru'].forEach(lang => {
              if (!data.translations[lang]) data.translations[lang] = {};
              data.translations[lang][block.textKey] = '';
            });
          }

          caseObj.detailBlocks.push(block);
          saveData(data);
          renderDetailBlocks(caseObj, div.querySelector(`.detail-blocks-list[data-case-id="${caseId}"]`));
          toast('Block added', 'success');
        });
      });

      // Render existing detail blocks
      renderDetailBlocks(res, div.querySelector(`.detail-blocks-list[data-case-id="${res.id}"]`));
    });

    const countEl = document.getElementById('dashResultCount');
    if (countEl) countEl.textContent = data.results.length + ' cases';
  }

  function renderDetailBlocks(caseObj, container) {
    if (!container) return;
    container.innerHTML = '';

    if (!caseObj.detailBlocks || caseObj.detailBlocks.length === 0) {
      container.innerHTML = '<p class="detail-empty">No content blocks yet. Add blocks below.</p>';
      return;
    }

    caseObj.detailBlocks.forEach((block, blockIdx) => {
      const blockEl = document.createElement('div');
      blockEl.className = 'detail-block-item';

      let typeLabel = '';
      let typeIcon = '';
      if (block.type === 'image') { typeLabel = 'Image'; typeIcon = 'fa-image'; }
      else if (block.type === 'text') { typeLabel = 'Text'; typeIcon = 'fa-font'; }
      else if (block.type === 'image_text') { typeLabel = 'Image + Text'; typeIcon = 'fa-photo-video'; }

      blockEl.innerHTML = `
        <div class="detail-block-header">
          <span class="detail-block-num"><i class="fas ${typeIcon}"></i></span>
          <span class="detail-block-type">${typeLabel}</span>
          <div class="detail-block-controls">
            <button class="btn-block-move" data-dir="up" title="Move up"><i class="fas fa-arrow-up"></i></button>
            <button class="btn-block-move" data-dir="down" title="Move down"><i class="fas fa-arrow-down"></i></button>
            <button class="btn-block-delete" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <div class="detail-block-body"></div>
      `;

      const body = blockEl.querySelector('.detail-block-body');

      // Image upload
      if (block.type === 'image' || block.type === 'image_text') {
        const imgUpload = document.createElement('div');
        imgUpload.className = 'image-upload-small';
        imgUpload.innerHTML = `
          <div class="image-preview-small detail-block-img" data-key="${block.imageKey}">
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Upload</span>
          </div>
          <input type="file" accept="image/*" class="file-input" style="display:none;" />
        `;
        body.appendChild(imgUpload);

        const preview = imgUpload.querySelector('.image-preview-small');
        const input = imgUpload.querySelector('.file-input');
        preview.addEventListener('click', () => input.click());
        preview.addEventListener('dragover', (e) => e.preventDefault());
        preview.addEventListener('drop', (e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) handleSmallImageFile(file, block.imageKey);
        });
        input.addEventListener('change', () => {
          if (input.files[0]) handleSmallImageFile(input.files[0], block.imageKey);
        });
        updateSmallImagePreview(block.imageKey);
      }

      // Text input
      if (block.type === 'text' || block.type === 'image_text') {
        const textField = document.createElement('div');
        textField.className = 'form-field detail-block-text-field';
        const currentLangText = (data.translations.en && data.translations.en[block.textKey]) || '';
        textField.innerHTML = `
          <label>Text (English) — key: <code>${block.textKey}</code></label>
          <textarea rows="3" data-tkey="${block.textKey}">${escapeHtml(currentLangText)}</textarea>
          <span class="field-hint">Edit other languages in the Translations tab.</span>
        `;
        body.appendChild(textField);

        textField.querySelector('textarea').addEventListener('input', (e) => {
          if (!data.translations.en) data.translations.en = {};
          data.translations.en[block.textKey] = e.target.value;
        });
      }

      // Move up
      blockEl.querySelector('.btn-block-move[data-dir="up"]').addEventListener('click', () => {
        if (blockIdx === 0) return;
        const arr = caseObj.detailBlocks;
        [arr[blockIdx - 1], arr[blockIdx]] = [arr[blockIdx], arr[blockIdx - 1]];
        saveData(data);
        renderDetailBlocks(caseObj, container);
      });

      // Move down
      blockEl.querySelector('.btn-block-move[data-dir="down"]').addEventListener('click', () => {
        if (blockIdx === caseObj.detailBlocks.length - 1) return;
        const arr = caseObj.detailBlocks;
        [arr[blockIdx], arr[blockIdx + 1]] = [arr[blockIdx + 1], arr[blockIdx]];
        saveData(data);
        renderDetailBlocks(caseObj, container);
      });

      // Delete
      blockEl.querySelector('.btn-block-delete').addEventListener('click', () => {
        if (confirm('Delete this content block?')) {
          if (block.imageKey) delete data.images[block.imageKey];
          caseObj.detailBlocks.splice(blockIdx, 1);
          saveData(data);
          renderDetailBlocks(caseObj, container);
          toast('Block removed', 'success');
        }
      });

      container.appendChild(blockEl);
    });
  }

  // ========================================
  // Translations
  // ========================================
  function setupTranslations() {
    document.querySelectorAll('.lang-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTransLang = tab.dataset.tlang;
        renderTranslations();
      });
    });
  }

  async function renderTranslations() {
    const container = document.getElementById('translationFields');
    container.innerHTML = '<p style="color:#999;">Loading...</p>';

    const defaults = await loadLangFile(currentTransLang);
    const overrides = data.translations[currentTransLang] || {};
    container.innerHTML = '';

    for (const [section, keys] of Object.entries(TRANSLATION_SECTIONS)) {
      const group = document.createElement('div');
      group.className = 'translation-group';
      group.innerHTML = `<h4>${section}</h4>`;

      keys.forEach(key => {
        const currentVal = overrides[key] !== undefined ? overrides[key] : (defaults[key] || '');
        const isLong = currentVal.length > 80 || key.includes('desc') || key.includes('description');

        const field = document.createElement('div');
        field.className = 'translation-field';
        field.innerHTML = `
          <label>${key}</label>
          ${isLong
            ? `<textarea data-tkey="${key}">${escapeHtml(currentVal)}</textarea>`
            : `<input type="text" data-tkey="${key}" value="${escapeAttr(currentVal)}" />`
          }
        `;
        group.appendChild(field);

        const input = field.querySelector('[data-tkey]');
        input.addEventListener('input', () => {
          if (!data.translations[currentTransLang]) data.translations[currentTransLang] = {};
          data.translations[currentTransLang][key] = input.value;
        });
      });

      container.appendChild(group);
    }

    // Also add any custom service/result keys
    const customKeys = Object.keys(overrides).filter(k => !Object.values(TRANSLATION_SECTIONS).flat().includes(k));
    if (customKeys.length > 0) {
      const group = document.createElement('div');
      group.className = 'translation-group';
      group.innerHTML = '<h4>Custom Entries</h4>';

      customKeys.forEach(key => {
        const val = overrides[key] || '';
        const field = document.createElement('div');
        field.className = 'translation-field';
        field.innerHTML = `
          <label>${key}</label>
          <input type="text" data-tkey="${key}" value="${escapeAttr(val)}" />
        `;
        group.appendChild(field);

        field.querySelector('[data-tkey]').addEventListener('input', (e) => {
          data.translations[currentTransLang][key] = e.target.value;
        });
      });

      container.appendChild(group);
    }
  }

  // ========================================
  // Settings
  // ========================================
  function setupSettings() {
    // Change password
    document.getElementById('btnChangePassword').addEventListener('click', () => {
      const curr = document.getElementById('currentPassword').value;
      const newP = document.getElementById('newPassword').value;
      const conf = document.getElementById('confirmPassword').value;
      const msg = document.getElementById('passwordMsg');

      const stored = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
      if (curr !== stored) {
        msg.textContent = 'Current password is incorrect.';
        msg.style.color = '#dc3545';
        return;
      }
      if (newP.length < 4) {
        msg.textContent = 'New password must be at least 4 characters.';
        msg.style.color = '#dc3545';
        return;
      }
      if (newP !== conf) {
        msg.textContent = 'New passwords do not match.';
        msg.style.color = '#dc3545';
        return;
      }
      localStorage.setItem(PASSWORD_KEY, newP);
      msg.textContent = 'Password changed successfully!';
      msg.style.color = '#28a745';
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    });

    // Export
    document.getElementById('btnExport').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'admin_data_backup.json';
      a.click();
      URL.revokeObjectURL(url);
      toast('Data exported successfully', 'success');
    });

    // Import
    document.getElementById('btnImport').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          // Validate required structure
          if (!imported.images || !imported.translations || !imported.services || !imported.results) {
            toast('Invalid backup file: missing required fields.', 'error');
            return;
          }
          data = imported;
          saveData(data);
          populateAll();
          toast('Data imported successfully! Reload the page to see all changes.', 'success');
        } catch {
          toast('Invalid JSON file', 'error');
        }
      };
      reader.readAsText(file);
    });

    // Reset
    document.getElementById('btnReset').addEventListener('click', () => {
      if (confirm('Are you sure? This will delete ALL admin data including uploaded images.')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PASSWORD_KEY);
        data = getDefaultData();
        populateAll();
        toast('All data has been reset to defaults', 'success');
      }
    });
  }

  // ========================================
  // Save All
  // ========================================
  function setupSaveButton() {
    document.getElementById('btnSaveAll').addEventListener('click', () => {
      saveData(data);
      toast('All changes saved!', 'success');
    });
  }

  // ========================================
  // Populate All Fields from Data
  // ========================================
  function populateAll() {
    // Stats
    Object.entries(data.stats).forEach(([key, val]) => {
      const input = document.querySelector(`[data-admin="${key}"]`);
      if (input) input.value = val || '';
    });

    // Contact
    Object.entries(data.contact).forEach(([key, val]) => {
      const input = document.querySelector(`[data-admin="${key}"]`);
      if (input) input.value = val || '';
    });

    // Social
    Object.entries(data.social).forEach(([key, val]) => {
      const input = document.querySelector(`[data-admin="${key}"]`);
      if (input) input.value = val || '';
    });

    // Landing
    if (data.landing) {
      Object.entries(data.landing).forEach(([key, val]) => {
        const input = document.querySelector(`[data-admin-landing="${key}"]`);
        if (input) input.value = val || '';
      });
    }

    // Images
    ['hero_photo', 'about_photo'].forEach(key => updateImagePreview(key));

    // Services
    renderServices();

    // Results
    renderResults();

    // Translations
    renderTranslations();

    // Dashboard
    updateDashboard();
  }

  function updateDashboard() {
    const imgCount = Object.keys(data.images).length;
    const el = document.getElementById('dashImageCount');
    if (el) el.textContent = imgCount + ' uploaded';
  }

  // ========================================
  // Toast
  // ========================================
  function toast(message, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.className = 'toast ' + type;
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => el.classList.remove('show'), 3000);
  }

  // ========================================
  // Utilities
  // ========================================
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
