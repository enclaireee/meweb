export interface SocialLink {
  label: string;
  url: string;
  handle: string;
}

export interface Profile {
  name: string;
  shortName: string;
  role: string;
  location: string;
  email: string;
  /** One-line hero statement. Original copy, not from the CV. */
  heroLine: string;
  /** Short kicker shown near the hero line. */
  heroKicker: string;
  /** One pinned, scroll-scrubbed manifesto line. Original copy. */
  statement: string;
  /** The about narrative, written for the site. Facts sourced from the CV. */
  about: string[];
  socials: SocialLink[];
  availability: string;
}

export interface Project {
  slug: string;
  /** Display title for the site (may differ from the CV's formal project name). */
  title: string;
  /** The formal name as it appears on the CV, kept for reference. */
  cvName: string;
  year: string;
  timeframe: string;
  tagline: string;
  description: string[];
  /** Case-study specifics — rewritten from the CV's project bullets. */
  details: string[];
  stack: string[];
  /** Domain tag used for visual grouping, e.g. "BCI / Signal Processing". */
  domain: string;
  status: "shipped" | "in-progress";
  link?: string;
}

export interface ExperienceEntry {
  slug: string;
  org: string;
  role: string;
  start: string;
  end: string | null; // null = present
  location: string;
  summary: string;
  highlights: string[];
}

export interface EducationEntry {
  school: string;
  program: string;
  start: string;
  end: string | null;
  note: string;
}

export interface CapabilityGroup {
  label: string;
  /** Short framing sentence for the group. */
  blurb: string;
  items: string[];
}

export interface Award {
  title: string;
  issuer: string;
  year: string;
}
