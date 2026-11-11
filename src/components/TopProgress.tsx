import { useIsFetching, useIsMutating } from '@tanstack/react-query';

/** Thin animated bar at the top while any request is in flight (queries or mutations) */
export function TopProgress() {
  const busy = useIsFetching() + useIsMutating() > 0;
  return <div className={`top-progress ${busy ? 'active' : ''}`} role="progressbar" aria-hidden={!busy} aria-label="جارٍ التحميل" />;
}
