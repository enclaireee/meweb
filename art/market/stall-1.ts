// Stall 1, DemandX: a grain and goods stall (sacks, dacin balance, crates, ledger, red tarp). Also holds the shared stall kit.
// Every stall is drawn in "L space" (lane on the right, open counter + board on the right); finish() mirrors it for right-hand stalls.
import { C, darken, ellipse, glow, lantern, lighten, mix, poly, rect, sheet, type Piece, type Pt, type Rng, type SheetOpts } from "../helpers";
import { M, SW, type Side, type Slots, type StallArt, type StallGen } from "./types";

export const PI = Math.PI;
export const NR: SheetOpts = { rim: false };

export function kit(r: Rng) {
  const p: Piece[] = [];
  const S = (pts: Pt[], fill: string, o?: SheetOpts) => void p.push(sheet(pts, fill, r, o));
  const B = (x: number, y: number, w: number, h: number, fill: string, o?: SheetOpts) => S(rect(x, y, w, h), fill, o);
  const E = (cx: number, cy: number, rx: number, ry: number, fill: string, o?: SheetOpts, n = 16) => S(ellipse(cx, cy, rx, ry, n), fill, o);
  const G = (x: number, y: number, rad: number, col: string = C.lantern, op = 0.5) => void p.push(glow(x, y, rad, col, op));
  /** Thin straight strip from (x1, y1) to (x2, y2), width w. */
  const ln = (x1: number, y1: number, x2: number, y2: number, w: number, fill: string, o: SheetOpts = NR) => {
    const l = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = (-(y2 - y1) / l) * (w / 2);
    const ny = ((x2 - x1) / l) * (w / 2);
    S([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], fill, o);
  };
  /** Wooden plank wall: a base sheet and dark seams every `step`. */
  const planks = (x: number, y: number, w: number, h: number, fill: string, step = 34, vertical = false) => {
    B(x, y, w, h, fill, NR);
    const seam = darken(fill, 0.5);
    for (let t = step; t < (vertical ? w : h); t += step) vertical ? B(x + t, y, 2.5, h, seam, NR) : B(x, y + t, w, 2.5, seam, NR);
  };
  /** Lower edge of a tarp: `n` semicircular scallops between x0 and x1 hanging from y. */
  const scallops = (x0: number, x1: number, y: number, depth: number, n: number, fills: string[]) => {
    const w = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      const a = x0 + i * w;
      S([[a, y - 2], [a + w, y - 2], ...ptsArc(a + w / 2, y, w / 2, depth)], fills[i % fills.length]!);
    }
  };
  const ptsArc = (cx: number, y: number, rx: number, ry: number): Pt[] => {
    const o: Pt[] = [];
    for (let k = 0; k <= 4; k++) o.push([cx + Math.cos(k * (PI / 4)) * rx, y + Math.sin(k * (PI / 4)) * ry]);
    return o;
  };
  /** Blank cloth banner (the slot) with hem lines and ties. */
  const banner = ([x, y, w, h]: [number, number, number, number]) => {
    ln(x + 36, y - 30, x + 36, y + 6, 3, M.woodDk);
    ln(x + w - 36, y - 30, x + w - 36, y + 6, 3, M.woodDk);
    S(rect(x + 5, y + 7, w, h), "#000", { rim: false, opacity: 0.28 });
    S(rect(x, y, w, h), M.cloth);
    B(x, y, w, 7, darken(M.cloth, 0.13), NR);
    B(x, y + h - 7, w, 7, darken(M.cloth, 0.13), NR);
    S([[x + 4, y + 9], [x + 26, y + 9], [x + 4, y + 40]], lighten(M.cloth, 0.2), NR);
    for (const bx of [x + 20, x + w - 20]) E(bx, y + 18, 4, 4, M.woodDk, NR, 8);
  };
  /** Blank chalkboard in a wood frame, leaning (slot = whole frame). */
  const board = ([x, y, w, h]: [number, number, number, number]) => {
    S(rect(x + 6, y + 8, w, h - 4), "#000", { rim: false, opacity: 0.3 });
    B(x, y, w, h, M.wood);
    B(x + 14, y + 14, w - 28, h - 40, M.chalk, NR);
    S([[x + 30, y + 40], [x + w * 0.55, y + 34], [x + w * 0.5, y + 70], [x + 34, y + 76]], lighten(M.chalk, 0.14), { rim: false, opacity: 0.25 });
    S([[x + w * 0.4, y + h * 0.55], [x + w - 40, y + h * 0.5], [x + w - 46, y + h * 0.7], [x + w * 0.45, y + h * 0.74]], lighten(M.chalk, 0.14), { rim: false, opacity: 0.2 });
    B(x + 6, y + h - 22, w - 12, 12, M.woodLt);
    B(x + 34, y + h - 29, 26, 7, M.cloth, NR);
    B(x + 70, y + h - 28, 14, 6, C.dawnRose, NR);
    for (const [nx, ny] of [[x + 7, y + 7], [x + w - 7, y + 7], [x + 7, y + h - 7], [x + w - 7, y + h - 7]]) E(nx!, ny!, 2.4, 2.4, M.tin, NR, 6);
  };
  /** A nail at the top centre of the nota slot. */
  const nail = (x: number, y: number) => {
    ln(x + 1, y + 2, x + 1, y + 12, 2, "#000", { rim: false, opacity: 0.3 });
    E(x, y + 4, 5, 5, M.tin, NR, 8);
    E(x, y + 4, 2.4, 2.4, M.tinDk, NR, 6);
  };
  const post = (x: number, y0: number, w: number, fill: string = M.wood) => {
    B(x, y0, w, 900 - y0, fill);
    B(x + w * 0.62, y0, w * 0.2, 900 - y0, darken(fill, 0.3), NR);
  };
  /** Lit round lamp with warm core (no kawung holes: cheap). */
  const bulb = (x: number, y: number, rad: number, col: string = M.lampCore, gl = 0) => {
    E(x, y, rad, rad, col, NR, 10);
    if (gl) G(x, y, gl, C.lantern, 0.5);
  };
  return { p, S, B, E, G, ln, planks, scallops, banner, board, nail, post, bulb, r };
}
export type K = ReturnType<typeof kit>;

/** Mirror L-space art for right-hand stalls. */
export function finish(k: K, side: Side, slots: Slots, glows: [number, number, number][] = [], steam: [number, number][] = []): StallArt {
  const mx = ([x, y, w, h]: [number, number, number, number]): [number, number, number, number] => (side === "L" ? [x, y, w, h] : [SW - x - w, y, w, h]);
  const pieces =
    side === "L"
      ? k.p
      : k.p.map((q) => ({ ...q, x0: SW - q.x1, x1: SW - q.x0, svg: `<g transform="translate(${SW} 0) scale(-1 1)">${q.svg}</g>` }));
  return {
    pieces,
    slots: { banner: mx(slots.banner), board: mx(slots.board), nota: mx(slots.nota) },
    glows: glows.map(([x, y, rad]) => [side === "L" ? x : SW - x, y, rad]),
    steam: steam.map(([x, y]) => [side === "L" ? x : SW - x, y]),
  };
}

/** A grain sack (tied neck, folds). */
export const sack = (k: K, x: number, y: number, w: number, h: number, fill: string) => {
  k.S([[x + 6, y + h], [x + w - 6, y + h], [x + w, y + h * 0.55], [x + w - 3, y + h * 0.22], [x + w * 0.64, y + 9], [x + w * 0.6, y - 4], [x + w * 0.4, y - 4], [x + w * 0.36, y + 9], [x + 3, y + h * 0.22], [x, y + h * 0.55]], fill);
  k.B(x + w * 0.36, y + 7, w * 0.28, 5, darken(fill, 0.5), NR);
  k.S([[x + w * 0.12, y + h * 0.32], [x + w * 0.45, y + h * 0.5], [x + w * 0.12, y + h * 0.66]], darken(fill, 0.2), NR);
  k.S([[x + w * 0.88, y + h * 0.4], [x + w * 0.62, y + h * 0.56], [x + w * 0.88, y + h * 0.78]], lighten(fill, 0.12), NR);
};

const stall: StallGen = (r, side) => {
  const k = kit(r);
  const { S, B, E, G, ln } = k;
  const TOP = 676; // counter top
  // dim back wall and a high shelf of small sacks
  k.planks(30, 300, 700, TOP - 300, mix(M.woodDk, C.ramp1, 0.4), 34);
  B(30, 300, 700, 60, C.ramp0, { rim: false, opacity: 0.4 });
  // sack pyramid
  const tones = [M.sack, mix(M.sack, M.tarpCream, 0.3), darken(M.sack, 0.15), mix(M.sack, M.tarpYellow, 0.3)];
  const base = [300, 392, 484];
  base.forEach((x, i) => sack(k, x, 590, 96, 100, tones[(i + 1) % 4]!));
  [346, 438].forEach((x, i) => sack(k, x, 504, 96, 96, tones[(i + 2) % 4]!));
  sack(k, 392, 418, 96, 96, tones[0]!);
  // an open sack with grain on the left of the counter-top (small, sits at the nota edge)
  sack(k, 540, 600, 70, 80, tones[2]!);
  // dacin: rope from the awning, steelyard beam, pan of grain left, iron weight right
  const px = 628;
  ln(px, 340, px, 408, 3, M.woodDk);
  E(px, 412, 7, 7, M.tinDk, NR, 8);
  S([[560, 424], [704, 414], [704, 420], [560, 432]], M.woodLt);
  E(560, 428, 5, 5, M.tinDk, NR, 8);
  for (let t = 574; t < 698; t += 14) B(t, 414 + (t - 560) * -0.07, 2, 10, M.woodDk, NR);
  for (const [dx, y2] of [[-26, 510], [0, 516], [26, 510]] as const) ln(560, 430, 575 + dx, y2, 1.8, M.tinDk);
  S([[535, 510], [615, 510], [600, 524], [550, 524]], M.tin);
  S([[540, 510], [575, 484], [610, 510]], mix(M.sack, M.tarpYellow, 0.4), NR);
  ln(690, 416, 690, 442, 2.4, M.woodDk);
  S([[679, 442], [701, 442], [703, 466], [677, 466]], M.tinDk);
  B(675, 466, 30, 12, darken(M.tinDk, 0.2));
  // counter: slab + two rows of slatted crates
  B(14, TOP, 732, 16, M.woodLt);
  let ci = 0;
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 4; col++) {
      const x = 24 + col * 178 + (row ? 20 : 0) - (row && col === 3 ? 20 : 0);
      const y = TOP + 16 + row * 104;
      const f = ci++ % 2 ? M.wood : mix(M.wood, M.woodLt, 0.35);
      B(x, y, 172, 102, f);
      for (const sy of [y + 26, y + 52, y + 78]) B(x + 8, sy, 156, 4, darken(f, 0.55), NR);
      ln(x + 6, y + 6, x + 166, y + 96, 6, darken(f, 0.25), NR);
    }
  // weights and a ledger on its stand
  [[548, 26, 28], [578, 22, 20], [602, 18, 14]].forEach(([x, w, h]) => {
    B(x!, TOP - h!, w!, h!, M.tinDk);
    B(x! + 4, TOP - h! - 5, w! - 8, 6, M.tin);
  });
  const lx = 604;
  S([[lx, TOP], [lx + 96, TOP], [lx + 88, TOP - 12], [lx + 8, TOP - 12]], M.woodDk);
  B(lx + 6, TOP - 106, 86, 94, "#F3EBD3");
  B(lx + 47, TOP - 106, 3, 94, darken(M.cloth, 0.4), NR);
  for (let y = TOP - 96; y < TOP - 20; y += 10) {
    B(lx + 11, y, 32, 1.6, "#9AA5AE", NR);
    B(lx + 54, y, 32, 1.6, "#9AA5AE", NR);
  }
  B(lx + 25, TOP - 104, 2, 92, M.tarpRed, NR);
  B(lx + 68, TOP - 104, 2, 92, M.tarpRed, NR);
  ln(lx + 86, TOP - 20, lx + 108, TOP - 62, 3, M.woodDk);
  // posts and awning
  k.post(10, 110, 34);
  k.post(716, 110, 34);
  S([[24, 128], [736, 128], [764, 318], [-4, 318]], M.tarpRed);
  for (let i = 1; i < 6; i++) {
    const tx = 24 + (i * 712) / 6;
    const bx = -4 + (i * 768) / 6;
    S([[tx - 3, 128], [tx + 3, 128], [bx + 3, 318], [bx - 3, 318]], M.tarpRedDk, { rim: false, opacity: 0.55 });
  }
  S([[540, 196], [610, 192], [612, 250], [546, 254]], mix(M.tarpRed, M.cloth, 0.22), { rim: false, opacity: 0.8 });
  k.scallops(-4, 764, 318, 30, 10, [M.tarpRedDk, M.tarpRed]);
  B(0, 118, 760, 12, M.woodLt);
  B(-6, 112, 24, 24, M.woodDk);
  B(742, 112, 24, 24, M.woodDk);
  B(24, 352, 712, 36, "#000", { rim: false, opacity: 0.28 });
  // lamp inside, light on the goods
  p_lamp(k, r, 510, 348);
  G(560, 600, 230, C.lantern, 0.22);
  const slots: Slots = { banner: [140, 182, 480, 110], board: [505, 692, 240, 204], nota: [54, 372, 240, 306] };
  k.banner(slots.banner);
  k.board(slots.board);
  k.nail(174, 380);
  return finish(k, side, slots, [[510, 385, 120], [600, 600, 120]]);
};
function p_lamp(k: K, r: Rng, x: number, y: number) {
  k.p.push(...lantern(x, y, r, 0.85));
}
export default stall;
