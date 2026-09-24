"use client";

import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, PlaneGeometry, Shape, ShapeGeometry, Vector2 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { box, paper, rooms, shell, type Stock } from "@/design/tokens";
import { paperMaterial } from "./material";
import { paint, relightOrder } from "./sheet";

/**
 * The rooms (decisions.md, "not a hollow room"): each station is built as a room, not a tunnel.
 * Papered side walls with cut stripes, a wainscot and rail, a lowered ceiling with beams, a rug on the
 * boards, and a back wall whose doorway frames the next room. All flat cards, all one mesh.
 */

const K = 1 / paper.grainTileUnits;

function worldUV(g: BufferGeometry, axis: "xy" | "zy" | "xz") {
  const pos = g.getAttribute("position");
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const a = axis === "zy" ? pos.getZ(i) : pos.getX(i);
    const b = axis === "xz" ? pos.getZ(i) : pos.getY(i);
    uv[i * 2] = a * K;
    uv[i * 2 + 1] = b * K;
  }
  g.setAttribute("uv", new BufferAttribute(uv, 2));
}

const finish = (g: BufferGeometry, stock: Stock, axis: "xy" | "zy" | "xz") => {
  worldUV(g, axis);
  paint(g, stock, relightOrder);
  return g.index ? g.toNonIndexed() : g;
};

/** a card facing the camera (+z) */
function front(x0: number, x1: number, y0: number, y1: number, z: number, stock: Stock) {
  const g = new PlaneGeometry(x1 - x0, y1 - y0);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, z);
  return finish(g, stock, "xy");
}

/** a card on a side wall, facing the aisle */
function side(x: number, y0: number, y1: number, z0: number, z1: number, stock: Stock) {
  const g = new PlaneGeometry(z0 - z1, y1 - y0);
  g.rotateY(x < 0 ? Math.PI / 2 : -Math.PI / 2);
  g.translate(x, (y0 + y1) / 2, (z0 + z1) / 2);
  return finish(g, stock, "zy");
}

/** a horizontal card (floor pieces face up, the ceiling faces down) */
function flat(x0: number, x1: number, z0: number, z1: number, y: number, stock: Stock, down = false) {
  const g = new PlaneGeometry(x1 - x0, z0 - z1);
  g.rotateX(down ? Math.PI / 2 : -Math.PI / 2);
  g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  return finish(g, stock, "xz");
}

/** the doorway's curve: jambs up to `spring`, then a flattened arch to `top` */
function doorPoints(half: number, spring: number, top: number, n = 16): Vector2[] {
  const pts = [new Vector2(-half, 0), new Vector2(-half, spring)];
  const c = 2 * top - spring; // quadratic control so the apex lands on `top`
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push(new Vector2(u * u * -half + 2 * u * t * 0 + t * t * half, u * u * spring + 2 * u * t * c + t * t * spring));
  }
  pts.push(new Vector2(half, spring), new Vector2(half, 0));
  return pts;
}

function shapeCard(pts: Vector2[], z: number, stock: Stock) {
  const g = new ShapeGeometry(new Shape(pts), 1);
  g.translate(0, 0, z);
  return finish(g, stock, "xy");
}

function buildRoom(i: number): BufferGeometry[] {
  const r = rooms[i]!;
  const Z = -box.length * i;
  const last = i === rooms.length - 1;
  const W = shell.halfWidth;
  const H = shell.ceiling;
  const zFront = Z + (i === 0 ? 44 : shell.frontZ);
  const zBack = Z + (last ? -50 : shell.backWallZ);
  const out: BufferGeometry[] = [];

  // side walls: paper, a wainscot below a rail, stripes cut from a lighter sheet, a skirting board
  for (const x of [-W, W]) {
    const inset = (d: number) => (x < 0 ? x + d : x - d);
    out.push(side(x, 0, H, zFront, zBack, r.wall));
    out.push(side(inset(0.06), 0, shell.wainscot, zFront, zBack, r.wainscot));
    out.push(side(inset(0.1), shell.wainscot - 0.2, shell.wainscot + 0.7, zFront, zBack, r.trim));
    out.push(side(inset(0.12), 0, 1.8, zFront, zBack, r.trim));
    for (let z = zFront - 3; z > zBack + 2; z -= 5.5) out.push(side(inset(0.08), shell.wainscot + 0.7, H, z, z - 1.4, r.stripe));
  }

  // the ceiling, lowered, with two beams
  out.push(flat(-W, W, zFront, zBack, H, r.ceiling, true));
  for (const bz of [-8, -28]) out.push(front(-W, W, H - 2.4, H, Z + bz, r.trim));

  // a rug on the boards, in the room's colours
  out.push(flat(-11.5, 11.5, Z + 3, Z - 30, 0.04, r.rugBorder));
  out.push(flat(-10.2, 10.2, Z + 1.7, Z - 28.7, 0.05, r.rug));
  for (const sz of [-5, -23.5]) out.push(flat(-10.2, 10.2, Z + sz, Z + sz - 0.9, 0.06, r.rugBorder));

  // the back wall: its doorway frames the next room (the last room ends at the window wall instead)
  if (!last) {
    const zb = Z + shell.backWallZ;
    const door = doorPoints(shell.doorHalf, shell.doorTop - 6, shell.doorTop);
    const wall = [new Vector2(-W, 0), ...door, new Vector2(W, 0), new Vector2(W, H), new Vector2(-W, H)];
    out.push(shapeCard(wall, zb, r.wall));
    const d = shell.doorHalf;
    out.push(front(-W, -d, 0, shell.wainscot, zb + 0.05, r.wainscot));
    out.push(front(d, W, 0, shell.wainscot, zb + 0.05, r.wainscot));
    out.push(front(-W, -d - 1.2, shell.wainscot - 0.2, shell.wainscot + 0.7, zb + 0.1, r.trim));
    out.push(front(d + 1.2, W, shell.wainscot - 0.2, shell.wainscot + 0.7, zb + 0.1, r.trim));
    for (let x = -W + 3; x < -d - 3; x += 5.5) out.push(front(x, x + 1.4, shell.wainscot + 0.7, H, zb + 0.08, r.stripe));
    for (let x = d + 3; x < W - 2; x += 5.5) out.push(front(x, x + 1.4, shell.wainscot + 0.7, H, zb + 0.08, r.stripe));
    // the door frame: a cut strip around the opening
    const outer = doorPoints(d + 1.3, shell.doorTop - 5.6, shell.doorTop + 1.3);
    const inner = doorPoints(d, shell.doorTop - 6, shell.doorTop).reverse();
    out.push(shapeCard([...outer, ...inner], zb + 0.14, r.trim));
  }
  return out;
}

export function Rooms() {
  const geometry = useMemo(() => {
    const parts = rooms.flatMap((_, i) => buildRoom(i));
    const merged = mergeGeometries(parts, false);
    parts.forEach((p) => p.dispose());
    merged?.computeBoundingSphere();
    return merged;
  }, []);
  if (!geometry) return null;
  return <mesh geometry={geometry} material={paperMaterial()} receiveShadow matrixAutoUpdate={false} />;
}
