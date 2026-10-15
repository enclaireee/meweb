// Stall 2, OT Observability Lab: an electronics repair stall (radios, gauges, a green round scope, wire coils, soldering lamp), teal tarp.
import { C, darken, lighten, mix, type Pt } from "../helpers";
import { M, type Slots, type StallGen } from "./types";
import { finish, kit, NR, PI, type K } from "./stall-1";

const GREEN = "#5CFF9A";

const radio = (k: K, x: number, y: number, w: number, h: number, fill: string) => {
  k.B(x, y, w, h, fill);
  k.B(x + 6, y + 6, w * 0.55, h - 12, darken(fill, 0.55), NR);
  for (let t = 12; t < h - 10; t += 8) k.B(x + 8, y + t, w * 0.55 - 4, 2, lighten(darken(fill, 0.4), 0.2), NR);
  k.E(x + w * 0.8, y + h * 0.36, h * 0.2, h * 0.2, M.cloth, NR, 10);
  k.ln(x + w * 0.8, y + h * 0.36, x + w * 0.8 + 3, y + h * 0.22, 1.5, M.woodDk);
  k.E(x + w * 0.8, y + h * 0.78, 4, 4, M.tinDk, NR, 6);
  k.ln(x + w * 0.9, y, x + w + 6, y - 28, 2, M.tin);
};

const gauge = (k: K, cx: number, cy: number, rad: number, needle: number) => {
  k.E(cx, cy, rad + 5, rad + 5, M.tinDk, undefined, 18);
  k.E(cx, cy, rad, rad, "#E6DDBE", NR, 18);
  for (let a = PI * 0.8; a <= PI * 2.2 + 0.01; a += PI * 0.14) {
    k.ln(cx + Math.cos(a) * rad * 0.72, cy + Math.sin(a) * rad * 0.72, cx + Math.cos(a) * rad * 0.9, cy + Math.sin(a) * rad * 0.9, 2, M.woodDk);
  }
  const rd = PI * 2.12 - 0.01;
  k.S([[cx + Math.cos(rd - 0.45) * rad * 0.62, cy + Math.sin(rd - 0.45) * rad * 0.62], [cx + Math.cos(rd) * rad * 0.9, cy + Math.sin(rd) * rad * 0.9], [cx + Math.cos(rd) * rad * 0.7, cy + Math.sin(rd) * rad * 0.7]], M.tarpRed, NR);
  const a = PI * (0.8 + 1.4 * needle);
  k.ln(cx, cy, cx + Math.cos(a) * rad * 0.8, cy + Math.sin(a) * rad * 0.8, 2.6, C.shadow);
  k.E(cx, cy, 4, 4, C.shadow, NR, 8);
};

const stall: StallGen = (r, side) => {
  const k = kit(r);
  const { S, B, E, G, ln } = k;
  const TOP = 676;
  // cool back wall + shelving
  B(30, 300, 700, TOP - 300, mix(C.ramp2, M.woodDk, 0.25), NR);
  B(30, 300, 700, 70, C.ramp0, { rim: false, opacity: 0.45 });
  for (const y of [436]) {
    B(290, y, 440, 12, M.wood);
    S([[300, y + 12], [320, y + 12], [300, y + 36]], M.woodDk, NR);
    S([[700, y + 12], [720, y + 12], [720, y + 36]], M.woodDk, NR);
  }
  // radios on the shelf
  radio(k, 328, 366, 96, 70, M.tarpTeal);
  radio(k, 436, 380, 82, 56, mix(M.wood, M.tarpCream, 0.2));
  radio(k, 534, 356, 100, 80, mix(M.tarpRed, M.woodDk, 0.3));
  // wire coil on a peg and a hanging bundle
  for (let i = 0; i < 4; i++) k.E(676, 424 - i * 9, 30, 10, i % 2 ? "#B8683B" : "#D08A4E", undefined, 14);
  k.E(676, 390, 30, 10, "#E0A36A", NR, 14);
  // gauge row
  [0.2, 0.55, 0.8].forEach((n, i) => gauge(k, 340 + i * 66, 486, 28, n));
  // rack panel on the right with big gauges + indicator lamps
  B(520, 460, 210, 114, M.tinDk);
  B(526, 466, 198, 102, mix(M.tinDk, C.ramp1, 0.55), NR);
  gauge(k, 574, 508, 34, 0.7);
  gauge(k, 666, 508, 34, 0.3);
  const lamps: [number, string][] = [[546, "#FF5A4A"], [574, "#FFC24A"], [602, GREEN], [630, GREEN], [658, "#FFC24A"], [686, "#FF5A4A"], [710, GREEN]];
  for (const [x, c] of lamps) {
    E(x, 556, 6, 6, c, NR, 8);
    G(x, 556, 22, c, 0.7);
  }
  // scope on the counter: body, round bezel, green screen, trace, knobs
  S([[296, TOP], [296, 530], [310, 516], [480, 516], [494, 530], [494, TOP]], mix(M.tarpTealDk, C.ramp1, 0.2));
  B(306, 524, 178, 8, M.tarpTeal, NR);
  E(395, 598, 64, 64, "#1B2B2A", undefined, 22);
  E(395, 598, 54, 54, "#0A2A1A", NR, 22);
  for (const t of [-36, -18, 0, 18, 36]) {
    ln(395 + t, 562, 395 + t, 634, 1, "#1D6B45", { rim: false, opacity: 0.8 });
    ln(359, 598 + t, 431, 598 + t, 1, "#1D6B45", { rim: false, opacity: 0.8 });
  }
  const tr: Pt[] = [];
  for (let i = 0; i <= 16; i++) tr.push([347 + i * 6, 598 + Math.sin(i * 0.8) * 22 * Math.sin((i / 16) * PI)]);
  for (let i = 0; i < 16; i++) ln(tr[i]![0], tr[i]![1], tr[i + 1]![0], tr[i + 1]![1], 3.4, "#9BFFC2");
  G(395, 598, 150, GREEN, 0.5);
  G(395, 598, 60, "#C8FFE0", 0.35);
  for (const kx of [340, 380, 420, 456]) {
    E(kx, 660, 8, 8, M.tin, undefined, 10);
    ln(kx, 660, kx + 3, 654, 2, C.shadow);
  }
  B(330, 508, 130, 8, M.tinDk);
  // wire coil and spool on the counter, soldering lamp
  for (let i = 0; i < 3; i++) E(535, 662 - i * 8, 26, 9, i % 2 ? "#B8683B" : "#D08A4E", undefined, 14);
  B(598, 636, 40, 40, M.woodDk);
  E(618, 650, 14, 14, M.tin, NR, 10);
  B(654, 660, 56, 16, M.tinDk);
  ln(682, 662, 660, 600, 6, M.tin);
  ln(660, 600, 620, 586, 6, M.tin);
  E(660, 600, 6, 6, M.tinDk, NR, 8);
  S([[600, 584], [636, 576], [632, 612], [612, 616]], "#FFF2C8");
  G(618, 604, 120, "#FFE9A8", 0.45);
  ln(724, 640, 704, 664, 3, "#B8683B");
  // counter: drawers
  B(14, TOP, 732, 16, M.woodLt);
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 5; col++) {
      const x = 22 + col * 143;
      const y = TOP + 18 + row * 104;
      B(x, y, 138, 100, row ? mix(M.tarpTealDk, M.wood, 0.3) : M.tarpTealDk);
      B(x + 12, y + 14, 114, 70, darken(M.tarpTealDk, 0.3), NR);
      E(x + 69, y + 32, 7, 5, M.tin, NR, 8);
    }
  // posts, antenna, corrugated roof
  k.post(10, 120, 32, M.tin);
  k.post(718, 120, 32, M.tin);
  B(90, 6, 7, 130, M.tinDk);
  for (const [y, w] of [[26, 70], [50, 50], [74, 34]] as const) B(94 - w / 2, y, w, 5, M.tinDk);
  ln(94, 8, 732, 130, 1.6, C.ramp3);
  E(94, 8, 5, 5, "#FF5A4A", NR, 8);
  G(94, 8, 40, "#FF5A4A", 0.7);
  S([[12, 150], [748, 150], [774, 340], [-14, 340]], M.tarpTealDk);
  S([[22, 126], [738, 126], [764, 318], [-4, 318]], M.tarpTeal);
  for (let x = 40; x < 740; x += 30) ln(x + (x - 380) * 0.03, 128, x + (x - 380) * 0.07, 318, 5, lighten(M.tarpTeal, 0.12), { rim: false, opacity: 0.5 });
  for (let x = 20; x < 760; x += 120) for (const gy of [300]) E(x + (x - 380) * 0.07, gy, 4, 4, M.tarpTealDk, NR, 6);
  S([[-4, 318], [764, 318], [770, 334], [380, 340], [-10, 334]], M.tarpTealDk);
  B(24, 352, 712, 40, "#000", { rim: false, opacity: 0.3 });
  // bare bulb on a cord
  ln(310, 336, 310, 372, 2, C.shadow);
  E(310, 380, 10, 10, M.lampCore, NR, 10);
  G(310, 380, 120, C.lantern, 0.5);
  const slots: Slots = { banner: [140, 176, 480, 110], board: [505, 692, 240, 204], nota: [54, 372, 240, 304] };
  k.banner(slots.banner);
  k.board(slots.board);
  k.nail(174, 380);
  return finish(k, side, slots, [[395, 598, 130], [618, 604, 90], [310, 380, 100], [574, 556, 40], [686, 556, 40]]);
};
export default stall;
