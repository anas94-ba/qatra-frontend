import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { DonationInfo } from '../../api/types';
import { QueryState } from '../../components/State';
import { Card } from '../../components/Card';
import { t } from '../../i18n';

/** The platform never handles money: this page only shows who receives donations, then links out */
export function DonatePage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['public', 'donation'], queryFn: () => api.public<DonationInfo>('/public/donation') });
  return (
    <div className="container stack" style={{ marginTop: '1.5rem', maxWidth: 720 }}>
      <h1>{t("التبرع")}</h1>
      <QueryState loading={isLoading} error={error}>
        {data?.available ? (
          <Card>
            <h2>{t("الجهة المستلمة: {0}", [data.receivingEntityName])}</h2>
            <p>{data.description}</p>
            {data.whatsappNumber && <p>{t("رقم واتساب:")} <strong className="ltr">{data.whatsappNumber}</strong></p>}
            <div className="notice warn" role="note">{data.warning}</div>
            <p style={{ marginTop: '1rem' }}>
              <a className="btn" href={data.url} target="_blank" rel="noopener noreferrer">
                {data.linkType === 'WHATSAPP' ? t("متابعة عبر واتساب") : t("متابعة إلى صفحة التبرع")}
              </a>
            </p>
          </Card>
        ) : (
          <div className="notice">{data?.message ?? t("التبرع عبر المنصة غير متاح حاليًا.")}</div>
        )}
      </QueryState>
    </div>
  );
}
