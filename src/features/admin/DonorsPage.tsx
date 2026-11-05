import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import type { Donor, Paginated } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { TextField } from '../../components/Field';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { formatDate } from '../../lib/format';
import { usePage } from '../../lib/usePage';

function DonorForm({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [f, setF] = useState({ altText: '', consentGivenAt: '', consentSource: '', displayOrder: '0' });
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append('image', file);
      Object.entries(f).forEach(([k, val]) => form.append(k, k === 'consentGivenAt' ? new Date(val).toISOString() : val));
      await api.upload('/admin/donors', form);
      toast.success('أُضيف المانح (غير منشور)');
      qc.invalidateQueries({ queryKey: ['admin', 'donors'] });
      onClose();
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="إضافة مانح" onClose={onClose}>
      <form onSubmit={submit}>
        <TextField label="الصورة" type="file" accept="image/jpeg,image/png,image/webp" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} hint="WebP أو JPG أو PNG فقط (بدون SVG)، حتى 2 ميغابايت" />
        <TextField label="النص البديل (لقارئات الشاشة)" required minLength={3} value={f.altText} onChange={(e) => setF({ ...f, altText: e.target.value })} />
        <div className="form-grid">
          <TextField label="تاريخ الموافقة" type="date" required value={f.consentGivenAt} onChange={(e) => setF({ ...f, consentGivenAt: e.target.value })} />
          <TextField label="مصدر الموافقة" required value={f.consentSource} onChange={(e) => setF({ ...f, consentSource: e.target.value })} hint="مثال: رسالة بريدية بتاريخ ..." />
        </div>
        <TextField label="الترتيب" type="number" value={f.displayOrder} onChange={(e) => setF({ ...f, displayOrder: e.target.value })} />
        <div className="row"><Button type="submit" loading={busy}>إضافة</Button><Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button></div>
      </form>
    </Modal>
  );
}

export function DonorsPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const { page, setPage } = usePage();
  const [adding, setAdding] = useState(false);
  const query = useQuery({ queryKey: ['admin', 'donors', page], queryFn: () => api.get<Paginated<Donor>>('/admin/donors', { page }) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin', 'donors'] });
  const toggle = useMutation({ mutationFn: (d: Donor) => api.patch(`/admin/donors/${d.id}`, { isPublished: !d.isPublished }), onSuccess: refresh, onError: toast.error });
  const remove = useMutation({ mutationFn: (d: Donor) => api.del(`/admin/donors/${d.id}`), onSuccess: () => { toast.success('حُذف المانح'); refresh(); }, onError: toast.error });

  return (
    <div className="stack">
      <PageHeader title="المانحون" subtitle="لا تُنشر صورة مانح بدون موافقة مسجّلة" actions={<Button onClick={() => setAdding(true)}>إضافة مانح</Button>} />
      <Card>
        <QueryState loading={query.isLoading} error={query.error}>
          {query.data && (
            <>
              <DataTable rows={query.data.items} rowKey={(d) => d.id} columns={[
                { header: 'الصورة', render: (d) => <img src={d.imageUrl} alt={d.altText} style={{ height: 48, width: 48, objectFit: 'contain' }} /> },
                { header: 'النص البديل', render: (d) => d.altText },
                { header: 'الموافقة', render: (d) => <>{formatDate(d.consentGivenAt)}<div className="small muted">{d.consentSource}</div></> },
                { header: 'الترتيب', render: (d) => d.displayOrder },
                { header: 'النشر', render: (d) => <Badge label={d.isPublished ? { text: 'منشور', tone: 'ok' } : { text: 'مخفي', tone: '' }} /> },
                { header: '', render: (d) => <div className="row"><Button small variant="secondary" onClick={() => toggle.mutate(d)}>{d.isPublished ? 'إخفاء' : 'نشر'}</Button><Button small variant="danger" onClick={() => remove.mutate(d)}>حذف</Button></div> },
              ]} />
              <Pagination meta={query.data.meta} onPage={setPage} />
            </>
          )}
        </QueryState>
      </Card>
      {adding && <DonorForm onClose={() => setAdding(false)} />}
    </div>
  );
}
