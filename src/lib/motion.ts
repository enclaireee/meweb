/**
 * The motion language, as JS values. Mirrors the CSS tokens in globals.css
 * (@theme) so Motion and GSAP animate with the same curves and tempo.
 */
export const EASE = {
  outSoft: [0.25, 1, 0.5, 1],
  outExpo: [0.16, 1, 0.3, 1],
  inOutSoft: [0.65, 0, 0.35, 1],
} as const;

export const DUR = {
  /** Micro UI feedback — hovers, toggles. */
  fast: 0.15,
  /** Standard UI state changes. */
  base: 0.3,
  /** Content entrances and reveals. */
  gesture: 0.7,
  /** The few signature moments — hero type, image wipes, page veils. */
  signature: 1.1,
} as const;

/** Names of the CustomEase curves registered in lib/gsap.ts. */
export const GSAP_EASE = {
  outSoft: "outSoft",
  outExpo: "outExpo",
  inOutSoft: "inOutSoft",
} as const;
