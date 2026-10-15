// Stall 4, KOMAT UNPAR 2025: a ticket booth (loket) with an arched window, ticket roll, blank posters, bunting, stamp and cash tin. Cream and teal.
import { C, darken, lighten, mix, type Pt } from "../helpers";
import { M, type Slots, type StallGen } from "./types";
import { finish, kit, NR, PI } from "./stall-1";

const stall: StallGen = (r, side) => {
  const k = kit(r);
  const { S, B, E, G, ln } = k;
  const wall = M.tarpTeal;
  const cream = M.tarpCream;
  // wall, cornice, pilasters, plinth
  B(30, 250, 700, 450, wall);
  B(30, 250, 700, 450, C.ramp0, { rim: false, opacity: 0.25 });
  B(22, 246, 716, 22, cream);
  B(30, 268, 700, 6, darken(cream, 0.4), NR);
  for (const x of [30, 696]) {
    B(x, 274, 34, 426, cream);
    B(x + 22, 274, 8, 426, darken(cream, 0.3), NR);
  }
  // plinth: cream blocks with joints
  B(14, 700, 732, 200, mix(cream, C.ramp2, 0.35));
  for (let y = 700; y < 900; y += 40) {
    B(14, y, 732, 3, darken(cream, 0.55), NR);
    for (let x = (y / 40) % 2 ? 40 : 90; x < 746; x += 100) B(x, y, 3, 40, darken(cream, 0.55), NR);
  }
  B(14, 696, 732, 12, cream);
  // arched window: surround, dark lit interior with pigeonholes, grille
  const arch = (cx: number, base: number, rx: number, ry: number): Pt[] => {
    const pts: Pt[] = [[cx - rx, 656], [cx - rx, base]];
    for (let i = 1; i < 10; i++) pts.push([cx - Math.cos((i * PI) / 10) * rx, base - Math.sin((i * PI) / 10) * ry]);
    pts.push([cx + rx, base], [cx + rx, 656]);
    return pts;
  };
  S(arch(430, 470, 126, 80), cream);
  S(arch(430, 470, 104, 64), "#1B1410", NR);
  B(326, 470, 208, 186, "#1B1410", NR);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) B(334 + i * 48, 452 + j * 46, 42, 40, mix("#2A1D14", M.woodDk, 0.4), NR);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) B(338 + i * 48, 496 + j * 46 + 14, 34, 8, "#EDE0C0", { rim: false, opacity: 0.8 });
  G(430, 500, 190, C.lantern, 0.5);
  ln(430, 392, 430, 430, 2, C.shadow);
  E(430, 442, 11, 11, M.lampCore, NR, 10);
  // grille bars (two bars either side leave the counter slot open)
  for (const x of [336, 366, 498, 528]) B(x, 440, 5, 216, cream, NR);
  // sill and items
  B(280, 652, 296, 26, cream);
  B(280, 674, 296, 8, darken(cream, 0.4), NR);
  // ticket roll: spool seen from the side + strip hanging over the sill
  E(362, 622, 32, 32, "#F3EBD3");
  E(362, 622, 22, 22, "#E2D6B4", NR);
  E(362, 622, 8, 8, "#1B1410", NR, 10);
  for (let a = 0; a < 6; a++) ln(362 + Math.cos(a) * 12, 622 + Math.sin(a) * 12, 362 + Math.cos(a) * 30, 622 + Math.sin(a) * 30, 1.2, "#B5A67E", { rim: false, opacity: 0.7 });
  S([[388, 640], [412, 640], [412, 690], [388, 690]], "#F3EBD3");
  for (let y = 650; y < 690; y += 10) B(388, y, 24, 1.6, M.tarpRed, NR);
  // cash tin
  B(444, 618, 70, 34, M.tin);
  S([[444, 618], [514, 618], [506, 602], [452, 602]], lighten(M.tin, 0.12));
  B(450, 626, 58, 5, M.tinDk, NR);
  B(474, 610, 10, 4, M.tinDk, NR);
  // stamp: base, handle, knob
  B(526, 640, 36, 12, M.tarpRedDk);
  B(539, 612, 9, 28, M.woodLt);
  E(544, 606, 11, 9, M.woodDk, NR, 10);
  // posters: blank sheets, taped
  const poster = (x: number, y: number, w: number, h: number, rot: number, fill: string) => {
    const c = Math.cos(rot), s = Math.sin(rot);
    const t = (px: number, py: number): Pt => [x + w / 2 + (px - w / 2) * c - (py - h / 2) * s, y + h / 2 + (px - w / 2) * s + (py - h / 2) * c];
    S([t(0, 0), t(w, 0), t(w, h), t(0, h)], fill);
    S([t(w, h - 22), t(w, h), t(w - 22, h)], darken(fill, 0.18), NR);
    S([t(w / 2 - 16, -5), t(w / 2 + 16, -5), t(w / 2 + 16, 8), t(w / 2 - 16, 8)], "#D9C27A", { rim: false, opacity: 0.8 });
  };
  poster(574, 394, 84, 112, -0.05, "#F1E8D2");
  poster(604, 524, 92, 118, 0.06, mix("#F1E8D2", M.tarpYellow, 0.18));
  poster(666, 396, 34, 90, 0.05, mix("#F1E8D2", M.tarpTeal, 0.18));
  // counter-side slab under board is the plinth. Posts for bunting, hip roof with tile rows
  B(2, 24, 10, 250, M.woodLt);
  B(748, 40, 10, 234, M.woodLt);
  S([[56, 112], [704, 112], [764, 250], [-4, 250]], mix(M.tarpTeal, C.ramp2, 0.2));
  const rows = 4;
  for (let rw = 0; rw < rows; rw++) {
    const y0 = 118 + rw * 33;
    const half = rw % 2 ? 22 : 0;
    const f = [M.tarpTeal, mix(M.tarpTeal, C.ramp2, 0.35), M.tarpTeal, mix(M.tarpTeal, C.ramp2, 0.35)][rw]!;
    const xl = 56 - ((y0 - 112) / 138) * 60;
    const xr = 704 + ((y0 - 112) / 138) * 60;
    for (let x = xl - half; x < xr; x += 44) {
      const a = Math.max(x, xl - 2), b = Math.min(x + 44, xr + 2);
      if (b - a < 8) continue;
      S([[a, y0], [b, y0], [b - 3, y0 + 26], [(a + b) / 2, y0 + 34], [a + 3, y0 + 26]], f);
    }
  }
  B(48, 100, 664, 16, cream);
  S([[-4, 250], [764, 250], [764, 262], [-4, 262]], darken(cream, 0.3), NR);
  B(22, 246, 716, 6, cream, NR);
  // bunting from pole to pole over the roof
  const flags = [M.tarpCream, M.tarpYellow, M.tarpRed, M.tarpTeal];
  const at = (t: number): Pt => [6 + t * 746, 36 + 20 * (1 - t) + Math.sin(t * PI) * 56];
  let prev = at(0);
  for (let i = 1; i <= 24; i++) {
    const cur = at(i / 24);
    ln(prev[0], prev[1], cur[0], cur[1], 2.4, M.woodDk);
    prev = cur;
  }
  for (let i = 1; i < 24; i++) {
    const [fx, fy] = at(i / 24);
    S([[fx - 15, fy], [fx + 15, fy + 3], [fx + 1, fy + 40]], flags[i % 4]!, NR);
  }
  const slots: Slots = { banner: [140, 276, 480, 100], board: [505, 698, 240, 200], nota: [54, 390, 240, 300] };
  k.banner(slots.banner);
  k.board(slots.board);
  k.nail(174, 398);
  return finish(k, side, slots, [[420, 500, 150]]);
};
export default stall;
