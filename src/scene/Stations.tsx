"use client";

import { useCallback, useRef, useState, type ComponentType } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { stationArt } from "./art";
import type { CutFile } from "./paper/cut";
import type { StationProps } from "./paper/StationGroup";
import { view } from "./camera/rig";
import { advanceLoading, store } from "./store";
import { reachFor } from "./quality/tier";
import { wake } from "./loop";
import Desk from "@/sections/00-desk/Station";
import Storeroom from "@/sections/01-storeroom/Station";
import ControlRoom from "@/sections/02-control-room/Station";
import Arcade from "@/sections/03-arcade/Station";
import Drafting from "@/sections/04-drafting/Station";
import Sill from "@/sections/05-sill/Station";
import Wall from "@/sections/06-wall/Station";
import Window from "@/sections/07-window/Station";

/** Station components in route order. Their art is fetched lazily; the components themselves are tiny. */
export const stationComponents: ComponentType<StationProps>[] = [Desk, Storeroom, ControlRoom, Arcade, Drafting, Sill, Wall, Window];

/**
 * Load a station's art when the camera is within 2 stations; keep it mounted after that, and only
 * toggle `visible` (architecture.md §6.4: mounting mid-journey stutters).
 */
export function Stations({ onFirstStation }: { onFirstStation: () => void }) {
  const [files, setFiles] = useState<(CutFile | null)[]>(() => stationArt.map(() => null));
  const requested = useRef<boolean[]>(stationArt.map(() => false));
  const roots = useRef<(Group | null)[]>([]);
  const first = useRef(false);

  const onRoot = useCallback(
    (i: number, g: Group | null) => {
      roots.current[i] = g;
      if (i === 0 && g && !first.current) {
        first.current = true;
        onFirstStation();
      }
    },
    [onFirstStation],
  );

  const inFlight = useRef(false);

  useFrame(() => {
    const s = view.s;
    // one station at a time, nearest first, and only the desk before the scene is live: building a
    // station is a burst of main-thread work, so they're spread across idle moments. The desk loads
    // first wherever the camera is: the scene goes live on it, so a deep link (#contact) would
    // otherwise wait forever for a desk that's out of range.
    if (!inFlight.current) {
      const live = store.getState().sceneLive;
      let next = -1;
      for (let i = 0; i < stationArt.length; i++) {
        if (requested.current[i] || (live ? Math.abs(i - s) > 2 : i > 0)) continue;
        if (next < 0 || Math.abs(i - s) < Math.abs(next - s)) next = i;
      }
      if (next >= 0) {
        const i = next;
        requested.current[i] = true;
        inFlight.current = true;
        stationArt[i]!().then((f) => {
          if (i === 0) advanceLoading(0.84);
          const commit = () => {
            setFiles((prev) => prev.map((p, j) => (j === i ? f : p)));
            inFlight.current = false;
            wake(300);
          };
          // the camera is heading there now: build immediately; otherwise wait for an idle moment
          if (Math.abs(i - s) < 1.5 || !window.requestIdleCallback) commit();
          else window.requestIdleCallback(commit, { timeout: 1500 });
        });
      }
    }
    const reach = reachFor(store.getState().tier);
    roots.current.forEach((g, i) => {
      if (g) g.visible = Math.abs(i - s) <= reach;
    });
  });

  return (
    <>
      {files.map((f, i) => {
        const C = stationComponents[i];
        return f && C ? <C key={i} index={i} file={f} onRoot={onRoot} /> : null;
      })}
    </>
  );
}
