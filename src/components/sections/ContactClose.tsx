import { profile } from "@/content";
import { SplitLines } from "@/components/motion/SplitLines";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";

/** Home's closing gesture — the full contact page lives at /contact. */
export function ContactClose() {
  return (
    <section className="border-t border-border px-gutter py-section">
      <p className="annot text-muted">transmission</p>
      <SplitLines as="h2" className="font-display text-hero mt-6">
        Say
        <br />
        <span className="italic">hello.</span>
      </SplitLines>

      <Reveal className="mt-10 max-w-xl">
        <p className="text-lead">{profile.availability}</p>
      </Reveal>

      <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
        <Magnetic>
          <a
            href={`mailto:${profile.email}`}
            data-cursor="write"
            className="group inline-flex items-center gap-6 border border-border px-10 py-5 transition-all duration-500 hover:border-foreground hover:bg-surface/50"
          >
            <span className="font-display text-lead text-foreground">{profile.email}</span>
            <span className="font-display text-lead text-muted transition-colors duration-500 group-hover:text-foreground">↗</span>
          </a>
        </Magnetic>

        <ul className="annot flex gap-x-8">
          {profile.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor={s.label.toLowerCase()}
                className="underline decoration-border underline-offset-4 transition-colors duration-300 hover:text-accent"
              >
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
