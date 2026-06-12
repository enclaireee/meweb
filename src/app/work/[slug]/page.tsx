import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { projects } from "@/content";
import { SplitLines } from "@/components/motion/SplitLines";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Placeholder } from "@/components/ui/Placeholder";
import { ReadProgress } from "@/components/work/ReadProgress";
import { Footer } from "@/components/ui/Footer";
import { projectPlaceholder } from "@/lib/project-media";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — Muhammad Fatih Zamzami`,
    description: project.tagline,
  };
}

/**
 * Scroll-told case study: a full-height intro beat with the index numeral
 * looming behind the title, a reading meter along the top, media that wipes
 * in at the fold, and a sticky specifics rail beside the narrative.
 */
export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const num = String(index + 1).padStart(2, "0");

  return (
    <>
      <ReadProgress />
      <main>
        {/* intro beat — one full viewport */}
        <header className="relative flex min-h-svh flex-col justify-between overflow-hidden px-gutter pb-10 pt-section">
          {/* looming numeral */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-6 select-none font-display text-[clamp(10rem,32vw,26rem)] leading-none text-surface lg:-right-8"
          >
            {num}
          </span>

          <div className="relative">
            <p className="annot text-muted">
              case {num} — {project.domain}
            </p>
            <SplitLines as="h1" immediate delay={0.15} className="font-display text-hero mt-6">
              {project.title}
            </SplitLines>
            <Reveal delay={0.5} className="mt-6 max-w-xl">
              <p className="font-display text-lead italic text-muted">{project.tagline}</p>
            </Reveal>
          </div>

          <Reveal delay={0.7}>
            <dl className="annot grid grid-cols-2 gap-y-2 border-t border-border pt-5 text-muted sm:grid-cols-4">
              <div>
                <dt className="sr-only">Timeframe</dt>
                <dd>{project.timeframe}</dd>
              </div>
              <div>
                <dt className="sr-only">Stack</dt>
                <dd>{project.stack.slice(0, 3).join(" · ")}</dd>
              </div>
              <div>
                <dt className="sr-only">Status</dt>
                <dd>
                  {project.status === "in-progress" ? (
                    <span className="text-accent">● in progress</span>
                  ) : (
                    "shipped"
                  )}
                </dd>
              </div>
              <div className="text-right">
                <dt className="sr-only">Hint</dt>
                <dd>scroll ↓</dd>
              </div>
            </dl>
          </Reveal>
        </header>

        {/* media */}
        <ImageReveal from="bottom" className="aspect-[16/9] w-full lg:aspect-[2/1]">
          <Parallax amount={6} className="h-full w-full">
            <Placeholder id={projectPlaceholder[project.slug]} />
          </Parallax>
        </ImageReveal>
        <p className="annot px-gutter pt-2 text-muted">
          Fig. {num} — {project.cvName}
        </p>

        {/* narrative + sticky specifics */}
        <section className="grid grid-cols-12 gap-x-4 px-gutter py-section">
          <div className="col-span-12 space-y-8 lg:col-span-6 lg:col-start-2">
            {project.description.map((para, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <p className="max-w-prose text-lead">{para}</p>
              </Reveal>
            ))}
          </div>
          <div className="col-span-12 mt-12 lg:col-span-3 lg:col-start-9 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              <Reveal>
                <p className="annot text-muted">specifics</p>
                <ol className="mt-4 space-y-4 border-t border-border pt-4">
                  {project.details.map((d, i) => (
                    <li key={d} className="flex gap-4 text-sm leading-relaxed text-muted">
                      <span className="annot shrink-0 pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                      {d}
                    </li>
                  ))}
                </ol>
                <p className="annot mt-8 border-t border-border pt-4 text-muted">
                  {project.stack.join(" · ")}
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* next case — full-width punch */}
        <nav aria-label="Next project" className="border-t border-border">
          <Link
            href={`/work/${next.slug}`}
            data-cursor="next"
            className="group block px-gutter py-16"
          >
            <p className="annot text-muted">next case</p>
            <p className="font-display text-title mt-3 inline-flex items-baseline gap-4 transition-all duration-300 ease-(--ease-out-expo) group-hover:translate-x-2">
              {next.title}
              <span className="annot text-muted transition-colors duration-300 group-hover:text-accent">
                →
              </span>
            </p>
          </Link>
        </nav>
      </main>
      <Footer />
    </>
  );
}
