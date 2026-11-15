// b8-seam: seven nested folds of one paper sheet converging on a tiny mountain. Run: npx tsx art/b8-seam/build.ts
// Per-band bake settings (bible s13) need per-layer scale/quality, so layers are baked with bakeLayer and the
// manifest is written here in the exact bakeBeat format (same as b4-inner-sun).
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, arch, bakeLayer, cloud, composite, cut, difference, ellipse, glow, hills, layer, mist, mix, offset, pine, rect, ridge,
  rng, scatter, shaft, sheet, strata, tree, union,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "b8-seam";
const P: Palette = {
  paper: "#f3ead8", "paper-shade": "#e3d3bb", "fold-far": "#c9b8a6", "fold-far-2": "#b8a596", "fold-mid": "#a78f86", "fold-mid-2": "#8d7579",
  "fold-near": "#6f5f6b", "fold-deep": "#4e4152", "fold-ink": "#382e3c", gate: "#241a1c", "window-light": "#ffcf8a", lamp: "#ffb866",
  "lamp-core": "#fff1cf", "rim-paper": "#fff8ea", shadow: "#1c1216",
};
const W = 1920, H = 1080, PW = 1080, PH = 1920;
const R = (n: number) => rng(80800 + n);
const cn = (a: string, b: string, t: number) => mix(P[a]!, P[b]!, t);
const MID7 = cn("fold-deep", "fold-ink", 0.5);

/* ---------- helpers ---------- */
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
const topY = (poly: Poly, x: number) => {
  const t = poly.slice(0, -2).sort((a, b) => a[0] - b[0]);
  if (x <= t[0]![0]) return t[0]![1];
  for (let i = 1; i < t.length; i++) { const a = t[i - 1]!, b = t[i]!; if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0] || 1); }
  return t[t.length - 1]![1];
};
const rrect = (cx: number, cy: number, hw: number, hh: number, rad: number, n = 8): Poly => {
  const pts: Poly = [];
  const cs: [number, number, number][] = [[cx + hw - rad, cy - hh + rad, -90], [cx + hw - rad, cy + hh - rad, 0], [cx - hw + rad, cy + hh - rad, 90], [cx - hw + rad, cy - hh + rad, 180]];
  for (const [x, y, a0] of cs) for (let i = 0; i <= n; i++) { const a = ((a0 + (i * 90) / n) * Math.PI) / 180; pts.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]); }
  return pts;
};
/** Walk a closed polyline; returns position + unit tangent at arc length s. */
function walker(poly: Poly) {
  const cum = [0];
  for (let i = 0; i < poly.length; i++) { const a = poly[i]!, b = poly[(i + 1) % poly.length]!; cum.push(cum[i]! + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const total = cum[poly.length]!;
  return {
    total,
    at(s: number) {
      s = ((s % total) + total) % total;
      let i = 0; while (cum[i + 1]! < s) i++;
      const a = poly[i]!, b = poly[(i + 1) % poly.length]!, t = (s - cum[i]!) / (cum[i + 1]! - cum[i]! || 1), L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, tx: (b[0] - a[0]) / L, ty: (b[1] - a[1]) / L };
    },
  };
}

type Cfg = {
  sfx: string; W: number; H: number; cx: number; cy: number; seed: number;
  hs: [number, number][]; // hole half sizes fold-1..7
  skip: (x: number, y: number) => boolean; // ring echo not allowed here (calm zone)
};
const hsAt = (c: Cfg, k: number): [number, number] => (k <= 7 ? c.hs[k - 1]! : [c.hs[6]![0] + 50, c.hs[6]![1] + 60]);
const radOf = (hw: number) => hw * 0.2;

/** Torn rounded-rect hole for fold k: cut(hole, rng(8100 + k), 3, 40) plus 3 small bites. */
function holeOf(c: Cfg, k: number): Shape {
  const r = rng(8100 + k + c.seed), [hw, hh] = hsAt(c, k);
  const poly = cut(rrect(c.cx, c.cy, hw, hh, radOf(hw)), r, 3, 40);
  const bites: Poly[] = [];
  for (let i = 0; i < 3; i++) { const p = poly[r.int(2, poly.length - 3)]!; bites.push(ellipse(p[0], p[1], r.range(6, 10), r.range(5, 8), 8)); }
  return union(poly, ...bites);
}

/* ---------- ring echoes (tiny tone-on-tone silhouettes of earlier beats) ---------- */
function echo(k: number, r: Rng, x: number, y: number, s: number): Poly | Shape {
  const q = r();
  switch (k) {
    case 7: // b0: pine rows, far mountain, moon disc
      if (q < 0.55) return pine(r, x, y + s / 2, s);
      if (q < 0.85) return cut([[x - s * 0.8, y + s * 0.4], [x - s * 0.2, y - s * 0.5], [x + s * 0.1, y - s * 0.15], [x + s * 0.35, y - s * 0.5], [x + s * 0.8, y + s * 0.4]], r, 0.8, 12);
      return ellipse(x, y, s * 0.38, s * 0.38, 16);
    case 6: // b1: strata bands, tiny windows
      if (q < 0.5) return [rect(x - s * 0.5, y - s * 0.38, s, 3.5), rect(x - s * 0.4, y - s * 0.08, s * 0.8, 3.5), rect(x - s * 0.5, y + s * 0.22, s, 3.5)];
      return [arch(r, x - 9, y + 6, 4.5, 9, 0.3), arch(r, x, y + 6, 4.5, 9, 0.3), arch(r, x + 9, y + 6, 4.5, 9, 0.3)];
    case 5: // b2: flap folds, seam slits
      return [[[x - s * 0.5, y + s * 0.4], [x - s * 0.1, y - s * 0.45], [x + s * 0.15, y - s * 0.45], [x - s * 0.25, y + s * 0.4]] as Poly, rect(x + s * 0.2, y - s * 0.45, 3.5, s * 0.9)];
    case 4: // b3: receding arch row
      return [arch(r, x - s * 0.55, y + s * 0.45, s * 0.56, s * 0.8, 0.4), arch(r, x, y + s * 0.45, s * 0.42, s * 0.62, 0.4), arch(r, x + s * 0.45, y + s * 0.45, s * 0.3, s * 0.46, 0.4)];
    case 3: { // b4: sun-ray cuts
      const out: Poly[] = [ellipse(x, y, s * 0.13, s * 0.13, 10)];
      for (let a = 0; a < 8; a++) { const t = (a / 8) * Math.PI * 2 + r.range(-0.1, 0.1); out.push([[x + Math.cos(t) * s * 0.2 - Math.sin(t) * 1.6, y + Math.sin(t) * s * 0.2 + Math.cos(t) * 1.6], [x + Math.cos(t) * s * 0.5, y + Math.sin(t) * s * 0.5], [x + Math.cos(t) * s * 0.2 + Math.sin(t) * 1.6, y + Math.sin(t) * s * 0.2 - Math.cos(t) * 1.6]]); }
      return out;
    }
    case 2: return tree(r, x, y + s / 2, s); // b5: trunk and canopy
    default: return [disc(x - 9, y, 3.6, 10), disc(x + 1, y - 3, 4.4, 10), disc(x + 11, y + 2, 3.6, 10)]; // b6: lantern dots (holes showing paper)
  }
}
function ringHoles(c: Cfg, k: number): Shape {
  const r = R(100 + k + c.seed), [h0w, h0h] = hsAt(c, k), [h1w, h1h] = hsAt(c, k + 1);
  const path = (a: number) => rrect(c.cx, c.cy, h0w + (h1w - h0w) * a, h0h + (h1h - h0h) * a, radOf(h0w) + (radOf(h1w) - radOf(h0w)) * a, 12);
  const out: (Poly | Shape)[] = [];
  const wk = Math.min(h1w - h0w, h1h - h0h);
  // perforation rows
  for (const a of [0.12]) {
    const w = walker(path(a));
    for (let s = r.range(0, 20); s < w.total; s += r.range(23, 31)) {
      const p = w.at(s); if (c.skip(p.x, p.y) && k === 7) continue;
      out.push(Math.abs(p.tx) > Math.abs(p.ty) ? rect(p.x - 4, p.y - 1.6, 8, 3.2) : rect(p.x - 1.6, p.y - 4, 3.2, 8));
    }
  }
  const w = walker(path(0.5));
  for (let s = r.range(0, 30); s < w.total;) {
    const sz = Math.min(30, wk - 16) * r.range(0.62, 1.0), p = w.at(s + sz);
    if (!(c.skip(p.x, p.y) && k === 7)) out.push(echo(k, r, p.x, p.y, sz));
    s += sz * 1.7 + r.range(6, 16);
  }
  return union(...out);
}

/* ---------- fold sheets ---------- */
const FOLD_FILL = ["paper-shade", "fold-far", "fold-far-2", "fold-mid", "fold-mid-2", "fold-near", "fold-deep"];
const FOLD_SPEC: [number, number][] = [[2, 4], [2, 4], [2, 5], [3, 6], [3, 6], [3, 8], [3, 10]]; // tiers, inset
const BAND = { mid: { blur: 10, op: 0.35, rw: 2, rm: 0.45, inner: [4, 0.25] as [number, number] }, hero: { blur: 14, op: 0.4, rw: 2.5, rm: 0.5, inner: [6, 0.3] as [number, number] } };

function tierFills(k: number): string[] {
  const [n] = FOLD_SPEC[k - 1]!;
  if (k === 7) return [P["fold-ink"]!, MID7, P["fold-deep"]!];
  const f = P[FOLD_FILL[k - 1]!]!, dark = P[FOLD_FILL[k]!]!, light = k > 1 ? P[FOLD_FILL[k - 2]!]! : P.paper!;
  return n === 3 ? [mix(f, dark, 0.35), f, mix(f, light, 0.4)] : [mix(f, dark, 0.3), f];
}

type FoldOut = { frags: Frag[]; hole: Shape; echoU: Shape; outer: Shape };
function foldFrags(c: Cfg, k: number, hole: Shape, nextHole: Shape | null, extra?: (echoU: Shape, holeOff: Shape) => Frag[]): FoldOut {
  const [tiers, inset] = FOLD_SPEC[k - 1]!, fills = tierFills(k), band = k >= 6 ? BAND.hero : BAND.mid;
  const bleedX = c.W * 0.08, bleedY = c.H * 0.08;
  const outer: Shape = k === 7 ? union(cut(rect(-bleedX, -bleedY, c.W + 2 * bleedX, c.H + 2 * bleedY), R(300 + c.seed), 3, 60))
    : union(cut(rrect(c.cx, c.cy, hsAt(c, k + 1)[0] + 60, hsAt(c, k + 1)[1] + 60, 70), R(310 + k + c.seed), 2, 40));
  const echoU = ringHoles(c, k);
  const rimTok = P["rim-paper"]!, rm = k === 7 ? 0.25 : band.rm;
  const frags: Frag[] = [];
  for (let i = 0; i < tiers; i++) {
    const holeI = i ? offset(hole, inset * i) : hole, outerI = i ? offset(outer, -inset * i) : outer;
    const body = difference(outerI, holeI);
    frags.push(sheet(body, fills[i]!, {
      holes: [echoU],
      shadow: { dx: 0, dy: 0, blur: band.blur * (i ? 0.5 : 1), opacity: band.op * (i ? 0.8 : 1), color: P.shadow },
      inner: i === tiers - 1 ? { blur: band.inner[0], opacity: band.inner[1], color: P.shadow } : undefined,
    }));
    frags.push(sheet(difference(offset(holeI, band.rw), holeI), mix(fills[i]!, rimTok, rm), { shadow: false }));
  }
  frags.push(sheet(difference(offset(echoU, 1.6), echoU), mix(fills[tiers - 1]!, rimTok, rm), { shadow: false }));
  if (extra) frags.push(...extra(echoU, offset(hole, inset * (tiers - 1) + 12)));
  return { frags, hole, echoU, outer };
}

/* ---------- fold-7 calm backing: b0 echo (embossed mountain, pine rows, crease lines), tone-on-tone ---------- */
type Scene = {
  x0: number; x1: number; moon: [number, number, number]; clouds: [number, number, number, number][];
  ridgeF: [number, number]; ridgeA: [number, number]; ridgeB: [number, number]; hillsY: number; mtn: { cx: number; base: number; w: number; h: number };
  rowA: number; rowB: number; rowC: number; stars: { x0: number; y0: number; x1: number; y1: number; n: number }; topStrip?: number;
};
function calmScene(c: Cfg, sc: Scene, clip: (s: Shape) => Shape): Frag[] {
  const r = R(400 + c.seed), out: Frag[] = [];
  const ink = P["fold-ink"]!, deep = P["fold-deep"]!, rimC = (f: string) => mix(f, P["rim-paper"]!, 0.25);
  const sh = (o = 0.3) => ({ dx: 3, dy: 5, blur: 6, opacity: o, color: P.shadow });
  const put = (s: Poly | Shape, fill: string, shadowOp = 0.3, rim = true) => {
    out.push(sheet(clip(flat(s)), fill, { shadow: sh(shadowOp), edge: rim ? { light: [0, -1], width: 1.6, color: rimC(fill) } : undefined }));
  };
  const pines = (ridgePoly: Poly | null, y: number, hmin: number, hmax: number, gap: number, fill: string, x0 = sc.x0, x1 = sc.x1) => {
    const parts: Shape[] = [];
    for (let x = x0; x < x1; x += gap * r.range(0.8, 1.25)) parts.push(pine(r, x, (ridgePoly ? topY(ridgePoly, x) : y + r.range(-8, 8)) + 5, r.range(hmin, hmax)));
    put(union(...parts), fill, 0.3);
  };
  // clouds (strata-like paper banks)
  for (const [cx, cy, w, h] of sc.clouds) put(cloud(r, cx, cy, w, h), MID7, 0.2);
  // moon + two aperture rings
  const [mx, my, mr] = sc.moon;
  for (const rr of [mr + 30, mr + 52]) out.push(sheet(clip(difference(disc(mx, my, rr, 72), disc(mx, my, rr - 5, 72))), MID7, { shadow: false }));
  const moonS = flat(disc(mx, my, mr, 72));
  [ink, MID7].forEach((f, i) => out.push(sheet(clip(offset(moonS, -i * 10)), f, { shadow: i ? false : sh(0.3), edge: { light: [-1, -1], width: 1.4, color: rimC(f) } })));
  out.push(sheet(clip(union(...[[-18, -10, 11], [14, 8, 8], [-4, 24, 6], [20, -22, 5]].map(([dx, dy, rr]) => disc(mx + dx!, my + dy!, rr!, 14)))), ink, { shadow: false }));
  // far ridge F (faint) + far ridge A + pine row 1
  const rF = ridge(r, { x0: sc.x0, x1: sc.x1, y: sc.ridgeF[0], base: sc.ridgeF[0] + 700, amp: sc.ridgeF[1], step: 56, seed: 8800 + c.seed });
  put(rF, mix(deep, MID7, 0.5), 0.2);
  pines(rF, 0, 14, 26, 18, MID7);
  const rA = ridge(r, { x0: sc.x0, x1: sc.x1, y: sc.ridgeA[0], base: sc.ridgeA[0] + 700, amp: sc.ridgeA[1], step: 50, seed: 8801 + c.seed });
  put(rA, MID7, 0.25);
  pines(rA, 0, 22, 40, 22, MID7);
  // embossed mountain: 3 tiers + shade facet + strata + tiny windows
  const { cx: mcx, base: mb, w: mw, h: mh } = sc.mtn;
  const m: Poly = cut([[mcx - mw / 2, mb], [mcx - mw * 0.36, mb - mh * 0.28], [mcx - mw * 0.24, mb - mh * 0.4], [mcx - mw * 0.14, mb - mh * 0.72], [mcx - mw * 0.03, mb - mh * 0.86], [mcx + mw * 0.02, mb - mh], [mcx + mw * 0.1, mb - mh * 0.78], [mcx + mw * 0.2, mb - mh * 0.62], [mcx + mw * 0.3, mb - mh * 0.34], [mcx + mw / 2, mb]], r, 2.2, 36);
  const tiers = [ink, MID7, deep];
  tiers.forEach((f, i) => out.push(sheet(clip(offset(m, -i * 14)), f, { shadow: i ? { dx: 2, dy: 4, blur: 4, opacity: 0.3, color: P.shadow } : sh(0.4), edge: { light: [-1, -1], width: 2, color: rimC(f) }, inner: i === 0 ? { blur: 6, opacity: 0.3, color: P.shadow } : undefined })));
  const mIn = offset(m, -16);
  const bands = strata(r, { x0: mcx - mw / 2, x1: mcx + mw / 2, y: mb - mh * 0.55, base: mb + 40, bands: 6 });
  bands.forEach((b, i) => out.push(sheet(clip(inter(b, mIn)), i % 2 ? MID7 : ink, { shadow: false, opacity: 0.55 })));
  out.push(sheet(clip(inter([[mcx + mw * 0.02, mb - mh], [mcx + mw * 0.34, mb], [mcx + mw * 0.02, mb]], mIn)), ink, { shadow: false, opacity: 0.5 }));
  const wins: Poly[] = [];
  for (let i = 0; i < 18; i++) wins.push(arch(r, mcx + r.range(-mw * 0.28, mw * 0.28), mb - r.range(20, mh * 0.5) + 7, 4.4, 8, 0.3));
  out.push(sheet(clip(inter(union(...wins), mIn)), ink, { shadow: false }));
  // ridge B + pine row 2
  const rB = ridge(r, { x0: sc.x0, x1: sc.x1, y: sc.ridgeB[0], base: sc.ridgeB[0] + 500, amp: sc.ridgeB[1], step: 46, seed: 8802 + c.seed });
  put(rB, ink, 0.4);
  pines(rB, 0, 48, 82, 26, ink);
  // ground hills + pine row 3 (near)
  const hl = hills(r, { x0: sc.x0, x1: sc.x1, y: sc.hillsY, base: sc.hillsY + 400, amp: 46, seed: 8803 + c.seed });
  put(hl, cn("fold-ink", "fold-deep", 0.18), 0.45);
  pines(hl, 0, 70, 120, 34, ink);
  void sc.rowA; void sc.rowB; void sc.rowC;
  // stars (quiet, opacity <= 0.3)
  const st = scatter(r, sc.stars, sc.stars.n, (x, y) => { const s = r.range(2.2, 3.4); return [[x, y - s * 1.4], [x + s, y], [x, y + s * 1.4], [x - s, y]] as Poly; }, 40);
  out.push(sheet(clip(st), P["rim-paper"]!, { shadow: false, opacity: 0.22 }));
  return out;
}
/** Long fold lines across the backing sheet (also radiating from the convergence). */
function backingCreases(c: Cfg, clip: (s: Shape) => Shape, n: number, spread: [number, number]): Frag[] {
  const r = R(500 + c.seed), segs: Poly[] = [];
  for (let i = 0; i < n; i++) {
    const a = spread[0] + ((spread[1] - spread[0]) * (i + r.range(0.1, 0.9))) / n;
    const len = r.range(500, 900), t = (a * Math.PI) / 180, ox = c.cx + Math.cos(t) * 260, oy = c.cy + Math.sin(t) * 260;
    const mx = ox + Math.cos(t) * len / 2, my = oy + Math.sin(t) * len / 2;
    segs.push(rotRect(mx, my, len, r.range(2.5, 3.5), t));
  }
  const u = union(...segs);
  return [sheet(clip(offset(u, 1.6)), mix(P["fold-deep"]!, P["rim-paper"]!, 0.25), { shadow: false }), sheet(clip(u), P.shadow!, { shadow: false, opacity: 0.3 })];
}

/* ---------- mini mountain, paper bg, glow ---------- */
function paperLayer(id: string, c: Cfg, seed: number): Layer {
  const r = R(seed);
  const radii = [260, 190, 130, 80], fills = [cn("paper-shade", "paper", 0.45), P.paper!, cn("paper", "rim-paper", 0.45), cn("paper", "rim-paper", 0.8)];
  const out: Frag[] = [sheet(rect(0, 0, c.W, c.H), P["paper-shade"]!, { shadow: false })];
  radii.forEach((rad, i) => out.push(sheet(cut(disc(c.cx, c.cy, rad, 64), r, 2, 30), fills[i]!, { shadow: false })));
  const flecks = scatter(r, { x0: c.cx - 190, y0: c.cy - 220, x1: c.cx + 190, y1: c.cy + 220 }, 60, (x, y) => rotRect(x, y, r.range(3.2, 5.5), 1.4, r.range(0, Math.PI)), 12);
  out.push(sheet(flecks, P["fold-far"]!, { shadow: false, opacity: 0.55 }));
  return layer(id, 0, ...out);
}

function miniMountain(id: string, c: Cfg, apex: Pt, mw: number, mh: number, win: Pt, seed: number): Layer {
  const r = R(seed), out: Frag[] = [], base = apex[1] + mh;
  const fr = [0, 0.05, 0.12, 0.2, 0.3, 0.42, 0.56, 0.7, 0.85, 1];
  const side = (sgn: number) => fr.map((f) => [apex[0] + sgn * (mw / 2) * Math.pow(f, 0.55) * r.range(0.93, 1.05) + (sgn > 0 ? 5 : 0), apex[1] + mh * f] as Pt);
  const L = side(-1), Rr = side(1).reverse();
  const m: Poly = cut([...L, ...Rr], r, 0.8, 18);
  const winHole = arch(r, win[0], win[1] + 30, 44, 60, 0.4);
  out.push(sheet(arch(r, win[0], win[1] + 34, 52, 68, 0.4), P["window-light"]!, { shadow: false }));
  const fills = [P["fold-near"]!, P["fold-mid-2"]!, P["fold-mid"]!];
  fills.forEach((f, i) => out.push(sheet(offset(m, -i * 5), f, { holes: [winHole], shadow: { dx: 2, dy: 3, blur: 3, opacity: 0.4, color: P.shadow }, edge: { light: [-0.5, -1], width: 1.2, color: mix(f, P["rim-paper"]!, 0.45) }, inner: i === 0 ? { blur: 3, opacity: 0.3, color: P.shadow } : undefined })));
  const mIn = offset(m, -9);
  const bands = strata(r, { x0: apex[0] - mw / 2, x1: apex[0] + mw / 2, y: apex[1] + mh * 0.22, base: base + 10, bands: 6 });
  bands.forEach((b, i) => out.push(sheet(difference(inter(b, mIn), winHole), mix(P["fold-near"]!, P["fold-mid"]!, i / 6), { shadow: false, opacity: 0.6 })));
  const wins: Poly[] = [];
  for (let i = 0; i < 12; i++) { const x = apex[0] + r.range(-mw * 0.38, mw * 0.38), y = apex[1] + mh * r.range(0.52, 0.9); if (Math.hypot(x - win[0], y - win[1]) < 36) { i--; continue; } wins.push(arch(r, x, y + 2.5, 3.2, 5.4, 0.2)); }
  out.push(sheet(union(...wins), P["window-light"]!, { shadow: false }));
  // foreground ground strip with tiny pines (scale cue)
  const g = hills(r, { x0: apex[0] - 130, x1: apex[0] + 130, y: base - 3, base: base + 90, amp: 10, step: 26, seed: seed + 5 });
  out.push(sheet(g, P["fold-near"]!, { shadow: { dx: 0, dy: -2, blur: 3, opacity: 0.3, color: P.shadow }, edge: { light: [0, -1], width: 1.2, color: mix(P["fold-near"]!, P["rim-paper"]!, 0.4) } }));
  const tp: Shape[] = [];
  for (let i = 0; i < 9; i++) { const x = apex[0] + r.range(-118, 118); if (Math.abs(x - apex[0]) < 40) continue; tp.push(pine(r, x, topY(g, x) + 3, r.range(16, 28))); }
  out.push(sheet(union(...tp), P["fold-near"]!, { shadow: false }));
  return layer(id, 1, ...out);
}

/* ---------- atmosphere ---------- */
function shaftsLayer(id: string, c: Cfg, angles: number[], len: number, ops: number[]): Layer {
  return layer(id, 11, ...angles.map((a, i) => shaft(c.cx, c.cy, 26, 120, len, a, P["rim-paper"]!, ops[i]!)));
}
function dustLayer(id: string, region: { x0: number; y0: number; x1: number; y1: number }, seed: number): Layer {
  const r = R(seed);
  const tri = (x: number, y: number): Poly => { const s = r.range(2.6, 4.2), a = r.range(0, 6.28); return ([[0, -s], [s * 0.9, s * 0.6], [-s * 0.9, s * 0.6]] as Pt[]).map(([px, py]) => [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)] as Pt); };
  const a = scatter(r, region, 70, tri, 10), b = scatter(r, region, 70, tri, 10);
  return layer(id, 13, sheet(a, P.paper!, { shadow: false, opacity: 0.5 }), sheet(b, P["rim-paper"]!, { shadow: false, opacity: 0.75 }));
}

/* ---------- gates ---------- */
function cross(poly: Poly, axis: 0 | 1, cc: number): number[] {
  const o = axis === 1 ? 0 : 1, out: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!, b = poly[(i + 1) % poly.length]!, a1 = a[axis], b1 = b[axis];
    if ((a1 <= cc && b1 > cc) || (b1 <= cc && a1 > cc)) out.push(a[o] + ((b[o] - a[o]) * (cc - a1)) / (b1 - a1));
  }
  return out;
}
type GateCfg = { sfx: string; y0: number; y1: number; a: number; amp: number; D: number; shift: number; bleedL: number; bleedR: number; light: Pt; seed: number; calmR: boolean; foldYs: number[]; tabYs: number[] };
/** Shared inner-edge profile (v = x, u = y) with scissor jitter. gate-r reuses it offset by D so closed overlap is exactly 2*shift - D. */
function edgeProfile(g: GateCfg): Pt[] {
  const r = R(g.seed), pts: Pt[] = [];
  let y = g.y0, v = g.a + g.amp * r();
  pts.push([v, y]);
  while (y < g.y1) {
    const len = r.range(70, 130), nv = g.a + g.amp * r();
    y += len; pts.push([v + r.range(-3, 3), y - len * 0.45], [nv + r.range(-3, 3), y - len * 0.2], [nv, Math.min(y, g.y1)]); v = nv;
  }
  const out: Pt[] = [pts[0]!];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!, n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 26));
    for (let k = 1; k <= n; k++) { const t = k / n; out.push([a[0] + (b[0] - a[0]) * t + (k < n ? r.range(-1.6, 1.6) : 0), a[1] + (b[1] - a[1]) * t + (k < n ? r.range(-1.6, 1.6) : 0)]); }
  }
  return out.map(([x, yy]) => [Math.min(g.a + g.amp, Math.max(g.a, x)), yy] as Pt);
}
function gateLayers(g: GateCfg, ids: [string, string]): { gl: Layer; gr: Layer; minOv: number; cover: number; coverL: number; coverR: number; restL: [number, number]; restR: [number, number] } {
  const prof = edgeProfile(g);
  const polyL: Poly = [[g.bleedL, g.y0], ...prof, [g.bleedL, g.y1]];
  const profR = prof.map(([x, y]) => [x + g.D, y] as Pt);
  const polyR: Poly = [[g.bleedR, g.y0], ...profR, [g.bleedR, g.y1]];
  const edgeX = (p: Pt[], yy: number, left: boolean) => { const xs = cross([...p, left ? [g.bleedL, g.y1] : [g.bleedR, g.y1], left ? [g.bleedL, g.y0] : [g.bleedR, g.y0]], 1, yy); return left ? Math.max(...xs) : Math.min(...xs); };

  const build = (left: boolean, polyBase: Poly, p: Pt[], seed: number): Layer => {
    const r = R(seed), sgn = left ? 1 : -1;
    const fillsG = left || g.calmR ? [P.gate!, P["fold-ink"]!, cn("fold-ink", "fold-deep", 0.5)] : [P.gate!, P["fold-ink"]!, cn("fold-ink", "fold-near", 0.4)];
    const stripFills = left || g.calmR ? [P["fold-ink"]!, cn("fold-ink", "fold-deep", 0.5), P["fold-deep"]!, cn("gate", "fold-ink", 0.5)] : [P["fold-ink"]!, cn("fold-ink", "fold-near", 0.4), cn("fold-ink", "fold-near", 0.7), cn("gate", "fold-ink", 0.5)];
    const rimM = left || g.calmR ? 0.25 : 0.5;
    // protruding tabs on the inner edge (only ever extend toward the scene, so closed overlap cannot shrink)
    const tabs: Poly[] = [];
    for (let yy = g.y0 + 60; yy < g.y1 - 60; yy += r.range(85, 135)) {
      const ex = edgeX(p, yy, left), len = r.range(14, 34), h = r.range(26, 52);
      tabs.push([[ex + sgn * 2, yy - h / 2], [ex - sgn * 0 + sgn * len, yy + r.range(-h * 0.15, h * 0.15)], [ex + sgn * 2, yy + h / 2]].map(([x, y]) => [x! - sgn * 3, y!] as Pt));
    }
    const body = union(polyBase, ...tabs);
    const frags: Frag[] = [];
    const lx = left ? 1 : -1;
    const mk = (s: Poly | Shape, fill: string, i: number, opts: { inner?: boolean } = {}) => sheet(s, fill, {
      shadow: { dx: -lx * (i ? 4 : 8), dy: 0, blur: i ? 14 : 26, opacity: i ? 0.4 : 0.55, color: P.shadow },
      edge: { light: [lx, 0], width: 3, color: mix(fill, P["rim-paper"]!, rimM) },
      inner: opts.inner === false ? undefined : { blur: 10, opacity: i ? 0.3 : 0.4, color: P.shadow },
    });
    // 3 stacked tiers along the whole body, 18 px apart
    let cur: Shape = body;
    fillsG.forEach((f, i) => { frags.push(mk(cur, f, i)); cur = offset(cur, -18); });
    // full-body strata: torn paper strips sliding in from the outer side, ending at varied depths from the inner edge
    const clipS = offset(body, -34);
    const nStrips = 9, ySpan = g.y1 - g.y0;
    for (let i = 0; i < nStrips; i++) {
      const yc = g.y0 + ((i + r.range(0.2, 0.8)) * ySpan) / nStrips, hh = (ySpan / nStrips) * r.range(0.32, 0.46);
      const reach = r.range(40, 330); // distance back from the inner edge
      const x0 = left ? g.bleedL : g.bleedR, ex = edgeX(p, yc, left) - sgn * reach;
      const strip = cut(left ? [[x0, yc - hh], [ex, yc - hh], [ex, yc + hh], [x0, yc + hh]] : [[ex, yc - hh], [x0, yc - hh], [x0, yc + hh], [ex, yc + hh]], r, 3, 36);
      frags.push(sheet(inter(strip, clipS), stripFills[i % stripFills.length]!, {
        shadow: { dx: -lx * 4, dy: 6, blur: 8, opacity: 0.4, color: P.shadow },
        edge: { light: [lx, -0.4], width: 2, color: mix(stripFills[i % stripFills.length]!, P["rim-paper"]!, rimM) },
      }));
      // punched slots along each strip end (masonry joints)
      const slots: Poly[] = [];
      for (let k = 0; k < 5; k++) slots.push(rect(ex - sgn * (14 + k * 22) - 3, yc - hh * 0.45, 6, hh * 0.9));
      frags.push(sheet(inter(union(...slots), clipS), P.gate!, { shadow: false, opacity: 0.55 }));
    }
    // fold lines running vertically down the body
    const cr: Poly[] = [];
    for (let k = 0; k < 6; k++) { const ex = edgeX(p, (g.y0 + g.y1) / 2, left) - sgn * (90 + k * r.range(120, 170)); cr.push(rotRect(ex, (g.y0 + g.y1) / 2, 3, ySpan, r.range(-0.05, 0.05))); }
    frags.push(sheet(inter(union(...cr), clipS), P.shadow!, { shadow: false, opacity: 0.55 }));
    // dog-ears: corner folded back over the edge, showing the reverse
    const revFill = left || g.calmR ? P["fold-deep"]! : P["fold-near"]!;
    for (const yy of g.foldYs) {
      const ex = edgeX(p, yy, left), sz = r.range(80, 105);
      const ear: Poly = [[ex - sgn * 4, yy - sz * 0.5], [ex + sgn * sz * 0.7, yy + sz * 0.1], [ex - sgn * 4, yy + sz * 0.62]];
      frags.push(sheet(ear, revFill, { shadow: { dx: -lx * 2, dy: 5, blur: 6, opacity: 0.5, color: P.shadow }, edge: { light: [lx, -0.6], width: 2.5, color: mix(revFill, P["rim-paper"]!, rimM) } }));
      frags.push(sheet(rotRect(ex + sgn * sz * 0.2, yy + sz * 0.06, sz * 0.85, 2.6, Math.atan2(sz * 0.52, -sgn * sz * 0.7) + (left ? 0 : Math.PI)), P.shadow!, { shadow: false, opacity: 0.55 }));
    }
    return layer(left ? ids[0] : ids[1], left ? 14 : 15, ...frags);
  };
  const gl = build(true, polyL, prof, g.seed + 1), gr = build(false, polyR, profR, g.seed + 2);
  // closed-position check: scanline overlap between the two gates after the shifts
  let minOv = 1e9;
  const tabbed = (left: boolean) => (left ? polyL : polyR);
  for (let yy = g.y0 + 1; yy < g.y1; yy += 1.5) {
    const l = Math.max(...cross(tabbed(true), 1, yy)), rr = Math.min(...cross(tabbed(false), 1, yy));
    minOv = Math.min(minOv, l + g.shift - (rr - g.shift));
  }
  let sl = 0, sr = 0, n = 0, rl: [number, number] = [1e9, -1e9], rrg: [number, number] = [1e9, -1e9];
  const cw = g.sfx ? PW : W, ch = g.sfx ? PH : H;
  for (let yy = 0; yy < ch; yy += 6) {
    const l = Math.max(...cross(polyL, 1, yy + 0.3)), rr = Math.min(...cross(polyR, 1, yy + 0.3));
    sl += l; sr += cw - rr; n++; rl = [Math.min(rl[0], l), Math.max(rl[1], l)]; rrg = [Math.min(rrg[0], rr), Math.max(rrg[1], rr)];
  }
  return { gl, gr, minOv, cover: (sl + sr) / n / cw, coverL: sl / n / cw, coverR: sr / n / cw, restL: rl, restR: rrg };
}

/* ---------- compositions ---------- */
const D: Cfg = { sfx: "", W, H, cx: 1260, cy: 520, seed: 0, hs: [[105, 135], [150, 190], [195, 245], [240, 300], [285, 355], [330, 410], [380, 470]], skip: (x) => x < 900 };
const PC: Cfg = { sfx: "-p", W: PW, H: PH, cx: 540, cy: 680, seed: 1000, hs: [[120, 104], [170, 146], [220, 188], [270, 230], [320, 272], [370, 315], [420, 360]], skip: (_x, y) => y > 1050 };

function foldLayers(c: Cfg): { layers: Layer[]; holes: Shape[] } {
  const holes = [1, 2, 3, 4, 5, 6, 7].map((k) => holeOf(c, k));
  const layers: Layer[] = [];
  for (let k = 1; k <= 7; k++) {
    const extra = k === 7 ? (echoU: Shape, holeOff: Shape) => {
      const bx = c.W * 0.08, by = c.H * 0.08, outside = [rect(-5000, -5000, 5000 - bx, 10000), rect(c.W + bx, -5000, 5000, 10000), rect(-5000, -5000, 10000, 5000 - by), rect(-5000, c.H + by, 10000, 5000)];
      const clip = (s: Shape) => difference(s, holeOff, echoU, ...outside);
      const sc: Scene = c.sfx
        ? { x0: -86, x1: 1166, moon: [320, 1235, 70], clouds: [[170, 1130, 260, 60], [540, 1190, 220, 52], [900, 1120, 280, 62], [260, 1330, 180, 44], [820, 1310, 220, 50]], ridgeF: [1340, 110], ridgeA: [1470, 150], ridgeB: [1680, 90], hillsY: 1850, mtn: { cx: 650, base: 1820, w: 560, h: 300 }, rowA: 0, rowB: 0, rowC: 0, stars: { x0: 40, y0: 1080, x1: 1040, y1: 1300, n: 26 } }
        : { x0: -154, x1: 2074, moon: [600, 250, 60], clouds: [[330, 140, 280, 62], [800, 120, 200, 50], [420, 330, 240, 54], [1760, 140, 240, 56], [1720, 1040, 250, 56]], ridgeF: [420, 110], ridgeA: [650, 190], ridgeB: [880, 100], hillsY: 1010, mtn: { cx: 410, base: 935, w: 640, h: 305 }, rowA: 0, rowB: 0, rowC: 0, stars: { x0: -120, y0: -60, x1: 870, y1: 380, n: 34 } };
      const out = calmScene(c, sc, clip);
      out.push(...backingCreases(c, clip, 3, c.sfx ? [30, 150] : [120, 240]));
      if (c.sfx) { // top strip (above the hole) carries a quiet strata + pine band so it is not a slab
        const r = R(900), tp = ridge(r, { x0: -86, x1: 1166, y: 150, base: 420, amp: 90, step: 50, seed: 7771 });
        out.push(sheet(clip(flat(tp)), MID7, { shadow: { dx: 3, dy: 5, blur: 6, opacity: 0.25, color: P.shadow }, edge: { light: [0, -1], width: 1.6, color: mix(MID7, P["rim-paper"]!, 0.25) } }));
        const ps: Shape[] = []; for (let x = -80; x < 1160; x += 24 * r.range(0.8, 1.25)) ps.push(pine(r, x, topY(tp, x) + 5, r.range(30, 56)));
        out.push(sheet(clip(union(...ps)), P["fold-ink"]!, { shadow: { dx: 3, dy: 5, blur: 6, opacity: 0.3, color: P.shadow }, edge: { light: [0, -1], width: 1.4, color: mix(P["fold-ink"]!, P["rim-paper"]!, 0.25) } }));
      }
      return out;
    } : undefined;
    const f = foldFrags(c, k, holes[k - 1]!, k < 7 ? holes[k]! : null, extra);
    layers.push(layer(`fold-${k}${c.sfx}`, 2 + k, ...f.frags));
  }
  return { layers, holes };
}

function creasesLayer(id: string, c: Cfg, holes: Shape[]): Layer {
  const r = R(600 + c.seed), segs: Poly[] = [];
  for (let i = 0; i < 12; i++) {
    const a = ((i + r.range(0.1, 0.9)) / 12) * Math.PI * 2, len = 640;
    const [ax, ay] = [Math.cos(a), Math.sin(a)], nx = -ay, ny = ax, w = r.range(2.2, 3.2);
    segs.push(cut([[c.cx + ax * 30 + nx * 0.8, c.cy + ay * 30 + ny * 0.8], [c.cx + ax * len * 0.5 + nx * w * 0.5, c.cy + ay * len * 0.5 + ny * w * 0.5], [c.cx + ax * len + nx * 0.8, c.cy + ay * len + ny * 0.8], [c.cx + ax * len * 0.5 - nx * w * 0.5, c.cy + ay * len * 0.5 - ny * w * 0.5]], r, 0.5, 28));
  }
  const clip = difference(holes[6]!, offset(holes[0]!, 4));
  const u = union(...segs);
  return layer(id, 10, sheet(inter(offset(u, 1.3), clip), P["rim-paper"]!, { shadow: false, opacity: 0.55 }), sheet(inter(u, clip), P.shadow!, { shadow: false, opacity: 0.7 }));
}
function mistLayer(id: string, c: Cfg, k: number): Layer {
  const [hw, hh] = c.hs[k - 1]!, x = c.cx, y = c.cy, fr: [number, number, number, number][] = [
    [0, -hh, hw * 1.5, 120], [0, hh, hw * 1.5, 120], [-hw, 0, 150, hh * 1.2], [hw, 0, 150, hh * 1.2],
    [-hw * 0.8, -hh * 0.8, 190, 130], [hw * 0.8, -hh * 0.8, 190, 130], [-hw * 0.8, hh * 0.8, 190, 130], [hw * 0.8, hh * 0.8, 190, 130],
  ];
  return layer(id, 12, ...fr.map(([dx, dy, w, h]) => mist(x + dx, y + dy, w, h, P.paper!, 0.2)));
}

const fD = foldLayers(D), fP = foldLayers(PC);
const gateD = gateLayers({ sfx: "", y0: -60, y1: 1140, a: 250, amp: 80, D: 1314, shift: 700, bleedL: -800, bleedR: 2720, light: [1, 0], seed: 14, calmR: false, foldYs: [330, 840], tabYs: [] }, ["gate-l", "gate-r"]);
const gateP = gateLayers({ sfx: "-p", y0: -60, y1: 1980, a: 110, amp: 80, D: 835, shift: 460, bleedL: -560, bleedR: 1640, light: [1, 0], seed: 24, calmR: true, foldYs: [380, 1400], tabYs: [] }, ["gate-l-p", "gate-r-p"]);

const mmD = miniMountain("mini-mountain", D, [1260, 420], 170, 190, [1270, 500], 71);
const mmP = miniMountain("mini-mountain-p", PC, [540, 600], 150, 170, [548, 660], 72);
const miniGlow = layer("mini-glow", 2, glow(1270, 500, 160, P.lamp!, { opacity: 0.5, core: P["lamp-core"]! }));

const all: Layer[] = [
  paperLayer("paper", D, 61), mmD, miniGlow, ...fD.layers, creasesLayer("creases", D, fD.holes),
  shaftsLayer("shafts", D, [172, 140, 112, 82, 52], 560, [0.2, 0.22, 0.16, 0.24, 0.18]),
  mistLayer("mist", D, 4), dustLayer("paper-dust", { x0: 900, y0: 30, x1: 1900, y1: 1050 }, 81), gateD.gl, gateD.gr,
  paperLayer("paper-p", PC, 62), mmP, ...fP.layers, creasesLayer("creases-p", PC, fP.holes),
  shaftsLayer("shafts-p", PC, [178, 140, -140, 92, -92], 480, [0.2, 0.22, 0.16, 0.24, 0.18]),
  mistLayer("mist-p", PC, 4), dustLayer("paper-dust-p", { x0: 100, y0: 100, x1: 980, y1: 1000 }, 82), gateP.gl, gateP.gr,
];
// shafts-p must keep out of the calm zone: its layer is built from the same helper but a shorter length (480 < 1056-680)
const BAKE: Record<string, [number, number]> = {
  paper: [0.5, 50], "paper-p": [0.5, 50], "mini-mountain": [1, 65], "mini-mountain-p": [1, 65], "mini-glow": [0.5, 45],
  "fold-1": [0.6, 50], "fold-2": [0.6, 50], "fold-3": [0.55, 48], "fold-4": [0.5, 48], "fold-5": [0.5, 46], "fold-6": [0.5, 46], "fold-7": [0.5, 42],
  creases: [0.5, 40], shafts: [0.4, 40], mist: [0.35, 35], "paper-dust": [0.5, 45], "gate-l": [0.4, 40], "gate-r": [0.4, 40],
};
for (const k of ["paper", "mini-mountain", "fold-1", "fold-2", "fold-3", "fold-4", "fold-5", "fold-6", "fold-7", "creases", "shafts", "mist", "paper-dust", "gate-l", "gate-r"]) BAKE[k + "-p"] = BAKE[k + "-p"] ?? BAKE[k]!;

const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
for (const l of all) {
  const [scale, quality] = BAKE[l.id] ?? [1, 60];
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
const dIds = ["paper", "mini-mountain", "mini-glow", ...[1, 2, 3, 4, 5, 6, 7].map((k) => `fold-${k}`), "creases", "shafts", "mist", "paper-dust", "gate-l", "gate-r"];
const pIds = ["paper-p", "mini-mountain-p", "mini-glow", ...[1, 2, 3, 4, 5, 6, 7].map((k) => `fold-${k}-p`), "creases-p", "shafts-p", "mist-p", "paper-dust-p", "gate-l-p", "gate-r-p"];
const place = { "mini-glow": { x: 548 - 1270, y: 660 - 500 } };
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: compose(W, H, dIds), portrait: compose(PW, PH, pIds, place) }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop"); await composite(SLUG, "portrait");

// ---------- checks ----------
const mp = (ids: string[]) => ids.reduce((n, id) => { const b = baked.get(id)!; return n + (b.w * b.h * BAKE[id]![0] ** 2) / 1e6; }, 0);
console.log("layers desktop", dIds.length, "portrait", pIds.length);
console.log("bytes total", total, "(KB", Math.round(total / 1024) + ") budget 450 KB");
console.log("decoded MP desktop", mp(dIds).toFixed(1), "portrait", mp(pIds).toFixed(1));
console.log("desktop gates: rest edge L", gateD.restL.map(Math.round), "R", gateD.restR.map(Math.round), "closed min overlap", gateD.minOv.toFixed(1), "cover L/R/total %", (gateD.coverL * 100).toFixed(1), (gateD.coverR * 100).toFixed(1), (gateD.cover * 100).toFixed(1));
console.log("portrait gates: rest edge L", gateP.restL.map(Math.round), "R", gateP.restR.map(Math.round), "closed min overlap", gateP.minOv.toFixed(1), "cover L/R/total %", (gateP.coverL * 100).toFixed(1), (gateP.coverR * 100).toFixed(1), (gateP.cover * 100).toFixed(1));
if (gateD.minOv < 80 || gateP.minOv < 80) throw new Error("gate closed overlap < 80");
for (const [id, b] of baked) console.log(" ", id.padEnd(18), String(b.bytes).padStart(7), `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}x${Math.round(b.h)}`);
void ellipse;
