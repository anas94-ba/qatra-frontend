import { applyDocument, getLang, setLang, t } from './index';

afterEach(() => setLang('ar'));

describe('t()', () => {
  it('returns the Arabic key in Arabic', () => {
    setLang('ar');
    expect(t('تسجيل الدخول')).toBe('تسجيل الدخول');
  });

  it('translates to English and falls back to the Arabic text when a key is missing', () => {
    setLang('en');
    expect(t('تسجيل الدخول')).toBe('Log in');
    expect(t('نص غير مترجم')).toBe('نص غير مترجم');
  });

  it('fills positional placeholders in both languages', () => {
    setLang('ar');
    expect(t('صفحة {0} من {1}', [2, 5])).toBe('صفحة 2 من 5');
    setLang('en');
    expect(t('صفحة {0} من {1}', [2, 5])).toBe('Page 2 of 5');
  });

  it('keeps a placeholder when its argument is missing', () => {
    setLang('en');
    expect(t('صفحة {0} من {1}', [2])).toBe('Page 2 of {1}');
  });
});

describe('language switching', () => {
  it('updates <html lang dir> and persists the choice', () => {
    setLang('en');
    expect(getLang()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(localStorage.getItem('qatra.lang')).toBe('en');
    setLang('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('sets the tab title per language', () => {
    applyDocument('en');
    expect(document.title).toBe('Qatra');
    applyDocument('ar');
    expect(document.title).toBe('قطرة');
  });
});
