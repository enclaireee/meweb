// Per-layer effects that change with the journey (opacity/offset by fractional stop). Shared with art/preview.ts.
import { dials } from "@/content/site";
import { timelinePos, type Route } from "./route";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const lerpDial = (pos: number, pick: (d: { haze: number; glow: number }) => number) => {
  const D = dials;
  const i = Math.max(0, Math.min(D.length - 2, Math.floor(pos)));
  const t = clamp01(pos - i);
  return pick(D[i]!) * (1 - t) + pick(D[i + 1]!) * t;
};

export const hazeAt = (pos: number) => lerpDial(pos, (d) => d.haze);
export const glowAt = (pos: number) => lerpDial(pos, (d) => d.glow);

/** { opacity, ty } for a layer fx at local fractional stop `local` on `route`. ty in art units (down is positive). */
export function layerFx(fx: string | undefined, local: number, route: Route = "main"): { opacity: number; ty: number } {
  const pos = timelinePos(local, route); // the rules below are written on the 10-stop timeline
  switch (fx) {
    case "stars": // full through the night (pos 2-5.5), gone by first light (8)
      return { opacity: clamp01((8 - pos) / 2.5), ty: 0 };
    case "moon": // sinks over the journey; full at 2-3, faint at 7, gone by 9
      return { opacity: 1 - clamp01((pos - 4.5) / 4.5), ty: (160 * (pos - 2)) / 7 };
    case "volcano":
      return { opacity: 1 - clamp01((pos - 3.6) / 1.2), ty: 0 };
    case "range":
      return { opacity: clamp01((pos - 3.6) / 1.2), ty: 0 };
    case "haze":
      return { opacity: 0.35 + 0.65 * hazeAt(local), ty: 0 };
    default:
      return { opacity: 1, ty: 0 };
  }
}
