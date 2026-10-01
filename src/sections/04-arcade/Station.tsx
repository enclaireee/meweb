"use client";

import { StationGroup, type StationProps } from "@/scene/paper/StationGroup";

/** The arcade corner: the brainwave card and the pixel heart sway; the screen glows at night. */
export default function Station(props: StationProps) {
  return <StationGroup {...props} />;
}
