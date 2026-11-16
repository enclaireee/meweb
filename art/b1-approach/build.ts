// b1-approach: the mountain fills the frame, a terraced ruin-carved cliff. Run: npx tsx art/b1-approach/build.ts
// Per-band bake settings need per-layer scale/quality, so layers are baked with bakeLayer and the manifest is
// written here in the exact bakeBeat format (same approach as b4-inner-sun).
import { squeeze, type Squeeze } from "../ambient/squeeze.ts";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, arch, bakeLayer, bridge, cloud, composite, cut, difference, ellipse, glow, hills, layer, lantern, mist, mix, offset, pine,
  rect, ridge, rng, roots, ruinWall, scatter, shaft, sheet, stairs, strata, tower, union, vine,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "b1-approach";
const P: Palette = {
  "sky-top": "#070d18", sky: "#0b1420", "sky-haze": "#16263a", star: "#cfe0f0", "far-ridge-1": "#4a6788", "far-ridge-2": "#34506e",
  "mid-ridge": "#22384f", "pine-mid": "#1a3346", "mountain-shade": "#1e3349", mountain: "#2c4763", "mountain-lit": "#3d5f80",
  "near-hill": "#132235", "near-dark": "#0d1828", gate: "#08101a", moon: "#dfe9f2", "moon-shade": "#b9cadb", mist: "#9fb8cf",
  "rim-cool": "#8fb2d4", window: "#ffb866", "window-core": "#fff1cf", "window-light": "#ffcf8a", shadow: "#03060c",
};
const W = 1920, H = 1080, PW = 1080, PH = 1920;
const LV: Pt = [0.55, -0.83];
const R = (n: number) => rng(10100 + n);
const lum = (h: string) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
const calmFills = new Set<string>(); // every fill used inside a calm zone is registered here and checked at the end
const cm = (a: string, b: string, t: number) => mix(P[a]!, P[b]!, t);

/* ---------- generic helpers ---------- */
type Band = { off: number; blur: number; op: number; rw: number; rm: number; inner?: [number, number] };
const B = {
  far: { off: 4, blur: 6, op: 0.25, rw: 1.5, rm: 0.35 },
  mid: { off: 8, blur: 10, op: 0.35, rw: 2, rm: 0.45, inner: [4, 0.25] },
  hero: { off: 12, blur: 14, op: 0.4, rw: 2.5, rm: 0.5, inner: [6, 0.3] },
  near: { off: 16, blur: 18, op: 0.45, rw: 3, rm: 0.45, inner: [8, 0.35] },
  gate: { off: 22, blur: 26, op: 0.55, rw: 3, rm: 0.5, inner: [10, 0.4] },
} satisfies Record<string, Band>;
const flat = (s: Poly | Shape): Shape => (typeof s[0]?.[0] === "number" ? [s as Poly] : (s as Shape));
const BIG = rect(-5000, -5000, 12000, 12000);
const inter = (a: Poly | Shape, b: Poly | Shape): Shape => difference(a, difference(BIG, b));
const disc = (cx: number, cy: number, rad: number, n = 72) => ellipse(cx, cy, rad, rad, n);
const mapS = (s: Poly | Shape, tf: (p: Pt) => Pt): Shape => flat(s).map((ring) => ring.map(tf));
const move = (s: Poly | Shape, dx: number, dy: number): Shape => flat(s).map((ring) => ring.map(([x, y]) => [x + dx, y + dy] as Pt));

type PaperOpts = { holes?: (Poly | Shape)[]; rm?: number; opacity?: number; noRim?: boolean; shadow?: false | { dx: number; dy: number; blur: number; opacity: number }; noInner?: boolean; calm?: boolean };
/** One sheet with the band recipe: key light LV, shadow away from it, rim on the lit side, inner shadow. */
function paper(shape: Poly | Shape, fill: string, b: Band, o: PaperOpts = {}): Frag {
  if (o.calm) calmFills.add(fill);
  return sheet(shape, fill, {
    holes: o.holes, opacity: o.opacity,
    shadow: o.shadow === false ? false : { color: P.shadow, blur: b.blur, opacity: b.op, dx: -LV[0] * b.off, dy: -LV[1] * b.off, ...o.shadow },
    edge: o.noRim ? undefined : { light: LV, width: b.rw, color: mix(fill, P["rim-cool"]!, o.rm ?? (o.calm ? 0.25 : b.rm)) },
    inner: b.inner && !o.noInner ? { blur: b.inner[0], opacity: b.inner[1], color: P.shadow } : undefined,
  });
}
/** Stacked sheets: same silhouette, each `inset` smaller, fills[0] outermost. */
function pile(shape: Poly | Shape, fills: string[], inset: number, b: Band, o: PaperOpts = {}): Frag[] {
  const out: Frag[] = [];
  let cur: Shape = union(shape);
  fills.forEach((f, i) => {
    if (!cur.length) return;
    out.push(paper(cur, f, i ? { ...b, off: b.off * 0.4, blur: b.blur * 0.5, op: b.op * 0.8 } : b, o));
    cur = offset(cur, -inset);
  });
  return out;
}
const flatS = (shape: Poly | Shape, fill: string, calm = false, opacity?: number): Frag => {
  if (calm) calmFills.add(fill);
  return sheet(shape, fill, { shadow: false, opacity });
};
const crop = (fr: Frag[], x0: number, y0: number, x1: number, y1: number): Frag[] =>
  fr.map((f) => ({ ...f, x0: Math.max(f.x0, x0), y0: Math.max(f.y0, y0), x1: Math.min(f.x1, x1), y1: Math.min(f.y1, y1) }));
const topAt = (poly: Poly, x: number) => {
  const t = poly.slice(0, -2);
  for (let i = 1; i < t.length; i++) { const a = t[i - 1]!, b = t[i]!; if (x >= a[0] && x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0] || 1); }
  return t[t.length - 1]![1];
};
const diamond = (x: number, y: number, s: number): Poly => [[x, y - s], [x + s * 0.6, y], [x, y + s], [x - s * 0.6, y]];
/** Thin jittered strip along a polyline (slits, waterfalls, trunks). Optional taper at both ends. */
function strip(r: Rng, pts: Pt[], w: number, step = 30, jit = 1, taper = true): Poly {
  const d: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!, b = pts[i + 1]!, n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let s = 0; s < n; s++) d.push([a[0] + ((b[0] - a[0]) * s) / n + (d.length ? r.range(-jit, jit) : 0), a[1] + ((b[1] - a[1]) * s) / n + (d.length ? r.range(-jit, jit) : 0)]);
  }
  d.push(pts[pts.length - 1]!);
  const L: Pt[] = [], Rr: Pt[] = [];
  d.forEach((p, k) => {
    const a = d[Math.max(0, k - 1)]!, b = d[Math.min(d.length - 1, k + 1)]!;
    const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l;
    const t = k / (d.length - 1), ww = (w / 2) * (taper ? Math.min(1, 0.45 + Math.min(t, 1 - t) * 6) : 1);
    L.push([p[0] + nx * ww, p[1] + ny * ww]); Rr.push([p[0] - nx * ww, p[1] - ny * ww]);
  });
  return [...L, ...Rr.reverse()];
}
/** Pine bough: thin spine running inward (dir) and drooping, with needle spikes hanging below. */
function bough(r: Rng, x: number, y: number, len: number, dir: 1 | -1, drop = 0.25): Shape {
  const N = Math.max(3, Math.round(len / 11)), parts: Poly[] = [], sp: Pt[] = [];
  for (let k = 0; k <= N; k++) { const t = k / N; sp.push([x + dir * len * t, y + len * drop * t * t + r.range(-1, 1)]); }
  parts.push([...sp.map(([a, b]) => [a, b - 1.6] as Pt), ...[...sp].reverse().map(([a, b]) => [a, b + 1.6] as Pt)]);
  for (let k = 1; k <= N; k++) {
    const [sx, sy] = sp[k]!, l2 = r.range(13, 26) * (1 - 0.35 * (k / N));
    parts.push([[sx - 2.6, sy], [sx + 2.6, sy], [sx + dir * r.range(-3, 5), sy + l2]]);
  }
  return union(...parts);
}
/** Zig-zag stairway: alternating flights (wedge profiles) with posts in the voids. Base yB at the bottom, top yT. */
function zig(r: Rng, x0: number, x1: number, yB: number, yT: number, n: number, steps: number) {
  const fh = (yB - yT) / n, w = x1 - x0, parts: (Poly | Shape)[] = [], fl: { dir: 1 | -1; yb: number }[] = [];
  const surf = (dir: 1 | -1, yb: number, x: number) => yb - fh * (dir === 1 ? (x - x0) / w : (x1 - x) / w);
  for (let i = 0; i < n; i++) {
    const dir: 1 | -1 = i % 2 === 0 ? 1 : -1, yb = yB - i * fh;
    parts.push(stairs(x0, yb - fh, w, fh, steps, dir));
    fl.push({ dir, yb });
    if (i) for (const t of [0.12, 0.38, 0.62, 0.88]) { const x = x0 + w * (t + r.range(-0.03, 0.03)), h = surf((-dir) as 1 | -1, yb + fh, x) - yb; if (h > 7) parts.push(rect(x - 4, yb - 1, 8, h + 1)); }
  }
  return { body: union(...parts), fl, fh, w, x0, x1, surf };
}
/** Balustrade along each flight with 3 holes per flight. */
function balust(z: ReturnType<typeof zig>, h = 22): { body: Shape; holes: Poly[] } {
  const body: Poly[] = [], holes: Poly[] = [];
  for (const f of z.fl) {
    const s0 = z.surf(f.dir, f.yb, z.x0), s1 = z.surf(f.dir, f.yb, z.x1);
    body.push([[z.x0, s0 - h], [z.x1, s1 - h], [z.x1, s1], [z.x0, s0]]);
    for (const t of [0.2, 0.5, 0.8]) {
      const xa = z.x0 + z.w * (t - 0.035), xb = z.x0 + z.w * (t + 0.035), sa = z.surf(f.dir, f.yb, xa), sb = z.surf(f.dir, f.yb, xb);
      holes.push([[xa, sa - h + 6], [xb, sb - h + 6], [xb, sb - 6], [xa, sa - 6]]);
    }
  }
  return { body: union(...body), holes };
}
function lanternAt(cx: number, cy: number) { // small lantern with warm glow; returns [behind, body]
  const L = lantern(cx, cy, 22);
  return [
    glow(cx, cy, 46, P.window!, { opacity: 0.5, core: P["window-core"]! }),
    sheet(union(...L.holes), P["window-light"]!, { shadow: false }),
    sheet(L.body, P["near-dark"]!, { holes: L.holes, shadow: false }),
  ];
}

/* ---------- geometry (shared outline: b2 must repeat these exact calls) ---------- */
const DP: Pt[] = [[300, 1010], [410, 870], [500, 770], [590, 640], [680, 520], [770, 400], [860, 260], [960, 110], [1050, 250], [1150, 380], [1250, 500], [1350, 630], [1450, 760], [1540, 880], [1620, 1010]];
const tfD = (p: Pt): Pt => p;
const tfP = ([x, y]: Pt): Pt => [540 + 0.94 * (x - 960), 260 + 1.444 * (y - 110)];
const lerpAt = (c: Pt[], y: number) => {
  for (let i = 0; i < c.length - 1; i++) { const a = c[i]!, b = c[i + 1]!; if (y >= Math.min(a[1], b[1]) && y <= Math.max(a[1], b[1])) return a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]); }
  return c[c.length - 1]![0];
};
const xl = (y: number) => lerpAt(DP.slice(0, 8), y), xr = (y: number) => lerpAt(DP.slice(7), y);

type Geo = { tf: (p: Pt) => Pt; sfx: string; seed: number; kc: number; lim: number; win: { cx: number; cy: number; w: number; h: number }; O: Shape; sx: number; fy: number; hole: Poly };
function geo(portrait: boolean): Geo {
  const tf = portrait ? tfP : tfD, seed = portrait ? 1102 : 1101;
  const O = union(cut(DP.map(tf), rng(seed), 2.5, 36)); // shared outline: cut(outline, rng(seed), 2.5, 36)
  const [sx, fy] = tf([960, 330]);
  const win = portrait ? { cx: 615, cy: 968, w: 60, h: 86 } : { cx: 1040, cy: 600, w: 56, h: 80 };
  const hole = arch(rng(seed + 50), win.cx, win.cy + win.h / 2, win.w, win.h, 0.8);
  return { tf, sfx: portrait ? "-p" : "", seed, kc: portrait ? 1.3 : 1, lim: portrait ? 1000 : Infinity, win, O, sx, fy, hole };
}
const tiersOf = (O: Shape, n: number, inset: number) => { const out: Shape[] = []; let cur = O; for (let i = 0; i < n; i++) { out.push(cur); cur = offset(cur, -inset); } return out; };
const soft = (b: Band): Band => ({ ...b, off: b.off * 0.4, blur: b.blur * 0.5, op: b.op * 0.8 });

/* ---------- mountain: face-back, face-l, face-r, face-top, creases ---------- */
const FL = [P["mid-ridge"]!, P["mountain-shade"]!, cm("mountain-shade", "mountain", 0.3), cm("mountain-shade", "mountain", 0.6)];
const FR = [P.mountain!, cm("mountain", "mountain-lit", 0.35), cm("mountain", "mountain-lit", 0.7), P["mountain-lit"]!];
const FRC = [P["mountain-shade"]!, cm("mountain-shade", "mountain", 0.4), cm("mountain-shade", "mountain", 0.7), P.mountain!]; // calm stand-ins for lit tiers
const DARKL = mix(P["mountain-shade"]!, P["near-dark"]!, 0.55);
const DARKR = P["near-dark"]!;

function faceHalf(g: Geo, side: "l" | "r"): Frag[] {
  const L = side === "l", rr = R(g.seed * 3 + (L ? 1 : 2)), out: Frag[] = [], tf = g.tf, M = (s: Poly | Shape) => mapS(s, tf);
  const clip = L ? rect(-3000, g.fy, g.sx + 3000, 5000) : rect(g.sx, g.fy, 5000, 5000);
  const T = tiersOf(g.O, 4, 14);
  const above = g.lim < 1e8 ? cut(rect(-500, -500, 3000, g.lim + 500), rr, 4, 40) : null;
  const below = above ? difference(BIG, above) : null;
  /** Right-half sheet: lit fill above the limit, calm fill below it (portrait only). */
  const paperR = (shape: Poly | Shape, lit: string, calmF: string, b: Band, o: PaperOpts = {}): Frag[] => {
    if (!above) return [paper(shape, lit, b, o)];
    return [paper(inter(shape, above), lit, b, o), paper(inter(shape, below!), calmF, b, { ...o, calm: true })];
  };
  const calmO: PaperOpts = { calm: true };
  T.forEach((t, i) => {
    const s = inter(t, clip), b = i ? soft(B.hero) : B.hero;
    if (L) out.push(paper(s, FL[i]!, b, { calm: true, holes: [] }));
    else out.push(...paperR(s, FR[i]!, FRC[i]!, b, { holes: [g.hole] }));
  });
  const Rg = inter(T[3]!, clip); // inner tier region: details live here
  const toneL = [0.1, 0.35, 0.2, 0.5, 0.0, 0.4, 0.25, 0.3], toneR = [0.8, 0.4, 0.65, 0.25, 0.55, 0.35, 0.7, 0.2];
  // strata bands
  const nb = Math.round((L ? 7 : 8) * g.kc);
  strata(rr, { x0: L ? 270 : 950, x1: L ? 970 : 1660, y: 350, base: 1080, bands: nb }).forEach((b, i) => {
    const s = inter(M(b), Rg);
    if (L) out.push(paper(s, mix(P["mountain-shade"]!, P.mountain!, toneL[i % 8]! * 0.9), B.mid, { shadow: false, noInner: true, rm: 0.25, calm: true }));
    else out.push(...paperR(s, mix(P.mountain!, P["mountain-lit"]!, toneR[i % 8]! * 0.8), mix(P["mountain-shade"]!, P.mountain!, 0.35 + 0.1 * (i % 4)), B.mid, { shadow: false, noInner: true, holes: [g.hole], rm: 0.45 }));
  });
  // carved terraces: broken ledges with a row of windows beneath each
  const ys = L ? [430, 610, 790] : [450, 640, 830], lo = (y: number) => (L ? xl(y) + 36 : 975), hi = (y: number) => (L ? 945 : xr(y) - 36);
  const ledges: Poly[] = [], fr: Poly[] = [], wd: Poly[] = [], wl: Poly[] = [], pines: Shape[] = [], vines: Shape[] = [];
  const perLedge = Math.round((L ? 6 : 8.7) * g.kc), cheat = L ? 0 : 3;
  ys.forEach((y, li) => {
    let x = lo(y) + rr.range(0, 20);
    while (x < hi(y) - 30) { const len = rr.range(70, 170); ledges.push(cut(rect(x, y, Math.min(len, hi(y) - x), rr.range(9, 13)), rr, 1.2, 30)); x += len + rr.range(8, 44); }
    for (let k = 0; k < perLedge; k++) {
      const row = k % 2 ? 48 : 30, wx = rr.range(lo(y + row) + 10, hi(y + row) - 10), wy = y + row;
      if (!L && (Math.hypot(wx - 1040, wy - 600) < 75 || (wx > 1160 && wx < 1340 && wy > 690 && wy < 890) || (wx > 1090 && wx < 1170 && wy > 480))) continue;
      const w = rr.range(3.8, 4.8);
      wd.push(arch(rr, wx, wy, w, w * 1.5, 0.3));
      (!L && li * perLedge + k < cheat && false ? wl : fr).push(arch(rr, wx, wy + 1.5, w + 3.2, w * 1.5 + 3, 0.3));
    }
    for (let c = 0; c < (L ? 1 : 1) * Math.round(g.kc); c++) { // pine cluster standing on the ledge
      const cx = rr.range(lo(y) + 30, hi(y) - 60), n = rr.int(3, 5);
      for (let k = 0; k < n; k++) pines.push(pine(rr, cx + k * rr.range(9, 13), y + 2, rr.range(24, 44)));
    }
    for (let k = 0; k < 2; k++) vines.push(vine(rr, rr.range(lo(y) + 20, hi(y) - 20), y + 10, rr.range(40, 110), 9));
  });
  const ledgeFill = L ? mix(P["mountain-shade"]!, P.mountain!, 0.75) : mix(P.mountain!, P["mountain-lit"]!, 0.8);
  const clipR = (s: Poly | Shape) => inter(M(s), Rg);
  if (L) out.push(paper(clipR(union(...ledges)), ledgeFill, B.mid, { calm: true }));
  else out.push(...paperR(clipR(union(...ledges)), ledgeFill, P.mountain!, B.mid));
  const frameFill = L ? mix(P["mountain-shade"]!, P.mountain!, 0.6) : mix(P["mountain-lit"]!, P["rim-cool"]!, 0.25);
  if (L) out.push(flatS(clipR(union(...fr)), frameFill, true));
  else out.push(...(above ? [flatS(inter(clipR(union(...fr)), above), frameFill), flatS(inter(clipR(union(...fr)), below!), P.mountain!, true)] : [flatS(clipR(union(...fr)), frameFill)]));
  out.push(flatS(clipR(union(...wd)), L ? DARKL : DARKR, true));
  out.push(flatS(clipR(union(...pines)), L ? DARKL : mix(P["mountain-shade"]!, P["near-dark"]!, 0.3), true));
  out.push(flatS(clipR(union(...vines)), L ? DARKL : mix(P["mountain-shade"]!, P["near-dark"]!, 0.3), true));
  if (L) {
    // ruined zig-zag stairway (treads 5 px) carved into the shade facet
    const z = zig(rr, 560, 670, 940, 780, 4, 8), brk = [rect(600, 860, 12, 30), rect(625, 800, 14, 24)];
    out.push(paper(clipR(difference(z.body, ...brk)), mix(P["mountain-shade"]!, P["near-dark"]!, 0.35), B.mid, calmO));
    // tiny ruin walls on the lowest ledge
    const rw = [ruinWall(rr, 520, 800, 90, 34), ruinWall(rr, 700, 802, 110, 40), ruinWall(rr, 430, 580, 70, 30)];
    out.push(paper(clipR(union(...rw.map((q) => q.body))), mix(P["mountain-shade"]!, P["near-dark"]!, 0.2), B.mid, { holes: rw.flatMap((q) => mapS(q.holes, tf)), calm: true }));
    return out;
  }
  // right facet: window-light windows, crevasse + bridge, towers on ledges, mist waterfall
  const lights = [[1230, 540], [1290, 700], [1170, 380]].map(([x, y]) => arch(rr, x!, y!, 4.4, 6.6, 0.3));
  out.push(...(above ? [flatS(inter(clipR(union(...lights)), above), P["window-light"]!)] : [flatS(clipR(union(...lights)), P["window-light"]!)]));
  const crev = cut([[1184, 694], [1318, 694], [1306, 780], [1320, 862], [1190, 862], [1202, 780]], rr, 2, 24);
  out.push(paper(clipR(crev), DARKR, B.mid, { calm: true, noRim: true }));
  const br = bridge(rr, 1170, 1330, 720, 10, 8);
  out.push(paper(clipR(br), P["mountain-shade"]!, B.mid, { calm: true }));
  const tw = [tower(rr, 1160, 470, 34, 92, { windows: 3 }), tower(rr, 1255, 650, 40, 112, { windows: 3 }), tower(rr, 1380, 838, 28, 64, { windows: 2 })];
  out.push(paper(clipR(union(...tw.map((q) => q.body))), P["mountain-shade"]!, B.mid, { holes: tw.flatMap((q) => mapS(q.holes, tf)), calm: true }));
  const rw = [ruinWall(rr, 1060, 832, 110, 40), ruinWall(rr, 1020, 652, 90, 34)].map((q) => q);
  out.push(paper(clipR(union(...rw.map((q) => q.body))), mix(P["mountain-shade"]!, P.mountain!, 0.4), B.mid, { holes: rw.flatMap((q) => mapS(q.holes, tf)), calm: true }));
  // waterfall: 3 mist strands (final-space strips so widths stay exact), slits cut through, clipped above the calm limit in portrait
  const strands: Poly[] = [], slits: Poly[] = [];
  [1100, 1126, 1152].forEach((x, i) => {
    const pts: Pt[] = [[x, 482], [x + 6, 640], [x - 4, 800], [x + 3, 1000]].map(([a, b]) => tf([a! + (i - 1) * 2, b!]));
    strands.push(strip(rr, pts, 10 + i * 2, 30, 1.2));
    for (let k = 0; k < 6; k++) { const t = 0.12 + k * 0.15, p = tf([x + 3 * Math.sin(k + i), 482 + t * 518]); slits.push(rect(p[0] - 1.6, p[1], 3.2, 14)); }
  });
  const fallShape = difference(union(...strands), ...slits);
  const falls = above ? inter(fallShape, rect(-500, -500, 3000, 1050 + 500)) : fallShape;
  out.push(flatS(inter(falls, Rg), P.mist!, false, 0.4));
  return out;
}

function faceTop(g: Geo): Frag[] {
  const rr = R(g.seed * 3 + 3), out: Frag[] = [], tf = g.tf, M = (s: Poly | Shape) => mapS(s, tf);
  const clip = rect(-3000, -3000, 9000, g.fy + 3000);
  const T = tiersOf(g.O, 3, 12);
  const sh = (i: number) => (i ? soft(B.hero) : B.hero);
  out.push(paper(inter(T[0]!, clip), P.mountain!, sh(0), { calm: true }));
  out.push(paper(inter(inter(T[1]!, clip), rect(g.sx - 40, -3000, 4000, 9000)), cm("mountain", "mountain-lit", 0.55), sh(1)));
  out.push(paper(inter(inter(T[1]!, clip), rect(g.sx - 90, -3000, 4000, 9000)), mix(P.mountain!, P["mountain-lit"]!, 0.2), sh(1), { calm: true, shadow: false, noInner: true, rm: 0.25 }));
  out.push(paper(inter(inter(T[2]!, clip), rect(g.sx + 8, -3000, 4000, 9000)), P["moon-shade"]!, sh(2), { opacity: 0.6, shadow: false }));
  const Rg = inter(T[2]!, clip);
  strata(rr, { x0: 790, x1: 1130, y: 170, base: 360, bands: 3 }).forEach((b, i) => out.push(paper(inter(M(b), Rg), mix(P.mountain!, P["mountain-shade"]!, 0.3 + i * 0.2), B.mid, { shadow: false, noInner: true, rm: 0.25, calm: true })));
  const wd: Poly[] = [];
  for (let i = 0; i < 9; i++) { const y = i % 2 ? 292 : 262; wd.push(arch(rr, rr.range(xl(y) + 36, xr(y) - 36), y, 4.2, 6.2, 0.3)); }
  out.push(flatS(inter(M(union(...wd)), Rg), DARKR, true));
  const tw = tower(rr, 1010, 300, 22, 54, { windows: 2 });
  out.push(paper(inter(M(tw.body), Rg), P["mountain-shade"]!, B.mid, { holes: mapS(tw.holes, tf), calm: true }));
  const pn: Shape[] = [];
  for (let i = 0; i < 9; i++) pn.push(pine(rr, rr.range(875, 1060), 306 + rr.range(-2, 3), rr.range(18, 32)));
  out.push(flatS(inter(M(union(...pn)), Rg), mix(P["mountain-shade"]!, P["near-dark"]!, 0.4), true));
  return out;
}

function faceBack(g: Geo): Frag[] {
  const dx = -18, dy = 22, back = move(g.O, dx, dy), out: Frag[] = [];
  out.push(...pile(back, [mix(P["mountain-shade"]!, P["near-dark"]!, 0.5), P["mountain-shade"]!], 10, B.hero, { calm: true, rm: 0.25 }));
  const { win } = g;
  const hl = arch(R(g.seed + 77), win.cx, win.cy + win.h / 2 + 4, win.w + 10, win.h + 10, 0.6);
  out.push(flatS(hl, P["window-light"]!));
  out.push(flatS(arch(R(g.seed + 78), win.cx, win.cy + win.h / 2 + 2, win.w * 0.55, win.h * 0.7, 0.4), P["window-core"]!));
  return out;
}

function creases(g: Geo): Frag[] {
  const rr = R(g.seed * 3 + 4), tf = g.tf, mp = (a: [number, number][]) => a.map(tf);
  const paths: { p: Pt[]; calm: boolean }[] = [
    { p: mp([[960, 118], [963, 330], [958, 560], [962, 780], [960, 1010]]), calm: false },
    { p: mp([[815, 330], [880, 331], [960, 329], [1040, 331], [1111, 330]]), calm: false },
    { p: mp([[960, 330], [880, 450], [820, 570], [740, 700], [680, 840], [600, 1010]]), calm: true },
    { p: mp([[960, 330], [900, 520], [870, 660], [830, 820], [790, 1010]]), calm: true },
    { p: mp([[960, 330], [1060, 450], [1150, 580], [1200, 760], [1330, 1010]]), calm: false },
    { p: mp([[960, 330], [1100, 400], [1230, 520], [1330, 700], [1480, 1010]]), calm: false },
  ];
  const slits = paths.map((q, i) => strip(rr, q.p, i < 2 ? 3.6 : 3.2, 30, 1.1));
  const lipC = paths.map((q, i) => ({ s: move(strip(R(g.seed + 900 + i), q.p, i < 2 ? 3.6 : 3.2, 30, 1.1), 1.6, -1.2), calm: q.calm }));
  const lipFill = mix(P.mountain!, P["rim-cool"]!, 0.4), lipCalm = mix(P.mountain!, P["rim-cool"]!, 0.2);
  calmFills.add(lipCalm);
  return [
    flatS(union(...lipC.filter((q) => !q.calm).map((q) => q.s)), lipFill),
    flatS(union(...lipC.filter((q) => q.calm).map((q) => q.s)), lipCalm),
    flatS(union(...slits), P.shadow!, false, 0.8),
  ];
}

/* ---------- sky, moon ---------- */
function skyLayer(): Layer {
  const r = R(1), out: Frag[] = [];
  out.push(flatS(rect(0, 0, W, H), P["sky-top"]!, true));
  out.push(flatS(cut([[-20, 190], [W + 20, 170], [W + 20, H + 20], [-20, H + 20]], r, 3, 40), P.sky!, true));
  out.push(flatS(cut([[-20, 650], [W + 20, 630], [W + 20, H + 20], [-20, H + 20]], r, 4, 40), P["sky-haze"]!, true));
  const star = (x: number, y: number) => diamond(x, y, r.range(2, 2.8));
  out.push(flatS(scatter(r, { x0: 20, y0: 20, x1: 640, y1: 470 }, 42, star, 26), P.star!, true, 0.45));
  out.push(flatS(scatter(r, { x0: 1180, y0: 20, x1: 1900, y1: 420 }, 48, star, 26), P.star!, false, 0.9));
  return layer("sky", 0, ...out);
}
function moonLayer(): Layer {
  const r = R(2), [cx, cy] = [1800, 110];
  const out: Frag[] = [glow(cx, cy, 560, P.mist!, { opacity: 0.35, core: mix(P.mist!, P.moon!, 0.5) })];
  out.push(...pile(cut(disc(cx, cy, 230, 96), r, 1.5, 40), [P.mist!, P["moon-shade"]!, P.moon!], 12, { off: 10, blur: 12, op: 0.35, rw: 2, rm: 0.4 }, { noInner: true, rm: 0.3 }));
  [[1700, 170, 44], [1860, 60, 30], [1770, 262, 26], [1640, 60, 20]].forEach(([x, y, rad]) =>
    out.push(...pile(cut(disc(x!, y!, rad!, 28), r, 0.8, 20), [P["moon-shade"]!, mix(P["moon-shade"]!, P.moon!, 0.5)], 5, { off: 3, blur: 4, op: 0.2, rw: 1, rm: 0.2 }, { noRim: true, noInner: true })));
  return layer("moon-edge", 1, ...crop(out, 0, 0, W, H));
}

/* ---------- ranges, clouds, shoulders ---------- */
function rangeLayer(portrait: boolean): Layer {
  const r = R(portrait ? 31 : 3), out: Frag[] = [];
  type Rg = { x0: number; x1: number; y: number; amp: number; base: number; fill: string; seed: number; calm: boolean };
  const defs: Rg[] = portrait
    ? [
        { x0: -80, x1: 1160, y: 1450, amp: 110, base: 1700, fill: P["far-ridge-2"]!, seed: 41, calm: true },
        { x0: -80, x1: 1160, y: 1520, amp: 80, base: 1700, fill: cm("far-ridge-2", "mid-ridge", 0.5), seed: 42, calm: true },
      ]
    : [
        { x0: 820, x1: 2000, y: 800, amp: 110, base: 1100, fill: P["far-ridge-1"]!, seed: 11, calm: false },
        { x0: -80, x1: 1000, y: 820, amp: 110, base: 1100, fill: P["far-ridge-2"]!, seed: 12, calm: true },
        { x0: 1000, x1: 2000, y: 880, amp: 70, base: 1100, fill: cm("far-ridge-1", "far-ridge-2", 0.5), seed: 13, calm: false },
        { x0: -80, x1: 760, y: 890, amp: 70, base: 1100, fill: cm("far-ridge-2", "mid-ridge", 0.5), seed: 14, calm: true },
      ];
  defs.forEach((d, di) => {
    const poly = ridge(r, { x0: d.x0, x1: d.x1, y: d.y, base: d.base, amp: d.amp, seed: d.seed, step: 34 });
    const dark = mix(d.fill, P["near-dark"]!, 0.35);
    out.push(...pile(cut(poly, r, 1.2, 30), [dark, d.fill], 5, B.far, { calm: d.calm, rm: d.calm ? 0.25 : 0.35 }));
    const pn: Shape[] = [];
    for (let i = 0; i < 18; i++) { const x = r.range(d.x0 + 20, d.x1 - 20); pn.push(pine(r, x, topAt(poly, x) + 5, r.range(14, 26))); }
    out.push(flatS(union(...pn), mix(d.fill, P["near-dark"]!, 0.5), d.calm));
    const T = [0, 1].map(() => { const x = r.range(d.x0 + 60, d.x1 - 60); return tower(r, x, topAt(poly, x) + 6, 8, 20, { windows: 1 }); });
    out.push(paper(union(...T.map((q) => q.body)), mix(d.fill, P["near-dark"]!, 0.25), B.far, { holes: T.flatMap((q) => q.holes), calm: d.calm, noInner: true }));
    // windows / terraces on the far slopes keep the plane busy
    const wn: Poly[] = [];
    for (let i = 0; i < 14; i++) { const x = r.range(d.x0 + 20, d.x1 - 20); wn.push(rect(x, topAt(poly, x) + r.range(14, 50), 3.2, 4.2)); }
    out.push(flatS(union(...wn), mix(d.fill, P["near-dark"]!, 0.6), d.calm));
    void di;
  });
  return layer(portrait ? "range-far-p" : "range-far", 2, ...out);
}
function cloudsLayer(portrait: boolean): Layer {
  const r = R(portrait ? 51 : 5), out: Frag[] = [];
  const banks = portrait
    ? [{ cx: 190, cy: 400, w: 480, h: 120, f: P["sky-haze"]! }, { cx: 910, cy: 360, w: 460, h: 110, f: cm("sky-haze", "far-ridge-1", 0.5) }]
    : [{ cx: 340, cy: 500, w: 640, h: 140, f: P["sky-haze"]! }, { cx: 1650, cy: 490, w: 640, h: 140, f: cm("sky-haze", "far-ridge-1", 0.5) }];
  const isCalm = (f: string) => lum(f) <= 0.1;
  banks.forEach((b) => {
    const shape = union(cloud(r, b.cx, b.cy, b.w, b.h), cloud(r, b.cx + b.w * 0.22, b.cy + 18, b.w * 0.5, b.h * 0.55), cloud(r, b.cx - b.w * 0.28, b.cy + 10, b.w * 0.38, b.h * 0.5));
    out.push(...pile(shape, [mix(b.f, P.sky!, 0.35), b.f], 6, B.far, { calm: !portrait && b.cx < 864, rm: isCalm(b.f) ? 0.25 : 0.35 }));
    const sl: Poly[] = [];
    for (let i = 0; i < 7; i++) sl.push(cut(rect(b.cx - b.w * 0.4 + i * (b.w * 0.12) + r.range(-10, 10), b.cy + b.h * 0.12 + r.range(-6, 6), r.range(26, 60), 3.4), r, 0.4, 20));
    out.push(flatS(union(...sl), mix(b.f, P.sky!, 0.5), !portrait && b.cx < 864));
  });
  return layer(portrait ? "clouds-p" : "clouds", 3, ...out);
}

type ShCfg = { id: string; z: number; x0: number; x1: number; y: number; amp: number; base: number; seed: number; fills: string[]; calm: boolean; towers: number; bridgeAt?: [number, number, number]; stairsAt?: [number, number]; pines: number; light: boolean };
function shoulder(c: ShCfg): Layer {
  const r = R(c.seed), out: Frag[] = [];
  const poly = ridge(r, { x0: c.x0, x1: c.x1, y: c.y, base: c.base, amp: c.amp, seed: c.seed, step: 36 });
  const body: Shape = c.bridgeAt ? union(poly, rect(c.bridgeAt[0] - 40, c.bridgeAt[2] - 4, 90, 400)) : union(poly);
  out.push(...pile(cut(body[0]!, r, 2, 34), c.fills, 8, B.mid, { calm: c.calm, rm: c.calm ? 0.25 : 0.45 }));
  const inner = offset(body, -22);
  const bandF = c.fills.map((f) => mix(f, P["near-dark"]!, 0.18));
  strata(r, { x0: c.x0, x1: c.x1, y: c.y + 20, base: c.base, bands: 3 }).forEach((b, i) =>
    out.push(paper(inter(b, inner), bandF[(i + 1) % bandF.length]!, B.mid, { shadow: false, noInner: true, calm: c.calm, rm: c.calm ? 0.25 : 0.4 })));
  const pn: Shape[] = [];
  for (let i = 0; i < c.pines; i++) { const x = r.range(c.x0 + 20, c.x1 - 20); pn.push(pine(r, x, topAt(poly, x) + (i % 3 ? r.range(6, 110) : 4), r.range(22, 56))); }
  out.push(flatS(union(...pn), mix(c.fills[0]!, P["near-dark"]!, 0.45), c.calm));
  const wn: Poly[] = [];
  for (let i = 0; i < 26; i++) { const x = r.range(c.x0 + 20, c.x1 - 20); wn.push(arch(r, x, topAt(poly, x) + r.range(30, 160), 4, 6, 0.3)); }
  out.push(flatS(inter(union(...wn), inner), mix(c.fills[0]!, P["near-dark"]!, 0.65), c.calm));
  const bod: Shape[] = [], hol: Poly[] = [];
  for (let i = 0; i < c.towers; i++) { const x = c.x0 + (c.x1 - c.x0) * (0.25 + 0.5 * (i / Math.max(1, c.towers - 1 || 1))) + r.range(-30, 30), h = r.range(70, 110), t = tower(r, x, topAt(poly, x) + 6, h * 0.36, h, { windows: 3 }); bod.push(t.body); hol.push(...t.holes); }
  if (c.bridgeAt) { const [bx0, bx1, by] = c.bridgeAt, t = tower(r, bx0 + 4, by + 4, 22, 58, { windows: 2 }); bod.push(bridge(r, bx0, bx1, by, 8, 5), t.body); hol.push(...t.holes); }
  if (c.stairsAt) { const [sx, sy] = c.stairsAt; bod.push(zig(r, sx, sx + 120, sy + 70, sy, 2, 12).body); }
  out.push(paper(union(...bod), mix(c.fills[0]!, P["near-dark"]!, 0.35), B.mid, { holes: hol, calm: c.calm, rm: c.calm ? 0.25 : 0.45 }));
  return layer(c.id, c.z, ...out);
}

/* ---------- near: stairs + ground, mist ---------- */
function groundFrags(r: Rng, x0: number, x1: number, y: number, amp: number, base: number, seed: number, avoid: [number, number], nPine: number, bands: number): Frag[] {
  const out: Frag[] = [];
  const poly = hills(r, { x0, x1, y, base, amp, seed, step: 70 });
  out.push(...pile(cut(poly, r, 3.5, 40), [P["near-dark"]!, mix(P["near-dark"]!, P["near-hill"]!, 0.5), P["near-hill"]!], 10, B.near, { calm: true, rm: 0.25 }));
  const inner = offset(poly, -26);
  strata(r, { x0, x1, y: y + 24, base, bands }).forEach((b, i) =>
    out.push(paper(inter(b, inner), mix(P["near-hill"]!, P["near-dark"]!, 0.2 + 0.16 * (i % 3)), B.mid, { shadow: false, noInner: true, calm: true })));
  const pn: Shape[] = [], fr: Shape[] = [];
  for (let i = 0, t = 0; i < nPine && t < nPine * 20; t++) {
    const x = r.range(x0 + 10, x1 - 10); if (x > avoid[0] && x < avoid[1]) continue;
    pn.push(pine(r, x, topAt(poly, x) + 4, r.range(46, 110))); i++;
  }
  for (let i = 0; i < 12; i++) { const x = r.range(x0 + 10, x1 - 10); if (x > avoid[0] && x < avoid[1]) continue; fr.push(roots(r, x, topAt(poly, x) + 4, 24, r.range(30, 70), 3, 1)); }
  out.push(flatS(union(...pn, ...fr), P["near-dark"]!, true));
  const wn: Poly[] = [];
  for (let i = 0; i < 20; i++) { const x = r.range(x0 + 10, x1 - 10); wn.push(rect(x, topAt(poly, x) + r.range(14, base - y - 10), r.range(5, 12), r.range(3, 6))); }
  out.push(flatS(inter(union(...wn), inner), P["near-dark"]!, true));
  return out;
}
function stairsNear(portrait: boolean): Layer {
  const r = R(portrait ? 61 : 6), out: Frag[] = [];
  if (!portrait) {
    out.push(...groundFrags(r, -60, 1980, 1050, 38, 1130, 23, [770, 1160], 26, 2));
    const z = zig(r, 800, 1120, 1080, 680, 4, 20), ledge = cut(rect(960, 664, 190, 16), r, 1, 30);
    out.push(...pile(union(z.body, ledge), [P["near-dark"]!, cm("near-dark", "near-hill", 0.5), P["near-hill"]!], 7, B.near, { rm: 0.45 }));
    const bal = balust(z, 22);
    out.push(paper(bal.body, cm("near-dark", "near-hill", 0.7), B.mid, { holes: bal.holes, rm: 0.45 }));
    const posts = [rect(1002, 636, 5, 34), rect(1132, 646, 5, 24)]; // lantern posts on the top ledge
    out.push(flatS(union(...posts), P["near-dark"]!));
    out.push(...lanternAt(1004.5, 626), ...lanternAt(1134.5, 636));
    const fern: Shape[] = [];
    for (let i = 0; i < 10; i++) fern.push(vine(r, r.range(805, 1115), r.range(700, 760) + i * 28, r.range(26, 60), 7));
    out.push(flatS(union(...fern), P["near-dark"]!));
  } else {
    out.push(...groundFrags(r, -60, 1140, 1600, 44, 1990, 63, [250, 700], 30, 5));
    const z = zig(r, 260, 640, 1920, 1060, 5, 30), ledge = cut(rect(520, 1046, 200, 16), r, 1, 30);
    out.push(...pile(union(z.body, ledge), [P["near-dark"]!, cm("near-dark", "near-hill", 0.5), P["near-hill"]!], 7, B.near, { rm: 0.25, calm: true }));
    const bal = balust(z, 24);
    out.push(paper(bal.body, cm("near-dark", "near-hill", 0.7), B.mid, { holes: bal.holes, calm: true }));
    out.push(flatS(union(rect(532, 1016, 5, 34), rect(702, 1030, 5, 20)), P["near-dark"]!, true));
    out.push(...lanternAt(534.5, 1006), ...lanternAt(704.5, 1020)); // above y 1056 only
    out.push(flatS(union(...Array.from({ length: 14 }, (_, i) => vine(r, r.range(270, 630), 1200 + i * 48, r.range(26, 60), 7))), P["near-dark"]!, true));
  }
  return layer(portrait ? "stairs-near-p" : "stairs-near", 12, ...out);
}
function mistLayer(portrait: boolean): Layer {
  const r = R(portrait ? 71 : 7), out: Frag[] = [];
  if (!portrait) {
    out.push(mist(430, 910, 880, 110, P.mist!, 0.08), mist(1400, 910, 1100, 110, P.mist!, 0.25), mist(1300, 830, 800, 70, P.mist!, 0.15));
    out.push(shaft(1700, 0, 50, 170, 900, -33, P.mist!, 0.16), shaft(1860, 20, 40, 150, 760, -34, P.mist!, 0.13));
    out.push(flatS(scatter(r, { x0: 980, y0: 120, x1: 1880, y1: 900 }, 80, (x, y) => ellipse(x, y, r.range(1.5, 3.2), r.range(1.5, 3.2), 6), 16), P.mist!, false, 0.55));
  } else {
    out.push(mist(540, 1590, 1160, 110, P.mist!, 0.07), mist(760, 930, 600, 110, P.mist!, 0.2), mist(380, 700, 500, 90, P.mist!, 0.12));
    out.push(shaft(920, 0, 40, 150, 700, -30, P.mist!, 0.15), shaft(1020, 20, 34, 120, 560, -31, P.mist!, 0.12));
    out.push(flatS(scatter(r, { x0: 580, y0: 160, x1: 1040, y1: 1000 }, 70, (x, y) => ellipse(x, y, r.range(1.5, 3.2), r.range(1.5, 3.2), 6), 16), P.mist!, false, 0.55));
  }
  return layer(portrait ? "mist-p" : "mist", 13, ...out);
}

/* ---------- gates ---------- */
type Seg = { a: number; b: number; p: number };
function phaseSegs(r: Rng, lo: number, hi: number, holdMin: number, holdMax: number): Seg[] {
  const out: Seg[] = []; let y = lo, p = r() < 0.5 ? 0 : 1;
  while (y < hi) {
    out.push({ a: y, b: Math.min(hi, y + r.range(holdMin, holdMax)), p }); y = out[out.length - 1]!.b;
    if (y >= hi) break;
    const q = r.range(0, 1) < 0.5 ? 1 - p : r.range(0, 1);
    for (let k = 1; k <= 3; k++) { const hh = r.range(16, 26); out.push({ a: y, b: Math.min(hi, y + hh), p: p + ((q - p) * k) / 4 }); y += hh; }
    p = q;
  }
  out[out.length - 1]!.b = hi;
  return out;
}
function edgePts(r: Rng, segs: Seg[], vOf: (p: number) => number): Pt[] {
  const pts: Pt[] = [];
  for (const s of segs) { const n = Math.max(1, Math.round((s.b - s.a) / 28)); for (let i = 0; i <= n; i++) pts.push([vOf(s.p) + r.range(-4, 4), s.a + ((s.b - s.a) * i) / n]); }
  return pts;
}
const crossY = (poly: Poly, c: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i < poly.length; i++) { const a = poly[i]!, b = poly[(i + 1) % poly.length]!; if ((a[1] <= c && b[1] > c) || (b[1] <= c && a[1] > c)) out.push(a[0] + ((b[0] - a[0]) * (c - a[1])) / (b[1] - a[1])); }
  return out;
};
type GateCfg = { h: number; l0: number; amp: number; gap: number; bl: number; br: number; shift: number; idL: string; idR: string; seed: number; nb: number };
function gates(c: GateCfg) {
  const rl = R(c.seed), rr = R(c.seed + 1), rs = R(c.seed + 2), rd = R(c.seed + 3);
  const segs = phaseSegs(rs, -60, c.h + 60, 100, 190);
  const xL = (p: number) => c.l0 + c.amp * p, xR = (p: number) => xL(p) + c.gap;
  const pl = edgePts(rl, segs, xL), pr = edgePts(rr, segs, xR);
  const polyL: Poly = [[c.bl, -60], ...pl, [c.bl, c.h + 60]], polyR: Poly = [[c.br, -60], ...pr, [c.br, c.h + 60]];
  let minOv = 1e9;
  for (let y = -60; y < c.h + 60; y += 0.5) minOv = Math.min(minOv, Math.max(...crossY(polyL, y + 0.25)) + c.shift - (Math.min(...crossY(polyR, y + 0.25)) - c.shift));
  const fringe = (right: boolean, pts: Pt[], r: Rng) => {
    const nx = right ? -1 : 1, out: Shape[] = [];
    for (let i = 0; i < pts.length; i += 1) {
      const [v, u] = pts[i]!, t = r();
      if (i % 2) continue;
      if (t < 0.45) out.push(bough(r, v - nx * 6, u, r.range(50, 120), nx as 1 | -1, r.range(0.15, 0.4)));
      else if (t < 0.7) out.push(vine(r, v - nx * 4, u, r.range(50, 130), 10));
      else out.push(roots(r, v - nx * 4, u, 14, r.range(40, 100), 3, 1));
    }
    if (right) for (const k of [0.3, 0.68]) { const u = c.h * k, p = segs.find((s) => s.a <= u && s.b >= u)!; out.push(pine(r, xR(p.p) + 8, u, r.range(260, 360))); }
    else for (const k of [0.2, 0.55, 0.85]) { const u = c.h * k, p = segs.find((s) => s.a <= u && s.b >= u)!; out.push(bough(r, xL(p.p) - 10, u, 170, 1, 0.3)); }
    return out;
  };
  const build = (right: boolean, poly: Poly, pts: Pt[], r: Rng, id: string, fills: string[], depth: number) => {
    const body = union(poly, ...fringe(right, pts, r));
    const out: Frag[] = pile(body, fills, 16, B.gate, { rm: right ? 0.5 : 0.25, calm: !right });
    const inner = offset(poly, -42);
    const x0 = right ? c.br - 1100 : c.bl, x1 = right ? c.br : c.bl + 1100 + c.l0 + c.amp - 200;
    const tone = (t: number) => mix(P.gate!, right ? mix(P["near-dark"]!, P["rim-cool"]!, 0.14) : P["near-dark"]!, t);
    strata(r, { x0: right ? x0 : c.bl, x1: right ? x1 : c.l0 + c.amp + 40, y: -40, base: c.h + 140, bands: c.nb }).forEach((b, i) =>
      out.push(paper(inter(b, inner), tone([0.35, 0.75, 0.5, 1, 0.2, 0.65][i % 6]!), B.mid, { shadow: false, noInner: true, rm: right ? 0.3 : 0.2, calm: !right })));
    // trunks and masonry, tone on tone
    const tk: Poly[] = [];
    for (let i = 0; i < 6; i++) { const x = right ? r.range(c.br - 900, c.br - 120) : r.range(c.bl + 120, c.bl + 1000), w = r.range(26, 44); tk.push(strip(r, [[x, -60], [x + r.range(-14, 14), c.h * 0.5], [x + r.range(-14, 14), c.h + 60]], w, 60, 2, false)); }
    out.push(paper(inter(union(...tk), inner), tone(0.9), B.mid, { shadow: false, noInner: true, rm: 0.25, calm: !right }));
    const rw = Array.from({ length: Math.round(c.h / 180) }, () => { const w = r.range(120, 240), x = right ? r.range(c.br - 700, c.br - w - 40) : r.range(c.bl + 100, c.bl + 800); return ruinWall(r, x, r.range(60, c.h), w, r.range(60, 120)); });
    out.push(paper(inter(union(...rw.map((q) => q.body)), inner), tone(0.55), B.mid, { holes: rw.flatMap((q) => q.holes), calm: !right, rm: right ? 0.3 : 0.2 }));
    const ck: Poly[] = [];
    for (let i = 0; i < Math.round(c.h / 60); i++) { const x = right ? r.range(c.br - 1000, c.br - 100) : r.range(c.bl + 100, c.bl + 1100), y = r.range(0, c.h); ck.push(strip(r, [[x, y], [x + r.range(-30, 30), y + r.range(30, 90)]], 3.4, 30, 1.5)); }
    out.push(flatS(inter(union(...ck), inner), P.gate!, !right, 0.8));
    return layer(id, depth, ...out);
  };
  const GL = [P["near-dark"]!, mix(P["near-dark"]!, P["rim-cool"]!, 0.06), mix(P["near-dark"]!, P["rim-cool"]!, 0.12)];
  const GR = [P["near-dark"]!, mix(P["near-dark"]!, P["rim-cool"]!, 0.1), mix(P["near-dark"]!, P["rim-cool"]!, 0.2)];
  // spec fills: gate, near-dark, mix(near-dark, rim-cool, .12|.2): outer tier is the darkest token
  GL[0] = P.gate!; GR[0] = P.gate!; GL[1] = P["near-dark"]!; GR[1] = P["near-dark"]!; GL[2] = mix(P["near-dark"]!, P["rim-cool"]!, 0.12); GR[2] = mix(P["near-dark"]!, P["rim-cool"]!, 0.2);
  void rd;
  return {
    gl: build(false, polyL, pl, R(c.seed + 4), c.idL, GL, 14), gr: build(true, polyR, pr, R(c.seed + 5), c.idR, GR, 15), minOv,
    restL: [Math.min(...pl.map((p) => p[0])), Math.max(...pl.map((p) => p[0]))], restR: [Math.min(...pr.map((p) => p[0])), Math.max(...pr.map((p) => p[0]))],
  };
}

/* ---------- assemble ---------- */
const gD = geo(false), gP = geo(true);
const mtn = (g: Geo): Layer[] => [
  layer("face-back" + g.sfx, 6, ...faceBack(g)),
  layer("face-l" + g.sfx, 7, ...faceHalf(g, "l")),
  layer("face-r" + g.sfx, 8, ...faceHalf(g, "r")),
  layer("face-top" + g.sfx, 9, ...faceTop(g)),
  layer("creases" + g.sfx, 10, ...creases(g)),
];
const glowL = layer("window-glow", 11, glow(1040, 600, 220, P.window!, { opacity: 0.55, core: P["window-core"]! }));
const sky = skyLayer(), moon = moonLayer();
const shoulders = (portrait: boolean): Layer[] =>
  portrait
    ? [
        shoulder({ id: "shoulder-l-p", z: 4, x0: -80, x1: 330, y: 1290, amp: 240, base: 1700, seed: 81, fills: [P["pine-mid"]!, cm("pine-mid", "mid-ridge", 0.5), P["mid-ridge"]!], calm: true, towers: 1, pines: 22, light: false }),
        shoulder({ id: "shoulder-r-p", z: 5, x0: 760, x1: 1160, y: 1290, amp: 240, base: 1700, seed: 82, fills: [P["mountain-shade"]!, cm("mountain-shade", "mountain", 0.5), P.mountain!], calm: true, towers: 2, stairsAt: [880, 1500], pines: 22, light: false }),
      ]
    : [
        shoulder({ id: "shoulder-l", z: 4, x0: -80, x1: 480, y: 740, amp: 260, base: 1120, seed: 83, fills: [P["pine-mid"]!, cm("pine-mid", "mid-ridge", 0.5), P["mid-ridge"]!], calm: true, towers: 0, bridgeAt: [350, 470, 820], pines: 40, light: false }),
        shoulder({ id: "shoulder-r", z: 5, x0: 1400, x1: 2000, y: 700, amp: 280, base: 1120, seed: 84, fills: [P.mountain!, cm("mountain", "mountain-lit", 0.5), P["mountain-lit"]!], calm: false, towers: 2, stairsAt: [1720, 860], pines: 30, light: true }),
      ];
const gateD = gates({ h: H, l0: 210, amp: 100, gap: 1310, bl: -800, br: 2720, shift: 700, idL: "gate-l", idR: "gate-r", seed: 91, nb: 9 });
const gateP = gates({ h: PH, l0: 110, amp: 80, gap: 780, bl: -560, br: 1640, shift: 460, idL: "gate-l-p", idR: "gate-r-p", seed: 95, nb: 14 });
const [shLD, shRD] = shoulders(false)!, [shLP, shRP] = shoulders(true)!;
const all: Layer[] = [
  sky, moon, rangeLayer(false), cloudsLayer(false), shLD!, shRD!, ...mtn(gD), glowL, stairsNear(false), mistLayer(false), gateD.gl, gateD.gr,
  rangeLayer(true), cloudsLayer(true), shLP!, shRP!, ...mtn(gP), stairsNear(true), mistLayer(true), gateP.gl, gateP.gr,
];
const BAKE: Record<string, [number, number]> = (() => {
  const t: Record<string, [number, number]> = {
    sky: [0.4, 40], "moon-edge": [0.45, 40], "range-far": [0.55, 40], clouds: [0.5, 40], "shoulder-l": [0.55, 40], "shoulder-r": [0.55, 40],
    "face-back": [0.45, 40], "face-l": [0.7, 45], "face-r": [0.7, 45], "face-top": [0.7, 45], creases: [0.55, 40], "window-glow": [0.35, 40],
    "stairs-near": [0.5, 40], mist: [0.35, 35], "gate-l": [0.3, 35], "gate-r": [0.3, 35],
  };
  for (const k of Object.keys(t)) if (k !== "sky" && k !== "moon-edge" && k !== "window-glow") t[k + "-p"] = [t[k]![0] * 0.88, t[k]![1]];
  return t;
})();
const SCALE = Number(process.env.B1_SCALE ?? 1), QUAL = Number(process.env.B1_Q ?? 1);
const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
for (const l of all) {
  const [scale, quality] = BAKE[l.id] ?? [1, 60];
  const sc = /^face-|^creases/.test(l.id) ? scale * SCALE : scale;
  const b = await bakeLayer(SLUG, l, { scale: sc, quality: Math.round(quality * QUAL) });
  if (!b) throw new Error(`layer ${l.id} empty`);
  baked.set(l.id, b);
}
// byte squeeze (beat 0 + 1 under 400 KB): [pixel factor, quality, alphaQuality]
const SQ: Record<string, Squeeze> = {
  sky: [0.8, 45, 70], "moon-edge": [0.85, 38, 60], "range-far": [0.85, 38, 65], clouds: [0.8, 38, 55], "shoulder-l": [0.85, 38, 65], "shoulder-r": [0.85, 38, 65],
  "face-back": [0.8, 40, 65], "face-l": [0.8, 40, 65], "face-r": [0.8, 40, 65], "face-top": [0.8, 40, 65], creases: [0.8, 38, 60], "window-glow": [0.8, 55, 70],
  "stairs-near": [0.8, 38, 65], mist: [0.8, 45, 60], "gate-l": [0.85, 40, 70], "gate-r": [0.85, 40, 70],
};
await squeeze(SLUG, baked, SQ);
const r1 = (n: number) => Math.round(n * 10) / 10;
const compose = (width: number, height: number, include: string[], place: Record<string, { x?: number; y?: number; s?: number }> = {}) => ({
  width, height,
  layers: include.map((id) => {
    const b = baked.get(id)!, p = place[id] ?? {}, s = p.s ?? 1;
    return { id, src: `/art/${SLUG}/${id}.webp`, x: r1(b.x * s + (p.x ?? 0)), y: r1(b.y * s + (p.y ?? 0)), w: r1(b.w * s), h: r1(b.h * s), depth: b.depth };
  }).sort((a, b) => a.depth - b.depth),
});
const dIds = ["sky", "moon-edge", "range-far", "clouds", "shoulder-l", "shoulder-r", "face-back", "face-l", "face-r", "face-top", "creases", "window-glow", "stairs-near", "mist", "gate-l", "gate-r"];
const pIds = ["sky", "moon-edge", "range-far-p", "clouds-p", "shoulder-l-p", "shoulder-r-p", "face-back-p", "face-l-p", "face-r-p", "face-top-p", "creases-p", "window-glow", "stairs-near-p", "mist-p", "gate-l-p", "gate-r-p"];
const place = { sky: { x: -1188, y: 0, s: 1.8 }, "moon-edge": { x: -840 }, "window-glow": { x: 615 - 1040 * 1.1, y: 968 - 600 * 1.1, s: 1.1 } };
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: compose(W, H, dIds), portrait: compose(PW, PH, pIds, place) }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop"); await composite(SLUG, "portrait");

/* ---------- checks ---------- */
const mp = (ids: string[], sc: (id: string) => number) => ids.reduce((n, id) => { const b = baked.get(id)!; return n + (b.w * b.h * sc(id) ** 2) / 1e6; }, 0);
console.log("layers desktop", dIds.length, "portrait", pIds.length);
console.log("bytes total", total, "(KB", (total / 1024).toFixed(1) + ")", "budget 175 KB");
console.log("decoded MP desktop", mp(dIds, (id) => BAKE[id]![0]).toFixed(1), "portrait", mp(pIds, (id) => BAKE[id]![0]).toFixed(1));
console.log("gate-l rest edge x", gateD.restL.map(Math.round), "gate-r", gateD.restR.map(Math.round), "closed overlap", gateD.minOv.toFixed(1));
console.log("gate-l-p rest edge x", gateP.restL.map(Math.round), "gate-r-p", gateP.restR.map(Math.round), "closed overlap", gateP.minOv.toFixed(1));
const bad = [...calmFills].filter((f) => lum(f) > 0.1005);
console.log("calm fills over luminance 0.10:", bad.length ? bad.map((f) => `${f}:${lum(f).toFixed(3)}`).join(" ") : "none");
for (const [id, b] of baked) console.log(" ", id.padEnd(16), String(b.bytes).padStart(7), `${Math.round(b.w)}x${Math.round(b.h)}`);
if (gateD.minOv < 80 || gateP.minOv < 80) console.warn("WARNING: gate closed overlap < 80");
