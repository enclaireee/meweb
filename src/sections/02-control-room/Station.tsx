"use client";

import type { Mesh } from "three";
import { StationGroup, type StationProps, type SheetAnim } from "@/scene/paper/StationGroup";

/** The needle never quite rests: a slow drift in the pressure with a little flutter on top. */
const needle: SheetAnim = (mesh: Mesh, t: number) => {
  mesh.rotation.z = -0.55 + 0.28 * Math.sin(t * 0.45) + 0.04 * Math.sin(t * 5.1) * Math.sin(t * 0.9);
  return false;
};

/** Someone keeps nudging the valve: a quarter turn and back, very slowly. */
const valve: SheetAnim = (mesh: Mesh, t: number) => {
  mesh.rotation.z = 0.6 * Math.sin(t * 0.18);
  return false;
};

/** The control room: gauge and valve turn on their pins (design.md §9). */
export default function Station(props: StationProps) {
  return <StationGroup {...props} animate={{ "gauge-needle": needle, "valve-wheel": valve }} />;
}
