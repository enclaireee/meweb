"use client";

import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, PlaneGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { box, paper } from "@/design/tokens";
import { paperMaterial } from "./material";
import { paint, relightOrder } from "./sheet";
import { Rooms } from "./Room";

/** world-scale grain on a plane of w × h units */
function grainUV(g: BufferGeometry, w: number, h: number) {
  const uv = g.getAttribute("uv") as BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / paper.grainTileUnits, (uv.getY(i) * h) / paper.grainTileUnits);
}

/** The floor of the whole route: warm wood boards. Room.tsx builds the rest. */
export function Floor() {
  const floor = useMemo(() => {
    const len = 700;
    const g = new PlaneGeometry(120, len, 1, 70);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, 40 - len / 2);
    grainUV(g, 120, len);
    paint(g, "wood", relightOrder);
    // floorboards: seams cut from a darker sheet, running the length of the route
    const seams: BufferGeometry[] = [g.toNonIndexed()];
    for (let x = -32; x <= 32; x += 3.2) {
      const s = new PlaneGeometry(0.14, len, 1, 70);
      s.rotateX(-Math.PI / 2);
      s.translate(x, 0.02, 40 - len / 2);
      grainUV(s, 0.14, len);
      paint(s, "woodDeep", relightOrder);
      seams.push(s.toNonIndexed());
    }
    const merged = mergeGeometries(seams, false) ?? g;
    seams.forEach((p) => p !== merged && p.dispose());
    return merged;
  }, []);

  const mat = paperMaterial();
  return (
    <group>
      <Rooms />
      <mesh geometry={floor} material={mat} receiveShadow matrixAutoUpdate={false} userData={{ recede: true }} />
      {/* the sky beyond the window at the end of the route */}
      {/* from the floor up: below it the sky is never seen, and the phone bake slices it without a floor */}
      <mesh position={[0, 70, box.windowWallZ - 30]} material={mat}>
        <planeGeometry args={[400, 140]} onUpdate={(g) => paint(g, "sky", 0)} />
      </mesh>
    </group>
  );
}
