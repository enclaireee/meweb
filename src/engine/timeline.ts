import type { Comp, Ease, Pose, SpriteSheet, Track } from './types';

const PROPS = ['x', 'y', 'scale', 'rotate', 'rotateY', 'opacity'] as const;
export const REST: Readonly<Pose> = { x: 0, y: 0, scale: 1, rotate: 0, rotateY: 0, opacity: 1 };

export function ease(e: Ease | undefined, u: number): number {
  if (typeof e === 'function') return e(u);
  switch (e) {
    case 'in': return u * u * u;
    case 'out': return 1 - (1 - u) ** 3;
    case 'inOut': return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
    default: return u;
  }
}

/** Pure, stateless: each property interpolates between the keyframes that declare it, holding outside. */
export function evaluate(track: Track | undefined, t: number): Pose {
  const out = { ...REST };
  if (!track) return out;
  for (const p of PROPS) {
    let a, b;
    for (const k of track) {
      if (k[p] === undefined) continue;
      if (k.at <= t) a = k;
      else { b = k; break; }
    }
    if (a && b) out[p] = a[p]! + (b[p]! - a[p]!) * ease(b.ease, (t - a.at) / (b.at - a.at));
    else if (a ?? b) out[p] = (a ?? b)![p]!;
  }
  return out;
}

export type Range = { start: number; end: number };

/** Beat i owns [start, end) in screens. */
export function beatRanges(beats: readonly { screens: number }[]): Range[] {
  let a = 0;
  return beats.map((b) => ({ start: a, end: (a += b.screens) }));
}

/** Index of the beat containing s, clamped to the first/last beat. */
export function locate(ranges: readonly Range[], s: number): number {
  for (let i = 0; i < ranges.length; i++) if (s < ranges[i]!.end) return i;
  return Math.max(0, ranges.length - 1);
}

export const mountWindow = (i: number, n: number): [number, number] => [Math.max(0, i - 1), Math.min(n - 1, i + 1)];

export const pickComposition = (w: number, h: number): Comp => (h > w ? 'portrait' : 'desktop');

/** CSS px per design px when a W x H canvas covers a w x h viewport. */
export const coverScale = (w: number, h: number, W: number, H: number) => Math.max(w / W, h / H);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Reduced-motion beat opacity: each beat fades in over `fade` screens across its start; the one above covers the one below. */
export function dissolve(s: number, ranges: readonly Range[], i: number, fade = 0.3): number {
  const r = ranges[i]!;
  if (i < ranges.length - 1 && s >= r.end + fade / 2) return 0; // fully covered by the next beat
  return i === 0 ? 1 : clamp01((s - r.start + fade / 2) / fade);
}

/** Lane-local s clamped to [0, lane length in screens]. */
export const clampS = (s: number, length: number) => Math.min(Math.max(0, s), length);

/** Saved main-lane scroll -> scroll to restore, scaled if the viewport height changed meanwhile. */
export const restoreY = (saved: { y: number; unit: number }, unit: number) =>
  unit === saved.unit ? saved.y : (saved.y * unit) / saved.unit;

export function spriteFrame(sheet: SpriteSheet, distance: number, stride: number): number {
  const n = sheet.frames.length;
  return ((Math.floor(distance / stride) % n) + n) % n;
}

export function spriteTransform(sheet: SpriteSheet, i: number): string {
  const f = sheet.frames[i] ?? sheet.frames[0]!;
  return `translate3d(${-f.x}px,${-f.y}px,0)`;
}
