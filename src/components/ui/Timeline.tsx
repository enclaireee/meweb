import TransitionLink from "next/link";
import type { TimelineEntry } from "@/lib/content";
import { Mdx } from "@/components/mdx/Mdx";
import { Prose } from "@/components/ui/Prose";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Renders anything timeline-shaped — jobs, roles, degrees. One component,
 * because they are one schema. Every optional field is omitted rather than
 * left as an empty container: no location line, no highlights list, no links
 * row, no prose block unless the entry actually has them.
 */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="border-t border-rule">
      {entries.map((e, i) => (
        <li key={e.slug} className="border-b border-rule">
          <Reveal
            index={i}
            className="grid gap-x-12 gap-y-3 py-10 md:grid-cols-12"
          >
          <div className="md:col-span-3">
            <p className="meta text-faint tabular-nums">
              {e.start} – {e.end ?? "now"}
            </p>
            {e.location && (
              <p className="mt-2 text-small text-muted">{e.location}</p>
            )}
          </div>
          <div className="md:col-span-9">
            <h3 className="text-lead font-semibold">{e.role}</h3>
            <p className="mt-1 text-small text-muted">{e.org}</p>
            <p className="mt-5 max-w-[58ch] text-body">{e.summary}</p>
            {e.highlights.length > 0 && (
              <ul className="mt-5 max-w-[58ch] space-y-2">
                {e.highlights.map((h) => (
                  <li
                    key={h}
                    className="border-l border-rule pl-4 text-small text-muted"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            )}
            {e.body && (
              <Prose className="mt-4 max-w-[58ch] text-small text-muted">
                <Mdx source={e.body} />
              </Prose>
            )}
            {e.links.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {e.links.map((l) => (
                  <li key={l.href}>
                    <TransitionLink
                      href={l.href}
                      className="text-small text-muted underline decoration-accent decoration-2 underline-offset-4 transition-colors duration-(--dur-micro) hover:text-accent"
                    >
                      {l.label}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
