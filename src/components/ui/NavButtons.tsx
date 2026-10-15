"use client";

import { copy } from "@/content/site";
import styles from "./NavButtons.module.css";

type Props = { onPrev(): void; onNext(): void; atStart: boolean; atEnd: boolean; vertical?: boolean };

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <path d="M4 10h9V5l8 7-8 7v-5H4z" />
    </svg>
  );
}

/** Two round paper buttons, fixed bottom-left and bottom-right. Disabled at the ends via aria-disabled (stays focusable). */
export function NavButtons({ onPrev, onNext, atStart, atEnd, vertical = false }: Props) {
  return (
    <div className={styles.wrap} data-vertical={vertical || undefined}>
      <button
        type="button"
        className={`${styles.btn} ${styles.prev}`}
        aria-label={copy.prev}
        aria-disabled={atStart}
        onClick={() => !atStart && onPrev()}
      >
        <Arrow />
      </button>
      <button
        type="button"
        className={`${styles.btn} ${styles.next}`}
        data-pulse={atStart || undefined}
        aria-label={copy.next}
        aria-disabled={atEnd}
        onClick={() => !atEnd && onNext()}
      >
        <Arrow />
      </button>
    </div>
  );
}

export default NavButtons;
