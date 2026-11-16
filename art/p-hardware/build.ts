// p-hardware: ember-lit vaults, crystal clusters, chained bridges. Run: npx tsx art/p-hardware/build.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { gateFx } from "../ambient/gatefx.ts";
import {
  ROOT, arch, bakeLayer, bridge, column, composite, crystal, cut, difference, ellipse, fern, glow, layer, lantern, mist, mix, noise, offset,
  rect, rng, roots, ruinWall, scatter, sheet, stairs, tower, union,
  type Frag, type Layer, type Palette, type Poly, type Pt, type Rng, type Shape,
} from "../lib/index.ts";

const SLUG = "p-hardware";
const P: Palette = {
  glow: "#f2a48c", far: "#c86c5c", "far-2": "#a85450", mid: "#87424a", "mid-2": "#66303e", near: "#3c1d2a", "near-dark": "#28121d", gate: "#150910",
  accent: "#ffd2bc", "accent-2": "#e89a86", lamp: "#ffb866", "lamp-core": "#fff1cf", rim: "#ffc8a8", foreshadow: "#34486c", shadow: "#10060b",
};
const W = 1920, H = 1080, PW = 1080, PH = 1920;
const LD: Pt = [620, 600], LP: Pt = [540, 560];
const R = (n: number) => rng(77000 + n);
const cn = (a: string, b: string, t: number) => mix(P[a]!, P[b]!, t);

/* ---------- helpers (band recipe, bible s3) ---------- */
type Band = { off: number; blur: number; op: number; rw: number; rm: number; inner?: [number, number] };
const B = {
  far: { off: 4, blur: 6, op: 0.25, rw: 1.5, rm: 0.35 },
  mid: { off: 8, blur: 10, op: 0.35, rw: 2, rm: 0.45, inner: [4, 0.25] },
  cry: { off: 8, blur: 10, op: 0.4, rw: 2.5, rm: 0.5, inner: [4, 0.25] },
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
const rotRect = (cx: number, cy: number, w: number, h: number, a: number): Poly => {
  const c = Math.cos(a), s = Math.sin(a);
  return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as Pt[]).map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c] as Pt);
};
const interp = (pts: Pt[]) => (x: number) => {
  if (x <= pts[0]![0]) return pts[0]![1];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1]!, b = pts[i]!; if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); }
  return pts[pts.length - 1]![1];
};
type PaperOpts = { holes?: (Poly | Shape)[]; rm?: number; opacity?: number; noRim?: boolean; shadow?: false; noInner?: boolean };
/** One sheet: radial light from `L`, shadow away from it, rim toward it, inner shadow. */
function paper(shape: Poly | Shape, fill: string, b: Band, L: Pt, o: PaperOpts = {}): Frag {
  const bb = bnd(shape);
  let lx = L[0] - (bb.x0 + bb.x1) / 2, ly = L[1] - (bb.y0 + bb.y1) / 2;
  const d = Math.hypot(lx, ly) || 1; lx /= d; ly /= d;
  return sheet(shape, fill, {
    holes: o.holes, opacity: o.opacity,
    shadow: o.shadow === false ? false : { color: P.shadow, blur: b.blur, opacity: b.op, dx: -lx * b.off, dy: -ly * b.off },
    edge: o.noRim ? undefined : { light: [lx, ly], width: b.rw, color: mix(fill, P.rim!, o.rm ?? b.rm) },
    inner: b.inner && !o.noInner ? { blur: b.inner[0], opacity: b.inner[1], color: P.shadow } : undefined,
  });
}
/** Stacked sheets (bible D6): same silhouette, each `inset` smaller, fills[0] outermost. */
function pile(shape: Poly | Shape, fills: string[], inset: number, b: Band, L: Pt, o: PaperOpts = {}): Frag[] {
  const out: Frag[] = [];
  let cur: Shape = union(shape);
  fills.forEach((f, i) => {
    if (!cur.length) return;
    const bb: Band = i ? { ...b, off: b.off * 0.4, blur: b.blur * 0.5, op: b.op * 0.8 } : b;
    out.push(paper(cur, f, bb, L, o));
    cur = offset(cur, -inset);
  });
  return out;
}
const dark = (s: Poly | Shape, fill: string) => sheet(s, fill, { shadow: false });
/** Link chain along a polyline. */
function chain(pts: Pt[], link = 5): Shape {
  const out: Poly[] = []; let carry = 0, k = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1]!, [bx, by] = pts[i]!, d = Math.hypot(bx - ax, by - ay), a = Math.atan2(by - ay, bx - ax);
    let s = carry;
    for (; s < d; s += link * 1.25) { out.push(rotRect(ax + Math.cos(a) * s, ay + Math.sin(a) * s, link, k % 2 ? link * 0.5 : link * 0.85, a)); k++; }
    carry = s - d;
  }
  return union(...out);
}
const sag = (x0: number, y0: number, x1: number, y1: number, s: number, n = 24): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + s * 4 * t * (1 - t)] as Pt; });
function cage(cx: number, top: number, w: number, h: number): { body: Shape; holes: Poly[] } {
  const body = union(rect(cx - w / 2, top, w, h), [[cx - w * 0.35, top - h * 0.12], [cx + w * 0.35, top - h * 0.12], [cx + w / 2, top], [cx - w / 2, top]], ellipse(cx, top - h * 0.2, w * 0.12, h * 0.1, 8));
  const n = 3, sw = w * 0.14, gap = (w - n * sw) / (n + 1);
  return { body, holes: Array.from({ length: n }, (_, i) => rect(cx - w / 2 + gap + i * (sw + gap), top + h * 0.14, sw, h * 0.72)) };
}
/** Spike fringe hanging (dir 1) from y; returns shape and tip points. */
function fringe(r: Rng, x0: number, x1: number, y: number, minL: number, maxL: number, n: number) {
  const parts: Poly[] = [cut(rect(x0, y - 40, x1 - x0, 44), r, 1.5, 40)], tips: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + ((i + r.range(0.1, 0.9)) / n) * (x1 - x0), L = minL + (maxL - minL) * r() ** 1.4, hw = Math.max(6, L * r.range(0.1, 0.2)), tx = x + r.range(-hw, hw) * 0.4;
    parts.push(cut([[x - hw, y - 4], [x - hw * 0.4, y + L * 0.55], [tx, y + L], [x + hw * 0.5, y + L * 0.5], [x + hw, y - 4]], r, 1.2, 40));
    tips.push([tx, y + L]);
  }
  return { shape: union(...parts), tips };
}
function steps(r: Rng, prof: (x: number) => number, x0: number, x1: number, base: number, amp = 8) {
  const pts: Poly = [], st: { a: number; b: number; y: number }[] = [];
  let x = x0;
  while (x < x1) { const b = Math.min(x1, x + r.range(46, 120)), y = prof((x + b) / 2) + r.range(-amp, amp); pts.push([x, y], [b, y]); st.push({ a: x, b, y }); x = b; }
  pts.push([x1, base], [x0, base]);
  return { poly: cut(pts, r, 1.2, 40), top: (xx: number) => (st.find((s) => xx >= s.a && xx <= s.b) ?? st[st.length - 1]!).y };
}

/* ---------- bg ---------- */
type Cfg = { w: number; h: number; L: Pt; sfx: string; card: { x0: number; y0: number } };
function bgLayer(c: Cfg, radii: number[], seed: number): Layer {
  const r = R(seed), fills = [cn("far-2", "far", 0.45), P.far!, cn("far", "glow", 0.5), P.glow!];
  const out: Frag[] = [dark(rect(0, 0, c.w, c.h), P["far-2"]!), ...radii.map((rad, i) => dark(cut(ellipse(c.L[0], c.L[1], rad, rad * 0.9, 96), r, 3, 40), fills[i]!))];
  // calm card side: near-dark with tone-on-tone vault ribs
  const calm = c.sfx === "" ? cut([[c.card.x0, -20], [c.w + 20, -20], [c.w + 20, c.h + 20], [c.card.x0, c.h + 20]], r, 3, 40) : cut([[-20, c.card.y0], [c.w + 20, c.card.y0], [c.w + 20, c.h + 20], [-20, c.h + 20]], r, 3, 40);
  out.push(dark(calm, cn("near-dark", "mid-2", 0.55)));
  const ribs: Poly[] = [];
  for (let i = 0; i < 14; i++) ribs.push(c.sfx === "" ? rect(c.card.x0 + 20 + i * 62, 0, 7, c.h) : rect(0, c.card.y0 + 20 + i * 70, c.w, 7));
  out.push(dark(union(...ribs), cn("near", "mid", 0.5)));
  return layer(`bg${c.sfx}`, 0, ...out);
}

/* ---------- vault-far: three tiers of arches, niches with ember dots, exit arch ---------- */
function vaultFar(c: Cfg, o: { x0: number; x1: number; tiers: { y0: number; y1: number; aw: number; ah: number; gap: number }[]; exit: [number, number, number, number]; seed: number }): Layer {
  const r = R(o.seed), out: Frag[] = [];
  const [ex, ey, ew, eh] = o.exit, exitArch = arch(r, ex, ey + eh / 2, ew, eh, 0.4);
  out.push(dark(exitArch, P.foreshadow!));
  out.push(dark(scatter(r, { x0: ex - ew * 0.4, y0: ey - eh * 0.4, x1: ex + ew * 0.4, y1: ey + eh * 0.1 }, 6, (x, y) => ellipse(x, y, r.range(1.1, 2), r.range(1.1, 2), 6)), P["lamp-core"]!));
  const fills = [P["far-2"]!, cn("far-2", "far", 0.5), P.far!];
  const piers: Pt[] = [];
  o.tiers.forEach((t, i) => {
    const holes: Poly[] = [];
    for (let x = o.x0 + t.gap / 2; x < o.x1; x += t.gap) {
      if (Math.abs(x - ex) < ew / 2 + t.aw && ey > t.y0 - 20 && ey < t.y1 + 20) continue;
      holes.push(arch(r, x, t.y1 - 10, t.aw, t.ah, 0.6));
      piers.push([x + t.gap / 2, r.range(t.y0 + 20, t.y1 - 30)]);
    }
    if (ey > t.y0 && ey < t.y1) holes.push(exitArch);
    const band = difference(cut(rect(o.x0, t.y0, o.x1 - o.x0, t.y1 - t.y0), r, 1.2, 30), ...holes);
    out.push(...pile(band, [fills[i % 3]!, cn(i % 3 === 0 ? "far-2" : "far", "far", 0.3)], 5, B.far, c.L));
  });
  out.push(paper(difference(offset(exitArch, 7), exitArch), P.mid!, B.far, c.L, { rm: 0.4 }));
  const nich: Poly[] = [], dots: Poly[] = [];
  for (const [x, y] of piers.sort(() => r() - 0.5).slice(0, 42)) { const w = r.range(4, 8); nich.push(arch(r, x, y + 8, w, w * 1.8, 0.2)); dots.push(ellipse(x, y + 3, 1.3, 1.3, 6)); }
  out.push(dark(union(...nich), P["mid-2"]!), dark(union(...dots), P.lamp!));
  return layer(`vault-far${c.sfx}`, 1, ...out);
}

/* ---------- bridges-far ---------- */
function bridgesFar(c: Cfg, spans: [number, number, number][], towersAt: [number, number, number][], seed: number): Layer {
  const r = R(seed), bodies: Shape[] = [], holes: Poly[] = [], out: Frag[] = [];
  for (const [x0, x1, y] of spans) {
    bodies.push(bridge(r, x0, x1, y, 7, Math.round((x1 - x0) / 14)));
    for (const f of [0.22, 0.52, 0.8]) { const x = x0 + (x1 - x0) * f; bodies.push(chain(sag(x, -10, x + r.range(-10, 10), y, 0, 10), 3.5)); }
    for (let k = 0; k < 2; k++) { // tiny cages under the deck
      const x = r.range(x0 + 20, x1 - 20), cl = r.range(10, 22), cg = cage(x, y + 14 + cl, r.range(6, 10), r.range(9, 12));
      bodies.push(cg.body, rect(x - 0.8, y + 10, 1.6, cl) as unknown as Shape); holes.push(...cg.holes);
    }
  }
  for (const [x, by, h] of towersAt) { const t = tower(r, x, by, h * 0.38 + 8, h, { windows: 3 }); bodies.push(t.body); holes.push(...t.holes); }
  spans.slice(1).forEach(([x0, , y], i) => bodies.push([stairs(x0 - 18, Math.min(y, spans[i]![2]) - 6, 46, Math.abs(y - spans[i]![2]) + 22, 9, y < spans[i]![2] ? 1 : -1)]));
  out.push(paper(union(...bodies), P.mid!, B.far, c.L, { holes, rm: 0.4 }));
  return layer(`bridges-far${c.sfx}`, 2, ...out);
}
const mistLayer = () => layer("mist-far", 3, mist(550, 560, 1100, 170, P.glow!, 0.22), mist(500, 760, 1000, 150, P.glow!, 0.22), mist(600, 380, 900, 110, P.glow!, 0.17));

/* ---------- stalactites + hanging island ---------- */
function stalactitesLayer(c: Cfg, o: { x0: number; x1: number; tiers: [number, number, number, number, string][]; island: { cx: number; top: number; w: number }; seed: number; lanterns: number }) {
  const r = R(o.seed), out: Frag[] = [], tipsAll: Pt[] = [];
  o.tiers.forEach(([y, a, b2, n, f], i) => {
    const fr = fringe(r, o.x0, o.x1, y, a, b2, n);
    tipsAll.push(...fr.tips);
    out.push(...pile(fr.shape, [P[f]!, cn(f, "far-2", 0.25)], 6, i === 2 ? B.mid : B.mid, c.L));
    const wn: Poly[] = []; for (let k = 0; k < 9; k++) { const x = r.range(o.x0 + 20, o.x1 - 20), w = r.range(4, 9); wn.push(arch(r, x, y - 8 + r.range(-10, 4), w, w * 1.8, 0.3)); }
    out.push(dark(union(...wn), P["near-dark"]!));
  });
  // island hanging by chains, holds c2
  const { cx, top, w } = o.island, pts: Poly = [[cx - w / 2, top]];
  for (let k = 1; k < 8; k++) pts.push([cx - w / 2 + (w * k) / 8, top + r.range(-4, 4)]);
  pts.push([cx + w / 2, top], [cx + w * 0.38, top + 40], [cx + w * 0.2, top + 78], [cx + w * 0.08, top + 150], [cx - w * 0.02, top + 168], [cx - w * 0.15, top + 100], [cx - w * 0.3, top + 62], [cx - w * 0.44, top + 30]);
  const isl = union(cut(pts, r, 1.6, 30));
  const chs = [-0.36, 0.0, 0.36].map((f) => chain(sag(cx + w * f, 0, cx + w * f * 0.8, top + 6, 8, 40), 5));
  out.push(dark(union(...chs), P["near-dark"]!));
  out.push(...pile(isl, [P["mid-2"]!, P.mid!, P["far-2"]!], 9, B.mid, c.L));
  const tw = tower(r, cx - w * 0.3, top + 3, 16, 36, { windows: 2 }), rw = ruinWall(r, cx + w * 0.12, top + 3, 56, 22);
  out.push(paper(union(tw.body, rw.body), P["mid-2"]!, B.mid, c.L, { holes: [...tw.holes, ...rw.holes], rm: 0.4 }));
  const wn: Poly[] = []; for (let k = 0; k < 14; k++) { const x = r.range(cx - w * 0.3, cx + w * 0.3), y = top + r.range(24, 120); if (Math.abs(x - cx) < w * 0.36 - (y - top) * 0.15) wn.push(arch(r, x, y, r.range(4, 7), 9, 0.2)); }
  out.push(dark(union(...wn), P["near-dark"]!));
  // hanging lanterns (warm light has a source shape)
  const lt = tipsAll.filter(([x, y]) => x > o.x0 + 80 && x < o.x1 - 60 && y > 60).sort(() => r() - 0.5).slice(0, o.lanterns);
  const lbody: Shape[] = [], lholes: Poly[] = [], lglow: Frag[] = [];
  for (const [x, y] of lt) { const len = r.range(30, 70), l = lantern(x, y + len + 12, r.range(22, 30)); lbody.push(l.body, chain([[x, y], [x, y + len]], 3.5)); lholes.push(...l.holes); lglow.push(glow(x, y + len + 12, 46, P.lamp!, { opacity: 0.5, core: P["lamp-core"]! })); }
  out.push(...lglow, paper(union(...lbody), P["near-dark"]!, B.far, c.L, { holes: lholes, rm: 0.3 }));
  return { layer: layer(`stalactites${c.sfx}`, 4, ...out), tips: tipsAll };
}

/* ---------- pillars + mounds ---------- */
function pillarsMid(c: Cfg, ps: { x: number; w: number; y0: number; y1: number }[], mounds: { x0: number; x1: number; base: number; y1: number }[], seed: number): Layer {
  const out: Frag[] = [];
  const fillsP = [P["mid-2"]!, P.mid!, P["far-2"]!];
  ps.forEach((p, i) => {
    const r = R(seed + i), body = union(cut([[p.x - p.w / 2, p.y0], [p.x + p.w / 2, p.y0], [p.x + p.w / 2 + 8, p.y1], [p.x - p.w / 2 - 8, p.y1]], r, 2, 40));
    out.push(...pile(body, fillsP, 9, B.mid, c.L));
    const inner = offset(body, -18);
    for (let y = p.y0 + 40; y < p.y1 - 20; y += r.range(60, 110)) {
      const f = r.pick([P["mid-2"]!, P.far!, P["far-2"]!, P.mid!]);
      out.push(sheet(inter(cut(rect(p.x - p.w, y, p.w * 2, r.range(7, 20)), r, 1.6, 30), inner), f, { shadow: { dx: 0, dy: 4, blur: 5, opacity: 0.25, color: P.shadow }, edge: { light: [0, -1], width: 1.3, color: mix(f, P.rim!, 0.3) } }));
    }
    const dir = i % 2 ? -1 : 1;
    for (let k = 0; k < 2; k++) {
      const sy = p.y0 + 140 + k * 300 + r.range(0, 80), sw = Math.min(p.w * 0.6, 56);
      out.push(paper(stairs(p.x - sw / 2, sy, sw, 110, 15, k % 2 ? dir : (-dir as 1 | -1)), P["near"]!, B.mid, c.L, { rm: 0.3 }));
    }
    const nn: Poly[] = []; for (let k = 0; k < 12; k++) nn.push(arch(r, p.x + r.range(-p.w * 0.35, p.w * 0.35), p.y0 + r.range(60, p.y1 - p.y0 - 40), r.range(5, 9), 14, 0.2));
    out.push(dark(union(...nn), P["near-dark"]!));
    const wr: Shape[] = [];
    for (let k = 0; k < 3; k++) { const ya = p.y0 + 110 + k * 230 + r.range(-20, 30); wr.push(chain(sag(p.x - p.w / 2 - 7, ya, p.x + p.w / 2 + 7, ya + 55, 14, 14), 5.5)); wr.push(chain(sag(p.x + p.w / 2 + 7, ya + 62, p.x - p.w / 2 - 7, ya + 112, 14, 14), 5.5)); }
    out.push(paper(union(...wr), P["near-dark"]!, B.far, c.L, { rm: 0.3 }));
  });
  mounds.forEach((m, i) => {
    const r = R(seed + 20 + i), cx = (m.x0 + m.x1) / 2, pts: Poly = [[m.x0, m.y1]];
    for (let k = 0; k <= 8; k++) { const t = k / 8, x = m.x0 + (m.x1 - m.x0) * t, hgt = Math.sin(Math.PI * t) ** 0.5; pts.push([x, m.base + 70 * (1 - hgt) + (k === 4 ? 0 : r.range(0, 14))]); }
    pts.push([m.x1, m.y1]);
    const mo = union(cut(pts, r, 2, 34));
    out.push(...pile(mo, fillsP, 10, B.mid, c.L));
    const inner = offset(mo, -20);
    for (let y = m.base + 50; y < m.y1; y += r.range(44, 70)) { const f = r.pick([P["mid-2"]!, P["far-2"]!, P.mid!]); out.push(sheet(inter(cut(rect(m.x0, y, m.x1 - m.x0, r.range(7, 16)), r, 1.5, 30), inner), f, { shadow: { dx: 0, dy: 4, blur: 5, opacity: 0.25, color: P.shadow }, edge: { light: [0, -1], width: 1.3, color: mix(f, P.rim!, 0.3) } })); }
    const wn: Poly[] = []; for (let k = 0; k < 14; k++) wn.push(arch(r, r.range(m.x0 + 30, m.x1 - 30), m.base + r.range(70, m.y1 - m.base - 30), r.range(5, 9), 14, 0.2));
    out.push(dark(union(...wn), P["near-dark"]!));
    const rw = ruinWall(r, cx - 24, m.base + 40, 48, 26); out.push(paper(union(rw.body), P["mid-2"]!, B.mid, c.L, { holes: rw.holes, rm: 0.4 }));
  });
  return layer(`pillars-mid${c.sfx}`, 5, ...out);
}

/* ---------- bridge-mid ---------- */
function bridgeMid(c: Cfg, o: { x0: number; x1: number; ey: number; my: number; towers: number[]; seed: number }) {
  const r = R(o.seed), out: Frag[] = [];
  const deckY = (x: number) => { const t = (x - o.x0) / (o.x1 - o.x0); return o.ey + (o.my - o.ey) * 4 * t * (1 - t); };
  const top: Pt[] = [], bot: Pt[] = [];
  for (let x = o.x0; x <= o.x1 + 1; x += 20) { top.push([x, deckY(x) + r.range(-0.8, 0.8)]); bot.push([x, deckY(x) + 16]); }
  const deck = union([...top, ...bot.reverse()]);
  const posts: Poly[] = []; for (let x = o.x0 + 6; x < o.x1; x += 26) posts.push(rect(x, deckY(x) - 12, 4.5, 12));
  const rail = union([...top.map(([x, y]) => [x, y - 12] as Pt), ...top.map(([x, y]) => [x, y - 9] as Pt).reverse()]);
  const ts = o.towers.map((x) => ({ x, t: tower(r, x, deckY(x) + 12, 58, 175, { windows: 4 }) }));
  out.push(...pile(deck, [P["mid-2"]!, P.mid!, P["far-2"]!], 3.4, B.mid, c.L));
  const slits: Poly[] = []; for (let x = o.x0 + 4; x < o.x1; x += 11 + r.range(-1, 1)) slits.push(rect(x, deckY(x) + 4.5, r.range(4, 6), 7));
  out.push(dark(union(...slits), P["near-dark"]!));
  out.push(paper(union(rail, ...posts), P["mid-2"]!, B.mid, c.L, { rm: 0.4 }));
  const tx0 = o.towers[0]!, tx1 = o.towers[o.towers.length - 1]!, ty = (x: number) => deckY(x) + 12 - 175 + 30;
  const cab = sag(tx0, ty(tx0), tx1, ty(tx1), 125, 60), cabAt = (x: number) => interp(cab)(x);
  const hang: Shape[] = [chain(cab, 6), chain(cab.map(([x, y]) => [x, y + 7] as Pt), 4)];
  for (let x = tx0 + 40; x < tx1 - 20; x += 44) hang.push(rect(x, cabAt(x), 2.6, deckY(x) - 12 - cabAt(x)) as unknown as Shape);
  const wx = [o.x0 + (o.x1 - o.x0) * 0.2, o.x0 + (o.x1 - o.x0) * 0.8, o.x0 + (o.x1 - o.x0) * 0.5], wh: Shape[] = [], wholes: Poly[] = [];
  wx.forEach((x, i) => {
    const y0 = deckY(x) + 16, len = i === 2 ? 22 : 50 + r.range(0, 14), cg = i === 2 ? cage(x, y0 + len + 8, 30, 40) : { body: union(rect(x - 14, y0 + len, 28, 42)), holes: [rect(x - 9, y0 + len + 8, 4, 26), rect(x + 5, y0 + len + 8, 4, 26)] };
    wh.push(cg.body, chain([[x, y0], [x, y0 + len + 8]], 5.5)); wholes.push(...cg.holes);
  });
  out.push(paper(union(...hang), P["near-dark"]!, B.far, c.L, { rm: 0.3 }), paper(union(...wh), P["mid-2"]!, B.mid, c.L, { holes: wholes, rm: 0.45 }));
  out.push(...ts.flatMap((q) => pile(q.t.body, [P["mid-2"]!, P.mid!], 5, B.mid, c.L)));
  out.push(dark(union(...ts.flatMap((q) => q.t.holes)), P["lamp"]!), dark(union(...ts.flatMap((q) => q.t.holes.map((h) => offset(h, -1.2)))), P["lamp-core"]!));
  return { layer: layer(`bridge-mid${c.sfx}`, 6, ...out), deckY };
}

/* ---------- crystals (hero) ---------- */
type Cl = { x: number; by: number; h: number };
const rotPts = (pts: Pt[], bx: number, by: number, a: number): Poly => pts.map(([x, y]) => [bx + x * Math.cos(a) - y * Math.sin(a), by + x * Math.sin(a) + y * Math.cos(a)] as Pt);
function cluster(r: Rng, cl: Cl, L: Pt): Frag[] {
  const n = r.int(5, 9), out: Frag[] = [];
  const items = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n - 0.5, Ln = cl.h * (1 - Math.abs(t) * 0.85) * r.range(0.72, 1), w = Math.max(18, Math.min(46, Ln * r.range(0.17, 0.24)));
    return { t, Ln, w, ang: t * 1.1 + r.range(-0.07, 0.07), tip: r.range(-0.15, 0.15) * w, bx: cl.x + t * cl.h * 0.6 };
  }).sort((a, b) => Math.abs(b.t) - Math.abs(a.t));
  for (const p of items) {
    const { Ln, w, tip } = p, a = p.ang, by = cl.by + 4;
    const full = rotPts([[-w / 2, 0], [-w / 2, -Ln * 0.78], [tip, -Ln], [w / 2, -Ln * 0.78], [w / 2, 0]], p.bx, by, a);
    const lit = p.bx < L[0];
    const face = rotPts(lit ? [[0, 0], [tip, -Ln], [w / 2, -Ln * 0.78], [w / 2, 0]] : [[-w / 2, 0], [-w / 2, -Ln * 0.78], [tip, -Ln], [0, 0]], p.bx, by, a);
    const slit = w >= 22 ? [rotPts([[-1.6, -Ln * 0.3], [1.6, -Ln * 0.3], [1.6 + tip * 0.1, -Ln * 0.62], [-1.6 + tip * 0.1, -Ln * 0.62]], p.bx, by, a)] : [];
    out.push(...pile(difference(full, ...slit), [P["accent-2"]!, P.accent!, P.rim!], 5, B.cry, L));
    out.push(sheet(face, lit ? P.rim! : P["accent-2"]!, { shadow: false, opacity: lit ? 0.42 : 0.4 }));
  }
  return out;
}
type Shard = { x: number; y: number; h: number; flip?: boolean };
function crystalLayers(c: Cfg, cls: Cl[], shards: Shard[], seed: number, glowR: number[]) {
  const r = R(seed), body: Frag[] = [];
  cls.forEach((cl) => body.push(...cluster(r, cl, c.L)));
  const sh = shards.map((s) => { const q = crystal(r, s.x, s.y, s.h); return s.flip ? q.map((ring) => ring.map(([x, y]) => [x, 2 * s.y - y] as Pt)) : q; });
  const shAll = union(...sh);
  body.push(paper(shAll, P["accent-2"]!, { off: 5, blur: 6, op: 0.35, rw: 1.5, rm: 0.5 }, c.L), dark(offset(shAll, -2.2), P.accent!));
  const near = (s: Shard) => cls.reduce((bi, cl, i) => (Math.hypot(cl.x - s.x, cl.by - cl.h / 2 - s.y) < Math.hypot(cls[bi]!.x - s.x, cls[bi]!.by - cls[bi]!.h / 2 - s.y) ? i : bi), 0);
  const pulses = cls.map((cl, i) => layer(`pulse-${i + 1}${c.sfx}`, 8 + i,
    glow(cl.x, cl.by - cl.h * 0.45, glowR[i]!, P.lamp!, { opacity: 0.5, core: P.accent! }),
    ...shards.filter((s) => near(s) === i).map((s) => glow(s.x, s.y - (s.flip ? -1 : 1) * s.h * 0.4, 38, P.lamp!, { opacity: 0.5, core: P.accent! }))));
  return { crystals: layer(`crystals${c.sfx}`, 7, ...body), pulses };
}

/* ---------- card wall (calm: C tokens only, tone-on-tone) ---------- */
function cardWall(c: Cfg, o: { x0: number; y0: number; x1: number; y1: number; edge: "left" | "top"; rows: number; seed: number; cage: [number, number]; stairsAt: [number, number][]; stubs: number; chainFrom: number }): Layer {
  const r = R(o.seed), n2 = noise(o.seed), out: Frag[] = [], pts: Poly = [];
  if (o.edge === "left") { for (let y = o.y0; y <= o.y1; y += 30) pts.push([o.x0 + n2(y / 90, 1) * 20 + r.range(-4, 4), y]); } else { for (let x = o.x0; x <= o.x1; x += 30) pts.push([x, o.y0 + n2(x / 90, 1) * 16 + r.range(-4, 4)]); }
  const wall: Poly = o.edge === "left" ? [...pts, [o.x1, o.y1], [o.x1, o.y0]] : [...pts, [o.x1, o.y1], [o.x0, o.y1]];
  out.push(paper(wall, P["near-dark"]!, B.near, c.L, { rm: 0.25 }));
  const rowH = (o.edge === "left" ? o.y1 - o.y0 : o.y1 - o.y0) / o.rows, rowFill = [P.near!, P["mid-2"]!, cn("near", "mid-2", 0.5)];
  const rowTops: number[] = [], faces: Poly[] = [], recess: Poly[] = [];
  for (let i = 0; i < o.rows; i++) {
    const yT = o.y0 + i * rowH + (o.edge === "top" ? 30 : 0), aw = 46 - i * 3, ah = rowH * 0.58, gap = aw * 2.1, holes: Poly[] = [];
    rowTops.push(yT);
    for (let x = o.x0 + 20 + (i % 2) * gap * 0.5; x < o.x1 + 40; x += gap) { holes.push(arch(r, x, yT + rowH - 14, aw, ah, 0.6)); recess.push(arch(r, x, yT + rowH - 14, aw * 0.5, ah * 0.6, 0.4)); }
    const strip = inter(cut(rect(o.x0 - 40, yT, o.x1 - o.x0 + 80, rowH - 4), r, 1.4, 34), wall);
    out.push(paper(difference(strip, ...holes), rowFill[i % 3]!, B.mid, c.L, { rm: 0.25 }));
    if (i < o.rows - 1) for (let k = 0; k < 7; k++) faces.push(arch(r, r.range(o.x0 + 30, o.x1 - 30), yT + rowH * r.range(0.25, 0.5), r.range(6, 11), r.range(12, 20), 0.2));
  }
  out.push(dark(inter(union(...recess), wall), P.gate!));
  const nich: Poly[] = []; for (let k = 0; k < 40; k++) { const x = r.range(o.x0 + 30, o.x1 - 30), y = r.range(o.y0 + 40, o.y1 - 40); nich.push(arch(r, x, y, r.range(5, 8), r.range(10, 15), 0.2)); }
  out.push(dark(inter(union(...nich, ...faces), wall), P.gate!));
  for (const [sx, sy] of o.stairsAt) out.push(paper(stairs(sx, sy, 190, 96, 18, sx % 2 ? 1 : -1), P["mid-2"]!, B.mid, c.L, { rm: 0.25 }));
  const hang: Shape[] = [];
  for (let k = 0; k < 14; k++) { const i = r.int(0, o.rows - 2), x = r.range(o.x0 + 40, o.x1 - 40), y = rowTops[i]! + 8; hang.push(chain([[x, y], [x + r.range(-6, 6), y + r.range(70, 190)]], 6)); }
  const cgS = cage(o.cage[0], o.cage[1], 56, 76);
  hang.push(chain([[o.cage[0], o.chainFrom], [o.cage[0], o.cage[1] - 10]], 6));
  out.push(paper(union(...hang), P.gate!, B.far, c.L, { rm: 0.25 }), paper(cgS.body, P["mid-2"]!, B.mid, c.L, { holes: cgS.holes, rm: 0.25 }));
  if (o.stubs) {
    const st = scatter(r, { x0: o.x0 + 30, y0: o.y0 + 70, x1: o.x1 - 30, y1: o.y1 - 160 }, o.stubs, (x, y) => crystal(r, x, y, r.range(30, 70)), 90);
    out.push(paper(st, P["mid-2"]!, B.mid, c.L, { rm: 0.25 }), dark(offset(st, -3), P.near!));
  }
  return layer(`card-wall${c.sfx}`, 11, ...out);
}

/* ---------- near ledge ---------- */
function ledgeNear(c: Cfg, o: { x0: number; x1: number; prof: Pt[]; base: number; seed: number; stubs: number; chainPosts: [number, number] }): Layer {
  const r = R(o.seed), out: Frag[] = [], pr = interp(o.prof), t = steps(r, pr, o.x0, o.x1, o.base, 7);
  out.push(...pile(t.poly, [P["near-dark"]!, P.near!, cn("near", "mid-2", 0.5)], 11, B.near, c.L, { rm: 0.35 }));
  const inner = offset(t.poly, -22);
  for (let b = 0; b < 2; b++) {
    const bt = steps(r, (x) => pr(x) + 30 + b * 44, o.x0, o.x1, o.base + 40, 6), f = [P["mid-2"]!, P.near!][b]!;
    out.push(sheet(inter(bt.poly, inner), f, { shadow: { dx: 0, dy: 6, blur: 8, opacity: 0.3, color: P.shadow }, edge: { light: [0, -1], width: 1.5, color: mix(f, P.rim!, 0.3) } }));
  }
  const wn: Poly[] = []; for (let i = 0; i < 40; i++) { const x = r.range(o.x0 + 20, o.x1 - 20), w = r.range(5, 9); wn.push(arch(r, x, pr(x) + r.range(34, 90), w, w * 1.7, 0.3)); }
  out.push(dark(union(...wn), P["near-dark"]!));
  out.push(dark(scatter(r, { x0: o.x0 + 10, y0: pr(o.x0 + 300) + 20, x1: o.x1 - 10, y1: o.base - 14 }, 60, (x, y) => cut(rect(x, y, r.range(6, 20), r.range(4, 9)), r, 1, 8)), P["mid-2"]!));
  const fr: Shape[] = [], st: Shape[] = [];
  for (let i = 0; i < 12; i++) { const x = r.range(o.x0 + 20, o.x1 - 40); fr.push(roots(r, x, t.top(x) + 6, 24, r.range(40, 90), 4, 1)); }
  for (let i = 0; i < 16; i++) { const x = r.range(o.x0 + 20, o.x1 - 20); fr.push(fern(r, x, t.top(x) + 3, r.range(24, 50), r.range(-0.6, 0.6))); }
  for (let i = 0; i < o.stubs; i++) { const x = r.range(o.x0 + 30, o.x1 - 60); st.push(crystal(r, x, t.top(x) + 6, r.range(34, 80))); }
  out.push(dark(union(...fr), P["near-dark"]!));
  out.push(paper(union(...st), P["mid-2"]!, B.mid, c.L, { rm: 0.3 }), dark(offset(union(...st), -3), P.mid!));
  const rw = Array.from({ length: 3 }, () => { const x = r.range(o.x0 + 40, o.x1 - 220); return ruinWall(r, x, t.top(x + 60) + 2, r.range(90, 170), r.range(26, 44)); });
  out.push(paper(union(...rw.map((q) => q.body)), P["near-dark"]!, B.mid, c.L, { holes: rw.flatMap((q) => q.holes), rm: 0.3 }));
  const posts: Poly[] = [], ch: Shape[] = [];
  for (let x = o.chainPosts[0]; x < o.chainPosts[1]; x += 150) { posts.push(rect(x, t.top(x) - 38, 8, 40), rect(x - 3, t.top(x) - 42, 14, 6)); ch.push(chain(sag(x + 4, t.top(x) - 34, x + 154, t.top(x + 150) - 34, 20, 8), 5)); }
  out.push(paper(union(...posts, ...ch), P["near-dark"]!, B.far, c.L, { rm: 0.3 }));
  return layer(`ledge-near${c.sfx}`, 12, ...out);
}
const embers = (c: Cfg, n: number, region: { x0: number; y0: number; x1: number; y1: number }, seed: number) => {
  const r = R(seed);
  return layer(`embers${c.sfx}`, 13, ...([0.3, 0.55, 0.8] as number[]).map((op) => sheet(scatter(r, region, Math.round(n / 3), (x, y) => ellipse(x, y, r.range(0.75, 1.5), r.range(0.75, 1.5), 6), 8), P.accent!, { shadow: false, opacity: op })));
};

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
/** Vertical-sweep gate. Edges share one profile (left = lo..lo+span, right = left + off) so the closed overlap is 2*shift - off - jitter. */
function gates(c: { w: number; u0: number; u1: number; lo: number; span: number; off: number; shift: number; bleed: [number, number]; seed: number; L: Pt; rmL: number; rmR: number }) {
  const segs = phaseSegs(R(c.seed), c.u0, c.u1, 100, 190), xl = (p: number) => c.lo + c.span * p, xr = (p: number) => xl(p) + c.off;
  const pl = edgePts(R(c.seed + 1), segs, xl), pr = edgePts(R(c.seed + 2), segs, xr);
  const polyL: Poly = [[c.bleed[0], c.u0], ...pl, [c.bleed[0], c.u1]], polyR: Poly = [[c.bleed[1], c.u0], ...pr, [c.bleed[1], c.u1]];
  const detail = (right: boolean, pts: Pt[], rr: Rng) => {
    const nx = right ? -1 : 1, out: Shape[] = [];
    for (let i = 0; i < pts.length; i += 2) {
      const [v, u] = pts[i]!, t = rr();
      if (!right && t < 0.45) { const L = rr.range(30, 90), hw = rr.range(8, 17); out.push([[[v - 6, u - hw], [v + L, u + rr.range(-5, 8)], [v - 6, u + hw]]][0]! as unknown as Shape); }
      else if (right && t < 0.4) out.push([rect(v - 24, u - 8, 28, rr.range(12, 22))]);
      if (t > 0.35 && t < 0.8) out.push(chain([[v + nx * 4, u + 4], [v + nx * 4 + rr.range(-5, 5), u + rr.range(50, 150)]], 6));
      else if (t >= 0.8) out.push(roots(rr, v + nx * 6, u, 14, rr.range(40, 100), 3, 1));
    }
    return union(polyOf(right), ...out);
  };
  const polyOf = (right: boolean) => (right ? polyR : polyL);
  const fills = [P.near!, P["near-dark"]!, P.gate!];
  const fxo = (xa: number, xb: number, sd: number) => ({ xa, xb, H: c.u1, portrait: c.w < 1500, seed: sd, motif: "diamond" as const, light: "#f2a48c", core: "#ffe6d4", rim: "#ffc8a8", tint: "#c86c5c",
    tones: [cn("near", "mid-2", 0.7), cn("mid-2", "mid", 0.5), cn("near", "mid", 0.5), cn("mid", "far-2", 0.3)] });
  const fL = gateFx(polyL, fxo(-c.shift - 40, Math.max(...pl.map((q) => q[0])) - 90, c.seed + 7));
  const fR = gateFx(polyR, fxo(Math.min(...pr.map((q) => q[0])) + 90, c.w + c.shift + 40, c.seed + 8));
  const gl = layer(c.w > 1500 ? "gate-l" : "gate-l-p", 14, ...fL.under, ...pile(detail(false, pl, R(c.seed + 3)), fills, 16, B.gate, c.L, { rm: c.rmL, holes: [fL.holes] }), ...fL.mid, ...fL.over);
  const gr = layer(c.w > 1500 ? "gate-r" : "gate-r-p", 15, ...fR.under, ...pile(detail(true, pr, R(c.seed + 4)), fills, 16, B.gate, c.L, { rm: c.rmR, holes: [fR.holes] }), ...fR.mid, ...fR.over);
  // closed state numeric check: scanline overlap between gate-l edge + shift and gate-r edge - shift (min over every 0.5 px)
  const maxX = (poly: Poly, y: number) => { let m = -1e9; for (let i = 0; i < poly.length; i++) { const a = poly[i]!, b = poly[(i + 1) % poly.length]!; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) m = Math.max(m, a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1])); } return m; };
  const minX = (poly: Poly, y: number) => { let m = 1e9; for (let i = 0; i < poly.length; i++) { const a = poly[i]!, b = poly[(i + 1) % poly.length]!; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) m = Math.min(m, a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1])); } return m; };
  let minOv = 1e9;
  for (let y = c.u0 + 1; y < c.u1 - 1; y += 0.5) minOv = Math.min(minOv, maxX(polyL, y + 0.25) + c.shift - (minX(polyR, y + 0.25) - c.shift));
  return { gl, gr, minOv, restL: [Math.min(...pl.map((p) => p[0])), Math.max(...pl.map((p) => p[0]))], restR: [Math.min(...pr.map((p) => p[0])), Math.max(...pr.map((p) => p[0]))] };
}

/* ============================ desktop ============================ */
const D: Cfg = { w: W, h: H, L: LD, sfx: "", card: { x0: 1152, y0: 0 } };
const dClusters: Cl[] = [{ x: 300, by: 760, h: 260 }, { x: 640, by: 420, h: 180 }, { x: 900, by: 820, h: 220 }];
const dVault = vaultFar(D, { x0: -60, x1: 1200, seed: 2, exit: [760, 640, 70, 110],
  tiers: [{ y0: 0, y1: 340, aw: 36, ah: 80, gap: 70 }, { y0: 330, y1: 590, aw: 26, ah: 52, gap: 50 }, { y0: 580, y1: 980, aw: 16, ah: 34, gap: 36 }] });
const dBridgesFar = bridgesFar(D, [[-30, 380, 420], [350, 730, 330], [700, 1110, 250]], [[372, 438, 52], [716, 340, 44]], 3);
const dSt = stalactitesLayer(D, { x0: -80, x1: 1180, seed: 4, lanterns: 6, island: { cx: 640, top: 424, w: 270 }, tiers: [[20, 60, 300, 12, "far-2"], [8, 40, 210, 16, "mid"], [0, 24, 130, 22, "mid-2"]] });
const dPillars = pillarsMid(D, [{ x: 120, w: 110, y0: -40, y1: 1000 }, { x: 470, w: 90, y0: 160, y1: 1000 }, { x: 1060, w: 130, y0: 40, y1: 1000 }],
  [{ x0: 170, x1: 440, base: 760, y1: 1000 }, { x0: 750, x1: 1030, base: 820, y1: 1000 }], 5);
const dBr = bridgeMid(D, { x0: -100, x1: 1150, ey: 575, my: 628, towers: [30, 1090], seed: 6 });
const dShards: Shard[] = [
  { x: 190, y: 766, h: 28 }, { x: 410, y: 768, h: 34 }, { x: 790, y: 826, h: 30 }, { x: 1000, y: 828, h: 38 }, { x: 560, y: 428, h: 26 }, { x: 724, y: 428, h: 30 },
  ...[170, 320, 780, 940].map((x) => ({ x, y: dBr.deckY(x) - 12, h: 24 })), { x: 500, y: 600, h: 22 }, { x: 1085, y: 560, h: 26 },
  ...dSt.tips.filter(([x, y]) => x > 60 && x < 1060 && y > 90 && y < 330).slice(0, 8).map(([x, y]) => ({ x, y: y - 6, h: r2(x) * 8 + 20, flip: true })),
];
function r2(x: number) { return ((x * 7) % 5) / 5; }
const dCry = crystalLayers(D, dClusters, dShards, 7, [300, 240, 280]);
const dCard = cardWall(D, { x0: 1100, y0: -40, x1: 2010, y1: 1120, edge: "left", rows: 6, seed: 11, cage: [1420, 520], chainFrom: 150, stairsAt: [[1300, 305], [1700, 697]], stubs: 0 });
const dLedge = ledgeNear(D, { x0: -60, x1: 1170, prof: [[-60, 972], [300, 962], [700, 976], [1170, 958]], base: 1140, seed: 12, stubs: 7, chainPosts: [100, 1000] });
const dEmb = embers(D, 140, { x0: 0, y0: 100, x1: 1100, y1: 950 }, 13);
const gD = gates({ w: W, u0: -60, u1: 1140, lo: 150, span: 120, off: 1285, shift: 700, bleed: [-800, 2720], seed: 14, L: LD, rmL: 0.5, rmR: 0.25 });

/* ============================ portrait ============================ */
const Pc: Cfg = { w: PW, h: PH, L: LP, sfx: "-p", card: { x0: 0, y0: 864 } };
const pClusters: Cl[] = [{ x: 240, by: 700, h: 200 }, { x: 560, by: 340, h: 160 }, { x: 840, by: 640, h: 200 }];
const pVault = vaultFar(Pc, { x0: -40, x1: 1120, seed: 22, exit: [560, 600, 60, 90],
  tiers: [{ y0: 0, y1: 270, aw: 32, ah: 70, gap: 62 }, { y0: 260, y1: 520, aw: 24, ah: 50, gap: 46 }, { y0: 510, y1: 900, aw: 16, ah: 32, gap: 34 }] });
const pBridgesFar = bridgesFar(Pc, [[-30, 380, 340], [350, 730, 250], [700, 1110, 170]], [[372, 358, 46], [716, 268, 40]], 23);
const pSt = stalactitesLayer(Pc, { x0: -60, x1: 1140, seed: 24, lanterns: 4, island: { cx: 560, top: 344, w: 240 }, tiers: [[16, 50, 260, 11, "far-2"], [6, 36, 190, 14, "mid"], [0, 20, 110, 20, "mid-2"]] });
const pPillars = pillarsMid(Pc, [{ x: 60, w: 100, y0: -40, y1: 900 }, { x: 1020, w: 90, y0: 60, y1: 900 }],
  [{ x0: 110, x1: 370, base: 700, y1: 900 }, { x0: 710, x1: 970, base: 640, y1: 900 }], 25);
const pBr = bridgeMid(Pc, { x0: -80, x1: 1160, ey: 495, my: 545, towers: [30, 1050], seed: 26 });
const pShards: Shard[] = [
  { x: 150, y: 706, h: 26 }, { x: 330, y: 706, h: 30 }, { x: 760, y: 646, h: 28 }, { x: 930, y: 646, h: 30 }, { x: 480, y: 348, h: 22 }, { x: 640, y: 348, h: 26 },
  ...[200, 400, 700, 900].map((x) => ({ x, y: pBr.deckY(x) - 12, h: 22 })),
  ...pSt.tips.filter(([x, y]) => x > 60 && x < 1020 && y > 80 && y < 250).slice(0, 8).map(([x, y]) => ({ x, y: y - 6, h: r2(x) * 8 + 18, flip: true })),
];
const pCry = crystalLayers(Pc, pClusters, pShards, 27, [260, 220, 260]);
const pCard = cardWall(Pc, { x0: -60, y0: 866, x1: 1140, y1: 2040, edge: "top", rows: 6, seed: 28, cage: [820, 1130], chainFrom: 900, stairsAt: [[200, 1195], [640, 1580]], stubs: 9 });
const pLedge = ledgeNear(Pc, { x0: -60, x1: 1140, prof: [[-60, 800], [300, 788], [700, 804], [1140, 794]], base: 890, seed: 29, stubs: 5, chainPosts: [60, 900] });
const pEmb = embers(Pc, 110, { x0: 0, y0: 40, x1: 1080, y1: 830 }, 30);
const gP = gates({ w: PW, u0: -60, u1: 1980, lo: 110, span: 90, off: 760, shift: 460, bleed: [-560, 1640], seed: 31, L: LP, rmL: 0.4, rmR: 0.3 });

/* ============================ bake ============================ */
const dBg = bgLayer(D, [820, 600, 380, 200], 1), pBg = bgLayer(Pc, [760, 540, 340, 180], 21);
const mistL = mistLayer();
const dAll: Layer[] = [dBg, dVault, dBridgesFar, mistL, dSt.layer, dPillars, dBr.layer, dCry.crystals, ...dCry.pulses, dCard, dLedge, dEmb, gD.gl, gD.gr];
const pAll: Layer[] = [pBg, pVault, pBridgesFar, pSt.layer, pPillars, pBr.layer, pCry.crystals, ...pCry.pulses, pCard, pLedge, pEmb, gP.gl, gP.gr];
const BAKE: Record<string, [number, number]> = {
  bg: [0.35, 40], "bg-p": [0.35, 40], "vault-far": [0.6, 42], "vault-far-p": [0.6, 42], "bridges-far": [0.6, 42], "bridges-far-p": [0.6, 42], "mist-far": [0.4, 35],
  stalactites: [0.55, 42], "stalactites-p": [0.55, 42], "pillars-mid": [0.5, 42], "pillars-mid-p": [0.5, 42], "bridge-mid": [0.55, 42], "bridge-mid-p": [0.55, 42],
  crystals: [0.65, 45], "crystals-p": [0.65, 45], "card-wall": [0.5, 40], "card-wall-p": [0.5, 40], "ledge-near": [0.5, 42], "ledge-near-p": [0.5, 42],
  embers: [0.5, 40], "embers-p": [0.5, 40], "gate-l": [0.4, 40], "gate-r": [0.4, 40], "gate-l-p": [0.4, 40], "gate-r-p": [0.4, 40],
};
for (let i = 1; i <= 3; i++) { BAKE[`pulse-${i}`] = [0.5, 45]; BAKE[`pulse-${i}-p`] = [0.5, 45]; }
const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
for (const l of [...dAll, ...pAll.filter((l) => l.id !== "mist-far")]) {
  const [scale, quality] = BAKE[l.id] ?? [0.5, 42];
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
const dIds = dAll.map((l) => l.id), pIds = pAll.map((l) => l.id);
const total = [...baked.values()].reduce((n, b) => n + b.bytes, 0);
const manifest = { slug: SLUG, compositions: { desktop: compose(W, H, dIds), portrait: compose(PW, PH, pIds, { "mist-far": { x: 210, y: -120, s: 0.6 } }) }, bytes: total };
writeFileSync(join(ROOT, "public/art", SLUG, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await composite(SLUG, "desktop"); await composite(SLUG, "portrait");

console.log("layers desktop", dIds.length, dIds.join(" "));
console.log("layers portrait", pIds.length, pIds.join(" "));
console.log("bytes total", total, "(KB", Math.round(total / 1024) + ")");
console.log("gate-l rest edge x", gD.restL.map(Math.round), "gate-r rest edge x", gD.restR.map(Math.round), "closed min overlap", gD.minOv.toFixed(1));
console.log("gate-l-p rest edge x", gP.restL.map(Math.round), "gate-r-p rest edge x", gP.restR.map(Math.round), "closed min overlap", gP.minOv.toFixed(1));
if (gD.minOv < 80 || gP.minOv < 80) throw new Error("gate closed overlap < 80");
for (const [id, b] of baked) console.log(" ", id.padEnd(16), String(b.bytes).padStart(7), `${Math.round(b.w)}x${Math.round(b.h)} @${Math.round(b.x)},${Math.round(b.y)}`);
