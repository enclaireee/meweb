import CvButton from "./CvButton";
import styles from "./Footer.module.css";

/** The only chrome on the frame besides navigation: the CV, top right. */
export function Footer() {
  return (
    <div className={styles.controls}>
      <CvButton tone="paper" />
    </div>
  );
}

export default Footer;
