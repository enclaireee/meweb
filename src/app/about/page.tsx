import type { Metadata } from "next";
import { profile, experience, education, awards, capabilities, languages } from "@/content";
import { Section } from "@/components/ui/Section";
import { Panel } from "@/components/ui/Panel";
import { Tag } from "@/components/ui/Tag";
import { Prose } from "@/components/ui/Prose";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "About — Muhammad Fatih Zamzami",
  description:
    "Electrical engineering undergraduate at Universitas Indonesia — control systems, embedded hardware, and full-stack software.",
};

export default function About() {
  return (
    <div className="space-y-s7 pt-s6 pb-s7">
      <Section tag="ID — OPERATOR RECORD" title={profile.name}>
        <Prose>
          {profile.about.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </Prose>
      </Section>

      <Section tag="LOG — FULL RECORD" aside={`${experience.length} ENTRIES`}>
        <ol className="space-y-s3">
          {experience.map((e, i) => (
            <li key={e.slug}>
              <Reveal delay={i * 0.04}>
                <Panel
                  tag={`LOG/${String(i + 1).padStart(2, "0")}`}
                  aside={
                    <>
                      {e.start} — {e.end ?? <span className="text-ok">NOW</span>}
                    </>
                  }
                >
                  <h3 className="font-mono text-lead font-medium">{e.role}</h3>
                  <p className="text-body-s text-fg-muted">
                    {e.org} · {e.location}
                  </p>
                  <p className="mt-s2 max-w-[65ch] text-body-s">{e.summary}</p>
                  {e.highlights.length > 0 && (
                    <ul className="mt-s2 max-w-[65ch] space-y-s1 text-body-s text-fg-muted">
                      {e.highlights.map((h) => (
                        <li key={h.slice(0, 24)}>
                          <span className="text-accent">▪</span> {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      <Section tag="EDU — EDUCATION">
        <div className="grid gap-s3 sm:grid-cols-2">
          {education.map((ed) => (
            <Panel key={ed.school} tag={ed.start + " — " + (ed.end ?? "NOW")}>
              <h3 className="font-mono text-lead font-medium">{ed.school}</h3>
              <p className="text-body-s text-fg-muted">{ed.program}</p>
              <p className="mt-s2 text-body-s">{ed.note}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section tag="CAP — CAPABILITIES">
        <div className="grid gap-s3 lg:grid-cols-3">
          {capabilities.map((g) => (
            <Panel key={g.label} tag={g.label.toUpperCase()}>
              <p className="text-body-s text-fg-muted">{g.blurb}</p>
              <div className="mt-s3 flex flex-wrap gap-s1">
                {g.items.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </Panel>
          ))}
        </div>
        <p className="mt-s3 text-body-s text-fg-muted">
          {languages.map((l) => `${l.label} (${l.level})`).join(" · ")}
        </p>
      </Section>

      <Section tag="AWD — APPENDIX" aside={`${awards.length} RECORDS`}>
        <ul className="divide-y divide-border border-y border-border">
          {awards.map((a) => (
            <li key={a.title} className="flex flex-wrap justify-between gap-s2 py-s2 text-body-s">
              <span>{a.title}</span>
              <span className="label self-center text-fg-muted">
                {a.issuer.toUpperCase()} · {a.year}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
