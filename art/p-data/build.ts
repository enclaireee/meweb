// p-data: a flooded cistern, district teal. Run: npx tsx art/p-data/build.ts
// Per-layer bake settings need bakeLayer; manifest is written here in the bakeBeat format.
import { squeeze } from "../ambient/squeeze.ts";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { gateFx } from "../ambient/gatefx.ts";
import {
  ROOT, arch, bakeLayer, bridge, column, composite, cut, difference, ellipse, fern, glow, layer, mist, mix, noise, offset,
  rect, rng, roots, ruinWall, scatter, shaft, sheet, stairs, stalactites, tower, union, vine,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "p-data";
const P: Palette = {
  glow: "#a6d8cc", far: "#6aa59e", "far-2": "#4f8a88", mid: "#3a6e72", "mid-2": "#2a5560", near: "#183440", "near-dark": "#10242d",
  gate: "#07131a", accent: "#3f8088", "accent-2": "#c4eadf", lamp: "#ffb866", "lamp-core": "#fff1cf", rim: "#c8eee2", foreshadow: "#f2a48c", shadow: "#040c10",
};
const R = (n: number) => rng(77000 + n);

/* ---------- helpers ---------- */
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
const disc = (cx: number, cy: number, rad: number, n = 72) => ellipse(cx, cy, rad, rad, n);
const rotRect = (cx: number, cy: number, w: number, h: number, a: number): Poly => {
  const c = Math.cos(a), s = Math.sin(a);
  return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as Pt[]).map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c] as Pt);
};
const interp = (pts: Pt[]) => (x: number) => {
  if (x <= pts[0]![0]) return pts[0]![1];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1]!, b = pts[i]!; if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); }
  return pts[pts.length - 1]![1];
};
type PaperOpts = { holes?: (Poly | Shape)[]; rm?: number; light?: Pt; opacity?: number; noRim?: boolean; shadow?: false | { dx: number; dy: number; blur: number; opacity: number }; noInner?: boolean };
function paper(shape: Poly | Shape, fill: string, b: Band, sun: Pt, o: PaperOpts = {}): Frag {
  const bb = bnd(shape);
  let lx = o.light ? o.light[0] : sun[0] - (bb.x0 + bb.x1) / 2, ly = o.light ? o.light[1] : sun[1] - (bb.y0 + bb.y1) / 2;
  const d = Math.hypot(lx, ly) || 1; lx /= d; ly /= d;
  return sheet(shape, fill, {
    holes: o.holes, opacity: o.opacity,
    shadow: o.shadow === false ? false : { color: P.shadow, blur: b.blur, opacity: b.op, dx: -lx * b.off, dy: -ly * b.off, ...o.shadow },
    edge: o.noRim ? undefined : { light: [lx, ly], width: b.rw, color: mix(fill, P.rim!, o.rm ?? b.rm) },
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
const mx = (a: string, b: string, t: number) => mix(P[a]!, P[b]!, t);
function steps(r: Rng, prof: (x: number) => number, x0: number, x1: number, base: number, amp = 8) {
  const pts: Poly = [], st: { a: number; b: number; y: number }[] = [];
  let x = x0;
  while (x < x1) { const b = Math.min(x1, x + r.range(46, 120)), y = prof((x + b) / 2) + r.range(-amp, amp); pts.push([x, y], [b, y]); st.push({ a: x, b, y }); x = b; }
  pts.push([x1, base], [x0, base]);
  return { poly: cut(pts, r, 1.2, 40), top: (xx: number) => (st.find((s) => xx >= s.a && xx <= s.b) ?? st[st.length - 1]!).y, st };
}
const mirror = (s: Shape, base: number): Shape => s.map((ring) => ring.map(([x, y]) => [x, 2 * base - y] as Pt));

/* ---------- composition configs ---------- */
type Cfg = {
  k: number; W: number; H: number; oc: Pt; wy: number; land: Pt; free: Poly; capY: number; apexH: number;
  wall: { x0: number; x1: number; y0: number; y1: number }; ex: Pt; exW: number; exH: number; rowGap: number;
  far: [number, number, number][]; fx: [number, number]; cols: [number, number, number][]; caps: number[];
  refMax: number; beam: Poly; stones: [Pt, Pt]; ripple: [number, number, number, number];
  dust: { x0: number; y0: number; x1: number; y1: number }; shaftLen: number; shaftY: number; wlevel: number; sc: number;
};
const D: Cfg = {
  k: 1, W: 1920, H: 1080, oc: [1340, 40], wy: 700, land: [1340, 760], free: rect(790, -600, 1600, 2400), capY: 190, apexH: 120,
  wall: { x0: 800, x1: 1990, y0: 215, y1: 700 }, ex: [1500, 600], exW: 70, exH: 110, rowGap: 118,
  far: [[706, 9, 60], [718, 14, 80], [736, 21, 100], [764, 29, 135]], fx: [800, 1990],
  cols: [[870, 110, 742], [1060, 84, 764], [1235, 72, 786], [1650, 100, 752], [1795, 92, 808], [1905, 120, 836]],
  caps: [-300, 140, 500, 870, 1060, 1235, 1440, 1650, 1795, 1905, 2200],
  refMax: 1000, beam: [[1300, 705], [1385, 705], [1430, 990], [1255, 990]], stones: [[960, 995], [1500, 718]], ripple: [800, 710, 1900, 1000],
  dust: { x0: 1200, y0: 100, x1: 1500, y1: 760 }, shaftLen: 700, shaftY: 70, wlevel: 700, sc: 1,
};
const Pp: Cfg = {
  k: 2, W: 1080, H: 1920, oc: [700, 40], wy: 600, land: [700, 600], free: rect(-400, -600, 1900, 1456), capY: 280, apexH: 120,
  wall: { x0: -40, x1: 1120, y0: 300, y1: 600 }, ex: [560, 480], exW: 60, exH: 90, rowGap: 100,
  far: [[606, 9, 70], [618, 14, 92], [634, 21, 115], [656, 29, 150]], fx: [-40, 1120],
  cols: [[60, 110, 700], [300, 84, 724], [780, 96, 760], [1020, 120, 800]],
  caps: [-300, 60, 300, 540, 780, 1020, 1300],
  refMax: 860, beam: [[660, 605], [740, 605], [790, 850], [610, 850]], stones: [[300, 852], [560, 612]], ripple: [40, 610, 1040, 850],
  dust: { x0: 450, y0: 100, x1: 900, y1: 600 }, shaftLen: 640, shaftY: 70, wlevel: 600, sc: 0.62,
};
const lit = (c: Cfg, s: Poly | Shape) => inter(s, c.free);
const horizTop = (c: Cfg) => c.wy;

/* ---------- geometry shared by layers and reflections ---------- */
type Col = { x: number; w: number; base: number; shape: Shape };
function geometry(c: Cfg) {
  const r = R(c.k * 100 + 2);
  const farRows: Col[][] = c.far.map(([base, w, gap]) => {
    const row: Col[] = [];
    for (let x = c.fx[0] + r.range(0, gap); x < c.fx[1]; x += gap * r.range(0.8, 1.2)) {
      if (Math.abs(x - c.ex[0]) < 52 + w) continue;
      const ww = w * r.vary(0.12), b = base + r.range(-3, 3);
      row.push({ x, w: ww, base: b, shape: column(r, x, b, ww, b - (c.capY - 20)) });
    }
    return row;
  });
  const mid: Col[] = c.cols.map(([x, w, base]) => ({ x, w, base, shape: column(r, x, base, w, base - (c.capY - 14)) }));
  return { farRows, mid };
}
type Geo = ReturnType<typeof geometry>;

/* ---------- 0 bg ---------- */
function bgL(c: Cfg, id: string): Layer {
  const r = R(c.k * 100), [lx, ly] = c.land;
  const f: Frag[] = [sheet(rect(0, 0, c.W, c.H), P.mid!, { shadow: false })];
  ([[1100, "far-2"], [760, "far"], [470, "glow"]] as [number, string][]).forEach(([rad, t]) => f.push(sheet(cut(disc(lx, ly, rad * c.sc, 96), r, 3, 40), P[t]!, { shadow: false })));
  // calm zone: near-dark with tone-on-tone bands
  if (c.k === 1) {
    f.push(sheet(cut(rect(-20, -20, 788, 1120), r, 3, 40), mx("near-dark", "mid-2", 0.5), { shadow: false }));
    f.push(sheet(cut(rect(-20, 130, 700, 820), r, 3, 40), mx("near", "mid-2", 0.5), { shadow: false }));
    f.push(sheet(cut(rect(-20, 260, 600, 600), r, 3, 40), mx("near", "mid-2", 0.8), { shadow: false }));
  } else {
    f.push(sheet(cut(rect(-20, 850, 1120, 1100), r, 3, 40), mx("near-dark", "mid-2", 0.5), { shadow: false }));
    f.push(sheet(cut(rect(-20, 960, 1000, 900), r, 3, 40), mx("near", "mid-2", 0.5), { shadow: false }));
    f.push(sheet(cut(rect(-20, 1100, 900, 800), r, 3, 40), mx("near", "mid-2", 0.8), { shadow: false }));
  }
  return layer(id, 0, ...f);
}

/* ---------- 1 vault-far ---------- */
function vaultFar(c: Cfg, id: string) {
  const r = R(c.k * 100 + 1), w = c.wall, [ex, ey] = c.ex, eb = ey + c.exH / 2;
  const holes: Poly[] = [], rowH: Poly[][] = [[], [], []], out: Frag[] = [];
  const archHole = arch(r, ex, eb, c.exW, c.exH, 1);
  const rowsInfo = [30, 22, 14].map((aw, t) => ({ aw, ah: aw * 1.9, base: w.y1 - 14 - t * c.rowGap }));
  rowsInfo.forEach(({ aw, ah, base }, t) => {
    for (let x = w.x0 + aw; x < w.x1 - aw; x += aw * 2.2 * r.vary(0.2)) {
      if (Math.abs(x - ex) < aw + c.exW * 0.7 && base > eb - c.exH - 40) continue;
      const h = arch(r, x, base, aw * r.vary(0.08), ah, 0.4); holes.push(h); rowH[t]!.push(h);
    }
  });
  // 30 tiny niches between the rows
  for (let i = 0, tries = 0; i < 30 && tries < 400; tries++) {
    const t = r.int(0, 2), lo = rowsInfo[t + 1] ? rowsInfo[t + 1]!.base + 8 : w.y0 + 30, hi = rowsInfo[t]!.base - rowsInfo[t]!.ah - 10;
    if (hi - lo < 14) continue;
    const x = r.range(w.x0 + 10, w.x1 - 10); if (Math.abs(x - ex) < 70) continue;
    const nw = r.range(4, 8); holes.push(arch(r, x, r.range(lo + nw * 1.7, hi), nw, nw * 1.7, 0.3)); i++;
  }
  // exit: ember interior behind the wall
  out.push(sheet(union(archHole, rect(ex - c.exW / 2, eb - c.exH * 0.5, c.exW, c.exH * 0.5)), P.foreshadow!, { shadow: false }));
  out.push(sheet(union(rect(ex - 15, eb - c.exH * 0.65, 4, c.exH * 0.65), rect(ex + 12, eb - c.exH * 0.6, 4, c.exH * 0.6)), P["mid-2"]!, { shadow: false, opacity: 0.6 }));
  const crown: Poly[] = [];
  for (let x = w.x0; x < w.x1; x += 30 * r.vary(0.2)) crown.push(rect(x, w.y0 - 11, 15, 12));
  const wall = union(cut(rect(w.x0, w.y0, w.x1 - w.x0, w.y1 - w.y0 + 14), r, 1.2, 40), ...crown);
  out.push(...pile(wall, [P["far-2"]!, P.far!, mx("far", "glow", 0.3)], 12, B.far, c.oc, { holes: [...holes, archHole] }));
  out.push(paper(difference(offset(archHole, 9), archHole), P.mid!, B.far, c.oc, { rm: 0.4 }));
  // bridges and towers on the crown (scale cues)
  const bodies: Shape[] = [], th: Poly[] = [];
  for (let x = w.x0 + 40; x < w.x1 - 30; x += r.range(80, 130)) { const h = r.range(40, 90), T = tower(r, x, w.y0 + 8, h * 0.34 + 10, h, { windows: 3 }); bodies.push(T.body); th.push(...T.holes); }
  const bw = (w.x1 - w.x0) * 0.18;
  [[w.x0 + 80, w.y0 + (w.y1 - w.y0) * 0.3], [w.x1 - bw - 140, w.y0 + (w.y1 - w.y0) * 0.22]].forEach(([bx, by]) => bodies.push(bridge(r, bx!, bx! + bw, by!, 8, 5)));
  out.push(paper(union(...bodies), P.mid!, B.far, c.oc, { holes: th }));
  return { layer: layer(id, 1, ...out), rowH, archHole };
}

/* ---------- 2 columns-far ---------- */
function columnsFar(c: Cfg, g: Geo, id: string): Layer {
  const fills = [mx("far-2", "mid", 0.35), mx("far-2", "mid", 0.65), P.mid!, mx("mid", "mid-2", 0.5)];
  return layer(id, 2, ...g.farRows.map((row, i) => paper(union(...row.map((q) => q.shape)), fills[i]!, B.far, c.oc)));
}

/* ---------- 3 mist ---------- */
const mistFar = () => layer("mist-far", 3, mist(1344, 690, 1150, 100, P["accent-2"]!, 0.25), mist(1344, 620, 1100, 90, P["accent-2"]!, 0.2));

/* ---------- 4 oculus ---------- */
function oculusL(c: Cfg, id: string): Layer {
  const [x, y] = c.oc;
  const ring = difference(disc(x, y, 90, 96), disc(x, y, 52, 72));
  const slits = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return rotRect(x + Math.cos(a) * 71, y + Math.sin(a) * 71, 4, 22, a + Math.PI / 2); });
  return layer(id, 4,
    glow(x, y, 300, P["accent-2"]!, { opacity: 0.5, core: P["lamp-core"]! }),
    sheet(disc(x, y, 56, 72), P["accent-2"]!, { shadow: false }),
    sheet(disc(x, y, 30, 48), P["lamp-core"]!, { shadow: false }),
    ...pile(ring, [P.mid!, P.far!, P.glow!], 8, B.hero, c.oc, { holes: slits, light: [0, 1] }));
}

/* ---------- 5 columns-mid ---------- */
function columnsMid(c: Cfg, g: Geo, id: string): Layer {
  const r = R(c.k * 100 + 5), out: Frag[] = [];
  const ledges: Shape[] = [], lh: Poly[] = [];
  g.mid.forEach((q, i) => {
    const s = Math.sign(c.oc[0] - q.x) || 1, hw = q.w / 2;
    const holes: Poly[] = [];
    for (let y = c.capY + 40; y < q.base - 50; y += 30 * r.vary(0.25)) holes.push(rect(q.x - hw * 0.45 + r.range(-4, 4), y, hw * 0.9, 3));
    out.push(paper(q.shape, P.mid!, B.mid, c.oc, { holes }));
    const l1 = inter(q.shape, cut(rect(s > 0 ? q.x - hw * 0.05 : q.x - q.w * 1.5, -200, q.w * 1.55, 2000), r, 1.2, 40));
    out.push(paper(l1, P["far-2"]!, B.mid, c.oc, { holes, shadow: false }));
    const l2 = inter(q.shape, cut(rect(s > 0 ? q.x + hw * 0.3 : q.x - q.w * 1.5, -200, hw * 1.25, 2000), r, 1.2, 40));
    out.push(paper(l2, P.far!, B.mid, c.oc, { holes, shadow: false }));
    // water stains and hanging vines
    const stains = Array.from({ length: 4 }, () => rect(q.x + r.range(-hw, hw * 0.6), q.base - r.range(100, 260), r.range(6, 14), r.range(50, 150)));
    out.push(sheet(inter(q.shape, union(...stains)), P["mid-2"]!, { shadow: false, opacity: 0.8 }));
    out.push(sheet(union(...Array.from({ length: 4 }, () => vine(r, q.x + r.range(-hw, hw), c.capY + 6, r.range(90, 240), 10))), P["mid-2"]!, { shadow: false }));
    // ruined gallery between neighbours
    const n = g.mid[i + 1];
    if (n) {
      const a = q.x + hw - 4, b2 = n.x - n.w / 2 + 4, gap = b2 - a;
      if (gap > 60 && gap < 260) {
        const W2 = ruinWall(r, a, r.range(360, 470), gap, r.range(44, 70));
        ledges.push(W2.body); lh.push(...W2.holes);
      }
    }
  });
  if (ledges.length) out.push(paper(union(...ledges), P["far-2"]!, B.mid, c.oc, { holes: lh }));
  return layer(id, 5, ...out);
}

/* ---------- 6 vault-ribs ---------- */
function vaultRibs(c: Cfg, id: string): Layer {
  const r = R(c.k * 100 + 6), pts: Poly = [], ribs: Poly[] = [], out: Frag[] = [];
  const H = c.apexH, edge = (a: number, b: number, t: number) => c.capY - H * Math.pow(Math.sin(Math.PI * t), 0.8);
  const xl = c.caps[0]!, xr = c.caps[c.caps.length - 1]!;
  const edgeAt: ((x: number) => number)[] = [];
  const crowns: Pt[] = [];
  for (let i = 0; i < c.caps.length - 1; i++) {
    const a = c.caps[i]!, b = c.caps[i + 1]!, hh = r.range(0.85, 1.1);
    const f = (x: number) => c.capY - H * hh * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, (x - a) / (b - a)))), 0.8);
    edgeAt.push(f);
    const n = Math.max(6, Math.round((b - a) / 28));
    for (let k = 0; k < n; k++) { const x = a + ((b - a) * k) / n; pts.push([x + r.range(-1.5, 1.5), f(x) + r.range(-1.5, 1.5)]); }
    crowns.push([(a + b) / 2, f((a + b) / 2)]);
    // groin rib band along the arch
    const up: Poly = [], dn: Poly = [];
    for (let k = 0; k <= n; k++) { const x = a + ((b - a) * k) / n; up.push([x, f(x) - 14]); dn.push([x, f(x) + 2]); }
    ribs.push([...up, ...dn.reverse()]);
  }
  const arcEdge = (x: number) => { const i = Math.max(0, Math.min(edgeAt.length - 1, c.caps.findIndex((q, j) => x >= q && x < (c.caps[j + 1] ?? 1e9)))); return edgeAt[i]!(x); };
  pts.push([xr, c.capY]);
  let body: Shape = union([[xl, -120] as Pt, ...pts, [xr, -120] as Pt]);
  const oc = disc(c.oc[0], c.oc[1], 108, 48);
  body = difference(body, oc);
  const rt: Shape[] = [], st: Shape[] = [];
  for (let k = 0; k < 7; k++) { const x = r.range(xl + 400, xr - 300); if (x > c.oc[0] - 130 && x < c.oc[0] + 130) continue; rt.push(roots(r, x, arcEdge(x) - 3, 16, r.range(70, 150), 3, 1)); }
  for (let k = 0; k < 18; k++) { const x = r.range(xl + 300, xr - 200); if (x > c.oc[0] - 130 && x < c.oc[0] + 130) continue; st.push(stalactites(r, x - 12, x + 12, arcEdge(x) - 5, r.range(24, 62), 1)); }
  // tier 1: calm everywhere
  out.push(paper(union(body, ...rt, ...st), P["mid-2"]!, B.mid, c.oc, { rm: 0.25 }));
  out.push(paper(lit(c, offset(body, -10)), P.mid!, { ...B.mid, off: 4 }, c.oc, { shadow: false }));
  out.push(paper(lit(c, union(...ribs)), P["far-2"]!, B.mid, c.oc, { shadow: false }));
  out.push(paper(difference(union(...ribs.map((q) => lit(c, offset(q, -3)))), disc(c.oc[0], c.oc[1], 108)), mx("far-2", "far", 0.5), { ...B.far, off: 2 }, c.oc, { shadow: false }));
  // coffer slits on the ceiling
  const sl: Poly[] = [];
  for (let k = 0; k < 40; k++) { const x = r.range(xl + 320, xr - 200), y = r.range(-30, Math.max(-20, arcEdge(x) - 40)); if (y < arcEdge(x) - 30) sl.push(rect(x, y, r.range(14, 44), 3)); }
  out.push(sheet(lit(c, union(...sl)), P["mid-2"]!, { shadow: false }));
  const sl2: Poly[] = [];
  for (let k = 0; k < 22; k++) { const x = r.range(xl + 40, 760), y = r.range(10, Math.max(14, arcEdge(x) - 40)); if (y < arcEdge(x) - 30) sl2.push(rect(x, y, r.range(14, 44), 3)); }
  if (c.k === 1) out.push(sheet(union(...sl2), P.near!, { shadow: false }));
  void crowns; void horizTop; void edge;
  return layer(id, 6, ...out);
}

/* ---------- 7 water ---------- */
function waterL(c: Cfg, g: Geo, hv: { archHole: Poly }, id: string): Layer {
  const r = R(c.k * 100 + 7), out: Frag[] = [];
  const x0 = -170, x1 = c.W + 170, yb = c.k === 1 ? 1180 : 880, wy = c.wy;
  const feet: Poly[] = [...g.farRows.flat(), ...g.mid].map((q) => rect(q.x - q.w * 0.75, wy - 12, q.w * 1.5, q.base + 4 - wy + 12));
  const tier = (yBottom: number, fill: string, clip: boolean, o: PaperOpts = {}) => {
    const pl = cut(rect(x0, wy - 4, x1 - x0, yBottom - wy + 4), r, 2, 34);
    const s = clip ? lit(c, pl) : union(pl);
    out.push(paper(difference(s, ...feet), fill, B.mid, c.oc, { rm: clip ? 0.45 : 0.25, ...o }));
  };
  const span = (c.k === 1 ? 1180 : 880) - wy;
  tier(c.k === 1 ? 1180 : 880, P.near!, false);
  tier(wy + span * 0.72, P["mid-2"]!, false);
  tier(wy + span * 0.42, P.accent!, true);
  tier(wy + span * 0.17, mx("accent", "accent-2", 0.3), true);
  // ripple slits
  const [rx0, ry0, rx1, ry1] = c.ripple;
  const sl = scatter(r, { x0: rx0, y0: ry0, x1: rx1, y1: ry1 }, 30, (x, y) => rect(x, y, r.range(28, 130), 3), 16);
  out.push(sheet(lit(c, sl), P["accent-2"]!, { shadow: false, opacity: 0.5 }));
  const sl2 = scatter(r, { x0: rx0, y0: ry0 + 20, x1: rx1, y1: ry1 }, 22, (x, y) => rect(x, y, r.range(30, 110), 3), 14);
  out.push(sheet(lit(c, sl2), P.near!, { shadow: false, opacity: 0.55 }));
  // stepping stones leading to the exit arch
  const [[ax, ay], [bx, by]] = c.stones;
  const n = 12;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), tt = Math.pow(t, 0.9);
    const x = ax + (bx - ax) * tt + Math.sin(t * 5) * 40 * (1 - t) * (c.k === 1 ? 1 : 0.7), y = ay + (by - ay) * tt;
    const sw = (20 + 40 * (1 - t)) * r.vary(0.1) * (c.k === 1 ? 1 : 0.95);
    out.push(paper(cut(ellipse(x, y + 3, sw * 0.5, sw * 0.14, 14), r, 1, 14), P["near-dark"]!, B.far, c.oc, { rm: 0.25 }));
    out.push(paper(cut(ellipse(x, y, sw * 0.46, sw * 0.12, 14), r, 1, 14), P.mid!, { ...B.far, off: 2 }, c.oc, { shadow: false }));
    out.push(paper(cut(ellipse(x, y - 1, sw * 0.3, sw * 0.07, 12), r, 0.7, 12), P.far!, { ...B.far, off: 1 }, c.oc, { shadow: false }));
  }
  void hv;
  return layer(id, 7, ...out);
}

/* ---------- 8 / 9 reflections ---------- */
function reflection(c: Cfg, g: Geo, hv: { rowH: Poly[][]; archHole: Poly }, set: "a" | "b", id: string): Layer {
  const r = R(c.k * 100 + (set === "a" ? 8 : 9)), out: Frag[] = [];
  const clip = inter(rect(-200, c.wy, c.W + 400, c.refMax - c.wy), c.free);
  const mids = union(...g.mid.map((q) => mirror(q.shape, q.base)));
  const fars = union(...g.farRows.flat().map((q) => mirror(q.shape, q.base)));
  const wall = union(...hv.rowH.flat().map((h) => mirror([h], c.wy)), mirror([hv.archHole], c.wy));
  const lightSh = union(c.beam);
  const specs: [Shape, string, number][] = [[inter(mids, clip), P.mid!, 0.6], [inter(fars, clip), P.mid!, 0.45], [inter(union(wall, lightSh), clip), P["accent-2"]!, 0.5]];
  // slice sets: identical pitch sequence, set b offset by half a strip
  const strips: [number, number][] = [];
  const pitch0 = [...Array(70)].map(() => r.range(8, 14)), rr = R(c.k * 100 + 20);
  void rr;
  let y = c.wy + (set === "b" ? pitch0[0]! / 2 : 0);
  for (const p of pitch0) { if (y > c.refMax) break; strips.push([y, p * 0.6]); y += p; }
  const dx = (set === "a" ? 1 : -1);
  for (const [shape, fill, op] of specs) {
    const parts: Shape[] = strips.map(([sy, sh], i) => {
      const part = inter(shape, rect(-300, sy, c.W + 600, sh));
      return part.map((ring) => ring.map(([x, yy]) => [x + dx * Math.sin(i * 0.9 + (set === "a" ? 0 : 2)) * 3, yy] as Pt));
    }).filter((p) => p.length);
    if (parts.length) out.push(sheet(union(...parts), fill, { shadow: false, opacity: op }));
  }
  return layer(id, set === "a" ? 8 : 9, ...out);
}

/* ---------- 10 shafts, 13 dust ---------- */
function shaftsL(c: Cfg, id: string): Layer {
  return layer(id, 10, ...([[-8, -40, 0.22], [0, 0, 0.28], [8, 40, 0.18]] as [number, number, number][]).map(([a, dx, op]) => shaft(c.oc[0] + dx, c.shaftY, 44, 170, c.shaftLen, a, P["accent-2"]!, op)));
}
function dustL(c: Cfg, id: string): Layer {
  const r = R(c.k * 100 + 13);
  return layer(id, 13, ...([[45, 0.35], [40, 0.6], [35, 0.8]] as [number, number][]).map(([n, op]) =>
    sheet(scatter(r, c.dust, n, (x, y) => ellipse(x, y, r.range(1.5, 3.6), r.range(1.5, 3.6), 6), 14), P["accent-2"]!, { shadow: false, opacity: op })));
}

/* ---------- 11 card-wall (calm tokens only) ---------- */
type Calm = { x0: number; x1: number; ledges: number[]; cols: [number, number][]; colTop: number; colBase: number; stair: [number, number, number, number]; waterY: number; waterBot: number };
const CALM_D: Calm = { x0: -170, x1: 800, ledges: [250, 360, 470, 580, 690], cols: [[100, 150], [405, 130], [700, 140]], colTop: -100, colBase: 800, stair: [480, 640, 190, 160], waterY: 800, waterBot: 1180 };
const CALM_P: Calm = { x0: -170, x1: 1250, ledges: [900, 1000, 1100, 1200, 1300], cols: [[130, 150], [540, 130], [950, 150]], colTop: 790, colBase: 1500, stair: [640, 1340, 210, 160], waterY: 1500, waterBot: 1980 };
function cardWall(c: Cfg, k: Calm, id: string): Layer {
  const r = R(c.k * 100 + 11), out: Frag[] = [], L = c.oc;
  const back = [P["mid-2"]!, mx("mid-2", "near", 0.5), P.near!, mx("near", "near-dark", 0.5), P["near-dark"]!];
  const T = k.ledges.map((y, i) => steps(r, () => y, k.x0, k.x1, k.waterY, 6));
  // water first
  out.push(paper(cut(rect(k.x0, k.waterY, k.x1 - k.x0, k.waterBot - k.waterY), r, 2, 34), P.near!, B.mid, L, { rm: 0.25 }));
  out.push(sheet(cut(rect(k.x0, k.waterY + (k.waterBot - k.waterY) * 0.4, k.x1 - k.x0, (k.waterBot - k.waterY) * 0.6), r, 2, 34), P["near-dark"]!, { shadow: false }));
  const rip = scatter(r, { x0: k.x0 + 20, y0: k.waterY + 14, x1: k.x1 - 20, y1: k.waterBot - 30 }, 26, (x, y) => rect(x, y, r.range(20, 100), 3), 14);
  out.push(sheet(rip, P["mid-2"]!, { shadow: false, opacity: 0.8 }));
  T.forEach((t, i) => {
    out.push(paper(t.poly, back[i % back.length]!, B.mid, L, { rm: 0.25 }));
    const wn: Poly[] = [], wf: Poly[] = [];
    for (let n = 0; n < 8; n++) { const x = r.range(k.x0 + 20, k.x1 - 20), w = r.range(5, 9); wn.push(arch(r, x, t.top(x) + r.range(26, 56), w, w * 1.7, 0.3)); }
    out.push(sheet(union(...wn, ...wf), i % 2 ? P.gate! : P["near-dark"]!, { shadow: false }));
    const bod: Shape[] = [], hol: Poly[] = [];
    for (let x = k.x0 + r.range(0, 40); x < k.x1 - 40; x += r.range(70, 150)) {
      if (r() < 0.45) { const h = r.range(30, 90), tw = h * 0.34 + 9, Tw = tower(r, x, t.top(x) + 3, tw, h, { windows: 3 }); bod.push(Tw.body); hol.push(...Tw.holes); }
      else { const q = ruinWall(r, x, t.top(x + 30) + 3, r.range(60, 120), r.range(26, 48)); bod.push(q.body); hol.push(...q.holes); }
    }
    out.push(paper(union(...bod), mx("near-dark", "near", i % 2 ? 0.3 : 0.7), B.mid, L, { holes: hol, rm: 0.25 }));
    const veg: Shape[] = [];
    for (let n = 0; n < 5; n++) { const x = r.range(k.x0, k.x1); veg.push(fern(r, x, t.top(x) + 2, r.range(16, 32), r.range(-0.5, 0.5))); }
    out.push(sheet(union(...veg), P["near-dark"]!, { shadow: false }));
  });
  // three near columns in shadow, with niches
  k.cols.forEach(([x, w], i) => {
    const sh = column(r, x, k.colBase, w, k.colBase - k.colTop, c.k === 2);
    const holes: Poly[] = [];
    for (let y = k.colTop + 70; y < k.colBase - 60; y += 36 * r.vary(0.25)) holes.push(rect(x - w * 0.3, y, w * 0.6, 3));
    out.push(paper(sh, P["near-dark"]!, B.near, L, { rm: 0.25 }));
    out.push(paper(inter(sh, cut(rect(x + w * 0.0, k.colTop - 50, w, 4000), r, 1.2, 40)), P.near!, { ...B.mid, off: 4 }, L, { shadow: false, rm: 0.25 }));
    out.push(paper(inter(sh, cut(rect(x + w * 0.25, k.colTop - 50, w, 4000), r, 1.2, 40)), P["mid-2"]!, { ...B.mid, off: 3 }, L, { shadow: false, rm: 0.25 }));
    out.push(sheet(difference(inter(sh, union(...holes)), []), P.gate!, { shadow: false, opacity: 0.7 }));
    const ns: Poly[] = [];
    for (let y = k.colTop + 160 + i * 25; y < k.colBase - 120; y += 160 * r.vary(0.2)) ns.push(arch(r, x - w * 0.12 + r.range(-8, 8), y, 14, 32, 0.4));
    out.push(sheet(union(...ns), P.gate!, { shadow: false }));
  });
  // floating stair climbing out of the water
  const [sx, sy, sw, sh2] = k.stair;
  out.push(paper(stairs(sx, sy, sw, sh2, Math.round(sh2 / 6), 1), P["mid-2"]!, B.mid, L, { rm: 0.25 }));
  out.push(paper(stairs(sx + 8, sy + 10, sw - 8, sh2 - 10, Math.round((sh2 - 10) / 6), 1), P.near!, { ...B.mid, off: 3 }, L, { rm: 0.25, shadow: false }));
  // 30 tiny dark arches in the water-side wall
  const tiny: Poly[] = [];
  for (let n = 0; n < 30; n++) { const x = r.range(k.x0 + 20, k.x1 - 20), w = r.range(4, 8); tiny.push(arch(r, x, r.range(k.ledges[0]! + 30, k.waterY - 30), w, w * 1.8, 0.3)); }
  out.push(sheet(union(...tiny), P.gate!, { shadow: false, opacity: 0.8 }));
  return layer(id, 11, ...out);
}

/* ---------- 12 steps-near (calm tokens) ---------- */
function stepsNear(c: Cfg, id: string): Layer {
  const r = R(c.k * 100 + 12), out: Frag[] = [], L = c.oc;
  const prof: Pt[] = c.k === 1 ? [[-170, 968], [700, 962], [1000, 980], [1400, 1004], [1920, 1030], [2100, 1030]] : [[-170, 1640], [300, 1630], [700, 1656], [1100, 1636], [1250, 1640]];
  const base = c.k === 1 ? 1180 : 2000, x0 = -170, x1 = c.W + 170, pr = interp(prof), bandsN = c.k === 1 ? 2 : 3, fernN = c.k === 1 ? 16 : 18;
  const t = steps(r, pr, x0, x1, base, 7);
  out.push(...pile(t.poly, [P["near-dark"]!, P.near!, mx("near", "mid-2", 0.4)], 12, B.near, L, { rm: 0.25 }));
  const inner = offset(t.poly, -30);
  const tones = [mx("near", "mid-2", 0.4), P["near-dark"]!, P.near!, mx("near-dark", "near", 0.5)];
  out.push(sheet(union(...t.st.map((s) => rect(s.a, s.y, s.b - s.a, 5))), P["mid-2"]!, { shadow: { dx: 0, dy: 3, blur: 4, opacity: 0.3, color: P.shadow } }));
  for (let b = 0; b < bandsN; b++) {
    const bt = steps(r, (x) => pr(x) + 38 + b * ((base - pr(x)) / (bandsN + 0.6)), x0, x1, base + 40, 9);
    out.push(sheet(inter(bt.poly, inner), tones[b % 4]!, { shadow: { dx: 0, dy: 8, blur: 10, opacity: 0.3, color: P.shadow }, edge: { light: [0, -1], width: 1.5, color: mix(tones[b % 4]!, P.rim!, 0.2) } }));
    const wn: Poly[] = [];
    for (let i = 0; i < 24; i++) { const x = r.range(x0 + 30, x1 - 30), y = bt.top(x) + r.range(20, 50), w = r.range(5, 10); wn.push(arch(r, x, y, w, w * 1.7, 0.3)); }
    out.push(sheet(union(...wn), P.gate!, { shadow: false }));
    const rwl = Array.from({ length: 3 }, () => { const x = r.range(x0 + 20, x1 - 220); return ruinWall(r, x, bt.top(x + 60) + 2, r.range(100, 190), r.range(30, 52)); });
    out.push(paper(union(...rwl.map((q) => q.body)), P["near-dark"]!, B.mid, L, { holes: rwl.flatMap((q) => q.holes), rm: 0.25 }));
  }
  const peb = scatter(r, { x0: x0 + 10, y0: pr(x0 + 400) + 30, x1: x1 - 10, y1: base - 30 }, 120, (x, y) => cut(rect(x, y, r.range(6, 20), r.range(4, 10)), r, 1, 8));
  out.push(sheet(peb, mx("near", "mid-2", 0.5), { shadow: false }));
  const cracks = Array.from({ length: 36 }, () => { const x = r.range(x0 + 20, x1 - 20), y = pr(x) + r.range(30, 90); return rotRect(x, y, 3.5, r.range(24, 70), r.range(1.1, 2.0)); });
  out.push(sheet(union(...cracks), P.gate!, { shadow: false }));
  const fr: Shape[] = [], rt: Shape[] = [];
  for (let i = 0; i < fernN; i++) { const x = r.range(x0 + 10, x1 - 10); fr.push(fern(r, x, t.top(x) + 3, r.range(26, 58), r.range(-0.6, 0.6))); }
  for (let i = 0; i < 9; i++) { const x = r.range(x0 + 30, x1 - 30); rt.push(roots(r, x, t.top(x) + 8, 30, r.range(40, 100), 4, 1)); }
  out.push(sheet(union(...fr, ...rt), P.gate!, { shadow: false }));
  const parts: Poly[] = [];
  for (let x = c.k === 1 ? 760 : 60; x < (c.k === 1 ? 1750 : 740); x += 34 * r.range(0.85, 1.2)) {
    if (r() < 0.22) continue;
    const by = t.top(x) + 2, h = 30 * r.range(0.6, 1.1);
    parts.push(rect(x, by - h, 9, h), rect(x - 2, by - h - 6, 13, 6), rect(x - 3, by - 5, 15, 5));
    if (r() < 0.6) parts.push(rect(x + 9, by - h + 4, 25, 5));
  }
  out.push(paper(union(...parts), P["near-dark"]!, B.mid, L, { rm: 0.25 }));
  return layer(id, 12, ...out);
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
function edgePts(r: Rng, segs: Seg[], vOf: (p: number) => number): Pt[] {
  const pts: Pt[] = [];
  for (const s of segs) { const n = Math.max(1, Math.round((s.b - s.a) / 28)); for (let i = 0; i <= n; i++) pts.push([vOf(s.p) + r.range(-4, 4), s.a + ((s.b - s.a) * i) / n]); }
  return pts;
}
const crossX = (poly: Poly, y: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i < poly.length; i++) { const a = poly[i]!, b = poly[(i + 1) % poly.length]!; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) out.push(a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1])); }
  return out;
};
const GF = [P.gate!, P["near-dark"]!, P.near!];
function gates(c: Cfg, ids: [string, string], xl: (p: number) => number, gap: number, shift: number, outer: [number, number], seed: number, pinA?: [number, number], chain?: number) {
  const rl = R(seed), rr = R(seed + 1), rs = R(seed + 2);
  let segs = phaseSegs(rs, -60, c.H + 60, 110, 200);
  if (pinA) segs = pin(segs, pinA[0], pinA[1], 1);
  const xr = (p: number) => xl(p) + gap;
  const pl = edgePts(rl, segs, xl), pr = edgePts(rr, segs, xr);
  const polyL: Poly = [[outer[0], -60], ...pl.map(([v, u]) => [v, u] as Pt), [outer[0], c.H + 60]];
  const polyR: Poly = [[outer[1], -60], ...pr.map(([v, u]) => [v, u] as Pt), [outer[1], c.H + 60]];
  let minOv = 1e9;
  for (let y = -60; y < c.H + 60; y += 0.5) minOv = Math.min(minOv, Math.max(...crossX(polyL, y + 0.25)) + shift - (Math.min(...crossX(polyR, y + 0.25)) - shift));
  const detail = (poly: Poly, right: boolean, r: Rng, pts: Pt[], colAt: number) => {
    const nx = right ? -1 : 1, out: Shape[] = [], vOf = right ? xr : xl;
    segs.forEach((s, i) => {
      const nxt = segs[i + 1]; if (!nxt) return;
      const va = vOf(s.p), vb = vOf(nxt.p), u = s.b, cx = (va + vb) / 2, up = right ? vb < va : vb > va;
      if (up) { const t = r(); out.push(t < 0.3 ? fern(r, cx, u, r.range(24, 44), nx * r.range(0.3, 0.9)) : t < 0.6 ? column(r, cx, u, 14, r.range(28, 54), true) : (() => { const q = ruinWall(r, cx - 24, u + 1, 48, 34); return difference(q.body, ...q.holes); })()); }
      else out.push(roots(r, cx, u - 2, 20, r.range(50, 120), 3, 1), vine(r, cx, u - 2, r.range(40, 100), 8));
    });
    for (let i = 0; i < pts.length; i += 2) {
      const [v, u] = pts[i]!, t = r();
      if (t < 0.5) out.push(vine(r, v - nx * 3, u, r.range(50, 130), 10));
      else if (t < 0.75) out.push(roots(r, v - nx * 4, u, 14, r.range(40, 100), 3, 1));
      else out.push(fern(r, v - nx * 4, u, r.range(26, 52), nx * r.range(0.4, 1)));
    }
    // large column fragment standing at the inner edge, lower part
    out.push(column(r, colAt, c.H + 40, 84, c.H * 0.4, true));
    if (right && chain !== undefined) {
      const cx = chain, links: Poly[] = [];
      for (let y = -70; y < 270; y += 17) links.push(...flat(difference(ellipse(cx, y, 6, 10, 10), ellipse(cx, y, 2.6, 6, 8))));
      const cage = difference(cut(rect(cx - 34, 270, 68, 96), r, 1, 30), ...[-22, -8, 8, 22].map((o) => rect(cx + o - 2, 282, 4, 70)));
      out.push(union(links), cage, union([[cx - 6, 262], [cx + 6, 262], [cx, 286]] as Poly));
    }
    return union(poly, ...out);
  };
  const lowL = Math.max(...pl.filter((p) => p[1] > c.H * 0.7).map((p) => p[0])) + 6;
  const lowR = Math.min(...pr.filter((p) => p[1] > c.H * 0.7).map((p) => p[0])) - 6;
  const shL = detail(polyL, false, R(seed + 3), pl, lowL), shR = detail(polyR, true, R(seed + 4), pr, lowR);
  const fxo = (xa: number, xb: number, sd: number) => ({ xa, xb, H: c.H + 60, portrait: c.W < 1500, seed: sd, motif: "grid" as const, light: P.accent!, core: "#e6fbf4", rim: P.rim!, tint: P["accent-2"]!,
    tones: [mx("near", "mid-2", 0.7), mx("mid-2", "accent", 0.35), mx("near", "mid", 0.5), mx("mid-2", "mid", 0.5)] });
  const fL = gateFx(polyL, fxo(-shift - 40, Math.max(...pl.map((q) => q[0])) - 90, seed + 7));
  const fR = gateFx(polyR, fxo(Math.min(...pr.map((q) => q[0])) + 90, c.W + shift + 40, seed + 8));
  const gl = layer(ids[0], 14, ...fL.under, ...pile(shL, GF, 16, B.gate, c.oc, { rm: 0.25, holes: [fL.holes] }), ...fL.mid, ...fL.over);
  const gr = layer(ids[1], 15, ...fR.under, ...pile(shR, GF, 16, B.gate, c.oc, { rm: c.k === 1 ? 0.5 : 0.25, holes: [fR.holes] }), ...fR.mid, ...fR.over);
  return { gl, gr, minOv, restL: [Math.min(...pl.map((p) => p[0])), Math.max(...pl.map((p) => p[0]))], restR: [Math.min(...pr.map((p) => p[0])), Math.max(...pr.map((p) => p[0]))] };
}

/* ---------- assemble ---------- */
void noise;
const geoD = geometry(D), geoP = geometry(Pp);
const vfD = vaultFar(D, "vault-far"), vfP = vaultFar(Pp, "vault-far-p");
// desktop: rest edges gate-l 150-350, gate-r 1440-1640 (pinned p=1 at y 480-760 so the exit arch stays clear)
const gD = gates(D, ["gate-l", "gate-r"], (p) => 150 + 200 * p, 1290, 700, [-800, 2720], 14, [480, 760], 1500);
const gP = gates(Pp, ["gate-l-p", "gate-r-p"], (p) => 110 + 90 * p, 790, 460, [-560, 1640], 24);

const dLayers: Layer[] = [
  bgL(D, "bg"), vfD.layer, columnsFar(D, geoD, "columns-far"), mistFar(), oculusL(D, "oculus"), columnsMid(D, geoD, "columns-mid"),
  vaultRibs(D, "vault-ribs"), waterL(D, geoD, vfD, "water"), reflection(D, geoD, vfD, "a", "reflection-a"), reflection(D, geoD, vfD, "b", "reflection-b"),
  shaftsL(D, "shafts"), cardWall(D, CALM_D, "card-wall"), stepsNear(D, "steps-near"), dustL(D, "dust"), gD.gl, gD.gr,
];
const pLayers: Layer[] = [
  bgL(Pp, "bg-p"), vfP.layer, columnsFar(Pp, geoP, "columns-far-p"), oculusL(Pp, "oculus-p"), columnsMid(Pp, geoP, "columns-mid-p"),
  vaultRibs(Pp, "vault-ribs-p"), waterL(Pp, geoP, vfP, "water-p"), reflection(Pp, geoP, vfP, "a", "reflection-a-p"), reflection(Pp, geoP, vfP, "b", "reflection-b-p"),
  shaftsL(Pp, "shafts-p"), cardWall(Pp, CALM_P, "card-wall-p"), stepsNear(Pp, "steps-near-p"), dustL(Pp, "dust-p"), gP.gl, gP.gr,
];
const BAKE: Record<string, [number, number]> = {
  bg: [0.4, 45], "bg-p": [0.4, 45], "vault-far": [0.75, 50], "vault-far-p": [0.75, 50], "columns-far": [0.6, 50], "columns-far-p": [0.6, 50],
  "mist-far": [0.4, 35], oculus: [0.5, 45], "oculus-p": [0.5, 45], "columns-mid": [0.75, 55], "columns-mid-p": [0.7, 55],
  "vault-ribs": [0.6, 55], "vault-ribs-p": [0.6, 55], water: [0.6, 50], "water-p": [0.6, 50],
  "reflection-a": [0.5, 45], "reflection-b": [0.5, 45], "reflection-a-p": [0.5, 45], "reflection-b-p": [0.5, 45],
  shafts: [0.4, 35], "shafts-p": [0.4, 35], "card-wall": [0.6, 50], "card-wall-p": [0.55, 48], "steps-near": [0.6, 50], "steps-near-p": [0.55, 48],
  dust: [0.5, 40], "dust-p": [0.5, 40], "gate-l": [0.4, 40], "gate-r": [0.4, 40], "gate-l-p": [0.4, 40], "gate-r-p": [0.4, 40],
};
const all = [...dLayers.slice(0, 3), mistFar(), ...dLayers.slice(4), ...pLayers].filter((l, i, a) => a.findIndex((m) => m.id === l.id) === i);
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
const dIds = dLayers.map((l) => l.id);
const pIds = [...pLayers.slice(0, 3).map((l) => l.id), "mist-far", ...pLayers.slice(3).map((l) => l.id)];
await squeeze(SLUG, baked, { "gate-l": [0.85, 40, 70], "gate-r": [0.85, 40, 70] }, null);
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: compose(D.W, D.H, dIds), portrait: compose(Pp.W, Pp.H, pIds, { "mist-far": { y: -100, s: 0.6 } }) }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop"); await composite(SLUG, "portrait");

const mp = (ids: string[]) => ids.reduce((n, id) => { const b = baked.get(id)!, s = (BAKE[id] ?? [1])[0]!; return n + (b.w * b.h * s * s) / 1e6; }, 0);
console.log("layers desktop", dIds.length, "portrait", pIds.length);
console.log("bytes total", total, "(KB", Math.round(total / 1024) + ")");
console.log("decoded MP desktop", mp(dIds).toFixed(1), "portrait", mp(pIds).toFixed(1));
console.log("gate-l rest edge x", gD.restL.map(Math.round), "gate-r rest edge x", gD.restR.map(Math.round), "closed min overlap", gD.minOv.toFixed(1));
console.log("gate-l-p rest edge x", gP.restL.map(Math.round), "gate-r-p rest edge x", gP.restR.map(Math.round), "closed min overlap", gP.minOv.toFixed(1));
if (gD.minOv < 80 || gP.minOv < 80) throw new Error("gate closed overlap < 80");
for (const [id, b] of baked) console.log(" ", id.padEnd(16), String(b.bytes).padStart(7));
