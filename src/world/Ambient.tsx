'use client';
// Ambient idle loops as HTML overlays (Build decisions c, item 8). Decorative, aria-hidden, transform/opacity only
// (CSS keyframes in globals.css: .amb-*). Off under reduced motion, paused while the tab is hidden or the beat is
// hidden; on low quality only `lite` sets keep moving. Use as an engine overlay node with a `rect` (canvas space):
// positions are in % of that rect, sizes in cqw of it, so the loop rides the beat's dolly and parallax.
import type { CSSProperties } from 'react';
import sprites from '../../public/art/ambient/manifest.json';

type Sprite = keyof typeof sprites;
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

export type ParticleOpts = {
  sprite: Sprite;
  n: number;
  /** animation class: twinkle (in place), fall (leaves, snow), rise (embers, dust), drift, bob */
  kind: 'twinkle' | 'fall' | 'rise' | 'drift' | 'bob';
  seed?: number;
  /** sprite width in cqw of the rect: [min, max] */
  size?: [number, number];
  /** loop duration in s: [min, max] */
  dur?: [number, number];
  /** light enough for touch/low quality (<= ~30 per beat) */
  lite?: boolean;
  /** limit spawn area, in % of the rect: [x0, y0, x1, y1] */
  area?: [number, number, number, number];
  className?: string;
  style?: CSSProperties;
};

/** A field of small sprites, each on its own deterministic cycle. Fills its overlay rect. */
export function Particles({ sprite, n, kind, seed = 1, size = [0.6, 1.2], dur, lite = false, area = [0, 0, 100, 100], className = '', style }: ParticleOpts) {
  const r = rng(seed * 7919 + 13);
  const src = sprites[sprite].src;
  const [d0, d1] = dur ?? ({ twinkle: [2.4, 4.6], fall: [10, 18], rise: [7, 12], drift: [14, 26], bob: [3.5, 6] } as const)[kind];
  return (
    <div aria-hidden className={`@container pointer-events-none relative h-full w-full overflow-visible ${lite ? 'amb-lite' : ''} ${className}`} style={style}>
      {Array.from({ length: n }, (_, i) => {
        const x = area[0] + r() * (area[2] - area[0]);
        const y = area[1] + r() * (area[3] - area[1]);
        const w = size[0] + r() * (size[1] - size[0]);
        const du = d0 + r() * (d1 - d0);
        const v = {
          left: `${x}%`, top: `${y}%`, width: `${w}cqw`,
          '--amb-dur': `${du.toFixed(2)}s`, '--amb-delay': `${(-r() * du).toFixed(2)}s`,
          '--amb-x': `${((r() - 0.5) * 12).toFixed(1)}cqw`, '--amb-r': `${Math.round(120 + r() * 240) * (r() < 0.5 ? -1 : 1)}deg`,
          '--amb-y': `${Math.round(4 + r() * 8)}px`, '--amb-lo': (0.15 + r() * 0.3).toFixed(2),
        } as CSSProperties;
        // eslint-disable-next-line @next/next/no-img-element
        return <img key={i} src={src} alt="" draggable={false} decoding="async" className={`amb-${kind} absolute h-auto max-w-none select-none`} style={v} />;
      })}
    </div>
  );
}

/** One sprite with a loop (a candle flame, a mist wisp). `flip` = alternate two frames (flame-1/flame-2). */
export function Loop({ sprite, kind, flip, lite = false, className = '', style }: { sprite: Sprite; kind: 'flicker' | 'drift' | 'sway' | 'bob' | 'glow' | 'twinkle' | 'rotate'; flip?: Sprite; lite?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <div aria-hidden className={`pointer-events-none relative h-full w-full ${lite ? 'amb-lite' : ''} amb-${kind}-c ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sprites[sprite].src} alt="" draggable={false} decoding="async" className="absolute inset-0 h-full w-full object-contain" />
      {flip && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={sprites[flip].src} alt="" draggable={false} decoding="async" className="amb-flip absolute inset-0 h-full w-full object-contain" />
      )}
    </div>
  );
}

/** A soft breathing / flickering light (CSS radial glow, no sprite). Fills its rect. */
export function Glow({ color = 'rgb(255 200 110 / 0.55)', kind = 'glow', lite = true, className = '' }: { color?: string; kind?: 'glow' | 'flicker'; lite?: boolean; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none h-full w-full ${lite ? 'amb-lite' : ''} amb-${kind}-c ${className}`}>
      <div className="h-full w-full rounded-full" style={{ background: `radial-gradient(closest-side, ${color}, transparent)` }} />
    </div>
  );
}
