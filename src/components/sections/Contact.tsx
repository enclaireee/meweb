import { profile } from "@/content";
import { SplitLines } from "@/components/motion/SplitLines";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Placeholder } from "@/components/ui/Placeholder";

export function Contact() {
  return (
    <section id="contact" className="border-t border-line">
      <div className="px-6 pt-24 sm:px-10 lg:pt-32">
        <p className="annot text-ink-soft">06 — transmission</p>
        <SplitLines as="h2" className="font-display-wonk text-hero mt-6 tracking-tight">
          Say
          <br />
          <span className="italic">hello.</span>
        </SplitLines>

        <Reveal className="mt-10 max-w-xl">
          <p className="text-lg leading-relaxed text-ink">{profile.availability}</p>
        </Reveal>

        <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6 pb-16">
          <Magnetic>
            <a
              href={`mailto:${profile.email}`}
              data-cursor="write"
              className="inline-block border border-ink bg-ink px-8 py-4 font-display text-lg italic text-paper transition-colors duration-300 hover:bg-signal hover:border-signal"
            >
              {profile.email}
            </a>
          </Magnetic>

          <ul className="annot flex gap-x-8 text-ink">
            {profile.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor={s.label.toLowerCase()}
                  className="underline decoration-line underline-offset-4 transition-colors duration-300 hover:text-signal"
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

      <footer className="annot flex flex-wrap items-center justify-between gap-4 border-t border-line px-6 py-6 text-ink-soft sm:px-10">
        <p>© 2026 {profile.name}</p>
        <p>6.40° S / 106.79° E — Depok, ID</p>
        <p>set in Fraunces · Archivo · IBM Plex Mono</p>
      </footer>
    </section>
  );
}
