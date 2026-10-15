// Shared art helpers (art-pipeline.md "Shared helpers" + props). Everything returns Pieces in strip units.
import { HOOK_Y, WATERLINE, type LayerDef } from "./layers";

/** One drawable unit with its horizontal extent, so the build can slice strips into tiles. */
export type Piece = {
  x0: number;
  x1: number;
  svg: string;
  /** Drawn above the layer's shadow/blur filter, unfiltered (glows, light). */
  top?: boolean;
};

export type Ctx = {
  layer: LayerDef;
  /** Stop index, or -1 for whole-strip generators (far.ts, water.ts). */
  i: number;
  /** Owned x-range on this strip. Draw inside it (shapes may cross by up to 200 units). */
  x0: number;
  x1: number;
  /** Landmark x of stop i on this layer (rest-fan). NaN for whole-strip generators. */
  lx: number;
  /** Strip length. */
  length: number;
  /** Stops on this strip, and each local stop's index on the original 9-stop timeline (art/route.ts timeline). */
  count: number;
  tl: readonly number[];
  rng: Rng;
};

/** Local fractional stop -> fractional original-timeline position (linear between stops, slope 1 beyond the ends). */
export const tlAt = (tl: readonly number[], u: number) => {
  const n = tl.length;
  if (u >= n - 1) return tl[n - 1]! + (u - (n - 1));
  if (u <= 0) return tl[0]! + u;
  const i = Math.floor(u);
  return tl[i]! + (tl[i + 1]! - tl[i]!) * (u - i);
};

export type Gen = (ctx: Ctx) => Piece[];
/** A stop/far/water module: one generator per layer id it draws. */
export type ArtModule = Partial<Record<string, Gen>>;

/* ---------- colour tokens (hex, as in design-tokens.md) ---------- */
export const C = {
  ramp0: "#070B14",
  ramp1: "#0D1626",
  ramp2: "#14233A",
  ramp3: "#1D3552",
  ramp4: "#2B4A6B",
  ramp5: "#43698A",
  ramp6: "#6E93AB",
  ramp7: "#A9C4D2",
  inkNight: "#04070D",
  haze: "#7FA3B8",
  shadow: "#03060C",
  water1: "#122B45",
  water2: "#0F2540",
  water3: "#0A1B30",
  waterHi: "#3A6A8C",
  leaf1: "#12342F",
  leaf2: "#1B4A3F",
  leaf3: "#27604F",
  leafHi: "#3C7A66",
  root: "#1A2B2A",
  paddy: "#24574A",
  paddyWater: "#3F7F86",
  moon: "#F4EFD8",
  moonShade: "#CFC9AC",
  lantern: "#FFB454",
  lanternCore: "#FFE2A8",
  ember: "#E0733A",
  window: "#FFC46B",
  firefly: "#D9F26B",
  dawnRose: "#E59C98",
  dawnGold: "#F2C77A",
  bamboo: "#C79A5E",
} as const;

/* ---------- rng ---------- */
export type Rng = {
  (): number;
  range: (a: number, b: number) => number;
  int: (a: number, b: number) => number;
  pick: <T>(xs: readonly T[]) => T;
  /** Multiplier 0.9-1.1 (art-direction "never copy-paste identical shapes"). */
  vary: () => number;
};

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
  r.vary = () => r.range(0.9, 1.1);
  return r;
}

/* ---------- colour maths ---------- */
const toRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
/** Linear mix of two hex colours, t = 0 gives a. */
export const mix = (a: string, b: string, t: number) => {
  const A = toRgb(a);
  const B = toRgb(b);
  return toHex(A.map((v, i) => v + (B[i]! - v) * t));
};
/** Tint toward the haze colour (depth-system.md atmospheric table). */
export const hazed = (hex: string, t: number) => mix(hex, C.haze, t);
export const darken = (hex: string, t: number) => mix(hex, C.shadow, t);
export const lighten = (hex: string, t: number) => mix(hex, C.ramp7, t);

/* ---------- geometry ---------- */
export type Pt = [number, number];
const f = (n: number) => (Math.round(n * 10) / 10).toString();

/** Points of an arc (radians, 0 = right, y down), using `chords` straight cuts. */
export function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, chords = 4): Pt[] {
  const out: Pt[] = [];
  for (let k = 0; k <= chords; k++) {
    const a = a0 + ((a1 - a0) * k) / chords;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
}

/** Closed ellipse as a polygon (n chords). For lantern shades and the moon only (organic exceptions). */
export const ellipse = (cx: number, cy: number, rx: number, ry: number, n = 24): Pt[] => arc(cx, cy, rx, ry, 0, Math.PI * 2, n).slice(0, -1);

/**
 * Facet-cut outline: subdivides long edges into 20-60 unit segments and jitters vertices by ±jitter.
 * Returns a closed path `d`. Pass `jitter = 0` for crisp mechanical cuts.
 */
export function facet(pts: Pt[], r: Rng, jitter = 0.8, closed = true): string {
  const out: Pt[] = [];
  const n = pts.length;
  for (let k = 0; k < (closed ? n : n - 1); k++) {
    const a = pts[k]!;
    const b = pts[(k + 1) % n]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const segs = Math.max(1, Math.round(len / r.range(30, 55)));
    for (let s = 0; s < segs; s++) {
      const t = s / segs;
      const j = s === 0 ? 0.3 : 1; // keep authored corners nearly exact
      out.push([a[0] + (b[0] - a[0]) * t + r.range(-jitter, jitter) * j, a[1] + (b[1] - a[1]) * t + r.range(-jitter, jitter) * j]);
    }
  }
  if (!closed) out.push(pts[n - 1]!);
  return "M" + out.map((p) => `${f(p[0])} ${f(p[1])}`).join("L") + (closed ? "Z" : "");
}

/** Polygon path without jitter (for holes and small pieces). */
export const poly = (pts: Pt[]) => "M" + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join("L") + "Z";

export const rect = (x: number, y: number, w: number, h: number): Pt[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

/** x-extent of a list of points or of every number pair in a path string. */
export function extent(src: Pt[] | string): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  if (typeof src === "string") {
    const nums = src.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    for (let k = 0; k < nums.length; k += 2) {
      lo = Math.min(lo, nums[k]!);
      hi = Math.max(hi, nums[k]!);
    }
  } else
    for (const p of src) {
      lo = Math.min(lo, p[0]);
      hi = Math.max(hi, p[0]);
    }
  return [lo, hi];
}

/* ---------- sheets ---------- */
export type SheetOpts = {
  /** Hole paths (`d`), cut with evenodd. Each gets a 1-unit inner shadow on its upper-left edge. */
  holes?: string[];
  /** Card-edge light/dark rims (art-direction "Edges have thickness"). Default true. */
  rim?: boolean;
  opacity?: number;
};

/**
 * One flat sheet of paper. `shape` is a path `d` (from facet/poly) or points (faceted automatically).
 * Rim: a lighter copy offset up-left and a darker copy down-right peek out by 1.5 units.
 */
export function sheet(shape: string | Pt[], fill: string, r: Rng, o: SheetOpts = {}): Piece {
  const d = typeof shape === "string" ? shape : facet(shape, r);
  const holes = o.holes?.join("") ?? "";
  const full = d + holes;
  const [x0, x1] = extent(d);
  const op = o.opacity !== undefined ? ` opacity="${o.opacity}"` : "";
  const rim =
    o.rim === false
      ? ""
      : `<path d="${d}" fill="${lighten(fill, 0.28)}" transform="translate(-1.5 -1.5)"/>` +
        `<path d="${d}" fill="${darken(fill, 0.35)}" transform="translate(1.5 1.5)"/>`;
  const holeShade = holes ? `<path d="${holes}" fill="${darken(fill, 0.5)}" transform="translate(1 1)" opacity=".6"/>` : "";
  const body = `<path d="${full}" fill="${fill}" fill-rule="evenodd"/>`;
  // ponytail: hole inner shadow drawn under the sheet only shows where the hole opens; fine for paper.
  return { x0, x1, svg: `<g${op}>${rim}${holeShade}${body}</g>` };
}

/** Raw svg markup with a known extent (escape hatch). */
export const raw = (x0: number, x1: number, svg: string, top = false): Piece => ({ x0, x1, svg, top });

/** Soft round glow (baked tissue glow). Rendered above the filter. */
export const glow = (cx: number, cy: number, r: number, color: string = C.lantern, opacity = 0.55): Piece => ({
  x0: cx - r,
  x1: cx + r,
  top: true,
  svg: `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="url(#glow-${color.slice(1).toUpperCase()})" opacity="${opacity}"/>`,
});

/* ---------- patterns ---------- */
/**
 * Kawung-inspired punched pattern: four pointed ovals around each grid point.
 * Returns hole paths covering the box (x, y, w, h) with the given cell size (4-6 units on lanterns).
 */
export function kawung(x: number, y: number, w: number, h: number, cell = 5): string[] {
  const out: string[] = [];
  const r = cell * 0.42;
  for (let cy = y + cell / 2; cy < y + h; cy += cell)
    for (let cx = x + cell / 2; cx < x + w; cx += cell)
      for (const a of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
        const ox = cx + Math.cos(a + Math.PI / 4) * r * 0.62;
        const oy = cy + Math.sin(a + Math.PI / 4) * r * 0.62;
        const ang = a + Math.PI / 4;
        const ux = Math.cos(ang) * r * 0.45;
        const uy = Math.sin(ang) * r * 0.45;
        const vx = -Math.sin(ang) * r * 0.22;
        const vy = Math.cos(ang) * r * 0.22;
        out.push(poly([[ox - ux, oy - uy], [ox + vx, oy + vy], [ox + ux, oy + uy], [ox - vx, oy - vy]]));
      }
  return out;
}

/** Tiny diamond hole (stars, punched dots). */
export const diamond = (cx: number, cy: number, s = 3) => poly([[cx, cy - s / 2], [cx + s / 2, cy], [cx, cy + s / 2], [cx - s / 2, cy]]);

/* ---------- props ---------- */
/** Post geometry shared with the runtime (src/lib/layout.ts): hook at (lx, HOOK_Y), post to the right. */
export const POST_DX = 150;
export const LANTERN_DX = 215;
export const LANTERN_Y = 335;

/** Round paper lantern hanging from (x, y) top. Lit shade with kawung holes over a bright core + glow. */
export function lantern(x: number, y: number, r: Rng, scale = 1, glowOn = true): Piece[] {
  const rx = 22 * scale;
  const ry = 26 * scale;
  const cy = y + 10 * scale + ry;
  const cord = sheet(rect(x - 1.5, y, 3, 10 * scale + 2), C.ramp1, r, { rim: false });
  const core = sheet(ellipse(x, cy, rx * 0.8, ry * 0.8, 16), C.lanternCore, r, { rim: false });
  const shade = sheet(ellipse(x, cy, rx, ry, 18), C.lantern, r, {
    holes: kawung(x - rx * 0.6, cy - ry * 0.5, rx * 1.2, ry, 5 * scale),
  });
  const caps = [
    sheet(rect(x - rx * 0.45, cy - ry - 4 * scale, rx * 0.9, 6 * scale), C.ramp1, r),
    sheet(rect(x - rx * 0.45, cy + ry - 2 * scale, rx * 0.9, 6 * scale), C.ramp1, r),
  ];
  return [cord, core, shade, ...caps, ...(glowOn ? [glow(x, cy, 110 * scale, C.lantern, 0.5)] : [])];
}

/**
 * The tag post for stop landmark lx: pole standing in the water at lx + POST_DX, an arm reaching left
 * to a hook at (lx, HOOK_Y), a lantern hanging on the far side. Stops may restyle it (bamboo, gantry,
 * pier) but must keep the hook point and lantern point fixed.
 */
export function post(lx: number, r: Rng, fill: string = C.ramp2, top = 230): Piece[] {
  const px = lx + POST_DX;
  const pole = sheet(rect(px - 7, top, 14, WATERLINE + 40 - top), fill, r);
  const arm = sheet(
    [
      [lx - 20, HOOK_Y - 48],
      [px + 80, HOOK_Y - 50],
      [px + 80, HOOK_Y - 38],
      [lx - 20, HOOK_Y - 36],
    ],
    fill,
    r,
  );
  const hook = sheet(rect(lx - 2, HOOK_Y - 38, 4, 38), C.ramp1, r, { rim: false });
  const cap = sheet(
    [
      [px - 14, top],
      [px, top - 22],
      [px + 14, top],
    ],
    fill,
    r,
  );
  return [pole, arm, hook, cap, ...lantern(lx + LANTERN_DX, HOOK_Y - 38, r)];
}

/** Bamboo pole: segmented vertical, `--c-bamboo` darkened for night. */
export function bamboo(x: number, yTop: number, yBot: number, r: Rng, w = 10, fill = darken(C.bamboo, 0.55)): Piece[] {
  const out: Piece[] = [];
  let y = yTop;
  while (y < yBot) {
    const h = Math.min(yBot - y, r.range(60, 90));
    out.push(sheet(rect(x - w / 2 + r.range(-0.6, 0.6), y, w, h - 3), fill, r));
    y += h;
  }
  return out;
}

/** Leaf: pointed blade from base (x, y) at angle (deg, 0 = up), length L, half-width W, with cut veins. */
export function leaf(x: number, y: number, angle: number, L: number, W: number, fill: string, r: Rng, veins = true): Piece {
  const a = ((angle - 90) * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const vx = -uy;
  const vy = ux;
  const at = (t: number, s: number): Pt => [x + ux * L * t + vx * s, y + uy * L * t + vy * s];
  const outline: Pt[] = [at(0, 0), at(0.25, W * 0.8), at(0.55, W), at(0.85, W * 0.5), at(1, 0), at(0.85, -W * 0.5), at(0.55, -W), at(0.25, -W * 0.8)];
  const holes: string[] = [];
  if (veins && W > 14) {
    for (const t of [0.3, 0.5, 0.7]) {
      for (const side of [1, -1]) {
        const p0 = at(t, side * 3);
        const p1 = at(t + 0.1, side * W * 0.6);
        const n: Pt = [vx * 1.5, vy * 1.5];
        holes.push(poly([p0, p1, [p1[0] + n[0], p1[1] + n[1]], [p0[0] + n[0], p0[1] + n[1]]]));
      }
    }
  }
  return sheet(outline, fill, r, { holes });
}

/** Reed cluster: thin tapering blades rising from (x, yBase). */
export function reeds(x: number, yBase: number, r: Rng, n = 7, h = 120, fill: string = C.leaf1): Piece[] {
  const out: Piece[] = [];
  for (let k = 0; k < n; k++) {
    const bx = x + r.range(-n * 4, n * 4);
    const hh = h * r.range(0.6, 1.15);
    const lean = r.range(-0.35, 0.35) * hh;
    out.push(sheet([[bx - 3, yBase], [bx + 3, yBase], [bx + lean + 1, yBase - hh], [bx + lean - 1, yBase - hh + 4]], fill, r, { rim: false }));
  }
  return out;
}

/** A plain flat-bottomed moored boat (prop), length L, centre x, waterline y. */
export function boat(x: number, y: number, L: number, r: Rng, fill: string = C.ramp2): Piece[] {
  const hull: Pt[] = [[x - L / 2, y - 18], [x + L / 2, y - 22], [x + L / 2 - 20, y + 4], [x - L / 2 + 16, y + 4]];
  return [sheet(hull, fill, r), sheet(rect(x - L / 2 + 12, y - 12, L - 30, 3), darken(C.ember, 0.3), r, { rim: false })];
}

/** Palm: curved trunk and 6-8 fronds. */
export function palm(x: number, yBase: number, h: number, r: Rng, fill: string): Piece[] {
  const lean = r.range(-0.25, 0.25) * h;
  const tx = x + lean;
  const ty = yBase - h;
  const trunk = sheet([[x - 7, yBase], [x + 7, yBase], [tx + 4, ty], [tx - 4, ty]], fill, r);
  const fronds = Array.from({ length: r.int(6, 8) }, (_, k) => leaf(tx, ty, -100 + k * 30 + r.range(-8, 8), h * r.range(0.35, 0.5), h * 0.06, fill, r, false));
  return [trunk, ...fronds];
}

/** Collected glow gradient ids used in markup, for the build to define. */
export const glowIds = (svg: string) => [...new Set(svg.match(/glow-[0-9A-F]{6}/g) ?? [])];
