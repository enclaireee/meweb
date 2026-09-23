import { profile } from "@/content/profile";
import { formatDates } from "@/lib/dates";
import { StationShell } from "@/ui/StationShell/StationShell";
import { TitleTag } from "@/ui/TitleTag/TitleTag";
import styles from "./Section.module.css";

export default function Section() {
  const { education } = profile;
  return (
    <StationShell index={0} labelledBy="about-title">
      <TitleTag />
      <div className={`cast ${styles.notes}`}>
        <div className={`${styles.card} paper grain`}>
          <p className="text-kicker uppercase text-ink-soft">Desk notes</p>
          <p className="text-body mt-3">{profile.about}</p>
          <hr className="perforation my-4" />
          <p className="text-body">
            {education.degree}, <span className="italic">{education.school}</span>
          </p>
          <p className="text-caption text-ink-soft">
            <time dateTime={education.dates.start}>{formatDates(education.dates)}</time> · {profile.location}
          </p>
          <p className="text-caption italic mt-2">
            Coursework: {education.coursework.join(", ")}.
          </p>
        </div>
      </div>
    </StationShell>
  );
}
