import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { siteUrl } from "@/lib/site";

/** One page plus the case studies. /work and /about are 301s now (see
 *  next.config.ts) and a sitemap must not advertise redirects. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, priority: 1 },
    ...getProjects().map((p) => ({ url: `${siteUrl}/work/${p.slug}`, priority: 0.8 })),
  ];
}
