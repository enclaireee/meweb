import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TransitionLink from "next/link";
import { getProjects } from "@/lib/content";
import { projectJsonLd } from "@/lib/jsonld";
import { CaseStudy } from "@/components/ui/CaseStudy";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProjects().find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const projects = getProjects();
  const { slug } = await params;
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd(p)) }}
      />

      <CaseStudy project={p} />

      {/* Leaving a case study steps back down into the archive: the next-case
          link uses the same recess as the work index. */}
      <TransitionLink
        href={`/work/${next.slug}`}
        className="field-sunk group mt-40 block"
      >
        <div className="mx-auto flex max-w-page flex-wrap items-baseline justify-between gap-x-12 gap-y-3 px-gutter py-16">
          <p className="text-title font-semibold transition-colors duration-(--dur-micro) group-hover:text-accent">
            {next.title}
          </p>
          <p className="meta text-faint">Next case study</p>
        </div>
      </TransitionLink>
    </article>
  );
}
