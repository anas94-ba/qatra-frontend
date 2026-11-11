import { getLang, LANGS, setLang, useLang, type Lang } from './index';

/** One-click toggle between Arabic and English (the app remounts its routes so every string updates) */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const lang = useLang();
  const next: Lang = lang === 'ar' ? 'en' : 'ar';
  return (
    <button
      type="button"
      className={`btn ghost sm lang-switch ${className}`.trim()}
      onClick={() => setLang(next)}
      lang={next}
      aria-label={next === 'en' ? 'Switch to English' : 'التبديل إلى العربية'}
      title={next === 'en' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      🌐 {LANGS[next].label}
    </button>
  );
}

export { getLang };
