import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { Spinner } from '../../components/State';

type State = { kind: 'loading' } | { kind: 'ok'; message: string } | { kind: 'error'; message: string };

/** Opened from the email link: /verify-email?token=... */
export function VerifyEmailPage() {
  const token = useSearchParams()[0].get('token');
  const [state, setState] = useState<State>(token ? { kind: 'loading' } : { kind: 'error', message: 'الرابط غير صالح' });
  // The token is single-use, so guard against React StrictMode running the effect twice
  const sent = useRef(false);

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    api.post<{ message: string }>('/auth/verify-email', { token })
      .then((r) => setState({ kind: 'ok', message: r.message }))
      .catch((e: Error) => setState({ kind: 'error', message: e.message }));
  }, [token]);

  if (state.kind === 'loading') return <Spinner />;
  return (
    <div className="stack">
      <h1>تأكيد البريد الإلكتروني</h1>
      <div className={`notice ${state.kind === 'ok' ? 'ok' : 'danger'}`}>{state.message}</div>
      <Link to="/login">تسجيل الدخول</Link>
    </div>
  );
}
