import type { ReactNode } from "react";
import styles from "./Frame.module.css";

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
    </div>
  );
}

export default Frame;
