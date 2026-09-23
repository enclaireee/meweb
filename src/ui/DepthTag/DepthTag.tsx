"use client";

import { stations, stationNumber, LAST_STATION } from "@/sections/stations";
import { useScene } from "@/scene/store";
import styles from "./DepthTag.module.css";

/**
 * The depth tag: navigation as a hung paper tag (design.md §6). Plain anchors, so it works
 * without JS; <details> collapses it below 1024px with no script needed.
 */
export function DepthTag() {
  const current = useScene((s) => s.station);

  const list = () => (
    <ol className={styles.list}>
      {stations.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.slug}`}
            className={styles.link}
            aria-current={i === current ? "step" : undefined}
          >
            <span className={styles.punch} aria-hidden />
            <span className="tabular-nums">{stationNumber(i)}</span> {s.label}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <nav aria-label="Stations" className={`cast ${styles.nav}`}>
      <div className={`${styles.tag} paper grain`}>
        <div className={styles.wide}>
          <p className="text-kicker uppercase text-ink-soft">Depth</p>
          {list()}
        </div>
        <details
          className={styles.narrow}
          // picking a station closes the list (event delegation: no ref needed)
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) e.currentTarget.open = false;
          }}
        >
          <summary className={styles.summary}>
            <span className="visually-hidden">Station </span>
            <span className="tabular-nums">
              {stationNumber(current)} / {stationNumber(LAST_STATION)}
            </span>
          </summary>
          {list()}
        </details>
      </div>
    </nav>
  );
}
