"use client";

import { useSyncExternalStore } from "react";
import { copy } from "@/content/site";
import styles from "./Footer.module.css";

const subscribe = (cb: () => void) => {
  window.addEventListener("timechange", cb);
  return () => window.removeEventListener("timechange", cb);
};
const snapshot = () => document.documentElement.dataset.time === "day";

/** Day/night switch: html[data-time], kept in localStorage "time" and restored before paint (layout.tsx). */
export function DayToggle() {
  const day = useSyncExternalStore(subscribe, snapshot, () => false);

  function toggle() {
    const next = day ? "night" : "day";
    document.documentElement.dataset.time = next;
    try {
      localStorage.setItem("time", next);
    } catch {
      /* storage blocked: applies for this visit only */
    }
    window.dispatchEvent(new Event("timechange"));
  }

  return (
    <button type="button" role="switch" aria-checked={day} aria-label={copy.dayMode} className={styles.toggle} onClick={toggle}>
      <svg className={styles.moon} viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
        <path d="M13.5 3.2A7 7 0 1 0 16.8 14 6 6 0 0 1 13.5 3.2Z" fill="currentColor" />
      </svg>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
      <svg className={styles.sun} viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
        <circle cx="10" cy="10" r="3.6" fill="currentColor" />
        <path d="M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3M4 4l2 2M14 14l2 2M4 16l2-2M14 6l2-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export default DayToggle;
