/**
 * The route: the only place station order is declared (architecture.md §1).
 * `slug` is the anchor (#slug), `label` goes on the depth tag.
 */
export const stations = [
  { id: "desk", slug: "about", label: "Desk" },
  { id: "storeroom", slug: "demandx", label: "Storeroom", project: "demandx" },
  { id: "control-room", slug: "ot-observability-lab", label: "Control Room", project: "ot-lab" },
  { id: "arcade", slug: "refocus", label: "Arcade Corner", project: "refocus" },
  { id: "drafting", slug: "komat-unpar", label: "Drafting Table", project: "komat" },
  { id: "sill", slug: "solar-lighting", label: "Sill", project: "solar" },
  { id: "wall", slug: "experience", label: "Wall" },
  { id: "window", slug: "contact", label: "Window" },
] as const;

export type StationId = (typeof stations)[number]["id"];

export const LAST_STATION = stations.length - 1;

/** "03" */
export const stationNumber = (i: number) => String(i).padStart(2, "0");
