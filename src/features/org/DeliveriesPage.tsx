import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { api, downloadCsv } from '../../api/client';
import type { Delivery, DeliveryStatus, Paginated, Plan } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { SelectField, TextField } from '../../components/Field';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { formatDate, formatLiters, todayInGaza } from '../../lib/format';
import { deliveryStatus } from '../../lib/labels';
import { usePage } from '../../lib/usePage';

function DeliveryForm({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [planId, setPlanId] = useState('');
  const [f, setF] = useState({ campId: '', sentLiters: '', sentAt: todayInGaza(), executor: '', proofUrl: '' });
  const [uploading, setUploading] = useState(false);

  // Only plans that can receive deliveries (approved or in progress)
  const plans = useQuery({ queryKey: ['org', 'plans', 'usable'], queryFn: () => api.get<Paginated<Plan>>('/org/plans', { pageSize: 100 }) });
  const usable = (plans.data?.items ?? []).filter((p) => p.status === 'APPROVED' || p.status === 'IN_PROGRESS');
  const plan = useQuery({ queryKey: ['org', 'plan', planId], queryFn: () => api.get<Plan>(`/org/plans/${planId}`), enabled: !!planId });

  const create = useMutation({
    mutationFn: () => api.post<Delivery>('/org/deliveries', { planId, campId: f.campId, sentLiters: Number(f.sentLiters), sentAt: f.sentAt, executor: f.executor, proofUrl: f.proofUrl || undefined }),
    onSuccess: (d) => {
      toast.success(d.warnings?.length ? `أُنشئت الدفعة. تنبيه: ${d.warnings[0]}` : 'أُنشئت الدفعة وأُرسل إشعار للمخيم');
      qc.invalidateQueries({ queryKey: ['org'] });
      onClose();
    },
    onError: toast.error,
  });

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      setF((v) => ({ ...v, proofUrl: '' }));
      const { url } = await api.upload<{ url: string }>('/org/uploads/proof', form);
      setF((v) => ({ ...v, proofUrl: url }));
    } catch (err) {
      toast.error(err);
    } finally {
      setUploading(false);
    }
  }

  function submit(ev: FormEvent) { ev.preventDefault(); create.mutate(); }

  return (
    <Modal title="دفعة جديدة" onClose={onClose}>
      <form onSubmit={submit}>
        <SelectField label="الخطة" required value={planId} onChange={(e) => { setPlanId(e.target.value); setF({ ...f, campId: '' }); }} hint={!plans.isLoading && !usable.length ? 'لا توجد خطط معتمدة بعد' : undefined}>
          <option value="">اختر...</option>
          {usable.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </SelectField>
        <SelectField label="المخيم" required value={f.campId} onChange={(e) => setF({ ...f, campId: e.target.value })} disabled={!planId}>
          <option value="">اختر...</option>
          {plan.data?.planCamps?.filter((c) => c.camp.status === 'ACTIVE').map((c) => <option key={c.campId} value={c.campId}>{c.camp.name}</option>)}
        </SelectField>
        <div className="form-grid">
          <TextField label="الكمية (لتر)" type="number" min={1} required value={f.sentLiters} onChange={(e) => setF({ ...f, sentLiters: e.target.value })} />
          <TextField label="تاريخ الدفعة" type="date" max={todayInGaza()} required value={f.sentAt} onChange={(e) => setF({ ...f, sentAt: e.target.value })} hint="اليوم أو قبله" />
        </div>
        <TextField label="الجهة المنفذة" required value={f.executor} onChange={(e) => setF({ ...f, executor: e.target.value })} />
        <TextField label="إثبات التسليم (اختياري)" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={upload} hint={uploading ? 'جارٍ الرفع...' : f.proofUrl ? 'تم رفع الإثبات' : 'jpg أو png أو webp أو pdf، حتى 5 ميغابايت'} />
        <div className="row">
          <Button type="submit" loading={create.isPending} disabled={uploading}>إرسال للمخيم</Button>
          <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Modal>
  );
}

export function OrgDeliveriesPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const { page, setPage, reset } = usePage();
  const [status, setStatus] = useState<DeliveryStatus | ''>('');
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: ['org', 'deliveries', page, status], queryFn: () => api.get<Paginated<Delivery>>('/org/deliveries', { page, status }) });

  const cancel = useMutation({
    mutationFn: (id: string) => api.post(`/org/deliveries/${id}/cancel`),
    onSuccess: () => { toast.success('أُلغيت الدفعة'); qc.invalidateQueries({ queryKey: ['org'] }); },
    onError: toast.error,
  });

  return (
    <div className="stack">
      <PageHeader
        title="الدفعات الصادرة"
        actions={
          <div className="row">
            <Button variant="secondary" small onClick={() => downloadCsv('/org/deliveries/export', { status }, 'outgoing-deliveries.csv').catch(toast.error)}>تصدير CSV</Button>
            <Button onClick={() => setOpen(true)}>دفعة جديدة</Button>
          </div>
        }
      />
      <Card>
        <SelectField label="الحالة" value={status} onChange={(e) => { setStatus(e.target.value as DeliveryStatus | ''); reset(); }}>
          <option value="">الكل</option>
          {(['PENDING', 'CONFIRMED', 'CONFIRMED_DIFF', 'REJECTED', 'CANCELLED'] as const).map((s) => <option key={s} value={s}>{deliveryStatus(s).text}</option>)}
        </SelectField>
        <QueryState loading={query.isLoading} error={query.error}>
          {query.data && (
            <>
              <DataTable
                rows={query.data.items}
                rowKey={(d) => d.id}
                columns={[
                  { header: 'التاريخ', render: (d) => formatDate(d.sentAt) },
                  { header: 'المخيم', render: (d) => d.to.name },
                  { header: 'الخطة', render: (d) => d.plan?.name ?? '—' },
                  { header: 'المرسل', render: (d) => formatLiters(d.sentLiters) },
                  { header: 'المستلم', render: (d) => formatLiters(d.receivedLiters) },
                  { header: 'الحالة', render: (d) => <><Badge label={deliveryStatus(d.status)} />{d.frozen && <div className="small muted">مجمّدة</div>}{d.decisionNote && <div className="small muted">{d.decisionNote}</div>}</> },
                  { header: 'إجراء', render: (d) => d.status === 'PENDING' && !d.frozen ? <Button small variant="secondary" onClick={() => cancel.mutate(d.id)}>إلغاء</Button> : null },
                ]}
              />
              <Pagination meta={query.data.meta} onPage={setPage} />
            </>
          )}
        </QueryState>
      </Card>
      {open && <DeliveryForm onClose={() => setOpen(false)} />}
    </div>
  );
}
