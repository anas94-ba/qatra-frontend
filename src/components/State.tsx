import type { ReactNode } from 'react';
import { ApiError } from '../api/client';
import { t } from '../i18n';

export const Spinner = () => <div className="spinner" role="status" aria-label={t("جارٍ التحميل")} />;

/** Full-screen loader (app start, session check, lazy route chunks) so the page is never blank */
export function PageLoader({ inline }: { inline?: boolean }) {
  return (
    <div className={`page-loader ${inline ? 'inline' : ''}`} role="status" aria-live="polite">
      <img src="/logo.png" alt="" />
      <div className="spinner" />
      <span className="muted small">{t("جارٍ التحميل")}</span>
    </div>
  );
}

export function ErrorNotice({ error }: { error: unknown }) {
  const message = error instanceof ApiError || error instanceof Error ? error.message : t("حدث خطأ غير متوقع");
  return <div className="notice danger" role="alert">{message}</div>;
}

export function Empty({ children = t("لا توجد بيانات") }: { children?: ReactNode }) {
  return <p className="muted" style={{ textAlign: 'center', padding: '1.5rem 0' }}>{children}</p>;
}

/** Renders loading / error / empty states around a query result */
export function QueryState({ loading, error, empty, children }: { loading: boolean; error: unknown; empty?: boolean; children: ReactNode }) {
  if (loading) return <Spinner />;
  if (error) return <ErrorNotice error={error} />;
  if (empty) return <Empty />;
  return <>{children}</>;
}
