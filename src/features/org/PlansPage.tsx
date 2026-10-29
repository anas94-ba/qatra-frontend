import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { Paginated, Plan } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { TextField } from '../../components/Field';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { formatDate, formatLiters, todayInGaza } from '../../lib/format';
import { planStatus } from '../../lib/labels';
import { usePage } from '../../lib/usePage';

const WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

interface CampOption { id: string; name: string; region: string }

function PlanForm({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const today = todayInGaza();
  const [f, setF] = useState({ name: '', dailyLiters: '', startDate: today, endDate: today });
  const [days, setDays] = useState<number[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const camps = useQuery({ queryKey: ['org', 'camps', q], queryFn: () => api.get<Paginated<CampOption>>('/org/camps', { q, pageSize: 100 }) });

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const create = useMutation({
    mutationFn: () => api.post<Plan>('/org/plans', { name: f.name, dailyLiters: Number(f.dailyLiters), startDate: f.startDate, endDate: f.endDate, campIds: selected, distributionDays: days }),
    onSuccess: () => { toast.success('أُنشئت الخطة'); qc.invalidateQueries({ queryKey: ['org'] }); onClose(); },
    onError: toast.error,
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!selected.length) return toast.error(new Error('اختر مخيمًا واحدًا على الأقل'));
    create.mutate();
  }

  return (
    <Modal title="خطة مياه جديدة" onClose={onClose}>
      <form onSubmit={submit}>
        <TextField label="اسم الخطة" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <TextField label="الكمية اليومية (لتر)" type="number" min={1} required value={f.dailyLiters} onChange={(e) => setF({ ...f, dailyLiters: e.target.value })} />
        <div className="form-grid">
          <TextField label="تاريخ البداية" type="date" min={today} required value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} hint="اليوم أو بعده (بتوقيت فلسطين)" />
          <TextField label="تاريخ النهاية" type="date" min={f.startDate} required value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} />
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: '0 0 .9rem' }}>
          <legend className="small" style={{ fontWeight: 600 }}>أيام التوزيع</legend>
          <div className="row">
            {WEEKDAYS.map((d, i) => (
              <label key={d} className="row small"><input type="checkbox" checked={days.includes(i)} onChange={() => setDays(toggle(days, i))} />{d}</label>
            ))}
          </div>
        </fieldset>
        <TextField label="المخيمات المستهدفة" placeholder="بحث بالاسم" value={q} onChange={(e) => setQ(e.target.value)} />
        <div style={{ maxHeight: 180, overflow: 'auto', marginBottom: '.9rem' }}>
          <QueryState loading={camps.isLoading} error={camps.error} empty={camps.data?.items.length === 0}>
            {camps.data?.items.map((c) => (
              <label key={c.id} className="checkbox" style={{ marginBottom: '.3rem' }}>
                <input type="checkbox" checked={selected.includes(c.id)} onChange={() => setSelected(toggle(selected, c.id))} />
                <span>{c.name} <span className="muted small">({c.region})</span></span>
              </label>
            ))}
          </QueryState>
        </div>
        <p className="small muted">المحدّد: {selected.length} مخيم</p>
        <div className="row">
          <Button type="submit" loading={create.isPending}>إنشاء</Button>
          <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Modal>
  );
}

export function PlansPage() {
  const { page, setPage } = usePage();
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: ['org', 'plans', page], queryFn: () => api.get<Paginated<Plan>>('/org/plans', { page }) });

  return (
    <div className="stack">
      <PageHeader title="خطط المياه" actions={<Button onClick={() => setOpen(true)}>خطة جديدة</Button>} />
      <Card>
        <QueryState loading={query.isLoading} error={query.error}>
          {query.data && (
            <>
              <DataTable
                rows={query.data.items}
                rowKey={(p) => p.id}
                columns={[
                  { header: 'الخطة', render: (p) => <Link to={p.id}>{p.name}</Link> },
                  { header: 'الكمية اليومية', render: (p) => formatLiters(p.dailyLiters) },
                  { header: 'الفترة', render: (p) => `${formatDate(p.startDate)} ← ${formatDate(p.endDate)}` },
                  { header: 'المخيمات', render: (p) => p._count?.planCamps ?? 0 },
                  { header: 'الحالة', render: (p) => <Badge label={planStatus(p.status)} /> },
                ]}
              />
              <Pagination meta={query.data.meta} onPage={setPage} />
            </>
          )}
        </QueryState>
      </Card>
      {open && <PlanForm onClose={() => setOpen(false)} />}
    </div>
  );
}
