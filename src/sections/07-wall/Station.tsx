"use client";

import { StationGroup, type StationProps } from "@/scene/paper/StationGroup";

/** The wall: the lantern sways. */
export default function Station(props: StationProps) {
  return <StationGroup {...props} />;
}
