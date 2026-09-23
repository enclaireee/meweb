import { contact } from "@/content/contact";
import { StationShell } from "@/ui/StationShell/StationShell";
import { ScrapButton } from "@/ui/ScrapButton/ScrapButton";
import styles from "./Section.module.css";

export default function Section() {
  return (
    <StationShell index={7} labelledBy="contact-title">
      <div className={`cast ${styles.card}`}>
        <div className={`${styles.face} paper grain`}>
          <p className="text-kicker uppercase text-ink-soft">Plate 07 · The Window</p>
          <h2 id="contact-title" className="text-plate-title mt-2">
            Say hello
          </h2>
          <p className="text-caption italic mt-2">The cable ends here. Say hello.</p>
          <ul className={styles.links}>
            {contact.map((c) => (
              <li key={c.id}>
                <ScrapButton href={c.href} external={c.id !== "email"}>
                  <span className="text-kicker uppercase text-ink-soft block">{c.label}</span>
                  <span className="text-caption">{c.display}</span>
                </ScrapButton>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </StationShell>
  );
}
