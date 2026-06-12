import { profile } from "@/content";
import { SplitLines } from "@/components/motion/SplitLines";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Placeholder } from "@/components/ui/Placeholder";

export function Contact() {
  return (
    <section id="contact" className="border-t border-border">
      <div className="px-gutter pt-section">
        <p className="annot text-muted">06 — transmission</p>
        <SplitLines as="h2" className="font-display text-hero mt-6 tracking-tight">
          Say
          <br />
          <span className="italic">hello.</span>
        </SplitLines>

        <Reveal className="mt-10 max-w-xl">
          <p className="text-lead text-foreground">{profile.availability}</p>
        </Reveal>

        <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6 pb-16">
          <Magnetic>
            <a
              href={`mailto:${profile.email}`}
              data-cursor="write"
              className="inline-block border border-foreground bg-foreground px-8 py-4 font-display text-lead text-background transition-colors duration-300 hover:border-accent hover:bg-accent"
            >
              {profile.email}
            </a>
          </Magnetic>

          <ul className="annot flex gap-x-8 text-foreground">
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
      </div>

      <ImageReveal from="bottom" className="aspect-[3/1] w-full">
        <Placeholder id="contact-strip" />
      </ImageReveal>

      <footer className="annot flex flex-wrap items-center justify-between gap-4 border-t border-border px-gutter py-6 text-muted">
        <p>© 2026 {profile.name}</p>
        <p>6.40° S / 106.79° E — Depok, ID</p>
        <p>set in Newsreader & Hanken Grotesk</p>
      </footer>
    </section>
  );
}
