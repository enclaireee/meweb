// b7-second-fold: the inner mountain folds open onto an endless dawn. Run: npx tsx art/b7-second-fold/build.ts
// Per-layer bake settings (bible s13) are applied with bakeLayer; the manifest is written here in the exact bakeBeat format.
import { writeFileSync } from "node:fs";
import sharp from "sharp";
import { join } from "node:path";
import {
  ROOT, arch, bakeLayer, bridge, cloud, column, composite, cut, difference, ellipse, fern, flock, glow, hills, layer, mist, mix,
  noise, offset, pine, rect, rng, roots, ruinWall, scatter, shaft, sheet, stairs, stalactites, strata, tower, union, vine,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "b7-second-fold";
const P: Palette = {
  "dawn-sky-hi": "#fbe2d2", "dawn-sky": "#f4c9b8", haze: "#e8a9a4", cloud: "#fff0e2", "far-peak": "#c79ab0", "far-peak-2": "#a884a8",
  "inner-lit": "#a58cbf", "inner-mountain": "#7f6b9c", "flap-back": "#54507f", near: "#332f55", "near-dark": "#24213f", gate: "#1b1a33",
  "dawn-light": "#ffe3c4", "dawn-core": "#fffaf0", "rim-dawn": "#ffd2b0", "warm-arch": "#b0652a", "warm-arch-near": "#7a3d1c", shadow: "#120f24",
};
const R = (n: number) => rng(70700 + n);

/* ---------- configs ---------- */
type Cfg = {
  W: number; H: number; sun: Pt; hor: number; s: number; sfx: string;
  op: { x0: number; x1: number; y0: number; y1: number; seam: number; edgeTop: number };
};
const D: Cfg = { W: 1920, H: 1080, sun: [760, 520], hor: 560, s: 0, sfx: "", op: { x0: 300, x1: 1220, y0: 120, y1: 900, seam: 760, edgeTop: 420 } };
const V: Cfg = { W: 1080, H: 1920, sun: [540, 560], hor: 620, s: 100, sfx: "-p", op: { x0: 120, x1: 960, y0: 160, y1: 1000, seam: 540, edgeTop: 470 } };

/* ---------- band recipes + helpers ---------- */
type Band = { off: number; blur: number; op: number; rw: number; rm: number; inner?: [number, number] };
const B = {
  far: { off: 4, blur: 6, op: 0.25, rw: 1.5, rm: 0.35 },
  mid: { off: 8, blur: 10, op: 0.35, rw: 2, rm: 0.45, inner: [4, 0.25] },
  hero: { off: 12, blur: 14, op: 0.4, rw: 2.5, rm: 0.5, inner: [6, 0.3] },
  near: { off: 16, blur: 18, op: 0.45, rw: 3, rm: 0.25, inner: [8, 0.35] },
  gate: { off: 22, blur: 26, op: 0.55, rw: 3, rm: 0.3, inner: [10, 0.4] },
} satisfies Record<string, Band>;

const flat = (s: Poly | Shape): Shape => (typeof s[0]?.[0] === "number" ? [s as Poly] : (s as Shape));
const bnd = (s: Poly | Shape) => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const ring of flat(s)) for (const [x, y] of ring) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1 };
};
const BIG = rect(-4000, -4000, 10000, 10000);
const inter = (a: Poly | Shape, b: Poly | Shape): Shape => difference(a, difference(BIG, b));
const cn = (a: string, b: string, t: number) => mix(P[a]!, P[b]!, t);

type PaperOpts = { holes?: (Poly | Shape)[]; rm?: number; light?: Pt; opacity?: number; noRim?: boolean; shadow?: false | { dx: number; dy: number; blur: number; opacity: number }; noInner?: boolean };
function paper(shape: Poly | Shape, fill: string, b: Band, sun: Pt, o: PaperOpts = {}): Frag {
  const bb = bnd(shape);
  let lx = o.light ? o.light[0] : sun[0] - (bb.x0 + bb.x1) / 2, ly = o.light ? o.light[1] : sun[1] - (bb.y0 + bb.y1) / 2;
  const d = Math.hypot(lx, ly) || 1; lx /= d; ly /= d;
  return sheet(shape, fill, {
    holes: o.holes, opacity: o.opacity,
    shadow: o.shadow === false ? false : { color: P.shadow, blur: b.blur, opacity: b.op, dx: -lx * b.off, dy: -ly * b.off, ...o.shadow },
    edge: o.noRim ? undefined : { light: [lx, ly], width: b.rw, color: mix(fill, P["rim-dawn"]!, o.rm ?? b.rm) },
    inner: b.inner && !o.noInner ? { blur: b.inner[0], opacity: b.inner[1], color: P.shadow } : undefined,
  });
}
function pile(shape: Poly | Shape, fills: string[], inset: number, b: Band, sun: Pt, o: PaperOpts = {}): Frag[] {
  const out: Frag[] = [];
  let cur: Shape = union(shape);
  fills.forEach((f, i) => {
    if (!cur.length) return;
    const bb: Band = i ? { ...b, off: b.off * 0.4, blur: b.blur * 0.5, op: b.op * 0.8 } : b;
    out.push(paper(cur, f, bb, sun, o));
    cur = offset(cur, -inset);
  });
  return out;
}
let clipId = 0;
/** Clip painted frags to a rect (keeps hinge edges exact: the sprite's alpha box then starts at the clip edge). */
function clip(frags: Frag[], x0: number, y0: number, x1: number, y1: number): Frag {
  const id = `cl${clipId++}`;
  const b = { x0: Math.max(x0, Math.min(...frags.map((f) => f.x0))), y0: Math.max(y0, Math.min(...frags.map((f) => f.y0))), x1: Math.min(x1, Math.max(...frags.map((f) => f.x1))), y1: Math.min(y1, Math.max(...frags.map((f) => f.y1))) };
  return { svg: `<clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/></clipPath><g clip-path="url(#${id})">${frags.map((f) => f.svg).join("")}</g>`, ...b };
}
function lumps(seed: number, cs: number[], as: number[], sl: number[], amp = 6) {
  const n2 = noise(seed);
  return (x: number) => Math.min(...cs.map((cx, i) => as[i]! + Math.abs(x - cx) * sl[i]!)) + n2(x / 45, 1) * amp + n2(x / 17, 5) * amp * 0.5;
}
const profPoly = (f: (x: number) => number, x0: number, x1: number, base: number, step = 12): Poly => {
  const p: Poly = [];
  for (let x = x0; x <= x1; x += step) p.push([x, Math.min(f(x), base)]);
  p.push([x1, base], [x0, base]);
  return p;
};
const ellip = (x: number, y: number, rx: number, ry: number, n = 8) => ellipse(x, y, rx, ry, n);
const archW = (r: Rng, x: number, y: number, w: number) => arch(r, x, y, w, w * 1.7, 0.3);

/* calm-safe tone ramp (tone-on-tone) */
const RAMP = [P["near-dark"]!, cn("near-dark", "near", 0.5), P.near!, cn("near", "flap-back", 0.35), cn("near", "flap-back", 0.6)];
const SEQ = [2, 1, 3, 2, 4, 3, 1, 2, 3, 2];

/* ---------- bg ---------- */
function bgLayer(c: Cfg): Layer {
  const r = R(c.s + 1);
  const band = (y: number, seed: number) => hills(r, { x0: -30, x1: c.W + 30, y, base: -30, amp: c.H * 0.045, seed, step: 70 });
  const fills = [0.22, 0.46, 0.7].map((t) => mix(P["dawn-sky-hi"]!, P["dawn-core"]!, t));
  return layer("dawn-sky" + c.sfx, 0,
    sheet(rect(0, 0, c.W, c.H), P["dawn-sky-hi"]!, { shadow: false }),
    sheet(band(c.hor * 0.84, c.s + 11), P["dawn-sky"]!, { shadow: false }),
    sheet(band(c.hor * 0.62, c.s + 13), cn("dawn-sky", "haze", 0.5), { shadow: false }),
    sheet(band(c.hor * 0.42, c.s + 12), P.haze!, { shadow: false }),
    sheet(band(c.hor * 0.2, c.s + 14), cn("haze", "far-peak", 0.3), { shadow: false }),
    ...[[760, 300], [530, 215], [320, 140]].map(([rx, ry], i) => sheet(cut(ellip(c.sun[0], c.hor, rx!, ry!, 72), r, 3, 40), fills[i]!, { shadow: false })));
}

/* ---------- far clouds + flock ---------- */
function cloudsFar(c: Cfg): Layer {
  const r = R(c.s + 2), out: Frag[] = [];
  const banks: number[][] = c.s ? [[260, 300, 560, 140], [700, 400, 520, 120], [380, 520, 460, 110], [820, 250, 400, 100], [300, 200, 300, 70], [760, 170, 340, 70], [540, 90, 460, 60]] : [[230, 330, 560, 140], [640, 250, 520, 120], [930, 390, 420, 110], [420, 150, 380, 80], [860, 130, 360, 70], [640, 50, 440, 60], [350, 40, 300, 50]];
  for (const [cx, cy, w, h] of banks) out.push(...pile(cloud(r, cx!, cy!, w!, h!), [cn("dawn-sky-hi", "haze", 0.45), P["dawn-sky-hi"]!, P.cloud!], 6, B.far, c.sun));
  const fl = [flock(r, 330, c.s ? 380 : 210, 150, 15, 5.5), flock(r, 840, c.s ? 560 : 330, 140, 15, 5)];
  out.push(sheet(union(...fl), P["far-peak-2"]!, { shadow: false, opacity: 0.8 }));
  return layer("clouds-far" + c.sfx, 1, ...out);
}

/* ---------- far peaks + monastery ---------- */
function peaksFar(c: Cfg): Layer {
  const r = R(c.s + 3), out: Frag[] = [];
  const o = c.s ? 0 : 0;
  const k = c.W / 1920;
  const cb = c.s ? [20, 300, 640, 930, 1100] : [-20, 340, 640, 900, 1100];
  const yb = c.s ? 430 : 395;
  const back = lumps(c.s + 31, cb, [yb + 75, yb, yb + 140, yb + 100, yb + 70], [1.2, 1.3, 1.2, 1.25, 1.2]);
  const front = lumps(c.s + 32, [cb[0]! + 150, cb[2]! - 60, cb[4]! - 120], [yb + 160, yb + 190, yb + 150], [1.0, 1.1, 1.0], 8);
  const base = c.s ? 700 : 640, x1 = c.s ? 1140 : 1140;
  out.push(...pile(profPoly(back, -60, x1, base), [P["far-peak"]!, cn("far-peak", "dawn-sky-hi", 0.3)], 5, B.far, c.sun));
  out.push(...pile(profPoly(front, -60, x1, base + 40), [P["far-peak-2"]!, cn("far-peak-2", "far-peak", 0.4)], 5, B.far, c.sun));
  // tiny pines on the front range
  const pines = scatter(r, { x0: -20, y0: 0, x1: x1 - 40, y1: 1 }, 24, (x) => pine(r, x, front(x) + r.range(4, 22), r.range(14, 30)), 36);
  out.push(sheet(pines, cn("far-peak-2", "inner-mountain", 0.35), { shadow: false }));
  // monastery on the tallest back peak
  const mx = cb[1]!, my = (x: number) => back(x);
  const bodies: Shape[] = [], holes: Poly[] = [];
  [[-34, 34, 18], [-12, 50, 20], [14, 40, 18], [36, 26, 16]].forEach(([dx, h, w]) => {
    const t = tower(r, mx + dx!, my(mx + dx!) + 6, w!, h!, { windows: 3 }); bodies.push(t.body); holes.push(...t.holes);
  });
  const rw = ruinWall(r, mx - 60, my(mx - 40) + 14, 120, 28); bodies.push(rw.body); holes.push(...rw.holes);
  bodies.push([stairs(mx + 40, my(mx + 60) - 4, 56, 30, 10, -1)], [stairs(mx - 110, my(mx - 80) + 6, 50, 26, 9, 1)]);
  const wins = Array.from({ length: 6 }, (_, i) => rect(mx - 50 + i * 18 + r.range(-3, 3), my(mx) + 24 + r.range(0, 10), r.range(3, 5), r.range(4, 6)));
  out.push(paper(union(...bodies), cn("far-peak-2", "inner-mountain", 0.55), B.far, c.sun, { holes: [...holes, ...wins] }));
  void o; void k;
  return layer("peaks-far" + c.sfx, 2, ...out);
}

/* ---------- cloud sea ---------- */
// tiers are deterministic per index so peaks-mid can re-draw the two front tiers over its own bases
function seaTier(c: Cfg, i: number): Frag {
  const r = R(c.s + 40 + i);
  const crest = c.s ? [670, 712, 755, 798] : [610, 650, 696, 742];
  const base = c.s ? 1060 : 1000, cy = crest[i]!;
  const fills = [P["dawn-sky"]!, P.cloud!, P["dawn-sky-hi"]!, cn("haze", "dawn-sky", 0.4)];
  const parts: (Poly | Shape)[] = [rect(-80, cy + 26, c.W + 200, base - cy - 26)];
  for (let x = -80; x < c.W + 120; x += r.range(150, 230)) parts.push(cloud(r, x, cy, r.range(210, 300), r.range(70, 100)));
  const curls = Array.from({ length: 14 }, () => ellip(r.range(-40, c.W + 60), cy + r.range(30, 52), r.range(12, 26), r.range(5, 9), 10));
  return paper(union(...parts), fills[i]!, i < 2 ? B.far : B.mid, c.sun, { holes: curls });
}
function seaExtra(c: Cfg): Frag[] {
  const r = R(c.s + 48), out: Frag[] = [], base = c.s ? 1060 : 1000;
  [c.s ? 842 : 802, c.s ? 890 : 850].forEach((cy, i) => {
    const parts: (Poly | Shape)[] = [rect(-80, cy + 24, c.W + 200, base - cy - 24)];
    for (let x = -80; x < c.W + 120; x += r.range(120, 190)) parts.push(cloud(r, x, cy, r.range(160, 240), r.range(46, 66)));
    const curls = Array.from({ length: 12 }, () => ellip(r.range(-40, c.W + 60), cy + r.range(24, 40), r.range(10, 20), r.range(4, 7), 10));
    out.push(paper(union(...parts), i ? cn("dawn-sky", "dawn-sky-hi", 0.5) : cn("haze", "dawn-sky", 0.65), B.mid, c.sun, { holes: curls }));
  });
  return out;
}
const cloudSea = (c: Cfg): Layer => layer("cloud-sea" + c.sfx, 3, ...[0, 1, 2, 3].map((i) => seaTier(c, i)));

/* ---------- mid peaks ---------- */
function peaksMid(c: Cfg): Layer {
  const r = R(c.s + 5), out: Frag[] = [];
  const peaks: { cx: number; ap: number; sl: number }[] = c.s
    ? [{ cx: 200, ap: 470, sl: 1.5 }, { cx: 540, ap: 380, sl: 1.6 }, { cx: 880, ap: 440, sl: 1.5 }]
    : [{ cx: 170, ap: 380, sl: 1.6 }, { cx: 520, ap: 290, sl: 1.6 }, { cx: 900, ap: 340, sl: 1.6 }];
  const base = c.s ? 820 : 760;
  const fns = peaks.map((p, i) => lumps(c.s + 51 + i, [p.cx], [p.ap], [p.sl], 7));
  const wins: Poly[] = [], temples: Shape[] = [], tholes: Poly[] = [], pines: Shape[] = [];
  peaks.forEach((p, i) => {
    const f = fns[i]!, hw = (base - p.ap) / p.sl;
    const poly = profPoly(f, p.cx - hw, p.cx + hw, base, 10);
    out.push(...pile(cut(poly, r, 1.5, 40), [P["inner-mountain"]!, P["inner-lit"]!, cn("inner-lit", "far-peak-2", 0.5)], 10, B.mid, c.sun));
    const inn = offset(poly, -14);
    strata(r, { x0: p.cx - hw, x1: p.cx + hw, y: p.ap + 60, base, bands: 5 }).forEach((s, b) =>
      out.push(sheet(inter(s, inn), b % 2 ? cn("inner-lit", "far-peak-2", 0.4) : cn("inner-mountain", "inner-lit", 0.3), { shadow: { dx: 0, dy: 5, blur: 6, opacity: 0.22, color: P.shadow }, edge: { light: [0, -1], width: 1.5, color: mix(P["inner-lit"]!, P["rim-dawn"]!, 0.3) } })));
    for (let k = 0; k < 14; k++) { const x = r.range(p.cx - hw * 0.6, p.cx + hw * 0.6), y = f(x) + r.range(24, 150); if (y < base - 40) wins.push(archW(r, x, y, r.range(4, 6))); }
    for (let k = 0; k < 4; k++) { // ruined temple terraces on the shoulders
      const x = p.cx + (k % 2 ? 1 : -1) * r.range(14, hw * 0.45), y = f(x) + 10;
      const t = tower(r, x, y + 2, r.range(14, 20), r.range(30, 52), { windows: 2 }); temples.push(t.body); tholes.push(...t.holes);
      const q = ruinWall(r, x - 54, y + 36 + r.range(0, 30), r.range(70, 100), r.range(22, 32)); temples.push(q.body); tholes.push(...q.holes);
    }
    for (let k = 0; k < 10; k++) { const x = r.range(p.cx - hw * 0.7, p.cx + hw * 0.7); pines.push(pine(r, x, f(x) + r.range(30, 170), r.range(14, 30))); }
  });
  out.push(sheet(union(...wins), cn("inner-mountain", "near", 0.6), { shadow: false }));
  out.push(paper(union(...temples), P["inner-lit"]!, B.mid, c.sun, { holes: tholes }));
  out.push(sheet(union(...pines), cn("inner-mountain", "near", 0.5), { shadow: { dx: 3, dy: 3, blur: 4, opacity: 0.25, color: P.shadow } }));
  // two bridges across the saddles
  const br: Shape[] = [];
  [[0, 1], [1, 2]].forEach(([a, b2]) => {
    const fa = fns[a!]!, fb = fns[b2!]!, A = peaks[a!]!, Bp = peaks[b2!]!;
    const sx = (A.cx + Bp.cx) / 2, yb = Math.min(fa(sx), fb(sx));
    let yy = Math.min(yb, base - 120), xa = sx - 40, xb = sx + 40;
    for (let y = yy; y > yy - 260; y -= 3) { // lift until the gap is the bridge span
      xa = A.cx; while (xa < sx && fa(xa) < y) xa += 2; xb = Bp.cx; while (xb > sx && fb(xb) < y) xb -= 2;
      if (xb - xa < 92 && xb - xa > 40) { yy = y; break; }
    }
    br.push(bridge(r, xa - 6, xb + 6, yy, 7, 3));
  });
  out.push(paper(union(...br), cn("inner-mountain", "near", 0.35), B.mid, c.sun));
  out.push(seaTier(c, 2), seaTier(c, 3), ...seaExtra(c)); // front sea tiers hide the peak bases
  return layer("peaks-mid" + c.sfx, 4, ...out);
}

/* ---------- atmosphere ---------- */
const mistLayer = () => layer("mist", 5, mist(520, 560, 1100, 150, P["dawn-light"]!, 0.25), mist(520, 760, 1100, 150, P["dawn-light"]!, 0.25));
function seamLight(c: Cfg): Layer {
  const r = R(c.s + 6), [sx, sy] = c.sun, o = c.op;
  const crack = cut(rect(c.op.seam - 7, o.y0, 14, o.y1 - o.y0 + 10), r, 1.2, 40);
  const halo = cut(rect(c.op.seam - 20, o.y0, 40, o.y1 - o.y0 + 10), r, 1.5, 40);
  const core = cut(rect(c.op.seam - 4, o.y0, 8, o.y1 - o.y0 + 10), r, 0.6, 40);
  const angs = [-30, -14, 0, 10, 20], ops = [0.22, 0.28, 0.3, 0.24, 0.2];
  return layer("seam-light" + c.sfx, 6,
    sheet(halo, P["dawn-light"]!, { shadow: false, opacity: 0.22 }), sheet(crack, P["dawn-light"]!, { shadow: false, opacity: 0.9 }), sheet(core, P["dawn-core"]!, { shadow: false, opacity: 0.9 }),
    ...angs.map((a, i) => shaft(sx, sy, 34, 84, 250 + (i % 2) * 40, a, P["dawn-light"]!, ops[i]!)));
}
const glowLayer = () => layer("seam-glow", 7, glow(760, 520, 460, P["dawn-light"]!, { opacity: 0.55, core: P["dawn-core"]! }));
function dustLayer(c: Cfg): Layer {
  const r = R(c.s + 7), o = c.op, reg = { x0: o.x0 + 20, y0: o.y0 + 30, x1: c.s ? o.x1 - 20 : 1040, y1: o.y1 - 40 };
  return layer("dust" + c.sfx, 13, ...([[50, 0.35], [50, 0.6], [40, 0.8]] as [number, number][]).map(([n, op]) =>
    sheet(scatter(r, reg, n, (x, y) => ellip(x, y, r.range(1.5, 3.6), r.range(1.5, 3.6), 6), 14), P["dawn-light"]!, { shadow: false, opacity: op })));
}

/* ---------- hero flaps ---------- */
function flap(c: Cfg, left: boolean): Layer {
  const r = R(c.s + (left ? 8 : 9)), o = c.op, seam = o.seam;
  const xa = left ? o.x0 - 3 : seam + 1.5, xb = left ? seam - 1.5 : o.x1 + 3, yb = o.y1 + 6;
  const apex = o.y0 + 6, slope = (o.edgeTop - apex) / (seam - o.x0);
  const topY = (x: number) => apex + Math.abs(x - seam) * slope;
  const top: Pt[] = [];
  for (let x = xa; x < xb;) { const b = Math.min(xb, x + r.range(40, 90)); const y = topY((x + b) / 2) + r.range(-6, 6); top.push([x, y], [b, y]); x = b; }
  const poly: Poly = [...top, [xb, yb], [xa, yb]];
  const out: Frag[] = [];
  const fills = [P.near!, P["flap-back"]!, cn("flap-back", "inner-mountain", 0.35), cn("flap-back", "inner-mountain", 0.6)];
  out.push(...pile(poly, fills, 14, B.hero, c.sun));
  const inn = offset(poly, -30);
  strata(r, { x0: xa, x1: xb, y: o.y0 + 80, base: yb + 40, bands: 7 }).forEach((s, b) => {
    const f = cn("flap-back", "inner-mountain", 0.15 + 0.1 * b);
    out.push(sheet(inter(s, inn), f, { shadow: { dx: 0, dy: 6, blur: 8, opacity: 0.28, color: P.shadow }, edge: { light: [left ? 0.4 : -0.4, -1], width: 1.8, color: mix(f, P["rim-dawn"]!, 0.3) } }));
  });
  // carved niches with lit frames
  const frames: Poly[] = [], niches: Poly[] = [], wins: Poly[] = [];
  for (let k = 0, t = 0; k < 14 && t < 200; t++) {
    const x = r.range(xa + 36, xb - 36), y = r.range(topY(x) + 90, yb - 120);
    if (wins.length > 99) break;
    const w = r.range(14, 22), h = r.range(26, 40);
    frames.push(arch(r, x, y + 4, w + 9, h + 7, 0.3)); niches.push(arch(r, x, y, w, h, 0.3)); k++;
  }
  for (let k = 0; k < 22; k++) { const x = r.range(xa + 20, xb - 20), y = r.range(topY(x) + 40, yb - 30); wins.push(archW(r, x, y, r.range(4, 6))); }
  out.push(paper(union(...frames), cn("flap-back", "inner-mountain", 0.8), B.mid, c.sun, { shadow: { dx: 1, dy: 2, blur: 3, opacity: 0.3 } }));
  out.push(sheet(union(...niches), P["near-dark"]!, { shadow: false }));
  out.push(sheet(union(...wins), P["near-dark"]!, { shadow: false }));
  // zig-zag stairs run
  const sw = r.range(86, 100), sx = left ? xa + 50 : xb - 50 - sw, flights: Poly[] = [];
  for (let k = 0; k < 4; k++) flights.push(stairs(sx + (k % 2 ? 6 : -6), yb - 24 - (k + 1) * 46, sw, 46, 10, k % 2 ? -1 : 1));
  out.push(paper(union(...flights), cn("flap-back", "inner-mountain", 0.78), B.mid, c.sun, { rm: 0.5 }));
  // hanging vines
  const vines = Array.from({ length: 8 }, () => { const x = r.range(xa + 30, xb - 30); return vine(r, x, topY(x) + 8, r.range(60, 140), 9); });
  out.push(sheet(union(...vines), P["near-dark"]!, { shadow: false }));
  // dawn-lit rim on the seam edge only
  const sx0 = left ? seam - 1.5 - 7 : seam + 1.5, strip = inter(rect(sx0, apex - 10, 7, yb - apex + 10), poly);
  out.push(sheet(strip, mix(P["flap-back"]!, P["rim-dawn"]!, 0.8), { shadow: false }));
  const id = (left ? "inner-flap-l" : "inner-flap-r") + c.sfx;
  return layer(id, left ? 8 : 9, clip(out, left ? o.x0 : seam + 0.5, 60, left ? seam - 0.5 : o.x1, o.y1 + 12));
}

/* ---------- inner base ---------- */
function innerBase(c: Cfg): Layer {
  const r = R(c.s + 10), out: Frag[] = [];
  const pr = c.s
    ? lumps(c.s + 61, [], [], [], 0) // unused
    : lumps(0, [], [], [], 0);
  void pr;
  const prof: Pt[] = c.s
    ? [[-60, 1090], [300, 1060], [440, 1018], [600, 1004], [760, 1040], [1140, 1062]]
    : [[-60, 985], [300, 975], [420, 912], [560, 892], [700, 912], [820, 930], [1000, 936], [1300, 940]];
  const f = (x: number) => { if (x <= prof[0]![0]) return prof[0]![1]; for (let i = 1; i < prof.length; i++) { const a = prof[i - 1]!, b = prof[i]!; if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); } return prof[prof.length - 1]![1]; };
  const x0 = -60, x1 = c.s ? 1140 : 1300, base = c.s ? 1990 : 1150;
  const pts: Poly = []; const st: { a: number; b: number; y: number }[] = [];
  for (let x = x0; x < x1;) { const b = Math.min(x1, x + r.range(46, 110)), y = f((x + b) / 2) + r.range(-5, 5); pts.push([x, y], [b, y]); st.push({ a: x, b, y }); x = b; }
  const top = (xx: number) => (st.find((s) => xx >= s.a && xx <= s.b) ?? st[st.length - 1]!).y;
  const poly = cut([...pts, [x1, base], [x0, base]], r, 1.5, 40);
  out.push(...pile(poly, [RAMP[0]!, RAMP[2]!, RAMP[3]!], 12, B.near, c.sun));
  const inn = offset(poly, -28), nb = c.s ? 9 : 3;
  for (let b = 0; b < nb; b++) {
    const k = SEQ[b % SEQ.length]!, y0 = (x: number) => top(x) + 34 + b * (c.s ? 95 : 46);
    const bp: Poly = []; for (let x = x0; x <= x1; x += r.range(60, 150)) bp.push([x, y0(x) + r.range(-12, 12)]);
    bp.push([x1, base], [x0, base]);
    out.push(sheet(inter(cut(bp, r, 1, 40), inn), RAMP[k]!, { shadow: { dx: 0, dy: 6, blur: 8, opacity: 0.28, color: P.shadow }, edge: { light: [0, -1], width: 1.5, color: mix(RAMP[k]!, P["rim-dawn"]!, 0.2) } }));
    const wn: Poly[] = [];
    for (let i = 0; i < (c.s ? 26 : 22); i++) { const x = r.range(x0 + 30, x1 - 30); wn.push(archW(r, x, y0(x) + r.range(18, 44), r.range(5, 10))); }
    out.push(sheet(union(...wn), RAMP[Math.max(0, k - 2)]!, { shadow: false }));
    const rwl = Array.from({ length: c.s ? 3 : 2 }, () => { const x = r.range(x0 + 20, x1 - 220); return ruinWall(r, x, y0(x + 60) + 2, r.range(100, 190), r.range(34, 56)); });
    out.push(paper(union(...rwl.map((q) => q.body)), RAMP[Math.max(0, k - 1)]!, B.mid, c.sun, { holes: rwl.flatMap((q) => q.holes), rm: 0.25 }));
  }
  // broken stair, boulders, ferns, roots
  const stx = c.s ? 420 : 430, stl: Poly[] = [stairs(stx, top(stx + 40) - 6, 190, 44, 14, -1), stairs(stx + 100, top(stx + 120) + 18, 160, 36, 12, 1)];
  out.push(paper(union(...stl), RAMP[4]!, B.mid, c.sun, { rm: 0.25 }));
  const boul = scatter(r, { x0: 30, y0: 0, x1: x1 - 120, y1: 1 }, 11, (x) => cut(ellip(x, top(x) + 6, r.range(24, 50), r.range(14, 26), 10), r, 2, 14), 90);
  out.push(paper(boul, RAMP[3]!, B.near, c.sun, { rm: 0.25 }));
  const peb = scatter(r, { x0: x0 + 10, y0: top(300) + 40, x1: x1 - 10, y1: c.s ? base - 40 : 1130 }, c.s ? 120 : 50, (x, y) => cut(rect(x, y, r.range(6, 20), r.range(4, 10)), r, 1, 8));
  out.push(sheet(peb, RAMP[3]!, { shadow: false }));
  const cr = Array.from({ length: c.s ? 40 : 14 }, () => { const x = r.range(x0 + 20, x1 - 20), y = top(x) + r.range(40, c.s ? 800 : 170), l = r.range(24, 70), a = r.range(1.1, 2.0), cc = Math.cos(a), ss = Math.sin(a);
    return ([[-1.75, -l / 2], [1.75, -l / 2], [1.75, l / 2], [-1.75, l / 2]] as Pt[]).map(([px, py]) => [x + px * cc - py * ss, y + px * ss + py * cc] as Pt); });
  out.push(sheet(union(...cr), RAMP[0]!, { shadow: false }));
  const fr: Shape[] = [], rt: Shape[] = [];
  const fn = c.s ? 30 : 24;
  for (let i = 0; i < fn; i++) { const x = r.range(x0 + 10, x1 - 10); fr.push(fern(r, x, top(x) + 3, r.range(26, 58), r.range(-0.6, 0.6))); }
  for (let i = 0; i < Math.round(fn / 2); i++) { const x = r.range(x0 + 30, x1 - 30); rt.push(roots(r, x, top(x) + 8, 30, r.range(40, 100), 4, 1)); }
  out.push(sheet(union(...fr, ...rt), RAMP[0]!, { shadow: false }));
  return layer("inner-base" + c.sfx, 10, ...out);
}

/* ---------- callback arch ---------- */
function ruinArch(c: Cfg): Layer {
  const r = R(c.s + 11), out: Frag[] = [];
  const cx = c.s ? 170 : 262, w = c.s ? 180 : 210, h = c.s ? 520 : 520, base = c.s ? 1200 : 982;
  const outer = arch(r, cx, base, w, h, 1.5), hole = arch(r, cx, base + 2, w - 84, h - 64, 1.2);
  const slits = Array.from({ length: 22 }, (_, i) => { const left = i % 2 === 0, x = left ? cx - w / 2 + r.range(4, 14) : cx + w / 2 - r.range(4, 14) - 24; return rect(x, base - 30 - (i >> 1) * 38 - r.range(0, 8), r.range(14, 26), 3.2); });
  const frame = difference(outer, hole);
  const fills = [P.near!, P["warm-arch-near"]!, P["warm-arch"]!];
  const tiers: Shape[] = []; { let cur: Shape = frame; for (let i = 0; i < 3; i++) { tiers.push(cur); cur = offset(cur, -8); } }
  tiers.forEach((t, i) => {
    let s: Shape = t;
    if (c.s && i === 2) s = inter(t, rect(-100, -100, 1500, 1056 + 100)); // calm below y 1056: warm-arch-near only
    if (s.length) out.push(paper(s, fills[i]!, i ? { ...B.near, off: 8, blur: 9 } : B.near, c.sun, { holes: i === 2 ? slits : undefined, rm: 0.45 }));
  });
  const lw = ruinWall(r, cx - w / 2 - 70, base + 2, 90, 90), rw = ruinWall(r, cx + w / 2 - 10, base + 2, 120, 70);
  out.push(paper(union(lw.body, rw.body), P["warm-arch-near"]!, B.near, c.sun, { holes: [...lw.holes, ...rw.holes], rm: 0.3 }));
  const apexY = base - h;
  out.push(sheet(union(roots(r, cx, apexY + 70, w - 110, 120, 7, 1), roots(r, cx - w / 2 + 20, apexY + 150, 30, 150, 3, 1), vine(r, cx + w / 2 - 30, apexY + 90, 160, 10)), P.near!, { shadow: false }));
  const fr = Array.from({ length: 6 }, () => fern(r, cx + r.range(-w / 2 - 50, w / 2 + 50), base + 4, r.range(28, 56), r.range(-0.6, 0.6)));
  out.push(sheet(union(...fr), P["near-dark"]!, { shadow: false }));
  return layer("ruin-arch" + c.sfx, 11, ...out);
}

/* ---------- cavern wall (calm, tone-on-tone) ---------- */
const bandShapes = (r: Rng, x0: number, x1: number, y: number, base: number, n: number): Shape[] => strata(r, { x0, x1, y, base, bands: n });
function wallDetail(r: Rng, sil: Shape, bx: { x0: number; x1: number; y0: number; y1: number }, o: { bands: number; gal: number[]; win: number; stairsN: number; roots: number; sun: Pt }): Frag[] {
  const out: Frag[] = [], inn = offset(sil, -34);
  bandShapes(r, bx.x0, bx.x1, bx.y0, bx.y1, o.bands).forEach((s, i) => {
    const f = RAMP[SEQ[i % SEQ.length]!]!;
    out.push(sheet(inter(s, inn), f, { shadow: { dx: 0, dy: 6, blur: 8, opacity: 0.25, color: P.shadow }, edge: { light: [-1, 0], width: 1.5, color: mix(f, P["rim-dawn"]!, 0.2) } }));
  });
  const wins: Poly[] = [], cols: Shape[] = [], recess: Shape[] = [];
  o.gal.forEach((gy) => {
    const gx0 = bx.x0 + 70, gx1 = bx.x1 - 70;
    recess.push(inter(cut(rect(gx0, gy, gx1 - gx0, 80), r, 1.5, 34), inn));
    for (let x = gx0 + 20; x < gx1 - 20; x += 46 * r.vary(0.2)) { cols.push(column(r, x, gy + 80, 11, 74, r() < 0.15)); wins.push(arch(r, x + 22, gy + 70, 7, 22, 0.3)); }
  });
  out.push(sheet(union(...recess), RAMP[1]!, { shadow: { dx: 0, dy: 4, blur: 6, opacity: 0.3, color: P.shadow }, inner: { blur: 6, opacity: 0.4, color: P.shadow } }));
  out.push(sheet(union(...wins), RAMP[0]!, { shadow: false }));
  out.push(sheet(union(...cols), RAMP[3]!, { shadow: false }));
  const sc: Poly[] = [];
  for (let i = 0; i < o.stairsN; i++) { const x = r.range(bx.x0 + 80, bx.x1 - 220), y = r.range(bx.y0 + 160, bx.y1 - 160); sc.push(stairs(x, y, 130, 74, 15, i % 2 ? -1 : 1)); }
  out.push(sheet(union(...sc), RAMP[4]!, { shadow: { dx: 0, dy: 5, blur: 6, opacity: 0.25, color: P.shadow }, edge: { light: [-1, -1], width: 1.5, color: mix(RAMP[4]!, P["rim-dawn"]!, 0.2) } }));
  const w2: Poly[] = []; for (let i = 0; i < o.win; i++) w2.push(archW(r, r.range(bx.x0 + 40, bx.x1 - 40), r.range(bx.y0 + 40, bx.y1 - 40), r.range(4, 8)));
  out.push(sheet(union(...w2), RAMP[0]!, { shadow: false }));
  const rt: Shape[] = []; for (let i = 0; i < o.roots; i++) rt.push(roots(r, r.range(bx.x0 + 30, bx.x1 - 30), r.range(bx.y0, bx.y1 - 200), 24, r.range(70, 170), 4, 1));
  out.push(sheet(union(...rt), RAMP[0]!, { shadow: false }));
  return out;
}
function cavernWall(c: Cfg): Layer {
  const r = R(c.s + 12), n2 = noise(c.s + 12), out: Frag[] = [];
  if (!c.s) {
    const ex = (y: number) => 1040 + n2(y / 90, 1) * 14 + n2(y / 31, 2) * 6;
    const pts: Poly = []; for (let y = -60; y <= 1140; y += 26) pts.push([ex(y) + r.range(-3, 3), y]);
    const sil = union([[2100, -60], ...pts, [2100, 1140]] as Poly);
    out.push(...pile(sil, [RAMP[0]!, RAMP[2]!, RAMP[3]!], 16, B.near, c.sun));
    out.push(...wallDetail(r, sil, { x0: 1000, x1: 2100, y0: 80, y1: 1100 }, { bands: 8, gal: [200, 470, 740], win: 20, stairsN: 2, roots: 10, sun: c.sun }));
    return layer("cavern-wall", 12, ...out);
  }
  const exL = (y: number) => 125 + n2(y / 90, 1) * 14, exR = (y: number) => 955 + n2(y / 90, 3) * 14;
  const top = (x: number) => 1300 + n2(x / 120, 4) * 22 + n2(x / 40, 5) * 8;
  const pl: Poly = [], pr: Poly = [];
  for (let y = -60; y <= 2000; y += 26) { pl.push([exL(y) + r.range(-3, 3), y]); pr.push([exR(y) + r.range(-3, 3), y]); }
  const lower: Poly = []; for (let x = -60; x <= 1140; x += 30) lower.push([x + r.range(-3, 3), top(x)]);
  const sil = union([[-200, -60], ...pl, [-200, 2000]] as Poly, [[1300, -60], ...pr, [1300, 2000]] as Poly, [...lower, [1140, 2000], [-60, 2000]] as Poly);
  out.push(...pile(sil, [RAMP[0]!, RAMP[2]!, RAMP[3]!], 16, B.near, c.sun));
  out.push(...wallDetail(r, sil, { x0: -60, x1: 1140, y0: 1340, y1: 1960 }, { bands: 6, gal: [1400, 1640, 1860], win: 30, stairsN: 3, roots: 12, sun: c.sun }));
  out.push(...wallDetail(r, inter(sil, rect(-300, -100, 440, 1450)), { x0: -60, x1: 130, y0: 200, y1: 1300 }, { bands: 6, gal: [], win: 14, stairsN: 0, roots: 6, sun: c.sun }));
  out.push(...wallDetail(r, inter(sil, rect(940, -100, 400, 1450)), { x0: 950, x1: 1140, y0: 200, y1: 1300 }, { bands: 6, gal: [], win: 14, stairsN: 0, roots: 6, sun: c.sun }));
  return layer("cavern-wall-p", 12, ...out);
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
const pin = (segs: Seg[], a: number, b: number, p: number): Seg[] => segs.map((s) => (s.b > a && s.a < b ? { ...s, p } : s));
function cross(poly: Poly, c: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!, b = poly[(i + 1) % poly.length]!;
    if ((a[1] <= c && b[1] > c) || (b[1] <= c && a[1] > c)) out.push(a[0] + ((b[0] - a[0]) * (c - a[1])) / (b[1] - a[1]));
  }
  return out;
}
function gates(c: Cfg) {
  const port = !!c.s, lo = -60, hi = c.H + 60;
  const segs = pin(phaseSegs(R(c.s + 20), lo, hi, port ? 130 : 110, port ? 220 : 200), port ? 640 : 380, port ? 1260 : 940, 0);
  const span = port ? 828 : 1308, xl = (p: number) => (port ? 100 + 60 * p : 215 + 140 * p), xr = (p: number) => xl(p) + span;
  const edge = (right: boolean, r: Rng): Pt[] => {
    const pts: Pt[] = [];
    // jitter is shared (same r seed twice) so closed overlap stays exact; amplitude 3 keeps >= 80
    for (const s of segs) { const n = Math.max(1, Math.round((s.b - s.a) / 28)); for (let i = 0; i <= n; i++) pts.push([(right ? xr : xl)(s.p) + r.range(-3, 3), s.a + ((s.b - s.a) * i) / n]); }
    return pts;
  };
  const outL = port ? -560 : -800, outR = port ? 1640 : 2720;
  const pl = edge(false, R(c.s + 21)), pr = edge(true, R(c.s + 22));
  const polyL: Poly = [[outL, lo], ...pl, [outL, hi]], polyR: Poly = [[outR, lo], ...pr, [outR, hi]];
  const shift = port ? 460 : 700;
  let minOv = 1e9;
  for (let y = lo; y < hi; y += 0.5) minOv = Math.min(minOv, Math.max(...cross(polyL, y + 0.25)) + shift - (Math.min(...cross(polyR, y + 0.25)) - shift));
  const mk = (right: boolean) => {
    const r = R(c.s + (right ? 24 : 23)), poly = right ? polyR : polyL, pts = right ? pr : pl, nx = right ? -1 : 1;
    const xs = pts.map((p) => p[0]), eMin = Math.min(...xs), eMax = Math.max(...xs);
    const vis = right ? { x0: eMin, x1: outR } : { x0: outL, x1: eMax };
    const sil = union(poly), inn = offset(sil, -30);
    const out: Frag[] = [];
    const edgeDet: Shape[] = [];
    pts.forEach(([x, y], i) => {
      if (i % 2) return;
      const t = r();
      edgeDet.push(t < 0.5 ? vine(r, x - nx * 3, y, r.range(50, 130), 10) : t < 0.75 ? roots(r, x - nx * 4, y, 14, r.range(40, 100), 3, 1) : fern(r, x - nx * 4, y, r.range(26, 52), nx * r.range(0.4, 1)));
    });
    segs.forEach((s, i) => { // ruin fragments on treads
      const nxt = segs[i + 1]; if (!nxt) return;
      const cxp = ((right ? xr : xl)(s.p) + (right ? xr : xl)(nxt.p)) / 2;
      if (r() < 0.5) edgeDet.push(column(r, cxp, s.b, 14, r.range(28, 56), true));
      else { const q = ruinWall(r, cxp - 24, s.b + 1, 48, 32); edgeDet.push(difference(q.body, ...q.holes)); }
    });
    const full = union(poly, ...edgeDet);
    out.push(...pile(full, [P.gate!, P["near-dark"]!, P.near!], 16, B.gate, c.sun, { rm: 0.3 }));
    // full-body tone-on-tone detail
    const bx0 = vis.x0 + (right ? 0 : 60), bx1 = vis.x1 - (right ? 60 : 0);
    const nb = port ? 14 : 9;
    bandShapes(r, bx0, bx1, lo + 40, hi, nb).forEach((s, i) => {
      const f = RAMP[SEQ[(i + (right ? 3 : 0)) % SEQ.length]!]!;
      out.push(sheet(inter(s, inn), f, { shadow: { dx: 0, dy: 6, blur: 8, opacity: 0.25, color: P.shadow }, edge: { light: [-nx, -0.4], width: 1.5, color: mix(f, P["rim-dawn"]!, 0.2) } }));
    });
    const winDefs: Poly[] = [], hang: Shape[] = [], colS: Shape[] = [], walls: Shape[] = [], wholes: Poly[] = [];
    const seen = (x: number) => (right ? x - eMin : eMax - x); // distance into the body from the rest edge
    for (let i = 0; i < (port ? 120 : 130); i++) {
      const near = i % 2 === 0, x = near ? (right ? r.range(eMin + 16, c.W) : r.range(0, eMax - 16)) : r.range(bx0 + 20, bx1 - 20);
      if (x < bx0 || x > bx1) continue;
      winDefs.push(archW(r, x, r.range(lo + 80, hi - 20), r.range(4, 8)));
    }
    for (let i = 0; i < (port ? 12 : 10); i++) { const x = r.range(bx0 + 30, bx1 - 30), y = r.range(lo + 20, hi - 300); hang.push(r() < 0.5 ? roots(r, x, y, 26, r.range(90, 220), 5, 1) : stalactites(r, x - 40, x + 40, y, r.range(60, 120), 3));}
    if (right) for (let i = 0; i < 4; i++) { const x = (i < 2 ? r.range(eMin + 50, c.W - 40) : r.range(c.W + 100, outR - 100)), by = r.range(lo + 500, hi); colS.push(column(r, x, by, r.range(46, 64), r.range(280, 480), true)); }
    for (let i = 0; i < (port ? 7 : 6); i++) { const x = r.range(bx0 + 20, bx1 - 200), q = ruinWall(r, x, r.range(lo + 160, hi - 20), r.range(110, 190), r.range(40, 60)); walls.push(q.body); wholes.push(...q.holes); }
    out.push(sheet(inter(union(...winDefs), inn), RAMP[0]!, { shadow: false }));
    out.push(sheet(inter(union(...hang), inn), RAMP[0]!, { shadow: false }));
    out.push(sheet(inter(union(...walls), inn), RAMP[3]!, { shadow: { dx: 0, dy: 4, blur: 5, opacity: 0.25, color: P.shadow }, edge: { light: [-nx, -0.3], width: 1.5, color: mix(RAMP[3]!, P["rim-dawn"]!, 0.2) } }));
    if (colS.length) {
      const flutes: Poly[] = []; for (const cs of colS) { const b = bnd(cs); for (let x = b.x0 + 8; x < b.x1 - 6; x += 9) flutes.push(rect(x, b.y0 + 24, 3, b.y1 - b.y0 - 60)); }
      out.push(sheet(inter(union(...colS), inn), RAMP[4]!, { holes: flutes, shadow: { dx: 0, dy: 5, blur: 6, opacity: 0.3, color: P.shadow }, edge: { light: [-1, -0.3], width: 1.5, color: mix(RAMP[4]!, P["rim-dawn"]!, 0.25) } }));
    }
    void seen; void wholes;
    return layer((right ? "gate-r" : "gate-l") + c.sfx, right ? 15 : 14, ...out);
  };
  return { gl: mk(false), gr: mk(true), minOv, covL: avg(pl.map((p) => p[0])), covR: c.W - avg(pr.map((p) => p[0])) };
}
const avg = (a: number[]) => a.reduce((n, v) => n + v, 0) / a.length;

/* ---------- assemble ---------- */
const all: Layer[] = [];
const sh = { d: [] as string[], p: [] as string[] };
const gD = gates(D), gP = gates(V);
all.push(bgLayer(D), cloudsFar(D), peaksFar(D), cloudSea(D), peaksMid(D), mistLayer(), seamLight(D), glowLayer(), flap(D, true), flap(D, false), innerBase(D), ruinArch(D), cavernWall(D), dustLayer(D), gD.gl, gD.gr);
all.push(bgLayer(V), cloudsFar(V), peaksFar(V), cloudSea(V), peaksMid(V), seamLight(V), flap(V, true), flap(V, false), innerBase(V), ruinArch(V), cavernWall(V), dustLayer(V), gP.gl, gP.gr);
void sh;

const BAKE: Record<string, [number, number]> = {
  "dawn-sky": [0.4, 40], "dawn-sky-p": [0.4, 40], "clouds-far": [0.6, 42], "clouds-far-p": [0.6, 42], "peaks-far": [0.7, 45], "peaks-far-p": [0.7, 45],
  "cloud-sea": [0.55, 42], "cloud-sea-p": [0.55, 42], "peaks-mid": [0.75, 48], "peaks-mid-p": [0.75, 48], mist: [0.3, 35], "seam-light": [0.4, 40], "seam-light-p": [0.4, 40],
  "seam-glow": [0.3, 38], "inner-flap-l": [0.75, 50], "inner-flap-r": [0.75, 50], "inner-flap-l-p": [0.7, 48], "inner-flap-r-p": [0.7, 48],
  "inner-base": [0.5, 42], "inner-base-p": [0.45, 40], "ruin-arch": [0.6, 45], "ruin-arch-p": [0.6, 45], "cavern-wall": [0.5, 42], "cavern-wall-p": [0.4, 40],
  dust: [0.5, 38], "dust-p": [0.5, 38], "gate-l": [0.4, 40], "gate-r": [0.4, 40], "gate-l-p": [0.35, 38], "gate-r-p": [0.35, 38],
};
const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
for (const l of all) {
  const [scale, quality] = BAKE[l.id] ?? [1, 60];
  const b = await bakeLayer(SLUG, l, { scale, quality });
  if (!b) throw new Error(`layer ${l.id} empty`);
  baked.set(l.id, b);
}
const r1 = (n: number) => Math.round(n * 10) / 10;
const compose = (c: Cfg, include: string[], place: Record<string, { x?: number; y?: number; s?: number }> = {}) => ({
  width: c.W, height: c.H,
  layers: include.map((id) => {
    const b = baked.get(id)!, p = place[id] ?? {}, s = p.s ?? 1;
    return { id, src: `/art/${SLUG}/${id}.webp`, x: r1(b.x * s + (p.x ?? 0)), y: r1(b.y * s + (p.y ?? 0)), w: r1(b.w * s), h: r1(b.h * s), depth: b.depth };
  }).sort((a, b) => a.depth - b.depth),
});
const dIds = all.filter((l) => !l.id.endsWith("-p") && !["mist", "seam-glow"].includes(l.id)).map((l) => l.id);
const dFull = ["dawn-sky", "clouds-far", "peaks-far", "cloud-sea", "peaks-mid", "mist", "seam-light", "seam-glow", "inner-flap-l", "inner-flap-r", "inner-base", "ruin-arch", "cavern-wall", "dust", "gate-l", "gate-r"];
const pFull = ["dawn-sky-p", "clouds-far-p", "peaks-far-p", "cloud-sea-p", "peaks-mid-p", "mist", "seam-light-p", "seam-glow", "inner-flap-l-p", "inner-flap-r-p", "inner-base-p", "ruin-arch-p", "cavern-wall-p", "dust-p", "gate-l-p", "gate-r-p"];
void dIds;
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const place = { mist: { s: 0.6, x: 228, y: 304 }, "seam-glow": { x: -220, y: 40 } };
const manifest = { slug: SLUG, compositions: { desktop: compose(D, dFull), portrait: compose(V, pFull, place) }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop"); await composite(SLUG, "portrait");
// open-state previews (flaps removed) to check the revealed dawn
for (const [k, c, ids] of [["desktop", D, dFull], ["portrait", V, pFull]] as const) {
  const comp = manifest.compositions[k];
  const ops = [];
  for (const l of comp.layers) {
    if (l.id.startsWith("inner-flap")) continue;
    const x = Math.round(l.x), y = Math.round(l.y), w = Math.round(l.w), h = Math.round(l.h), sx = Math.max(0, -x), sy = Math.max(0, -y);
    const cw = Math.min(w, c.W - x) - sx, ch = Math.min(h, c.H - y) - sy;
    if (cw <= 0 || ch <= 0) continue;
    ops.push({ input: await sharp(join(ROOT, "public", l.src)).resize(w, h).extract({ left: sx, top: sy, width: cw, height: ch }).png().toBuffer(), left: x + sx, top: y + sy });
  }
  await sharp({ create: { width: c.W, height: c.H, channels: 4, background: "#101018" } }).composite(ops).png().toFile(join(ROOT, "art", SLUG, `preview-${k}-open.png`));
  void ids;
  // closed-gate check: gates shifted inward over magenta; any magenta = a gap
  const sft = k === "desktop" ? 700 : 460, gops = [];
  for (const l of comp.layers.filter((q) => q.id.startsWith("gate-"))) {
    const dx = l.id.startsWith("gate-l") ? sft : -sft, x = Math.round(l.x + dx), y = Math.round(l.y), w = Math.round(l.w), h = Math.round(l.h), sx = Math.max(0, -x), sy = Math.max(0, -y);
    const cw = Math.min(w, c.W - x) - sx, ch = Math.min(h, c.H - y) - sy;
    gops.push({ input: await sharp(join(ROOT, "public", l.src)).resize(w, h).extract({ left: sx, top: sy, width: cw, height: ch }).png().toBuffer(), left: x + sx, top: y + sy });
  }
  await sharp({ create: { width: c.W, height: c.H, channels: 4, background: "#ff00ff" } }).composite(gops).png().toFile(join(ROOT, "art", SLUG, `preview-${k}-gates-closed.png`));
}

/* ---------- checks ---------- */
console.log("layers desktop", dFull.length, "portrait", pFull.length);
console.log("bytes total", total, "(KB", Math.round(total / 1024) + ")", "budget 450 KB");
console.log("gate closed min overlap desktop", gD.minOv.toFixed(1), "portrait", gP.minOv.toFixed(1));
console.log("gate rest coverage desktop L %", ((gD.covL / D.W) * 100).toFixed(1), "R %", ((gD.covR / D.W) * 100).toFixed(1), "| portrait L %", ((gP.covL / V.W) * 100).toFixed(1), "R %", ((gP.covR / V.W) * 100).toFixed(1));
if (gD.minOv < 80 || gP.minOv < 80) throw new Error("gate closed overlap < 80");
for (const id of ["inner-flap-l", "inner-flap-r", "gate-l", "gate-r", "inner-flap-l-p", "inner-flap-r-p", "gate-l-p", "gate-r-p"]) console.log(id, JSON.stringify([...manifest.compositions.desktop.layers, ...manifest.compositions.portrait.layers].find((l) => l.id === id)));
for (const [id, b] of baked) console.log(" ", id.padEnd(18), String(b.bytes).padStart(7));
