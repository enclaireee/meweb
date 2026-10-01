"use client";

import { StationGroup, type StationProps } from "@/scene/paper/StationGroup";

/** The study: books, blueprints, and reading desk. */
export default function Station(props: StationProps) {
  return <StationGroup {...props} />;
}
