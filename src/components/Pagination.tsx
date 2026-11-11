import type { PageMeta } from '../api/types';
import { formatNumber } from '../lib/format';
import { Button } from './Button';
import { t } from '../i18n';

interface Props { meta: PageMeta; onPage: (page: number) => void }

/** Previous/next controls for any paginated list (backend default: 10 per page) */
export function Pagination({ meta, onPage }: Props) {
  if (meta.totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label={t("التنقل بين الصفحات")}>
      <Button variant="secondary" small disabled={!meta.hasPrev} onClick={() => onPage(meta.page - 1)}>{t("السابق")}</Button>
      <span className="muted small">
        {t("صفحة {0} من {1} ({2} نتيجة)", [formatNumber(meta.page), formatNumber(meta.totalPages), formatNumber(meta.total)])}
      </span>
      <Button variant="secondary" small disabled={!meta.hasNext} onClick={() => onPage(meta.page + 1)}>{t("التالي")}</Button>
    </nav>
  );
}
