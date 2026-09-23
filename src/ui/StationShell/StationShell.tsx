import type { ReactNode } from "react";
import { stations } from "@/sections/stations";
import styles from "./StationShell.module.css";

/**
 * One <section> per station (design.md §3): 160svh tall, the plate sticky in the right column
 * (bottom card on phones). `flow` lets long content (the Wall) scroll with the page instead.
 */
export function StationShell({
  index,
  labelledBy,
  flow = false,
  children,
}: {
  index: number;
  labelledBy: string;
  flow?: boolean;
  children: ReactNode;
}) {
  const station = stations[index]!;
  return (
    <section
      id={station.slug}
      aria-labelledby={labelledBy}
      data-station={index}
      className={styles.station}
      data-flow={flow || undefined}
    >
      <div className={styles.sticky}>
        <div className={styles.column}>{children}</div>
      </div>
    </section>
  );
}
