import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import type { Camp, Organization, OrgType, Paginated } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { SelectField, TextField } from '../../components/Field';
import { Modal, ReasonModal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { entityStatus, entityTypeLabel, ORG_TYPES } from '../../lib/labels';
import { usePage } from '../../lib/usePage';
import { REGIONS } from '../auth/registrationForm';

type Kind = 'camps' | 'organizations';
interface Target { kind: Kind; id: string; name: string }

function CampForm({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [f, setF] = useState({ name: '', region: '', lat: '', lng: '' });
  const create = useMutation({
    mutationFn: () => api.post('/admin/camps', { name: f.name, region: f.region, lat: Number(f.lat), lng: Number(f.lng) }),
    onSuccess: () => { toast.success('أُضيف المخيم'); qc.invalidateQueries({ queryKey: ['admin'] }); onClose(); },
    onError: toast.error,
  });
  function submit(e: FormEvent) { e.preventDefault(); create.mutate(); }
  return (
    <Modal title="إضافة مخيم" onClose={onClose}>
      <form onSubmit={submit}>
        <TextField label="الاسم" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <SelectField label="المحافظة" required value={f.region} onChange={(e) => setF({ ...f, region: e.target.value })}>
          <option value="">اختر...</option>{REGIONS.map((r) => <option key={r}>{r}</option>)}
        </SelectField>
        <div className="form-grid">
          <TextField label="خط العرض" type="number" step="any" required value={f.lat} onChange={(e) => setF({ ...f, lat: e.target.value })} />
          <TextField label="خط الطول" type="number" step="any" required value={f.lng} onChange={(e) => setF({ ...f, lng: e.target.value })} />
        </div>
        <div className="row"><Button type="submit" loading={create.isPending}>إضافة</Button><Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button></div>
      </form>
    </Modal>
  );
}

export function EntitiesPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [kind, setKind] = useState<Kind>('camps');
  const { page, setPage, reset } = usePage();
  const [orgType, setOrgType] = useState('');
  const [suspending, setSuspending] = useState<Target | null>(null);
  const [adding, setAdding] = useState(false);

  const campsQuery = useQuery({ queryKey: ['admin', 'camps', page], queryFn: () => api.get<Paginated<Camp>>('/admin/camps', { page }), enabled: kind === 'camps' });
  const orgsQuery = useQuery({ queryKey: ['admin', 'organizations', page, orgType], queryFn: () => api.get<Paginated<Organization>>('/admin/organizations', { page, orgType }), enabled: kind === 'organizations' });
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin'] });

  const reactivate = useMutation({ mutationFn: (t: Target) => api.post(`/admin/${t.kind}/${t.id}/reactivate`), onSuccess: () => { toast.success('أُعيد التفعيل'); refresh(); }, onError: toast.error });
  const publish = useMutation({ mutationFn: (c: Camp) => api.patch(`/admin/camps/${c.id}`, { publicVisible: !c.publicVisible }), onSuccess: refresh, onError: toast.error });
  const retype = useMutation({ mutationFn: (v: { id: string; orgType: OrgType }) => api.patch(`/admin/organizations/${v.id}/type`, { orgType: v.orgType }), onSuccess: () => { toast.success('عُدّل النوع'); refresh(); }, onError: toast.error });

  const suspendButton = (kindOf: Kind, e: { id: string; name: string; status: string }) =>
    e.status === 'ACTIVE'
      ? <Button small variant="danger" onClick={() => setSuspending({ kind: kindOf, id: e.id, name: e.name })}>توقيف</Button>
      : <Button small variant="secondary" onClick={() => reactivate.mutate({ kind: kindOf, id: e.id, name: e.name })}>إعادة تفعيل</Button>;

  const active = kind === 'camps' ? campsQuery : orgsQuery;

  return (
    <div className="stack">
      <PageHeader title="الجهات" actions={kind === 'camps' ? <Button onClick={() => setAdding(true)}>إضافة مخيم</Button> : undefined} />
      <div className="row">
        <Button variant={kind === 'camps' ? 'primary' : 'secondary'} small onClick={() => { setKind('camps'); reset(); }}>المخيمات</Button>
        <Button variant={kind === 'organizations' ? 'primary' : 'secondary'} small onClick={() => { setKind('organizations'); reset(); }}>المؤسسات والمبادرات</Button>
      </div>
      <Card>
        {kind === 'organizations' && (
          <SelectField label="فلتر النوع" value={orgType} onChange={(e) => { setOrgType(e.target.value); reset(); }}>
            <option value="">الكل</option>{ORG_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </SelectField>
        )}
        <QueryState loading={active.isLoading} error={active.error}>
          {kind === 'camps' && campsQuery.data && (
            <>
              <DataTable rows={campsQuery.data.items} rowKey={(c) => c.id} columns={[
                { header: 'المخيم', render: (c) => <>{c.name}<div className="small muted">{c.region}</div></> },
                { header: 'الحالة', render: (c) => <><Badge label={entityStatus(c.status)} />{c.suspendedReason && <div className="small muted">{c.suspendedReason}</div>}</> },
                { header: 'الظهور العام', render: (c) => <Button small variant="ghost" onClick={() => publish.mutate(c)}>{c.publicVisible ? 'منشور ✓' : 'غير منشور'}</Button> },
                { header: '', render: (c) => suspendButton('camps', c) },
              ]} />
              <Pagination meta={campsQuery.data.meta} onPage={setPage} />
            </>
          )}
          {kind === 'organizations' && orgsQuery.data && (
            <>
              <DataTable rows={orgsQuery.data.items} rowKey={(o) => o.id} columns={[
                { header: 'الجهة', render: (o) => o.name },
                { header: 'النوع', render: (o) => (
                  <select aria-label="نوع الجهة" value={o.orgType} onChange={(e) => retype.mutate({ id: o.id, orgType: e.target.value as OrgType })}>
                    {ORG_TYPES.map((t) => <option key={t.value} value={t.value}>{entityTypeLabel(t.value)}</option>)}
                  </select>
                ) },
                { header: 'الحالة', render: (o) => <><Badge label={entityStatus(o.status)} />{o.suspendedReason && <div className="small muted">{o.suspendedReason}</div>}</> },
                { header: '', render: (o) => suspendButton('organizations', o) },
              ]} />
              <Pagination meta={orgsQuery.data.meta} onPage={setPage} />
            </>
          )}
        </QueryState>
      </Card>
      {adding && <CampForm onClose={() => setAdding(false)} />}
      {suspending && (
        <ReasonModal
          title={`توقيف «${suspending.name}»`} submitLabel="توقيف" danger onClose={() => setSuspending(null)}
          onSubmit={(reason) => api.post(`/admin/${suspending.kind}/${suspending.id}/suspend`, { reason }).then(() => { toast.success('تم التوقيف'); refresh(); }).catch((e) => { toast.error(e); throw e; })}
        />
      )}
    </div>
  );
}
