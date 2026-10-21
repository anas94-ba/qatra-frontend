import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import type { RegistrationRequest } from '../../api/types';
import { Button } from '../../components/Button';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { entityTypeLabel, requestStatus } from '../../lib/labels';
import { formatDate } from '../../lib/format';
import { Badge } from '../../components/Badge';
import { landingPath, useAuth } from './AuthContext';
import { ResendVerification } from './ResendVerification';
import { EntityFields, toPayload, valuesFromRequest, type EntityValues } from './registrationForm';

/** Shared "refresh status" + sign-out actions for every status page */
function StatusActions() {
  const { reload, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setBusy(true);
    const s = await reload();
    setBusy(false);
    if (s) navigate(landingPath(s), { replace: true });
  }

  return (
    <div className="row" style={{ marginTop: '1rem' }}>
      <Button loading={busy} onClick={refresh}>تحديث الحالة</Button>
      <Button variant="secondary" onClick={() => logout().then(() => navigate('/login'))}>تسجيل الخروج</Button>
    </div>
  );
}

/** EMAIL_VERIFY: the account exists but the email is not confirmed yet */
export function VerifyStatusPage() {
  const { session } = useAuth();
  return (
    <div>
      <h1>أكّد بريدك الإلكتروني</h1>
      <p>أرسلنا رابط التأكيد إلى بريدك. بعد التأكيد يدخل طلبك قائمة مراجعة الأدمن.</p>
      <ResendVerification email={session?.user.email ?? ''} />
      <StatusActions />
    </div>
  );
}

/** PENDING: read-only view of the request; no other function is available (also enforced by the server) */
export function PendingStatusPage() {
  const query = useQuery({ queryKey: ['registration', 'me'], queryFn: () => api.get<RegistrationRequest>('/registration/me') });
  const r = query.data;
  return (
    <div>
      <h1>طلبك قيد الاعتماد</h1>
      <QueryState loading={query.isLoading} error={query.error}>
        {r && (
          <dl className="stack small">
            <div><strong>الجهة:</strong> {r.name} ({entityTypeLabel(r.entityType)})</div>
            <div><strong>الحالة:</strong> <Badge label={requestStatus(r.status)} /></div>
            <div><strong>تاريخ التقديم:</strong> {formatDate(r.createdAt)}</div>
            <div><strong>المسؤول:</strong> {r.contactName} — <span className="ltr">{r.phone}</span></div>
          </dl>
        )}
      </QueryState>
      <p className="muted small">ستصلك رسالة بريدية عند اتخاذ القرار. يمكنك الضغط على «تحديث الحالة» للتحقق.</p>
      <StatusActions />
    </div>
  );
}

/** REJECTED: shows the reason and, while attempts remain, an edit-and-resubmit form */
export function RejectedStatusPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { reload } = useAuth();
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ['registration', 'me'], queryFn: () => api.get<RegistrationRequest>('/registration/me') });
  const r = query.data;
  const [values, setValues] = useState<EntityValues | null>(null);
  const [busy, setBusy] = useState(false);
  const form = values ?? (r ? valuesFromRequest(r) : null);

  async function resubmit(e: FormEvent) {
    e.preventDefault();
    if (!r || !form) return;
    setBusy(true);
    try {
      await api.put('/registration/me', toPayload(r.entityType, form));
      toast.success('أُعيد تقديم الطلب');
      await queryClient.invalidateQueries({ queryKey: ['registration'] });
      const s = await reload();
      if (s) navigate(landingPath(s), { replace: true });
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h1>تعذّر قبول طلبك</h1>
      <QueryState loading={query.isLoading} error={query.error}>
        {r && (
          <>
            <div className="notice danger"><strong>السبب:</strong> {r.rejectionReason}</div>
            <p className="small muted">المحاولات المتبقية: {r.attemptsRemaining ?? 0}</p>
            {r.canResubmit && form ? (
              <form onSubmit={resubmit}>
                <h2>عدّل بياناتك وأعد التقديم</h2>
                <EntityFields type={r.entityType} values={form} onChange={(patch) => setValues({ ...form, ...patch })} />
                <Button type="submit" loading={busy}>إعادة التقديم</Button>
              </form>
            ) : (
              <div className="notice">استُنفدت محاولات إعادة التقديم. للتواصل مع فريق المنصة يرجى مراسلتهم عبر القنوات الرسمية.</div>
            )}
          </>
        )}
      </QueryState>
      <StatusActions />
    </div>
  );
}

/** SUSPENDED: the reason only, no functions */
export function SuspendedStatusPage() {
  const { session } = useAuth();
  const reason = session?.landingData?.reason as string | null | undefined;
  return (
    <div>
      <h1>الحساب موقوف</h1>
      <div className="notice danger">{reason ? <><strong>السبب:</strong> {reason}</> : 'تم توقيف جهتك مؤقتًا.'}</div>
      <StatusActions />
    </div>
  );
}
