/** Single source for the canonical URL. Set NEXT_PUBLIC_SITE_URL once a
 *  custom domain exists; falls back to the Vercel production URL, then dev. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
