// b5-understory: a forest of colossal trunks, a stone arch with a tree through it. Run: npx tsx art/b5-understory/build.ts
// Per-layer bake scale/quality (bible s13) is applied here with bakeLayer; the manifest is written in the exact bakeBeat format.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { squeeze } from "../ambient/squeeze.ts";
import {
  ROOT, arch, bakeLayer, bridge, canopy, composite, cut, difference, ellipse, fern, glow, layer, mist, mix, noise, offset,
  pine, rect, rng, roots, ruinWall, scatter, shaft, sheet, stairs, tower, union, vine,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "b5-understory";
const P: Palette = {
  "canopy-light": "#cfd98a", "leaf-far": "#9cbb6a", "leaf-far-2": "#7fa35a", "leaf-mid": "#5d8a4c", "leaf-mid-2": "#4f7a45", moss: "#3a6a3c",
  "leaf-near": "#2f5637", trunk: "#1d3a2b", "trunk-dark": "#142a1f", "stone-lit": "#8a8660", stone: "#5b5a42", "stone-dark": "#3d3d2e",
  gate: "#0b1a13", dapple: "#f3e6a6", "rim-green": "#e2eaa0", firefly: "#eaf59a", "door-light": "#ffcf8a", lamp: "#ffb866",
  "void-hint": "#070b14", "lantern-hint": "#ffd9a0", shadow: "#06120c",
};
const W = 1920, H = 1080, PW = 1080, PH = 1920;
const SRC: Pt = [700, 0], PSRC: Pt = [540, 100];
const R = (n: number) => rng(55000 + n);
const cn = (a: string, b: string, t: number) => mix(P[a]!, P[b]!, t);

/* ---------- band recipes (bible s3) ---------- */
type Band = { off: number; blur: number; op: number; rw: number; rm: number; inner?: [number, number] };
const B = {
  far: { off: 4, blur: 6, op: 0.25, rw: 1.5, rm: 0.35 },
  mid: { off: 8, blur: 10, op: 0.35, rw: 2, rm: 0.45, inner: [4, 0.25] },
  hero: { off: 12, blur: 14, op: 0.4, rw: 2.5, rm: 0.5, inner: [6, 0.3] },
  near: { off: 16, blur: 18, op: 0.45, rw: 3, rm: 0.45, inner: [8, 0.35] },
  gate: { off: 22, blur: 26, op: 0.55, rw: 3, rm: 0.5, inner: [10, 0.4] },
} satisfies Record<string, Band>;

/* ---------- geometry helpers ---------- */
const flat = (s: Poly | Shape): Shape => (typeof s[0]?.[0] === "number" ? [s as Poly] : (s as Shape));
const bnd = (s: Poly | Shape) => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const ring of flat(s)) for (const [x, y] of ring) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1 };
};
const BIG = rect(-5000, -5000, 12000, 12000);
const inter = (a: Poly | Shape, b: Poly | Shape): Shape => difference(a, difference(BIG, b));
const rotRect = (cx: number, cy: number, w: number, h: number, a: number): Poly => {
  const c = Math.cos(a), s = Math.sin(a);
  return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as Pt[]).map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c] as Pt);
};
const quad = (a: Pt, b: Pt, th: number): Poly => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = (-dy / l) * th / 2, ny = (dx / l) * th / 2;
  return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]];
};
const rotS = (s: Shape, c: Pt, a: number): Shape => {
  const co = Math.cos(a), si = Math.sin(a);
  return s.map((ring) => ring.map(([x, y]) => [c[0] + (x - c[0]) * co - (y - c[1]) * si, c[1] + (x - c[0]) * si + (y - c[1]) * co] as Pt));
};
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** pointed leaf (lens) centred (cx, cy), length l, width w, rotated a. */
const leaf = (cx: number, cy: number, l: number, w: number, a: number): Poly => {
  const c = Math.cos(a), s = Math.sin(a);
  return ([[-l / 2, 0], [-l * 0.25, -w / 2], [l * 0.15, -w * 0.45], [l / 2, 0], [l * 0.15, w * 0.45], [-l * 0.25, w / 2]] as Pt[]).map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c] as Pt);
};
type Box = { x0: number; y0: number; x1: number; y1: number };
const leaves = (r: Rng, box: Box, n: number, l0: number, l1: number, minD = 0): Shape =>
  scatter(r, box, n, (x, y) => { const l = r.range(l0, l1); return leaf(x, y, l, l * 0.42, r.range(0, Math.PI)); }, minD);
const nodeFn = (seed: number, base: number, amp: number, sc: number) => { const n = noise(seed); return (t: number) => base + (n(t / sc, 0) * 0.75 + n(t / (sc * 0.35), 5) * 0.25) * amp; };
const interp = (pts: Pt[]) => (x: number) => {
  if (x <= pts[0]![0]) return pts[0]![1];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1]!, b = pts[i]!; if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); }
  return pts[pts.length - 1]![1];
};

/* ---------- paper recipe (radial light from `src`) ---------- */
type PaperOpts = { holes?: (Poly | Shape)[]; rm?: number; light?: Pt; opacity?: number; noRim?: boolean; shadow?: false | { dx: number; dy: number; blur: number; opacity: number }; noInner?: boolean };
function paper(shape: Poly | Shape, fill: string, b: Band, src: Pt, o: PaperOpts = {}): Frag {
  const bb = bnd(shape);
  let lx = o.light ? o.light[0] : src[0] - (bb.x0 + bb.x1) / 2, ly = o.light ? o.light[1] : src[1] - (bb.y0 + bb.y1) / 2;
  const d = Math.hypot(lx, ly) || 1; lx /= d; ly /= d;
  return sheet(shape, fill, {
    holes: o.holes, opacity: o.opacity,
    shadow: o.shadow === false ? false : { color: P.shadow, blur: b.blur, opacity: b.op, dx: -lx * b.off, dy: -ly * b.off, ...o.shadow },
    edge: o.noRim ? undefined : { light: [lx, ly], width: b.rw, color: mix(fill, P["rim-green"]!, o.rm ?? b.rm) },
    inner: b.inner && !o.noInner ? { blur: b.inner[0], opacity: b.inner[1], color: P.shadow } : undefined,
  });
}
/** Stacked sheets: same silhouette, each `inset` smaller, fills[0] outermost. */
function pile(shape: Poly | Shape, fills: string[], inset: number, b: Band, src: Pt, o: PaperOpts = {}): Frag[] {
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
/** Stepped ring: outer shape shrinks and the opening grows per tier (lit tier narrowest). */
function ringPile(outer: Poly | Shape, open: Poly | Shape, fills: string[], inset: number, b: Band, src: Pt, o: PaperOpts = {}): Frag[] {
  return fills.map((f, i) => paper(offset(outer, -inset * i), f, i ? { ...b, off: b.off * 0.4, blur: b.blur * 0.5, op: b.op * 0.8 } : b, src, { ...o, holes: [i ? offset(open, inset * i) : open, ...(o.holes ?? [])] }));
}
/** Pile for a sheet that is lit above `splitY` and calm below (portrait: calm zone starts at y 1056). */
function splitPile(r: Rng, shape: Poly | Shape, lit: string[], calm: string[], splitY: number | null, inset: number, b: Band, src: Pt, o: PaperOpts = {}): Frag[] {
  if (splitY === null) return pile(shape, lit, inset, b, src, o);
  const top = inter(shape, cut(rect(-3000, -3000, 8000, 3000 + splitY), r, 5, 26));
  return [...pile(shape, calm, inset, b, src, { ...o, rm: 0.25 }), ...pile(top, lit, inset, b, src, o)];
}

/* ---------- forms ---------- */
/** Straight colossal trunk column with a root flare at the base (y1). */
function trunkPoly(r: Rng, cx: number, y0: number, y1: number, w: number, flare = 1): Poly {
  const n = Math.max(8, Math.round((y1 - y0) / 55)), L: Pt[] = [], Rr: Pt[] = [], sw = r.range(-0.03, 0.03);
  for (let i = 0; i <= n; i++) {
    const t = i / n, y = y0 + (y1 - y0) * t, half = (w / 2) * (0.88 + 0.12 * t), fl = w * 0.7 * flare * Math.max(0, (t - 0.9) / 0.1) ** 2, c = cx + sw * (y - y1);
    L.push([c - half - fl + r.range(-w * 0.025, w * 0.025), y]); Rr.push([c + half + fl + r.range(-w * 0.025, w * 0.025), y]);
  }
  return [...L, ...Rr.reverse()];
}
/** Thick tapering root arm from (x, y) heading angle a. */
function thickRoot(r: Rng, x: number, y: number, a: number, len: number, w: number): Poly {
  const n = 8, L: Pt[] = [], Rr: Pt[] = [];
  let px = x, py = y, ang = a;
  for (let i = 0; i <= n; i++) {
    const hw = (w * (1 - i / n) + 3) / 2, nx = -Math.sin(ang), ny = Math.cos(ang);
    L.push([px + nx * hw, py + ny * hw]); Rr.push([px - nx * hw, py - ny * hw]);
    px += (Math.cos(ang) * len) / n; py += (Math.sin(ang) * len) / n; ang += r.range(-0.25, 0.25) + 0.07;
  }
  return [...L, ...Rr.reverse()];
}
const slits = (r: Rng, cx: number, y0: number, y1: number, w: number, n: number): Poly[] =>
  Array.from({ length: n }, () => { const l = r.range(50, 150); return rect(cx + r.range(-w * 0.38, w * 0.38), r.range(y0, y1 - l), r.range(3.5, 5), l); });
/** Leafy lobes along a polyline, pointing along `ang`. */
const lobes = (r: Rng, pts: Pt[], ang: number, l0: number, l1: number): Poly[] => pts.map(([x, y]) => { const l = r.range(l0, l1); return leaf(x, y, l, l * 0.45, ang + r.range(-0.6, 0.6)); });

/* ---------- bg ---------- */
function bgLayer(id: string, w: number, h: number, gap: Pt, rad: number[], seed: number): Layer {
  const r = R(seed), fills = [P["leaf-far"]!, P["canopy-light"]!, P.dapple!];
  return layer(id, 0, sheet(rect(0, 0, w, h), P["leaf-mid"]!, { shadow: false }),
    ...rad.map((rd, i) => sheet(cut(ellipse(gap[0], gap[1], rd * 1.3, rd, 96), r, 3, 40), fills[i]!, { shadow: false })));
}

/* ---------- far trunks, walkways, rope bridges, spiral stairs, calm backing wall ---------- */
const walkway = (r: Rng, xa: number, xb: number, y: number): Shape => {
  const gaps: Poly[] = []; for (let x = xa + 6; x < xb - 6; x += 9 * r.range(0.9, 1.1)) gaps.push(rect(x, y, 3, 6));
  const posts: Poly[] = []; for (let x = xa; x < xb - 3; x += 26 * r.range(0.85, 1.15)) posts.push(rect(x, y - 16, 3, 17));
  return union(difference(rect(xa, y, xb - xa, 6), ...gaps), ...posts, rect(xa, y - 16, xb - xa, 3), quad([xa + 14, y + 6], [xa + 40, y + 30], 3), quad([xb - 14, y + 6], [xb - 40, y + 30], 3));
};
const rope = (xa: number, xb: number, y: number, sag: number): Shape => {
  const N = 24, p = (t: number): Pt => [xa + (xb - xa) * t, y + sag * 4 * t * (1 - t)], parts: Poly[] = [];
  for (let i = 0; i < N; i++) {
    const a = p(i / N), b = p((i + 1) / N);
    parts.push(quad(a, lerp(a, b, 0.7), 4), quad([a[0], a[1] - 18], [b[0], b[1] - 18], 3));
    if (i % 3 === 0) parts.push(rect(a[0] - 1.5, a[1] - 18, 3, 18));
  }
  return union(...parts);
};
const spiral = (cx: number, y0: number, y1: number, w: number): Shape => union(...Array.from({ length: Math.floor((y1 - y0) / 6) }, (_, k) => rect(cx + Math.sin(k * 0.7) * w * 0.6 - 9, y0 + k * 6, 18, 3)));

type FarCfg = {
  seed: number; lit: number[]; calm: number[]; y1: number; src: Pt; wall: Poly; wallOut: number; wallPts: Pt[];
  walks: [number, number, number][]; ropes: [number, number, number, number][]; spirals: [number, number, number][];
  ground: Pt[]; gd: number; groundX: [number, number]; calmWalks: [number, number, number][];
};
function trunksFar(id: string, c: FarCfg): Layer {
  const r = R(c.seed), out: Frag[] = [];
  const wallS = union(c.wall, ...lobes(r, c.wallPts, c.wallOut, 56, 96));
  out.push(...pile(wallS, [P["trunk-dark"]!, P.trunk!, cn("trunk", "leaf-near", 0.35)], 16, B.far, c.src, { rm: 0.25 }));
  // calm side: tone-on-tone trunks, walkways, leaf cut-outs
  const calmT = c.calm.map((x) => trunkPoly(r, x, -100, c.y1 + 60, r.range(22, 40), 0.5));
  out.push(paper(union(...calmT), cn("trunk", "leaf-near", 0.5), B.far, c.src, { rm: 0.25 }));
  out.push(paper(union(...c.calmWalks.map(([a, b, y]) => walkway(r, a, b, y))), P["trunk-dark"]!, B.far, c.src, { rm: 0.25 }));
  const cb = bnd(c.wall);
  out.push(sheet(leaves(r, { x0: cb.x0 + 20, y0: Math.max(cb.y0, 120), x1: cb.x1 - 40, y1: Math.min(cb.y1, 1040) }, 70, 36, 80, 40), P["trunk-dark"]!, { shadow: false }));
  // far ground
  const gr = interp(c.ground);
  const gp: Poly = []; for (let x = c.groundX[0]; x <= c.groundX[1]; x += 50) gp.push([x, gr(x) + r.range(-8, 8)]);
  out.push(paper(cut([...gp, [c.groundX[1], c.y1 + c.gd], [c.groundX[0], c.y1 + c.gd]], r, 2, 40), cn("leaf-far-2", "leaf-mid", 0.55), B.far, c.src));
  // lit trunks
  const litA: Shape[] = [], litB: Shape[] = [];
  c.lit.forEach((x, i) => (i % 3 === 1 ? litB : litA).push([trunkPoly(r, x, -100, c.y1 + 20, r.range(14, 30), 0.6)]));
  out.push(paper(union(...litA), P["leaf-far-2"]!, B.far, c.src));
  out.push(paper(union(...litB), cn("leaf-far-2", "leaf-mid", 0.45), B.far, c.src));
  // walkways + rope bridges + spiral stairs (scale cues)
  out.push(paper(union(...c.walks.map(([a, b, y]) => walkway(r, a, b, y)), ...c.ropes.map(([a, b, y, s]) => rope(a, b, y, s))), P["leaf-far"]!, B.far, c.src));
  out.push(paper(union(...c.spirals.map(([x, a, b]) => spiral(x, a, b, 24))), P["leaf-far"]!, B.far, c.src, { rm: 0.2 }));
  const fl: Shape[] = []; for (let i = 0; i < 22; i++) { const x = r.range(c.groundX[0] + 20, c.groundX[1] - 20); fl.push(i % 3 ? fern(r, x, gr(x) + 6, r.range(20, 44), r.range(-0.5, 0.5)) : pine(r, x, gr(x) + 4, r.range(30, 56))); }
  out.push(sheet(union(...fl), P["leaf-far-2"]!, { shadow: false }));
  return layer(id, 1, ...out);
}

/* ---------- far canopy masses ---------- */
function canopyFar(id: string, r: Rng, litX: [number, number], depth: number, gap: Pt, gapR: [number, number], calmX: [number, number] | null, src: Pt): Layer {
  const out: Frag[] = [];
  if (calmX) out.push(...pile(union(canopy(r, calmX[0], calmX[1], -120, depth), canopy(r, calmX[0] + 200, calmX[1], -120, depth * 0.7)), [P["trunk-dark"]!, P.trunk!], 6, B.far, src, { rm: 0.25 }));
  const base = union(canopy(r, litX[0], litX[1], -120, depth), canopy(r, litX[0] + 60, litX[1] - 120, -120, depth * 0.78));
  const gapShape = cut(ellipse(gap[0], gap[1], gapR[0], gapR[1], 40), r, 4, 30);
  const body = difference(base, gapShape);
  const holes = leaves(r, { x0: litX[0] + 10, y0: 10, x1: litX[1] - 10, y1: depth - 80 }, 40, 30, 70, 36);
  out.push(...pile(body, [P["leaf-far-2"]!, P["leaf-far"]!], 6, B.far, src, { holes: [holes] }));
  const dang: Shape[] = []; for (let i = 0; i < 18; i++) dang.push(vine(r, r.range(litX[0], litX[1]), depth * r.range(0.4, 0.75), r.range(50, 130), 9));
  out.push(sheet(union(...dang), P["leaf-far-2"]!, { shadow: false }));
  return layer(id, 2, ...out);
}

/* ---------- far ruins ---------- */
function ruinsFar(id: string, seed: number, tx: number, base: number, aq: [number, number, number], src: Pt, spots: [number, number][]): Layer {
  const r = R(seed), out: Frag[] = [];
  const T = tower(r, tx, base, 70, 320, { windows: 0 });
  const wins: Poly[] = [];
  for (let k = 0; k < 14; k++) wins.push(arch(r, tx + (k % 2 ? -1 : 1) * r.range(5, 13), base - 30 - k * 17.5, 6, 11, 0.2));
  out.push(...pile(T.body, [P.stone!, P["stone-lit"]!], 5, B.far, src, { holes: wins }));
  // swallowed by vines + foliage clumps
  const v: Shape[] = [];
  for (let i = 0; i < 12; i++) v.push(vine(r, tx + r.range(-36, 36), base - 320 + i * 22 + r.range(0, 30), r.range(80, 220), 10));
  for (let i = 0; i < 9; i++) v.push([cut(ellipse(tx + r.range(-38, 38), base - 20 - i * 34, r.range(20, 36), r.range(12, 22), 12), r, 1.5, 20)]);
  out.push(paper(union(...v), P["leaf-far-2"]!, B.far, src));
  // aqueduct
  const [ax0, ax1, ay] = aq;
  const aqS = bridge(r, ax0, ax1, ay, 14, Math.round((ax1 - ax0) / 62)), piers = [0.15, 0.5, 0.85].map((t) => rect(ax0 + (ax1 - ax0) * t - 8, ay + 40, 16, base - ay - 40));
  out.push(...pile(union(aqS, ...piers), [P.stone!, P["stone-lit"]!], 4, B.far, src));
  const wl = spots.map(([x, w]) => ruinWall(r, x, base + 4, w, r.range(34, 60)));
  out.push(paper(union(...wl.map((q) => q.body)), P["stone-lit"]!, B.far, src, { holes: wl.flatMap((q) => q.holes) }));
  const small: Shape[] = []; for (let i = 0; i < 16; i++) { const x = r.range(ax0, ax1 + 400); small.push(i % 2 ? pine(r, x, base + 4, r.range(28, 56)) : fern(r, x, base + 4, r.range(22, 40), r.range(-0.5, 0.5))); }
  out.push(sheet(union(...small), P["leaf-far-2"]!, { shadow: false }));
  return layer(id, 4, ...out);
}

/* ---------- mid trunks ---------- */
type MT = { x: number; w: number; lit: boolean };
function trunksMid(id: string, seed: number, list: MT[], y0: number, y1: number, src: Pt, splitY: number | null, vineMax: number, footFill: string): Layer {
  const r = R(seed), out: Frag[] = [];
  const litF = [cn("leaf-mid-2", "trunk", 0.4), P["leaf-mid-2"]!, cn("leaf-mid-2", "leaf-mid", 0.6)], calmF = [P["trunk-dark"]!, P.trunk!, cn("trunk", "leaf-near", 0.55)];
  for (const t of list) {
    const bs: Poly[] = [trunkPoly(r, t.x, y0, y1, t.w, 1)];
    for (const s of [-1, 1]) bs.push(cut([[t.x + s * t.w * 0.3, y1 - t.w * 1.5], [t.x + s * t.w * 0.85, y1 - t.w * 0.3], [t.x + s * t.w * 1.5, y1 + 10], [t.x + s * t.w * 0.2, y1 + 10]], r, 2, 30));
    for (let k = 0; k < 4; k++) { const s = k % 2 ? 1 : -1; bs.push(thickRoot(r, t.x + s * t.w * r.range(0.3, 0.7), y1 - 14, (s === 1 ? 0.15 : Math.PI - 0.15) + r.range(-0.15, 0.2) * s, t.w * r.range(1.2, 2), r.range(24, 38))); }
    const shape = union(...bs);
    out.push(...splitPile(r, shape, t.lit ? litF : calmF, calmF, t.lit ? splitY : null, 10, B.mid, src, { rm: t.lit ? undefined : 0.25 }));
    const col = t.lit ? litF[0]! : calmF[0]!;
    out.push(sheet(union(...slits(r, t.x, y0 + 120, y1 - 60, t.w, 16)), mix(col, P.shadow!, 0.45), { shadow: false }));
    const vs: Shape[] = [], fs: Shape[] = [];
    for (let k = 0; k < 7; k++) { const x = t.x + r.range(-t.w * 0.55, t.w * 0.55), y = r.range(120, vineMax - 120); vs.push(vine(r, x, y, Math.min(r.range(100, 260), vineMax - y), 12)); }
    for (let k = 0; k < 9; k++) fs.push(fern(r, t.x + r.range(-t.w * 1.1, t.w * 1.1), y1 + r.range(2, 12), r.range(44, 96), r.range(-0.6, 0.6)));
    out.push(paper(union(...vs), t.lit ? P["leaf-mid"]! : P["leaf-near"]!, B.far, src, { rm: t.lit ? 0.35 : 0.25 }));
    out.push(paper(union(...fs), t.lit ? footFill : P["leaf-near"]!, B.mid, src, { rm: t.lit ? 0.45 : 0.25 }));
  }
  return layer(id, 5, ...out);
}

/* ---------- stone arch, wing wall, door niche, stairs, tree through the top ---------- */
type ArchCfg = {
  cx: number; base: number; ow: number; oh: number; op: Pt; opW: number; opH: number; src: Pt;
  wingX: [number, number]; wingTop: number; niche: [number, number, number, number]; // cx, base, w, h
  stairs: [number, number, number, number, number]; plat: [number, number, number, number]; tree: [number, number, number]; // x,y,w,h,steps ; x0 y0 x1 y1 ; baseX, baseY, top
  seed: number; hintBox: Box; calmPlat?: boolean;
};
function stoneArch(id: string, c: ArchCfg): Layer {
  const r = R(c.seed), out: Frag[] = [];
  const outer = arch(r, c.cx, c.base, c.ow, c.oh, 2), opening = arch(r, c.op[0], c.op[1] + c.opH / 2, c.opW, c.opH, 1.2);
  // opening interior first: void-hint + five lantern dots
  out.push(sheet(offset(opening, 8), P["void-hint"]!, { shadow: false }));
  const dots: Poly[] = []; const hb = c.hintBox;
  [[0.5, 0.3], [0.28, 0.5], [0.72, 0.58], [0.4, 0.78], [0.62, 0.22]].forEach(([u, v]) => dots.push(ellipse(hb.x0 + (hb.x1 - hb.x0) * u!, hb.y0 + (hb.y1 - hb.y0) * v!, r.range(2, 2.6), r.range(2, 2.6), 8)));
  out.push(sheet(union(...dots), P["lantern-hint"]!, { shadow: false }));
  // niche backing for the door (lighter ring behind it comes from the fork-door layer)
  const [ncx, nby, nw, nh] = c.niche;
  const niche = arch(r, ncx, nby, nw, nh, 0.8);
  out.push(sheet(offset(niche, 4), P["stone-dark"]!, { shadow: false }));
  // platform slab the arch stands on
  const [px0, py0, px1, py1] = c.plat;
  out.push(...pile(cut(rect(px0, py0, px1 - px0, py1 - py0), r, 2, 34), c.calmPlat ? [P["stone-dark"]!, cn("stone-dark", "gate", 0.4)] : [P["stone-dark"]!, P.stone!], 8, B.mid, c.src, { rm: c.calmPlat ? 0.25 : 0.35 }));
  // stairs wrapped by roots up to the door
  const [sx, sy, sw, sh, sn] = c.stairs;
  out.push(...pile(stairs(sx, sy, sw, sh, sn, 1), [P["stone-dark"]!, P.stone!], 3, B.mid, c.src));
  // wing wall with the carved niche
  const wl = c.wingX[0], wr = c.wingX[1], wt = c.wingTop, wb = c.base;
  const wing = cut([[wl, wb], [wl, wt + 70], [wl + 26, wt + 52], [wl + 50, wt + 14], [wl + 86, wt + 8], [wl + 122, wt - 8], [wl + 170, wt + 4], [wl + 204, wt - 6], [wr, wt + 30], [wr, wb]], r, 1.8, 30);
  out.push(...ringPile(wing, niche, [P["stone-dark"]!, P.stone!, P["stone-lit"]!], 10, B.hero, c.src, { rm: 0.5 }));
  // arch frame: 3 stepped tiers around the opening
  out.push(...ringPile(outer, opening, [P["stone-dark"]!, P.stone!, P["stone-lit"]!], 11, B.hero, c.src, { rm: 0.5 }));
  // masonry coursing, voussoir slits
  const ab = bnd(outer), cy = c.base - c.oh + Math.min(c.oh, (c.ow / 2) * 1.2), crs: Poly[] = [], vou: Poly[] = [];
  const ocy = c.op[1] + c.opH / 2 - (c.opH - Math.min(c.opH, (c.opW / 2) * 1.2));
  for (let i = 0; i < 70; i++) {
    const side = i % 2 ? 1 : -1, x = c.cx + side * r.range(c.opW / 2 + 14, c.ow / 2 - 12), y = r.range(cy + 10, c.base - 10), l = r.range(14, 40);
    crs.push(rect(x - l / 2, y, l, 3));
  }
  for (let k = 0; k < 18; k++) { const t = Math.PI + ((k + 0.5) / 18) * Math.PI, rr = (c.opW / 2 + c.ow / 2) / 2; vou.push(rotRect(c.cx + Math.cos(t) * rr, ocy + Math.sin(t) * (Math.min(c.opH, c.opW * 0.6) + 40) * 0.95, 4, 18, t + Math.PI / 2)); }
  out.push(sheet(inter(union(...crs, ...vou), offset(outer, -12)), P["stone-dark"]!, { shadow: false }));
  const wc: Poly[] = []; for (let i = 0; i < 36; i++) { const l = r.range(16, 44); wc.push(rect(r.range(wl + 14, wr - l - 6), r.range(wt + 60, wb - 12), l, 3)); }
  out.push(sheet(inter(difference(union(...wc), niche), offset(wing, -12)), P["stone-dark"]!, { shadow: false }));
  // moss on arch top and ledges
  const moss: Poly[] = [];
  for (let i = 0; i < 14; i++) { const t = Math.PI + r.range(0.25, Math.PI - 0.25), mx = c.cx + Math.cos(t) * (c.ow / 2 - 8), my = ab.y0 + (c.oh - Math.min(c.oh, (c.ow / 2) * 1.2)) + Math.min(c.oh, (c.ow / 2) * 1.2) + Math.sin(t) * Math.min(c.oh, (c.ow / 2) * 1.2) + 3; moss.push(cut(ellipse(mx, my, r.range(14, 30), r.range(5, 9), 10), r, 1, 14)); }
  for (let i = 0; i < 8; i++) moss.push(cut(ellipse(r.range(wl + 20, wr - 20), wt + r.range(10, 50), r.range(12, 26), r.range(4, 8), 10), r, 1, 14));
  out.push(sheet(union(...moss), P.moss!, { shadow: false }));
  // tree growing through the top of the arch
  const [tbx, tby, tt] = c.tree, tw = 46;
  const tr = trunkPoly(r, tbx, tt, tby + 12, tw, 0.3);
  const br: Poly[] = [], tips: Pt[] = [[tbx, tt]];
  [[-1, 0.35], [1, 0.5], [-1, 0.7], [1, 0.85]].forEach(([s, u]) => { const y = tt + (tby - tt) * u!, tip: Pt = [tbx + s! * r.range(90, 160), y - r.range(60, 110)]; br.push(quad([tbx, y], tip, r.range(9, 14))); tips.push(tip); });
  out.push(...pile(union(tr, ...br), [P["trunk-dark"]!, P.trunk!, cn("trunk", "leaf-near", 0.5)], 6, B.mid, c.src, { rm: 0.3 }));
  const cl: Poly[] = []; for (const [x, y] of tips) for (let k = 0; k < 6; k++) cl.push(cut(ellipse(x + r.range(-60, 60), y + r.range(-40, 30), r.range(36, 70), r.range(24, 44), 14), r, 2, 24));
  out.push(...pile(union(...cl), [P["leaf-mid-2"]!, P["leaf-mid"]!], 8, B.mid, c.src, { holes: [leaves(r, { x0: tbx - 220, y0: tt - 90, x1: tbx + 220, y1: tt + 80 }, 22, 22, 46, 26)] }));
  // roots draping the arch face and wrapping the stairs
  const rts: Shape[] = [roots(r, tbx, tby + 6, 170, 230, 9, 1), roots(r, sx + sw * 0.5, sy + 20, sw * 0.9, sh * 1.1, 7, 1)];
  const arms: Poly[] = [thickRoot(r, tbx - 30, tby + 6, 1.9, 190, 22), thickRoot(r, tbx + 30, tby + 6, 1.2, 190, 22), thickRoot(r, sx + sw * 0.7, sy - 10, 2.0, sh + 30, 20), thickRoot(r, sx + sw * 0.3, sy + 10, 1.0, sh, 18)];
  out.push(paper(union(...rts, ...arms), P.trunk!, B.mid, c.src, { rm: 0.3 }));
  const fr: Shape[] = []; for (let i = 0; i < 12; i++) fr.push(fern(r, r.range(sx, c.plat[2]), py0 + 4, r.range(26, 60), r.range(-0.6, 0.6)));
  out.push(sheet(union(...fr), P["leaf-mid-2"]!, { shadow: false }));
  return layer(id, 6, ...out);
}

/* ---------- fork door + glow ---------- */
function forkDoor(): Layer {
  const r = R(70), cx = 494, by = 750, w = 96, h = 160, x0 = cx - w / 2, fw = w * 0.5;
  const op = arch(r, cx, by, w, h, 0.6);
  const shear = (p: Poly): Poly => p.map(([x, y]) => [x, by - (by - y) * (1 - 0.13 * ((x - x0) / fw))] as Pt);
  const flap = shear(arch(r, x0 + fw / 2, by, fw, h * 0.98, 0.5)), rev = shear(arch(r, x0 + fw + 4, by - 2, 9, h * 0.9, 0.3));
  return layer("fork-door", 7,
    sheet(op, P["door-light"]!, { shadow: false }),
    sheet(offset(op, -14), cn("door-light", "lamp", 0.55), { shadow: false }),
    paper(rev, P["stone-dark"]!, B.mid, SRC, { noInner: true }),
    paper(flap, P["leaf-near"]!, B.mid, SRC, { rm: 0.5 }));
}
const forkGlow = () => layer("fork-glow", 8, glow(494, 670, 150, P.lamp!, { opacity: 0.5, core: P["door-light"]! }));

/* ---------- curtains (hero) ---------- */
type CurCfg = { seed: number; side: 1 | -1; edge: (y: number) => number; xb: number; y0: number; y1: number; nHoles: number; lobe: number; nVines: number; lit: string[]; calm: string[]; splitY: number | null; hole: Box; hl: [number, number]; rm?: number; src: Pt; id: string; over: [string, string, string] };
function curtain(c: CurCfg): Layer {
  const r = R(c.seed), pts: Poly = [];
  for (let y = c.y0; y <= c.y1; y += 24) pts.push([c.edge(y) + r.range(-4, 4), y]);
  const lb: Poly[] = [];
  for (let y = c.y0 + 10; y < c.y1; y += c.lobe * 0.8) { const l = c.lobe * r.range(1.3, 2.0); lb.push(leaf(c.edge(y), y, l, l * 0.5, (c.side === 1 ? 0 : Math.PI) + r.range(-0.6, 0.6))); }
  const vs: Shape[] = []; for (let i = 0; i < c.nVines; i++) { const y = r.range(c.y0 + 60, c.y1 - 260); vs.push(vine(r, c.edge(y) + c.side * -2, y, r.range(110, 260), 12)); }
  const shape = union(cut([[c.xb, c.y0], ...pts, [c.xb, c.y1]], r, 4, 40), ...lb, ...vs);
  const holes = leaves(r, c.hole, c.nHoles, c.hl[0], c.hl[1], 60);
  const frags = splitPile(r, shape, c.lit, c.calm, c.splitY, 14, B.hero, c.src, { holes: [holes], rm: c.rm });
  // tone-on-tone detail so the big mass is never a flat slab: leaf mass + leaf veins, kept clear of the rim
  const bb = bnd(shape), inner0 = difference(offset(shape, -30), holes), inner = c.splitY === null ? inner0 : inter(inner0, rect(-3000, -3000, 8000, 3000 + c.splitY - 30)), box = { x0: Math.max(bb.x0, -200), y0: c.y0, x1: Math.min(bb.x1, 2100), y1: c.y1 };
  const n = Math.round(((box.x1 - box.x0) * (box.y1 - box.y0)) / 9000);
  frags.push(sheet(inter(leaves(r, box, n, 50, 120, 36), inner), c.over[0], { shadow: false }));
  frags.push(sheet(inter(leaves(r, box, Math.round(n * 0.7), 24, 64, 24), inner), c.over[1], { shadow: false }));
  const vein: Poly[] = []; for (let i = 0; i < n; i++) vein.push(rotRect(r.range(box.x0, box.x1), r.range(box.y0, box.y1), 3.5, r.range(30, 90), r.range(0.9, 2.2)));
  frags.push(sheet(inter(union(...vein), inner), c.over[2], { shadow: false, opacity: 0.8 }));
  if (c.splitY !== null) frags.push(sheet(inter(inter(leaves(r, { ...box, y0: c.splitY, y1: c.y1 }, 40, 50, 110, 36), inner0), rect(-3000, c.splitY + 30, 8000, 3000)), P["trunk-dark"]!, { shadow: false }));
  return layer(c.id, 9, ...frags);
}

/* ---------- atmosphere ---------- */
const mistFar = () => layer("mist-far", 3, ...([[280, 640, 640, 110, 0.25], [760, 660, 680, 120, 0.25], [520, 600, 520, 90, 0.2], [900, 690, 360, 80, 0.2]] as [number, number, number, number, number][]).map(([x, y, w, h, o]) => mist(x, y, w, h, P.dapple!, o)));
const shafts = (id: string, src: Pt, angles: number[], len: number, ops: number[]) =>
  layer(id, 11, ...angles.map((a, i) => shaft(src[0] + (i - 2.5) * 22, src[1] + 20, 26, 130, len * (1 - Math.abs(a) / 120), a, P.dapple!, ops[i % ops.length]!)));
function fireflies(id: string, seed: number, box: Box, nF: number, nM: number): Layer {
  const r = R(seed), dia = (x: number, y: number) => { const s = r.range(1.6, 2.2); return [[x, y - s], [x + s * 0.7, y], [x, y + s], [x - s * 0.7, y]] as Poly; };
  const mote = (x: number, y: number) => ellipse(x, y, r.range(1, 2), r.range(1, 2), 6);
  return layer(id, 13,
    sheet(scatter(r, box, Math.round(nF / 2), dia, 24), P.firefly!, { shadow: false, opacity: 0.55 }),
    sheet(scatter(r, box, Math.round(nF / 2), dia, 24), P.firefly!, { shadow: false, opacity: 0.9 }),
    sheet(scatter(r, box, Math.round(nM / 2), mote, 10), P.dapple!, { shadow: false, opacity: 0.35 }),
    sheet(scatter(r, box, Math.round(nM / 2), mote, 10), P.dapple!, { shadow: false, opacity: 0.6 }));
}

/* ---------- near ground ---------- */
type NearCfg = { seed: number; id: string; prof: Pt[]; x0: number; x1: number; base: number; src: Pt; nBig: number; nFern: number; nStone: number; mossMax: number; nLeaf: number; leafY: [number, number] };
function rootsNear(c: NearCfg): Layer {
  const r = R(c.seed), out: Frag[] = [], pr = interp(c.prof);
  const gp: Poly = []; for (let x = c.x0; x <= c.x1 + 70; x += 70) gp.push([Math.min(x, c.x1), pr(Math.min(x, c.x1)) + r.range(-10, 10)]);
  const ground = cut([...gp, [c.x1, c.base], [c.x0, c.base]], r, 3, 40);
  out.push(...pile(ground, [P["trunk-dark"]!, P.trunk!, P["leaf-near"]!], 14, B.near, c.src, { rm: 0.25 }));
  const inner = offset(ground, -16), box: Box = { x0: c.x0 + 20, y0: c.leafY[0], x1: c.x1 - 20, y1: c.leafY[1] };
  out.push(sheet(inter(leaves(r, box, c.nLeaf, 30, 80, 24), inner), P["trunk-dark"]!, { shadow: false }));
  out.push(sheet(inter(leaves(r, box, Math.round(c.nLeaf * 0.6), 20, 50, 20), inner), cn("trunk", "leaf-near", 0.5), { shadow: false }));
  const cr: Poly[] = []; for (let i = 0; i < c.nLeaf / 2; i++) cr.push(rotRect(r.range(box.x0, box.x1), r.range(box.y0, box.y1), 3.5, r.range(24, 70), r.range(1.2, 1.9)));
  out.push(sheet(inter(union(...cr), inner), P.gate!, { shadow: false, opacity: 0.8 }));
  // big root arms and strands
  const arms: Poly[] = [], str: Shape[] = [];
  for (let i = 0; i < c.nBig; i++) { const x = r.range(c.x0 + 40, c.x1 - 40), s = r() < 0.5 ? 1 : -1; arms.push(thickRoot(r, x, pr(x) - 16, (s === 1 ? 0.2 : Math.PI - 0.2) + r.range(-0.1, 0.2) * s, r.range(190, 340), r.range(30, 48))); }
  for (let i = 0; i < c.nBig * 2; i++) { const x = r.range(c.x0 + 20, c.x1 - 20); str.push(roots(r, x, pr(x) + 4, 50, r.range(50, 110), 4, -1)); }
  out.push(paper(union(...arms, ...str), P.trunk!, B.near, c.src, { rm: 0.25 }));
  const fs: Shape[] = []; for (let i = 0; i < c.nFern; i++) { const x = r.range(c.x0 + 10, c.x1 - 10); fs.push(fern(r, x, pr(x) + 8, r.range(40, 110), r.range(-0.6, 0.6))); }
  out.push(paper(union(...fs), P["leaf-near"]!, B.near, c.src, { rm: 0.25 }));
  // mossy stones
  const st: Poly[] = [], ms: Poly[] = [];
  for (let i = 0; i < c.nStone; i++) { const x = r.range(c.x0 + 30, c.x1 - 30), y = pr(x) + r.range(10, 70), rx = r.range(22, 50), ry = r.range(12, 24); st.push(cut(ellipse(x, y, rx, ry, 10), r, 2, 18)); if (x < c.mossMax) ms.push(cut(ellipse(x, y - ry * 0.45, rx * 0.8, ry * 0.5, 10), r, 1.2, 14)); }
  out.push(paper(union(...st), P["stone-dark"]!, B.near, c.src, { rm: 0.25 }));
  if (ms.length) out.push(sheet(union(...ms), P.moss!, { shadow: false }));
  const peb = scatter(r, { x0: c.x0 + 10, y0: box.y0, x1: c.x1 - 10, y1: box.y1 }, 90, (x, y) => cut(rect(x, y, r.range(6, 16), r.range(4, 9)), r, 1, 8));
  out.push(sheet(inter(peb, inner), P["stone-dark"]!, { shadow: false, opacity: 0.8 }));
  return layer(c.id, 12, ...out);
}

/* ---------- gates ---------- */
type GateCfg = { seed: number; id: string; side: 1 | -1; edge: (t: number) => number; xb: number; t0: number; t1: number; vertical: boolean; nFrond: number; rm: number; src: Pt; fills: string[] };
/** side 1 = body lies on the low-coordinate side of the edge (left gate / top gate). vertical = edge is x(y) (desktop); else edge is y(x). */
function gate(c: GateCfg): { l: Layer; poly: Poly } {
  const r = R(c.seed), P2 = (v: number, u: number): Pt => (c.vertical ? [v, u] : [u, v]);
  const pts: Poly = []; for (let u = c.t0; u < c.t1; u += 28) pts.push(P2(c.edge(u) + r.range(-4, 4), u));
  pts.push(P2(c.edge(c.t1), c.t1));
  const poly: Poly = [P2(c.xb, c.t0), ...pts, P2(c.xb, c.t1)];
  const inward = c.side;
  const ang = c.vertical ? (inward === 1 ? Math.PI / 2 : -Math.PI / 2) : (inward === 1 ? Math.PI : 0);
  const fr: Shape[] = [];
  for (let i = 0; i < c.nFrond; i++) {
    const u = c.t0 + 40 + ((c.t1 - c.t0 - 80) * (i + r.range(0, 0.8))) / c.nFrond, v = c.edge(u) - inward * 6, [bx, by] = P2(v, u);
    if (i % 3 === 2) fr.push(vine(r, bx, by, r.range(70, 170), 10));
    else fr.push(rotS(fern(r, bx, by, r.range(70, 140), r.range(-0.5, 0.5)), [bx, by], ang + r.range(-0.7, 0.7)));
  }
  const body = union(cut(poly, r, 5, 44), ...fr);
  const bb = bnd(poly), inner = offset(poly, -34), safe = offset(poly, -52);
  // cut-out leaf and fern silhouettes: real holes through every tier, with warm canopy light behind them
  const area = (bb.x1 - bb.x0) * (bb.y1 - bb.y0);
  const ferns: Shape[] = [];
  for (let i = 0, nf = Math.round(area / 70000); i < nf; i++) {
    const fx = r.range(bb.x0 + 60, bb.x1 - 60), fy = r.range(bb.y0 + 120, bb.y1 - 40), a = r.range(0, Math.PI * 2);
    ferns.push(rotS(fern(r, fx, fy, r.range(90, 170), r.range(-0.4, 0.4)), [fx, fy], a));
  }
  const holeShape = inter(union(leaves(r, bb, Math.round(area / 17000), 46, 100, 34), ...ferns), safe);
  const frags: Frag[] = [
    // light leaking along the outer outline (shows as a lit rim around the cut edge and the fronds)
    sheet(offset(body, 9), P.dapple!, { shadow: false, opacity: 0.32 }),
    sheet(offset(body, 4), P["rim-green"]!, { shadow: false, opacity: 0.55 }),
    sheet(offset(holeShape, 5), P.dapple!, { shadow: false }),
    sheet(offset(holeShape, -4), mix(P.dapple!, "#ffffff", 0.45), { shadow: false, opacity: 0.9 }),
  ];
  frags.push(...pile(body, c.fills, 16, B.gate, c.src, { rm: c.rm, holes: [holeShape] }));
  // tone-on-tone full-body detail: trunk columns, bark slits, leaf masses (must hold when the gate slides across the screen)
  const cols: Poly[] = [], bark: Poly[] = [];
  if (c.vertical) for (let x = bb.x0 + 30; x < bb.x1; x += r.range(95, 150)) { const w = r.range(44, 80); cols.push(trunkPoly(r, x, bb.y0 - 20, bb.y1 + 20, w, 0)); for (const s of slits(r, x, bb.y0, bb.y1, w, 9)) bark.push(s); }
  else for (let y = bb.y0 + 30; y < bb.y1; y += r.range(95, 150)) { const w = r.range(44, 80); const t = trunkPoly(r, y, bb.x0 - 20, bb.x1 + 20, w, 0); cols.push(t.map(([a, b]) => [b, a] as Pt)); for (const s of slits(r, y, bb.x0, bb.x1, w, 9)) bark.push(s.map(([a, b]) => [b, a] as Pt)); }
  const keep = difference(inner, holeShape);
  frags.push(sheet(inter(union(...cols), keep), P["trunk-dark"]!, { shadow: false }));
  frags.push(sheet(inter(union(...bark), keep), P.gate!, { shadow: false }));
  const n = Math.round(area / 7500);
  frags.push(sheet(inter(leaves(r, bb, n, 40, 100, 30), keep), P["leaf-near"]!, { shadow: false }));
  frags.push(sheet(inter(leaves(r, bb, Math.round(n * 0.8), 22, 56, 20), keep), P.trunk!, { shadow: false }));
  // lit leaf layers over the dark body, each with a baked shadow and a light edge
  const lit = (cnt: number, l0: number, l1: number, fill: string, rmx: number, op = 1) =>
    sheet(inter(leaves(r, bb, cnt, l0, l1, 28), keep), fill, { opacity: op, shadow: { dx: -3, dy: 5, blur: 3, opacity: 0.45, color: P.shadow }, edge: { light: [c.src[0] < 960 ? 1 : -1, -1], width: 2, color: mix(fill, P["rim-green"]!, rmx) } });
  frags.push(lit(Math.round(n * 0.55), 44, 96, P.moss!, 0.35), lit(Math.round(n * 0.32), 36, 80, P["leaf-mid-2"]!, 0.45), lit(Math.round(n * 0.12), 28, 60, P["leaf-mid"]!, 0.55, 0.9));
  frags.push(sheet(offset(holeShape, -3), mix(P.dapple!, "#ffffff", 0.35), { shadow: false, opacity: 0.8 }));
  return { l: layer(c.id, c.side === 1 ? 14 : 15, ...frags), poly };
}
/** minimum overlap of two gate polys when shifted by (sl, sr) along the sweep axis. */
function closedOverlap(a: Poly, b: Poly, sl: number, sr: number, vertical: boolean, lo: number, hi: number): number {
  const cross = (p: Poly, c: number) => { const o: number[] = []; for (let i = 0; i < p.length; i++) { const A = p[i]!, Bp = p[(i + 1) % p.length]!, ax = vertical ? A[1] : A[0], bx = vertical ? Bp[1] : Bp[0]; if ((ax <= c && bx > c) || (bx <= c && ax > c)) { const t = (c - ax) / (bx - ax); o.push(vertical ? A[0] + (Bp[0] - A[0]) * t : A[1] + (Bp[1] - A[1]) * t); } } return o; };
  let m = 1e9; for (let u = lo; u < hi; u += 0.5) m = Math.min(m, Math.max(...cross(a, u + 0.25)) + sl - (Math.min(...cross(b, u + 0.25)) - sr));
  return m;
}

/* ---------- assemble: desktop ---------- */
const nd = (s: number, base: number, amp: number, sc: number) => nodeFn(s, base, amp, sc);
const wallEdgeD = nd(901, 1078, 34, 140);
const wallPtsD: Pt[] = []; for (let y = -100; y <= 1180; y += 44) wallPtsD.push([wallEdgeD(y), y]);
const farD = trunksFar("trunks-far", {
  seed: 1, lit: Array.from({ length: 18 }, (_, i) => 24 + i * 60 + (i % 2) * 8), calm: [1130, 1235, 1330, 1450, 1560, 1670, 1790, 1890], y1: 820, src: SRC,
  wall: [...wallPtsD, [2100, 1180], [2100, -100]], wallOut: Math.PI, wallPts: wallPtsD,
  walks: [[30, 150, 330], [200, 330, 400], [420, 540, 310], [770, 900, 445], [930, 1020, 350]], ropes: [[330, 480, 360, 22], [560, 760, 440, 26]], spirals: [[230, 460, 700], [900, 500, 760]],
  calmWalks: [[1138, 1228, 330], [1250, 1326, 420], [1345, 1442, 360], [1465, 1556, 470], [1575, 1666, 380], [1685, 1788, 300]],
  ground: [[0, 810], [300, 796], [600, 812], [900, 800], [1100, 806]], gd: 260, groundX: [-60, 1100],
});
const canD = canopyFar("canopy-far", R(2), [-140, 1120], 330, [700, 70], [250, 130], [1060, 2100], SRC);
const ruinsD = ruinsFar("ruins-far", 3, 260, 790, [-40, 520, 560], SRC, [[520, 120], [840, 90], [10, 90]]);
const midD = trunksMid("trunks-mid", 4, [{ x: 120, w: 150, lit: true }, { x: 380, w: 120, lit: true }, { x: 1040, w: 130, lit: false }, { x: 1250, w: 160, lit: false }, { x: 1500, w: 110, lit: false }], -80, 900, SRC, null, 760, P["leaf-mid"]!);
const archD = stoneArch("stone-arch", {
  cx: 820, base: 900, ow: 360, oh: 520, op: [820, 650], opW: 180, opH: 300, src: SRC, wingX: [396, 650], wingTop: 556, niche: [494, 752, 128, 200],
  stairs: [180, 750, 230, 150, 28], plat: [160, 884, 1060, 964], tree: [820, 392, 120], seed: 6, hintBox: { x0: 750, y0: 530, x1: 890, y1: 770 },
});
const edgeLD = nd(910, 372, 36, 160), edgeRD = nd(911, 1135, 22, 140);
const curLD = curtain({ id: "curtain-mid-l", over: [P["leaf-mid"]!, P["leaf-far-2"]!, P["leaf-mid-2"]!], seed: 9, side: 1, edge: edgeLD, xb: -500, y0: -60, y1: 1140, nHoles: 34, lobe: 56, nVines: 9, lit: [P["leaf-mid-2"]!, P["leaf-mid"]!, P["leaf-far-2"]!], calm: [], splitY: null, hole: { x0: -150, y0: 20, x1: 320, y1: 1060 }, hl: [60, 150], src: SRC });
const curRD = curtain({ id: "curtain-mid-r", over: [P.trunk!, P["trunk-dark"]!, P.gate!], seed: 10, side: -1, edge: edgeRD, xb: 2400, y0: -60, y1: 1140, nHoles: 30, lobe: 56, nVines: 9, lit: [P["trunk-dark"]!, P.trunk!, P["leaf-near"]!], calm: [], splitY: null, hole: { x0: 1150, y0: 20, x1: 2000, y1: 1060 }, hl: [60, 150], rm: 0.25, src: SRC });
const nearD = rootsNear({ seed: 12, id: "roots-near", prof: [[-60, 950], [300, 936], [700, 954], [1100, 940], [1500, 958], [1980, 944]], x0: -60, x1: 1980, base: 1140, src: SRC, nBig: 9, nFern: 30, nStone: 16, mossMax: 1050, nLeaf: 150, leafY: [975, 1090] });
const fireD = fireflies("fireflies", 13, { x0: 40, y0: 150, x1: 1060, y1: 900 }, 60, 120);
const gL = gate({ seed: 14, id: "gate-l", side: 1, edge: nodeFn(920, 183, 42, 160), xb: -1000, t0: -60, t1: 1140, vertical: true, nFrond: 24, rm: 0.5, src: SRC, fills: [P.gate!, P["trunk-dark"]!, P["leaf-near"]!] });
const gR = gate({ seed: 15, id: "gate-r", side: -1, edge: nodeFn(921, 1772, 30, 150), xb: 2920, t0: -60, t1: 1140, vertical: true, nFrond: 22, rm: 0.25, src: SRC, fills: [P.gate!, P["trunk-dark"]!, P["leaf-near"]!] });
const GATE_SHIFT = 880;
const ovD = closedOverlap(gL.poly, gR.poly, GATE_SHIFT, GATE_SHIFT, true, -60, 1140);

/* ---------- assemble: portrait ---------- */
const wallEdgeP = nd(902, 1034, 24, 150);
const wallPtsP: Pt[] = []; for (let x = -100; x <= 1180; x += 44) wallPtsP.push([x, wallEdgeP(x)]);
const farP = trunksFar("trunks-far-p", {
  seed: 21, lit: Array.from({ length: 14 }, (_, i) => 30 + i * 80 + (i % 2) * 10), calm: [90, 250, 420, 590, 760, 930], y1: 1000, src: PSRC,
  wall: [...wallPtsP, [1180, 2000], [-100, 2000]], wallOut: -Math.PI / 2, wallPts: wallPtsP,
  walks: [[40, 160, 500], [190, 330, 620], [640, 790, 540], [830, 970, 680]], ropes: [[340, 520, 560, 24], [560, 740, 700, 28]], spirals: [[200, 640, 920], [880, 560, 900]],
  calmWalks: [[100, 240, 1180], [270, 410, 1260], [440, 580, 1230], [610, 750, 1310], [780, 920, 1200]],
  ground: [[0, 990], [300, 976], [600, 992], [900, 980], [1080, 986]], gd: 56, groundX: [-60, 1140],
});
const canP = canopyFar("canopy-far-p", R(22), [-140, 1220], 470, [540, 120], [240, 150], null, PSRC);
const ruinsP = ruinsFar("ruins-far-p", 23, 860, 990, [-40, 380, 470], PSRC, [[430, 110], [10, 90]]);
const midP = trunksMid("trunks-mid-p", 24, [{ x: 80, w: 190, lit: true }, { x: 960, w: 210, lit: true }], -80, 1180, PSRC, 1040, 960, P["leaf-mid"]!);
const archP = stoneArch("stone-arch-p", {
  cx: 580, base: 1040, ow: 360, oh: 480, op: [580, 800], opW: 180, opH: 300, src: PSRC, wingX: [186, 420], wingTop: 640, niche: [295, 942, 122, 188],
  stairs: [-20, 940, 210, 100, 20], plat: [-40, 1020, 840, 1100], tree: [580, 572, 300], calmPlat: true, seed: 26, hintBox: { x0: 510, y0: 680, x1: 650, y1: 920 },
});
const edgeLP = nd(912, 232, 8, 120), edgeRP = nd(913, 780, 8, 120);
const curLP = curtain({ id: "curtain-mid-l-p", over: [P["leaf-mid"]!, P["leaf-far-2"]!, P["leaf-mid-2"]!], seed: 29, side: 1, edge: edgeLP, xb: -500, y0: -60, y1: 1980, nHoles: 18, lobe: 46, nVines: 12, lit: [P["leaf-mid-2"]!, P["leaf-mid"]!, P["leaf-far-2"]!], calm: [P["trunk-dark"]!, P.trunk!, cn("trunk", "leaf-near", 0.55)], splitY: 1040, hole: { x0: -100, y0: 20, x1: 200, y1: 1000 }, hl: [40, 100], src: PSRC });
const curRP = curtain({ id: "curtain-mid-r-p", over: [P["leaf-mid"]!, P["leaf-far-2"]!, P["leaf-mid-2"]!], seed: 30, side: -1, edge: edgeRP, xb: 1580, y0: -60, y1: 1980, nHoles: 18, lobe: 46, nVines: 12, lit: [P["leaf-mid-2"]!, P["leaf-mid"]!, P["leaf-far-2"]!], calm: [P["trunk-dark"]!, P.trunk!, cn("trunk", "leaf-near", 0.55)], splitY: 1040, hole: { x0: 880, y0: 20, x1: 1200, y1: 1000 }, hl: [40, 100], src: PSRC });
const nearP = rootsNear({ seed: 32, id: "roots-near-p", prof: [[-60, 1300], [300, 1284], [560, 1306], [860, 1290], [1140, 1302]], x0: -60, x1: 1140, base: 1980, src: PSRC, nBig: 8, nFern: 26, nStone: 14, mossMax: -1, nLeaf: 190, leafY: [1330, 1900] });
const fireP = fireflies("fireflies-p", 33, { x0: 40, y0: 200, x1: 1040, y1: 1000 }, 56, 110);
const gLP = gate({ seed: 34, id: "gate-l-p", side: 1, edge: nodeFn(930, 140, 28, 150), xb: -560, t0: -60, t1: 1980, vertical: true, nFrond: 34, rm: 0.25, src: PSRC, fills: [P.gate!, P["trunk-dark"]!, P["leaf-near"]!] });
const gRP = gate({ seed: 35, id: "gate-r-p", side: -1, edge: nodeFn(931, 940, 28, 150), xb: 1640, t0: -60, t1: 1980, vertical: true, nFrond: 34, rm: 0.25, src: PSRC, fills: [P.gate!, P["trunk-dark"]!, P["leaf-near"]!] });
const ovP = closedOverlap(gLP.poly, gRP.poly, 460, 460, true, -60, 1980);

const all: Layer[] = [
  bgLayer("canopy-light", W, H, [700, 120], [1250, 760, 400], 1), farD, canD, mistFar(), ruinsD, midD, archD, forkDoor(), forkGlow(), curLD, curRD,
  shafts("shafts", SRC, [-20, -12, -4, 6, 13, 20], 820, [0.22, 0.3, 0.18, 0.26, 0.2, 0.28]), nearD, fireD, gL.l, gR.l,
  bgLayer("canopy-light-p", PW, PH, [540, 120], [1250, 780, 420], 21), farP, canP, ruinsP, midP, archP, curLP, curRP,
  shafts("shafts-p", PSRC, [-22, -13, -4, 6, 14, 22], 900, [0.22, 0.3, 0.18, 0.26, 0.2, 0.28]), nearP, fireP, gLP.l, gRP.l,
];
const BAKE: Record<string, [number, number]> = {
  "canopy-light": [0.22, 32], "canopy-light-p": [0.22, 32], "trunks-far": [0.36, 30], "trunks-far-p": [0.36, 30], "canopy-far": [0.36, 30], "canopy-far-p": [0.32, 30],
  "mist-far": [0.25, 28], "ruins-far": [0.40, 32], "ruins-far-p": [0.40, 32], "trunks-mid": [0.40, 32], "trunks-mid-p": [0.36, 30],
  "stone-arch": [0.43, 34], "stone-arch-p": [0.43, 34], "fork-door": [1, 55], "fork-glow": [0.29, 32],
  "curtain-mid-l": [0.32, 30], "curtain-mid-r": [0.32, 30], "curtain-mid-l-p": [0.32, 30], "curtain-mid-r-p": [0.32, 30],
  shafts: [0.25, 28], "shafts-p": [0.25, 28], "roots-near": [0.36, 32], "roots-near-p": [0.32, 30], fireflies: [0.43, 37], "fireflies-p": [0.43, 37],
  "gate-l": [0.3, 36], "gate-r": [0.3, 36], "gate-l-p": [0.3, 36], "gate-r-p": [0.3, 36],
};
const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
for (const l of all) {
  const [scale, quality] = BAKE[l.id] ?? [0.5, 40];
  const b = await bakeLayer(SLUG, l, { scale, quality });
  if (!b) throw new Error(`layer ${l.id} empty`);
  baked.set(l.id, b);
}
await squeeze(SLUG, baked, { "gate-l": [0.85, 36, 70], "gate-r": [0.85, 36, 70] }, null);
const r1 = (n: number) => Math.round(n * 10) / 10;
const compose = (width: number, height: number, include: string[], place: Record<string, { x?: number; y?: number; s?: number }> = {}) => ({
  width, height,
  layers: include.map((id) => {
    const b = baked.get(id)!, p = place[id] ?? {}, s = p.s ?? 1;
    return { id, src: `/art/${SLUG}/${id}.webp`, x: r1(b.x * s + (p.x ?? 0)), y: r1(b.y * s + (p.y ?? 0)), w: r1(b.w * s), h: r1(b.h * s), depth: b.depth };
  }).sort((a, b) => a.depth - b.depth),
});
const dIds = all.slice(0, 16).map((l) => l.id);
const pIds = ["canopy-light-p", "trunks-far-p", "canopy-far-p", "mist-far", "ruins-far-p", "trunks-mid-p", "stone-arch-p", "fork-door", "fork-glow", "curtain-mid-l-p", "curtain-mid-r-p", "shafts-p", "roots-near-p", "fireflies-p", "gate-l-p", "gate-r-p"];
const doorP = { s: 0.94, x: 250 - 446 * 0.94, y: 790 - 590 * 0.94 };
const place = { "mist-far": { s: 0.7, x: 160, y: 300 }, "fork-door": doorP, "fork-glow": doorP };
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: compose(W, H, dIds), portrait: compose(PW, PH, pIds, place) }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop"); await composite(SLUG, "portrait");

/* ---------- checks ---------- */
console.log("layers desktop", dIds.length, "portrait", pIds.length);
console.log("bytes total", total, "(KB", Math.round(total / 1024) + ", budget 450)");
console.log("gate closed overlap desktop (shift +/-" + GATE_SHIFT + ")", ovD.toFixed(1), "portrait (shift +/-460)", ovP.toFixed(1));
for (const [id, b] of baked) console.log(" ", id.padEnd(18), String(b.bytes).padStart(7), `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}x${Math.round(b.h)}`);
if (ovD < 80 || ovP < 80) throw new Error("gate closed overlap < 80");
