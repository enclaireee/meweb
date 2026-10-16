// Stop 2, The Gorge (deep night): tall jungle walls, bamboo aqueduct, rock wall with waterfall, stone pier with valve wheel, heavy vines.
import { C, arc, darken, glow, hazed, leaf, lighten, mix, poly, post, rect, sheet, type ArtModule, type Piece } from "../helpers";
import { blade, boulder, cluster, corners, edge, fern, gauss, mass, noise, scallop, scr, tone, tufts } from "./shared-a";

const bambooTint = (h: number) => hazed(mix(C.bamboo, C.ramp3, 0.5), h * 0.3);
const jungle = hazed(mix(C.leaf2, C.ramp4, 0.3), 0.3);

const sm = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

const art: ArtModule = {
  "07": ({ lx, x0, x1, rng: r }) => {
    const n = noise(r, 4);
    const out: Piece[] = [];
    const xa = x0 - 20;
    const xb = x1 + 40;
    const wall = (x: number) => {
      const d = x - lx;
      const v = 560 - 440 * sm((-d - 30) / 260) - 470 * sm((d - 150) / 250) + 16 * n(x * 2);
      return 590 + (v - 590) * edge(x, xa, xb, 110);
    };
    // Back wall, a paler sheet, then the dark jungle masses.
    const back = (x: number) => 500 - 220 * gauss(x - lx, -80, 330) + 14 * n(x * 1.3);
    out.push(mass(xa, xb, 650, (x) => 590 + (back(x) - 590) * edge(x, xa, xb, 130), r, hazed(C.ramp3, 0.5), 40));
    out.push(mass(xa, xb, 650, wall, r, jungle, 30));
    // Canopy scallops along the walls, tree ferns, lit orchids.
    for (let x = xa + 40; x < xb - 20; x += r.range(55, 80)) {
      const t = wall(x);
      if (t < 480) out.push(scallop(x, t + 12, r.range(48, 70), r.range(34, 48), r, jungle, 7));
    }
    for (const d of [-250, -380, 240, 360]) {
      const x = lx + d;
      const t = wall(x) + 40;
      out.push(blade(x, t + 80, r.range(-14, 14), -90, 0.1, 6, 4, jungle, r, { rim: true }));
      out.push(...fern(x, t - 10, 130, r, tone.moss07));
    }
    // Aqueduct high above the river, tied into both walls.
    const ax0 = lx - 340;
    const ax1 = lx + 420;
    const ay = (x: number) => 150 - ((x - ax0) / (ax1 - ax0)) * 24;
    out.push(sheet(poly([[ax0, ay(ax0)], [ax1, ay(ax1)], [ax1, ay(ax1) + 14], [ax0, ay(ax0) + 14]]), bambooTint(0.3), r));
    out.push(sheet(poly([[ax0 + 20, ay(ax0 + 20) - 3], [ax1 - 20, ay(ax1 - 20) - 3], [ax1 - 20, ay(ax1 - 20)], [ax0 + 20, ay(ax0 + 20)]]), lighten(tone.rock07, 0.55), r, { rim: false }));
    for (const [bx, dir] of [[lx - 330, 1], [lx + 330, -1]] as const) {
      out.push(sheet(poly([[bx - 5, ay(bx) + 14], [bx + 5, ay(bx) + 14], [bx + dir * 60 + 5, ay(bx) + 130], [bx + dir * 60 - 5, ay(bx) + 130]]), bambooTint(0.3), r));
      out.push(sheet(poly([[bx + dir * 60 - 5, ay(bx) + 50], [bx + dir * 60 + 5, ay(bx) + 50], [bx - dir * 40 + 5, ay(bx) + 130], [bx - dir * 40 - 5, ay(bx) + 130]]), bambooTint(0.3), r));
    }
    for (const [d, y] of [[-300, 350], [-215, 430], [305, 310], [380, 400]] as const) {
      out.push(sheet(poly(arc(lx + d, y, 5, 5, 0, Math.PI * 2, 6)), C.lanternCore, r, { rim: false }));
      out.push(glow(lx + d, y, 34, C.lantern, 0.35));
    }
    // Mist rising at the base: stacked tissue bands.
    for (let x = x0; x <= x1; x += 170) out.push(glow(x, 610, 190, C.haze, 0.3));
    return out;
  },

  "08": ({ lx, rng: r }) => {
    const n = noise(r, 4);
    const out: Piece[] = [];
    const top = (x: number): number => {
      const d = x - lx;
      const v = 545 - 130 * gauss(d, -420, 160) - 170 * gauss(d, 420, 170) + 22 * n(x * 2.5);
      return Math.round((620 + (v - 620) * edge(x, xa, xb, 150)) / 14) * 14;
    };
    const xa = lx - 600;
    const xb = lx + 600;
    const slits: string[] = [];
    for (let k = 0; k < 7; k++) {
      const x = r.range(xa + 60, xb - 60);
      const y = top(x) + r.range(50, 110);
      slits.push(poly([[x, y], [x + 4, y + 1], [x + r.range(-6, 6) + 4, y + r.range(30, 55)], [x + r.range(-6, 6), y + r.range(30, 55)]]));
    }
    out.push(mass(xa, xb, 650, top, r, tone.rock08, 42, slits));
    // Roots hanging from the wall top.
    for (let k = 0; k < 10; k++) {
      const x = r.range(xa + 40, xb - 40);
      out.push(blade(x, top(x) + 4, r.range(-10, 10), r.range(50, 110), r.range(-0.2, 0.2), 6, 1.5, hazed(C.root, 0.18), r, { n: 4 }));
    }
    // Waterfall: three layered pale sheets with foam at the foot.
    const wx = lx - 390;
    const wy = top(wx) + 2;
    for (const [w, a, fall] of [[64, 0.28, 0], [44, 0.45, 6], [22, 0.65, 14]] as const)
      out.push(sheet(poly([[wx - w / 2, wy + fall], [wx + w / 2, wy + fall], [wx + w / 2 + 6, 605], [wx - w / 2 - 6, 605]]), lighten(tone.rock08, a), r, { rim: false }));
    for (const [dx, w] of [[-26, 34], [0, 46], [24, 30]] as const) out.push(sheet(poly([[wx + dx - w / 2, 610], [wx + dx - w / 4, 586], [wx + dx + w / 4, 584], [wx + dx + w / 2, 610]]), lighten(tone.rock08, 0.7), r, { rim: false }));
    for (let x = xa + 60; x <= xb; x += 200) out.push(glow(x, 610, 200, C.haze, 0.3));
    return out;
  },

  "09": ({ lx, rng: r }) => {
    const px = lx + 150;
    const out: Piece[] = [];
    // Stone pier behind the pole: courses cut as joints, a capstone, gauge dial.
    const joints: string[] = [];
    for (const [k, y] of [556, 592, 628].entries()) {
      joints.push(poly([[px - 50, y], [px + 50, y], [px + 50, y + 3], [px - 50, y + 3]]));
      for (let x = px - 30 + (k % 2) * 28; x < px + 50; x += 56) joints.push(poly([[x, y - 36 + 3], [x + 3, y - 36 + 3], [x + 3, y], [x, y]]));
    }
    out.push(sheet(rect(px - 56, 520, 112, 140), tone.rock09, r, { holes: joints }));
    out.push(sheet(rect(px - 66, 506, 132, 16), mix(tone.rock09, C.ramp4, 0.3), r));
    out.push(sheet(poly(arc(px + 32, 540, 11, 11, 0, Math.PI * 2, 10)), mix(C.ramp3, C.ramp7, 0.3), r));
    out.push(sheet(poly([[px + 31, 540], [px + 33, 540], [px + 40, 534], [px + 38, 533]]), C.ramp1, r, { rim: false }));
    out.push(...post(lx, r));
    // Bamboo pipe running right from the pole, elbow down into the water, valve wheel on the pole.
    const pipe = tone.bamboo09;
    out.push(sheet(rect(px, 440, 250, 16), pipe, r), sheet(rect(px + 234, 440, 16, 214), pipe, r));
    for (let x = px + 40; x < px + 240; x += 54) out.push(sheet(rect(x, 438, 4, 20), mix(pipe, C.ramp7, 0.2), r, { rim: false }));
    for (let y = 480; y < 640; y += 52) out.push(sheet(rect(px + 232, y, 20, 4), mix(pipe, C.ramp7, 0.2), r, { rim: false }));
    const wc: [number, number] = [px, 470];
    const spokes: string[] = [];
    for (let k = 0; k < 6; k++) {
      const a0 = (k * Math.PI) / 3 + 0.14;
      const a1 = a0 + Math.PI / 3 - 0.28;
      spokes.push(poly([...arc(wc[0], wc[1], 30, 30, a0, a1, 3), ...arc(wc[0], wc[1], 11, 11, a1, a0, 2)]));
    }
    out.push(sheet(poly(arc(wc[0], wc[1], 40, 40, 0, Math.PI * 2, 16).slice(0, -1)), mix(darken(C.bamboo, 0.5), C.ramp2, 0.45), r, { holes: spokes }));
    for (const [d, w, h] of [[-650, 150, 62], [-520, 80, 40], [560, 130, 54]] as const) out.push(...boulder(lx + d, 652, w, h, r, tone.rock09, tone.moss09));
    out.push(...fern(lx - 690, 650, 130, r, tone.moss09), ...fern(lx + 700, 650, 120, r, tone.moss09));
    return out;
  },

  "10": ({ lx, layer, rng: r }) => {
    const X = (o: number) => scr(layer.s, lx, o);
    return [
      ...fern(X(-470), 1000, 360, r, tone.n10g),
      ...fern(X(1120), 1000, 340, r, tone.n10g),
      ...fern(X(-170), 1000, 210, r, tone.n10g),
      ...fern(X(320), 1000, 200, r, tone.n10g),
    ];
  },

  "11": ({ lx, layer, rng: r }) => {
    const X = (o: number) => scr(layer.s, lx, o);
    const out: Piece[] = [];
    // Heavy vines hanging from the top edge, with leaf nubs.
    for (const o of [-560, -500, -430, -330, 760, 880, 980, 1100, 1200, 1290]) {
      const len = r.range(220, 460) * (Math.abs(o - 300) > 700 ? 1.2 : 0.7);
      const x = X(o);
      out.push(blade(x, -40, r.range(-30, 30), len, r.range(-0.12, 0.12), 12, 4, tone.n11, r, { n: 7 }));
      for (let y = 120; y < len - 40; y += 90) out.push(leaf(x, y, (y % 180 ? 1 : -1) * r.range(60, 100) + 180, r.range(60, 90), 20, tone.n11, r, true));
    }
    out.push(...cluster(X(-520), 1060, r, tone.n11, { n: 3, L: [440, 540], W: [110, 140], from: -40, to: 20 }), ...cluster(X(1230), 1060, r, tone.n11, { n: 3, L: [440, 540], W: [110, 140], from: -20, to: 40 }));
    return out;
  },

  "12": ({ lx, layer, rng: r }) => {
    const X = (o: number) => scr(layer.s, lx, o);
    const out: Piece[] = [...corners(X(-540), X(1250), r, tone.n12, 1.3)];
    for (const [o, len] of [[-420, 520], [1160, 560], [1290, 420]] as const) out.push(blade(X(o), -60, r.range(-20, 20), len, r.range(-0.1, 0.1), 16, 5, tone.n12, r, { n: 7 }));
    out.push(...tufts([X(-540), X(1180)], 1060, 300, r, tone.n12));
    return out;
  },
};

export default art;
