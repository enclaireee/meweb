"use client";

import { StationGroup, type StationProps } from "@/scene/paper/StationGroup";

/** The sill: the mobile sways; the OLED and the LED glow at night. */
export default function Station(props: StationProps) {
  return <StationGroup {...props} />;
}
