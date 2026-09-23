/** Polygon booleans and offsets (clipper2). Precision 4 decimals: output is rounded to 3. */
import {
  areaD,
  booleanOpDWithPolyTree,
  ClipType,
  differenceD,
  EndType,
  FillRule,
  inflatePathsD,
  JoinType,
  PolyTreeD,
  ramerDouglasPeuckerPathsD,
  reversePathD,
  unionD,
  type PathD,
  type PathsD,
  type PolyPathD,
} from "clipper2-ts";
import type { Poly } from "./parse.mts";

const PRECISION = 4;

const asPaths = (polys: Poly[]): PathsD => polys.map((p) => p.map(({ x, y }) => ({ x, y }) as PathD[number]));
const toPolys = (paths: PathsD): Poly[] => paths.map((p) => p.map(({ x, y }) => ({ x, y })));

/** counter-clockwise, y-up */
const positive = (p: PathD) => (areaD(p) < 0 ? reversePathD(p) : p);

/** union of the solid subpaths, minus the union of the hole subpaths (authoring is orientation-agnostic) */
export function solidShape(solids: Poly[], holes: Poly[]): Poly[] {
  let s = unionD(asPaths(solids).map(positive), [], FillRule.NonZero, PRECISION);
  if (holes.length) s = differenceD(s, asPaths(holes).map(positive), FillRule.NonZero, PRECISION);
  return toPolys(s);
}

/** Morphological opening: shrink then grow. Kills features thinner than 2r, rounds convex corners (Round). */
export function opening(polys: Poly[], r: number, join: "miter" | "round"): Poly[] {
  const jt = join === "round" ? JoinType.Round : JoinType.Miter;
  const shrunk = inflatePathsD(asPaths(polys), -r, jt, EndType.Polygon, 4, PRECISION, 0.01);
  return toPolys(inflatePathsD(shrunk, r, jt, EndType.Polygon, 4, PRECISION, 0.01));
}

export function offset(polys: Poly[], delta: number): Poly[] {
  return toPolys(inflatePathsD(asPaths(polys), delta, JoinType.Round, EndType.Polygon, 4, PRECISION, 0.01));
}

/** Net area (holes subtract). */
export const netArea = (polys: Poly[]) => asPaths(polys).reduce((a, p) => a + areaD(p), 0);

/** Re-union a wobbled contour set (fixes self-intersections), then simplify. */
export function cleanup(polys: Poly[], epsilon: number): Poly[] {
  const u = unionD(asPaths(polys), [], FillRule.NonZero, PRECISION);
  return toPolys(ramerDouglasPeuckerPathsD(u, epsilon)).filter((p) => p.length >= 3);
}

export type Piece = { outer: Poly; holes: Poly[]; islands: number };

/** Outer contours with their holes. `islands` counts solids floating inside a hole (a lint error). */
export function pieces(polys: Poly[]): Piece[] {
  const tree = new PolyTreeD();
  booleanOpDWithPolyTree(ClipType.Union, asPaths(polys), null, tree, FillRule.NonZero, PRECISION);
  const out: Piece[] = [];
  const countDeep = (n: PolyPathD): number => {
    let c = 0;
    for (let i = 0; i < n.count; i++) c += 1 + countDeep(n.child(i));
    return c;
  };
  const visitOuter = (n: PolyPathD) => {
    const outer = positive(n.poly!);
    const holes: Poly[] = [];
    let islands = 0;
    for (let i = 0; i < n.count; i++) {
      const h = n.child(i);
      const hp = h.poly!;
      holes.push(toPolys([areaD(hp) > 0 ? reversePathD(hp) : hp])[0]!);
      islands += countDeep(h);
      // islands are still emitted as their own pieces so nothing silently disappears
      for (let j = 0; j < h.count; j++) visitOuter(h.child(j));
    }
    out.push({ outer: toPolys([outer])[0]!, holes, islands });
  };
  for (let i = 0; i < tree.count; i++) visitOuter(tree.child(i));
  return out;
}
