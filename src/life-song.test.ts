import { describe, expect, it } from 'vitest';
import { findYearIndex, shouldAnnounceProgress } from './life-song';

describe('life song timeline', () => {
  const points = [{ year: 2000 }, { year: 2001 }, { year: 2002 }];

  it('accepts only whole years present in the active series', () => {
    expect(findYearIndex(points, 2001)).toBe(1);
    expect(findYearIndex(points, 1999)).toBeNull();
    expect(findYearIndex(points, 2001.5)).toBeNull();
  });

  it('announces the start, every fifth year, and the final year', () => {
    expect(shouldAnnounceProgress(2, 2, 10)).toBe(true);
    expect(shouldAnnounceProgress(2, 6, 10)).toBe(false);
    expect(shouldAnnounceProgress(2, 7, 10)).toBe(true);
    expect(shouldAnnounceProgress(2, 10, 10)).toBe(true);
  });
});
