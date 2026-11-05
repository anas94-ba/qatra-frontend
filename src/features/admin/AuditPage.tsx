import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../api/client';
import type { AuditEntry, Paginated } from '../../api/types';
import { Card, PageHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { TextField } from '../../components/Field';
import { Pagination } from '../../components/Pagination';
import { QueryState } from '../../components/State';
import { formatDateTime } from '../../lib/format';
import { usePage } from '../../lib/usePage';

export function AuditPage() {
  const { page, setPage, reset } = usePage();
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const query = useQuery({ queryKey: ['admin', 'audit', page, entity, action], queryFn: () => api.get<Paginated<AuditEntry>>('/admin/audit-logs', { page, entity, action }) });

  return (
    <div className="stack">
      <PageHeader title="سجل التدقيق" subtitle="كل العمليات الحساسة، مع القيم قبل وبعد" />
      <Card>
        <div className="form-grid">
          <TextField label="الكيان" placeholder="مثال: Delivery" dir="ltr" value={entity} onChange={(e) => { setEntity(e.target.value); reset(); }} />
          <TextField label="الإجراء" placeholder="مثال: SUSPEND" dir="ltr" value={action} onChange={(e) => { setAction(e.target.value); reset(); }} />
        </div>
        <QueryState loading={query.isLoading} error={query.error}>
          {query.data && (
            <>
              <DataTable rows={query.data.items} rowKey={(a) => a.id} columns={[
                { header: 'الوقت', render: (a) => formatDateTime(a.createdAt) },
                { header: 'الإجراء', render: (a) => <span className="ltr">{a.action}</span> },
                { header: 'الكيان', render: (a) => <span className="ltr">{a.entity}</span> },
                {
                  header: 'قبل / بعد',
                  render: (a) => (
                    <details>
                      <summary className="small">عرض</summary>
                      <pre className="small ltr" style={{ whiteSpace: 'pre-wrap', maxWidth: 380 }}>{JSON.stringify({ before: a.before, after: a.after }, null, 2)}</pre>
                    </details>
                  ),
                },
              ]} />
              <Pagination meta={query.data.meta} onPage={setPage} />
            </>
          )}
        </QueryState>
      </Card>
    </div>
  );
}
