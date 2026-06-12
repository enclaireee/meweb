/**
 * The motion language, as JS values. Mirrors the CSS tokens in globals.css
 * (@theme) so Motion and GSAP animate with the same curves and tempo.
 */
export const EASE = {
  outExpo: [0.16, 1, 0.3, 1],
  inOutSoft: [0.65, 0, 0.35, 1],
  snap: [0.83, 0, 0.17, 1],
} as const;

export const DUR = {
  fast: 0.3,
  base: 0.6,
  slow: 1.0,
  drama: 1.4,
} as const;

/** Names of the CustomEase curves registered in lib/gsap.ts. */
export const GSAP_EASE = {
  outExpo: "outExpo",
  inOutSoft: "inOutSoft",
  snap: "snap",
} as const;
