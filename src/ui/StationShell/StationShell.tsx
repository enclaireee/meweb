import type { ReactNode } from "react";
import { stations } from "@/sections/stations";
import styles from "./StationShell.module.css";

/**
 * One <section> per station (design.md §3): it gives the scroll its length and the anchor its target.
 * Its cards live in a layer fixed over the scene: only the active room's cards are lowered in
 * (ui/Hang). Without JS the layer is just the section's content, in order.
 */
export function StationShell({ index, labelledBy, children }: { index: number; labelledBy: string; children: ReactNode }) {
  const station = stations[index]!;
  return (
    <section id={station.slug} aria-labelledby={labelledBy} data-station={index} className={styles.station}>
      <div className={styles.layer}>
        {children}
        {/* phones: tells you the line goes on to the right; fades once you swipe */}
        <span className={styles.swipe} aria-hidden>
          swipe <span className={styles.nudge}>→</span>
        </span>
      </div>
    </section>
  );
}
