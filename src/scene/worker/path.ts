/**
 * Where the worker walks between rooms. No cable on the floor any more (decisions.md): he keeps a
 * steady distance ahead of the camera, so every room-to-room transition is as smooth as the dolly,
 * wandering left and right on a gentle, irregular meander rather than a line you can read ahead.
 */
import { cameraZ } from "@/scene/camera/path";

/** how far ahead of the camera he walks: at a rest this lands him at the room's stage front (local −11) */
export const LEAD = 46;

/** a smooth, never-repeating-looking wander across the aisle (|x| ≤ ~5) */
export const meander = (z: number) => 3.2 * Math.sin(z / 23 + 0.7) + 1.6 * Math.sin(z / 9.1 + 2.1);

/** his follow point for a camera station coordinate */
export function followPoint(s: number, out: { x: number; z: number }) {
  out.z = cameraZ(s) - LEAD;
  out.x = meander(out.z);
  return out;
}
