import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { Button } from '../../components/Button';
import { TextField } from '../../components/Field';
import { ErrorNotice } from '../../components/State';

/** Serves both "forgot password" links and the set-password link for admin-created accounts */
export function ResetPasswordPage() {
  const token = useSearchParams()[0].get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ message: string }>('/auth/reset-password', { token, newPassword: password, newPasswordConfirm: confirm });
      setMessage(res.message);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  if (!token) return <div className="notice danger">الرابط غير صالح</div>;
  return (
    <form onSubmit={submit}>
      <h1>تعيين كلمة المرور</h1>
      {error != null && <ErrorNotice error={error} />}
      {message ? (
        <div className="notice ok">{message}</div>
      ) : (
        <>
          <TextField label="كلمة المرور الجديدة" type="password" dir="ltr" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          <TextField label="تأكيد كلمة المرور" type="password" dir="ltr" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <Button type="submit" loading={busy} style={{ width: '100%' }}>حفظ</Button>
        </>
      )}
      <p style={{ marginTop: '1rem' }}><Link to="/login">تسجيل الدخول</Link></p>
    </form>
  );
}
