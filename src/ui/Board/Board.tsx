import type { CSSProperties, ReactNode } from "react";
import styles from "./Board.module.css";

/** Put on each piece of a `flat` board: on phones it becomes its own card pegged to the line. */
export const boardItem = styles.item;

/**
 * Pinned boards on two strings (decisions.md): the practical rooms (experience & skills, contact)
 * don't get the scattered tags, they get even boards in a row, tops level, the scene showing
 * between them. Lowered in and hauled up like the other cards, without the swing. On phones a
 * `flat` board comes apart into its pieces (`boardItem`), one per card on the clothesline.
 */
export function BoardRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}

export function Board({
  i = 0,
  size = "col",
  flat = false,
  children,
}: {
  i?: number;
  /** col: one of a BoardRow; narrow: hangs on its own at the right */
  size?: "col" | "narrow";
  flat?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`${styles.board} ${styles[size]} ${flat ? styles.flat : ""}`} style={{ "--i": i } as CSSProperties}>
      <span className={`${styles.string} ${styles.left}`} aria-hidden />
      <span className={`${styles.string} ${styles.right}`} aria-hidden />
      <div className={styles.parallax}>
        <div className="cast">
          <div className={`${styles.sheet} paper grain`}>
            <span className={styles.tab} aria-hidden />
            <span className={`${styles.pin} ${styles.pinL}`} aria-hidden />
            <span className={`${styles.pin} ${styles.pinR}`} aria-hidden />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
