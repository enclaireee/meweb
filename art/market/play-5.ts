// Sunlight Meter's shadow play: four scenes, one per booklet page. See play.ts for the kit.
import { ellipse, rect } from "../helpers";
import { FEET, hc, hp, hr, rot, type Play, type Scene } from "./play";

const SUN = "#F2A93B";
const GREEN = "#6FB04A";
const AMBER = "#F0B03A";
const RED = "#D2512F";
// the lamp-seller: same plain-bun puppet at the same scale in every scene
const S = 0.85;

/** A sun's body and its triangular rays (ink), centred on (x, y). */
const rays = (p: Pick<Parameters<Scene>[0]["set"], "shape">, x: number, y: number, r0: number, r1: number, n: number) => {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const b = 0.1;
    p.shape([[x + Math.cos(a - b) * r0, y + Math.sin(a - b) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1], [x + Math.cos(a + b) * r0, y + Math.sin(a + b) * r0]]);
  }
};

/** Overview: a sun over a field; the lamp-seller reaches up toward it, between a solar panel and a lamp post. */
const s1: Scene = ({ set, cast, r }) => {
  // the sun with its rays, and a rolling field with tufts and fence posts
  rays(set, 110, 100, 52, 84, 14);
  set.ell(110, 100, 46, 46);
  set.halo(110, 100, 36, SUN);
  set.shape([[0, 300], [140, 282], [300, 296], [460, 280], [600, 298], [600, 400], [0, 400]]);
  for (let x = 30; x < 580; x += r.int(30, 46)) set.shape([[x, 296], [x + 4, 270], [x + 8, 296], [x + 14, 276], [x + 18, 298]]);
  for (let x = 250; x < 420; x += 40) set.box(x, 320, 5, 40);
  set.line(250, 330, 410, 330, 3);
  // the panel on its stand (frame with a perforated cell grid), the lamp post with its lit head
  const pan = rot(rect(250, 190, 120, 80), 310, 230, -14);
  cast.shape(pan, { holes: [hp(rot(rect(256, 196, 108, 68), 310, 230, -14))] });
  cast.shape(rot(rect(256, 196, 108, 68), 310, 230, -14), { punch: 9 });
  cast.line(310, 245, 300, FEET, 6);
  cast.line(300, 330, 330, FEET, 5);
  cast.box(284, FEET - 6, 56, 6);
  cast.rod(310, 245, 4);
  cast.box(494, 150, 8, FEET - 150);
  cast.box(480, FEET - 10, 36, 10);
  cast.shape([[466, 150], [530, 150], [516, 112], [480, 112]], { holes: [hp([[482, 140], [514, 140], [506, 122], [490, 122]])] });
  cast.gel([[482, 140], [514, 140], [506, 122], [490, 122]], AMBER, 0.85);
  cast.rod(498, 200, -2);
  // the lamp-seller facing the sun, one hand raised
  cast.wayang(160, FEET, S, { face: 1, front: "raise", back: "down", crown: false });
};

/** How it works: rays -> panel -> wire -> board -> lamp, left to right, joined by wire and chevrons. */
const s2: Scene = ({ set, cast }) => {
  set.shape([[0, 350], [600, 350], [600, 400], [0, 400]]);
  rays(set, 40, 90, 22, 44, 10);
  set.ell(40, 90, 20, 20);
  // light rays: three slanted beams reaching the panel
  for (const y of [150, 190, 230]) cast.shape([[24, y - 8], [96, y + 24], [96, y + 34], [24, y + 2]], { punch: 6 });
  // the panel (cells)
  const pan = rot(rect(112, 190, 88, 66), 156, 223, -10);
  cast.shape(pan, { holes: [hp(rot(rect(118, 196, 76, 54), 156, 223, -10))] });
  cast.shape(rot(rect(124, 202, 64, 42), 156, 223, -10), { punch: 8 });
  cast.rod(156, 250, 2);
  // wire, chevron, then the board: a framed square with chips and pins
  const wire = (d: string) => cast.stroke(d, 4);
  wire("M200 236 Q232 280 262 236");
  cast.shape([[262, 214], [282, 236], [262, 258]]);
  cast.box(290, 180, 100, 96, { holes: [hr(298, 188, 84, 80)] });
  cast.box(304, 198, 30, 24);
  cast.box(344, 198, 24, 24);
  cast.ell(320, 248, 10, 10);
  cast.ell(356, 248, 8, 8);
  for (let i = 0; i < 5; i++) cast.box(296 + i * 20, 168, 6, 12);
  cast.rod(340, 276, 0);
  // wire to the lamp, with a green gel status LED on the board
  cast.gel(ellipse(356, 248, 5, 5, 10), GREEN, 0.9);
  wire("M390 232 Q420 280 452 232");
  cast.shape([[452, 214], [472, 236], [452, 258]]);
  // the lamp: shade, stem, base, lit bulb
  cast.shape([[488, 190], [558, 190], [540, 140], [506, 140]], { holes: [hc(523, 178, 10)] });
  cast.gel(ellipse(523, 178, 8, 8, 12), AMBER, 0.9);
  cast.box(519, 190, 8, 100);
  cast.rod(523, 290, 0);
};

/** What I built: a lamp close-up with an OLED of bars, the light-sensor eye and a gauge; the maker points at it. */
const s3: Scene = ({ set, cast }) => {
  set.shape([[0, 340], [600, 340], [600, 400], [0, 400]]);
  set.ring(100, 110, 50, 8);
  set.ring(100, 110, 26, 6);
  // the big lamp head with its screen
  cast.shape([[300, 70], [470, 70], [510, 190], [260, 190]], { holes: [hr(320, 92, 130, 78)] });
  cast.box(325, 97, 120, 68);
  cast.shape(rect(325, 97, 120, 68), { holes: [hr(330, 102, 110, 58)] });
  // the OLED: a lit window with bars of rising height and a wave, never characters
  cast.gel(rect(330, 102, 110, 58), AMBER, 0.8);
  for (let i = 0; i < 6; i++) cast.box(340 + i * 16, 152 - (14 + i * 6), 10, 14 + i * 6);
  cast.stroke("M336 122 Q352 108 368 122 T400 122", 3);
  cast.box(381, 190, 8, 150);
  cast.shape([[340, FEET], [430, FEET], [420, 338], [350, 338]], { punch: 9 });
  cast.rod(385, 300, 0);
  // the light-sensor eye on a stalk (a ring with a pupil), and the gauge with its needle
  cast.line(500, 120, 540, 100, 5);
  cast.ring(552, 96, 22, 7);
  cast.ell(552, 96, 8, 8);
  cast.gel(ellipse(552, 96, 3.5, 3.5, 10), RED, 0.9);
  cast.rod(540, 118, 4);
  cast.ring(205, 150, 52, 8);
  cast.shape(rot([[203, 150], [207, 150], [206, 106], [204, 106]], 205, 150, 40));
  cast.ell(205, 150, 7, 7);
  cast.gel(ellipse(205, 150, 4, 4, 8), GREEN, 0.85);
  cast.rod(205, 202, 0);
  // the maker, left, reaching toward the gauge and screen
  cast.wayang(90, FEET, S, { face: 1, front: "reach", back: "down", crown: false });
};

/** Stack & results: night; the lamp is lit with its warm halo, moths circle it, the maker reads beneath. */
const s4: Scene = ({ set, cast, r }) => {
  // a moon, scattered stars, a low field
  set.ell(110, 90, 36, 36);
  set.halo(110, 90, 30, "#F4E7B8");
  for (let i = 0; i < 18; i++) set.ell(r.range(160, 570), r.range(20, 200), 2.5, 2.5, undefined, 6);
  set.shape([[0, 330], [180, 316], [380, 332], [600, 318], [600, 400], [0, 400]]);
  // the lamp post with a curved arm and a lit head over the reader
  cast.box(504, 120, 9, FEET - 120);
  cast.box(488, FEET - 10, 40, 10);
  cast.stroke("M508 130 Q500 80 440 78", 7);
  cast.shape([[400, 78], [480, 78], [466, 100], [414, 100]], { holes: [hr(422, 84, 36, 10)] });
  cast.halo(440, 112, 26, AMBER);
  // moths round the light: a tiny body and two wings each
  for (const [x, y, a] of [[392, 124, -18], [486, 138, 14], [420, 60, 8], [470, 56, -12]] as const) {
    cast.shape(rot([[x, y], [x - 12, y - 8], [x - 10, y + 5]], x, y, a));
    cast.shape(rot([[x, y], [x + 12, y - 8], [x + 10, y + 5]], x, y, a));
    cast.ell(x, y, 2, 4, undefined, 6);
  }
  // the maker reading: a book held in the hand, framed pages with a gap in the spine
  const m = cast.wayang(320, FEET, S, { face: 1, front: "hold", back: "hold", crown: false });
  const [bx, by] = m.hand;
  cast.shape([[bx - 6, by - 28], [bx + 22, by - 20], [bx + 22, by + 12], [bx - 6, by + 8]], { holes: [hp([[bx - 1, by - 22], [bx + 16, by - 16], [bx + 16, by + 6], [bx - 1, by + 3]])] });
  cast.rod(504, 200, 3);
};

const play: Play = [s1, s2, s3, s4];
export default play;
