import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import type { AlgorithmConfig } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { TextField } from '../../components/Field';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { formatDateTime } from '../../lib/format';
import { t } from '../../i18n';

const WEIGHT_LABELS = { gap: 'الفجوة', vulnerability: 'الهشاشة (أطفال/إعاقة)', daysSince: 'المدة منذ آخر توزيع', population: 'السكان' } as const;
type WeightKey = keyof typeof WEIGHT_LABELS;

/** Every change creates a new version; recommendations already generated keep their original version */
export function AlgorithmPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'algorithm'], queryFn: () => api.get<AlgorithmConfig[]>('/admin/algorithm-config') });
  const active = query.data?.find((c) => c.isActive);
  const [weights, setWeights] = useState<Record<WeightKey, string> | null>(null);
  const [lpcd, setLpcd] = useState<string | null>(null);

  const w = weights ?? (active ? Object.fromEntries(Object.entries(active.weights).map(([k, v]) => [k, String(v)])) as Record<WeightKey, string> : null);
  const ref = lpcd ?? (active ? String(active.referenceLpcd) : '');

  const save = useMutation({
    mutationFn: () => api.post('/admin/algorithm-config', {
      weights: Object.fromEntries((Object.keys(WEIGHT_LABELS) as WeightKey[]).map((k) => [k, Number(w![k])])), referenceLpcd: Number(ref),
    }),
    onSuccess: () => { toast.success(t("أُنشئت نسخة جديدة من الإعدادات")); setWeights(null); setLpcd(null); qc.invalidateQueries({ queryKey: ['admin', 'algorithm'] }); },
    onError: toast.error,
  });
  function submit(e: FormEvent) { e.preventDefault(); save.mutate(); }

  return (
    <div className="stack">
      <PageHeader title={t("إعدادات الخوارزمية")} subtitle={t("الأوزان الأولية ليست معايير إنسانية معتمدة وتحتاج مراجعة مختص مياه")} />
      <QueryState loading={query.isLoading} error={query.error}>
        {w && (
          <Card title={t('إنشاء نسخة جديدة (الحالية: {0})', [active?.version])}>
            <form onSubmit={submit}>
              <div className="form-grid">
                {(Object.keys(WEIGHT_LABELS) as WeightKey[]).map((k) => (
                  <TextField key={k} label={t('وزن {0}', [t(WEIGHT_LABELS[k])])} type="number" min={0} max={1} step="0.05" required value={w[k]} onChange={(e) => setWeights({ ...w, [k]: e.target.value })} />
                ))}
                <TextField label={t("المستوى المرجعي (لتر/فرد/يوم)")} type="number" min={5} max={50} required value={ref} onChange={(e) => setLpcd(e.target.value)} />
              </div>
              <Button type="submit" loading={save.isPending}>{t("حفظ كنسخة جديدة")}</Button>
            </form>
          </Card>
        )}
        <Card title={t("النسخ السابقة")}>
          <DataTable rows={query.data ?? []} rowKey={(c) => String(c.version)} columns={[
            { header: t("النسخة"), render: (c) => c.version },
            { header: t("الأوزان"), render: (c) => <span className="small ltr">{JSON.stringify(c.weights)}</span> },
            { header: t("المرجعي"), render: (c) => c.referenceLpcd },
            { header: t("التاريخ"), render: (c) => formatDateTime(c.createdAt) },
            { header: '', render: (c) => c.isActive ? <Badge label={{ text: t("مفعّلة"), tone: 'ok' }} /> : null },
          ]} />
        </Card>
      </QueryState>
    </div>
  );
}
