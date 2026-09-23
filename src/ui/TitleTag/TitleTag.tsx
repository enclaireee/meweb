import { profile } from "@/content/profile";
import styles from "./TitleTag.module.css";

/**
 * The hung title tag (design.md §6): punched hole, stitched border, the <h1>.
 * `data-sway` lets the scene loop swing it on its string when the lamp sweeps past.
 */
export function TitleTag() {
  // one word per line: the wrap is the same in the fallback font and in Newsreader, so the font swap
  // can't move a line (CLS 0)
  const words = profile.name.split(" ");
  return (
    <header className={`cast ${styles.hang}`} data-sway>
      <span className={styles.string} aria-hidden />
      <div className={`${styles.tag} paper grain`}>
        <span className={styles.washer} aria-hidden />
        <p className="text-kicker uppercase text-ink-soft">{profile.kicker}</p>
        <h1 id="about-title" className={`text-hero mt-3 ${styles.name}`} style={{ fontVariationSettings: '"opsz" 72' }}>
          {words.map((w, i) => (
            <span key={w} className={w === profile.accentWord ? "block text-accent-text" : "block"}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        <p className="text-caption italic mt-4">{profile.summary}</p>
      </div>
    </header>
  );
}
