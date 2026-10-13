// Frame opening, scale k and traveller anchor (frame-and-layout.md, depth-system.md).

export const P = 1700; // pitch, art units per stop at s = 1
export const PAD = 1200; // strip left pad
export const H = 1000; // artboard height
export const HANG = 260; // tag hangs this far ahead of the boat
export const HOOK_Y = 300; // post hook height on layer 09, art units

export type Profile = "phone" | "desktop";

export type Layout = {
  vw: number;
  vh: number;
  frame: number;
  /** Opening box in viewport px. */
  ox: number;
  oy: number;
  ow: number;
  oh: number;
  k: number;
  /** Traveller anchor, px from the opening's left edge. */
  anchor: number;
  /** Artboard top, px from the opening's top edge (negative when cropped). */
  top: number;
  profile: Profile;
  compact: boolean;
};

/** `opening` overrides the computed opening size with a measured one (the Frame's CSS is the source of truth at runtime). */
export function computeLayout(vw: number, vh: number, opening?: { w: number; h: number }): Layout {
  const frame = vw < 640 ? 23 : vw < 1024 ? 36 : 54;
  const ow = opening?.w ?? Math.min(vw - 2 * frame, 2200);
  const oh = opening?.h ?? vh - 2 * frame;
  const ox = (vw - ow) / 2;
  const oy = frame;
  const k = Math.max(oh / H, ow / 1900);
  const portraitPhone = vw < 640 && vh > vw;
  const anchor = (portraitPhone ? 0.34 : 0.3) * ow;
  const top = (oh - H * k) / 2;
  return {
    vw,
    vh,
    frame,
    ox,
    oy,
    ow,
    oh,
    k,
    anchor,
    top,
    profile: vw < 640 ? "phone" : "desktop",
    compact: vw < 640 || vh < 520,
  };
}

/** Rest-fan: layer x (art units, incl. pad) of stop i's landmark on a layer of speed s. */
export const landmarkX = (s: number, i: number) => PAD + s * (i * P + HANG);

/** Screen x (px from opening left) of strip x on a layer of speed s at fractional stop pos. */
export const screenX = (L: Pick<Layout, "anchor" | "k">, s: number, x: number, pos: number) =>
  L.anchor + (x - PAD - s * pos * P) * L.k;

/**
 * Indices of tiles a layer needs while pos runs over [lo, hi]: everything on screen at any point of the move,
 * plus a quarter-viewport margin and the pointer-parallax shift.
 */
export function visibleTiles(
  tiles: readonly { x: number; w: number }[],
  s: number,
  lo: number,
  hi: number,
  L: Pick<Layout, "anchor" | "k" | "ow">,
): number[] {
  const m = (0.25 * L.ow) / L.k + 14 * s;
  const a = PAD + s * lo * P - L.anchor / L.k - m;
  const b = PAD + s * hi * P + (L.ow - L.anchor) / L.k + m;
  return tiles.flatMap((t, i) => (t.x < b && t.x + t.w > a ? [i] : []));
}
