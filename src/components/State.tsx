import type { ReactNode } from 'react';
import { ApiError } from '../api/client';

export const Spinner = () => <div className="spinner" role="status" aria-label="جارٍ التحميل" />;

export function ErrorNotice({ error }: { error: unknown }) {
  const message = error instanceof ApiError || error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
  return <div className="notice danger" role="alert">{message}</div>;
}

export function Empty({ children = 'لا توجد بيانات' }: { children?: ReactNode }) {
  return <p className="muted" style={{ textAlign: 'center', padding: '1.5rem 0' }}>{children}</p>;
}

/** Renders loading / error / empty states around a query result */
export function QueryState({ loading, error, empty, children }: { loading: boolean; error: unknown; empty?: boolean; children: ReactNode }) {
  if (loading) return <Spinner />;
  if (error) return <ErrorNotice error={error} />;
  if (empty) return <Empty />;
  return <>{children}</>;
}
