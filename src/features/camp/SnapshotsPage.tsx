import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import type { Paginated, Snapshot } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { TextField } from '../../components/Field';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { formatDate, formatNumber } from '../../lib/format';
import { reviewStatus } from '../../lib/labels';
import { usePage } from '../../lib/usePage';

const emptyForm = { families: '', population: '', children: '', disabled: '', waterReceivedLiters: '', lastDistributionAt: '', source: 'تقرير ميداني', otherSources: '' };

function SnapshotForm({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [f, setF] = useState(emptyForm);
  const set = (k: keyof typeof emptyForm) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const create = useMutation({
    mutationFn: () => api.post('/camp/snapshots', {
      families: Number(f.families), population: Number(f.population), children: Number(f.children), disabled: Number(f.disabled),
      waterReceivedLiters: Number(f.waterReceivedLiters || 0), reportedAt: new Date().toISOString(), source: f.source,
      lastDistributionAt: f.lastDistributionAt || undefined, otherSources: f.otherSources || undefined,
    }),
    onSuccess: () => { toast.success('أُرسل الـ Snapshot للمراجعة'); qc.invalidateQueries({ queryKey: ['camp'] }); onClose(); },
    onError: toast.error,
  });

  function submit(e: FormEvent) { e.preventDefault(); create.mutate(); }

  return (
    <Modal title="Snapshot جديد" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <TextField label="عدد الأسر" type="number" min={0} required value={f.families} onChange={set('families')} />
          <TextField label="عدد السكان" type="number" min={0} required value={f.population} onChange={set('population')} />
          <TextField label="الأطفال" type="number" min={0} required value={f.children} onChange={set('children')} />
          <TextField label="ذوو الإعاقة" type="number" min={0} required value={f.disabled} onChange={set('disabled')} />
          <TextField label="مياه تصل يوميًا من مصادر أخرى (لتر)" type="number" min={0} value={f.waterReceivedLiters} onChange={set('waterReceivedLiters')} hint="المسلَّم عبر المنصة يُحتسب تلقائيًا من الدفعات المؤكدة" />
          <TextField label="تاريخ آخر توزيع" type="date" value={f.lastDistributionAt} onChange={set('lastDistributionAt')} />
        </div>
        <TextField label="مصدر البيانات" required value={f.source} onChange={set('source')} />
        <TextField label="مصادر أخرى (اختياري)" value={f.otherSources} onChange={set('otherSources')} />
        <div className="row">
          <Button type="submit" loading={create.isPending}>إرسال للمراجعة</Button>
          <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Modal>
  );
}

export function SnapshotsPage() {
  const { page, setPage } = usePage();
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: ['camp', 'snapshots', page], queryFn: () => api.get<Paginated<Snapshot>>('/camp/snapshots', { page }) });

  return (
    <div className="stack">
      <PageHeader title="بيانات المخيم" subtitle="كل Snapshot يُراجعه الأدمن قبل استخدامه في التوصيات" actions={<Button onClick={() => setOpen(true)}>Snapshot جديد</Button>} />
      <Card>
        <QueryState loading={query.isLoading} error={query.error}>
          {query.data && (
            <>
              <DataTable
                rows={query.data.items}
                rowKey={(s) => s.id}
                columns={[
                  { header: 'التاريخ', render: (s) => formatDate(s.reportedAt) },
                  { header: 'السكان', render: (s) => formatNumber(s.population) },
                  { header: 'الأسر', render: (s) => formatNumber(s.families) },
                  { header: 'الأطفال', render: (s) => formatNumber(s.children) },
                  { header: 'ذوو الإعاقة', render: (s) => formatNumber(s.disabled) },
                  { header: 'الحالة', render: (s) => <><Badge label={reviewStatus(s.reviewStatus)} />{s.rejectionReason && <div className="small muted">{s.rejectionReason}</div>}</> },
                ]}
              />
              <Pagination meta={query.data.meta} onPage={setPage} />
            </>
          )}
        </QueryState>
      </Card>
      {open && <SnapshotForm onClose={() => setOpen(false)} />}
    </div>
  );
}
