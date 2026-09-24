/**
 * What the worker does besides walking: jobs at each station and little reactions, as pure pose
 * overlays over time (like walk.ts). Joint angles are radians about z, the paper plane: arms +forward/up,
 * elbows +bend forward, knees −bend back, head +look up. `lift` raises (or lowers) the whole puppet.
 * Split pins only: nothing stretches, everything swings (concept.md §2.8, §9).
 */
import { DEG } from "@/lib/math";
import { POSE_KEYS, type Pose } from "./walk";

export type ActionName =
  | "write"
  | "scratch"
  | "valve"
  | "play"
  | "point"
  | "lift"
  | "reach"
  | "wipe"
  | "pin"
  | "lookUp"
  | "stretch"
  | "wave"
  | "hop"
  | "dance"
  | "draw"
  | "inspect"
  | "yawn"
  | "sit";

/** how long each one lasts by default (s) */
export const DURATION: Record<ActionName, number> = {
  write: 3.4,
  scratch: 2.4,
  valve: 4.5,
  play: 5,
  point: 2.2,
  lift: 3,
  reach: 2.4,
  wipe: 4,
  pin: 2.4,
  lookUp: 2.8,
  stretch: 2.4,
  wave: 2.6,
  hop: 0.7,
  dance: 3,
  draw: 4.5,
  inspect: 3,
  yawn: 2.6,
  sit: 7,
};

export type Overlay = Partial<Pose> & { head?: number; lift?: number; clip?: number };

const s = Math.sin;
const crouch = (depth: number): Overlay => ({
  hipFront: 38 * DEG * depth,
  hipBack: 38 * DEG * depth,
  kneeFront: -72 * DEG * depth,
  kneeBack: -72 * DEG * depth,
  lift: -0.42 * depth,
});

/**
 * The overlay for `name` at time t (s) into it.
 * ponytail: returns a fresh literal (one small object a frame while he acts); an out-param version of
 * 18 cases isn't worth it until a profile shows GC pauses on a real phone.
 */
export function action(name: ActionName, t: number): Overlay {
  switch (name) {
    case "write": // clipboard up at the chest, the other hand scribbling
      return { armFront: 72 * DEG, elbowFront: 62 * DEG, armBack: 55 * DEG + 6 * DEG * s(t * 13), elbowBack: 70 * DEG + 5 * DEG * s(t * 9), head: -10 * DEG };
    case "scratch": // hmm: hand up at the back of the hat
      return { armFront: 150 * DEG, elbowFront: 112 * DEG + 10 * DEG * s(t * 15), head: 6 * DEG + 3 * DEG * s(t * 2), lean: 2 * DEG };
    case "valve": // both hands on the wheel, cranking round
      return {
        armFront: 82 * DEG + 24 * DEG * s(t * 4),
        elbowFront: 22 * DEG + 20 * DEG * Math.cos(t * 4),
        armBack: 82 * DEG + 24 * DEG * s(t * 4 + Math.PI),
        elbowBack: 22 * DEG + 20 * DEG * Math.cos(t * 4 + Math.PI),
        lean: -7 * DEG,
        head: -4 * DEG,
      };
    case "play": // hands on the controls, thumbs going, a little bounce
      return {
        armFront: 58 * DEG,
        elbowFront: 52 * DEG + 9 * DEG * s(t * 19),
        armBack: 52 * DEG,
        elbowBack: 58 * DEG + 9 * DEG * s(t * 17 + 1),
        head: -8 * DEG,
        lift: 0.035 * Math.abs(s(t * 8)),
      };
    case "point":
      return { armFront: 92 * DEG, elbowFront: 4 * DEG, head: 4 * DEG };
    case "lift": {
      // squat down to the crate, then heave it up to the chest
      const k = t < 1 ? t : t < 1.8 ? 1 - (t - 1) / 0.8 : 0;
      const up = t < 1 ? 0.4 : Math.min(1, (t - 1) / 0.8);
      return { ...crouch(k), armFront: (30 + 70 * up) * DEG, armBack: (30 + 70 * up) * DEG, elbowFront: 60 * up * DEG, elbowBack: 60 * up * DEG, lean: -6 * DEG * k };
    }
    case "reach": // up on tiptoe for the top of the board
      return { armFront: 165 * DEG, elbowFront: 8 * DEG, armBack: 20 * DEG, lift: 0.12 * Math.min(1, t * 3), head: 14 * DEG };
    case "wipe":
      return { armFront: 104 * DEG + 26 * DEG * s(t * 6), elbowFront: 30 * DEG, armBack: 10 * DEG, head: -4 * DEG };
    case "pin": // press the pin home: tap, tap
      return { armFront: 124 * DEG + 9 * DEG * Math.max(0, s(t * 11)), elbowFront: 18 * DEG, head: 8 * DEG };
    case "lookUp":
      return { head: 20 * DEG, armFront: -14 * DEG, armBack: -14 * DEG, elbowFront: 40 * DEG, elbowBack: 40 * DEG, lean: 3 * DEG };
    case "stretch":
      return { armFront: 172 * DEG, armBack: 168 * DEG, elbowFront: 4 * DEG, elbowBack: 4 * DEG, lean: 6 * DEG, lift: 0.08, head: 10 * DEG };
    case "wave": // hello! the hand swinging on its elbow
      return { armFront: 150 * DEG, elbowFront: 22 * DEG + 28 * DEG * s(t * 10), head: 6 * DEG };
    case "hop": {
      // a small hop, knees tucked, a bob on landing
      const k = Math.min(1, t / DURATION.hop);
      return { lift: 0.9 * s(Math.PI * k), kneeFront: -45 * DEG * s(Math.PI * k), kneeBack: -45 * DEG * s(Math.PI * k), armFront: 40 * DEG, armBack: 40 * DEG };
    }
    case "dance": {
      const a = 0.5 + 0.5 * s(t * 6);
      return {
        armFront: 150 * DEG * a,
        armBack: 150 * DEG * (1 - a),
        elbowFront: 20 * DEG,
        elbowBack: 20 * DEG,
        hipFront: 14 * DEG * s(t * 6),
        hipBack: -14 * DEG * s(t * 6),
        lift: 0.28 * Math.abs(s(t * 6)),
        head: 8 * DEG * s(t * 3),
      };
    }
    case "draw": // pencil on the board, small loops
      return { armFront: 76 * DEG + 8 * DEG * s(t * 5), elbowFront: 42 * DEG + 10 * DEG * Math.cos(t * 5), armBack: 20 * DEG, head: -6 * DEG };
    case "inspect": // crouch and peer at the dial
      return { ...crouch(Math.min(1, t * 2)), armFront: 62 * DEG, elbowFront: 30 * DEG, head: -12 * DEG + 4 * DEG * s(t * 2) };
    case "sit": {
      // on the edge of the bed, boots swinging; halfway through, a long sleepy stretch
      const up = Math.max(0, s(Math.PI * Math.min(1, Math.max(0, (t - 2.6) / 2))));
      return {
        hipFront: 88 * DEG,
        hipBack: 84 * DEG,
        kneeFront: -86 * DEG + 12 * DEG * s(t * 2.4),
        kneeBack: -84 * DEG + 12 * DEG * s(t * 2.4 + 2),
        // hips on the mattress (world 4.4 = 2.2 art), boots dangling
        lift: -0.1,
        armFront: (25 + 145 * up) * DEG,
        armBack: (18 + 147 * up) * DEG,
        elbowFront: (40 - 10 * up) * DEG,
        elbowBack: (40 - 10 * up) * DEG,
        head: -6 * DEG + 26 * DEG * up,
        lean: -4 * DEG + 8 * DEG * up,
      };
    }
    case "yawn":
      return { armFront: 165 * DEG, armBack: 165 * DEG, elbowFront: 30 * DEG, elbowBack: 30 * DEG, head: 22 * DEG, lean: 5 * DEG };
  }
}

/** Blend an overlay onto a pose (w: 0 → base, 1 → overlay), into `out` when given (it may be `base`). */
export function overlay(base: Pose, o: Overlay, w: number, out = {} as Pose): Pose {
  for (const k of POSE_KEYS) {
    const v = o[k];
    out[k] = v === undefined ? base[k] : base[k] + (v - base[k]) * w;
  }
  return out;
}
