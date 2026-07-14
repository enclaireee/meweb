import type { Metadata } from "next";
import { Link as TransitionLink } from "next-view-transitions";
import { projects } from "@/content";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Work — Muhammad Fatih Zamzami",
  description: "Case studies: BCI neurofeedback, OT/SCADA monitoring, full-stack web, embedded systems.",
};

export default function WorkIndex() {
  return (
    <div className="pt-s6 pb-s7">
      <Section tag="PROC — PROCESS TABLE" aside={`${projects.length} ENTRIES`} title="Work">
        <ol className="divide-y divide-border border-y border-border">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <Reveal delay={i * 0.05}>
                <TransitionLink
                  href={`/work/${p.slug}`}
                  className="group grid gap-s2 py-s4 transition-colors dur-base sm:grid-cols-[6rem_1fr_auto] sm:items-baseline sm:gap-s4"
                >
                  <span className="label text-fg-muted">
                    PROC/{String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="font-mono text-h font-medium transition-colors dur-fast group-hover:text-accent">
                      {p.title}
                    </span>
                    <span className="mt-s1 block text-body-s text-fg-muted">
                      {p.tagline}
                    </span>
                  </span>
                  <span className="label text-fg-muted">
                    {p.domain.toUpperCase()} · {p.year}{" "}
                    <span className="text-accent opacity-0 transition-opacity dur-fast group-hover:opacity-100">
                      →
                    </span>
                  </span>
                </TransitionLink>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
