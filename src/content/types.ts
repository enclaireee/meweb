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
  /** Plate back: the story, told in three beats (paraphrased from the CV, nothing added). */
  story: { problem: string; built: string; result: string };
  /** The CV bullets, verbatim: kept as the source the story is written from. */
  bullets: string[];
  /** Empty until provided: never fabricate a URL. */
  links: { repo?: string; live?: string };
  awards?: Award[];
};

export type Role = {
  id: string;
  /** which board it hangs on at the Wall: jobs and teaching, or running things */
  kind: "work" | "leadership";
  title: string;
  org: string;
  place?: string;
  dates: Dates;
  /** one line for the card (paraphrased from the CV lines) */
  summary: string;
  lines: string[];
};

export type SkillGroup = { label: string; items: string[] };

export type ContactLink = { id: "email" | "github" | "linkedin"; label: string; href: string; display: string };
