import { contact } from "@/content/contact";
import { papers, rooms } from "@/design/tokens";
import { StationShell } from "@/ui/StationShell/StationShell";
import { Board } from "@/ui/Board/Board";
import { Icon, type IconName } from "@/ui/Icon/Icon";
import styles from "./Section.module.css";

const icons: Record<string, IconName> = { email: "mail", github: "branch", linkedin: "linkedin" };

/** On a narrow card an address wraps where a person would break it: before the @, after a slash. */
const breakable = (text: string) => text.split(/(?=@)|(?<=\/)/).flatMap((part, i) => (i ? [<wbr key={i} />, part] : [part]));

/** The last room: say hello, on one clear card. */
export default function Section() {
  const tone = { "--tone": papers[rooms[7]!.wall], "--ink-tone": papers[rooms[7]!.ceiling] } as React.CSSProperties;
  return (
    <StationShell index={7} labelledBy="contact-title">
      <div style={tone} className={styles.set}>
        <Board size="narrow">
          <p className="text-kicker uppercase text-ink-soft">Plate 07 · The Window</p>
          <h2 id="contact-title" className={styles.title}>
            Say hello
          </h2>
          <p className="text-caption italic mt-2">The last room, where the day ends. The door is open.</p>
          <ul className={styles.links}>
            {contact.map((c) => (
              <li key={c.id}>
                <a href={c.href} className={styles.link} {...(c.id !== "email" ? { target: "_blank", rel: "noopener" } : {})}>
                  <span className={styles.kind}>
                    <Icon name={icons[c.id] ?? "arrow"} badge /> {c.label}
                  </span>
                  <span className={styles.display}>{breakable(c.display)}</span>
                  <span className={styles.arrow} aria-hidden>
                    {c.id === "email" ? "→" : "↗"}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Board>
      </div>
    </StationShell>
  );
}
