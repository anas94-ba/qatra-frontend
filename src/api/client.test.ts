import { buildQuery } from './client';

describe('buildQuery', () => {
  it('skips empty values', () => {
    expect(buildQuery({ page: 2, q: '', status: undefined, flag: false })).toBe('?page=2&flag=false');
  });
  it('returns an empty string without params', () => {
    expect(buildQuery()).toBe('');
    expect(buildQuery({})).toBe('');
  });
});
