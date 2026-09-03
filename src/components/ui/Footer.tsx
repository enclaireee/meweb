import TransitionLink from "next/link";
import { profile } from "@content/meta/profile";
import { visibleChannels } from "@content/meta/contact";
import { site } from "@content/meta/site";
import { Channel } from "@/components/ui/Contact";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The closing beat, not a copyright line. It gets the sunk field — the same
 * recess the work grid uses — so the page ends on a change of ground rather
 * than on smaller text. Everything here is derived: nav, channels, the year,
 * the UTC offset, the last-updated date.
 */

/** Derived from the IANA zone so it survives daylight saving and my moving. */
function offset(timeZone: string): string {
  return (
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value ?? ""
  );
}

const fullDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function Footer() {
  const updated = new Date(site.lastUpdated);
  const [primary, ...rest] = visibleChannels;

  return (
    <footer id="contact" className="field-sunk mt-40">
      <div className="mx-auto max-w-page px-gutter py-24 sm:py-32">
        <div className="grid gap-x-12 gap-y-14 md:grid-cols-12">
          <Reveal className="md:col-span-6">
            <p className="max-w-[16ch] text-title font-semibold text-balance">
              {site.footer.heading}
            </p>
            <p className="mt-5 max-w-[38ch] text-body text-muted">
              {site.footer.lead}
            </p>
            <div className="mt-10">
              <Channel channel={primary} primary />
            </div>
          </Reveal>

          <div className="md:col-span-5 md:col-start-8">
            {rest.map((c, i) => (
              <Reveal key={c.id} index={i}>
                <Channel channel={c} />
              </Reveal>
            ))}
            {site.cv && (
              <a
                href={site.cv.href}
                className="mt-6 inline-block text-small text-muted transition-colors duration-(--dur-micro) hover:text-accent"
              >
                {site.cv.label}
              </a>
            )}
          </div>
        </div>

        <div className="mt-20 grid gap-x-12 gap-y-6 border-t border-rule pt-6 md:grid-cols-12">
          <p className="meta text-faint md:col-span-4">
            {profile.name}
            <br />
            {profile.location} · {site.timezoneLabel} {offset(site.timezone)}
          </p>
          <nav aria-label="Footer" className="md:col-span-4">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {site.sections.map((item) => (
                <li key={item.id}>
                  <TransitionLink
                    href={`/#${item.id}`}
                    className="meta text-muted transition-colors duration-(--dur-micro) hover:text-accent"
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
          <p className="meta text-faint md:col-span-4 md:text-right">
            <time dateTime={site.lastUpdated}>
              Last updated {fullDate.format(updated)}
            </time>
            <br />
            <a
              href="#main"
              className="text-muted transition-colors duration-(--dur-micro) hover:text-accent"
            >
              {site.footer.backToTop}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
