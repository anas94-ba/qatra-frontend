import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { EntityType } from '../../api/types';
import { Button } from '../../components/Button';
import { Captcha } from '../../components/Captcha';
import { TextField } from '../../components/Field';
import { ErrorNotice } from '../../components/State';
import { ENTITY_TYPES, entityTypeLabel } from '../../lib/labels';
import { ResendVerification } from './ResendVerification';
import { emptyValues, EntityFields, toPayload, type EntityValues } from './registrationForm';
import { t } from '../../i18n';

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
  const onToken = useCallback((token: string) => setCaptchaToken(token), []);

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
        <h1>{t("تم إنشاء الحساب")}</h1>
        <div className="notice ok">{t("أكّد بريدك الإلكتروني عبر الرابط الذي أُرسل إليك ليدخل طلبك قائمة مراجعة الأدمن.")}</div>
        {!done.emailSent && <div className="notice warn">{t("تعذّر إرسال البريد حاليًا، يمكنك إعادة الإرسال أدناه.")}</div>}
        <ResendVerification email={email} />
        <Link to="/login">{t("الذهاب لتسجيل الدخول")}</Link>
      </div>
    );
  }

  if (!type) {
    return (
      <div className="stack">
        <h1>{t("تسجيل جديد")}</h1>
        <p className="muted">{t("اختر نوع الجهة التي تسجّلها:")}</p>
        <div className="grid cols-2">
          {ENTITY_TYPES.map((o) => (
            <button key={o.value} type="button" className="card" style={{ cursor: 'pointer', font: 'inherit' }} onClick={() => setType(o.value)}>
              <strong>{t(o.label)}</strong>
            </button>
          ))}
        </div>
        <Link to="/login" className="small">{t("لدي حساب بالفعل")}</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="row between">
        <h1>{t("تسجيل {0}", [t(entityTypeLabel(type))])}</h1>
        <Button type="button" variant="ghost" small onClick={() => setType(null)}>{t("تغيير النوع")}</Button>
      </div>
      {error != null && <ErrorNotice error={error} />}
      <div style={{ marginTop: '1rem' }}>
        <EntityFields type={type} values={values} onChange={(patch) => setValues((v) => ({ ...v, ...patch }))} />
        <TextField label={t("البريد الإلكتروني")} type="email" dir="ltr" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="form-grid">
          <TextField label={t("كلمة المرور")} type="password" dir="ltr" autoComplete="new-password" required minLength={8} hint={t("8 أحرف على الأقل، بحروف وأرقام")} value={password} onChange={(e) => setPassword(e.target.value)} />
          <TextField label={t("تأكيد كلمة المرور")} type="password" dir="ltr" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} required />
          <span>{t("أوافق على سياسة الخصوصية")}</span>
        </label>
        <Captcha onToken={onToken} />
        <Button type="submit" loading={busy} style={{ width: '100%' }}>{t("إنشاء الحساب")}</Button>
      </div>
    </form>
  );
}
