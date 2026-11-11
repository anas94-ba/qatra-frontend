import { getLang, t } from '../i18n';

const NUM = new Intl.NumberFormat('en-US');
const dateLocale = () => (getLang() === 'en' ? 'en-GB' : 'ar-PS-u-nu-latn');
const DATE_FORMATS = new Map<string, Intl.DateTimeFormat>();

/** Intl formatters are created once per locale and style */
function dateFormat(style: 'date' | 'datetime'): Intl.DateTimeFormat {
  const key = `${dateLocale()}|${style}`;
  let f = DATE_FORMATS.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(dateLocale(), style === 'date' ? { year: 'numeric', month: 'short', day: 'numeric' } : { dateStyle: 'medium', timeStyle: 'short' });
    DATE_FORMATS.set(key, f);
  }
  return f;
}

export const formatNumber = (n: number | null | undefined): string => (n == null ? '—' : NUM.format(n));
export const formatLiters = (n: number | null | undefined): string => (n == null ? '—' : t('{0} لتر', [NUM.format(n)]));

function format(value: string | Date | null | undefined, style: 'date' | 'datetime'): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? '—' : dateFormat(style).format(d);
}

export const formatDate = (value: string | Date | null | undefined): string => format(value, 'date');
export const formatDateTime = (value: string | Date | null | undefined): string => format(value, 'datetime');

/** Today as YYYY-MM-DD in Gaza time (the server remains the source of truth for date rules) */
export function todayInGaza(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Gaza', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export const currentMonth = (): string => todayInGaza().slice(0, 7);
