import type { Metadata } from "next";
import { profile, education, awards, languages } from "@/content";
import { SplitLines } from "@/components/motion/SplitLines";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Placeholder } from "@/components/ui/Placeholder";
import { Capabilities } from "@/components/sections/Capabilities";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "About — Muhammad Fatih Zamzami",
  description:
    "Electrical engineering undergraduate at Universitas Indonesia, building across hardware and software.",
};

export default function AboutPage() {
  return (
    <>
      <main>
        <section className="px-gutter pt-section">
          <p className="annot text-muted">about</p>
          <SplitLines as="h1" immediate className="font-display text-hero mt-6">
            Between volts
            <br />
            <span className="italic">and pixels.</span>
          </SplitLines>
        </section>

        <section className="grid grid-cols-12 gap-x-4 gap-y-12 px-gutter py-section">
          <div className="col-span-12 space-y-6 lg:col-span-6">
            {profile.about.map((para, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="max-w-prose text-lead">{para}</p>
              </Reveal>
            ))}
          </div>
          <div className="col-span-10 col-start-2 lg:col-span-4 lg:col-start-9">
            <Parallax amount={-10}>
              <ImageReveal from="right" className="aspect-[4/3]">
                <Placeholder id="about-candid" />
              </ImageReveal>
              <p className="annot mt-2 text-muted">Fig. 01 — field conditions</p>
            </Parallax>
          </div>
        </section>

        <Capabilities />
        <Experience />

        <section className="grid grid-cols-12 gap-x-4 gap-y-12 border-t border-border px-gutter py-section">
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
            <p className="annot mt-10 text-muted">
              {languages.map((l) => `${l.label} — ${l.level}`).join(" · ")}
            </p>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
