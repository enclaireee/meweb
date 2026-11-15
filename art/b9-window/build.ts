// b9-window: a vaulted stone room, one tracery window onto the whole night range. Run: npx tsx art/b9-window/build.ts
// Per-band bake settings need per-layer scale/quality, so layers are baked with bakeLayer and the manifest is written
// here in the exact bakeBeat format (same approach as b4-inner-sun).
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, arch, bakeLayer, column, composite, cut, difference, ellipse, fern, glow, lantern, layer, mist, mix, offset,
  pine, rect, ridge, rng, roots, ruinWall, scatter, shaft, sheet, stack, union, vine,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "b9-window";
/** room (paper palette) */
const P: Palette = {
  "wall-mid": "#4a3634", wall: "#3a2a2a", "wall-dark": "#2a1d1e", gate: "#241a1c", "window-light": "#ffcf8a", lamp: "#ffb866",
  "lamp-core": "#fff1cf", "rim-paper": "#fff8ea", "rim-warm": "#ffd9a0", paper: "#f3ead8", "paper-shade": "#e3d3bb", shadow: "#1c1216",
};
/** view through the window (night palette) */
const N: Palette = {
  "sky-top": "#070d18", sky: "#0b1420", "sky-haze": "#16263a", star: "#cfe0f0", "far-ridge-1": "#4a6788", "far-ridge-2": "#34506e",
  "mid-ridge": "#22384f", "pine-mid": "#1a3346", "mountain-shade": "#1e3349", mountain: "#2c4763", "mountain-lit": "#3d5f80",
  "near-dark": "#0d1828", moon: "#dfe9f2", "moon-shade": "#b9cadb", mist: "#9fb8cf", "rim-cool": "#8fb2d4", "window-light": "#ffcf8a", shadow: "#03060c",
};
const R = (n: number) => rng(99000 + n);
const cn = (a: string, b: string, t: number) => mix(P[a]!, P[b]!, t);

/* ---------- generic helpers (as b4) ---------- */
type Band = { off: number; blur: number; op: number; rw: number; rm: number; inner?: [number, number] };
const B = {
  far: { off: 4, blur: 6, op: 0.25, rw: 1.5, rm: 0.35 },
  mid: { off: 8, blur: 10, op: 0.35, rw: 2, rm: 0.45, inner: [4, 0.25] },
  hero: { off: 12, blur: 14, op: 0.4, rw: 2.5, rm: 0.5, inner: [6, 0.3] },
  near: { off: 16, blur: 18, op: 0.45, rw: 3, rm: 0.45, inner: [8, 0.35] },
  gate: { off: 22, blur: 26, op: 0.55, rw: 3, rm: 0.5, inner: [10, 0.4] },
} satisfies Record<string, Band>;
const flat = (s: Poly | Shape): Shape => (typeof s[0]?.[0] === "number" ? [s as Poly] : (s as Shape));
const bnd = (s: Poly | Shape) => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const ring of flat(s)) for (const [x, y] of ring) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1 };
};
const BIG = rect(-4000, -4000, 10000, 10000);
const inter = (a: Poly | Shape, b: Poly | Shape): Shape => difference(a, difference(BIG, b));
const disc = (cx: number, cy: number, rad: number, n = 48) => ellipse(cx, cy, rad, rad, n);
const rotRect = (cx: number, cy: number, w: number, h: number, a: number): Poly => {
  const c = Math.cos(a), s = Math.sin(a);
  return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as Pt[]).map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c] as Pt);
};
const interp = (pts: Pt[]) => (x: number) => {
  if (x <= pts[0]![0]) return pts[0]![1];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1]!, b = pts[i]!; if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); }
  return pts[pts.length - 1]![1];
};
const flipY = (s: Shape, y0: number): Shape => s.map((ring) => ring.map(([x, y]) => [x, 2 * y0 - y] as Pt));
const topY = (poly: Poly, x: number) => {
  let best = 1e9;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!, b = poly[(i + 1) % poly.length]!;
    if ((a[0] <= x && b[0] > x) || (b[0] <= x && a[0] > x)) best = Math.min(best, a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]));
  }
  return best;
};
/** Polyline to a tapering band polygon. */
function band(pts: Pt[], w0: number, w1: number): Poly {
  const A: Pt[] = [], Z: Pt[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)]!, b = pts[Math.min(pts.length - 1, i + 1)]!;
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const hw = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
    A.push([p[0] - dy * hw, p[1] + dx * hw]); Z.push([p[0] + dy * hw, p[1] - dx * hw]);
  });
  return [...A, ...Z.reverse()];
}
const quad = (a: Pt, c: Pt, b: Pt, n = 28): Pt[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]] as Pt; });

type PO = { holes?: (Poly | Shape)[]; rm?: number; light?: Pt; opacity?: number; noRim?: boolean; shadow?: false | { dx: number; dy: number; blur: number; opacity: number }; noInner?: boolean; view?: boolean };
/** One sheet with the band recipe: light from `src` (moon), shadow away from it, rim toward it, inner shadow. */
function paper(shape: Poly | Shape, fill: string, b: Band, src: Pt, o: PO = {}): Frag {
  const bb = bnd(shape), pal = o.view ? N : P;
  let lx = o.light ? o.light[0] : src[0] - (bb.x0 + bb.x1) / 2, ly = o.light ? o.light[1] : src[1] - (bb.y0 + bb.y1) / 2;
  const d = Math.hypot(lx, ly) || 1; lx /= d; ly /= d;
  return sheet(shape, fill, {
    holes: o.holes, opacity: o.opacity,
    shadow: o.shadow === false ? false : { color: pal.shadow, blur: b.blur, opacity: b.op, dx: -lx * b.off, dy: -ly * b.off, ...o.shadow },
    edge: o.noRim ? undefined : { light: [lx, ly], width: b.rw, color: mix(fill, o.view ? N["rim-cool"]! : P["rim-warm"]!, o.rm ?? b.rm) },
    inner: b.inner && !o.noInner ? { blur: b.inner[0], opacity: b.inner[1], color: pal.shadow } : undefined,
  });
}
function pile(shape: Poly | Shape, fills: string[], inset: number, b: Band, src: Pt, o: PO = {}): Frag[] {
  const out: Frag[] = [];
  let cur: Shape = union(shape);
  fills.forEach((f, i) => {
    if (!cur.length) return;
    const bb: Band = i ? { ...b, off: b.off * 0.4, blur: b.blur * 0.5, op: b.op * 0.8 } : b;
    out.push(paper(cur, f, bb, src, o));
    cur = offset(cur, -inset);
  });
  return out;
}
const diamond = (x: number, y: number, s: number): Poly => [[x, y - s], [x + s * 0.62, y], [x, y + s], [x - s * 0.62, y]];

/* ---------- composition configs ---------- */
type Win = { x0: number; x1: number; apex: number; spring: number; base: number };
type G = {
  s: string; W: number; H: number; seed: number; win: Win; moon: Pt; moonR: number;
  sill: { x0: number; x1: number; y0: number; y1: number }; lantern: Pt;
  floorY: number; floorVX: number; step: [number, number, number] | null; patch: boolean;
  calm: (x: number, y: number) => boolean;
  ribX: number[];
  niches: [number, number, number, number][]; shelf: [number, number, number]; rib: [number, number, number, number];
  vine: [number, number, number]; pilaster: [number, number]; slits: [number, number][];
  items: { pots: number[]; stones: number[]; boat: number };
  hang: { pot: Pt; lantern: Pt; x0: number; x1: number; drop: number };
  shafts: [number, number, number, number, number, number, number][];
  motes: { x0: number; y0: number; x1: number; y1: number };
  mists: [number, number, number, number, number][];
  boughs: { p0: Pt; p1: Pt; sag: number; w: number }[];
};
const GD: G = {
  s: "", W: 1920, H: 1080, seed: 1, win: { x0: 1050, x1: 1470, apex: 180, spring: 330, base: 780 }, moon: [1130, 260], moonR: 50,
  sill: { x0: 1010, x1: 1510, y0: 780, y1: 840 }, lantern: [1180, 760],
  floorY: 900, floorVX: 1260, step: [930, 1590, 884], patch: true,
  calm: (x, y) => x < 864 && y >= 160 && y <= 940,
  ribX: [-60, 540, 1700, 1990],
  niches: [[150, 560, 110, 170], [400, 560, 110, 170], [650, 560, 110, 170]], shelf: [130, 800, 330], rib: [790, 150, 940, 46],
  vine: [540, 170, 230], pilaster: [1512, 50], slits: [[1572, 380], [1572, 720]],
  items: { pots: [1070, 1272, 1372], stones: [1228, 1478], boat: 1436 },
  hang: { pot: [1545, 150], lantern: [1640, 300], x0: 1440, x1: 1700, drop: 260 },
  shafts: [[1130, 580, 40, 110, 520, 28, 0.2], [1230, 560, 50, 130, 560, 32, 0.24], [1330, 570, 40, 120, 520, 36, 0.18], [1410, 590, 36, 100, 480, 40, 0.16]],
  motes: { x0: 1100, y0: 450, x1: 1760, y1: 1000 },
  mists: [[1350, 700, 760, 170, 0.15], [1560, 860, 700, 150, 0.14], [1250, 560, 600, 130, 0.12]],
  boughs: [{ p0: [1570, 650], p1: [1280, 726], sag: 24, w: 17 }, { p0: [1540, 575], p1: [1360, 618], sag: 14, w: 10 }, { p0: [1010, 770], p1: [1150, 700], sag: -12, w: 9 }],
};
const GP: G = {
  s: "-p", W: 1080, H: 1920, seed: 2, win: { x0: 290, x1: 790, apex: 230, spring: 410, base: 950 }, moon: [400, 330], moonR: 60,
  sill: { x0: 240, x1: 840, y0: 950, y1: 1010 }, lantern: [420, 930],
  floorY: 1480, floorVX: 540, step: null, patch: false,
  calm: (_x, y) => y >= 1056,
  ribX: [-60, 230, 850, 1140],
  niches: [[150, 1380, 110, 170], [540, 1380, 110, 170], [920, 1380, 110, 170]], shelf: [40, 1160, 260], rib: [212, 250, 1450, 46],
  vine: [110, 250, 230], pilaster: [842, 46], slits: [[868, 520], [868, 800]],
  items: { pots: [305, 520, 690], stones: [600, 800], boat: 760 },
  hang: { pot: [892, 130], lantern: [872, 440], x0: 830, x1: 940, drop: 520 },
  shafts: [[380, 700, 40, 110, 300, 28, 0.2], [480, 690, 50, 130, 320, 32, 0.24], [600, 700, 40, 120, 300, 36, 0.18], [700, 720, 36, 100, 280, 40, 0.16]],
  motes: { x0: 330, y0: 620, x1: 880, y1: 1000 },
  mists: [[560, 800, 640, 160, 0.14], [600, 930, 520, 120, 0.12], [480, 660, 520, 120, 0.12]],
  boughs: [{ p0: [860, 800], p1: [560, 884], sag: 26, w: 18 }, { p0: [840, 700], p1: [680, 742], sag: 14, w: 10 }, { p0: [270, 930], p1: [400, 850], sag: -12, w: 9 }],
};

/** Pointed-arch window outline (a = how pointed the apex is). */
function winPoly(w: Win): Poly {
  const hw = (w.x1 - w.x0) / 2, h = w.spring - w.apex, a = 0.3, n = 24;
  const rise = (t: number) => h * ((1 - a) * Math.sqrt(1 - (1 - t) ** 2) + a * t);
  const pts: Poly = [[w.x0, w.base]];
  for (let k = 0; k <= n; k++) pts.push([w.x0 + hw * (k / n), w.spring - rise(k / n)]);
  for (let k = n - 1; k >= 0; k--) pts.push([w.x1 - hw * (k / n), w.spring - rise(k / n)]);
  pts.push([w.x1, w.base]);
  return pts;
}
const lancet = (xa: number, xb: number, base: number, shoulder: number, apex: number): Poly => {
  const pts: Poly = [[xa, base]], mid = (xa + xb) / 2, n = 8;
  for (let k = 0; k <= n; k++) { const t = k / n; pts.push([xa + (mid - xa) * t, shoulder - (shoulder - apex) * (1 - (1 - t) ** 2)]); }
  for (let k = n - 1; k >= 0; k--) { const t = k / n; pts.push([xb - (xb - mid) * t, shoulder - (shoulder - apex) * (1 - (1 - t) ** 2)]); }
  pts.push([xb, base]);
  return pts;
};

/* ---------- 0 night-outside (shared; desktop coordinates, portrait re-places it) ---------- */
function nightLayer(): Layer {
  const r = R(100), out: Frag[] = [];
  const X0 = -300, X1 = 2300, Y0 = -400, Y1 = 1600, mn: Pt = [1130, 260];
  out.push(sheet(rect(X0, Y0, X1 - X0, Y1 - Y0), N["sky-top"]!, { shadow: false }));
  out.push(sheet(cut(rect(X0, 190, X1 - X0, Y1 - 190), r, 4, 90), N.sky!, { shadow: false }));
  out.push(sheet(cut(rect(X0, 450, X1 - X0, Y1 - 450), r, 4, 90), N["sky-haze"]!, { shadow: false }));
  out.push(sheet(cut(rect(X0, 590, X1 - X0, Y1 - 590), r, 3, 90), mix(N["sky-haze"]!, N.mist!, 0.12), { shadow: false }));
  out.push(glow(mn[0], mn[1], 220, N.mist!, { opacity: 0.35, core: N.moon! }));
  out.push(sheet(scatter(r, { x0: 1000, y0: 60, x1: 1560, y1: 520 }, 70, (x, y) => diamond(x, y, r.range(2, 2.7)), 22), N.star!, { shadow: false, opacity: 0.9 }));
  out.push(sheet(scatter(r, { x0: 700, y0: 0, x1: 1900, y1: 500 }, 26, (x, y) => diamond(x, y, r.range(1.6, 2.2)), 30), N.star!, { shadow: false, opacity: 0.55 }));
  out.push(...stack(cut(disc(mn[0], mn[1], 50, 56), r, 0.6, 22), [N["moon-shade"]!, N.moon!, mix(N.moon!, N.star!, 0.4)], 6, { shadow: false }));
  for (const [dx, dy, rad] of [[-14, -10, 8], [12, -18, 5], [18, 8, 7], [-8, 16, 5], [-24, 6, 4], [4, 2, 4], [8, 26, 3.5]] as [number, number, number][])
    out.push(sheet(disc(mn[0] + dx, mn[1] + dy, rad, 14), N["moon-shade"]!, { shadow: false, opacity: 0.85 }));
  out.push(mist(1260, 590, 900, 150, N.mist!, 0.22), mist(1230, 470, 700, 110, N.mist!, 0.1));
  return layer("night-outside", 0, ...out);
}

/* ---------- 1 range-outside ---------- */
function rangeLayer(g: G): Layer {
  const r = R(g.seed * 100 + 1), out: Frag[] = [], { x0, x1, base } = g.win, v0 = x0 - 110, v1 = x1 + 110, src = g.moon, V = { view: true };
  const ys = [base - 220, base - 160, base - 80], bot = base + 70;
  const mk = (y: number, amp: number, seed: number) => ridge(r, { x0: v0, x1: v1, y, base: bot, amp, step: 34, peaky: true, seed });
  const f1 = mk(ys[0]!, 70, g.seed * 10 + 1), f2 = mk(ys[1]!, 62, g.seed * 10 + 2), m = mk(ys[2]!, 52, g.seed * 10 + 3);
  out.push(...pile(f1, [mix(N["far-ridge-1"]!, N["far-ridge-2"]!, 0.6), N["far-ridge-1"]!], 5, B.far, src, V));
  // far mountain with its one lit window
  const mx = x0 + (x1 - x0) * 0.66, py = ys[0]! - 62;
  const mtn: Poly = cut([[mx - 160, bot], [mx - 100, py + 95], [mx - 46, py + 44], [mx - 12, py + 12], [mx, py], [mx + 14, py + 22], [mx + 56, py + 62], [mx + 104, py + 108], [mx + 175, bot]], r, 1, 22);
  out.push(...pile(mtn, [N["mountain-shade"]!, N.mountain!, N["mountain-lit"]!], 6, B.far, src, V));
  out.push(sheet(rect(mx + 30, py + 46, 12, 22), N["near-dark"]!, { shadow: false }), sheet(rect(mx + 34.5, py + 52, 3, 4), N["window-light"]!, { shadow: false }));
  out.push(...pile(f2, [mix(N["far-ridge-2"]!, N["mid-ridge"]!, 0.5), N["far-ridge-2"]!], 5, B.far, src, V));
  out.push(...pile(m, [N["pine-mid"]!, N["mid-ridge"]!], 5, B.far, src, V));
  const pines = (poly: Poly, n: number, h0: number, h1: number) => scatter(r, { x0: v0 + 8, y0: 0, x1: v1 - 8, y1: 1 }, n, (x) => pine(r, x, topY(poly, x) + 4, r.range(h0, h1)), 14);
  out.push(paper(pines(f1, 10, 12, 20), N["far-ridge-2"]!, B.far, src, { view: true, shadow: false, noRim: true }));
  out.push(paper(pines(f2, 14, 14, 24), N["mid-ridge"]!, B.far, src, { view: true, shadow: false, noRim: true }));
  out.push(paper(pines(m, 16, 18, 34), N["pine-mid"]!, B.far, src, { view: true, rm: 0.3 }));
  out.push(mist((v0 + v1) / 2, base - 140, v1 - v0 + 60, 90, N.mist!, 0.25));
  return layer("range-outside" + g.s, 1, ...out);
}

/* ---------- 2 outside-near ---------- */
function bough(r: Rng, p0: Pt, p1: Pt, sag: number, w: number, needle: [number, number], twigs: number, step = 6): Shape {
  const n = 28, spine: Pt[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n; spine.push([p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t + sag * Math.sin(Math.PI * t) + r.range(-2, 2)]); }
  const parts: (Poly | Shape)[] = [band(spine, w, Math.max(3, w * 0.2))];
  const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
  const needles = (pts: Pt[], a0: number) => {
    for (let i = 1; i < pts.length; i++) for (const sd of [-1, 1]) {
      const p = pts[i]!, a = a0 + sd * r.range(0.55, 1.05), len = r.range(needle[0], needle[1]) * (1 - 0.35 * (i / pts.length));
      const px = -Math.sin(a), py = Math.cos(a);
      parts.push([[p[0] - px * 1.7, p[1] - py * 1.7], [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len], [p[0] + px * 1.7, p[1] + py * 1.7]]);
    }
  };
  const fine: Pt[] = [];
  for (let i = 0; i < spine.length - 1; i++) { const a = spine[i]!, b = spine[i + 1]!; for (let k = 0; k < Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); k++) fine.push([a[0] + (b[0] - a[0]) * (k / Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step))), a[1] + (b[1] - a[1]) * (k / Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)))]); }
  needles(fine, ang);
  for (let k = 0; k < twigs; k++) {
    const sp = spine[r.int(3, n - 5)]!, a = ang + (k % 2 ? 1 : -1) * r.range(0.6, 1.0), len = r.range(60, 120);
    const tip: Pt = [sp[0] + Math.cos(a) * len, sp[1] + Math.sin(a) * len];
    parts.push(...bough(r, sp, tip, 0, 5, needle, 0, 7));
  }
  return union(...parts);
}
function nearLayer(g: G): Layer {
  const r = R(g.seed * 100 + 2), out: Frag[] = [], src = g.moon;
  const shape = union(...g.boughs.map((b) => bough(r, b.p0, b.p1, b.sag, b.w, [14, 28], 5)));
  out.push(...pile(shape, [N["near-dark"]!, N["pine-mid"]!, mix(N["pine-mid"]!, N["rim-cool"]!, 0.2)], 2.5, B.far, src, { view: true, rm: 0.35 }));
  const top = union(...g.boughs.map((b) => bough(r, [b.p0[0], b.p0[1] - 4], [b.p1[0], b.p1[1] - 4], b.sag, 3, [8, 14], 0)));
  out.push(paper(top, mix(N["pine-mid"]!, N["rim-cool"]!, 0.2), B.far, src, { view: true, shadow: false, opacity: 0.8 }));
  return layer("outside-near" + g.s, 2, ...out);
}

/* ---------- 3 window-reveal ---------- */
function revealLayer(g: G): Layer {
  const src = g.moon, OP = winPoly(g.win), hole = offset(OP, 40), ring = difference(hole, OP);
  const t = [ring, offset(ring, -8), offset(offset(ring, -8), -8)];
  const out = pile(ring, [P["wall-dark"]!, P.wall!, cn("wall", "wall-mid", 0.6)], 8, B.mid, src);
  const cx = (g.win.x0 + g.win.x1) / 2, rj = inter(t[2]!, rect(cx, g.win.spring - 60, 400, g.win.base - g.win.spring + 60));
  out.push(sheet(rj, mix(P["wall-mid"]!, P["rim-warm"]!, 0.35), { shadow: false }));
  const lj = inter(t[1]!, rect(cx - 400, g.win.spring - 60, 400, g.win.base - g.win.spring + 60));
  out.push(sheet(lj, P["wall-dark"]!, { shadow: false }));
  return layer("window-reveal" + g.s, 3, ...out);
}

/* ---------- 4 wall ---------- */
function niche(r: Rng, g: G, cx: number, by: number, w: number, h: number): Frag[] {
  const src = g.moon, out: Frag[] = [];
  out.push(paper(arch(r, cx, by + 10, w + 26, h + 22, 0.8), cn("wall", "wall-mid", 0.5), B.mid, src, { rm: 0.25 }));
  out.push(sheet(arch(r, cx, by + 6, w + 8, h + 8, 0.8), P["wall-dark"]!, { shadow: false }));
  out.push(sheet(arch(r, cx, by, w - 6, h - 4, 0.8), P.gate!, { shadow: false }));
  out.push(sheet(rect(cx - w / 2 - 4, by, w + 8, 7), cn("wall", "wall-mid", 0.4), { shadow: false }));
  const pot = (px: number, k: number): Poly => cut([[px - 14 * k, by], [px + 14 * k, by], [px + 18 * k, by - 30 * k], [px - 18 * k, by - 30 * k]], r, 0.5, 14);
  const p1 = cx - w * 0.2, p2 = cx + w * 0.26;
  out.push(paper(union(pot(p1, 1.15), rect(p1 - 22, by - 41, 44, 8)), P.wall!, B.far, src, { rm: 0.25 }));
  out.push(paper(union(pot(p2, 0.8), rect(p2 - 15, by - 29, 30, 6)), cn("wall", "wall-mid", 0.5), B.far, src, { rm: 0.25 }));
  out.push(paper(union(cut(ellipse(cx - w * 0.02, by - 7, 13, 8, 12), r, 0.6, 12), cut(ellipse(cx + w * 0.02 + 6, by - 4, 7, 5, 10), r, 0.5, 10)), P["wall-mid"]!, B.far, src, { rm: 0.25 }));
  return out;
}
function wallLayer(g: G): Layer {
  const r = R(g.seed * 100 + 4), out: Frag[] = [], src = g.moon;
  const BX0 = -160, BY0 = -90, BX1 = g.W + 160, BY1 = g.H + 90;
  const hole = offset(winPoly(g.win), 40);
  out.push(sheet(difference(rect(BX0, BY0, BX1 - BX0, BY1 - BY0), hole), P.gate!, { shadow: false }));
  // stone courses: individual blocks in 4 tones, rim only (calm 0.25)
  const tones = [P.wall!, cn("wall", "wall-mid", 0.55), P["wall-mid"]!, cn("wall", "wall-dark", 0.55)];
  const groups: Poly[][] = Array.from({ length: 8 }, () => []);
  for (let y = BY0; y < BY1;) {
    const rh = r.range(54, 72);
    for (let x = BX0 - r.range(0, 90); x < BX1;) {
      const bw = r.range(90, 160), q = r(), tone = q < 0.3 ? 0 : q < 0.55 ? 1 : q < 0.72 ? 2 : 3;
      const calm = g.calm(x + bw / 2, y + rh / 2);
      groups[tone * 2 + (calm ? 0 : 1)]!.push(cut(rect(x + 1.8, y + 1.8, bw - 3.6, rh - 3.6), r, 0.9, 40));
      x += bw;
    }
    y += rh;
  }
  groups.forEach((gp, i) => {
    if (!gp.length) return;
    const fill = tones[i >> 1]!, calm = i % 2 === 0, shape = difference(union(...gp), hole), bb = bnd(shape);
    const lx = src[0] - (bb.x0 + bb.x1) / 2, ly = src[1] - (bb.y0 + bb.y1) / 2, d = Math.hypot(lx, ly);
    out.push(sheet(shape, fill, { shadow: false, edge: { light: [lx / d, ly / d], width: 1.3, color: mix(fill, P["rim-warm"]!, calm ? 0.25 : 0.4) } }));
  });
  // cracks and chips
  const cracks = Array.from({ length: 46 }, () => rotRect(r.range(0, g.W), r.range(0, g.H), 3.2, r.range(26, 74), r.range(-0.5, 0.5) + (r() < 0.5 ? 0 : Math.PI / 2)));
  out.push(sheet(difference(union(...cracks), hole), P["wall-dark"]!, { shadow: false, opacity: 0.8 }));
  // niches with pots and stones
  for (const [cx, by, w, h] of g.niches) out.push(...niche(r, g, cx, by, w, h));
  // ruined shelf on corbels
  const [sx, sy, sw] = g.shelf, rw = ruinWall(r, sx, sy, sw, 46);
  out.push(paper(rw.body, cn("wall", "wall-mid", 0.55), B.mid, src, { holes: rw.holes, rm: 0.25 }));
  const corbels = Array.from({ length: 3 }, (_, i) => [[sx + 40 + i * (sw - 100) / 2, sy], [sx + 76 + i * (sw - 100) / 2, sy], [sx + 40 + i * (sw - 100) / 2, sy + 52]] as Poly);
  out.push(paper(union(...corbels), P["wall-dark"]!, B.far, src, { rm: 0.25 }));
  out.push(paper(union(cut(ellipse(sx + 90, sy - 50, 16, 10, 12), r, 0.6, 12), cut(ellipse(sx + 170, sy - 52, 12, 8, 10), r, 0.5, 12)), P["wall-mid"]!, B.far, src, { rm: 0.25 }));
  // carved rib (pilaster) with flutes
  const [rx, rt, rb, rwid] = g.rib, rh = rb - rt;
  out.push(...pile(column(r, rx, rb, rwid, rh, false), [P["wall-dark"]!, P.wall!, cn("wall", "wall-mid", 0.6)], 5, B.mid, src, { rm: 0.25 }));
  out.push(sheet(union(...[-12, -4, 4, 12].map((dx) => rect(rx + dx - 1.5, rt + 40, 3, rh - 90))), P.gate!, { shadow: false, opacity: 0.8 }));
  // hanging vine
  out.push(paper(vine(r, g.vine[0], g.vine[1], g.vine[2], 14), P["wall-dark"]!, B.far, src, { rm: 0.25 }));
  // right wall: pilaster, barred slits showing night sky
  const [px, pw] = g.pilaster;
  out.push(...pile(column(r, px, g.H + 80, pw, g.H + 170, false), [P["wall-dark"]!, P.wall!, cn("wall", "wall-mid", 0.6)], 5, B.mid, src, { rm: 0.4 }));
  for (const [sx2, sy2] of g.slits) {
    const slit = cut(rect(sx2 - 6, sy2 - 36, 12, 72), r, 0.4, 20), bars = [0.3, 0.6].map((t) => rect(sx2 - 8, sy2 - 36 + 72 * t - 1.5, 16, 3));
    out.push(sheet(rect(sx2 - 11, sy2 - 41, 22, 82), P["wall-dark"]!, { shadow: false }));
    out.push(sheet(slit, mix(N["sky-haze"]!, N.mist!, 0.5), { shadow: false, holes: [...bars, rect(sx2 - 1.5, sy2 - 36, 3, 72)] }));
  }
  return layer("wall" + g.s, 4, ...out);
}

/* ---------- 5 vault-ribs ---------- */
function ribsLayer(g: G): Layer {
  const r = R(g.seed * 100 + 5), out: Frag[] = [], src = g.moon, cx = (g.win.x0 + g.win.x1) / 2, a = g.win.apex;
  const X0 = -160, X1 = g.W + 160, K: Pt = [cx, a * 0.32];
  const pts: Poly = [[X0, -100], [X1, -100]];
  for (let x = X1; x >= X0; x -= 12) pts.push([x, a + 6 - 22 * Math.abs(Math.sin(((x - cx) / 150) * Math.PI))]);
  out.push(...pile(cut(pts, r, 0.8, 60), [P["wall-dark"]!, P.wall!, cn("wall", "wall-mid", 0.5)], 10, B.hero, src, { rm: 0.25 }));
  out.push(sheet(union(...Array.from({ length: 70 }, () => rect(r.range(X0 + 20, X1 - 20), r.range(10, a - 40), 3.5, r.range(22, 44)))), P.gate!, { shadow: false, opacity: 0.8 }));
  const bodies: Shape[] = [];
  for (const sx of g.ribX) {
    const c: Pt = [sx + (K[0] - sx) * 0.08, K[1] - 4], line = quad([sx, a + 4], c, K, 34);
    bodies.push(union(band(line, 36, 24)));
  }
  out.push(...pile(union(...bodies), [P["wall-dark"]!, P.wall!, cn("wall", "wall-mid", 0.6)], 6, B.hero, src, { rm: 0.25 }));
  // keystone boss
  out.push(...stack(disc(K[0], K[1], 28, 28), [P["wall-dark"]!, P.wall!, P["wall-mid"]!], 7, { shadow: { dx: 3, dy: 6, blur: 6, opacity: 0.4, color: P.shadow } }));
  out.push(paper(union(...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => disc(K[0] + Math.cos((i / 8) * Math.PI * 2) * 40, K[1] + Math.sin((i / 8) * Math.PI * 2) * 40, 5, 8))), cn("wall", "wall-mid", 0.4), B.far, src, { rm: 0.25 }));
  // hanging roots from the plate
  const rts = Array.from({ length: 9 }, (_, i) => roots(r, X0 + ((i + 0.5) / 9) * (X1 - X0) + r.range(-60, 60), a - 6, 30, r.range(40, 95), 4, 1));
  out.push(paper(union(...rts), P["wall-dark"]!, B.far, src, { rm: 0.25 }));
  return layer("vault-ribs" + g.s, 5, ...out);
}

/* ---------- 6 window-frame ---------- */
function frameLayer(g: G): Layer {
  const { x0, x1, apex, spring, base } = g.win, src = g.moon, OP = winPoly(g.win), cx = (x0 + x1) / 2, hw = (x1 - x0) / 2, h = spring - apex;
  const bar = 24, inner = offset(OP, -bar), T = apex + 0.567 * (base - apex), colW = (x1 - x0 - 4 * bar) / 3;
  const lights: (Poly | Shape)[] = [];
  for (let i = 0; i < 3; i++) {
    const a = x0 + bar + i * (colW + bar), b = a + colW;
    lights.push(rect(a, T + bar / 2, colW, base - bar - T - bar / 2));
    lights.push(lancet(a, b, T - bar / 2, spring + 8 + colW * 0.55, spring + 8));
  }
  const k = hw / 210, kh = h / 150, S = 36 * k, keep = offset(OP, -bar - 8);
  const add = (s: Poly | Shape) => { const q = inter(s, keep); if (q.length && q.some((ring) => { const bb = bnd([ring]); return bb.x1 - bb.x0 >= 3.5 && bb.y1 - bb.y0 >= 3.5; })) lights.push(q); };
  add(disc(g.moon[0], g.moon[1], g.moonR + 8, 40));
  const qs: Pt[] = [[cx - 5 * k, apex + 66 * kh], [cx + 85 * k, apex + 88 * kh], [cx + 155 * k, apex + 125 * kh]];
  for (const [qx, qy] of qs) {
    add(union(disc(qx - S * 0.24, qy, S * 0.3, 12), disc(qx + S * 0.24, qy, S * 0.3, 12), disc(qx, qy - S * 0.24, S * 0.3, 12), disc(qx, qy + S * 0.24, S * 0.3, 12), rect(qx - S * 0.2, qy - S * 0.2, S * 0.4, S * 0.4)));
    for (const [dx, dy] of [[-S, 0], [S, 0], [0, -S * 0.85], [0, S * 0.85]] as Pt[]) add(disc(qx + dx, qy + dy, 5, 10));
  }
  const L = union(...lights), ins = 5, fills = [P.wall!, P["wall-mid"]!, mix(P["wall-mid"]!, P["rim-warm"]!, 0.3)];
  const out: Frag[] = fills.map((f, i) => {
    const t = difference(offset(OP, -i * ins), offset(L, i * ins));
    return paper(t, f, i ? { ...B.hero, off: 5, blur: 7, op: 0.3 } : B.hero, src, { rm: 0.5 });
  });
  // sill-side base blocks and transom caps
  out.push(paper(union(...[x0 + bar + colW + bar / 2, x0 + bar + 2 * colW + bar * 1.5].map((mx) => rect(mx - 17, base - 46, 34, 22))), P["wall-mid"]!, B.far, src, { rm: 0.4 }));
  return layer("window-frame" + g.s, 6, ...out);
}

/* ---------- 7 sill ---------- */
function sillLayer(g: G): Layer {
  const r = R(g.seed * 100 + 7), out: Frag[] = [], src = g.moon, { x0, x1, y0, y1 } = g.sill, [lx, ly] = g.lantern;
  const corbels = [0.1, 0.38, 0.66, 0.92].map((t) => { const x = x0 + (x1 - x0) * t; return [[x - 30, y1], [x + 30, y1], [x + 22, y1 + 28], [x - 22, y1 + 34]] as Poly; });
  out.push(paper(union(...corbels.map((c) => cut(c, r, 0.8, 14))), P["wall-dark"]!, B.mid, src, { rm: 0.45 }));
  out.push(...pile(cut(rect(x0, y0, x1 - x0, y1 - y0), r, 1.4, 40), [P["wall-dark"]!, P.wall!, P["wall-mid"]!], 6, B.hero, src));
  out.push(sheet(union(...Array.from({ length: 12 }, (_, i) => rect(x0 + 16 + i * ((x1 - x0 - 32) / 11) + r.range(-6, 6), y0 + 20, 3, 30))), P["wall-dark"]!, { shadow: false, opacity: 0.8 }));
  const by = y0 - 1;
  // ferns in pots
  for (const px of g.items.pots) {
    const pot: Poly = cut([[px - 20, by], [px + 20, by], [px + 15, by - 26], [px - 15, by - 26]], r, 0.5, 14);
    out.push(paper(union(pot, rect(px - 21, by - 32, 42, 8)), P["wall-mid"]!, B.mid, src));
    out.push(paper(union(fern(r, px - 6, by - 28, r.range(64, 92), -0.4), fern(r, px + 6, by - 28, r.range(56, 80), 0.5), fern(r, px, by - 28, r.range(44, 60), 0.05)), P["wall-dark"]!, B.mid, src, { rm: 0.5 }));
  }
  for (const sx of g.items.stones) out.push(paper(union(cut(ellipse(sx, by - 8, 19, 10, 14), r, 0.8, 14), cut(ellipse(sx + 18, by - 5, 10, 6, 10), r, 0.6, 12)), P.wall!, B.mid, src, { rm: 0.45 }));
  // folded paper boat (30 px)
  const bx = g.items.boat;
  out.push(sheet([[bx - 15, by - 10], [bx + 15, by - 10], [bx + 9, by], [bx - 9, by]], P["paper-shade"]!, { shadow: { dx: 2, dy: 3, blur: 3, opacity: 0.4, color: P.shadow } }));
  out.push(sheet([[bx - 2, by - 10], [bx - 2, by - 25], [bx + 11, by - 10]], P.paper!, { shadow: false }), sheet([[bx - 4, by - 10], [bx - 4, by - 19], [bx - 13, by - 10]], mix(P.paper!, P["paper-shade"]!, 0.5), { shadow: false }));
  // sill lantern (r 18): lit panes
  const s = 46, ln = lantern(lx, ly - 0.02 * s, s);
  out.push(sheet(union(...ln.holes), P["window-light"]!, { shadow: false }));
  out.push(paper(ln.body, P.lamp!, B.far, src, { holes: ln.holes, rm: 0.3, noInner: true }));
  out.push(sheet(rect(lx - 2, ly - s * 0.62, 4, s * 0.12), P["wall-dark"]!, { shadow: false }));
  return layer("sill" + g.s, 7, ...out);
}

/* ---------- 8 window-glow (shared) ---------- */
function glowLayer(): Layer {
  const [lx, ly] = GD.lantern;
  return layer("window-glow", 8, glow(lx, ly, 180, P.lamp!, { opacity: 0.5, core: P["lamp-core"]! }), mist(lx + 150, 778, 280, 46, N.mist!, 0.28));
}

/* ---------- 9 floor ---------- */
function floorLayer(g: G): Layer {
  const r = R(g.seed * 100 + 9), out: Frag[] = [], src = g.moon, y0 = g.floorY, y1 = g.H + 100, vpx = g.floorVX, vpy = y0 - 420, n = 8;
  const ys = Array.from({ length: n + 1 }, (_, k) => y0 + (y1 - y0) * Math.pow(k / n, 1.35));
  const sc = (y: number) => (y - vpy) / (y1 - vpy), refW = 200;
  out.push(sheet(cut(rect(-160, y0, g.W + 320, y1 - y0 + 60), r, 1.5, 50), P.gate!, { shadow: false }));
  const tones = [P["wall-dark"]!, P.wall!, cn("wall-dark", "gate", 0.5)], groups: Poly[][] = [[], [], []];
  for (let k = 0; k < n; k++) {
    for (let u = -3200 - (k % 2 ? refW / 2 : 0) - r.range(0, 40); u < 3200;) {
      const w = refW * r.range(0.8, 1.2), ya = ys[k]!, yb = ys[k + 1]!;
      const c: Pt[] = [[vpx + u * sc(ya), ya], [vpx + (u + w) * sc(ya), ya], [vpx + (u + w) * sc(yb), yb], [vpx + u * sc(yb), yb]];
      u += w;
      if (c[1]![0] < -200 || c[0]![0] > g.W + 200) continue;
      const mx = (c[0]![0] + c[1]![0] + c[2]![0] + c[3]![0]) / 4, my = (ya + yb) / 2, q = r();
      groups[q < 0.4 ? 0 : q < 0.75 ? 1 : 2]!.push(cut(c.map(([x, y]) => [mx + (x - mx) * 0.95, my + (y - my) * (yb - ya > 20 ? 0.93 : 0.8)] as Pt), r, 0.7, 50));
    }
  }
  groups.forEach((gp, i) => out.push(paper(union(...gp), tones[i]!, { ...B.far, rm: 0.25, off: 2, blur: 3 }, src, { rm: 0.25, noInner: true })));
  out.push(paper(rect(-160, y0 - 18, g.W + 320, 18), P["wall-dark"]!, B.mid, src, { rm: 0.25, light: [0, -1] }));
  const cr = Array.from({ length: 26 }, () => rotRect(r.range(0, g.W), r.range(y0 + 20, y1 - 30), 3.2, r.range(18, 54), r.range(-0.6, 0.6)));
  out.push(sheet(union(...cr), P.gate!, { shadow: false, opacity: 0.7 }));
  if (g.step) {
    const [sx0, sx1, sy] = g.step;
    out.push(...pile(cut(rect(sx0, sy - 6, sx1 - sx0, 38), r, 1.5, 40), [P["wall-dark"]!, cn("wall", "wall-mid", 0.4)], 6, B.mid, src, { light: [0.3, -1] }));
    out.push(sheet(union(...Array.from({ length: 9 }, (_, i) => rect(sx0 + 40 + i * ((sx1 - sx0 - 80) / 8) + r.range(-10, 10), sy + 6, 3, 14))), P.gate!, { shadow: false, opacity: 0.8 }));
  }
  if (g.patch) { // moonlight on the floor, right of x 900 only
    const q: Poly = [[1010, 930], [1480, 930], [1700, 1070], [1190, 1090]];
    const mullions = [0.34, 0.67].map((t) => [[1010 + 470 * t - 7, 930], [1010 + 470 * t + 9, 930], [1190 + 510 * t + 12, 1090], [1190 + 510 * t - 12, 1090]] as Poly);
    out.push(sheet(difference(q, ...mullions, [[1010, 1004], [1700, 1004], [1700, 1020], [1010, 1020]]), P.paper!, { shadow: false, opacity: 0.1 }));
    out.push(sheet(difference(offset(q, -26), ...mullions), P.paper!, { shadow: false, opacity: 0.07 }));
  }
  return layer("floor" + g.s, 9, ...out);
}

/* ---------- 10 shafts, 11 mist, 12 motes ---------- */
const shaftsLayer = (g: G) => layer("shafts" + g.s, 10, ...g.shafts.map(([x, y, w0, w1, len, ang, op]) => shaft(x, y, w0, w1, len, ang, P["rim-paper"]!, op)));
const mistLayer = (g: G) => layer("mist" + g.s, 11, ...g.mists.map(([x, y, w, h, o]) => mist(x, y, w, h, P.paper!, o)));
function motesLayer(g: G): Layer {
  const r = R(g.seed * 100 + 12);
  return layer("motes" + g.s, 12, ...([[44, 0.35], [44, 0.6], [32, 0.8]] as [number, number][]).map(([n, op]) =>
    sheet(scatter(r, g.motes, n, (x, y) => ellipse(x, y, r.range(1.5, 3.4), r.range(1.5, 3.4), 6), 14), P["rim-paper"]!, { shadow: false, opacity: op })));
}

/* ---------- 13 plants-near ---------- */
function plantsLayer(g: G): Layer {
  const r = R(g.seed * 100 + 13), out: Frag[] = [], src = g.moon, [px, py] = g.hang.pot, [lx, ly] = g.hang.lantern, N0 = B.near;
  out.push(glow(lx, ly, 80, P.lamp!, { opacity: 0.35, core: P["lamp-core"]! }));
  // chains
  const ch = [-34, 0, 34].map((dx) => cut([[px + dx * 0.15 - 1.8, -80], [px + dx * 0.15 + 1.8, -80], [px + dx + 1.8, py - 14], [px + dx - 1.8, py - 14]], r, 0.4, 40));
  ch.push(cut([[lx - 1.8, -80], [lx + 1.8, -80], [lx + 1.8, ly - 46], [lx - 1.8, ly - 46]], r, 0.4, 40));
  out.push(sheet(union(...ch), P.gate!, { shadow: false }));
  // hanging pot
  const pot: Poly = cut([[px - 48, py - 14], [px + 48, py - 14], [px + 36, py + 34], [px + 16, py + 54], [px - 16, py + 54], [px - 36, py + 34]], r, 1, 20);
  out.push(...pile(pot, [P["wall-dark"]!, P.gate!, P.wall!], 6, N0, src, { holes: [0, 1, 2, 3, 4].map((i) => rect(px - 32 + i * 15 + 4, py + 6, 6, 8)) }));
  // fronds hanging from the rim, vines trailing
  const fr = Array.from({ length: 6 }, (_, i) => flipY(fern(r, px - 40 + i * 16, py - 10, r.range(70, 120), r.range(-0.7, 0.7)), py - 10));
  out.push(paper(union(...fr), P["wall-dark"]!, N0, src, { rm: 0.35 }));
  const d = g.hang.drop;
  const vs = Array.from({ length: 7 }, (_, i) => vine(r, px - 46 + i * 15, py + 24, r.range(d * 0.4, d), 12));
  out.push(paper(union(...vs.slice(0, 4)), P.wall!, N0, src, { rm: 0.35 }));
  out.push(paper(union(...vs.slice(4)), P["wall-dark"]!, N0, src, { rm: 0.35 }));
  const iv = Array.from({ length: 6 }, (_, i) => vine(r, g.hang.x0 + (i / 5) * (g.hang.x1 - g.hang.x0), -70, r.range(d * 0.3, d * 0.8), 10));
  out.push(paper(union(...iv), P.gate!, N0, src, { rm: 0.35 }));
  // unlit hanging lantern r 26
  const ln = lantern(lx, ly, 60);
  out.push(sheet(union(...ln.holes), P["window-light"]!, { shadow: false, opacity: 0.5 }));
  out.push(...pile(ln.body, [P.gate!, P["wall-dark"]!, P.wall!], 2.5, N0, src, { holes: ln.holes }));
  return layer("plants-near" + g.s, 13, ...out);
}

/* ---------- 14-15 gates (drapes) ---------- */
type GC = { W: number; H: number; outerL: number; outerR: number; shift: number; gap: number; prof: Pt[]; seed: number; idL: string; idR: string };
function gates(c: GC, src: Pt) {
  const prof = interp(c.prof), rl = R(c.seed), rr = R(c.seed + 1), rd = R(c.seed + 2);
  const edge = (rg: Rng, dx: number): Pt[] => { const pts: Pt[] = []; for (let y = -60; y <= c.H + 60; y += 24) pts.push([prof(y) + dx + 13 * Math.sin(y / 52 + 1) + 7 * Math.sin(y / 19 + 2) + rg.range(-2.5, 2.5), y]); return pts; };
  const eL = edge(rl, 0), eR = edge(rr, c.gap);
  const polyL: Poly = [[c.outerL, -60], ...eL, [c.outerL, c.H + 60]], polyR: Poly = [[c.outerR, -60], ...eR, [c.outerR, c.H + 60]];
  const xAt = (e: Pt[], y: number) => { for (let i = 1; i < e.length; i++) if (y <= e[i]![1]) { const a = e[i - 1]!, b = e[i]!; return a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]); } return e[e.length - 1]![0]; };
  let minOv = 1e9;
  for (let y = 0; y <= c.H; y += 0.5) minOv = Math.min(minOv, xAt(eL, y) + c.shift - (xAt(eR, y) - c.shift));
  const body = (poly: Poly, e: Pt[], right: boolean, rg: Rng, fills: string[], tones: string[], rm: number, id: string, depth: number): Layer => {
    const dir = right ? -1 : 1, out: Frag[] = [];
    const fringe: Poly[] = [];
    for (let i = 1; i < e.length; i += 2) { const [x, y] = e[i]!; fringe.push([[x - dir * 6, y - 5], [x - dir * 6, y + 5], [x + dir * rg.range(14, 26), y + rg.range(2, 12)]]); }
    out.push(...pile(union(poly, ...fringe), fills, 16, B.gate, src, { rm }));
    const innerS = offset(poly, -34), outer = right ? c.outerR : c.outerL, edgeMean = e.reduce((s, p) => s + p[0], 0) / e.length;
    const lo = Math.min(outer, edgeMean) - 40, hi = Math.max(outer, edgeMean) + 40;
    const pb: Band = { off: 8, blur: 10, op: 0.4, rw: 2, rm };
    let xc = lo, i = 0;
    while (xc < hi) {
      const w = rg.range(46, 96);
      out.push(paper(inter(innerS, cut(rect(xc, -100, w, c.H + 220), rg, 1.4, 60)), tones[i % tones.length]!, pb, src, { rm, noInner: true }));
      xc += w; i++;
    }
    const fold = Array.from({ length: 34 }, (_, k) => cut(rect(rg.range(lo, hi), -100, rg.range(10, 22), c.H + 220), rg, 1.2, 60));
    out.push(sheet(inter(innerS, union(...fold.filter((_, k) => k % 2 === 0))), mix(tones[0]!, tones[2]!, 0.5), { shadow: false, opacity: 0.85 }));
    out.push(sheet(inter(innerS, union(...fold.filter((_, k) => k % 2 === 1))), mix(tones[0]!, fills[0]!, 0.6), { shadow: false, opacity: 0.85 }));
    // hem band with torn top edge
    const hem: Poly = [[lo, c.H - 50 + rg.range(-8, 8)]];
    for (let x = lo + 18; x < hi; x += 18) hem.push([x, c.H - 54 + rg.range(-16, 14)]);
    hem.push([hi, c.H + 200], [lo, c.H + 200]);
    out.push(paper(inter(innerS, hem), mix(tones[0]!, fills[0]!, 0.5), pb, src, { rm, noInner: true }));
    // growth creeping down from the top edge
    const vs = Array.from({ length: 5 }, () => vine(rg, edgeMean + dir * rg.range(-420, -30), -70, rg.range(140, 330), 12));
    const rts = Array.from({ length: 3 }, () => roots(rg, edgeMean + dir * rg.range(-380, -40), -70, 24, rg.range(120, 220), 3, 1));
    out.push(paper(inter(offset(poly, -4), union(...vs, ...rts)), fills[0]!, pb, src, { rm, noInner: true }));
    return layer(id, depth, ...out);
  };
  const L = body(polyL, eL, false, R(c.seed + 10), [P.gate!, P["wall-dark"]!, P.wall!], [P["wall-dark"]!, cn("wall-dark", "wall", 0.5), P.wall!, cn("wall-dark", "gate", 0.5)], 0.25, c.idL, 14);
  const Rl = body(polyR, eR, true, R(c.seed + 11), [P.gate!, P["wall-dark"]!, P["wall-mid"]!], [P["wall-dark"]!, cn("wall-dark", "wall-mid", 0.5), P.wall!, cn("wall", "wall-mid", 0.5)], 0.5, c.idR, 15);
  // gate-r: tie-back with tassel, and a fold showing the lighter reverse
  const xe = (y: number) => xAt(eR, y), ty = c.H * 0.52;
  const sash = band(quad([xe(ty) - 100, ty - 14], [xe(ty) - 50, ty + 30], [xe(ty) + 6, ty - 6], 30), 30, 24);
  const rev: Poly = cut([[xe(70) + 30, 70], [xe(70) - 110, 70], [xe(300) + 10, 300]], rd, 1.2, 40);
  const extra: Frag[] = [
    ...pile(union(rev), [P["wall-mid"]!, mix(P["wall-mid"]!, P["rim-warm"]!, 0.22)], 10, B.gate, src, { rm: 0.5, noInner: true }),
    ...pile(sash, [P["wall-mid"]!, mix(P["wall-mid"]!, P["rim-warm"]!, 0.3)], 5, B.near, src, { rm: 0.5 }),
    ...stack(disc(xe(ty) - 6, ty - 6, 22, 24), [P["wall-dark"]!, P["wall-mid"]!, mix(P["wall-mid"]!, P["rim-warm"]!, 0.3)], 6, { shadow: { dx: 3, dy: 6, blur: 6, opacity: 0.45, color: P.shadow } }),
    paper(union(roots(rd, xe(ty) - 6, ty + 14, 18, 90, 5, 1), cut(disc(xe(ty) - 6, ty + 100, 8, 10), rd, 0.5, 10)), P["wall-mid"]!, B.near, src, { rm: 0.5 }),
  ];
  Rl.frags.push(...extra);
  return { L, R: Rl, minOv, covL: eL.reduce((s, p) => s + p[0], 0) / eL.length, covR: c.W - eR.reduce((s, p) => s + p[0], 0) / eR.length };
}

/* ---------- assemble ---------- */
const sharedNight = nightLayer(), sharedGlow = glowLayer();
const gd = gates({
  W: GD.W, H: GD.H, outerL: -800, outerR: 2720, shift: 700, gap: 1300, seed: 9100, idL: "gate-l", idR: "gate-r",
  prof: [[-60, 270], [60, 270], [110, 385], [200, 392], [400, 390], [470, 380], [560, 285], [650, 288], [700, 310], [760, 315], [830, 270], [1140, 262]],
}, GD.moon);
const gp = gates({
  W: GP.W, H: GP.H, outerL: -560, outerR: 1640, shift: 460, gap: 820, seed: 9200, idL: "gate-l-p", idR: "gate-r-p",
  prof: [[-60, 150], [300, 178], [700, 128], [1100, 172], [1500, 140], [2000, 160]],
}, GP.moon);
const comp = (g: G, gl: ReturnType<typeof gates>): Layer[] => [
  rangeLayer(g), nearLayer(g), revealLayer(g), wallLayer(g), ribsLayer(g), frameLayer(g), sillLayer(g), floorLayer(g),
  shaftsLayer(g), mistLayer(g), motesLayer(g), plantsLayer(g), gl.L, gl.R,
];
const all: Layer[] = [sharedNight, sharedGlow, ...comp(GD, gd), ...comp(GP, gp)];
const BAKE: Record<string, [number, number]> = {
  "night-outside": [0.5, 45], "window-glow": [0.4, 40],
  "range-outside": [0.6, 50], "outside-near": [0.6, 50], "window-reveal": [0.55, 50], wall: [0.7, 55], "vault-ribs": [0.5, 50],
  "window-frame": [0.8, 58], sill: [0.8, 58], floor: [0.6, 52], shafts: [0.35, 35], mist: [0.3, 35], motes: [0.5, 40], "plants-near": [0.45, 45],
  "gate-l": [0.5, 45], "gate-r": [0.5, 45],
};
const bakeOf = (id: string) => BAKE[id.endsWith("-p") ? id.slice(0, -2) : id] ?? [1, 60];
const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
for (const l of all) {
  const [scale, quality] = bakeOf(l.id);
  const b = await bakeLayer(SLUG, l, { scale, quality });
  if (!b) throw new Error(`layer ${l.id} empty`);
  baked.set(l.id, b);
}
const r1 = (n: number) => Math.round(n * 10) / 10;
const compose = (width: number, height: number, include: string[], place: Record<string, { x?: number; y?: number; s?: number }> = {}) => ({
  width, height,
  layers: include.map((id) => {
    const b = baked.get(id)!, p = place[id] ?? {}, s = p.s ?? 1;
    return { id, src: `/art/${SLUG}/${id}.webp`, x: r1(b.x * s + (p.x ?? 0)), y: r1(b.y * s + (p.y ?? 0)), w: r1(b.w * s), h: r1(b.h * s), depth: b.depth };
  }).sort((a, b) => a.depth - b.depth),
});
const ids = (s: string) => ["night-outside", "range-outside", "outside-near", "window-reveal", "wall", "vault-ribs", "window-frame", "sill", "window-glow", "floor", "shafts", "mist", "motes", "plants-near", "gate-l", "gate-r"]
  .map((i) => (s && !["night-outside", "window-glow"].includes(i) ? i + s : i));
const dIds = ids(""), pIds = ids("-p").map((i) => (i.startsWith("gate-") ? i : i));
const place = {
  "night-outside": { s: 1.2, x: GP.moon[0] - GD.moon[0] * 1.2, y: GP.moon[1] - GD.moon[1] * 1.2 },
  "window-glow": { x: GP.lantern[0] - GD.lantern[0], y: GP.lantern[1] - GD.lantern[1] },
};
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: compose(GD.W, GD.H, dIds), portrait: compose(GP.W, GP.H, pIds, place) }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop"); await composite(SLUG, "portrait");

/* ---------- checks ---------- */
const mp = (list: string[]) => list.reduce((n, id) => { const b = baked.get(id)!, s = bakeOf(id)[0]; return n + (b.w * b.h * s * s) / 1e6; }, 0);
console.log("layers desktop", dIds.length, "portrait", pIds.length);
console.log("bytes total", total, "(KB", Math.round(total / 1024) + ")", "budget 450 KB = 460800");
console.log("decoded MP desktop", mp(dIds).toFixed(1), "portrait", mp(pIds).toFixed(1));
console.log("desktop gates: closed min overlap", gd.minOv.toFixed(1), "rest coverage L", (gd.covL / GD.W * 100).toFixed(1) + "%", "R", (gd.covR / GD.W * 100).toFixed(1) + "%", "total", ((gd.covL + gd.covR) / GD.W * 100).toFixed(1) + "%");
console.log("portrait gates: closed min overlap", gp.minOv.toFixed(1), "rest coverage L", (gp.covL / GP.W * 100).toFixed(1) + "%", "R", (gp.covR / GP.W * 100).toFixed(1) + "%", "total", ((gp.covL + gp.covR) / GP.W * 100).toFixed(1) + "%");
if (gd.minOv < 80 || gp.minOv < 80) throw new Error("gate closed overlap < 80");
for (const [id, b] of baked) console.log(" ", id.padEnd(18), String(b.bytes).padStart(7), JSON.stringify([r1(b.x), r1(b.y), r1(b.w), r1(b.h)]));
