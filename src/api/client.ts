import { config } from '../config';
import { tokenStore } from './tokens';

export const API_URL: string = config.apiUrl;
export const AUTH_LOST_EVENT = 'qatra:auth-lost';

/** Error thrown for every non-2xx response, with the backend message flattened to one string */
export class ApiError extends Error {
  constructor(public status: number, message: string, public payload?: unknown) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;
interface Options { method?: string; body?: unknown; query?: Query; form?: FormData; auth?: boolean }

export function buildQuery(params?: Query): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : '';
}

function messageOf(status: number, payload: unknown): string {
  const p = payload as { message?: string | string[]; errors?: string[] } | null;
  if (p?.errors?.length) return p.errors.join(' • ');
  if (Array.isArray(p?.message)) return p.message.join(' • ');
  if (typeof p?.message === 'string') return p.message;
  if (status === 429) return 'محاولات كثيرة، حاول لاحقًا';
  return 'حدث خطأ غير متوقع';
}

let refreshing: Promise<boolean> | null = null;

/** One refresh request at a time; returns false when the session cannot be renewed */
async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;
  refreshing ??= fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      tokenStore.set(data.accessToken, data.refreshToken);
      return true;
    })
    .catch(() => false)
    .finally(() => { refreshing = null; });
  return refreshing;
}

async function send(path: string, opts: Options): Promise<Response> {
  const headers: Record<string, string> = {};
  if (opts.auth !== false && tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(`${API_URL}${path}${buildQuery(opts.query)}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
  });
}

export async function request<T>(path: string, opts: Options = {}): Promise<T> {
  let res = await send(path, opts);
  if (res.status === 401 && opts.auth !== false && tokenStore.refresh) {
    if (await refreshTokens()) res = await send(path, opts);
    else {
      tokenStore.clear();
      window.dispatchEvent(new Event(AUTH_LOST_EVENT));
    }
  }
  const text = await res.text();
  const payload: unknown = text ? safeJson(text) : null;
  if (!res.ok) throw new ApiError(res.status, messageOf(res.status, payload), payload);
  return payload as T;
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

/** Downloads a CSV export through the authenticated client */
export async function downloadCsv(path: string, query: Query, filename: string): Promise<void> {
  let res = await send(path, { query });
  if (res.status === 401 && (await refreshTokens())) res = await send(path, { query });
  if (!res.ok) throw new ApiError(res.status, 'تعذّر تصدير الملف');
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>(path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ?? {} }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: body ?? {} }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ?? {} }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', form }),
  public: <T>(path: string, query?: Query) => request<T>(path, { query, auth: false }),
};
