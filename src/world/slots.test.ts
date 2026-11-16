import { describe, expect, it } from 'vitest';
import { D, ROW_STAGGER, seq, slots, visibleAt } from './slots';

describe('slots', () => {
  it('spaces entries so the gap is at least the reveal duration', () => {
    const at = slots(4, 0.1, 0.15, 0.02);
    for (let i = 1; i < at.length; i++) expect(at[i]! - (at[i - 1]! + 0.15)).toBeGreaterThanOrEqual(D);
  });
  it('never shows two entries of one slot at once (60 stops per beat, every beat config in use)', () => {
    for (const [n, from, w, gap] of [[2, 0.12, 0.24, 0.06], [2, 0.14, 0.24, 0.06], [4, 0.1, 0.15, 0.035], [2, 0.05, 0.31, 0.06], [4, 0.08, 0.16, 0.0]] as const) {
      const at = slots(n, from, w, gap);
      for (let k = 0; k <= 600; k++) expect(visibleAt(k / 600, at, w).length).toBeLessThanOrEqual(1);
    }
  });
  it('the enter cascade of a later row still starts after the previous entry left', () => {
    const at = slots(3, 0.1, 0.2);
    // Previous entry's rows all exit together by a + w + D; next row 0 starts at a' (row i at a' + i * ROW_STAGGER).
    for (let i = 1; i < at.length; i++) expect(at[i]!).toBeGreaterThanOrEqual(at[i - 1]! + 0.2 + D);
    expect(ROW_STAGGER).toBeLessThan(D);
  });
  it('seq spreads n starts over [from, to]', () => {
    expect(seq(3, 0, 1)).toEqual([0, 0.5, 1]);
    expect(seq(1, 0.2, 0.9)).toEqual([0.2]);
  });
});
