import type { PageMeta } from '../api/types';
import { formatNumber } from '../lib/format';
import { Button } from './Button';

interface Props { meta: PageMeta; onPage: (page: number) => void }

/** Previous/next controls for any paginated list (backend default: 10 per page) */
export function Pagination({ meta, onPage }: Props) {
  if (meta.totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="التنقل بين الصفحات">
      <Button variant="secondary" small disabled={!meta.hasPrev} onClick={() => onPage(meta.page - 1)}>السابق</Button>
      <span className="muted small">
        صفحة {formatNumber(meta.page)} من {formatNumber(meta.totalPages)} ({formatNumber(meta.total)} نتيجة)
      </span>
      <Button variant="secondary" small disabled={!meta.hasNext} onClick={() => onPage(meta.page + 1)}>التالي</Button>
    </nav>
  );
}
