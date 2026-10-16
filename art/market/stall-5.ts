// Stall 5, Sunlight Meter: a lamp seller (dozens of hanging lamps, solar panel on a thatch roof, needle meter on the counter).
import { C, darken, mix, type Pt } from "../helpers";
import { M, type Slots, type StallGen } from "./types";
import { finish, kit, NR, PI, type K } from "./stall-1";

type Kind = "paper" | "bulb" | "hurricane";

const lamp = (k: K, x: number, top: number, cy: number, kind: Kind, size: number, dim: number, col: string) => {
  const lit = (c: string) => mix(c, "#2A1A0E", dim);
  k.ln(x, top, x, cy - size * 1.1, 1.6, mix(M.woodDk, C.ramp0, 0.3));
  k.G(x, cy, size * 2.6, C.lantern, 0.5 * (1 - dim * 0.8));
  if (kind === "paper") {
    const y0 = cy - size * 1.1;
    k.B(x - size * 0.5, y0 - 2, size, 5, C.ramp1, NR);
    k.E(x, cy, size * 0.95, size * 1.05, lit(col));
    k.E(x, cy, size * 0.55, size * 0.7, lit(M.lampCore), NR, 12);
    for (const dx of [-0.55, 0, 0.55]) k.ln(x + dx * size * 0.9, cy - size * (1 - Math.abs(dx) * 0.6), x + dx * size * 0.9, cy + size * (1 - Math.abs(dx) * 0.6), 1.2, darken(col, 0.45), { rim: false, opacity: 0.7 });
    k.B(x - size * 0.5, cy + size * 1.0, size, 5, C.ramp1, NR);
  } else if (kind === "bulb") {
    const y0 = cy - size * 0.95;
    k.B(x - size * 0.3, y0 - 2, size * 0.6, size * 0.5, M.tinDk, NR);
    k.E(x, cy + size * 0.1, size * 0.8, size * 0.85, lit(M.lampCore), NR, 12);
    k.E(x - size * 0.25, cy - size * 0.1, size * 0.18, size * 0.28, "#FFFFFF", { rim: false, opacity: 0.6 }, 8);
    k.S([[x - 2, cy + size * 0.5], [x - size * 0.2, cy - size * 0.1], [x + size * 0.2, cy - size * 0.1], [x + 2, cy + size * 0.5]], lit(col), { rim: false, opacity: 0.5 });
  } else {
    const t = cy - size * 1.0;
    k.B(x - size * 0.7, t, size * 1.4, size * 0.22, M.tinDk, NR);
    k.S([[x - size * 0.5, t + size * 0.2], [x + size * 0.5, t + size * 0.2], [x + size * 0.7, cy + size * 0.6], [x - size * 0.7, cy + size * 0.6]], lit(col), { rim: false, opacity: 0.85 });
    k.S([[x - size * 0.12, cy + size * 0.2], [x + size * 0.12, cy + size * 0.2], [x, cy - size * 0.5]], lit(M.lampCore), NR);
    k.B(x - size * 0.8, cy + size * 0.55, size * 1.6, size * 0.4, M.tinDk, NR);
    k.ln(x - size * 0.7, t, x - size * 0.7, cy + size * 0.55, 1.4, M.tinDk);
    k.ln(x + size * 0.7, t, x + size * 0.7, cy + size * 0.55, 1.4, M.tinDk);
  }
};

const stall: StallGen = (r, side) => {
  const k = kit(r);
  const { S, B, E, G, ln } = k;
  const TOP = 676;
  k.planks(30, 300, 700, TOP - 300, mix(C.ramp2, M.woodDk, 0.35), 40, true);
  B(30, 300, 700, 80, C.ramp0, { rim: false, opacity: 0.35 });
  // bamboo rack the lamps hang from
  B(26, 326, 708, 9, mix(C.bamboo, C.ramp1, 0.45));
  const glows: [number, number, number][] = [];
  const kinds: Kind[] = ["paper", "bulb", "hurricane"];
  const cols = ["#D8523A", "#E8A23A", "#EAD7A8", "#C9783A"];
  // dozens of hanging lamps in two depth layers (back dimmer/smaller, front brighter); nota area stays clear
  const place = (xs: number[], yRange: [number, number], size: [number, number], dim: number) =>
    xs.forEach((x, i) => {
      const rr = r.range(0, 1);
      const cy = r.range(yRange[0], yRange[1]);
      const sz = r.range(size[0], size[1]);
      const kd = kinds[(i + Math.floor(rr * 3)) % 3]!;
      lamp(k, x + r.range(-5, 5), 335, cy, kd, sz, dim, cols[Math.floor(r.range(0, 4))]!);
      if (dim < 0.2) glows.push([x, cy, sz * 2.8]);
    });
  place([312, 350, 388, 426, 464, 502, 540, 578, 616, 654, 692], [395, 435], [17, 22], 0.5);
  place([330, 370, 410, 450, 490, 530, 570, 610, 650, 690], [460, 515], [24, 31], 0);
  place([318, 356, 394, 432, 470, 508, 546, 584], [550, 575], [18, 23], 0.1);
  // hurricane lamps on the counter
  [316, 372, 428, 484, 540].forEach((x, i) => {
    B(x - 18, TOP - 6, 36, 6, M.tinDk, NR);
    B(x - 15, TOP - 62, 30, 56, mix(C.lantern, "#FFFFFF", 0.15), { rim: false, opacity: 0.7 });
    S([[x - 6, TOP - 12], [x + 6, TOP - 12], [x, TOP - 42]], M.lampCore, NR);
    B(x - 18, TOP - 68, 36, 8, M.tinDk, NR);
    ln(x - 16, TOP - 66, x - 16, TOP - 10, 2, M.tinDk);
    ln(x + 16, TOP - 66, x + 16, TOP - 10, 2, M.tinDk);
    if (i % 2 === 0) glows.push([x, TOP - 32, 50]);
    G(x, TOP - 32, 70, C.lantern, 0.5);
  });
  // meter box with needle (green = well powered)
  B(626, 558, 108, 118, M.woodDk);
  B(634, 566, 92, 70, "#1A1410", NR);
  const mc: [number, number] = [680, 622];
  const seg = (a0: number, a1: number, c: string) => {
    const pts: Pt[] = [];
    const n = 6;
    for (let i = 0; i <= n; i++) pts.push([mc[0] + Math.cos(a0 + ((a1 - a0) * i) / n) * 40, mc[1] + Math.sin(a0 + ((a1 - a0) * i) / n) * 40]);
    for (let i = n; i >= 0; i--) pts.push([mc[0] + Math.cos(a0 + ((a1 - a0) * i) / n) * 26, mc[1] + Math.sin(a0 + ((a1 - a0) * i) / n) * 26]);
    S(pts, c, NR);
  };
  S([[mc[0] - 44, mc[1]], ...Array.from({ length: 9 }, (_, i) => [mc[0] + Math.cos(PI + (PI * i) / 8) * 44, mc[1] + Math.sin(PI + (PI * i) / 8) * 44] as Pt), [mc[0] + 44, mc[1]]], "#EDE3C2", NR);
  seg(PI, PI * 1.33, "#C9453A");
  seg(PI * 1.33, PI * 1.66, "#E7B64A");
  seg(PI * 1.66, PI * 2, "#4F9A5A");
  for (let i = 0; i <= 6; i++) {
    const a = PI + (PI * i) / 6;
    ln(mc[0] + Math.cos(a) * 42, mc[1] + Math.sin(a) * 42, mc[0] + Math.cos(a) * 46, mc[1] + Math.sin(a) * 46, 2, C.shadow);
  }
  const na = PI * 1.78;
  S([[mc[0] - 3, mc[1]], [mc[0] + Math.cos(na) * 42, mc[1] + Math.sin(na) * 42], [mc[0] + 3, mc[1] + 2]], "#14100C", NR);
  E(mc[0], mc[1] + 1, 6, 6, M.tinDk, NR, 8);
  E(650, 656, 5, 5, "#66E08A", NR, 8);
  G(650, 656, 26, "#66E08A", 0.7);
  E(670, 656, 5, 5, "#FFC24A", NR, 8);
  B(692, 648, 28, 14, M.tin, NR);
  // counter: plank front with yellow trim
  B(14, TOP, 732, 16, M.woodLt);
  k.planks(14, TOP + 16, 732, 208, M.wood, 52, true);
  B(14, TOP + 16, 732, 8, M.tarpYellow, NR);
  for (let x = 40; x < 740; x += 90) {
    B(x, TOP + 60, 54, 70, darken(M.wood, 0.3), NR);
    E(x + 27, TOP + 95, 16, 16, M.tarpYellow, NR, 8);
  }
  // bamboo posts
  for (const x of [10, 722]) {
    for (let y = 120; y < 900; y += 78) B(x, y, 28, 76, mix(C.bamboo, C.ramp1, 0.4));
    for (let y = 120; y < 900; y += 78) B(x - 2, y + 72, 32, 6, mix(C.bamboo, C.ramp1, 0.6), NR);
  }
  // thatch roof: ragged layered bands, back (high) darker
  const ragged = (y0: number, yb: number, xl: number, xr: number, fill: string) => {
    const pts: Pt[] = [[xl, y0], [xr, y0]];
    for (let x = xr; x >= xl; x -= 16) pts.push([x, yb + r.range(-6, 28)], [x - 8, yb - r.range(2, 12)]);
    S(pts, fill, { rim: false });
  };
  S([[16, 134], [744, 134], [778, 300], [-18, 300]], mix(C.bamboo, C.ramp1, 0.5));
  ragged(150, 215, -6, 766, mix(C.bamboo, C.ramp1, 0.45));
  ragged(220, 275, -14, 774, mix(C.bamboo, C.ramp1, 0.35));
  ragged(280, 322, -20, 780, mix(C.bamboo, C.ramp1, 0.22));
  for (let y = 170; y < 300; y += 28) for (let x = 20; x < 740; x += 34) ln(x + (y % 3) * 4, y, x + 6, y + 18, 1.4, darken(C.bamboo, 0.6), { rim: false, opacity: 0.35 });
  B(10, 124, 740, 14, mix(C.bamboo, C.ramp1, 0.35));
  // solar panel on the roof: frame, cells, glint, stand, wire down the post
  const pan: Pt[] = [[470, 62], [736, 38], [748, 122], [482, 134]];
  S([[476, 128], [492, 128], [500, 140], [468, 140]], M.tinDk, NR);
  S(pan, M.tin);
  const q = (u: number, v: number): Pt => [470 + u * 266 + v * 12 - 0, 62 - u * 24 + v * 72 + u * 0];
  S([q(0.03, 0.06), q(0.97, 0.06), q(0.97, 0.94), q(0.03, 0.94)].map(([x, y], i) => [x! + (i === 1 || i === 2 ? 4 : 0), y!] as Pt), "#16294A", NR);
  for (let i = 1; i < 8; i++) ln(q(i / 8, 0.05)[0], q(i / 8, 0.05)[1], q(i / 8, 0.95)[0], q(i / 8, 0.95)[1], 1.8, "#4A6FA0", { rim: false, opacity: 0.8 });
  for (let j = 1; j < 3; j++) ln(q(0.02, j / 3)[0], q(0.02, j / 3)[1], q(0.98, j / 3)[0] + 4, q(0.98, j / 3)[1], 1.8, "#4A6FA0", { rim: false, opacity: 0.8 });
  S([[500, 74], [560, 70], [520, 120], [498, 122]], "#FFFFFF", { rim: false, opacity: 0.16 });
  ln(740, 120, 738, 300, 2.4, C.shadow);
  ln(738, 300, 700, 500, 2.4, C.shadow);
  ln(700, 500, 690, 560, 2.4, C.shadow);
  B(24, 352, 700, 40, "#000", { rim: false, opacity: 0.2 });
  const slots: Slots = { banner: [140, 186, 480, 110], board: [505, 692, 240, 204], nota: [54, 372, 240, 304] };
  k.banner(slots.banner);
  k.board(slots.board);
  k.nail(174, 380);
  G(500, 480, 260, C.lantern, 0.16);
  return finish(k, side, slots, glows.slice(0, 40));
};
export default stall;
