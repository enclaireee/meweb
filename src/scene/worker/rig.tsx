"use client";

import { useMemo, type ReactNode, type RefObject } from "react";
import type { BufferGeometry, Group } from "three";
import { sheet as sheetTok } from "@/design/tokens";
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

/** All mounts share one plane behind the whole figure, so they outline him instead of covering parts. */
const MOUNT_Z = Math.min(...art.sheets.map((s) => s.z)) - sheetTok.thickness - 0.08;

type Part = { sheet: CutSheet; geometry: BufferGeometry; backing?: BufferGeometry; offset: [number, number, number] };

function buildParts(): Part[] {
  const byId = new Map(art.sheets.map((s) => [s.id, s]));
  return art.sheets.map((s) => {
    const pivot = s.pivot ?? [0, 0];
    const parent = s.parent ? byId.get(s.parent) : undefined;
    const pp = parent?.pivot ?? [0, 0];
    const geometry = sheetGeometry(s, 0, pivot);
    // ink on ink shows nothing: only paper and accent parts need their mount (fewer draw calls)
    const backing = s.backing?.length && s.stock !== "ink" && s.stock !== "glow"
      ? sheetGeometry({ ...s, id: s.id + "-mount", stock: "ink", z: MOUNT_Z, pieces: s.backing }, 0, pivot)
      : undefined;
    // a child's group sits at its pin, in its parent's pin space
    const offset: [number, number, number] = parent ? [pivot[0] - pp[0], pivot[1] - pp[1], 0] : [pivot[0], pivot[1], 0];
    return { sheet: s, geometry, backing, offset };
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
          <mesh geometry={p.geometry} material={p.sheet.stock === "glow" ? glowMaterial() : mat} castShadow={!NO_SHADOW.has(p.sheet.id)} />
          {p.backing && <mesh geometry={p.backing} material={mat} />}
          {render(p.sheet.id)}
        </group>
      ));
  return <>{render(undefined)}</>;
}

/** Pose → joints. `extra` carries the idle business: a look up, the clipboard, the hat tip. */
export function applyPose(j: Joints, p: Pose, extra = { head: 0, clip: 0, hat: 0 }) {
  const set = (id: string, rz: number) => {
    const part = j.get(id);
    if (part) part.rotation.z = rz;
  };
  const torso = j.get("torso");
  if (torso) {
    torso.position.y = p.hipY;
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
