import { experience } from "@/content";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";

export function Experience() {
  return (
    <section className="border-t border-border px-gutter py-section">
      <div className="grid grid-cols-12 gap-x-4">
        <div className="col-span-12 lg:col-span-3">
          <p className="annot text-muted">experience</p>
          <h2 className="font-display text-title mt-4">The record.</h2>
        </div>

        <Stagger className="col-span-12 mt-14 lg:col-span-9 lg:mt-0">
          {experience.map((e) => (
            <StaggerItem key={e.slug}>
              <article className="group grid grid-cols-12 gap-x-4 gap-y-3 border-t border-border py-8 transition-colors duration-300 hover:bg-surface/60">
                <p className="annot col-span-12 text-muted sm:col-span-3">
                  {e.start} — {e.end ?? "now"}
                  <br />
                  {e.location}
                </p>
                <div className="col-span-12 sm:col-span-9">
                  <h3 className="font-display text-heading">{e.role}</h3>
                  <p className="annot mt-1 text-muted">{e.org}</p>
                  <p className="mt-4 max-w-prose leading-relaxed text-foreground">{e.summary}</p>
                  <ul className="mt-4 max-w-prose space-y-2 text-muted">
                    {e.highlights.map((h, i) => (
                      <li key={i} className="border-l border-border pl-4 leading-relaxed">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
