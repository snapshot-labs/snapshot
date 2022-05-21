import { describe, expect, it } from 'vitest';
import { calcFromSeconds, calcToSeconds } from './utils';

describe('calcFromSeconds', () => {
  it('should return 3 for seconds from 10800 to 14399 and unit h', () => {
    expect(calcFromSeconds(60 * 60 * 3, 'h')).toBe(3);
    expect(calcFromSeconds(60 * 60 * 4 - 1, 'h')).toBe(3);
  });

  it('should return 3 for seconds from 259200 to 345599 and unit d', () => {
    expect(calcFromSeconds(60 * 60 * 24 * 3, 'd')).toBe(3);
    expect(calcFromSeconds(60 * 60 * 24 * 4 - 1, 'd')).toBe(3);
  });

  it('should return 3600 for 1 hour and 5400 for 1.5 hours', () => {
    expect(calcToSeconds(1, 'h')).toBe(3600);
    expect(calcToSeconds(1.5, 'h')).toBe(5400);
  });

  it('should return 86400 for 1 day and 129600 for 1.5 days', () => {
    expect(calcToSeconds(1, 'd')).toBe(86400);
    expect(calcToSeconds(1.5, 'd')).toBe(129600);
  });
});
