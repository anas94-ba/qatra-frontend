const ACCESS = 'qatra.access';
const REFRESH = 'qatra.refresh';

/**
 * Tokens live in localStorage for simplicity. Trade-off: readable by injected scripts (XSS),
 * so the app never renders raw HTML. Consider httpOnly cookies if the API gains cookie support.
 */
export const tokenStore = {
  get access(): string | null { return localStorage.getItem(ACCESS); },
  get refresh(): string | null { return localStorage.getItem(REFRESH); },
  set(access: string, refresh: string): void {
    localStorage.setItem(ACCESS, access);
    localStorage.setItem(REFRESH, refresh);
  },
  clear(): void {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};
