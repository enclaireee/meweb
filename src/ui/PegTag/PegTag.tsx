import styles from "./PegTag.module.css";

/** One skill, hung on a pegboard hook (design.md §6). */
export function PegTag({ children, tilt }: { children: string; tilt: number }) {
  return (
    <li className={`cast ${styles.peg}`} style={{ rotate: `${tilt}deg` }}>
      <span className={styles.hook} aria-hidden />
      <span className={`${styles.face} paper grain`}>{children}</span>
    </li>
  );
}
