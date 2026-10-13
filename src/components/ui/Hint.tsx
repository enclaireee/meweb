"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { copy } from "@/content/site";
import styles from "./Hint.module.css";

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const coarse = () => window.matchMedia("(pointer: coarse)").matches;

/**
 * First-visit chit. Appears after 2.5 s, hides after 8 s or once `stepped`.
 * Parent positions it via --hint-x / --hint-y (defaults: centre, 62% down).
 */
export function Hint({ stepped = false }: { stepped?: boolean }) {
  const [shown, setShown] = useState(false);
  const touch = useSyncExternalStore(subscribe, coarse, () => false);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem("seen-hint") !== null;
    } catch {
      /* blocked: show every visit */
    }
    if (seen) return;
    const on = setTimeout(() => {
      setShown(true);
      try {
        localStorage.setItem("seen-hint", "1");
      } catch {
        /* ignore */
      }
    }, 2500);
    const off = setTimeout(() => setShown(false), 10500);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, []);

  const visible = shown && !stepped;
  return (
    <div className={styles.hint} data-visible={visible || undefined} role="status">
      {visible ? (touch ? copy.hintTouch : copy.hintPointer) : null}
    </div>
  );
}

export default Hint;
