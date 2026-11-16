// b0-outside v2: dense layered night scene. Run: npx tsx art/b0-outside/build.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { squeeze, type Squeeze } from "../ambient/squeeze.ts";
import {
  ROOT, arch, bakeLayer, bridge, cloud, composite, cut, difference, ellipse, fern, glow, hills, layer, mist, mix, noise, offset,
  pine, rect, ridge, rng, ruinWall, shaft, sheet, stairs, strata, tower, union,
  type Layer, type Palette, type Poly, type Pt, type Rng, type SheetOpts, type Shape, type Frag,
} from "../lib/index.ts";

const SLUG = "b0-outside";
const P: Palette = {
  "sky-top": "#070d18", sky: "#0b1420", "sky-haze": "#16263a", star: "#cfe0f0", "far-ridge-1": "#4a6788", "far-ridge-2": "#34506e",
  "mid-ridge": "#22384f", "pine-mid": "#1a3346", "mountain-shade": "#1e3349", mountain: "#2c4763", "mountain-lit": "#3d5f80",
  "near-hill": "#132235", "near-dark": "#0d1828", gate: "#08101a", moon: "#dfe9f2", "moon-shade": "#b9cadb", mist: "#9fb8cf",
  "rim-cool": "#8fb2d4", window: "#ffb866", "window-core": "#fff1cf", "window-light": "#ffcf8a", shadow: "#03060c",
};
const p = (k: string) => P[k]!;
const LV: Pt = [0.55, -0.83];

/* ---------- band recipes (bible section 3) ---------- */
type Band = "far" | "mid" | "hero" | "near" | "gate";
const BD = {
  far: { off: 4, blur: 6, op: 0.25, rim: 1.5, rm: 0.35, inner: undefined },
  mid: { off: 8, blur: 10, op: 0.35, rim: 2, rm: 0.45, inner: { blur: 4, opacity: 0.25 } },
  hero: { off: 12, blur: 14, op: 0.4, rim: 2.5, rm: 0.5, inner: { blur: 6, opacity: 0.3 } },
  near: { off: 16, blur: 18, op: 0.45, rim: 3, rm: 0.45, inner: { blur: 8, opacity: 0.35 } },
  gate: { off: 22, blur: 26, op: 0.55, rim: 3, rm: 0.5, inner: { blur: 10, opacity: 0.4 } },
} as const;
// Budget: lossless alpha makes wide soft shadows expensive, so blurs are scaled down (hard-ish paper shadows).
const BLUR_K = 0.3;
const so = (b: Band, fill: string, rm?: number | false): SheetOpts => {
  const d = BD[b];
  const m = rm === undefined ? d.rm : rm;
  return {
    shadow: { dx: -LV[0] * d.off, dy: -LV[1] * d.off, blur: d.blur * BLUR_K, opacity: d.op, color: p("shadow") },
    edge: m === false ? undefined : { light: LV, width: d.rim, color: mix(fill, p("rim-cool"), m) },
    inner: d.inner ? { ...d.inner, color: p("shadow") } : undefined,
  };
};
const S = (shape: Poly | Shape, fill: string, b: Band, rm?: number | false, extra: SheetOpts = {}): Frag => sheet(shape, fill, { ...so(b, fill, rm), ...extra });
const small = (): SheetOpts => ({ shadow: { dx: -1, dy: 2, blur: 2, opacity: 0.35, color: p("shadow") } });

/** Stack with band shadow only on the outer tier (inner tiers get a tight shadow). */
function stackX(shape: Poly | Shape, fills: string[], inset: number, b: Band, rm?: number | false, extra: SheetOpts = {}): Frag[] {
  const out: Frag[] = [];
  let cur: Shape = union(shape);
  fills.forEach((f, i) => {
    if (!cur.length) return;
    const o = so(b, f, rm);
    out.push(sheet(cur, f, { ...o, ...(i ? small() : {}), ...(i && o.inner ? { inner: { ...o.inner, opacity: o.inner.opacity! * 0.6 } } : {}), ...extra }));
    cur = offset(cur, -inset);
  });
  return out;
}

/* ---------- helpers ---------- */
const yAt = (poly: Poly, x: number): number => {
  const pts = poly.slice(0, -2);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!, b = pts[i + 1]!;
    if ((a[0] <= x && x <= b[0]) || (b[0] <= x && x <= a[0])) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0] || 1);
  }
  return pts.reduce((m, q) => (Math.abs(q[0] - x) < Math.abs(m[0] - x) ? q : m), pts[0]!)[1];
};
const interp = (pts: Pt[], y: number): number => {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!, b = pts[i + 1]!;
    if ((a[1] - y) * (b[1] - y) <= 0) return a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1] || 1);
  }
  return pts[pts.length - 1]![0];
};
const seg = (a: Pt, b: Pt, w: number): Poly => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = (-dy / l) * (w / 2), ny = (dx / l) * (w / 2);
  return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]];
};
const diamond = (x: number, y: number, s: number): Poly => [[x, y - s], [x + s * 0.7, y], [x, y + s], [x - s * 0.7, y]];
const intersect = (a: Shape, b: Shape): Shape => difference(a, difference(rect(-4000, -2000, 9000, 6000), b));
const spike = (ox: number, oy: number, ang: number, len: number, w = 7): Poly => {
  const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy * (w / 2), ny = dx * (w / 2);
  return [[ox + nx, oy + ny], [ox + dx * len, oy + dy * len], [ox - nx, oy - ny]];
};
const crestPines = (r: Rng, polys: Poly[], n: number, lo: number, hi: number, x0: number, x1: number, skip?: (x: number) => boolean): Shape => {
  const parts: Shape[] = [];
  for (let i = 0; i < n; i++) {
    const x = r.range(x0, x1);
    if (skip?.(x)) continue;
    const y = Math.min(...polys.map((q) => yAt(q, x))) + 3;
    parts.push(pine(r, x, y, r.range(lo, hi)));
  }
  return union(...parts);
};
/** Stepped horizontal paper band closed to the bottom of the canvas. */
const stepBand = (r: Rng, y: number, W: number, H: number, amp: number): Poly => {
  const pts: Poly = [[-20, H + 20], [-20, y + r.range(-amp, amp)]];
  let x = -20, cy = y;
  while (x < W + 20) { x += r.range(90, 240); cy = y + r.range(-amp, amp); pts.push([x - 2, pts[pts.length - 1]![1]], [x, cy]); }
  pts.push([W + 20, cy], [W + 20, H + 20]);
  return pts;
};

type Cfg = { W: number; H: number; calm: (x: number, y: number) => boolean };

/* ---------- bg ---------- */
function skyLayer(id: string, c: Cfg, ys: number[], fills: string[], nStars: number, seed: number, starBox: { x1: number; y1: number }): Layer {
  const r = rng(seed);
  const fr: Frag[] = [sheet(rect(-20, -20, c.W + 40, c.H + 40), fills[0]!, { shadow: false })];
  ys.forEach((y, i) => fr.push(sheet(stepBand(r, y, c.W, c.H, 10), fills[i + 1]!, { shadow: false })));
  const hi: Poly[] = [], lo: Poly[] = [];
  for (let i = 0; i < nStars; i++) {
    const x = c.W * (1 - r() ** 1.5), y = starBox.y1 * r() ** 1.25, s = r.range(2, 2.6);
    (c.calm(x, y) ? lo : hi).push(diamond(x, y, s));
  }
  fr.push(sheet(union(...hi), p("star"), { shadow: false, opacity: 0.85 }), sheet(union(...lo), p("star"), { shadow: false, opacity: 0.4 }));
  return layer(id, 0, fr);
}

/* ---------- moon ---------- */
function moonLayer(): Layer {
  const r = rng(201), cx = 1520, cy = 220;
  const disc = (rad: number) => cut(ellipse(cx, cy, rad, rad, 44), r, 1, 30);
  const cr = [[-48, -38, 16], [42, -58, 11], [56, 34, 26 / 2 + 4], [-20, 52, 12], [-64, 20, 8]] as const;
  const holes = cr.map(([dx, dy, rr]) => cut(ellipse(cx + dx, cy + dy, rr, rr * 0.9, 14), r, 0.8, 12));
  const ring = difference(ellipse(cx, cy, 220, 220, 64), ellipse(cx, cy, 196, 196, 64));
  const d1 = disc(150);
  return layer("moon", 1,
    glow(cx, cy, 520, p("mist"), { opacity: 0.35, core: p("mist") }),
    sheet(ring, p("mist"), { opacity: 0.3, shadow: false }),
    sheet(d1, p("moon-shade"), { shadow: { dx: -6, dy: 9, blur: 10, opacity: 0.3, color: p("shadow") } }),
    sheet(offset(d1, -10), p("moon"), { shadow: { dx: -2, dy: 3, blur: 3, opacity: 0.25, color: p("moon-shade") }, holes }),
    sheet(offset(d1, -22), p("moon"), { shadow: { dx: -2, dy: 3, blur: 3, opacity: 0.2, color: p("moon-shade") }, holes: holes.map((h) => offset(h, -3)).filter((h) => h.length) as Shape[] }));
}

/* ---------- clouds ---------- */
function cloudsLayer(id: string, banks: { cx: number; cy: number; w: number; h: number; calm?: boolean }[][], seed: number): Layer {
  const r = rng(seed), fr: Frag[] = [];
  for (const bank of banks)
    for (const b of bank) {
      const sh = cloud(r, b.cx, b.cy, b.w, b.h);
      const f = b.calm ? [p("sky-haze"), mix(p("sky"), p("sky-haze"), 0.5)] : [p("sky-haze"), mix(p("sky-haze"), p("far-ridge-1"), 0.5)];
      fr.push(...stackX(sh, f, 7, "far", b.calm ? 0.25 : 0.35));
    }
  return layer(id, 2, fr);
}

/* ---------- ranges ---------- */
function rangeFar(id: string, c: Cfg, o: { y: number; amp: number; towers: number[]; nPines: number; split: boolean; seed: number }): Layer {
  const r = rng(o.seed), fr: Frag[] = [];
  const rA = ridge(r, { x0: -100, x1: c.W + 100, y: o.y, base: c.H + 100, amp: o.amp, step: 36, seed: o.seed + 1 });
  const rB = ridge(r, { x0: -100, x1: c.W + 100, y: o.y + 24, base: c.H + 100, amp: o.amp * 0.72, step: 36, seed: o.seed + 2 });
  const A = o.split ? difference(rA, [[-200, 0], [1050, 0], [960, 500], [900, 760], [930, 1300], [-200, 1300]]) : rA;
  fr.push(S(A, p("far-ridge-1"), "far", 0.3), S(rB, p("far-ridge-2"), "far", 0.25));
  const dark = mix(p("far-ridge-2"), p("mid-ridge"), 0.55);
  fr.push(S(crestPines(r, o.split ? [rB, rA] : [rA, rB], o.nPines, 8, 16, 0, c.W, (x) => o.split && x < 960 && false), dark, "far", false, { shadow: false }));
  const tw: Shape[] = [], dots: Poly[] = [];
  o.towers.forEach((x, i) => {
    const by = Math.min(yAt(rA, x), yAt(rB, x)) + 2, h = [26, 22, 30, 24][i % 4]!;
    const t = tower(r, x, by, 12, h, { windows: 0 });
    tw.push(t.body);
    dots.push(rect(x - 1.5, by - h * 0.35, 3, 4));
  });
  fr.push(S(union(...tw), p("mid-ridge"), "far", 0.3), sheet(union(...dots), p("window-light"), { shadow: false, opacity: 0.9 }));
  return layer(id, 3, fr);
}

function rangeMid(id: string, c: Cfg, o: { y: number; amp: number; bx0: number; bx1: number; by: number; arches: number; nPines: number; seed: number }): Layer {
  const r = rng(o.seed), fr: Frag[] = [];
  const back = ridge(r, { x0: -100, x1: c.W + 100, y: o.y - 12, base: c.H + 100, amp: o.amp * 0.8, step: 34, seed: o.seed + 1 });
  const main = ridge(r, { x0: -100, x1: c.W + 100, y: o.y, base: c.H + 100, amp: o.amp, step: 34, seed: o.seed + 2 });
  fr.push(S(back, p("far-ridge-2"), "mid", 0.25), S(main, p("mid-ridge"), "mid", 0.25));
  const br = bridge(r, o.bx0, o.bx1, o.by, 14, o.arches), w = (o.bx1 - o.bx0) / o.arches, bodyH = 14 + Math.min(w * 0.8 * 0.6, w * 0.7);
  const piers = Array.from({ length: o.arches + 1 }, (_, i) => rect(o.bx0 + w * i - 6, o.by + bodyH - 3, 12, 62));
  fr.push(S(union(br, ...piers), p("pine-mid"), "mid", 0.25));
  fr.push(S(crestPines(r, [main], o.nPines, 14, 30, 0, c.W), p("pine-mid"), "mid", false, { shadow: { dx: -2, dy: 3, blur: 3, opacity: 0.3, color: p("shadow") }, inner: undefined }));
  return layer(id, 4, fr);
}

function mistFar(): Layer {
  return layer("mist-far", 5,
    mist(1400, 690, 1000, 150, p("mist"), 0.28), mist(1450, 722, 1200, 160, p("mist"), 0.26), mist(1380, 762, 1100, 160, p("mist"), 0.24),
    mist(480, 740, 900, 140, p("mist"), 0.08));
}

function valley(id: string, c: Cfg, o: { y: number; lake: [number, number, number, number]; dashes: boolean; dot?: [number, number]; seed: number }): Layer {
  const r = rng(o.seed), fr: Frag[] = [];
  const hl = hills(r, { x0: -100, x1: c.W + 100, y: o.y, base: c.H + 200, amp: 60, seed: o.seed + 1, step: 70 });
  fr.push(S(hl, p("mid-ridge"), "mid", 0.25));
  const [lx0, ly0, lx1, ly1] = o.lake, lm = (ly0 + ly1) / 2;
  const lake = cut([[lx0 + 10, ly0 + 6], [(lx0 + lx1) / 2, ly0], [lx1 - 20, ly0 + 2], [lx1, lm], [lx1 - 30, ly1], [(lx0 + lx1) / 2, ly1 - 2], [lx0 + 30, ly1 - 4], [lx0, lm]], r, 2, 34);
  const slits: Poly[] = [];
  for (let i = 0; i < 20; i++) { const x = r.range(lx0 + 40, lx1 - 60), y = r.range(ly0 + 8, ly1 - 8); slits.push(rect(x, y, r.range(12, 30), 3)); }
  fr.push(S(lake, p("sky-haze"), "mid", 0.25, { holes: slits }));
  if (o.dashes) {
    const ds: Poly[] = [];
    for (let i = 0; i < 6; i++) { const w = r.range(18, 50); ds.push(rect(1470 + (i % 3) * 38 + r.range(-8, 8) - w / 2 + 30, ly0 + 8 + i * 6.5, w, 3.5)); }
    fr.push(sheet(union(...ds), p("moon"), { opacity: 0.4, shadow: false }));
  }
  if (o.dot) fr.push(sheet(rect(o.dot[0] - 2, o.dot[1] - 2, 4, 5), p("window-light"), { shadow: false }));
  fr.push(S(crestPines(r, [hl], 26, 10, 20, 0, c.W, (x) => x > lx0 && x < lx1), p("pine-mid"), "mid", false, { inner: undefined, shadow: small().shadow }));
  return layer(id, 6, fr);
}

/* ---------- mountain (shared) ---------- */
const crag = (side: -1 | 1, seed: number): Pt[] => {
  const r = rng(seed), out: Pt[] = [];
  const ys = [800]; while (ys[ys.length - 1]! > 345) ys.push(ys[ys.length - 1]! - r.range(24, 40));
  ys[ys.length - 1] = 340;
  ys.forEach((y, i) => {
    const u = (800 - y) / 460, bulge = Math.exp(-(((u - (side < 0 ? 0.42 : 0.55)) / 0.1) ** 2)) * (side < 0 ? 26 : 24);
    const x = 1240 + side * (260 * (1 - u) ** 1.12 + (i % 2 ? 9 : -6) * r.range(0.6, 1.4) * (u < 0.96 ? 1 : 0) + bulge * (u < 0.96 ? 1 : 0) * 1);
    out.push([x, y]);
  });
  return out;
};
const MTN_L: Pt[] = crag(-1, 3301);
const MTN_R: Pt[] = crag(1, 3302).reverse();
const MTN_BASE: Pt[] = [[1480, 806], [1410, 798], [1340, 808], [1270, 800], [1200, 806], [1130, 799], [1060, 806]];
const RIDGE_LINE: Pt[] = [[1240, 340], [1252, 400], [1264, 450], [1276, 500], [1284, 560], [1290, 640], [1296, 720], [1300, 806]];
const mtnSil = (): Poly => cut([...MTN_L, ...MTN_R.slice(1), ...MTN_BASE], rng(301), 2.5, 36);

function mountainBack(): Layer {
  const r = rng(302), sil = mtnSil();
  const back = sil.map(([x, y]) => [x - 14, y + 18] as Pt);
  const twin: Poly = cut([[930, 806], [960, 744], [1000, 684], [1040, 612], [1080, 520], [1112, 590], [1150, 644], [1192, 704], [1236, 806]], r, 2, 30);
  return layer("mountain-back", 7,
    S(back, mix(p("mountain-shade"), p("near-dark"), 0.4), "mid", 0.2),
    ...stackX(twin, [p("mountain-shade"), mix(p("mountain-shade"), p("mountain"), 0.5)], 9, "mid", 0.35),
    sheet(arch(r, 1262, 580, 30, 40, 0.5), p("window-light"), { shadow: false }));
}

function mountain(): Layer {
  const r = rng(303), fr: Frag[] = [], sil = mtnSil();
  const rightP: Poly = [...RIDGE_LINE, [1300, 1000], [2400, 1000], [2400, 0], [1240, 0]];
  const leftP: Poly = [...RIDGE_LINE, [1300, 1000], [0, 1000], [0, 0], [1240, 0]];
  const shade = difference(sil, rightP), lit = difference(sil, leftP);
  const win = arch(r, 1262, 570, 14, 20, 0.4);
  const slit = (a: Pt, b: Pt) => seg(a, b, 3);
  const slits = [slit([1330, 430], [1392, 520]), slit([1378, 585], [1416, 648]), slit([1312, 640], [1352, 704])];
  const shFills = [p("mountain-shade"), p("mountain"), mix(p("mountain"), p("mountain-lit"), 0.3), mix(p("mountain"), p("mountain-lit"), 0.5)];
  const ltFills = [p("mountain"), mix(p("mountain"), p("mountain-lit"), 0.4), mix(p("mountain"), p("mountain-lit"), 0.7), p("mountain-lit")];
  fr.push(...stackX(shade, shFills, 12, "hero", 0.3, { holes: [win] }));
  fr.push(...stackX(lit, ltFills, 12, "hero", 0.5, { holes: slits }));
  // strata ledges over each facet (inside the inset tiers)
  const bandsFor = (facet: Shape, inner: Shape, mixes: [string, string], holes: (Poly | Shape)[]) => {
    const rr = rng(311);
    strata(rr, { x0: 940, x1: 1560, y: 400, base: 820, bands: 5 }).forEach((b, i) => {
      const sh = intersect(b, offset(facet, -14));
      if (!sh.length) return;
      fr.push(sheet(sh, mix(mixes[0], mixes[1], 0.2 + i * 0.12), { holes, shadow: { dx: -2, dy: 4, blur: 2, opacity: 0.35, color: p("shadow") }, edge: { light: LV, width: 1.6, color: mix(mix(mixes[0], mixes[1], 0.2 + i * 0.12), p("rim-cool"), 0.4) } }));
    });
  };
  bandsFor(shade, shade, [p("mountain"), p("mountain-lit")], [win]);
  bandsFor(lit, lit, [p("mountain"), p("mountain-lit")], slits);
  // zig-zag stair path
  const xl = (y: number) => interp(MTN_L, y), xr = (y: number) => interp(RIDGE_LINE, y), xs = (y: number) => interp(MTN_R, y);
  const path: Pt[] = [];
  for (let k = 0; k <= 14; k++) {
    const y = 794 - k * 15.2;
    path.push(k % 2 === 0 ? [xl(y) + 18, y] : [xr(y) - 16, y]);
  }
  path.push([1262, 580]);
  const treads: Poly[] = [];
  for (let i = 0; i < path.length - 1; i++) treads.push(seg(path[i]!, path[i + 1]!, 3.6));
  fr.push(sheet(union(...treads), mix(p("mountain"), p("mountain-lit"), 0.7), { shadow: small().shadow }));
  // landings: tiny ticks
  const ticks: Poly[] = [];
  path.slice(0, -1).forEach(([x, y], i) => ticks.push(rect(x - (i % 2 ? 4 : -1), y - 3, 5, 6)));
  fr.push(sheet(union(...ticks), mix(p("mountain"), p("mountain-lit"), 0.5), { shadow: false }));
  // ledge pines
  const pn: Shape[] = [];
  for (let i = 0; i < 12; i++) {
    const y = r.range(600, 792), shadeSide = i % 2 === 0;
    const x = shadeSide ? r.range(xl(y) + 8, xr(y) - 14) : r.range(xr(y) + 14, xs(y) - 10);
    pn.push(pine(r, x, y, r.range(11, 24)));
  }
  fr.push(S(union(...pn), p("pine-mid"), "mid", false, { inner: undefined, shadow: small().shadow }));
  const t = tower(r, 1050, 798, 18, 40, { windows: 2 });
  fr.push(S(t.body, p("pine-mid"), "mid", 0.3, { holes: t.holes, inner: undefined }));
  return layer("mountain", 8, fr);
}

/** Hero hook: bright warm core (~44 design px = ~29 px at 1280) inside a soft halo (~5x core radius), light through a cut arch hole. */
function windowGlow(): Layer {
  const cx = 1262, cy = 558, R = 116;
  const halo = glow(cx, cy, R, p("window"), { opacity: 0.85, core: p("window-light") });
  const mid = glow(cx, cy, 62, p("window-light"), { opacity: 1, core: p("window-core") });
  const d = `M${cx - 17} ${cy + 20}L${cx - 17} ${cy - 8}Q${cx - 17} ${cy - 22} ${cx} ${cy - 22}Q${cx + 17} ${cy - 22} ${cx + 17} ${cy - 8}L${cx + 17} ${cy + 20}Z`;
  const core: Frag = {
    svg: `<filter id="wgb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>` +
      `<path d="${d}" fill="${p("window")}" opacity=".9" filter="url(#wgb)"/>` +
      `<path d="${d}" fill="${p("window-core")}" transform="translate(${cx} ${cy}) scale(.72) translate(${-cx} ${-cy})"/>`,
    x0: cx - R, y0: cy - R, x1: cx + R, y1: cy + R,
  };
  return layer("window-glow", 9, halo, mid, core);
}

/* ---------- forest ---------- */
function forestMid(id: string, c: Cfg, o: { y: number; n: number; lo: number; hi: number; seed: number; rows?: number; gap?: number; bands?: number; ruin?: { x: number; y: number; w: number; h: number }; stairs?: [number, number, number, number] }): Layer {
  const r = rng(o.seed), fr: Frag[] = [], R = o.rows ?? 3, gap = o.gap ?? 14;
  const hl = hills(r, { x0: -100, x1: c.W + 100, y: o.y, base: c.H + 200, amp: 50, seed: o.seed + 1, step: 70 });
  fr.push(S(hl, p("near-hill"), "mid", 0.25));
  if (o.bands) strata(r, { x0: -100, x1: c.W + 100, y: o.y + 60, base: c.H + 200, bands: o.bands }).forEach((b, i) =>
    fr.push(S(intersect(b, union(hl)), mix(p("near-hill"), p("pine-mid"), 0.18 + 0.1 * (i % 2)), "mid", 0.25, { inner: undefined })));
  if (o.ruin) {
    const { x, y, w, h } = o.ruin, rw = ruinWall(r, x, y, w, h);
    const holes = [0, 1, 2].map((i) => arch(r, x + w * (0.2 + 0.3 * i), y, 34, h * 0.55, 0.6));
    fr.push(S(rw.body, p("mid-ridge"), "mid", 0.25, { holes }));
  }
  if (o.stairs) fr.push(S(stairs(...o.stairs, 8, -1), p("mid-ridge"), "mid", 0.25));
  const tints = [mix(p("pine-mid"), p("mid-ridge"), 0.5), p("pine-mid"), mix(p("pine-mid"), p("near-hill"), 0.45)];
  const rows: Shape[][] = Array.from({ length: R }, () => []);
  for (let i = 0; i < o.n; i++) {
    const row = i % R, x = r.range(-20, c.W + 20);
    if (o.ruin && row === R - 1 && x > o.ruin.x - 20 && x < o.ruin.x + o.ruin.w + 20) continue;
    const sz = r.range(o.lo, o.hi) * (0.78 + (row * 0.3) / R);
    rows[row]!.push(pine(r, x, yAt(hl, x) + row * gap + 10, sz));
  }
  rows.forEach((rw, i) => fr.push(S(union(...rw), tints[i % 3]!, "mid", 0.25)));
  return layer(id, 10, fr);
}

function shafts(id: string, list: [number, number, number, number, number, number, number][]): Layer {
  return layer(id, 11, ...list.map(([x, y, w0, w1, len, a, op]) => shaft(x, y, w0, w1, len, a, p("mist"), op)));
}

function nearHill(id: string, c: Cfg, o: { yA: number; yB: number; tufts: number; pines: [number, number][]; bands?: number; lower?: number; seed: number }): Layer {
  const r = rng(o.seed), fr: Frag[] = [];
  const gA = hills(r, { x0: -100, x1: c.W + 100, y: o.yA, base: c.H + 200, amp: 50, seed: o.seed + 1, step: 80 });
  const gB = hills(r, { x0: -100, x1: c.W + 100, y: o.yB, base: c.H + 200, amp: 40, seed: o.seed + 2, step: 80 });
  fr.push(S(gA, p("near-hill"), "near", 0.25));
  const back: Shape[] = [];
  for (let i = 0; i < 28; i++) { const x = r.range(0, c.W); back.push(fern(r, x, yAt(gA, x) + 6, r.range(22, 44), r.range(-0.5, 0.5))); }
  fr.push(S(union(...back), mix(p("near-hill"), p("near-dark"), 0.55), "near", false, { inner: undefined, shadow: small().shadow }));
  if (o.bands) {
    const bs = strata(r, { x0: -100, x1: c.W + 100, y: o.yB + 30, base: c.H + 200, bands: o.bands });
    bs.forEach((b, i) => fr.push(S(intersect(b, union(gB)), mix(p("near-hill"), p("near-dark"), (i + 1) / (o.bands! + 1)), "near", 0.25, { inner: undefined })));
  }
  fr.push(S(gB, p("near-dark"), "near", 0.25));
  const tufts: Shape[] = [];
  for (let i = 0; i < o.tufts; i++) { const x = r.range(-20, c.W + 20); tufts.push(fern(r, x, yAt(gB, x) + 8, r.range(26, 62), r.range(-0.5, 0.5))); }
  fr.push(S(union(...tufts), p("near-dark"), "near", false, { inner: undefined, shadow: small().shadow }));
  if (o.lower) {
    const lw: Shape[] = [];
    for (let i = 0; i < o.lower; i++) lw.push(fern(r, r.range(0, c.W), r.range(o.yB + 90, c.H - 20), r.range(50, 110), r.range(-0.6, 0.6)));
    fr.push(S(union(...lw), p("gate"), "near", 0.25, { inner: undefined, shadow: small().shadow }));
  }
  for (const [x, h] of o.pines) fr.push(S(pine(r, x, yAt(gB, x) + 30, h), p("near-dark"), "near", 0.45));
  return layer(id, 12, fr);
}

function dust(id: string, box: { x0: number; y0: number; x1: number; y1: number }, n: number, seed: number): Layer {
  const r = rng(seed), a: Poly[] = [], b: Poly[] = [];
  for (let i = 0; i < n; i++) (i % 2 ? a : b).push(diamond(r.range(box.x0, box.x1), r.range(box.y0, box.y1), r.range(1.5, 3)));
  return layer(id, 13, sheet(union(...a), p("mist"), { opacity: 0.35, shadow: false }), sheet(union(...b), p("mist"), { opacity: 0.7, shadow: false }));
}

/* ---------- gates ---------- */
type GateCfg = {
  id: string; W: number; H: number; side: "l" | "r"; E: number; bleed: number; shift: number; seed: number; reach: number;
  pines: { cx: number; h: number }[]; rock: boolean; boulder: boolean; lean: number; rimMix: number; light: number;
};
const gateSil = new Map<string, { sil: Shape; c: GateCfg }>();

function gate(c: GateCfg): Layer {
  const r = rng(c.seed), n1 = noise(c.seed + 3), n2 = noise(c.seed + 5);
  const edge = (y: number) => c.E + 20 * n1(y / 300, 1) + 8 * n2(y / 90, 2);
  const lo = -60, hi = c.H + 60, Hs = c.H / 1080, wide = c.W > 1500 ? 1 : 0.7;
  const M = (s: Poly | Shape): Shape => {
    const sh = union(s);
    return c.side === "r" ? union(sh.map((ring) => ring.map(([x, y]) => [c.W - x, y] as Pt))) : sh;
  };
  const pts: Poly = [[c.bleed, lo]];
  for (let y = lo; y <= hi; y += 30) pts.push([edge(y), y]);
  pts.push([c.bleed, hi]);
  const parts: (Poly | Shape)[] = [cut(pts, r, 4, 44)];
  if (c.rock) for (let i = 0; i < 3; i++) { const y0 = c.H - 250 * Hs + i * 90 * Hs; parts.push(cut([[c.E - 90, y0], [c.E + 70 + i * 26, y0 + 4], [c.E + 86 + i * 26, y0 + 96 * Hs], [c.E - 90, y0 + 96 * Hs]], r, 4, 36)); }
  if (c.boulder) parts.push(cut(ellipse(c.E - 20, c.H - 30, 170 * wide, 120 * Hs, 22), r, 5, 40));
  const bough = (x0: number, y0: number, x1: number, y1: number, wd: number): Shape => {
    const q: Poly[] = [[[x0, y0 - wd / 2], [x1, y1 - wd * 0.12], [x1 + 10, y1 + 2], [x0, y0 + wd / 2]]];
    for (let t = 0.25; t <= 1.001; t += 0.11) {
      const bx = x0 + (x1 - x0) * t, by = y0 + (y1 - y0) * t, k = r.int(3, 5);
      for (let j = 0; j < k; j++) q.push(spike(bx, by, r.range(0.55, 2.3), r.range(26, 62) * wide, 8));
    }
    return union(...q.map((x) => cut(x, r, 1.5, 30)));
  };
  const boughs = [bough(c.E - 260 * wide, -30, c.reach, 36 * Hs, 54), bough(c.E - 200 * wide, 330 * Hs, c.E + 120 * wide, 372 * Hs, 38), bough(c.E - 200 * wide, 690 * Hs, c.E + 90 * wide, 724 * Hs, 34)];
  parts.push(...boughs);
  const det: Poly[] = [];
  for (let y = 110 * Hs, i = 0; y < c.H - 60; y += r.range(52, 100) * Hs, i++) {
    const ox = edge(y) - 10, kind = i % 3;
    if (kind === 0) for (let j = 0; j < 5; j++) det.push(spike(ox, y, r.range(-0.4, 1.0), r.range(26, 56), 7));
    else if (kind === 1) { det.push(cut(ellipse(ox + 16, y + 14, 7, 15, 10), r, 1, 10), spike(ox, y, 0.2, 18, 4)); for (let j = 0; j < 3; j++) det.push(spike(ox + 8, y + 24, r.range(0.5, 1.2), r.range(20, 34), 6)); }
    else for (let j = 0; j < 3; j++) det.push(spike(ox, y, r.range(0.7, 1.5), r.range(38, 66), 8));
  }
  const slab = union(...parts, ...det);
  gateSil.set(c.id, { sil: slab, c });
  const fills = [p("gate"), p("near-dark"), mix(p("near-dark"), p("rim-cool"), c.light)];
  const fr: Frag[] = [...stackX(M(slab), fills, 16, "gate", c.rimMix)];
  const inner = offset(slab, -30);
  const bands = strata(r, { x0: c.bleed, x1: c.E + 60, y: 40 * Hs, base: c.H + 80, bands: 4 });
  bands.forEach((b, i) => fr.push(sheet(M(intersect(b, inner)), mix(p("near-dark"), p("rim-cool"), 0.07 + i * 0.045), {
    shadow: { dx: -3, dy: 5, blur: 5, opacity: 0.4, color: p("shadow") }, edge: { light: LV, width: 2, color: mix(p("near-dark"), p("rim-cool"), c.rimMix * 0.6) } })));
  const cracks: Poly[] = [];
  for (let i = 0; i < 12; i++) {
    let x = r.range(c.bleed * 0.1, c.E - 70), y = r.range(60, c.H - 200);
    for (let j = 0; j < 4; j++) { const nx = x + r.range(-18, 18), ny = y + r.range(30, 60) * Hs; cracks.push(seg([x, y], [nx, ny], 3.4)); x = nx; y = ny; }
  }
  fr.push(sheet(M(intersect(union(...cracks), inner)), p("gate"), { shadow: false }));
  const base = c.H + 70;
  const lean = (s: Shape): Shape => union(s.map((ring) => ring.map(([x, y]) => [x + c.lean * (base - y), y] as Pt)));
  const fg: Shape[] = c.pines.map((q) => lean(pine(r, q.cx, base, q.h)));
  const tx = c.E - 120 * wide;
  fg.push(lean(union(cut([[tx - 36, hi], [tx - 24, c.H * 0.5], [tx - 14, lo], [tx + 18, lo], [tx + 26, c.H * 0.5], [tx + 44, hi]], r, 3, 40))), ...boughs);
  fr.push(S(M(union(...fg)), p("gate"), "gate", c.rimMix, { inner: undefined }));
  return layer(c.id, c.side === "l" ? 14 : 15, fr);
}

/** Scanline intervals (even-odd) of a Shape at y. */
function intervals(s: Shape, y: number): [number, number][] {
  const xs: number[] = [];
  for (const ring of s) for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!, b = ring[(i + 1) % ring.length]!;
    if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
  }
  xs.sort((a, b) => a - b);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i]!, xs[i + 1]!]);
  return out;
}
/** G2/G3: closed (shifted) gates must overlap >= 80 px at every y of the canvas and cover both screen edges. */
function verifyGates(l: string, rr: string): { min: number; restL: [number, number]; restR: [number, number] } {
  const A = gateSil.get(l)!, B = gateSil.get(rr)!, { W, H } = A.c;
  let min = 1e9, aMin = 1e9, aMax = -1e9, bMin = 1e9, bMax = -1e9;
  for (let y = 0; y <= H; y += 2) {
    const ia = intervals(A.sil, y)[0], ib = intervals(B.sil, y)[0]; // left-space; first interval = body from the bleed edge
    if (!ia || !ib) throw new Error(`gate missing at y=${y}`);
    if (ia[0] + A.c.shift > 0 || ib[0] + B.c.shift > 0) throw new Error(`gate outer edge does not cover the screen edge at y=${y}`);
    const lEnd = ia[1] + A.c.shift, rStart = W - ib[1] - B.c.shift;
    min = Math.min(min, lEnd - rStart);
    aMin = Math.min(aMin, ia[1]); aMax = Math.max(aMax, ia[1]); bMin = Math.min(bMin, W - ib[1]); bMax = Math.max(bMax, W - ib[1]);
  }
  if (min < 80) throw new Error(`gate overlap ${min.toFixed(1)} < 80 (${l}/${rr})`);
  return { min, restL: [aMin, aMax], restR: [bMin, bMax] };
}

/* ---------- compositions ---------- */
const D: Cfg = { W: 1920, H: 1080, calm: (x, y) => x < 864 && y > 160 && y < 940 };
const PT: Cfg = { W: 1080, H: 1920, calm: (_x, y) => y > 1056 };
const skyFills = [p("sky-top"), mix(p("sky-top"), p("sky"), 0.35), p("sky"), mix(p("sky"), p("sky-haze"), 0.4), p("sky-haze")];

const layers: Layer[] = [
  skyLayer("sky", D, [150, 300, 470, 640], skyFills, 180, 101, { x1: 1920, y1: 560 }),
  moonLayer(),
  cloudsLayer("clouds-far", [
    [{ cx: 420, cy: 330, w: 520, h: 100, calm: true }, { cx: 780, cy: 392, w: 240, h: 60, calm: true }],
    [{ cx: 1010, cy: 352, w: 500, h: 95 }, { cx: 1230, cy: 412, w: 200, h: 55 }],
    [{ cx: 1520, cy: 388, w: 640, h: 95 }, { cx: 1850, cy: 330, w: 260, h: 70 }],
  ], 102),
  rangeFar("range-far", D, { y: 630, amp: 170, towers: [1180, 1360, 1720], nPines: 40, split: true, seed: 103 }),
  rangeMid("range-mid", D, { y: 700, amp: 200, bx0: 1050, bx1: 1650, by: 690, arches: 9, nPines: 80, seed: 104 }),
  mistFar(),
  valley("valley", D, { y: 795, lake: [1060, 800, 1720, 850], dashes: true, dot: [1262, 826], seed: 106 }),
  mountainBack(),
  mountain(),
  windowGlow(),
  forestMid("forest-mid", D, { y: 865, n: 50, lo: 40, hi: 90, seed: 110, bands: 2, ruin: { x: 1500, y: 880, w: 200, h: 70 }, stairs: [1000, 824, 60, 30] }),
  shafts("shafts", [[1510, 250, 36, 150, 760, -28, 0.15], [1440, 300, 28, 120, 700, -33, 0.12], [1620, 260, 40, 170, 800, -24, 0.18]]),
  nearHill("near-hill", D, { yA: 950, yB: 1010, bands: 2, tufts: 70, pines: [[1600, 300], [1700, 340], [1790, 260]], seed: 112 }),
  dust("dust", { x0: 950, y0: 250, x1: 1850, y1: 850 }, 120, 113),
  gate({ id: "gate-l", W: 1920, H: 1080, side: "l", E: 450, bleed: -800, shift: 700, seed: 121, reach: 570, rock: true, boulder: false, lean: 0, rimMix: 0.25, light: 0.24,
    pines: [{ cx: 250, h: 900 }, { cx: 340, h: 620 }, { cx: 430, h: 380 }] }),
  gate({ id: "gate-r", W: 1920, H: 1080, side: "r", E: 240, bleed: -800, shift: 700, seed: 122, reach: 470, rock: false, boulder: true, lean: 0.09, rimMix: 0.3, light: 0.26,
    pines: [{ cx: 80, h: 880 }, { cx: 160, h: 560 }, { cx: 225, h: 360 }] }),
  // portrait redraws
  skyLayer("sky-p", PT, [330, 700, 1050, 1400], skyFills, 130, 201, { x1: 1080, y1: 1000 }),
  cloudsLayer("clouds-far-p", [
    [{ cx: 700, cy: 455, w: 460, h: 100 }, { cx: 380, cy: 430, w: 260, h: 60 }],
    [{ cx: 250, cy: 540, w: 420, h: 90 }, { cx: 830, cy: 565, w: 260, h: 60 }],
  ], 202),
  rangeFar("range-far-p", PT, { y: 920, amp: 150, towers: [220, 860], nPines: 30, split: false, seed: 203 }),
  rangeMid("range-mid-p", PT, { y: 980, amp: 170, bx0: 600, bx1: 1040, by: 975, arches: 7, nPines: 50, seed: 204 }),
  valley("valley-p", PT, { y: 1035, lake: [300, 1050, 900, 1100], dashes: false, seed: 206 }),
  forestMid("forest-mid-p", PT, { y: 1130, n: 70, lo: 70, hi: 140, seed: 210, rows: 5, gap: 70, bands: 3, ruin: { x: 640, y: 1160, w: 220, h: 80 } }),
  shafts("shafts-p", [[740, 330, 30, 130, 540, -27, 0.15], [680, 360, 26, 110, 500, -32, 0.12], [800, 340, 34, 140, 560, -22, 0.16]]),
  nearHill("near-hill-p", PT, { yA: 1500, yB: 1620, tufts: 55, pines: [[300, 260], [560, 200], [880, 290]], bands: 4, lower: 40, seed: 212 }),
  dust("dust-p", { x0: 200, y0: 200, x1: 1000, y1: 1000 }, 120, 213),
  gate({ id: "gate-l-p", W: 1080, H: 1920, side: "l", E: 190, bleed: -560, shift: 460, seed: 221, reach: 300, rock: true, boulder: false, lean: 0, rimMix: 0.25, light: 0.24,
    pines: [{ cx: -90, h: 1300 }, { cx: 10, h: 800 }, { cx: 90, h: 480 }] }),
  gate({ id: "gate-r-p", W: 1080, H: 1920, side: "r", E: 130, bleed: -560, shift: 460, seed: 222, reach: 250, rock: false, boulder: true, lean: 0.07, rimMix: 0.3, light: 0.26,
    pines: [{ cx: -60, h: 1250 }, { cx: 30, h: 760 }, { cx: 100, h: 440 }] }),
];

const vd = verifyGates("gate-l", "gate-r"), vp = verifyGates("gate-l-p", "gate-r-p");
console.log(`gate overlap min (closed): desktop ${vd.min.toFixed(1)} px, portrait ${vp.min.toFixed(1)} px`);

/* ---------- bake (per-band scale/quality, bible 13) ---------- */
const SET: Record<string, [number, number]> = {
  sky: [0.75, 50], moon: [0.3, 40], "clouds-far": [0.5, 50], "range-far": [0.5, 50], "range-mid": [0.5, 50], "mist-far": [0.25, 40],
  valley: [0.5, 50], "mountain-back": [0.6, 55], mountain: [0.85, 60], "window-glow": [0.6, 60], "forest-mid": [0.5, 50], shafts: [0.25, 40],
  "near-hill": [0.45, 50], dust: [0.4, 45], "gate-l": [0.35, 45], "gate-r": [0.35, 45],
};
const outDir = join(ROOT, "public/art", SLUG);
mkdirSync(outDir, { recursive: true });
const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
for (const l of layers) {
  const [scale, quality] = SET[l.id.replace(/-p$/, "")]!;
  const b = await bakeLayer(SLUG, l, { scale, quality });
  if (!b) throw new Error(`empty layer ${l.id}`);
  baked.set(l.id, b);
}
// byte squeeze (beat 0 + 1 under 400 KB): [pixel factor, quality, alphaQuality]
const SQ: Record<string, Squeeze> = {
  sky: [0.8, 45, 70], moon: [0.8, 38, 60], "clouds-far": [0.8, 38, 60], "range-far": [0.85, 38, 65], "range-mid": [0.85, 38, 65], "mist-far": [0.8, 45, 60],
  valley: [0.85, 38, 65], "mountain-back": [0.9, 40, 70], mountain: [1, 42, 75], "window-glow": [1, 50, 70], "forest-mid": [0.85, 38, 65], shafts: [0.8, 36, 50],
  "near-hill": [0.85, 38, 65], dust: [1, 38, 60], "gate-l": [0.85, 40, 70], "gate-r": [0.85, 40, 70],
};
await squeeze(SLUG, baked, SQ);
const dIds = ["sky", "moon", "clouds-far", "range-far", "range-mid", "mist-far", "valley", "mountain-back", "mountain", "window-glow", "forest-mid", "shafts", "near-hill", "dust", "gate-l", "gate-r"];
const pIds = ["sky-p", "moon", "clouds-far-p", "range-far-p", "range-mid-p", "mist-far", "valley-p", "mountain-back", "mountain", "window-glow", "forest-mid-p", "shafts-p", "near-hill-p", "dust-p", "gate-l-p", "gate-r-p"];
const r1 = (n: number) => Math.round(n * 10) / 10;
const MP = { s: 0.9, x: 540 - 1240 * 0.9, y: 640 - 340 * 0.9 };
const place: Record<string, { x?: number; y?: number; s?: number }> = {
  moon: { s: 0.87, x: 760 - 1520 * 0.87, y: 300 - 220 * 0.87 },
  "mist-far": { s: 0.7, x: -440, y: 300 },
  mountain: MP, "mountain-back": MP, "window-glow": MP,
};
const comp = (ids: string[], W: number, H: number, pl: typeof place) => ({
  width: W, height: H,
  layers: ids.map((id) => baked.get(id)!).sort((a, b) => a.depth - b.depth).map((b) => {
    const q = pl[b.id] ?? {}, s = q.s ?? 1;
    return { id: b.id, src: `/art/${SLUG}/${b.id}.webp`, x: r1(b.x * s + (q.x ?? 0)), y: r1(b.y * s + (q.y ?? 0)), w: r1(b.w * s), h: r1(b.h * s), depth: b.depth };
  }),
});
const bytes = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: comp(dIds, 1920, 1080, {}), portrait: comp(pIds, 1080, 1920, place) }, bytes };
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop");
await composite(SLUG, "portrait");

/* ---------- report ---------- */
console.log("total bytes", bytes, `(${(bytes / 1024).toFixed(1)} KB)`);
for (const l of layers) console.log(` ${l.id.padEnd(16)} d${String(l.depth).padStart(2)} ${String(baked.get(l.id)!.bytes).padStart(7)} B  rect ${[baked.get(l.id)!.x, baked.get(l.id)!.y, baked.get(l.id)!.w, baked.get(l.id)!.h].map(r1).join(",")}`);
for (const [k, W, H] of [["desktop", 1920, 1080], ["portrait", 1080, 1920]] as const) {
  const { data, info } = await sharp(join(ROOT, "art", SLUG, `preview-${k}.png`)).resize(W / 4, H / 4).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, win = k === "desktop" ? [216, 120] : [120, 216];
  let worst = 99, fails = 0;
  for (let y0 = 0; y0 + win[1]! <= h; y0 += 24) for (let x0 = 0; x0 + win[0]! <= w; x0 += 24) {
    const cnt = new Map<number, number>();
    for (let y = y0; y < y0 + win[1]!; y++) for (let x = x0; x < x0 + win[0]!; x++) { const i = (y * w + x) * 3, key = (data[i]! >> 3) << 10 | (data[i + 1]! >> 3) << 5 | (data[i + 2]! >> 3); cnt.set(key, (cnt.get(key) ?? 0) + 1); }
    const n = [...cnt.values()].filter((v) => v > win[0]! * win[1]! * 0.012).length;
    worst = Math.min(worst, n); if (n < 3) fails++;
  }
  let bright = 0, tot = 0;
  const lin = (v: number) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ((k === "desktop" ? D : PT).calm(x * 4, y * 4)) { tot++; const i = (y * w + x) * 3; if (0.2126 * lin(data[i]!) + 0.7152 * lin(data[i + 1]!) + 0.0722 * lin(data[i + 2]!) > 0.11) bright++; }
  console.log(`${k}: D3 windows min distinct fills ${worst}, failing ${fails}; calm-zone px brighter than 0.11 lum: ${(100 * bright / tot).toFixed(2)}%`);
}
console.log("gate rest inner-edge x range (design px): gate-l", vd.restL.map(r1), "gate-r", vd.restR.map(r1), "| portrait l", vp.restL.map(r1), "r", vp.restR.map(r1));
