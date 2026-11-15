# Open questions

Only things that are **still undecided**. Decided items live in `decisions.md`. Agents must not build on anything listed here; use the stated placeholder behaviour instead.

## Content (owner must supply; build with placeholders)
1. **LinkedIn and GitHub URLs.** Until supplied: the link is hidden when its `href` is empty.
2. **CV PDF.** Until supplied: the download button is hidden when `public/cv.pdf` is absent (flag in `profile.ts`).
3. **Project screenshots, live URLs, repo links.** Until supplied: empty `media` / `links`; cards render without them.
4. **Hidden CV items:** not answered; assume all shown.

## Technical
5. **Browser support floor:** working assumption is the last 2 versions of Chrome, Safari, Firefox, Edge.
6. **Exact performance budget:** `tech-spec.md` section 6 stands until the pilot (beats 0 to 3) is measured.
