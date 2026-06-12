import { experience, education, awards } from "@/content";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/Reveal";

export function Experience() {
  return (
    <section id="experience" className="border-t border-border px-gutter py-section">
      <div className="grid grid-cols-12 gap-x-4">
        <div className="col-span-12 lg:col-span-3">
          <p className="annot text-muted">05 — the record</p>
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

      <div className="mt-24 grid grid-cols-12 gap-x-4 gap-y-12">
        <Reveal className="col-span-12 sm:col-span-6 lg:col-span-4 lg:col-start-4">
          <p className="annot text-muted">Training</p>
          <ul className="mt-4 space-y-5 border-t border-border pt-5">
            {education.map((ed) => (
              <li key={ed.school}>
                <p className="font-display text-lead">{ed.school}</p>
                <p className="annot mt-1 text-muted">
                  {ed.program} · {ed.start} — {ed.end ?? "now"}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="col-span-12 sm:col-span-6 lg:col-span-4 lg:col-start-9">
          <p className="annot text-muted">Recognition</p>
          <ul className="mt-4 space-y-5 border-t border-border pt-5">
            {awards.map((a) => (
              <li key={a.title}>
                <p className="font-display text-lead">{a.title}</p>
                <p className="annot mt-1 text-muted">
                  {a.issuer} · {a.year}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
