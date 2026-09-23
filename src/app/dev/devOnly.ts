import { notFound } from "next/navigation";

/**
 * /dev/* is for review only (architecture.md §1): 404 in production builds, unless a review
 * build opts in with ALLOW_DEV_ROUTES=1.
 */
export function devOnly() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEV_ROUTES !== "1") notFound();
}
