// p-web: amber district of hanging galleries round a vertical light well. Run: npx tsx art/p-web/build.ts
// Both compositions are generated from one config each (D desktop, Q portrait); layer ids get "-p" on portrait,
// except `mist-far` which is shared and re-placed.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, arch, bakeLayer, bridge, column, composite, cut, difference, ellipse, fern, glow, layer, lantern, mist, mix, offset,
  pine, rect, rng, roots, ruinWall, scatter, shaft, sheet, stairs, tower, union, vine,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "p-web";
const P: Palette = {
  glow: "#f2b866", far: "#d08a44", "far-2": "#b8733a", mid: "#8f552e", "mid-2": "#6e3f24", near: "#452617", "near-dark": "#2c180e",
  gate: "#180c06", accent: "#ffdca0", "accent-2": "#fff1cf", lamp: "#ffb866", "lamp-core": "#fff1cf", rim: "#ffd2a0", foreshadow: "#a6d8cc", shadow: "#120804",
};
const R = (n: number) => rng(61000 + n);
const cn = (a: string, b: string, t: number) => mix(P[a]!, P[b]!, t);

/* ---------- generic helpers (same recipe as b4) ---------- */
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
const rr = (r: Rng, a: number, b: number) => r.range(a, b);

type PaperOpts = { holes?: (Poly | Shape)[]; rm?: number; opacity?: number; noRim?: boolean; shadow?: false; noInner?: boolean };
/** One sheet with the band recipe: radial light from `src`, shadow away from it, rim toward it, inner shadow. */
function paper(shape: Poly | Shape, fill: string, b: Band, src: Pt, o: PaperOpts = {}): Frag {
  const bb = bnd(shape);
  let lx = src[0] - (bb.x0 + bb.x1) / 2, ly = src[1] - (bb.y0 + bb.y1) / 2;
  const d = Math.hypot(lx, ly) || 1; lx /= d; ly /= d;
  return sheet(shape, fill, {
    holes: o.holes, opacity: o.opacity,
    shadow: o.shadow === false ? false : { color: P.shadow, blur: b.blur, opacity: b.op, dx: -lx * b.off, dy: -ly * b.off },
    edge: o.noRim ? undefined : { light: [lx, ly], width: b.rw, color: mix(fill, P.rim!, o.rm ?? b.rm) },
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
/** Stepped silhouette following `prof(x)`; `top(x)` = surface y. */
function steps(r: Rng, prof: (x: number) => number, x0: number, x1: number, base: number, amp = 6) {
  const pts: Poly = [], st: { a: number; b: number; y: number }[] = [];
  let x = x0;
  while (x < x1) { const b = Math.min(x1, x + rr(r, 46, 120)), y = prof((x + b) / 2) + rr(r, -amp, amp); pts.push([x, y], [b, y]); st.push({ a: x, b, y }); x = b; }
  pts.push([x1, base], [x0, base]);
  return { poly: cut(pts, r, 1.2, 40), top: (xx: number) => (st.find((s) => xx >= s.a && xx <= s.b) ?? st[st.length - 1]!).y };
}

/* ---------- configs ---------- */
type Cfg = {
  s: "" | "-p"; W: number; H: number; wx: number; pool: number; src: Pt; seed: number;
  bloom: Pt; bloomR: number; poolGlow: Pt; poolGlowR: number;
  panel: Poly; tierY: number[]; tierH: number; Lx: [number, number]; Rx: [number, number];
  exit: Pt; exitSz: Pt;
  bridges: [number, number, number][]; towers: [number, number, number][];
  mid: { x0: number; x1: number; slab: number; bh: number }[];
  screens: [number, number, number, number][]; // cx, w, h, topY
  landings: number[]; stairY: [number, number];
  shaftLen: number[]; dust: { x0: number; y0: number; x1: number; y1: number };
  wall: { kind: "d" | "p"; bands: number[]; x0: number; x1: number; stairsAt: [number, number][] };
  floor: { top: number; bottom: number; x0: number; x1: number; balust: [number, number][]; lanternX: number[]; poolDy: number };
  lanternsN: number; lanternsMaxY: number;
};
const D: Cfg = {
  s: "", W: 1920, H: 1080, wx: 560, pool: 940, src: [560, 0], seed: 0,
  bloom: [560, 520], bloomR: 420, poolGlow: [560, 940], poolGlowR: 200,
  panel: rect(-20, -20, 1180, 1120), tierY: [70, 230, 390, 590, 770], tierH: 190, Lx: [-100, 425], Rx: [695, 1140],
  exit: [860, 720], exitSz: [70, 110],
  bridges: [[300, 820, 260], [340, 775, 380], [270, 860, 500], [350, 770, 620]], towers: [[312, 268, 60], [850, 508, 48]],
  mid: [{ x0: 40, x1: 370, slab: 330, bh: 95 }, { x0: 700, x1: 1050, slab: 520, bh: 95 }, { x0: 90, x1: 430, slab: 800, bh: 90 }],
  screens: [[160, 100, 200, 110], [320, 80, 150, 420], [790, 90, 170, 150], [940, 130, 230, 330], [1010, 90, 170, 610]],
  landings: [300, 640], stairY: [60, 870],
  shaftLen: [860, 900, 820, 780], dust: { x0: 380, y0: 60, x1: 760, y1: 920 },
  wall: { kind: "d", bands: [-60, 90, 240, 390, 540, 690, 840, 990], x0: 1000, x1: 2090, stairsAt: [[1380, 3], [1760, 5]] },
  floor: { top: 972, bottom: 1180, x0: -100, x1: 1180, balust: [[40, 380], [740, 1090]], lanternX: [230, 910], poolDy: 22 },
  lanternsN: 140, lanternsMaxY: 940,
};
const Q: Cfg = {
  s: "-p", W: 1080, H: 1920, wx: 540, pool: 820, src: [540, 0], seed: 100,
  bloom: [540, 420], bloomR: 380, poolGlow: [540, 790], poolGlowR: 90,
  panel: rect(-20, -20, 1120, 910), tierY: [80, 190, 300, 410, 520, 640], tierH: 190, Lx: [-100, 410], Rx: [670, 1180],
  exit: [780, 560], exitSz: [60, 90],
  bridges: [[280, 800, 230], [320, 760, 330], [270, 810, 440], [330, 750, 620]], towers: [[292, 238, 56], [790, 448, 46]],
  mid: [{ x0: 40, x1: 400, slab: 600, bh: 95 }, { x0: 680, x1: 1040, slab: 400, bh: 95 }],
  screens: [[130, 100, 200, 110], [300, 90, 150, 330], [650, 120, 200, 100], [930, 130, 210, 190], [970, 80, 150, 560]],
  landings: [260, 540], stairY: [60, 770],
  shaftLen: [720, 760, 700, 740], dust: { x0: 380, y0: 80, x1: 700, y1: 780 },
  wall: { kind: "p", bands: [860, 1010, 1160, 1310, 1460, 1610, 1760, 1910], x0: -80, x1: 1160, stairsAt: [[240, 3], [780, 5]] },
  floor: { top: 842, bottom: 925, x0: -100, x1: 1180, balust: [[40, 360], [720, 1040]], lanternX: [220, 860], poolDy: 14 },
  lanternsN: 140, lanternsMaxY: 820,
};

/* ---------- bg ---------- */
function bgLayer(c: Cfg): Layer {
  const r = R(c.seed + 1), out: Frag[] = [];
  const panel = union(cut(c.panel, r, 3, 40));
  out.push(sheet(rect(0, 0, c.W, c.H), P["near-dark"]!, { shadow: false }), sheet(panel, P.far!, { shadow: false }));
  const fills = [cn("far", "glow", 0.3), cn("far", "glow", 0.6), P.glow!, P.accent!], rx = [c.W > 1500 ? 720 : 640, 520, 360, 220];
  rx.forEach((x, i) => out.push(sheet(inter(cut(ellipse(c.wx, 110, x, x * 0.82, 96), r, 3, 40), panel), fills[i]!, { shadow: false })));
  return layer(`bg${c.s}`, 0, ...out);
}

/* ---------- far galleries around the well ---------- */
function farGal(c: Cfg): Layer {
  const r = R(c.seed + 2), out: Frag[] = [];
  const [ex, ey] = c.exit, [ew, eh] = c.exitSz, eb = ey + eh / 2;
  const hole = arch(r, ex, eb, ew, eh, 1);
  out.push(sheet(hole, P.foreshadow!, { shadow: false }));
  out.push(sheet(union(column(r, ex - ew * 0.22, eb + 1, 5, eh * 0.55, false), column(r, ex + ew * 0.2, eb + 1, 5, eh * 0.4, false)), P.mid!, { shadow: false }));
  c.tierY.forEach((y0, i) => {
    for (const side of [0, 1]) {
      const x0 = side ? c.Rx[0] + (i % 2) * -12 : c.Lx[0], x1 = side ? c.Rx[1] : c.Lx[1] + (i % 2) * 16;
      const hasExit = side === 1 && y0 <= ey && ey <= y0 + c.tierH && ex > x0 && ex < x1;
      const crens: Poly[] = [];
      for (let x = x0 + 4; x < x1 - 10; x += 20 * r.vary(0.2)) crens.push(rect(x, y0 - 6, rr(r, 7, 11), 7));
      const body = union(cut(rect(x0, y0, x1 - x0, c.tierH), r, 1.2, 40), ...crens);
      const holes: Poly[] = [];
      const okX = (x: number, m: number) => !hasExit || Math.abs(x - ex) > ew / 2 + m;
      for (let x = x0 + 24; x < x1 - 24; x += 38 * r.vary(0.2)) { const w = rr(r, 17, 24); if (okX(x, 26) && r() > 0.1) holes.push(arch(r, x, y0 + 72, w, w * 1.8, 0.6)); }
      for (let x = x0 + 14; x < x1 - 14; x += 26 * r.vary(0.2)) { const w = rr(r, 10, 14); if (okX(x, 20) && r() > 0.15) holes.push(arch(r, x, y0 + 124, w, w * 1.7, 0.5)); }
      for (let x = x0 + 12; x < x1 - 12; x += 42 * r.vary(0.25)) { const w = rr(r, 3.4, 6); if (okX(x, 20) && r() > 0.3) holes.push(arch(r, x, y0 + rr(r, 150, 172), w, w * 1.6, 0.3)); }
      if (hasExit) holes.push(hole);
      const base = i % 2 ? cn("far-2", "mid", 0.3) : P["far-2"]!;
      out.push(...pile(difference(body, ...holes), [base, mix(base, P.far!, 0.45)], 5, B.far, c.src));
      out.push(paper(rect(x0 - 6, y0 + c.tierH - 12, x1 - x0 + 12, 12), cn("far-2", "mid", 0.5), B.far, c.src));
    }
  });
  out.push(paper(difference(offset(hole, 5), hole), P.mid!, B.far, c.src, { noRim: true, shadow: false }));
  return layer(`galleries-far${c.s}`, 1, ...out);
}

/* ---------- far bridges + towers ---------- */
function bridgesFar(c: Cfg): Layer {
  const r = R(c.seed + 3), bodies: Shape[] = [], holes: Poly[] = [];
  for (const [x0, x1, y] of c.bridges) bodies.push(bridge(r, x0, x1, y, 9, Math.round((x1 - x0) / 15)));
  for (const [x, by, h] of c.towers) { const t = tower(r, x, by, h * 0.36 + 10, h, { windows: 2 }); bodies.push(t.body); holes.push(...t.holes); }
  return layer(`bridges-far${c.s}`, 2, paper(union(...bodies), cn("mid", "mid-2", 0.5), B.far, c.src, { holes, rm: 0.45 }));
}

/* ---------- far lantern dots ---------- */
function lanternsFar(c: Cfg): Layer {
  const r = R(c.seed + 6), pts: [number, number, number][] = [];
  const nTier = Math.round(c.lanternsN * 0.7);
  for (let i = 0; i < nTier; i++) {
    const side = r() < 0.5 ? 0 : 1, y0 = r.pick(c.tierY), x0 = side ? c.Rx[0] + 10 : 0, x1 = side ? Math.min(c.Rx[1], c.W - 20) : c.Lx[1] - 10;
    pts.push([rr(r, x0, x1), y0 + rr(r, 30, 170), rr(r, 2, 4)]);
  }
  for (let i = pts.length; i < c.lanternsN; i++) pts.push([c.wx + rr(r, -190, 190), rr(r, 40, c.lanternsMaxY - 20), rr(r, 2, 4)]);
  const ok = pts.filter(([x, y]) => y < c.lanternsMaxY && x < 1120);
  return layer(`lanterns-far${c.s}`, 3,
    sheet(union(...ok.map(([x, y, q]) => disc(x, y, q * 2.8, 8))), P.lamp!, { shadow: false, opacity: 0.16 }),
    sheet(union(...ok.map(([x, y, q]) => disc(x, y, q, 8))), P.lamp!, { shadow: false }),
    sheet(union(...ok.map(([x, y, q]) => disc(x, y, q * 0.45, 6))), P["accent-2"]!, { shadow: false }));
}

const mistLayer = () => layer("mist-far", 4, mist(550, 380, 1100, 150, P.accent!, 0.25), mist(550, 700, 1100, 150, P.accent!, 0.25));

/* ---------- mid hanging galleries ---------- */
function galMid(c: Cfg): Layer {
  const r = R(c.seed + 7), out: Frag[] = [];
  c.mid.forEach((g) => {
    const w = g.x1 - g.x0, top = g.slab - g.bh, n = r.int(6, 9), pitch = w / n, bodyH = g.bh - 22;
    const holes: Poly[] = [];
    for (let i = 0; i < n; i++) holes.push(arch(r, g.x0 + pitch * (i + 0.5), g.slab - 20, pitch * rr(r, 0.52, 0.6), bodyH - 18, 0.8));
    // rods (chains) up past the canvas top
    const rods: Shape[] = [];
    for (const rx of [g.x0 + 12, g.x0 + w * 0.36, g.x0 + w * 0.68, g.x1 - 12]) {
      rods.push([rect(rx - 1.5, -90, 3, top + 82)]);
      for (let y = -60; y < top - 20; y += rr(r, 48, 70)) rods.push([ellipse(rx, y, 5, 8, 8)]);
    }
    out.push(paper(union(...rods), P["mid-2"]!, B.mid, c.src, { rm: 0.3 }));
    out.push(sheet(union(...holes), cn("far", "glow", 0.45), { shadow: false }));
    // lanterns hanging in the arches
    const ls = holes.filter((_, i) => i % 2 === 0).map((h) => { const b = bnd(h), cx = (b.x0 + b.x1) / 2, s = rr(r, 20, 28); return lantern(cx, b.y0 + s * 0.9 + 8, s); });
    out.push(sheet(union(...ls.flatMap((l) => l.holes)), P.lamp!, { shadow: false }));
    out.push(sheet(union(...ls.map((l) => l.body)), P["mid-2"]!, { holes: ls.flatMap((l) => l.holes), shadow: false }));
    for (const l of ls) { const b = bnd(l.body); out.push(glow((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, 26, P.lamp!, { opacity: 0.5, core: P["lamp-core"]! })); }
    const body = union(cut(rect(g.x0, top, w, bodyH), r, 1.4, 34), rect(g.x0 - 8, top - 10, w + 16, 12));
    out.push(...pile(difference(body, ...holes), [P["mid-2"]!, P.mid!, cn("mid", "far-2", 0.5)], 6, B.mid, c.src, { rm: 0.4 }));
    // balustrade with holes, floor slab, brackets
    const slits: Poly[] = [];
    for (let x = g.x0 + 4; x < g.x1 - 8; x += 10) slits.push(rect(x, g.slab - 19, 5, 11));
    out.push(paper(difference(rect(g.x0, g.slab - 22, w, 18), ...slits), P["mid-2"]!, B.mid, c.src));
    const brk: Poly[] = [];
    for (let k = 0; k < 4; k++) { const x = g.x0 + w * (0.1 + 0.27 * k); brk.push([[x, g.slab + 14], [x + 26, g.slab + 14], [x + 3, g.slab + 38]]); }
    out.push(paper(union(rect(g.x0 - 14, g.slab - 4, w + 28, 18), ...brk), P["mid-2"]!, B.mid, c.src));
    // ferns in pots, hanging vines
    const fr: Shape[] = [];
    for (let k = 0; k < 4; k++) { const x = g.x0 + w * (0.12 + 0.25 * k) + rr(r, -14, 14); fr.push([rect(x - 6, g.slab - 30, 12, 9)], fern(r, x, g.slab - 28, rr(r, 24, 38), rr(r, -0.5, 0.5))); }
    for (let k = 0; k < 5; k++) fr.push(vine(r, g.x0 + rr(r, 10, w - 10), g.slab + 12, rr(r, 28, 80), 8));
    out.push(sheet(union(...fr), P.near!, { shadow: false }));
  });
  return layer(`galleries-mid${c.s}`, 5, ...out);
}

/* ---------- hero: vellum light well ---------- */
function wellLayer(c: Cfg): Layer {
  const r = R(c.seed + 4), out: Frag[] = [], hw = 90, bot = c.pool + 12;
  const shape = union(cut(rect(c.wx - hw, -90, hw * 2, bot + 90), r, 1.5, 36), ellipse(c.wx, 4, 125, 34, 48), ellipse(c.wx, bot - 2, 112, 18, 40));
  out.push(...pile(shape, [P.glow!, cn("glow", "accent", 0.5), P.accent!, P["accent-2"]!], 16, B.hero, c.src, { rm: 0.5 }));
  const hoops: number[] = [], nh = 8;
  for (let i = 1; i <= nh; i++) hoops.push(((bot - 40) * i) / (nh + 0.4) + 30);
  out.push(paper(union(...hoops.map((y) => cut(rect(c.wx - hw - 8, y, hw * 2 + 16, 9), r, 0.8, 30))), P.glow!, B.mid, c.src, { rm: 0.4 }));
  const folds: Poly[] = [];
  [0, ...hoops].forEach((y, i) => { const y1 = (hoops[i] ?? bot - 30) - 8; for (const dx of [-52, -17, 17, 52]) if (y1 - y > 40) folds.push(rect(c.wx + dx - 1.5 + rr(r, -3, 3), y + 14, 3, y1 - y - 14)); });
  out.push(sheet(union(...folds), P["lamp-core"]!, { shadow: false, opacity: 0.85 }));
  // hanging vellum discs with punched rings
  const cords: Poly[] = [], discs: Frag[] = [];
  for (let i = 0; i < 8; i++) {
    const y = 110 + ((bot - 210) * i) / 7 + rr(r, -14, 14), x = c.wx + rr(r, -42, 42), rad = rr(r, 20, 40);
    cords.push(rect(x - 1.5, -90, 3, y + 90 - rad));
    const holes: Shape[] = [difference(disc(x, y, rad * 0.7, 36), disc(x, y, rad * 0.7 - 3.6, 36))];
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; holes.push([disc(x + Math.cos(a) * rad * 0.42, y + Math.sin(a) * rad * 0.42, 1.9, 6)]); }
    discs.push(paper(disc(x, y, rad), P.glow!, B.hero, c.src, { holes, rm: 0.5 }), paper(disc(x, y, rad - 5), P.accent!, B.mid, c.src, { holes, rm: 0.3, noInner: true }),
      sheet(disc(x, y, rad * 0.22, 14), P["accent-2"]!, { shadow: false }));
  }
  out.push(sheet(union(...cords), P["far-2"]!, { shadow: false }), ...discs);
  return layer(`light-well${c.s}`, 6, ...out);
}

function bloomLayer(c: Cfg): Layer {
  return layer(`well-bloom${c.s}`, 7, glow(c.bloom[0], c.bloom[1], c.bloomR, P.lamp!, { opacity: 0.55, core: P["lamp-core"]! }),
    glow(c.poolGlow[0], c.poolGlow[1], c.poolGlowR, P.lamp!, { opacity: 0.55, core: P["lamp-core"]! }));
}

/* ---------- spiral stairs round the well ---------- */
function stairsLayer(c: Cfg): Layer {
  const r = R(c.seed + 5), amp = 175, step = 9, th = 5, ph = 0.8, [y0, y1] = c.stairY;
  const dth = (2 * Math.PI * step) / 150, xs = (i: number) => c.wx + amp * Math.sin(i * dth + ph);
  const front: Poly[] = [], back: Poly[] = [], posts: Poly[] = [];
  const n = Math.floor((y1 - y0) / step);
  for (let i = 0; i < n; i++) {
    const y = y0 + i * step, xa = xs(i), xb = xs(i + 1), lo = Math.min(xa, xb) - 7, w = Math.abs(xb - xa) + 14 + rr(r, -2, 2);
    if (Math.cos(i * dth + ph + dth / 2) > 0) { front.push(rect(lo, y, w, th)); if (i % 5 === 0) posts.push(rect(lo + w / 2 - 1.5, y - 20, 3, 20)); } else back.push(rect(lo, y, w, th));
  }
  const out: Frag[] = [];
  out.push(paper(difference(union(...back), rect(c.wx - 88, y0 - 20, 176, y1 - y0 + 60)), P["far-2"]!, B.mid, c.src, { rm: 0.3 }));
  out.push(...pile(union(...front), [P["mid-2"]!, P.mid!], 1.2, B.mid, c.src, { rm: 0.5 }));
  out.push(paper(union(...posts, ...(posts.length ? [rect(c.wx - 40, 0, 0.1, 0.1)] : [])), P["mid-2"]!, B.mid, c.src, { rm: 0.4 }));
  c.landings.forEach((ly, k) => {
    const x = c.wx + (k % 2 ? -1 : 1) * amp, lx0 = x - 34;
    const rail = difference(rect(lx0, ly - 18, 68, 18), ...[0, 1, 2, 3, 4, 5].map((q) => rect(lx0 + 6 + q * 10, ly - 15, 5, 12)));
    out.push(...pile(union(rect(lx0, ly, 68, 10), rect(lx0 + 6, ly + 10, 4, 30), rect(lx0 + 58, ly + 10, 4, 30)), [P["mid-2"]!, P.mid!], 1.5, B.mid, c.src, { rm: 0.5 }));
    out.push(paper(rail, P["mid-2"]!, B.mid, c.src, { rm: 0.4 }));
    const l = lantern(x, ly - 38, 28);
    out.push(sheet(union(...l.holes), P.lamp!, { shadow: false }), sheet(l.body, P["mid-2"]!, { holes: l.holes, shadow: false }), glow(x, ly - 38, 34, P.lamp!, { opacity: 0.5, core: P["lamp-core"]! }));
  });
  return layer(`stairs-mid${c.s}`, 8, ...out);
}

/* ---------- hanging vellum screens ---------- */
function screensLayer(c: Cfg): Layer {
  const r = R(c.seed + 8), out: Frag[] = [], cords: Poly[] = [];
  for (const [cx, w, h, top] of c.screens) {
    const x0 = cx - w / 2, pc = rr(r, 7, 10), hs = pc - 3.6, holes: Poly[] = [];
    for (let x = x0 + 10; x + hs <= x0 + w - 10; x += pc) for (let y = top + 10; y + hs <= top + h - 12; y += pc) holes.push(rect(x, y, hs, hs));
    const fringe: Poly[] = [];
    for (let x = x0 + 3; x + 9 < x0 + w; x += 11) fringe.push([[x, top + h - 2], [x + 8, top + h - 2], [x + 4, top + h + rr(r, 8, 14)]]);
    cords.push(rect(cx - 1.5, -90, 3, top + 90));
    out.push(...pile(difference(union(cut(rect(x0, top, w, h), r, 1.2, 30), ...fringe), ...holes), [P.far!, P.accent!], 5, B.far, c.src, { opacity: 0.85, rm: 0.4 }));
  }
  return layer(`screens${c.s}`, 9, sheet(union(...cords), P["mid-2"]!, { shadow: false }), ...out);
}

function shaftsLayer(c: Cfg): Layer {
  const angles = [-12, -4, 5, 12], ops = [0.22, 0.28, 0.2, 0.26];
  return layer(`shafts${c.s}`, 10, ...angles.map((a, i) => shaft(c.wx + Math.sin((a * Math.PI) / 180) * 20, -10, 40, 150, c.shaftLen[i]!, a, P.accent!, ops[i]!)));
}

/* ---------- calm wall (card area): tone-on-tone only ---------- */
function wallLayer(c: Cfg): Layer {
  const r = R(c.seed + 11), out: Frag[] = [], w = c.wall;
  const pts: Poly = [];
  if (w.kind === "d") {
    let y = -100, x = 1100 + rr(r, -35, 35);
    pts.push([2090, -100]);
    while (y < 1190) { pts.push([x, y]); y += rr(r, 50, 130); pts.push([x, y]); x = 1100 + rr(r, -35, 35); }
    pts.push([x, 1190], [2090, 1190]);
  } else {
    let x = -100, y = 864 + rr(r, -22, 22);
    pts.push([-100, 2010]);
    while (x < 1190) { pts.push([x, y]); x += rr(r, 50, 120); pts.push([x, y]); y = 864 + rr(r, -22, 22); }
    pts.push([1190, y], [1190, 2010]);
  }
  const sil = union(cut(pts, r, 1.2, 40)), inner = offset(sil, -12);
  const tone = [P.near!, cn("near", "mid-2", 0.35), cn("near", "near-dark", 0.5)];
  out.push(...pile(sil, [P["near-dark"]!, P.near!, P["mid-2"]!], 14, B.near, c.src, { rm: 0.12 }));
  const winN = w.kind === "d" ? 40 : 56, wins: Poly[] = [], vines: Shape[] = [];
  w.bands.forEach((y0, i) => {
    const t = steps(r, () => y0, w.x0, w.x1, y0 + 170, 5);
    const holes: Poly[] = [];
    for (let x = w.x0 + 30; x < w.x1 - 20; x += (w.kind === "d" ? 58 : 66) * r.vary(0.2)) {
      const aw = rr(r, 24, 32); if (r() < 0.12) continue;
      holes.push(arch(r, x, y0 + 100, aw, 56, 0.8));
      if (r() < 0.45 && wins.length < winN) wins.push(arch(r, x, y0 + 98, rr(r, 5, 8), rr(r, 10, 14), 0.3));
    }
    for (let x = w.x0 + 20; x < w.x1; x += 26 * r.vary(0.2)) if (r() > 0.2) holes.push(rect(x, y0 + 114, 4, 14));
    const band = inter(difference(t.poly, ...holes), inner);
    out.push(paper(band, tone[i % 3]!, B.mid, c.src, { rm: 0.12 }));
    out.push(paper(inter(rect(w.x0, y0 - 3, w.x1 - w.x0, 12), inner), cn("near", "mid-2", 0.5), B.far, c.src, { rm: 0.1 }));
    for (let k = 0; k < 3; k++) vines.push(vine(r, rr(r, w.x0 + 100, w.x1 - 30), y0 + 8, rr(r, 50, 120), 9));
  });
  for (const [sx, bi] of w.stairsAt) { const y = w.bands[bi]! + 150; out.push(paper(stairs(sx, y - 56, 90, 56, 9, bi % 2 ? -1 : 1), P["mid-2"]!, B.mid, c.src, { rm: 0.1 })); }
  const vv = inter(union(...vines), inner), ww = inter(union(...wins), inner);
  out.push(sheet(vv, P["near-dark"]!, { shadow: false }), sheet(ww, P["near-dark"]!, { shadow: false }));
  return layer(`card-wall${c.s}`, 11, ...out);
}

/* ---------- near floor ---------- */
function floorLayer(c: Cfg): Layer {
  const r = R(c.seed + 12), out: Frag[] = [], f = c.floor;
  const t = steps(r, () => f.top, f.x0, f.x1, f.bottom, 9);
  const pc: Pt = [c.wx, f.top + f.poolDy];
  const hole = ellipse(pc[0], pc[1], 118, 15, 48);
  out.push(...pile(difference(t.poly, hole), [P["near-dark"]!, P.near!, P["mid-2"]!], 12, B.near, c.src, { rm: 0.12 }));
  out.push(paper(difference(ellipse(pc[0], pc[1], 152, 27, 56), ellipse(pc[0], pc[1], 112, 12, 48)), P["mid-2"]!, B.near, c.src, { rm: 0.12 }));
  const wn: Poly[] = [];
  for (let i = 0; i < 28; i++) { const x = rr(r, f.x0 + 20, f.x1 - 30), w = rr(r, 6, 10); if (Math.abs(x - c.wx) < 170) continue; wn.push(arch(r, x, f.top + rr(r, 52, f.bottom - f.top > 120 ? 100 : 66), w, w * 1.7, 0.3)); }
  if (c.s === "") out.push(sheet(union(...wn), P["near-dark"]!, { shadow: false }));
  const parts: Poly[] = [];
  for (const [a, b] of f.balust) for (let x = a; x < b; x += 34 * rr(r, 0.85, 1.2)) {
    if (r() < 0.22) continue;
    const by = t.top(x) + 2, h = 30 * rr(r, 0.6, 1.1);
    parts.push(rect(x, by - h, 9, h), rect(x - 2, by - h - 6, 13, 6), rect(x - 3, by - 5, 15, 5));
    if (r() < 0.6) parts.push(rect(x + 9, by - h + 4, 25, 5));
  }
  out.push(paper(union(...parts), P.near!, B.mid, c.src, { rm: 0.45 }));
  const fr: Shape[] = [];
  for (let i = 0; i < 9; i++) { const x = rr(r, f.x0 + 20, 1100); if (Math.abs(x - c.wx) < 150) continue; fr.push(fern(r, x, t.top(x) + 3, rr(r, 26, 58), rr(r, -0.6, 0.6))); }
  out.push(sheet(union(...fr), P["near-dark"]!, { shadow: false }));
  for (const lx of f.lanternX) {
    const ty = t.top(lx), l = lantern(lx, ty - 34, 34);
    out.push(glow(lx, ty - 34, 70, P.lamp!, { opacity: 0.5, core: P["lamp-core"]! }), sheet(union(...l.holes), P.lamp!, { shadow: false }),
      sheet(union(l.body, rect(lx - 1.5, ty - 20, 3, 22), rect(lx - 9, ty - 2, 18, 5)), P["near-dark"]!, { holes: l.holes, shadow: false }));
  }
  return layer(`floor-near${c.s}`, 12, ...out);
}

function dustLayer(c: Cfg): Layer {
  const r = R(c.seed + 13);
  return layer(`dust${c.s}`, 13, ...([[50, 0.3], [50, 0.55], [40, 0.8]] as [number, number][]).map(([n, op]) =>
    sheet(scatter(r, c.dust, n, (x, y) => ellipse(x, y, rr(r, 1.5, 3.4), rr(r, 1.5, 3.4), 6), 14), P["accent-2"]!, { shadow: false, opacity: op })));
}

/* ---------- gates ---------- */
type Seg = { a: number; b: number; p: number };
function phaseSegs(r: Rng, lo: number, hi: number, holdMin: number, holdMax: number): Seg[] {
  const out: Seg[] = []; let y = lo, p = r() < 0.5 ? 0 : 1;
  while (y < hi) {
    out.push({ a: y, b: Math.min(hi, y + rr(r, holdMin, holdMax)), p }); y = out[out.length - 1]!.b;
    if (y >= hi) break;
    const q = 1 - p;
    for (let k = 1; k <= 3; k++) { const hh = rr(r, 16, 26); out.push({ a: y, b: Math.min(hi, y + hh), p: p + ((q - p) * k) / 4 }); y += hh; }
    p = q;
  }
  out[out.length - 1]!.b = hi;
  return out;
}
function edgePts(r: Rng, segs: Seg[], vOf: (p: number) => number): Pt[] {
  const pts: Pt[] = [];
  for (const s of segs) { const n = Math.max(1, Math.round((s.b - s.a) / 28)); for (let i = 0; i <= n; i++) pts.push([vOf(s.p) + rr(r, -3, 3), s.a + ((s.b - s.a) * i) / n]); }
  return pts;
}
function cross(poly: Poly, y: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!, b = poly[(i + 1) % poly.length]!;
    if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) out.push(a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]));
  }
  return out;
}
/** Hanging balcony fragment on a chain: slab with balusters, beam + two chains up. nx = +1 reaches right (left gate). */
function fragment(r: Rng, v: number, u: number, nx: 1 | -1): Poly[] {
  const L = rr(r, 34, 54), x0 = nx > 0 ? v - 4 : v - L, w = L + 4, h = rr(r, 60, 110), out: Poly[] = [rect(x0, u, w, 8), rect(x0, u - 16, w, 3)];
  for (let k = 0; k < 4; k++) out.push(rect(x0 + 3 + (k * (w - 9)) / 3, u - 14, 3, 14));
  out.push(rect(x0, u - h - 1, w, 3), rect(x0 + 2, u - h, 3, h), rect(x0 + w - 5, u - h, 3, h));
  return out;
}
function gateDetail(r: Rng, poly: Poly, pts: Pt[], segs: Seg[], xOf: (p: number) => number, right: boolean): Shape {
  const nx = right ? -1 : 1, out: (Poly | Shape)[] = [];
  segs.forEach((s, i) => {
    const nxt = segs[i + 1]; if (!nxt) return;
    const va = xOf(s.p), vb = xOf(nxt.p), u = s.b, cx = (va + vb) / 2, up = right ? vb < va : vb > va;
    if (up) {
      const t = r();
      out.push(right ? (t < 0.5 ? column(r, cx, u, 16, rr(r, 40, 80), r() < 0.5) : t < 0.7 ? pine(r, cx, u, rr(r, 36, 60)) : fern(r, cx, u, rr(r, 24, 44), nx * rr(r, 0.3, 0.9)))
        : t < 0.3 ? fern(r, cx, u, rr(r, 24, 44), nx * rr(r, 0.3, 0.9)) : t < 0.55 ? column(r, cx, u, 14, rr(r, 28, 54), true) : t < 0.8 ? pine(r, cx, u, rr(r, 36, 60)) : (() => { const q = ruinWall(r, cx - 24, u + 1, 48, 34); return difference(q.body, ...q.holes); })());
    } else out.push(roots(r, cx, u - 2, 20, rr(r, 50, 120), 3, 1), vine(r, cx, u - 2, rr(r, 60, right ? 200 : 110), 8));
  });
  for (let i = 0; i < pts.length; i += 2) {
    const [v, u] = pts[i]!, t = r();
    if (!right && t < 0.3) out.push(...fragment(r, v, u, 1));
    else if (t < 0.6) out.push(vine(r, v - nx * 3, u, rr(r, 50, right ? 190 : 130), 10));
    else if (t < 0.8) out.push(roots(r, v - nx * 4, u, 14, rr(r, 40, 100), 3, 1));
    else out.push(fern(r, v - nx * 4, u, rr(r, 26, 52), nx * rr(r, 0.4, 1)));
  }
  return union(poly, ...out);
}
function gates(c: Cfg) {
  const portrait = c.s === "-p", lo = -60, hi = portrait ? 1980 : 1140;
  const xl = portrait ? (p: number) => 110 + 90 * p : (p: number) => 230 + 110 * p;
  const xr = portrait ? (p: number) => 880 + 90 * p : (p: number) => 230 + 110 * p + 1305;
  const shift = portrait ? 460 : 700, bl = portrait ? -560 : -800, br = portrait ? 1640 : 2720;
  const segs = phaseSegs(R(c.seed + 16), lo, hi, 110, 200);
  const pl = edgePts(R(c.seed + 14), segs, xl), pr = edgePts(R(c.seed + 15), segs, xr);
  const polyL: Poly = [[bl, lo], ...pl.map(([v, u]) => [v, u] as Pt), [bl, hi]];
  const polyR: Poly = [[br, lo], ...pr.map(([v, u]) => [v, u] as Pt), [br, hi]];
  let minOv = 1e9;
  for (let y = lo + 1; y < hi - 1; y += 0.5) minOv = Math.min(minOv, Math.max(...cross(polyL, y)) + shift - (Math.min(...cross(polyR, y)) - shift));
  const fillsL = [P.near!, P["near-dark"]!, P.gate!];
  const gl = layer(`gate-l${c.s}`, 14, ...pile(gateDetail(R(c.seed + 17), polyL, pl, segs, xl, false), fillsL, 16, B.gate, c.src, { rm: 0.5 }));
  const gr = layer(`gate-r${c.s}`, 15, ...pile(gateDetail(R(c.seed + 18), polyR, pr, segs, xr, true), fillsL, 16, B.gate, c.src, { rm: 0.25 }));
  const ext = (a: Pt[]) => [Math.min(...a.map((p) => p[0])), Math.max(...a.map((p) => p[0]))].map(Math.round);
  return { gl, gr, minOv, restL: ext(pl), restR: ext(pr) };
}

/* ---------- assemble ---------- */
const mk = (c: Cfg): Layer[] => {
  const g = gates(c);
  gateInfo[c.s || "d"] = g;
  return [bgLayer(c), farGal(c), bridgesFar(c), lanternsFar(c), ...(c.s ? [] : [mistLayer()]), galMid(c), wellLayer(c), bloomLayer(c), stairsLayer(c), screensLayer(c), shaftsLayer(c), wallLayer(c), floorLayer(c), dustLayer(c), g.gl, g.gr];
};
const gateInfo: Record<string, ReturnType<typeof gates>> = {};
const dL = mk(D), qL = mk(Q);
const all = [...dL, ...qL];

// per-layer bake settings [scale, quality]
const BAKE: Record<string, [number, number]> = {
  bg: [0.3, 35], "galleries-far": [0.5, 32], "bridges-far": [0.7, 38], "lanterns-far": [0.5, 35], "mist-far": [0.3, 30],
  "galleries-mid": [0.6, 36], "light-well": [0.6, 40], "well-bloom": [0.25, 30], "stairs-mid": [0.65, 38], screens: [0.55, 34],
  shafts: [0.3, 30], "card-wall": [0.5, 34], "floor-near": [0.5, 36], dust: [0.45, 35], "gate-l": [0.3, 35], "gate-r": [0.3, 35],
};
const bakeOf = (id: string) => BAKE[id.replace(/-p$/, "")] ?? [0.6, 40];
const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
for (const l of all) {
  const [scale, quality] = bakeOf(l.id);
  const b = await bakeLayer(SLUG, l, { scale, quality });
  if (!b) throw new Error(`layer ${l.id} empty`);
  baked.set(l.id, b);
}
const r1 = (n: number) => Math.round(n * 10) / 10;
const compose = (width: number, height: number, ids: string[], place: Record<string, { x?: number; y?: number; s?: number }> = {}) => ({
  width, height,
  layers: ids.map((id) => {
    const b = baked.get(id)!, p = place[id] ?? {}, s = p.s ?? 1;
    return { id, src: `/art/${SLUG}/${id}.webp`, x: r1(b.x * s + (p.x ?? 0)), y: r1(b.y * s + (p.y ?? 0)), w: r1(b.w * s), h: r1(b.h * s), depth: b.depth };
  }).sort((a, b) => a.depth - b.depth),
});
const dIds = dL.map((l) => l.id), pIds = qL.map((l) => l.id).concat(["mist-far"]);
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: compose(D.W, D.H, dIds), portrait: compose(Q.W, Q.H, pIds, { "mist-far": { s: 0.6, y: -80 } }) }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop"); await composite(SLUG, "portrait");

// ---------- checks ----------
const mp = (ids: string[]) => ids.reduce((n, id) => { const b = baked.get(id)!, s = bakeOf(id)[0]; return n + (b.w * b.h * s * s) / 1e6; }, 0);
console.log("layers desktop", dIds.length, "portrait", pIds.length);
console.log("bytes total", total, "(KB", Math.round(total / 1024) + ")");
console.log("decoded MP desktop", mp(dIds).toFixed(1), "portrait", mp(pIds).toFixed(1));
const gd = gateInfo.d!, gp = gateInfo["-p"]!;
console.log("desktop gate-l rest edge x", gd.restL, "gate-r rest edge x", gd.restR, "closed min overlap", gd.minOv.toFixed(1));
console.log("portrait gate-l-p rest edge x", gp.restL, "gate-r-p rest edge x", gp.restR, "closed min overlap", gp.minOv.toFixed(1));
if (gd.minOv < 80 || gp.minOv < 80) throw new Error("gate closed overlap < 80");
for (const k of ["desktop", "portrait"] as const) for (const l of manifest.compositions[k].layers) console.log(k.padEnd(8), l.id.padEnd(18), `d${l.depth}`.padEnd(4), `${l.x},${l.y} ${l.w}x${l.h}`.padEnd(34), String(baked.get(l.id)!.bytes).padStart(7));
