import { resolveConfig } from './runtimeConfig';

describe('resolveConfig', () => {
  it('prefers the runtime value written at container start', () => {
    expect(resolveConfig({ API_URL: 'https://api.runtime.org/api' }, { VITE_API_URL: 'https://api.build.org/api' }).apiUrl).toBe('https://api.runtime.org/api');
  });

  it('falls back to the build-time value, then to localhost', () => {
    expect(resolveConfig({ API_URL: '' }, { VITE_API_URL: 'https://api.build.org/api' }).apiUrl).toBe('https://api.build.org/api');
    expect(resolveConfig(undefined, {}).apiUrl).toBe('http://localhost:4000/api');
  });

  it('removes trailing slashes and ignores whitespace', () => {
    expect(resolveConfig({ API_URL: '  https://api.x.org/api/// ' }, {}).apiUrl).toBe('https://api.x.org/api');
  });

  it('reads the CAPTCHA site key from the same sources', () => {
    expect(resolveConfig({ TURNSTILE_SITE_KEY: 'rt' }, { VITE_TURNSTILE_SITE_KEY: 'bt' }).turnstileSiteKey).toBe('rt');
    expect(resolveConfig({}, { VITE_TURNSTILE_SITE_KEY: 'bt' }).turnstileSiteKey).toBe('bt');
    expect(resolveConfig({}, {}).turnstileSiteKey).toBeUndefined();
  });
});
