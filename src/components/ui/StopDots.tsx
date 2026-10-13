"use client";

import { copy, stops } from "@/content/site";
import styles from "./StopDots.module.css";

type Props = { current: number; visited: Set<number> | number[]; onJump(i: number): void };

export function StopDots({ current, visited, onJump }: Props) {
  const seen = (i: number) => (visited instanceof Set ? visited.has(i) : visited.includes(i));
  return (
    <nav className={styles.nav} aria-label={copy.dotsLabel}>
      <ul className={styles.list}>
        {stops.map((s) => (
          <li key={s.i}>
            <button
              type="button"
              className={styles.hit}
              aria-label={s.place}
              aria-current={s.i === current ? "step" : undefined}
              data-visited={seen(s.i) || undefined}
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
