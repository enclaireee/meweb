"use client";

import type { Mesh } from "three";
import { StationGroup, type StationProps, type SheetAnim } from "@/scene/paper/StationGroup";
import { activity } from "@/scene/worker/Worker";

/** The needle never quite rests: a slow drift in the pressure with a little flutter on top. */
const needle: SheetAnim = (mesh: Mesh, t: number) => {
  mesh.rotation.z = -0.55 + 0.28 * Math.sin(t * 0.45) + 0.04 * Math.sin(t * 5.1) * Math.sin(t * 0.9);
  return false;
};

/** A slow drift on its own; when the worker cranks it, it really turns (full rate while he does). */
let spun = 0;
const valve: SheetAnim = (mesh: Mesh, t: number, dt: number) => {
  if (activity.valve) spun += dt * 2.4;
  mesh.rotation.z = 0.6 * Math.sin(t * 0.18) + spun;
  return activity.valve;
};

/** The control room: gauge and valve turn on their pins (design.md §9). */
export default function Station(props: StationProps) {
  return <StationGroup {...props} animate={{ "gauge-needle": needle, "valve-wheel": valve }} />;
}
