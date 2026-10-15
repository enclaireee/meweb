// Sky colour at a fractional stop (design-tokens.md "sky by stop"). Shared by the runtime and art/preview.ts.

import { timelinePos, type Route } from "./route";

type RGB = [number, number, number];

const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const css = ([r, g, b]: RGB, a = 1) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`;
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const MID = ["#1F4A5C", "#1A3D53", "#112841", "#0C1D33", "#09152A", "#0B1A30", "#1B3A5E", "#5C7FA3", "#A9C0D0", "#A9CBE0"].map(hex);
// Horizon glows per stop: [colour, alpha]. Two slots, zero when absent.
const GLOW: [string, number][][] = [
  [["#E8A25A", 0.35]],
  [["#D9965A", 0.26]],
  [["#C98A52", 0.18]],
  [],
  [],
  [],
  [["#7F9CC4", 0.3], ["#E59C98", 0.15]],
  [["#E59C98", 0.4], ["#F2C77A", 0.3]],
  [["#F2C77A", 0.55]],
  [["#FFD9A0", 0.6], ["#F7B98A", 0.3]], // morning: warm low sun on a clear blue
];
const BLACK: RGB = [0, 0, 0];
const WHITE: RGB = [255, 255, 255];

export type Sky = { top: string; mid: string; hor: string; glowA: string; glowB: string; horizon: number };

const glowAt = (G: [string, number][][], i: number, slot: number): [RGB, number] => {
  const g = G[i]?.[slot];
  return g ? [hex(g[0]), g[1]] : [hex(G[i]?.[0]?.[0] ?? "#E8A25A"), 0];
};

/** Sky at local fractional stop `local` on `route` (mapped onto the 10-stop timeline). */
export function skyAt(local: number, route: Route = "main"): Sky {
  const pos = timelinePos(local, route);
  const i = Math.max(0, Math.min(8, Math.floor(pos)));
  const t = Math.max(0, Math.min(1, pos - i));
  const M = MID;
  const G = GLOW;
  const mid = mix(M[i]!, M[i + 1]!, t);
  const glow = (slot: number) => {
    const [ca, aa] = glowAt(G, i, slot);
    const [cb, ab] = glowAt(G, i + 1, slot);
    return css(mix(ca, cb, t), aa + (ab - aa) * t);
  };
  // Horizon sits at 380 units for stops 0-5, 460 for 6-9 (art-direction.md rule 4).
  const horizon = 380 + 80 * Math.max(0, Math.min(1, pos - 5));
  const top = mix(mid, BLACK, pos > 8 ? 0.12 : 0.35);
  return { top: css(top), mid: css(mid), hor: css(mix(mid, WHITE, 0.25)), glowA: glow(0), glowB: glow(1), horizon };
}

/** CSS background for an element covering the 1000-unit artboard. */
export function skyBackground(s: Sky): string {
  const h = s.horizon / 10;
  return [
    `linear-gradient(to bottom, transparent ${h - 16}%, ${s.glowB} ${h - 2}%, transparent ${h + 8}%)`,
    `linear-gradient(to bottom, transparent ${h - 10}%, ${s.glowA} ${h}%, transparent ${h + 12}%)`,
    `linear-gradient(to bottom, ${s.top} 0%, ${s.mid} ${h * 0.6}%, ${s.hor} ${h}%, ${s.mid} 100%)`,
  ].join(", ");
}
