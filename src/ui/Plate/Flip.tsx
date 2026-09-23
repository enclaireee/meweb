"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useHydrated } from "@/lib/useHydrated";
import styles from "./Plate.module.css";

/**
 * A plate that turns over (design.md §6). Both faces are always in the DOM. Without JS they
 * stack (both readable); with JS they share one footprint and the hidden face is inert.
 */
export function Flip({ front, back, title }: { front: ReactNode; back: ReactNode; title: string }) {
  const [turned, setTurned] = useState(false);
  const hydrated = useHydrated();
  const backId = useId();
  const frontBtn = useRef<HTMLButtonElement>(null);
  const backBtn = useRef<HTMLButtonElement>(null);
  const userTurned = useRef(false);

  // Focus follows the plate: the face you were on just became inert.
  useEffect(() => {
    if (!userTurned.current) return;
    (turned ? backBtn : frontBtn).current?.focus({ preventScroll: true });
  }, [turned]);

  const turn = (next: boolean) => {
    userTurned.current = true;
    setTurned(next);
  };

  return (
    <div className={styles.flip} data-turned={turned || undefined}>
      <div className={styles.card}>
        <div className={`${styles.face} paper grain`} inert={hydrated && turned}>
          {front}
          <button
            ref={frontBtn}
            type="button"
            className={styles.turn}
            aria-expanded={turned}
            aria-controls={backId}
            aria-label={`Turn over: ${title}, full notes`}
            onClick={() => turn(true)}
          >
            Turn over
          </button>
        </div>
        <span className={styles.edge} aria-hidden />
        <div id={backId} className={`${styles.face} ${styles.back} paper grain`} inert={hydrated && !turned}>
          {back}
          <button
            ref={backBtn}
            type="button"
            className={styles.turn}
            aria-expanded={turned}
            aria-label={`Turn back: ${title}`}
            onClick={() => turn(false)}
          >
            Turn back
          </button>
        </div>
      </div>
    </div>
  );
}
