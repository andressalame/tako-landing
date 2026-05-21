/* Tako i18n engine
   ---
   - 4 locales: en (default/fallback), es, zh (Traditional), vi
   - Auto-detect from navigator.language ONLY on first visit
   - Manual override persists in localStorage('tako_lang')
   - Applies translations to elements with [data-i18n="path.to.key"]
   - For HTML content (with inline tags), set data-i18n-html="true"
   - For attribute targets (meta, title), set data-i18n-attr="attrName"
*/

const TAKO_I18N = {
  SUPPORTED: ['en', 'es', 'zh', 'vi'],
  DEFAULT: 'en',
  STORAGE_KEY: 'tako_lang',

  FLAGS: {
    en: { flag: '🇺🇸', code: 'EN', label: 'English' },
    es: { flag: '🇪🇸', code: 'ES', label: 'Español' },
    zh: { flag: '🇭🇰', code: '繁中', label: '繁體中文' },
    vi: { flag: '🇻🇳', code: 'VI', label: 'Tiếng Việt' }
  },

  // Maps various BCP-47 language tags to our supported codes
  detect() {
    // 1. If user has chosen manually before, respect that
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored && this.SUPPORTED.includes(stored)) return stored;

    // 2. Otherwise sniff browser preferences in order
    const candidates = navigator.languages || [navigator.language || ''];
    for (const raw of candidates) {
      const tag = (raw || '').toLowerCase();
      // Traditional Chinese — be careful here. Map zh-TW, zh-HK, zh-Hant
      // to our 'zh' (which IS Traditional). DO NOT map zh-CN (Simplified).
      if (tag.startsWith('zh-tw') || tag.startsWith('zh-hk') || tag.includes('hant')) return 'zh';
      // Simplified Chinese users: we don't have a Simplified locale yet,
      // so they fall through to English (per Andrés decision: HK flag, Traditional only)
      if (tag.startsWith('vi')) return 'vi';
      if (tag.startsWith('es')) return 'es';
      if (tag.startsWith('en')) return 'en';
    }
    return this.DEFAULT;
  },

  // Drill into nested JSON: get(obj, 'pillars.dex.title')
  get(obj, path) {
    return path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined) ? acc[k] : null, obj);
  },

  async load(lang) {
    try {
      const res = await fetch(`assets/i18n/${lang}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error('locale fetch failed');
      return await res.json();
    } catch (e) {
      console.warn('i18n load failed for', lang, '— falling back to', this.DEFAULT);
      if (lang !== this.DEFAULT) {
        const res = await fetch(`assets/i18n/${this.DEFAULT}.json`);
        return await res.json();
      }
      return {};
    }
  },

  apply(dict, lang) {
    // Set <html lang> for accessibility / SEO
    document.documentElement.lang = (lang === 'zh') ? 'zh-Hant' : lang;

    // Walk every element with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = this.get(dict, key);
      if (value == null) return; // missing key — leave English fallback in place

      const attrTarget = el.getAttribute('data-i18n-attr');
      const isHtml = el.getAttribute('data-i18n-html') === 'true';

      if (attrTarget) {
        el.setAttribute(attrTarget, value);
      } else if (isHtml) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });

    // Update the language switcher UI
    const meta = this.FLAGS[lang] || this.FLAGS[this.DEFAULT];
    const flagEl = document.getElementById('currentFlag');
    const codeEl = document.getElementById('currentCode');
    if (flagEl) flagEl.textContent = meta.flag;
    if (codeEl) codeEl.textContent = meta.code;

    // Mark the active option in the menu
    document.querySelectorAll('.lang-switcher__menu [data-lang]').forEach(btn => {
      btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
    });
  },

  async setLang(lang, { persist = true } = {}) {
    if (!this.SUPPORTED.includes(lang)) lang = this.DEFAULT;
    if (persist) localStorage.setItem(this.STORAGE_KEY, lang);
    const dict = await this.load(lang);
    this.apply(dict, lang);
  },

  initSwitcher() {
    const btn = document.querySelector('.lang-switcher__btn');
    const menu = document.querySelector('.lang-switcher__menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lang-switcher')) {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    menu.querySelectorAll('[data-lang]').forEach(option => {
      option.addEventListener('click', async () => {
        const lang = option.getAttribute('data-lang');
        await this.setLang(lang, { persist: true });
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  },

  async init() {
    const lang = this.detect();
    // Don't persist on auto-detect — only persist if the user explicitly chose
    await this.setLang(lang, { persist: false });
    this.initSwitcher();
  }
};

document.addEventListener('DOMContentLoaded', () => TAKO_I18N.init());
