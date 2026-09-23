/**
 * Scroll → camera, as pure functions (architecture.md §6.6). Each station's section maps
 * 0–30% travel in, 30–70% dwell at rest, 70–100% travel out (design.md §3). The travel between two
 * rests is one smoothstep across both halves, so the dolly eases into and out of every dwell.
 */
import { camera, box } from "@/design/tokens";
import { LAST_STATION } from "@/sections/stations";
import { clamp, smoothstep } from "@/lib/math";

const IN = 0.3;
const OUT = 0.7;

/** Continuous station coordinate: `i` at rest, fractional while travelling. */
export function stationCoord(index: number, progress: number): number {
  const p = clamp(progress, 0, 1);
  let s: number;
  if (p < IN) s = index - 1 + smoothstep(0, 1, 0.5 + (p / IN) * 0.5);
  else if (p <= OUT) s = index;
  else s = index + smoothstep(0, 1, ((p - OUT) / (1 - OUT)) * 0.5);
  return clamp(s, 0, LAST_STATION);
}

/** z of station i's arch */
export const archZ = (s: number) => -box.length * s;

/** camera z at a station coordinate: `restDistance` in front of the arch */
export const cameraZ = (s: number) => archZ(s) + camera.restDistance;
