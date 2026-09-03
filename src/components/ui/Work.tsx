import Link from "next/link";
import type { Project } from "@/lib/content";
import { Frame } from "@/components/ui/Frame";
import { MorphCard } from "@/components/ui/MorphCard";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Two registers, spec v3 §5. The featured tier is image-led and large; the
 * index is type-led and compact. They deliberately do not look like each other
 * — a grid of identical cards is both the density failure and one of the named
 * AI-generated-design tells.
 *
 * A server component. Only the featured card's outer box is client-side
 * (MorphCard), because that is the one element the shared-element morph has to
 * measure. Making this whole file client cost 0.2s of LCP.
 */
export type WorkCard = Pick<
  Project,
  "slug" | "title" | "summary" | "domain" | "year" | "featured"
> &
  Partial<Pick<Project, "role" | "cover">> & { coverAlt: string };

const FEATURED_SLOTS = 3;

export function Work({ projects }: { projects: WorkCard[] }) {
  const featured = projects.filter((p) => p.featured).slice(0, FEATURED_SLOTS);
  // Below four projects the index is just the featured tier again, so it
  // earns nothing and reads as padding.
  const showIndex = projects.length > FEATURED_SLOTS;

  return (
    <>
      {featured.length > 0 && (
        <ul className="mt-16 grid gap-8 md:grid-cols-3">
          {featured.map((p, i) => (
            <li key={p.slug}>
              {/* mask off: these carry a shadow on hover, and a clipping
                  wrapper would cut it. */}
              <Reveal index={i} mask={false} className="h-full">
              <Link
                href={`/work/${p.slug}`}
                data-project-card={p.slug}
                className="group block h-full"
              >
                <MorphCard
                  layoutId={`card-${p.slug}`}
                  className="surface-rest group-hover:surface-lift flex h-full flex-col"
                >
                  <Frame
                    src={p.cover}
                    alt={p.coverAlt}
                    want={`work/${p.slug}/cover.jpg`}
                    ratio="4/3"
                    sizes="(min-width: 768px) 31vw, 100vw"
                  />
                  <div className="flex flex-1 flex-col px-5 pt-5 pb-6">
                    <h3 className="text-lead font-semibold transition-colors duration-(--dur-micro) group-hover:text-accent">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-small text-muted">{p.summary}</p>
                    <p className="meta mt-5 text-faint tabular-nums">
                      {p.domain} · {p.year}
                    </p>
                  </div>
                </MorphCard>
              </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      )}

      {showIndex && (
        <>
          <h3 className="meta mt-24 text-faint">All work</h3>
          <ol className="mt-6 border-t border-rule">
            {projects.map((p, i) => (
              <li key={p.slug}>
                <Reveal index={i}>
                <Link
                  href={`/work/${p.slug}`}
                  data-project-card={p.slug}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 border-b border-rule py-6 md:grid-cols-[3rem_minmax(0,24rem)_minmax(0,26rem)_1fr] md:gap-x-10"
                >
                  <span className="meta text-faint tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="col-start-2">
                    <span className="block text-lead font-medium transition-colors duration-(--dur-micro) group-hover:text-accent">
                      {p.title}
                    </span>
                    <span className="meta mt-1 block text-faint tabular-nums">
                      {p.domain} · {p.year}
                    </span>
                  </span>
                  {/* Role is where the range shows, row by row. Absent on a
                      project whose role you have not stated: the column stays
                      empty rather than the row changing shape. */}
                  <span className="col-start-2 mt-2 text-small text-muted md:col-start-3 md:mt-0">
                    {p.role}
                  </span>
                  <span
                    aria-hidden
                    className="col-start-3 row-start-1 self-center text-muted transition-[color,transform] duration-(--dur-micro) ease-(--ease-out) group-hover:translate-x-[3px] group-hover:text-accent md:col-start-4"
                  >
                    →
                  </span>
                </Link>
                </Reveal>
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  );
}
