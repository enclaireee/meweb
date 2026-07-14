import { profile } from "@content/meta/profile";
import { Link } from "@/components/ui/Link";
import { Clock } from "@/components/telemetry/Clock";
import { LastCommit } from "@/components/telemetry/LastCommit";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-console px-gutter py-s4">
        <div className="flex flex-wrap items-center justify-between gap-s3">
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
        <div className="mt-s3 flex flex-wrap items-center justify-between gap-s2 border-t border-border-faint pt-s3">
          <span className="label text-fg-muted">
            SYS/CLOCK — <Clock />
          </span>
          <LastCommit />
        </div>
      </div>
    </footer>
  );
}
