import type { CutFile } from "./paper/cut";

/**
 * Lazy art per station, in route order (sections/stations.ts). Each is its own chunk, fetched as the
 * camera approaches (architecture.md §2.3, §6.4).
 */
const load = (p: Promise<{ default: unknown }>) => p.then((m) => m.default as CutFile);

export const stationArt: (() => Promise<CutFile>)[] = [
  () => load(import("@/sections/00-desk/art/desk.cut.json")),
  () => load(import("@/sections/01-study/art/study.cut.json")),
  () => load(import("@/sections/02-storeroom/art/storeroom.cut.json")),
  () => load(import("@/sections/03-control-room/art/control-room.cut.json")),
  () => load(import("@/sections/04-arcade/art/arcade.cut.json")),
  () => load(import("@/sections/05-drafting/art/drafting.cut.json")),
  () => load(import("@/sections/06-sill/art/sill.cut.json")),
  () => load(import("@/sections/07-wall/art/wall.cut.json")),
  () => load(import("@/sections/08-window/art/window.cut.json")),
];

/** Non-station art shown on /dev/art (the worker). */
export const extraArt: { label: string; load: () => Promise<CutFile> }[] = [
  { label: "Worker", load: () => load(import("./worker/art/worker.cut.json")) },
];
