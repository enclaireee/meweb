import type { CSSProperties, ElementType, ReactNode } from "react";
import styles from "./Hang.module.css";

/**
 * Where a card hangs (desktop/tablet): the title tag, three small ceiling tags, three notes and a card
 * near the floor. On desktop they gather in a loose cluster on the right (the camera already moves the
 * aisle left), leaving the doorway and the worker clear.
 */
export type Slot = "tr" | "t1" | "t2" | "t3" | "n1" | "n2" | "n3" | "br";

/**
 * One small paper on a string (decisions.md, "lots of small papers"). When its section arrives the
 * cards are lowered in one by one and swing to rest; when it leaves they're hauled up again (CSS, from
 * the section's data-active). Each hangs at its own depth, so the pointer parallax sets them apart.
 * Without JS it's just a card in the page.
 */
export function Hang({
  slot,
  i,
  depth = 1,
  tilt = 0,
  as: Tag = "div",
  className = "",
  sway = false,
  children,
  ...rest
}: {
  slot: Slot;
  i: number;
  depth?: number;
  tilt?: number;
  as?: ElementType;
  className?: string;
  sway?: boolean;
  children: ReactNode;
} & Record<`aria-${string}`, string>) {
  const vars = { "--i": i, "--depth": depth, "--tilt": `${tilt}deg` } as CSSProperties;
  const Card = Tag as "div";
  return (
    <div className={`${styles.hang} ${styles[slot]}`} style={vars} data-sway={sway || undefined}>
      <div className={styles.parallax}>
        <span className={styles.string} aria-hidden />
        <div className="cast">
          <Card className={`${styles.card} paper grain ${className}`} {...rest}>
            <span className={styles.hole} aria-hidden />
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
}
