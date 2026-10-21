import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { EntityType } from '../../api/types';
import { Button } from '../../components/Button';
import { Captcha } from '../../components/Captcha';
import { TextField } from '../../components/Field';
import { ErrorNotice } from '../../components/State';
import { ENTITY_TYPES } from '../../lib/labels';
import { ResendVerification } from './ResendVerification';
import { emptyValues, EntityFields, toPayload, type EntityValues } from './registrationForm';

export function RegisterPage() {
  const [type, setType] = useState<EntityType | null>(null);
  const [values, setValues] = useState<EntityValues>(emptyValues());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>();
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ emailSent: boolean } | null>(null);
  const onToken = useCallback((t: string) => setCaptchaToken(t), []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!type) return;
    setBusy(true);
    setError(null);
    try {
      // role and status are never sent: the server decides them
      const res = await api.post<{ emailSent: boolean }>('/auth/register', {
        entityType: type, ...toPayload(type, values), email, password, passwordConfirm: confirm, privacyAccepted: privacy, captchaToken,
      });
      setDone(res);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="stack">
        <h1>تم إنشاء الحساب</h1>
        <div className="notice ok">أكّد بريدك الإلكتروني عبر الرابط الذي أُرسل إليك ليدخل طلبك قائمة مراجعة الأدمن.</div>
        {!done.emailSent && <div className="notice warn">تعذّر إرسال البريد حاليًا، يمكنك إعادة الإرسال أدناه.</div>}
        <ResendVerification email={email} />
        <Link to="/login">الذهاب لتسجيل الدخول</Link>
      </div>
    );
  }

  if (!type) {
    return (
      <div className="stack">
        <h1>تسجيل جديد</h1>
        <p className="muted">اختر نوع الجهة التي تسجّلها:</p>
        <div className="grid cols-2">
          {ENTITY_TYPES.map((t) => (
            <button key={t.value} type="button" className="card" style={{ cursor: 'pointer', font: 'inherit' }} onClick={() => setType(t.value)}>
              <strong>{t.label}</strong>
            </button>
          ))}
        </div>
        <Link to="/login" className="small">لدي حساب بالفعل</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="row between">
        <h1>تسجيل {ENTITY_TYPES.find((t) => t.value === type)?.label}</h1>
        <Button type="button" variant="ghost" small onClick={() => setType(null)}>تغيير النوع</Button>
      </div>
      {error != null && <ErrorNotice error={error} />}
      <div style={{ marginTop: '1rem' }}>
        <EntityFields type={type} values={values} onChange={(patch) => setValues((v) => ({ ...v, ...patch }))} />
        <TextField label="البريد الإلكتروني" type="email" dir="ltr" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="form-grid">
          <TextField label="كلمة المرور" type="password" dir="ltr" autoComplete="new-password" required minLength={8} hint="8 أحرف على الأقل، بحروف وأرقام" value={password} onChange={(e) => setPassword(e.target.value)} />
          <TextField label="تأكيد كلمة المرور" type="password" dir="ltr" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} required />
          <span>أوافق على سياسة الخصوصية</span>
        </label>
        <Captcha onToken={onToken} />
        <Button type="submit" loading={busy} style={{ width: '100%' }}>إنشاء الحساب</Button>
      </div>
    </form>
  );
}
