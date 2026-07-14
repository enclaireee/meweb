/**
 * Content registry — the ONLY way pages read content. Globs content/<kind>/,
 * parses frontmatter, and validates with Zod at build time: a bad file fails
 * the build loudly with its filename. Adding a project = dropping one .mdx
 * file into content/projects/. Server-only (fs).
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const ROOT = path.join(process.cwd(), "content");

const ProjectSchema = z.object({
  title: z.string(),
  cvName: z.string(),
  summary: z.string(),
  year: z.string(),
  period: z.string(),
  domain: z.string(),
  status: z.enum(["shipped", "in-progress"]),
  featured: z.boolean().default(false),
  order: z.number(),
  stack: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
  links: z
    .object({
      repo: z.string().url().optional(),
      live: z.string().url().optional(),
      paper: z.string().url().optional(),
    })
    .default({}),
  cover: z.string().optional(),
  gallery: z.array(z.string()).default([]),
});

const ExperienceSchema = z.object({
  org: z.string(),
  role: z.string(),
  start: z.string(),
  end: z.string().nullable(),
  location: z.string(),
  summary: z.string(),
  order: z.number(),
});

const SkillGroupSchema = z.object({
  label: z.string(),
  blurb: z.string(),
  order: z.number(),
  items: z.array(z.string()).min(1),
});

export type Project = z.infer<typeof ProjectSchema> & { slug: string; body: string };
export type Experience = z.infer<typeof ExperienceSchema> & { slug: string; body: string };
export type SkillGroup = z.infer<typeof SkillGroupSchema> & { slug: string };

function load<T extends { order: number }>(
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
    .sort((a, b) => a.order - b.order);
}

export const getProjects = (): Project[] => load("projects", ProjectSchema);
export const getProject = (slug: string): Project | undefined =>
  getProjects().find((p) => p.slug === slug);
export const getExperience = (): Experience[] => load("experience", ExperienceSchema);
export const getSkills = (): SkillGroup[] => load("skills", SkillGroupSchema);
