export interface RuntimeEnv {
  API_URL?: string;
  TURNSTILE_SITE_KEY?: string;
}

export interface AppConfig {
  apiUrl: string;
  turnstileSiteKey: string | undefined;
}

const DEFAULT_API_URL = 'http://localhost:4000/api';

const clean = (value: string | undefined): string | undefined => value?.trim() || undefined;

/**
 * Where each setting comes from, in priority order:
 *  1. window.__ENV__  - written at container start from the container's environment (.env via env_file)
 *  2. import.meta.env - values baked in at build time (npm run dev reads .env; static hosts build with env vars)
 *  3. a local default
 * A trailing slash is removed so paths can always be appended as "/auth/login".
 */
export function resolveConfig(runtime: RuntimeEnv | undefined, build: { VITE_API_URL?: string; VITE_TURNSTILE_SITE_KEY?: string }): AppConfig {
  const apiUrl = clean(runtime?.API_URL) ?? clean(build.VITE_API_URL) ?? DEFAULT_API_URL;
  return {
    apiUrl: apiUrl.replace(/\/+$/, ''),
    turnstileSiteKey: clean(runtime?.TURNSTILE_SITE_KEY) ?? clean(build.VITE_TURNSTILE_SITE_KEY),
  };
}
