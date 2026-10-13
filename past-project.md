# Past project: *The Night Workshop*

A conclusion of everything in `agents/`, written so the project can be rebuilt from scratch. The original docs are still in `agents/` until you delete them. Where two docs or two log entries disagree, the later entry wins, as `decisions.md` says. Items marked **(built)** shipped in the previous codebase. Items marked **(planned)** were specified but not confirmed as built.

Recovery: the last committed state is `4667c2f` on `main`. Uncommitted work from the final session is saved in the session scratchpad as `uncommitted.patch` and `backup/`.

---

## 1. The idea

A personal portfolio for **Muhammad Fatih Zamzami** that looks like a paper-cut diorama (a shadowbox) of a workshop at night.

- You arrive at a desk under a lamp. A small paper worker in an orange hard hat is waiting.
- You scroll and the camera walks you deeper into the box. The worker walks ahead along the floor and guides you.
- Each project is a station with its own paper set.
- At the far end is a lit window over a city. That is where you say hello.

**One line:** *An electrical engineer's work, cut from paper and pinned into a box you can walk through.*

The audience is recruiters and craft lovers equally. Both should be served from the same page. Text is real HTML and readable with JavaScript, WebGL or motion off. The 3D scene adds to the page and never gates it.

---

## 2. Design language: the Paper-Cut Diorama (`concept.md`)

The screen is a shadowbox with flat hand-cut sheets stood one behind another. Nothing is drawn on the screen. Everything is a physical object inside a box.

**Principles:** handmade, layered, staged.

**Material rules (non-negotiable):**
1. One colour per sheet. No gradients on paper; only light has gradients.
2. Imperfect edges that drift slightly along their length.
3. Depth from shadow. Closer sheets cast larger, softer, further-offset shadows.
4. A hairline highlight on the lit edge shows thickness.
5. Visible grain covers every surface, the backdrop included.
6. Openings are cut, not painted.
7. One light source. All shadows fall the same way.
8. Paper never stretches, squashes or morphs. It can shift, tilt, hinge, rotate, sway, lift and drop.
9. A single sheet never fakes volume. All 3D comes from how the sheets sit relative to each other and the light.

**Depth structure:** a subject is roughly 6–10 sheets. Back to front, value goes from lightest to darkest, saturation from muted to rich, silhouettes from simple to busy, and shadows from tight to wide. Parallax goes from barely moving to moving most.

**Dimensional effects to lean on:** parallax, a small whole-box tilt, a movable light that moves every shadow, exploded and collapsed layers, pop-up hinges, a camera dolly through layers, peeking and occlusion, hung objects with moving shadows, and sparing focus.

**Colour:**
- One material family, a value ramp from light to dark, one base hue family, and one rare warm accent.
- Warm neutral paper for the backdrop and UI. Ink is deep and warm, never black.
- Day and night are the same box relit, not a dark overlay. Stocks swap, the ramp order stays, shadows change temperature, and small glow lights appear at night.

**Typography:** one literary typeface, a spaced-caps kicker, italic for voice, and the accent on at most one title word. Keep text minimal.

**UI as paper objects:** titles hang on strings with a punched hole. Buttons are torn or cut scraps that lift on hover. Toggles are split-pin mechanisms. Hints are temporary labels.

**Motion:** every movement must be explainable by paper, string, card or hands. Slow over fast, soft easing, and overshoot only on things on strings or pivots. Under reduced motion, ambient life stops.

**The hero:** a small paper character, carrying the accent. He lives on one floor sheet, moves like a puppet, is never fully still, and reacts when touched.

**Voice:** a museum caption crossed with a picture book. Short, warm, lightly playful. Craft verbs: cut, fold, pin, hang.

**Do / Don't summary:** flat colour per shape, not gradients. Imperfect edges, not perfect curves. Real depth between sheets, not fake bevels. Hinges and small tilts, not free 3D spins. Shadows that respond to every depth change. One accent. Relight, not a dark overlay. Paper UI, not glassy material controls. Slow motion. One characterful hero, not empty scenery.

---

## 3. Experience and route (`portfolio_concept.md`)

**Eight stations, in order.** This order is decided and was confirmed by the user.

| # | Station | Content | Scene |
|---|---|---|---|
| 00 | **Desk** | Intro: name, role, summary, education | Desk, lamp (bulb = small light), mug, notebook, the worker, the cable plug |
| 01 | **Storeroom** | DemandX (Sep 2026) | Shelves of crates with reorder tags; a forecast line; one crate mid-reorder |
| 02 | **Control Room** | OT Observability Lab (Jun–Aug 2026) | Gas pipe with hinged valve; pressure gauge with pivoting needle; rack with pin-prick status lights |
| 03 | **Arcade Corner** | Refocus, EEG neuro-adaptive game (Feb–Apr 2025) | Paper head with EEG band; CRT with a cut-out level; brainwave strip |
| 04 | **Drafting Table** | KOMAT UNPAR 2025 (Mar–Aug 2025) | Tilted drafting board with a paper browser window; ∑ π √ cut-outs |
| 05 | **Sill** | Solar lighting system (May–Jun 2026) | Solar panel on a sill; LED on a hinge arm; tiny OLED readout card |
| 06 | **Wall** | Experience, awards, skills | Pegboard of skill tags on the left; corkboard of punched role cards on the right; ribbons for awards |
| 07 | **Window** | Contact | Window cut-out with the city beyond (lit windows); the cable ends at a wall socket |

**Why this order:** the newest and strongest work comes first. Hardware and software variety sits in the middle. Solar sits just before the window so the route rises toward the light. The Wall collects the CV for skimmers.

**Navigation:** a depth tag (`00 Desk … 07 Window`) doubles as the nav. It collapses to "03 / 07" on small screens. It uses anchors, so it works without JS. Project pages were out of scope: one page with anchors such as `/#demandx`.

**Content on paper objects:**
- **Title tag (00):** a hung tag with the `<h1>` name ("Fatih" in accent), kicker and italic summary.
- **Plates (01–05):** a specimen card. Front: "Plate 0N", title, dates, italic caption, 2–3 key facts, stack tags, "Turn over". Back: the full bullets. Both sides are always in the DOM. Flips are a CSS 3D hinge with `aria-expanded`.
- **Wall (06):** role cards and skill tags as HTML lists, ribbons for awards.
- **Window (07):** scrap buttons for email, GitHub and LinkedIn.
- **Relight dial:** a moon/sun disc on a split pin. It switches night and morning, and doubles as the theme.
- **Hint strip:** "Move to aim the lamp · Scroll to walk in". It fades after the first interaction.

**Light states:**
- **Night (default):** a warm lamp on the camera rig, aimed by the pointer. Small warm glow lights.
- **Morning:** the same box relit. Cool daylight from the window side. Small lights go out. The change rolls from the window outward.
- The theme follows `prefers-color-scheme` on the first visit, then the user's toggle is remembered in `localStorage`.

**First visit, in order:** HTML and poster arrive first (the poster is the LCP). The 3D chunk loads when idle. A pop-up entrance plays over about 1.8 s. The worker walks in. The hint appears, and the box idles.

**Out of scope:** case-study pages, a blog, a CV download (a possible scrap button later), a regenerate mode, sound, i18n.

---

## 4. The worker (hero)

- **Look:** a flat paper figure in an orange hard hat and vest (the accent). Ink shirt, paper skin. He sits on a dark backing sheet so he reads on the light floor.
- **Build:** a split-pin puppet with head, torso, arms, legs and clipboard. Joints rotate only about Z, plus one yaw pivot. Nothing stretches.
- **Idle:** one fidget every 4–7 s (adjust hat, look at the lamp, check clipboard, shift weight).
- **Walk:** procedural, with phase-driven joint angles and a small body bob. A slow walk and a brisk walk, with start and stop easing. The feet must not slide at contact.
- **Guide:** he walks the path ahead of the camera and reaches each station first. He speeds up when the scroll gets ahead of him. He never runs or jumps.
- **Turns:** he is a profile sheet, so he never goes edge-on. When the path zigzags he turns on his pivot, and the edge shows mid-turn.
- **Click:** he walks on to the next station, and the camera follows.
- **Reduced motion:** he stands still, and clicking jumps to the next station.
- **Talk (built):** hard-coded lines in `scene/worker/lines.ts`, shown in a paper speech bubble. Lines are dealt from a shuffled deck, so none repeats until the list runs out. He greets on arrival, replies on hover or focus and on click, chatters every 11–20 s, and reacts to relight. The lines are flavour only, with no facts beyond the CV.
- **Rest (built):** after 45 s without input he finishes his job and then only fidgets until someone moves.
- **Routines (built):** a different set of jobs in each room, reshuffled every loop. He sits on the bed in the last room.

---

## 5. Architecture (`architecture.md`): the engineering rulebook

**Ten overriding rules:**
1. Readable first, 3D second. HTML is complete with no canvas.
2. One source of truth per thing: content in `src/content`, tokens in `src/design/tokens.ts` (mirrored to `globals.css`), shapes from the SVG art, position from scroll.
3. One loop: the GSAP ticker is the only `requestAnimationFrame`.
4. One paper material: one shader program for every sheet. Nothing compiles mid-journey.
5. Nothing allocates per frame. Mutate refs. No React state in `useFrame`.
6. Work moves to build time. Wobble, clip-paths and the poster are baked by scripts.
7. Paper rules are code rules.
8. Budgets are tests.
9. Reduced motion and no-WebGL are first-class paths.
10. Every folder earns its place. No empty scaffolding.

**Folder layout (planned):**
```
agents/                    context docs
public/textures/           grain-normal.webp, grain-rough.webp (512², tiling)
public/poster/             desk-night.avif, desk-morning.avif (from scripts/poster)
scripts/cut/               SVG art pipeline: parse, lint, resample, wobble, clean, emit + tests
scripts/poster.mts         Playwright screenshot → AVIF
scripts/rooms.mts          bakes phone room layers (built)
src/app/                   thin routes: layout, page, not-found, globals.css, dev/ (404 in prod)
src/content/               typed content: types, profile, projects, experience, skills, awards, contact
src/design/tokens.ts       colours, ramps, depths, motion, worker params
src/sections/NN-slug/      one folder per station: Section.tsx (server HTML), Station.tsx (client 3D), art/*.svg + *.cut.json
src/sections/stations.ts   ordered manifest: the only place order is declared
src/scene/                 the 3D engine (client only, lazy chunk): loop, store, paper/, camera/, light/, worker/, motion/, quality/
src/ui/                    HTML paper objects: Frame, Plate, Hang, Board, SiteNav, ScrapButton, Ribbon, Icon, Deck…
src/lib/                   pure helpers: rng (mulberry32), math (damp, clamp, smoothstep), dates
```

**Folder rules:** station folders are `NN-slug`. `Section.tsx` is always a server component. `Station.tsx` is always a client component, imported only by the scene chunk. Generated files are committed. No barrel `index.ts` files. Imports use `@/`.

**Rendering layers:**
| Layer | What | Present |
|---|---|---|
| HTML shell | Frame, nav, title, plates, Wall, Window | Always |
| Poster | AVIF still of the desk, behind the HTML | Until the first 3D frame, then cross-fades out |
| Canvas | R3F workshop, `position: fixed`, `aria-hidden` | Only if the tier allows |

**Load sequence:** HTML, CSS and fonts arrive first. `SceneMount` checks WebGL2, `saveData` and tier, waits for idle (2 s timeout), then imports the scene chunk. The scene compiles the paper material, loads station 00, and renders frame 1 invisibly. The poster then cross-fades out and the entrance plays. Other stations load in the background as the camera approaches. The scene starts after the `load` event and idle.

**Canvas config:** `flat` (no tone mapping), `shadows="percentage"` (PCF), `dpr={[1, 1.75]}`, `frameloop="never"` (driven by the ticker), `alpha: false`, `camera fov 32, near 0.5, far 600`, `touch-action: pan-y`. Keep three's colour management on.

**Geometry:** `cut.json` → `Shape` → `ExtrudeGeometry` (depth 0.15, no bevel). Use world-space UVs, offset per sheet so the grain never visibly tiles. Merge static sheets per station (one draw call each). Animated parts stay separate meshes that share the material. The desk is individual meshes because the entrance hinges each sheet.

**The paper material:** one `MeshStandardMaterial` (roughness 0.92, metalness 0, vertex colours, grain normal and roughness maps), extended with `onBeforeCompile`. Per-vertex `colorNight`, `colorMorning` and `aOrder`. One `uRelight` uniform drives the whole relight roll with one tween. Glow uses a second basic material. Materials are app-lifetime singletons, compiled at scene start.

**Lights and shadows:**
- Night: a `SpotLight` on the camera rig, aimed at the pointer's hit on the stage plane.
- Morning: a `DirectionalLight` from the window side.
- Only one casts shadows at a time.
- Shadow map 1024 (low tier 512), PCF, tight frustum around the current station.
- Shadows update only when a light, the camera or a caster moves.
- Use a hemisphere light tinted by state, never grey ambient.

**Stations:** load lazily when the camera is 2 away, then stay mounted with `visible` toggled for stations within 3. Mount and unmount cause stutter, so do not do it. Fog (`near 40, far 260`) hides distant stations. `decisions.md` records that this supersedes an earlier "mount only nearby" note.

**Camera rig:** dolly z comes from scroll progress through a pure `progress → z` function (unit-tested). Pointer offset, box tilt and drift are layered with frame-rate-independent damping. The box tilt rotates the world group, not the camera.

**The single loop:** Lenis (`autoRaf: false`) and ScrollTrigger ride the GSAP ticker. `needsFrame()` decides whether anything moved this tick. If nothing moved, no frame is rendered. The ticker sleeps when the tab is hidden or the canvas is off-screen.

**State:** a zustand store (`station`, `light`, `tier`, `reducedMotion`). Fast values are read with `getState()` in the loop and never cause re-renders. The light aim is written to CSS `--light-x/y` at most once per frame.

**Input:** pointer, then touch drag tilts the box. Device tilt sits behind a "tilt to look" toggle, because iOS requires a permission prompt. The worker's HTML button is positioned over his projected screen position, so it is keyboard-accessible.

**Quality tiers:**

| Tier | When | DPR | Shadow map | Drift | Sway | Stations visible |
|---|---|---|---|---|---|---|
| high | default | ≤ 1.75 | 1024 | on | on | ±3 |
| mid | a monitor decline, or ≤ 4 cores | ≤ 1.25 | 512 | on | on | ±2 |
| low | a second decline, or ≤ 4 GB memory | 1 | 512, static only | off | off | ±1 |
| none | no WebGL2, `saveData`, lost context, third decline | no canvas | | | | poster + HTML |

Tiers only step down, never back up. The initial tier guess is unreliable on iOS, which reports 6+ cores and no memory. That is why phones were moved to a separate path.

---

## 6. SVG art pipeline (`architecture.md` §7)

- **Craft principles:** design the silhouette first (it must read solid at 64 px). Big masses with small crisp detail. Detail is cut as holes, never strokes. Low-frequency drift only, never jitter. Concave corners stay sharp. Minimum strip 0.2 units (2 mm). Minimum hole 0.3 units. No floating islands. No tangents. Break symmetry and grids. Complexity follows depth. One hidden reward per station.
- **Authoring:** one SVG per station, `viewBox="-32 0 64 40"`, author in normal y-down. One `<path>` per sheet with `id`, `data-z`, `data-stock` (R0–R7, accent, paper, ink, glow), optional `data-hinge`, `data-pivot`, `data-hang`, `data-cut`, `data-cast`. Forbidden: strokes, transforms, gradients, filters, text, images, `use`.
- **Pipeline (`npm run cut`):** parse, lint (fails the build), resample at 0.5 units, two-octave seeded wobble, clipper2 clean, RDP simplify at 0.01, emit `*.cut.json` and UI clip-paths. Output must be byte-identical for the same input. A test asserts that and includes a known-bad fixture.
- **Visual loop:** `/dev/art` shows silhouette, squint, stock and lint overlays. Screenshot and inspect each station before calling it done.

---

## 7. Visual system (`design.md`)

**Units:** 1 world unit ≈ 1 cm. Camera looks down −Z. Station 00 at z = 0. Module length **80** (set during the build, from 60).

**UI colours:**

| Token | Night | Morning |
|---|---|---|
| paper | `#E9DFCC` | `#F2EADB` |
| ink | `#2B2521` | `#2B2521` |
| ink-soft | `#5A4F46` | `#5A4F46` |
| accent | `#E8742F` | `#D9622B` |
| accent-text | `#C4531F` | `#B84A1A` |
| glow | `#FFD58A` | off |
| fog | `#6F7FA3` | `#EDE3D3` |
| sky | `#8FA0C0` | `#F7F0E4` |

**Scene ramp (back → front):** R0 sky, R1 far, R2 hung, R3 middle B, R4 middle A, R5 stage and floor, R6 detail, R7 arches and wings. Night runs from `#8FA0C0` down to `#0F1222`. Morning runs from `#F4EBDD` down to `#343A4B`.

**Contrast (verified):** ink/paper 11.4 night, 12.6 morning. ink-soft 6.0 and 6.7. accent-text is large-text only (3.45 and 4.36). The accent worker against the morning floor fails (1.4), hence the ink backing sheet.

**Typography:** one family, **Newsreader** (variable, `opsz` 6–72, `wght` 200–800, italic), self-hosted via `next/font`, `display: swap`, latin subset. Named styles: kicker (0.75 rem, uppercase, tracked), caption (italic), body, fact (1.5 rem, tabular numerals), plate title, hero (up to 4.75 rem).

**Layout:**
- **Frame mat:** a paper border, 10 px on desktop and 6 px on phones, with an inner shadow so the canvas reads as the box opening.
- **Desktop (≥ 1024):** plate in the right column (`min(420px, 34vw)`), sticky. Depth tag top-left. Dial top-right.
- **Tablet (640–1023):** plate at 44vw. Collapsed depth tag.
- **Phone (< 640):** a bottom card, max 56svh.
- **Scroll:** one section per station at 160svh. Within it, 0–30% travel in, 30–70% dwell, 70–100% travel out.

**Camera:** FOV 62° landscape and 74° portrait (set during the build, from 32°/50°). Rest 35 units in front of each arch at y 14, pitch −6°. Pointer offset ±2.5 / ±1.2. Box tilt yaw ±3°, pitch ±2°. Idle drift ±0.8 over a 16 s period.

**Station module (toy theatre):** arch at local z 0 (opening about 56 × 34). Detail at −6. Stage objects at −12 to −40. Middle A at −20 and middle B at −30. Hung objects at −34 (top y = 36). Far sheets at −42. Floor card at y 0. The aisle |x| < 8 stays clear for the cable and the worker. Station 07 closes with the window wall at z −610.

**The box:** dark side walls at x ±40 and a ceiling card at y 60.5, so the view never escapes past the wings. Arches don't cast shadows (`data-cast="false"`).

**Light:**
- Night: spotlight `#FFD9A8` on the rig at (−6, 10, 2), 38° angle, penumbra 0.8, decay 1.2. Hemisphere sky `#3A466B`, ground `#0F1222`, intensity 1.6, lamp 430.
- Morning: directional `#F2F4FF`, direction (0.2, −0.5, −0.84). The design doc's direction backlit every sheet's front, so it was changed.
- Shadows: PCF, radius 4, bias −0.0005, normalBias 0.02.
- Fog: near 40, far 260.
- Grain `normalScale` 0.28 (0.35 was too crunchy under raking light).

**Motion tokens:** ease-paper `cubic-bezier(0.45,0,0.2,1)`, ease-settle `cubic-bezier(0.22,1,0.36,1)`. Quick 180 ms, base 320 ms, slow 700 ms, relight 1200 ms per sheet, stagger 60 ms. Pointer damping λ 2.5. Lenis lerp 0.08. String spring stiffness 40, damping 5 (about 3 s to settle). Springs are only for strings and pins; scenery never overshoots.

**Choreography:**
- **Entrance (~1.8 s):** poster cross-fades out. Desk sheets hinge up back to front, 90 ms apart. The lamp flickers twice. The worker walks in. Return visits take 0.8 s with no flicker.
- **Dolly:** scroll-scrubbed. Arches slide past the edges. Fog lifts the next station into colour.
- **Relight:** sheets swap stock from the window side outward, 60 ms apart. Small lights change last (+300 ms).
- **Arrival:** the camera settles, the worker tips his hat, and the plate rises 12 px over 320 ms.

**Reduced motion:** no entrance, drift, sway, fidgets or springs. The dolly becomes a 200 ms cross-fade between rests. The relight is a single 400 ms fade. The pointer still aims the lamp.

---

## 8. Phone design: the layered dolly (`mobile_concept.md`) **(built)**

Phones (< 640 px) never load three.js. They get the rooms as **baked AVIF layers**, walked through with CSS scale.

- **Why:** the first attempt was a card-pull (kamishibai) and it failed. Cards covered the scene, the depth journey disappeared, and the swipe didn't register. Phones were also laggy and slow. iOS was rated "high" tier.
- **The idea:** the page scrolls one room per 40svh, with snap. A room is 5 flat bands. The camera walks forward, so each band scales by D / (D − Δ) about the vanishing point (`transform-origin: 50% 43%`). Near bands swell and fly out first. The next room grows in through the doorway.
- **Bands:** B0 is the whole room without its own sheets (weight 0.05). B1 back sheets (0.2). B2 middle and hung (0.45). B3 stage (0.7). B4 arch, detail and wings (1). Depths from rest: 120, 78, 67, 50, 36.
- **Baking:** `npm run rooms` against a production build. Output is `public/rooms/<slug>-<light>-b<0..4>.avif` at 800 × 1000. Re-run after any art, paper or light change. About 55–85 kB per room per light.
- **Card:** a fixed bottom panel that scrolls on its own. It's one grained paper sheet. Projects read title → "Built with" (stack and links) → three story beats in short form. The desk shows its name, focus tags and "Studying".
- **Storyteller:** the worker is an inline SVG from `worker.cut.json`, rendered on the server. He never walks. He stands on the lip between the room and the card and says one line per room.
- **Tilt:** `TiltToggle` writes `--look-x/y`, moving the bands by weight.
- **Without JS:** the phone gets a plain stack of readable cards.
- **Removed on phones:** the three.js chunk (302 kB gz), R3F, GSAP, Lenis, the curtain loader, the hanging cards, the clothesline swipe and the walking worker.
- **Budgets:** about 4 kB gz of wiring JS, plus the shared Next and React runtime (about 148 kB total). First room 55–85 kB.
- **Reduced motion:** no swelling or drift. Rooms swap at the midpoint.

**Phone bug fixes recorded:** the last two rooms were unreachable because 8 × 40svh stopped short of them. The last section is now `100lvh`. Deep links into far rooms were fixed by the same wiring.

---

## 9. Build log and decisions (`decisions.md`, later entries win)

**2026-09-24, structure and stack**
- The diorama is the home and the navigation. Content lives on paper objects inside the same world.
- Tech: WebGL via three.js and React Three Fiber, lazy-loaded over an HTML shell. GSAP and ScrollTrigger from the start. Lenis for smoothing. Skipped: postprocessing, WebGPU, KTX2.
- The CV is the content source. The old content at git `7e64f50` is a fallback reference only.
- The contact channels are email, GitHub and LinkedIn. No phone or WhatsApp.
- Station order and font are as in §3 and §7.
- The ProtoTech awards (2nd place and Best Presentation) belong to Refocus. A small ribbon sits on that plate.

**Build calls (made where the docs were silent):**
- Module length 80, not 60. FOV 62/74, not 32/50. Plates are cleared by an off-axis view offset, not by moving the camera.
- Dark side walls and a ceiling card close the box.
- Arches don't cast shadows.
- The worker's cadence caps at brisk. Beyond that his feet slip, as in a toy theatre.
- Ink mounts only go behind paper and accent parts (ink on ink is invisible, and it saves draw calls).
- Stations load nearest-first, then stay mounted with `visible` toggled.
- The scene starts after the `load` event and idle. Blocking time fell from 4.2 s to under 0.2 s on throttled mobile.
- The poster is a CSS background, switched by light and orientation.
- Clip-paths are CSS custom properties in `ui/clips.generated.css`.
- Holes come from `data-holes`, not `fill-rule`.
- Dev routes `/dev/art`, `/dev/tokens` and `/dev/worker` return 404 in production unless built with `ALLOW_DEV_ROUTES=1`.
- Dropped as unused: drei, maath, svg-path-properties, r3f-perf, stats-gl.

**Revision rounds (user feedback):**
- The worker is drawn at 2×, with a coloured back. The cable was removed; he walks ahead and runs different routines in each room.
- Showcase rooms have many small papers on strings (`ui/Hang`). They are lowered in when the room arrives and hauled up when it leaves.
- Practical rooms (Wall and Window) use tidy pinned boards (`ui/Board`), with no tilt. The Wall is two even boards: experience on the left, skills and ribbons on the right.
- The Wall's experience lines use `<details>` accordions.
- The last room is a bedroom: a low bed, a nightstand with a lamp, slippers, fairy lights, a picture and a dresser.
- The desk loads wherever the camera is, so deep links work.
- Frame: layered paper rings with grain and photo corners.

**Performance and polish:**
- The curtain parts when the desk is built or 2 s after navigation, whichever is first.
- Going live waits for the room the camera is in.
- Shadows re-render only when a light or a caster moves (about 10 Hz for ambient motion, 4 Hz on low tier).
- The worker rests after 45 s idle. Measured idle cost went from 60 fps and 60 shadow passes per second to 30 fps and about 19.
- Both lights compile at station build, so relight compiles nothing mid-roll.
- The FPS monitor uses the median of full-rate frames over ≥ 2 s, so a slow device does step down.
- Pokes during a walk-on are ignored for 4 s.
- Cache headers for `/poster` and `/textures` are `max-age=86400, stale-while-revalidate=604800`, not `immutable`.

**Measured budgets (last pass):**
- Initial JS 138 kB gz. The 90 kB target stayed out of reach on Next 16 with React 19. React DOM plus the App Router runtime alone is about 116 kB.
- Scene chunks total 302 kB gz against 300. Three can't be tree-shaken under R3F.
- CSS 16 kB gz. 36 draw calls a frame at the desk. 47–60 at rest.
- Lighthouse on throttled mobile: 96 / 100 / 100 / 100. LCP 1.6 s. CLS 0.
- Newsreader stays variable with `opsz` (279 KB preloaded).
- `THREE.Clock` deprecation warning from R3F 9.8, which goes away in R3F 10.

**Phone decisions:** see §8. The clothesline and the kamishibai were both superseded. Phones are not checked on a real device.

---

## 10. Content (from the CV)

**Name:** Muhammad Fatih Zamzami. Electrical Engineering undergraduate, Universitas Indonesia (S1, Aug 2024 – present). Based in Depok, Jawa Barat.

**Summary:** control systems, full-stack development and industrial OT/SCADA monitoring, with experience leading teams.

**Experience:**
- **Head of Research and Development, IME FTUI 2026** (Jan 2026 – present). Leads an 11-member analyst team. Publishes quarterly HRE and gap-analysis reports to over 150 staff.
- **SCADA & Automation Engineer Intern, PT PGAS Telekomunikasi Nusantara** (Jun – Aug 2026). Automated telemetry and alarm notification across Wonderware, Reliance and Zabbix. Traced the telemetry path from metering stations to the control room.
- **Teaching Assistant, Computational Thinking, Fakultas Teknik UI** (Aug 2025 – Jun 2026). Two consecutive terms. Mentored Python problem solving.
- **Software Engineer Team, EXERCISE FTUI 2025** (Feb – Dec 2025). Full-stack client websites in React, Next.js, Node.js and Tailwind.
- **Director of Events, EXERTION UI 2025** (Apr – Sep 2025). Built the portfolio for the first flagship event. Ran 3 competitions and drew over 150 participants.
- **Contingent Team Leader, 25th World Scout Jamboree, South Korea** (Aug 2023). Led a 30-member contingent at a 43,000-participant event. Managed welfare through a heatwave and an emergency evacuation.

**Projects (station content):**
- **DemandX** (Sep 2026): schema-agnostic ingestion for Indonesian ERP exports. Per-series model selection by demand class with rolling-origin backtests. A reorder decision layer quantified in rupiah.
- **OT Observability Lab** (Jun – Aug 2026): YAML-driven Zabbix 7.0 provisioning across 4 OT/ICS asset classes. A synthetic SCADA simulator and a 3-tier asset health model.
- **Refocus** (Feb – Apr 2025): closed-loop EEG neurofeedback for ADHD, with a game that adapts difficulty. DB-6 wavelet features and a 5-model GMM ensemble. Awards: ProtoTech 2nd place and Best Presentation.
- **KOMAT UNPAR 2025** (Mar – Aug 2025): full-stack competition website for a national maths competition, with an admin dashboard, registration and payments.
- **Solar-Powered Lighting** (May – Jun 2026): solar LED lighting with INA219 and LDR sensors, showing live metrics on an OLED.

**Awards:** ProtoTech 2nd place (Refocus) and Best Presentation, IEEE ITB Student Branch, The Sandbox 2.0 (2025). Best BPH, R&D Division, IME FTUI (2026).

**Skills:** Python, TypeScript, JavaScript, C/C++, MATLAB, React, Next.js, FastAPI, Tailwind CSS, Supabase, Git, Docker, Arduino. Forecasting (Croston, TSB, seasonal naive, WAPE/MASE backtesting), pandas, REST API design.

**Languages:** Bahasa Indonesia (native), English (professional).

**Contact:** email `muhfatihzamzami@gmail.com`, GitHub `enclaireee`, LinkedIn `fatihzamzami`. No phone.

**Links:** project repos and live URLs were not in the CV. Each plate has an empty link slot.

**Voice samples:** kicker "ELECTRICAL ENGINEERING · UNIVERSITAS INDONESIA". Hint "Move to aim the lamp. Scroll to walk in." Window "The cable ends here. Say hello." 404 "This sheet was never cut."

---

## 11. Tech stack (as built)

| Area | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack), React Compiler on | 16.3.6 / React 19.2.8 |
| 3D | three.js (WebGLRenderer), React Three Fiber | three 0.186.0 / R3F 9.8.0 |
| Motion | GSAP + ScrollTrigger, Lenis | 3.15.0 / 1.3.26 |
| State | zustand | 5.0.15 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), CSS modules for paper objects | ^4 |
| Art build | clipper2-ts, simplex-noise, svgpath, @xmldom/xmldom, tsx, sharp | see package.json |
| Tests | vitest (cut pipeline, camera mapping, walk, spring), Playwright e2e | 5.0.1 / 1.63.0 |
| Fonts | Newsreader via `next/font/google` | variable |

**Scripts:** `dev`, `build`, `start`, `lint`, `test`, `cut` (and `cut:check`), `grain`, `poster`, `e2e`, `rooms`.

**Test coverage planned:** cut determinism and a failing lint fixture; scroll → camera rests and monotonic; walk-cycle periodicity and no foot slip; spring settles and has no NaN; content checked by `satisfies`; generated files fresh in CI; Playwright smoke with JS off, reduced motion, and no WebGL; visual review of `/dev/art` at each gate.

**Configuration:** `next.config.ts` had `reactCompiler: true`, AVIF and WebP image formats, cache headers, and security headers (`X-Content-Type-Options`, `Referrer-Policy`, and a `Permissions-Policy` that allows only accelerometer and gyroscope).

---

## 12. Performance budgets (`architecture.md` §9)

| Budget | Limit |
|---|---|
| Initial JS (gz) | ≤ 90 kB (missed: 138 kB, see §9) |
| Scene chunk (gz) | ≤ 300 kB (302 kB measured) |
| Station art (gz) | ≤ 40 kB each |
| Textures | ≤ 400 kB transferred, ≤ 48 MB GPU |
| LCP (4G, mid phone) | ≤ 1.8 s (the poster) |
| CLS / INP | 0 / ≤ 150 ms |
| Draw calls | ≤ 60 (desk ≤ 80 during the entrance) |
| Triangles | ≤ 150k |
| Frame time | 16.7 ms desktop; ≤ 22 ms on a mid Android |
| Shader programs | 2 (paper, glow) plus depth variants |

---

## 13. Open items

- **Real device testing:** phones were only tested in emulation (Chromium Pixel 7, WebKit iPhone 14). iOS Safari momentum with mandatory snap, and the tilt permission prompt, are unverified.
- **Tuning:** the phone room length (40svh), fade distances (14 → 4) and band depths were tuned on screenshots only.
- **Landscape phones** (≥ 640 px wide) get the desktop layout without the 3D scene.
- **Project links:** repos and live URLs are missing from content.
- **Initial JS budget:** the 90 kB target was not reachable on this stack.
- **Perf on a real mid-range Android:** the 60 fps goal is unverified.
- **Tooling warning:** the `THREE.Clock` deprecation is a known R3F 9.8 issue, and is fixed in R3F 10 (alpha at the time).

---

## 14. Rules to keep if rebuilding

1. Readable HTML first. The 3D layer never gates it.
2. One loop, one material, no per-frame allocation, no mid-journey compilation.
3. Bake the work: wobble, clip-paths, rooms, poster.
4. Shadows follow depth. One light direction. Paper never stretches.
5. Lazy-load the 3D scene. Phones skip it and use baked layers.
6. Keep the docs and code in step. When they drift, fix one in the same change.
7. Don't add abstractions, barrels or folders without a use.
