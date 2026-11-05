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
    onSuccess: done('تم قبول الطلب وإنشاء الجهة'), onError: toast.error,
  });
  const extra = useMutation({ mutationFn: () => api.post(`/admin/registrations/${id}/extra-attempt`), onSuccess: done('مُنحت محاولة إضافية'), onError: toast.error });

  return (
    <Modal title="تفاصيل الطلب" onClose={onClose}>
      <QueryState loading={query.isLoading} error={query.error}>
        {r && (
          <div className="stack small">
            <div><strong>{r.name}</strong> — {entityTypeLabel(r.entityType)} <Badge label={requestStatus(r.status)} /></div>
            <div>المسؤول: {r.contactName} • <span className="ltr">{r.phone}</span> • <span className="ltr">{r.email}</span></div>
            {r.region && <div>المنطقة: {r.region} ({r.lat}, {r.lng})</div>}
            {r.description && <div>{r.description}</div>}
            <pre style={{ whiteSpace: 'pre-wrap', direction: 'ltr', background: 'var(--bg)', padding: '.5rem', borderRadius: 8 }}>{JSON.stringify(r.details, null, 2)}</pre>
            <div>المحاولة {r.attemptCount} (إضافية: {r.extraAttempts})</div>
            {r.duplicates && r.duplicates.length > 0 && (
              <div className="notice warn"><strong>تنبيه تكرار:</strong>{r.duplicates.map((d) => <div key={d.id}>{d.name} — {d.reason}</div>)}</div>
            )}
            {r.rejectionHistory && r.rejectionHistory.length > 0 && (
              <div><strong>سجل الرفض:</strong>{r.rejectionHistory.map((h) => <div key={h.attempt}>المحاولة {h.attempt}: {h.reason}</div>)}</div>
            )}
            {r.internalNote && <div className="notice">ملاحظة داخلية: {r.internalNote}</div>}
            {r.status === 'PENDING' && (
              <>
                {r.entityType !== 'CAMP' && (
                  <SelectField label="تأكيد نوع الجهة" value={orgType} onChange={(e) => setOrgType(e.target.value as OrgType | '')} hint="الافتراضي ما اقترحه المتقدم">
                    <option value="">كما اقترح المتقدم</option>
                    {ORG_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </SelectField>
                )}
                <div className="row">
                  <Button loading={approve.isPending} onClick={() => approve.mutate()}>قبول</Button>
                  <Button variant="danger" onClick={() => setAction('reject')}>رفض</Button>
                  <Button variant="secondary" onClick={() => setAction('hold')}>إبقاء قيد الاعتماد</Button>
                </div>
              </>
            )}
            {r.status === 'REJECTED' && <Button variant="secondary" loading={extra.isPending} onClick={() => extra.mutate()}>منح محاولة إضافية</Button>}
          </div>
        )}
      </QueryState>
      {action === 'reject' && (
        <ReasonModal title="رفض الطلب" submitLabel="رفض" danger onClose={() => setAction(null)}
          onSubmit={(reason) => api.post(`/admin/registrations/${id}/reject`, { reason }).then(done('تم رفض الطلب')).catch((e) => { toast.error(e); throw e; })} />
      )}
      {action === 'hold' && (
        <ReasonModal title="إبقاء قيد الاعتماد" label="ملاحظة داخلية (لا تظهر للمتقدم)" submitLabel="حفظ" onClose={() => setAction(null)}
          onSubmit={(note) => api.post(`/admin/registrations/${id}/hold`, { note }).then(done('حُفظت الملاحظة')).catch((e) => { toast.error(e); throw e; })} />
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
    onSuccess: (r) => { toast.success(r.emailSent ? 'أُنشئ الحساب وأُرسل رابط تعيين كلمة المرور' : 'أُنشئ الحساب لكن تعذّر إرسال البريد'); qc.invalidateQueries({ queryKey: ['admin'] }); onClose(); },
    onError: toast.error,
  });
  function submit(e: FormEvent) { e.preventDefault(); create.mutate(); }

  return (
    <Modal title="إنشاء حساب جهة مباشرة" onClose={onClose}>
      <form onSubmit={submit}>
        <SelectField label="نوع الجهة" value={type} onChange={(e) => setType(e.target.value as EntityType)}>
          {ENTITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </SelectField>
        <TextField label="الاسم" required value={f.name} onChange={set('name')} />
        {type === 'CAMP' ? (
          <div className="form-grid">
            <SelectField label="المحافظة" required value={f.region} onChange={set('region')}>
              <option value="">اختر...</option>{REGIONS.map((r) => <option key={r}>{r}</option>)}
            </SelectField>
            <TextField label="خط العرض" type="number" step="any" required value={f.lat} onChange={set('lat')} />
            <TextField label="خط الطول" type="number" step="any" required value={f.lng} onChange={set('lng')} />
          </div>
        ) : <TextField label="وصف النشاط" value={f.description} onChange={set('description')} />}
        <div className="form-grid">
          <TextField label="اسم المسؤول" required value={f.contactName} onChange={set('contactName')} />
          <TextField label="الهاتف" required dir="ltr" value={f.phone} onChange={set('phone')} />
        </div>
        <TextField label="البريد الإلكتروني" type="email" dir="ltr" required value={f.email} onChange={set('email')} />
        <div className="row">
          <Button type="submit" loading={create.isPending}>إنشاء</Button>
          <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
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
      <PageHeader title="طلبات التسجيل" subtitle="تظهر هنا الطلبات التي أكّد أصحابها بريدهم فقط" actions={<Button variant="secondary" onClick={() => setCreating(true)}>إنشاء حساب مباشر</Button>} />
      <Card>
        <div className="form-grid">
          <SelectField label="الحالة" value={status} onChange={(e) => { setStatus(e.target.value); reset(); }}>
            <option value="">الكل</option><option value="PENDING">قيد الاعتماد</option><option value="APPROVED">مقبول</option><option value="REJECTED">مرفوض</option>
          </SelectField>
          <SelectField label="النوع" value={entityType} onChange={(e) => { setEntityType(e.target.value); reset(); }}>
            <option value="">الكل</option>{ENTITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </SelectField>
        </div>
        <QueryState loading={query.isLoading} error={query.error}>
          {query.data && (
            <>
              <DataTable
                rows={query.data.items}
                rowKey={(r) => r.id}
                columns={[
                  { header: 'الاسم', render: (r) => <>{r.name}{r.duplicates && r.duplicates.length > 0 && <div><span className="badge warn">تكرار محتمل</span></div>}</> },
                  { header: 'النوع', render: (r) => entityTypeLabel(r.entityType) },
                  { header: 'التاريخ', render: (r) => formatDate(r.createdAt) },
                  { header: 'المحاولة', render: (r) => r.attemptCount },
                  { header: 'الحالة', render: (r) => <Badge label={requestStatus(r.status)} /> },
                  { header: '', render: (r) => <Button small variant="secondary" onClick={() => setSelected(r.id)}>مراجعة</Button> },
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
