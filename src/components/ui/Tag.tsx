"use client";

import { copy, person, type Stop } from "@/content/site";
import styles from "./Tag.module.css";

type Props = { stop: Stop; onOpen(): void; state: "hidden" | "swing" | "rest"; compact: boolean };

/**
 * Root is a zero-size box whose (0,0) is the string top (the hook). The parent sets left/top.
 * Optional CSS var --tag-shift (px) slides the paper sideways while the string stays on the hook.
 */
export function Tag({ stop, onOpen, state, compact }: Props) {
  const { tag, kicker, card, i } = stop;
  const label = tag.date ? `${tag.title}, ${tag.date}` : tag.title;
  const hidden = state === "hidden";
  return (
    <div className={`${styles.root} ${compact ? styles.compact : ""}`} data-state={state}>
      <div className={styles.hang} inert={hidden}>
        <button
          type="button"
          className={styles.paper}
          aria-haspopup="dialog"
          aria-controls={`card-${i}`}
          aria-label={label}
          aria-describedby={`tag-${i}-hook`}
          onClick={onOpen}
        >
          <span className={styles.sheet}>
            <span className={styles.kicker}>{kicker}</span>
            <span className={styles.title}>{tag.title}</span>
            {tag.date && <span className={styles.date}>{tag.date}</span>}
            <span id={`tag-${i}-hook`} className={styles.hook}>{tag.hook}</span>
            {tag.facts && (
              <span className={styles.facts}>
                {tag.facts.slice(0, compact ? 2 : 3).map(([v, l]) => (
                  <span key={l} className={styles.fact}>
                    <span className={styles.factV}>{v}</span>
                    <span className={styles.factL}>{l}</span>
                  </span>
                ))}
              </span>
            )}
            {card.layout === "letter" && <span className={styles.email}>{person.email}</span>}
            {!compact && card.chips && (
              <span className={styles.chips}>
                {card.chips.slice(0, 3).map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </span>
            )}
            <span className={styles.open} aria-hidden="true">
              {copy.openTag} <span className={styles.arrow}>→</span>
            </span>
          </span>
        </button>
        <span className={`${styles.string} ${styles.left}`} aria-hidden="true" />
        <span className={`${styles.string} ${styles.right}`} aria-hidden="true" />
      </div>
    </div>
  );
}

export default Tag;
