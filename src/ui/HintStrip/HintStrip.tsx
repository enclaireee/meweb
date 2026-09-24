"use client";

import { useEffect, useState } from "react";
import styles from "./HintStrip.module.css";

/**
 * "Move to aim the lamp. Scroll to walk in." Only shown once the scene is live (CSS), and it
 * leaves for good after the first interaction (design.md §6).
 */
export function HintStrip() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    let armed = false;
    const leave = () => {
      if (!armed) return;
      setGone(true);
      off();
    };
    // any scroll counts, however it came (scrollbar, keys, a nav link): design.md §6 "first pointer
    // move or scroll"
    const events = ["pointermove", "wheel", "touchstart", "keydown", "scroll"] as const;
    const off = () => events.forEach((e) => removeEventListener(e, leave));
    // only count interactions after the hint could have been seen
    const mo = new MutationObserver(() => {
      if (html.dataset.scene === "live") {
        mo.disconnect();
        setTimeout(() => (armed = true), 1200);
      }
    });
    mo.observe(html, { attributes: true, attributeFilter: ["data-scene"] });
    events.forEach((e) => addEventListener(e, leave, { passive: true }));
    return () => {
      mo.disconnect();
      off();
    };
  }, []);

  return (
    <p className={`cast ${styles.hint}`} data-gone={gone || undefined} aria-hidden>
      <span className={`${styles.strip} paper grain text-caption italic`}>Move to aim the lamp. Scroll to walk in.</span>
    </p>
  );
}
