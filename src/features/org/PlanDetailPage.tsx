import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';
import type { CoordinationRow, PlanStatus, Plan, Recommendation, RecommendationsResponse } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { formatDate, formatLiters } from '../../lib/format';
import { entityTypeLabel, planStatus, WARNING_LABELS } from '../../lib/labels';

/** Allowed plan transitions, mirrored from the API (PROPOSED -> APPROVED -> IN_PROGRESS -> COMPLETED) */
const NEXT: Record<PlanStatus, { to: PlanStatus; label: string } | null> = {
  PROPOSED: { to: 'APPROVED', label: 'اعتماد الخطة' },
  APPROVED: { to: 'IN_PROGRESS', label: 'بدء التنفيذ' },
  IN_PROGRESS: { to: 'COMPLETED', label: 'إنهاء الخطة' },
  COMPLETED: null,
};

interface Edit { liters: string; reason: string }

export function PlanDetailPage() {
  const { id = '' } = useParams();
  const toast = useToast();
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, Edit>>({});

  const plan = useQuery({ queryKey: ['org', 'plan', id], queryFn: () => api.get<Plan>(`/org/plans/${id}`) });
  const recs = useQuery({ queryKey: ['org', 'plan', id, 'recs'], queryFn: () => api.get<RecommendationsResponse>(`/org/plans/${id}/recommendations`) });
  const coordination = useQuery({ queryKey: ['org', 'plan', id, 'coordination'], queryFn: () => api.get<CoordinationRow[]>(`/org/plans/${id}/coordination`) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['org', 'plan', id] });

  const generate = useMutation({
    mutationFn: () => api.post<RecommendationsResponse>(`/org/plans/${id}/recommendations`),
    onSuccess: (r) => { toast.success(r.undistributed ? `تم الحساب. يبقى ${formatLiters(r.undistributed)} غير موزّع` : 'تم حساب التوصيات'); setEdits({}); refresh(); },
    onError: toast.error,
  });
  const transition = useMutation({
    mutationFn: (to: PlanStatus) => api.post(`/org/plans/${id}/transition`, { to }),
    onSuccess: () => { toast.success('تم تحديث حالة الخطة'); refresh(); },
    onError: toast.error,
  });
  const approve = useMutation({
    mutationFn: (items: { recommendationId: string; approvedLiters?: number; adjustmentReason?: string }[]) => api.post<{ warnings: string[] }>(`/org/plans/${id}/approvals`, { items }),
    onSuccess: (r) => { toast.success(r.warnings[0] ?? 'تم اعتماد الكميات'); setEdits({}); refresh(); },
    onError: toast.error,
  });

  const items = recs.data?.items ?? [];
  const pending = items.filter((r) => !r.approval);

  /** Builds the approval payload; an adjusted quantity must carry a reason (also enforced by the API) */
  function approveAll() {
    const payload = [];
    for (const r of pending) {
      const e = edits[r.id];
      const changed = e && e.liters !== '' && Number(e.liters) !== r.suggestedLiters;
      if (changed && (e.reason ?? '').trim().length < 3) return toast.error(new Error(`سبب التعديل مطلوب للمخيم «${r.camp?.name}»`));
      payload.push(changed ? { recommendationId: r.id, approvedLiters: Number(e.liters), adjustmentReason: e.reason.trim() } : { recommendationId: r.id });
    }
    approve.mutate(payload);
  }

  const setEdit = (r: Recommendation, patch: Partial<Edit>) => setEdits((m) => ({ ...m, [r.id]: { liters: String(r.suggestedLiters), reason: '', ...m[r.id], ...patch } }));
  const next = plan.data ? NEXT[plan.data.status] : null;

  return (
    <div className="stack">
      <PageHeader
        title={plan.data?.name ?? 'الخطة'}
        subtitle={plan.data ? `${formatDate(plan.data.startDate)} ← ${formatDate(plan.data.endDate)} • ${formatLiters(plan.data.dailyLiters)} يوميًا` : undefined}
        actions={plan.data && <div className="row"><Badge label={planStatus(plan.data.status)} />{next && <Button small onClick={() => transition.mutate(next.to)}>{next.label}</Button>}</div>}
      />
      <QueryState loading={plan.isLoading} error={plan.error}>
        <Card
          title="التوصيات"
          actions={plan.data?.status !== 'COMPLETED' && !items.some((r) => r.approval) ? <Button small loading={generate.isPending} onClick={() => generate.mutate()}>{items.length ? 'إعادة الحساب' : 'تشغيل التوصية'}</Button> : undefined}
        >
          <p className="notice small">{recs.data?.disclaimer ?? 'التوصيات تعكس البيانات المسجلة فقط، والقرار النهائي للمؤسسة.'}</p>
          <QueryState loading={recs.isLoading} error={recs.error} empty={!items.length}>
            <DataTable
              rows={items}
              rowKey={(r) => r.id}
              columns={[
                { header: 'المخيم', render: (r) => <>{r.camp?.name}<div className="small muted">{r.camp?.region}</div></> },
                { header: 'مؤشر الاحتياج', render: (r) => r.score.toFixed(2) },
                { header: 'المقترح', render: (r) => formatLiters(r.suggestedLiters) },
                {
                  header: 'المعتمد',
                  render: (r) => r.approval ? (
                    <>{formatLiters(r.approval.approvedLiters)}{r.approval.adjustmentReason && <div className="small muted">{r.approval.adjustmentReason}</div>}</>
                  ) : (
                    <div style={{ minWidth: 170 }}>
                      <input aria-label="الكمية المعتمدة" type="number" min={0} style={{ width: '100%' }} value={edits[r.id]?.liters ?? r.suggestedLiters} onChange={(e) => setEdit(r, { liters: e.target.value })} />
                      {edits[r.id] && Number(edits[r.id].liters) !== r.suggestedLiters && (
                        <input aria-label="سبب التعديل" placeholder="سبب التعديل (إلزامي)" style={{ width: '100%', marginTop: 4 }} value={edits[r.id].reason} onChange={(e) => setEdit(r, { reason: e.target.value })} />
                      )}
                    </div>
                  ),
                },
                {
                  header: 'السبب',
                  render: (r) => (
                    <>
                      <span className="small">{r.reasons.text}</span>
                      {r.warnings.map((w) => <div key={w}><span className="badge warn">{WARNING_LABELS[w] ?? w}</span></div>)}
                    </>
                  ),
                },
              ]}
            />
            {pending.length > 0 && <div style={{ marginTop: '1rem' }}><Button loading={approve.isPending} onClick={approveAll}>اعتماد الكميات</Button></div>}
          </QueryState>
        </Card>

        <Card title="ما وصل المخيمات من جهات أخرى (آخر 30 يومًا)">
          <p className="small muted">النوع والكمية والتاريخ فقط، من الدفعات المؤكدة، ودون أسماء الجهات.</p>
          <QueryState loading={coordination.isLoading} error={coordination.error} empty={!coordination.data?.length}>
            <DataTable
              rows={coordination.data ?? []}
              rowKey={(c) => c.campId}
              columns={[
                { header: 'المخيم', render: (c) => c.campName },
                { header: 'المجموع', render: (c) => formatLiters(c.totalLiters) },
                { header: 'التفاصيل', render: (c) => c.deliveries.length ? c.deliveries.map((d, i) => <div key={i} className="small">{entityTypeLabel(d.orgType)} • {formatLiters(d.liters)} • {formatDate(d.date)}</div>) : <span className="muted small">لا شيء</span> },
              ]}
            />
          </QueryState>
        </Card>
      </QueryState>
    </div>
  );
}
