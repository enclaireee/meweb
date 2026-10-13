import { copy, person } from "@/content/site";
import styles from "./paper.module.css";

// ponytail: one UI-only string not in site.ts; move to copy when content owner adds it.
const SOON = "CV file coming soon";

const Icon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
    <path d="M10 3v9m-4-4 4 4 4-4M4 15.5h12" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** One clean pill. Until person.cv exists it stays disabled and says why in its tooltip and accessible name. */
export function CvButton({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const cls = tone === "ink" ? styles.btn : styles.btnPaper;
  if (person.cv) {
    return (
      <a className={cls} href={person.cv} download>
        <Icon />
        {copy.downloadCv}
      </a>
    );
  }
  return (
    <button type="button" className={cls} disabled title={SOON} aria-label={`${copy.downloadCv}, ${SOON.toLowerCase()}`}>
      <Icon />
      {copy.downloadCv}
    </button>
  );
}

export default CvButton;
