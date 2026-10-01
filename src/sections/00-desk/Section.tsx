import { profile } from "@/content/profile";
import { papers, rooms } from "@/design/tokens";
import { StationShell } from "@/ui/StationShell/StationShell";
import { Hang, type Slot } from "@/ui/Hang/Hang";
import styles from "./Section.module.css";

const focusSlots: Slot[] = ["t1", "t2", "t3"];

/**
 * The Desk: the entrance to the Night Workshop.
 * An archival hanging name plaque, three focus slips overhead, and a clear view into the rooms ahead.
 */
export default function Section() {
  const words = profile.name.split(" ");
  const tone = { "--tone": papers[rooms[0]!.wall], "--ink-tone": papers[rooms[0]!.ceiling] } as React.CSSProperties;

  return (
    <StationShell index={0} labelledBy="hero-title">
      <div className={styles.set} style={tone}>
        <Hang slot="tr" i={0} depth={1.3} tilt={-1} sway as="header" className={styles.nameTag}>
          <p className="text-kicker uppercase text-ink-soft">{profile.kicker}</p>
          <h1 id="hero-title" className={styles.name}>
            {words.map((w, i) => (
              <span key={w} className={w === profile.accentWord ? "block text-accent-text" : "block"}>
                {w}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p className="text-caption italic mt-3">{profile.summary}</p>
          <div className={styles.scrollCue}>
            <span className={styles.scrollLine} aria-hidden />
            <span className="text-kicker uppercase text-ink-soft">Scroll to explore</span>
          </div>
        </Hang>

        {profile.focus.map((f, k) => (
          <Hang key={f} slot={focusSlots[k]!} i={1 + k} depth={0.6 + k * 0.15} tilt={[2, -2, 1.5][k]!} className={styles.focus}>
            <span>{f}</span>
          </Hang>
        ))}
      </div>
    </StationShell>
  );
}
