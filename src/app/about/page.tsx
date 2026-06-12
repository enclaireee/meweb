import type { Metadata } from "next";
import { profile, capabilities, education, awards, languages } from "@/content";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Placeholder } from "@/components/ui/Placeholder";
import { Timeline } from "@/components/about/Timeline";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "About — Muhammad Fatih Zamzami",
  description:
    "Electrical engineering undergraduate at Universitas Indonesia, building across hardware and software.",
};

/**
 * "The dossier" — editorial long-form. No oversized hero here (that's the
 * index's voice): a file-header strip, a drop-cap narrative column beside a
 * sticky figure, a drawn timeline for the record, and a quiet appendix.
 */
export default function AboutPage() {
  return (
    <>
      <main>
        {/* file header */}
        <header className="border-b border-border px-gutter pb-10 pt-section">
          <p className="annot text-muted">dossier — about</p>
          <Reveal className="mt-6">
            <h1 className="font-display text-title max-w-3xl">
              {profile.name}, engineer between volts{" "}
              <span className="italic">and pixels.</span>
            </h1>
          </Reveal>
          <Stagger className="annot mt-10 grid grid-cols-2 gap-y-2 text-muted sm:grid-cols-4">
            <StaggerItem>based — {profile.location}</StaggerItem>
            <StaggerItem>field — electrical engineering</StaggerItem>
            <StaggerItem>school — Universitas Indonesia</StaggerItem>
            <StaggerItem>status — undergraduate</StaggerItem>
          </Stagger>
        </header>

        {/* narrative + sticky figure */}
        <section className="grid grid-cols-12 gap-x-4 px-gutter py-section">
          <div className="col-span-10 col-start-2 mb-14 sm:col-span-5 sm:col-start-1 sm:mb-0 lg:col-span-4">
            <div className="sm:sticky sm:top-24">
              <Parallax amount={-6}>
                <ImageReveal from="left" className="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]">
                  <Placeholder id="about-candid" />
                </ImageReveal>
                <p className="annot mt-2 text-muted">Fig. 01 — field conditions</p>
              </Parallax>
            </div>
          </div>

          <div className="col-span-12 sm:col-span-7 sm:pl-8 lg:col-span-5 lg:col-start-6">
            {profile.about.map((para, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <p
                  className={`mt-6 max-w-prose text-lead first:mt-0 ${
                    i === 0
                      ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[3.2em] first-letter:leading-[0.85]"
                      : ""
                  }`}
                >
                  {para}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* atmospheric divider */}
        <ImageReveal from="bottom" className="aspect-[3/1] w-full">
          <Placeholder id="about-strip" />
        </ImageReveal>

        {/* the record — drawn timeline */}
        <section className="grid grid-cols-12 gap-x-4 px-gutter py-section">
          <div className="col-span-12 lg:col-span-3">
            <p className="annot text-muted">the record</p>
          </div>
          <div className="col-span-12 mt-10 lg:col-span-7 lg:col-start-5 lg:mt-0">
            <Timeline />
          </div>
        </section>

        {/* toolkit — compact dossier index */}
        <section className="border-t border-border px-gutter py-section">
          <div className="grid grid-cols-12 gap-x-4 gap-y-10">
            <div className="col-span-12 lg:col-span-3">
              <p className="annot text-muted">toolkit</p>
            </div>
            <Stagger className="col-span-12 space-y-8 lg:col-span-7 lg:col-start-5">
              {capabilities.map((group) => (
                <StaggerItem key={group.label}>
                  <div className="grid grid-cols-12 gap-x-4 border-t border-border pt-4">
                    <p className="annot col-span-12 text-muted sm:col-span-3">{group.label}</p>
                    <p className="col-span-12 mt-2 leading-relaxed sm:col-span-9 sm:mt-0">
                      {group.items.join(", ")}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* appendix */}
        <section className="border-t border-border px-gutter py-section">
          <div className="grid grid-cols-12 gap-x-4 gap-y-12">
            <div className="col-span-12 lg:col-span-3">
              <p className="annot text-muted">appendix</p>
            </div>
            <Reveal className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-5">
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
            <Reveal delay={0.1} className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-9">
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
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
