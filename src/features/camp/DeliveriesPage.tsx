import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, downloadCsv } from '../../api/client';
import type { Delivery, DeliveryStatus, Paginated } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { SelectField, TextArea, TextField } from '../../components/Field';
import { Modal, ReasonModal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { formatDate, formatLiters } from '../../lib/format';
import { deliveryStatus, entityTypeLabel } from '../../lib/labels';
import { usePage } from '../../lib/usePage';
import { t } from '../../i18n';

/** Confirm with the same quantity, or with a different quantity plus a mandatory reason */
function ConfirmModal({ delivery, onClose, onDone }: { delivery: Delivery; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [received, setReceived] = useState(String(delivery.sentLiters));
  const [reason, setReason] = useState('');
  const differs = Number(received) !== delivery.sentLiters;

  const confirm = useMutation({
    mutationFn: () => api.post(`/camp/deliveries/${delivery.id}/confirm`, { receivedLiters: Number(received), reason: differs ? reason : undefined }),
    onSuccess: () => { toast.success(t("تم تسجيل الاستلام")); onDone(); onClose(); },
    onError: toast.error,
  });

  function submit(e: FormEvent) { e.preventDefault(); confirm.mutate(); }

  return (
    <Modal title={t("تأكيد الاستلام")} onClose={onClose}>
      <form onSubmit={submit}>
        <p>{t("الكمية المرسلة:")} <strong>{formatLiters(delivery.sentLiters)}</strong></p>
        <TextField label={t("الكمية المستلمة فعليًا (لتر)")} type="number" min={0} required value={received} onChange={(e) => setReceived(e.target.value)} />
        {differs && <TextArea label={t("سبب الاختلاف")} required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} />}
        <div className="row">
          <Button type="submit" loading={confirm.isPending}>{differs ? t("تأكيد بفرق") : t("تأكيد الاستلام")}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>{t("إلغاء")}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function CampDeliveriesPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') ?? '') as DeliveryStatus | '';
  const { page, setPage, reset } = usePage();
  const [confirming, setConfirming] = useState<Delivery | null>(null);
  const [rejecting, setRejecting] = useState<Delivery | null>(null);

  const query = useQuery({ queryKey: ['camp', 'deliveries', page, status], queryFn: () => api.get<Paginated<Delivery>>('/camp/deliveries', { page, status }) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['camp'] });

  return (
    <div className="stack">
      <PageHeader
        title={t("الدفعات الواردة")}
        actions={<Button variant="secondary" small onClick={() => downloadCsv('/camp/deliveries/export', { status }, 'incoming-deliveries.csv').catch(toast.error)}>{t("تصدير CSV")}</Button>}
      />
      <Card>
        <SelectField label={t("الحالة")} value={status} onChange={(e) => { setParams(e.target.value ? { status: e.target.value } : {}); reset(); }}>
          <option value="">{t("الكل")}</option>
          {(['PENDING', 'CONFIRMED', 'CONFIRMED_DIFF', 'REJECTED', 'CANCELLED'] as const).map((s) => <option key={s} value={s}>{deliveryStatus(s).text}</option>)}
        </SelectField>
        <QueryState loading={query.isLoading} error={query.error}>
          {query.data && (
            <>
              <DataTable
                rows={query.data.items}
                rowKey={(d) => d.id}
                columns={[
                  { header: t("التاريخ"), render: (d) => formatDate(d.sentAt) },
                  { header: t("من"), render: (d) => <>{d.from.name}<div className="small muted">{entityTypeLabel(d.from.orgType)}</div></> },
                  { header: t("الخطة"), render: (d) => d.plan?.name ?? '—' },
                  { header: t("المرسل"), render: (d) => formatLiters(d.sentLiters) },
                  { header: t("المستلم"), render: (d) => formatLiters(d.receivedLiters) },
                  { header: t("الجهة المنفذة"), render: (d) => d.executor },
                  { header: t("الحالة"), render: (d) => <><Badge label={deliveryStatus(d.status)} />{d.frozen && <div className="small muted">{t("مجمّدة")}</div>}</> },
                  {
                    header: t("إجراء"),
                    render: (d) => d.status === 'PENDING' && !d.frozen ? (
                      <div className="row">
                        <Button small onClick={() => setConfirming(d)}>{t("قبول")}</Button>
                        <Button small variant="danger" onClick={() => setRejecting(d)}>{t("رفض")}</Button>
                      </div>
                    ) : d.proofUrl ? <a href={d.proofUrl} target="_blank" rel="noopener noreferrer">{t("الإثبات")}</a> : null,
                  },
                ]}
              />
              <Pagination meta={query.data.meta} onPage={setPage} />
            </>
          )}
        </QueryState>
      </Card>
      {confirming && <ConfirmModal delivery={confirming} onClose={() => setConfirming(null)} onDone={refresh} />}
      {rejecting && (
        <ReasonModal
          title={t("رفض الدفعة")} submitLabel={t("رفض")} danger
          onClose={() => setRejecting(null)}
          onSubmit={(reason) => api.post(`/camp/deliveries/${rejecting.id}/reject`, { reason }).then(() => { toast.success(t("تم رفض الدفعة")); refresh(); }).catch((e) => { toast.error(e); throw e; })}
        />
      )}
    </div>
  );
}
