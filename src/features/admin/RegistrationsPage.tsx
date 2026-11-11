import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import type { EntityType, OrgType, Paginated, RegistrationRequest } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { SelectField, TextField } from '../../components/Field';
import { Modal, ReasonModal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { formatDate } from '../../lib/format';
import { ENTITY_TYPES, entityTypeLabel, ORG_TYPES, requestStatus } from '../../lib/labels';
import { usePage } from '../../lib/usePage';
import { REGIONS } from '../auth/registrationForm';
import { t } from '../../i18n';

type Action = 'reject' | 'hold' | null;

function RequestDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [action, setAction] = useState<Action>(null);
  const [orgType, setOrgType] = useState<OrgType | ''>('');
  const query = useQuery({ queryKey: ['admin', 'registration', id], queryFn: () => api.get<RegistrationRequest>(`/admin/registrations/${id}`) });
  const r = query.data;
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin'] });
  const done = (msg: string) => () => { toast.success(msg); refresh(); onClose(); };

  const approve = useMutation({
    mutationFn: () => api.post(`/admin/registrations/${id}/approve`, orgType ? { orgType } : {}),
    onSuccess: done(t("تم قبول الطلب وإنشاء الجهة")), onError: toast.error,
  });
  const extra = useMutation({ mutationFn: () => api.post(`/admin/registrations/${id}/extra-attempt`), onSuccess: done(t("مُنحت محاولة إضافية")), onError: toast.error });

  return (
    <Modal title={t("تفاصيل الطلب")} onClose={onClose}>
      <QueryState loading={query.isLoading} error={query.error}>
        {r && (
          <div className="stack small">
            <div><strong>{r.name}</strong> — {entityTypeLabel(r.entityType)} <Badge label={requestStatus(r.status)} /></div>
            <div>{t("المسؤول: {0} •", [r.contactName])} <span className="ltr">{r.phone}</span> • <span className="ltr">{r.email}</span></div>
            {r.region && <div>{t("المنطقة: {0} ({1}, {2})", [r.region, r.lat, r.lng])}</div>}
            {r.description && <div>{r.description}</div>}
            <pre style={{ whiteSpace: 'pre-wrap', direction: 'ltr', background: 'var(--bg)', padding: '.5rem', borderRadius: 8 }}>{JSON.stringify(r.details, null, 2)}</pre>
            <div>{t("المحاولة {0} (إضافية: {1})", [r.attemptCount, r.extraAttempts])}</div>
            {r.duplicates && r.duplicates.length > 0 && (
              <div className="notice warn"><strong>{t("تنبيه تكرار:")}</strong>{r.duplicates.map((d) => <div key={d.id}>{d.name} — {d.reason}</div>)}</div>
            )}
            {r.rejectionHistory && r.rejectionHistory.length > 0 && (
              <div><strong>{t("سجل الرفض:")}</strong>{r.rejectionHistory.map((h) => <div key={h.attempt}>{t("المحاولة {0}: {1}", [h.attempt, h.reason])}</div>)}</div>
            )}
            {r.internalNote && <div className="notice">{t("ملاحظة داخلية: {0}", [r.internalNote])}</div>}
            {r.status === 'PENDING' && (
              <>
                {r.entityType !== 'CAMP' && (
                  <SelectField label={t("تأكيد نوع الجهة")} value={orgType} onChange={(e) => setOrgType(e.target.value as OrgType | '')} hint={t("الافتراضي ما اقترحه المتقدم")}>
                    <option value="">{t("كما اقترح المتقدم")}</option>
                    {ORG_TYPES.map((o) => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
                  </SelectField>
                )}
                <div className="row">
                  <Button loading={approve.isPending} onClick={() => approve.mutate()}>{t("قبول")}</Button>
                  <Button variant="danger" onClick={() => setAction('reject')}>{t("رفض")}</Button>
                  <Button variant="secondary" onClick={() => setAction('hold')}>{t("إبقاء قيد الاعتماد")}</Button>
                </div>
              </>
            )}
            {r.status === 'REJECTED' && <Button variant="secondary" loading={extra.isPending} onClick={() => extra.mutate()}>{t("منح محاولة إضافية")}</Button>}
          </div>
        )}
      </QueryState>
      {action === 'reject' && (
        <ReasonModal title={t("رفض الطلب")} submitLabel={t("رفض")} danger onClose={() => setAction(null)}
          onSubmit={(reason) => api.post(`/admin/registrations/${id}/reject`, { reason }).then(done(t("تم رفض الطلب"))).catch((e) => { toast.error(e); throw e; })} />
      )}
      {action === 'hold' && (
        <ReasonModal title={t("إبقاء قيد الاعتماد")} label={t("ملاحظة داخلية (لا تظهر للمتقدم)")} submitLabel={t("حفظ")} onClose={() => setAction(null)}
          onSubmit={(note) => api.post(`/admin/registrations/${id}/hold`, { note }).then(done(t("حُفظت الملاحظة"))).catch((e) => { toast.error(e); throw e; })} />
      )}
    </Modal>
  );
}

/** Direct entity account (e.g. pilot partners): the owner receives a set-password link by email */
function DirectAccountForm({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [type, setType] = useState<EntityType>('CAMP');
  const [f, setF] = useState({ name: '', region: '', lat: '', lng: '', contactName: '', email: '', phone: '', description: '' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const create = useMutation({
    mutationFn: () => api.post<{ emailSent: boolean }>('/admin/accounts', {
      entityType: type, name: f.name, contactName: f.contactName, email: f.email, phone: f.phone,
      ...(type === 'CAMP' ? { region: f.region, lat: Number(f.lat), lng: Number(f.lng) } : { description: f.description || undefined }),
    }),
    onSuccess: (r) => { toast.success(r.emailSent ? t("أُنشئ الحساب وأُرسل رابط تعيين كلمة المرور") : t("أُنشئ الحساب لكن تعذّر إرسال البريد")); qc.invalidateQueries({ queryKey: ['admin'] }); onClose(); },
    onError: toast.error,
  });
  function submit(e: FormEvent) { e.preventDefault(); create.mutate(); }

  return (
    <Modal title={t("إنشاء حساب جهة مباشرة")} onClose={onClose}>
      <form onSubmit={submit}>
        <SelectField label={t("نوع الجهة")} value={type} onChange={(e) => setType(e.target.value as EntityType)}>
          {ENTITY_TYPES.map((o) => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
        </SelectField>
        <TextField label={t("الاسم")} required value={f.name} onChange={set('name')} />
        {type === 'CAMP' ? (
          <div className="form-grid">
            <SelectField label={t("المحافظة")} required value={f.region} onChange={set('region')}>
              <option value="">{t("اختر...")}</option>{REGIONS.map((r) => <option key={r} value={r}>{t(r)}</option>)}
            </SelectField>
            <TextField label={t("خط العرض")} type="number" step="any" required value={f.lat} onChange={set('lat')} />
            <TextField label={t("خط الطول")} type="number" step="any" required value={f.lng} onChange={set('lng')} />
          </div>
        ) : <TextField label={t("وصف النشاط")} value={f.description} onChange={set('description')} />}
        <div className="form-grid">
          <TextField label={t("اسم المسؤول")} required value={f.contactName} onChange={set('contactName')} />
          <TextField label={t("الهاتف")} required dir="ltr" value={f.phone} onChange={set('phone')} />
        </div>
        <TextField label={t("البريد الإلكتروني")} type="email" dir="ltr" required value={f.email} onChange={set('email')} />
        <div className="row">
          <Button type="submit" loading={create.isPending}>{t("إنشاء")}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>{t("إلغاء")}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function RegistrationsPage() {
  const { page, setPage, reset } = usePage();
  const [status, setStatus] = useState('PENDING');
  const [entityType, setEntityType] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const query = useQuery({
    queryKey: ['admin', 'registrations', page, status, entityType],
    queryFn: () => api.get<Paginated<RegistrationRequest>>('/admin/registrations', { page, status, entityType }),
  });

  return (
    <div className="stack">
      <PageHeader title={t("طلبات التسجيل")} subtitle={t("تظهر هنا الطلبات التي أكّد أصحابها بريدهم فقط")} actions={<Button variant="secondary" onClick={() => setCreating(true)}>{t("إنشاء حساب مباشر")}</Button>} />
      <Card>
        <div className="form-grid">
          <SelectField label={t("الحالة")} value={status} onChange={(e) => { setStatus(e.target.value); reset(); }}>
            <option value="">{t("الكل")}</option><option value="PENDING">{t("قيد الاعتماد")}</option><option value="APPROVED">{t("مقبول")}</option><option value="REJECTED">{t("مرفوض")}</option>
          </SelectField>
          <SelectField label={t("النوع")} value={entityType} onChange={(e) => { setEntityType(e.target.value); reset(); }}>
            <option value="">{t("الكل")}</option>{ENTITY_TYPES.map((o) => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
          </SelectField>
        </div>
        <QueryState loading={query.isLoading} error={query.error}>
          {query.data && (
            <>
              <DataTable
                rows={query.data.items}
                rowKey={(r) => r.id}
                columns={[
                  { header: t("الاسم"), render: (r) => <>{r.name}{r.duplicates && r.duplicates.length > 0 && <div><span className="badge warn">{t("تكرار محتمل")}</span></div>}</> },
                  { header: t("النوع"), render: (r) => entityTypeLabel(r.entityType) },
                  { header: t("التاريخ"), render: (r) => formatDate(r.createdAt) },
                  { header: t("المحاولة"), render: (r) => r.attemptCount },
                  { header: t("الحالة"), render: (r) => <Badge label={requestStatus(r.status)} /> },
                  { header: '', render: (r) => <Button small variant="secondary" onClick={() => setSelected(r.id)}>{t("مراجعة")}</Button> },
                ]}
              />
              <Pagination meta={query.data.meta} onPage={setPage} />
            </>
          )}
        </QueryState>
      </Card>
      {selected && <RequestDetail id={selected} onClose={() => setSelected(null)} />}
      {creating && <DirectAccountForm onClose={() => setCreating(false)} />}
    </div>
  );
}
