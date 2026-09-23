/**
 * One sheet from source to cut: solid shape → blunt convex corners → lint → wobble → clean → pieces,
 * then stacking and hand-placement. Output is rounded to 3 decimals, deterministic.
 */
import { cleanup, offset, opening, pieces, solidShape } from "./clean.mts";
import { lintSheet } from "./lint.mts";
import type { FileSource, Poly, Pt, SheetSource } from "./parse.mts";
import { wobble, type WobbleParams } from "./wobble.mts";
import { mulberry32, hashString } from "../../src/lib/rng.ts";

import type { CutFile, CutSheet } from "../../src/scene/paper/cut.ts";

const r3 = (n: number) => Math.round(n * 1000) / 1000 || 0;
const flat = (p: Poly) => p.flatMap((q) => [r3(q.x), r3(q.y)]);

function bbox(polys: Poly[]): [number, number, number, number] {
  let a = Infinity;
  let b = Infinity;
  let c = -Infinity;
  let d = -Infinity;
  for (const p of polys)
    for (const q of p) {
      a = Math.min(a, q.x);
      b = Math.min(b, q.y);
      c = Math.max(c, q.x);
      d = Math.max(d, q.y);
    }
  return [a, b, c, d];
}

export function cutSheet(
  file: FileSource,
  s: SheetSource,
  mode: "scene" | "ui",
  params: WobbleParams,
): { sheet: { pieces: Poly[][]; bbox: [number, number, number, number] }; errors: string[] } {
  const shape = solidShape(s.solids, s.holes);
  const errors = lintSheet(file, s, shape, mode);
  const blunt = opening(shape, params.blunt, "round");
  const [x0, y0, x1, y1] = bbox(blunt);
  const size = Math.max(x1 - x0, y1 - y0);
  const wobbled: Poly[] = [];
  blunt.forEach((contour, i) => wobbled.push(wobble(contour, `${s.id}:${i}`, size, s.cut, params).poly));
  const cleaned = cleanup(wobbled, params.simplify);
  const ps = pieces(cleaned).map((p) => [p.outer, ...p.holes]);
  return { sheet: { pieces: ps, bbox: bbox(cleaned) }, errors };
}

/** Sheets sharing a data-z stack in document order, each hand-placed a hair off-true (§7.1 #9). */
export function cutFile(file: FileSource, name: string, params: WobbleParams, { registration = "hand" } = {}) {
  const errors = [...file.errors];
  const zGroups = new Map<number, number>();
  const sheets: CutSheet[] = [];
  for (const s of file.sheets) {
    const { sheet, errors: e } = cutSheet(file, s, "scene", params);
    errors.push(...e);
    const k = zGroups.get(s.z) ?? 0;
    zGroups.set(s.z, k + 1);

    let move = (q: Pt) => q;
    if (k > 0 && registration === "hand") {
      const rng = mulberry32(hashString(`${s.id}:place`));
      const dx = (rng() * 2 - 1) * 0.1;
      const dy = (rng() * 2 - 1) * 0.1;
      const a = ((rng() * 2 - 1) * 0.4 * Math.PI) / 180;
      const [bx0, by0, bx1, by1] = sheet.bbox;
      const cx = (bx0 + bx1) / 2;
      const cy = (by0 + by1) / 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      move = (q) => ({ x: cx + (q.x - cx) * cos - (q.y - cy) * sin + dx, y: cy + (q.x - cx) * sin + (q.y - cy) * cos + dy });
    }
    const placed = sheet.pieces.map((piece) => piece.map((poly) => poly.map(move)));
    const pt = (q?: Pt): [number, number] | undefined => (q ? [r3(move(q).x), r3(move(q).y)] : undefined);
    const bb = bbox(placed.flat());
    sheets.push({
      id: s.id,
      stock: s.stock,
      z: r3(s.z + k * 0.25),
      cast: s.cast,
      ...(s.hinge ? { hinge: s.hinge } : {}),
      ...(s.pivot ? { pivot: pt(s.pivot) } : {}),
      ...(s.hang ? { hang: pt(s.hang) } : {}),
      ...(s.parent ? { parent: s.parent } : {}),
      bbox: [r3(bb[0]), r3(bb[1]), r3(bb[2]), r3(bb[3])],
      pieces: placed.map(([outer, ...holes]) => ({ outer: flat(outer!), holes: holes.map(flat) })),
      ...(file.backing > 0
        ? { backing: pieces(offset(placed.map((p) => p[0]!), file.backing)).map((p) => ({ outer: flat(p.outer), holes: [] })) }
        : {}),
    });
  }
  return { out: { name, sheets } satisfies CutFile, errors };
}

/** UI shapes → CSS custom properties holding polygon() clip-paths, in percent. */
export function clipCss(file: FileSource, params: WobbleParams) {
  const errors = [...file.errors];
  const lines: string[] = [];
  for (const s of file.sheets) {
    const { sheet, errors: e } = cutSheet(file, s, "ui", params);
    errors.push(...e);
    const outer = sheet.pieces[0]?.[0];
    if (!outer) continue;
    const pts = outer.map((q) => `${+q.x.toFixed(2)}% ${+q.y.toFixed(2)}%`).join(",");
    lines.push(`  --clip-${s.id}: polygon(${pts});`);
  }
  return { css: lines, errors };
}
