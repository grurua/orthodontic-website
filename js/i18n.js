/**
 * Internationalization (i18n) module
 * Supports: English (en), Georgian (ka), Russian (ru)
 * Merges admin translation overrides from localStorage.
 */
const I18n = (() => {
  const cache = {};
  let currentLang = localStorage.getItem('lang') || 'en';

  function getAdminOverrides(lang) {
    try {
      const raw = localStorage.getItem('admin_data');
      if (!raw) return {};
      const data = JSON.parse(raw);
      return (data.translations && data.translations[lang]) || {};
    } catch {
      return {};
    }
  }

  async function loadLanguage(lang) {
    if (cache[lang]) return cache[lang];
    try {
      const response = await fetch(`lang/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}`);
      const base = await response.json();
      // Merge admin overrides on top of defaults
      const overrides = getAdminOverrides(lang);
      cache[lang] = { ...base, ...overrides };
      return cache[lang];
    } catch (err) {
      console.error(`i18n: Could not load language "${lang}"`, err);
      // Still try to return overrides even if file fails
      const overrides = getAdminOverrides(lang);
      if (Object.keys(overrides).length > 0) {
        cache[lang] = overrides;
        return cache[lang];
      }
      return null;
    }
  }

  async function setLanguage(lang) {
    // Clear cache to pick up any new admin overrides
    delete cache[lang];
    const translations = await loadLanguage(lang);
    if (!translations) return;

    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translations[key];
        } else if (el.tagName === 'LABEL') {
          el.textContent = translations[key];
        } else {
          el.innerHTML = translations[key];
        }
      }
    });

    // Update active button
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update page title
    const logoText = translations['logo'] || 'Dr. Smile';
    document.title = `${logoText} — ${translations['nav.home'] || 'Orthodontist'}`;
  }

  function getCurrentLang() {
    return currentLang;
  }

  function init() {
    // Bind language buttons
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
      });
    });

    // Load saved or default language
    setLanguage(currentLang);
  }

  return { init, setLanguage, getCurrentLang };
})();

document.addEventListener('DOMContentLoaded', I18n.init);
