"use client";

import type { Stop } from "@/content/site";
import styles from "./StopDots.module.css";

type Props = { items: Stop[]; label: string; current: number; visited: string[]; cascade?: boolean; onJump(i: number): void };

/** One dot per place on the current river: the 3 main stops, or the 5 pools down the cascade (lantern thread). */
export function StopDots({ items, label, current, visited, cascade = false, onJump }: Props) {
  return (
    <nav className={styles.nav} aria-label={label} data-cascade={cascade || undefined}>
      <ul className={styles.list}>
        {items.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={styles.hit}
              aria-label={s.place}
              aria-current={s.i === current ? "step" : undefined}
              data-visited={visited.includes(s.id) || undefined}
              onClick={() => onJump(s.i)}
            >
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.tip} aria-hidden="true">
                {s.place}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default StopDots;
