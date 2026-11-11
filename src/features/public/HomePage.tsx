import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense, useState } from 'react';
import { api } from '../../api/client';
import type { PublicMap as PublicMapData, PublicStats } from '../../api/types';
import { ButtonLink } from '../../components/Button';
import { Card, Stat } from '../../components/Card';
import { Empty, ErrorNotice, Spinner } from '../../components/State';
import { currentMonth, formatDateTime, formatLiters, formatNumber } from '../../lib/format';
import { DonorStrip } from './DonorStrip';
import { HeroImage } from './HeroImage';
import { t } from '../../i18n';

const PublicMap = lazy(() => import('./PublicMap'));

export function HomePage() {
  const [month, setMonth] = useState(currentMonth());
  const stats = useQuery({ queryKey: ['public', 'stats'], queryFn: () => api.public<PublicStats>('/public/stats') });
  const map = useQuery({ queryKey: ['public', 'map', month], queryFn: () => api.public<PublicMapData>('/public/map', { month }) });
  const s = stats.data;

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy stack">
            <h1>{t("قطرة: توزيع المياه بحسب الاحتياج")}</h1>
            <p>{t("منصة تنسّق توزيع مياه الشرب المفلترة على مخيمات غزة. تقترح الخوارزمية، وتقرّر المؤسسة، ويؤكد مدير المخيم الاستلام.")}</p>
            <div className="row">
              <ButtonLink to="/register" variant="secondary">{t("سجّل جهتك")}</ButtonLink>
              <ButtonLink to="/donate">{t("تبرّع")}</ButtonLink>
            </div>
          </div>
          <HeroImage />
        </div>
      </section>

      <div className="container stack" style={{ marginTop: '1.5rem' }}>
        {stats.error ? <ErrorNotice error={stats.error} /> : (
          <div className="grid cols-3">
            <Stat label={t("مخيمات مسجّلة")} value={formatNumber(s?.camps)} />
            <Stat label={t("مؤسسات ومبادرات")} value={formatNumber(s?.organizations.total)} />
            <Stat label={t("مياه مؤكدة الاستلام")} value={formatLiters(s?.confirmedLiters)} />
            <Stat label={t("قيد التأكيد")} value={formatLiters(s?.pendingLiters)} />
          </div>
        )}
        {s && (
          <p className="muted small">
            {t('محلية: {0} • دولية: {1} • مبادرات: {2}', [s.organizations.byType.LOCAL_ORG, s.organizations.byType.INTERNATIONAL_ORG, s.organizations.byType.INITIATIVE])}
            {s.lastUpdate && <> {t("• آخر تحديث {0}", [formatDateTime(s.lastUpdate)])}</>}
          </p>
        )}

        <Card
          title={t("خريطة التوزيع")}
          actions={<label className="row small">{t("الشهر")} <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} /></label>}
        >
          <div className="legend" style={{ marginBottom: '.75rem' }}>
            <span><i className="dot" style={{ background: '#138a52' }} />{t("مؤكد")}</span>
            <span><i className="dot" style={{ background: '#d98a00' }} />{t("قيد التأكيد")}</span>
            <span><i className="dot" style={{ background: '#0b63b5' }} />{t("مخطط")}</span>
          </div>
          {map.isLoading ? <Spinner /> : map.error ? <ErrorNotice error={map.error} /> : map.data?.camps.length ? (
            <Suspense fallback={<Spinner />}><PublicMap camps={map.data.camps} /></Suspense>
          ) : <Empty>{t("لا توجد مخيمات منشورة على الخريطة بعد")}</Empty>}
          <p className="muted small" style={{ marginTop: '.75rem' }}>
            {t("الأرقام العامة تفصل «المؤكد» عن «قيد التأكيد»، والإحداثيات مقرّبة لحماية المواقع.")}
          </p>
        </Card>

        <DonorStrip />
      </div>
    </>
  );
}
