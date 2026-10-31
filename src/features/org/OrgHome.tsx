import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { Delivery, Organization, Paginated, Plan } from '../../api/types';
import { Card, PageHeader, Stat } from '../../components/Card';
import { QueryState } from '../../components/State';
import { formatNumber } from '../../lib/format';
import { entityTypeLabel } from '../../lib/labels';

export function OrgHome() {
  const org = useQuery({ queryKey: ['org', 'me'], queryFn: () => api.get<Organization>('/org/me') });
  const plans = useQuery({ queryKey: ['org', 'plans', 1], queryFn: () => api.get<Paginated<Plan>>('/org/plans', { pageSize: 1 }) });
  const pending = useQuery({ queryKey: ['org', 'deliveries', 'pending-count'], queryFn: () => api.get<Paginated<Delivery>>('/org/deliveries', { status: 'PENDING', pageSize: 1 }) });

  return (
    <div className="stack">
      <PageHeader title={org.data?.name ?? 'مؤسستي'} subtitle={org.data ? entityTypeLabel(org.data.orgType) : undefined} />
      <QueryState loading={org.isLoading} error={org.error}>
        <div className="grid cols-3">
          <Stat label="خطط المياه" value={formatNumber(plans.data?.meta.total ?? 0)} />
          <Stat label="دفعات بانتظار رد المخيمات" value={formatNumber(pending.data?.meta.total ?? 0)} />
        </div>
        <Card title="ابدأ من هنا">
          <p className="muted">أنشئ خطة مياه، شغّل التوصية، اعتمد الكميات أو عدّلها بسبب، ثم سجّل الدفعات ليؤكد المخيم استلامها.</p>
          <div className="row">
            <Link className="btn" to="plans">خطط المياه</Link>
            <Link className="btn secondary" to="deliveries">الدفعات الصادرة</Link>
          </div>
        </Card>
      </QueryState>
    </div>
  );
}
