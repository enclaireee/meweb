import { copy, person, stops } from "@/content/site";
import CardBody from "@/components/ui/CardBody";
import styles from "./StackedView.module.css";

/**
 * No-JS / crawler document. Holds the page's only h1.
 * Visible by default; visually hidden (still in the DOM) when html.js is set.
 */
export function StackedView() {
  return (
    <div className={styles.stack}>
      <h1 className={styles.h1}>{person.name}</h1>
      <p className={styles.lead}>{copy.noJs}</p>
      {stops.map((s) => (
        <section key={s.id} id={s.id} className={styles.stop} aria-labelledby={`stack-${s.i}-title`}>
          <p className={styles.tag}>
            <strong>{s.tag.title}</strong>
            {s.tag.date && <span> ({s.tag.date})</span>}
            {" "}
            {s.tag.hook}
          </p>
          <CardBody stop={s} headingId={`stack-${s.i}-title`} stacked />
        </section>
      ))}
      <footer className={styles.foot}>{copy.credit}</footer>
    </div>
  );
}

export default StackedView;
