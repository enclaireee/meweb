// b6-lantern-vault: a cathedral void, an upside-down city, hundreds of paper lanterns. Run: npx tsx art/b6-lantern-vault/build.ts
// Per-layer bake settings need per-layer scale/quality, so layers go through bakeLayer and the manifest is written here
// in the exact bakeBeat format.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, arch, bakeLayer, bridge, column, composite, crystal, cut, difference, ellipse, fern, glow, layer, lantern, mist, mix, noise, offset,
  rect, rng, roots, ruinWall, scatter, sheet, stairs, stalactites, tower, union, vine,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "b6-lantern-vault";
const P: Palette = {
  void: "#070b14", "vault-far": "#0f1a2b", "vault-far-2": "#13213a", "vault-mid": "#1a2b44", "vault-mid-2": "#22364f", "vault-near": "#0c1422",
  chain: "#2a3c55", gate: "#05080f", "rim-lantern": "#c98a52", "lantern-deep": "#b8642e", "lantern-body": "#e8964a", "lantern-hot": "#ffd9a0",
  lamp: "#ffb866", "lamp-core": "#fff1cf", "dust-warm": "#ffcf8a", foreshadow: "#f4c9b8", shadow: "#020409",
};
const W = 1920, H = 1080, PW = 1080, PH = 1920;
const R = (n: number) => rng(60600 + n);

/* ---------- generic helpers ---------- */
type Band = { off: number; blur: number; op: number; rw: number; rm: number; inner?: [number, number] };
const B = {
  far: { off: 4, blur: 6, op: 0.25, rw: 1.5, rm: 0.3 },
  mid: { off: 8, blur: 10, op: 0.35, rw: 2, rm: 0.4, inner: [4, 0.25] },
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
const interp = (pts: Pt[]) => (x: number) => {
  if (x <= pts[0]![0]) return pts[0]![1];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1]!, b = pts[i]!; if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); }
  return pts[pts.length - 1]![1];
};
/** Mirror about the horizontal line y0 (hangs things from the ceiling); ring order is restored for clipper. */
const flipY = (s: Poly | Shape, y0: number): Shape => flat(s).map((ring) => ring.map(([x, y]) => [x, 2 * y0 - y] as Pt).reverse());
const rotRect = (cx: number, cy: number, w: number, h: number, a: number): Poly => {
  const c = Math.cos(a), s = Math.sin(a);
  return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as Pt[]).map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c] as Pt);
};
const cn = (a: string, b: string, t: number) => mix(P[a]!, P[b]!, t);

type PaperOpts = { holes?: (Poly | Shape)[]; rm?: number; light?: Pt; opacity?: number; noRim?: boolean; shadow?: false | { dx: number; dy: number; blur: number; opacity: number }; noInner?: boolean };
/** One sheet with the band recipe: radial light from `src`, shadow away from it, rim toward it, inner shadow. */
function paper(shape: Poly | Shape, fill: string, b: Band, src: Pt, o: PaperOpts = {}): Frag {
  const bb = bnd(shape);
  let lx = o.light ? o.light[0] : src[0] - (bb.x0 + bb.x1) / 2, ly = o.light ? o.light[1] : src[1] - (bb.y0 + bb.y1) / 2;
  const d = Math.hypot(lx, ly) || 1; lx /= d; ly /= d;
  return sheet(shape, fill, {
    holes: o.holes, opacity: o.opacity,
    shadow: o.shadow === false ? false : { color: P.shadow, blur: b.blur, opacity: b.op, dx: -lx * b.off, dy: -ly * b.off, ...o.shadow },
    edge: o.noRim ? undefined : { light: [lx, ly], width: b.rw, color: mix(fill, P["rim-lantern"]!, o.rm ?? b.rm) },
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
/** Chain as a thin stem with bead links (plain rings, no booleans). */
function chain(x: number, y0: number, y1: number, w: number): Shape {
  const out: Shape = [rect(x - w * 0.3, y0, w * 0.6, y1 - y0)], pitch = w * 3.4;
  for (let y = y0 + pitch; y < y1 - pitch / 2; y += pitch) out.push(rect(x - w * 0.55, y - w * 1.1, w * 1.1, w * 2.2));
  return out;
}
/** Stepped terrace outline following `prof`; top(x) = surface y. dir 1: terrace grows up from base (floor); dir -1: hangs from base (ceiling). */
function steps(r: Rng, prof: (x: number) => number, x0: number, x1: number, base: number, amp = 8, dir: 1 | -1 = 1) {
  const pts: Poly = [], st: { a: number; b: number; y: number }[] = [];
  let x = x0;
  while (x < x1) { const b = Math.min(x1, x + r.range(46, 120)), y = prof((x + b) / 2) + r.range(-amp, amp); pts.push([x, y], [b, y]); st.push({ a: x, b, y }); x = b; }
  if (dir === 1) pts.push([x1, base], [x0, base]); else pts.unshift([x0, base]), pts.push([x1, base]);
  return { poly: cut(pts, r, 1.2, 40), top: (xx: number) => (st.find((s) => xx >= s.a && xx <= s.b) ?? st[st.length - 1]!).y };
}

/* ---------- per-composition config ---------- */
type Cfg = {
  port: boolean; sfx: "" | "-p"; W: number; H: number; seed: number; C: Pt; exit: Pt; exW: number; exH: number;
  tiers: [number, number, number][]; nArch: number; // far wall strips [y0, y1, archW]
  haze: [number, number, number, number][]; // extra glows x,y,r,op
  nFar: number; farBox: [number, number, number, number]; nMid: number; midBox: [number, number, number, number]; near: [number, number, number][];
  city: { x0: number; x1: number; depth: number; towers: number; windows: number };
  deckY: number; sag: number; gate: [number, number]; // gatehouse x
  pillars: { x: number; w: number }[]; mistWarm: [number, number, number, number, number][]; mistCool: [number, number, number, number, number][];
  cages: [number, number, number][]; // near cages x, len, size
  nEmb: number; embBox: [number, number, number, number]; ledge: "floor" | "terraces";
  sigma: [number, number];
};
const litOK = (c: Cfg, x: number, y: number, g: number) => (c.port ? y + g <= 1040 : x - g >= 850);
const farFromExit = (c: Cfg, x: number, y: number, d: number) => Math.hypot(x - c.exit[0], (y - c.exit[1]) * 0.8) > d;
const wt = (c: Cfg, x: number, y: number) => 0.28 + 0.72 * Math.exp(-(((x - c.C[0]) / c.sigma[0]) ** 2 + ((y - c.C[1]) / c.sigma[1]) ** 2) / 2);
function pickPts(r: Rng, c: Cfg, n: number, box: [number, number, number, number], ok: (x: number, y: number) => boolean, minD: number): Pt[] {
  const out: Pt[] = [];
  for (let t = 0; out.length < n && t < n * 400; t++) {
    const x = r.range(box[0], box[2]), y = r.range(box[1], box[3]);
    if (r() > wt(c, x, y) || !ok(x, y) || (minD && out.some(([a, b]) => Math.hypot(a - x, b - y) < minD))) continue;
    out.push([x, y]);
  }
  return out;
}

/** Small paper lantern parts (shared by mid and floor lanterns): deep outer, body, hot core with slits, cap, tassel. */
function lampParts(r: Rng, x: number, y: number, rad: number, hi = false) {
  const nseg = hi ? 22 : 14;
  const deep = cut(ellipse(x, y, rad * 0.78, rad, nseg), r, hi ? 1.2 : 0.35, hi ? 18 : 10);
  const body = ellipse(x, y, rad * 0.62, rad * 0.84, nseg);
  const n = hi ? 7 : r.int(4, 6);
  const slits = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n - 0.5, hh = rad * 0.6 * Math.sqrt(Math.max(0.08, 1 - (2 * t) ** 2));
    return ellipse(x + t * rad * 0.74, y, Math.max(0.5, rad * 0.035), hh, 6);
  });
  const hot = difference(ellipse(x, y + rad * 0.02, rad * 0.42, rad * 0.64, nseg), ...slits);
  const cap: Poly[] = [rect(x - rad * 0.24, y - rad * 1.14, rad * 0.48, rad * 0.16), rect(x - rad * 0.12, y - rad * 1.26, rad * 0.24, rad * 0.14)];
  const tass: Poly[] = [rect(x - Math.max(0.7, rad * 0.04), y + rad, Math.max(1.4, rad * 0.08), rad * 0.34), ellipse(x, y + rad * 1.38, rad * 0.1, rad * 0.1, 6)];
  return { deep, body, hot, cap, tass };
}

function build(c: Cfg): Layer[] {
  const { W: w, H: h, sfx, C } = c;
  const L = (id: string, d: number, ...f: (Frag | Frag[])[]) => layer(id + sfx, d, ...f);
  const rs = (n: number) => R(c.seed + n);
  const calmClip = c.port ? rect(-200, -200, w + 400, 1056 + 200) : rect(864, -200, w + 400, h + 400); // where warm may live
  const ex = c.exit[0], ey = c.exit[1], eBase = ey + c.exH / 2;

  /* d0 void */
  const voidR = rs(1);
  const vt: [number, number][] = c.port ? [[560, 420], [380, 290], [240, 170]] : [[640, 430], [440, 300], [280, 200]];
  const voidL = L("void", 0, sheet(rect(0, 0, w, h), P.void!, { shadow: false }),
    ...vt.map(([rx, ry], i) => sheet(inter(cut(ellipse(C[0], C[1], rx, ry, 64), voidR, 3, 120), calmClip), mix(P.void!, P.lamp!, [0.06, 0.1, 0.14][i]!), { shadow: false })));

  /* d1 vault-far: receding arcades, ribs, exit arch */
  const rf = rs(2), farF: Frag[] = [];
  c.tiers.forEach(([y0, y1, aw], k) => {
    const th = y1 - y0, ah = th * 0.6, holes: Poly[] = [];
    const pitch = w / c.nArch;
    for (let i = 0; i < c.nArch; i++) {
      const x = (i + 0.5 + (k % 2) * 0.5) * pitch + rf.range(-4, 4);
      if (Math.abs(x - ex) < 90 && y1 > ey - 90 && y0 < ey + 90) continue;
      holes.push(arch(rf, x, y1 - th * 0.12, aw * rf.vary(0.1), ah * rf.vary(0.08), 0.8));
    }
    const strip = difference(cut(rect(-30, y0, w + 60, th), rf, 1.2, 30), ...holes);
    farF.push(...pile(strip, [mix(P.void!, P["vault-far"]!, 0.45), mix(P.void!, P["vault-far"]!, 0.8)], 4 + k, B.far, C));
  });
  // ribs converging upward to a vanishing point above the canvas
  const ribs: Poly[] = [];
  for (let i = -8; i <= 8; i++) {
    const xb = C[0] + i * (c.port ? 120 : 190), xt = C[0] + i * (c.port ? 40 : 60);
    ribs.push([[xb - 7, h + 40], [xt - 1.6, -40], [xt + 1.6, -40], [xb + 7, h + 40]]);
  }
  farF.push(paper(union(...ribs.map((q) => cut(q, rf, 0.8, 60))), cn("vault-far", "vault-far-2", 0.6), B.far, C, { opacity: 0.55, noInner: true }));
  // exit arch (dawn interior, two tiny peaks) with a raised facade
  const hole = arch(rf, ex, eBase, c.exW, c.exH, 1);
  const peaks: Poly[] = [[[ex - c.exW * 0.3, eBase], [ex - c.exW * 0.15, eBase - c.exH * 0.28], [ex - 2, eBase]], [[ex, eBase], [ex + c.exW * 0.18, eBase - c.exH * 0.2], [ex + c.exW * 0.36, eBase]]];
  const fw = c.exW + 34, facade = union(cut(rect(ex - fw / 2, eBase - c.exH - 22, fw, c.exH + 22 + 4), rf, 1, 30), rect(ex - fw / 2 - 6, eBase - c.exH - 30, fw + 12, 10),
    ...[0, 1, 2, 3].map((i) => rect(ex - fw / 2 - 6 + i * ((fw + 12) / 3.4), eBase - c.exH - 42, (fw + 12) / 7, 12)));
  farF.push(sheet(hole, mix(P.foreshadow!, P["vault-far"]!, 0.3), { shadow: false }), sheet(union(...peaks), P["vault-far"]!, { shadow: false }));
  farF.push(...pile(difference(facade, hole), [P["vault-far-2"]!, cn("vault-far-2", "vault-mid", 0.5)], 4, B.far, C, { rm: 0.3 }));
  const vaultFar = L("vault-far", 1, ...farF);

  /* d2 lanterns-far: dots + shared haze */
  const rd = rs(3);
  const farPts = pickPts(rd, c, c.nFar, c.farBox, (x, y) => litOK(c, x, y, 6) && farFromExit(c, x, y, 70), 9);
  const radii = farPts.map(() => rd.range(2, 4));
  const lanternsFar = L("lanterns-far", 2,
    glow(C[0], C[1], c.port ? 350 : 436, P.lamp!, { opacity: 0.25 }), ...c.haze.map(([x, y, rr, op]) => glow(x, y, rr, P.lamp!, { opacity: op })),
    sheet(union(...farPts.map(([x, y], i) => ellipse(x, y, radii[i]! * 1.25, radii[i]! * 1.45, 8))), P["lantern-deep"]!, { shadow: false }),
    sheet(union(...farPts.map(([x, y], i) => ellipse(x, y, radii[i]! * 0.6, radii[i]! * 0.7, 6))), P["lantern-hot"]!, { shadow: false }));

  /* d3 chains-far */
  const rc = rs(4), cf: Shape[] = [], cages: Poly[] = [], cageHoles: Poly[] = [];
  const nCh = c.port ? 34 : 44;
  for (let i = 0; i < nCh; i++) {
    const x = (i + rc.range(0.1, 0.9)) * (w / nCh), len = rc.range(80, c.port ? 480 : 380), wd = rc.range(1.5, 2);
    cf.push(chain(x, -10, len, wd));
    if (rc() < 0.45) { const cs = rc.range(6, 10), cy = len + cs * 0.6; cages.push(...lantern(x, cy, cs * 2.2).body); cageHoles.push(...lantern(x, cy, cs * 2.2).holes); }
  }
  const chainsFar = L("chains-far", 3, sheet(union(...cf), P.chain!, { shadow: false, opacity: 0.85 }), sheet(cages, P.chain!, { holes: cageHoles, shadow: false }));

  /* d4 hanging-city */
  const rh = rs(5), cy0 = c.city, cmid = (cy0.x0 + cy0.x1) / 2, half = (cy0.x1 - cy0.x0) / 2;
  const depA = (x: number) => 60 + cy0.depth * Math.max(0, 1 - ((x - cmid) / half) ** 2) ** 0.7;
  const depB = (x: number) => 30 + cy0.depth * 0.62 * Math.max(0, 1 - ((x - cmid) / (half * 0.62)) ** 2) ** 0.7;
  const mA = steps(rh, depA, cy0.x0, cy0.x1, -90, 7, -1), mB = steps(rh, depB, cmid - half * 0.62, cmid + half * 0.62, -90, 5, -1);
  const bottom = (x: number) => (Math.abs(x - cmid) < half * 0.58 ? Math.max(mA.top(x), mB.top(x)) : mA.top(x));
  const wins: Poly[] = [];
  for (let i = 0; i < cy0.windows; i++) { const x = rh.range(cy0.x0 + 14, cy0.x1 - 14), ww = rh.range(4, 8), y = rh.range(18, Math.max(30, mA.top(x) - 22)); wins.push(arch(rh, x, y + ww * 1.7, ww, ww * 1.7, 0.3)); }
  const bodies: Shape[] = [], tHoles: Poly[] = [];
  for (let i = 0; i < cy0.towers; i++) {
    const x = cy0.x0 + 30 + ((i + rh.range(0.2, 0.8)) / cy0.towers) * (cy0.x1 - cy0.x0 - 60), hh = rh.range(40, 140), tw = hh * 0.3 + 10, yb = bottom(x) - 4;
    const t = tower(rh, x, yb, tw, hh, { windows: hh > 90 ? 4 : 3 });
    bodies.push(flipY(t.body, yb)); tHoles.push(...t.holes.map((q) => flipY(q, yb)[0]!));
  }
  const stairsS: Poly[] = [], brS: Shape[] = [];
  for (let i = 0; i < (c.port ? 4 : 6); i++) { const x = rh.range(cy0.x0 + 40, cy0.x1 - 120), yb = bottom(x + 40); stairsS.push(flipY(stairs(x, yb - 4, rh.range(60, 100), rh.range(40, 64), 11, rh() < 0.5 ? 1 : -1), yb)[0]!); }
  for (const t of [0.22, 0.5, 0.76]) { const bx = cy0.x0 + (cy0.x1 - cy0.x0) * t, yb = bottom(bx) + 34, bw = rh.range(110, 190); brS.push(flipY(bridge(rh, bx - bw / 2, bx + bw / 2, yb, 8, 4), yb)); }
  const litHoles = [...wins, ...tHoles].filter((q) => litOK(c, q[0]![0], q[0]![1], 0) && (c.port || q[0]![0] > 900));
  const hotW = sheet(union(...litHoles), P["lantern-hot"]!, { shadow: false });
  const city: Frag[] = [hotW];
  city.push(...pile(mA.poly, [P["vault-mid"]!, P["vault-mid-2"]!, cn("vault-mid-2", "rim-lantern", 0.1)], 10, B.mid, C, { holes: wins, rm: 0.3 }));
  city.push(...pile(mB.poly, [P["vault-mid-2"]!, cn("vault-mid-2", "rim-lantern", 0.12)], 8, B.mid, C, { rm: 0.3 }));
  city.push(...pile(union(...bodies), [P["vault-mid-2"]!, cn("vault-mid-2", "rim-lantern", 0.14)], 3, B.mid, C, { holes: tHoles, rm: 0.3 }));
  city.push(paper(union(...stairsS, ...brS), P["vault-mid-2"]!, B.mid, C, { rm: 0.3 }));
  const hangingCity = L("hanging-city", 4, ...city);

  /* d5 stalactites */
  const rst = rs(6);
  const stBack = stalactites(rst, -80, w + 80, 34, c.port ? 300 : 260, c.port ? 30 : 36), stFront = stalactites(rst, -80, w + 80, 20, c.port ? 190 : 170, c.port ? 22 : 26);
  const cry: Shape[] = [];
  for (let i = 0; i < 6; i++) { const x = rst.range(c.port ? 100 : 940, c.port ? 980 : 1840), cr = rst.range(18, 30); cry.push(flipY(crystal(rst, x, 40, cr), 40)); }
  const stal = L("stalactites", 5,
    ...pile(stBack, [P["vault-mid"]!, cn("vault-mid", "vault-mid-2", 0.4)], 6, B.mid, C, { rm: 0.3 }),
    ...pile(stFront, [P["vault-mid-2"]!, cn("vault-mid-2", "vault-mid", 0.5)], 5, B.mid, C, { rm: 0.3 }),
    sheet(union(...cry), cn("vault-mid-2", "rim-lantern", 0.5), { shadow: { dx: 0, dy: 4, blur: 4, opacity: 0.3, color: P.shadow } }));

  /* d6 lanterns-mid */
  const rm = rs(7), midR: number[] = [];
  const mid = pickPts(rm, c, c.nMid, c.midBox, (x, y) => (midR.push(rm.range(10, 24)), litOK(c, x, y, midR[midR.length - 1]! * 3) && farFromExit(c, x, y, 120)), 36);
  const mr = mid.map(() => rm.range(10, 24));
  const parts = mid.map(([x, y], i) => lampParts(rm, x, y, mr[i]!));
  const sh3 = { dx: 0, dy: 3, blur: 3, opacity: 0.35 };
  const lit = (g: (p: ReturnType<typeof lampParts>) => Shape | Poly, side: number, fill: string, extra: PaperOpts = {}) => {
    const sel = parts.filter((_, i) => (mid[i]![0] < C[0]) === (side < 0)).map(g);
    return sel.length ? [sheet(union(...sel.flatMap(flat)), fill, { shadow: { ...sh3, color: P.shadow }, edge: { light: [side < 0 ? 1 : -1, -0.4], width: 1.2, color: mix(fill, P["rim-lantern"]!, 0.35) }, ...extra })] : [];
  };
  const lanternsMid = L("lanterns-mid", 6,
    sheet(union(...mid.flatMap(([x, y], i) => chain(x, -10, y - mr[i]! * 1.26, 1.5))), P.chain!, { shadow: false }),
    ...mid.map(([x, y], i) => glow(x, y, mr[i]! * 3, P.lamp!, { opacity: 0.35 })),
    ...[-1, 1].flatMap((s) => lit((p) => p.deep, s, P["lantern-deep"]!)), ...[-1, 1].flatMap((s) => lit((p) => p.body, s, P["lantern-body"]!, { shadow: false })),
    sheet(union(...parts.flatMap((p) => flat(p.hot))), P["lantern-hot"]!, { shadow: false }),
    sheet(union(...parts.flatMap((p) => [...p.cap, ...p.tass])), P.chain!, { shadow: false }));

  /* d7 bridge: sagging chained bridge */
  const rb = rs(8), dk = c.deckY, bx0 = -120, bx1 = w + 120, bm = (bx0 + bx1) / 2, bh = (bx1 - bx0) / 2;
  const deckY = (x: number) => dk - c.sag / 2 + c.sag * (1 - ((x - bm) / bh) ** 2);
  const topPts: Poly = [], botPts: Poly = [];
  for (let x = bx0; x <= bx1; x += 40) { topPts.push([x, deckY(x)]); botPts.push([x, deckY(x) + 44]); }
  const deck = cut([...topPts, ...botPts.reverse()], rb, 1.4, 34);
  const underArch: Poly[] = [], slits: Poly[] = [];
  for (let x = bx0 + 30; x < bx1 - 30; x += 74) underArch.push(arch(rb, x, deckY(x) + 44, 40, 24, 0.6));
  for (let x = bx0 + 8; x < bx1 - 8; x += 15) slits.push(rect(x, deckY(x) + 4, rb.range(4, 6), 11));
  const plank = cut([...topPts, ...topPts.map(([x, y]) => [x, y + 14] as Pt).reverse()], rb, 0.8, 34);
  const rails: Poly[] = [], posts: Poly[] = [];
  for (const off of [46, 64]) rails.push([...topPts.map(([x, y]) => [x, y - off] as Pt), ...topPts.map(([x, y]) => [x, y - off + 3.2] as Pt).reverse()]);
  for (let x = bx0 + 20; x < bx1; x += 52) posts.push(rect(x, deckY(x) - 64, 3.4, 66));
  const ties: Shape[] = [];
  for (let x = bx0 + 140; x < bx1; x += c.port ? 360 : 330) ties.push(chain(x, -10, deckY(x) - 60, 2.6));
  const ghx = c.gate, gh: { body: Shape; holes: Poly[] }[] = ghx.map((gx, i) => { const hh = rb.range(90, 120), t = tower(rb, gx, deckY(gx) + 4, hh * 0.45 + 12, hh, { windows: 3 }); return i ? t : t; });
  const lanternPosts = [[c.port ? 380 : 1010], [c.port ? 760 : 1640]].map(([px]) => ({ x: px!, y: deckY(px!) }));
  const lp = lanternPosts.map((p) => ({ post: rect(p.x - 3, p.y - 96, 6, 98), lt: lantern(p.x, p.y - 112, 40) }));
  const bridgeF: Frag[] = [];
  bridgeF.push(sheet(union(...ties), P.chain!, { shadow: false }));
  bridgeF.push(...pile(difference(deck, ...underArch), [P["vault-mid"]!, cn("vault-mid", "vault-mid-2", 0.5)], 4, B.mid, C, { rm: 0.3 }));
  bridgeF.push(paper(difference(plank, ...slits), P["vault-mid-2"]!, B.mid, C, { rm: 0.3, noInner: true }));
  bridgeF.push(paper(union(...rails, ...posts), P.chain!, B.mid, C, { rm: 0.3, noInner: true }));
  bridgeF.push(paper(union(...gh.flatMap((g) => g.body)), P["vault-mid"]!, B.mid, C, { holes: gh.flatMap((g) => g.holes), rm: 0.3 }));
  bridgeF.push(paper(union(...lp.flatMap((l) => [l.post, ...l.lt.body])), P["vault-mid-2"]!, B.mid, C, { holes: lp.flatMap((l) => l.lt.holes), rm: 0.3, noInner: true }));
  const bridgeL = L("bridge", 7, ...bridgeF);

  /* d8 pillars-mid */
  const rp = rs(9), pilF: Frag[] = [];
  c.pillars.forEach((pl, pi) => {
    const calm = !c.port && pl.x < 600, rmv = calm ? 0.25 : 0.4;
    const shaft = cut(rect(pl.x - pl.w / 2, -90, pl.w, h + 180), rp, 2.5, 34);
    pilF.push(...pile(shaft, [P["vault-near"]!, P["vault-mid"]!, P["vault-mid-2"]!], 11, B.mid, C, { rm: rmv }));
    const ledges: Poly[] = [], niches: Poly[] = [], vines: Shape[] = [], buttress: Shape[] = [], bh: Poly[] = [];
    for (let y = 70 + pi * 40; y < h + 40; y += rp.range(100, 130)) {
      ledges.push(cut(rect(pl.x - pl.w / 2 - 9, y, pl.w + 18, 12), rp, 1, 24));
      niches.push(arch(rp, pl.x + rp.range(-6, 6), y + 112, pl.w * 0.26, pl.w * 0.55, 0.8));
      if (rp() < 0.7) vines.push(vine(rp, pl.x + rp.range(-pl.w * 0.4, pl.w * 0.4), y + 10, rp.range(50, 200), 10));
      if (rp() < 0.42) { const ww = rp.range(70, 120), side = pl.x < c.C[0] ? 1 : -1, rw = ruinWall(rp, side > 0 ? pl.x + pl.w / 2 - 6 : pl.x - pl.w / 2 - ww + 6, y + 112, ww, rp.range(40, 64)); buttress.push(rw.body); bh.push(...rw.holes); }
    }
    pilF.push(paper(union(...ledges), P["vault-mid-2"]!, B.mid, C, { rm: rmv, noInner: true }));
    pilF.push(sheet(union(...niches), cn("vault-near", "vault-far", 0.4), { shadow: false, inner: { blur: 4, opacity: 0.5, color: P.shadow } }));
    if (buttress.length) pilF.push(paper(union(...buttress), P["vault-mid"]!, B.mid, C, { holes: bh, rm: rmv }));
    pilF.push(sheet(union(...vines), P["vault-near"]!, { shadow: false }));
  });
  const pillarsMid = L("pillars-mid", 8, ...pilF);

  /* d9 mist */
  const mistL = L("mist", 9, ...c.mistWarm.map(([x, y, mw, mh, o]) => mist(x, y, mw, mh, P["dust-warm"]!, o)), ...c.mistCool.map(([x, y, mw, mh, o]) => mist(x, y, mw, mh, P.chain!, o)));

  /* d10 lanterns-near */
  const rn = rs(10), nF: Frag[] = [];
  const nearChains: Shape[] = [];
  const nearTop: Frag[] = [];
  for (const [x, y, rad] of c.near) {
    nearChains.push(chain(x, -10, y - rad * 1.28, 3));
    nF.push(glow(x, y, rad * 4, P.lamp!, { opacity: 0.5, core: P["lamp-core"]! }));
    const lp2 = lampParts(rn, x, y, rad, true);
    const ribHoles = Array.from({ length: 8 }, (_, i) => { const t = (i + 0.5) / 8 - 0.5; return ellipse(x + t * rad * 1.5, y, Math.max(1, rad * 0.025), rad * 0.9 * Math.sqrt(Math.max(0.1, 1 - (2 * t) ** 2)), 6); });
    const lattice: Poly[] = [];
    for (let gx = -0.5; gx <= 0.5; gx += 0.16) for (let gy = -0.7; gy <= 0.7; gy += 0.16) if ((gx / 0.5) ** 2 + (gy / 0.72) ** 2 < 0.8) lattice.push(rotRect(x + gx * rad, y + gy * rad, rad * 0.07, rad * 0.07, Math.PI / 4));
    nF.push(paper(lp2.deep, P["lantern-deep"]!, B.hero, C, { holes: ribHoles, rm: 0.4 }));
    nF.push(paper(lp2.body, P["lantern-body"]!, B.hero, C, { holes: lattice, rm: 0.35, noInner: false }));
    nF.push(paper(lp2.hot, P["lantern-hot"]!, B.hero, C, { rm: 0.2, noRim: true }));
    nF.push(sheet(ellipse(x, y + rad * 0.02, rad * 0.2, rad * 0.34, 14), P["lamp-core"]!, { shadow: false }));
    nearTop.push(paper(union(lp2.cap.map((q) => q), lp2.tass), P["vault-near"]!, B.near, C, { rm: 0.3 }));
  }
  const lanternsNear = L("lanterns-near", 10, sheet(union(...nearChains), P.chain!, { shadow: false }), ...nF, ...nearTop);

  /* d11 strings-near */
  const rsn = rs(11), sn: Shape[] = [], snDark: Shape[] = [];
  const nS = c.port ? 16 : 24;
  for (let i = 0; i < nS; i++) {
    const x = (i + rsn.range(0.15, 0.85)) * (w / nS), len = rsn.range(150, c.port ? 800 : 620);
    (rsn() < 0.5 ? sn : snDark).push(chain(x, -20, len, rsn.range(2.6, 4.2)));
  }
  const cg = c.cages.map(([x, len, s]) => ({ x, len, s, l: lantern(x, len, s * 1.8) }));
  const stringsNear = L("strings-near", 11,
    paper(union(...sn), P.chain!, B.near, C, { rm: 0.3, noInner: true }), paper(union(...snDark), P["vault-near"]!, B.near, C, { rm: 0.3, noInner: true }),
    paper(union(...cg.flatMap((g) => chain(g.x, -20, g.len - g.s * 0.9, 3.2))), P["vault-near"]!, B.near, C, { rm: 0.3, noInner: true }),
    paper(union(...cg.flatMap((g) => g.l.body)), P["vault-near"]!, B.near, C, { holes: cg.flatMap((g) => g.l.holes), rm: 0.3 }));

  /* d12 ledge-near */
  const rl = rs(12), led: Frag[] = [];
  const terr = c.ledge === "floor" ? [{ y: 975, base: 1180, a: 7 }] : [{ y: 1500, base: 2100, a: 6 }, { y: 1640, base: 2100, a: 6 }, { y: 1770, base: 2100, a: 7 }];
  terr.forEach((tc, ti) => {
    const t = steps(rl, interp([[-80, tc.y], [w * 0.3, tc.y - 14], [w * 0.6, tc.y + 6], [w + 80, tc.y - 8]]), -80, w + 80, tc.base, tc.a);
    const fills = ti % 2 ? [P.gate!, P["vault-near"]!, cn("vault-near", "vault-far", 0.5)] : [P["vault-near"]!, cn("vault-near", "vault-far", 0.5), cn("vault-far", "vault-far-2", 0.5)];
    led.push(...pile(t.poly, fills, 12, B.near, C, { rm: 0.3 }));
    const bw: Poly[] = [], stones: Poly[] = [], brick: Shape[] = [], bHoles: Poly[] = [];
    for (let i = 0; i < 38; i++) { const x = rl.range(0, w), y = t.top(x) + rl.range(26, 78), ww = rl.range(5, 9); bw.push(arch(rl, x, y, ww, ww * 1.7, 0.3)); }
    led.push(sheet(union(...bw), P.gate!, { shadow: false }));
    for (let i = 0; i < 70; i++) { const x = rl.range(0, w), y = t.top(x) + rl.range(18, 100); stones.push(cut(rect(x, y, rl.range(10, 30), rl.range(5, 11)), rl, 1, 10)); }
    led.push(sheet(union(...stones), cn("vault-near", "vault-far-2", 0.55), { shadow: false }));
    for (let x = rl.range(0, 60); x < w - 100; x += rl.range(140, 280)) { const rw = ruinWall(rl, x, t.top(x + 50) + 3, rl.range(90, 170), rl.range(32, 60)); brick.push(rw.body); bHoles.push(...rw.holes); }
    led.push(paper(union(...brick), cn("vault-near", "vault-far", 0.7), B.mid, C, { holes: bHoles, rm: 0.3 }));
    if (ti === 0) {
      const parts2: Poly[] = [];
      for (let x = 20; x < w; x += 34 * rl.range(0.85, 1.25)) {
        if (rl() < 0.22) continue;
        const by = t.top(x) + 2, hh = 32 * rl.range(0.55, 1.1);
        parts2.push(rect(x, by - hh, 9, hh), rect(x - 2, by - hh - 6, 13, 6), rect(x - 3, by - 5, 15, 5));
        if (rl() < 0.6) parts2.push(rect(x + 9, by - hh + 4, 25, 5));
      }
      led.push(paper(union(...parts2), cn("vault-near", "vault-mid", 0.55), B.mid, C, { rm: 0.3 }));
      const veg: Shape[] = [];
      for (let i = 0; i < 18; i++) { const x = rl.range(0, w); veg.push(fern(rl, x, t.top(x) + 3, rl.range(26, 58), rl.range(-0.6, 0.6)), roots(rl, x + 30, t.top(x) + 8, 24, rl.range(40, 90), 4, 1)); }
      led.push(sheet(union(...veg), P.gate!, { shadow: false }));
      if (c.ledge === "floor") for (const fx of [1210, 1700]) { // two floor lanterns, right of x 1100
        const fy = t.top(fx) - 36, lp3 = lampParts(rl, fx, fy, 30, true);
        led.push(glow(fx, fy, 150, P.lamp!, { opacity: 0.35 }));
        led.push(paper(lp3.deep, P["lantern-deep"]!, B.near, C, { rm: 0.3 }), sheet(lp3.body, P["lantern-body"]!, { shadow: false }), sheet(lp3.hot, P["lantern-hot"]!, { shadow: false }), sheet(union(lp3.cap, [rect(fx - 18, fy + 28, 36, 8)]), P["vault-near"]!, { shadow: false }));
      }
    } else {
      const bod: Shape[] = [], hol: Poly[] = [];
      for (let x = -20; x < w; x += rl.range(90, 170)) { const tw = rl.range(30, 60), hh = rl.range(50, 100), tt = tower(rl, x, t.top(x) + 3, tw, hh, { windows: 3 }); bod.push(tt.body); hol.push(...tt.holes); }
      led.push(paper(union(...bod), cn("vault-near", "vault-far", 0.8), B.mid, C, { holes: hol, rm: 0.3 }));
    }
  });
  const ledgeL = L("ledge-near", 12, ...led);

  /* d13 embers */
  const re = rs(13), eb = c.embBox;
  const embers = L("embers", 13, ...([[0.4, 50], [0.6, 50], [0.8, 40]] as [number, number][]).map(([op, n]) =>
    sheet(scatter(re, { x0: eb[0], y0: eb[1], x1: eb[2], y1: eb[3] }, Math.round((n * c.nEmb) / 140), (x, y) => (litOK(c, x, y, 0) && farFromExit(c, x, y, 50) ? ellipse(x, y, re.range(1.5, 3), re.range(1.5, 3), 6) : []), 12), P["dust-warm"]!, { shadow: false, opacity: op })));

  return [voidL, vaultFar, lanternsFar, chainsFar, hangingCity, stal, lanternsMid, bridgeL, pillarsMid, mistL, lanternsNear, stringsNear, ledgeL, embers];
}

/* ---------- gates ---------- */
type Seg = { a: number; b: number; p: number };
function phaseSegs(r: Rng, lo: number, hi: number, hMin: number, hMax: number, pins: [number, number, number][]): Seg[] {
  const out: Seg[] = [];
  let y = lo;
  while (y < hi) { const b = Math.min(hi, y + r.range(hMin, hMax)), mid = (y + b) / 2, pin = pins.find(([a, z]) => mid > a && mid < z); out.push({ a: y, b, p: pin ? pin[2] : r() }); y = b; }
  return out;
}
const edgePts = (r: Rng, segs: Seg[], vOf: (p: number) => number): Pt[] => {
  const pts: Pt[] = [];
  for (const s of segs) { const v = vOf(s.p); pts.push([v + r.range(-3, 3), s.a], [v + r.range(-3, 3), s.b]); }
  return pts;
};
function cross(poly: Poly, axis: 0 | 1, c0: number): number[] {
  const o = axis === 1 ? 0 : 1, out: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!, b = poly[(i + 1) % poly.length]!, a1 = a[axis], b1 = b[axis];
    if ((a1 <= c0 && b1 > c0) || (b1 <= c0 && a1 > c0)) out.push(a[o] + ((b[o] - a[o]) * (c0 - a1)) / (b1 - a1));
  }
  return out;
}
const GF = [P.gate!, P["vault-near"]!, cn("gate", "vault-near", 0.5)];

/** Masonry courses + fragments to give a gate body tone-on-tone detail across its whole width. */
function masonry(r: Rng, x0: number, x1: number, y0: number, y1: number, rowH: number, wMin: number, wMax: number, src: Pt): Frag[] {
  const bl: Poly[][] = [[], []], niches: Poly[] = [];
  for (let y = y0, row = 0; y < y1; y += rowH, row++) {
    let x = x0 - r.range(0, wMax * 0.6);
    while (x < x1) {
      const bw = r.range(wMin, wMax);
      bl[r() < 0.5 ? 0 : 1]!.push(cut(rect(x + 3, y + 3, bw - 6, rowH - 6), r, 1.2, 40));
      if (r() < 0.1) niches.push(arch(r, x + bw / 2, y + rowH - 10, Math.min(36, bw * 0.4), rowH - 24, 0.6));
      x += bw;
    }
  }
  const o = { rm: 0.25, noRim: true, noInner: true, shadow: { dx: 0, dy: 3, blur: 3, opacity: 0.5 } } as const;
  return [paper(union(...bl[0]!), cn("vault-near", "vault-mid", 0.8), B.mid, src, o), paper(union(...bl[1]!), cn("vault-near", "vault-mid", 0.45), B.mid, src, o),
    sheet(union(...niches), P.gate!, { shadow: false, inner: { blur: 3, opacity: 0.5, color: P.shadow } })];
}

function gatesDesktop() {
  const rl = R(40), rr = R(41), rs2 = R(42), rd = R(43);
  const segs = phaseSegs(rs2, -60, 1140, 70, 130, [[330, 700, 0.9]]);
  const xl = (p: number) => 220 + 120 * p, xr = (p: number) => xl(p) + 1300;
  const pl = edgePts(rl, segs, xl), pr = edgePts(rr, segs, xr);
  const polyL: Poly = cut([[-800, -60], ...pl, [-800, 1140]], R(44), 2.5, 44), polyR: Poly = cut([[2720, -60], ...pr, [2720, 1140]], R(45), 2.5, 44);
  let minOv = 1e9;
  for (let y = -60; y < 1140; y += 0.5) minOv = Math.min(minOv, Math.max(...cross(polyL, 1, y + 0.25)) + 700 - (Math.min(...cross(polyR, 1, y + 0.25)) - 700));
  const mkGate = (right: boolean, poly: Poly, pts: Pt[], r: Rng): Layer => {
    const nx = right ? -1 : 1, out: Shape[] = [], vOf = right ? xr : xl;
    segs.forEach((s, i) => { // riser details at every step: ruin bits above, roots below
      const nxt = segs[i + 1]; if (!nxt) return;
      const cxm = (vOf(s.p) + vOf(nxt.p)) / 2, up = right ? vOf(nxt.p) < vOf(s.p) : vOf(nxt.p) > vOf(s.p);
      if (up) { const t = r(); out.push(t < 0.35 ? fern(r, cxm, s.b, r.range(24, 44), nx * r.range(0.3, 0.9)) : t < 0.7 ? column(r, cxm, s.b, 14, r.range(28, 54), true) : (() => { const q = ruinWall(r, cxm - 24, s.b + 1, 48, 34); return difference(q.body, ...q.holes); })()); }
      else out.push(roots(r, cxm, s.b - 2, 20, r.range(50, 120), 3, 1), vine(r, cxm, s.b - 2, r.range(40, 100), 8));
    });
    for (let i = 0; i < pts.length; i += 2) out.push(r() < 0.5 ? vine(r, pts[i]![0] - nx * 3, pts[i]![1], r.range(50, 130), 10) : roots(r, pts[i]![0] - nx * 4, pts[i]![1], 14, r.range(40, 100), 3, 1));
    const frags: Frag[] = pile(union(poly, ...out), GF, 16, B.gate, right ? [W / 2 + 400, H / 2] : [W / 2 - 400, H / 2], { rm: right ? 0.5 : 0.25 });
    const mx0 = right ? 1640 + 40 : -780, mx1 = right ? 2700 : 180;
    frags.push(...masonry(r, mx0, mx1, -50, 1130, 78, 96, 210, [W / 2, H / 2]));
    // near pillar fragments (broken top), fluted
    const pxs = right ? [1840, 2110, 2420] : [100, -170, -480], pcs: Frag[] = [];
    pxs.forEach((cx, i) => {
      const colh = 760 + i * 80, col = column(r, cx, 1160, 120, colh, i !== 1);
      pcs.push(...pile(col, [P["vault-near"]!, cn("vault-near", "vault-mid", 0.5), P["vault-mid"]!], 9, B.gate, [W / 2, H / 2], { rm: right ? 0.5 : 0.25 }));
      const fl: Poly[] = Array.from({ length: 4 }, (_, k) => rect(cx - 36 + k * 24, 1160 - colh + 40, 3, colh - 60));
      pcs.push(sheet(union(...fl), P.gate!, { shadow: false, opacity: 0.8 }));
    });
    const chs: Shape[] = Array.from({ length: 12 }, (_, i) => chain((right ? 1700 : -740) + i * (right ? 90 : 80) + r.range(-20, 20), -60, r.range(250, 760), r.range(2.2, 4)));
    pcs.push(paper(union(...chs), P.chain!, B.near, [W / 2, H / 2], { rm: 0.25, noInner: true }));
    if (right) {
      const dl = [[1780, 380, 90], [1850, 660, 70]].map(([x, y, s]) => ({ x: x!, y: y!, l: lantern(x!, y!, s!) }));
      pcs.push(paper(union(...dl.flatMap((d) => [...chain(d.x, -60, d.y - d.l.body.length * 0 - 54, 3), ...d.l.body])), P["vault-near"]!, B.near, [W / 2, H / 2], { holes: dl.flatMap((d) => d.l.holes), rm: 0.4 }));
    }
    return layer(right ? "gate-r" : "gate-l", right ? 15 : 14, ...frags, ...pcs);
  };
  void rd;
  return { gl: mkGate(false, polyL, pl, R(46)), gr: mkGate(true, polyR, pr, R(47)), minOv, restL: [Math.min(...pl.map((p) => p[0])), Math.max(...pl.map((p) => p[0]))], restR: [Math.min(...pr.map((p) => p[0])), Math.max(...pr.map((p) => p[0]))] };
}

function gatesPortrait() {
  const rl = R(50), rr = R(51), rs2 = R(52);
  const segs = phaseSegs(rs2, -60, 1140, 90, 170, [[480, 760, 0.5]]);
  const yt = (p: number) => 170 + 100 * p, yb = (p: number) => yt(p) + 1465;
  const pt = edgePts(rl, segs, yt), pb = edgePts(rr, segs, yb);
  const polyT: Poly = cut([[-60, -860], ...pt.map(([v, u]) => [u, v] as Pt), [1140, -860]], R(53), 2.5, 44), polyB: Poly = cut([[-60, 2780], ...pb.map(([v, u]) => [u, v] as Pt), [1140, 2780]], R(54), 2.5, 44);
  let minOv = 1e9;
  for (let x = -60; x < 1140; x += 0.5) minOv = Math.min(minOv, Math.max(...cross(polyT, 0, x + 0.25)) + 780 - (Math.min(...cross(polyB, 0, x + 0.25)) - 780));
  const mk = (bottom: boolean, poly: Poly, pts: Pt[], r: Rng): Layer => {
    const dir = bottom ? -1 : 1, out: Shape[] = [], src: Pt = [PW / 2, bottom ? 700 : 1100];
    segs.forEach((s) => {
      const yE = (bottom ? yb : yt)(s.p), len = s.b - s.a;
      if (len > 50) out.push(stalactites(r, s.a, s.b, yE, bottom ? 70 : 110, Math.max(2, Math.round(len / 34)), bottom ? -1 : 1));
      for (let k = 0; k < Math.floor(len / 50); k++) {
        const x = r.range(s.a + 6, s.b - 6), t = r();
        if (bottom) out.push(t < 0.4 ? fern(r, x, yE + 2, r.range(30, 62), r.range(-0.6, 0.6)) : t < 0.7 ? column(r, x, yE + 2, 16, r.range(34, 64), true) : roots(r, x, yE + 2, 16, r.range(40, 90), 3, -1));
        else out.push(t < 0.5 ? vine(r, x, yE - 2, r.range(60, 150), 12) : roots(r, x, yE - 2, 16, r.range(60, 140), 3, 1));
      }
    });
    if (bottom) { for (let x = 20; x < PW; x += 160) { const q = ruinWall(r, x, yb(0.5) + 30, r.range(90, 140), 44); out.push(difference(q.body, ...q.holes)); } }
    const frags: Frag[] = pile(union(poly, ...out), GF, 16, B.gate, src, { rm: bottom ? 0.25 : 0.5 });
    const my0 = bottom ? 1800 : -840, my1 = bottom ? 2760 : 90;
    frags.push(...masonry(r, -30, PW + 30, my0, my1, 74, 96, 200, src));
    // chains hanging from / standing on the lip
    const chs: Shape[] = [];
    for (let i = 0; i < 14; i++) { const x = (i + r.range(0.1, 0.9)) * (PW / 14), yy = bottom ? yb(0.5) : yt(0.5); chs.push(chain(x, bottom ? yy + 40 : yy - 400, bottom ? yy + 400 : yy + r.range(160, 420), r.range(2.4, 4))); }
    frags.push(paper(union(...chs), P.chain!, B.near, src, { rm: 0.25, noInner: true }));
    void dir;
    return layer(bottom ? "gate-b-p" : "gate-t-p", bottom ? 15 : 14, ...frags);
  };
  return { gt: mk(false, polyT, pt, R(55)), gb: mk(true, polyB, pb, R(56)), minOv, restT: [Math.min(...pt.map((p) => p[0])), Math.max(...pt.map((p) => p[0]))], restB: [Math.min(...pb.map((p) => p[0])), Math.max(...pb.map((p) => p[0]))] };
}

/* ---------- assemble ---------- */
const desk = build({
  port: false, sfx: "", W, H, seed: 100, C: [1300, 560], exit: [1460, 520], exW: 90, exH: 140,
  tiers: [[60, 300, 20], [320, 520, 28], [540, 740, 38], [760, 960, 50]], nArch: 20,
  haze: [[1720, 420, 360, 0.16], [1560, 800, 300, 0.14]],
  nFar: 220, farBox: [900, 120, 1920, 900], nMid: 60, midBox: [900, 90, 1900, 600],
  near: [[1020, 700, 46], [1400, 290, 58], [1250, 120, 44], [1180, 870, 40], [1540, 740, 60], [1620, 230, 48], [1780, 450, 64], [1480, 860, 44], [1700, 640, 46], [1130, 420, 38]],
  city: { x0: 300, x1: 1500, depth: 220, towers: 16, windows: 60 },
  deckY: 640, sag: 70, gate: [400, 1560], pillars: [{ x: 120, w: 120 }, { x: 980, w: 90 }, { x: 1780, w: 110 }],
  mistWarm: [[1410, 760, 1020, 120, 0.2], [1300, 420, 1000, 180, 0.12]], mistCool: [[432, 770, 864, 130, 0.06], [432, 300, 864, 130, 0.05]],
  cages: [[560, 330, 40], [1260, 520, 34], [1840, 280, 46]],
  nEmb: 140, embBox: [900, 200, 1900, 900], ledge: "floor", sigma: [420, 260],
});
const port = build({
  port: true, sfx: "-p", W: PW, H: PH, seed: 200, C: [540, 700], exit: [620, 600], exW: 80, exH: 120,
  tiers: [[200, 400, 20], [420, 640, 26], [660, 900, 33], [920, 1160, 40], [1180, 1420, 46], [1440, 1680, 50]], nArch: 16,
  haze: [[200, 400, 300, 0.15], [880, 520, 300, 0.15]],
  nFar: 180, farBox: [20, 120, 1060, 1000], nMid: 44, midBox: [40, 200, 1040, 980],
  near: [[300, 420, 56], [800, 330, 50], [200, 780, 52], [850, 830, 48], [430, 170, 42], [660, 880, 44]],
  city: { x0: 40, x1: 1040, depth: 250, towers: 14, windows: 54 },
  deckY: 860, sag: 56, gate: [250, 830], pillars: [{ x: 70, w: 110 }, { x: 1010, w: 100 }],
  mistWarm: [[540, 890, 1000, 140, 0.2], [540, 520, 900, 200, 0.12]], mistCool: [[540, 1300, 1080, 220, 0.06], [540, 1620, 1080, 200, 0.05]],
  cages: [[250, 400, 34], [830, 560, 42], [540, 260, 30]],
  nEmb: 140, embBox: [40, 150, 1040, 1000], ledge: "terraces", sigma: [380, 300],
});
const gD = gatesDesktop(), gP = gatesPortrait();
const dAll = [...desk, gD.gl, gD.gr], pAll = [...port, gP.gt, gP.gb];

// per-layer bake: [scale, quality]. Soft layers small, hero lantern layers crisp (spec: mid band 1.0, q 65).
const BAKE: Record<string, [number, number]> = {
  void: [0.3, 30], "vault-far": [0.2, 28], "lanterns-far": [0.25, 38], "chains-far": [0.3, 32], "hanging-city": [0.3, 36], stalactites: [0.25, 32],
  "lanterns-mid": [0.34, 45], bridge: [0.25, 32], "pillars-mid": [0.22, 32], mist: [0.15, 28], "lanterns-near": [0.36, 50], "strings-near": [0.25, 32],
  "ledge-near": [0.22, 32], embers: [0.3, 32], "gate-l": [0.18, 28], "gate-r": [0.18, 28], "gate-t-p": [0.18, 28], "gate-b-p": [0.18, 28],
};
const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
for (const l of [...dAll, ...pAll]) {
  const [scale, quality] = BAKE[l.id.replace(/-p$/, "")] ?? BAKE[l.id] ?? [0.5, 42];
  const b = await bakeLayer(SLUG, l, { scale, quality });
  if (!b) throw new Error(`layer ${l.id} empty`);
  baked.set(l.id, b);
}
const r1 = (n: number) => Math.round(n * 10) / 10;
const compose = (width: number, height: number, ls: Layer[]) => ({
  width, height,
  layers: ls.map((l) => { const b = baked.get(l.id)!; return { id: l.id, src: `/art/${SLUG}/${l.id}.webp`, x: r1(b.x), y: r1(b.y), w: r1(b.w), h: r1(b.h), depth: b.depth }; }).sort((a, b) => a.depth - b.depth),
});
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: compose(W, H, dAll), portrait: compose(PW, PH, pAll) }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop", P.void); await composite(SLUG, "portrait", P.void);

console.log("layers desktop", dAll.length, "portrait", pAll.length);
console.log("bytes total", total, "(KB", Math.round(total / 1024) + ") budget 450 KB");
console.log("gate-l rest edge x", gD.restL.map(Math.round), "gate-r", gD.restR.map(Math.round), "closed min overlap", gD.minOv.toFixed(1));
console.log("gate-t-p rest edge y", gP.restT.map(Math.round), "gate-b-p", gP.restB.map(Math.round), "closed min overlap", gP.minOv.toFixed(1));
for (const id of ["gate-l", "gate-r", "gate-t-p", "gate-b-p"]) console.log(id, JSON.stringify([...manifest.compositions.desktop.layers, ...manifest.compositions.portrait.layers].find((l) => l.id === id)));
for (const [id, b] of baked) console.log(" ", id.padEnd(18), String(b.bytes).padStart(7));
