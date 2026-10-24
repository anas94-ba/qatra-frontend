import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { AppNotification, Paginated } from '../../api/types';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/Card';
import { Pagination } from '../../components/Pagination';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { formatDateTime } from '../../lib/format';
import { usePage } from '../../lib/usePage';
import { useState } from 'react';

/** Shared by the camp, organization and admin dashboards */
export function NotificationsPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const { page, setPage, reset } = usePage();
  const [unread, setUnread] = useState(false);
  const query = useQuery({
    queryKey: ['notifications', 'list', page, unread],
    queryFn: () => api.get<Paginated<AppNotification>>('/notifications', { page, unread }),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ['notifications'] });
  const markAll = useMutation({ mutationFn: () => api.post('/notifications/read-all'), onSuccess: refresh, onError: toast.error });
  const markOne = useMutation({ mutationFn: (id: string) => api.patch(`/notifications/${id}/read`), onSuccess: refresh, onError: toast.error });

  return (
    <div className="stack">
      <PageHeader
        title="الإشعارات"
        actions={
          <div className="row">
            <label className="row small"><input type="checkbox" checked={unread} onChange={(e) => { setUnread(e.target.checked); reset(); }} /> غير المقروءة فقط</label>
            <Button variant="secondary" small onClick={() => markAll.mutate()}>تعليم الكل كمقروء</Button>
          </div>
        }
      />
      <QueryState loading={query.isLoading} error={query.error} empty={query.data?.items.length === 0}>
        {query.data && (
          <>
            <div className="stack">
              {query.data.items.map((n) => (
                <div key={n.id} className="card" style={{ borderInlineStart: n.readAt ? undefined : '4px solid var(--brand-500)' }}>
                  <div className="row between">
                    <strong>{n.title}</strong>
                    <span className="muted small">{formatDateTime(n.createdAt)}</span>
                  </div>
                  <p style={{ margin: '.25rem 0 0' }}>{n.body}</p>
                  {!n.readAt && <Button variant="ghost" small onClick={() => markOne.mutate(n.id)}>تعليم كمقروء</Button>}
                </div>
              ))}
            </div>
            <Pagination meta={query.data.meta} onPage={setPage} />
          </>
        )}
      </QueryState>
    </div>
  );
}
