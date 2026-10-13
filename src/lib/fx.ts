// Per-layer effects that change with the journey (opacity/offset by fractional stop). Shared with art/preview.ts.
import { dials } from "@/content/site";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const lerpDial = (pos: number, pick: (d: (typeof dials)[number]) => number) => {
  const i = Math.max(0, Math.min(6, Math.floor(pos)));
  const t = clamp01(pos - i);
  return pick(dials[i]!) * (1 - t) + pick(dials[i + 1]!) * t;
};

export const hazeAt = (pos: number) => lerpDial(pos, (d) => d.haze);
export const glowAt = (pos: number) => lerpDial(pos, (d) => d.glow);

/** { opacity, ty } for a layer fx at fractional stop pos. ty in art units (down is positive). */
export function layerFx(fx: string | undefined, pos: number): { opacity: number; ty: number } {
  switch (fx) {
    case "stars": // none after stop 5
      return { opacity: clamp01((5.5 - pos) / 1.5), ty: 0 };
    case "moon": // sinks from y 140 to 300 over the journey, fades at first light
      return { opacity: 1 - 0.6 * clamp01((pos - 5) / 2), ty: (160 * pos) / 7 };
    case "volcano":
      return { opacity: 1 - clamp01((pos - 2.6) / 1.2), ty: 0 };
    case "range":
      return { opacity: clamp01((pos - 2.6) / 1.2), ty: 0 };
    case "haze":
      return { opacity: 0.35 + 0.65 * hazeAt(pos), ty: 0 };
    default:
      return { opacity: 1, ty: 0 };
  }
}
