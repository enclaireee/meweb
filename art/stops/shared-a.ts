// Private helpers for stops 0-3 (spring, terraces, gorge, pond). Only stop-0..3 import this.
import { C, darken, ellipse, hazed, leaf, mix, sheet, type Piece, type Pt, type Rng } from "../helpers";

/** Layer fills: value bands from depth-system.md (haze tint per layer). */
export const tone = {
  rock07: hazed(C.ramp3, 0.3),
  moss07: hazed(mix(C.leaf2, C.ramp3, 0.3), 0.3),
  jungle07: hazed(mix(C.leaf1, C.ramp3, 0.4), 0.3),
  rock08: hazed(C.ramp2, 0.18),
  moss08: hazed(mix(C.leaf1, C.ramp2, 0.5), 0.18),
  rock09: C.ramp2,
  moss09: mix(C.leaf1, C.ramp2, 0.55),
  bamboo09: mix(C.leaf2, C.ramp2, 0.45),
  n10: darken(C.ramp1, 0.2),
  n10g: darken(mix(C.leaf1, C.ramp1, 0.5), 0.2),
  n11: darken(C.ramp0, 0.45),
  n12: darken(C.inkNight, 0.7),
};

/** x on a layer of speed s where screen offset `o` (art units right of the traveller) lands at rest. */
export const scr = (s: number, lx: number, o: number) => lx + o - 260 * s;

const sstep = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};
/** 0 at the ends of [xa, xb], 1 once `ramp` units inside. */
export const edge = (x: number, xa: number, xb: number, ramp: number) => sstep(Math.min((x - xa) / ramp, (xb - x) / ramp));
export const gauss = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2));

/** Smooth 1-D noise in [-1, 1]. */
export function noise(r: Rng, oct = 3) {
  const w = Array.from({ length: oct }, (_, k) => ({ a: 1 / (k + 1), f: r.range(0.006, 0.012) * (k + 1), p: r.range(0, 6.28) }));
  const tot = w.reduce((s, o) => s + o.a, 0);
  return (x: number) => w.reduce((s, o) => s + o.a * Math.sin(x * o.f + o.p), 0) / tot;
}

/** A sheet whose top edge follows `top(x)` and whose bottom is flat at `base`. */
export function mass(xa: number, xb: number, base: number, top: (x: number) => number, r: Rng, fill: string, step = 38, holes?: string[]): Piece {
  const pts: Pt[] = [[xa, base]];
  for (let x = xa; x < xb; x += step) pts.push([x, top(x)]);
  pts.push([xb, top(xb)], [xb, base]);
  return sheet(pts, fill, r, { holes });
}

/** A strip hugging the top edge of a mass (moss, snow-like caps, terrace lips). */
export function cap(xa: number, xb: number, top: (x: number) => number, thick: number, r: Rng, fill: string, step = 38): Piece {
  const up: Pt[] = [];
  const dn: Pt[] = [];
  for (let x = xa; x <= xb; x += step) {
    up.push([x, top(x)]);
    dn.push([x, top(x) + thick * r.range(0.55, 1.25)]);
  }
  return sheet([...up, ...dn.reverse()], fill, r, { rim: false });
}

/** Rounded boulder with an optional moss cap. */
export function boulder(cx: number, base: number, w: number, h: number, r: Rng, fill: string, moss?: string): Piece[] {
  const top: Pt[] = [0.08, 0.26, 0.5, 0.74, 0.92].map((t) => [cx - w / 2 + w * t, base - h * Math.pow(Math.sin(Math.PI * t), 0.7) * r.range(0.92, 1.06)]);
  const out = [sheet([[cx - w / 2, base], ...top, [cx + w / 2, base]], fill, r)];
  if (moss) out.push(sheet([...top, ...[...top].reverse().map((p): Pt => [p[0] + r.range(-4, 4), p[1] + r.range(9, 20)])], moss, r, { rim: false }));
  return out;
}

/** Fern: fan of narrow fronds. */
export function fern(x: number, y: number, size: number, r: Rng, fill: string): Piece[] {
  return Array.from({ length: 7 }, (_, k) => {
    const a = -66 + k * 22 + r.range(-5, 5);
    return leaf(x, y, a, size * (1 - Math.abs(a) / 190) * r.vary(), size * 0.085, fill, r, false);
  });
}

/** Fan of broad leaves from one base point (taro, banana, jungle). Angles in degrees, 0 = up. */
export function cluster(x: number, y: number, r: Rng, fill: string, o: { n?: number; L: [number, number]; W: [number, number]; from: number; to: number; veins?: boolean }): Piece[] {
  const n = o.n ?? 5;
  return Array.from({ length: n }, (_, k) => {
    const t = n === 1 ? 0.5 : k / (n - 1);
    return leaf(x + r.range(-10, 10), y, o.from + (o.to - o.from) * t + r.range(-6, 6), r.range(...o.L), r.range(...o.W), fill, r, o.veins ?? true);
  });
}

/** Curved tapering blade from (x, y) by (dx, dy); `bend` bows it sideways. Reeds, vines, branches, roots. */
export function blade(x: number, y: number, dx: number, dy: number, bend: number, w0: number, w1: number, fill: string, r: Rng, o: { rim?: boolean; n?: number } = {}): Piece {
  const n = o.n ?? 6;
  const cx = x + dx / 2 - dy * bend;
  const cy = y + dy / 2 + dx * bend;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const px = (1 - t) ** 2 * x + 2 * (1 - t) * t * cx + t * t * (x + dx);
    const py = (1 - t) ** 2 * y + 2 * (1 - t) * t * cy + t * t * (y + dy);
    const tx = 2 * (1 - t) * (cx - x) + 2 * t * (x + dx - cx);
    const ty = 2 * (1 - t) * (cy - y) + 2 * t * (y + dy - cy);
    const len = Math.hypot(tx, ty) || 1;
    const w = (w0 + (w1 - w0) * t) / 2;
    L.push([px - (ty / len) * w, py + (tx / len) * w]);
    R.push([px + (ty / len) * w, py - (tx / len) * w]);
  }
  return sheet([...L, ...R.reverse()], fill, r, { rim: o.rim ?? false });
}

/** Scalloped blob (canopy, shrub, foliage mass). */
export function scallop(cx: number, cy: number, rx: number, ry: number, r: Rng, fill: string, bumps = 9, amp = 0.13): Piece {
  const n = bumps * 3;
  const pts: Pt[] = Array.from({ length: n }, (_, k) => {
    const a = (Math.PI * 2 * k) / n;
    const m = 1 + amp * Math.cos(a * bumps) * r.range(0.8, 1.1);
    return [cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m];
  });
  return sheet(pts, fill, r);
}

/** Recursive forking branches (a neuron-like tree). `tip` is called at every twig end. */
export function fork(x: number, y: number, deg: number, len: number, w: number, depth: number, r: Rng, fill: string, out: Piece[], tip: (x: number, y: number) => void): void {
  const a = (deg * Math.PI) / 180;
  const ex = x + Math.sin(a) * len;
  const ey = y - Math.cos(a) * len;
  out.push(blade(x, y, ex - x, ey - y, r.range(-0.12, 0.12), w, w * 0.72, fill, r, { n: 3, rim: depth > 2 }));
  if (depth === 0) return tip(ex, ey);
  const n = r.int(2, 3);
  for (let k = 0; k < n; k++) fork(ex, ey, deg + (k - (n - 1) / 2) * r.range(28, 44) + r.range(-8, 8), len * r.range(0.68, 0.82), w * 0.7, depth - 1, r, fill, out, tip);
}

/** Flat stepping-stone / pad ellipse. */
export const flat = (cx: number, cy: number, rx: number, ry: number, r: Rng, fill: string): Piece => sheet(ellipse(cx, cy, rx, ry, 9), fill, r);

/** Tall thin tufts (grass, reed spray) rising from a base line; blades lean outward from `lean`. */
export function tufts(xs: number[], base: number, h: number, r: Rng, fill: string, lean = 0): Piece[] {
  const out: Piece[] = [];
  for (const x of xs)
    for (let k = 0; k < 4; k++) {
      const hh = h * r.range(0.6, 1.15);
      out.push(blade(x + k * 7 + r.range(-6, 6), base, r.range(-0.3, 0.3) * hh + lean * hh, -hh, r.range(-0.15, 0.25), 9, 1.5, fill, r, { n: 4 }));
    }
  return out;
}

/** Curling leaf tips entering from the top corners (layer 12): broad base off-screen tapering to a bent tip. */
export function corners(xl: number, xr: number, r: Rng, fill: string, big = 1): Piece[] {
  const out: Piece[] = [];
  for (const [x, dir] of [[xl, 1], [xr, -1]] as const)
    for (let k = 0; k < 3; k++)
      out.push(blade(x + dir * k * 70 * big, -50, dir * r.range(60, 150) * big, r.range(190, 340) * big * (1 - k * 0.2), dir * r.range(0.25, 0.5), 110 * big * (1 - k * 0.15), 3, fill, r, { n: 8 }));
  return out;
}
