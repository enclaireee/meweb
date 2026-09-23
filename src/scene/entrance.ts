/**
 * The pop-up entrance (design.md §7.2, portfolio_concept.md §7): the poster cross-fades out, the
 * desk's sheets hinge up from flat back to front, the lamp flickers on, the worker walks in.
 * Return visits get the short version; reduced motion gets none.
 */
import gsap from "gsap";
import { motion } from "@/design/tokens";
import { hinges } from "./paper/StationGroup";
import { lightState } from "./light/Lights";
import { shadows } from "./light/shadows";
import { wake } from "./loop";
import { store } from "./store";

const SEEN_KEY = "nw-seen";

/** Hooks that join the end of the entrance (the worker's walk-in registers here). */
export const afterEntrance: ((opts: { returning: boolean }) => void)[] = [];

export function runEntrance() {
  const html = document.documentElement;
  const { reducedMotion } = store.getState();
  let returning = false;
  try {
    returning = sessionStorage.getItem(SEEN_KEY) === "1" || localStorage.getItem(SEEN_KEY) === "1";
    localStorage.setItem(SEEN_KEY, "1");
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage blocked: every visit is a first visit */
  }

  html.dataset.scene = "live";
  store.setState({ sceneLive: true });

  const sheets = [...hinges].sort((a, b) => a.z - b.z);
  hinges.length = 0;
  if (reducedMotion) {
    sheets.forEach((h) => (h.group.rotation.x = 0));
    lightState.lampScale = 1;
    afterEntrance.forEach((f) => f({ returning: true }));
    store.setState({ entranceDone: true });
    wake(300);
    return;
  }

  const e = motion.entrance;
  const scale = returning ? e.returnTotal / e.total : 1;
  const tl = gsap.timeline({ onUpdate: () => ((shadows.dirty = true), wake(100)) });
  tl.to({}, { duration: e.fade * scale }); // the poster's 300 ms cross-fade (CSS)
  sheets.forEach((h, i) => {
    tl.to(h.group.rotation, { x: 0, duration: e.sheet * scale, ease: "expo.out" }, e.fade * scale + i * e.stagger * scale);
  });
  if (returning) tl.to(lightState, { lampScale: 1, duration: 0.3 });
  else {
    // two quick dips as the lamp catches (250 ms)
    tl.to(lightState, { lampScale: 0.25, duration: 0.05, ease: "none" })
      .to(lightState, { lampScale: 1, duration: 0.07 })
      .to(lightState, { lampScale: 0.4, duration: 0.05 })
      .to(lightState, { lampScale: 1, duration: 0.08 });
  }
  tl.call(() => {
    afterEntrance.forEach((f) => f({ returning }));
    store.setState({ entranceDone: true });
  });
}

/** Before the entrance, the lamp is dark so the flicker has somewhere to start from. */
export function prepareEntrance() {
  if (!store.getState().reducedMotion) lightState.lampScale = 0.6;
}
