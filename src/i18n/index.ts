import { useSyncExternalStore } from 'react';
import { en } from './en';

export type Lang = 'ar' | 'en';

const STORAGE_KEY = 'qatra.lang';
export const LANGS: Record<Lang, { label: string; dir: 'rtl' | 'ltr' }> = {
  ar: { label: 'عربي', dir: 'rtl' },
  en: { label: 'English', dir: 'ltr' },
};

function readSaved(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

let current: Lang = readSaved();
const listeners = new Set<() => void>();

export const getLang = (): Lang => current;
export const isRtl = (): boolean => LANGS[current].dir === 'rtl';

/** Keeps <html lang dir> and the tab title in sync with the language */
export function applyDocument(lang: Lang = current): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = LANGS[lang].dir;
  document.title = lang === 'en' ? 'Qatra' : 'قطرة';
}

export function setLang(lang: Lang): void {
  if (lang === current) return;
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode: the choice just will not persist */
  }
  applyDocument(lang);
  listeners.forEach((l) => l());
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    getLang,
  );
}

/** Replaces {0}, {1}... with the given arguments */
function interpolate(text: string, args?: ReadonlyArray<unknown>): string {
  return args ? text.replace(/\{(\d+)\}/g, (m, i) => (args[Number(i)] === undefined ? m : String(args[Number(i)]))) : text;
}

/**
 * Translate. The Arabic source text is the key: Arabic returns it as is, English looks it up in `en`
 * and falls back to the Arabic text when a translation is missing (see the coverage test).
 *   t('تسجيل الدخول')                      -> "Log in"
 *   t('صفحة {0} من {1}', [page, total])    -> "Page 2 of 5"
 */
export function t(key: string, args?: ReadonlyArray<unknown>): string {
  return interpolate(current === 'en' ? (en[key] ?? key) : key, args);
}

applyDocument();
