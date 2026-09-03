import type { Metadata } from "next";
import TransitionLink from "next/link";
import { profile, awards } from "@content/meta/profile";
import { site } from "@content/meta/site";
import {
  getProjects,
  getExperience,
  getEducation,
  getSkills,
  getCurrentRole,
} from "@/lib/content";
import { personJsonLd } from "@/lib/jsonld";
import { Frame } from "@/components/ui/Frame";
import { Prose } from "@/components/ui/Prose";
import { Timeline } from "@/components/ui/Timeline";
import { Work } from "@/components/ui/Work";
import { SplitText } from "@/components/motion/SplitText";
import { Arrival } from "@/components/motion/Arrival";
import { AxisNudge } from "@/components/motion/AxisNudge";
import { Reveal } from "@/components/motion/Reveal";
import { motion as anim } from "@content/meta/motion";

export const metadata: Metadata = {
  description: site.pages.home.description,
};

/**
 * The whole site, minus the case studies. Spec v3 §2.
 *
 * Sections are separated by a change of ground (base ↔ sunk field), not by
 * forced viewport heights and not by entrance animations. Every section id
 * here appears in site.sections, which is what the nav and its scroll-spy
 * read — add a section to that list and the nav grows with it.
 */
export default function Home() {
  const projects = getProjects();
  const current = getCurrentRole();
  const skills = getSkills();
  const titles = new Map(projects.map((p) => [p.slug, p.title]));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      {/* HERO — spec v4 §3. Three descending beats. Everything here is in the
          DOM at full opacity at first paint; the hidden start states are opt-in
          via html[data-motion], so with JS off or reduced motion on, this is
          simply a headline. */}
      <Arrival />
      <AxisNudge target="#greeting" />
      <section className="hero-recede relative isolate mx-auto max-w-page px-gutter pt-16 pb-24 sm:pt-24 sm:pb-28">
        <h1 id="greeting" className="text-greeting font-semibold">
          <SplitText text={profile.greeting} className="block font-medium text-muted" />
          <SplitText
            text={profile.greetingName}
            className="block"
            delayMs={150}
            accentFinal
          />
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-8">
            <p
              className="arrive max-w-[30ch] text-lead text-balance"
              style={{ transitionDelay: `${anim.heroBeatDelayMs}ms` }}
            >
              {profile.heroBeat}
            </p>
          </div>
          {current && (
            <dl
              className="arrive md:col-span-3 md:col-start-9 md:self-end"
              style={{ transitionDelay: `${anim.heroCurrentlyDelayMs}ms` }}
            >
              <dt className="meta text-faint">Currently</dt>
              <dd className="mt-2 text-small">{current.role}</dd>
              <dd className="mt-1 text-small text-muted">{current.org}</dd>
            </dl>
          )}
        </div>
      </section>

      {/* WORK — the dual-register layout lands in the next slice; for now every
          project is here as a wide strip, which is what /work used to show. */}
      <section id="work" className="field-sunk scroll-mt-24">
        <div className="mx-auto max-w-page px-gutter py-24">
          <Reveal>
            <h2 className="meta text-faint">{site.pages.work.title}</h2>
            <p className="mt-6 max-w-[48ch] text-lead text-muted">
              {site.pages.work.lead}
            </p>
          </Reveal>
          <Work
            projects={projects.map((p) => ({
              slug: p.slug,
              title: p.title,
              summary: p.summary,
              domain: p.domain,
              year: p.year,
              role: p.role,
              cover: p.cover,
              coverAlt: p.coverAlt,
              featured: p.featured,
            }))}
          />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-page scroll-mt-24 px-gutter pt-32">
        <Reveal>
          <h2 className="meta text-faint">About</h2>
        </Reveal>
        {/* Two columns once a portrait exists; one column until then. A 4:5
            placeholder is the largest empty rectangle on the page, and an
            "image pending" block where a face should be is worse than no
            image at all. Set profile.portrait and the layout returns. */}
        <Reveal mask={false} className="mt-10 grid gap-x-12 gap-y-12 md:grid-cols-12">
          {profile.portrait && (
            <div className="md:col-span-5">
              <Frame
                src={profile.portrait}
                alt="Fatih at the bench"
                want="about/portrait.jpg"
                ratio="4/5"
                sizes="(min-width: 768px) 40vw, 100vw"
              />
            </div>
          )}
          <div
            className={
              profile.portrait
                ? "md:col-span-7 md:border-l md:border-l-rule-faint md:pl-12"
                : "md:col-span-8"
            }
          >
            <p className="max-w-[12ch] text-title font-semibold">{profile.name}</p>
            <Prose className="mt-8 max-w-[56ch] text-muted">
              {profile.about.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </Prose>
          </div>
        </Reveal>
      </section>

      {/* EXPERIENCE — the evidence, so it gets the recess the work grid gets. */}
      <section id="experience" className="field-sunk mt-32 scroll-mt-24">
        <div className="mx-auto max-w-page px-gutter py-24">
          <Reveal>
            <h2 className="meta text-faint">Experience</h2>
          </Reveal>
          <div className="mt-10">
            <Timeline entries={getExperience()} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-page px-gutter">
        {/* SKILLS — what it is, where it was used, and the project that proves
            it. Anything without a context line collects on one quiet trailing
            row rather than taking an entry it cannot fill. */}
        <section id="skills" className="mt-32 scroll-mt-24">
          <Reveal>
            <h2 className="meta text-faint">What I work with</h2>
          </Reveal>
          <dl className="mt-10 space-y-16">
            {skills.map((g, i) => {
              const detailed = g.items.filter((s) => s.context);
              const rest = g.items.filter((s) => !s.context);
              return (
                <Reveal
                  key={g.slug}
                  index={i}
                  className="grid gap-x-12 gap-y-4 md:grid-cols-12"
                >
                  <dt className="text-lead font-semibold md:col-span-3">{g.label}</dt>
                  <dd className="md:col-span-9">
                    <p className="max-w-[58ch] text-body text-muted">{g.blurb}</p>
                    {detailed.length > 0 && (
                      <ul className="mt-6 space-y-5">
                        {detailed.map((s) => (
                          <li key={s.name} className="max-w-[62ch]">
                            <p className="text-small">
                              <span className="font-medium">{s.name}</span>
                              <span className="text-muted"> — {s.context}</span>
                              {s.related.map((slug, n) => (
                                <span key={slug} className="text-faint">
                                  {n === 0 ? " " : " · "}
                                  <TransitionLink
                                    href={`/work/${slug}`}
                                    className="underline decoration-rule underline-offset-4 transition-colors duration-(--dur-micro) hover:text-accent"
                                  >
                                    {titles.get(slug)}
                                  </TransitionLink>
                                </span>
                              ))}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                    {rest.length > 0 && (
                      <p className="mt-6 max-w-[62ch] text-small text-faint">
                        Also: {rest.map((s) => s.name).join(", ")}.
                      </p>
                    )}
                  </dd>
                </Reveal>
              );
            })}
          </dl>
        </section>

        {/* CREDENTIALS — findable, not featured. One low band, three columns. */}
        <section className="mt-32 mb-8 grid gap-x-12 gap-y-14 md:grid-cols-3">
          <Reveal index={0}>
            <h2 className="meta text-faint">Education</h2>
            <ul className="mt-8 space-y-8">
              {getEducation().map((e) => (
                <li key={e.slug}>
                  <h3 className="text-body font-medium">{e.role}</h3>
                  <p className="mt-1 text-small text-muted">{e.org}</p>
                  <p className="meta mt-1 text-faint tabular-nums">
                    {e.start} – {e.end ?? "now"}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal index={1}>
            <h2 className="meta text-faint">Awards</h2>
            <ul className="mt-8 space-y-8">
              {awards.map((a) => (
                <li key={a.title}>
                  <h3 className="max-w-[34ch] text-body">{a.title}</h3>
                  <p className="mt-1 text-small text-muted">
                    {a.issuer}, {a.year}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal index={2}>
            <h2 className="meta text-faint">Languages</h2>
            <ul className="mt-8 space-y-3">
              {profile.languages.map((l) => (
                <li key={l.label} className="text-small">
                  <span>{l.label}</span>
                  <span className="text-muted"> — {l.level}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      </div>
    </>
  );
}
