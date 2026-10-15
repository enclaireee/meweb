// The night market's art contract (art/market/*): shared by the stall art, the scene art and the build, and read by the
// runtime (src/components/market/Market.tsx) through public/art/market/manifest.json.
//
// Space: one flat 1600 x 1000 frame in art units (like the river's artboard), the lane running into the screen toward the
// vanishing point VP. Everything that sits at a depth (gate, light strings, stalls, pier) is a flat paper set piece facing the
// camera, drawn at its NEAREST size: the runtime only ever scales it down (1 at rest, 1/(1 + 0.9 d) further away), so the
// raster taken at scale 1 stays sharp and nothing re-rasters while walking. No text in any art: words are DOM, laid on slots.
import { C, type Piece, type Rng } from "../helpers";

export const W = 1600;
export const H = 1000;
/** Vanishing point of the lane, frame units. */
export const VP: [number, number] = [800, 420];
/** Backdrops (sky, far lane, floor) are this much wider on each side, for wide openings: drawn over x in [-OVER, W + OVER]. */
export const OVER = 400;

/** Every stall's art box. Anchor = bottom centre (SW / 2, SH). At rest a left stall's anchor sits at frame (380, 990), a right one at (1220, 990). */
export const SW = 760;
export const SH = 900;
/** Stalls 1, 3, 5 stand on the left of the lane, 2 and 4 on the right; the open counter faces the lane (inward). */
export const sideOf = (n: number): Side => (n % 2 ? "R" : "L");

export type Side = "L" | "R";
/** [x, y, w, h] in the piece's own art units (stall: 0..SW x 0..SH). */
export type Rect = [x: number, y: number, w: number, h: number];

/**
 * Where the DOM lays real text on a stall. Art draws the blank carrier only:
 * - banner: a blank cloth banner (light cloth, M.cloth) across the awning front; holds the project title. w >= 460, h 90..130.
 * - board:  a blank chalkboard (M.chalk) with a wood frame, leaning or hung, holds 2 to 3 facts. w >= 230, h >= 200.
 * - nota:   EMPTY space with only a nail or clip at its top centre; the DOM draws the paper receipt itself. w >= 240, h >= 300.
 * Slots never overlap each other, stay inside the stall box, and leave the stall's signature goods visible.
 */
export type Slots = { banner: Rect; board: Rect; nota: Rect };

export type StallArt = {
  pieces: Piece[];
  slots: Slots;
  /** Light points [x, y, r] the runtime brightens as you near (lamps, screens). Optional. */
  glows?: [number, number, number][];
  /** Steam sources [x, y] the runtime puffs CSS steam from. Optional. */
  steam?: [number, number][];
};
export type StallGen = (r: Rng, side: Side) => StallArt;

/** Night market palette on top of the river's C (helpers.ts). Warm tarps and wood under lamp light, night blues behind. */
export const M = {
  tarpRed: "#A8443A",
  tarpRedDk: "#7A2F2B",
  tarpTeal: "#2E6F6B",
  tarpTealDk: "#214F4D",
  tarpCream: "#D9C59A",
  tarpYellow: "#C99A3A",
  wood: "#6B4A33",
  woodDk: "#4A3324",
  woodLt: "#8C6646",
  cloth: "#EDE0C0",
  chalk: "#1E2925",
  tin: "#7F8E97",
  tinDk: "#56636B",
  sack: "#B79868",
  lamp: C.lantern,
  lampCore: C.lanternCore,
  ember: C.ember,
} as const;

/** public/art/market/manifest.json. Files are under /art/market/. Sizes in art units. */
export type Asset = { f: string; w: number; h: number };
export type MarketManifest = {
  W: number;
  H: number;
  VP: [number, number];
  OVER: number;
  /** Static backdrops, each (W + 2 OVER) x H, drawn from x = -OVER: night sky, the far end of the lane (tiny stalls, crowd, glow at VP), the lane floor. */
  sky: Asset;
  far: Asset;
  floor: Asset;
  /** Entrance arch, W x H, a flat set piece over the whole lane (posts at both edges, crossbeam with a blank banner slot). */
  gate: Asset & { banner: Rect; steam: [number, number][] };
  /** A string of bulbs sagging across the lane, W x 220: wire + dark bulbs, and the same string lit (bulbs + glows only). */
  string: Asset & { lit: string };
  /** The lane's end: a jetty onto the river with the boat moored, W x H. Opaque over the whole frame (the last view). */
  pier: Asset;
  /** The traveller seen from behind, lantern in hand, anchor bottom centre. */
  walker: Asset;
  stalls: (Asset & { side: Side; slots: Slots; glows: [number, number, number][]; steam: [number, number][] })[];
  /** The shadow play across the lane from each stall (art/market/play.ts). */
  play: {
    /** The kelir: frame, lit cloth, blencong and banana log, anchor bottom centre. cloth: the scene box; caption: where the DOM paper hangs. */
    screen: Asset & { cloth: Rect; caption: Rect; lamp: [number, number, number] };
    /** The tree-of-life puppet that sweeps the cloth between scenes; its rod runs off the bottom. */
    gunungan: Asset;
    /** Per stall, per page: the soft backdrop shadows and the sharp puppet shadows, each CW x CH, laid over the cloth box. */
    scenes: { set: string; cast: string }[][];
  };
};
