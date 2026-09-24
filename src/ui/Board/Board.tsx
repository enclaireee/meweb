import type { CSSProperties, ReactNode } from "react";
import styles from "./Board.module.css";

/**
 * Pinned boards on two strings (decisions.md): the practical rooms (experience & skills, contact)
 * don't get the scattered tags, they get even boards in a row, tops level, the scene showing
 * between them. Lowered in and hauled up like the other cards, without the swing. On phones they're
 * laid one under the other in the caption card (ui/Deck).
 */
export function BoardRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}

export function Board({
  i = 0,
  size = "col",
  children,
}: {
  i?: number;
  /** col: one of a BoardRow; narrow: hangs on its own at the right */
  size?: "col" | "narrow";
  children: ReactNode;
}) {
  return (
    <div className={`${styles.board} ${styles[size]}`} style={{ "--i": i } as CSSProperties}>
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
