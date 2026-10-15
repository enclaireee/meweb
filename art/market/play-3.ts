// Refocus's shadow play: four scenes, one per booklet page. See play.ts for the kit.
import { C, ellipse, rect, type Pt } from "../helpers";
import { FEET, hc, hp, hr, rot, type Pen, type Play, type Scene } from "./play";

/** The child: a small wayang, no crown, the same in all four scenes. */
const KID = 0.75;
/** A butterfly at (x, y), scale s, tilted a degrees: four winged lobes with cut-out spots, a body. */
const fly = (p: Pen, x: number, y: number, s: number, a: number) => {
  for (const sd of [-1, 1]) {
    for (const [cx, cy, rx, ry] of [[8, -5, 8, 6], [6, 6, 5.5, 4.5]] as const) {
      const w = (rx2: number, ry2: number, n: number) => rot(ellipse(x + sd * cx * s, y + cy * s, rx2 * s, ry2 * s, n), x, y, a);
      p.shape(w(rx, ry, 12), { holes: [hp(w(rx * 0.45, ry * 0.4, 8))] });
    }
  }
  p.stroke(rot([[x, y - 8 * s], [x, y + 8 * s]], x, y, a), 2 * s);
};
const wave = (x0: number, x1: number, y: number, a: number, l: number) => {
  let d = `M${x0} ${y}`;
  for (let x = x0, i = 0; x < x1; x += l, i++) d += `Q${x + l / 2} ${y + (i % 2 ? a : -a)} ${x + l} ${y}`;
  return d;
};
/** A filled arrowhead at (x, y) pointing along (dx, dy). */
const head = (p: Pen, x: number, y: number, dx: number, dy: number, s = 10) => {
  const m = Math.hypot(dx, dy);
  const [ux, uy] = [dx / m, dy / m];
  p.shape([[x + ux * s * 1.4, y + uy * s * 1.4], [x - uy * s * 0.8, y + ux * s * 0.8], [x + uy * s * 0.8, y - ux * s * 0.8]]);
};
/** A fan of points between radii r0..r1 and angles a0..a1 (degrees, 0 = right, -90 = up). */
const wedge = (cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): Pt[] => {
  const at = (r: number, a: number): Pt => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const n = 8;
  const t = (i: number) => a0 + ((a1 - a0) * i) / n;
  return [...Array.from({ length: n + 1 }, (_, i) => at(r1, t(i))), ...Array.from({ length: n + 1 }, (_, i) => at(r0, t(n - i)))];
};

/** Overview: the child at a desk with a book; butterflies, their distractions, drift off around the head. */
const s1: Scene = ({ set, cast }) => {
  // the classroom: a window, a shelf of books, far butterflies
  set.box(400, 50, 150, 130, { holes: [hr(408, 58, 64, 114), hr(478, 58, 64, 114)] });
  set.box(20, 250, 130, 8);
  for (const [x, h] of [[30, 40], [48, 52], [66, 36], [84, 46], [104, 38]] as const) set.box(x, 250 - h, 14, h, { holes: [hr(x + 4, 250 - h + 6, 6, 3)] });
  for (const [x, y, a] of [[430, 230, 20], [520, 215, -15], [90, 70, -10]] as const) fly(set, x, y, 1.6, a);
  // the child at the desk, reaching to the book
  const k = cast.wayang(170, FEET, KID, { face: 1, front: "reach", back: "down", crown: false });
  cast.box(215, 270, 230, 10);
  cast.box(225, 280, 8, FEET - 280);
  cast.box(427, 280, 8, FEET - 280);
  cast.box(340, 280, 80, 52, { holes: [hr(348, 288, 64, 36)] });
  cast.box(k.hand[0] + 6, 256, 46, 14, { holes: [hr(k.hand[0] + 10, 259, 16, 8), hr(k.hand[0] + 30, 259, 16, 8)] });
  // butterflies drifting off the head, each on its rod
  for (const [x, y, s, a, lean] of [[100, 170, 1.9, -25, 6], [205, 105, 2.2, 10, -4], [310, 135, 1.8, 28, 8]] as const) {
    fly(cast, x, y, s, a);
    cast.rod(x, y + 10 * s, lean);
  }
  cast.rod(k.hand[0] + 28, 270, 0);
};

/** How it works: a headband on the child sends waves into a dial, and a loop arrow carries the feedback back. */
const s2: Scene = ({ set, cast }) => {
  // the clinic wall: a perforated panel, a long trace, a window
  set.shape([[470, 40], [570, 40], [570, 110], [470, 110]], { punch: 9 });
  set.stroke(wave(20, 580, 330, 10, 40), 3);
  set.box(24, 60, 90, 70, { holes: [hr(32, 68, 74, 54)] });
  const k = cast.wayang(110, FEET, KID, { face: 1, front: "down", back: "down", crown: false });
  const [hx, hy] = k.head;
  // the headband: a ring round the head with a sensor pod at the brow and one at the ear
  cast.ring(hx - 2, hy + 6, 25, 3.5);
  cast.shape(ellipse(hx + 22, hy - 6, 6, 6, 10), { holes: [hc(hx + 22, hy - 6, 2.5, 8)] });
  cast.shape(ellipse(hx - 22, hy + 14, 6, 6, 10), { holes: [hc(hx - 22, hy + 14, 2.5, 8)] });
  // waves flow out of the head, three trains of different pitch, on one rod
  for (const [y, a, l] of [[190, 10, 24], [214, 14, 30], [238, 8, 20]] as const) cast.stroke(wave(hx + 36, 330, y, a, l), 4);
  cast.rod(250, 246, 0);
  // the dial: a ring with green and amber zones lit, ticks, a needle
  const dx = 440;
  const dy = 215;
  cast.ring(dx, dy, 72, 10);
  cast.gel(wedge(dx, dy, 24, 60, -170, -100), "#6FA24A", 0.85);
  cast.gel(wedge(dx, dy, 24, 60, -100, -40), C.lantern, 0.85);
  for (const a of [-160, -130, -100, -70, -50])
    cast.line(dx + 62 * Math.cos((a * Math.PI) / 180), dy + 62 * Math.sin((a * Math.PI) / 180), dx + 68 * Math.cos((a * Math.PI) / 180), dy + 68 * Math.sin((a * Math.PI) / 180), 2.5);
  cast.line(dx, dy, dx + 46 * Math.cos(-1.3), dy + 46 * Math.sin(-1.3), 4);
  cast.ell(dx, dy, 9, 9, undefined, 10);
  cast.box(dx - 10, dy + 82, 20, FEET - dy - 82);
  cast.box(dx - 40, FEET - 8, 80, 8);
  cast.rod(dx + 34, FEET - 8, 6);
  // the loop: an arrow from the dial back over the top to the head
  cast.stroke("M440 138Q360 22 150 160", 5);
  head(cast, 150, 160, -220, 150);
  cast.rod(325, 88, 0);
};

/** What I built: a game world; the child leaps a row of hurdles that climb higher and higher. */
const s3: Scene = ({ set, cast }) => {
  // the game world: hills, floating coins, a sun, a tiled floor
  set.shape([[0, 376], [0, 300], [60, 250], [130, 290], [200, 258], [270, 376]], { punch: 16 });
  set.shape([[330, 376], [400, 290], [470, 240], [540, 280], [600, 300], [600, 376]], { punch: 16 });
  for (const [x, y] of [[150, 130], [210, 100], [270, 120], [380, 90]] as const) set.ring(x, y, 14, 5);
  set.halo(510, 80, 24, C.lantern);
  set.box(0, FEET, 600, 22);
  for (let x = 14; x < 590; x += 40) set.shape(rect(x, FEET + 6, 24, 10), { holes: [hr(x + 6, FEET + 9, 12, 4)] });
  // speed lines trailing the runner
  for (const [x, y, w] of [[40, 240, 70], [60, 262, 90], [30, 284, 60]] as const) cast.line(x, y, x + w, y, 4);
  // the child in mid-leap, arms flung
  cast.wayang(240, FEET - 62, KID, { face: 1, front: "raise", back: "hold", crown: false });
  // hurdles, each taller than the last
  for (const [x, h] of [[320, 40], [405, 72], [490, 104]] as const) {
    cast.box(x - 16, FEET - h, 5, h);
    cast.box(x + 12, FEET - h, 5, h);
    cast.box(x - 18, FEET - h, 38, 10, { holes: [hr(x - 12, FEET - h + 3, 26, 4)] });
    cast.box(x - 22, FEET - 4, 14, 4);
    cast.box(x + 10, FEET - 4, 14, 4);
    cast.rod(x, FEET - h + 10, 0);
  }
};

/** Stack & results: a trophy in the child's raised hand, a rosette beside, and the butterflies settled in a jar. */
const s4: Scene = ({ set, cast }) => {
  // the stage: a podium, bunting, stars
  set.shape([[20, 376], [20, 320], [60, 300], [220, 300], [260, 320], [260, 376]], { punch: 9 });
  set.stroke(wave(20, 580, 50, 14, 60), 3);
  for (let x = 50; x < 560; x += 60) set.shape([[x, 52], [x + 22, 52], [x + 11, 82]], { holes: [hc(x + 11, 59, 3, 8)] });
  for (const [x, y] of [[250, 150], [380, 130], [560, 150]] as const) set.shape([[x, y - 14], [x + 4, y - 4], [x + 14, y], [x + 4, y + 4], [x, y + 14], [x - 4, y + 4], [x - 14, y], [x - 4, y - 4]]);
  // the child, focused, holds the trophy up
  const k = cast.wayang(120, FEET, KID, { face: 1, front: "raise", back: "down", crown: false });
  const [hx, hy] = k.hand;
  cast.shape(
    [[hx - 20, hy - 54], [hx + 20, hy - 54], [hx + 16, hy - 26], [hx + 6, hy - 16], [hx + 6, hy - 8], [hx + 16, hy - 6], [hx + 16, hy], [hx - 16, hy], [hx - 16, hy - 6], [hx - 6, hy - 8], [hx - 6, hy - 16], [hx - 16, hy - 26]],
    { holes: [hc(hx, hy - 38, 5, 8)] },
  );
  cast.ring(hx - 24, hy - 42, 8, 3);
  cast.ring(hx + 24, hy - 42, 8, 3);
  // the rosette with its two tails
  cast.ell(300, 140, 24, 24, { holes: [hc(300, 140, 12, 16)] });
  for (let i = 0; i < 10; i++) cast.ell(300 + 26 * Math.cos((i * Math.PI) / 5), 140 + 26 * Math.sin((i * Math.PI) / 5), 7, 7, undefined, 8);
  cast.ell(300, 140, 5, 5, undefined, 8);
  cast.shape([[284, 166], [298, 162], [292, 236], [284, 224], [274, 234]], { holes: [hc(287, 190, 3, 8)] });
  cast.shape([[302, 162], [316, 166], [326, 234], [316, 224], [310, 236]], { holes: [hc(313, 190, 3, 8)] });
  cast.rod(300, 236, 0);
  // the jar of settled butterflies on a small table
  cast.box(425, 340, 120, 10);
  cast.box(435, 350, 8, FEET - 350);
  cast.box(527, 350, 8, FEET - 350);
  cast.box(450, 226, 60, 14);
  cast.shape([[448, 242], [518, 242], [526, 256], [526, 330], [518, 338], [448, 338], [440, 330], [440, 256]], { holes: [hp(rect(452, 252, 62, 74))] });
  cast.gel(rect(452, 252, 62, 74), C.lantern, 0.7);
  for (const [x, y, s, a] of [[470, 312, 1.1, -10], [498, 314, 1.0, 10], [484, 282, 1.0, 0]] as const) fly(cast, x, y, s, a);
  cast.rod(485, 350, 0);
};

const play: Play = [s1, s2, s3, s4];
export default play;
