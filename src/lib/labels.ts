/** Arabic labels for backend enums, plus the badge tone for each status */
export type Tone = '' | 'ok' | 'warn' | 'danger';
export interface Label { text: string; tone: Tone }

export const ENTITY_TYPES = [
  { value: 'CAMP', label: 'مخيم' },
  { value: 'LOCAL_ORG', label: 'مؤسسة محلية' },
  { value: 'INTERNATIONAL_ORG', label: 'مؤسسة دولية' },
  { value: 'INITIATIVE', label: 'مبادرة / مبادر' },
] as const;

export const ORG_TYPES = ENTITY_TYPES.filter((t) => t.value !== 'CAMP');

export const entityTypeLabel = (v: string): string => ENTITY_TYPES.find((t) => t.value === v)?.label ?? v;

const make = (map: Record<string, Label>) => (v: string): Label => map[v] ?? { text: v, tone: '' };

export const deliveryStatus = make({
  PENDING: { text: 'قيد التأكيد', tone: 'warn' },
  CONFIRMED: { text: 'مؤكدة', tone: 'ok' },
  CONFIRMED_DIFF: { text: 'مؤكدة بفرق', tone: 'warn' },
  REJECTED: { text: 'مرفوضة', tone: 'danger' },
  CANCELLED: { text: 'ملغاة', tone: '' },
});

export const requestStatus = make({
  PENDING: { text: 'قيد الاعتماد', tone: 'warn' },
  APPROVED: { text: 'مقبول', tone: 'ok' },
  REJECTED: { text: 'مرفوض', tone: 'danger' },
});

export const planStatus = make({
  PROPOSED: { text: 'مقترحة', tone: 'warn' },
  APPROVED: { text: 'معتمدة', tone: 'ok' },
  IN_PROGRESS: { text: 'قيد التنفيذ', tone: '' },
  COMPLETED: { text: 'مكتملة', tone: 'ok' },
});

export const entityStatus = make({
  ACTIVE: { text: 'نشط', tone: 'ok' },
  SUSPENDED: { text: 'موقوف', tone: 'danger' },
});

export const reviewStatus = make({
  PENDING: { text: 'قيد المراجعة', tone: 'warn' },
  APPROVED: { text: 'معتمد', tone: 'ok' },
  REJECTED: { text: 'مرفوض', tone: 'danger' },
});

export const WARNING_LABELS: Record<string, string> = {
  NO_APPROVED_SNAPSHOT: 'لا توجد بيانات معتمدة',
  STALE_DATA: 'بيانات قديمة',
  MISSING_DISTRIBUTION_DATE: 'تاريخ آخر توزيع غير معروف',
};
