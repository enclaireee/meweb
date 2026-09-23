/**
 * The damped spring for things on strings and pins (design.md §7.1: stiffness 40, damping 5,
 * mass 1; ≈3 visible swings, settled in ~3 s). Semi-implicit Euler at fixed 1/120 s substeps, so it
 * behaves the same at any frame rate and never explodes after a long idle gap.
 */
import { motion } from "@/design/tokens";

export type Spring = { x: number; v: number };

const STEP = 1 / 120;
const MAX_DT = 0.1;

export function stepSpring(s: Spring, target: number, dt: number, k = motion.spring.stiffness, c = motion.spring.damping, m = motion.spring.mass) {
  let t = Math.min(dt, MAX_DT);
  while (t > 1e-6) {
    const h = Math.min(STEP, t);
    const a = (-k * (s.x - target) - c * s.v) / m;
    s.v += a * h;
    s.x += s.v * h;
    t -= h;
  }
}

/** true while it still visibly moves */
export const springActive = (s: Spring, target: number) => Math.abs(s.x - target) > 1e-4 || Math.abs(s.v) > 1e-3;
