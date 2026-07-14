# How to add content (written for you at 2am)

Everything the site says lives in `content/`. Pages never hard-code copy.

## Add a project (the only thing you'll usually do)

1. Create **one file**: `content/projects/<slug>.mdx`. The filename is the URL
   (`/work/<slug>`). That's it — no imports, no arrays, no component edits.
2. Frontmatter (validated by Zod at build time — a typo **fails the build**
   with the filename and field):

```yaml
---
title: Sunmeter                    # display title
cvName: Formal name on the CV      # shown in the SPEC rail
summary: One-line tagline.         # cards, work index, meta description
year: "2026"                       # string, quotes matter
period: May – Jul 2026
domain: Embedded systems           # shown uppercase on the work index
status: shipped                    # or: in-progress
featured: true
order: 4                           # sort position everywhere
stack: [Arduino, INA219, C/C++]
tags: [embedded]                   # optional
links: { repo: "https://…", live: "https://…", paper: "https://…" }  # all optional
---
```

3. Body = the case study, in Markdown. Available components (no imports needed):
   - ```` ```python ```` fenced code → Shiki-highlighted `CodeBlock`
   - `<Figure src="/foo.png" alt="…" caption="…" />`
   - `<Callout tag="TRADEOFF">…</Callout>`
   - `<Metrics items={[["LATENCY", "12ms"], ["UPTIME", "99.9%"]]} />`
   - `<Compare before="V1" after="V2">…two children…</Compare>`
   - `<Video src="/demo.mp4" caption="…" />`
   - `<Embed src="https://…" title="…" />`
   - `<FeedbackLoop />` (the Refocus demo widget)
   - `## Specifics` + a `-` list renders with accent square bullets

4. `npm run build`. If it builds, the project is on the home grid, the work
   index, and its own route. Done.

## Experience / skills

Same pattern: `content/experience/<slug>.mdx` (frontmatter: org, role, start,
`end: null` = present, location, summary, order; body = highlight bullets) and
`content/skills/<slug>.mdx` (label, blurb, order, items).

## Profile, education, awards

Plain data in `content/meta/profile.ts` — name, email, socials, hero copy,
about paragraphs, education, awards. Edit in place.

## Where the machinery lives (you shouldn't need it)

`src/lib/content.ts` — registry: globs `content/`, validates (Zod), sorts by
`order`. `src/components/mdx/` — the MDX component kit.
