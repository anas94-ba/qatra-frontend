import { currentMonth, formatDate, formatLiters, formatNumber, todayInGaza } from './format';

describe('format', () => {
  it('formats numbers and liters', () => {
    expect(formatNumber(12345)).toBe('12,345');
    expect(formatLiters(1500)).toBe('1,500 لتر');
    expect(formatNumber(null)).toBe('—');
  });

  it('returns a dash for invalid dates', () => {
    expect(formatDate('not-a-date')).toBe('—');
    expect(formatDate(null)).toBe('—');
  });

  it('computes today in Gaza time near midnight', () => {
    expect(todayInGaza(new Date('2026-11-03T22:30:00Z'))).toBe('2026-11-04');
    expect(todayInGaza(new Date('2026-11-03T21:30:00Z'))).toBe('2026-11-03');
  });

  it('derives the current month', () => {
    expect(currentMonth()).toMatch(/^\d{4}-\d{2}$/);
  });
});
