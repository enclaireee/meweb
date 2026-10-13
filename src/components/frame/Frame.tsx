import type { ReactNode } from "react";
import styles from "./Frame.module.css";

/** Small kawung motif: four ovals around a centre. Decorative. */
function Kawung({ className }: { className?: string }) {
  return (
    <svg className={`${styles.corner} ${className}`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M0 0h40v8H8v32H0z" className={styles.bracket} />
      <g className={styles.motif}>
        <ellipse cx="20" cy="13" rx="3.5" ry="7" />
        <ellipse cx="20" cy="27" rx="3.5" ry="7" />
        <ellipse cx="13" cy="20" rx="7" ry="3.5" />
        <ellipse cx="27" cy="20" rx="7" ry="3.5" />
      </g>
    </svg>
  );
}

export function Frame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.frame}>
      <div className={styles.opening}>
        {children}
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.depth} aria-hidden="true" />
      </div>
      <div className={`${styles.ring} ${styles.r1}`} aria-hidden="true" />
      <div className={`${styles.ring} ${styles.r2}`} aria-hidden="true" />
      <div className={`${styles.ring} ${styles.r3}`} aria-hidden="true" />
      <div className={`${styles.ring} ${styles.r4}`} aria-hidden="true" />
      <Kawung className={styles.tl} />
      <Kawung className={styles.tr} />
      <Kawung className={styles.bl} />
      <Kawung className={styles.br} />
    </div>
  );
}

export default Frame;
