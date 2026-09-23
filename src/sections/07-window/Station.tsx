"use client";

import { StationGroup, type StationProps } from "@/scene/paper/StationGroup";

/** The window: the moon sways beyond the glass; the city lights come on at night. */
export default function Station(props: StationProps) {
  return <StationGroup {...props} />;
}
