// b2-first-fold: the mountain face unfolds like origami doors on a warm seam. Run: npx tsx art/b2-first-fold/build.ts
// Per-layer scale/quality (bible s13), so layers are baked with bakeLayer and the manifest is written here in the bakeBeat format.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, arch, bakeLayer, bridge, column, composite, cut, difference, ellipse, fern, glow, layer, mist, mix, offset,
  pine, rect, ridge, rng, roots, ruinWall, scatter, shaft, sheet, stairs, strata, tower, union, vine,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "b2-first-fold";
const P: Palette = {
  "sky-top": "#070d18", sky: "#0b1420", "sky-haze": "#16263a", star: "#cfe0f0", "far-ridge-1": "#4a6788", "far-ridge-2": "#34506e",
  "mid-ridge": "#22384f", "pine-mid": "#1a3346", "mountain-shade": "#1e3349", mountain: "#2c4763", "mountain-lit": "#3d5f80",
  "near-hill": "#132235", "near-dark": "#0d1828", gate: "#08101a", "moon-shade": "#b9cadb", mist: "#9fb8cf", "rim-cool": "#8fb2d4",
  "window-light": "#ffcf8a", shadow: "#03060c",
  "flap-back": "#1f3550", "flap-lit": "#6a5a55", seam: "#ffcf8a", "seam-core": "#fff1cf", "interior-far": "#f6c56b", "interior-mid": "#d98e3a",
  interior: "#b0652a", "interior-near": "#7a3d1c", lamp: "#ffb866",
};
const cm = (a: string, b: string, t: number) => mix(P[a]!, P[b]!, t);
const R = (n: number) => rng(42000 + n);

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
const bnd = (s: Poly | Shape) => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const ring of flat(s)) for (const [x, y] of ring) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1 };
};
const BIG = rect(-5000, -5000, 12000, 12000);
const inter = (a: Poly | Shape, b: Poly | Shape): Shape => difference(a, difference(BIG, b));
const inside = (s: Shape, x: number, y: number) => {
  let c = false;
  for (const ring of s) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!, [xj, yj] = ring[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
/** x-extent of a shape on scanline y. */
const span = (s: Shape, y: number): [number, number] | null => {
  const b = bnd(s); let lo = 1e9, hi = -1e9;
  for (let x = b.x0; x <= b.x1; x += 5) if (inside(s, x, y)) { if (x < lo) lo = x; if (x > hi) hi = x; }
  return hi < lo ? null : [lo, hi];
};
const scaleAbout = (s: Poly | Shape, k: number, c: Pt): Shape => flat(s).map((ring) => ring.map(([x, y]) => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k] as Pt));
const rotRect = (cx: number, cy: number, w: number, h: number, a: number): Poly => {
  const c = Math.cos(a), s = Math.sin(a);
  return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as Pt[]).map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c] as Pt);
};
const interp = (pts: Pt[]) => (x: number) => {
  if (x <= pts[0]![0]) return pts[0]![1];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1]!, b = pts[i]!; if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0] || 1); }
  return pts[pts.length - 1]![1];
};
/** surface y(x) of a ridge/hills polygon (closed down to base: last two points are the base corners). */
const topOf = (poly: Poly) => interp(poly.slice(0, -2));

/** Light context: constant direction toward the moon, or radial from the seam core. */
type Ctx = { dir?: Pt; src?: Pt; rim: string };
const OUT: Ctx = { dir: [0.55, -0.83], rim: "rim-cool" };
const warm = (core: Pt): Ctx => ({ src: core, rim: "seam" });
type PaperOpts = { holes?: (Poly | Shape)[]; rm?: number; opacity?: number; noRim?: boolean; shadow?: false | { dx?: number; dy?: number; blur?: number; opacity?: number }; noInner?: boolean };
function paper(shape: Poly | Shape, fill: string, b: Band, c: Ctx, o: PaperOpts = {}): Frag {
  const bb = bnd(shape);
  let lx = c.dir ? c.dir[0] : c.src![0] - (bb.x0 + bb.x1) / 2, ly = c.dir ? c.dir[1] : c.src![1] - (bb.y0 + bb.y1) / 2;
  const d = Math.hypot(lx, ly) || 1; lx /= d; ly /= d;
  return sheet(shape, fill, {
    holes: o.holes, opacity: o.opacity,
    shadow: o.shadow === false ? false : { color: P.shadow, blur: b.blur, opacity: b.op, dx: -lx * b.off, dy: -ly * b.off, ...o.shadow },
    edge: o.noRim ? undefined : { light: [lx, ly], width: b.rw, color: mix(fill, P[c.rim]!, o.rm ?? b.rm) },
    inner: b.inner && !o.noInner ? { blur: b.inner[0], opacity: b.inner[1], color: P.shadow } : undefined,
  });
}
/** Stacked sheets, each tier = outline inset by i*inset, clipped (so cut edges stay flush), fills[0] outermost. */
function tiers(outline: Shape, clip: Shape, fills: string[], inset: number, b: Band, c: Ctx, o: PaperOpts = {}, clips?: (Shape | null)[]): Frag[] {
  const out: Frag[] = [];
  fills.forEach((f, i) => {
    let s = inter(i ? offset(outline, -inset * i) : outline, clip);
    if (clips?.[i]) s = inter(s, clips[i]!);
    if (!s.length) return;
    const bb: Band = i ? { ...b, off: b.off * 0.4, blur: b.blur * 0.5, op: b.op * 0.8 } : b;
    out.push(paper(s, f, bb, c, o));
  });
  return out;
}
let cid = 0;
const pathOf = (s: Shape) => s.map((p) => "M" + p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z").join("");
/** Clip painted frags to a shape (SVG clipPath). */
function clipFrags(fr: Frag[], s: Shape): Frag[] {
  const b = bnd(s);
  return fr.map((f) => { const id = `cf${cid++}`; return { svg: `<clipPath id="${id}"><path d="${pathOf(s)}" clip-rule="evenodd"/></clipPath><g clip-path="url(#${id})">${f.svg}</g>`, x0: Math.max(f.x0, b.x0), y0: Math.max(f.y0, b.y0), x1: Math.min(f.x1, b.x1), y1: Math.min(f.y1, b.y1) }; });
}
const plain = (shape: Poly | Shape, fill: string, opacity?: number) => sheet(shape, fill, { shadow: false, opacity });

/* ---------- geometry (desktop identity; portrait mapped per b1 shared outline) ---------- */
const OUT_PTS: Pt[] = [[300, 1010], [410, 870], [500, 770], [590, 640], [680, 520], [770, 400], [860, 260], [960, 110], [1050, 250], [1150, 380], [1250, 500], [1350, 630], [1450, 760], [1540, 880], [1620, 1010]];
type G = {
  W: number; H: number; s: string; seamX: number; foldY: number; core: Pt; portrait: boolean; k: number;
  m: (x: number, y: number) => Pt; win: { c: Pt; w: number; h: number }; outline: Shape; calm: Shape; seed: number;
};
const mapP = (x: number, y: number): Pt => [540 + 0.94 * (x - 960), 260 + 1.444 * (y - 110)];
const mkG = (portrait: boolean): G => {
  const m = portrait ? mapP : (x: number, y: number): Pt => [x, y];
  const pts = OUT_PTS.map(([x, y]) => m(x, y));
  const outline: Shape = [cut(pts, rng(portrait ? 1102 : 1101), 2.5, 36)];
  return {
    W: portrait ? 1080 : 1920, H: portrait ? 1920 : 1080, s: portrait ? "-p" : "", seamX: m(960, 0)[0], foldY: m(0, 330)[1],
    core: portrait ? [560, 910] : [1060, 560], portrait, k: portrait ? 1.3 : 1, m, outline, seed: portrait ? 100 : 0,
    win: portrait ? { c: [615, 968], w: 60, h: 86 } : { c: [1040, 600], w: 56, h: 80 },
    // calm region (text): desktop x<820, portrait y>1056
    calm: portrait ? [rect(-500, 1056, 2500, 2000)] : [rect(-500, 160, 1320, 780)],
  };
};

/* ---------- sky ---------- */
function skyLayer(): Layer {
  const r = R(1), W = 1920, H = 1080, out: Frag[] = [];
  out.push(sheet(rect(0, 0, W, H), P["sky-top"]!, { shadow: false }));
  out.push(sheet(cut(rect(-20, 150, W + 40, H - 120), r, 3, 60), P.sky!, { shadow: false }));
  out.push(sheet(cut(rect(-20, 560, W + 40, H - 540), r, 3, 60), cm("sky", "sky-haze", 0.5), { shadow: false }));
  out.push(sheet(cut(rect(-20, 780, W + 40, H - 760), r, 3, 60), P["sky-haze"]!, { shadow: false }));
  const star = (x: number, y: number, s: number): Poly => [[x, y - s], [x + s * 0.6, y], [x, y + s], [x - s * 0.6, y]];
  const reg = [{ x0: 0, y0: 0, x1: 560, y1: 330 }, { x0: 1360, y0: 0, x1: 1920, y1: 360 }];
  [[0.5, 0.45], [0.85, 0.5]].forEach(([op, n], k) => {
    for (const rg of reg) out.push(plain(scatter(r, rg, Math.round(n! * 90 / 1), (x, y) => star(x, y, r.range(1.6, 3)), 18), P.star!, k ? 0.85 : 0.5));
  });
  return layer("sky", 0, ...out);
}

/* ---------- range-far ---------- */
function rangeFar(g: G): Layer {
  const r = R(2 + g.seed), out: Frag[] = [];
  const [y0, y1] = [g.m(0, 770)[1], g.m(0, 860)[1]];
  const mk = (x0: number, x1: number, y: number, amp: number, seed: number) => ridge(r, { x0, x1, y, base: y + 400, amp, seed, step: 38 });
  const left = mk(-100, g.W * 0.62, y0, 90, 21 + g.seed), right = mk(g.W * 0.38, g.W + 100, y0 - 10, 100, 22 + g.seed);
  const left2 = mk(-100, g.W * 0.7, y1, 70, 23 + g.seed), right2 = mk(g.W * 0.3, g.W + 100, y1, 80, 24 + g.seed);
  const f1 = P["far-ridge-1"]!, f2 = P["far-ridge-2"]!;
  const stk = (poly: Poly, fills: string[]) => tiers(union(poly), [BIG], fills, 5, B.far, OUT, { noInner: true });
  out.push(...stk(right, [cm("far-ridge-1", "far-ridge-2", 0.5), f1]), ...stk(left, [cm("far-ridge-2", "mid-ridge", 0.4), f2]));
  out.push(...stk(right2, [cm("far-ridge-1", "far-ridge-2", 0.8), cm("far-ridge-2", "far-ridge-1", 0.25)]), ...stk(left2, [P["mid-ridge"]!, cm("far-ridge-2", "mid-ridge", 0.5)]));
  const tl = topOf(left2), tr = topOf(right2), pl = topOf(left), pr = topOf(right);
  const pinesL: Shape[] = [], pinesR: Shape[] = [], pinesFar: Shape[] = [];
  for (let i = 0; i < 24; i++) { const x = r.range(-60, g.W * 0.64); pinesL.push(pine(r, x, tl(x) + 6, r.range(16, 30))); }
  for (let i = 0; i < 20; i++) { const x = r.range(g.W * 0.4, g.W + 60); pinesR.push(pine(r, x, tr(x) + 6, r.range(16, 30))); }
  for (let i = 0; i < 20; i++) { const x = r.range(-60, g.W + 60); pinesFar.push(pine(r, x, (x < g.W * 0.5 ? pl(x) : pr(x)) + 5, r.range(11, 20))); }
  out.push(plain(union(...pinesFar), P["mid-ridge"]!), plain(union(...pinesL), P["pine-mid"]!), plain(union(...pinesR), cm("pine-mid", "far-ridge-2", 0.35)));
  const tws = [tower(r, g.W * 0.13, tl(g.W * 0.13) + 4, 9, 22, { windows: 1 }), tower(r, g.W * 0.9, tr(g.W * 0.9) + 4, 9, 24, { windows: 1 }), tower(r, g.W * 0.07, pl(g.W * 0.07) + 4, 8, 20, { windows: 1 })];
  out.push(paper(union(...tws.map((t) => t.body)), P["pine-mid"]!, B.far, OUT, { holes: tws.flatMap((t) => t.holes), rm: 0.25 }));
  return layer("range-far" + g.s, 1, ...out);
}

/* ---------- pieces of the mountain ---------- */
function pieces(g: G) {
  const o = g.outline;
  const top = inter(o, rect(-900, -900, 4000, g.foldY + 900));
  const below = inter(o, rect(-900, g.foldY, 4000, 4000));
  const left = inter(below, rect(-900, -900, g.seamX - 2.5 + 900, 5000));
  const right = inter(below, rect(g.seamX + 2.5, -900, 4000, 5000));
  return { top, left, right, clipTop: [rect(-900, -900, 4000, g.foldY + 900)] as Shape, clipL: [rect(-900, g.foldY, g.seamX - 2.5 + 900, 5000)] as Shape, clipR: [rect(g.seamX + 2.5, g.foldY, 4000, 5000)] as Shape };
}

/* ---------- flap detail ---------- */
type Tones = { tiers: string[]; bA: string; bB: string; struct: string; dark: string; veg: string; ledge: string; rm: number };
const TCALM: Tones = {
  tiers: [P["mid-ridge"]!, P["mountain-shade"]!, cm("mountain-shade", "mountain", 0.3), cm("mountain-shade", "mountain", 0.6)],
  bA: cm("mountain-shade", "mid-ridge", 0.4), bB: cm("mountain-shade", "mountain", 0.7), struct: cm("mountain-shade", "near-dark", 0.45),
  dark: P["near-dark"]!, veg: P["pine-mid"]!, ledge: cm("mid-ridge", "near-dark", 0.35), rm: 0.25,
};
const TLIT: Tones = {
  tiers: [P.mountain!, cm("mountain", "mountain-lit", 0.35), cm("mountain", "mountain-lit", 0.7), P["mountain-lit"]!],
  bA: cm("mountain", "mountain-lit", 0.15), bB: cm("mountain", "mountain-lit", 0.7), struct: cm("mountain", "near-dark", 0.55),
  dark: cm("mountain-shade", "near-dark", 0.6), veg: cm("pine-mid", "mountain-shade", 0.4), ledge: cm("mountain", "mountain-shade", 0.5), rm: 0.5,
};
type DOpts = { bands: number; wins: number; litWins: number; towers: number; water: boolean; crevasse: boolean; zig: boolean; ledges: number[]; avoid?: { x: number; y: number; rx: number; ry: number }; yMax?: number };
function flapDetail(g: G, r: Rng, inner: Shape, T: Tones, o: DOpts): Frag[] {
  const bb = bnd(inner), out: Frag[] = [], k = g.k;
  const yMax = o.yMax ?? bb.y1, hgt = bb.y1 - bb.y0;
  const free = (x: number, y: number, pad = 0) => inside(inner, x, y) && !(o.avoid && Math.abs(x - o.avoid.x) < o.avoid.rx + pad && Math.abs(y - o.avoid.y) < o.avoid.ry + pad);
  const light = T === TLIT;
  // strata bands
  const bands = strata(r, { x0: bb.x0 - 30, x1: bb.x1 + 30, y: bb.y0 + hgt * 0.06, base: bb.y1 + 50, bands: o.bands });
  bands.forEach((s, i) => out.push(paper(inter(s, inner), mix(T.bA, T.bB, o.bands > 1 ? i / (o.bands - 1) : 0), B.mid, OUT, { rm: T.rm, noInner: true, shadow: { dx: 0, dy: 6, blur: 8, opacity: 0.3 } })));
  // windows (dark 4x6, some lit)
  const win: Poly[] = [], winLit: Poly[] = [];
  for (let i = 0, tries = 0; i < o.wins + o.litWins && tries < 3000; tries++) {
    const x = r.range(bb.x0, bb.x1), y = r.range(bb.y0 + 30, yMax - 20);
    if (!free(x, y, 8)) continue;
    (i < o.litWins ? winLit : win).push(arch(r, x, y, r.range(4, 5.5), r.range(6, 8), 0.2)); i++;
  }
  // terraces + structures
  const veg: Shape[] = [], hang: Shape[] = [], struct: Shape[] = [], strHoles: Poly[] = [], ledgeS: Poly[] = [], stair: Poly[] = [];
  const ledgeInfo: { y: number; a: number; b: number }[] = [];
  o.ledges.forEach((fy, li) => {
    const y = bb.y0 + hgt * fy, sp = span(inner, y);
    if (!sp || y > yMax) return;
    const a = sp[0] + 10, b = sp[1] - 10;
    if (b - a < 80) return;
    ledgeInfo.push({ y, a, b });
    ledgeS.push(cut(rect(a, y, b - a, r.range(12, 18)), r, 1.5, 34));
    let x = a + r.range(6, 30);
    while (x < b - 30) {
      const t = r(), h0 = r.range(34, 96) * (k > 1 ? 0.9 : 1);
      const clear = (hh: number, ww: number) => free(x, y - hh, 4) && free(x + ww, y - hh, 4) && free(x + ww, y - 4, 4);
      if (t < 0.28) { const tw = h0 * 0.36 + 10; if (clear(h0, tw)) { const T2 = tower(r, x + tw / 2, y + 2, tw, h0, { windows: r.int(2, 3) }); struct.push(T2.body); strHoles.push(...T2.holes); } x += tw + r.range(10, 40); }
      else if (t < 0.5) { const ww = r.range(60, 130); if (clear(46, ww)) { const W2 = ruinWall(r, x, y + 2, ww, r.range(26, 46)); struct.push(W2.body); strHoles.push(...W2.holes); } x += ww + r.range(10, 40); }
      else if (t < 0.8) { for (let q = 0; q < r.int(2, 4); q++) { const hh = r.range(24, 50); if (free(x, y - hh, 4)) veg.push(pine(r, x, y + 1, hh)); x += r.range(8, 16); } x += r.range(10, 30); }
      else { if (free(x, y - 26, 2)) veg.push(fern(r, x, y + 1, r.range(18, 32), r.range(-0.6, 0.6))); x += r.range(16, 40); }
    }
    for (let q = 0; q < 2 + (li % 2); q++) { const vx = r.range(a + 10, b - 10), vl = r.range(40, 90); if (free(vx, y + vl, 4)) hang.push(vine(r, vx, y + 12, vl, 9)); }
  });
  // window rows under each ledge (4-6 px, framed)
  const rowW: Poly[] = [], rowF: Poly[] = [];
  ledgeInfo.forEach((lg, i) => {
    const nextY = ledgeInfo[i + 1]?.y ?? Math.min(yMax, bb.y1);
    for (const dy of [36, 62, 88]) {
      const y = lg.y + dy; if (y > nextY - 22 || y > yMax - 10) continue;
      for (let x = lg.a + 8; x < lg.b - 8; x += r.range(13, 42)) {
        if (r() < 0.3 || !free(x, y, 6)) continue;
        const w = r.range(4, 6.5), h = w * r.range(1.4, 1.9);
        rowW.push(arch(r, x, y, w, h, 0.2)); rowF.push(arch(r, x, y + 1.5, w + 3.5, h + 3, 0.2));
      }
    }
  });
  // zigzag ruined stairs (tread 5 px)
  if (o.zig && ledgeInfo.length >= 2) {
    const l0 = ledgeInfo[0]!, l1 = ledgeInfo[ledgeInfo.length - 1]!;
    const flights = Math.max(4, Math.round((l1.y - l0.y) / 62)), fh = (l1.y - l0.y) / flights;
    const cx = (l0.a + l0.b) / 2 + r.range(-40, 40);
    for (let i = 0; i < flights; i++) {
      const w = 76 * r.vary(0.1), dir = i % 2 ? -1 : 1, x0 = cx - w / 2 + r.range(-6, 6), y = l0.y + 14 + i * fh;
      if (free(x0, y, 4) && free(x0 + w, y + fh, 4)) stair.push(stairs(x0, y, w, fh * 0.8, Math.round(w / 5), dir as 1 | -1));
    }
  }
  const wf = (a: Poly[], fill: string, rm = T.rm) => a.length && out.push(paper(union(...a), fill, B.mid, OUT, { rm, holes: [] }));
  wf(ledgeS, T.ledge);
  out.push(plain(union(...rowF), cm(light ? "mountain" : "mountain-shade", "near-dark", 0.3)), plain(union(...rowW), T.dark));
  out.push(plain(union(...win.slice(0)), T.dark));
  if (winLit.length) out.push(plain(union(...winLit), P["window-light"]!));
  if (stair.length) out.push(paper(union(...stair), T.dark, B.mid, OUT, { rm: T.rm, noInner: true }));
  if (struct.length) out.push(paper(union(...struct), T.struct, B.mid, OUT, { holes: strHoles, rm: T.rm }));
  out.push(plain(union(...veg, ...hang), T.veg));
  // waterfall: 3 mist strands (right face)
  if (o.water && ledgeInfo.length) {
    const lg = ledgeInfo[Math.min(1, ledgeInfo.length - 1)]!;
    const strands: Shape[] = [];
    [0.3, 0.45, 0.6].forEach((f, i) => {
      const x = lg.a + (lg.b - lg.a) * f, y0 = lg.y + 14, len = Math.min(r.range(170, 260), yMax - y0 - 10), w = 14 - i * 2;
      const body = cut([[x - w / 2, y0], [x + w / 2, y0], [x + w * 0.9, y0 + len], [x - w * 0.9, y0 + len]], r, 0.8, 30);
      strands.push(difference(body, ...[0.2, 0.45, 0.7].map((t) => rect(x - 1.5, y0 + len * t, 3, 16))));
    });
    out.push(plain(union(...strands), P.mist!, 0.4));
  }
  // crevasse + bridge (right face)
  if (o.crevasse) {
    const [x0, y] = g.m(1180, 720), [x1] = g.m(1320, 720);
    const cx = (x0 + x1) / 2;
    const cr = cut([[x0 + 26, y + 6], [x1 - 26, y + 6], [cx + 16, y + 70], [cx + 5, y + 170], [cx - 12, y + 90]], r, 1.5, 24);
    out.push(paper(cr, T.dark, B.mid, OUT, { rm: 0.15, noInner: false }));
    out.push(paper(bridge(r, x0, x1, y, 8, 5), T.struct, B.mid, OUT, { rm: T.rm }));
    const t1 = tower(r, x0 - 4, y + 2, 26, 70, { windows: 2 });
    out.push(paper(t1.body, T.struct, B.mid, OUT, { holes: t1.holes, rm: T.rm }));
  }
  // chimes: ruined towers on ledges
  for (let i = 0; i < o.towers && ledgeInfo.length; i++) {
    const lg = ledgeInfo[(i * 2 + 1) % ledgeInfo.length]!, x = lg.a + (lg.b - lg.a) * (0.25 + 0.4 * i), h = r.range(60, 120);
    if (!free(x, lg.y - h, 3)) continue;
    const t = tower(r, x, lg.y + 2, h * 0.4 + 10, h, { windows: 3 });
    out.push(paper(t.body, T.struct, B.mid, OUT, { holes: t.holes, rm: T.rm }));
  }
  return out;
}

/* ---------- flaps and top ---------- */
function windowParts(g: G, r: Rng) {
  const { c, w, h } = g.win;
  const hole = arch(r, c[0], c[1] + h / 2, w, h, 0.4);
  const back = [
    plain(arch(r, c[0], c[1] + h / 2 + 5, w + 14, h + 10, 0.3), P["window-light"]!),
    plain(union(rect(c[0] - 1.5, c[1] - h * 0.3, 3, h), rect(c[0] - w / 2, c[1] + 4, w, 3)), cm("near-dark", "window-light", 0.2)),
  ];
  return { hole, back, avoid: { x: c[0], y: c[1], rx: w / 2 + 12, ry: h / 2 + 14 } };
}
const FSH = { blur: 7, opacity: 0.3 };
function flapL(g: G): Layer {
  const r = R(10 + g.seed), pc = pieces(g), inner = offset(pc.left, -30);
  const out = tiers(g.outline, pc.clipL, TCALM.tiers, 14, B.hero, OUT, { rm: TCALM.rm, shadow: FSH });
  out.push(...flapDetail(g, r, inner, TCALM, { bands: Math.round(7), wins: Math.round(18 * g.k), litWins: 0, towers: 1, water: false, crevasse: false, zig: true, ledges: [0.1, 0.27, 0.44, 0.61, 0.78] }));
  return layer("flap-l" + g.s, 9, ...out);
}
function flapR(g: G): Layer {
  const r = R(11 + g.seed), pc = pieces(g), W = windowParts(g, r);
  const out: Frag[] = [...W.back];
  const clipHi = g.portrait ? ([rect(-900, -900, 4000, 1010 + 900)] as Shape) : undefined;
  const calmish = g.portrait; // portrait: below y 1056 only calm tones
  const T = calmish ? TCALM : TLIT;
  const win = offset(W.hole, 8);
  const inner = difference(offset(pc.right, -30), win);
  out.push(...tiers(g.outline, pc.clipR, T.tiers, 14, B.hero, OUT, { rm: T.rm, holes: [W.hole], shadow: FSH }));
  out.push(...flapDetail(g, r, inner, T, { bands: 8, wins: Math.round(23 * g.k), litWins: g.portrait ? 0 : 3, towers: 2, water: !g.portrait, crevasse: !g.portrait, zig: false, ledges: [0.1, 0.27, 0.44, 0.61, 0.78], avoid: W.avoid, yMax: g.portrait ? 1040 : undefined }));
  if (g.portrait) {
    // lit tiers and detail above y 1010 only (calm tokens below)
    const upper = inter(pc.right, clipHi!);
    out.push(...tiers(g.outline, upper, TLIT.tiers.slice(1), 14, B.hero, OUT, { rm: TLIT.rm, holes: [W.hole], shadow: FSH }, undefined));
    out.push(...flapDetail(g, R(12 + g.seed), inter(inner, clipHi!), TLIT, { bands: 5, wins: 12, litWins: 3, towers: 1, water: true, crevasse: true, zig: false, ledges: [0.3, 0.6], avoid: W.avoid, yMax: 1000 }));
  }
  return layer("flap-r" + g.s, 10, ...out);
}
function flapTop(g: G): Layer {
  const r = R(13 + g.seed), pc = pieces(g), inner = offset(pc.top, -22);
  const tone = TLIT;
  const fills = [P.mountain!, P["mountain-lit"]!, cm("mountain-lit", "moon-shade", 0.6)];
  const capClip: Shape = [rect(g.seamX - 30, -900, 4000, 5000)];
  const out = tiers(g.outline, pc.clipTop, fills, 12, B.hero, OUT, { rm: 0.5, shadow: FSH }, [null, null, capClip]);
  out.push(...flapDetail(g, r, inner, tone, { bands: 4, wins: 9, litWins: 1, towers: 0, water: false, crevasse: false, zig: false, ledges: [0.4, 0.75], yMax: g.foldY - 14 }));
  return layer("flap-top" + g.s, 11, ...out);
}

/* ---------- flap backs (reverse side, seen at the hinge) ---------- */
function flapBack(g: G, side: -1 | 1): Layer {
  const r = R((side < 0 ? 20 : 21) + g.seed), pc = pieces(g);
  const half = side < 0 ? pc.left : pc.right;
  const w = g.portrait ? 200 : 235;
  const shift = (s: Shape, dx: number): Shape => s.map((ring) => ring.map(([x, y]) => [x + dx, y] as Pt));
  const band = (d: number): Shape => difference(half, shift(half, -side * d));
  const fills = [P["flap-back"]!, cm("flap-back", "flap-lit", side < 0 ? 0.3 : 0.4), P["flap-back"]!, cm("flap-back", "flap-lit", side < 0 ? 0.3 : 0.4)];
  const out: Frag[] = [];
  const sh = { dx: 0, dy: 0, blur: 8, opacity: 0.3 };
  [1, 0.76, 0.52, 0.28].forEach((f, i) => out.push(paper(band(w * f), fills[i]!, B.far, OUT, { rm: side < 0 ? 0.25 : 0.4, shadow: { ...sh, dx: side * -4 } })));
  // fold-rib slits on the widest strip
  const outerBand = band(w), bb = bnd(outerBand), slits: Poly[] = [];
  for (let i = 0, tries = 0; i < 60 && tries < 900; tries++) {
    const y = r.range(bb.y0 + 20, bb.y1 - 20), sp = span(outerBand, y);
    if (!sp || sp[1] - sp[0] < 40) continue;
    const x = r.range(sp[0] + 12, sp[1] - 12);
    if (inside(outerBand, x, y)) { slits.push(cut(rect(x, y, 3.5, r.range(9, 20)), r, 0.3, 10)); i++; }
  }
  out.push(plain(union(...slits), cm("flap-back", "near-dark", 0.55)));
  return layer((side < 0 ? "flap-l-back" : "flap-r-back") + g.s, side < 0 ? 7 : 8, ...out);
}

/* ---------- interior ---------- */
function interiorFar(g: G): Layer {
  const r = R(30 + g.seed), C = g.core, ctx = warm(C), out: Frag[] = [], O = g.outline;
  const bb = bnd(O);
  const fills = [P["interior-near"]!, P.interior!, P["interior-mid"]!, P["interior-far"]!, P["seam-core"]!];
  const ks = [1, 0.8, 0.6, 0.42, 0.26];
  const clipFor = (i: number): Shape => g.portrait ? [cut(rect(-300, -300, 2000, 1044 + 300 - i * 22), r, 3, 30)] : [cut(rect(868 + i * 22, -300, 3000, 2000), r, 3, 30)];
  // calm side: dark tone-on-tone strata + tiny arches (tier 0 region) before the lit tiers
  const calmRegion = g.portrait ? [rect(-300, 990, 2000, 1500)] : [rect(-300, -300, 1180 + 300, 2000)];
  out.push(paper(O, fills[0]!, B.mid, ctx, { rm: 0.25 }));
  const st = strata(r, { x0: bb.x0, x1: bb.x1, y: g.portrait ? 1000 : bb.y0 + 80, base: bb.y1 + 20, bands: g.portrait ? 6 : 5 });
  const calmBand = [cm("interior-near", "near-dark", 0.18), cm("interior-near", "near-dark", 0.36), cm("interior-near", "near-dark", 0.5), cm("interior-near", "near-dark", 0.62), cm("interior-near", "near-dark", 0.72), cm("interior-near", "near-dark", 0.8)];
  st.forEach((s, i) => out.push(paper(inter(inter(s, O), calmRegion), calmBand[i]!, B.far, ctx, { rm: 0.2, noInner: true })));
  const tinyD: Poly[] = [];
  for (let i = 0, tries = 0; i < 70 && tries < 3000; tries++) {
    const x = r.range(bb.x0, bb.x1), y = r.range(bb.y0 + 60, bb.y1 - 10);
    if (!inside(inter(O, calmRegion), x, y)) continue;
    const w = r.range(4, 9); tinyD.push(arch(r, x, y, w, w * 1.6, 0.2)); i++;
  }
  out.push(plain(union(...tinyD), cm("interior-near", "near-dark", 0.9)));
  // tunnel tiers
  const tshape = ks.map((k) => scaleAbout(O, k, C));
  const holeRows = (sh: Shape, rows: number, w0: number): Poly[] => {
    const b = bnd(sh), hs: Poly[] = [];
    for (let rr = 0; rr < rows; rr++) {
      const y = b.y0 + (b.y1 - b.y0) * (0.35 + 0.17 * rr), sp = span(sh, y);
      if (!sp) continue;
      for (let x = sp[0] + 24; x < sp[1] - 24; x += r.range(26, 38)) { const w = r.range(w0, w0 + 7); if (inside(sh, x, y - w) && inside(sh, x + w / 2, y)) hs.push(arch(r, x, y, w, w * 1.5, 0.2)); }
    }
    return hs;
  };
  for (let i = 1; i < 5; i++) {
    const s = inter(tshape[i]!, clipFor(i));
    if (!s.length) continue;
    const b: Band = { ...B.mid, off: 6, blur: 8, op: 0.3 };
    const holes = i === 3 ? holeRows(s, 3, 12) : i === 2 ? holeRows(s, 2, 10) : i === 1 ? holeRows(s, 2, 9) : [];
    out.push(paper(s, fills[i]!, b, ctx, { rm: 0.35, holes, noInner: i === 4 }));
  }
  return layer("interior-far" + g.s, 2, ...out);
}

function arcade(r: Rng, g: G, cx: number, baseY: number, aw: number, ah: number, n: number, wallH: number, fills: string[], rowN: number, out: Frag[]) {
  const pitch = aw * 1.25, x0 = cx - (n * pitch) / 2, x1 = cx + (n * pitch) / 2;
  const holes = Array.from({ length: n }, (_, i) => arch(r, x0 + pitch * (i + 0.5), baseY, aw, ah, 0.6));
  const cren = Array.from({ length: Math.floor((x1 - x0) / 22) }, (_, i) => rect(x0 + i * 22 + 5, baseY - wallH - 8, 11, 9));
  const wall = union(cut(rect(x0, baseY - wallH, x1 - x0, wallH), r, 1.2, 36), ...cren);
  const tiny: Poly[] = [];
  for (let q = 0; q < rowN; q++) { // tiny arch rows 12-20 px on the wall face above the arches
    const y = baseY - wallH + 16 + (q % 2) * 14;
    for (let x = x0 + 10; x < x1 - 14; x += r.range(20, 30)) { const w = r.range(12, 16); if (holes.every((h) => { const hb = bnd(h); return x + w < hb.x0 - 4 || x > hb.x1 + 4 || y + w * 1.5 > hb.y1 || y > baseY - ah - 6 ? true : false; }) && y + w * 1.5 < baseY - ah - 8) tiny.push(arch(r, x, y + w * 1.5, w, w * 1.5, 0.2)); }
  }
  const shape = difference(wall, ...holes, ...tiny);
  out.push(...tiers(union(shape), [BIG], fills, 5, B.mid, warm(g.core), { rm: 0.3 }));
}
function interiorArches(g: G): Layer {
  const r = R(40 + g.seed), out: Frag[] = [], C = g.core;
  const f1 = [P["interior-mid"]!, cm("interior-mid", "interior-far", 0.35), cm("interior-mid", "interior-far", 0.7)];
  const f2 = [P.interior!, cm("interior", "interior-mid", 0.4), cm("interior", "interior-mid", 0.8)];
  const f3 = [P["interior-near"]!, P.interior!, cm("interior", "interior-mid", 0.3)];
  if (!g.portrait) {
    arcade(r, g, 1060, 600, 60, 90, 5, 120, f1, 1, out);
    arcade(r, g, 1060, 780, 110, 110, 3, 150, f2, 2, out);
    const br = bridge(r, 830, 1360, 700, 7, 9);
    const t1 = tower(r, 1130, 628, 12, 38, { windows: 1 }), t2 = tower(r, 960, 632, 11, 32, { windows: 1 });
    const st = [stairs(1230, 668, 46, 26, 10, 1), stairs(900, 600, 40, 24, 8, -1)];
    out.push(paper(union(br, t1.body, t2.body, ...st), P["interior-near"]!, B.mid, warm(C), { holes: [...t1.holes, ...t2.holes], rm: 0.3 }));
    arcade(r, g, 1060, 960, 180, 140, 3, 160, f3, 2, out);
  } else {
    arcade(r, g, 560, 600, 60, 90, 6, 120, f1, 1, out);
    arcade(r, g, 560, 800, 110, 150, 4, 190, f2, 2, out);
    const br = bridge(r, 300, 840, 720, 7, 9);
    const t1 = tower(r, 610, 648, 12, 38, { windows: 1 }), t2 = tower(r, 420, 652, 11, 32, { windows: 1 });
    out.push(paper(union(br, t1.body, t2.body, stairs(700, 690, 46, 26, 10, 1)), P["interior-near"]!, B.mid, warm(C), { holes: [...t1.holes, ...t2.holes], rm: 0.3 }));
    arcade(r, g, 560, 1000, 180, 150, 3, 190, f3, 2, out);
  }
  // clip the whole layer left of the calm zone / below the calm line: done by cutting sheets with a jagged clip
  const reg: Shape = g.portrait ? [rect(-300, -300, 2000, 1040 + 300)] : [cut(rect(868, -300, 3000, 2000), r, 3, 30)];
  return layer("interior-arches" + g.s, 3, ...clipFrags(out, inter(g.outline, reg)));
}

function interiorNear(g: G): Layer {
  const r = R(50 + g.seed), C = g.core, ctx = warm(C), O = g.outline, out: Frag[] = [];
  const in1 = offset(O, -78), in2 = offset(O, -64);
  const c1 = [cut(in1[0]!, r, 7, 26)] as Shape;
  const ring = difference(O, c1);
  out.push(paper(ring, P["interior-near"]!, B.near, ctx, { rm: 0.25 }));
  const ring2 = difference(offset(O, -16), [cut(in2[0]!, r, 6, 24)]);
  const clip: Shape = g.portrait ? [rect(-300, -300, 2000, 1030 + 300)] : [rect(868, -300, 3000, 2000)];
  const r2 = inter(ring2, clip);
  if (r2.length) out.push(paper(r2, cm("interior-near", "interior", 0.25), B.mid, ctx, { rm: 0.3 }));
  const veg: Shape[] = [], cp = c1[0]!;
  const yLimit = g.core[1] + (g.portrait ? 180 : 260);
  for (let i = 0; i < cp.length; i += 3) {
    const [x, y] = cp[i]!;
    if (y > yLimit || y < g.foldY - 120) continue;
    veg.push(r() < 0.5 ? roots(r, x, y - 4, 22, r.range(50, 130), 3, 1) : vine(r, x, y - 4, r.range(60, 150), 10));
  }
  out.push(plain(union(...veg), P["interior-near"]!));
  const ferns: Shape[] = [];
  for (let i = 0; i < cp.length; i += 5) { const [x, y] = cp[i]!; if (y > yLimit + 60) ferns.push(fern(r, x, y + 4, r.range(20, 40), r.range(-0.5, 0.5))); }
  out.push(plain(union(...ferns), cm("interior-near", "near-dark", 0.4)));
  return layer("interior-near" + g.s, 4, ...out);
}

/* ---------- seam light and glow ---------- */
function seamLight(g: G): Layer {
  const r = R(60 + g.seed), x = g.seamX, out: Frag[] = [];
  const y0 = g.m(0, 150)[1], y1 = g.m(0, 1000)[1];
  out.push(sheet(cut([[x - 20, y0], [x + 20, y0], [x + 20, y1], [x - 20, y1]], r, 1.2, 40), P.seam!, { shadow: false, opacity: 0.9 }));
  out.push(plain(cut([[x - 1.5, y0 - 40], [x + 1.5, y0 - 40], [x + 1.5, y1 + 30], [x - 1.5, y1 + 30]], r, 0.5, 30), P["seam-core"]!));
  const ang = g.portrait ? [-14, 4, 16, 28] : [-14, 6, 17, 27], ops = [0.2, 0.25, 0.22, 0.25], len = g.portrait ? 520 : 560;
  ang.forEach((a, i) => out.push(shaft(g.core[0], g.core[1], 24, 130, len, a, P.seam!, ops[i]!)));
  return layer("seam-light" + g.s, 5, ...out);
}
const seamGlow = () => layer("seam-glow", 6, glow(1060, 560, 420, P.lamp!, { opacity: 0.6, core: P["seam-core"]! }));

/* ---------- ground ---------- */
function ground(g: G): Layer {
  const r = R(70 + g.seed), out: Frag[] = [], H0 = g.m(0, 975)[1];
  const hill = ridge(r, { x0: -100, x1: g.W + 100, y: H0, base: H0 + 400, amp: 60, seed: 71 + g.seed, peaky: false, step: 70 });
  const hill2 = ridge(r, { x0: -100, x1: g.W + 100, y: H0 + 42, base: H0 + 400, amp: 40, seed: 72 + g.seed, peaky: false, step: 60 });
  const t1 = topOf(hill), t2 = topOf(hill2);
  out.push(...tiers(union(hill), [BIG], [P["near-hill"]!, cm("near-hill", "pine-mid", 0.4)], 6, B.near, OUT, { rm: 0.25 }));
  const pBack: Shape[] = [], pFront: Shape[] = [];
  for (let i = 0; i < 26; i++) { const x = r.range(-40, g.W + 40); pBack.push(pine(r, x, t1(x) + 8, r.range(56, 120))); }
  out.push(paper(union(...pBack), P["pine-mid"]!, B.mid, OUT, { rm: 0.25 }));
  out.push(paper(hill2, P["near-dark"]!, B.near, OUT, { rm: 0.25 }));
  for (let i = 0; i < 18; i++) { const x = r.range(-40, g.W + 40); pFront.push(pine(r, x, t2(x) + 10, r.range(70, 150))); }
  // ruined stair foot at the seam and a small ruin wall with 2 holes
  const sx = g.seamX - 130, stairP = stairs(sx + 60, t2(g.seamX) - 44, 150, 60, 28, 1);
  const rw = ruinWall(r, g.seamX + 250, t2(g.seamX + 300) + 4, 150, 52);
  const hole2 = rect(g.seamX + 250 + 100, t2(g.seamX + 300) - 30, 12, 14);
  out.push(paper(union(...pFront), P["near-dark"]!, B.near, OUT, { rm: 0.25 }));
  out.push(paper(union(stairP, rw.body), cm("near-dark", "pine-mid", 0.35), B.mid, OUT, { rm: 0.25, holes: [...rw.holes, hole2] }));
  return layer("ground" + g.s, 12, ...out);
}

/* ---------- mist and motes ---------- */
function mistLayer(g: G): Layer {
  const r = R(80 + g.seed), out: Frag[] = [];
  const yb = g.m(0, 900)[1];
  if (!g.portrait) {
    out.push(mist(430, yb, 1100, 150, P.mist!, 0.08), mist(1330, yb, 1400, 170, P.mist!, 0.25), mist(1100, yb - 130, 1000, 110, P.mist!, 0.18));
  } else {
    out.push(mist(540, 1230, 1300, 170, P.mist!, 0.07), mist(540, 780, 900, 130, P.mist!, 0.2), mist(540, 1010, 1100, 120, P.mist!, 0.07));
  }
  const rg = g.portrait ? { x0: 330, y0: 600, x1: 800, y1: 1010 } : { x0: 900, y0: 300, x1: 1400, y1: 900 };
  [[0.4, 40], [0.65, 40], [0.8, 30]].forEach(([op, n]) => out.push(plain(scatter(r, rg, n!, (x, y) => ellipse(x, y, r.range(1.6, 3.4), r.range(1.6, 3.4), 6), 14), P.seam!, op)));
  return layer("mist" + g.s, 13, ...out);
}

/* ---------- gates ---------- */
type Seg = { a: number; b: number; p: number };
function phaseSegs(r: Rng, lo: number, hi: number, holdMin: number, holdMax: number): Seg[] {
  const out: Seg[] = []; let y = lo, p = r() < 0.5 ? 0 : 1;
  while (y < hi) {
    out.push({ a: y, b: Math.min(hi, y + r.range(holdMin, holdMax)), p }); y = out[out.length - 1]!.b;
    if (y >= hi) break;
    const q = 1 - p;
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
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!, b = poly[(i + 1) % poly.length]!;
    if ((a[1] <= c && b[1] > c) || (b[1] <= c && a[1] > c)) out.push(a[0] + ((b[0] - a[0]) * (c - a[1])) / (b[1] - a[1]));
  }
  return out;
};
function gates(g: G) {
  const P_ = g.portrait, H = g.H, rl = R(90 + g.seed), rr = R(91 + g.seed), rs = R(92 + g.seed);
  const segs = phaseSegs(rs, -60, H + 60, 110, 200);
  const lo = P_ ? 110 : 180, amp = P_ ? 90 : 100, off = P_ ? 770 : 1305, bleedL = P_ ? -560 : -800, bleedR = P_ ? 1640 : 2720, shift = P_ ? 460 : 700;
  const xl = (p: number) => lo + amp * p, xr = (p: number) => xl(p) + off;
  const pl = edgePts(rl, segs, xl), pr = edgePts(rr, segs, xr);
  const polyL: Poly = [[bleedL, -60], ...pl.map(([v, u]) => [v, u] as Pt), [bleedL, H + 60]];
  const polyR: Poly = [[bleedR, -60], ...pr.map(([v, u]) => [v, u] as Pt), [bleedR, H + 60]];
  let minOv = 1e9;
  for (let y = -60; y < H + 60; y += 0.5) minOv = Math.min(minOv, Math.max(...crossY(polyL, y + 0.25)) + shift - (Math.min(...crossY(polyR, y + 0.25)) - shift));
  const build = (poly: Poly, right: boolean, pts: Pt[], fills: string[], rm: number, rs2: number): Frag[] => {
    const r = R(rs2 + g.seed), nx = right ? -1 : 1, edge: Shape[] = [];
    const vOf = right ? xr : xl;
    segs.forEach((s, i) => {
      const nxt = segs[i + 1]; if (!nxt) return;
      const va = vOf(s.p), vb = vOf(nxt.p), u = s.b, cx = (va + vb) / 2, up = right ? vb < va : vb > va;
      if (up) { const t = r(); edge.push(t < 0.3 ? fern(r, cx, u, r.range(24, 44), nx * r.range(0.3, 0.9)) : t < 0.55 ? column(r, cx, u, 14, r.range(28, 54), true) : t < 0.8 ? pine(r, cx, u, r.range(36, 60)) : (() => { const q = ruinWall(r, cx - 24, u + 1, 48, 34); return difference(q.body, ...q.holes); })()); }
      else edge.push(roots(r, cx, u - 2, 20, r.range(50, 120), 3, 1), vine(r, cx, u - 2, r.range(40, 100), 8));
    });
    for (let i = 0; i < pts.length; i += 2) {
      const [v, u] = pts[i]!, t = r();
      if (t < 0.5) edge.push(vine(r, v - nx * 3, u, r.range(50, 130), 10)); else if (t < 0.75) edge.push(roots(r, v - nx * 4, u, 14, r.range(40, 100), 3, 1)); else edge.push(fern(r, v - nx * 4, u, r.range(26, 52), nx * r.range(0.4, 1)));
    }
    const body = union(poly, ...edge);
    const out = tiers(body, [BIG], fills, 16, B.gate, OUT, { rm });
    // full-body tone-on-tone detail (gate fills the screen when shut)
    const xa = right ? Math.min(...pts.map((p) => p[0])) - 10 : bleedL, xb = right ? bleedR : Math.max(...pts.map((p) => p[0])) + 10;
    const inner = offset(poly, -34);
    const tone = (t: number) => mix(fills[0]!, fills[1]!, t);
    const nb = P_ ? 14 : 11;
    strata(r, { x0: xa, x1: xb, y: -40, base: H + 60, bands: nb }).forEach((s, i) => out.push(paper(inter(s, inner), tone(0.2 + 0.5 * ((i * 5) % 7) / 7), B.mid, OUT, { rm: 0.2, noInner: true, shadow: { dx: 0, dy: 8, blur: 10, opacity: 0.35 } })));
    const walls: Shape[] = [], wh: Poly[] = [];
    for (let i = 1; i < nb; i++) {
      const by = -40 + ((H + 100) * i) / nb * 0.9 + 20;
      for (let x = xa + r.range(0, 60); x < xb - 120; x += r.range(150, 260)) { const q = ruinWall(r, x, by, r.range(110, 190), r.range(34, 70)); walls.push(q.body); wh.push(...q.holes); }
    }
    out.push(paper(inter(union(...walls), inner), cm("gate", "near-dark", 0.55), B.mid, OUT, { holes: wh, rm: 0.2, noInner: true }));
    const trunks: Poly[] = [];
    for (let x = xa + 30; x < xb - 30; x += r.range(90, 160)) { const w0 = r.range(22, 40), top = r.range(-60, 200), tw = w0 * 0.55; trunks.push(cut([[x - w0, H + 60], [x - tw, top], [x + tw, top], [x + w0, H + 60]], r, 1.5, 50)); }
    out.push(paper(inter(union(...trunks), inner), cm("gate", "near-dark", 0.3), B.mid, OUT, { rm: 0.2, noInner: true }));
    const pines = scatter(r, { x0: xa, y0: 120, x1: xb, y1: H + 40 }, P_ ? 52 : 40, (x, y) => pine(r, x, y, r.range(150, 270)), 70);
    out.push(paper(inter(pines, inner), cm("near-dark", "gate", 0.3), B.mid, OUT, { rm: 0.2, noInner: true }));
    const wn: Poly[] = [];
    for (let i = 0; i < 90; i++) { const x = r.range(xa + 20, xb - 20), y = r.range(60, H); wn.push(arch(r, x, y, r.range(5, 9), r.range(8, 14), 0.3)); }
    out.push(plain(inter(union(...wn), inner), cm("gate", "near-dark", 0.12)));
    return out;
  };
  const l = layer("gate-l" + g.s, 14, ...build(polyL, false, pl, [P.gate!, P["near-dark"]!, cm("near-dark", "rim-cool", 0.12)], 0.25, 93));
  const rr2 = layer("gate-r" + g.s, 15, ...build(polyR, true, pr, [P.gate!, P["near-dark"]!, cm("near-dark", "flap-lit", 0.25)], 0.5, 95));
  return { l, r: rr2, minOv, restL: [Math.min(...pl.map((p) => p[0])), Math.max(...pl.map((p) => p[0]))], restR: [Math.min(...pr.map((p) => p[0])), Math.max(...pr.map((p) => p[0]))] };
}

/* ---------- assemble ---------- */
const D = mkG(false), V = mkG(true);
const gD = gates(D), gV = gates(V);
const all: Layer[] = [
  skyLayer(),
  rangeFar(D), interiorFar(D), interiorArches(D), interiorNear(D), seamLight(D), seamGlow(), flapBack(D, -1), flapBack(D, 1), flapL(D), flapR(D), flapTop(D), ground(D), mistLayer(D), gD.l, gD.r,
  rangeFar(V), interiorFar(V), interiorArches(V), interiorNear(V), seamLight(V), flapBack(V, -1), flapBack(V, 1), flapL(V), flapR(V), flapTop(V), ground(V), mistLayer(V), gV.l, gV.r,
];
const BAKE: Record<string, [number, number]> = {
  sky: [0.6, 38], "range-far": [0.5, 38], "interior-far": [0.5, 38], "interior-arches": [0.5, 40], "interior-near": [0.4, 34], "seam-light": [0.35, 30], "seam-glow": [0.3, 32],
  "flap-l-back": [0.5, 38], "flap-r-back": [0.5, 38], "flap-l": [0.85, 48], "flap-r": [0.85, 48], "flap-top": [0.85, 48], ground: [0.5, 42], mist: [0.3, 30], "gate-l": [0.4, 34], "gate-r": [0.4, 34],
};
const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
for (const l of all) {
  const [scale, quality] = BAKE[l.id.replace(/-p$/, "")] ?? [1, 60];
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
const base = ["range-far", "interior-far", "interior-arches", "interior-near", "seam-light", "flap-l-back", "flap-r-back", "flap-l", "flap-r", "flap-top", "ground", "mist", "gate-l", "gate-r"];
const dIds = ["sky", ...base.slice(0, 5), "seam-glow", ...base.slice(5)];
const pIds = ["sky", ...base.slice(0, 5).map((s) => s + "-p"), "seam-glow", ...base.slice(5).map((s) => s + "-p")];
const SG = 0.85;
const place = { sky: { x: -(1920 * 1.8 - 1080) / 2, y: -(1080 * 1.8 - 1920) / 2, s: 1.8 }, "seam-glow": { x: 560 - 1060 * SG, y: 910 - 560 * SG, s: SG } };
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: compose(1920, 1080, dIds), portrait: compose(1080, 1920, pIds, place) }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop"); await composite(SLUG, "portrait");

console.log("layers desktop", dIds.length, "portrait", pIds.length);
console.log("bytes total", total, "(KB", Math.round(total / 1024) + ") budget 430080");
console.log("gate-l rest x", gD.restL.map(Math.round), "gate-r rest x", gD.restR.map(Math.round), "closed min overlap", gD.minOv.toFixed(1));
console.log("gate-l-p rest x", gV.restL.map(Math.round), "gate-r-p rest x", gV.restR.map(Math.round), "closed min overlap", gV.minOv.toFixed(1));
if (gD.minOv < 80 || gV.minOv < 80) throw new Error("gate closed overlap < 80");
for (const id of [...new Set([...dIds, ...pIds])]) { const b = baked.get(id)!; console.log(" ", id.padEnd(20), String(b.bytes).padStart(7), `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}x${Math.round(b.h)}`); }

// previews without flaps and gates (checks the interior behind the doors)
const sharp = (await import("sharp")).default;
for (const which of ["desktop", "portrait"] as const) {
  const c = manifest.compositions[which], ops = [];
  for (const l of c.layers.filter((l) => !/^(flap-l|flap-r|flap-top|gate)/.test(l.id) || /back/.test(l.id))) {
    const w = Math.round(l.w), h = Math.round(l.h), x = Math.round(l.x), y = Math.round(l.y), sx = Math.max(0, -x), sy = Math.max(0, -y);
    const cw = Math.min(w, c.width - x) - sx, ch = Math.min(h, c.height - y) - sy;
    if (cw <= 0 || ch <= 0) continue;
    ops.push({ input: await sharp(join(ROOT, "public", l.src)).resize(w, h).extract({ left: sx, top: sy, width: cw, height: ch }).png().toBuffer(), left: x + sx, top: y + sy });
  }
  await sharp({ create: { width: c.width, height: c.height, channels: 4, background: "#101018" } }).composite(ops).png().toFile(join(ROOT, "art", SLUG, `preview-${which}-noflaps.png`));
}
