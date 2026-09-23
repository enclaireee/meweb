"use client";

import { StationGroup, type StationProps } from "@/scene/paper/StationGroup";

/** The desk: every sheet but the arch pops up on its hinge in the entrance. */
export default function Station(props: StationProps) {
  return <StationGroup {...props} />;
}
