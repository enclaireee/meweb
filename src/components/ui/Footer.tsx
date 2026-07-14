import { profile } from "@/content";
import { Link } from "@/components/ui/Link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-console flex-wrap items-center justify-between gap-s3 px-gutter py-s4">
        <p className="label text-fg-muted">
          SYS<span className="text-accent">/</span>EOF — {profile.name} · Depok, ID
        </p>
        <p className="flex flex-wrap gap-s3">
          <Link href={`mailto:${profile.email}`} external={false} className="label">
            EMAIL
          </Link>
          {profile.socials.map((s) => (
            <Link key={s.label} href={s.url} className="label">
              {s.label.toUpperCase()}
            </Link>
          ))}
        </p>
      </div>
    </footer>
  );
}
