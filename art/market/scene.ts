// The night market's scene art (everything except the stalls): sky, far end of the lane, floor, entrance gate, light strings,
// the pier at the lane's end and the walker. Flat layered paper in the river's night palette under warm market light.
// Each generator returns paper Groups (art/market/build.ts wraps them: shadow under the sheets, backlight, grain, deckle).
import { C, darken, ellipse, glow, hazed, kawung, lantern, leaf, lighten, mix, palm, poly, raw, rect, reeds, sheet, type Piece, type Pt, type Rng } from "../helpers";
import { H, M, OVER, VP, W, type Rect } from "./types";

/** One stack of sheets with the same papercut treatment. shadow = [dx, dy, opacity] baked under it; back = warm backlight rim; grain = fibre. */
export type Group = { pieces: Piece[]; shadow?: [number, number, number]; back?: boolean; grain?: boolean; deckle?: number };

const X0 = -OVER;
const XW = W + 2 * OVER;
const sc = (d: number) => 1 / (1 + 0.9 * d); // runtime scale at depth d (see types.ts)
const gy = (s: number) => VP[1] + 570 * s; // ground y of a lane point seen at scale s (a stall anchor rests at y 990)
const circ = (cx: number, cy: number, rad: number, n = 18) => ellipse(cx, cy, rad, rad, n);

/** Quadratic bezier points. */
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

const gradient = (id: string, x: number, w: number, stops: [number, string][], h = H) =>
  raw(x, x + w, `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient></defs><rect x="${x}" y="0" width="${w}" height="${h}" fill="url(#${id})"/>`);

/** Scattered pin-prick stars as one path. */
function stars(r: Rng, n: number, x0: number, w: number, yMax: number, fill: string): Piece {
  let d = "";
  for (let k = 0; k < n; k++) {
    const x = x0 + r() * w, y = yMax * Math.pow(r(), 1.5), a = r.range(1, 2.1);
    d += k % 9 === 0 ? poly([[x, y - a * 2.4], [x + a * 0.5, y - a * 0.5], [x + a * 2.4, y], [x + a * 0.5, y + a * 0.5], [x, y + a * 2.4], [x - a * 0.5, y + a * 0.5], [x - a * 2.4, y], [x - a * 0.5, y - a * 0.5]]) : poly([[x, y - a], [x + a, y], [x, y + a], [x - a, y]]);
  }
  return raw(x0, x0 + w, `<path d="${d}" fill="${fill}" opacity=".8"/>`);
}

/** A flat-bottomed paper cloud: bumpy top, wide base. */
function cloud(cx: number, cy: number, wd: number, ht: number, fill: string, r: Rng): Piece[] {
  const n = r.int(5, 7);
  const top: Pt[] = Array.from({ length: n + 1 }, (_, k) => [cx - wd / 2 + (wd * k) / n, cy - ht * Math.pow(Math.sin((Math.PI * k) / n), 0.7) * (k === 0 || k === n ? 1 : r.range(0.55, 1))]);
  const body = sheet([...top, [cx + wd / 2 - 14, cy + ht * 0.12], [cx - wd / 2 + 20, cy + ht * 0.1]], fill, r);
  const lit = sheet([[cx - wd * 0.42, cy + ht * 0.02], [cx + wd * 0.4, cy], [cx + wd * 0.3, cy + ht * 0.1], [cx - wd * 0.3, cy + ht * 0.1]], mix(fill, C.lantern, 0.35), r, { rim: false, opacity: 0.55 });
  return [body, lit];
}

/* ---------------------------------------------------------------- sky */

export function sky(r: Rng): Group[] {
  const grad = gradient("ng", X0, XW, [[0, "#04070F"], [0.2, C.ramp0], [0.3, mix(C.ramp1, C.ramp2, 0.6)], [0.37, mix(C.ramp3, C.ember, 0.28)], [0.42, mix(C.ramp3, C.ember, 0.55)], [0.5, "#2A1D1E"], [1, "#120F10"]]);
  const clouds: Piece[] = [];
  for (const [x, y, w, h] of [[120, 150, 420, 56], [980, 110, 480, 62], [1560, 220, 380, 46], [-260, 250, 360, 40], [560, 300, 300, 30], [1250, 330, 340, 30]] as const) {
    const warm = Math.min(1, y / 340);
    clouds.push(...cloud(x, y, w, h, mix(mix(C.ramp3, C.ramp1, 0.45), C.dawnRose, warm * 0.28), r));
  }
  return [
    { pieces: [grad, stars(r, 150, X0, XW, 330, C.moon), glow(VP[0], 430, 760, C.lantern, 0.3), glow(VP[0], 425, 280, C.lanternCore, 0.28)] },
    { pieces: clouds, shadow: [3, 6, 0.25], grain: true, deckle: 1.2 },
  ];
}

/* ---------------------------------------------------------------- far end of the lane */

export function bianglala(cx: number, cy: number, R: number, r: Rng): Piece[] {
  const SIL = mix(C.ramp2, "#3A2430", 0.4);
  const out: Piece[] = [];
  const base = cy + R + 38; // legs end on the ground
  for (const dir of [-1, 1]) out.push(sheet(poly([[cx - 5, cy], [cx + 5, cy], [cx + dir * 74 + 6, base], [cx + dir * 74 - 6, base]]), SIL, r, { rim: false }));
  out.push(sheet(poly([[cx - 80, base - 22], [cx + 80, base - 22], [cx + 80, base - 17], [cx - 80, base - 17]]), SIL, r, { rim: false }));
  out.push(sheet(circ(cx, cy, R, 28), SIL, r, { holes: [poly(circ(cx, cy, R - 6, 28))], rim: false }));
  out.push(sheet(circ(cx, cy, R * 0.52, 20), SIL, r, { holes: [poly(circ(cx, cy, R * 0.52 - 4, 20))], rim: false }));
  const N = 12;
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    out.push(sheet(poly([[cx - sa * 1.6, cy + ca * 1.6], [cx + sa * 1.6, cy - ca * 1.6], [cx + ca * R + sa * 1.6, cy + sa * R - ca * 1.6], [cx + ca * R - sa * 1.6, cy + sa * R + ca * 1.6]]), SIL, r, { rim: false }));
  }
  // rim bulbs, then lit gondolas hanging off the ring
  let bulbs = "";
  for (let k = 0; k < 48; k++) {
    const a = (k / 48) * Math.PI * 2;
    bulbs += poly(circ(cx + Math.cos(a) * (R + 2), cy + Math.sin(a) * (R + 2), 2, 4));
  }
  out.push(raw(cx - R, cx + R, `<path d="${bulbs}" fill="${C.lanternCore}" opacity=".9"/>`));
  const cols = [C.lantern, C.lanternCore, C.dawnRose, C.ember];
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2 + 0.26;
    const gx = cx + Math.cos(a) * R, gyy = cy + Math.sin(a) * R;
    out.push(sheet(poly([[gx - 1, gyy], [gx + 1, gyy], [gx + 1, gyy + 9], [gx - 1, gyy + 9]]), SIL, r, { rim: false }));
    out.push(sheet(poly([[gx - 8, gyy + 9], [gx + 8, gyy + 9], [gx + 7, gyy + 24], [gx - 7, gyy + 24]]), cols[k % 4]!, r, { rim: false }));
    out.push(sheet(poly([[gx - 10, gyy + 7], [gx, gyy + 2], [gx + 10, gyy + 7]]), SIL, r, { rim: false }));
    out.push(glow(gx, gyy + 16, 26, C.lantern, 0.42));
  }
  out.push(sheet(circ(cx, cy, 9, 8), SIL, r));
  out.push(glow(cx, cy, 20, C.lantern, 0.4));
  return out;
}

export function far(r: Rng): Group[] {
  // the silhouette treeline and the wheel behind the roofs
  const tree = mix(C.ramp1, C.leaf1, 0.5);
  const line: Pt[] = [[X0, 450]];
  for (let x = X0; x <= X0 + XW; x += 34) line.push([x, 372 + Math.sin(x / 90) * 14 + r.range(-18, 14) - (Math.abs(x - 800) < 300 ? 18 : 0)]);
  line.push([X0 + XW, 450]);
  const back: Piece[] = [...bianglala(1195, 245, 128, r), sheet(line, tree, r, { rim: false })];
  let win = "";
  for (let k = 0; k < 40; k++) {
    const x = X0 + r() * XW, y = r.range(395, 424);
    win += poly([[x, y], [x + 3, y], [x + 3, y + 3], [x, y + 3]]);
  }
  back.push(raw(X0, X0 + XW, `<path d="${win}" fill="${C.window}" opacity=".7"/>`));

  // rows of tiny stalls along the lane, back to front; ground point of a row at depth d is VP + (anchor - VP) * s
  const rows: { d: number; x: number; s: number }[] = [];
  const spacing = [1, 2.6, 4.6, 7];
  for (let d = 5.4; d < 48; d += 0.85 + d * 0.09)
    for (const sg of [-1, 1])
      for (const o of spacing) {
        const s = sc(d);
        const x = VP[0] + sg * 420 * o * s + r.range(-8, 8) * s;
        if (x > X0 + 20 && x < X0 + XW - 20) rows.push({ d, x, s });
      }
  rows.sort((a, b) => b.d - a.d);
  const tarps = [M.tarpRed, M.tarpTeal, M.tarpCream, M.tarpYellow, M.tarpRedDk];
  const stalls: Piece[] = [];
  for (const { d, x, s } of rows) {
    const by = gy(s), w = 520 * s * r.vary(), h = 460 * s * r.vary(), z = Math.min(0.7, 0.2 + d / 45);
    const rim = s > 0.07;
    const tarp = hazed(r.pick(tarps), z);
    stalls.push(sheet(poly([[x - w / 2, by], [x + w / 2, by], [x + w / 2, by - h * 0.55], [x - w / 2, by - h * 0.55]]), hazed(mix(M.woodDk, tarp, 0.2), z), r, { rim }));
    stalls.push(sheet(poly([[x - w * 0.4, by - h * 0.06], [x + w * 0.4, by - h * 0.06], [x + w * 0.4, by - h * 0.5], [x - w * 0.4, by - h * 0.5]]), mix(C.lantern, C.window, r()), r, { rim: false, opacity: 0.92 }));
    const roof: Pt[] = [[x - w * 0.62, by - h * 0.52], [x - w * 0.12, by - h], [x + w * 0.12, by - h], [x + w * 0.62, by - h * 0.52], [x + w * 0.5, by - h * 0.44], [x - w * 0.5, by - h * 0.44]];
    stalls.push(sheet(poly(roof), tarp, r, { rim }));
    if (s > 0.05) stalls.push(sheet(poly([[x - w * 0.62, by - h * 0.52], [x + w * 0.62, by - h * 0.52], [x + w * 0.5, by - h * 0.44], [x - w * 0.5, by - h * 0.44]]), darken(tarp, 0.3), r, { rim: false }));
    if (d < 36) stalls.push(glow(x, by - h * 0.3, w * 1.1, C.lantern, 0.28));
  }

  // crowd: cut-paper silhouettes near the far end of the lane
  const crowd: Piece[] = [];
  const folks = Array.from({ length: 70 }, () => ({ d: r.range(6, 26), u: r.range(-1, 1) })).sort((a, b) => b.d - a.d);
  for (const { d, u } of folks) {
    const s = sc(d), by = gy(s) + r.range(-2, 6) * s, x = VP[0] + u * 330 * s, h = 400 * s * r.range(0.85, 1.1), w = h * 0.34;
    const col = mix(C.ramp0, r.pick([M.tarpRedDk, M.tarpTealDk, C.ramp2, M.woodDk]), 0.35);
    const rim = s > 0.1;
    crowd.push(sheet(poly([[x - w * 0.3, by], [x - w * 0.05, by], [x, by - h * 0.4], [x + w * 0.05, by], [x + w * 0.3, by], [x + w * 0.5, by - h * 0.62], [x + w * 0.28, by - h * 0.8], [x - w * 0.28, by - h * 0.8], [x - w * 0.5, by - h * 0.62]]), col, r, { rim }));
    crowd.push(sheet(circ(x, by - h * 0.9, h * 0.1, 8), col, r, { rim }));
  }
  return [
    { pieces: back, shadow: [2, 3, 0.3], deckle: 0.8 },
    { pieces: [glow(VP[0], 438, 330, C.lantern, 0.6), glow(VP[0], 440, 110, C.lanternCore, 0.5)] },
    { pieces: stalls, shadow: [1.5, 2.5, 0.3], deckle: 0.6 },
    { pieces: crowd, shadow: [1, 2, 0.35] },
  ];
}

/* ---------------------------------------------------------------- lane floor */

export function floor(r: Rng): Group[] {
  const hy = VP[1];
  const earth = mix(C.ramp1, M.woodDk, 0.45);
  const lane = mix(earth, M.woodLt, 0.12);
  const edge = (y: number) => (y - hy) * 1.55;
  const trap = (y0: number, y1: number, k = 1): Pt[] => [[VP[0] - edge(y0) * k, y0], [VP[0] + edge(y0) * k, y0], [VP[0] + edge(y1) * k, y1], [VP[0] - edge(y1) * k, y1]];
  const verge: Piece[] = [sheet(poly([[X0, hy], [X0 + XW, hy], [X0 + XW, H], [X0, H]]), earth, r, { rim: false })];
  const ground: Piece[] = [sheet(poly(trap(hy, H + 40)), lane, r)];
  // packed-earth bands: alternating strips at equal depth steps
  for (let k = 0, d = 0.04; d < 60; k++) {
    const d1 = d * 1.35 + 0.15;
    if (k % 2 === 0) ground.push(sheet(poly(trap(gy(sc(d1)), gy(sc(d)))), lighten(lane, 0.035), r, { rim: false }));
    d = d1;
  }
  // cart ruts
  for (const sg of [-1, 1]) ground.push(sheet(poly([[VP[0] + sg * 1, hy], [VP[0] + sg * 3, hy], [VP[0] + sg * 250, H], [VP[0] + sg * 200, H]]), darken(lane, 0.35), r, { rim: false, opacity: 0.5 }));
  // lane edge lips
  for (const sg of [-1, 1]) ground.push(sheet(poly([[VP[0] + sg * 6, hy], [VP[0] + sg * 9, hy], [VP[0] + sg * 1560, H + 40], [VP[0] + sg * 1500, H + 40]]), darken(earth, 0.4), r, { rim: false }));

  const wet: Piece[] = [];
  for (const [u, d] of [[-0.5, 0.3], [0.45, 0.7], [-0.15, 1.5], [0.6, 2.4], [-0.62, 3.4], [0.1, 5], [-0.35, 8], [0.4, 11]] as const) {
    const s = sc(d), y = gy(s), x = VP[0] + u * edge(y) * 0.85, rx = 150 * s * r.vary(), ry = rx * 0.15;
    const dark = mix(C.water3, M.woodDk, 0.2);
    wet.push(sheet(ellipse(x, y, rx, ry, 14), dark, r, { rim: false }));
    wet.push(sheet(ellipse(x + rx * 0.1, y, rx * 0.6, ry * 0.55, 12), mix(C.waterHi, C.lantern, 0.62), r, { rim: false, opacity: 0.5 }));
    for (const dx of [-0.3, 0.05, 0.4]) wet.push(sheet(poly([[x + dx * rx - rx * 0.03, y - ry * 0.7], [x + dx * rx + rx * 0.03, y - ry * 0.7], [x + dx * rx + rx * 0.02, y + ry * 0.7], [x + dx * rx - rx * 0.02, y + ry * 0.7]]), C.lanternCore, r, { rim: false, opacity: 0.45 }));
    wet.push(glow(x, y, rx * 1.3, C.lantern, 0.22));
  }
  // fallen leaves and paper scraps
  const scraps: Piece[] = [];
  for (let k = 0; k < 70; k++) {
    const d = r.range(0.1, 14), s = sc(d), y = gy(s) + r.range(0, 14) * s, u = r.range(-1, 1), x = VP[0] + u * edge(y), z = r.range(7, 17) * s * 2.5, a = r.range(0, Math.PI);
    const col = r.pick([C.leaf3, M.tarpRed, M.tarpYellow, M.tarpCream, C.leaf2, M.sack]);
    const c = Math.cos(a) * z, sn = Math.sin(a) * z * 0.35;
    scraps.push(sheet(poly([[x - c, y - sn], [x + sn * 2, y - z * 0.18], [x + c, y + sn], [x - sn * 2, y + z * 0.18]]), darken(col, 0.25), r, { rim: false }));
  }
  return [
    { pieces: verge, grain: true },
    { pieces: ground, shadow: [0, -2, 0.3], grain: true, deckle: 0.8 },
    { pieces: wet },
    { pieces: scraps, shadow: [1, 1.5, 0.3] },
    { pieces: [glow(VP[0], hy + 14, 520, C.lantern, 0.3), glow(VP[0], hy + 60, 260, C.lanternCore, 0.2)] },
  ];
}

/* ---------------------------------------------------------------- entrance gate */

/** A spiral of janur (young coconut leaf) from (cx, cy), r0 outer radius. */
function janur(cx: number, cy: number, r0: number, dir: 1 | -1, r: Rng): Piece[] {
  const pts: Pt[] = Array.from({ length: 16 }, (_, k) => {
    const t = k / 15, a = Math.PI / 2 + dir * t * 2.7 * Math.PI, rad = r0 * (1 - 0.72 * t);
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
  });
  const col = mix(C.leaf3, C.dawnGold, 0.42);
  return [sheet(poly(ribbon(pts, 13, 3)), col, r), sheet(poly(ribbon(pts.slice(0, 11), 3, 1)), lighten(col, 0.3), r, { rim: false })];
}

export function gate(r: Rng): { groups: Group[]; banner: Rect; steam: [number, number][] } {
  const bam = mix(C.bamboo, M.woodDk, 0.5);
  const bamLt = lighten(bam, 0.18);
  const out: Piece[] = [];
  const post = (x: number) => {
    out.push(sheet(rect(x - 14, 70, 28, 940), bam, r), sheet(rect(x - 14, 70, 8, 940), bamLt, r, { rim: false }));
    for (let y = 150; y < 1000; y += r.range(95, 130)) out.push(sheet(rect(x - 18, y, 36, 7), darken(bam, 0.35), r, { rim: false }));
  };
  post(95);
  post(W - 95);
  // crossbeam, a second thinner bamboo under it, and lashings
  out.push(sheet(rect(34, 84, W - 68, 28), bam, r), sheet(rect(34, 84, W - 68, 8), bamLt, r, { rim: false }));
  out.push(sheet(rect(70, 116, W - 140, 12), darken(bam, 0.15), r));
  for (let x = 220; x < W - 200; x += r.range(160, 230)) out.push(sheet(rect(x, 82, 7, 32), darken(bam, 0.4), r, { rim: false }));
  for (const x of [95, W - 95]) out.push(sheet(rect(x - 22, 76, 44, 18), C.ember, r, { rim: false }), sheet(rect(x - 22, 112, 44, 14), C.ember, r, { rim: false }));
  // penjor: bamboo arching in from each post top, hung with janur tassels
  for (const sg of [-1, 1]) {
    const x = sg < 0 ? 95 : W - 95;
    const arch = bez([x, 82], [x, -50], [x + sg * 190, 16], 14);
    out.push(sheet(poly(ribbon(arch, 13, 5)), bam, r));
    for (let k = 4; k <= 14; k += 2) out.push(leaf(arch[k]![0], arch[k]![1] + 2, 180 + sg * r.range(-8, 14), r.range(50, 85), 6, mix(C.leaf3, C.dawnGold, 0.3), r, false));
  }
  // janur curls hanging from the beam
  for (const x of [190, 320, W - 190, W - 320]) {
    out.push(sheet(rect(x - 1.5, 128, 3, 16), darken(bam, 0.3), r, { rim: false }), ...janur(x, 176, r.range(30, 38), x < W / 2 ? 1 : -1, r));
  }
  // the blank cloth banner: rods, cloth with swallow-tail hem, ties
  const BX = 490, BW = 620, BY = 128, BH = 152;
  for (const x of [BX + 40, BX + BW - 40]) out.push(sheet(rect(x - 1.5, 112, 3, 22), darken(bam, 0.3), r, { rim: false }));
  out.push(sheet(rect(BX - 14, BY - 6, BW + 28, 8), bam, r));
  out.push(sheet([[BX, BY], [BX + BW, BY], [BX + BW, BY + BH], [BX + BW - 40, BY + BH - 14], [BX + BW - 80, BY + BH], [BX + 80, BY + BH], [BX + 40, BY + BH - 14], [BX, BY + BH]], M.cloth, r));
  out.push(sheet(rect(BX, BY + 2, BW, 10), mix(M.cloth, M.sack, 0.4), r, { rim: false }), sheet(rect(BX, BY + BH - 14, BW, 5), mix(M.cloth, M.sack, 0.4), r, { rim: false }));
  for (const x of [BX + 14, BX + BW - 14]) out.push(sheet(poly([[x - 4, BY + BH - 8], [x + 4, BY + BH - 8], [x + 6, BY + BH + 30], [x - 6, BY + BH + 30]]), C.ember, r, { rim: false }));
  out.push(glow(800, BY + BH / 2, 420, C.lantern, 0.16));
  // small lanterns along the beam and on arms off the posts
  for (const x of [250, 420, 1180, 1350]) out.push(...lantern(x, 126, r, 0.9));
  for (const [x, sg] of [[95, 1], [W - 95, -1]] as const) {
    out.push(sheet(rect(Math.min(x, x + sg * 90), 308, 90, 8), bam, r, { rim: false }), ...lantern(x + sg * 90, 316, r, 0.75));
  }

  // gerobak: the food cart with a pot, in front of the left post
  const wood = M.wood, woodLt = M.woodLt;
  out.push(sheet(poly([[70, 718], [480, 718], [480, 868], [70, 868]]), wood, r, { holes: kawung(110, 800, 330, 50, 10) }));
  out.push(sheet(rect(54, 698, 446, 24), woodLt, r));
  for (const x of [96, 440]) out.push(sheet(rect(x, 868, 18, 118), M.woodDk, r));
  // handle bars + cross strut
  out.push(sheet(poly([[60, 790], [70, 780], [-10, 920], [-24, 914]]), M.woodDk, r), sheet(poly([[60, 830], [70, 822], [4, 944], [-10, 938]]), M.woodDk, r));
  // cartwheel: rim ring, spokes, hub
  const wx = 300, wy = 922, wr = 72;
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    out.push(sheet(poly([[wx - sa * 3, wy + ca * 3], [wx + sa * 3, wy - ca * 3], [wx + ca * wr + sa * 3, wy + sa * wr - ca * 3], [wx + ca * wr - sa * 3, wy + sa * wr + ca * 3]]), M.woodDk, r, { rim: false }));
  }
  out.push(sheet(circ(wx, wy, wr, 24), M.woodDk, r, { holes: [poly(circ(wx, wy, wr - 12, 24))] }), sheet(circ(wx, wy, 11, 8), woodLt, r));
  // canopy over the cart: slanted teal tarp with scalloped valance
  out.push(sheet(poly([[36, 640], [120, 556], [440, 556], [520, 640]]), M.tarpTeal, r));
  out.push(sheet(poly([[120, 556], [440, 556], [420, 580], [140, 580]]), lighten(M.tarpTeal, 0.12), r, { rim: false }));
  const val: Pt[] = [[36, 640], [520, 640]];
  for (let x = 520; x >= 36; x -= 44) val.push([x - 22, 672], [x - 44 < 36 ? 36 : x - 44, 640]);
  out.push(sheet(poly(val), M.tarpTealDk, r));
  for (const x of [88, 468]) out.push(sheet(rect(x - 4, 640, 8, 62), M.woodDk, r, { rim: false }));
  // pot: tin body, dark band, ears, lid with knob, a ladle; bowls beside it
  out.push(sheet(poly([[206, 636], [340, 636], [358, 700], [188, 700]]), M.tin, r));
  out.push(sheet(poly([[200, 660], [346, 660], [350, 672], [196, 672]]), M.tinDk, r, { rim: false }));
  out.push(sheet(rect(176, 648, 14, 8), M.tinDk, r, { rim: false }), sheet(rect(356, 648, 14, 8), M.tinDk, r, { rim: false }));
  out.push(sheet(poly([[200, 636], [346, 636], [332, 620], [214, 620]]), lighten(M.tin, 0.15), r), sheet(circ(273, 614, 7, 8), M.tinDk, r));
  out.push(sheet(poly([[388, 698], [452, 698], [446, 676], [394, 676]]), M.tarpCream, r), sheet(poly([[394, 676], [446, 676], [442, 656], [398, 656]]), lighten(M.tarpCream, 0.1), r));
  out.push(...lantern(140, 640, r, 0.6), glow(273, 660, 120, C.ember, 0.28));

  return { groups: [{ pieces: out, shadow: [7, 12, 0.5], back: true, grain: true, deckle: 1.4 }], banner: [510, 146, 580, 114], steam: [[262, 612], [288, 606]] };
}

/* ---------------------------------------------------------------- string of bulbs */

export const STRING_H = 220;
const bulbCount = 16;
const wireY = (x: number) => 20 + 120 * (1 - ((x - 800) / 800) ** 2);
/** [x, y] of each bulb's centre, shared by the dark and lit strings. */
const bulbAt = (): Pt[] => Array.from({ length: bulbCount }, (_, k) => {
  const x = 56 + (k * (W - 112)) / (bulbCount - 1);
  return [x, wireY(x) + 14 + (k % 3) * 5 + 14] as Pt;
});

export function string(r: Rng): { dark: Group[]; lit: Group[] } {
  const wire: Pt[] = Array.from({ length: 41 }, (_, k) => [(k * W) / 40, wireY((k * W) / 40)]);
  const pieces: Piece[] = [sheet(poly(ribbon(wire, 4)), C.ramp1, r, { rim: false })];
  const lit: Piece[] = [];
  for (const [x, y] of bulbAt()) {
    const wy = wireY(x);
    const cap = sheet(rect(x - 4.5, y - 21, 9, 8), C.ramp1, r, { rim: false });
    pieces.push(sheet(rect(x - 1, wy, 2, y - 18 - wy), C.ramp1, r, { rim: false }), cap);
    pieces.push(sheet(ellipse(x, y, 10, 13, 10), mix(C.ramp2, C.ember, 0.18), r));
    lit.push(cap, sheet(ellipse(x, y, 10, 13, 10), C.lantern, r), sheet(ellipse(x, y + 1, 6, 8, 8), C.lanternCore, r, { rim: false }), glow(x, y, 56, C.lantern, 0.55));
  }
  return { dark: [{ pieces, shadow: [3, 5, 0.35], deckle: 0.6 }], lit: [{ pieces: lit }] };
}

/* ---------------------------------------------------------------- pier (the last view) */

export function pier(r: Rng): Group[] {
  const HY = 410; // horizon
  const skyG = gradient("pg", 0, W, [[0, "#04070F"], [0.2, C.ramp0], [0.34, C.ramp2], [0.4, mix(C.ramp3, C.ember, 0.22)], [0.41, mix(C.ramp4, C.ember, 0.18)], [0.5, C.water2], [1, C.water3]]);
  const moon = [sheet(circ(1230, 150, 48, 20), C.moon, r, { rim: false }), sheet(circ(1246, 144, 40, 18), C.moonShade, r, { rim: false, opacity: 0.35 }), glow(1230, 150, 190, C.moon, 0.3)];
  const clouds: Piece[] = [];
  for (const [x, y, w, h] of [[240, 140, 380, 44], [820, 250, 320, 32], [1380, 300, 300, 28]] as const) clouds.push(...cloud(x, y, w, h, mix(C.ramp3, C.ramp1, 0.5), r));

  // far bank: two ridges, palms, a few lit windows
  const ridge = (base: number, amp: number, step: number, fill: string, ph: number) => {
    const p: Pt[] = [[0, HY + 8]];
    for (let x = 0; x <= W; x += step) p.push([x, base - amp * (0.5 + 0.5 * Math.sin(x / 140 + ph)) + r.range(-8, 8)]);
    p.push([W, HY + 8]);
    return sheet(p, fill, r, { rim: false });
  };
  const bank: Piece[] = [ridge(HY - 40, 70, 40, hazed(C.ramp3, 0.25), 1), ridge(HY - 14, 30, 36, mix(C.ramp2, C.leaf1, 0.4), 4)];
  for (const x of [160, 420, 640, 1010, 1330, 1500]) bank.push(...palm(x, HY + 2, r.range(70, 120), r, mix(C.ramp1, C.leaf1, 0.6)));
  for (let k = 0; k < 16; k++) {
    const x = r.range(40, 1560), y = r.range(HY - 18, HY - 2);
    bank.push(sheet(rect(x, y, 5, 4), C.window, r, { rim: false, opacity: 0.85 }), glow(x + 2, y + 2, 14, C.lantern, 0.4));
  }

  // river: ripple dashes growing toward the viewer, moon and lantern streaks
  const water: Piece[] = [];
  for (let k = 0; k < 120; k++) {
    const t = Math.pow(r(), 1.6), y = HY + 12 + t * 560, w = (24 + t * 150) * r.range(0.6, 1.3), x = r.range(-40, W), hh = 1.5 + t * 3.5;
    water.push(sheet(poly([[x, y], [x + w, y - hh * 0.4], [x + w * 0.9, y + hh], [x + 6, y + hh]]), mix(C.water2, C.waterHi, r.range(0.2, 0.7)), r, { rim: false, opacity: 0.55 }));
  }
  for (let y = HY + 14, k = 0; y < 640; y += 9 + k * 2.2, k++) water.push(sheet(poly([[1230 - 26 - k * 6, y], [1230 + 26 + k * 6, y], [1230 + 18 + k * 5, y + 3], [1230 - 18 - k * 5, y + 3]]), C.moon, r, { rim: false, opacity: 0.32 - k * 0.012 }));

  // jetty in perspective: deck rows lit warmer toward the viewer, side beams, piles, rails
  const topY = 560, botY = 990;
  const lx = (y: number) => 740 - ((y - topY) / (botY - topY)) * 340;
  const rx = (y: number) => 860 + ((y - topY) / (botY - topY)) * 340;
  const deck: Piece[] = [];
  const piles: Piece[] = [];
  for (const sg of [-1, 1]) for (const t of [0.02, 0.12, 0.3, 0.55]) {
    const y = topY + t * (botY - topY), x = sg < 0 ? lx(y) : rx(y), s = 0.35 + t * 0.65;
    piles.push(sheet(rect(x - 9 * s, y, 18 * s, 70 * s), M.woodDk, r));
  }
  deck.push(sheet(poly([[lx(topY) + 2, topY + 4], [rx(topY) - 2, topY + 4], [rx(botY) - 6, botY + 4], [lx(botY) + 6, botY + 4]]), darken(M.woodDk, 0.4), r, { rim: false }));
  let y = topY, k = 0;
  while (y < botY) {
    const dy = 7 + ((y - topY) / (botY - topY)) * 32, y1 = Math.min(botY, y + dy), t = (y - topY) / (botY - topY);
    const warm = mix(mix(M.woodDk, M.wood, 0.7), mix(M.woodLt, C.lantern, 0.5), Math.pow(t, 1.3) * 0.9);
    deck.push(sheet(poly([[lx(y) , y], [rx(y), y], [rx(y1), y1 - 1.4], [lx(y1), y1 - 1.4]]), k % 2 ? darken(warm, 0.08) : warm, r, { rim: false }));
    y = y1;
    k++;
  }
  for (const sg of [-1, 1]) deck.push(sheet(poly([[sg < 0 ? lx(topY) - 10 : rx(topY), topY], [sg < 0 ? lx(topY) : rx(topY) + 10, topY], [sg < 0 ? lx(botY) : rx(botY) + 28, botY], [sg < 0 ? lx(botY) - 28 : rx(botY), botY]]), M.woodDk, r));
  // rail posts with rope, two lit lanterns on the far ones
  const rails: Piece[] = [];
  for (const t of [0.04, 0.2, 0.42, 0.7]) {
    const yy = topY + t * (botY - topY), s = 0.35 + t * 0.65;
    for (const sg of [-1, 1]) {
      const x = sg < 0 ? lx(yy) - 6 * s : rx(yy) + 6 * s;
      rails.push(sheet(rect(x - 8 * s, yy - 150 * s, 16 * s, 150 * s), M.wood, r));
      if (t < 0.3) rails.push(...lantern(x, yy - 150 * s - 4, r, 0.55 + t, true));
    }
  }
  for (const sg of [-1, 1]) {
    const pts: Pt[] = [0.04, 0.2, 0.42, 0.7].map((t) => {
      const yy = topY + t * (botY - topY), s = 0.35 + t * 0.65;
      return [sg < 0 ? lx(yy) - 6 * s : rx(yy) + 6 * s, yy - 110 * s];
    });
    rails.push(sheet(poly(ribbon(pts, 4)), darken(C.bamboo, 0.55), r, { rim: false }));
  }
  // mooring posts at the jetty end with rope coils
  const moor: Piece[] = [];
  for (const x of [724, 876]) {
    moor.push(sheet(rect(x - 12, topY - 50, 24, 62), M.wood, r));
    for (const yy of [topY - 40, topY - 30]) moor.push(sheet(poly([[x - 16, yy], [x, yy - 6], [x + 16, yy], [x, yy + 6]]), darken(C.bamboo, 0.45), r));
  }

  // the sampan moored alongside, lantern lit
  const bx = 1190, by = 706, k2 = 1.9;
  const T = (pts: Pt[]): Pt[] => pts.map(([x, yy]) => [bx + x * k2, by + yy * k2] as Pt);
  const boat: Piece[] = [];
  boat.push(sheet(T([[-132, -26], [-8, -22], [136, -38], [112, 6], [-108, 6]]), mix(C.ramp3, C.ramp2, 0.4), r));
  boat.push(sheet(T([[-132, -26], [-8, -22], [136, -38], [135, -34], [-8, -18], [-131, -22]]), lighten(C.ramp3, 0.3), r, { rim: false }));
  boat.push(sheet(T([[-122, -14], [-4, -11], [126, -26], [124, -22.5], [-4, -7.5], [-121, -10.5]]), C.ember, r, { rim: false }));
  boat.push(sheet(T([[70, -30], [136, -38], [134, -32], [70, -25]]), mix(C.ramp2, C.lantern, 0.55), r, { rim: false }));
  boat.push(sheet(T([[-104, -46], [-60, -46], [-64, -24], [-100, -24]]), darken(C.bamboo, 0.62), r), sheet(T([[-106, -49], [-58, -49], [-58, -45], [-106, -45]]), darken(C.bamboo, 0.45), r, { rim: false }));
  boat.push(sheet(poly(ribbon(T([[115, -26], [152, -194]]), 8, 5)), darken(C.bamboo, 0.45), r));
  const lp: Pt = T([[137, -176]])[0]!;
  boat.push(...lantern(lp[0], lp[1] - 16, r, 1.1, false), glow(lp[0], lp[1] + 24, 140, C.lantern, 0.5));
  const lip = sheet(T([[-134, 4], [-110, 2], [-80, 4], [-50, 2], [-20, 4], [10, 2], [40, 4], [70, 2], [100, 4], [130, 2], [136, 5], [136, 7], [-134, 7]]), mix(C.water2, C.waterHi, 0.25), r, { rim: false });
  const rope = sheet(poly(ribbon(bez([876, topY - 20], [940, topY + 70], [bx - 120 * k2 + 20, by - 40 * k2], 10), 3)), darken(C.bamboo, 0.45), r, { rim: false });
  const refl: Piece[] = [];
  for (let k = 0; k < 7; k++) refl.push(sheet(poly([[lp[0] - 16 + k * 3, by + 20 + k * 20], [lp[0] + 16 - k * 3, by + 20 + k * 20], [lp[0] + 12 - k * 3, by + 25 + k * 20], [lp[0] - 12 + k * 3, by + 25 + k * 20]]), C.lantern, r, { rim: false, opacity: 0.5 - k * 0.06 }));

  // foreground bank: lane end, earth with reeds, warm light from behind the viewer
  const fg: Piece[] = [
    sheet(poly([[-20, 920], [lx(920) - 30, 920], [lx(botY) - 36, botY + 12], [-20, botY + 12]]), mix(C.ramp1, M.woodDk, 0.45), r),
    sheet(poly([[W + 20, 920], [rx(920) + 30, 920], [rx(botY) + 36, botY + 12], [W + 20, botY + 12]]), mix(C.ramp1, M.woodDk, 0.45), r),
    sheet(poly([[-20, 960], [lx(960) - 20, 960], [lx(botY) - 36, botY + 12], [-20, botY + 12]]), mix(C.ramp1, M.woodDk, 0.2), r, { rim: false }),
    ...reeds(70, 940, r, 7, 150, C.leaf1), ...reeds(1520, 945, r, 8, 170, C.leaf1), ...reeds(300, 970, r, 5, 90, C.leaf2),
  ];
  const light: Piece[] = [glow(800, 1060, 760, C.lantern, 0.4), glow(800, 800, 340, C.lantern, 0.14)];

  return [
    { pieces: [skyG, stars(r, 110, 0, W, 330, C.moon), ...moon] },
    { pieces: clouds, shadow: [3, 5, 0.25], grain: true, deckle: 1 },
    { pieces: bank, shadow: [2, 4, 0.35], grain: true, deckle: 1 },
    { pieces: water, deckle: 0 },
    { pieces: [...piles, ...deck], shadow: [5, 8, 0.5], grain: true, deckle: 1.2 },
    { pieces: [...moor, ...rails], shadow: [4, 7, 0.45], back: true, grain: true, deckle: 1 },
    { pieces: [...refl, rope, ...boat, lip], shadow: [5, 8, 0.5], grain: true, deckle: 1.2 },
    { pieces: fg, shadow: [6, -8, 0.4], grain: true, deckle: 2 },
    { pieces: light },
  ];
}

/* ---------------------------------------------------------------- walker */

export const WALKER = { w: 240, h: 420 };

export function walker(r: Rng): Group[] {
  const cx = 96;
  const cloak = C.ramp1;
  const hatC = C.bamboo;
  const out: Piece[] = [];
  // legs and sandals, then the cloak seen from behind
  out.push(sheet(poly([[cx - 26, 394], [cx - 8, 394], [cx - 8, 418], [cx - 34, 418]]), C.ramp0, r), sheet(poly([[cx + 8, 394], [cx + 26, 394], [cx + 34, 418], [cx + 8, 418]]), C.ramp0, r));
  out.push(sheet(poly([[cx - 22, 146], [cx + 22, 146], [cx + 34, 170], [cx + 44, 300], [cx + 60, 402], [cx - 58, 402], [cx - 44, 300], [cx - 34, 170]]), cloak, r));
  out.push(sheet(poly([[cx + 8, 148], [cx + 22, 146], [cx + 34, 170], [cx + 44, 300], [cx + 60, 402], [cx + 14, 402], [cx + 18, 300], [cx + 14, 170]]), darken(cloak, 0.35), r, { rim: false }));
  out.push(sheet(poly([[cx - 34, 170], [cx - 44, 300], [cx - 58, 402], [cx - 48, 402], [cx - 36, 300], [cx - 26, 172]]), lighten(cloak, 0.14), r, { rim: false }));
  out.push(sheet(poly([[cx - 1.5, 160], [cx + 1.5, 160], [cx + 3, 400], [cx - 3, 400]]), darken(cloak, 0.4), r, { rim: false }));
  out.push(sheet(poly([[cx - 40, 262], [cx + 52, 262], [cx + 54, 274], [cx - 42, 274]]), mix(cloak, C.ember, 0.3), r, { rim: false }));
  // bundle on the back
  out.push(sheet(poly([[cx - 26, 176], [cx + 26, 176], [cx + 30, 240], [cx - 30, 240]]), mix(M.sack, C.ramp1, 0.55), r), sheet(poly([[cx - 26, 200], [cx + 26, 200], [cx + 27, 206], [cx - 27, 206]]), darken(M.sack, 0.55), r, { rim: false }));
  // neck, head under the conical hat
  out.push(sheet(poly([[cx - 10, 118], [cx + 10, 118], [cx + 12, 148], [cx - 12, 148]]), darken(C.bamboo, 0.72), r, { rim: false }));
  out.push(sheet(poly([[cx - 56, 126], [cx, 40], [cx + 58, 126]]), hatC, r));
  out.push(sheet(poly([[cx, 40], [cx + 58, 126], [cx + 12, 126]]), darken(hatC, 0.22), r, { rim: false }));
  out.push(sheet(poly([[cx - 46, 100], [cx - 40, 108], [cx + 44, 108], [cx + 38, 100]]), darken(hatC, 0.42), r, { rim: false }));
  out.push(sheet(poly([[cx - 56, 126], [cx + 58, 126], [cx + 48, 136], [cx - 46, 136]]), darken(hatC, 0.35), r));
  // arm out to the right, hand on the bamboo pole; the pole carries the lit lantern
  const hand: Pt = [172, 214];
  out.push(sheet(poly(ribbon([[cx + 28, 160], [cx + 62, 190], hand], 24, 14)), cloak, r));
  out.push(sheet(poly(ribbon([[cx + 30, 164], [cx + 64, 192]], 6, 6)), lighten(cloak, 0.14), r, { rim: false }));
  out.push(sheet(circ(hand[0], hand[1], 8, 8), darken(C.bamboo, 0.7), r, { rim: false }));
  const top: Pt = [196, 74];
  out.push(sheet(poly(ribbon([[hand[0] - 8, hand[1] + 36], top], 7, 4)), darken(C.bamboo, 0.4), r));
  out.push(sheet(poly([[top[0] - 12, top[1] + 8], [top[0] + 2, top[1] - 4], [top[0] + 8, top[1] - 2], [top[0] + 2, top[1] + 2], [top[0] - 6, top[1] + 12]]), darken(C.bamboo, 0.4), r, { rim: false }));
  out.push(...lantern(top[0] - 8, top[1] + 8, r, 1.15, false), glow(top[0] - 8, top[1] + 58, 62, C.lantern, 0.55));
  // warm lantern light on the cloak's right edge
  out.push(sheet(poly([[cx + 26, 168], [cx + 34, 170], [cx + 44, 300], [cx + 40, 300]]), mix(cloak, C.lantern, 0.45), r, { rim: false, opacity: 0.8 }));
  return [{ pieces: out, shadow: [3, 5, 0.3], deckle: 0.7 }];
}
