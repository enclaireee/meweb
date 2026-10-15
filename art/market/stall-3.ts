// Stall 3, Refocus: a carnival game stall (ring toss, paper targets, plush prizes, arcade cabinet, hanging EEG headband), striped tent top.
import { C, darken, lighten, mix, type Pt } from "../helpers";
import { M, type Slots, type StallGen } from "./types";
import { finish, kit, NR, PI, type K } from "./stall-1";

const TEAL = "#7FE8E0";

const bottle = (k: K, x: number, base: number, col: string, ring = false) => {
  k.S([[x - 10, base], [x + 10, base], [x + 11, base - 30], [x + 4, base - 42], [x + 4, base - 56], [x - 4, base - 56], [x - 4, base - 42], [x - 11, base - 30]], col);
  k.B(x - 6, base - 28, 3, 20, lighten(col, 0.4), { rim: false, opacity: 0.7 });
  if (ring) k.S([[x - 15, base - 46], [x + 15, base - 46], [x + 15, base - 40], [x - 15, base - 40]], M.tarpYellow, NR);
};

const plush = (k: K, x: number, y: number, s: number, fill: string, kind: "bear" | "bunny" | "cat") => {
  k.ln(x, y - 56 * s, x, y - 26 * s, 2, M.woodDk);
  const head = y - 20 * s;
  if (kind === "bunny") {
    for (const dx of [-9, 9]) k.S([[x + dx * s - 5 * s, head - 8 * s], [x + dx * s + 5 * s, head - 8 * s], [x + dx * s + 3 * s, head - 44 * s], [x + dx * s - 3 * s, head - 44 * s]], fill);
  } else {
    for (const dx of [-17, 17]) k.S(kind === "cat" ? [[x + dx * s * 0.45, head - 14 * s], [x + dx * s, head - 36 * s], [x + dx * s * 1.1, head - 8 * s]] : ellipsePts(x + dx * s, head - 15 * s, 8 * s), fill);
  }
  k.E(x, head, 22 * s, 20 * s, fill);
  k.E(x, y + 24 * s, 25 * s, 28 * s, mix(fill, "#FFFFFF", 0.1));
  k.E(x - 8 * s, head - 3 * s, 2.6 * s, 2.6 * s, C.shadow, NR, 6);
  k.E(x + 8 * s, head - 3 * s, 2.6 * s, 2.6 * s, C.shadow, NR, 6);
  k.E(x, head + 6 * s, 6 * s, 4 * s, lighten(fill, 0.45), NR, 8);
  k.ln(x - 22 * s, y + 22 * s, x - 38 * s, y + 34 * s, 8 * s, fill, NR);
  k.ln(x + 22 * s, y + 22 * s, x + 38 * s, y + 34 * s, 8 * s, fill, NR);
};
const ellipsePts = (cx: number, cy: number, rad: number): Pt[] => Array.from({ length: 8 }, (_, i) => [cx + Math.cos((i * PI) / 4) * rad, cy + Math.sin((i * PI) / 4) * rad] as Pt);

const stall: StallGen = (r, side) => {
  const k = kit(r);
  const { S, B, E, G, ln } = k;
  const TOP = 676;
  k.planks(30, 300, 700, TOP - 300, mix(C.ramp2, M.tarpRedDk, 0.3), 36);
  B(30, 300, 700, 70, C.ramp0, { rim: false, opacity: 0.4 });
  // paper targets
  [335, 420, 505, 590].forEach((x, i) => {
    B(x - 3, 520, 6, 60, M.woodDk, NR);
    E(x, 505, 34, 34, M.cloth);
    E(x, 505, 26, 26, i % 2 ? M.tarpTeal : M.tarpRed, NR, 16);
    E(x, 505, 17, 17, M.cloth, NR, 14);
    E(x, 505, 9, 9, i % 2 ? M.tarpRed : M.tarpYellow, NR, 12);
    ln(x + 12, 492, x + 4, 504, 2, C.shadow);
  });
  // ring toss: stepped platform, bottles, rings
  B(296, 612, 330, 14, M.tarpYellow);
  B(296, 626, 330, 50, mix(M.tarpRedDk, C.ramp1, 0.3), NR);
  const cols = ["#3E8F86", "#D6A04A", "#8E3B38", "#4F8A5A", "#C9794A", "#5D79A6"];
  for (let i = 0; i < 8; i++) bottle(k, 316 + i * 42, 612, cols[(i + 1) % 6]!, i === 2 || i === 5);
  for (let i = 0; i < 7; i++) bottle(k, 337 + i * 42, 676, cols[(i + 3) % 6]!, i === 1 || i === 4);
  // prizes
  plush(k, 336, 410, 1, "#C9965A", "bear");
  plush(k, 395, 420, 0.9, "#E7C9D2", "bunny");
  plush(k, 620, 404, 0.95, "#D9B84A", "cat");
  // EEG headband hung from a hook: band with electrodes, cable and a small box
  ln(500, 296, 500, 330, 2.4, M.woodDk);
  const band: Pt[] = [];
  const inner: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = PI + (PI * i) / 12;
    band.push([500 + Math.cos(a) * 64, 400 + Math.sin(a) * 66]);
    inner.unshift([500 + Math.cos(a) * 48, 400 + Math.sin(a) * 50]);
  }
  S([...band, ...inner], "#EAE2D0");
  for (let i = 2; i <= 10; i += 2) {
    const a = PI + (PI * i) / 12;
    E(500 + Math.cos(a) * 56, 400 + Math.sin(a) * 58, 8, 8, "#E7B64A", undefined, 8);
    E(500 + Math.cos(a) * 56, 400 + Math.sin(a) * 58, 3, 3, M.tarpTealDk, NR, 6);
  }
  B(430, 396, 24, 10, "#B8B2A0", NR);
  B(546, 396, 24, 10, "#B8B2A0", NR);
  const cab: Pt[] = [];
  for (let i = 0; i <= 8; i++) cab.push([440 + i * 6.5 + Math.sin(i) * 3, 408 + Math.sin((i / 8) * PI) * 44 + i * 2.5]);
  for (let i = 0; i < 8; i++) ln(cab[i]![0], cab[i]![1], cab[i + 1]![0], cab[i + 1]![1], 3.6, M.tarpTeal);
  // arcade cabinet
  S([[630, TOP], [630, 476], [650, 436], [726, 436], [744, 476], [744, TOP]], mix("#34285A", C.ramp1, 0.2));
  S([[640, 448], [734, 448], [734, 470], [640, 470]], M.tarpYellow);
  for (let x = 648; x < 730; x += 20) B(x, 452, 8, 14, M.tarpRed, NR);
  B(642, 480, 90, 84, "#050B10");
  B(646, 484, 82, 76, "#0C2A33", NR);
  for (let i = 0; i < 9; i++) {
    const y1 = 540 - Math.abs(Math.sin(i * 1.3)) * 30 - i * 2;
    ln(650 + i * 9, 540, 654 + i * 9, y1, 3, TEAL);
  }
  const ring: Pt[] = [];
  for (let i = 0; i < 10; i++) ring.push([686 + Math.cos(i * 0.628) * 20, 512 + Math.sin(i * 0.628) * 20]);
  for (let i = 0; i < 10; i++) ln(ring[i]![0], ring[i]![1], ring[(i + 1) % 10]![0], ring[(i + 1) % 10]![1], 2.4, "#FFE9A8");
  G(686, 522, 130, TEAL, 0.45);
  S([[636, 584], [738, 584], [744, 610], [630, 610]], mix("#34285A", C.ramp1, 0.5));
  E(654, 592, 5, 5, C.shadow, NR, 8);
  ln(654, 592, 654, 580, 4, "#C94A3A");
  E(654, 578, 6, 6, "#E0453A", NR, 8);
  [["#E0453A", 690], ["#E7B64A", 708], ["#4FC3B8", 726]].forEach(([c, x]) => E(x as number, 594, 5, 5, c as string, NR, 8));
  B(630, 612, 114, 60, "#000", { rim: false, opacity: 0.25 });
  // counter: bold stripes + bulb strip
  B(14, TOP, 732, 16, M.tarpYellow);
  for (let i = 0; i < 18; i++) B(14 + i * 40.6, TOP + 16, 40.6, 208, i % 2 ? M.tarpYellow : M.tarpRed, i % 2 ? undefined : undefined);
  B(14, TOP + 16, 732, 10, "#000", { rim: false, opacity: 0.25 });
  k.post(10, 130, 30, M.woodDk);
  k.post(720, 130, 30, M.woodDk);
  // tent top: radiating stripes + scalloped valance
  const apex: Pt = [380, 44];
  const n = 12;
  const x0 = -16;
  const ww = 792 / n;
  for (let i = 0; i < n; i++) S([apex, [x0 + i * ww, 268], [x0 + (i + 1) * ww, 268]], i % 2 ? M.tarpRed : M.tarpYellow);
  k.scallops(x0, x0 + n * ww, 266, 38, n, [M.tarpYellow, M.tarpRed]);
  B(376, -6, 8, 56, M.woodLt);
  S([[384, 0], [440, 16], [384, 32]], M.tarpRed);
  // bulbs along the slopes and under the valance
  for (let i = 1; i <= 7; i++) for (const sx of [-1, 1]) E(380 + sx * i * 50, 44 + i * 32, 5, 5, M.lampCore, NR, 8);
  for (let i = 0; i < 10; i++) {
    const x = 60 + i * 72;
    E(x, 318 + Math.sin((i / 9) * PI) * 12 + 14, 5.5, 5.5, M.lampCore, NR, 8);
  }
  B(24, 352, 712, 40, "#000", { rim: false, opacity: 0.28 });
  G(380, 340, 210, C.lantern, 0.28);
  G(520, 640, 220, C.lantern, 0.2);
  const slots: Slots = { banner: [140, 196, 480, 110], board: [505, 692, 240, 204], nota: [54, 372, 240, 304] };
  k.banner(slots.banner);
  k.board(slots.board);
  k.nail(174, 380);
  return finish(k, side, slots, [[686, 522, 120], [300, 340, 90], [500, 340, 90], [700, 340, 90]]);
};
export default stall;
