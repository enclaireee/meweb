import type { Lang } from '@/content';
import { World } from '@/world/World';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  return <World lang={(await params).lang as Lang} />;
}
