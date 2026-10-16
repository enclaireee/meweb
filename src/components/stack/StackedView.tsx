import { copy, person, projects, stops, type Stop } from "@/content/site";
import CardBody from "@/components/ui/CardBody";
import styles from "./StackedView.module.css";

/**
 * No-JS / crawler document. Holds the page's only h1.
 * Visible by default; visually hidden (still in the DOM) when html.js is set.
 */
const place = (s: Stop) => (
  <section key={s.id} id={s.id} className={styles.stop} aria-labelledby={`stack-${s.id}-title`}>
    <p className={styles.tag}>
      <strong>{s.tag.title}</strong>
      {s.tag.date && <span> ({s.tag.date})</span>}
      {" "}
      {s.tag.hook}
    </p>
    <CardBody stop={s} headingId={`stack-${s.id}-title`} stacked />
  </section>
);

export function StackedView() {
  return (
    <div className={styles.stack}>
      <h1 className={styles.h1}>{person.name}</h1>
      <p className={styles.lead}>{copy.noJs}</p>
      {/* river order: landing, the projects pier with every project behind it, skills, contact */}
      {stops.slice(0, 2).map(place)}
      {projects.map(place)}
      {stops.slice(2).map(place)}
      <footer className={styles.foot}>{copy.credit}</footer>
    </div>
  );
}

export default StackedView;
