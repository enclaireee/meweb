import type { Metadata } from "next";
import { profile } from "@/content";
import { SplitLines } from "@/components/motion/SplitLines";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Placeholder } from "@/components/ui/Placeholder";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Contact — Muhammad Fatih Zamzami",
  description: "Get in touch — email, GitHub, LinkedIn.",
};

export default function ContactPage() {
  return (
    <>
      <main>
        <section className="px-gutter pt-section">
          <p className="annot text-muted">transmission</p>
          <SplitLines as="h1" immediate className="font-display text-hero mt-6">
            Say
            <br />
            <span className="italic">hello.</span>
          </SplitLines>

          <Reveal delay={0.3} className="mt-10 max-w-xl">
            <p className="text-lead">{profile.availability}</p>
          </Reveal>

          <div className="mt-14 grid grid-cols-12 gap-x-4 gap-y-12 pb-section">
            <div className="col-span-12 lg:col-span-6">
              <p className="annot text-muted">email</p>
              <div className="mt-4">
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
              </div>
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-7">
              <p className="annot text-muted">elsewhere</p>
              <ul className="mt-4 space-y-3 border-t border-border pt-4">
                {profile.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor={s.label.toLowerCase()}
                      className="group flex items-baseline justify-between gap-4 transition-colors duration-300 hover:text-accent"
                    >
                      <span className="font-display text-lead">{s.label}</span>
                      <span className="annot text-muted transition-colors duration-300 group-hover:text-accent">
                        @{s.handle} ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="annot col-span-12 flex flex-col gap-1 text-muted sm:col-span-6 lg:col-span-2 lg:col-start-11 lg:text-right">
              <p>{profile.location}</p>
              <p>UTC+7</p>
              <p>{profile.role}</p>
            </div>
          </div>
        </section>

        <ImageReveal from="bottom" className="aspect-[3/1] w-full">
          <Placeholder id="contact-strip" />
        </ImageReveal>
      </main>
      <Footer />
    </>
  );
}
