/// <reference types="vite/client" />

/** vite-imagetools: `?...&as=srcset` gives a ready-to-use srcset string, `?...&format=webp` a URL */
declare module '*as=srcset' {
  const srcset: string;
  export default srcset;
}
declare module '*format=webp' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** Written by /env-config.js (generated at container start in Docker; empty in development) */
  __ENV__?: { API_URL?: string; TURNSTILE_SITE_KEY?: string };
}
