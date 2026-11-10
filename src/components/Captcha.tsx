import { useEffect, useRef } from 'react';
import { config } from '../config';

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; remove: (id: string) => void };
  }
}

const SITE_KEY = config.turnstileSiteKey;
const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** Cloudflare Turnstile widget. Renders nothing when VITE_TURNSTILE_SITE_KEY is not set (local development). */
export function Captcha({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let widgetId: string | undefined;
    const mount = () => {
      if (ref.current && window.turnstile) widgetId = window.turnstile.render(ref.current, { sitekey: SITE_KEY, callback: onToken });
    };
    if (window.turnstile) mount();
    else {
      const s = document.createElement('script');
      s.src = SCRIPT; s.async = true; s.onload = mount;
      document.head.appendChild(s);
    }
    return () => { if (widgetId && window.turnstile) window.turnstile.remove(widgetId); };
  }, [onToken]);

  return SITE_KEY ? <div ref={ref} style={{ marginBottom: '1rem' }} /> : null;
}
