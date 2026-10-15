// Private toolkit for stops 4-7 (mangroves, estuary, village, lighthouse). Only stop-4..7 import this.
import { C, extent, facet, hazed, darken, lighten, mix, poly, sheet, raw, type Ctx, type Piece, type Pt, type Rng } from "../helpers";

/* ---------- screen-relative placement ---------- */
/**
 * Authoring in screen units: `u` = art units right of the traveller anchor at rest (desktop shows about
 * -567..1321, phone -147..284). Strip x = lx + u - 260*s. Boat is u -140..140, tag u 146..374, post u 410.
 */
export function frame(c: Ctx) {
  const off = c.lx - 260 * c.layer.s;
  return { X: (u: number) => off + u, u0: c.x0 - off, u1: Math.min(c.x1, c.lx + 4000) - off };
}

/* ---------- colour by layer and stop (dawn lifts far layers toward a pale blue) ---------- */
const BASE: Record<string, string> = {
  "07": hazed(C.ramp3, 0.3),
  "08": hazed(C.ramp2, 0.18),
  "09": C.ramp2,
  "10": darken(C.ramp1, 0.2),
  "11": darken(C.ramp0, 0.45),
  "12": darken(C.inkNight, 0.7),
};
const LIFT = [0, 0, 0, 0, 0, 0, 0.1, 0.32, 0.5, 0.7];
const W: Record<string, number> = { "07": 1, "08": 1.1, "09": 0.4, "10": 0.2, "11": 0.08, "12": 0 };
export const tone = (id: string, i: number, k = 0) => mix(mix(BASE[id]!, "#6F93B0", LIFT[i]! * W[id]!), C.leaf1, k);
/** Night-shifted blue-green for foliage on a layer. */
export const green = (id: string, i: number, k = 0.55) => tone(id, i, k);

/* ---------- geometry ---------- */
export const quad = (a: Pt, c: Pt, b: Pt, n = 8): Pt[] =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n;
    return [(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]] as Pt;
  });

/** Closed outline of a ribbon along a centreline, width w0 at the start tapering to w1. */
export function ribbon(pts: Pt[], w0: number, w1: number): Pt[] {
  const L: Pt[] = [];
  const R: Pt[] = [];
  pts.forEach((p, k) => {
    const a = pts[Math.max(0, k - 1)]!;
    const b = pts[Math.min(pts.length - 1, k + 1)]!;
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / d;
    const ny = (b[0] - a[0]) / d;
    const w = (w0 + (w1 - w0) * (k / (pts.length - 1))) / 2;
    L.push([p[0] + nx * w, p[1] + ny * w]);
    R.push([p[0] - nx * w, p[1] - ny * w]);
  });
  return [...L, ...R.reverse()];
}

/** Scalloped dome (canopy, bush, rock). Flat-ish underside. */
export function blob(cx: number, cy: number, rx: number, ry: number, r: Rng, n = 16, under = 0.3): Pt[] {
  return Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2;
    const m = (k % 2 ? 0.88 : 1) * r.range(0.92, 1.06);
    const sy = Math.sin(a) > 0 ? under : 1;
    return [cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * sy * m] as Pt;
  });
}

/** Low ground sheet from xa to xb whose top edge undulates around yTop. */
export function bank(xa: number, xb: number, yTop: number, yBot: number, r: Rng, amp = 10, step = 45): Pt[] {
  const ph = r.range(0, 6);
  const top: Pt[] = [];
  for (let x = xa; x < xb; x += step) top.push([x, yTop + Math.sin(x / 90 + ph) * amp * 0.6 + Math.sin(x / 37 + ph * 2) * amp * 0.4 + r.range(-2, 2)]);
  top.push([xb, yTop + r.range(-amp, amp) * 0.3]);
  return [...top, [xb, yBot], [xa, yBot]];
}

/** Shore ground: undulating top, tapering into the water at both ends so neighbouring stops join softly. */
export function ground(xa: number, xb: number, yTop: number, r: Rng, amp = 8): Pt[] {
  const mid = bank(xa + 70, xb - 70, yTop, yTop + 120, r, amp).slice(0, -2);
  return [[xa, yTop + 55], ...mid, [xb, yTop + 55], [xb, yTop + 120], [xa, yTop + 120]];
}

/** Translucent mist sheet (tissue). Above the layer filter so it does not cast shadows. */
export function mist(xa: number, xb: number, y: number, h: number, op: number, i: number, r: Rng): Piece {
  const n = 7;
  const pts: Pt[] = [];
  const env = (k: number) => Math.pow(Math.sin((Math.PI * k) / n), 0.6); // lens: tapers to nothing at both ends
  for (let k = 0; k <= n; k++) pts.push([xa + ((xb - xa) * k) / n, y - (h / 2) * env(k) + r.range(-h, h) * 0.1]);
  for (let k = n; k >= 0; k--) pts.push([xa + ((xb - xa) * k) / n, y + (h / 2) * env(k) + r.range(-h, h) * 0.1]);
  return raw(xa, xb, `<path d="${poly(pts)}" fill="${mix(C.haze, "#E7C9B4", Math.max(0, i - 4) * 0.12)}" opacity="${op}"/>`, true);
}

/** Window with a glow, as a lit hole's warm patch (flat rectangle) plus soft tissue glow. */
export const lit = (x: number, y: number, w: number, h: number, r: Rng, gl = 26): Piece[] => [
  sheet([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], C.window, r, { rim: false }),
  { x0: x - gl, x1: x + w + gl, top: true, svg: `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${gl}" fill="url(#glow-FFB454)" opacity=".5"/>` },
];

/** Conical hat (triangle with a darker band). */
export const cone = (x: number, y: number, w: number, h: number, fill: string, r: Rng): Piece =>
  sheet([[x - w / 2, y + h], [x, y], [x + w / 2, y + h]], fill, r);

/** Mangrove tree: trunk, fan of stilt roots, scalloped canopy. Base at (cx, yb). */
export function mangrove(cx: number, yb: number, h: number, r: Rng, fill: string, hi: string): Piece[] {
  const out: Piece[] = [];
  const lean = r.range(-0.12, 0.12) * h;
  const top: Pt = [cx + lean, yb - h * 0.7];
  const wood = darken(fill, 0.35);
  out.push(sheet(ribbon(quad([cx, yb - 70], [cx + lean * 0.3, yb - h * 0.4], top, 6), 15, 9), wood, r));
  const nr = r.int(5, 7);
  for (let k = 0; k < nr; k++) {
    const side = k % 2 ? 1 : -1;
    const d = r.range(25, 85) * (1 + k * 0.12);
    const hgt = r.range(60, 100);
    out.push(sheet(ribbon(quad([cx + r.range(-6, 6), yb - hgt], [cx + side * d * 0.55, yb - hgt - r.range(8, 30)], [cx + side * d, yb + 8], 7), 8, 3.5), wood, r, { rim: false }));
  }
  const rx = h * r.range(0.42, 0.55);
  out.push(sheet(blob(top[0] - rx * 0.5, top[1] + h * 0.04, rx * 0.62, h * 0.2, r, 14, 0.5), fill, r));
  out.push(sheet(blob(top[0] + rx * 0.5, top[1] + h * 0.05, rx * 0.6, h * 0.19, r, 14, 0.5), fill, r));
  out.push(sheet(blob(top[0], top[1] - h * 0.03, rx * 0.8, h * 0.3, r, 18, 0.35), fill, r));
  out.push(sheet(blob(top[0] - rx * 0.25, top[1] - h * 0.1, rx * 0.45, h * 0.14, r, 12, 0.5), hi, r, { rim: false }));
  return out;
}

/** Leaf-shaped hanging/arching blade as a ribbon curve (reed, frond tip, aerial root). */
export function blade(x: number, y: number, tx: number, ty: number, bend: number, w: number, fill: string, r: Rng, rim = false): Piece {
  const c: Pt = [(x + tx) / 2 + bend, (y + ty) / 2 - Math.abs(bend) * 0.4];
  return sheet(ribbon(quad([x, y], c, [tx, ty], 7), w, 1.2), fill, r, { rim });
}

/** Spray of blades fanning from (x, y) (up when dir=-1, down when dir=1). */
export function spray(x: number, y: number, n: number, len: number, spread: number, fill: string, r: Rng, dir = -1, w = 10): Piece[] {
  return Array.from({ length: n }, (_, k) => {
    const a = ((k / (n - 1) - 0.5) * spread * Math.PI) / 180;
    const L = len * r.range(0.65, 1.1);
    return blade(x, y, x + Math.sin(a) * L + r.range(-12, 12), y + dir * Math.cos(a) * L, Math.sin(a) * L * 0.25 + r.range(-10, 10), w * r.range(0.7, 1.2), fill, r);
  });
}

export const spanOf = (ps: Piece[]): [number, number] => [Math.min(...ps.map((p) => p.x0)), Math.max(...ps.map((p) => p.x1))];
export { extent, facet, hazed, darken, lighten, mix };
