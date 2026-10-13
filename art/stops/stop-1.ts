// Stop 1, The Terraces (early night): flooded rice terraces with a stilt hut, palms, a farm light, bamboo gantry with crates, buffalo.
import { C, darken, glow, hazed, lantern, leaf, lighten, mix, palm, poly, post, rect, reeds, sheet, type ArtModule, type Piece, type Pt, type Rng } from "../helpers";
import { blade, boulder, cap, corners, edge, gauss, mass, noise, scr, tone, tufts } from "./shared-a";

/** Terraced dome: bands step down an elliptical hill; every other band carries a flooded lens that catches the moon. */
function terraces(cx: number, wl: number, wr: number, peak: number, base: number, ys: number[], r: Rng, haze: number, water: boolean): Piece[] {
  const n = noise(r, 2);
  const half = (y: number, w: number) => w * Math.sqrt(Math.max(0, 1 - ((base - Math.min(y, base)) / (base - peak)) ** 2));
  const out: Piece[] = [];
  const greens = [mix(C.paddy, C.ramp3, 0.45), mix(C.leaf2, C.ramp3, 0.5), mix(C.paddy, C.ramp3, 0.3)].map((c) => hazed(c, haze));
  ys.forEach((y0, k) => {
    const wave = (x: number) => y0 + 6 * Math.sin(x * 0.02 + k * 1.7) + 4 * n(x + k * 90);
    const pts: Pt[] = [];
    for (let y = base + 10; y > y0 + 12; y -= 30) pts.push([cx - half(y, wl), y]);
    const xl = cx - half(y0, wl);
    const xr = cx + half(y0, wr);
    for (let x = xl; x < xr; x += 30) pts.push([x, wave(x)]);
    pts.push([xr, wave(xr)]);
    for (let y = y0 + 12; y < base + 10; y += 30) pts.push([cx + half(y, wr), y]);
    out.push(sheet(pts, greens[k % greens.length]!, r));
    if (water && k > 0 && k % 2 === 1) {
      const a = xl + (xr - xl) * r.range(0.1, 0.3);
      const b = xr - (xr - xl) * r.range(0.1, 0.3);
      const lens: Pt[] = [];
      for (let x = a; x <= b; x += 34) lens.push([x, wave(x) + 3]);
      for (let x = b; x >= a; x -= 34) lens.push([x, wave(x) + 3 + 9 - 7 * Math.abs(Math.sin(((x - a) / (b - a)) * Math.PI)) * 0.6]);
      out.push(sheet(lens, hazed(mix(C.paddyWater, C.ramp3, 0.3), haze), r, { rim: false }));
      out.push(sheet(lens.slice(0, lens.length / 2).map((p): Pt => [p[0] + 12, p[1] + 1]).concat([[b - 30, wave(b - 30) + 4], [a + 20, wave(a + 20) + 4]]), lighten(hazed(C.paddyWater, haze), 0.3), r, { rim: false, opacity: 0.55 }));
    }
  });
  return out;
}

const art: ArtModule = {
  "07": ({ lx, x0, x1, rng: r }) => {
    const n = noise(r);
    const out: Piece[] = [];
    // Pale back ridge, lower than the terraces.
    const back = (x: number) => {
      const d = x - lx;
      const v = 520 - 110 * gauss(d, 260, 260) - 60 * gauss(d, -380, 160) + 14 * n(x * 1.6);
      return 610 + (v - 610) * edge(x, x0, x1, 150);
    };
    out.push(mass(x0, x1, 650, back, r, hazed(C.ramp3, 0.45), 40));
    // Terrace hill.
    const cx = lx - 10;
    out.push(...terraces(cx, 430, 445, 270, 640, [270, 345, 410, 475, 540, 600], r, 0.3, true));
    // Field hut on stilts at the crown.
    const hx = lx - 190;
    const fl = 296;
    for (const dx of [-22, -8, 8, 22]) out.push(sheet(rect(hx + dx - 2, fl, 4, 26), tone.rock07, r, { rim: false }));
    out.push(sheet(rect(hx - 32, fl - 6, 64, 8), tone.rock07, r));
    out.push(sheet(rect(hx - 26, fl - 40, 52, 36), tone.rock07, r, { holes: [poly([[hx + 4, fl - 32], [hx + 17, fl - 32], [hx + 17, fl - 18], [hx + 4, fl - 18]])] }));
    out.push(sheet(rect(hx + 4, fl - 32, 13, 14), C.window, r, { rim: false, opacity: 0.55 }));
    out.push(sheet([[hx - 40, fl - 36], [hx, fl - 76], [hx + 40, fl - 36]], mix(tone.rock07, C.ramp1, 0.3), r));
    return out;
  },

  "08": ({ lx, rng: r }) => {
    const out: Piece[] = [];
    const b = 612;
    out.push(...terraces(lx + 20, 600, 620, 450, b + 10, [450, 505, 555, 595], r, 0.18, false));
    for (const [d, h] of [[-540, 210], [-300, 190], [420, 200], [620, 180], [700, 220]] as const) out.push(...palm(lx + d, b + 4, h, r, tone.moss08));
    // Farm light.
    const fx = lx + 440;
    out.push(sheet(rect(fx - 22, b - 44, 44, 40), tone.rock08, r));
    out.push(sheet([[fx - 30, b - 42], [fx, b - 64], [fx + 30, b - 42]], tone.rock08, r));
    out.push(sheet(rect(fx - 6, b - 32, 12, 12), C.window, r, { rim: false }));
    out.push(glow(fx, b - 26, 80, C.lantern, 0.4));
    // Hidden scarecrow with a lit pocket.
    const sx = lx - 250;
    out.push(sheet(rect(sx - 2, b - 112, 4, 70), tone.rock08, r, { rim: false }), sheet(rect(sx - 24, b - 94, 48, 4), tone.rock08, r, { rim: false }), sheet([[sx - 12, b - 112], [sx, b - 130], [sx + 12, b - 112]], tone.rock08, r, { rim: false }));
    out.push(glow(sx + 8, b - 78, 26, C.lantern, 0.5));
    return out;
  },

  "09": ({ lx, rng: r }) => {
    const out: Piece[] = [];
    out.push(...post(lx, r));
    // Bamboo gantry in the shallows, crates on a deck, two hanging lanterns.
    const crate = mix(C.ramp2, darken(C.bamboo, 0.5), 0.3);
    const g0 = lx + 330;
    const g1 = lx + 560;
    out.push(sheet(rect(g0 - 6, 424, 12, 232), tone.bamboo09, r), sheet(rect(g1 - 6, 424, 12, 232), tone.bamboo09, r));
    out.push(sheet(rect(g0 - 26, 556, g1 - g0 + 52, 12), mix(tone.bamboo09, C.ramp2, 0.4), r));
    for (const [cx, cy] of [[g0 + 40, 516], [g0 + 96, 516], [g0 + 152, 516], [g0 + 68, 476], [g0 + 124, 476]] as const)
      out.push(sheet(rect(cx - 25, cy, 50, 40), crate, r, { holes: [poly([[cx - 18, cy + 10], [cx + 18, cy + 10], [cx + 18, cy + 14], [cx - 18, cy + 14]]), poly([[cx - 18, cy + 26], [cx + 18, cy + 26], [cx + 18, cy + 30], [cx - 18, cy + 30]])] }));
    out.push(sheet(rect(g0 - 30, 424, g1 - g0 + 60, 12), tone.bamboo09, r));
    out.push(...lantern(g0 + 18, 436, r, 0.7), ...lantern(g1 - 22, 436, r, 0.7));
    for (const d of [-690, -560, 250]) out.push(...reeds(lx + d, 650, r, 7, r.range(80, 140), tone.moss09));
    for (const [d, w, h] of [[-640, 130, 50], [700, 120, 54]] as const) out.push(...boulder(lx + d, 652, w, h, r, tone.rock09));
    return out;
  },

  "10": ({ lx, layer, rng: r }) => {
    const X = (o: number) => scr(layer.s, lx, o);
    const out: Piece[] = [];
    out.push(...tufts([X(-540), X(-380), X(-190)], 960, 220, r, tone.n10g));
    out.push(...tufts([X(300), X(1180)], 960, 180, r, tone.n10g));
    // Half-submerged buffalo, very dark and still, facing the traveller.
    const bx = X(930);
    const k = 1.3;
    const pts: Pt[] = ([[140, 80], [142, -4], [116, -38], [44, -50], [-28, -56], [-76, -46], [-122, -28], [-166, -6], [-186, 18], [-174, 36], [-138, 28], [-104, 22], [-92, 80]] as Pt[]).map(([x, y]) => [bx + x * k, 790 + y * k]);
    out.push(sheet(pts, darken(tone.n10, 0.3), r));
    out.push(blade(bx - 128 * k, 790 - 26 * k, 36 * k, -50 * k, 0.35, 10, 2, darken(tone.n10, 0.3), r), blade(bx - 112 * k, 790 - 36 * k, 32 * k, -44 * k, 0.35, 8, 2, darken(tone.n10, 0.3), r));
    return out;
  },

  "11": ({ lx, layer, rng: r }) => {
    const X = (o: number) => scr(layer.s, lx, o);
    return [...tufts([X(-560), X(-470), X(-150)], 1050, 400, r, tone.n11), ...tufts([X(1160), X(1240), X(330)], 1050, 360, r, tone.n11)];
  },

  "12": ({ lx, layer, rng: r }) => {
    const X = (o: number) => scr(layer.s, lx, o);
    return [...corners(X(-540), X(1250), r, tone.n12), ...tufts([X(-540), X(-450), X(1180)], 1060, 300, r, tone.n12)];
  },
};

export default art;
void leaf;
void cap;
void lantern;
