"use client";

import { setLight, useScene } from "@/scene/store";
import styles from "./RelightDial.module.css";

/**
 * Card-and-split-pin dial (design.md §6): a disc with moon and sun cut-outs turning in a slot.
 * The disc angle comes from <html data-light> in CSS, so it's right from first paint.
 */
export function RelightDial() {
  const light = useScene((s) => s.light);
  const morning = light === "morning";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={morning}
      aria-label="Morning light"
      className={`cast ${styles.dial}`}
      onClick={() => setLight(morning ? "night" : "morning")}
    >
      <span className={styles.slot} aria-hidden>
        <svg className={styles.disc} viewBox="-20 -20 40 40">
          {/* the disc: paper, with the moon (top) and sun (bottom) cut clean through */}
          <path
            fillRule="evenodd"
            d="M0.2 -18.6 C10.5 -18.4 18.7 -10.1 18.5 0.3 C18.3 10.4 10.2 18.7 -0.2 18.5 C-10.4 18.4 -18.6 10.2 -18.5 -0.1 C-18.4 -10.3 -10.2 -18.7 0.2 -18.6 Z M-3.9 -14.8 C-7.5 -13.6 -9.2 -9.7 -7.9 -6.2 C-6.6 -2.8 -2.7 -1.1 0.8 -2.4 C-2.4 -3.4 -4.5 -6.3 -4.4 -9.4 C-4.4 -11.6 -4.2 -13.4 -3.9 -14.8 Z M0.1 5.2 C2.2 5.2 3.8 6.8 3.8 8.9 C3.8 11 2.1 12.6 0 12.6 C-2.1 12.6 -3.7 10.9 -3.7 8.8 C-3.6 6.8 -2 5.2 0.1 5.2 Z M-0.6 1.6 L0.7 1.6 L0.4 3.9 L-0.4 3.9 Z M-0.5 13.9 L0.6 13.9 L0.3 16.1 L-0.4 16.1 Z M-7.8 8.2 L-5.1 8.4 L-5.1 9.3 L-7.8 9.5 Z M5.1 8.3 L7.8 8.2 L7.8 9.5 L5.1 9.4 Z"
          />
          <circle r="1.6" className={styles.pin} />
        </svg>
      </span>
    </button>
  );
}
