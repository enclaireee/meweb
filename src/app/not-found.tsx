import Link from "next/link";
import { copy } from "@/content/site";
import paper from "@/components/ui/paper.module.css";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>{copy.notFound}</h1>
        <Link href="/" className={paper.btn}>
          {copy.notFoundLink}
        </Link>
      </div>
    </main>
  );
}
