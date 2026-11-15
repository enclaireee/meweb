// b4-inner-sun: a paper sun hanging in a colossal warm vault. Run: npx tsx art/b4-inner-sun/build.ts
// Per-band bake settings (bible s13) need per-layer scale/quality, so layers are baked with bakeLayer and the
// manifest is written here in the exact bakeBeat format (bakeBeat only takes one scale for all layers).
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, arch, bakeLayer, bridge, column, composite, cut, difference, ellipse, fern, glow, layer, mist, mix, noise, offset,
  pine, rect, rng, roots, ruinWall, scatter, shaft, sheet, stairs, stalactites, tower, tree, union, vine,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "b4-inner-sun";
const P: Palette = {
  "vault-glow": "#f6c56b", "vault-far": "#e3a14e", "vault-far-2": "#d98e3a", "vault-mid": "#b0652a", "vault-mid-2": "#95522a",
  "vault-near": "#7a3d1c", "rock-mid": "#613019", rock: "#4a2413", "rock-dark": "#33180c", gate: "#1f0e07", sun: "#fff1cf",
  vellum: "#ffdf9e", "rim-warm": "#ffd9a0", lamp: "#ffb866", "lamp-core": "#fffaf0", dust: "#fff4d6", foreshadow: "#cfd98a", shadow: "#1a0b05",
};
const W = 1920, H = 1080, PW = 1080, PH = 1920;
const SUN: Pt = [1300, 380], PSUN: Pt = [540, 520], PS = 0.9;
const R = (n: number) => rng(40400 + n);

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
const cn = (a: string, b2: string, t: number) => mix(P[a]!, P[b2]!, t);

/** Stepped terrace silhouette following a profile; `top(x)` gives the surface y for placing things. */
function steps(r: Rng, prof: (x: number) => number, x0: number, x1: number, base: number, amp = 8) {
  const pts: Poly = [], st: { a: number; b: number; y: number }[] = [];
  let x = x0;
  while (x < x1) { const b = Math.min(x1, x + r.range(46, 120)), y = prof((x + b) / 2) + r.range(-amp, amp); pts.push([x, y], [b, y]); st.push({ a: x, b, y }); x = b; }
  pts.push([x1, base], [x0, base]);
  return { poly: cut(pts, r, 1.2, 40), top: (xx: number) => (st.find((s) => xx >= s.a && xx <= s.b) ?? st[st.length - 1]!).y };
}
type Terr = ReturnType<typeof steps>;

/** Trees/pines on a terrace top, avoiding exclusion ranges. */
function plants(r: Rng, top: (x: number) => number, ranges: [number, number][], n: number, h0: number, h1: number, excl: [number, number][] = [], kind: "tree" | "pine" | "mix" = "mix"): Shape[] {
  const out: Shape[] = [];
  for (let i = 0, tries = 0; i < n && tries < n * 40; tries++) {
    const rg = r.pick(ranges), x = r.range(rg[0], rg[1]);
    if (excl.some(([a, b]) => x > a && x < b)) continue;
    const h = r.range(h0, h1), by = top(x) + 2;
    out.push(kind === "pine" || (kind === "mix" && r() < 0.5) ? pine(r, x, by, h) : tree(r, x, by, h));
    i++;
  }
  return out;
}

/* ---------- bg + light tiers ---------- */
function bgLayer(id: string, w: number, h: number, sun: Pt, radii: number[], seed: number): Layer {
  const r = R(seed);
  const fills = [cn("vault-far", "vault-glow", 0.3), cn("vault-far", "vault-glow", 0.62), P["vault-glow"]!, cn("vault-glow", "vellum", 0.4)];
  return layer(id, 0, sheet(rect(0, 0, w, h), P["vault-far"]!, { shadow: false }),
    ...radii.map((rad, i) => sheet(cut(disc(sun[0], sun[1], rad, 96), r, 3, 40), fills[i]!, { shadow: false })));
}

/* ---------- vault ribs (far) ---------- */
function ribsLayer(id: string, sun: Pt, radii: number[], thick: number[], w: number, h: number, seed: number, ceilX: [number, number], ceilN: number): Layer {
  const r = R(seed), out: Frag[] = [];
  radii.forEach((rad, i) => {
    const th = thick[i]!;
    const ring = difference(disc(sun[0], sun[1], rad + th / 2, 120), disc(sun[0], sun[1], rad - th / 2, 120));
    const coffers: Poly[] = [];
    const da = 40 / rad;
    for (let a = 0; a < Math.PI * 2; a += da * r.range(0.85, 1.15)) {
      const x = sun[0] + Math.cos(a) * rad, y = sun[1] + Math.sin(a) * rad;
      if (x < -30 || x > w + 30 || y < -30 || y > h + 30) continue;
      coffers.push(rotRect(x, y, 10, 16, a + Math.PI / 2));
    }
    const clipped = inter(ring, rect(-60, -60, w + 120, h + 120));
    const body = difference(clipped, ...coffers);
    out.push(...pile(body, [P["vault-far-2"]!, cn("vault-far-2", "vault-far", 0.5)], 6, B.far, sun));
  });
  out.push(paper(stalactites(r, ceilX[0], ceilX[1], 0, 130, ceilN), cn("vault-far-2", "vault-mid", 0.25), B.far, sun, { light: [0, 1] }));
  return layer(id, 2, ...out);
}

/* ---------- far city ---------- */
type CityCfg = { x0: number; x1: number; prof: Pt[]; bottom: number; exit: [number, number]; towers: number; bridges: [number, number, number][]; seed: number; sun: Pt; stairsAt: [number, number][]; skip: [number, number] };
function cityFar(id: string, c: CityCfg): Layer {
  const r = R(c.seed), prof = interp(c.prof), out: Frag[] = [];
  const mass = steps(r, prof, c.x0, c.x1, c.bottom, 5);
  out.push(...pile(mass.poly, [cn("vault-far-2", "vault-mid", 0.5), P["vault-far-2"]!], 5, B.far, c.sun));
  // tiny windows on the mass face
  const win: Poly[] = [];
  for (let i = 0; i < 60; i++) { const x = r.range(c.x0 + 10, c.x1 - 10); if (x > c.skip[0] && x < c.skip[1]) continue; const w = r.range(3.5, 6); win.push(arch(r, x, mass.top(x) + r.range(14, 50), w, w * 1.7, 0.3)); }
  out.push(sheet(union(...win), P["vault-mid-2"]!, { shadow: false }));
  // exit arch: foreshadow behind a facade with an arch hole, three tiny pines inside
  const [ex, eb] = c.exit;
  const hole = arch(r, ex, eb, 70, 100, 1);
  const facade = union(cut(rect(ex - 52, eb - 138, 104, 138 + 4), r, 1, 30), rect(ex - 58, eb - 144, 116, 10), ...[0, 1, 2, 3].map((i) => rect(ex - 58 + i * 36, eb - 156, 18, 12)));
  out.push(sheet(hole, P.foreshadow!, { shadow: false }));
  out.push(sheet(union(pine(r, ex - 20, eb - 2, 34), pine(r, ex + 2, eb - 2, 46), pine(r, ex + 22, eb - 2, 30)), P["rock-dark"]!, { shadow: false }));
  out.push(paper(facade, P["vault-mid"]!, B.far, c.sun, { holes: [hole], rm: 0.4 }));
  // towers
  const bodies: Shape[] = [], holes: Poly[] = [];
  const pitch = (c.x1 - c.x0) / c.towers;
  for (let i = 0; i < c.towers; i++) {
    const x = c.x0 + pitch * (i + r.range(0.3, 0.7));
    if (x > c.skip[0] && x < c.skip[1]) continue;
    const h = r.range(30, 90), w = h * 0.34 + 9, t = tower(r, x, mass.top(x) + 8, w, h, { windows: h > 55 ? 3 : 2 });
    bodies.push(t.body); holes.push(...t.holes);
  }
  for (const [bx0, bx1, by] of c.bridges) bodies.push(bridge(r, bx0, bx1, by, 7, 3));
  c.stairsAt.forEach(([sx, sy]) => bodies.push([stairs(sx, sy, 54, 30, 9, r() < 0.5 ? 1 : -1)]));
  out.push(paper(union(...bodies), P["vault-mid"]!, B.far, c.sun, { holes: holes }));
  // tiny trees
  const trees: Shape[] = [];
  for (let i = 0; i < 44; i++) {
    const x = r.range(c.x0 + 10, c.x1 - 10); if (x > c.skip[0] && x < c.skip[1]) continue;
    const h = r.range(13, 28), by = mass.top(x) + r.range(4, 46);
    trees.push(i % 2 ? pine(r, x, by, h) : tree(r, x, by, h));
  }
  out.push(sheet(union(...trees), P["vault-mid-2"]!, { shadow: false }));
  return layer(id, 3, ...out);
}

/* ---------- sun (shared by both compositions) ---------- */
function sunLayers() {
  const [sx, sy] = SUN, r = R(5);
  const halo = layer("sun-halo", 1, ...([[560, 0.35], [460, 0.45], [380, 0.55]] as [number, number][]).map(([rad, op]) => sheet(cut(disc(sx, sy, rad, 120), r, 1.5, 40), P.vellum!, { shadow: false, opacity: op })));
  const ray = (a: number, r0: number, r1: number, hw: number): Poly => { const c = Math.cos(a), s = Math.sin(a); const p = (rad: number, o: number): Pt => [sx + c * rad - s * o, sy + s * rad + c * o]; return [p(r0, -hw), p(r1, 0), p(r0, hw)]; };
  const slit = (a: number, r0: number, r1: number, w: number): Poly => { const c = Math.cos(a), s = Math.sin(a); const p = (rad: number, o: number): Pt => [sx + c * rad - s * o, sy + s * rad + c * o]; return [p(r0, -w / 2), p(r1, -w / 2), p(r1, w / 2), p(r0, w / 2)]; };
  const ring = (r0: number, r1: number) => difference(disc(sx, sy, r1, 96), disc(sx, sy, r0, 96));
  const rot: PaperOpts = { noRim: true, light: [0, -1], shadow: { dx: 0, dy: 6, blur: 8, opacity: 0.3 } };
  // outer: 16 long rays, each with a slit
  const outerRays = Array.from({ length: 16 }, (_, i) => ray((i / 16) * Math.PI * 2, 232, i % 2 ? 292 : 330, 27 * r.vary(0.08)));
  const outerHoles = [
    ...Array.from({ length: 16 }, (_, i) => slit((i / 16) * Math.PI * 2, 258, i % 2 ? 272 : 308, 5)),
    ...Array.from({ length: 32 }, (_, i) => rotRect(sx + Math.cos((i / 32) * Math.PI * 2 + 0.05) * 230, sy + Math.sin((i / 32) * Math.PI * 2 + 0.05) * 230, 8, 8, (i / 32) * Math.PI * 2 + Math.PI / 4)),
  ];
  const outer = layer("sun-rays-outer", 5, ...pile(difference(union(ring(205, 262), ...outerRays), ...outerHoles), [P["vault-far"]!, P.vellum!, P.sun!], 6, B.hero, SUN, rot));
  const innerRays = Array.from({ length: 12 }, (_, i) => ray(((i + 0.5) / 12) * Math.PI * 2, 188, 240, 21 * r.vary(0.08)));
  const innerHoles = [
    ...Array.from({ length: 12 }, (_, i) => slit(((i + 0.5) / 12) * Math.PI * 2, 202, 226, 5)),
    ...Array.from({ length: 24 }, (_, i) => rotRect(sx + Math.cos((i / 24) * Math.PI * 2) * 176, sy + Math.sin((i / 24) * Math.PI * 2) * 176, 6, 6, (i / 24) * Math.PI * 2 + Math.PI / 4)),
  ];
  const inner = layer("sun-rays-inner", 6, ...pile(difference(union(ring(156, 196), ...innerRays), ...innerHoles), [P["vault-far-2"]!, P.vellum!, P.sun!], 5, B.hero, SUN, rot));
  // core: disc r150, 4 tiers, ring of 24 punched holes on tier 2, glow, three hanging cords
  const sh = { dx: 0, dy: 4, blur: 5, opacity: 0.3, color: P.shadow! };
  const cords: Frag[] = [], beads: Poly[] = [];
  for (const dx of [-45, 0, 45]) {
    const topX = sx + dx * 2.4, by = sy - 136;
    cords.push(sheet(cut([[topX - 2, -300], [topX + 2, -300], [sx + dx + 2, by], [sx + dx - 2, by]], r, 0.5, 60), P["rock-dark"]!, { shadow: false }));
    for (let k = 1; k <= 6; k++) { const t = k / 7; beads.push(ellipse(topX + (sx + dx - topX) * t, -300 + (by + 300) * t, 5, 8, 6)); }
  }
  const holes24 = Array.from({ length: 24 }, (_, i) => disc(sx + Math.cos((i / 24) * Math.PI * 2) * 115, sy + Math.sin((i / 24) * Math.PI * 2) * 115, 4, 10));
  const slits12 = Array.from({ length: 12 }, (_, i) => slit((i / 12) * Math.PI * 2 + 0.26, 52, 88, 6));
  const core = layer("sun-core", 7,
    glow(sx, sy, 360, P.lamp!, { opacity: 0.55, core: P["lamp-core"]! }),
    ...cords, sheet(union(...beads), P["rock-dark"]!, { shadow: false }),
    sheet(disc(sx, sy, 150, 96), P.vellum!, { shadow: sh }),
    sheet(disc(sx, sy, 136, 96), cn("vellum", "sun", 0.5), { shadow: false }),
    sheet(disc(sx, sy, 122, 96), P.sun!, { holes: holes24, shadow: sh }),
    sheet(disc(sx, sy, 108, 96), P["lamp-core"]!, { holes: slits12, shadow: sh }),
    sheet(disc(sx, sy, 38, 48), P.vellum!, { shadow: false }), sheet(disc(sx, sy, 26, 40), P.sun!, { shadow: false }));
  return [halo, outer, inner, core];
}

/* ---------- mist, shafts, dust ---------- */
const mistLayer = (id: string, bands: [number, number, number, number, number][]) => layer(id, 4, ...bands.map(([x, y, w, h, o]) => mist(x, y, w, h, P.vellum!, o)));
function shaftsLayer(id: string, sun: Pt, angles: number[], len: number, r0: number, w1: number, ops: number[]) {
  return layer(id, 11, ...angles.map((a, i) => { const ar = (a * Math.PI) / 180; return shaft(sun[0] + Math.sin(ar) * r0, sun[1] + Math.cos(ar) * r0, 26, w1, len * (1 - Math.abs(a) / 220), a, P.vellum!, ops[i % ops.length]!); }));
}
function dustLayer(id: string, region: { x0: number; y0: number; x1: number; y1: number }, seed: number) {
  const r = R(seed);
  return layer(id, 13, ...([[70, 0.35], [70, 0.6], [60, 0.8]] as [number, number][]).map(([n, op]) =>
    sheet(scatter(r, region, n, (x, y) => ellipse(x, y, r.range(1.5, 3.6), r.range(1.5, 3.6), 6), 14), P.dust!, { shadow: false, opacity: op })));
}

/* ---------- light pool ---------- */
function poolLayer(id: string, cx: number, cy: number, w: number, seed: number, falls: [number, number, number][]): Layer {
  const r = R(seed), out: Frag[] = [];
  const slits = Array.from({ length: 8 }, (_, i) => { const t = (i + 0.5) / 8 - 0.5; return cut(ellipse(cx + t * w * 0.8 + r.range(-12, 12), cy + r.range(-8, 8), r.range(22, 48), 2.2, 10), r, 0.3, 20); });
  out.push(sheet(difference(cut(ellipse(cx, cy, w / 2, 17, 60), r, 1.2, 30), ...slits), P.vellum!, { shadow: false, opacity: 0.45 }));
  out.push(sheet(cut(ellipse(cx, cy + 1, w * 0.36, 11, 50), r, 1, 30), P.vellum!, { shadow: false, opacity: 0.6 }));
  for (const [fx, fy0, fy1] of falls) {
    const q = cut([[fx - 5, fy0], [fx + 5, fy0], [fx + 8, fy1], [fx - 8, fy1]], r, 0.6, 30);
    const sl = [0.2, 0.45, 0.7].map((t) => rect(fx - 1.5 + r.range(-2, 2), fy0 + (fy1 - fy0) * t, 3, 14));
    out.push(sheet(difference(q, ...sl), P.vellum!, { shadow: false, opacity: 0.6 }));
    out.push(sheet(ellipse(fx, fy1, 20, 5, 12), P.sun!, { shadow: false, opacity: 0.55 }));
  }
  return layer(id, 10, ...out);
}

/* ---------- cliff city (desktop one wall, portrait two walls) ---------- */
type Wall = { side: 1 | -1; edge: (y: number) => number; cw: number; y0: number; y1: number; ledges: number[]; bridges: { x0: number; x1: number; y: number; arches: number }[]; litY: number; sun: Pt; seed: number; k: number; stairsN: number };
function cliffCity(w: Wall): Frag[] {
  const r = R(w.seed), n2 = noise(w.seed), L = w.side === 1, out: Frag[] = [];
  const ex = (y: number) => w.edge(y) + n2(y / 110, 1) * 22;
  const outerX = L ? -90 : w.cw + 90;
  const pts: Poly = [];
  for (let y = w.y0; y <= w.y1; y += 28) pts.push([ex(y) + r.range(-4, 4), y]);
  const sil: Poly = [[outerX, w.y0], ...pts, [outerX, w.y1]];
  const span = (y: number): [number, number] => (L ? [-40, ex(y) - 38] : [ex(y) + 38, w.cw + 40]);
  const calm = [P.rock!, P["rock-mid"]!, P["vault-near"]!], lit = [P["vault-mid"]!, P["vault-mid-2"]!, P["vault-near"]!];
  if (w.litY >= w.y1) out.push(...pile(sil, lit, 16, B.hero, w.sun));
  else {
    out.push(...pile(sil, calm, 16, B.hero, w.sun, { rm: 0.25 }));
    out.push(...pile(inter(sil, cut(rect(-300, -300, w.cw + 600, w.litY + 300), r, 5, 36)), lit, 16, B.hero, w.sun));
  }
  const inner = offset(sil, -36);
  // strata tone bands deepen towards the base
  const bandFills = [cn("vault-near", "rock-mid", 0.35), cn("vault-near", "rock-mid", 0.6), P["rock-mid"]!, cn("rock-mid", "rock", 0.5)];
  const b0 = w.y0 + 90;
  const sx0 = L ? -90 : w.cw - 700, sx1 = L ? 700 : w.cw + 90;
  strataBands(r, sx0, sx1, b0, w.y1, bandFills.length).forEach((s, i) => out.push(sheet(inter(s, inner), bandFills[i]!, { shadow: { dx: 0, dy: 6, blur: 8, opacity: 0.25, color: P.shadow }, edge: { light: [0, -1], width: 1.5, color: mix(bandFills[i]!, P["rim-warm"]!, 0.2) } })));
  const wins: Poly[] = [], winFrames: Poly[] = [], ledgeS: Poly[] = [], bld: Shape[] = [], bldH: Poly[] = [], cols: Shape[] = [], ferns: Shape[] = [], vines: Shape[] = [], stairS: Poly[] = [];
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
    for (let k = 0; k < 3; k++) { // supporting columns up to the ledge above
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
    if (i >= 1 && i <= w.stairsN) { const sw = r.range(70, 100), sxx = r.range(sx + 20, ex1 - sw - 20), sh = r.range(46, 68); stairS.push(stairs(sxx, y - sh, sw, sh, 13, r() < 0.5 ? 1 : -1)); }
  });
  out.push(sheet(union(...winFrames), cn("rock-mid", "vault-near", 0.5), { shadow: false }));
  out.push(sheet(union(...wins), P["rock-dark"]!, { shadow: false }));
  out.push(paper(union(...ledgeS), cn("rock-mid", "rock", 0.4), B.mid, w.sun, { rm: 0.25 }));
  if (cols.length) out.push(paper(union(...cols), P["rock-mid"]!, B.mid, w.sun, { rm: 0.25 }));
  if (stairS.length) out.push(paper(union(...stairS), P.rock!, B.mid, w.sun, { rm: 0.25 }));
  for (const bg of w.bridges) {
    const sh = bridge(r, bg.x0, bg.x1, bg.y, 14, bg.arches), endX = L ? bg.x1 - 16 : bg.x0 + 16;
    const T = tower(r, endX, bg.y + 2, 24, 62, { windows: 2 });
    out.push(paper(union(sh, T.body), P.rock!, B.mid, w.sun, { holes: T.holes, rm: 0.35 }));
  }
  out.push(paper(union(...bld), P.rock!, B.mid, w.sun, { holes: bldH, rm: 0.25 }));
  out.push(sheet(union(...vines, ...ferns), P["rock-dark"]!, { shadow: false }));
  return out;
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

/* ---------- desktop terraces ---------- */
function terracesD(): Frag[] {
  const r = R(9), out: Frag[] = [];
  const t1 = steps(r, interp([[880, 860], [1000, 790], [1080, 800], [1130, 840], [1500, 852], [1740, 858], [1800, 812], [1920, 782], [2020, 778]]), 880, 2040, 1010, 6);
  const t2 = steps(r, interp([[880, 892], [1000, 862], [1100, 880], [1180, 906], [1700, 906], [1790, 882], [1900, 862], [2020, 852]]), 880, 2040, 1010, 6);
  const t3 = steps(r, interp([[880, 926], [1100, 930], [1300, 940], [1600, 936], [1900, 926], [2020, 926]]), 880, 2040, 1010, 5);
  const heron: [number, number][] = [[1480, 1650]], arch1: [number, number][] = [[1590, 1730]];
  out.push(paper(t1.poly, P["vault-mid"]!, B.mid, SUN));
  out.push(sheet(union(...plants(r, t1.top, [[900, 1560], [1740, 2020]], 8, 24, 44, [...arch1, ...heron])), P["vault-near"]!, { shadow: { dx: 3, dy: 3, blur: 4, opacity: 0.25, color: P.shadow } }));
  const rw1 = ruinWall(r, 1160, t1.top(1200) + 2, 110, 40);
  out.push(paper(union(rw1.body), P["vault-mid-2"]!, B.mid, SUN, { holes: rw1.holes }));
  out.push(paper(t2.poly, P["vault-mid-2"]!, B.mid, SUN));
  const rw2 = ruinWall(r, 960, t2.top(1000) + 2, 130, 52), rw3 = ruinWall(r, 1790, t2.top(1830) + 2, 150, 60);
  out.push(paper(union(rw2.body, rw3.body), P["vault-near"]!, B.mid, SUN, { holes: [...rw2.holes, ...rw3.holes] }));
  out.push(sheet(union(...plants(r, t2.top, [[900, 1470], [1760, 2020]], 8, 36, 60, [...arch1, ...heron])), P["vault-near"]!, { shadow: { dx: 3, dy: 3, blur: 4, opacity: 0.25, color: P.shadow } }));
  out.push(paper(t3.poly, P["vault-near"]!, B.mid, SUN, { rm: 0.35 }));
  const cols = [960, 1250, 1870, 1190].map((x, i) => column(r, x, (i === 3 ? t2 : t3).top(x) + 2, r.range(14, 18), r.range(40, 70), true));
  const st = [[1120, t3.top(1140) - 22], [1860, t3.top(1860) - 22]].map(([x, y]) => stairs(x!, y!, 60, 24, 8, 1));
  out.push(paper(union(...cols, ...st), P.rock!, B.mid, SUN, { rm: 0.35 }));
  out.push(sheet(union(...plants(r, t3.top, [[900, 1440], [1700, 2020]], 5, 55, 80, [...heron])), P.rock!, { shadow: { dx: 3, dy: 3, blur: 4, opacity: 0.3, color: P.shadow } }));
  return out;
}

/* ---------- near ledge ---------- */
function rockNear(id: string, seed: number, x0: number, x1: number, prof: Pt[], base: number, sun: Pt, balust: [number, number] | null, bandsN: number, fernN: number): Layer {
  const r = R(seed), out: Frag[] = [], pr = interp(prof);
  const t = steps(r, pr, x0, x1, base, 7);
  out.push(...pile(t.poly, [P["rock-dark"]!, P.rock!, cn("rock", "rock-mid", 0.5)], 12, B.near, sun, { rm: 0.25 }));
  const inner = offset(t.poly, -30);
  const tones = [cn("rock", "rock-mid", 0.7), cn("rock", "rock-dark", 0.45), P.rock!, cn("rock-dark", "rock", 0.5)];
  for (let b = 0; b < bandsN; b++) {
    const bt = steps(r, (x) => pr(x) + 40 + b * ((base - pr(x)) / (bandsN + 0.6)), x0, x1, base + 40, 10);
    out.push(sheet(inter(bt.poly, inner), tones[b % tones.length]!, { shadow: { dx: 0, dy: 8, blur: 10, opacity: 0.3, color: P.shadow }, edge: { light: [0, -1], width: 1.5, color: mix(tones[b % 4]!, P["rim-warm"]!, 0.2) } }));
    const wn: Poly[] = [];
    for (let i = 0; i < 26; i++) { const x = r.range(x0 + 30, x1 - 30), y = bt.top(x) + r.range(22, 54), w = r.range(5, 10); wn.push(arch(r, x, y, w, w * 1.7, 0.3)); }
    out.push(sheet(union(...wn), P["rock-dark"]!, { shadow: false }));
    const rwl = Array.from({ length: 3 }, () => { const x = r.range(x0 + 20, x1 - 220); return ruinWall(r, x, bt.top(x + 60) + 2, r.range(100, 190), r.range(34, 56)); });
    out.push(paper(union(...rwl.map((q) => q.body)), P["rock-dark"]!, B.mid, sun, { holes: rwl.flatMap((q) => q.holes), rm: 0.25 }));
  }
  // pebbles, cracks
  const peb = scatter(r, { x0: x0 + 10, y0: pr(x0 + 400) + 30, x1: x1 - 10, y1: bandsN ? base - 30 : pr(x0 + 400) + 110 }, bandsN ? 140 : 40, (x, y) => cut(rect(x, y, r.range(6, 20), r.range(4, 10)), r, 1, 8));
  out.push(sheet(peb, cn("rock", "rock-mid", 0.75), { shadow: false }));
  const cracks = Array.from({ length: bandsN ? 40 : 18 }, () => { const x = r.range(x0 + 20, x1 - 20), y = pr(x) + r.range(30, bandsN ? base - pr(x) - 40 : 90), l = r.range(24, 70), a = r.range(1.1, 2.0); return rotRect(x, y, 3.5, l, a); });
  out.push(sheet(union(...cracks), P["rock-dark"]!, { shadow: false }));
  // vegetation + roots + balustrade on the lip
  const fr: Shape[] = [], rt: Shape[] = [];
  for (let i = 0; i < fernN; i++) { const x = r.range(x0 + 10, x1 - 10); fr.push(fern(r, x, t.top(x) + 3, r.range(26, 58), r.range(-0.6, 0.6))); }
  for (let i = 0; i < Math.round(fernN / 2); i++) { const x = r.range(x0 + 30, x1 - 30); rt.push(roots(r, x, t.top(x) + 8, 30, r.range(40, 100), 4, 1)); }
  out.push(sheet(union(...fr, ...rt), P["rock-dark"]!, { shadow: false }));
  if (balust) {
    const parts: Poly[] = [];
    for (let x = balust[0]; x < balust[1]; x += 34 * r.range(0.85, 1.2)) {
      if (r() < 0.22) continue;
      const by = t.top(x) + 2, h = 30 * r.range(0.6, 1.1);
      parts.push(rect(x, by - h, 9, h), rect(x - 2, by - h - 6, 13, 6), rect(x - 3, by - 5, 15, 5));
      if (r() < 0.6) parts.push(rect(x + 9, by - h + 4, 25, 5));
    }
    out.push(paper(union(...parts), P.rock!, B.mid, sun, { rm: 0.25 }));
  }
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
function pin(segs: Seg[], a: number, b: number, p: number): Seg[] { return segs.map((s) => (s.b > a && s.a < b ? { ...s, p } : s)); }
/** Edge polyline as [v (edge coordinate), u (sweep coordinate)] with scissor jitter; treads share u. */
function edgePts(r: Rng, segs: Seg[], vOf: (p: number) => number): Pt[] {
  const pts: Pt[] = [];
  for (const s of segs) { const n = Math.max(1, Math.round((s.b - s.a) / 28)); for (let i = 0; i <= n; i++) pts.push([vOf(s.p) + r.range(-4, 4), s.a + ((s.b - s.a) * i) / n]); }
  return pts;
}
/** crossings of a closed polygon with a scanline: axis 1 -> horizontal line y=c (returns x list); axis 0 -> vertical x=c (returns y list). */
function cross(poly: Poly, axis: 0 | 1, c: number): number[] {
  const o = axis === 1 ? 0 : 1, out: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!, b = poly[(i + 1) % poly.length]!, a1 = a[axis], b1 = b[axis];
    if ((a1 <= c && b1 > c) || (b1 <= c && a1 > c)) out.push(a[o] + ((b[o] - a[o]) * (c - a1)) / (b1 - a1));
  }
  return out;
}

const GATE_FILLS_L = [P.rock!, P["rock-dark"]!, P.gate!];
const GATE_FILLS_R = [P["vault-near"]!, P["rock-dark"]!, P.gate!];
function gatesDesktop() {
  const rl = R(14), rr = R(15), rs = R(16);
  const segs = pin(phaseSegs(rs, -60, 1140, 110, 200), 700, 960, 1); // pinned: exit arch (x 1625-1695) stays clear
  const xl = (p: number) => 170 + 230 * p, xr = (p: number) => xl(p) + 1305;
  const pl = edgePts(rl, segs, xl), pr = edgePts(rr, segs, xr);
  const polyL: Poly = [[-800, -60], ...pl.map(([v, u]) => [v, u] as Pt), [-800, 1140]];
  const polyR: Poly = [[2720, -60], ...pr.map(([v, u]) => [v, u] as Pt), [2720, 1140]];
  // G3 numeric check: closed state (L +700, R -700) must overlap >= 80 px at every scanline
  let minOv = 1e9;
  for (let y = -60; y < 1140; y += 0.5) {
    const l = Math.max(...cross(polyL, 1, y + 0.25)), rr2 = Math.min(...cross(polyR, 1, y + 0.25));
    minOv = Math.min(minOv, l + 700 - (rr2 - 700));
  }
  const detail = (poly: Poly, right: boolean, r: Rng, pts: Pt[]) => {
    const nx = right ? -1 : 1, out: Shape[] = [];
    // treads: segs boundaries
    segs.forEach((s, i) => {
      const nxt = segs[i + 1]; if (!nxt) return;
      const va = (right ? xr : xl)(s.p), vb = (right ? xr : xl)(nxt.p), u = s.b, cx = (va + vb) / 2;
      const up = right ? vb < va : vb > va;
      if (up) { const t = r(); out.push(t < 0.3 ? fern(r, cx, u, r.range(24, 44), nx * r.range(0.3, 0.9)) : t < 0.55 ? column(r, cx, u, 14, r.range(28, 54), true) : t < 0.8 ? pine(r, cx, u, r.range(36, 60)) : (() => { const q = ruinWall(r, cx - 24, u + 1, 48, 34); return difference(q.body, ...q.holes); })()); }
      else out.push(roots(r, cx, u - 2, 20, r.range(50, 120), 3, 1), vine(r, cx, u - 2, r.range(40, 100), 8));
    });
    for (let i = 0; i < pts.length; i += 2) {
      const [v, u] = pts[i]!, t = r();
      if (t < 0.5) out.push(vine(r, v - nx * 3, u, r.range(50, 130), 10));
      else if (t < 0.75) out.push(roots(r, v - nx * 4, u, 14, r.range(40, 100), 3, 1));
      else out.push(fern(r, v - nx * 4, u, r.range(26, 52), nx * r.range(0.4, 1)));
    }
    return union(poly, ...out);
  };
  const gl = layer("gate-l", 14, ...pile(detail(polyL, false, R(17), pl), GATE_FILLS_L, 16, B.gate, SUN, { rm: 0.25 }));
  const gr = layer("gate-r", 15, ...pile(detail(polyR, true, R(18), pr), GATE_FILLS_R, 16, B.gate, SUN, { rm: 0.5 }));
  const lo = Math.min(...pl.map((p) => p[0])), hi = Math.max(...pl.map((p) => p[0]));
  const ro = Math.min(...pr.map((p) => p[0])), rh = Math.max(...pr.map((p) => p[0]));
  return { gl, gr, minOv, restL: [lo, hi], restR: [ro, rh] };
}

function gatesPortrait() {
  const rl = R(24), rr = R(25), rs = R(26);
  const segs = pin(phaseSegs(rs, -60, 1140, 120, 210), 150, 930, 0); // sweep = x; pinned high above the sun
  const yt = (p: number) => 150 + 160 * p, yb = (p: number) => yt(p) + 1455;
  const pt = edgePts(rl, segs, yt), pb = edgePts(rr, segs, yb);
  const polyT: Poly = [[-60, -860], ...pt.map(([v, u]) => [u, v] as Pt), [1140, -860]];
  const polyB: Poly = [[-60, 2780], ...pb.map(([v, u]) => [u, v] as Pt), [1140, 2780]];
  let minOv = 1e9;
  for (let x = -60; x < 1140; x += 0.5) {
    const t = Math.max(...cross(polyT, 0, x + 0.25)), b = Math.min(...cross(polyB, 0, x + 0.25));
    minOv = Math.min(minOv, t + 780 - (b - 780));
  }
  const dT = R(27), dB = R(28), outT: Shape[] = [], outB: Shape[] = [];
  segs.forEach((s) => {
    const yT = yt(s.p), yB = yb(s.p), len = s.b - s.a;
    if (len > 60) {
      outT.push(stalactites(dT, s.a, s.b, yT, 70, Math.max(2, Math.round(len / 36))));
      outB.push(stalactites(dB, s.a, s.b, yB, 80, Math.max(2, Math.round(len / 36)), -1));
    }
    for (let k = 0; k < Math.floor(len / 55); k++) {
      const x = dT.range(s.a + 6, s.b - 6);
      outT.push(dT() < 0.5 ? vine(dT, x, yT - 2, dT.range(60, 150), 12) : roots(dT, x, yT - 2, 16, dT.range(60, 140), 3, 1));
      const x2 = dB.range(s.a + 6, s.b - 6), t = dB();
      outB.push(t < 0.4 ? fern(dB, x2, yB + 2, dB.range(30, 62), dB.range(-0.6, 0.6)) : t < 0.6 ? pine(dB, x2, yB + 2, dB.range(40, 70)) : t < 0.8 ? column(dB, x2, yB + 2, 16, dB.range(34, 64), true) : roots(dB, x2, yB + 2, 16, dB.range(40, 90), 3, -1));
    }
    if (len > 100) { const q = ruinWall(dB, s.a + 20, yB + 2, Math.min(len - 40, 130), 44); outB.push(difference(q.body, ...q.holes)); }
  });
  const gtL = layer("gate-t-p", 14, ...pile(union(polyT, ...outT), GATE_FILLS_R, 16, B.gate, PSUN, { rm: 0.5 }));
  const gbL = layer("gate-b-p", 15, ...pile(union(polyB, ...outB), GATE_FILLS_L, 16, B.gate, PSUN, { rm: 0.25 }));
  return { gtL, gbL, minOv, restT: [Math.min(...pt.map((p) => p[0])), Math.max(...pt.map((p) => p[0]))], restB: [Math.min(...pb.map((p) => p[0])), Math.max(...pb.map((p) => p[0]))] };
}

/* ---------- portrait terraces (calm tokens below y 1056) ---------- */
function terracesP(): Frag[] {
  const r = R(39), out: Frag[] = [];
  const bands: { prof: Pt[]; fill: string; amp: number }[] = [
    { prof: [[-60, 1028], [200, 1010], [400, 1026], [640, 1030], [860, 1024], [1140, 1010]], fill: P["vault-mid"]!, amp: 5 },
    { prof: [[-60, 1078], [300, 1064], [560, 1080], [860, 1066], [1140, 1072]], fill: P["vault-near"]!, amp: 4 },
    { prof: [[-60, 1150], [300, 1136], [560, 1158], [860, 1142], [1140, 1150]], fill: cn("vault-near", "rock-mid", 0.5), amp: 8 },
    { prof: [[-60, 1226], [300, 1210], [560, 1232], [860, 1214], [1140, 1224]], fill: P["rock-mid"]!, amp: 8 },
    { prof: [[-60, 1290], [300, 1276], [560, 1296], [860, 1280], [1140, 1290]], fill: cn("rock-mid", "rock", 0.5), amp: 8 },
  ];
  const t = bands.map((b) => steps(r, interp(b.prof), -60, 1140, 1980, b.amp));
  t.forEach((tt, i) => {
    out.push(paper(tt.poly, bands[i]!.fill, B.mid, PSUN, { rm: i ? 0.25 : 0.45 }));
    if (i === 0) {
      const rw = ruinWall(r, 120, tt.top(160) + 2, 120, 42), rw2 = ruinWall(r, 840, tt.top(880) + 2, 150, 50);
      out.push(paper(union(rw.body, rw2.body), P["vault-mid-2"]!, B.mid, PSUN, { holes: [...rw.holes, ...rw2.holes] }));
      out.push(sheet(union(...plants(r, tt.top, [[60, 640], [840, 1100]], 9, 26, 52, [[690, 830]])), P["vault-near"]!, { shadow: { dx: 3, dy: 3, blur: 4, opacity: 0.25, color: P.shadow } }));
      return;
    }
    const wn: Poly[] = [];
    for (let k = 0; k < 40; k++) { const x = r.range(-20, 1100), w = r.range(5, 9); wn.push(arch(r, x, tt.top(x) + r.range(30, 62), w, w * 1.7, 0.3)); }
    out.push(sheet(union(...wn), P["rock-dark"]!, { shadow: false }));
    const bod: Shape[] = [], hol: Poly[] = [];
    for (let x = -20; x < 1100; x += r.range(90, 190)) {
      const k = r();
      if (k < 0.5) { const h = r.range(40, 92), tw = h * 0.36 + 9, T = tower(r, x, tt.top(x) + 3, tw, h, { windows: 3 }); bod.push(T.body); hol.push(...T.holes); }
      else { const q = ruinWall(r, x, tt.top(x + 50) + 3, r.range(90, 150), r.range(32, 54)); bod.push(q.body); hol.push(...q.holes); }
    }
    out.push(paper(union(...bod), i % 2 ? P["rock-dark"]! : P.rock!, B.mid, PSUN, { holes: hol, rm: 0.25 }));
    const veg = [...plants(r, tt.top, [[-20, 1100]], 6, 30, 60, [], "pine")];
    for (let k = 0; k < 6; k++) { const x = r.range(-20, 1100); veg.push(fern(r, x, tt.top(x) + 2, r.range(18, 34), r.range(-0.5, 0.5))); }
    out.push(sheet(union(...veg), P["rock-dark"]!, { shadow: false }));
    if (i === 2) out.push(paper(stairs(300, tt.top(320) - 40, 90, 44, 14, 1), P.rock!, B.mid, PSUN, { rm: 0.25 }));
  });
  return out;
}

/* ---------- assemble ---------- */
const sunL = sunLayers();
const edgeL = interp([[-60, 960], [200, 1000], [420, 945], [640, 1005], [860, 950], [1000, 995], [1140, 940]]);
const cliffD = layer("cliff-city", 8, ...cliffCity({
  side: 1, edge: edgeL, cw: W, y0: -60, y1: 1140, ledges: [150, 258, 365, 470, 572, 676, 780, 880, 970], litY: 2000, sun: SUN, seed: 8, k: 1, stairsN: 6,
  bridges: [{ x0: 680, x1: 1010, y: 300, arches: 6 }, { x0: 700, x1: 1040, y: 470, arches: 5 }, { x0: 650, x1: 1000, y: 628, arches: 6 }, { x0: 720, x1: 1030, y: 790, arches: 5 }],
}));
const wallPL = interp([[-60, 250], [300, 272], [600, 236], [900, 284], [1200, 256], [1500, 276], [2000, 250]]);
const wallPR = interp([[-60, 830], [300, 808], [600, 846], [900, 798], [1200, 828], [1500, 806], [2000, 832]]);
const ledgesP = [140, 290, 440, 590, 740, 890, 1000, 1120, 1240];
const cliffP = layer("cliff-city-p", 8,
  ...cliffCity({ side: 1, edge: wallPL, cw: PW, y0: -60, y1: 1420, ledges: ledgesP, litY: 1000, sun: PSUN, seed: 28, k: 0.85, stairsN: 5, bridges: [{ x0: 200, x1: 450, y: 720, arches: 4 }, { x0: 190, x1: 470, y: 880, arches: 5 }] }),
  ...cliffCity({ side: -1, edge: wallPR, cw: PW, y0: -60, y1: 1420, ledges: ledgesP.map((y) => y + 30), litY: 1000, sun: PSUN, seed: 29, k: 0.85, stairsN: 5, bridges: [{ x0: 640, x1: 890, y: 760, arches: 4 }, { x0: 620, x1: 900, y: 920, arches: 5 }] }));

const cityD = cityFar("city-far", {
  x0: 960, x1: 2000, bottom: 860, exit: [1660, 850], towers: 17, seed: 3, sun: SUN, skip: [1590, 1730],
  prof: [[960, 760], [1040, 720], [1120, 730], [1200, 700], [1320, 720], [1420, 690], [1520, 700], [1600, 740], [1740, 740], [1800, 700], [1900, 690], [2000, 700]],
  bridges: [[1130, 1250, 702], [1330, 1470, 690], [1760, 1890, 692]], stairsAt: [[1300, 706], [1460, 688], [1000, 724]],
});
const cityP = cityFar("city-far-p", {
  x0: 200, x1: 900, bottom: 1040, exit: [760, 1010], towers: 12, seed: 33, sun: PSUN, skip: [690, 830],
  prof: [[200, 900], [330, 870], [450, 890], [560, 850], [660, 880], [720, 900], [840, 905], [900, 880]],
  bridges: [[330, 450, 862], [470, 590, 850]], stairsAt: [[250, 890], [600, 860]],
});
const gD = gatesDesktop(), gP = gatesPortrait();

const ribsD = ribsLayer("ribs-far", SUN, [820, 1150, 1500], [54, 44, 36], W, H, 2, [880, 1980], 26);
const ribsP = ribsLayer("ribs-far-p", PSUN, [470, 760, 1080], [46, 38, 32], PW, 1100, 22, [-60, 1140], 22);
const all: Layer[] = [
  bgLayer("vault-glow", W, H, SUN, [1500, 1100, 800, 620], 1), sunL[0]!, ribsD, cityD,
  mistLayer("mist-far", [[1410, 760, 1100, 130, 0.3], [1500, 640, 1000, 110, 0.25]]),
  sunL[1]!, sunL[2]!, sunL[3]!, cliffD, layer("terraces", 9, ...terracesD()),
  poolLayer("light-pool", 1300, 900, 460, 10, [[1088, 800, 902], [1112, 826, 906]]),
  shaftsLayer("shafts", SUN, [-55, -28, 6, 32, 54], 600, 150, 80, [0.28, 0.22, 0.3, 0.2, 0.26]),
  rockNear("rock-near", 12, -60, 2000, [[-60, 975], [300, 962], [700, 980], [1100, 958], [1500, 985], [1980, 960]], 1160, SUN, [980, 1480], 0, 22),
  dustLayer("dust", { x0: 900, y0: 120, x1: 1900, y1: 900 }, 13), gD.gl, gD.gr,
  bgLayer("vault-glow-p", PW, PH, PSUN, [1300, 950, 720, 600], 21), ribsP, cityP,
  mistLayer("mist-far-p", [[540, 900, 1000, 120, 0.28], [540, 770, 900, 110, 0.22]]),
  cliffP, layer("terraces-p", 9, ...terracesP()),
  poolLayer("light-pool-p", 540, 1000, 400, 30, []),
  shaftsLayer("shafts-p", PSUN, [-48, -22, 8, 30, 50], 400, 150, 70, [0.28, 0.22, 0.3, 0.2, 0.26]),
  rockNear("rock-near-p", 32, -60, 1140, [[-60, 1330], [300, 1316], [560, 1340], [860, 1322], [1140, 1336]], 2000, PSUN, [60, 700], 4, 26),
  dustLayer("dust-p", { x0: 150, y0: 150, x1: 950, y1: 960 }, 34), gP.gtL, gP.gbL,
];
// per-band bake table (bible s13): [scale, quality]
const BAKE: Record<string, [number, number]> = {
  "vault-glow": [0.4, 40], "vault-glow-p": [0.4, 40], "sun-halo": [0.4, 40],
  "ribs-far": [0.5, 30], "ribs-far-p": [0.5, 30], "city-far": [0.75, 45], "city-far-p": [0.75, 45],
  "mist-far": [0.4, 35], "mist-far-p": [0.4, 35], "sun-rays-outer": [0.7, 42], "sun-rays-inner": [0.75, 45], "sun-core": [0.7, 45],
  "cliff-city": [0.75, 45], "cliff-city-p": [0.65, 40], terraces: [0.75, 45], "terraces-p": [0.65, 40], "light-pool": [0.5, 40], "light-pool-p": [0.5, 40],
  shafts: [0.4, 35], "shafts-p": [0.4, 35], "rock-near": [0.5, 45], "rock-near-p": [0.5, 42], dust: [0.5, 40], "dust-p": [0.5, 40],
  "gate-l": [0.4, 40], "gate-r": [0.4, 40], "gate-t-p": [0.4, 40], "gate-b-p": [0.4, 40],
};
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
const sunPlace = { x: PSUN[0] - SUN[0] * PS, y: PSUN[1] - SUN[1] * PS, s: PS };
const dIds = ["vault-glow", "sun-halo", "ribs-far", "city-far", "mist-far", "sun-rays-outer", "sun-rays-inner", "sun-core", "cliff-city", "terraces", "light-pool", "shafts", "rock-near", "dust", "gate-l", "gate-r"];
const pIds = ["vault-glow-p", "sun-halo", "ribs-far-p", "city-far-p", "mist-far-p", "sun-rays-outer", "sun-rays-inner", "sun-core", "cliff-city-p", "terraces-p", "light-pool-p", "shafts-p", "rock-near-p", "dust-p", "gate-t-p", "gate-b-p"];
const place: Record<string, typeof sunPlace> = Object.fromEntries(["sun-halo", "sun-rays-outer", "sun-rays-inner", "sun-core"].map((k) => [k, sunPlace]));
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: compose(W, H, dIds), portrait: compose(PW, PH, pIds, place) }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop"); await composite(SLUG, "portrait");

// ---------- checks ----------
const mp = (ids: string[], sc: (id: string) => number) => ids.reduce((n, id) => { const b = baked.get(id)!; return n + (b.w * b.h * sc(id) ** 2) / 1e6; }, 0);
console.log("layers desktop", dIds.length, "portrait", pIds.length);
console.log("bytes total", total, "(KB", Math.round(total / 1024) + ")");
console.log("decoded MP desktop", mp(dIds, (id) => BAKE[id]![0]).toFixed(1), "portrait", mp(pIds, (id) => BAKE[id]![0]).toFixed(1));
console.log("gate-l rest edge x", gD.restL.map(Math.round), "gate-r rest edge x", gD.restR.map(Math.round), "closed min overlap", gD.minOv.toFixed(1));
console.log("gate-t-p rest edge y", gP.restT.map(Math.round), "gate-b-p rest edge y", gP.restB.map(Math.round), "closed min overlap", gP.minOv.toFixed(1));
if (gD.minOv < 80 || gP.minOv < 80) throw new Error("gate closed overlap < 80");
for (const id of ["gate-l", "gate-r", "gate-t-p", "gate-b-p"]) console.log(id, JSON.stringify([...manifest.compositions.desktop.layers, ...manifest.compositions.portrait.layers].find((l) => l.id === id)));
for (const [id, b] of baked) console.log(" ", id.padEnd(16), String(b.bytes).padStart(7));
