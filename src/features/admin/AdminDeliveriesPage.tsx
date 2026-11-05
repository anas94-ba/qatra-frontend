import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import type { Delivery, Paginated } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { SelectField, TextArea, TextField } from '../../components/Field';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { formatDate, formatLiters } from '../../lib/format';
import { deliveryStatus, entityTypeLabel, ORG_TYPES } from '../../lib/labels';
import { usePage } from '../../lib/usePage';

/** Correction of a disputed delivery: the reason is mandatory and goes to the audit log */
function CorrectModal({ delivery, onClose, onDone }: { delivery: Delivery; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [sent, setSent] = useState(String(delivery.sentLiters));
  const [received, setReceived] = useState(delivery.receivedLiters == null ? '' : String(delivery.receivedLiters));
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch(`/admin/deliveries/${delivery.id}/correct`, { sentLiters: Number(sent), receivedLiters: received === '' ? undefined : Number(received), status: status || undefined, reason });
      toast.success('صُحّحت الدفعة');
      onDone();
      onClose();
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="تصحيح دفعة" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <TextField label="المرسل (لتر)" type="number" min={0} value={sent} onChange={(e) => setSent(e.target.value)} />
          <TextField label="المستلم (لتر)" type="number" min={0} value={received} onChange={(e) => setReceived(e.target.value)} />
        </div>
        <SelectField label="الحالة" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">بدون تغيير</option>
          {(['CONFIRMED', 'CONFIRMED_DIFF', 'REJECTED', 'CANCELLED'] as const).map((s) => <option key={s} value={s}>{deliveryStatus(s).text}</option>)}
        </SelectField>
        <TextArea label="سبب التصحيح" required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="row"><Button type="submit" loading={busy}>حفظ</Button><Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button></div>
      </form>
    </Modal>
  );
}

export function AdminDeliveriesPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const { page, setPage, reset } = usePage();
  const [disputed, setDisputed] = useState(false);
  const [orgType, setOrgType] = useState('');
  const [correcting, setCorrecting] = useState<Delivery | null>(null);
  const query = useQuery({
    queryKey: ['admin', 'deliveries', page, disputed, orgType],
    queryFn: () => api.get<Paginated<Delivery>>('/admin/deliveries', { page, orgType, disputed: disputed || undefined }),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin'] });

  async function resolveFrozen(d: Delivery, action: 'CANCEL' | 'KEEP') {
    try { await api.post(`/admin/deliveries/${d.id}/resolve-frozen`, { action }); toast.success(action === 'CANCEL' ? 'أُلغيت الدفعة' : 'بقيت مجمّدة'); refresh(); } catch (e) { toast.error(e); }
  }

  return (
    <div className="stack">
      <PageHeader title="كل الدفعات" subtitle="المتنازع عليها هي المرفوضة والمؤكدة بفرق" />
      <Card>
        <div className="form-grid">
          <SelectField label="نوع الجهة المرسلة" value={orgType} onChange={(e) => { setOrgType(e.target.value); reset(); }}>
            <option value="">الكل</option>{ORG_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </SelectField>
          <label className="checkbox" style={{ alignSelf: 'end' }}><input type="checkbox" checked={disputed} onChange={(e) => { setDisputed(e.target.checked); reset(); }} /><span>المتنازع عليها فقط</span></label>
        </div>
        <QueryState loading={query.isLoading} error={query.error}>
          {query.data && (
            <>
              <DataTable rows={query.data.items} rowKey={(d) => d.id} columns={[
                { header: 'التاريخ', render: (d) => formatDate(d.sentAt) },
                { header: 'من', render: (d) => <>{d.from.name}<div className="small muted">{entityTypeLabel(d.from.orgType)}</div></> },
                { header: 'إلى', render: (d) => d.to.name },
                { header: 'المرسل / المستلم', render: (d) => `${formatLiters(d.sentLiters)} / ${formatLiters(d.receivedLiters)}` },
                { header: 'الحالة', render: (d) => <><Badge label={deliveryStatus(d.status)} />{d.frozen && <div><span className="badge warn">مجمّدة</span></div>}{d.decisionNote && <div className="small muted">{d.decisionNote}</div>}</> },
                {
                  header: '',
                  render: (d) => d.frozen ? (
                    <div className="row"><Button small variant="danger" onClick={() => resolveFrozen(d, 'CANCEL')}>إلغاء</Button><Button small variant="secondary" onClick={() => resolveFrozen(d, 'KEEP')}>إبقاء</Button></div>
                  ) : <Button small variant="secondary" onClick={() => setCorrecting(d)}>تصحيح</Button>,
                },
              ]} />
              <Pagination meta={query.data.meta} onPage={setPage} />
            </>
          )}
        </QueryState>
      </Card>
      {correcting && <CorrectModal delivery={correcting} onClose={() => setCorrecting(null)} onDone={refresh} />}
    </div>
  );
}
