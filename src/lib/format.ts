const NUM = new Intl.NumberFormat('en-US');
const DATE = new Intl.DateTimeFormat('ar-PS-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' });
const DATE_TIME = new Intl.DateTimeFormat('ar-PS-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' });

export const formatNumber = (n: number | null | undefined): string => (n == null ? '—' : NUM.format(n));
export const formatLiters = (n: number | null | undefined): string => (n == null ? '—' : `${NUM.format(n)} لتر`);

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? '—' : DATE.format(d);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? '—' : DATE_TIME.format(d);
}

/** Today as YYYY-MM-DD in Gaza time (the server remains the source of truth for date rules) */
export function todayInGaza(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Gaza', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export const currentMonth = (): string => todayInGaza().slice(0, 7);
