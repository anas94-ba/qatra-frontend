import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import type { DonationLinkAdmin } from '../../api/types';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/Card';
import { SelectField, TextArea, TextField } from '../../components/Field';
import { QueryState } from '../../components/State';
import { useToast } from '../../components/Toast';
import { formatDateTime } from '../../lib/format';

/** Changing the donation link requires the admin's password again and alerts the other admins by email */
export function DonationPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'donation'], queryFn: () => api.get<DonationLinkAdmin | ''>('/admin/donation-link') });
  const current = query.data || null;
  const [edit, setEdit] = useState<Partial<DonationLinkAdmin> & { password?: string }>({});
  const v = { linkType: 'WHATSAPP', url: '', whatsappNumber: '', receivingEntityName: '', description: '', isActive: false, ...current, ...edit };

  const save = useMutation({
    mutationFn: () => api.put('/admin/donation-link', {
      linkType: v.linkType, url: v.url, whatsappNumber: v.linkType === 'WHATSAPP' ? v.whatsappNumber : undefined,
      receivingEntityName: v.receivingEntityName, description: v.description, isActive: v.isActive, password: edit.password,
    }),
    onSuccess: () => { toast.success('حُفظ رابط التبرع'); setEdit({}); qc.invalidateQueries({ queryKey: ['admin', 'donation'] }); },
    onError: toast.error,
  });
  function submit(e: FormEvent) { e.preventDefault(); save.mutate(); }

  return (
    <div className="stack">
      <PageHeader title="رابط التبرع" subtitle="المنصة لا تستلم أموالًا؛ الزر يحوّل الزائر إلى الرابط المفعّل فقط" />
      <QueryState loading={query.isLoading} error={query.error}>
        <Card>
          {current && <p className="small muted">آخر فحص: {formatDateTime(current.lastVerifiedAt)} — الحالة: {current.lastStatus ?? '—'}</p>}
          <form onSubmit={submit}>
            <SelectField label="نوع الرابط" value={v.linkType} onChange={(e) => setEdit({ ...edit, linkType: e.target.value as DonationLinkAdmin['linkType'] })}>
              <option value="WHATSAPP">واتساب (wa.me)</option>
              <option value="EXTERNAL_SITE">موقع تبرع خارجي (نطاق مسموح)</option>
            </SelectField>
            <TextField label="الرابط (HTTPS)" dir="ltr" required value={v.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} hint="مثال: https://wa.me/970599123456" />
            {v.linkType === 'WHATSAPP' && <TextField label="رقم واتساب (دولي)" dir="ltr" required value={v.whatsappNumber ?? ''} onChange={(e) => setEdit({ ...edit, whatsappNumber: e.target.value })} />}
            <TextField label="اسم الجهة المستلمة" required value={v.receivingEntityName} onChange={(e) => setEdit({ ...edit, receivingEntityName: e.target.value })} />
            <TextArea label="وصف" required value={v.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
            <label className="checkbox"><input type="checkbox" checked={v.isActive} onChange={(e) => setEdit({ ...edit, isActive: e.target.checked })} /><span>مفعّل (يظهر زر التبرع)</span></label>
            <TextField label="كلمة مرورك (إعادة مصادقة)" type="password" dir="ltr" required autoComplete="current-password" value={edit.password ?? ''} onChange={(e) => setEdit({ ...edit, password: e.target.value })} />
            <Button type="submit" loading={save.isPending}>حفظ</Button>
          </form>
        </Card>
      </QueryState>
    </div>
  );
}
