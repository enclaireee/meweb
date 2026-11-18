import { describe, expect, it } from 'vitest';
import {
  beatRanges, coverScale, dissolve, ease, evaluate, locate, mountWindow, pickComposition, restoreY, restPoints, settle, spriteFrame, spriteTransform,
} from './timeline';
import type { SpriteSheet, Track } from './types';

const track: Track = [
  { at: 0, x: 0, opacity: 0 },
  { at: 0.5, x: 100, ease: 'inOut' },
  { at: 1, x: 200, opacity: 1, scale: 2 },
];

describe('evaluate', () => {
  it('returns rest pose without a track', () => {
    expect(evaluate(undefined, 0.3)).toEqual({ x: 0, y: 0, scale: 1, rotate: 0, rotateY: 0, opacity: 1 });
  });

  it('interpolates each property between the keyframes that declare it', () => {
    const p = evaluate(track, 0.5);
    expect(p.x).toBe(100);
    expect(p.opacity).toBeCloseTo(0.5); // 0 -> 1 across 0..1, linear (ease of the arriving keyframe)
    expect(p.scale).toBe(2); // only keyed at 1: held
    expect(p.y).toBe(0); // never keyed: rest
  });

  it('applies the arriving keyframe ease', () => {
    expect(evaluate(track, 0.25).x).toBeCloseTo(50); // inOut(0.5) = 0.5
    expect(evaluate(track, 0.125).x).toBeCloseTo(100 * ease('inOut', 0.25));
    expect(evaluate(track, 0.125).x).toBeLessThan(25);
    expect(evaluate([{ at: 0, x: 0 }, { at: 1, x: 1, ease: (u) => u * u }], 0.5).x).toBeCloseTo(0.25);
  });

  it('holds the first/last value out of range and accepts at < 0 and > 1', () => {
    expect(evaluate(track, -3).x).toBe(0);
    expect(evaluate(track, 7).x).toBe(200);
    const overlap: Track = [{ at: -0.2, opacity: 0 }, { at: 0, opacity: 1 }, { at: 1, opacity: 1 }, { at: 1.2, opacity: 0 }];
    expect(evaluate(overlap, -0.1).opacity).toBeCloseTo(0.5);
    expect(evaluate(overlap, 1.1).opacity).toBeCloseTo(0.5);
  });

  it('is reversible: result depends only on t, not on history', () => {
    const fresh = evaluate(track, 0.37);
    for (const t of [0.9, -1, 0.1, 2, 0.5, 0.37, 0]) evaluate(track, t);
    expect(evaluate(track, 0.37)).toEqual(fresh);
    const fwd = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => evaluate(track, t));
    const back = [1, 0.8, 0.6, 0.4, 0.2, 0].map((t) => evaluate(track, t)).reverse();
    expect(back).toEqual(fwd);
  });

  it('easings hit their endpoints', () => {
    for (const e of ['linear', 'in', 'out', 'inOut'] as const) {
      expect(ease(e, 0)).toBe(0);
      expect(ease(e, 1)).toBe(1);
    }
  });
});

describe('beat ranges', () => {
  const ranges = beatRanges([{ screens: 2 }, { screens: 1 }, { screens: 3.5 }]);

  it('maps varying screens to cumulative ranges', () => {
    expect(ranges).toEqual([{ start: 0, end: 2 }, { start: 2, end: 3 }, { start: 3, end: 6.5 }]);
  });

  it('locates the current beat, clamped', () => {
    expect(locate(ranges, -1)).toBe(0);
    expect(locate(ranges, 0)).toBe(0);
    expect(locate(ranges, 1.999)).toBe(0);
    expect(locate(ranges, 2)).toBe(1);
    expect(locate(ranges, 3.2)).toBe(2);
    expect(locate(ranges, 99)).toBe(2);
    expect(locate([], 1)).toBe(0);
  });

  it('selects the mount window current +/- 1', () => {
    expect(mountWindow(0, 10)).toEqual([0, 1]);
    expect(mountWindow(5, 10)).toEqual([4, 6]);
    expect(mountWindow(9, 10)).toEqual([8, 9]);
    expect(mountWindow(0, 1)).toEqual([0, 0]);
  });

  it('cross-dissolves beats under reduced motion', () => {
    expect(dissolve(0, ranges, 0)).toBe(1);
    expect(dissolve(2, ranges, 1)).toBeCloseTo(0.5); // mid-fade at the boundary
    expect(dissolve(1.5, ranges, 1)).toBe(0);
    expect(dissolve(2.5, ranges, 1)).toBe(1);
    expect(dissolve(3.2, ranges, 1)).toBe(0); // covered by beat 2
    expect(dissolve(99, ranges, 2)).toBe(1); // last beat never hidden
  });
});

describe('composition', () => {
  it('picks portrait only when height > width', () => {
    expect(pickComposition(1280, 800)).toBe('desktop');
    expect(pickComposition(375, 812)).toBe('portrait');
    expect(pickComposition(800, 800)).toBe('desktop');
  });

  it('cover-scales the design canvas', () => {
    expect(coverScale(1920, 1080, 1920, 1080)).toBe(1);
    expect(coverScale(375, 812, 1080, 1920)).toBeCloseTo(812 / 1920);
    expect(coverScale(1280, 400, 1920, 1080)).toBeCloseTo(1280 / 1920);
  });
});

describe('scroll restore math', () => {
  it('returns the exact y when the viewport did not change, scales otherwise', () => {
    expect(restoreY({ y: 1234.5, unit: 817 }, 817)).toBe(1234.5);
    expect(restoreY({ y: 1000, unit: 800 }, 1000)).toBe(1250);
  });
});

describe('sprite sheet', () => {
  const sheet: SpriteSheet = {
    src: '/s.webp', anchor: { x: 16, y: 60 },
    frames: [0, 1, 2, 3].map((i) => ({ x: i * 32, y: 0, w: 32, h: 64 })),
  };
  it('derives frame from distance, reversibly and for negative distance', () => {
    expect(spriteFrame(sheet, 0, 40)).toBe(0);
    expect(spriteFrame(sheet, 39, 40)).toBe(0);
    expect(spriteFrame(sheet, 40, 40)).toBe(1);
    expect(spriteFrame(sheet, 170, 40)).toBe(0);
    expect(spriteFrame(sheet, -1, 40)).toBe(3);
  });
  it('translates the sheet to the frame', () => {
    expect(spriteTransform(sheet, 2)).toBe('translate3d(-64px,0px,0)');
  });
});

describe('restPoints / settle', () => {
  const r = beatRanges([{ screens: 2 }, { screens: 2 }]);
  const pts = restPoints([{ rests: [0] }, { rests: [0.25, 0.75] }], r); // 0, 2.5, 3.5
  it('maps local rests to lane screens, default mid-beat', () => {
    expect(pts).toEqual([0, 2.5, 3.5]);
    expect(restPoints([{}, { still: 0.4 }], r)).toEqual([1, 2.8]);
  });
  it('stays put at a rest point', () => {
    expect(settle(pts, 2.5, 1)).toBeNull();
    expect(settle(pts, 2.502, -1)).toBeNull();
  });
  it('goes on to the next rest point in the scroll direction', () => {
    expect(settle(pts, 0.3, 1)).toBe(2.5);
    expect(settle(pts, 2.4, 1)).toBe(2.5);
    expect(settle(pts, 2.4, -1)).toBe(0);
    expect(settle(pts, 3.0, -1)).toBe(2.5);
  });
  it('backs out of a tiny drift, picks the nearer one without a direction, clamps past the ends', () => {
    expect(settle(pts, 0.02, 1)).toBe(0);
    expect(settle(pts, 3.48, -1)).toBe(3.5);
    expect(settle(pts, 2.9, 0)).toBe(2.5);
    expect(settle(pts, 3.9, 1)).toBe(3.5);
  });
});
