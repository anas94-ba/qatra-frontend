import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { t } from '../i18n';

/** Thin animated bar at the top while any request is in flight (queries or mutations) */
export function TopProgress() {
  const busy = useIsFetching() + useIsMutating() > 0;
  return <div className={`top-progress ${busy ? 'active' : ''}`} role="progressbar" aria-hidden={!busy} aria-label={t("جارٍ التحميل")} />;
}
