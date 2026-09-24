/**
 * The walk cycle as pure functions of phase (architecture.md §8, design.md §8). A split-pin puppet:
 * each hip swings on a triangle wave (linear through stance, so the planted foot doesn't slide), the
 * knee folds only while its leg swings through, arms swing opposite, and the body rides up and down
 * on the straight stance leg: the bob falls out of the geometry instead of being painted on.
 */
import { worker } from "@/design/tokens";
import { DEG } from "@/lib/math";

/** hip pin to floor, from the art (svg y 3.7 → 6.0) */
export const LEG = 2.3;

export type Gait = (typeof worker)["slow"] | (typeof worker)["brisk"];

export type Pose = {
  hipFront: number;
  hipBack: number;
  kneeFront: number;
  kneeBack: number;
  armFront: number;
  armBack: number;
  elbowFront: number;
  elbowBack: number;
  /** hip height above the floor */
  hipY: number;
  lean: number;
};

/** −1 at 0, +1 at ½, −1 at 1 */
const tri = (p: number) => {
  const f = p - Math.floor(p);
  return f < 0.5 ? -1 + 4 * f : 3 - 4 * f;
};

/** 0..1 through a leg's swing (its angle rising), −1 while it's planted */
const swing = (p: number) => {
  const f = p - Math.floor(p);
  return f < 0.5 ? f * 2 : -1;
};

/** The pose at `phase`, written into `out` when given (the loop reuses one: nothing allocates per frame). */
export function pose(phase: number, g: Gait, out = {} as Pose): Pose {
  const A = g.hip * DEG;
  const hipFront = A * tri(phase);
  const hipBack = A * tri(phase + 0.5);
  const sf = swing(phase);
  const sb = swing(phase + 0.5);
  const kneeFront = sf < 0 ? 0 : -g.knee * DEG * Math.sin(Math.PI * sf);
  const kneeBack = sb < 0 ? 0 : -g.knee * DEG * Math.sin(Math.PI * sb);
  const stance = sf < 0 ? hipFront : hipBack;
  const e0 = g.elbow[0];
  const e1 = g.elbow[1];
  out.hipFront = hipFront;
  out.hipBack = hipBack;
  out.kneeFront = kneeFront;
  out.kneeBack = kneeBack;
  out.armFront = -g.arm * DEG * tri(phase);
  out.armBack = -g.arm * DEG * tri(phase + 0.5);
  out.elbowFront = (e0 + (e1 - e0) * (0.5 + 0.5 * tri(phase))) * DEG;
  out.elbowBack = (e0 + (e1 - e0) * (0.5 + 0.5 * tri(phase + 0.5))) * DEG;
  out.hipY = LEG * Math.cos(stance);
  out.lean = -g.lean * DEG;
  return out;
}

/** Standing still: legs together, arms relaxed. */
export const rest: Pose = {
  hipFront: 0,
  hipBack: 0,
  kneeFront: 0,
  kneeBack: 0,
  armFront: 0,
  armBack: 0,
  elbowFront: 12 * DEG,
  elbowBack: 12 * DEG,
  hipY: LEG,
  lean: 0,
};

/** Distance covered per full cycle (two steps). */
export const cycleDistance = (g: Gait) => 2 * g.stride;

export const POSE_KEYS = Object.keys(rest) as readonly (keyof Pose)[];

/** Blend two poses (gait transitions and easing to a stop), into `out` when given (it may be `b`). */
export function mix(a: Pose, b: Pose, t: number, out = {} as Pose): Pose {
  for (const k of POSE_KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}
