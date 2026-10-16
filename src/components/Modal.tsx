import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from './Button';
import { TextArea } from './Field';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const titleId = useId();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

interface ReasonProps {
  title: string;
  label?: string;
  submitLabel: string;
  required?: boolean;
  danger?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<unknown> | void;
}

/** Dialog that asks for a free-text reason (rejections, suspensions, corrections) */
export function ReasonModal({ title, label = 'السبب', submitLabel, required = true, danger, onClose, onSubmit }: ReasonProps) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(reason.trim());
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit}>
        <TextArea label={label} value={reason} onChange={(e) => setReason(e.target.value)} required={required} minLength={required ? 3 : undefined} autoFocus />
        <div className="row">
          <Button type="submit" variant={danger ? 'danger' : 'primary'} loading={busy}>{submitLabel}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Modal>
  );
}
