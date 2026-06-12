import type { Metadata } from "next";
import { profile } from "@/content";
import { SplitLines } from "@/components/motion/SplitLines";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { LocalTime } from "@/components/contact/LocalTime";
import { PanelIn } from "@/components/contact/PanelIn";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Contact — Muhammad Fatih Zamzami",
  description: "Get in touch — email, GitHub, LinkedIn.",
};

const [emailUser, emailDomain] = ["muhfatihzamzami", "@gmail.com"];

/**
 * "Transmission sheet" — this page alone sits on engineering graph paper.
 * The email address itself is the headline; the form is the instrument
 * panel beside it.
 */
export default function ContactPage() {
  return (
    <>
      <main className="bg-grid-sheet">
        <section className="grid min-h-svh grid-cols-12 gap-x-4 px-gutter pb-28 pt-section lg:pb-section">
          {/* left: the giant address */}
          <div className="col-span-12 lg:col-span-7 lg:pr-8">
            <p className="annot text-muted">transmission — contact</p>

            <a
              href={`mailto:${profile.email}`}
              data-cursor="write"
              className="group mt-8 block"
            >
              <SplitLines as="span" immediate delay={0.15} className="block font-display text-title">
                <span className="block transition-colors duration-300 group-hover:text-accent">
                  {emailUser}
                </span>
                <span className="block italic text-muted transition-colors duration-300 group-hover:text-accent">
                  {emailDomain}
                </span>
              </SplitLines>
              <span className="annot mt-4 inline-block text-muted transition-all duration-300 ease-(--ease-out-expo) group-hover:translate-x-1.5 group-hover:text-foreground">
                open a draft →
              </span>
            </a>

            <Reveal delay={0.5} className="mt-16 max-w-md">
              <p className="text-lead">{profile.availability}</p>
            </Reveal>

            <Reveal delay={0.6} className="mt-10">
              <div className="annot flex flex-wrap items-center gap-x-8 gap-y-3 text-muted">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
                    <span className="h-full w-full rounded-full bg-accent" />
                  </span>
                  open to work
                </span>
                <span>
                  Depok, ID — <LocalTime />
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.7} className="mt-12">
              <ul className="flex flex-wrap gap-x-10 gap-y-3">
                {profile.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor={s.label.toLowerCase()}
                      className="group/s annot inline-flex items-baseline gap-2 text-muted transition-colors duration-300 hover:text-foreground"
                    >
                      <span className="relative">
                        {s.label}
                        <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 ease-(--ease-out-expo) group-hover/s:w-full" />
                      </span>
                      <span className="transition-transform duration-300 ease-(--ease-out-expo) group-hover/s:-translate-y-0.5 group-hover/s:translate-x-0.5">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* right: the instrument panel */}
          <PanelIn className="col-span-12 mt-16 lg:col-span-5 lg:mt-0 lg:self-center">
            <ContactForm />
          </PanelIn>
        </section>
      </main>
      <Footer />
    </>
  );
}
