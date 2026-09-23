"use client";

import { StationGroup, type StationProps } from "@/scene/paper/StationGroup";

/** The drafting table: the symbols sway on their strings. */
export default function Station(props: StationProps) {
  return <StationGroup {...props} />;
}
