import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Button } from '../../components/Button';
import { TextField } from '../../components/Field';
import { ErrorNotice } from '../../components/State';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // The API answers identically whether or not the email exists
      setMessage((await api.post<{ message: string }>('/auth/forgot-password', { email })).message);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h1>نسيت كلمة المرور</h1>
      {error != null && <ErrorNotice error={error} />}
      {message ? (
        <div className="notice ok">{message}</div>
      ) : (
        <>
          <TextField label="البريد الإلكتروني" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" loading={busy} style={{ width: '100%' }}>إرسال رابط إعادة التعيين</Button>
        </>
      )}
      <p style={{ marginTop: '1rem' }}><Link to="/login">العودة لتسجيل الدخول</Link></p>
    </form>
  );
}
