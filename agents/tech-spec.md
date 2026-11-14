# Technical spec (draft v0)

Principle (owner): **good + light.** Everything below is a proposal to validate with spikes; nothing is coded yet.

## 1. Stack
- **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4** (already in the repo). React Compiler is on.
- **No heavy animation framework by default.** Own tiny scroll timeline (see 3). GSAP/Lenis only if a spike shows a real need.
- **No WebGL by default.** Allowed only for one effect that 2D/CSS 3D cannot sell (decide at spike S2). If used, lazy-load it for that beat only.
- State: a tiny external store (`useSyncExternalStore`) for lane, sound and reduced-motion. Scroll progress is **not** React state.

## 2. Rendering model
- **One fixed full-viewport stage.** A tall spacer element gives native scroll height (~15 to 20 screens). The stage never scrolls; scene layers move by transform.
- **Layers are pre-baked raster sprites** (WebP/AVIF, optional PNG fallback): flat paper sheets with baked shadows, edge lights and holes, as in the v4 art pipeline. Raster sprites on the compositor are cheaper than huge SVG path trees.
- **Movement = `transform` and `opacity` only** (compositor properties). No layout, no per-frame paint, no filters per frame.
- **Glow / light through paper** = pre-baked glow sprites. Use `mix-blend-mode` sparingly (it is expensive); prefer pre-composited additive sprites and a few large overlays.
- **Particles** (fireflies, dust, spores): one small `<canvas>` 2D or CSS-driven sprites, capped count, paused off-screen.
- **Text and cards are real HTML** overlaid on the stage.

### Effects mapped to techniques
| Effect | Plan |
|---|---|
| Parallax layers | Per-layer translate/scale from scroll progress, baked depth blur/shadow |
| First Fold (mountain opens) | 2 to 4 panels with CSS 3D `rotateY` + perspective + baked shading overlays; it is a handful of elements, cheap on the compositor |
| Scale flip / zoom-through | Scale a group about the threshold point while the inner scene scales up from small; **swap to a hi-res inner scene while the opening hides the seam** to avoid blurry upscaling |
| Colour flip | Crossfade between two pre-baked palettes of the same layers, or tinted overlay; no live colour grading |
| Layers part like curtains | Opposing translate + slight rotate on sheet pairs with shadow sprites |
| Project lane flip | Stage turns (CSS 3D) and swaps the lane content at mid-turn; the other lane is unmounted |
| Creatures | Sprite sheets or 2 to 5 pose cutouts with transform animation; no skeletal rig |
| Traveller figure | Small walk-cycle sprite sheet, advance driven by scroll distance, plus look-up pose |

## 3. Scroll engine (the only custom core)
- **Native scroll** (no scroll hijack). One `requestAnimationFrame` loop reads `scrollY` and computes `progress` (0 to 1), plus optional velocity.
- **Timeline:** each beat owns a progress range; each layer/element declares keyframes `{at, x, y, scale, rotate, opacity, ...}` with easing. The engine interpolates and writes styles **directly to DOM nodes** (or CSS custom properties) outside React.
- **Reversible by construction** (stateless function of progress).
- Only **active beats (current ± 1)** are mounted and updated; others are skipped.
- Smoothing: small critically-damped lerp on progress (optional) for a glide feel; reduced-motion disables it.
- Unit-testable pure functions for timeline evaluation (Vitest).

## 4. Lanes
- **Main lane:** the 10-beat journey, one scroll timeline.
- **Projects lane:** a second timeline with its own scroll range. Entering stores the main progress, flips the stage, and scrolls the lane from 0; exit restores the exact main position.
- Fork objects in the main lane are real focusable buttons positioned over the art (keyboard and screen-reader reachable).

## 5. Content and modularity
```
src/content/
  profile.ts            # name, bio lines, contact
  projects/
    index.ts            # registry: the ONLY file touched to add a project
    <id>.ts             # one project
```
A project entry (typed):
```ts
type Project = {
  id: string; title: string; year: string; role: string;
  summary: string; links: { label: string; href: string }[];
  media?: { src: string; alt: string }[];
  tags?: string[];
  chamber?: { slot?: number; scene?: () => Promise<{ default: ComponentType }> }; // optional custom art
};
```
- The shell/lane **renders chambers from the registry**. No engine changes to add a project.
- Without `chamber.scene`, a generic chamber template is used.
- **Deep links:** `/p/[id]` (statically generated) renders the same app opened in the project lane, with correct metadata and OG image. Home `/` is the main lane.

## 6. Performance budget (proposal)
| Metric | Target |
|---|---|
| Frame rate | 60fps on a mid-range phone and a 5-year-old laptop; never below 30fps on low-end |
| First meaningful view (beat 0) | Under 1.5s on fast 4G; beat 0 + 1 art under about 400 KB |
| Total art | Roughly 6 to 10 MB, **streamed per beat** (preload the next beat, drop the previous) |
| Composited layers per beat | Up to about 12 to 16 |
| JS | Under about 120 KB gzipped for the engine + app shell |
| Memory | Mind decoded texture size; cap sprite dimensions, use 1x on weak devices |
- Adaptive quality: detect low-end (`navigator.hardwareConcurrency`, device memory, frame-time sampling) and drop particles/overlays.
- Use `content-visibility`, `will-change` sparingly, `decoding="async"`, `IntersectionObserver` for off-screen pause.

## 7. Accessibility and fallbacks
- Real HTML text; semantic order matches the journey.
- `prefers-reduced-motion`: replace transitions with simple cross-dissolves; no parallax; keep content.
- No-JS / crawlers: server-rendered linear content (beats' captions and all projects) readable as plain sections.
- Keyboard: focusable forks, visible focus, skip link. Sound off by default with a clear toggle.
- No flashing; colour contrast checked on text overlays (add soft scrims where needed).

## 8. Art pipeline (confirmed)
- Art is authored **procedurally as SVG by script** (cut jitter, shadows, holes), then rasterised to WebP/AVIF with baked shadows/glows. This is how v4 worked (see git history `ddb6cdc`: `art/*.ts`, using `sharp`, `clipper2-ts`, `simplex-noise`, `svgpath`).
- Scripts live in `art/` (dev-only, not shipped). Baked output in `public/art/<beat>/`.
- Style rules: `reference-v4-art-direction.md`, tokens: `reference-v4-design-tokens.md` (to be adapted to the new world's warm inside).

## 9. Proposed structure
```
src/
  app/            layout, page (main lane), p/[id]/page (project deep link)
  engine/         scroll loop, timeline, stage, layer, lane, audio, quality
  world/          beats/*, figure, creatures, forks
  content/        profile, projects registry
art/              build scripts (dev only)
public/art/       baked, per-beat assets
agents/           these notes
```

## 10. Testing
- **Vitest:** timeline evaluation, registry validation (unique ids, required fields).
- **Playwright:** deterministic screenshots at fixed scroll progress for each beat (visual regression), plus a frame-time sampling test in Chromium with CPU throttling.
- Lint + type-check + build in CI.

## 11. Spikes (before building everything)
| # | Question | Pass criteria |
|---|---|---|
| S1 | Scroll engine + 12 parallax layers + particles | 60fps desktop, 30+ fps with 4x CPU throttle |
| S2 | First Fold: CSS 3D panels vs WebGL | Looks convincing; WebGL only if CSS clearly fails |
| S3 | Zoom-through scale flip with asset swap | No visible blur or seam |
| S4 | Lane flip and exact return | State restored, no jump |
| S5 | Figure walk cycle driven by scroll, both palettes | Readable, reversible |

## 12. Risks
- Large raster layers stress memory on phones: mitigate with per-beat streaming, 1x on low-end, sprite size caps.
- Zoom-through upscaling blur: asset swap trick (S3).
- Art volume: 10 beats x ~12 layers + creatures + chambers is a lot; keep chambers templated and creatures few-pose.
- Reduced-motion and no-JS parity add work: build the linear content first so it is never an afterthought.

## 13. Confirmed decisions
- **Art:** procedural by code, owner art-directs (section 8 is now confirmed).
- **Targets:** mid-range phone + 4 to 5 year old laptop smooth; adaptive quality for weaker devices.
- **Mobile:** full portrait recomposition. Implication: each beat needs a **desktop composition and a portrait composition** (same layers, different arrangement/crops/camera), roughly doubling composition design work. The layer sprites should be authored with a **safe-area and an extended bleed** so both aspect ratios can be framed from the same art where possible. The timeline accepts per-breakpoint keyframes.
- **Hosting:** Vercel. No analytics (no tracking scripts; keeps JS lean and privacy clean).

## 14. Added by content decisions
- **i18n (EN + ID):** a content dictionary per language (`src/content/i18n/{en,id}.ts` or per-entry fields) and a nav toggle. Persist choice (`localStorage`, `?lang=`), default from `Accept-Language`. Deep links keep language. All captions, labels and project text come from the dictionary; no text in art.
- **Layout rule:** big lines and labels must fit both languages (Indonesian is usually longer); test both in visual regression.
- **Static generation:** `/` and `/p/[id]` generated per language (e.g. `/en`, `/id` or a `lang` param), with `hreflang`.
- **Project schema** gains localized fields: `title`, `summary`, `role` as `{ en, id }`.
- **Screenshots:** stored under `public/projects/<id>/`, optimized (WebP/AVIF, sized), lazy-loaded when a chamber opens.
- **CV download:** a static PDF in `public/`, linked from The Window. No phone number anywhere in site content.
