import styles from "./Ribbon.module.css";

/** Award rosette: two stacked discs and two tails, all flat paper (design.md §6). */
export function Ribbon({ label, small = false }: { label: string; small?: boolean }) {
  return (
    <span className={styles.ribbon} data-small={small || undefined} role="img" aria-label={`Award: ${label}`}>
      <svg viewBox="0 0 40 56" aria-hidden>
        <path className={styles.tail} d="M13.2 24 L7.6 53.4 L13.9 49.2 L18.3 55.1 L21.4 26.2 Z" />
        <path className={styles.tail} d="M26.9 24.3 L32.1 53.9 L26.2 49.6 L21.6 55.3 L18.9 26.4 Z" />
        <path
          className={styles.outer}
          d="M20 1.2 L23.1 4.6 L27.5 3.3 L28.9 7.7 L33.4 8.4 L33 13 L36.9 15.6 L34.9 19.7 L37.2 23.8 L33.2 26 L33.3 30.6 L28.8 31.1 L27.2 35.4 L22.9 33.9 L19.8 37.2 L16.8 33.8 L12.4 35.1 L11 30.7 L6.6 30.1 L6.9 25.5 L3 22.9 L5.1 18.8 L2.9 14.7 L6.9 12.5 L6.8 7.9 L11.3 7.4 L12.8 3.1 L17.1 4.5 Z"
        />
        <path className={styles.inner} d="M20.1 9.6 C26 9.4 30.2 13.6 30.1 19.3 C30 25 25.8 28.9 20 29 C14.3 29 10 25 10 19.4 C10.1 13.7 14.3 9.7 20.1 9.6 Z" />
      </svg>
    </span>
  );
}
