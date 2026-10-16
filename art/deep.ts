// Under the river: the projects section's scene (src/components/projects). Looking up at the moonlit surface, then
// sinking past the river's walls: moonlit shallows, the lantern deep, the riverbed and a sunken candi. Pure world, no
// project props (the cards carry the projects). Three tall paper layers, 1600 units wide; Projects.module.css slides each
// from top-aligned to bottom-aligned, so taller layers travel further. The surface is the top ~300 units and the floor
// the bottom ~300 of every layer (both line up at the ends of the dive); the bands between sit at the same fractions.
import { mkdirSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { GLOW_DEF, GRAIN, deckle } from "./build";
import { C, darken, diamond, ellipse, glowIds, kawung, lighten, mix, poly, raw, rect, rng, sheet, type Piece, type Pt, type Rng } from "./helpers";

const W = 1600;
const SEED = 20261016;
const f = (n: number) => (Math.round(n * 10) / 10).toString();

/** One stack of sheets with the same papercut treatment. shadow = [dx, dy, opacity] baked under it; back = warm rim; grain = fibre. */
type Group = { pieces: Piece[]; shadow?: [number, number, number]; back?: boolean; grain?: boolean; deckle?: number };

/** Water colour by depth (fraction of a layer's height). Projects.module.css paints the same stops under the images. */
const WATER: [number, string][] = [
  [0, "#3F8A92"], [0.05, "#26667A"], [0.2, "#1D5668"], [0.36, "#163F55"], [0.46, "#0F2140"],
  [0.56, "#0B1430"], [0.66, "#0A1426"], [0.74, "#132A2A"], [0.86, "#142D29"], [1, "#0B1A17"],
];
const water = (t: number) => {
  const i = Math.max(0, WATER.findIndex(([o]) => o >= t) - 1);
  const [o0, c0] = WATER[i]!, [o1, c1] = WATER[i + 1] ?? WATER[i]!;
  return mix(c0, c1, o1 > o0 ? (t - o0) / (o1 - o0) : 0);
};

/* ---------------------------------------------------------------- shapes */

/** The water gradient darkened by k, laid over the layer's own height, so a wall's colour follows the depth it is at. */
const shade = (id: string, H: number, k: number) =>
  raw(0, W, `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${H}">${WATER.map(([o, c]) => `<stop offset="${o}" stop-color="${darken(c, k)}"/>`).join("")}</linearGradient></defs>`);
/** Both side walls, one sheet each, filled with shade `id`. */
const walls = (id: string, y0: number, H: number, reach: (y: number) => number, r: Rng) => [-1, 1].map((s) => wall(s as -1 | 1, y0, H + 40, reach, `url(#${id})`, r));

const bez = (a: Pt, b: Pt, c: Pt, n = 12): Pt[] =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n, u = 1 - t;
    return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]] as Pt;
  });

/** Closed strip along a polyline, width w0 at the start tapering to w1. */
function ribbon(c: Pt[], w0: number, w1 = w0): Pt[] {
  const L: Pt[] = [], R: Pt[] = [];
  c.forEach((p, i) => {
    const a = c[Math.max(0, i - 1)]!, b = c[Math.min(c.length - 1, i + 1)]!;
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const w = (w0 + ((w1 - w0) * i) / (c.length - 1)) / 2;
    L.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]);
    R.push([p[0] + (dy / l) * w, p[1] - (dx / l) * w]);
  });
  return [...L, ...R.reverse()];
}

/** The river's side wall from y0 to y1, its face `reach(y)` units in from the edge (side -1 left, 1 right). */
function wall(side: -1 | 1, y0: number, y1: number, reach: (y: number) => number, fill: string, r: Rng): Piece {
  const X = (x: number) => (side < 0 ? x : W - x);
  const pts: Pt[] = [[X(-80), y0]];
  for (let y = y0; y < y1; y += r.range(50, 110)) pts.push([X(reach(y) * r.range(0.82, 1.08)), y]);
  pts.push([X(reach(y1)), y1], [X(-80), y1]);
  return sheet(pts, fill, r, { rim: false });
}

/** Eelgrass: tapering ribbons swaying up from (x, yBase). */
function weeds(x: number, yBase: number, n: number, h: number, w: number, fill: string, r: Rng): Piece[] {
  return Array.from({ length: n }, () => {
    const bx = x + r.range(-n * 6, n * 6), hh = h * r.range(0.55, 1.1), lean = r.range(-0.4, 0.4) * hh;
    return sheet(ribbon(bez([bx, yBase + 20], [bx - lean * 0.4, yBase - hh * 0.5], [bx + lean, yBase - hh], 10), w * r.vary(), 1.5), fill, r, { rim: false });
  });
}

/** A fish seen side-on: lens body, forked tail, one fin; `patch` paints a koi's pale saddle. dir 1 swims right. */
function fish(x: number, y: number, L: number, dir: 1 | -1, fill: string, r: Rng, patch?: string): Piece[] {
  const Ht = L * 0.34;
  const P = (u: number, v: number): Pt => [x + dir * (u - 0.5) * L, y + v * Ht];
  const half = (u: number) => 0.06 + 0.44 * Math.sin(Math.PI * u ** 1.36);
  const us = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.88, 1];
  const body = [...us.map((u) => P(u, -half(u))), ...us.slice(1, -1).reverse().map((u) => P(u, half(u)))];
  const tail = [P(0.02, 0), P(-0.26, -0.7), P(-0.16, 0), P(-0.26, 0.7)];
  const fin = [P(0.62, 0.3), P(0.44, 0.95), P(0.5, 0.32)];
  const out = [sheet(tail, darken(fill, 0.15), r), sheet(body, fill, r), sheet(fin, darken(fill, 0.1), r, { rim: false })];
  if (patch) out.push(sheet(ellipse(...P(0.62, -0.08), L * 0.14, Ht * 0.3, 10), patch, r, { rim: false }));
  return out;
}

/** A hanging root: one tapering cord from (x, y) with a few side hairs. dir leans it away from the wall. */
function root(x: number, y: number, len: number, dir: 1 | -1, fill: string, r: Rng): Piece[] {
  const main = bez([x, y], [x + dir * len * 0.35, y + len * 0.45], [x + dir * len * r.range(0.05, 0.25), y + len], 14);
  const out = [sheet(ribbon(main, 18, 2), fill, r, { rim: false })];
  for (const t of [0.3, 0.5, 0.72]) {
    const p = main[Math.round(t * 14)]!, l = len * r.range(0.18, 0.32);
    out.push(sheet(ribbon(bez(p, [p[0] + dir * l * 0.5, p[1] + l * 0.3], [p[0] + dir * l * r.range(0.2, 0.7), p[1] + l], 8), 7, 1), fill, r, { rim: false }));
  }
  return out;
}

/** Candi tiers stacked up from yBase: each a stone course with a kawung-punched frieze, a cornice and moss dripping off it. */
function candi(cx: number, yBase: number, tiers: [w: number, h: number][], stone: string, moss: string, r: Rng, cell = 22): { pieces: Piece[]; top: number } {
  const out: Piece[] = [];
  let y = yBase;
  for (const [w, h] of tiers) {
    y -= h;
    out.push(sheet(rect(cx - w / 2, y, w, h), stone, r, { holes: kawung(cx - w / 2 + cell, y + h * 0.32, w - 2 * cell, h * 0.36, cell) }));
    out.push(sheet(rect(cx - w / 2 - 14, y - 6, w + 28, 16), lighten(stone, 0.12), r));
    for (let k = r.int(2, 4); k > 0; k--) {
      const mx = cx + r.range(-w / 2, w / 2), l = r.range(30, h * 0.8);
      out.push(sheet(ribbon(bez([mx, y + 6], [mx + r.range(-6, 6), y + l * 0.5], [mx + r.range(-10, 10), y + l], 6), r.range(10, 22), 3), moss, r, { rim: false }));
    }
  }
  return { pieces: out, top: y - 6 };
}

/** A latticed stupa on (cx, yBase), scale s: square base, bell with diamond lattice, harmika and spire. */
function stupa(cx: number, yBase: number, s: number, stone: string, r: Rng): Piece[] {
  const by = yBase - 24 * s, rx = 58 * s, ry = 84 * s;
  const bell: Pt[] = Array.from({ length: 13 }, (_, k) => [cx + Math.cos(Math.PI + (k * Math.PI) / 12) * rx, by + Math.sin(Math.PI + (k * Math.PI) / 12) * ry]);
  const holes: string[] = [];
  for (let row = 0; row < 3; row++) {
    const hy = by - ry * (0.22 + row * 0.24), hw = rx * Math.sqrt(1 - (0.22 + row * 0.24) ** 2) * 0.8;
    for (let hx = -hw; hx <= hw; hx += 15 * s) holes.push(diamond(cx + hx + (row % 2) * 7 * s, hy, 9 * s));
  }
  return [
    sheet(rect(cx - 70 * s, by, 140 * s, 24 * s), lighten(stone, 0.1), r),
    sheet(bell, stone, r, { holes }),
    sheet(rect(cx - 16 * s, by - ry - 22 * s, 32 * s, 24 * s), stone, r),
    sheet([[cx - 10 * s, by - ry - 22 * s], [cx, by - ry - 70 * s], [cx + 10 * s, by - ry - 22 * s]], stone, r),
  ];
}

/** The riverbed: a wavy sand floor across the whole width from about y. */
function floor(y: number, H: number, fill: string, r: Rng): Piece {
  const pts: Pt[] = [[-80, H + 40]];
  for (let x = -80; x <= W + 80; x += r.range(60, 140)) pts.push([x, y + Math.sin(x / 210) * 26 + r.range(-12, 12)]);
  return sheet([...pts, [W + 80, H + 40]], fill, r);
}

/** Drifting specks (unfiltered, above the paper). */
function motes(r: Rng, n: number, y0: number, y1: number, colors: string[], rad: [number, number], op: [number, number]): Piece {
  let s = "";
  for (let k = 0; k < n; k++) s += `<circle cx="${f(r.range(0, W))}" cy="${f(r.range(y0, y1))}" r="${f(r.range(...rad))}" fill="${r.pick(colors)}" opacity="${f(r.range(...op))}"/>`;
  return raw(0, W, s, true);
}

/* ---------------------------------------------------------------- layers */

function back(r: Rng, H: number): Group[] {
  const sea = raw(0, W, `<defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1">${WATER.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient><linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.moon}" stop-opacity=".2"/><stop offset="1" stop-color="${C.moon}" stop-opacity="0"/></linearGradient></defs><rect x="-120" y="0" width="${W + 240}" height="${H}" fill="url(#w)"/>`);
  // moonlight slanting down through the shallows
  let rays = "";
  for (let k = 0; k < 8; k++) {
    const x = 120 + k * 190 + r.range(-50, 50), w0 = r.range(24, 70), w1 = r.range(150, 280), L = r.range(0.28, 0.42) * H, dx = 0.22 * L;
    rays += `<path d="${poly([[x, -10], [x + w0, -10], [x + dx + w1 / 2, L], [x + dx - w1 / 2, L]])}" fill="url(#ray)" opacity="${f(r.range(0.45, 1))}"/>`;
  }
  // far walls lean in further than the near ones: the channel narrows into the distance
  const reach = (y: number) => 250 + 230 * (y / H);
  const grass = [0.2, 0.31, 0.4].flatMap((t, i) => [
    ...weeds(reach(t * H) - 10, t * H, 6, 220, 10, darken(water(t), 0.14), r),
    ...weeds(W - reach(t * H) + 10, (t + 0.03 * i) * H, 6, 220, 10, darken(water(t), 0.14), r),
  ]);
  const dune = darken(water(0.95), 0.18);
  const far = [...stupa(360, H - 140, 0.7, mix(dune, water(0.9), 0.35), r), ...stupa(1250, H - 120, 0.55, mix(dune, water(0.9), 0.45), r)];
  return [
    { pieces: [sea, raw(0, W, rays, true)] },
    { pieces: [shade("wall", H, 0.22), ...walls("wall", 0.07 * H, H, reach, r), ...grass, ...far, floor(H - 150, H, dune, r)], deckle: 2 },
  ];
}

function mid(r: Rng, H: number): Group[] {
  const reach = (y: number) => 150 + 160 * (y / H);
  const grass = [0.14, 0.24, 0.34, 0.42].flatMap((t, i) => {
    const g = mix(C.leaf2, water(t), 0.5);
    return [...weeds(reach(t * H) - 20, t * H, r.int(5, 8), r.range(220, 340), 14, g, r), ...weeds(W - reach((t + 0.04) * H) + 20, (t + 0.04 * (i % 2)) * H, r.int(5, 8), r.range(220, 340), 14, g, r)];
  });
  // koi in the shallows (two cross the middle, the part a phone sees)
  const koi = [[700, 0.13], [930, 0.27], [420, 0.19], [1180, 0.36], [560, 0.4], [1320, 0.16]].flatMap(([x, t], i) => {
    const tint = water(t!) as string;
    return fish(x!, t! * H, r.range(80, 125), i % 2 ? -1 : 1, mix(C.ember, tint, 0.3), r, mix(C.moon, tint, 0.35));
  });
  // dim shapes out in the lantern deep
  const shadows = [[480, 0.5], [1090, 0.55], [820, 0.62], [300, 0.66]].flatMap(([x, t], i) => fish(x!, t! * H, r.range(60, 90), i % 2 ? 1 : -1, darken(water(t!), 0.45), r));
  const roots = [0.7, 0.74, 0.78].flatMap((t) => [...root(reach(t * H) - 10, t * H, r.range(260, 420), 1, darken(C.root, 0.3), r), ...root(W - reach(t * H) + 10, (t + 0.015) * H, r.range(260, 420), -1, darken(C.root, 0.3), r)]);
  // the sunken candi, far and centred on the bed
  const stone = mix("#3A4A42", water(0.9), 0.35), moss = mix("#2F5A3C", water(0.9), 0.3);
  const c = candi(800, H - 130, [[760, 150], [620, 140], [480, 130], [340, 120]], stone, moss, r);
  return [
    { pieces: [shade("wall", H, 0.38), ...walls("wall", 0.06 * H, H, reach, r), ...grass, ...koi], shadow: [5, 7, 0.3], deckle: 3 },
    { pieces: shadows, shadow: [5, 7, 0.4], back: true, deckle: 3 },
    { pieces: [...roots, ...c.pieces, ...stupa(800, c.top, 1.5, stone, r), floor(H - 170, H, darken(water(0.95), 0.32), r)], shadow: [6, 8, 0.4], deckle: 3 },
    { pieces: [motes(r, 70, 0.08 * H, 0.42 * H, [C.moon], [1, 2.2], [0.15, 0.4]), motes(r, 240, 0.42 * H, 0.76 * H, [C.lanternCore, C.firefly, C.lantern], [1.1, 3], [0.2, 0.65])] },
  ];
}

function near(r: Rng, H: number): Group[] {
  // the surface seen from below: a bright skin, moon flecks, lily pads and their stems, the boat's hull dipping through
  const skin: Pt[] = [[-80, -20], [W + 80, -20]];
  for (let x = W + 80; x >= -80; x -= 80) skin.push([x, 190 + Math.sin(x / 130) * 14 + r.range(-6, 6)]);
  let flecks = "";
  for (let k = 0; k < 70; k++) {
    const x = r.range(0, W), y = r.range(20, 230), l = r.range(10, 34);
    flecks += `<path d="${poly([[x - l, y], [x, y - 2.2], [x + l, y], [x, y + 1.6]])}" fill="${C.moon}" opacity="${f(r.range(0.25, 0.7))}"/>`;
  }
  const pad = darken(C.leaf2, 0.4), stem = darken(C.leaf1, 0.35);
  const lilies = [120, 330, 470, 1130, 1290, 1480].flatMap((x) => {
    const y = 205 + r.range(-8, 8), rx = r.range(55, 90), len = r.range(500, 1100);
    return [
      sheet(ribbon(bez([x, y], [x + r.range(-60, 60), y + len * 0.5], [x + r.range(-90, 90), y + len], 12), 6, 3), stem, r, { rim: false }),
      sheet(ellipse(x, y, rx, rx * 0.15, 16), pad, r),
    ];
  });
  const hull: Pt[] = [[530, 150], [1070, 146], ...Array.from({ length: 9 }, (_, k): Pt => [1050 - k * 62.5, 170 + Math.sin((Math.PI * (k + 0.5)) / 9) * 120])];
  const surface: Group = {
    pieces: [sheet(skin, "#7FBFBA", r, { rim: false, opacity: 0.32 }), sheet(rect(-80, -20, W + 160, 110), "#BFE3D6", r, { rim: false, opacity: 0.18 }), ...lilies, sheet(hull, "#06121B", r), sheet(rect(600, 160, 400, 6), darken(C.ember, 0.35), r, { rim: false }), raw(0, W, flecks, true)],
    shadow: [6, 10, 0.35],
    deckle: 3,
  };

  // the nearest walls frame the edges; on phones they fall outside the view, so the middle never relies on them
  const reach = (y: number) => 70 + 120 * (y / H) + 30 * Math.sin(y / 380);
  const grass = [0.18, 0.28, 0.38, 0.44].flatMap((t) => {
    const g = mix(C.leaf1, water(t), 0.25);
    return [...weeds(r.range(40, 140), t * H, r.int(4, 7), r.range(380, 640), 22, g, r), ...weeds(W - r.range(40, 140), (t + 0.03) * H, r.int(4, 7), r.range(380, 640), 22, g, r)];
  });
  const rocks = [0.5, 0.58, 0.66].flatMap((t, i) => {
    const y = t * H, rx = r.range(70, 130);
    return [sheet(ellipse(reach(y) + rx * 0.4, y, rx, rx * 0.62, 9), darken(water(t), 0.5), r), sheet(ellipse(W - reach(y + 200) - rx * 0.3, y + 200 + i * 40, rx * 0.9, rx * 0.55, 9), darken(water(t), 0.5), r)];
  });
  const roots = [0.66, 0.7, 0.75, 0.8].flatMap((t) => [...root(reach(t * H) - 20, t * H, r.range(420, 720), 1, darken(C.root, 0.45), r), ...root(W - reach(t * H) + 20, (t + 0.02) * H, r.range(420, 720), -1, darken(C.root, 0.45), r)]);
  const stone = "#34443D", moss = "#2E5A3B";
  const left = candi(110, H - 110, [[560, 160], [420, 150], [290, 140]], stone, moss, r, 26);
  const right = candi(1480, H - 100, [[600, 170], [440, 150]], stone, moss, r, 26);
  const bed = darken("#1E3A31", 0.3);
  const pebbles = Array.from({ length: 34 }, () => {
    const x = r.range(0, W), s = r.range(8, 22);
    return sheet(ellipse(x, H - 125 + Math.sin(x / 210) * 26 + r.range(10, 70), s, s * 0.6, 8), mix(bed, C.ramp5, r.range(0.08, 0.25)), r);
  });
  return [
    surface,
    { pieces: [shade("wall", H, 0.55), ...walls("wall", 0.05 * H, H, reach, r), ...grass], shadow: [10, 14, 0.45], grain: true, deckle: 4 },
    { pieces: rocks, shadow: [10, 14, 0.5], back: true, grain: true, deckle: 4 },
    { pieces: [...roots, ...left.pieces, ...right.pieces, ...stupa(1480, right.top, 2.1, stone, r), floor(H - 130, H, bed, r), ...pebbles], shadow: [10, 14, 0.5], grain: true, deckle: 4 },
    { pieces: [motes(r, 40, 0.44 * H, 0.78 * H, [C.lanternCore, C.lantern], [3, 6], [0.15, 0.35])] },
  ];
}

/* ---------------------------------------------------------------- paper + build */

/** Groups to one svg: each treated group is drawn once as #a{i}; its alpha masks the baked shadow, backlight and grain passes. */
function paperSvg(groups: Group[], vx: number, w: number, h: number): string {
  const box = `x="${vx - 120}" y="-120" width="${w + 240}" height="${h + 240}"`;
  const through = (i: number, fill: string, op: number, dx = 0, dy = 0) =>
    `<rect ${box} fill="${fill}" opacity="${op}" mask="url(#m${i})"${dx || dy ? ` transform="translate(${dx} ${dy})"` : ""}/>`;
  let defs = "", body = "", tops = "", all = "", grain = false;
  groups.forEach((g, i) => {
    const art = deckle(g.pieces.filter((p) => !p.top).map((p) => p.svg).join(""), g.deckle ?? 0);
    const top = g.pieces.filter((p) => p.top).map((p) => p.svg).join("");
    tops += top;
    all += art + top;
    if (!g.shadow && !g.back && !g.grain) return void (body += art);
    defs += `<g id="a${i}">${art}</g><mask id="m${i}" maskUnits="userSpaceOnUse" ${box} style="mask-type:alpha"><use href="#a${i}"/></mask>`;
    if (g.back) for (const [dx, dy] of [[-4, -3], [4, -3], [0, -5]] as const) body += through(i, "#F2C77A", 0.07, dx, dy);
    if (g.shadow) {
      const [dx, dy, o] = g.shadow;
      body += through(i, "#03060C", o * 0.45, dx, dy) + through(i, "#03060C", Math.min(0.8, o + 0.2), dx * 0.25 + 1, dy * 0.25 + 1);
    }
    body += `<use href="#a${i}"/>`;
    if (g.grain) {
      grain = true;
      body += through(i, "url(#g)", 0.35);
    }
  });
  const d = (grain ? GRAIN : "") + defs + glowIds(all).map(GLOW_DEF).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vx} 0 ${w} ${h}" preserveAspectRatio="none">${d ? `<defs>${d}</defs>` : ""}${body}${tops}</svg>`;
}

/** Writes public/art/deep/{back,mid,near}.svg (overwrites in place; the folder is never removed, iCloud makes conflict copies). */
export function buildDeep(dir = "public/art/deep") {
  mkdirSync(dir, { recursive: true });
  let total = 0;
  for (const [name, H, make, seed] of [["back", 3200, back, 1], ["mid", 4600, mid, 2], ["near", 6000, near, 3]] as const) {
    const svg = paperSvg(make(rng(SEED + seed), H), 0, W, H);
    writeFileSync(`${dir}/${name}.svg`, svg);
    const gz = gzipSync(svg).length;
    total += gz;
    console.log(`deep ${name.padEnd(4)} ${W}x${H}  ${(gz / 1024).toFixed(0)} KB gz`);
  }
  console.log(`deep total ${(total / 1024).toFixed(0)} KB gz`);
}
