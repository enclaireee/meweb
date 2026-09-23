import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/contact";

/** One page: the whole workshop. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
