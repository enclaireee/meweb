// shell: the reverse side of the Hollow Mountain at night (projects lane intro). Run: npx tsx art/shell/build.ts
// Per-band bake settings (bible s13) -> bakeLayer per layer, manifest written here in the bakeBeat shape.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, arch, bakeLayer, bridge, cloud, column, composite, cut, difference, ellipse, fern, glow, hills, layer, lantern, mist, mix,
  offset, pine, rect, ridge, rng, scatter, shaft, sheet, stairs, tower, union, vine, roots,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "shell";
const P: Palette = {
  sky: "#0a1120", "sky-haze": "#182338", star: "#d6e2f2", moon: "#e6ecf5", "moon-shade": "#c0cde0", "far-1": "#4b5f84", "far-2": "#33456a",
  "shell-far": "#283a5c", shell: "#34486c", "shell-lit": "#4c6694", "shell-shade": "#1e2b45", ledge: "#3e5480", near: "#121c2e", "near-dark": "#0b1220",
  gate: "#070c17", mist: "#a7b6d0", "rim-cool": "#9db8dc", window: "#ffb866", "window-core": "#fff1cf", "window-light": "#ffcf8a", shadow: "#03060c",
};
const W = 1920, H = 1080, PW = 1080, PH = 1920;
const R = (n: number) => rng(50500 + n);
const LV: Pt = (() => { const d = Math.hypot(-0.62, -0.78); return [-0.62 / d, -0.78 / d]; })();

/* ---------- helpers ---------- */
type Band = { off: number; blur: number; op: number; rw: number; rm: number; inner?: [number, number] };
const B = {
  far: { off: 4, blur: 6, op: 0.25, rw: 1.5, rm: 0.35 },
  mid: { off: 8, blur: 10, op: 0.35, rw: 2, rm: 0.45, inner: [4, 0.25] },
  hero: { off: 12, blur: 14, op: 0.4, rw: 2.5, rm: 0.5, inner: [6, 0.3] },
  near: { off: 16, blur: 18, op: 0.45, rw: 3, rm: 0.45, inner: [8, 0.35] },
  gate: { off: 22, blur: 26, op: 0.55, rw: 3, rm: 0.5, inner: [10, 0.4] },
} satisfies Record<string, Band>;
const BIG = rect(-4000, -4000, 10000, 10000);
const inter = (a: Poly | Shape, b: Poly | Shape): Shape => difference(a, difference(BIG, b));
const disc = (cx: number, cy: number, rad: number, n = 72) => ellipse(cx, cy, rad, rad, n);
const interp = (pts: Pt[]) => (x: number) => {
  if (x <= pts[0]![0]) return pts[0]![1];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1]!, b = pts[i]!; if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); }
  return pts[pts.length - 1]![1];
};
const topAt = (poly: Poly, x: number) => interp(poly.slice(0, -2).sort((a, b) => a[0] - b[0]))(x);
const cn = (a: string, b: string, t: number) => mix(P[a]!, P[b]!, t);
const diamond = (x: number, y: number, s: number): Poly => [[x, y - s], [x + s * 0.7, y], [x, y + s], [x - s * 0.7, y]];

type PaperOpts = { holes?: (Poly | Shape)[]; rm?: number; opacity?: number; noRim?: boolean; shadow?: false; noInner?: boolean };
/** One sheet with the band recipe; key light L (moon, upper left), shadow away from it, rim toward it. */
function paper(shape: Poly | Shape, fill: string, b: Band, o: PaperOpts = {}): Frag {
  return sheet(shape, fill, {
    holes: o.holes, opacity: o.opacity,
    shadow: o.shadow === false ? false : { color: P.shadow, blur: b.blur, opacity: b.op, dx: -LV[0] * b.off, dy: -LV[1] * b.off },
    edge: o.noRim ? undefined : { light: LV, width: b.rw, color: mix(fill, P["rim-cool"]!, o.rm ?? b.rm) },
    inner: b.inner && !o.noInner ? { blur: b.inner[0], opacity: b.inner[1], color: P.shadow } : undefined,
  });
}
/** Stacked sheets: same silhouette, each `inset` smaller; `mask(i)` clips tier i (e.g. moon-lit side only). */
function pile(shape: Poly | Shape, fills: string[], inset: number, b: Band, o: PaperOpts = {}, mask?: (i: number) => Shape | null): Frag[] {
  const out: Frag[] = [];
  let cur: Shape = union(shape);
  fills.forEach((f, i) => {
    if (!cur.length) return;
    const bb: Band = i ? { ...b, off: b.off * 0.4, blur: b.blur * 0.5, op: b.op * 0.8 } : b;
    const m = mask?.(i), sh = m ? inter(cur, m) : cur;
    if (sh.length) out.push(paper(sh, f, bb, o));
    cur = offset(cur, -inset);
  });
  return out;
}
const dots = (r: Rng, region: { x0: number; y0: number; x1: number; y1: number }, n: number, a: number, b2: number) =>
  scatter(r, region, n, (x, y) => ellipse(x, y, r.range(a, b2), r.range(a, b2), 6), 12);

/* ---------- windows ---------- */
type Win = { x: number; y: number; w: number; h: number; group: "web" | "data" | "hardware"; spare: boolean };
const GROUPS: ("web" | "data" | "hardware")[] = ["web", "web", "web", "web", "data", "data", "data", "hardware", "hardware", "hardware"];
const mkWins = (xy: [number, number][]): Win[] => xy.map(([x, y], i) => ({ x, y, w: 84, h: 120, group: GROUPS[i]!, spare: i === 6 || i === 9 }));
const WIN_D = mkWins([[470, 470], [590, 470], [710, 470], [830, 470], [260, 690], [380, 690], [500, 690], [700, 690], [820, 690], [940, 690]]);
const WIN_P = mkWins([[336, 560], [444, 560], [552, 560], [660, 560], [190, 800], [298, 800], [406, 800], [590, 800], [698, 800], [806, 800]]);

/* ---------- scene config ---------- */
type Cfg = {
  W: number; H: number; sfx: string; s: number; apex: Pt; left: Pt[]; right: Pt[]; bottom: number; ledges: number[]; wins: Win[]; lit: Poly;
  hazeY: number; stripH: number; tinyWins: number;
  rangeBack: { x0: number; x1: number; y: number; amp: number }; rangeFront: { x0: number; x1: number; y: number; amp: number };
  pineSpans: [number, number][]; farTowers: [number, number][]; clouds: [number, number, number, number, 0 | 1][];
  peaks: { x0: number; x1: number; y: number; amp: number }[];
  runs: Pt[]; bridges: [number, number, number][]; towers: [number, number, number, number][]; crown: Pt;
  mound: number; path: { x: number; w: number; y0: number; y1: number }; nearY: number; lanterns: [number, number][];
  shafts: [number, number, number, number, number][]; mists: [number, number, number, number, number][];
  motes: { x0: number; y0: number; x1: number; y1: number };
  clusters: { web: [number, number, number]; data: [number, number, number]; hw: [number, number, number] }; slotGlow: [number, number, number];
  starSplit: (x: number, y: number) => boolean;
};

function scene(c: Cfg) {
  const s = c.sfx, wins = c.wins;
  const xlf = interp(c.left), xrf = interp(c.right);
  const inside = (x: number, y: number, m: number) => y > c.apex[1] + 25 && x > xlf(y) + m && x < xrf(y) - m;
  const nearWin = (x: number, y: number, pad: number) => wins.some((w) => x > w.x - pad && x < w.x + w.w + pad && y > w.y - pad && y < w.y + w.h + 28 + pad);
  const lit: Shape = union(c.lit);
  const mk = (n: number) => R(c.s + n);

  // ziggurat silhouette: one outline step per ledge, edge x from the profile at band middle
  const ys = [c.apex[1], ...c.ledges, c.bottom];
  const Lp: Poly = [], Rp: Poly = [];
  for (let i = 0; i < ys.length - 1; i++) {
    const ym = (ys[i]! + ys[i + 1]!) / 2, xl = xlf(ym), xr = xrf(ym);
    Lp.push([xl, ys[i]!], [xl, ys[i + 1]!]); Rp.push([xr, ys[i]!], [xr, ys[i + 1]!]);
  }
  const S: Shape = union(cut([...Lp, ...Rp.reverse()], mk(1), 2, 40));
  const Sin = offset(S, -26);
  const keep = union(...wins.map((w) => rect(w.x - 12, w.y - 12, w.w + 24, w.h + 28)));

  // window shapes (one rng, reused for holes, frames and glow panes)
  const rw = mk(2);
  const holes = wins.map((w) => arch(rw, w.x + w.w / 2, w.y + w.h, w.w, w.h, 0.8));

  /* 0 sky */
  const sky = (() => {
    const r = mk(3), out: Frag[] = [];
    out.push(sheet(rect(0, 0, c.W, c.H), P.sky!, { shadow: false }));
    out.push(sheet(cut(rect(-40, c.hazeY - 140, c.W + 80, c.H - c.hazeY + 200), r, 5, 70), cn("sky", "sky-haze", 0.5), { shadow: false }));
    out.push(sheet(cut(rect(-40, c.hazeY, c.W + 80, c.H - c.hazeY + 60), r, 6, 60), P["sky-haze"]!, { shadow: false }));
    const lft = { x0: 0, y0: 0, x1: c.W, y1: c.hazeY };
    const all = scatter(r, lft, 120, (x, y) => diamond(x, y, r.range(2, 2.8)), 22);
    const left = all.filter((ring) => c.starSplit(ring[0]![0], ring[0]![1]));
    const right = all.filter((ring) => !c.starSplit(ring[0]![0], ring[0]![1]));
    out.push(sheet(left, P.star!, { shadow: false, opacity: 0.85 }), sheet(right, P.star!, { shadow: false, opacity: 0.45 }));
    return layer("sky" + s, 0, ...out);
  })();

  /* 2 range-far */
  const rangeFar = (() => {
    const r = mk(4), out: Frag[] = [];
    const rb = ridge(r, { ...c.rangeBack, base: c.H + 200, step: 36, seed: 4101 + c.s }), rf = ridge(r, { ...c.rangeFront, base: c.H + 200, step: 36, seed: 4102 + c.s });
    out.push(...pile(rb, [P["far-1"]!, cn("far-1", "mist", 0.18)], 5, B.far));
    out.push(...pile(rf, [P["far-2"]!, cn("far-2", "far-1", 0.3)], 5, B.far, { rm: 0.25 }));
    const small = (poly: Poly, fill: string, n: number, spans: [number, number][], hMin: number, hMax: number) => {
      const t: Shape[] = [];
      for (let i = 0; i < n; i++) { const [a, b] = r.pick(spans), x = r.range(a, b); t.push(pine(r, x, topAt(poly, x) + r.range(5, 16), r.range(hMin, hMax))); }
      out.push(sheet(union(...t), fill, { shadow: false }));
    };
    small(rb, cn("far-1", "far-2", 0.5), 22, c.pineSpans.filter(([a]) => a < c.W * 0.55), 14, 30);
    small(rf, cn("far-2", "shell-far", 0.5), 22, c.pineSpans, 14, 28);
    const bod: Shape[] = [], hol: Poly[] = [];
    for (const [x0, x1] of c.farTowers) { const x = r.range(x0, x1), h = r.range(22, 30), T = tower(r, x, topAt(rf, x) + 6, h * 0.45 + 6, h, { windows: 1 }); bod.push(T.body); hol.push(...T.holes); }
    out.push(paper(union(...bod), cn("far-2", "far-1", 0.4), B.far, { holes: hol, rm: 0.25 }));
    return layer("range-far" + s, 2, ...out);
  })();

  /* 3 clouds */
  const clouds = (() => {
    const r = mk(5), out: Frag[] = [];
    for (const [cx, cy, w, h, k] of c.clouds) {
      const cl = cloud(r, cx, cy, w, h);
      if (k === 0) { out.push(paper(cl, P["far-1"]!, B.far, { rm: 0.3 })); out.push(paper(offset(cl, -6), P.mist!, B.far, { opacity: 0.5, shadow: false, noInner: true })); }
      else out.push(...pile(cl, [P["far-2"]!, cn("far-2", "far-1", 0.3)], 6, B.far, { rm: 0.25 }));
    }
    return layer("clouds" + s, 3, ...out);
  })();

  /* 4 shell-back */
  const back = (() => {
    const r = mk(6), out: Frag[] = [];
    c.peaks.forEach((pk, i) => {
      const poly = ridge(r, { ...pk, base: pk.y + 520, step: 30, seed: 4200 + c.s + i });
      out.push(...pile(poly, [P["shell-shade"]!, P["shell-far"]!], 8, B.mid, { rm: 0.25 }));
      const ts: Shape[] = [], hs: Poly[] = [];
      for (let k = 0; k < 3; k++) { const x = r.range(pk.x0 + 30, pk.x1 - 30), h = r.range(22, 40), T = tower(r, x, topAt(poly, x) + 6, h * 0.4 + 7, h, { windows: 1 }); ts.push(T.body); hs.push(...T.holes); }
      out.push(paper(union(...ts), P["shell-far"]!, B.far, { holes: hs, rm: 0.25 }));
    });
    const moved = S.map((ring) => ring.map(([x, y]) => [x + 24, y + 18] as Pt));
    out.push(...pile(moved, [P["shell-shade"]!, P["shell-far"]!], 10, B.mid, { rm: 0.25 }));
    return layer("shell-back" + s, 4, ...out);
  })();

  /* 5 shell-face (hero) */
  const face = layer("shell-face" + s, 5, ...pile(S, [P["shell-shade"]!, P.shell!, cn("shell", "shell-lit", 0.4), P["shell-lit"]!], 14, B.hero, { holes }, (i) => (i >= 2 ? lit : null)));

  /* 6 strata */
  const strata = (() => {
    const r = mk(7), out: Frag[] = [];
    const litF = [cn("shell", "shell-lit", 0.45), cn("shell", "shell-lit", 0.22)], darkF = [cn("shell-shade", "shell", 0.5), P["shell-shade"]!];
    const gal: { x: number; i: number; w: number; h: number; by: number }[] = [];
    const strips: { top: number; bot: number }[] = c.ledges.map((y, i) => ({ top: y + 14, bot: Math.min((c.ledges[i + 1] ?? c.bottom) - 8, y + 14 + c.stripH) }));
    const usable = strips.map((q, i) => ({ q, i })).filter(({ q }) => q.bot - q.top >= 36);
    for (let n = 0, tries = 0; n < 14 && tries < 400; tries++) {
      const { q, i } = usable[tries % usable.length]!, w = r.range(16, 30), x = r.range(0, 1) * (c.W - 200) + 100, by = q.bot - 4;
      if (!inside(x, by, 60) || nearWin(x, by, 18) || gal.some((g) => g.i === i && Math.abs(g.x - x) < 44)) continue;
      gal.push({ x, i, w, h: Math.min(w * r.range(1.5, 1.9), q.bot - q.top - 8), by }); n++;
    }
    const galHoles = gal.map((g) => arch(r, g.x, g.by, g.w, g.h, 0.5));
    // ledges (terrace edges) and wall strips
    strips.forEach((q, i) => {
      const y = c.ledges[i]!;
      const led = inter(cut(rect(-300, y, c.W + 600, 12), r, 1.2, 40), offset(S, -3));
      out.push(paper(inter(led, lit), P.ledge!, B.mid, { holes: [keep], rm: 0.45 }), paper(difference(led, lit), P.ledge!, B.mid, { holes: [keep], rm: 0.25 }));
      if (q.bot - q.top < 24) return;
      const st = inter(cut(rect(-300, q.top, c.W + 600, q.bot - q.top), r, 1.2, 40), Sin);
      const hs = [keep, ...galHoles.filter((_, k) => gal[k]!.i === i)];
      const sl = inter(st, lit), sd = difference(st, lit);
      if (sl.length) out.push(paper(sl, litF[i % 2]!, B.mid, { holes: hs, rm: 0.45 }));
      if (sd.length) out.push(paper(sd, darkF[i % 2]!, B.mid, { holes: hs, rm: 0.25 }));
    });
    // tiny dark windows 4-8 px inside the strips
    const wl: Poly[] = [], wd: Poly[] = [], placed: Pt[] = [];
    for (let n = 0, tries = 0; n < c.tinyWins && tries < 3000; tries++) {
      const q = r.pick(usable).q, x = r.range(60, c.W - 60), y = r.range(q.top + 8, q.bot - 6), w = r.range(4, 8);
      if (!inside(x, y, 50) || nearWin(x, y, 14) || placed.some(([a, b]) => Math.hypot(a - x, b - y) < 14)) continue;
      placed.push([x, y]); n++;
      const a = arch(r, x, y + w * 1.7, w, w * 1.7, 0.3);
      if (inter(a, lit).length) wl.push(a); else wd.push(a);
    }
    out.push(sheet(union(...wl), P["shell-shade"]!, { shadow: false }), sheet(union(...wd), P.near!, { shadow: false }));
    // zig-zag stairs (4 px treads): three wedges stacked, directions alternating
    const sp: Poly[] = [];
    for (const [rx, ry] of c.runs) for (let k = 0; k < 3; k++) sp.push(stairs(rx, ry - 28 * (k + 1), 56, 28, 14, k % 2 === 0 ? 1 : -1));
    out.push(paper(union(...sp), P.ledge!, B.mid, { rm: 0.35 }));
    // hanging vines
    const vl: Shape[] = [], vd: Shape[] = [];
    for (let n = 0, tries = 0; n < 16 && tries < 400; tries++) {
      const y = r.pick(c.ledges), x = r.range(80, c.W - 80);
      if (!inside(x, y + 14, 44) || nearWin(x, y + 70, 16)) continue;
      const v = vine(r, x, y + 10, r.range(36, 110), 9); n++;
      (x < 900 || c.W < 1500 ? vl : vd).push(v);
    }
    if (vl.length) out.push(sheet(union(...vl), P["shell-shade"]!, { shadow: false }));
    if (vd.length) out.push(sheet(union(...vd), P.near!, { shadow: false }));
    return layer("strata" + s, 6, ...out);
  })();

  /* 7 balconies */
  const balconies = (() => {
    const r = mk(8), out: Frag[] = [];
    const fr = wins.map((w, i) => difference(arch(r, w.x + w.w / 2, w.y + w.h, w.w + 8, w.h + 4, 0.4), holes[i]!));
    const slabs = wins.flatMap((w) => [rect(w.x - 14, w.y + w.h, w.w + 28, 9), rect(w.x - 6, w.y + w.h + 9, 9, 7), rect(w.x + w.w - 3, w.y + w.h + 9, 9, 7)]);
    out.push(paper(union(...fr, ...slabs), P.ledge!, B.mid, { rm: 0.4 }));
    const bs: Shape[] = [];
    for (const [x0, x1, y] of c.bridges) {
      bs.push(bridge(r, x0, x1, y, 14, Math.round((x1 - x0) / 22)));
      const T = tower(r, x0 + 12, y + 2, 24, 56, { windows: 2 }); bs.push(difference(T.body, ...T.holes));
    }
    out.push(paper(union(...bs), P.ledge!, B.mid, { rm: 0.35 }));
    const tb: Shape[] = [], th: Poly[] = [];
    for (const [cx, by, w, h] of c.towers) {
      const T = tower(r, cx, by, w, h, { windows: 3 });
      const notch: Poly = [[cx - w * 0.2, by - h * 0.7], [cx + w * 0.05, by - h * 0.55], [cx + w * 0.25, by - h * 0.78], [cx + w, by - h * 0.78], [cx + w, by - h - 10], [cx - w, by - h - 10], [cx - w, by - h * 0.7]];
      tb.push(difference(T.body, notch)); th.push(...T.holes);
    }
    const C = tower(r, c.crown[0], c.crown[1], 34, 62, { windows: 2 });
    tb.push(C.body); th.push(...C.holes);
    out.push(paper(union(...tb), P["shell-lit"]!, B.mid, { holes: th, rm: 0.5 }));
    return layer("balconies" + s, 7, ...out);
  })();

  /* 8-10 window light, one layer per cluster */
  const glowLayer = (id: string, depth: number, group: Win["group"], cl: [number, number, number], cr: number) => {
    const out: Frag[] = [glow(cl[0], cl[1], cl[2], P.window!, { opacity: 0.32, core: P["window-core"]! })];
    wins.forEach((w, i) => {
      if (w.group !== group) return;
      out.push(glow(w.x + w.w / 2, w.y + w.h / 2, c.slotGlow[0] * (w.spare && group === "hardware" ? 0.75 : 1), P.window!, { opacity: 0.5, core: P["window-core"]! }));
    });
    wins.forEach((w, i) => {
      if (w.group !== group) return;
      out.push(sheet(holes[i]!, P["window-light"]!, { shadow: false }));
      out.push(sheet(offset(holes[i]!, -9), cn("window-light", "window-core", 0.55), { shadow: false }));
      if (w.spare) {
        const cells: Poly[] = [];
        for (let a = 0; a < 3; a++) for (let b = 0; b < 4; b++) cells.push(rect(w.x + 6 + a * 28, w.y + 14 + b * 28, 16, 18));
        out.push(sheet(holes[i]!, P["shell-shade"]!, { holes: cells, shadow: false }));
      }
    });
    return layer(id + s, depth, ...out);
  };
  const gWeb = glowLayer("glow-web", 8, "web", [c.clusters.web[0], c.clusters.web[1], c.clusters.web[2]], 0);
  const gData = glowLayer("glow-data", 9, "data", c.clusters.data, 0);
  const gHw = glowLayer("glow-hw", 10, "hardware", c.clusters.hw, 0);

  /* 11 mist + moon shafts */
  const mistL = layer("mist" + s, 11,
    ...c.mists.map(([x, y, w, h, o]) => mist(x, y, w, h, P.mist!, o)),
    ...c.shafts.map(([x, y, a, len, o]) => shaft(x, y, 26, 90, len, a, P.mist!, o)));

  /* 12 trees-mid */
  const trees = (() => {
    const r = mk(9), out: Frag[] = [];
    const m = hills(r, { x0: -200, x1: c.W + 200, y: c.mound, base: c.H + 200, amp: 46, step: 70, seed: 4300 + c.s });
    out.push(...pile(m, [P["shell-shade"]!, cn("shell-shade", "near", 0.5)], 8, B.mid, { rm: 0.25 }));
    const rows: [number, number, number, number, number, string][] = [
      [26, c.mound + 4, c.mound + 30, 46, 86, P["shell-shade"]!], [30, c.mound + 36, c.mound + 70, 60, 110, P.near!], [24, c.mound + 74, c.mound + 112, 80, 140, P["near-dark"]!],
    ];
    rows.forEach(([n, y0, y1, h0, h1, fill], ri) => {
      const ps: Shape[] = [];
      for (let i = 0; i < n; i++) {
        const x = -150 + ((i + r.range(0.1, 0.9)) / n) * (c.W + 300);
        if (ri < 2 && x > c.path.x - 8 && x < c.path.x + c.path.w + 8) continue;
        ps.push(pine(r, x, r.range(y0, y1), r.range(h0, h1)));
      }
      out.push(paper(union(...ps), fill, B.mid, { rm: ri ? 0.25 : 0.3 }));
    });
    const fl: Poly[] = [], steps = Math.round((c.path.y0 - c.path.y1) / 36);
    for (let k = 0; k < steps; k++) fl.push(stairs(c.path.x, c.path.y0 - 36 * (k + 1), c.path.w, 36, Math.round(c.path.w / 4), k % 2 === 0 ? 1 : -1));
    out.push(paper(union(...fl), P.shell!, B.mid, { rm: 0.3 }));
    return layer("trees-mid" + s, 12, ...out);
  })();

  /* 13 near-ground */
  const nearG = (() => {
    const r = mk(10), out: Frag[] = [];
    const g = hills(r, { x0: -200, x1: c.W + 200, y: c.nearY + 22, base: c.H + 260, amp: 40, step: 60, seed: 4400 + c.s });
    out.push(...pile(g, [P["near-dark"]!, P.near!, cn("near", "shell-shade", 0.5)], 14, B.near, { rm: 0.25 }));
    const rocks: Shape[] = [];
    for (let i = 0; i < 9; i++) { const x = r.range(-100, c.W + 100), w = r.range(40, 120); rocks.push(union(cut([[x, c.nearY + 60], [x + w * 0.2, c.nearY + 60 - w * 0.4], [x + w * 0.6, c.nearY + 60 - w * 0.5], [x + w, c.nearY + 60 - w * 0.1], [x + w * 1.05, c.nearY + 80], [x - 5, c.nearY + 80]], r, 2, 22))); }
    out.push(paper(union(...rocks), P["near-dark"]!, B.near, { rm: 0.25 }));
    const fr: Shape[] = [];
    for (let i = 0; i < 26; i++) { const x = r.range(-100, c.W + 100); fr.push(fern(r, x, topAt(g, x) + 4, r.range(30, 70), r.range(-0.6, 0.6))); }
    out.push(sheet(union(...fr), P["near-dark"]!, { shadow: false }));
    for (const [lx, ly] of c.lanterns) {
      const T = lantern(lx, ly - 54, 36), post = union(column(r, lx, ly + 18, 14, 40, false), rect(lx - 12, ly - 22, 24, 6));
      out.push(sheet(union(...T.holes), P["window-light"]!, { shadow: false }));
      out.push(paper(union(post, T.body), P["near-dark"]!, B.near, { holes: T.holes, rm: 0.25 }));
      out.push(paper(rect(lx - 22, ly + 16, 44, 14), P.near!, B.near, { rm: 0.25 }));
    }
    out.push(sheet(dots(r, c.motes, 80, 1.5, 3.2), P["window-light"]!, { shadow: false, opacity: 0.6 }));
    return layer("near-ground" + s, 13, ...out);
  })();

  return { sky, rangeFar, clouds, back, face, strata, balconies, gWeb, gData, gHw, mistL, trees, nearG };
}

/* ---------- moon (shared by both compositions) ---------- */
function moonLayer(): Layer {
  const r = R(80), cx = 260, cy = 180;
  const base = cut(disc(cx, cy, 90, 96), r, 1.2, 40);
  const out: Frag[] = [glow(cx, cy, 400, P.mist!, { opacity: 0.35, core: P["moon-shade"]! })];
  out.push(...pile(base, [P["moon-shade"]!, P.moon!, cn("moon", "star", 0.5)], 9, { ...B.far, off: 3, blur: 4 }, { noInner: true, rm: 0.1 }));
  for (const [dx, dy, rad] of [[-24, -18, 11], [18, 20, 14], [-8, 30, 7], [30, -22, 8], [-34, 14, 9]] as const)
    out.push(sheet(cut(disc(cx + dx, cy + dy, rad, 20), r, 0.6, 12), P["moon-shade"]!, { shadow: false, opacity: 0.8 }));
  return layer("moon", 1, ...out);
}

/* ---------- gates ---------- */
type Seg = { a: number; b: number; p: number };
function phaseSegs(r: Rng, lo: number, hi: number, zone: [number, number]): Seg[] {
  const out: Seg[] = []; let y = lo, p = r() < 0.5 ? 0 : 1;
  while (y < hi) {
    const inZone = y > zone[0] - 60 && y < zone[1];
    out.push({ a: y, b: Math.min(hi, y + r.range(60, 110)), p: inZone ? (out.length % 2) * 0.1 : p }); y = out[out.length - 1]!.b;
    if (y >= hi) break;
    const q = 1 - p, inZ2 = y > zone[0] - 60 && y < zone[1];
    if (!inZ2) { for (let k = 1; k <= 3; k++) { const hh = r.range(16, 26); out.push({ a: y, b: Math.min(hi, y + hh), p: p + ((q - p) * k) / 4 }); y += hh; } p = q; }
  }
  out[out.length - 1]!.b = hi;
  return out;
}
function edgePts(r: Rng, segs: Seg[], vOf: (p: number) => number): Pt[] {
  const pts: Pt[] = [];
  for (const s of segs) { const n = Math.max(1, Math.round((s.b - s.a) / 28)); for (let i = 0; i <= n; i++) pts.push([vOf(s.p) + r.range(-4, 4), s.a + ((s.b - s.a) * i) / n]); }
  return pts;
}
function cross(poly: Poly, axis: 0 | 1, c: number): number[] {
  const o = axis === 1 ? 0 : 1, out: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!, b = poly[(i + 1) % poly.length]!, a1 = a[axis], b1 = b[axis];
    if ((a1 <= c && b1 > c) || (b1 <= c && a1 > c)) out.push(a[o] + ((b[o] - a[o]) * (c - a1)) / (b1 - a1));
  }
  return out;
}
const GATE_FILLS = [P.gate!, P["near-dark"]!, P.near!];
/** Side gates (desktop and portrait share the recipe): edge sweeps along y, left edge xl(p), right edge xl(p)+gap. */
function gates(o: { W: number; sfx: string; seed: number; xl: (p: number) => number; gap: number; lo: number; hi: number; outL: number; outR: number; shift: number; zone: [number, number] }) {
  const rl = R(o.seed), rr = R(o.seed + 1), rs = R(o.seed + 2);
  const segs = phaseSegs(rs, o.lo, o.hi, o.zone), xr = (p: number) => o.xl(p) + o.gap;
  const pl = edgePts(rl, segs, o.xl), pr = edgePts(rr, segs, xr);
  const polyL: Poly = [[o.outL, o.lo], ...pl.map(([v, u]) => [v, u] as Pt), [o.outL, o.hi]];
  const polyR: Poly = [[o.outR, o.lo], ...pr.map(([v, u]) => [v, u] as Pt), [o.outR, o.hi]];
  let minOv = 1e9;
  for (let y = o.lo; y < o.hi; y += 0.5) {
    const l = Math.max(...cross(polyL, 1, y + 0.25)), r2 = Math.min(...cross(polyR, 1, y + 0.25));
    minOv = Math.min(minOv, l + o.shift - (r2 - o.shift));
  }
  const detail = (poly: Poly, right: boolean, r: Rng, pts: Pt[], pinesMax: number) => {
    const nx = right ? -1 : 1, out: Shape[] = []; let pn = 0;
    const free = (u: number) => !(u > o.zone[0] && u < o.zone[1]);
    segs.forEach((s, i) => {
      const nxt = segs[i + 1]; if (!nxt || !free(s.b)) return;
      const va = (right ? xr : o.xl)(s.p), vb = (right ? xr : o.xl)(nxt.p), u = s.b, cx = (va + vb) / 2, up = right ? vb < va : vb > va;
      if (up) {
        const t = r();
        if (t < 0.55 && pn < pinesMax) { out.push(pine(r, cx, u, r.range(40, 74))); pn++; }
        else if (t < 0.75) out.push(fern(r, cx, u, r.range(24, 44), nx * r.range(0.3, 0.9)));
        else out.push(column(r, cx, u, 14, r.range(28, 54), true));
      } else out.push(roots(r, cx, u - 2, 20, r.range(50, 110), 3, 1), vine(r, cx, u - 2, r.range(40, 90), 8));
    });
    for (let i = 0; i < pts.length; i += 3) {
      const [v, u] = pts[i]!, t = r(); if (!free(u)) continue;
      if (t < 0.5) out.push(vine(r, v - nx * 3, u, r.range(50, 120), 10));
      else if (t < 0.75) out.push(roots(r, v - nx * 4, u, 14, r.range(40, 90), 3, 1));
      else out.push(fern(r, v - nx * 4, u, r.range(26, 50), nx * r.range(0.4, 1)));
    }
    return union(poly, ...out);
  };
  // tone-on-tone carving on the body (calm-safe mixes): terrace strips + tiny windows, clipped to the gate
  const body = (poly: Poly, x0: number, x1: number, r: Rng): Frag[] => {
    const inner = offset(poly, -40), strips: Shape[] = [], ws: Poly[] = [];
    for (let y = o.lo + 40; y < o.hi - 80; y += r.range(80, 120)) {
      const hgt = r.range(40, 60);
      strips.push(union(cut(rect(-900, y, 3800, hgt), r, 2, 40)));
      for (let k = 0; k < 5; k++) { const w = r.range(4, 8); ws.push(arch(r, r.range(x0, x1), y + hgt - 6, w, w * 1.7, 0.3)); }
    }
    return [paper(inter(union(...strips), inner), cn("near", "shell-shade", 0.35), B.near, { rm: 0.25 }), sheet(inter(union(...ws), inner), P["near-dark"]!, { shadow: false })];
  };
  const gl = layer("gate-l" + o.sfx, 14, ...pile(detail(polyL, false, R(o.seed + 3), pl, 99), GATE_FILLS, 16, B.gate, { rm: 0.5 }), ...body(polyL, -60, o.xl(0) - 20, R(o.seed + 5)));
  const gr = layer("gate-r" + o.sfx, 15, ...pile(detail(polyR, true, R(o.seed + 4), pr, 2), GATE_FILLS, 16, B.gate, { rm: 0.25 }), ...body(polyR, xr(1) + 40, o.W + 60, R(o.seed + 6)));
  const ext = (a: Pt[]) => [Math.min(...a.map((p) => p[0])), Math.max(...a.map((p) => p[0]))].map(Math.round);
  return { gl, gr, minOv, restL: ext(pl), restR: ext(pr) };
}

/* ---------- compositions ---------- */
const CAL_D = (x: number, y: number) => x >= 1056 && y >= 160 && y <= 940;
const desk: Cfg = {
  W, H, sfx: "", s: 100, apex: [820, 70], bottom: 1160,
  left: [[70, 820], [115, 740], [200, 570], [320, 450], [450, 340], [590, 220], [720, 170], [820, 130], [940, 90], [1080, -60], [1160, -120]],
  right: [[70, 820], [120, 950], [230, 1100], [380, 1220], [560, 1330], [780, 1420], [1080, 1500], [1160, 1530]],
  ledges: [100, 150, 220, 300, 380, 440, 610, 664, 840, 930, 1010], wins: WIN_D,
  lit: [[-300, -100], [860, -100], [1010, 200], [1030, 520], [980, 760], [800, 1000], [620, 1250], [-300, 1250]],
  hazeY: 640, stripH: 62, tinyWins: 60,
  rangeBack: { x0: -160, x1: 1100, y: 770, amp: 150 }, rangeFront: { x0: -160, x1: 2100, y: 830, amp: 110 },
  pineSpans: [[-100, 140], [1450, 2050]], farTowers: [[1500, 1700], [1760, 1980]],
  clouds: [[300, 340, 560, 110, 0], [150, 440, 420, 90, 0], [640, 260, 440, 90, 0], [1500, 340, 760, 70, 1]],
  peaks: [{ x0: 220, x1: 640, y: 330, amp: 220 }, { x0: 1000, x1: 1420, y: 300, amp: 200 }],
  runs: [[560, 400], [1000, 420], [1180, 700], [330, 600], [1100, 870]],
  bridges: [[540, 860, 372], [380, 780, 628], [240, 1000, 868], [1090, 1300, 520], [1110, 1330, 760]],
  towers: [[500, 303, 50, 110], [430, 383, 40, 85]], crown: [822, 72],
  mound: 940, path: { x: 592, w: 100, y0: 1010, y1: 650 }, nearY: 990, lanterns: [[330, 1010], [900, 1020]],
  shafts: [[290, 210, 38, 640, 0.18], [360, 170, 30, 700, 0.14]],
  mists: [[520, 940, 1060, 110, 0.25], [1500, 960, 900, 90, 0.06], [300, 700, 700, 120, 0.12]],
  motes: { x0: 380, y0: 440, x1: 1000, y1: 880 },
  clusters: { web: [692, 530, 320], data: [422, 750, 260], hw: [862, 750, 200] }, slotGlow: [140, 0, 0],
  starSplit: (x) => x < 1056,
};
const PORT: Cfg = {
  W: PW, H: PH, sfx: "-p", s: 200, apex: [540, 200], bottom: 1530,
  left: [[200, 540], [250, 430], [330, 320], [430, 220], [540, 120], [650, 40], [780, -40], [950, -130], [1150, -200], [1500, -260], [1530, -270]],
  right: [[200, 540], [250, 650], [330, 760], [430, 860], [540, 960], [650, 1040], [780, 1120], [950, 1210], [1150, 1280], [1500, 1340], [1530, 1350]],
  ledges: [230, 310, 390, 470, 540, 704, 760, 940, 1020, 1110, 1200, 1290, 1380, 1450], wins: WIN_P,
  lit: [[-300, -100], [760, -100], [900, 300], [960, 600], [900, 900], [700, 1000], [-300, 1000]],
  hazeY: 1000, stripH: 66, tinyWins: 70,
  rangeBack: { x0: -160, x1: 700, y: 440, amp: 150 }, rangeFront: { x0: 400, x1: 1240, y: 460, amp: 130 },
  pineSpans: [[-100, 300], [800, 1180]], farTowers: [[-60, 200], [820, 1060]],
  clouds: [[170, 220, 420, 90, 0], [900, 170, 400, 80, 1], [540, 130, 360, 60, 0], [880, 290, 380, 70, 1]],
  peaks: [{ x0: -80, x1: 380, y: 430, amp: 200 }, { x0: 700, x1: 1160, y: 430, amp: 200 }],
  runs: [[360, 440], [700, 470], [120, 1100], [820, 1090], [440, 1260]],
  bridges: [[240, 840, 728], [300, 780, 480], [200, 880, 990], [200, 900, 1150]],
  towers: [[300, 393, 50, 110], [190, 473, 42, 90]], crown: [540, 202],
  mound: 1560, path: { x: 492, w: 100, y0: 1480, y1: 960 }, nearY: 1730, lanterns: [[240, 1750], [820, 1756]],
  shafts: [[200, 170, 34, 660, 0.18], [250, 200, 26, 640, 0.14]],
  mists: [[540, 1010, 1000, 110, 0.06], [400, 1060, 900, 100, 0.06], [300, 720, 700, 120, 0.12]],
  motes: { x0: 250, y0: 520, x1: 900, y1: 980 },
  clusters: { web: [540, 620, 300], data: [340, 840, 170], hw: [740, 840, 170] }, slotGlow: [130, 0, 0],
  starSplit: (_x, y) => y < 1056,
};

const sD = scene(desk), sP = scene(PORT);
const moon = moonLayer();
const gD = gates({ W, sfx: "", seed: 140, xl: (p) => 165 + 90 * p, gap: 1290, lo: -60, hi: 1140, outL: -800, outR: 2720, shift: 700, zone: [610, 910] });
const gP = gates({ W: PW, sfx: "-p", seed: 240, xl: (p) => 125 + 75 * p, gap: 800, lo: -60, hi: 1980, outL: -560, outR: 1640, shift: 460, zone: [740, 990] });

const ORDER = (s: ReturnType<typeof scene>, g: ReturnType<typeof gates>): Layer[] => [s.sky, s.rangeFar, s.clouds, s.back, s.face, s.strata, s.balconies, s.gWeb, s.gData, s.gHw, s.mistL, s.trees, s.nearG, g.gl, g.gr];
const all: Layer[] = [moon, ...ORDER(sD, gD), ...ORDER(sP, gP)];

// per-band bake table (bible s13): [scale, quality]
const BAKE: Record<string, [number, number]> = {
  sky: [0.5, 40], moon: [0.45, 40], "range-far": [0.5, 40], clouds: [0.5, 40], "shell-back": [0.4, 40], "shell-face": [0.5, 42], strata: [0.5, 36], balconies: [0.5, 36],
  "glow-web": [0.4, 40], "glow-data": [0.4, 40], "glow-hw": [0.4, 40], mist: [0.3, 30], "trees-mid": [0.45, 38], "near-ground": [0.4, 36], "gate-l": [0.35, 35], "gate-r": [0.35, 35],
};
const bk = (id: string) => BAKE[id.replace(/-p$/, "")] ?? [0.6, 50];
const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
for (const l of all) {
  const [scale, quality] = bk(l.id);
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
const dIds = ["sky", "moon", ...ORDER(sD, gD).slice(1).map((l) => l.id)];
const pIds = ["sky-p", "moon", ...ORDER(sP, gP).slice(1).map((l) => l.id)];
const moonPlace = { x: 180 - 260 * 0.8, y: 140 - 180 * 0.8, s: 0.8 };
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: compose(W, H, dIds), portrait: compose(PW, PH, pIds, { moon: moonPlace }) }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const wj = (ws: Win[]) => ws.map(({ x, y, w, h, group }) => ({ x, y, w, h, group }));
writeFileSync(join(ROOT, "public/art", SLUG, "windows.json"), JSON.stringify({ desktop: wj(WIN_D), portrait: wj(WIN_P) }) + "\n");
await composite(SLUG, "desktop"); await composite(SLUG, "portrait");

/* ---------- checks ---------- */
const mp = (ids: string[]) => ids.reduce((n, id) => { const b = baked.get(id)!; return n + (b.w * b.h * bk(id)[0] ** 2) / 1e6; }, 0);
console.log("layers desktop", dIds.length, "portrait", pIds.length);
console.log("desktop order", dIds.join(" "));
console.log("portrait order", pIds.join(" "));
console.log("bytes total", total, "(KB", Math.round(total / 1024) + ")");
console.log("decoded MP desktop", mp(dIds).toFixed(1), "portrait", mp(pIds).toFixed(1));
console.log("gate-l rest edge x", gD.restL, "gate-r rest edge x", gD.restR, "closed min overlap", gD.minOv.toFixed(1));
console.log("gate-l-p rest edge x", gP.restL, "gate-r-p rest edge x", gP.restR, "closed min overlap", gP.minOv.toFixed(1));
if (gD.minOv < 80 || gP.minOv < 80) throw new Error("gate closed overlap < 80");
for (const [id, b] of baked) console.log(" ", id.padEnd(16), String(b.bytes).padStart(7), `${Math.round(b.w)}x${Math.round(b.h)}`);
