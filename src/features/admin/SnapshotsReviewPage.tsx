import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../api/client';
import type { Paginated, Snapshot } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { SelectField } from '../../components/Field';
import { ReasonModal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { formatDate, formatNumber } from '../../lib/format';
import { reviewStatus } from '../../lib/labels';
import { usePage } from '../../lib/usePage';

export function SnapshotsReviewPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const { page, setPage, reset } = usePage();
  const [status, setStatus] = useState('PENDING');
  const [rejecting, setRejecting] = useState<Snapshot | null>(null);
  const query = useQuery({ queryKey: ['admin', 'snapshots', page, status], queryFn: () => api.get<Paginated<Snapshot>>('/admin/snapshots', { page, reviewStatus: status }) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin'] });

  async function approve(s: Snapshot) {
    try { await api.post(`/admin/snapshots/${s.id}/approve`); toast.success('اعتُمد الـ Snapshot'); refresh(); } catch (e) { toast.error(e); }
  }

  return (
    <div className="stack">
      <PageHeader title="مراجعة بيانات المخيمات" subtitle="لا تدخل البيانات حساب الخوارزمية قبل اعتمادها" />
      <Card>
        <SelectField label="الحالة" value={status} onChange={(e) => { setStatus(e.target.value); reset(); }}>
          <option value="">الكل</option><option value="PENDING">قيد المراجعة</option><option value="APPROVED">معتمد</option><option value="REJECTED">مرفوض</option>
        </SelectField>
        <QueryState loading={query.isLoading} error={query.error}>
          {query.data && (
            <>
              <DataTable rows={query.data.items} rowKey={(s) => s.id} columns={[
                { header: 'المخيم', render: (s) => s.camp?.name },
                { header: 'التاريخ', render: (s) => formatDate(s.reportedAt) },
                { header: 'السكان / الأسر', render: (s) => `${formatNumber(s.population)} / ${formatNumber(s.families)}` },
                { header: 'أطفال / إعاقة', render: (s) => `${formatNumber(s.children)} / ${formatNumber(s.disabled)}` },
                { header: 'مياه (لتر/يوم)', render: (s) => formatNumber(s.waterReceivedLiters) },
                { header: 'المصدر', render: (s) => s.source },
                { header: 'الحالة', render: (s) => <Badge label={reviewStatus(s.reviewStatus)} /> },
                { header: '', render: (s) => s.reviewStatus === 'PENDING' ? <div className="row"><Button small onClick={() => approve(s)}>اعتماد</Button><Button small variant="danger" onClick={() => setRejecting(s)}>رفض</Button></div> : null },
              ]} />
              <Pagination meta={query.data.meta} onPage={setPage} />
            </>
          )}
        </QueryState>
      </Card>
      {rejecting && (
        <ReasonModal title="رفض الـ Snapshot" submitLabel="رفض" danger onClose={() => setRejecting(null)}
          onSubmit={(reason) => api.post(`/admin/snapshots/${rejecting.id}/reject`, { reason }).then(() => { toast.success('رُفض الـ Snapshot'); refresh(); }).catch((e) => { toast.error(e); throw e; })} />
      )}
    </div>
  );
}
