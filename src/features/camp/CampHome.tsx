import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { Camp, Delivery, Paginated, Snapshot } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Card, PageHeader, Stat } from '../../components/Card';
import { QueryState } from '../../components/State';
import { formatDate, formatNumber } from '../../lib/format';
import { reviewStatus } from '../../lib/labels';
import { t } from '../../i18n';

export function CampHome() {
  const camp = useQuery({ queryKey: ['camp', 'me'], queryFn: () => api.get<Camp>('/camp/me') });
  const pending = useQuery({ queryKey: ['camp', 'deliveries', 'pending-count'], queryFn: () => api.get<Paginated<Delivery>>('/camp/deliveries', { status: 'PENDING', pageSize: 1 }) });
  const snaps = useQuery({ queryKey: ['camp', 'snapshots', 'latest'], queryFn: () => api.get<Paginated<Snapshot>>('/camp/snapshots', { pageSize: 1 }) });
  const latest = snaps.data?.items[0];

  return (
    <div className="stack">
      <PageHeader title={camp.data?.name ?? t("مخيمي")} subtitle={camp.data?.region} />
      <QueryState loading={camp.isLoading} error={camp.error}>
        <div className="grid cols-3">
          <Stat label={t("دفعات بانتظار تأكيدك")} value={formatNumber(pending.data?.meta.total ?? 0)} />
          <Stat label={t("آخر Snapshot")} value={latest ? <Badge label={reviewStatus(latest.reviewStatus)} /> : '—'} />
          <Stat label={t("تاريخ آخر تقرير")} value={latest ? formatDate(latest.reportedAt) : '—'} />
        </div>
        {(pending.data?.meta.total ?? 0) > 0 && (
          <div className="notice warn">{t("لديك دفعات لم تؤكد استلامها.")} <Link to="deliveries?status=PENDING">{t("راجعها الآن")}</Link></div>
        )}
        <Card title={t("تذكير")}>
          <p className="muted">{t("لا تُستخدم بيانات المخيم في التوصيات إلا بعد اعتماد الأدمن. حدّث بياناتك بإرسال Snapshot جديد.")}</p>
          <Link className="btn" to="snapshots">{t("إدارة بيانات المخيم")}</Link>
        </Card>
      </QueryState>
    </div>
  );
}
