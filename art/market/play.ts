// The shadow play (wayang kulit) across the lane from each stall: the kelir screen, the gunungan, and the kit every
// scene is cut with (play-1..5.ts). A scene is drawn in cloth space, CW x CH, as two layers of shadow:
// - set:  backdrop props, far from the cloth, so soft and pale;
// - cast: rod puppets pressed to the cloth, sharp and dark, with a faint ghost from the flame. Cast slides in and out.
// Ink only, plus coloured "gel" windows where light comes through tinted. No text or digits anywhere.
import { C, darken, diamond, ellipse, lighten, mix, poly, raw, rect, type Pt, type Rng } from "../helpers";
import { kit, NR } from "./stall-1";
import { M, type Rect } from "./types";
import type { Group } from "./scene";

/** Cloth space: every scene layer is a CW x CH image laid over the screen's cloth box. Puppets stand on y ~ FEET. */
export const CW = 600;
export const CH = 400;
export const FEET = 376;
const INK = "#1B120C";

export type Pose = "down" | "reach" | "raise" | "hold";
export type Wayang = { face?: 1 | -1; front?: Pose; back?: "down" | "hold"; crown?: boolean };

/** Rotate points about (cx, cy) by deg. */
export const rot = (pts: Pt[], cx: number, cy: number, deg: number): Pt[] => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
};
/** Hole paths for shape({ holes }): circle, rect, polygon. A hole must sit fully inside its shape (even-odd). */
export const hc = (cx: number, cy: number, r: number, n = 14) => poly(ellipse(cx, cy, r, r, n));
export const hr = (x: number, y: number, w: number, h: number) => poly(rect(x, y, w, h));
export const hp = (pts: Pt[]) => poly(pts);

const inside = (pts: Pt[], x: number, y: number) => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]!;
    const [xj, yj] = pts[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
/** Wayang perforation: staggered diamond holes every `cell` units, only where the hole and a margin fit inside pts. */
export function punch(pts: Pt[], cell: number, margin = cell * 0.6): string[] {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const out: string[] = [];
  let row = 0;
  for (let y = Math.min(...ys) + margin; y <= Math.max(...ys) - margin; y += cell * 0.7, row++)
    for (let x = Math.min(...xs) + margin + ((row % 2) * cell) / 2; x <= Math.max(...xs) - margin; x += cell)
      if ([[0, 0], [margin, 0], [-margin, 0], [0, margin], [0, -margin]].every(([dx, dy]) => inside(pts, x + dx!, y + dy!)))
        out.push(diamond(x, y, cell * 0.48));
  return out;
}

export type Ink = { ink: string[]; gel: string[] };
type ShapeOpts = { punch?: number; holes?: string[] };

/** A layer's drawing kit. Everything is ink (one colour) except gel() and halo(). */
export function pen() {
  const L: Ink = { ink: [], gel: [] };
  const d = (p: Pt[] | string) => (typeof p === "string" ? p : poly(p));
  /** Filled silhouette; punch: perforate it with holes every n units; holes: extra cut-outs (hc/hr/hp). */
  const shape = (p: Pt[] | string, o: ShapeOpts = {}) => {
    const holes = [...(o.holes ?? []), ...(o.punch && typeof p !== "string" ? punch(p, o.punch) : [])];
    L.ink.push(`<path d="${d(p) + holes.join("")}" fill-rule="evenodd"/>`);
  };
  const box = (x: number, y: number, w: number, h: number, o?: ShapeOpts) => shape(rect(x, y, w, h), o);
  const ell = (cx: number, cy: number, rx: number, ry: number, o?: ShapeOpts, n = 20) => shape(ellipse(cx, cy, rx, ry, n), o);
  /** A round frame (gauge, wheel, lens): ring of width w, optional extra holes inside its opening are not needed. */
  const ring = (cx: number, cy: number, r: number, w: number) => shape(ellipse(cx, cy, r, r, 24), { holes: [poly(ellipse(cx, cy, r - w, r - w, 24))] });
  /** A line or polyline of width w (round ends), or any path d (curves: "M.. Q.. .."). */
  const stroke = (p: Pt[] | string, w: number) =>
    L.ink.push(`<path d="${typeof p === "string" ? p : "M" + p.map((q) => q.join(" ")).join("L")}" fill="none" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`);
  const line = (x1: number, y1: number, x2: number, y2: number, w: number) => stroke([[x1, y1], [x2, y2]], w);
  /** The control rod every puppet and prop hangs on: from (x, y) down off the cloth's bottom edge. */
  const rod = (x: number, y: number, lean = 0, w = 2.2) => line(x, y, x + lean, CH + 14, w);
  /** Coloured light through a cut window (draw it over the ink it belongs to). */
  const gel = (p: Pt[] | string, color: string, op = 0.85) => L.gel.push(`<path d="${d(p)}" fill="${color}" opacity="${op}"/>`);
  /** A soft coloured light (sun, lit lamp): a gel disc with two fainter rings. */
  const halo = (cx: number, cy: number, r: number, color: string) => {
    gel(ellipse(cx, cy, r * 1.9, r * 1.9, 24), color, 0.14);
    gel(ellipse(cx, cy, r * 1.4, r * 1.4, 24), color, 0.26);
    gel(ellipse(cx, cy, r, r, 24), color, 0.85);
  };

  /**
   * The one puppet every scene shares: a wayang kulit figure in profile, about 270 units tall at s = 1, feet centred on
   * (x, y), facing right (face 1) or left (-1). Long jointed arms on their own rods, a central cempurit rod, perforated
   * crown, torso and kain. Returns its hands and head in cloth space so props can be put in its hands.
   */
  const wayang = (x: number, y: number, s = 1, o: Wayang = {}) => {
    const f = o.face ?? 1;
    const T = (p: Pt): Pt => [x + p[0] * s * f, y + p[1] * s];
    const TT = (ps: Pt[]) => ps.map(T);
    const cell = Math.max(4, 7 * s);
    const arms: Record<Pose, [Pt, Pt]> = {
      down: [[26, -128], [30, -84]],
      reach: [[42, -150], [78, -162]],
      raise: [[34, -206], [50, -248]],
      hold: [[26, -132], [64, -128]],
    };
    const backArm: Record<"down" | "hold", [Pt, Pt]> = { down: [[-24, -128], [-14, -84]], hold: [[-2, -132], [50, -120]] };
    const limb = (sh: Pt, [el, ha]: [Pt, Pt]) => {
      stroke(TT([sh, el, ha]), 7 * s);
      ell(...T(ha), 5 * s, 5 * s, undefined, 10);
      const h = T(ha);
      line(h[0], h[1], h[0] + 10 * f, CH + 14, 1.6);
      return h;
    };
    const back = limb([-12, -172], backArm[o.back ?? "down"]);
    // legs and feet, both pointing forward
    stroke(TT([[6, -50], [30, -4]]), 8 * s);
    stroke(TT([[-14, -50], [-34, -4]]), 8 * s);
    shape(TT([[22, -7], [50, -2], [52, 0], [22, 1]]));
    shape(TT([[-42, 1], [-18, 0], [-20, -6], [-40, -5]]));
    // kain, and the drape hanging between the legs
    shape(TT([[-20, -118], [16, -118], [24, -84], [30, -50], [14, -44], [0, -58], [-10, -44], [-34, -50], [-28, -84]]), { punch: cell });
    shape(TT([[-5, -70], [5, -70], [7, -22], [0, -12], [-7, -22]]));
    // torso, neck, head with its almond eye
    shape(TT([[-14, -116], [12, -116], [20, -140], [30, -160], [24, -176], [-18, -180], [-26, -168], [-20, -142]]), { punch: cell });
    shape(TT([[4, -176], [14, -176], [18, -190], [8, -192]]));
    shape(TT([[4, -188], [18, -190], [24, -196], [38, -201], [26, -206], [24, -214], [22, -222], [6, -224], [-6, -216], [-6, -200]]), {
      holes: [hp(TT([[8, -210], [14, -213], [20, -210], [14, -208]]))],
    });
    // crown with its back curl (gelung), or a plain bun
    if (o.crown ?? true)
      shape(TT([[22, -220], [22, -236], [14, -252], [4, -262], [-6, -258], [-10, -246], [-22, -242], [-34, -232], [-36, -218], [-26, -214], [-14, -222], [-6, -216]]), { punch: Math.max(4, 6 * s) });
    else shape(TT([[22, -220], [18, -232], [2, -238], [-12, -232], [-24, -226], [-26, -214], [-6, -216]]));
    const hand = limb([14, -172], arms[o.front ?? "down"]);
    // the cempurit: the main rod through the body, off the bottom
    const c = T([0, -150]);
    line(c[0], c[1], x + 2 * f, CH + 14, 3);
    return { hand, back, head: T([14, -206]) };
  };

  return { L, shape, box, ell, ring, stroke, line, rod, gel, halo, wayang };
}
export type Pen = ReturnType<typeof pen>;
export type Stage = { set: Pen; cast: Pen; r: Rng };
/** One scene: draw into s.set (backdrop) and s.cast (puppets). */
export type Scene = (s: Stage) => void;
/** A project's play: its four scenes, one per booklet page (Overview, How it works, What I built, Stack & results). */
export type Play = [Scene, Scene, Scene, Scene];

/** A layer as its own SVG. Set: soft and pale (far from the cloth). Cast: sharp and dark, with a faint ghost. */
export function shadowSvg(L: Ink, kind: "set" | "cast", w = CW, h = CH): string {
  const cast = kind === "cast";
  const fr = `filterUnits="userSpaceOnUse" x="-30" y="-30" width="${w + 60}" height="${h + 60}"`;
  const defs =
    `<filter id="b" ${fr}><feGaussianBlur stdDeviation="${cast ? 0.7 : 2.6}"/></filter>` +
    (cast ? `<filter id="g" ${fr}><feGaussianBlur stdDeviation="6"/></filter>` : "") +
    `<g id="i" fill="${INK}" stroke="${INK}" stroke-width="0">${L.ink.join("")}</g>`;
  const ghost = cast ? `<use href="#i" transform="translate(10 -6)" filter="url(#g)" opacity=".13"/>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${ghost}` +
    `<use href="#i" filter="url(#b)" opacity="${cast ? 0.92 : 0.46}"/><g filter="url(#b)">${L.gel.join("")}</g></svg>`
  );
}

/* ---------- The gunungan: 220 x 420, the leaf over y 0..332, its rod below ---------- */
export const GUN = { w: 220, h: 420 };
export function gunungan(): Ink {
  const p = pen();
  const leaf: Pt[] = [[110, 0], [126, 28], [146, 64], [170, 108], [190, 152], [204, 196], [210, 236], [206, 268], [194, 292], [200, 322], [20, 322], [26, 292], [14, 268], [10, 236], [16, 196], [30, 152], [50, 108], [74, 64], [94, 28]];
  p.shape(leaf, { punch: 7.5 });
  // the tree of life: a trunk and curling branches, each ending in a leaf, solid over the perforated field
  p.shape([[103, 290], [117, 290], [114, 96], [110, 54], [106, 96]]);
  for (const [y, len, up] of [[252, 74, 34], [214, 70, 30], [176, 62, 28], [138, 50, 24], [104, 34, 18]] as const)
    for (const sd of [-1, 1]) {
      p.stroke(`M110 ${y}Q${110 + sd * len * 0.55} ${y + 6} ${110 + sd * len} ${y - up}`, 4.5);
      p.ell(110 + sd * len, y - up - 4, 8, 11, undefined, 10);
    }
  // the gate at its foot: roof, walls, two doors lit amber; the base band; the rod
  p.shape([[56, 306], [164, 306], [164, 266], [154, 266], [110, 236], [66, 266], [56, 266]], { holes: [hr(74, 274, 24, 32), hr(122, 274, 24, 32)] });
  p.gel(rect(74, 274, 24, 32), C.lanternCore, 0.9);
  p.gel(rect(122, 274, 24, 32), C.lanternCore, 0.9);
  p.box(16, 314, 188, 16);
  p.ell(110, 66, 9, 9);
  p.gel(ellipse(110, 66, 6, 6, 12), C.ember, 0.9);
  p.stroke([[110, 326], [110, 420]], 5);
  return p.L;
}

/* ---------- The kelir: 620 x 900, anchor bottom centre ---------- */
export const SCREEN = { w: 620, h: 900 };
/** The cloth (scene box, CW:CH), the caption paper under the log, the lamp's light [x, y, r]. */
export const CLOTH: Rect = [34, 122, 552, 368];
export const CAPTION: Rect = [62, 552, 496, 330];
export const LAMP: [number, number, number] = [310, 64, 150];

export function screen(r: Rng): Group[] {
  const k = kit(r);
  const { S, B, E, G, ln } = k;
  const [cx, cy, cw, ch] = CLOTH;
  // the blencong: a bronze garuda lamp on a chain over the top beam, its flame at the beak
  ln(310, 0, 310, 30, 2.4, M.tinDk);
  const bronze = mix(M.tarpYellow, M.woodDk, 0.45);
  S([[262, 44], [290, 34], [306, 40], [318, 32], [336, 36], [362, 30], [348, 46], [330, 52], [318, 62], [300, 62], [286, 52]], bronze);
  E(310, 40, 12, 9, darken(bronze, 0.2), NR, 10);
  S([[316, 60], [322, 46], [328, 60], [322, 70]], M.lampCore, NR);
  G(322, 60, 70, C.lantern, 0.55);
  // posts with carved finials, the top beam, the red pelangitan band with gold studs
  for (const x of [8, 588]) {
    k.post(x, 76, 24);
    S([[x - 6, 78], [x + 30, 78], [x + 24, 62], [x + 12, 40], [x, 62]], M.woodLt);
    E(x + 12, 58, 4, 4, M.woodDk, NR, 8);
  }
  B(0, 82, 620, 22, M.woodDk);
  B(0, 82, 620, 5, M.woodLt, NR);
  B(26, 100, 568, 24, M.tarpRedDk);
  for (let x = 46; x < 580; x += 26) S(rect(x - 3, 109, 6, 6), M.tarpYellow, NR);
  B(26, 120, 8, 376, M.tarpRedDk, NR);
  B(586, 120, 8, 376, M.tarpRedDk, NR);
  // the cloth, lit from behind: brightest just under the lamp, falling off to the edges
  k.p.push(
    raw(
      cx,
      cx + cw,
      `<radialGradient id="kl" cx=".5" cy=".18" r=".85"><stop offset="0" stop-color="#FFF3D2"/><stop offset=".5" stop-color="#EED7A4"/><stop offset="1" stop-color="#B68C5A"/></radialGradient>` +
        `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" fill="url(#kl)"/>`,
    ),
  );
  // the gedebog: a banana trunk along the foot, rods stuck in it, cut ends showing their rings
  const log = mix("#6F7340", M.woodDk, 0.35);
  B(14, 486, 592, 44, log);
  B(14, 488, 592, 9, lighten(log, 0.18), NR);
  for (let x = 60; x < 600; x += 74 + r.int(0, 30)) B(x, 498, 2.5, 30, darken(log, 0.35), NR);
  for (const x of [14, 606]) {
    E(x, 508, 12, 22, lighten(log, 0.35), undefined, 12);
    E(x, 508, 7, 13, lighten(log, 0.55), NR, 10);
  }
  // cords and pegs the caption paper hangs from
  for (const x of [CAPTION[0] + 34, CAPTION[0] + CAPTION[2] - 34]) {
    ln(x, 520, x, CAPTION[1] + 8, 2, M.cloth);
    E(x, 518, 5, 5, M.woodLt, NR, 8);
  }
  B(0, 884, 620, 16, "#000", { rim: false, opacity: 0.3 });
  return [{ pieces: k.p, shadow: [7, 12, 0.5], back: true, grain: true, deckle: 1.6 }];
}
