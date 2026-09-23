import type { ContactLink } from "./types";

/** Email, GitHub, LinkedIn only: no phone on a public page (decisions.md). */
export const contact = [
  { id: "email", label: "Email", href: "mailto:muhfatihzamzami@gmail.com", display: "muhfatihzamzami@gmail.com" },
  { id: "github", label: "GitHub", href: "https://github.com/enclaireee", display: "github.com/enclaireee" },
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/fatihzamzami", display: "linkedin.com/in/fatihzamzami" },
] satisfies ContactLink[];

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
