import { profile } from "@/content/profile";
import { formatDates } from "@/lib/dates";
import { papers, rooms } from "@/design/tokens";
import { StationShell } from "@/ui/StationShell/StationShell";
import { Hang } from "@/ui/Hang/Hang";
import { Icon } from "@/ui/Icon/Icon";
import styles from "./Section.module.css";

/**
 * The Study: a single consolidated study dossier plate in the right column,
 * with two light slips overhead. Uncluttered, human, and zoom-friendly.
 */
export default function Section() {
  const { education } = profile;
  const tone = { "--tone": papers[rooms[1]!.wall], "--ink-tone": papers[rooms[1]!.ceiling] } as React.CSSProperties;

  return (
    <StationShell index={1} labelledBy="about-me-title">
      <div className={styles.set} style={tone}>
        {/* Two lightweight tags hanging high at the ceiling beams */}
        <Hang slot="t1" i={0} depth={0.65} tilt={1.6} className={styles.tagline}>
          <span>Hardware &amp; Telemetry</span>
        </Hang>
        <Hang slot="t2" i={1} depth={0.8} tilt={-1.8} className={styles.tagline}>
          <span>Web &amp; Interfaces</span>
        </Hang>

        {/* The Study Master Plate */}
        <div className={styles.dossierHang}>
          <span className={`${styles.string} ${styles.stringLeft}`} aria-hidden />
          <span className={`${styles.string} ${styles.stringRight}`} aria-hidden />
          <div className={styles.parallax}>
            <div className="cast">
              <article aria-labelledby="about-me-title" className={`${styles.plate} paper grain`}>
                <span className={styles.tab} aria-hidden />
                <span className={`${styles.pin} ${styles.pinL}`} aria-hidden />
                <span className={`${styles.pin} ${styles.pinR}`} aria-hidden />

                <header className={styles.header}>
                  <div className={styles.metaRow}>
                    <p className="text-kicker uppercase text-ink-soft">Plate 01 · The Study</p>
                    <span className="text-caption text-ink-soft">
                      <Icon name="pin" /> {profile.location}
                    </span>
                  </div>
                  <h2 id="about-me-title" className={styles.title}>
                    About Me
                  </h2>
                  <p className={styles.subtitle}>
                    Electrical Engineering undergraduate at Universitas Indonesia, bridging hardware systems with tactile digital craft.
                  </p>
                </header>

                <div className={styles.noteSection}>
                  <h3 className={`${styles.sectionHead} text-kicker uppercase`}>
                    <Icon name="pencil" badge />
                    Desk notes
                  </h3>
                  <p className={styles.bodyText}>{profile.intro}</p>
                </div>

                <div className={styles.studySection}>
                  <h3 className={`${styles.sectionHead} text-kicker uppercase`}>
                    <Icon name="cap" badge />
                    Education
                  </h3>
                  <p className={styles.degreeText}>
                    {education.degree}, <span className="italic">{education.school}</span>
                  </p>
                  <p className="text-caption text-ink-soft mt-1">
                    <time dateTime={education.dates.start}>{formatDates(education.dates)}</time> · Depok, Indonesia
                  </p>
                </div>

                <div className={styles.syllabusSection}>
                  <h3 className={`${styles.sectionHead} text-kicker uppercase`}>
                    <Icon name="book" badge />
                    On the syllabus
                  </h3>
                  <ul className={styles.chips} aria-label="Coursework">
                    {education.coursework.map((c) => (
                      <li key={c} className={`${styles.chip} text-kicker uppercase`}>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </StationShell>
  );
}
