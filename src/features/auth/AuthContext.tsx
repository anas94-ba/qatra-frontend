import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, AUTH_LOST_EVENT, request } from '../../api/client';
import { tokenStore } from '../../api/tokens';
import type { LoginResponse, Role, Session } from '../../api/types';

interface AuthState {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Session>;
  logout: () => Promise<void>;
  /** Re-reads /auth/me, e.g. after approval or email verification */
  reload: () => Promise<Session | null>;
}

const Ctx = createContext<AuthState | null>(null);

/** Where each landing state sends the user after login (decided by the server) */
export function landingPath(session: Session): string {
  switch (session.landing) {
    case 'EMAIL_VERIFY': return '/status/verify';
    case 'PENDING': return '/status/pending';
    case 'REJECTED': return '/status/rejected';
    case 'SUSPENDED': return '/status/suspended';
    default: return homeFor(session.user.role);
  }
}

export const homeFor = (role: Role): string => ({ ADMIN: '/admin', ORG: '/org', CAMP_REP: '/camp' })[role];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!tokenStore.access);
  const queryClient = useQueryClient();

  const reload = useCallback(async () => {
    if (!tokenStore.access) { setSession(null); return null; }
    try {
      const s = await api.get<Session>('/auth/me');
      setSession(s);
      return s;
    } catch {
      setSession(null);
      return null;
    }
  }, []);

  useEffect(() => { reload().finally(() => setLoading(false)); }, [reload]);

  // The API client emits this when a refresh fails: drop the session everywhere
  useEffect(() => {
    const onLost = () => { setSession(null); queryClient.clear(); };
    window.addEventListener(AUTH_LOST_EVENT, onLost);
    return () => window.removeEventListener(AUTH_LOST_EVENT, onLost);
  }, [queryClient]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await request<LoginResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false });
    tokenStore.set(data.accessToken, data.refreshToken);
    const next: Session = { user: data.user, landing: data.landing, landingData: data.landingData };
    queryClient.clear();
    setSession(next);
    return next;
  }, [queryClient]);

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.refresh;
    if (refreshToken) await api.post('/auth/logout', { refreshToken }).catch(() => undefined);
    tokenStore.clear();
    queryClient.clear();
    setSession(null);
  }, [queryClient]);

  const value = useMemo(() => ({ session, loading, login, logout, reload }), [session, loading, login, logout, reload]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
