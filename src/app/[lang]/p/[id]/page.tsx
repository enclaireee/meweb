import type { Metadata } from 'next';
import { getProject, projects, type Lang } from '@/content';
import { World } from '@/world/World';

type Params = Promise<{ lang: string; id: string }>;

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, id } = await params;
  const p = getProject(id);
  if (!p) return {};
  return {
    title: p.title[lang as Lang],
    description: p.summary[lang as Lang],
    alternates: { canonical: `/${lang}/p/${id}`, languages: { en: `/en/p/${id}`, id: `/id/p/${id}` } },
  };
}

// Same world, opened in the projects lane on this project.
export default async function ProjectPage({ params }: { params: Params }) {
  const { lang, id } = await params;
  return <World lang={lang as Lang} projectId={id} />;
}
