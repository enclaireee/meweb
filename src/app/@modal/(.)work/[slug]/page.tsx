import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/content";
import { CaseStudy } from "@/components/ui/CaseStudy";
import { ProjectOverlay } from "@/components/ui/ProjectOverlay";

/**
 * Intercepts /work/<slug> when it is reached from the page itself, so the case
 * study opens over the index instead of navigating away. A cold load of the
 * same URL misses this and renders src/app/work/[slug]/page.tsx — the full
 * standalone page. Same URL, same content, two arrivals.
 */
export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export default async function InterceptedProject({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <ProjectOverlay slug={slug} titleId={`case-${slug}-title`}>
      <CaseStudy project={project} heading="h2" headingId={`case-${slug}-title`} />
    </ProjectOverlay>
  );
}
