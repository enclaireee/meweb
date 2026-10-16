// KOMAT UNPAR 2025's shadow play: four scenes, one per booklet page. See play.ts for the kit.
import { C, rect, type Pt } from "../helpers";
import { FEET, hc, hp, hr, rot, type Play, type Scene } from "./play";

/** The student: the same crownless wayang in all four scenes. */
const ST = 0.8;
const wave = (x0: number, x1: number, y: number, a: number, l: number) => {
  let d = `M${x0} ${y}`;
  for (let x = x0, i = 0; x < x1; x += l, i++) d += `Q${x + l / 2} ${y + (i % 2 ? a : -a)} ${x + l} ${y}`;
  return d;
};

/** Overview: students stream toward the exam hall, each holding a compass, a protractor or a set square aloft. */
const s1: Scene = ({ set, cast }) => {
  // the hall: pediment, columns, steps, a lit door
  set.shape([[430, 150], [510, 100], [590, 150]], { holes: [hc(510, 132, 9)] });
  set.box(436, 154, 148, 10);
  for (const x of [444, 480, 540, 568]) set.box(x, 164, 10, 192);
  set.box(430, 356, 160, 8);
  set.box(424, 364, 172, 12);
  set.box(492, 170, 36, 186, { holes: [hr(498, 178, 24, 172)] });
  set.gel(rect(498, 178, 24, 172), C.lantern, 0.7);
  for (const [x, y] of [[40, 90], [150, 60], [260, 100]] as const) set.shape(rot(rect(x, y, 30, 18), x + 15, y + 9, 12));
  // three students, each tool aloft
  const hands = [100, 230, 360].map((x) => cast.wayang(x, FEET, ST, { face: 1, front: "raise", back: "down", crown: false }).hand);
  const [[ax, ay], [bx, by], [cx, cy]] = hands as [Pt, Pt, Pt];
  // compass: two legs from a pivot ring
  cast.line(ax, ay - 36, ax - 10, ay - 2, 4);
  cast.line(ax, ay - 36, ax + 10, ay - 2, 4);
  cast.ring(ax, ay - 40, 6, 3);
  // protractor: a half-disc, perforated
  cast.shape([...Array.from({ length: 13 }, (_, i): Pt => [bx + 28 * Math.cos(Math.PI + (Math.PI * i) / 12), by - 2 + 28 * Math.sin(Math.PI + (Math.PI * i) / 12)])], { punch: 9 });
  // set square: a right triangle with a window cut out
  cast.shape([[cx - 18, cy - 2], [cx + 22, cy - 2], [cx - 18, cy - 46]], { holes: [hp([[cx - 11, cy - 9], [cx + 11, cy - 9], [cx - 11, cy - 32]])] });
};

/** How it works: a person queues at a booth: a form, a coin dropped in the box, a stamped ticket. */
const s2: Scene = ({ set, cast }) => {
  // the booth: scalloped awning, posts, counter, flow chevrons, a second person waiting
  set.shape([[190, 70], [590, 70], [590, 96], [190, 96]], { punch: 9 });
  for (let x = 196; x < 580; x += 30) set.ell(x + 8, 98, 14, 12, undefined, 8);
  set.box(200, 96, 8, 280);
  set.box(570, 96, 8, 280);
  set.box(200, 304, 380, 12);
  for (const x of [238, 390]) set.shape([[x, 214], [x + 14, 226], [x, 238]]);
  set.wayang(32, FEET, ST, { face: 1, front: "down", back: "down", crown: false });
  // the person, form in hand
  const k = cast.wayang(100, FEET, ST, { face: 1, front: "reach", back: "down", crown: false });
  const [fx, fy] = k.hand;
  cast.box(fx + 2, fy - 58, 42, 58, { holes: [hr(fx + 8, fy - 50, 30, 4), hr(fx + 8, fy - 40, 30, 4), hr(fx + 8, fy - 30, 22, 4), hr(fx + 8, fy - 18, 14, 8)] });
  // a coin falling into the collection box
  cast.box(284, 252, 76, 52, { holes: [hr(300, 262, 44, 5)] });
  cast.rod(322, 304, 0);
  cast.ring(322, 200, 15, 5);
  cast.halo(322, 200, 8, C.lantern);
  cast.rod(322, 216, 0);
  // the ticket, notched and punched, under a stamp
  cast.shape([[430, 250], [520, 250], [520, 267], [512, 273], [520, 279], [520, 296], [430, 296], [430, 279], [438, 273], [430, 267]], { holes: [hc(472, 273, 9), hr(488, 262, 22, 4), hr(488, 282, 22, 4)] });
  cast.rod(444, 296, -4);
  cast.shape([[466, 160], [484, 160], [484, 196], [500, 196], [500, 232], [450, 232], [450, 196], [466, 196]], { holes: [hc(475, 214, 6, 10)] });
  cast.rod(475, 232, 0);
};

/** What I built: the admin desk: a clerk with a ledger, a laptop whose screen glows with bars, a filing cabinet. */
const s3: Scene = ({ set, cast }) => {
  // the office wall: shelves of binders, pinned notes, a hanging lamp
  set.box(20, 150, 150, 8);
  for (const [x, h] of [[28, 44], [46, 54], [64, 40], [82, 50], [100, 42], [118, 52], [136, 38]] as const) set.box(x, 150 - h, 14, h, { holes: [hr(x + 4, 150 - h + 6, 6, 3)] });
  for (const [x, y, a] of [[250, 60, -8], [320, 70, 6], [390, 56, 10]] as const) set.shape(rot(rect(x, y, 40, 50), x + 20, y + 25, a), { holes: [hr(x + 8, y + 10, 24, 4), hr(x + 8, y + 22, 24, 4)] });
  set.stroke("M560 10L560 56", 2);
  set.shape([[546, 60], [574, 60], [580, 84], [540, 84]]);
  set.halo(560, 88, 10, C.lantern);
  // the clerk with the ledger
  const k = cast.wayang(130, FEET, ST, { face: 1, front: "hold", back: "down", crown: false });
  const [hx, hy] = k.hand;
  cast.box(hx - 6, hy - 30, 48, 34, { holes: [hr(hx - 2, hy - 26, 18, 26), hr(hx + 22, hy - 26, 18, 26)] });
  // the desk, and the laptop with its glowing bars
  cast.box(240, 282, 180, 10);
  cast.box(248, 292, 8, FEET - 292);
  cast.box(404, 292, 8, FEET - 292);
  cast.shape([[276, 196], [352, 196], [356, 274], [272, 274]], { holes: [hp([[284, 204], [344, 204], [347, 266], [281, 266]])] });
  cast.gel([[284, 204], [344, 204], [347, 266], [281, 266]], "#6FA24A", 0.85);
  for (const [x, h] of [[292, 14], [306, 26], [320, 40]] as const) cast.box(x, 262 - h, 9, h);
  cast.box(264, 274, 100, 8);
  cast.rod(314, 282, 0);
  // the filing cabinet: three drawers, a handle in each
  cast.box(450, 176, 88, 200, { holes: [hr(458, 184, 72, 52), hr(458, 244, 72, 52), hr(458, 304, 72, 64)] });
  for (const y of [206, 266, 334]) cast.box(484, y, 20, 6);
  cast.rod(544, 376, 4);
};

/** Stack & results: a ship under sail leaves the harbour, carrying the site (a browser window) on deck. */
const s4: Scene = ({ set, cast }) => {
  // the harbour: sun on the water, dock with posts, a crane, a lighthouse, gulls
  set.halo(190, 110, 26, C.lantern);
  set.box(12, 376, 170, 12, { holes: [hr(24, 380, 40, 4), hr(80, 380, 40, 4)] });
  for (const x of [24, 90, 160]) set.box(x, 388, 10, 10);
  set.box(150, 250, 8, 126);
  set.box(150, 250, 90, 8);
  set.line(238, 258, 238, 300, 2);
  set.shape([[548, 360], [572, 360], [566, 220], [554, 220]], { holes: [hr(556, 250, 8, 14)] });
  set.shape([[550, 220], [570, 220], [560, 196]]);
  for (const [x, y] of [[300, 90], [350, 60]] as const) set.stroke(`M${x} ${y}Q${x + 10} ${y - 10} ${x + 20} ${y}Q${x + 30} ${y - 10} ${x + 40} ${y}`, 2.5);
  for (const y of [358, 370, 384]) set.stroke(wave(190, 588, y, 5, 40), 2.5);
  // a student on the dock waves it off
  cast.wayang(80, FEET, ST, { face: 1, front: "raise", back: "down", crown: false });
  // the ship: perforated hull, a mast, two sails and a pennant
  cast.shape([[250, 300], [530, 300], [500, 346], [280, 346]], { holes: [hc(320, 322, 6), hc(360, 322, 6), hc(400, 322, 6)] });
  cast.box(418, 118, 6, 184);
  cast.shape([[428, 126], [512, 282], [428, 282]], { punch: 9 });
  cast.shape([[410, 140], [410, 282], [340, 282]], { punch: 9 });
  cast.shape([[421, 112], [458, 120], [421, 130]]);
  // the site on deck: a browser window with a dotted bar and lit bars
  cast.box(256, 238, 64, 60, { holes: [hr(262, 254, 52, 40), hc(269, 246, 2.5, 8), hc(279, 246, 2.5, 8)] });
  cast.gel(rect(262, 254, 52, 40), C.lantern, 0.85);
  for (const [y, w] of [[261, 30], [271, 40], [281, 22]] as const) cast.box(268, y, w, 5);
  cast.rod(390, 346, -2);
  for (const [y, x0] of [[354, 250], [366, 270]] as const) cast.stroke(wave(x0, 540, y, 5, 40), 3);
};

const play: Play = [s1, s2, s3, s4];
export default play;
