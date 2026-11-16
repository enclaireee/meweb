import { describe, expect, it } from 'vitest';
import { INTRO_MAX_MS, introBlend, introMs, introPlays, introProgress, type IntroEnv } from './intro';
import { REST } from './timeline';
import type { Pose, Track } from './types';

const scroll: Pose = { x: 10, y: -4, scale: 1.2, rotate: 3, rotateY: -10, opacity: 0.8 };
const track: Track = [
  { at: 0, x: -100, y: 40, scale: 0.5, rotate: -6, rotateY: 20, opacity: 0 },
  { at: 1, x: 0, y: 0, scale: 1, rotate: 0, rotateY: 0, opacity: 1 },
];

describe('introBlend', () => {
  it('adds x, y, rotate, rotateY and multiplies scale and opacity', () => {
    const p = introBlend(scroll, track, 0);
    expect(p.x).toBeCloseTo(-90);
    expect(p.y).toBeCloseTo(36);
    expect(p.rotate).toBeCloseTo(-3);
    expect(p.rotateY).toBeCloseTo(10);
    expect(p.scale).toBeCloseTo(0.6);
    expect(p.opacity).toBeCloseTo(0);
    const h = introBlend(scroll, track, 0.5);
    expect(h.x).toBeCloseTo(-40);
    expect(h.scale).toBeCloseTo(1.2 * 0.75);
    expect(h.opacity).toBeCloseTo(0.4);
  });

  it('ignores the intro track when no intro plays (null), when done (u >= 1) or without a track', () => {
    expect(introBlend(scroll, track, null)).toBe(scroll);
    expect(introBlend(scroll, track, 1)).toBe(scroll);
    expect(introBlend(scroll, track, 3)).toBe(scroll);
    expect(introBlend(scroll, undefined, 0.3)).toBe(scroll);
    expect(introBlend(scroll, [], 0.3)).toBe(scroll);
  });

  it('does not depend on the track ending neutral: done ignores it even if it ends off-rest', () => {
    const odd: Track = [{ at: 0, x: 50, opacity: 0.2 }, { at: 1, x: 30, opacity: 0.5 }];
    expect(introBlend(scroll, odd, 0.999).x).toBeCloseTo(10 + 30, 1);
    expect(introBlend(scroll, odd, 1)).toEqual(scroll);
  });

  it('keys only the declared properties (others neutral) and never mutates its input', () => {
    const before = { ...scroll };
    const p = introBlend(scroll, [{ at: 0, opacity: 0 }, { at: 1, opacity: 1 }], 0.25);
    expect(p).toEqual({ ...scroll, opacity: 0.8 * 0.25 });
    expect(scroll).toEqual(before);
    expect(introBlend(REST, track, -0.5)).toEqual(introBlend(REST, track, 0)); // clamps below 0
  });

  it('is a pure function of u (reversible)', () => {
    const a = introBlend(scroll, track, 0.7);
    introBlend(scroll, track, 0.1);
    expect(introBlend(scroll, track, 0.7)).toEqual(a);
  });
});

describe('intro timing', () => {
  it('clamps the length to (0, 2500] ms and progress to [0, 1]', () => {
    expect(introMs(undefined)).toBe(0);
    expect(introMs({ ms: 0 })).toBe(0);
    expect(introMs({ ms: -5 })).toBe(0);
    expect(introMs({ ms: 1800 })).toBe(1800);
    expect(introMs({ ms: 9000 })).toBe(INTRO_MAX_MS);
    expect(introProgress(900, 1800)).toBe(0.5);
    expect(introProgress(-10, 1800)).toBe(0);
    expect(introProgress(5000, 1800)).toBe(1);
    expect(introProgress(10, 0)).toBe(1);
  });
});

describe('introPlays', () => {
  const ok: IntroEnv = {
    initialLane: 'main', lane: 'main', scrollY: 0, hash: '', reducedMotion: false, introWait: true, ms: 1800,
  };

  it('plays on the main lane at the top, no hash, full motion, intro-wait set and an intro defined', () => {
    expect(introPlays(ok)).toBe(true);
    expect(introPlays({ ...ok, scrollY: 1.5 })).toBe(true);
  });

  it.each<[string, Partial<IntroEnv>]>([
    ['projects deep link', { initialLane: 'projects' }],
    ['lane already flipped', { lane: 'projects' }],
    ['initialS given', { initialS: 0 }],
    ['initialFocusId given', { initialFocusId: 'p1' }],
    ['loaded off the top (scroll restoration)', { scrollY: 2 }],
    ['hash deep link', { hash: '#experience' }],
    ['reduced motion', { reducedMotion: true }],
    ['no intro-wait class', { introWait: false }],
    ['beat 0 has no intro', { ms: 0 }],
  ])('does not play: %s', (_, patch) => {
    expect(introPlays({ ...ok, ...patch })).toBe(false);
  });
});
