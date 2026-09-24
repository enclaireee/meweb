"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BoxGeometry, type Group, type Mesh } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { box, isGlow, shell } from "@/design/tokens";
import { DEG } from "@/lib/math";
import { seeded } from "@/lib/rng";
import { store, useScene } from "@/scene/store";
import { wake } from "@/scene/loop";
import { shadows } from "@/scene/light/shadows";
import { compileBoth } from "@/scene/light/Lights";
import type { CutFile, CutSheet } from "./cut";
import { glowMaterial, paperMaterial } from "./material";
import { mergeStatic, paint, relightOrder, sheetGeometry } from "./sheet";

/**
 * Per-frame animation for a pivoted sheet: set the mesh rotation. Return true only for motion that
 * must render at full rate; ambient motion returns false and rides the half-rate idle frames.
 */
export type SheetAnim = (mesh: Mesh, t: number, dt: number) => boolean;

export type StationProps = {
  index: number;
  file: CutFile;
  /** registers the root so Stations can toggle visibility without re-rendering */
  onRoot: (index: number, g: Group | null) => void;
};

/** Hinged sheets waiting for the pop-up entrance (station 00), back to front. */
export const hinges: { group: Group; z: number }[] = [];

const CEILING = shell.ceiling;

/**
 * A station built from its cut file (architecture.md §6.2, §6.4): everything static merged into one
 * mesh, glows into another, and only the sheets that move (hung, pivoted, hinged) as their own meshes.
 */
export function StationGroup({ index, file, onRoot, animate = {} }: StationProps & { animate?: Record<string, SheetAnim> }) {
  const stationZ = -box.length * index;
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  // after the pop-up, hinged sheets never move again: merge them back in (one draw call, not twenty).
  // Only a station with hinges listens: the rest must not re-cut themselves when the entrance ends
  const hasHinges = file.sheets.some((s) => !!s.hinge);
  const popped = useScene((s) => hasHinges && s.entranceDone);

  const built = useMemo(() => {
    const hinged = (s: CutSheet) => !!s.hinge && !popped;
    const moving = (s: CutSheet) => !!(s.hang || hinged(s) || (s.pivot && animate[s.id]));
    const statics = file.sheets.filter((s) => !moving(s) && !isGlow(s.stock));
    const glows = file.sheets.filter((s) => isGlow(s.stock));
    return {
      merged: mergeStatic(statics.filter((s) => s.cast), stationZ),
      // the arches frame the stage but don't shadow it (data-cast="false")
      mergedNoCast: mergeStatic(statics.filter((s) => !s.cast), stationZ),
      glow: mergeStatic(glows, stationZ),
      hung: file.sheets.filter((s) => s.hang && !hinged(s)),
      pivots: file.sheets.filter((s) => s.pivot && animate[s.id] && !s.hang && !hinged(s)),
      hinged: file.sheets.filter(hinged),
    };
    // animate is static per station component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, stationZ, popped]);

  // compile once, before this station is ever seen (no hitch mid-journey), for both lights
  useEffect(() => {
    compileBoth(gl, scene, camera);
    shadows.dirty = true;
    wake(300);
  }, [gl, scene, camera, built]);

  // a rebuilt (or unmounted) station frees what it replaced: R3F doesn't dispose geometry passed as a prop
  useEffect(
    () => () => {
      built.merged?.dispose();
      built.mergedNoCast?.dispose();
      built.glow?.dispose();
    },
    [built],
  );

  const mat = paperMaterial();
  return (
    <group ref={(g) => onRoot(index, g)} position={[0, 0, stationZ]} userData={{ station: index }}>
      {built.merged && <mesh geometry={built.merged} material={mat} castShadow receiveShadow />}
      {built.mergedNoCast && <mesh geometry={built.mergedNoCast} material={mat} receiveShadow />}
      {built.glow && <mesh geometry={built.glow} material={glowMaterial()} />}
      {built.hung.map((s) => (
        <Hung key={s.id} sheet={s} stationZ={stationZ} />
      ))}
      {built.pivots.map((s) => (
        <Pivot key={s.id} sheet={s} stationZ={stationZ} anim={animate[s.id]!} />
      ))}
      {built.hinged.map((s) => (
        <Hinged key={s.id} sheet={s} stationZ={stationZ} />
      ))}
    </group>
  );
}

/** A thing on a string: pendulum sway ±2°, 5–7 s, desynced by seed (design.md §7.2). */
function Hung({ sheet, stationZ }: { sheet: CutSheet; stationZ: number }) {
  const [hx, hy] = sheet.hang!;
  const len = CEILING - hy;
  // the thing and its string, one geometry (one draw call per hung object)
  const g = useMemo(() => {
    const thing = sheetGeometry(sheet, stationZ, [hx, hy]);
    const string = new BoxGeometry(0.07, len, 0.07).toNonIndexed();
    string.translate(0, len / 2, sheet.z - 0.1);
    paint(string, "R7", relightOrder(stationZ + sheet.z));
    const both = mergeGeometries([thing, string], false) ?? thing;
    thing.dispose();
    string.dispose();
    return both;
  }, [sheet, stationZ, hx, hy, len]);
  useEffect(() => () => g.dispose(), [g]);
  const { period, phase } = useMemo(() => {
    const r = seeded(sheet.id + ":sway");
    return { period: 5 + 2 * r(), phase: r() * Math.PI * 2 };
  }, [sheet.id]);
  const pivot = useRef<Group>(null);

  useFrame((state) => {
    const { reducedMotion, tier } = store.getState();
    if (!pivot.current || !pivot.current.parent?.visible || reducedMotion || tier === "low") return;
    pivot.current.rotation.z = 2 * DEG * Math.sin((state.clock.elapsedTime * Math.PI * 2) / period + phase);
    shadows.drift = true;
  });

  const mat = paperMaterial();
  return (
    <group ref={pivot} position={[hx, CEILING, 0]}>
      <group position={[0, -len, 0]}>
        <mesh geometry={g} material={mat} castShadow receiveShadow />
      </group>
    </group>
  );
}

function Pivot({ sheet, stationZ, anim }: { sheet: CutSheet; stationZ: number; anim: SheetAnim }) {
  const [px, py] = sheet.pivot!;
  const g = useMemo(() => sheetGeometry(sheet, stationZ, [px, py]), [sheet, stationZ, px, py]);
  useEffect(() => () => g.dispose(), [g]);
  const mesh = useRef<Mesh>(null);
  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m || !m.parent?.visible || store.getState().reducedMotion) return;
    // full-rate motion (the worker cranking the valve) shadows at once; idle drift may lag a little
    if (anim(m, state.clock.elapsedTime, Math.min(delta, 0.1))) {
      wake(100);
      shadows.dirty = true;
    } else shadows.drift = true;
  });
  return <mesh ref={mesh} position={[px, py, 0]} geometry={g} material={paperMaterial()} castShadow receiveShadow />;
}

/** Pop-up: the sheet stands on a hinge along its bottom edge and starts lying flat (design.md §7.2). */
function Hinged({ sheet, stationZ }: { sheet: CutSheet; stationZ: number }) {
  const y0 = sheet.bbox[1];
  const g = useMemo(() => sheetGeometry(sheet, stationZ, [0, y0]), [sheet, stationZ, y0]);
  useEffect(() => () => g.dispose(), [g]);
  const group = useRef<Group>(null);
  useEffect(() => {
    const el = group.current;
    if (!el) return;
    const entry = { group: el, z: sheet.z };
    if (store.getState().sceneLive || store.getState().reducedMotion) el.rotation.x = 0;
    else {
      el.rotation.x = Math.PI / 2;
      hinges.push(entry);
    }
    return () => {
      const i = hinges.indexOf(entry);
      if (i >= 0) hinges.splice(i, 1);
    };
  }, [sheet.z]);
  return (
    <group ref={group} position={[0, y0, sheet.z]}>
      <mesh position={[0, 0, -sheet.z]} geometry={g} material={paperMaterial()} castShadow receiveShadow />
    </group>
  );
}
