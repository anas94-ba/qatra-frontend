import type { Label } from '../lib/labels';

/** Status pill; pass the result of a label helper such as deliveryStatus(value) */
export function Badge({ label }: { label: Label }) {
  return <span className={`badge ${label.tone}`.trim()}>{label.text}</span>;
}
