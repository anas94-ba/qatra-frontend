import { useState } from 'react';
import { api } from '../../api/client';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';

/** "Resend verification link" button; the API always answers with a generic message */
export function ResendVerification({ email }: { email: string }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function resend() {
    setBusy(true);
    try {
      const res = await api.post<{ message: string }>('/auth/resend-verification', { email });
      toast.success(res.message);
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(false);
    }
  }

  return <Button variant="secondary" loading={busy} onClick={resend}>إعادة إرسال رابط التأكيد</Button>;
}
