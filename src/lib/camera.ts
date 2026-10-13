// Diorama camera (agents/decisions.md): one transform every plane shares, eased between per-stop presets.
// Angles in degrees, lift/dolly in art units (dolly > 0 pushes in).

export type Cam = { yaw: number; pitch: number; lift: number; dolly: number };
export type CamOpts = { compact?: boolean; reduced?: boolean; px?: number; py?: number };

/** Pulled back mid-glide so the sheets fan apart while travelling. */
export const SWING = 110;
/** Base push-in: overscan so rotations and the swing never show a strip's edge. */
export const BASE_DOLLY = 120;
export const FLAT: Cam = { yaw: 0, pitch: 0, lift: 0, dolly: 0 };

const smooth = (t: number) => t * t * (3 - 2 * t);

export function camAt(p: number, presets: readonly Cam[], o: CamOpts = {}): Cam {
  if (o.reduced || !presets.length) return FLAT;
  const last = presets.length - 1;
  const q = Math.min(last, Math.max(0, p));
  const i = Math.min(last, Math.floor(q));
  const t = q - i;
  const a = presets[i]!;
  const b = presets[Math.min(last, i + 1)]!;
  const e = smooth(t);
  const m = o.compact ? 0.5 : 1;
  const mix = (k: keyof Cam) => a[k] + (b[k] - a[k]) * e;
  return {
    yaw: (mix("yaw") + (o.px ?? 0) * 1.2) * m,
    pitch: (mix("pitch") - (o.py ?? 0) * 0.8) * m,
    lift: mix("lift") * m,
    dolly: BASE_DOLLY + mix("dolly") * m - SWING * Math.sin(Math.PI * t),
  };
}

const n = (v: number) => +v.toFixed(3);
export const camCss = (c: Cam) =>
  `translate3d(0, calc(${n(c.lift)} * var(--k)), calc(${n(c.dolly)} * var(--k))) rotateX(${n(c.pitch)}deg) rotateY(${n(c.yaw)}deg)`;
