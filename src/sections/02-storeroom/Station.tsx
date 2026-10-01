"use client";

import { StationGroup, type StationProps } from "@/scene/paper/StationGroup";

/** The storeroom: static racks, the hoisted crate and the forecast card sway on their strings. */
export default function Station(props: StationProps) {
  return <StationGroup {...props} />;
}
