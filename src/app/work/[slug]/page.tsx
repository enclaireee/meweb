import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { projects } from "@/content";
import { SplitLines } from "@/components/motion/SplitLines";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Placeholder } from "@/components/ui/Placeholder";
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

  return (
    <>
      <main className="px-gutter pt-section">
        <header className="grid grid-cols-12 gap-x-4">
          <div className="col-span-12 lg:col-span-8">
            <p className="annot text-muted">
              {String(index + 1).padStart(2, "0")} / {project.domain}
            </p>
            <SplitLines as="h1" immediate className="font-display text-hero mt-6">
              {project.title}
            </SplitLines>
            <Reveal delay={0.3} className="mt-8 max-w-xl">
              <p className="font-display text-lead italic text-muted">{project.tagline}</p>
            </Reveal>
          </div>
          <div className="annot col-span-12 mt-8 flex flex-col gap-1 text-muted lg:col-span-3 lg:col-start-10 lg:mt-2 lg:text-right">
            <p>{project.timeframe}</p>
            <p>{project.stack.join(" · ")}</p>
            {project.status === "in-progress" && (
              <p className="text-accent">● in progress</p>
            )}
          </div>
        </header>

        <ImageReveal from="bottom" className="mt-16 aspect-[16/9] w-full lg:aspect-[2/1]">
          <Placeholder id={projectPlaceholder[project.slug]} />
        </ImageReveal>
        <p className="annot mt-2 text-muted">Fig. 01 — {project.cvName}</p>

        <div className="grid grid-cols-12 gap-x-4 gap-y-12 py-section">
          <div className="col-span-12 space-y-6 lg:col-span-6 lg:col-start-2">
            {project.description.map((para, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="max-w-prose text-lead">{para}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="col-span-12 lg:col-span-3 lg:col-start-9">
            <p className="annot text-muted">specifics</p>
            <ul className="mt-4 space-y-3 border-t border-border pt-4">
              {project.details.map((d) => (
                <li key={d} className="text-sm leading-relaxed text-muted">
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <nav aria-label="Next project" className="border-t border-border py-10">
          <Link
            href={`/work/${next.slug}`}
            data-cursor="next"
            className="group flex items-baseline justify-between gap-4"
          >
            <span className="annot text-muted">next project</span>
            <span className="font-display text-heading transition-colors duration-300 group-hover:text-accent">
              {next.title} →
            </span>
          </Link>
        </nav>
      </main>
      <Footer />
    </>
  );
}
