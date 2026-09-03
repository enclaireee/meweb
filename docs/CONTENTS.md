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
cvName: Formal name on the CV      # CV record, used in structured data
summary: One-line tagline.         # home grid, work index, meta description
year: "2026"                       # string, quotes matter
period: May – Jul 2026
domain: Embedded systems           # shown beside the title everywhere
coverAlt: What the cover photo shows.   # REQUIRED. Also labels the placeholder
cover: /work/<slug>/cover.jpg      # optional until the photo exists
status: shipped                    # or: in-progress
featured: true                     # true = eligible for the 4-slot home grid
visible: true                      # optional, defaults true; false = gone everywhere
order: 4                           # sort position on /work
role: Front-end and component library   # optional
stack: [Arduino, INA219, C/C++]
tags: [embedded]                   # optional
links:                             # optional, any number
  - label: Source
    href: "https://github.com/…"
---
```

3. Body = the case study, in Markdown. Available components (no imports needed):
   - ```` ```python ```` fenced code → Shiki-highlighted `CodeBlock`
   - `<Figure alt="…" caption="…" ratio="3/2" want="work/<slug>/rig.jpg" bleed />`
     — `src` is optional. Without it you get a placeholder naming the file it
     wants, so you can write and lay out the essay before the photos exist.
     Add `src="/work/<slug>/rig.jpg"` when the photo lands. `bleed` widens the
     figure past the reading column on desktop.
   - `<Pair>` wrapping two `<Figure>`s — two photos of the same moment
   - `<Callout>…</Callout>`
   - `<Metrics items={[["Subjects", "6"], ["Accuracy", "71%"]]} />` — real
     numbers only, never rounded up
   - `<Video src="/demo.mp4" caption="…" />`
   - `<FeedbackLoop />` (the Refocus demo widget)

   Case pages are photo essays: lead with a `<Figure>`, then prose, then more
   figures. Captions should say what the photo shows *and* what went wrong.

4. `npm run build`. If it builds, the project is on the work index and its own
   route. It reaches the **home grid** only with `featured: true`, and only if
   it is one of the first four featured projects by `order` — the home grid is
   hand-laid for four shapes, so which four lead is an editorial choice you
   make in data, not a layout job.

## A job, a role, a degree

`content/experience/<slug>.mdx` and `content/education/<slug>.mdx` share one
schema and one component. Sorting is automatic — ongoing first, then newest
start date — so you never renumber anything.

```yaml
---
role: Automation & SCADA System Engineer Intern
org: PT PGAS Telekomunikasi Nusantara (PGNCOM)
start: Jun 2026                    # "Mon YYYY", validated
end: Aug 2026                      # or null for present
location: Jakarta, Indonesia       # optional
summary: One paragraph in your voice.
highlights:                        # optional; omitted entirely when empty
  - What you actually did, one line each.
tags: [scada, ot]                  # optional
links:                             # optional
  - label: Related case study
    href: "https://…"
featured: false                    # optional
visible: true                      # optional
order: 1                           # optional, breaks same-month ties only
---
```

Body is optional prose, rendered under the highlights.

## A skill, a skill category

One file per category: `content/skills/<slug>.mdx`. Adding a file adds a
category — no component to touch.

```yaml
---
label: Software
blurb: One line about the category.
order: 1
items:
  - name: Python
    context: Where you actually used it.      # optional
    related: [ot-observability-lab]           # optional project slugs
    years: 3                                  # optional
    featured: true                            # optional
  - name: MATLAB                              # no context = joins the quiet
---                                           #   "Also: …" line on /about
```

`related` slugs are checked against real project files at build time, so a
renamed project can never leave a dead skill link behind.

## Contact channels

`content/meta/contact.ts` — one object per channel: `label`, `display` (what
the page prints), `copy` (what the copy button puts on the clipboard), `href`,
`identity` (adds `rel="me"`), `icon`, `visible`. Adding a channel is one
object; it appears in the footer and in the JSON-LD `sameAs` automatically.

**The phone number is never rendered as text anywhere.** WhatsApp is a link
only. If you ever want the digits visible, that is a deliberate change here,
not an accident.

## Sections, footer, page copy, CV link

`content/meta/site.ts` — wordmark, the **section list**, timezone, the CV
download, the footer's words, and the page's meta description. Components own
layout, not words.

`site.sections` is the important one: it drives the header nav, the scroll-spy
and the footer nav from a single array. Add `{ id, label }` and give a section
that `id`, and all three follow.

## Identity, hero copy, awards, languages

`content/meta/profile.ts` — name, location, the greeting and its beats, about
paragraphs, awards, languages. Edit in place.

**If you change `greeting` or `greetingName`, run
`./scripts/build-greeting-font.sh`.** The width-axis animation uses a font
subset containing only those glyphs; new characters fall back to the primary
face and silently lose the axis.

`heroSupport` is deliberately parked — the copy is kept but not rendered. See
the comment on it.

## Motion timings

`content/meta/motion.ts` — the numbers components pass to the DOM, plus an index
of the ones CSS owns and where they live. Read the header comment before
editing; it is explicit about which half is which.

## Where the machinery lives (you shouldn't need it)

- `src/lib/content.ts` — registry: globs `content/`, validates with Zod, filters
  `visible`, sorts, and **fails the build** on a duplicate project `order` or a
  skill pointing at a project that does not exist.
- `src/components/ui/Timeline.tsx` — renders experience and education both.
- `src/components/mdx/` — the MDX component kit.
- `src/components/motion/` — curtain, split text, reveals, smooth scroll.

## The site is one page

`/` holds everything; `/work/<slug>` are the case studies. Clicking a project
**intercepts** into an overlay over the page (`src/app/@modal/`), while the same
URL loaded cold renders the full standalone page. `/work` and `/about` are 301s
to `/#work` and `/#about`.

**This arrangement has no type safety.** Rename the `work` folder and
interception stops silently — a full navigation, no error, no failed build.
After touching anything in `src/app/`, run:

```
npm run build && npx next start -p 3211 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/cdp about:blank &
node scripts/verify-expand.mjs        # URL, back, Escape, scroll, focus
node scripts/verify-a11y-and-fps.mjs  # tab order, focus trap, scroll framerate
```

Anything that patches the router or scroll can break this. `next-view-transitions`
already did once, silently.
