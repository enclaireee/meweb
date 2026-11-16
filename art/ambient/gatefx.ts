// Shared gate dressing for beats I own: cut lattice holes with district light behind, a lit rim and tone bands,
// so a shut gate pair never reads as a flat dark sheet.
import { arch, cut, difference, ellipse, offset, rect, rng, sheet, union, type Frag, type Poly, type Shape } from "../lib/index.ts";

export type GateFxOpts = {
  /** sprite-space x range where the lattice goes (visible when shut) */
  xa: number; xb: number; H: number; portrait: boolean; seed: number;
  motif: "arch" | "grid" | "diamond";
  light: string; core: string; rim: string; tint: string;
  /** body tone bands (lighter than the sheet fills) */
  tones: string[];
};
const BIG = rect(-6000, -6000, 14000, 14000);
export function gateFx(poly: Poly | Shape, o: GateFxOpts): { holes: Shape; under: Frag[]; mid: Frag[]; over: Frag[] } {
  const r = rng(o.seed);
  const gx = o.portrait ? 150 : 175, gy = o.portrait ? 300 : 270, aw = o.portrait ? 56 : 66, ah = o.portrait ? 120 : 140;
  const hl: (Poly | Shape)[] = [];
  for (let row = 0, y = 150; y < o.H - 160; y += gy, row++)
    for (let x = o.xa + (row % 2) * gx * 0.5; x < o.xb; x += gx) {
      const cx = x + r.range(-6, 6), by = y + ah + r.range(-6, 6);
      if (o.motif === "arch") {
        hl.push(difference(arch(r, cx, by, aw, ah, 0.8), rect(cx - 3, by - ah, 6, ah), rect(cx - aw / 2, by - ah * 0.42 - 3, aw, 6)));
        hl.push(ellipse(cx + gx / 2, by - ah * 0.5, 9, 9, 10), ellipse(cx, by + 48, 6, 6, 8));
      } else if (o.motif === "grid") {
        for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) hl.push(cut(rect(cx - 40 + i * 28, by - ah + j * 34, 20, 24), r, 0.6, 10));
        hl.push(rect(cx + gx / 2 - 3, by - ah, 6, ah * 0.9));
      } else {
        const d = (c: number, m: number, s: number): Poly => [[cx, by - c - s], [cx + s * 0.62, by - c], [cx, by - c + s], [cx - s * 0.62, by - c]].map(([a, b]) => [a, b + m] as [number, number]);
        hl.push(d(ah * 0.8, 0, 52), d(ah * 0.8, 0, 52).map(([a, b]) => [a + gx / 2, b + 90] as [number, number]), d(ah * 0.1, 0, 20));
      }
    }
  const holes = difference(union(...hl), difference(BIG, offset(poly, -60)));
  const body = offset(poly, 0);
  const under: Frag[] = [
    sheet(offset(body, 11), o.tint, { shadow: false, opacity: 0.3 }),
    sheet(offset(body, 4), o.rim, { shadow: false, opacity: 0.7 }),
    sheet(offset(holes, 6), o.light, { shadow: false }),
    sheet(offset(holes, -3), o.core, { shadow: false, opacity: 0.95 }),
  ];
  const inner = difference(offset(poly, -34), holes);
  const mid: Frag[] = [];
  let xc = o.xa - 60, i = 0;
  while (xc < o.xb + 60) {
    const w = r.range(46, 96);
    mid.push(sheet(difference(inner, difference(BIG, cut(rect(xc, -100, w, o.H + 220), r, 1.4, 60))), o.tones[i % o.tones.length]!, { shadow: { dx: -3, dy: 4, blur: 3, opacity: 0.35, color: "#000000" }, edge: { light: [-1, -1], width: 1.5, color: o.rim }, opacity: 0.9 }));
    xc += w; i++;
  }
  const over: Frag[] = [sheet(offset(holes, -2), o.core, { shadow: false, opacity: 0.8 })];
  return { holes, under, mid, over };
}
