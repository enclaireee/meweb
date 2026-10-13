import CvButton from "./CvButton";
import DayToggle from "./DayToggle";
import styles from "./Footer.module.css";

/** The only chrome on the frame besides navigation: day/night and the CV, top right. */
export function Footer() {
  return (
    <div className={styles.controls}>
      <DayToggle />
      <CvButton tone="paper" />
    </div>
  );
}

export default Footer;
