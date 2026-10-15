// OT Observability Lab's shadow play: four scenes, one per booklet page. See play.ts for the kit.
import { ellipse, rect, type Pt } from "../helpers";
import { FEET, hc, hp, hr, type Play, type Scene } from "./play";

// the engineer is the same puppet in every scene: bun, not crown, slightly smaller than the merchants
const ENG = { crown: false } as const;
const ES = 0.95;

/** Overview: the plant skyline: chimneys with smoke, pipes, a gas tank and a pylon; the engineer faces it. */
const s1: Scene = ({ set, cast }) => {
  // set: a pylon and two far chimneys
  set.stroke("M118 376 L146 60", 6);
  set.stroke("M182 376 L154 60", 6);
  for (const y of [130, 200, 270, 340]) set.line(150 - (376 - y) * 0.09 - 3, y, 150 + (376 - y) * 0.09 + 3, y, 4);
  set.box(100, 76, 100, 6);
  set.box(112, 112, 76, 6);
  set.box(410, 90, 18, FEET - 90);
  set.box(444, 130, 16, FEET - 130);
  const e = cast.wayang(90, FEET, ES, { ...ENG, face: 1, front: "reach", back: "down" });
  cast.rod(e.hand[0] + 4, e.hand[1], 0);
  // the factory: sawtooth roof, window rows, two striped chimneys with smoke, a red beacon
  cast.box(200, 260, 190, 116, { holes: [0, 1, 2, 3].flatMap((i) => [hr(214 + i * 42, 286, 26, 22), hr(214 + i * 42, 326, 26, 22)]) });
  cast.shape([[200, 260], [200, 230], [245, 260], [245, 230], [290, 260], [290, 230], [335, 260], [335, 230], [390, 260]]);
  cast.box(218, 100, 22, 160, { holes: [hr(222, 120, 14, 8), hr(222, 144, 14, 8)] });
  cast.box(350, 140, 26, 120, { holes: [hr(355, 160, 16, 8)] });
  for (const [x, y, rx, ry] of [[236, 76, 10, 8], [252, 56, 13, 10], [274, 38, 16, 12], [364, 118, 10, 8], [378, 96, 13, 10], [398, 76, 15, 11]] as const) cast.ell(x, y, rx, ry);
  cast.ell(229, 96, 6, 6);
  cast.halo(229, 96, 5, "#E0533A");
  cast.rod(295, 350, 0);
  // pipes run to the gas tank on legs
  cast.line(390, 300, 447, 300, 8);
  cast.stroke("M390 276 L410 276 L410 200 L505 200 L505 220", 7);
  cast.ell(505, 276, 58, 58, { punch: 9 });
  cast.box(498, 212, 14, 10);
  cast.line(472, 322, 462, FEET, 6);
  cast.line(538, 322, 548, FEET, 6);
  cast.rod(505, 334, 0);
};

/** How it works: a scroll unrolls from the engineer's hands, with lines out to a PLC, an HMI panel, a switch tower and a gas cylinder. */
const s2: Scene = ({ set, cast }) => {
  set.box(0, 0, 600, 14);
  for (const x of [60, 300, 540]) set.box(x, 14, 8, 90);
  const e = cast.wayang(130, FEET, ES, { ...ENG, face: 1, front: "hold", back: "hold" });
  void e;
  // the scroll: top roll, a punched sheet with a curled hem
  cast.box(196, 240, 134, 12);
  cast.ell(196, 246, 8, 9);
  cast.ell(330, 246, 8, 9);
  cast.shape([[200, 252], [322, 252], [322, 300], [308, 308], [290, 300], [270, 310], [250, 300], [230, 308], [210, 300], [200, 306]], {
    holes: [hr(212, 262, 98, 5), hr(212, 274, 70, 5), hr(212, 286, 84, 5)],
  });
  // lines out to the four devices
  const lines = ["M324 268 Q330 130 350 92", "M324 268 Q380 190 472 100", "M324 268 L354 266", "M324 268 Q440 150 498 280"];
  for (const d of lines) cast.stroke(d, 3.5);
  for (const [x, y] of [[350, 92], [472, 100], [354, 266], [498, 280], [324, 268]] as const) cast.ell(x, y, 5, 5);
  // PLC box
  cast.box(350, 60, 92, 64, { holes: [hr(360, 72, 44, 7), hr(360, 86, 44, 7), hr(360, 100, 44, 7), hc(424, 78, 7), hc(424, 104, 7)] });
  cast.rod(396, 124, 0);
  // HMI panel: a lit screen with bars
  cast.box(472, 50, 100, 86, { holes: [hr(482, 60, 80, 56)] });
  cast.gel(rect(482, 60, 80, 56), "#7FD08A", 0.9);
  for (const [x, y, h] of [[490, 92, 18], [508, 80, 30], [526, 70, 40], [544, 84, 26]] as const) cast.box(x, y, 10, h);
  cast.box(514, 136, 16, 22);
  cast.rod(522, 158, 0);
  // switch tower: three slabs of ports
  for (const y of [252, 286, 320]) cast.box(354, y, 52, 28, { holes: [0, 1, 2, 3].map((i) => hr(360 + i * 11, y + 9, 7, 10)) });
  cast.box(374, 348, 12, 28);
  cast.rod(380, 360, 0);
  // gas cylinder with a valve
  cast.shape([[498, 376], [498, 276], [504, 258], [516, 248], [530, 248], [542, 258], [548, 276], [548, 376]], { holes: [hr(506, 296, 34, 6), hr(506, 330, 34, 6)] });
  cast.box(517, 230, 14, 18);
  cast.box(510, 224, 28, 7);
  cast.rod(523, 350, 0);
};

/** What I built: a control room: two big gauges, a wave on a screen, the engineer's hand on a lever. */
const s3: Scene = ({ set, cast }) => {
  set.box(0, 0, 600, 16);
  set.stroke("M0 44 L600 44", 8);
  set.stroke("M0 66 L600 66", 5);
  set.shape(rect(40, 90, 180, 130), { holes: [hr(52, 102, 76, 106), hr(136, 102, 76, 106)] });
  set.ell(300, 40, 14, 10);
  const e = cast.wayang(100, FEET, ES, { ...ENG, face: 1, front: "reach", back: "down" });
  void e;
  // the lever and its slotted base
  cast.stroke("M204 346 L176 226", 6);
  cast.ell(175, 224, 8, 8);
  cast.box(184, 340, 40, 36, { holes: [hr(192, 350, 24, 6)] });
  cast.rod(204, 360, 0);
  // two gauges: a ring, a lit face, ticks and a needle each
  for (const [cx, a] of [[350, 200], [480, 330]] as const) {
    cast.ring(cx, 125, 52, 8);
    for (let i = 0; i < 7; i++) {
      const t = ((150 + i * 40) * Math.PI) / 180;
      cast.line(cx + 36 * Math.cos(t), 125 + 36 * Math.sin(t), cx + 43 * Math.cos(t), 125 + 43 * Math.sin(t), 3);
    }
    const n = (a * Math.PI) / 180;
    cast.line(cx, 125, cx + 32 * Math.cos(n), 125 + 32 * Math.sin(n), 4);
    cast.ell(cx, 125, 6, 6);
    cast.rod(cx, 177, 0);
  }
  cast.gel(hp(ellipse(350, 125, 44, 44, 24)) + hp(ellipse(480, 125, 44, 44, 24)), "#F2B85A", 0.9);
  // the screen with its wave, on the console desk
  cast.box(282, 200, 296, 108, { holes: [hr(294, 212, 272, 72)] });
  cast.gel(rect(294, 212, 272, 72), "#7FD08A", 0.9);
  cast.stroke("M302 250 Q320 220 338 250 T374 250 T410 250 T446 250 T482 250 T518 250 T554 250", 4);
  cast.box(270, 308, 320, 68, { holes: [hr(284, 322, 60, 8), ...[0, 1, 2, 3, 4].map((i) => hc(390 + i * 42, 346, 9))] });
  cast.rod(430, 360, 0);
};

/** Stack & results: green, amber and red lamps on a pole, and a chain of gears with one cracked link. */
const s4: Scene = ({ set, cast }) => {
  set.box(420, 90, 18, FEET - 90);
  set.box(460, 130, 16, FEET - 130);
  set.box(0, 350, 600, 26);
  const e = cast.wayang(80, FEET, ES, { ...ENG, face: 1, front: "reach", back: "down" });
  cast.rod(e.hand[0] + 4, e.hand[1], 0);
  // the lamp pole: three housings, each with a lit lens
  cast.box(211, 30, 8, 346);
  cast.ell(215, 20, 9, 9);
  cast.box(190, 366, 50, 10);
  for (const [y, color] of [[40, "#6FBF73"], [115, "#F2B85A"], [190, "#E0533A"]] as const) {
    cast.box(187, y, 56, 66, { holes: [hc(215, y + 33, 19)] });
    cast.gel(ellipse(215, y + 33, 19, 19, 16), color, 0.9);
  }
  cast.rod(215, 370, 0);
  // a chain of four gears; the third has a crack
  const R = 35;
  [330, 400, 470, 540].forEach((cx, k) => {
    const cy = 290;
    const off = k % 2 ? Math.PI / 10 : 0;
    const body: Pt[] = [];
    for (let i = 0; i < 10; i++)
      for (const [da, rr] of [[-0.17, R * 0.82], [-0.09, R], [0.09, R], [0.17, R * 0.82]] as const) {
        const a = off + (i * Math.PI) / 5 + da;
        body.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
      }
    const holes = [hc(cx, cy, 8), ...[0, 1, 2, 3, 4].map((i) => hc(cx + 19 * Math.cos(off + (i * 2 * Math.PI) / 5), cy + 19 * Math.sin(off + (i * 2 * Math.PI) / 5), 5))];
    if (k === 2) {
      // a thin zig-zag cut, outward along a tooth
      const th = off + Math.PI / 5;
      const zig: [number, number][] = [[11, 0], [16, 3], [21, -3], [26, 2], [31, 0]];
      const at = ([u, v]: [number, number], w: number): Pt => [cx + u * Math.cos(th) - (v + w) * Math.sin(th), cy + u * Math.sin(th) + (v + w) * Math.cos(th)];
      holes.push(hp([...zig.map((p) => at(p, -1.5)), ...zig.map((p) => at(p, 1.5)).reverse()]));
    }
    cast.shape(body, { holes });
    cast.rod(cx, cy + R, 0);
  });
};

const play: Play = [s1, s2, s3, s4];
export default play;
