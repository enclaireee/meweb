/**
 * Motion tokens — the JS mirror of the CSS layer in globals.css.
 * CSS, Motion (framer), and any future GSAP must all speak this vocabulary;
 * a duration or easing that isn't here doesn't exist.
 *
 * Components animating with Motion must gate through useReducedMotion()
 * (the CSS side collapses automatically via the token-layer media query).
 */

/** Durations in seconds (Motion convention). CSS: --dur-*. */
export const dur = {
  fast: 0.12,
  base: 0.24,
  slow: 0.4,
  /** Page transitions only — the single exemption from the 400ms rule. */
  page: 0.6,
} as const;

/** Cubic-bezier easings. CSS: --ease-*. */
export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  outQuart: [0.25, 1, 0.5, 1],
  mech: [0.7, 0, 0.3, 1],
} as const;

/** The two sanctioned springs. */
export const spring = {
  /** Interactive feedback — hovers, presses, magnetic pulls. */
  snappy: { type: "spring", stiffness: 520, damping: 38, mass: 0.9 },
  /** Entrances and layout shifts. */
  gentle: { type: "spring", stiffness: 220, damping: 30, mass: 1 },
} as const;
