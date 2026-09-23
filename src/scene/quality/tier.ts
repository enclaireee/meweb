import type { Tier } from "@/scene/store";

/**
 * The first guess at a quality tier (architecture.md §6.10), before a single frame is measured.
 * `none` means the 3D chunk is never downloaded: poster + HTML only.
 */
export function initialTier(): Tier {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return "none";
  if (matchMedia("(prefers-reduced-data: reduce)").matches) return "none";
  try {
    const c = document.createElement("canvas");
    if (!c.getContext("webgl2")) return "none";
  } catch {
    return "none";
  }
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) return "low";
  if (navigator.hardwareConcurrency <= 4) return "mid";
  return "high";
}

/** Tiers only ever step down within a session (no oscillation). */
export const stepDown = (t: Tier): Tier => (t === "high" ? "mid" : t === "mid" ? "low" : "none");

export const dprFor = (t: Tier): [number, number] | number => (t === "high" ? [1, 1.75] : t === "mid" ? [1, 1.25] : 1);

/** how many stations either side stay visible */
export const reachFor = (t: Tier) => (t === "high" ? 3 : t === "mid" ? 2 : 1);
