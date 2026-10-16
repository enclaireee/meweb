"use client";

import { useEffect, useRef, useState } from "react";
import { copy, person } from "@/content/site";
import styles from "./paper.module.css";

export function CopyEmail() {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(person.email);
      setDone(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDone(false), 2000);
    } catch {
      /* clipboard blocked: the mailto link still works */
    }
  }

  return (
    <>
      <button type="button" className={styles.btn} onClick={onCopy}>
        {copy.copyEmail}
      </button>
      <span className="sr-only" role="status">
        {done ? copy.copied : ""}
      </span>
      {done && <span className={styles.note} aria-hidden="true">{copy.copied}</span>}
    </>
  );
}

export default CopyEmail;
