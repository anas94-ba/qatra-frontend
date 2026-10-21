import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { TextField } from '../../components/Field';
import { ErrorNotice } from '../../components/State';
import { landingPath, useAuth } from './AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await login(email, password);
      // The server decides where the user lands; a saved path only applies to dashboards
      navigate(session.landing === 'DASHBOARD' && from ? from : landingPath(session), { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h1>تسجيل الدخول</h1>
      {error != null && <ErrorNotice error={error} />}
      <div style={{ marginTop: '1rem' }}>
        <TextField label="البريد الإلكتروني" type="email" dir="ltr" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="كلمة المرور" type="password" dir="ltr" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" loading={busy} style={{ width: '100%' }}>دخول</Button>
      <div className="row between small" style={{ marginTop: '1rem' }}>
        <Link to="/forgot-password">نسيت كلمة المرور؟</Link>
        <Link to="/register">تسجيل جديد</Link>
      </div>
    </form>
  );
}
