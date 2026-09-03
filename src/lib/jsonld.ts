import { profile } from "@content/meta/profile";
import { channels, visibleChannels } from "@content/meta/contact";
import { siteUrl } from "@/lib/site";
import type { Project } from "@/lib/content";

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  email: channels.find((c) => c.id === "email")?.href,
  url: siteUrl,
  jobTitle: profile.role,
  affiliation: { "@type": "CollegeOrUniversity", name: "Universitas Indonesia" },
  address: { "@type": "PostalAddress", addressLocality: "Depok", addressCountry: "ID" },
  sameAs: visibleChannels.filter((c) => c.identity).map((c) => c.href),
};

export const projectJsonLd = (p: Project) => ({
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: p.title,
  alternateName: p.cvName,
  description: p.summary,
  url: `${siteUrl}/work/${p.slug}`,
  dateCreated: p.year,
  keywords: [...p.stack, ...p.tags].join(", "),
  author: { "@type": "Person", name: profile.name, url: siteUrl },
});
