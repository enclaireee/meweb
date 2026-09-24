/**
 * Design tokens for the Night Workshop: the numbers from agents/design.md.
 * The scene reads them from here; globals.css mirrors the UI subset (§1.1, §2, §3, §7.1).
 * Change a value in both places in the same commit.
 */

export type LightMode = "night" | "morning";

/** design.md §1.1: UI and paper stocks. */
export const ui = {
  night: {
    paper: "#E9DFCC",
    ink: "#2B2521",
    inkSoft: "#5A4F46",
    accent: "#E8742F",
    accentText: "#C4531F",
    glow: "#FFD58A",
    shadow: "rgba(10,13,31,.55)",
    fog: "#4F4A86",
    sky: "#8FA0C0",
  },
  morning: {
    paper: "#F2EADB",
    ink: "#2B2521",
    inkSoft: "#5A4F46",
    accent: "#D9622B",
    accentText: "#B84A1A",
    glow: "#FFD58A", // off in the morning: glow material fades to 0
    shadow: "rgba(59,46,38,.35)",
    fog: "#F2E2C8",
    sky: "#F7F0E4",
  },
} as const;

/** design.md §1.2: scene ramp, back (R0) → front (R7). */
export const ramp = {
  night: ["#8FA0C0", "#62739A", "#4B5A82", "#3A466B", "#2C3656", "#212843", "#171C31", "#0F1222"],
  morning: ["#F4EBDD", "#DCD6CF", "#C3C3C6", "#A5AAB4", "#858D9C", "#677084", "#4C5468", "#343A4B"],
} as const;

/**
 * Coloured paper: each room has its own pack (decisions.md, 2026-09-24 "paper packs"). These are the
 * daylight colours; night is the same paper relit (see `nightOf`), so the relight roll still works.
 * `*Light` stocks sit at the back of a room and `*Deep` ones frame it, so the value ramp survives.
 */
export const papers = {
  kraft: "#C9A27E",
  kraftDeep: "#8A6446",
  wood: "#A0704A",
  woodDeep: "#5A3A26",
  cork: "#BE8D5C",
  cream: "#F1E6CF",
  white: "#FBF7EF",
  mustard: "#E2AD3B",
  ochreDeep: "#6E4914",
  sunflower: "#F4C430",
  tomato: "#D9553B",
  brick: "#A7442F",
  brickLight: "#CF7B60",
  brickDeep: "#4F1D14",
  terracotta: "#C86A48",
  terracottaDeep: "#5E2819",
  peach: "#F0BE94",
  rose: "#E88A9E",
  pink: "#F0579A",
  forest: "#3E7B4F",
  leaf: "#6DAF59",
  sage: "#A2BD8E",
  mint: "#94D6BD",
  teal: "#2F8F8C",
  tealDeep: "#12383C",
  copper: "#C47A45",
  brass: "#CFA34A",
  plum: "#74406F",
  plumDeep: "#2A1430",
  violet: "#8A6BC7",
  cyan: "#48C6E2",
  blueprint: "#2F62A6",
  blueprintLight: "#79A3D6",
  blueprintDeep: "#10264D",
  sky: "#9CC6E6",
  navy: "#243260",
  navyDeep: "#0D132C",
  graphite: "#3C3B42",
  slate: "#5E6780",
  steel: "#9BA5B7",
  denim: "#3E62A8",
  skin: "#E6B08A",
  boot: "#5B3A27",
} as const;

/** Small lights: cut-out glows, lit at night and out in the morning. */
export const glows = {
  glow: "#FFD58A",
  glowCyan: "#8AF2FF",
  glowPink: "#FF8AD0",
  glowGreen: "#A6FF9E",
} as const;

export type Paper = keyof typeof papers;
export type Glow = keyof typeof glows;
export type Stock = "R0" | "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7" | "accent" | "paper" | "ink" | Paper | Glow;

export const isGlow = (s: string): s is Glow => s in glows;
export const allStocks: readonly string[] = ["R0", "R1", "R2", "R3", "R4", "R5", "R6", "R7", "accent", "paper", "ink", ...Object.keys(papers), ...Object.keys(glows)];

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

/**
 * The same paper at night (concept.md §5: a relit box, not a dark filter): pulled a little toward the
 * night's indigo and darkened, so every stock keeps its hue and its place on the value ramp. The warm
 * lamp brings the warmth back where it falls.
 */
export function nightOf(day: string): string {
  const d = hex(day);
  const n = hex("#2E3470");
  return toHex(d.map((v, i) => (v + (n[i]! - v) * 0.2) * 0.88));
}

/** Resolve a sheet stock to its colour in a light state. */
export function stockColor(stock: Stock, mode: LightMode): string {
  if (stock[0] === "R" && stock.length === 2) return ramp[mode][Number(stock.slice(1))]!;
  if (stock in papers) {
    const day = papers[stock as Paper];
    return mode === "morning" ? day : nightOf(day);
  }
  if (isGlow(stock)) return glows[stock];
  const u = ui[mode];
  if (stock === "accent") return u.accent;
  if (stock === "paper") return u.paper;
  return u.ink;
}

/**
 * Each station's room shell (decisions.md, "not a hollow room"): papered walls with stripes, a
 * wainscot and rail, a lowered ceiling with beams, a rug, and a back wall with a doorway to the next room.
 */
export type Room = { wall: Paper; stripe: Paper; wainscot: Paper; trim: Paper; ceiling: Paper; rug: Paper; rugBorder: Paper };
export const rooms: Room[] = [
  { wall: "kraft", stripe: "cream", wainscot: "woodDeep", trim: "woodDeep", ceiling: "woodDeep", rug: "tomato", rugBorder: "mustard" },
  { wall: "mustard", stripe: "sunflower", wainscot: "ochreDeep", trim: "ochreDeep", ceiling: "ochreDeep", rug: "blueprint", rugBorder: "sky" },
  { wall: "teal", stripe: "mint", wainscot: "tealDeep", trim: "copper", ceiling: "tealDeep", rug: "mustard", rugBorder: "copper" },
  { wall: "plum", stripe: "violet", wainscot: "plumDeep", trim: "pink", ceiling: "plumDeep", rug: "cyan", rugBorder: "pink" },
  { wall: "blueprint", stripe: "blueprintLight", wainscot: "blueprintDeep", trim: "sunflower", ceiling: "blueprintDeep", rug: "tomato", rugBorder: "white" },
  { wall: "peach", stripe: "cream", wainscot: "terracotta", trim: "terracottaDeep", ceiling: "terracottaDeep", rug: "leaf", rugBorder: "sunflower" },
  { wall: "brick", stripe: "brickLight", wainscot: "brickDeep", trim: "sunflower", ceiling: "brickDeep", rug: "teal", rugBorder: "cream" },
  { wall: "navy", stripe: "blueprint", wainscot: "navyDeep", trim: "brass", ceiling: "navyDeep", rug: "mustard", rugBorder: "tomato" },
];

/** Shell geometry, station-local (see Room.tsx). */
export const shell = { halfWidth: 34, ceiling: 44, backWallZ: -43.5, frontZ: 36.5, wainscot: 12, doorHalf: 9, doorTop: 26 } as const;

/** design.md §4.1: camera. */
export const camera = {
  // design.md's 32°/50° can't show the 56×34 arch from 35 units away (marked "tune"); widened until the valance and wings frame the view at rest.
  fovLandscape: 62,
  fovPortrait: 74,
  restDistance: 35,
  restY: 14,
  pitchDeg: -6,
  // stronger than design.md's 2.5/1.2/3°/2°: the depth has to be felt (decisions.md, "more parallax")
  pointerX: 6,
  pointerY: 2.6,
  tiltYawDeg: 6,
  tiltPitchDeg: 3.5,
  driftX: 1.6,
  driftPeriod: 16,
  portraitLookUp: 4,
  near: 0.5,
  far: 600,
} as const;

/** design.md §4.2: station module (local z, negative = deeper). */
export const box = {
  // design.md says 60, but stations are 42 deep: from a rest 35 in front of an arch, the previous
  // station's far sheets would stand between the camera and the arch. 80 keeps them behind it.
  length: 80,
  archZ: 0,
  detailZ: -6,
  stageNear: -12,
  stageFar: -40,
  middleAZ: -20,
  middleBZ: -30,
  hungZ: -34,
  farZ: -42,
  hungTopY: 36,
  aisleHalf: 8,
  /** station 07's arch at −560, the window wall 50 behind it */
  windowWallZ: -610,
} as const;

/** design.md §4.3: sheet geometry. */
export const sheet = { thickness: 0.15 } as const;

/** design.md §5: material, light, fog. */
export const paper = { roughness: 0.92, metalness: 0, normalScale: 0.28, grainTileUnits: 20 } as const;

export const light = {
  spot: { color: "#FFD9A8", offset: [-6, 10, 2] as const, angleDeg: 38, penumbra: 0.8, decay: 1.2 },
  // design.md's (−0.4,−0.7,+0.6) travels toward the camera and backlights every sheet front. Flipped
  // into the box and brought frontal so daylight lands on the fronts from the upper left without the
  // arch header shadowing the whole stage.
  sun: { color: "#F2F4FF", direction: [0.2, -0.5, -0.84] as const, nudgeDeg: 5 },
  hemi: {
    night: { sky: "#5C5FA6", ground: "#2A1E24" },
    morning: { sky: "#F4EBDD", ground: "#677084" },
  },
  shadow: { mapSize: 1024, mapSizeLow: 512, radius: 4, bias: -0.0005, normalBias: 0.02 },
} as const;

// colour needs room to breathe: haze starts later and thins out further than design.md's 40/260
export const fog = { near: 60, far: 330 } as const;

/** design.md §7.1: motion. Seconds unless noted. */
export const motion = {
  quick: 0.18,
  base: 0.32,
  slow: 0.7,
  light: 1.2,
  stagger: 0.06,
  pointerLambda: 3.2,
  lenisLerp: 0.08,
  spring: { stiffness: 40, damping: 5, mass: 1 },
  entrance: { sheet: 0.6, stagger: 0.09, fade: 0.3, flicker: 0.25, total: 1.8, returnTotal: 0.8 },
} as const;

/** design.md §8: the worker. */
export const worker = {
  /** the rig is drawn ~5 units tall; the scene shows him at twice that (decisions.md: "2×") */
  scale: 2,
  height: 5,
  backingOffset: 0.12,
  yawClampDeg: 55,
  turnTime: 0.6,
  slow: { cycle: 2.2, stride: 1.6, hip: 20, knee: 35, arm: 15, elbow: [10, 20] as const, bob: 0.12, lean: 3, ease: 0.4 },
  brisk: { cycle: 1.5, stride: 1.9, hip: 24, knee: 40, arm: 18, elbow: [10, 20] as const, bob: 0.14, lean: 5, ease: 0.3 },
  fidget: [4, 7] as const,
} as const;
