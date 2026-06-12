import { profile } from "@/content";

export function Footer() {
  return (
    <footer className="annot flex flex-wrap items-center justify-between gap-4 border-t border-border px-gutter py-6 text-muted">
      <p>© 2026 {profile.name}</p>
      <p>6.40° S / 106.79° E — Depok, ID</p>
      <p>set in Newsreader & Hanken Grotesk</p>
    </footer>
  );
}
