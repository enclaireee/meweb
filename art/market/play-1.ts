// DemandX's shadow play: four scenes, one per booklet page. See play.ts for the kit.
import { C, rect } from "../helpers";
import { CH, FEET, hc, hp, hr, rot, type Play, type Scene } from "./play";

/** Overview: a warehouse of sacks and crates; the merchant faces a heap of mismatched papers. */
const s1: Scene = ({ set, cast, r }) => {
  // the warehouse: rafters, two shelving bays, sacks and crates on them, a hanging lamp
  set.shape([[0, 0], [600, 0], [600, 22], [300, 58], [0, 22]], { holes: [hc(300, 30, 9)] });
  for (const x of [80, 200, 330, 460]) set.line(x, 12, x + 20, 44, 5);
  for (const [x0, w] of [[24, 210], [244, 150]] as const) {
    set.box(x0, 110, 10, FEET - 110);
    set.box(x0 + w - 10, 110, 10, FEET - 110);
    for (const y of [176, 262, 350]) set.box(x0, y, w, 8);
    for (const y of [176, 262]) {
      let x = x0 + 14;
      while (x < x0 + w - 40) {
        const sack = r() < 0.55;
        const sw = sack ? r.int(30, 42) : r.int(34, 50);
        const sh = sack ? r.int(44, 60) : r.int(36, 52);
        if (sack) set.shape([[x, y], [x + sw, y], [x + sw - 3, y - sh * 0.7], [x + sw / 2 + 6, y - sh], [x + sw / 2 - 6, y - sh], [x + 3, y - sh * 0.7]]);
        else set.box(x, y - sh, sw, sh, { holes: [hr(x + 5, y - sh + 5, sw - 10, 3), hr(x + 5, y - 8, sw - 10, 3)] });
        x += sw + r.int(4, 10);
      }
    }
  }
  set.stroke("M470 22 L470 70", 2);
  set.shape([[458, 70], [482, 70], [486, 96], [454, 96]], { holes: [hr(462, 76, 16, 16)] });
  set.halo(470, 84, 10, C.lantern);
  // the merchant at his desk, reaching for the heap; the heap itself on its own rod
  const m = cast.wayang(250, FEET, 1, { face: 1, front: "reach", back: "down" });
  cast.box(330, 262, 176, 12);
  cast.box(342, 274, 8, FEET - 274);
  cast.box(486, 274, 8, FEET - 274);
  const heap: [number, number, number, number, number][] = [
    [352, 238, 62, 26, -8],
    [404, 230, 48, 30, 10],
    [372, 210, 70, 22, 4],
    [430, 200, 40, 34, -14],
    [360, 186, 44, 26, 18],
    [410, 170, 58, 22, -6],
    [388, 146, 38, 30, 24],
    [440, 150, 30, 26, -22],
  ];
  // each sheet a frame with a lit middle, so the overlap still reads as many odd sizes
  for (const [x, y, w, h, a] of heap) cast.shape(rot(rect(x, y, w, h), x + w / 2, y + h / 2, a), { holes: [hp(rot(rect(x + 4, y + 4, w - 8, h - 8), x + w / 2, y + h / 2, a))] });
  // loose sheets drifting off the top of the heap
  for (const [x, y, a] of [[468, 118, 30], [350, 128, -24], [500, 168, 52]] as const) cast.shape(rot(rect(x, y, 24, 16), x + 12, y + 8, a));
  cast.rod(m.hand[0] + 4, m.hand[1], 0);
  cast.rod(418, 274, 6);
};

/** How it works: odd papers fall into a funnel and come out as uniform cards; five runners (the ensemble) race to a flag. */
const s2: Scene = ({ set, cast, r }) => {
  // set: rafters and a shelf of crates along the back wall
  set.shape([[0, 0], [600, 0], [600, 18], [300, 40], [0, 18]]);
  set.box(24, 150, 552, 8);
  let cx = 40;
  while (cx < 530) {
    const w = r.int(36, 52);
    const h = r.int(30, 48);
    set.box(cx, 150 - h, w, h, { holes: [hr(cx + 5, 150 - h + 6, w - 10, 3)] });
    cx += w + r.int(6, 16);
  }
  const m = cast.wayang(70, FEET, 1, { face: 1, front: "reach", back: "down" });
  cast.rod(m.hand[0] + 4, m.hand[1], 0);
  // odd sheets tumbling into the funnel
  const odd: [number, number, number, number, number][] = [[160, 14, 30, 20, -20], [200, 34, 22, 32, 15], [236, 10, 32, 18, 30], [178, 62, 16, 14, 40], [240, 50, 26, 22, -12]];
  for (const [x, y, w, h, a] of odd) {
    const c: [number, number] = [x + w / 2, y + h / 2];
    cast.shape(rot(rect(x, y, w, h), ...c, a), w >= 26 ? { holes: [hp(rot(rect(x + 4, y + 4, w - 8, h - 8), ...c, a))] } : {});
  }
  cast.shape([[150, 90], [270, 90], [226, 172], [226, 198], [194, 198], [194, 172]], { punch: 9 });
  cast.rod(210, 198, 0);
  // the belt, and the uniform cards riding it
  cast.box(186, 240, 144, 8);
  cast.box(192, 248, 8, FEET - 248);
  cast.box(318, 248, 8, FEET - 248);
  for (let i = 0; i < 4; i++) cast.box(199 + i * 34, i ? 204 : 206, 22, 32, { holes: [hr(204 + i * 34, i ? 212 : 214, 12, 3), hr(204 + i * 34, i ? 222 : 224, 12, 3)] });
  // the ensemble: 2 big and 3 small runners, one flag
  const field: [number, number][] = [[362, 0.28], [398, 0.42], [438, 0.28], [478, 0.42], [516, 0.28]];
  for (const [x, s] of field) cast.wayang(x, FEET, s, { face: 1, front: "reach", back: "down" });
  cast.line(564, 150, 564, CH + 14, 4);
  cast.shape([[564, 150], [526, 162], [564, 178]], { holes: [hp([[556, 160], [538, 164], [556, 170]])] });
};

/** What I built: three branch shops with different crate stacks; the merchant weighs coins against a crate. */
const s3: Scene = ({ set, cast }) => {
  for (let k = 0; k < 3; k++) {
    const x0 = 14 + k * 194;
    set.shape([[x0 + 14, 140], [x0 + 89, 104], [x0 + 164, 140]]);
    set.shape([[x0, 140], [x0 + 178, 140], [x0 + 170, 172], [x0 + 8, 172]], { punch: 8 });
    set.box(x0 + 14, 172, 150, FEET - 172, { holes: [hr(x0 + 34, 192, 110, 56)] });
  }
  const crate = (x: number, y: number) => cast.box(x, y, 44, 28, { holes: [hr(x + 6, y + 6, 32, 4), hr(x + 6, y + 17, 32, 4)] });
  for (let k = 0; k < 4; k++) crate(36, FEET - 29 - k * 31); // shop one: a tall column
  for (const x of [96, 143]) crate(x, FEET - 29); // shop two: a low row
  for (let k = 0; k < 3; k++) for (let j = 0; j < 3 - k; j++) crate(436 + k * 23 + j * 47, FEET - 29 - k * 31); // shop three: a pyramid
  for (const x of [58, 118, 480, 530]) cast.rod(x, FEET - 10, 0);
  // the balance on its post, coins sinking one pan, a crate in the other; the merchant touches the heavy pan
  const m = cast.wayang(215, FEET, 1, { face: 1, front: "reach", back: "down" });
  cast.rod(m.hand[0] + 4, m.hand[1], 0);
  cast.box(326, 150, 8, FEET - 150);
  cast.box(308, 366, 44, 10);
  cast.rod(330, 366, 0);
  cast.line(272, 164, 388, 136, 5);
  cast.ell(330, 150, 8, 8);
  for (const [x, y] of [[272, 164], [388, 136]] as const) {
    cast.line(x, y, x - 18, y + 40, 1.8);
    cast.line(x, y, x + 18, y + 40, 1.8);
    cast.shape([[x - 22, y + 40], [x + 22, y + 40], [x + 14, y + 50], [x - 14, y + 50]]);
  }
  for (let k = 0; k < 4; k++) cast.ell(272, 196 - k * 7, 12, 4, { holes: [hc(272, 196 - k * 7, 2, 8)] });
  cast.box(376, 154, 24, 22, { holes: [hr(382, 160, 12, 3)] });
};

/** Stack & results: a packed cart rolls away while the merchant raises his ledger in triumph. */
const s4: Scene = ({ set, cast }) => {
  set.halo(120, 96, 26, C.lantern);
  set.shape([[0, FEET], [0, 300], [90, 270], [200, 300], [330, 250], [460, 296], [600, 262], [600, FEET]]);
  // the cart: bed, two rows of crates, sacks on top, spoked wheels, and dust behind
  cast.box(60, 282, 236, 14, { holes: [hr(70, 287, 216, 4)] });
  const crate = (x: number, y: number) => cast.box(x, y, 54, 40, { holes: [hr(x + 7, y + 8, 40, 4), hr(x + 7, y + 26, 40, 4)] });
  for (let i = 0; i < 4; i++) crate(70 + i * 58, 240);
  for (let i = 0; i < 3; i++) crate(98 + i * 58, 198);
  for (const x of [112, 172]) cast.shape([[x, 196], [x + 40, 196], [x + 37, 161], [x + 26, 146], [x + 14, 146], [x + 3, 161]], { holes: [hc(x + 20, 176, 5)] });
  cast.line(62, 290, 26, 334, 5);
  for (const x of [110, 250]) {
    cast.ring(x, 336, 36, 7);
    for (const a of [0, 60, 120]) cast.line(x + 36 * Math.cos((a * Math.PI) / 180), 336 + 36 * Math.sin((a * Math.PI) / 180), x - 36 * Math.cos((a * Math.PI) / 180), 336 - 36 * Math.sin((a * Math.PI) / 180), 4);
    cast.ell(x, 336, 7, 7);
  }
  cast.rod(180, 296, 0);
  for (const [y, w] of [[230, 46], [252, 32], [274, 40]] as const) cast.line(310, y, 310 + w, y, 3);
  // the merchant, ledger overhead
  const m = cast.wayang(470, FEET, 1, { face: -1, front: "raise", back: "down" });
  const [hx, hy] = m.hand;
  cast.box(hx - 22, hy - 44, 44, 44, { holes: [hr(hx - 14, hy - 36, 28, 3), hr(hx - 14, hy - 26, 28, 3), hr(hx - 14, hy - 16, 28, 3)] });
};

const play: Play = [s1, s2, s3, s4];
export default play;
