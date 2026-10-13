// Stop 0, The Spring (dusk): mossy rock spring with a trickle, bamboo grove and a lit shrine, bamboo tag pole, taro leaves.
import { C, bamboo, darken, hazed, glow, lantern, leaf, lighten, mix, poly, post, raw, rect, reeds, sheet, type ArtModule, type Piece } from "../helpers";
import { boulder, cap, cluster, corners, edge, fern, flat, gauss, mass, noise, scr, tone, tufts } from "./shared-a";

const art: ArtModule = {
  "07": ({ lx, x0, rng: r }) => {
    const n = noise(r);
    const out: Piece[] = [];
    const xa = Math.max(x0, lx - 900);
    const xb = lx + 430;
    // Stepped rock cliff with a ledge the trickle falls from.
    const top = (x: number) => {
      const d = x - lx;
      const v = 560 - 270 * gauss(d, -330, 230) - 95 * gauss(d, -640, 210) - 40 * gauss(d, -110, 70) + 14 * n(x);
      return Math.round(v / 16) * 16;
    };
    // Paler back ridge so the cliff has a sheet to cast on (and the right side is not empty).
    const back = (x: number) => {
      const d = x - lx;
      const v = 540 - 150 * gauss(d, 80, 280) - 80 * gauss(d, 330, 120) + 12 * n(x * 1.7);
      return 610 + (v - 610) * edge(x, xa, xb, 160);
    };
    out.push(mass(xa, xb, 650, back, r, hazed(C.ramp3, 0.45), 40));
    out.push(cap(xa, xb, back, 18, r, hazed(mix(C.leaf2, C.ramp3, 0.4), 0.45), 40));
    out.push(mass(xa, xb, 650, top, r, tone.rock07, 34));
    out.push(cap(xa, xb, top, 24, r, tone.moss07, 34));
    // Trickle: two overlapping thin sheets plus a splash.
    const tx = lx - 250;
    const ty = top(tx) + 34;
    out.push(sheet(poly([[tx - 5, ty], [tx + 5, ty], [tx + 7, 625], [tx - 7, 625]]), lighten(tone.rock07, 0.5), r, { rim: false }));
    out.push(sheet(poly([[tx - 1, ty + 20], [tx + 4, ty + 20], [tx + 4, 622], [tx, 622]]), lighten(tone.rock07, 0.75), r, { rim: false }));
    out.push(sheet(poly([[tx - 26, 632], [tx - 8, 614], [tx + 10, 612], [tx + 30, 632]]), lighten(tone.rock07, 0.4), r, { rim: false }));
    // Ferns behind boulders, then boulders.
    for (const [d, s] of [[-560, 190], [-470, 150], [-175, 170], [10, 150], [-60, 120], [250, 130]] as const) out.push(...fern(lx + d, 640, s, r, tone.moss07));
    for (const [d, w, h] of [[-540, 160, 100], [-420, 110, 72], [-150, 180, 84], [110, 120, 62], [330, 150, 76]] as const) out.push(...boulder(lx + d, 650, w, h, r, tone.rock07, tone.moss07));
    // Stepping stones leading off into the dark.
    for (let k = 0; k < 6; k++) out.push(flat(lx + 150 + k * 52, 618 + k * 1.5, r.range(18, 27), 5, r, lighten(tone.rock07, 0.28)));
    return out;
  },

  "08": ({ lx, rng: r }) => {
    const out: Piece[] = [];
    const b = 612;
    // Bamboo grove.
    for (let k = 0; k < 14; k++) {
      const grove = k < 8 ? lx - 760 + k * 36 : lx + 520 + (k - 8) * 40;
      const x = grove + r.range(-12, 12);
      const top = r.range(k < 8 ? 250 : 330, k < 8 ? 390 : 430);
      out.push(...bamboo(x, top, b + 8, r, 8, tone.moss08));
      for (let j = 0; j < 4; j++) out.push(leaf(x, top + j * 22, (j % 2 ? 1 : -1) * r.range(55, 85), r.range(55, 95), 6, tone.moss08, r, false));
    }
    for (const d of [-300, -160, -10, 240, 520, 650]) out.push(...reeds(lx + d, b + 6, r, 8, r.range(70, 120), tone.moss08));
    // Shrine with a lit window and lantern.
    const sx = lx + 330;
    out.push(sheet(rect(sx - 44, b - 20, 88, 28), tone.rock08, r));
    out.push(sheet(rect(sx - 14, b - 68, 28, 34), C.window, r, { rim: false }));
    out.push(sheet(rect(sx - 28, b - 80, 56, 62), tone.rock08, r, { holes: [poly([[sx - 14, b - 68], [sx + 14, b - 68], [sx + 14, b - 34], [sx - 14, b - 34]])] }));
    out.push(sheet([[sx - 60, b - 74], [sx - 44, b - 82], [sx - 12, b - 108], [sx + 12, b - 108], [sx + 44, b - 82], [sx + 60, b - 74], [sx + 46, b - 70], [sx - 46, b - 70]], mix(tone.rock08, C.ramp1, 0.35), r));
    out.push(...lantern(sx + 52, b - 72, r, 0.5));
    out.push(glow(sx, b - 50, 100, C.lantern, 0.35));
    // Hidden paper crane tucked behind the shrine.
    out.push(sheet(poly([[sx + 50, b - 30], [sx + 64, b - 42], [sx + 80, b - 38], [sx + 66, b - 28]]), lighten(tone.rock08, 0.5), r, { rim: false }));
    return out;
  },

  "09": ({ lx, rng: r }) => {
    const px = lx + 150;
    const out: Piece[] = [];
    out.push(...post(lx, r));
    // Bamboo nodes along the tag pole.
    for (let y = 250; y < 640; y += 58) out.push(sheet(rect(px - 9, y, 18, 4), tone.bamboo09, r, { rim: false }));
    // Mooring post with a rope coil, left of the boat.
    const mx = lx - 470;
    out.push(sheet([[mx - 9, 548], [mx + 9, 540], [mx + 9, 650], [mx - 9, 650]], tone.rock09, r));
    for (const y of [572, 584, 596]) out.push(sheet(poly([[mx - 14, y], [mx, y - 5], [mx + 14, y], [mx, y + 5]]), darken(tone.bamboo09, 0.2), r));
    // Mossy boulders in the shallows and reed clumps.
    for (const [d, w, h] of [[-690, 170, 74], [-570, 90, 46], [300, 150, 70], [410, 100, 46], [600, 140, 62]] as const) out.push(...boulder(lx + d, 652, w, h, r, tone.rock09, tone.moss09));
    out.push(...reeds(lx + 70, 650, r, 6, 70, tone.moss09), ...reeds(lx - 640, 650, r, 7, 130, tone.moss09), ...reeds(lx + 720, 650, r, 7, 100, tone.moss09));
    return out;
  },

  "10": ({ lx, layer, rng: r }) => {
    const X = (o: number) => scr(layer.s, lx, o);
    const out: Piece[] = [];
    // Taro leaves along the bottom edge, plus low tufts that read on a phone.
    out.push(...cluster(X(-430), 1000, r, tone.n10g, { n: 5, L: [300, 380], W: [60, 80], from: -48, to: 28 }));
    out.push(...cluster(X(1150), 1000, r, tone.n10g, { n: 5, L: [300, 380], W: [60, 80], from: -28, to: 50 }));
    out.push(...cluster(X(-170), 1000, r, tone.n10g, { n: 3, L: [190, 240], W: [40, 52], from: -35, to: 10 }));
    out.push(...cluster(X(330), 1000, r, tone.n10g, { n: 3, L: [170, 220], W: [40, 50], from: -10, to: 40 }));
    out.push(...tufts([X(-620), X(780)], 960, 150, r, tone.n10));
    return out;
  },

  "11": ({ lx, layer, rng: r }) => {
    const X = (o: number) => scr(layer.s, lx, o);
    return [
      ...cluster(X(-540), 1060, r, tone.n11, { n: 3, L: [420, 520], W: [100, 130], from: -40, to: 20 }),
      ...cluster(X(1240), 1060, r, tone.n11, { n: 3, L: [420, 520], W: [100, 130], from: -20, to: 40 }),
      ...cluster(X(-130), 1060, r, tone.n11, { n: 2, L: [230, 290], W: [60, 80], from: -35, to: 0 }),
    ];
  },

  "12": ({ lx, layer, rng: r }) => {
    const X = (o: number) => scr(layer.s, lx, o);
    return [
      ...corners(X(-540), X(1250), r, tone.n12),
      ...tufts([X(-560), X(-470)], 1040, 230, r, tone.n12),
    ];
  },
};

export default art;
