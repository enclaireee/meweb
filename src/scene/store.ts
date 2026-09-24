import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import type { LightMode } from "@/design/tokens";

export type Tier = "high" | "mid" | "low" | "none";

type State = {
  /** Station whose section crosses the viewport centre (HTML truth, from IntersectionObserver). */
  station: number;
  light: LightMode;
  tier: Tier;
  reducedMotion: boolean;
  /** The canvas has drawn its first frame. */
  sceneLive: boolean;
  /** The pop-up entrance has finished: the desk can merge back into one mesh. */
  entranceDone: boolean;
  /** Loading screen: how far along (0..1, stages only ever move it forward). */
  progress: number;
  /** The curtain has started to part: the entrance may play. */
  curtainOpen: boolean;
};

/**
 * Slow state (architecture.md §6.8): changes rarely, safe to render from.
 * Server snapshot is always the defaults; ClientBoot syncs from the DOM after hydration.
 */
export const store = createStore<State>(() => ({
  station: 0,
  light: "night",
  tier: "high",
  reducedMotion: false,
  sceneLive: false,
  entranceDone: false,
  progress: 0,
  curtainOpen: false,
}));

/** Loading stages only move the bar forward. */
export const advanceLoading = (p: number) => store.setState((s) => (p > s.progress ? { progress: p } : s));

export const useScene = <T,>(select: (s: State) => T) => useStore(store, select);

/**
 * Fast values: written every event/frame, read transiently in the loop. Never rendered from.
 */
export const fast = {
  /** Pointer, −1..1 (x right, y up). */
  pointerX: 0,
  pointerY: 0,
  pointerMoved: false,
  /** Continuous station coordinate from scroll: 0 = desk rest, 7 = window rest. */
  s: 0,
  /** Horizontal touch-drag tilt, −1..1. */
  dragX: 0,
  /** Device tilt, −1..1 (only when enabled). */
  tiltX: 0,
  tiltY: 0,
};

const LIGHT_KEY = "nw-light";

export function setLight(light: LightMode) {
  document.documentElement.dataset.light = light;
  try {
    localStorage.setItem(LIGHT_KEY, light);
  } catch {
    /* private mode: the choice just isn't remembered */
  }
  store.setState({ light });
}

/** Inline, pre-paint theme boot (architecture.md §4). Kept as a string so it runs before hydration. */
export const lightBootScript = `(function(){try{var l=localStorage.getItem("${LIGHT_KEY}");if(l!=="night"&&l!=="morning"){l=matchMedia("(prefers-color-scheme: light)").matches?"morning":"night"}document.documentElement.dataset.light=l}catch(e){document.documentElement.dataset.light="night"}document.documentElement.dataset.js=""})()`;
