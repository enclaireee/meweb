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
7. **Scroll performance (measured 2026-11-16, design pass c).** Headless Chromium without a GPU, 1280x800: main-lane scroll averages 25 to 28 fps before and after this pass (after is about 10% slower, in both high and low quality), 4x CPU throttle 3 to 6 fps; both builds miss the 60 / 30 fps budget, and JS is 198 KB gz (was 183, budget ~120). Prime suspects for the 10%: each in-scene heading adds a second full-viewport canvas (`split`), slot text recomputes on every --t change, and the large blurred heading halos re-raster as they scale with the dolly. Needs a measurement on real target devices (mid-range phone, 5-year-old laptop) before deciding on fixes.

