import type { Project } from "@/lib/content";
import { Mdx } from "@/components/mdx/Mdx";
import { Prose } from "@/components/ui/Prose";
import { Frame } from "@/components/ui/Frame";
import { Link } from "@/components/ui/Link";

/**
 * One case study, rendered identically whether it arrived as a standalone page
 * (cold load, crawler, shared link) or inside the overlay (clicked from the
 * index). Same component, same MDX, so the two can never drift — which is the
 * whole point of the intercepting-route arrangement.
 *
 * `heading` exists because the two contexts disagree about document outline:
 * the standalone page's title is the page's <h1>; inside the overlay the page
 * already has an <h1> and this becomes an <h2> that labels the dialog.
 */
export function CaseStudy({
  project: p,
  headingId,
  heading: Heading = "h1",
}: {
  project: Project;
  headingId?: string;
  heading?: "h1" | "h2";
}) {
  return (
    <>
      <Frame
        src={p.cover}
        alt={p.coverAlt}
        want={`work/${p.slug}/cover.jpg`}
        ratio="21/9"
        sizes="100vw"
        priority
        className="min-h-[16rem]"
      />
      <div className="relative z-10 -mt-14 border-t border-edge-light-1 bg-base sm:-mt-24">
        <div className="mx-auto max-w-page px-gutter pt-10 sm:pt-14">
          <Heading
            id={headingId}
            className="max-w-[18ch] text-display font-semibold text-balance"
          >
            {p.title}
          </Heading>
        </div>
      </div>

      <div className="mx-auto max-w-page px-gutter">
        {/* Facts, stated once, before the story starts. Key over value,
            sentence case — a spec sheet, because the subject is an engineer. */}
        <dl className="mx-auto mt-16 grid max-w-[72rem] grid-cols-2 gap-x-8 gap-y-8 border-t border-rule pt-8 sm:grid-cols-4">
          {(
            [
              ["When", p.period],
              ["Field", p.domain],
              // Omitted entirely when unset — an empty "My role" key is worse
              // than no key, and worse still than a guess.
              ...(p.role ? ([["My role", p.role]] as [string, string][]) : []),
              ["Status", p.status === "shipped" ? "Shipped" : "Still going"],
            ] as [string, string][]
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="meta text-faint">{k}</dt>
              <dd className="mt-2 text-small">{v}</dd>
            </div>
          ))}
          <div>
            <dt className="meta text-faint">Built with</dt>
            <dd className="mt-2 text-small text-muted">{p.stack.join(", ")}</dd>
          </div>
          {p.links.length > 0 && (
            <div className="col-span-2 sm:col-span-4">
              <dt className="meta text-faint">Links</dt>
              <dd className="mt-2 flex flex-wrap gap-6 text-small">
                {p.links.map((l) => (
                  <Link key={l.href} href={l.href}>
                    {l.label}
                  </Link>
                ))}
              </dd>
            </div>
          )}
        </dl>

        {/* The reading column sits left inside a narrower container; figures
            bleed into the space on its right rather than being centred with
            dead margins on both sides. */}
        <div className="mx-auto mt-28 max-w-[72rem]">
          <Prose className="max-w-[62ch]">
            <p className="text-lead text-ink">{p.summary}</p>
            <Mdx source={p.body} />
          </Prose>
        </div>
      </div>
    </>
  );
}
