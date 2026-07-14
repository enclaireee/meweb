# Phase 0 — Audit & Demolition Plan

Branch: `redesign/v2` (from `main` @ `9c4f47c`). `main` is the intact fallback.
User WIP (lavender retheme + portrait) is safe in `git stash` as
"lavender retheme + hero portrait (pre-redesign/v2 WIP)".

## Inventory

| Area | Files | Notes |
|---|---|---|
| Routes | `/`, `/about`, `/contact`, `/work`, `/work/[slug]` (3 SSG slugs), 404 | All static; compositions built on old design system |
| Design system | `globals.css` (212 ln: tokens, type scale, utilities), `lib/motion.ts`, `lib/gsap.ts` | "Schematic Editorial" tokens + motion language |
| Components | 24 files — `motion/` (7), `ui/` (6), `sections/` (5), `about|work|contact/` (6) | All styled against old tokens |
| Providers | `Theme.tsx` (next-themes), `SmoothScroll.tsx` (Lenis) | Thin wrappers around deps |
| Content | `src/content/` — profile, experience, projects, capabilities, types, index, placeholders | TS data files, no prose in components |
| Assets | `src/app/favicon.ico`; `public/` currently empty (portrait is in the stash) | |
| Docs | `DESIGN.md`, `PLACEHOLDERS.md`, `README.md` | All describe the old system |
| Infra | `next.config.ts` (empty defaults), `postcss.config.mjs`, `tsconfig.json`, `eslint.config.mjs` | No CI, no vercel.json, no analytics — Vercel zero-config |
| Deps | next 16, react 19, tailwind v4, motion, gsap + @gsap/react, lenis, next-themes, next-view-transitions | Last five are design-layer choices |

Note: `layout.tsx` loads Playfair Display + Inter, while README/DESIGN.md claim
Newsreader + Hanken Grotesk — the docs drifted from the code. Moot after demolition.

## Keep (infra + content)

- `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `eslint.config.mjs`, `package.json`
- `src/content/` — **except** `placeholders.ts` (see below)
- `src/app/favicon.ico`
- `README.md` — kept but stale; rewritten in Phase 8
- Metadata block from `layout.tsx` — salvaged into the new root layout

## Demolish (design layer)

### Delete — 33 files

```
src/app/globals.css
src/app/layout.tsx            (metadata block salvaged into stub first)
src/app/page.tsx
src/app/not-found.tsx
src/app/about/page.tsx
src/app/contact/page.tsx
src/app/work/page.tsx
src/app/work/[slug]/page.tsx
src/components/               (entire tree — all 24 files)
src/lib/motion.ts
src/lib/gsap.ts
src/lib/project-media.ts      (slug → placeholder-slot map for the old Placeholder component)
src/content/placeholders.ts   (image-slot specs for the old design, not CV content)
DESIGN.md
PLACEHOLDERS.md
src/.DS_Store, src/app/.DS_Store
```

### Deliberately NOT touched at demolition

- **Dependencies** (gsap, lenis, motion, next-themes, next-view-transitions):
  uninstalling before Phase 2 picks a concept is churn — some may return.
  Prune in Phase 3/4 once the motion strategy is decided.
- `src/content/types.ts` — `PlaceholderSpec`/media-slot types referencing the old
  system get trimmed when the Phase 7 content schema is defined, not blindly now.

### Post-demolition state

A minimal stub `layout.tsx` + `page.tsx` (salvaged metadata, empty body, no CSS)
so `next build` stays green on the branch. Everything else waits for Phase 3+.
