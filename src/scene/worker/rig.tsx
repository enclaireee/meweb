"use client";

import { useMemo, type ReactNode, type RefObject } from "react";
import type { BufferGeometry, Group } from "three";
import { isGlow, sheet as sheetTok } from "@/design/tokens";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glowMaterial, paperMaterial } from "@/scene/paper/material";
import { sheetGeometry } from "@/scene/paper/sheet";
import type { CutFile, CutSheet } from "@/scene/paper/cut";
import artJson from "./art/worker.cut.json";
import type { Pose } from "./walk";

/**
 * The split-pin rig (architecture.md §8): one group per part at its pin, parented as authored. Joints
 * only turn about z, the paper plane.
 */
const art = artJson as unknown as CutFile;

type Part = { sheet: CutSheet; geometry: BufferGeometry; offset: [number, number, number] };

/**
 * Each part carries its own ink mount, seated *inside* the part's thickness: from the front the part's
 * face covers it, from behind its back face does, and only the outline shows either way. So he's in
 * colour on both sides when he turns about. Mount and part share one geometry: one draw call.
 */
function buildParts(): Part[] {
  const byId = new Map(art.sheets.map((s) => [s.id, s]));
  return art.sheets.map((s) => {
    const pivot = s.pivot ?? [0, 0];
    const parent = s.parent ? byId.get(s.parent) : undefined;
    const pp = parent?.pivot ?? [0, 0];
    let geometry = sheetGeometry(s, 0, pivot);
    if (s.backing?.length && !isGlow(s.stock)) {
      const t = sheetTok.thickness;
      const mount = sheetGeometry({ ...s, id: s.id + "-mount", stock: "ink", z: s.z - t / 3, pieces: s.backing }, 0, pivot, t / 3);
      geometry = mergeGeometries([geometry, mount], false) ?? geometry;
    }
    // a child's group sits at its pin, in its parent's pin space
    const offset: [number, number, number] = parent ? [pivot[0] - pp[0], pivot[1] - pp[1], 0] : [pivot[0], pivot[1], 0];
    return { sheet: s, geometry, offset };
  });
}

export type Joints = Map<string, Group>;

/** Too small, or tucked behind other parts, for their shadow to read: skip the shadow pass. */
const NO_SHADOW = new Set(["eye", "headlamp", "clipboard"]);

export function WorkerRig({ joints }: { joints: RefObject<Joints> }) {
  const parts = useMemo(() => buildParts(), []);
  const mat = paperMaterial();
  const render = (id: string | undefined): ReactNode =>
    parts
      .filter((p) => p.sheet.parent === id)
      .map((p) => (
        <group
          key={p.sheet.id}
          position={p.offset}
          ref={(el) => {
            if (el) joints.current.set(p.sheet.id, el);
          }}
        >
          <mesh geometry={p.geometry} material={isGlow(p.sheet.stock) ? glowMaterial() : mat} castShadow={!NO_SHADOW.has(p.sheet.id)} />
          {render(p.sheet.id)}
        </group>
      ));
  return <>{render(undefined)}</>;
}

/** Pose → joints. `extra` carries the head, the clipboard and the hat tip on top of the body pose. */
export function applyPose(j: Joints, p: Pose, extra = { head: 0, clip: 0, hat: 0, lift: 0 }) {
  const set = (id: string, rz: number) => {
    const part = j.get(id);
    if (part) part.rotation.z = rz;
  };
  const torso = j.get("torso");
  if (torso) {
    torso.position.y = p.hipY + extra.lift;
    torso.rotation.z = p.lean;
  }
  set("leg-front-thigh", p.hipFront);
  set("leg-back-thigh", p.hipBack);
  set("leg-front-shin", p.kneeFront);
  set("leg-back-shin", p.kneeBack);
  set("arm-front-upper", p.armFront + extra.clip);
  set("arm-back-upper", p.armBack);
  set("arm-front-lower", p.elbowFront + extra.clip * 0.8);
  set("arm-back-lower", p.elbowBack);
  set("head", extra.head);
  set("hat", extra.hat);
}
