// Internals: rng, noise, polygon builders, booleans, sheet(), glow(). Public surface is documented in index.ts.
import { FillRule, JoinType, EndType, type PathD, type PathsD, unionD, differenceD, inflatePathsD, areaD } from "clipper2-ts";
import { createNoise2D } from "simplex-noise";

export type Pt = [number, number];
/** One closed ring. */
export type Poly = Pt[];
/** Polygon set; rings may be holes (even-odd/nonzero consistent, as produced by union/difference). */
export type Shape = Poly[];
/** Named hex tokens, supplied by the caller (the art bible). */
export type Palette = Record<string, string>;
/** SVG markup in design coordinates plus its bounding box (includes shadow/glow spread). */
export type Frag = { svg: string; x0: number; y0: number; x1: number; y1: number };

/* ---------- rng / noise ---------- */
export type Rng = {
  (): number;
  range: (a: number, b: number) => number;
  int: (a: number, b: number) => number;
  pick: <T>(xs: readonly T[]) => T;
  /** Multiplier in [1-k, 1+k], default k = 0.1. */
  vary: (k?: number) => number;
};

/** mulberry32: same seed, same sequence. */
export function rng(seed: number): Rng {
  let a = seed >>> 0;
  const r = (() => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }) as Rng;
  r.range = (lo, hi) => lo + (hi - lo) * r();
  r.int = (lo, hi) => Math.floor(r.range(lo, hi + 1));
  r.pick = (xs) => xs[Math.floor(r() * xs.length)]!;
  r.vary = (k = 0.1) => r.range(1 - k, 1 + k);
  return r;
}

/** Seeded simplex noise, output in [-1, 1]. */
export const noise = (seed: number) => createNoise2D(rng(seed));

/* ---------- colour ---------- */
const toRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** Linear mix of two #rrggbb colours; t = 0 gives a. */
export function mix(a: string, b: string, t: number): string {
  const A = toRgb(a);
  const B = toRgb(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i]! - v) * t).toString(16).padStart(2, "0")).join("");
}

/* ---------- number formatting ---------- */
const f = (n: number) => (Math.round(n * 10) / 10).toString();

/* ---------- builders (all return straight-edged polygons) ---------- */
/** Subdivide long edges and jitter vertices: the scissor-cut look. Corners stay nearly exact. */
export function cut(pts: Poly, r: Rng, jitter = 1.2, seg = 40): Poly {
  const out: Poly = [];
  pts.forEach((a, k) => {
    const b = pts[(k + 1) % pts.length]!;
    const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / (seg * r.range(0.7, 1.3))));
    for (let s = 0; s < n; s++) {
      const t = s / n;
      const j = s === 0 ? 0.25 : 1;
      out.push([a[0] + (b[0] - a[0]) * t + r.range(-jitter, jitter) * j, a[1] + (b[1] - a[1]) * t + r.range(-jitter, jitter) * j]);
    }
  });
  return out;
}

export const rect = (x: number, y: number, w: number, h: number): Poly => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** Ellipse as an n-gon (not jittered; wrap in cut() for torn edges). */
export const ellipse = (cx: number, cy: number, rx: number, ry: number, n = 24): Poly =>
  Array.from({ length: n }, (_, k) => [cx + Math.cos((k / n) * 2 * Math.PI) * rx, cy + Math.sin((k / n) * 2 * Math.PI) * ry] as Pt);

export type RidgeOpts = {
  x0: number; x1: number;
  /** Mean ridge line y. */
  y: number;
  /** Bottom edge y (closed down to here). */
  base: number;
  /** Peak-to-valley amplitude. */
  amp: number;
  /** Vertex spacing, default 40. */
  step?: number;
  /** Sharp peaks (|noise|) vs rolling; default true. */
  peaky?: boolean;
  seed?: number;
};
/** Mountain silhouette: jittered ridge line closed down to `base`. */
export function ridge(r: Rng, o: RidgeOpts): Poly {
  const n2 = noise(o.seed ?? Math.floor(r() * 1e9));
  const step = o.step ?? 40;
  const pts: Poly = [];
  for (let x = o.x0; x < o.x1 + step; x += step) {
    const xx = Math.min(x, o.x1);
    const w = n2(xx / 420, 0) * 0.6 + n2(xx / 150, 7) * 0.3 + n2(xx / 60, 3) * 0.1;
    const h = o.peaky === false ? w : Math.abs(w) * 2 - 0.6;
    pts.push([xx + r.range(-step * 0.15, step * 0.15), o.y - h * o.amp * 0.5 + r.range(-o.amp * 0.03, o.amp * 0.03)]);
    if (xx === o.x1) break;
  }
  return [...pts, [o.x1, o.base], [o.x0, o.base]];
}
/** Rolling hills: ridge() with gentle defaults. */
export const hills = (r: Rng, o: RidgeOpts): Poly => ridge(r, { step: 80, peaky: false, ...o });

/** Cavern/door arch as a polygon (use as a hole or a sheet). Feet at baseY, apex at baseY - h. */
export function arch(r: Rng, cx: number, baseY: number, w: number, h: number, jitter = 1.5): Poly {
  const rx = w / 2;
  const ry = Math.min(h, rx * 1.2);
  const pts: Poly = [[cx - rx, baseY]];
  for (let k = 0; k <= 10; k++) {
    const a = Math.PI + (k / 10) * Math.PI;
    pts.push([cx + Math.cos(a) * rx, baseY - (h - ry) + Math.sin(a) * ry]);
  }
  pts.push([cx + rx, baseY]);
  return cut(pts, r, jitter, 50);
}

/** Tree: trunk plus a lumpy canopy, unioned into one Shape. `h` is total height from baseY. */
export function tree(r: Rng, cx: number, baseY: number, h: number): Shape {
  const tw = h * 0.07;
  const trunk = cut([[cx - tw, baseY], [cx - tw * 0.6, baseY - h * 0.6], [cx + tw * 0.6, baseY - h * 0.6], [cx + tw, baseY]], r, 0.8, 30);
  const parts: Poly[] = [trunk];
  const cw = h * 0.3;
  for (let k = 0; k < r.int(4, 6); k++)
    parts.push(cut(ellipse(cx + r.range(-cw, cw), baseY - h * r.range(0.62, 0.85), cw * r.range(0.5, 0.8), h * r.range(0.12, 0.2), 10), r, 1.5, 25));
  return union(...parts);
}

/** Hanging/spreading roots: `n` tapering strands from (cx, y) running down (dir 1) or up (-1) over `len`, spread over `w`. */
export function roots(r: Rng, cx: number, y: number, w: number, len: number, n = 5, dir: 1 | -1 = 1): Shape {
  const parts: Poly[] = [];
  for (let k = 0; k < n; k++) {
    let px = cx + (n > 1 ? (k / (n - 1) - 0.5) * w : 0);
    let py = y;
    const wd = r.range(4, 9);
    const L: Pt[] = [];
    const R: Pt[] = [];
    const segs = 7;
    const drift = r.range(-0.35, 0.35);
    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      const half = (wd * (1 - t) + 0.6) / 2;
      L.push([px - half, py]);
      R.push([px + half, py]);
      px += (drift + r.range(-0.25, 0.25)) * (len / segs);
      py += dir * (len / segs) * r.range(0.8, 1.1);
    }
    parts.push([...L, ...R.reverse()]);
  }
  return union(...parts);
}

/** Staircase profile rising left to right (dir 1) or right to left (-1), filled down to y + h. */
export function stairs(x: number, y: number, w: number, h: number, steps: number, dir: 1 | -1 = 1): Poly {
  const pts: Poly = [[dir === 1 ? x : x + w, y + h]];
  for (let k = 0; k < steps; k++) {
    const xa = dir === 1 ? x + (k / steps) * w : x + w - (k / steps) * w;
    const xb = dir === 1 ? x + ((k + 1) / steps) * w : x + w - ((k + 1) / steps) * w;
    const yy = y + h - ((k + 1) / steps) * h;
    pts.push([xa, yy], [xb, yy]);
  }
  pts.push([dir === 1 ? x + w : x, y + h]);
  return pts;
}

/* ---------- booleans (clipper2) ---------- */
const toD = (p: Poly): PathD => p.map(([x, y]) => ({ x, y }));
/** Bare Poly = outer ring (normalised to clipper's positive orientation); Shape is trusted as-is. */
const asPaths = (s: Poly | Shape): PathsD => {
  const rings: Shape = typeof s[0]?.[0] === "number" ? [s as Poly] : (s as Shape);
  const single = typeof s[0]?.[0] === "number";
  return rings.map((p) => {
    const d = toD(p);
    return single && areaD(d) < 0 ? d.reverse() : d;
  });
};
const fromD = (ps: PathsD): Shape => ps.map((p) => p.map((q) => [q.x, q.y] as Pt));

/** Union of polygons/shapes. */
export const union = (...xs: (Poly | Shape)[]): Shape => fromD(unionD(xs.flatMap(asPaths), FillRule.NonZero));
/** a minus every hole in `cuts`. */
export const difference = (a: Poly | Shape, ...cuts: (Poly | Shape)[]): Shape =>
  fromD(differenceD(asPaths(a), cuts.flatMap(asPaths), FillRule.NonZero, 2));

/** Grow (d > 0) or shrink (d < 0) a shape by d units; round joins. Empty Shape if it vanishes. */
export const offset = (s: Poly | Shape, d: number): Shape => fromD(inflatePathsD(asPaths(s), d, JoinType.Round, EndType.Polygon, 2, 2, 0.4));

/* ---------- sheet / glow ---------- */
const pathD = (s: Shape) => s.map((p) => "M" + p.map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + "Z").join("");
const bounds = (s: Shape) => {
  const all = s.flat();
  return { x0: Math.min(...all.map((p) => p[0])), y0: Math.min(...all.map((p) => p[1])), x1: Math.max(...all.map((p) => p[0])), y1: Math.max(...all.map((p) => p[1])) };
};
let uid = 0; // deterministic per process run (call order)

export type SheetOpts = {
  /** Holes cut through the paper (real boolean difference). */
  holes?: (Poly | Shape)[];
  /** Baked soft drop shadow. Default { dx: 6, dy: 10, blur: 8, opacity: 0.45, color: "#000000" }; false = none. */
  shadow?: { dx?: number; dy?: number; blur?: number; opacity?: number; color?: string } | false;
  /** Thin lighter stroke on the lit side. `light` = direction pointing TOWARD the light (default up-left). */
  edge?: { light?: Pt; width?: number; color?: string };
  /** Soft inner shadow along the edge (paper thickness), drawn over the body. Works together with `edge`. */
  inner?: { blur?: number; opacity?: number; color?: string };
  opacity?: number;
};

/** One flat-colour paper sheet. Painter order: shadow, edge light, body. */
export function sheet(shape: Poly | Shape, fill: string, o: SheetOpts = {}): Frag {
  const s = o.holes?.length ? difference(shape, ...o.holes) : union(shape);
  const d = pathD(s);
  const b = bounds(s);
  const sh = o.shadow === false ? null : { dx: 6, dy: 10, blur: 8, opacity: 0.45, color: "#000000", ...o.shadow };
  const ed = o.edge ? { light: [-1, -1] as Pt, width: 1.5, color: mix(fill, "#ffffff", 0.3), ...o.edge } : null;
  let svg = "";
  let [x0, y0, x1, y1] = [b.x0, b.y0, b.x1, b.y1];
  if (sh) {
    const id = `sh${uid++}`;
    const pad = sh.blur * 3;
    svg += `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sh.blur}"/></filter>` +
      `<path d="${d}" fill="${sh.color}" fill-opacity="${sh.opacity}" fill-rule="evenodd" filter="url(#${id})" transform="translate(${sh.dx} ${sh.dy})"/>`;
    x0 = Math.min(x0, b.x0 + sh.dx - pad); y0 = Math.min(y0, b.y0 + sh.dy - pad);
    x1 = Math.max(x1, b.x1 + sh.dx + pad); y1 = Math.max(y1, b.y1 + sh.dy + pad);
  }
  if (ed) {
    const len = Math.hypot(ed.light[0], ed.light[1]) || 1;
    const tx = (ed.light[0] / len) * ed.width, ty = (ed.light[1] / len) * ed.width;
    svg += `<path d="${d}" fill="${ed.color}" fill-rule="evenodd" transform="translate(${f(tx)} ${f(ty)})"/>`;
    x0 = Math.min(x0, b.x0 - ed.width); y0 = Math.min(y0, b.y0 - ed.width); x1 = Math.max(x1, b.x1 + ed.width); y1 = Math.max(y1, b.y1 + ed.width);
  }
  svg += `<path d="${d}" fill="${fill}" fill-rule="evenodd"/>`;
  if (o.inner) {
    const iv = { blur: 6, opacity: 0.35, color: "#000000", ...o.inner };
    const id = `in${uid++}`;
    svg += `<clipPath id="${id}c"><path d="${d}" clip-rule="evenodd"/></clipPath><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${iv.blur}"/></filter>` +
      `<g clip-path="url(#${id}c)"><path d="${d}" fill="none" stroke="${iv.color}" stroke-opacity="${iv.opacity}" stroke-width="${f(iv.blur * 2)}" filter="url(#${id})"/></g>`;
  }
  return { svg: o.opacity !== undefined ? `<g opacity="${o.opacity}">${svg}</g>` : svg, x0, y0, x1, y1 };
}

/** Radial glow sprite (windows, lanterns, sun) on transparent background; soft white-ish core fading to `color` then 0. */
export function glow(cx: number, cy: number, r: number, color: string, opts: { opacity?: number; core?: string } = {}): Frag {
  const id = `gl${uid++}`;
  const core = opts.core ?? mix(color, "#ffffff", 0.6);
  return {
    svg: `<radialGradient id="${id}"><stop offset="0" stop-color="${core}" stop-opacity="${opts.opacity ?? 1}"/><stop offset=".3" stop-color="${color}" stop-opacity="${0.55 * (opts.opacity ?? 1)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>` +
      `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="url(#${id})"/>`,
    x0: cx - r, y0: cy - r, x1: cx + r, y1: cy + r,
  };
}

/** Stepped layered paper: the same silhouette repeated, each `inset` smaller with the next fill (fills[0] = outermost). */
export function stack(shape: Poly | Shape, fills: string[], inset: number, o: SheetOpts = {}): Frag[] {
  const out: Frag[] = [];
  let cur: Shape = union(shape);
  for (const [i, fill] of fills.entries()) {
    if (!cur.length) break;
    out.push(sheet(cur, fill, { shadow: { dx: 2, dy: 4, blur: 4, opacity: 0.4 }, ...o }));
    cur = offset(cur, -inset);
  }
  return out;
}

/** Soft light ray: a trapezoid from (x,y) (top width w0) widening to w1 over `len`, rotated angleDeg from straight down; fades to transparent at both ends. */
export function shaft(x: number, y: number, w0: number, w1: number, len: number, angleDeg: number, color: string, opacity = 0.3): Frag {
  const id = `sf${uid++}`, a = (angleDeg * Math.PI) / 180;
  const R = len + w1;
  return {
    svg: `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".25" stop-color="${color}" stop-opacity="${opacity}"/><stop offset=".7" stop-color="${color}" stop-opacity="${opacity * 0.6}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>` +
      `<path d="M${f(-w0 / 2)} 0L${f(w0 / 2)} 0L${f(w1 / 2)} ${f(len)}L${f(-w1 / 2)} ${f(len)}Z" fill="url(#${id})" transform="translate(${f(x)} ${f(y)}) rotate(${-angleDeg})"/>`,
    x0: x - R, y0: y - R, x1: x + R, y1: y + R,
  };
}

/** Soft horizontal haze band centred (x, y), size w x h; fades in every direction. */
export function mist(x: number, y: number, w: number, h: number, color: string, opacity = 0.25): Frag {
  const id = `ms${uid++}`;
  return {
    svg: `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset=".55" stop-color="${color}" stop-opacity="${opacity * 0.55}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>` +
      `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w / 2)}" ry="${f(h / 2)}" fill="url(#${id})"/>`,
    x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2,
  };
}
