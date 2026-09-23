/** Paper physics as build errors (architecture.md §7.1 #6, §7.4 step 2). */
import { netArea, opening, pieces, solidShape } from "./clean.mts";
import type { FileSource, Poly, SheetSource } from "./parse.mts";

import { allStocks } from "../../src/design/tokens.ts";

const STOCKS = new Set(allStocks);

export const LIMITS = {
  minStrip: 0.2, // 2 mm
  minHole: 0.3, // 3 mm
  maxNodes: 400,
  /** the camera and the worker travel here: |x| < 8, floor to y = 22 (hung things may sit above) */
  aisle: { half: 8, top: 22 },
};

export function lintSheet(file: FileSource, s: SheetSource, shape: Poly[], mode: "scene" | "ui"): string[] {
  const e: string[] = [];
  const where = `${file.file} #${s.id}`;
  if (mode === "scene" && !STOCKS.has(s.stock)) e.push(`${where}: data-stock "${s.stock}" is not a stock (see papers / glows in src/design/tokens.ts)`);
  if (s.nodes > LIMITS.maxNodes) e.push(`${where}: ${s.nodes} path commands (max ${LIMITS.maxNodes}); simplify the drawing`);
  if (shape.length === 0) {
    e.push(`${where}: empty shape`);
    return e;
  }
  if (mode === "ui") return e;

  const area = netArea(shape);
  const opened = netArea(opening(shape, LIMITS.minStrip / 2, "miter"));
  if (area > 0 && (area - opened) / area > 0.005)
    e.push(`${where}: has a strip thinner than ${LIMITS.minStrip * 10} mm (${(((area - opened) / area) * 100).toFixed(1)}% of it would tear)`);

  // a solid drawn inside a hole would be cut away with it: that's a floating island, not a feature
  if (s.holes.length)
    for (const solid of s.solids) {
      const a = Math.abs(netArea([solid]));
      const kept = netArea(solidShape([solid], s.holes));
      if (a > 0 && kept / a < 0.01) e.push(`${where}: floating island inside a hole; bridge it to the sheet or cut it as its own sheet`);
    }

  for (const p of pieces(shape)) {
    if (p.islands > 0) e.push(`${where}: ${p.islands} floating island(s) inside a hole; bridge them or cut them as their own sheet`);
    for (const h of p.holes) {
      const ha = Math.abs(netArea([h]));
      const ho = Math.abs(netArea(opening([h], LIMITS.minHole / 2, "miter")));
      if (ha > 0 && (ha - ho) / ha > 0.25) e.push(`${where}: a hole narrower than ${LIMITS.minHole * 10} mm`);
    }
  }

  if (file.aisle === "open") {
    const { half, top } = LIMITS.aisle;
    const box: Poly = [
      { x: -half, y: -1 },
      { x: half, y: -1 },
      { x: half, y: top },
      { x: -half, y: top },
    ];
    const inter = netArea(solidShape(shape, [])) - netArea(solidShape(shape, [box]));
    if (inter > 0.01) e.push(`${where}: blocks the aisle (|x| < ${half}, y < ${top}); the camera and the worker walk there`);
  }
  return e;
}
