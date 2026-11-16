// Pure timing helpers for scroll-staggered text (local beat progress t). No React, so they are unit-tested.

/** Default reveal duration of a slot entry (local t). Masked rows slide in over D and out over D. */
export const D = 0.05;
/** Extra local t a row waits per row index on enter (a small cascade). Exit is not staggered. */
export const ROW_STAGGER = 0.005;

/** Evenly spaced start times: n pieces between `from` and `to`. */
export const seq = (n: number, from: number, to: number) => Array.from({ length: n }, (_, i) => from + (n > 1 ? ((to - from) * i) / (n - 1) : 0));

/** Shared-slot windows for `k="one"`: n entries, each shown for `w` from `from`, back to back.
 *  The gap is never shorter than the reveal duration `d`, so entry i has fully left (its exit slide ends at
 *  a + w + d) before entry i + 1 starts to enter: two entries are never on screen together. */
export const slots = (n: number, from: number, w: number, gap = 0.06, d = D) => {
  const g = Math.max(gap, d + 0.005);
  return Array.from({ length: n }, (_, i) => from + i * (w + g));
};

/** Which entries of a slot are (partly) visible at t: entering from a, leaving from a + w, each over d. */
export const visibleAt = (t: number, at: number[], w: number, d = D) =>
  at.flatMap((a, i) => (t > a && t < a + w + d ? [i] : []));

/** "02 / 03" */
export const count = (i: number, n: number) => `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
