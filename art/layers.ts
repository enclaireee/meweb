// Layer manifest (agents/layers.md). Draw order, back to front. Fireflies are DOM, not art.
export const P = 1700;
export const PAD = 1200;
export const H = 1000;
export const HANG = 260;
/** y (art units) of the hook on every tag post in layer 09. The HTML tag hangs from here. */
export const HOOK_Y = 300;
export const WATERLINE = 620;
export const TILE = 1700;
export const OVERSCAN = 1; // tiles overlap by 1 unit to hide seams; more doubles any translucent art in the overlap

export type LayerDef = {
  id: string; // file prefix, e.g. "09" or "w2"
  name: string;
  s: number;
  /** Baked sheet shadow: [dx, dy, blur, opacity]. */
  shadow?: [number, number, number, number];
  /** Depth-of-field radius, art units. Only widens the tile margin now; nothing blurs at runtime. */
  blur?: number;
  /** Torn-edge displacement, art units (0 = crisp cut). */
  deckle?: number;
  /** Faint warm backlight halo, as if the sheet sits in front of a lightbox. */
  backlit?: boolean;
  /** CSS-driven extras the runtime applies (opacity by stop etc.). */
  fx?: "stars" | "moon" | "volcano" | "range" | "haze";
};

export const LAYERS: LayerDef[] = [
  { id: "00", name: "sky", s: 0.02, fx: "stars" }, // gradient is CSS; this strip holds stars only
  { id: "01", name: "moon-clouds", s: 0.03, fx: "moon", deckle: 1.5, shadow: [2, 4, 6, 0.25], backlit: true },
  { id: "02", name: "volcano", s: 0.05, blur: 1.2, fx: "volcano", deckle: 2, shadow: [3, 5, 8, 0.3], backlit: true }, // fades out by stop 4
  { id: "02b", name: "far-range", s: 0.05, blur: 1.2, fx: "range", deckle: 2, shadow: [3, 5, 8, 0.3], backlit: true }, // fades in from stop 3
  { id: "03", name: "haze-far", s: 0.08, fx: "haze", deckle: 2 },
  { id: "04", name: "hills", s: 0.14, blur: 0.9, deckle: 2.5, shadow: [4, 8, 12, 0.38], backlit: true },
  { id: "05", name: "ridge", s: 0.22, blur: 0.6, deckle: 2.5, shadow: [5, 9, 14, 0.4], backlit: true },
  { id: "06", name: "haze-mid", s: 0.3, fx: "haze", deckle: 2 },
  { id: "07", name: "environment", s: 0.5, blur: 0.4, deckle: 3, shadow: [6, 11, 16, 0.45] },
  { id: "08", name: "far-bank", s: 0.7, blur: 0.2, deckle: 3, shadow: [7, 12, 16, 0.48] },
  { id: "w1", name: "water-far", s: 0.85, deckle: 2, shadow: [3, 6, 8, 0.35] },
  { id: "09", name: "action", s: 1.0, deckle: 3, shadow: [9, 15, 18, 0.52] },
  { id: "w2", name: "water-boat", s: 1.0, deckle: 2.5, shadow: [4, 7, 10, 0.4] },
  { id: "10", name: "near-1", s: 1.25, blur: 2, deckle: 4, shadow: [14, 24, 26, 0.55] },
  { id: "w3", name: "water-near", s: 1.4, deckle: 3, shadow: [5, 9, 12, 0.42] },
  { id: "11", name: "near-2", s: 1.6, blur: 5, deckle: 5, shadow: [20, 36, 38, 0.58] },
  { id: "12", name: "foreground", s: 2.0, blur: 9, deckle: 6, shadow: [28, 52, 56, 0.62] },
];

/** Strip length in art units: pad + journey + visible width right of the anchor + margin. */
export const stripLength = (s: number, count: number) => Math.ceil(PAD + (count - 1) * s * P + 1600);

/** Rest-fan: x of stop i's landmark on a layer of speed s (incl. pad). */
export const landmarkX = (s: number, i: number) => PAD + s * (i * P + HANG);

/** The x-range of a layer strip that is on screen around stop i (a generous estimate). */
export const segment = (s: number, i: number): [number, number] => [PAD + s * i * P - 700, PAD + s * i * P + 1500];
