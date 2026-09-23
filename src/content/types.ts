/** ISO month, e.g. "2026-06". `null` end = present. */
export type Month = `${number}-${number}`;

export type Dates = { start: Month; end: Month | null };

export type Fact = { value: string; label: string };

export type Award = { title: string; issuer: string; year: number };

export type Project = {
  id: string;
  slug: string;
  title: string;
  /** Short name for the depth tag / station label. */
  short: string;
  dates: Dates;
  /** The italic voice line on the plate front. */
  caption: string;
  facts: Fact[];
  stack: string[];
  /** Plate back: the full CV bullets. */
  bullets: string[];
  /** Empty until provided: never fabricate a URL. */
  links: { repo?: string; live?: string };
  awards?: Award[];
};

export type Role = {
  id: string;
  title: string;
  org: string;
  place?: string;
  dates: Dates;
  lines: string[];
};

export type SkillGroup = { label: string; items: string[] };

export type ContactLink = { id: "email" | "github" | "linkedin"; label: string; href: string; display: string };
