"use client";

import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, PlaneGeometry, Vector3 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { box, paper, rooms, type Stock } from "@/design/tokens";
import { cable } from "@/scene/worker/path";
import { paperMaterial } from "./material";
import { paint, relightOrder } from "./sheet";

/** world-scale grain on a plane of w × h units */
function grainUV(g: BufferGeometry, w: number, h: number) {
  const uv = g.getAttribute("uv") as BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / paper.grainTileUnits, (uv.getY(i) * h) / paper.grainTileUnits);
}

/** a vertical card along the side of the box, facing the aisle */
function sideCard(x: number, y: number, h: number, z0: number, z1: number, stock: Stock) {
  const len = z0 - z1;
  const g = new PlaneGeometry(len, h, 4, 1);
  g.rotateY(x < 0 ? Math.PI / 2 : -Math.PI / 2);
  g.translate(x, y + h / 2, (z0 + z1) / 2);
  grainUV(g, len, h);
  paint(g, stock, relightOrder);
  return g;
}

/** The room band of station i along z (station 0 starts in front of the camera, the last ends at the window). */
const band = (i: number): [number, number] => [i === 0 ? 40 : 40 - box.length * i, i === rooms.length - 1 ? box.windowWallZ - 30 : -40 - box.length * i];

/**
 * The box itself (paper packs, decisions.md): a warm wood floor, the sunflower cable lying on it, and
 * each room's walls, skirting and ceiling in its own paper. Walls, skirting and ceilings are merged:
 * one draw call for the whole shell.
 */
export function Floor() {
  const floor = useMemo(() => {
    const len = 700;
    const g = new PlaneGeometry(120, len, 1, 70);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, 40 - len / 2);
    grainUV(g, 120, len);
    paint(g, "wood", relightOrder);
    return g;
  }, []);

  const strip = useMemo(() => {
    // a flat paper strip following the cable, lifted a hair off the floor
    const N = 1600;
    const half = 0.24;
    const pos = new Float32Array((N + 1) * 2 * 3);
    const uv = new Float32Array((N + 1) * 2 * 2);
    const idx: number[] = [];
    const p = new Vector3();
    const t = new Vector3();
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      cable.getPointAt(u, p);
      cable.getTangentAt(u, t);
      const nx = -t.z;
      const nz = t.x;
      const l = Math.hypot(nx, nz) || 1;
      pos.set([p.x + (nx / l) * half, 0.03, p.z + (nz / l) * half, p.x - (nx / l) * half, 0.03, p.z - (nz / l) * half], i * 6);
      uv.set([p.x / paper.grainTileUnits, p.z / paper.grainTileUnits, (p.x + 0.5) / paper.grainTileUnits, p.z / paper.grainTileUnits], i * 4);
      if (i < N) {
        const a = i * 2;
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("uv", new BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    // the strip faces up whichever way it was wound
    const n = g.getAttribute("normal") as BufferAttribute;
    for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
    paint(g, "sunflower", relightOrder);
    return g;
  }, []);

  // each room's shell, so the view never escapes past the wings and every room has its own colour
  const shell = useMemo(() => {
    const parts: BufferGeometry[] = [];
    rooms.forEach((room, i) => {
      const [z0, z1] = band(i);
      for (const x of [-40, 40]) {
        parts.push(sideCard(x, 0, 64, z0, z1, room.wall));
        // a skirting board in the room's deep stock, standing just proud of the wall
        parts.push(sideCard(x < 0 ? x + 0.2 : x - 0.2, 0, 3.2, z0, z1, room.ceiling));
      }
      const len = z0 - z1;
      const ceil = new PlaneGeometry(80, len, 1, 4);
      ceil.rotateX(Math.PI / 2);
      ceil.translate(0, 60.5, (z0 + z1) / 2);
      grainUV(ceil, 80, len);
      paint(ceil, room.ceiling, relightOrder);
      parts.push(ceil);
    });
    const merged = mergeGeometries(parts.map((p) => p.toNonIndexed()), false);
    parts.forEach((p) => p.dispose());
    return merged;
  }, []);

  const mat = paperMaterial();
  return (
    <group>
      <mesh geometry={floor} material={mat} receiveShadow matrixAutoUpdate={false} />
      <mesh geometry={strip} material={mat} receiveShadow matrixAutoUpdate={false} renderOrder={1} />
      {shell && <mesh geometry={shell} material={mat} receiveShadow matrixAutoUpdate={false} />}
      {/* the sky beyond the window at the end of the route */}
      <mesh position={[0, 30, box.windowWallZ - 30]} material={mat}>
        <planeGeometry args={[400, 200]} onUpdate={(g) => paint(g, "sky", 0)} />
      </mesh>
    </group>
  );
}
