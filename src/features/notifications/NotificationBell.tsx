import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

/** Notifications are polled (no WebSockets): every 3 minutes while the app is open */
const POLL_MS = 3 * 60 * 1000;

export function NotificationBell() {
  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get<{ count: number }>('/notifications/unread-count'),
    refetchInterval: POLL_MS,
  });
  const count = data?.count ?? 0;
  return (
    <Link to="notifications" className="bell btn ghost sm" aria-label={`الإشعارات${count ? `، ${count} غير مقروء` : ''}`}>
      🔔
      {count > 0 && <span className="count">{count > 99 ? '99+' : count}</span>}
    </Link>
  );
}
