import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { Paginated } from '../../api/types';
import { Card, PageHeader, Stat } from '../../components/Card';
import { formatNumber } from '../../lib/format';
import { t } from '../../i18n';

/** Cheap overview: each number is just the `meta.total` of a 1-item page */
const total = (path: string, params: Record<string, string | number | boolean>) =>
  api.get<Paginated<unknown>>(path, { ...params, pageSize: 1 }).then((r) => r.meta.total);

export function AdminHome() {
  const requests = useQuery({ queryKey: ['admin', 'count', 'registrations'], queryFn: () => total('/admin/registrations', { status: 'PENDING' }) });
  const snapshots = useQuery({ queryKey: ['admin', 'count', 'snapshots'], queryFn: () => total('/admin/snapshots', { reviewStatus: 'PENDING' }) });
  const disputed = useQuery({ queryKey: ['admin', 'count', 'disputed'], queryFn: () => total('/admin/deliveries', { disputed: true }) });

  return (
    <div className="stack">
      <PageHeader title={t("لوحة الأدمن")} />
      <div className="grid cols-3">
        <Stat label={t("طلبات تسجيل بانتظار القرار")} value={formatNumber(requests.data ?? 0)} />
        <Stat label={t("Snapshots بانتظار المراجعة")} value={formatNumber(snapshots.data ?? 0)} />
        <Stat label={t("دفعات متنازع عليها")} value={formatNumber(disputed.data ?? 0)} />
      </div>
      <Card title={t("اختصارات")}>
        <div className="row">
          <Link className="btn" to="registrations">{t("طابور الطلبات")}</Link>
          <Link className="btn secondary" to="snapshots">{t("مراجعة البيانات")}</Link>
          <Link className="btn secondary" to="deliveries">{t("الدفعات")}</Link>
        </div>
      </Card>
    </div>
  );
}
