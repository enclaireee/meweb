// b3-scale-flip: a colossal hall seen down its axis, tiny architecture against 900 px columns. Run: npx tsx art/b3-scale-flip/build.ts
// Per-band bake settings (bible s13) need per-layer scale/quality, so layers are baked with bakeLayer and the
// manifest is written here in the exact bakeBeat format.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, arch, bakeLayer, bridge, column, composite, cut, difference, ellipse, fern, glow, layer, mist, mix, noise, offset,
  pine, rect, rng, roots, ruinWall, scatter, shaft, sheet, stairs, stalactites, tower, tree, union, vine,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "b3-scale-flip";
const P: Palette = {
  "vault-glow": "#f6c56b", "vault-far": "#e3a14e", "vault-far-2": "#d98e3a", "vault-mid": "#b0652a", "vault-mid-2": "#95522a",
  "vault-near": "#7a3d1c", "rock-mid": "#613019", rock: "#4a2413", "rock-dark": "#33180c", gate: "#1f0e07", sun: "#fff1cf",
  vellum: "#ffdf9e", "rim-warm": "#ffd9a0", lamp: "#ffb866", "lamp-core": "#fffaf0", dust: "#fff4d6", shadow: "#1a0b05",
};
const W = 1920, H = 1080, PW = 1080, PH = 1920;
const VP: Pt = [720, 520], PVP: Pt = [540, 640];
const R = (n: number) => rng(30300 + n);

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
const BIG = rect(-6000, -6000, 14000, 14000);
const inter = (a: Poly | Shape, b: Poly | Shape): Shape => difference(a, difference(BIG, b));
const interp = (pts: Pt[]) => (x: number) => {
  if (x <= pts[0]![0]) return pts[0]![1];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1]!, b = pts[i]!; if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); }
  return pts[pts.length - 1]![1];
};
const rotRect = (cx: number, cy: number, w: number, h: number, a: number): Poly => {
  const c = Math.cos(a), s = Math.sin(a);
  return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as Pt[]).map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c] as Pt);
};
const cn = (a: string, b2: string, t: number) => mix(P[a]!, P[b2]!, t);
const ne = (s: Shape) => s.length > 0;

type PaperOpts = { holes?: (Poly | Shape)[]; rm?: number; light?: Pt; opacity?: number; noRim?: boolean; shadow?: false | { dx: number; dy: number; blur: number; opacity: number }; noInner?: boolean };
/** One sheet with the band recipe: radial light from `sun`, shadow away from it, rim toward it, inner shadow. */
function paper(shape: Poly | Shape, fill: string, b: Band, sun: Pt, o: PaperOpts = {}): Frag {
  const bb = bnd(shape);
  let lx = o.light ? o.light[0] : sun[0] - (bb.x0 + bb.x1) / 2, ly = o.light ? o.light[1] : sun[1] - (bb.y0 + bb.y1) / 2;
  const d = Math.hypot(lx, ly) || 1; lx /= d; ly /= d;
  return sheet(shape, fill, {
    holes: o.holes, opacity: o.opacity,
    shadow: o.shadow === false ? false : { color: P.shadow, blur: b.blur, opacity: b.op, dx: -lx * b.off, dy: -ly * b.off, ...o.shadow },
    edge: o.noRim ? undefined : { light: [lx, ly], width: b.rw, color: mix(fill, P["rim-warm"]!, o.rm ?? b.rm) },
    inner: b.inner && !o.noInner ? { blur: b.inner[0], opacity: b.inner[1], color: P.shadow } : undefined,
  });
}
/** Stacked sheets: same silhouette, each `inset` smaller, fills[0] outermost. */
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
const flatS = (c = 3) => ({ dx: c, dy: c, blur: 4, opacity: 0.25, color: P.shadow! });

/** Stepped terrace silhouette following a profile; `top(x)` gives the surface y for placing things. */
function steps(r: Rng, prof: (x: number) => number, x0: number, x1: number, base: number, amp = 8) {
  const pts: Poly = [], st: { a: number; b: number; y: number }[] = [];
  let x = x0;
  while (x < x1) { const b = Math.min(x1, x + r.range(46, 120)), y = prof((x + b) / 2) + r.range(-amp, amp); pts.push([x, y], [b, y]); st.push({ a: x, b, y }); x = b; }
  pts.push([x1, base], [x0, base]);
  return { poly: cut(pts, r, 1.2, 40), top: (xx: number) => (st.find((s) => xx >= s.a && xx <= s.b) ?? st[st.length - 1]!).y };
}
function strataBands(r: Rng, x0: number, x1: number, y: number, base: number, bands: number): Shape[] {
  const out: Shape[] = [];
  for (let b = 0; b < bands; b++) {
    const yb = y + ((base - y) * b) / bands * 0.9, pts: Poly = [];
    let x = x0, yy = yb + r.range(-10, 10);
    pts.push([x, yy]);
    while (x < x1) { x = Math.min(x1, x + r.range(50, 190)); pts.push([x, yy], [x, (yy = yb + r.range(-22, 22))]); }
    out.push(union(cut([...pts, [x1, base + 80], [x0, base + 80]], r, 1.2, 40)));
  }
  return out;
}

/* ---------- bg + light tiers ---------- */
function bgLayer(id: string, w: number, h: number, vp: Pt, radii: number[], seed: number): Layer {
  const r = R(seed);
  const fills = [cn("vault-far", "vault-glow", 0.3), cn("vault-far", "vault-glow", 0.62), P["vault-glow"]!, cn("vault-glow", "vellum", 0.4)];
  return layer(id, 0, sheet(rect(0, 0, w, h), P["vault-far"]!, { shadow: false }),
    ...radii.map((rad, i) => sheet(cut(ellipse(vp[0], vp[1], rad * 1.25, rad * 0.9, 96), r, 3, 40), fills[i]!, { shadow: false })));
}

/* ---------- far end wall: tiers of tiny arches around the exit arch ---------- */
type FarCfg = { vp: Pt; x0: number; x1: number; y0: number; y1: number; tiers: number[]; n: number; seed: number; stairsN: number; bridgesN: number; towersN: number };
function arcadeFar(id: string, c: FarCfg): Layer {
  const r = R(c.seed), out: Frag[] = [], [vx, vy] = c.vp;
  const exit = arch(r, vx, vy + 60, 80, 120, 1);
  out.push(sheet(exit, P.sun!, { shadow: false }), sheet(offset(exit, -7), P["lamp-core"]!, { shadow: false }));
  const pitch = (c.x1 - c.x0) / c.n, holes: Poly[] = [exit];
  const hitExit = (x: number, w: number, by: number, h: number) => x + w / 2 > vx - 62 && x - w / 2 < vx + 62 && by > vy - 72 && by - h < vy + 72;
  c.tiers.forEach((by, k) => {
    for (let i = 0; i < c.n; i++) {
      const x = c.x0 + pitch * (i + 0.5) + r.range(-3, 3), w = r.range(24, 36), h = w * r.range(1.6, 2.0);
      if (hitExit(x, w, by, h)) continue;
      holes.push(arch(r, x, by, w, h, 0.5));
    }
    // tiny windows between rows
    for (let i = 0; i < c.n * 1.4; i++) {
      const x = c.x0 + r.range(10, c.x1 - c.x0 - 10), y = by + r.range(24, 40), ww = r.range(4, 6.5);
      if (hitExit(x, ww, y, ww * 1.8)) continue;
      holes.push(arch(r, x, y, ww, ww * 1.8, 0.3));
    }
    void k;
  });
  const merl = Array.from({ length: Math.floor((c.x1 - c.x0) / 30) }, (_, i) => rect(c.x0 + i * 30 + 6, c.y0 - 9, 15, 10));
  const mass = union(cut(rect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0), r, 1.5, 30), ...merl);
  out.push(...pile(mass, [P["vault-far-2"]!, cn("vault-far-2", "vault-far", 0.5)], 5, B.far, c.vp, { holes }));
  // ledges, bridges, stairs, towers on top of the mass
  const bod: Shape[] = [], bh: Poly[] = [];
  c.tiers.forEach((by) => bod.push([rect(c.x0 - 4, by + 4, c.x1 - c.x0 + 8, 5)]));
  for (let i = 0; i < c.bridgesN; i++) {
    const k = i % (c.tiers.length - 1), y = (c.tiers[k]! + c.tiers[k + 1]!) / 2 + 8, x = r.range(c.x0 + 20, c.x1 - 130);
    if (x + 100 > vx - 66 && x < vx + 66 && y > vy - 76) continue;
    bod.push(bridge(r, x, x + r.range(70, 110), y, 5, 3));
  }
  for (let i = 0; i < c.stairsN; i++) {
    const by = c.tiers[i % c.tiers.length]!, x = r.range(c.x0 + 10, c.x1 - 60);
    if (x + 44 > vx - 62 && x < vx + 62 && by > vy - 72) continue;
    bod.push([stairs(x, by - 24, 42, 22, 8, i % 2 ? 1 : -1)]);
  }
  for (let i = 0; i < c.towersN; i++) {
    const x = c.x0 + ((i + r.range(0.25, 0.75)) / c.towersN) * (c.x1 - c.x0), h = r.range(34, 66), T = tower(r, x, c.y0 + 8, h * 0.34 + 8, h, { windows: 2 });
    bod.push(T.body); bh.push(...T.holes);
  }
  out.push(paper(union(...bod), P["vault-far"]!, B.far, c.vp, { holes: bh }));
  return layer(id, 1, ...out);
}

/* ---------- far bridge with gatehouses ---------- */
function bridgeFar(id: string, x0: number, x1: number, y: number, arches: number, seed: number, vp: Pt): Layer {
  const r = R(seed), out: Frag[] = [];
  const sh = bridge(r, x0, x1, y, 10, arches);
  const T1 = tower(r, x0 + 34, y + 6, 26, 62, { windows: 3 }), T2 = tower(r, x1 - 34, y + 6, 22, 48, { windows: 2 });
  const T3 = tower(r, (x0 + x1) / 2 + r.range(-60, 60), y + 6, 16, 42, { windows: 2 });
  out.push(paper(union(sh, T1.body, T2.body, T3.body), P["vault-far-2"]!, B.far, vp, { holes: [...T1.holes, ...T2.holes, ...T3.holes] }));
  const lamps = Array.from({ length: 6 }, (_, i) => ellipse(x0 + 80 + ((x1 - x0 - 160) * i) / 5 + r.range(-12, 12), y - 8, 1.8, 1.8, 6));
  out.push(sheet(union(...lamps), P.lamp!, { shadow: false }));
  return layer(id, 2, ...out);
}

/* ---------- colossal arcaded wall (left side of the hall) ---------- */
type Arc = { cx: number; base: number; w: number; h: number };
type WallCfg = { slab: Poly; topAt: (x: number) => number; arcs: Arc[]; seed: number; sun: Pt; xr: [number, number]; yr: [number, number]; ledges: number[]; winN: number; vineN: number; towerXs: number[]; bricksN: number };
function arcadeWall(id: string, c: WallCfg): Layer {
  const r = R(c.seed), out: Frag[] = [];
  const arcP = c.arcs.map((a) => arch(r, a.cx, a.base, a.w, a.h, 1.2));
  const wins: Poly[] = [];
  for (let i = 0, t = 0; i < c.winN && t < 3000; t++) {
    const x = r.range(c.xr[0] + 20, c.xr[1] - 20), y = r.range(c.topAt(x) + 36, c.yr[1]);
    if (c.arcs.some((a) => Math.abs(x - a.cx) < a.w / 2 + 46 && y > a.base - a.h - 46)) continue;
    const w = r.range(6, 10); wins.push(arch(r, x, y, w, w * 1.8, 0.3)); i++;
  }
  out.push(...pile(c.slab, [P["vault-mid-2"]!, P["vault-mid"]!, cn("vault-mid", "vault-far-2", 0.35)], 10, B.hero, c.sun, { holes: wins }));
  const inner = offset(c.slab, -12);
  const bricks = scatter(r, { x0: c.xr[0], y0: c.topAt(c.xr[0]) + 20, x1: c.xr[1], y1: c.yr[1] }, c.bricksN, (x, y) => cut(rect(x, y, r.range(10, 26), r.range(5, 9)), r, 0.6, 20));
  const bi = inter(bricks, inner);
  if (ne(bi)) out.push(sheet(bi, cn("vault-mid", "vault-mid-2", 0.55), { shadow: false }));
  const lg = inter(union(...c.ledges.map((y) => cut(rect(c.xr[0] - 40, y, c.xr[1] - c.xr[0] + 80, 14), r, 1.5, 34))), inner);
  if (ne(lg)) out.push(paper(lg, cn("vault-mid", "vault-far-2", 0.7), B.mid, c.sun));
  // arches far to near: 3 frame tiers, 3 interior tiers, stairs
  for (let i = c.arcs.length - 1; i >= 0; i--) {
    const a = c.arcs[i]!, ap = arcP[i]!;
    ([[34, P["vault-mid"]!], [22, P["vault-far-2"]!], [10, P["vault-far"]!]] as [number, string][]).forEach(([off, f]) => out.push(paper(offset(ap, off), f, B.mid, c.sun, { rm: 0.5 })));
    out.push(...pile(ap, [cn("vault-far", "vault-glow", 0.25), cn("vault-far", "vault-glow", 0.55), cn("vault-far", "vault-glow", 0.85)], 14, B.far, c.sun));
    const sw = a.w * 0.56, st = stairs(a.cx - sw / 2, a.base - a.h * 0.34, sw, a.h * 0.26, 9, i % 2 ? 1 : -1);
    out.push(paper(st, cn("vault-mid", "vault-far-2", 0.4), B.far, c.sun));
    const wn = Array.from({ length: 3 }, (_, k) => arch(r, a.cx + (k - 1) * a.w * 0.22, a.base - a.h * 0.62, 5, 9, 0.2));
    out.push(sheet(union(...wn), P["vault-mid-2"]!, { shadow: false }));
  }
  const vines: Shape[] = [], ferns: Shape[] = [];
  for (let i = 0; i < c.vineN; i++) { const x = r.range(c.xr[0], c.xr[1]); vines.push(vine(r, x, c.topAt(x) + r.range(26, 44), r.range(60, 190), 10)); }
  for (let i = 0; i < c.vineN; i++) { const x = r.range(c.xr[0], c.xr[1]); ferns.push(fern(r, x, c.topAt(x) + 6, r.range(20, 40), r.range(-0.5, 0.5))); }
  out.push(sheet(union(...vines, ...ferns), P["vault-near"]!, { shadow: flatS(3) }));
  const tb: Shape[] = [], th: Poly[] = [];
  for (const x of c.towerXs) { const h = r.range(46, 86), T = tower(r, x, c.topAt(x) + 8, h * 0.34 + 10, h, { windows: 3 }); tb.push(T.body); th.push(...T.holes); }
  out.push(paper(union(...tb), P["vault-mid-2"]!, B.mid, c.sun, { holes: th }));
  return layer(id, 4, ...out);
}

/* ---------- cliff city: right wall in shadow (desktop calm) / lit above litY (portrait) ---------- */
type Wall = { side: 1 | -1; edge: (y: number) => number; cw: number; y0: number; y1: number; ledges: number[]; litY: number; sun: Pt; seed: number; k: number; stairsN: number };
function cliffCity(w: Wall): Frag[] {
  const r = R(w.seed), n2 = noise(w.seed), L = w.side === 1, out: Frag[] = [];
  const ex = (y: number) => w.edge(y) + n2(y / 110, 1) * 22;
  const outerX = L ? -90 : w.cw + 90;
  const pts: Poly = [];
  for (let y = w.y0; y <= w.y1; y += 28) pts.push([ex(y) + r.range(-4, 4), y]);
  const sil: Poly = [[outerX, w.y0], ...pts, [outerX, w.y1]];
  const span = (y: number): [number, number] => (L ? [-40, ex(y) - 38] : [ex(y) + 38, w.cw + 40]);
  const calm = [P.rock!, P["rock-mid"]!, P["vault-near"]!], lit = [P["vault-mid"]!, P["vault-mid-2"]!, P["vault-near"]!];
  if (w.litY <= w.y0) out.push(...pile(sil, calm, 16, B.hero, w.sun, { rm: 0.25 }));
  else {
    out.push(...pile(sil, calm, 16, B.hero, w.sun, { rm: 0.25 }));
    out.push(...pile(inter(sil, cut(rect(-300, -300, w.cw + 600, w.litY + 300), r, 5, 36)), lit, 16, B.hero, w.sun));
  }
  const inner = offset(sil, -36);
  const bandFills = [cn("vault-near", "rock-mid", 0.35), cn("vault-near", "rock-mid", 0.6), P["rock-mid"]!, cn("rock-mid", "rock", 0.5)];
  const b0 = w.y0 + 90;
  const sx0 = L ? -90 : w.cw - 700, sx1 = L ? 700 : w.cw + 90;
  strataBands(r, sx0, sx1, b0, w.y1, bandFills.length).forEach((s, i) => { const q = inter(s, inner); if (ne(q)) out.push(sheet(q, bandFills[i]!, { shadow: { dx: 0, dy: 6, blur: 8, opacity: 0.25, color: P.shadow }, edge: { light: [0, -1], width: 1.5, color: mix(bandFills[i]!, P["rim-warm"]!, 0.2) } })); });
  const wins: Poly[] = [], winFrames: Poly[] = [], ledgeS: Poly[] = [], bld: Shape[] = [], bldH: Poly[] = [], cols: Shape[] = [], ferns: Shape[] = [], vines: Shape[] = [], stairS: Poly[] = [], rts: Shape[] = [];
  w.ledges.forEach((y, i) => {
    const [a, b] = span(y), next = w.ledges[i + 1] ?? w.y1 + 60;
    const sx = L ? a : a + r.range(0, 60), ex1 = L ? b - r.range(0, 60) : b;
    if (ex1 - sx < 120) return;
    const th = r.range(15, 22);
    ledgeS.push(cut(rect(sx, y, ex1 - sx, th), r, 1.6, 34));
    for (const rowY of [y + 46, y + 72]) {
      if (rowY > next - 16) continue;
      for (let x = sx + 8; x < ex1 - 8; x += r.range(14, 44)) {
        if (r() < 0.3) continue;
        const ww = r.range(4, 8) * (w.k > 0.9 ? 1 : 1.1), hh = ww * r.range(1.5, 2);
        wins.push(arch(r, x, rowY, ww, hh, 0.3)); winFrames.push(arch(r, x, rowY + 1.5, ww + 3.5, hh + 3, 0.3));
      }
    }
    for (let k = 0; k < 3; k++) {
      const x = r.range(sx + 20, ex1 - 20), prev = i ? w.ledges[i - 1]! : null;
      if (prev !== null) cols.push(column(r, x, y, 16 * w.k, Math.min(y - prev - 14, 100 * w.k), false));
    }
    let x = sx + r.range(10, 40);
    while (x < ex1 - 40) {
      const t = r();
      if (t < 0.45) { const h = r.range(42, 110) * w.k, tw = h * r.range(0.3, 0.42) + 10, T = tower(r, x + tw / 2, y + 2, tw, h, { windows: r.int(2, 4) }); bld.push(T.body); bldH.push(...T.holes); x += tw + r.range(6, 30); }
      else if (t < 0.72) { const ww = r.range(90, 170); if (x + ww > ex1) { x += 30; continue; } const T = ruinWall(r, x, y + 2, ww, r.range(34, 66) * w.k); bld.push(T.body); bldH.push(...T.holes); x += ww + r.range(10, 40); }
      else { ferns.push(fern(r, x, y + 1, r.range(18, 34), r.range(-0.5, 0.5))); x += r.range(20, 50); }
    }
    for (let k = 0; k < 4; k++) vines.push(vine(r, r.range(sx + 10, ex1 - 10), y + th - 2, r.range(36, 112), 9));
    for (let k = 0; k < 2; k++) rts.push(roots(r, r.range(sx + 20, ex1 - 20), y + th - 2, 22, r.range(50, 100), 3, 1));
    if (i >= 1 && i <= w.stairsN) { const sw = r.range(70, 100), sxx = r.range(sx + 20, ex1 - sw - 20), sh = r.range(46, 68); stairS.push(stairs(sxx, y - sh, sw, sh, 13, r() < 0.5 ? 1 : -1)); }
  });
  out.push(sheet(union(...winFrames), cn("rock-mid", "vault-near", 0.5), { shadow: false }));
  out.push(sheet(union(...wins), P["rock-dark"]!, { shadow: false }));
  out.push(paper(union(...ledgeS), cn("rock-mid", "rock", 0.4), B.mid, w.sun, { rm: 0.25 }));
  if (cols.length) out.push(paper(union(...cols), P["rock-mid"]!, B.mid, w.sun, { rm: 0.25 }));
  if (stairS.length) out.push(paper(union(...stairS), P.rock!, B.mid, w.sun, { rm: 0.25 }));
  out.push(paper(union(...bld), P.rock!, B.mid, w.sun, { holes: bldH, rm: 0.25 }));
  out.push(sheet(union(...vines, ...ferns, ...rts), P["rock-dark"]!, { shadow: false }));
  return out;
}

/* ---------- floor: stepped terraces descending to the exit, trees, stairs, ruins, a river of light ---------- */
type FloorCfg = {
  f: (x: number) => number; offs: number[]; litFills: string[]; calmFills: string[]; litN: number; split: number | null; x0: number; x1: number; base: number;
  seed: number; sun: Pt; trees: number[]; th: [number, number]; amps: number[]; winN: number;
};
function floorFrags(c: FloorCfg): { frags: Frag[]; r: Rng } {
  const r = R(c.seed), out: Frag[] = [];
  const split = c.split === null ? null : cut(rect(c.split, -200, 3000, 3400), r, 6, 50);
  c.offs.forEach((o, k) => {
    const b = steps(r, (x) => c.f(x) + o, c.x0, c.x1, c.base, c.amps[k] ?? 6);
    const litK = k < c.litN;
    if (split) {
      const left = difference(b.poly, split), right = inter(b.poly, split);
      if (ne(left)) out.push(paper(left, litK ? c.litFills[k]! : c.calmFills[k]!, B.mid, c.sun, { rm: litK ? 0.45 : 0.25 }));
      if (ne(right)) out.push(paper(right, c.calmFills[k]!, B.mid, c.sun, { rm: 0.25 }));
    } else out.push(paper(b.poly, litK ? c.litFills[k]! : c.calmFills[k]!, B.mid, c.sun, { rm: litK ? 0.45 : 0.25 }));
    const isLit = (x: number) => litK && (c.split === null || x < c.split);
    const Ls: (Poly | Shape)[] = [], Cs: (Poly | Shape)[] = [], LsP: Poly[] = [], CsP: Poly[] = [], LwH: Poly[] = [], CwH: Poly[] = [], Lw: Shape[] = [], Cw: Shape[] = [], Lt: Shape[] = [], Ct: Shape[] = [], Lc: Shape[] = [], Cc: Shape[] = [];
    void Ls; void Cs;
    for (let i = 0; i < c.winN; i++) { const x = r.range(c.x0 + 10, c.x1 - 10), w = r.range(4, 7), y = b.top(x) + r.range(14, 34); (isLit(x) ? LsP : CsP).push(arch(r, x, y, w, w * 1.7, 0.3)); }
    out.push(sheet(union(...(LsP.length ? LsP : [rect(0, 0, 0.1, 0.1)])), P["rock-dark"]!, { shadow: false }));
    if (CsP.length) out.push(sheet(union(...CsP), P["rock-dark"]!, { shadow: false }));
    for (let i = 0; i < (c.trees[k] ?? 0); i++) {
      const x = r.range(c.x0 + 60, c.x1 - 60), h = r.range(c.th[0] + k * 3, c.th[1]), t = i % 2 ? pine(r, x, b.top(x) + 3, h) : tree(r, x, b.top(x) + 3, h);
      (isLit(x) ? Lt : Ct).push(t);
    }
    for (let i = 0; i < 2; i++) {
      const x = r.range(c.x0 + 60, c.x1 - 100), st = stairs(x, b.top(x) - 26, r.range(54, 70), 26, 8, i ? 1 : -1);
      (isLit(x) ? Lc : Cc).push([st]);
      const x2 = r.range(c.x0 + 60, c.x1 - 100), q = ruinWall(r, x2, b.top(x2) + 2, r.range(90, 150), r.range(34, 56));
      if (isLit(x2)) { Lw.push(q.body); LwH.push(...q.holes); } else { Cw.push(q.body); CwH.push(...q.holes); }
      const x3 = r.range(c.x0 + 60, c.x1 - 60), cl = column(r, x3, b.top(x3) + 2, r.range(14, 18), r.range(40, 70), true);
      (isLit(x3) ? Lc : Cc).push(cl);
    }
    const lf = k < 2 ? P["vault-near"]! : P["rock-mid"]!;
    if (Lt.length) out.push(sheet(union(...Lt), lf, { shadow: flatS() }));
    if (Ct.length) out.push(sheet(union(...Ct), P["rock-dark"]!, { shadow: flatS() }));
    if (Lw.length) out.push(paper(union(...Lw), P["vault-mid-2"]!, B.mid, c.sun, { holes: LwH }));
    if (Cw.length) out.push(paper(union(...Cw), P.rock!, B.mid, c.sun, { holes: CwH, rm: 0.25 }));
    if (Lc.length) out.push(paper(union(...Lc), P["vault-near"]!, B.mid, c.sun, { rm: 0.4 }));
    if (Cc.length) out.push(paper(union(...Cc), P.rock!, B.mid, c.sun, { rm: 0.25 }));
  });
  return { frags: out, r };
}
/** River of light: a meandering vellum ribbon with dark banks and ripple slits. */
function riverFrags(r: Rng, x0: number, y0: number, y1: number, hw0: number, grow: number, meander: number): Frag[] {
  const cx = (y: number) => x0 + Math.sin((y - y0) / 95) * meander * Math.min(1, (y - y0) / 200);
  const hw = (y: number) => hw0 + (y - y0) * grow;
  const ribbon = (k: number): Poly => {
    const Lp: Pt[] = [], Rp: Pt[] = [];
    for (let y = y0; y <= y1; y += 24) { Lp.push([cx(y) - hw(y) * k + r.range(-2, 2), y]); Rp.push([cx(y) + hw(y) * k + r.range(-2, 2), y]); }
    return [...Lp, ...Rp.reverse()];
  };
  const main = ribbon(1), inner = ribbon(0.5);
  const slits = Array.from({ length: 18 }, () => { const y = r.range(y0 + 30, y1 - 12); return ellipse(cx(y) + r.range(-hw(y) * 0.6, hw(y) * 0.6), y, r.range(14, 40) * (0.5 + (y - y0) / 450), 2.2, 10); });
  return [
    sheet(offset(main, 8), cn("vault-mid-2", "vault-near", 0.5), { shadow: false }),
    sheet(difference(main, ...slits), P.vellum!, { shadow: false, opacity: 0.7 }),
    sheet(inner, P.sun!, { shadow: false, opacity: 0.5 }),
  ];
}

/* ---------- colossal columns ---------- */
type Col = { x: number; base: number; w: number; h: number; calm?: boolean; litY?: number; seed: number };
function columnsLayer(id: string, cols: Col[], sun: Pt): Layer {
  const out: Frag[] = [];
  const calmF = [P.rock!, P["rock-mid"]!, cn("rock-mid", "vault-near", 0.5)], litF = [P["vault-near"]!, P["vault-mid-2"]!, P["vault-mid"]!];
  const flutes = (x: number, w: number, y0: number, y1: number, fill: string) => sheet(union(...[-0.28, -0.1, 0.1, 0.28].map((t) => rect(x + t * w - 1.5, y0, 3, y1 - y0))), fill, { shadow: false });
  for (const c of cols) {
    const r = R(c.seed), sh = column(r, c.x, c.base, c.w, c.h, false), inset = Math.max(8, c.w * 0.14);
    const top = c.base - c.h;
    if (c.calm) { out.push(...pile(sh, calmF, inset, B.hero, sun, { rm: 0.25 })); out.push(flutes(c.x, c.w, top + c.h * 0.12, c.base - c.h * 0.1, P["rock-mid"]!)); }
    else if (c.litY) {
      out.push(...pile(sh, calmF, inset, B.hero, sun, { rm: 0.25 }));
      out.push(flutes(c.x, c.w, c.litY + 20, c.base - c.h * 0.08, P["rock-mid"]!));
      out.push(...pile(inter(sh, rect(-100, -400, 1400, c.litY + 400)), litF, inset, B.hero, sun));
      out.push(flutes(c.x, c.w, top + c.h * 0.12, c.litY - 24, cn("vault-mid", "vault-mid-2", 0.6)));
    } else { out.push(...pile(sh, litF, inset, B.hero, sun)); out.push(flutes(c.x, c.w, top + c.h * 0.12, c.base - c.h * 0.1, cn("vault-mid", "vault-mid-2", 0.6))); }
    const rt: Shape[] = [];
    for (let k = 0; k < 5; k++) rt.push(roots(r, c.x + r.range(-c.w * 0.3, c.w * 0.3), top + c.h * (0.2 + 0.17 * k) * r.vary(0.1), c.w * 0.9, r.range(90, 170), 3, 1));
    rt.push(vine(r, c.x - c.w * 0.4, top + c.h * 0.3, 190, 10), vine(r, c.x + c.w * 0.35, top + c.h * 0.5, 140, 10));
    out.push(sheet(union(...rt), P["rock-dark"]!, { shadow: false }));
    const sx = c.w * 1.55;
    out.push(paper(union(rect(c.x - sx, c.base - 10, sx * 2, 12), rect(c.x - sx * 0.8, c.base - 22, sx * 1.6, 12)), c.calm || c.litY ? P["rock-mid"]! : P["vault-near"]!, B.mid, sun, { rm: 0.3 }));
  }
  return layer(id, 7, ...out);
}

/* ---------- atmosphere ---------- */
function shaftsLayer(id: string, xs: number[], y: number, len: number, angles: number[], ops: number[]) {
  return layer(id, 8, ...xs.map((x, i) => shaft(x, y, 36, 150, len * (0.9 + 0.1 * (i % 2)), angles[i]!, P.vellum!, ops[i % ops.length]!)));
}
function dustLayer(id: string, region: { x0: number; y0: number; x1: number; y1: number }, seed: number, n = 55) {
  const r = R(seed);
  return layer(id, 12, ...([[n, 0.35], [n, 0.6], [n - 6, 0.8]] as [number, number][]).map(([k, op]) =>
    sheet(scatter(r, region, k, (x, y) => ellipse(x, y, r.range(1.5, 3.6), r.range(1.5, 3.6), 6), 14), P.dust!, { shadow: false, opacity: op })));
}

/* ---------- ribbed ceiling ---------- */
function ceilingLayer(id: string, c: { w: number; band: number; vp: Pt; seed: number; oculi: number[]; nStal: number; litX: number; rootsN: number }): Layer {
  const r = R(c.seed), n2 = noise(c.seed), out: Frag[] = [], [vx, vy] = c.vp;
  const bot: Poly = [];
  for (let x = -220; x <= c.w + 220; x += 50) bot.push([x + r.range(-6, 6), c.band - 22 + n2(x / 130, 3) * 18 + r.range(-4, 4)]);
  const poly: Poly = [[-220, -400], [c.w + 220, -400], ...bot.reverse()];
  const shape = union(poly, stalactites(r, -220, c.w + 220, c.band - 14, 150, c.nStal));
  const oc = c.oculi.map((x) => cut(ellipse(x, c.band * 0.42, 26, 16, 20), r, 1, 20));
  out.push(sheet(union(...oc.map((o) => offset(o, 3))), P.vellum!, { shadow: false }));
  out.push(...pile(shape, [P.rock!, P["rock-mid"]!, P["vault-near"]!], 14, B.near, c.vp, { holes: oc, rm: 0.3 }));
  const inner = offset(shape, -12);
  const ribsL: Poly[] = [], ribsR: Poly[] = [];
  for (let i = -9; i <= 9; i++) {
    const xi = vx + (i + r.range(-0.1, 0.1)) * 135, yb = c.band - 10, t = (-120 - vy) / (yb - vy), xt = vx + (xi - vx) * t, wb = 22, wt = wb * t;
    const q: Poly = [[xi - wb / 2, yb], [xt - wt / 2, -120], [xt + wt / 2, -120], [xi + wb / 2, yb]];
    (xi < c.litX ? ribsL : ribsR).push(cut(q, r, 1.2, 40));
  }
  const rl = inter(union(...ribsL), inner), rr = inter(union(...ribsR), inner);
  if (ne(rl)) out.push(paper(rl, cn("vault-near", "vault-mid-2", 0.4), B.mid, c.vp, { holes: [] }));
  if (ne(rr)) out.push(paper(rr, cn("rock-mid", "vault-near", 0.45), B.mid, c.vp, { rm: 0.25 }));
  const beams = [0.28, 0.6].map((t) => cut(rect(-200, c.band * t, c.w + 400, 14), r, 1.2, 40));
  const bm = inter(union(...beams), inner);
  if (ne(bm)) out.push(paper(bm, cn("rock-mid", "vault-near", 0.3), B.mid, c.vp, { rm: 0.25 }));
  const cof: Poly[] = [];
  for (let i = 0; i < 60; i++) { const x = r.range(-100, c.w + 100), y = r.range(8, c.band - 50); cof.push(rect(x, y, r.range(8, 16), r.range(4, 7))); }
  const cf = inter(union(...cof), inner);
  if (ne(cf)) out.push(sheet(cf, P["rock-dark"]!, { shadow: false }));
  const rt: Shape[] = [];
  for (let i = 0; i < c.rootsN; i++) { const x = r.range(-100, c.w + 100); rt.push(roots(r, x, c.band - 14, 50, r.range(60, 190), 4, 1)); }
  out.push(sheet(union(...rt), P["rock-dark"]!, { shadow: false }));
  return layer(id, 9, ...out);
}

/* ---------- near stair, balustrade ---------- */
function stairsNear(id: string, c: { x: number; y: number; w: number; h: number; steps: number; landing: number; seed: number; sun: Pt }): Layer {
  const r = R(c.seed), out: Frag[] = [];
  const body = union(stairs(c.x, c.y, c.w, c.h, c.steps, 1), rect(c.x + c.w - 4, c.y, c.landing + 4, c.h));
  out.push(...pile(body, [P["rock-dark"]!, P.rock!, cn("rock", "rock-mid", 0.5)], 12, B.near, c.sun, { rm: 0.25 }));
  const sw = c.w / c.steps, tr: Poly[] = [], posts: Poly[] = [], cr: Poly[] = [];
  for (let k = 0; k < c.steps; k++) {
    const ty = c.y + c.h - ((k + 1) / c.steps) * c.h;
    tr.push(rect(c.x + k * sw, ty, sw, 5));
    if (k % 2 === 0 && r() > 0.2) { const h = 34 * r.range(0.5, 1.1), px = c.x + k * sw + sw * 0.3; posts.push(rect(px, ty - h, 9, h), rect(px - 2, ty - h - 6, 13, 6)); if (r() < 0.6) posts.push(rect(px + 9, ty - h + 5, sw * 2 - 9, 5)); }
  }
  for (let k = 0; k < 4; k++) posts.push(rect(c.x + c.w + 20 + k * 58 * r.range(0.9, 1.2), c.y - 30 * r.range(0.5, 1.1), 9, 30), rect(c.x + c.w + 18 + k * 58, c.y - 36, 13, 6));
  for (let i = 0; i < 30; i++) { const x = r.range(c.x + 30, c.x + c.w + c.landing - 30), y = r.range(c.y + 40, c.y + c.h - 30); cr.push(rotRect(x, y, 3.5, r.range(24, 60), r.range(1.1, 2.0))); }
  out.push(sheet(union(...tr), cn("rock", "rock-mid", 0.75), { shadow: false }));
  out.push(sheet(union(...cr), P["rock-dark"]!, { shadow: false }));
  out.push(paper(union(...posts), P.rock!, B.mid, c.sun, { rm: 0.25 }));
  const fr = Array.from({ length: 6 }, () => fern(r, r.range(c.x, c.x + c.w), c.y + c.h - 4, r.range(24, 44), r.range(-0.5, 0.5)));
  out.push(sheet(union(...fr), P["rock-dark"]!, { shadow: false }));
  return layer(id, 10, ...out);
}

/* ---------- near ground lip ---------- */
function rockNear(id: string, seed: number, x0: number, x1: number, prof: Pt[], base: number, sun: Pt, fernN: number): Layer {
  const r = R(seed), out: Frag[] = [], pr = interp(prof);
  const t = steps(r, pr, x0, x1, base, 7);
  out.push(...pile(t.poly, [P["rock-dark"]!, P.rock!, cn("rock", "rock-mid", 0.5)], 12, B.near, sun, { rm: 0.25 }));
  const peb = scatter(r, { x0: x0 + 10, y0: pr(x0 + 400) + 30, x1: x1 - 10, y1: pr(x0 + 400) + 110 }, 44, (x, y) => cut(rect(x, y, r.range(6, 20), r.range(4, 10)), r, 1, 8));
  out.push(sheet(peb, cn("rock", "rock-mid", 0.75), { shadow: false }));
  const cracks = Array.from({ length: 20 }, () => { const x = r.range(x0 + 20, x1 - 20), y = pr(x) + r.range(30, 90), l = r.range(24, 70), a = r.range(1.1, 2.0); return rotRect(x, y, 3.5, l, a); });
  out.push(sheet(union(...cracks), P["rock-dark"]!, { shadow: false }));
  const stones: Shape[] = [];
  for (let i = 0; i < 16; i++) { const x = r.range(x0 + 30, x1 - 30); stones.push([cut([[x, t.top(x) + 2], [x + r.range(14, 30), t.top(x) + 2], [x + r.range(10, 24), t.top(x) - r.range(12, 26)], [x + 3, t.top(x) - r.range(6, 18)]], r, 0.8, 12)]); }
  out.push(paper(union(...stones), P.rock!, B.mid, sun, { rm: 0.25 }));
  const fr: Shape[] = [], rt: Shape[] = [];
  for (let i = 0; i < fernN; i++) { const x = r.range(x0 + 10, x1 - 10); fr.push(fern(r, x, t.top(x) + 3, r.range(26, 58), r.range(-0.6, 0.6))); }
  for (let i = 0; i < Math.round(fernN / 2); i++) { const x = r.range(x0 + 30, x1 - 30); rt.push(roots(r, x, t.top(x) + 8, 30, r.range(40, 100), 4, 1)); }
  out.push(sheet(union(...fr, ...rt), P["rock-dark"]!, { shadow: false }));
  return layer(id, 11, ...out);
}

/* ---------- near hanging roots ---------- */
function rootsNear(id: string, c: { xs: number[]; topY: number; seed: number; sun: Pt; lenMax: number; sparseFrom: number }): Layer {
  const r = R(c.seed), a: Shape[] = [], g: Shape[] = [];
  for (const x of c.xs) {
    if (x > c.sparseFrom && r() < 0.5) continue;
    const len = r.range(c.lenMax * 0.5, c.lenMax);
    (r() < 0.3 ? g : a).push(roots(r, x, c.topY - 24, r.range(40, 110), len, r.int(3, 5), 1));
    (r() < 0.3 ? g : a).push(vine(r, x + r.range(-40, 40), c.topY - 24, r.range(110, c.lenMax * 0.95), 16));
  }
  return layer(id, 13, paper(union(...a), P["rock-dark"]!, B.near, c.sun, { rm: 0.3 }), paper(union(...g), P.gate!, B.near, c.sun, { rm: 0.25 }));
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
function crossY(poly: Poly, c: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!, b = poly[(i + 1) % poly.length]!;
    if ((a[1] <= c && b[1] > c) || (b[1] <= c && a[1] > c)) out.push(a[0] + ((b[0] - a[0]) * (c - a[1])) / (b[1] - a[1]));
  }
  return out;
}
/** Tone-on-tone body: strata, bricks, niches, columns, ruins, roots, so a closed gate is never a flat slab. */
function gateBody(r: Rng, inner: Shape, bx: [number, number], by: [number, number], sun: Pt, dens: number): Frag[] {
  const out: Frag[] = [], G = P.gate!, D = P["rock-dark"]!, K = P.rock!;
  const nb = Math.round((by[1] - by[0]) / 170);
  strataBands(r, bx[0], bx[1], by[0], by[1], nb).forEach((s, i) => {
    const f = mix(G, D, 0.2 + 0.55 * ((i * 0.61) % 1)), q = inter(s, inner);
    if (ne(q)) out.push(sheet(q, f, { shadow: { dx: 0, dy: 8, blur: 10, opacity: 0.3, color: P.shadow }, edge: { light: [0, -1], width: 1.5, color: mix(f, P["rim-warm"]!, 0.18) } }));
  });
  const area = (bx[1] - bx[0]) * (by[1] - by[0]) / 1e6;
  const br = inter(scatter(r, { x0: bx[0], y0: by[0], x1: bx[1], y1: by[1] }, Math.round(120 * area * dens), (x, y) => cut(rect(x, y, r.range(14, 34), r.range(6, 11)), r, 0.6, 20)), inner);
  if (ne(br)) out.push(sheet(br, mix(G, D, 0.8), { shadow: false }));
  const nich: Poly[] = [];
  for (let y = by[0] + 120; y < by[1] - 100; y += 170) for (let x = bx[0] + 40; x < bx[1] - 40; x += r.range(70, 120)) if (r() < 0.7) { const w = r.range(30, 46); nich.push(arch(r, x, y, w, w * 1.9, 0.6)); }
  const ni = inter(union(...nich), inner);
  if (ne(ni)) out.push(sheet(ni, G, { shadow: false }));
  const cols: Shape[] = [], rwB: Shape[] = [], rwH: Poly[] = [];
  for (let i = 0; i < Math.round(8 * area * dens); i++) { const x = r.range(bx[0] + 30, bx[1] - 30), y = r.range(by[0] + 200, by[1] - 40); cols.push(column(r, x, y, r.range(34, 58), r.range(140, 300), true)); }
  for (let i = 0; i < Math.round(7 * area * dens); i++) { const x = r.range(bx[0] + 30, bx[1] - 200), y = r.range(by[0] + 100, by[1] - 40), q = ruinWall(r, x, y, r.range(130, 220), r.range(50, 80)); rwB.push(q.body); rwH.push(...q.holes); }
  const co = inter(union(...cols), inner);
  if (ne(co)) out.push(paper(co, mix(D, K, 0.35), B.mid, sun, { rm: 0.25 }));
  const rw = inter(union(...rwB), inner);
  if (ne(rw)) out.push(paper(rw, mix(D, K, 0.15), B.mid, sun, { holes: rwH, rm: 0.25 }));
  const rt: Shape[] = [];
  for (let i = 0; i < Math.round(14 * area * dens); i++) { const x = r.range(bx[0] + 30, bx[1] - 30), y = r.range(by[0], by[1] - 200); rt.push(roots(r, x, y, 40, r.range(80, 200), 4, 1), vine(r, x + 20, y, r.range(90, 200), 12)); }
  const ro = inter(union(...rt), inner);
  if (ne(ro)) out.push(sheet(ro, D, { shadow: false }));
  return out;
}
function makeGate(id: string, depth: number, side: 1 | -1, xOf: (p: number) => number, outer: number, lo: number, hi: number, segs: Seg[], seed: number, sun: Pt, rm: number, bx: [number, number], dens: number) {
  const r = R(seed), d = R(seed + 1), nx = side;
  const pts = edgePts(r, segs, xOf);
  const poly: Poly = [[outer, lo], ...pts.map(([v, u]) => [v, u] as Pt), [outer, hi]];
  const out: Shape[] = [];
  segs.forEach((s, i) => {
    const nxt = segs[i + 1]; if (!nxt) return;
    const va = xOf(s.p), vb = xOf(nxt.p), u = s.b, cx = (va + vb) / 2;
    const up = side === -1 ? vb < va : vb > va;
    if (up) { const t = d(); out.push(t < 0.3 ? fern(d, cx, u, d.range(24, 44), nx * d.range(0.3, 0.9)) : t < 0.55 ? column(d, cx, u, 14, d.range(28, 54), true) : t < 0.8 ? pine(d, cx, u, d.range(36, 60)) : (() => { const q = ruinWall(d, cx - 24, u + 1, 48, 34); return difference(q.body, ...q.holes); })()); }
    else out.push(roots(d, cx, u - 2, 20, d.range(50, 120), 3, 1), vine(d, cx, u - 2, d.range(40, 100), 8));
  });
  for (let i = 0; i < pts.length; i += 2) {
    const [v, u] = pts[i]!, t = d();
    if (t < 0.5) out.push(vine(d, v - nx * 3, u, d.range(50, 130), 10));
    else if (t < 0.75) out.push(roots(d, v - nx * 4, u, 14, d.range(40, 100), 3, 1));
    else out.push(fern(d, v - nx * 4, u, d.range(26, 52), nx * d.range(0.4, 1)));
  }
  const body = union(poly, ...out);
  const fr = pile(body, [P.rock!, P["rock-dark"]!, P.gate!], 16, B.gate, sun, { rm });
  const inner = offset(poly, -34);
  const detail = gateBody(R(seed + 2), inner, bx, [lo, hi], sun, dens);
  return { lay: layer(id, depth, ...fr, ...detail), poly, pts };
}
function gatePair(c: { ids: [string, string]; xl: (p: number) => number; gap: number; lo: number; hi: number; outerL: number; outerR: number; sun: Pt; seed: number; hold: [number, number]; shift: number; bxL: [number, number]; bxR: [number, number]; dens: number }) {
  const segs = phaseSegs(R(c.seed), c.lo, c.hi, c.hold[0], c.hold[1]);
  const xr = (p: number) => c.xl(p) + c.gap;
  const gl = makeGate(c.ids[0], 14, 1, c.xl, c.outerL, c.lo, c.hi, segs, c.seed + 10, c.sun, 0.5, c.bxL, c.dens);
  const gr = makeGate(c.ids[1], 15, -1, xr, c.outerR, c.lo, c.hi, segs, c.seed + 20, c.sun, 0.25, c.bxR, c.dens);
  let minOv = 1e9;
  for (let y = c.lo + 2; y < c.hi - 2; y += 0.5) {
    const l = Math.max(...crossY(gl.poly, y + 0.25)), r2 = Math.min(...crossY(gr.poly, y + 0.25));
    minOv = Math.min(minOv, l + c.shift - (r2 - c.shift));
  }
  const ext = (pts: Pt[]) => [Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0]))].map(Math.round);
  return { gl: gl.lay, gr: gr.lay, minOv, restL: ext(gl.pts), restR: ext(gr.pts) };
}

/* ================= desktop assembly ================= */
const fD = (x: number) => 650 + (x < 720 ? (720 - x) * 0.5 : (x - 720) * 0.45);
const floorD = (() => {
  const { frags, r } = floorFrags({
    f: fD, offs: [0, 38, 84, 142, 212], litFills: [P["vault-mid"]!, P["vault-mid-2"]!, P["vault-near"]!, cn("vault-near", "rock-mid", 0.5), P["rock-mid"]!],
    calmFills: [P["vault-near"]!, cn("vault-near", "rock-mid", 0.4), cn("vault-near", "rock-mid", 0.7), P["rock-mid"]!, P.rock!], litN: 5, split: 1000,
    x0: -60, x1: 2000, base: 1180, seed: 60, sun: VP, trees: [3, 4, 4, 4, 3], th: [20, 50], amps: [6, 6, 7, 8, 9], winN: 30,
  });
  return layer("floor-terraces", 6, ...frags, ...riverFrags(r, 722, 650, 1090, 8, 0.42, 22));
})();
const wallDEdge = interp([[-60, 1000], [200, 1015], [420, 1000], [640, 1018], [860, 1004], [1140, 1012]]);
const wallRight = layer("wall-right", 5, ...cliffCity({ side: -1, edge: wallDEdge, cw: W, y0: -60, y1: 1140, ledges: [160, 264, 368, 472, 576, 680, 784], litY: -1000, sun: VP, seed: 50, k: 1, stairsN: 3 }));

const topL = (x: number) => 190 + (x + 100) * 0.3;
const slabL = (() => {
  const r = R(40), n2 = noise(41), pts: Poly = [[-130, 140]];
  for (let x = -100; x <= 640; x += 40) pts.push([x, topL(x) + ((Math.floor((x + 100) / 40) % 2) ? -12 : 0) + r.range(-3, 3)]);
  for (let y = topL(640) + 20; y <= 1140; y += 36) pts.push([660 + n2(y / 120, 2) * 16 + r.range(-3, 3), y]);
  pts.push([-130, 1140]);
  return pts;
})();
const arcadeLeft = arcadeWall("arcade-left", {
  slab: slabL, topAt: topL, seed: 42, sun: VP, xr: [-40, 620], yr: [200, 560], winN: 20, vineN: 12, bricksN: 300,
  ledges: [250, 330, 400],
  arcs: [{ cx: 120, base: 940, w: 250, h: 500 }, { cx: 278, base: 861, w: 200, h: 400 }, { cx: 400, base: 800, w: 165, h: 330 }, { cx: 497, base: 751, w: 140, h: 280 }, { cx: 572, base: 714, w: 120, h: 240 }],
  towerXs: [20, 150, 280, 410, 520],
});
const wallDCols = columnsLayer("columns", [
  { x: 140, base: 1000, w: 90, h: 900, seed: 70 }, { x: 420, base: 900, w: 72, h: 760, seed: 71 }, { x: 1180, base: 930, w: 80, h: 820, calm: true, seed: 72 },
], VP);
const ceilD = ceilingLayer("ceiling", { w: W, band: 220, vp: VP, seed: 80, oculi: [380, 560, 760, 900], nStal: 52, litX: 1000, rootsN: 22 });
const stairsD = stairsNear("stairs-near", { x: 1100, y: 830, w: 600, h: 250, steps: 14, landing: 280, seed: 90, sun: VP });
const rockD = rockNear("rock-near", 92, -60, 2000, [[-60, 985], [300, 972], [700, 990], [1100, 968], [1500, 995], [1980, 970]], 1160, VP, 24);
const rootsD = rootsNear("roots-near", { xs: Array.from({ length: 22 }, (_, i) => 300 + i * 58 + ((i * 37) % 23)), topY: 0, seed: 94, sun: VP, lenMax: 260, sparseFrom: 1000 });
const gD = gatePair({ ids: ["gate-l", "gate-r"], xl: (p) => 180 + 130 * p, gap: 1305, lo: -320, hi: 1400, outerL: -800, outerR: 2720, sun: VP, seed: 100, hold: [110, 200], shift: 700, bxL: [-800, 330], bxR: [1500, 2720], dens: 1 });

/* ================= portrait assembly ================= */
const fP = (x: number) => 700 + Math.abs(x - 540) * 0.3;
const floorP = (() => {
  const { frags, r } = floorFrags({
    f: fP, offs: [0, 70, 150, 240, 330, 430, 540, 660, 790],
    litFills: [P["vault-mid"]!, P["vault-mid-2"]!, P["vault-near"]!, "", "", "", "", "", ""],
    calmFills: ["", "", "", cn("vault-near", "rock-mid", 0.5), P["rock-mid"]!, cn("rock-mid", "rock", 0.5), P.rock!, cn("rock", "rock-dark", 0.5), P["rock-dark"]!],
    litN: 3, split: null, x0: -60, x1: 1140, base: 2100, seed: 160, sun: PVP, trees: [2, 3, 3, 3, 2, 2, 1, 1, 1], th: [22, 50], amps: [5, 5, 6, 7, 8, 8, 9, 9, 9], winN: 26,
  });
  return layer("floor-terraces-p", 6, ...frags, ...riverFrags(r, 541, 700, 1040, 6, 0.22, 10));
})();
const wallPEdge = interp([[-60, 706], [300, 722], [600, 700], [900, 724], [1200, 708], [1500, 716]]);
const wallRightP = layer("wall-right-p", 5, ...cliffCity({ side: -1, edge: wallPEdge, cw: PW, y0: -60, y1: 1300, ledges: [250, 370, 490, 610, 730, 850, 970, 1090], litY: 1000, sun: PVP, seed: 150, k: 0.85, stairsN: 4 }));
const topLP = (x: number) => 205 + Math.sin(x / 70) * 4;
const slabLP = (() => {
  const r = R(140), n2 = noise(141), pts: Poly = [[-130, 160]];
  for (let x = -100; x <= 380; x += 40) pts.push([x, topLP(x) + ((Math.floor((x + 100) / 40) % 2) ? -10 : 0) + r.range(-3, 3)]);
  for (let y = 240; y <= 1080; y += 36) pts.push([392 + n2(y / 120, 2) * 14 + r.range(-3, 3), y]);
  pts.push([-130, 1080]);
  return pts;
})();
const arcadeLeftP = arcadeWall("arcade-left-p", {
  slab: slabLP, topAt: topLP, seed: 142, sun: PVP, xr: [-40, 360], yr: [240, 900], winN: 14, vineN: 8, bricksN: 260,
  ledges: [230, 450, 670],
  arcs: [{ cx: 85, base: 400, w: 150, h: 190 }, { cx: 255, base: 400, w: 150, h: 190 }, { cx: 85, base: 620, w: 150, h: 190 }, { cx: 255, base: 620, w: 150, h: 190 }, { cx: 85, base: 840, w: 150, h: 190 }, { cx: 255, base: 840, w: 150, h: 190 }],
  towerXs: [30, 160, 290],
});
const colsP = columnsLayer("columns-p", [
  { x: 90, base: 1560, w: 90, h: 1400, litY: 1040, seed: 170 }, { x: 990, base: 1560, w: 80, h: 1400, litY: 1040, seed: 171 },
], PVP);
const ceilP = ceilingLayer("ceiling-p", { w: PW, band: 260, vp: PVP, seed: 180, oculi: [250, 420, 640, 820], nStal: 40, litX: 1200, rootsN: 18 });
const stairsP = stairsNear("stairs-near-p", { x: 140, y: 1600, w: 520, h: 320, steps: 15, landing: 240, seed: 190, sun: PVP });
const rockP = rockNear("rock-near-p", 192, -60, 1140, [[-60, 1815], [300, 1802], [560, 1824], [860, 1806], [1140, 1820]], 2000, PVP, 26);
const rootsP = rootsNear("roots-near-p", { xs: Array.from({ length: 15 }, (_, i) => 40 + i * 72 + ((i * 29) % 19)), topY: 0, seed: 194, sun: PVP, lenMax: 400, sparseFrom: 5000 });
const gP = gatePair({ ids: ["gate-l-p", "gate-r-p"], xl: (p) => 100 + 90 * p, gap: 780, lo: -500, hi: 2400, outerL: -560, outerR: 1640, sun: PVP, seed: 200, hold: [120, 210], shift: 460, bxL: [-560, 230], bxR: [850, 1640], dens: 1 });

const farD = arcadeFar("arcade-far", { vp: VP, x0: 380, x1: 1020, y0: 250, y1: 700, tiers: [330, 410, 490], n: 14, seed: 20, stairsN: 7, bridgesN: 6, towersN: 8 });
const farP = arcadeFar("arcade-far-p", { vp: PVP, x0: 200, x1: 880, y0: 300, y1: 960, tiers: [370, 450, 530, 790, 870], n: 14, seed: 120, stairsN: 7, bridgesN: 6, towersN: 8 });
const mistL = layer("mist-far", 3, mist(500, 650, 1000, 150, P.vellum!, 0.25), mist(500, 760, 1000, 160, P.vellum!, 0.2));

const all: Layer[] = [
  bgLayer("vault-glow", W, H, VP, [1250, 900, 640, 470], 1), farD, bridgeFar("bridge-far", 200, 1300, 600, 11, 30, VP), mistL, arcadeLeft, wallRight,
  floorD, wallDCols, shaftsLayer("shafts", [380, 560, 760, 900], 170, 720, [8, -6, 4, -10], [0.22, 0.28, 0.2, 0.26]), ceilD, stairsD, rockD,
  dustLayer("dust", { x0: 200, y0: 200, x1: 1000, y1: 950 }, 95), rootsD, gD.gl, gD.gr,
  bgLayer("vault-glow-p", PW, PH, PVP, [1000, 740, 540, 400], 101), farP, bridgeFar("bridge-far-p", 80, 1000, 760, 9, 130, PVP), arcadeLeftP, wallRightP,
  floorP, colsP, shaftsLayer("shafts-p", [250, 420, 640, 820], 250, 660, [8, -4, 4, -8], [0.22, 0.28, 0.2, 0.26]), ceilP, stairsP, rockP,
  dustLayer("dust-p", { x0: 150, y0: 250, x1: 950, y1: 960 }, 195), rootsP, gP.gl, gP.gr,
];
// per-band bake table (bible s13): [scale, quality]
const BAKE: Record<string, [number, number]> = {
  "vault-glow": [0.4, 40], "vault-glow-p": [0.4, 40],
  "arcade-far": [0.6, 45], "arcade-far-p": [0.6, 45], "bridge-far": [0.6, 45], "bridge-far-p": [0.6, 45],
  "mist-far": [0.4, 35],
  "arcade-left": [0.65, 42], "arcade-left-p": [0.6, 42], "wall-right": [0.65, 42], "wall-right-p": [0.6, 40],
  "floor-terraces": [0.65, 42], "floor-terraces-p": [0.55, 40], columns: [0.6, 42], "columns-p": [0.5, 40],
  shafts: [0.4, 35], "shafts-p": [0.4, 35], ceiling: [0.6, 42], "ceiling-p": [0.55, 40],
  "stairs-near": [0.55, 42], "stairs-near-p": [0.5, 40], "rock-near": [0.5, 42], "rock-near-p": [0.5, 40],
  dust: [0.5, 40], "dust-p": [0.5, 40], "roots-near": [0.5, 42], "roots-near-p": [0.5, 40],
  "gate-l": [0.4, 40], "gate-r": [0.4, 40], "gate-l-p": [0.4, 40], "gate-r-p": [0.4, 40],
};
const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
for (const l of all) {
  const [s0, quality] = BAKE[l.id] ?? [1, 60];
  const scale = s0 * (l.id.startsWith("roots") ? 0.6 : l.id.startsWith("ceiling") ? 0.7 : 0.8); BAKE[l.id] = [scale, quality];
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
const dIds = ["vault-glow", "arcade-far", "bridge-far", "mist-far", "arcade-left", "wall-right", "floor-terraces", "columns", "shafts", "ceiling", "stairs-near", "rock-near", "dust", "roots-near", "gate-l", "gate-r"];
const pIds = ["vault-glow-p", "arcade-far-p", "bridge-far-p", "mist-far", "arcade-left-p", "wall-right-p", "floor-terraces-p", "columns-p", "shafts-p", "ceiling-p", "stairs-near-p", "rock-near-p", "dust-p", "roots-near-p", "gate-l-p", "gate-r-p"];
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: compose(W, H, dIds), portrait: compose(PW, PH, pIds, { "mist-far": { x: -200, y: 200 } }), }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop"); await composite(SLUG, "portrait");

// ---------- checks ----------
const mp = (ids: string[]) => ids.reduce((n, id) => { const b = baked.get(id)!; return n + (b.w * b.h * BAKE[id]![0] ** 2) / 1e6; }, 0);
console.log("layers desktop", dIds.length, "portrait", pIds.length);
console.log("bytes total", total, "(KB", Math.round(total / 1024) + ")", "budget 450 KB");
console.log("decoded MP desktop", mp(dIds).toFixed(1), "portrait", mp(pIds).toFixed(1));
console.log("gate-l rest edge x", gD.restL, "gate-r rest edge x", gD.restR, "closed min overlap", gD.minOv.toFixed(1));
console.log("gate-l-p rest edge x", gP.restL, "gate-r-p rest edge x", gP.restR, "closed min overlap", gP.minOv.toFixed(1));
if (gD.minOv < 80 || gP.minOv < 80) throw new Error("gate closed overlap < 80");
for (const id of ["gate-l", "gate-r", "gate-l-p", "gate-r-p"]) console.log(id, JSON.stringify([...manifest.compositions.desktop.layers, ...manifest.compositions.portrait.layers].find((l) => l.id === id)));
for (const [id, b] of baked) console.log(" ", id.padEnd(18), String(b.bytes).padStart(7));
void glow; void PH; void H; void pine; void tree;
