# Portfolio decisions

Portfolio built on `concept.md` (Paper-Cut Diorama). Log of what's been decided, newest last.

## 2026-09-24

- **Structure:** the diorama is the home and the navigation. Content (projects, about, experience) lives on readable paper objects inside the same world: plates, cards, tags. Text is real HTML, readable with motion off.
- **Audience:** recruiters and craft-lovers equally. There's a fast path to name, role, projects and contact; depth and play are there for people who want them.
- **Subject:** a night workshop / maker's desk. The desk lamp is the single light source (§4.3), and the projects are objects on the bench.
- **Content:** comes from the user's new CV (pending). Old content at git `7e64f50` is only a fallback reference.
- **Hero:** a small paper worker. Clicking him starts a slow walk: jointed puppet limbs swinging on split pins, with a gentle bob at each step. No hopping.
- **Projects / navigation (supersedes "Structure" above where they conflict):** an immersive depth journey. Scrolling moves the camera deeper into the workshop (§4.6), and each project is its own depth layer with a readable paper plate. A jump-to-depth tag gives the fast path. Only the layers near the camera are rendered.
- **Worker as guide:** he walks the guiding path ahead of the camera and reaches each depth first. concept.md §9 has been amended to allow this.
- **The route (Claude's call):** desk (intro, lamp, hero) → one workshop station per project, each framed by a paper doorway or shelving arch that slides past the screen edges → a window over the city at night (contact). The guiding path is a cable running along the floor through every station.
- **Lighting states:** night (desk lamp, default) and morning (daylight through a window). This doubles as the dark/light theme.
- ~~Tech direction: CSS 3D + SVG, no libraries.~~ Replaced below.
- **Tech direction (user: "not pure HTML, super optimized"):** WebGL via three.js + React Three Fiber, lazy-loaded over a server-rendered HTML + poster shell. Full reasoning in `tech-research.md`.
- **Stack locked:** three.js + React Three Fiber over an HTML shell, **plus GSAP + ScrollTrigger from the start** (user's choice) for choreography: pop-up entrance, lighting roll, camera path. Lenis handles smoothing, and GSAP is lazy-loaded with the scene. Still skipped: postprocessing, WebGPU, KTX2.
- **Art:** Claude draws all paper shapes as SVG outlines in code; a build script bakes the edge wobble and extrusion.
- **CV** is at `agents/CV_Muhammad Fatih Zamzami.md` and is the content source.
- **Docs:** `portfolio_concept.md` (the experience and content map) and `design.md` (tokens and numbers). Stop before `globals.css` until the user says go.
- **Geometry fixes found during the spec:** stations are toy-theatre wings with an open aisle (no per-station back walls, which would block the journey). Fog provides the moving back-light/front-dark ramp. The worker is a profile puppet walking a zigzag cable, so he's never edge-on.
- **Confirmed by user:** contact = email + GitHub + LinkedIn (no phone/WhatsApp). Station order: Desk, DemandX, OT Lab, Refocus, KOMAT, Solar, Wall, Window. Font: Newsreader. ProtoTech awards (2nd place + Best Presentation) belong to Refocus, with a ribbon on its plate.
- **Architecture:** `architecture.md` is the engineering rulebook (folders per station, one loop, one paper material, the cut pipeline, budgets, 8 gated phases). It supersedes the earlier "mount only nearby stations" note: stations load lazily and then stay mounted with `visible` toggled.

## 2026-09-24: build notes (implementation calls, later entries win)

Where the docs were silent or contradicted themselves, these are the calls made during the build. Each is also marked in code.

- **Geometry:** module length **80, not 60** (stations are 42 deep, so from a rest 35 in front of an arch the previous station's far sheets would stand between the camera and the arch). The window wall is at z −610. FOV is **62° landscape / 74° portrait** (the 32°/50° "tune" values can't show a 56×34 arch from 35 units away). The plate column is cleared with an off-axis view offset (12% desktop, 10% tablet, 20% up on phones), not by moving the camera.
- **The box:** dark side walls at x ±40 and a ceiling card at y 60.5 close the shadowbox, so the view never escapes past the wings.
- **Arches don't cast shadows** (`data-cast="false"`). A proscenium shadowing its whole stage read as a bug.
- **Daylight direction** is (0.2, −0.5, −0.84). design.md's (−0.4, −0.7, +0.6) travels toward the camera and backlights every sheet front. Grain `normalScale` is 0.28 (0.35 was too crunchy under raking daylight). Night fill: the hemisphere at 1.6, the lamp at 430, both tuned on screenshots.
- **The worker slides like a stick puppet** when the journey is faster than a walk. His cadence caps at brisk, and the feet slip beyond that, as in a toy theatre; 80 units a station at a 1.45 u/s walk would take a minute. Ink mounts only go behind paper and accent parts (ink on ink is invisible, and it saves draw calls). He enters at the desk on the entrance, then guides by heading for the scroll target's nearest station.
- **Stations** load one at a time (nearest first, only the desk before the scene is live) and build in idle time, then stay mounted with `visible` toggled. The desk merges its hinged sheets back into one mesh once the pop-up has played.
- **The scene starts** after the `load` event and idle, not just idle. The blocking time dropped from 4.2 s to under 0.2 s on throttled mobile.
- **Poster** is a CSS background (night/morning × landscape/portrait via `[data-light]` and orientation), not `next/image`, so only the matching one downloads. It's rendered from the real scene by `scripts/poster.mts`.
- **HTML clip-paths** are generated as CSS custom properties (`src/ui/clips.generated.css`, `--clip-*`), not TS.
- **Authoring format:** holes come from `data-holes` (subtracted from the union of the path's subpaths), not `fill-rule`. It's orientation-proof, and the lint catches any solid that falls inside a hole.
- **The title `<h1>`** sets one word per line, and its size is capped by the tag width (`16.5cqi`) under design.md's clamp. The wrap is identical before and after the font swap: CLS 0.
- **Dependencies:** drei, maath and svg-path-properties are dropped (unused: our own FPS monitor, `damp` in `lib/math.ts`, our own flattening). r3f-perf/stats-gl are not added: `?debug` logs `gl.info` instead. `@types/node` is ^24 (vitest 5 needs ≥22).
- **Dev routes** (`/dev/art`, `/dev/tokens`, `/dev/worker`) return 404 in production unless built with `ALLOW_DEV_ROUTES=1`.
- **Copy:** plate captions for Refocus, KOMAT and Solar, the Wall's title/caption and the Window heading were written in the portfolio_concept.md §8 voice (the doc only gave samples for two plates). Facts are all drawn from the CV.
- **Budgets:** everything meets §9 except initial JS: **136 kB gz against 90 kB**. React DOM + the Next App Router runtime alone are ~116 kB, and the site's own client code is ~17 kB. The 90 kB target isn't reachable on Next 16 + React 19. The scene chunk is 240 kB gz (≤300). Draw calls are 80 during the entrance, 47–60 at rest. Lighthouse (observed mobile throttling): 96 / 100 / 100 / 100, LCP 1.6 s, CLS 0.

## 2026-09-24: revision rounds 1–4 (user feedback; later entries win)

- **Worker:** drawn 2× (`worker.scale`), with a coloured back as well as front. The cable is gone: he walks ahead of the camera (`followPoint`, meander in x) and runs a different routine of jobs in each room (`routines.ts`, reshuffled every loop). He sits on the bed in the last room (`sit`).
- **He talks:** hardcoded lines in `scene/worker/lines.ts`, shown in a paper bubble (`speech.ts`):
  - A greeting after the entrance.
  - A reply on hover or focus (this replaced the "Walk on" label) and a line when clicked.
  - Chatter every 11–20 s, for his room or a general line.
  - Sometimes a line when he starts a job, when you sprint-scroll, or when you go back a room.
  - A line when the light changes.
  - Lines are dealt from a shuffled deck, so none repeats until its list runs out. The lines are flavour only: no facts beyond what the cards say.
- **Loader:** a curtain with the worker cutting a strip of paper as the progress bar.
- **Rooms:** each room is its own paper pack (`rooms[]` in tokens), with a shell (walls, wainscot, ceiling, rug, back-wall doorway) so nothing reads hollow. The last room is a **bedroom**: a low bed, a nightstand with a lamp, slippers, fairy lights, a picture and a dresser, all within the band that the nav and the contact card leave clear.
- **Cards (showcase rooms):** many small papers on strings (`ui/Hang`) around the room, never over the doorway. They're lowered in when the room arrives and hauled up when it leaves, with pointer parallax by depth. Paper-cut icons are drawn in `ui/Icon`.
- **Practical rooms (Wall, Window):** tidy pinned boards (`ui/Board`), no tilt. The Wall is two even, slim boards, one down each side: experience as one line per role (tap for the summary, a `<details>` accordion) on the left, skills and ribbons on the right. Contact is a single board. Role `kind` (work / leadership) is in content.
- **Nav:** the depth tag is replaced by a compact strip at the left middle (`ui/SiteNav`): Who I am, Projects, Experience, Skills, Contact. Left-side card slots start right of it.
- **Phones get their own layout, not a trimmed desktop:** a clothesline across the lower half (`--line`). Each room's papers are pegged to it and swiped sideways (scroll-snap), while scrolling up and down still walks between rooms.
  - A flat board comes apart into one card per role, skill group or award, with coloured section tags.
  - A "swipe →" hint fades as you swipe (scroll-driven, behind `@supports`), and "↓ next room" ends each line.
- **Frame:** layered paper rings (outer, mat, pinstripe) with grain and photo corners.
- **Fix:** before the scene is live, the desk loads wherever the camera is. A deep link to a far room (e.g. `#contact`) used to leave that room empty forever.

## 2026-09-24: performance + polish pass (later entries win)

- **The curtain never gates the page for long.** It parts when the desk is built or **2 s after navigation start**, whichever comes first (slow 4G + 4× CPU: readable at 2.3 s, was 6.4 s). Tier `none` skips it. The canvas stays transparent until the scene is live, then cross-fades over the poster in 300 ms (§7.2), so nobody sees a half-built box.
- **Going live waits for the room you're in.** Before the scene is live the desk *and* the station at the camera are built (someone who scrolled on while it loaded never sees a bare room fill in). The worker is off stage until his entrance: at the desk he walks in and greets on arrival; deeper in he's simply in your room.
- **Shadows re-render only when the lamp, the tilt or a caster moves.** The lamp ignores the idle drift (it moves the eye, not the light). Ambient motion (hung sway, idle pivots) refreshes the shadow map at ≤10 Hz, and the low tier at ≤4 Hz with one final render at rest. Worker fidgets ride the half-rate ambient frames.
- **The worker rests** after 45 s without input: he finishes the job in hand and only fidgets until someone moves. Idle cost measured: 30 fps and ~19 shadow passes/s (was 60/60 indefinitely).
- **Both lights' programs compile at station build** (which light casts is part of the program key): the relight compiles nothing mid-roll.
- **FPS monitor:** the median of back-to-back full-rate frames over ≥2 s, sampled only once the scene is live, and frames of any length count. The old one ignored frames over 60 ms, so a truly slow device never stepped down.
- **One poke, one station.** Pokes while a walk-on is in flight are ignored (4 s window).
- **Deep links** land on their room's rest: Lenis used to take over mid-way through the browser's smooth anchor scroll and stop a room short.
- **Camera tokens:** `pointerX/Y`, tilt and `driftX` stay above design.md's values (a "more parallax" call referenced in `tokens.ts`); `pointerLambda` is back to design.md's 2.5 (it had drifted to 3.2 with no recorded reason).
- **Cache headers** for `/poster` and `/textures` are `max-age=86400, stale-while-revalidate=604800`, not `immutable`: the scripts regenerate those files under the same names.
- **Phones:** hauled-up cards clear the top by their own height; the Window's line rides higher so the whole contact card fits; the last room shows no swipe hint.
- **Budgets (measured this pass):** initial JS 138 kB gz (the 90 kB target stays unreachable on Next 16 + React 19); scene chunks 238 + 64 = **302 kB gz** against 300 (three can't be tree-shaken under R3F); CSS 16 kB gz; 36 draws a frame at the desk.
- **Left as-is:** Newsreader stays variable with `opsz` (279 KB preloaded, both styles). next/font 16.3 rejects weight ranges, dropping `opsz` breaks design.md §2, and splitting italic out would make browsers synthesize it. The `THREE.Clock` deprecation warning comes from R3F 9.8 (the latest stable) constructing a Clock; it goes away with R3F 10.
