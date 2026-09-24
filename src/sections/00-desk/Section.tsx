import { profile } from "@/content/profile";
import { formatDates } from "@/lib/dates";
import { papers, rooms } from "@/design/tokens";
import { StationShell } from "@/ui/StationShell/StationShell";
import { Hang, type Slot } from "@/ui/Hang/Hang";
import { Icon } from "@/ui/Icon/Icon";
import styles from "./Section.module.css";

const focusSlots: Slot[] = ["t1", "t2", "t3"];

/** The desk: the name tag, three threads of the work over the desk, the short story and the schooling. */
export default function Section() {
  const { education } = profile;
  // one word per line: the wrap is the same before and after the font swap, so nothing moves (CLS 0)
  const words = profile.name.split(" ");
  const tone = { "--tone": papers[rooms[0]!.wall], "--ink-tone": papers[rooms[0]!.ceiling] } as React.CSSProperties;
  return (
    <StationShell index={0} labelledBy="about-title">
      <div className={styles.set} style={tone}>
        <Hang slot="tr" i={0} depth={1.3} tilt={-1} sway as="header" className={styles.nameTag}>
          <p className="text-kicker uppercase text-ink-soft">{profile.kicker}</p>
          <h1 id="about-title" className={styles.name}>
            {words.map((w, i) => (
              <span key={w} className={w === profile.accentWord ? "block text-accent-text" : "block"}>
                {w}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p className="text-caption italic mt-3">{profile.summary}</p>
        </Hang>

        {profile.focus.map((f, k) => (
          <Hang key={f} slot={focusSlots[k]!} i={1 + k} depth={0.6 + k * 0.15} tilt={[2, -2, 1.5][k]!} className={styles.focus}>
            <span>{f}</span>
          </Hang>
        ))}

        <Hang slot="ml" i={4} depth={1.1} tilt={1.2}>
          <p className="text-kicker uppercase text-ink-soft">
            <Icon name="pencil" /> Desk notes
          </p>
          <p className={styles.text}>{profile.intro}</p>
        </Hang>

        <Hang slot="bc" i={5} depth={1.2} tilt={-0.8}>
          <p className="text-kicker uppercase text-ink-soft">
            <Icon name="cap" /> Studying
          </p>
          <p className={styles.text}>
            {education.degree}, <span className="italic">{education.school}</span>
          </p>
          <p className="text-caption text-ink-soft mt-1">
            <time dateTime={education.dates.start}>{formatDates(education.dates)}</time> · <Icon name="pin" /> {profile.location}
          </p>
        </Hang>

        <Hang slot="br" i={6} depth={1.5} tilt={0.9}>
          <p className="text-kicker uppercase text-ink-soft">
            <Icon name="book" /> On the syllabus
          </p>
          <ul className={styles.chips}>
            {education.coursework.map((c) => (
              <li key={c} className={`${styles.chip} text-kicker uppercase`}>
                {c}
              </li>
            ))}
          </ul>
        </Hang>
      </div>
    </StationShell>
  );
}
