// Sky colour at a fractional stop (design-tokens.md "sky by stop"). Shared by the runtime and art/preview.ts.

type RGB = [number, number, number];

const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const css = ([r, g, b]: RGB, a = 1) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`;
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// Day mode (DayToggle): morning at the spring to golden hour at the lighthouse.
const DAY = ["#9CC3D9", "#8DBBDD", "#7FB2DE", "#86B8DF", "#93BEDB", "#A8C6D8", "#E3BE97", "#F0C79C"].map(hex);
const DAY_GLOW: [string, number][][] = [
  [["#FFE7B8", 0.45]],
  [["#FFF1CC", 0.3]],
  [["#FFFFFF", 0.2]],
  [["#FFFFFF", 0.2]],
  [["#FFF1CC", 0.25]],
  [["#FFD9A0", 0.35]],
  [["#FFC58A", 0.5], ["#F2A3A0", 0.2]],
  [["#FFB870", 0.6], ["#F49A8E", 0.3]],
];
const MID = ["#1F4A5C", "#14304A", "#0C1D33", "#09152A", "#0B1A30", "#1B3A5E", "#5C7FA3", "#A9C0D0"].map(hex);
// Horizon glows per stop: [colour, alpha]. Two slots, zero when absent.
const GLOW: [string, number][][] = [
  [["#E8A25A", 0.35]],
  [["#C98A52", 0.18]],
  [],
  [],
  [],
  [["#7F9CC4", 0.3], ["#E59C98", 0.15]],
  [["#E59C98", 0.4], ["#F2C77A", 0.3]],
  [["#F2C77A", 0.55]],
];
const BLACK: RGB = [0, 0, 0];
const WHITE: RGB = [255, 255, 255];

export type Sky = { top: string; mid: string; hor: string; glowA: string; glowB: string; horizon: number };

const glowAt = (G: [string, number][][], i: number, slot: number): [RGB, number] => {
  const g = G[i]?.[slot];
  return g ? [hex(g[0]), g[1]] : [hex(G[i]?.[0]?.[0] ?? "#E8A25A"), 0];
};

export function skyAt(pos: number, day = false): Sky {
  const i = Math.max(0, Math.min(6, Math.floor(pos)));
  const t = Math.max(0, Math.min(1, pos - i));
  const M = day ? DAY : MID;
  const G = day ? DAY_GLOW : GLOW;
  const mid = mix(M[i]!, M[i + 1]!, t);
  const glow = (slot: number) => {
    const [ca, aa] = glowAt(G, i, slot);
    const [cb, ab] = glowAt(G, i + 1, slot);
    return css(mix(ca, cb, t), aa + (ab - aa) * t);
  };
  // Horizon sits at 380 units for stops 0-4, 460 for 5-7 (art-direction.md rule 4).
  const horizon = 380 + 80 * Math.max(0, Math.min(1, pos - 4));
  const top = day ? mix(mid, hex("#3F78B0"), 0.45) : mix(mid, BLACK, 0.35);
  return { top: css(top), mid: css(mid), hor: css(mix(mid, WHITE, day ? 0.5 : 0.25)), glowA: glow(0), glowB: glow(1), horizon };
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
