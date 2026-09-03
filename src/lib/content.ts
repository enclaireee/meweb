/**
 * Content registry — the ONLY way pages read content. Globs `content/<kind>/`,
 * parses frontmatter, validates with Zod at build time: a bad file fails the
 * build loudly with its filename and the offending field. Server-only (fs).
 *
 * ─── How to add things ──────────────────────────────────────────────────────
 *
 * A JOB, A ROLE, A DEGREE → one file in content/experience/ or content/education/.
 *   Both use TimelineSchema, both render through the same component. Filename
 *   is the id. `end: null` means present. Sorted automatically: ongoing first,
 *   then newest start date — you never renumber anything.
 *
 * A PROJECT → one file in content/projects/. Filename is the URL (/work/<slug>).
 *   Body is the case study in MDX. `featured: true` puts it on the home grid
 *   (first 4 by `order`); everything visible shows on /work regardless.
 *
 * A SKILL → add an item to the `items:` list of a group in content/skills/.
 * A SKILL CATEGORY → a new file in content/skills/. No component to touch.
 *   `related:` holds project slugs and is checked against real files at build
 *   time, so a renamed project can't leave a dead link behind.
 *
 * HIDE ANYTHING → `visible: false`. It disappears from every surface at once.
 *
 * Identity, contact channels and site config are NOT here — they have no body
 * and are needed by client components, so they live in content/meta/*.ts.
 * ────────────────────────────────────────────────────────────────────────────
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const ROOT = path.join(process.cwd(), "content");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Dates are written the way a CV writes them. Validated here so the sort
 *  below can assume the format and the error names the file that broke it. */
const MonthYear = z
  .string()
  .regex(new RegExp(`^(${MONTHS.join("|")}) \\d{4}$`), 'expected "Mon YYYY", e.g. "Jan 2026"');

/** Months since year 0. An open end is +Infinity, so ongoing sorts as "now". */
function monthKey(v: string | null): number {
  if (v === null) return Number.POSITIVE_INFINITY;
  const [m, y] = v.split(" ");
  return Number(y) * 12 + MONTHS.indexOf(m);
}

const LinkSchema = z.object({ label: z.string(), href: z.string().url() });

/** One shape for everything timeline-like: experience today, education today,
 *  anything dated tomorrow. One schema, one component, one sort. */
const TimelineSchema = z.object({
  role: z.string(),
  org: z.string(),
  location: z.string().optional(),
  start: MonthYear,
  end: MonthYear.nullable(),
  summary: z.string(),
  highlights: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  links: z.array(LinkSchema).default([]),
  featured: z.boolean().default(false),
  visible: z.boolean().default(true),
  /** Tiebreak only — entries starting the same month. Sorting is by date. */
  order: z.number().optional(),
});

const ProjectSchema = z.object({
  title: z.string(),
  cvName: z.string(),
  /** Optional: unset until you say what your role actually was. */
  role: z.string().optional(),
  summary: z.string(),
  year: z.string(),
  period: z.string(),
  domain: z.string(),
  status: z.enum(["shipped", "in-progress"]),
  featured: z.boolean().default(false),
  visible: z.boolean().default(true),
  order: z.number(),
  stack: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
  links: z.array(LinkSchema).default([]),
  /** Path under /public once the photo exists; omit and Frame shows a
   *  placeholder naming the file it wants. coverAlt is required either way —
   *  it is the placeholder's label as well as the image's alt text. */
  cover: z.string().optional(),
  coverAlt: z.string(),
});

const SkillSchema = z.object({
  name: z.string(),
  /** Where it was actually used. Omit and the skill renders as a bare name. */
  context: z.string().optional(),
  /** Project slugs that prove it. Validated against content/projects/. */
  related: z.array(z.string()).default([]),
  years: z.number().optional(),
  featured: z.boolean().default(false),
});

const SkillGroupSchema = z.object({
  label: z.string(),
  blurb: z.string(),
  order: z.number(),
  visible: z.boolean().default(true),
  items: z.array(SkillSchema).min(1),
});

export type Link = z.infer<typeof LinkSchema>;
export type TimelineEntry = z.infer<typeof TimelineSchema> & { slug: string; body: string };
export type Project = z.infer<typeof ProjectSchema> & { slug: string; body: string };
export type Skill = z.infer<typeof SkillSchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema> & { slug: string };

function load<T extends { visible: boolean }>(
  kind: string,
  schema: z.ZodType<T>,
): (T & { slug: string; body: string })[] {
  const dir = path.join(ROOT, kind);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        throw new Error(
          `Invalid frontmatter in content/${kind}/${file}:\n${parsed.error.issues
            .map((i) => `  ${i.path.join(".")}: ${i.message}`)
            .join("\n")}`,
        );
      }
      return { slug, body: content.trim(), ...parsed.data };
    })
    .filter((e) => e.visible);
}

/** Ongoing first, then newest. `order` only breaks ties. */
const byRecency = (a: TimelineEntry, b: TimelineEntry) =>
  monthKey(b.end) - monthKey(a.end) ||
  monthKey(b.start) - monthKey(a.start) ||
  (a.order ?? 0) - (b.order ?? 0);

const timeline = (kind: string) => load(kind, TimelineSchema).sort(byRecency);

export const getExperience = (): TimelineEntry[] => timeline("experience");
export const getEducation = (): TimelineEntry[] => timeline("education");

/** The one role with no end date. Drives the home page's "Currently" block. */
export const getCurrentRole = (): TimelineEntry | undefined =>
  getExperience().find((e) => e.end === null);

export function getProjects(): Project[] {
  const projects = load("projects", ProjectSchema).sort((a, b) => a.order - b.order);
  // `order` is the editorial sequence and the index numbering, so a duplicate
  // does not just tie — it makes the numbering arbitrary and the sort unstable
  // between builds. Cheaper to fail here than to notice it in production.
  const seen = new Map<number, string>();
  for (const p of projects) {
    const clash = seen.get(p.order);
    if (clash) {
      throw new Error(
        `Duplicate order ${p.order} in content/projects/: "${clash}" and "${p.slug}". ` +
          `Every project needs its own position.`,
      );
    }
    seen.set(p.order, p.slug);
  }
  return projects;
}

export const getProject = (slug: string): Project | undefined =>
  getProjects().find((p) => p.slug === slug);

/** The home grid is hand-laid for a fixed number of shapes (src/app/page.tsx),
 *  so which projects lead is an editorial choice made in data, not a layout
 *  decision forced by adding a file. */
export const getFeaturedProjects = (limit: number): Project[] =>
  getProjects()
    .filter((p) => p.featured)
    .slice(0, limit);

export function getSkills(): SkillGroup[] {
  const groups = load("skills", SkillGroupSchema).sort((a, b) => a.order - b.order);
  const slugs = new Set(getProjects().map((p) => p.slug));
  for (const g of groups) {
    for (const item of g.items) {
      for (const slug of item.related) {
        if (!slugs.has(slug)) {
          throw new Error(
            `content/skills/${g.slug}.mdx: "${item.name}" points at project "${slug}", ` +
              `which is not a visible file in content/projects/.`,
          );
        }
      }
    }
  }
  return groups;
}
