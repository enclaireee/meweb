/**
 * cut.json → GPU geometry (architecture.md §6.2). Every sheet is extruded 0.15 thick, carries its
 * stock as night/morning vertex colours and its place in the relight roll, and gets world-scale UVs
 * (the same grain size everywhere) offset per sheet so tiles never line up.
 */
import { BufferAttribute, BufferGeometry, Color, ExtrudeGeometry, Path, Shape, Vector2 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { box, paper, sheet as sheetTok, stockColor, type Stock } from "@/design/tokens";
import { seeded } from "@/lib/rng";
import type { CutPiece, CutSheet } from "./cut";

const pts = (flat: number[]) => {
  const out: Vector2[] = [];
  for (let i = 0; i < flat.length; i += 2) out.push(new Vector2(flat[i], flat[i + 1]));
  return out;
};

function shapes(pieces: CutPiece[]): Shape[] {
  return pieces.map((p) => {
    const s = new Shape(pts(p.outer));
    s.holes = p.holes.map((h) => new Path(pts(h)));
    return s;
  });
}

/** 0 at the window, 1 at the front of the desk: who changes first in the relight roll */
export const relightOrder = (worldZ: number) => Math.min(1, Math.max(0, (worldZ - box.windowWallZ) / (0 - box.windowWallZ)));

const night = new Color();
const morning = new Color();

/** Fill the per-vertex stock attributes for a whole geometry. */
export function paint(g: BufferGeometry, stock: Stock, order: number | ((z: number) => number)) {
  const n = g.getAttribute("position").count;
  const pos = g.getAttribute("position");
  night.set(stockColor(stock, "night"));
  morning.set(stockColor(stock, "morning"));
  const cn = new Float32Array(n * 3);
  const cm = new Float32Array(n * 3);
  const ord = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    cn[i * 3] = night.r;
    cn[i * 3 + 1] = night.g;
    cn[i * 3 + 2] = night.b;
    cm[i * 3] = morning.r;
    cm[i * 3 + 1] = morning.g;
    cm[i * 3 + 2] = morning.b;
    ord[i] = typeof order === "number" ? order : order(pos.getZ(i));
  }
  g.setAttribute("colorNight", new BufferAttribute(cn, 3));
  g.setAttribute("colorMorning", new BufferAttribute(cm, 3));
  g.setAttribute("aOrder", new BufferAttribute(ord, 1));
}

/**
 * One sheet's geometry, front face at its local z. `origin` shifts the shape so a pivot or hinge
 * sits at the mesh origin (animated sheets).
 */
export function sheetGeometry(s: CutSheet, stationZ: number, origin: [number, number] = [0, 0], depth: number = sheetTok.thickness): BufferGeometry {
  const g = new ExtrudeGeometry(shapes(s.pieces), { depth, bevelEnabled: false, curveSegments: 1, steps: 1 });
  g.translate(-origin[0], -origin[1], s.z - depth);
  // world-scale grain: the default UV generator gives world units; scale to one tile per N units and
  // offset per sheet
  const uv = g.getAttribute("uv") as BufferAttribute;
  const r = seeded(s.id);
  const ou = r();
  const ov = r();
  const k = 1 / paper.grainTileUnits;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * k + ou, uv.getY(i) * k + ov);
  paint(g, s.stock as Stock, relightOrder(stationZ + s.z));
  return g;
}

/** All static sheets of a station in one geometry: one draw call. */
export function mergeStatic(sheets: CutSheet[], stationZ: number): BufferGeometry | null {
  if (!sheets.length) return null;
  const parts = sheets.map((s) => sheetGeometry(s, stationZ));
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  merged?.computeBoundingSphere();
  return merged;
}
