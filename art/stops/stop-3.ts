// Stop 3, The Still Pond (midnight): a neuron-forking old tree on the bank, low mirrored hills with a lone lit hut, a trunk and branch for the tag, arching reeds and lotus.
import { C, boat, glow, hazed, lantern, leaf, lighten, mix, poly, post, rect, reeds, sheet, type ArtModule, type Piece, type Pt, type Rng } from "../helpers";
import { blade, corners, edge, flat, fork, gauss, mass, noise, scallop, scr, tone, tufts } from "./shared-a";

/** Reeds arching from `base` toward `dir` (+1 right, -1 left), with a few lotus buds on taller stems. */
function arching(xs: number[], dir: 1 | -1, base: number, hMin: number, hMax: number, wMax: number, r: Rng, fill: string, buds = 0): Piece[] {
  const out: Piece[] = [];
  for (const x of xs)
    for (let k = 0; k < 4; k++) {
      const h = r.range(hMin, hMax);
      const bx = x + dir * k * 14 + r.range(-8, 8);
      const dx = dir * r.range(0.1, 0.55) * h;
      out.push(blade(bx, base, dx, -h, -dir * r.range(0.18, 0.4), wMax, 2, fill, r, { n: 6 }));
    }
  for (let k = 0; k < buds; k++) {
    const x = xs[k % xs.length]! + dir * r.range(20, 70);
    const h = r.range(hMax * 0.75, hMax * 1.05);
    out.push(blade(x, base, dir * 20, -h, 0.05, wMax * 0.5, 4, fill, r, { n: 5 }));
    out.push(leaf(x + dir * 20, base - h + 4, dir * 12, wMax * 4.5, wMax * 1.25, fill, r, false));
  }
  return out;
}

const art: ArtModule = {
  "07": ({ lx, x0, x1, rng: r }) => {
    const n = noise(r);
    const out: Piece[] = [];
    // Bank under the tree and a low far bank to the right.
    const bank = (x: number) => {
      const d = x - lx;
      const v = 600 - 55 * gauss(d, -250, 190) - 18 * gauss(d, 330, 120) + 8 * n(x * 1.5);
      return 612 + (v - 612) * edge(x, x0, x1, 110);
    };
    out.push(mass(x0, x1, 650, bank, r, tone.rock07, 40));
    // The old tree: trunk then forking branches ending in foliage tufts.
    const tx = lx - 250;
    out.push(sheet([[tx - 26, 620], [tx - 14, 470], [tx - 12, 420], [tx + 12, 420], [tx + 16, 470], [tx + 34, 620]], tone.rock07, r));
    const tips: [number, number][] = [];
    fork(tx, 424, -4, 120, 28, 4, r, tone.rock07, out, (x, y) => tips.push([x, y]));
    for (const [x, y] of tips) out.push(scallop(x, y, r.range(26, 40), r.range(18, 28), r, tone.moss07, 6));
    for (let k = 0; k < 4; k++) out.push(scallop(tx + r.range(-130, 130), r.range(150, 260), r.range(40, 62), r.range(26, 38), r, tone.moss07, 7));
    return out;
  },

  "08": ({ lx, rng: r }) => {
    const n = noise(r);
    const out: Piece[] = [];
    const xa = lx - 600;
    const xb = lx + 600;
    // Low rounded hills (the water layer mirrors the mood), shrub bumps on top.
    const top = (x: number) => {
      const d = x - lx;
      const v = 545 - 70 * gauss(d, -250, 210) - 95 * gauss(d, 320, 190) + 10 * n(x * 1.4);
      return 606 + (v - 606) * edge(x, xa, xb, 170);
    };
    out.push(mass(xa, xb, 650, top, r, tone.rock08, 44));
    for (let x = xa + 120; x < xb - 100; x += r.range(70, 120)) out.push(scallop(x, top(x) + 4, r.range(30, 46), r.range(18, 28), r, tone.moss08, 6));
    // Lone hut with one lit window.
    const hx = lx + 410;
    const b = 598;
    out.push(sheet(rect(hx - 30, b - 36, 60, 38), mix(tone.rock08, C.ramp1, 0.25), r, { holes: [poly([[hx - 7, b - 28], [hx + 9, b - 28], [hx + 9, b - 14], [hx - 7, b - 14]])] }));
    out.push(sheet(rect(hx - 7, b - 28, 16, 14), C.window, r, { rim: false }));
    out.push(sheet([[hx - 40, b - 34], [hx, b - 66], [hx + 40, b - 34]], mix(tone.rock08, C.ramp1, 0.4), r));
    out.push(glow(hx, b - 20, 90, C.lantern, 0.4));
    // Hidden: a small paper boat far away with its own lantern.
    const bx = lx - 360;
    out.push(...boat(bx, 604, 46, r, mix(tone.rock08, C.ramp1, 0.3)));
    out.push(...lantern(bx + 4, 560, r, 0.28));
    return out;
  },

  "09": ({ lx, rng: r }) => {
    const px = lx + 150;
    const out: Piece[] = [];
    // Canopy first (behind), then the trunk planted in the shallows.
    for (const [dx, y, rx, ry] of [[0, 112, 110, 56], [-100, 150, 84, 42], [110, 150, 92, 46], [-40, 78, 70, 34], [60, 190, 60, 28]] as const) out.push(scallop(px + dx, y, rx, ry, r, tone.moss09, 8));
    out.push(sheet([[px - 20, 120], [px + 24, 120], [px + 26, 540], [px + 60, 650], [px - 56, 650], [px - 22, 540]], tone.rock09, r, { holes: [poly([[px - 4, 410], [px + 6, 404], [px + 10, 424], [px, 434]])] }));
    // Strong horizontal branch toward the hook, with twigs and drooping leaves.
    out.push(blade(px, 262, lx - 40 - px, -2, 0.01, 26, 12, tone.rock09, r, { rim: true, n: 4 }));
    out.push(blade(lx + 40, 258, -40, -50, -0.2, 8, 2, tone.rock09, r), blade(lx - 10, 256, -30, -34, 0.2, 6, 2, tone.rock09, r));
    for (const d of [-20, 30, 80]) out.push(leaf(lx + d, 268, 180 + r.range(-25, 25), r.range(34, 48), 9, tone.moss09, r, false));
    out.push(...post(lx, r));
    for (const d of [-700, -610, 640, 730]) out.push(...reeds(lx + d, 650, r, 8, r.range(90, 150), tone.moss09));
    return out;
  },

  "10": ({ lx, layer, rng: r }) => {
    const X = (o: number) => scr(layer.s, lx, o);
    const out: Piece[] = [];
    out.push(...arching([X(-540), X(-470), X(-400)], 1, 1000, 330, 520, 14, r, tone.n10g, 3));
    out.push(...arching([X(1150), X(1220), X(1290)], -1, 1000, 330, 520, 14, r, tone.n10g, 3));
    out.push(...arching([X(-160), X(330)], 1, 1000, 170, 250, 10, r, tone.n10g));
    // Kingfisher perched on a bent reed.
    const kx = X(-250);
    const ky = 556;
    out.push(blade(kx - 70, 1000, 70, ky - 1000, 0.15, 9, 3, tone.n10g, r, { n: 7 }));
    out.push(sheet(poly([[kx - 8, ky], [kx + 8, ky - 14], [kx + 26, ky - 14], [kx + 36, ky - 6], [kx + 58, ky - 8], [kx + 36, ky - 2], [kx + 28, ky + 12], [kx + 6, ky + 20], [kx - 12, ky + 30]]), mix(tone.n10, C.ramp3, 0.25), r));
    // Lily pads on the water.
    for (const [o, y, w] of [[-330, 735, 70], [-90, 760, 50], [260, 745, 64], [540, 770, 80], [840, 740, 60], [1000, 765, 70]] as const) out.push(flat(X(o), y, w, 11, r, tone.n10g));
    return out;
  },

  "11": ({ lx, layer, rng: r }) => {
    const X = (o: number) => scr(layer.s, lx, o);
    return [...arching([X(-560), X(-480)], 1, 1060, 380, 560, 20, r, tone.n11, 1), ...arching([X(1200), X(1280)], -1, 1060, 380, 560, 20, r, tone.n11, 1)];
  },

  "12": ({ lx, layer, rng: r }) => {
    const X = (o: number) => scr(layer.s, lx, o);
    return [...corners(X(-540), X(1250), r, tone.n12, 0.8), ...arching([X(-580)], 1, 1080, 380, 520, 34, r, tone.n12), ...arching([X(1290)], -1, 1080, 380, 520, 34, r, tone.n12)];
  },
};

export default art;
void lighten;
void hazed;
void tufts;
void ({} as Pt);
