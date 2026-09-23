# Design spec: *The Night Workshop*

The concrete values for building `portfolio_concept.md`. `concept.md` sets the rules; this file sets the numbers. Numbers marked **(tune)** are starting points to adjust in the prototype.

**Units:** 1 world unit ≈ 1 cm of box. Camera looks down −Z. Station 00 starts at z = 0.

---

## 1. Colour

### 1.1 UI and paper stocks

| Token | Night | Morning | Use |
|---|---|---|---|
| `paper` | `#E9DFCC` | `#F2EADB` | Plates, tags, frame mat, buttons |
| `ink` | `#2B2521` | `#2B2521` | All text, the worker's backing sheet, focus stitch |
| `ink-soft` | `#5A4F46` | `#5A4F46` | Captions, meta, dates |
| `accent` | `#E8742F` | `#D9622B` | **The worker's hat and vest**, plus ≤3 scene details (cable plug, the current-station punch on the depth tag) |
| `accent-text` | `#C4531F` | `#B84A1A` | The one accent word in the `<h1>`. **Large text only** |
| `glow` | `#FFD58A` | (off) | Small lights: lamp bulb, rack pins, headlamp, city windows |
| `shadow` | `rgba(10,13,31,.55)` | `rgba(59,46,38,.35)` | HTML object shadows (cool at night, warm in the morning) |
| `fog` | `#6F7FA3` | `#EDE3D3` | Scene fog colour (§5.3) |
| `sky` | `#8FA0C0` | `#F7F0E4` | Window backdrop at the end of the route (lightest sheet) |

### 1.2 Scene ramp (back → front, light → dark)

Stocks are assigned by **role within a station**. Fog then adds the global recession as the camera moves (§5.3).

| Step | Role | Night | Morning |
|---|---|---|---|
| R0 | sky / window backdrop | `#8FA0C0` | `#F4EBDD` |
| R1 | far sheets | `#62739A` | `#DCD6CF` |
| R2 | hung objects | `#4B5A82` | `#C3C3C6` |
| R3 | middle B | `#3A466B` | `#A5AAB4` |
| R4 | middle A | `#2C3656` | `#858D9C` |
| R5 | stage objects, floor | `#212843` | `#677084` |
| R6 | detail sheet | `#171C31` | `#4C5468` |
| R7 | arches, wings, foreground | `#0F1222` | `#343A4B` |

Base hue: a slate-indigo family in both states. The morning state is the same family, lighter, relit warm. The accent is the only warm-opposed hue.

### 1.3 Contrast (verified 2026-09-24)

| Pair | Ratio | Verdict |
|---|---|---|
| ink / paper (night, morning) | 11.4 / 12.6 | AAA body |
| ink-soft / paper (night, morning) | 6.0 / 6.7 | AA body |
| accent-text / paper (night, morning) | 3.45 / 4.36 | **Large text only** (≥24 px); that's the `<h1>` word |
| worker accent vs R5 floor (night) | 4.8 | Reads clearly |
| worker accent vs R5 floor (morning) | 1.4 | **Fails**, hence the ink backing sheet (§8) |

---

## 2. Typography

**One family: Newsreader** (Google, variable: `opsz` 6–72, `wght` 200–800, italic). It's literary and archival, and the optical sizes keep small captions crisp while making the big title elegant. Self-hosted with `next/font/google`, `display: swap`, subset latin.

| Token | Size | Style | Use |
|---|---|---|---|
| `text-kicker` | 0.75rem | 560, UPPERCASE, tracking 0.18em | Catalogue labels: "PLATE 02", the kicker |
| `text-caption` | clamp(0.94rem, 0.9rem + 0.2vw, 1rem) | *italic* 400 | The voice: captions, hints, subtitles |
| `text-body` | clamp(1rem, 0.96rem + 0.2vw, 1.06rem) / 1.55 | 400 | Plate backs, bullets |
| `text-fact` | 1.5rem / 1.1 | 600, `tabular-nums lining-nums` | Key numbers on plate fronts |
| `text-plate-title` | clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem) / 1.1 | 500 | Project titles |
| `text-hero` | clamp(2.5rem, 1.6rem + 4vw, 4.75rem) / 1.0 | 450, opsz 72 | The `<h1>` on the title tag |

Rules: text measure ≤ 60ch; italic carries the voice; accent on one `<h1>` word only; no bold inside paragraphs (use italic).

---

## 3. Space and layout

**Space scale (px):** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96.

**Frame mat (§3 "frame"):** a `paper` border around the viewport. Inset 10px (≥640) or 6px (<640), with a 1px `ink` line at 25% opacity on the inner edge and an inset shadow, so the canvas reads as the box opening.

| Breakpoint | Plate | Depth tag | Relight dial | Hint strip |
|---|---|---|---|---|
| ≥1024 | Right column, `min(420px, 34vw)`, sticky and vertically centred | Top-left, expanded | Top-right | Bottom-left |
| 640–1023 | Right, `44vw` | Top-left, collapsed | Top-right | Hidden after 1st interaction |
| <640 | Bottom card, `max-height: 56svh`, back side scrolls internally | Top-left, collapsed "03 / 07" | Top-right | Bottom, above the card |

On <640 the camera target shifts up (§4.1) so the scene sits above the card.

**Scroll structure:** one `<section>` per station, with `min-height: 160svh` (tune). Camera progress within a section: 0–30% travel in, **30–70% dwell at rest** (the plate is readable and the camera is still), 70–100% travel out.

---

## 4. The box (3D layout)

### 4.1 Camera

| Param | Value |
|---|---|
| Vertical FOV | 32° landscape, 50° portrait (aspect < 0.8) **(tune)** |
| Rest position per station | 35 units in front of the station's arch, y = 14, pitch −6° (a tabletop view) |
| Path | Straight along −Z, stopping at station rests. X stays 0. |
| Pointer offset | x ±2.5, y ±1.2 (damped) |
| Box tilt (§4.2) | Rotates the world group: yaw ±3°, pitch ±2° |
| Idle drift | x ±0.8, 16 s period, sine. Pauses off-screen. |
| Portrait target shift | Look-at y +4 so the scene clears the bottom card |

### 4.2 Station module (toy theatre)

Module length **60** (station *i* arch at z = −60·i). Local z inside a module:

| Local z | Sheet (ramp step) | Notes |
|---|---|---|
| 0 | **Arch + wings** (R7) | Proscenium: top arch and left/right panels. Opening ≈ 56 × 34. Crops the frame edges at rest. |
| −6 | Detail (R6) | Small textured pieces at the sides |
| −12 → −40 | Stage objects (R5) | Standing on the floor, left and right of the aisle |
| −20 | Middle A (R4) | Main station silhouettes |
| −30 | Middle B (R3) | |
| −34 | Hung objects (R2) | On strings from the arch/ceiling line, y top = 36 |
| −42 | Far sheets (R1) | Simple, pale, cut-out detail only |
| floor | Floor card (R5), horizontal at y = 0, full module | Carries the **cable** |

The aisle is |x| < 8, kept clear for the cable and the worker. Station 07 ends at z = −470 with the **window wall** (R0 sky behind a cut-out window, the city as a far R1 sheet with `glow` window pinpricks, the moon as a paper disc).

**Stations load when the camera is 2 away, then stay mounted; only |station − current| ≤ 3 are `visible`** (see `architecture.md` §6.4: mount/unmount causes stutter). Fog hides anything deeper.

### 4.3 Sheet material geometry

- **Thickness:** 0.15 (≈1.5 mm) via `ExtrudeGeometry`, `bevelEnabled: false`.
- **Edge wobble (baked at build, seed = sheet id):** two-octave drift + chatter with crisp corners and scissor facets. The exact constants are in `architecture.md` §7.2. The same shape always cuts the same way.
- **Merge:** all static sheets in a station are merged into one geometry (one draw call). Stock colours travel as vertex colours (`architecture.md` §6.3).

---

## 5. Paper, light and shadow

### 5.1 Material

One shared `MeshStandardMaterial` with the flat stock colour from §1.2 per sheet (as vertex colours, night + morning, mixed by one relight uniform; `architecture.md` §6.3), `roughness 0.92`, `metalness 0`. All sheets share **one tiled grain set** (512² normal map + roughness map, WebP, repeat ≈ 1 tile per 20 units, `normalScale 0.35` **(tune)**). The grain catches a low, raking light automatically (§4.3 of the concept).

### 5.2 Light

| | Night | Morning |
|---|---|---|
| Key light | `SpotLight` `#FFD9A8`, mounted on the camera rig at (−6, +10, +2), **aimed at the pointer's hit on the stage plane**. Angle 38°, penumbra 0.8, decay 1.2 | `DirectionalLight` `#F2F4FF` from the window side: direction (−0.4, −0.7, +0.6). The pointer nudges it ±5° |
| Fill | `HemisphereLight` sky `#3A466B`, ground `#0F1222`, low (cool shadows) | sky `#F4EBDD`, ground `#677084` (warm shadows) |
| Small lights | `glow` emissive cut-outs (no real lights) | off |

Shadows: `PCFShadowMap` (r186), map 1024 (low tier 512), `radius 4`, `bias −0.0005`, `normalBias 0.02` **(tune)**. The shadow camera frustum fits the current station only. Only arches, stage objects, hung objects, the worker and plates-in-scene cast; the floor and middle/far sheets receive.

### 5.3 Fog (the moving value ramp)

`THREE.Fog(fogColor, near 40, far 260)` **(tune)**. As stations recede they fade toward the pale haze, which keeps "back lightest, muted; front darkest, richest" true from wherever the camera stands. On surfaces that face the camera it gives a flat tone per sheet. On the floor it reads as atmosphere, which is light, not paint.

### 5.4 HTML objects share the light

The scene writes the light aim to CSS vars `--light-x`, `--light-y` (−1..1) on `<html>` every frame the light moves. HTML paper objects cast:

```
filter: drop-shadow(calc(var(--light-x) * -8px) calc(6px + var(--light-y) * -6px) 14px var(--shadow));
```

HTML objects are the nearest layer, so they get the largest offset in the page.

---

## 6. HTML paper components

All components use `paper` and `ink` and share the drop-shadow from §5.4. Grain comes from the same tile via `background-image` + `mix-blend-mode: multiply`, opacity 0.08.

**Hand-cut edges on HTML:** the outer wrapper carries the `drop-shadow`, and the inner element is clipped by a baked `clip-path: polygon(...)` (the same seeded wobble script, output as percentages). Clipping the child keeps the parent's shadow following the cut shape.

| Component | Anatomy | States |
|---|---|---|
| **Title tag** (`<header>`, station 00) | Tag shape with a 45° clipped top corner, a punched hole (ring 14px) with a string up out of frame, dashed ink inner border 1px inset 10px, kicker, `<h1>`, italic summary | Sways on a spring from the hole (§7) when the pointer crosses it fast. Otherwise still |
| **Plate** (`<article>`, stations 01–05) | Front: `text-kicker` "PLATE 02", title, dates (`ink-soft`), italic caption, 2–3 facts (`text-fact` + label), stack tags, "Turn over" link. Back: full bullets, "Turn back" | Flip = `rotateY(180deg)` on the left-edge hinge, with a 2px `ink-soft` edge strip visible mid-flip, over `dur-slow`. `<button aria-expanded>`; the hidden side is `inert` |
| **Depth tag** (`<nav>`) | Hanging tag listing `00 Desk … 07 Window`, the current one marked by a punched hole with an accent washer | Collapsed <1024 into "03 / 07"; expands on click. `aria-current="step"` |
| **Scrap button** | Irregular clipped polygon, `paper`, ink label | Hover/focus: lift −2px, rotate −1.5°, the shadow grows (`dur-quick`). Active: press to 0 |
| **Stack tag** | Small torn strip, `text-kicker` | Static |
| **Relight dial** (`<button role="switch">`) | A paper disc with moon and sun cut-outs, turning in a recessed slot on a split pin | Rotates 180° over `dur-slow`, which triggers the relight roll (§7) |
| **Hint strip** | Narrow paper strip, italic caption | Fades out 600ms after the first pointer move or scroll |
| **Punched card** (roles, station 06) | Card with a punched top hole, role, org, dates, 1–2 lines | Hover: slight lift |
| **Pegboard tag** (skills) | Small tag on a peg hook, one skill per tag, grouped by row (Programming · Frameworks · Data) | Static |
| **Ribbon** (awards) | Rosette of 2 stacked discs + tails, label below | Static |
| **Divider** | Perforation: a row of 3px dots, 8px apart, `ink` at 30% | none |
| **Focus** | **Stitch**: `outline: 2px dashed var(--ink); outline-offset: 3px` | Visible on `:focus-visible` everywhere |

---

## 7. Motion

### 7.1 Tokens

| Token | Value |
|---|---|
| `ease-paper` | `cubic-bezier(0.45, 0, 0.2, 1)`; GSAP `power2.inOut` |
| `ease-settle` | `cubic-bezier(0.22, 1, 0.36, 1)`; GSAP `expo.out` |
| `dur-quick` | 180ms: hovers |
| `dur-base` | 320ms: UI in/out |
| `dur-slow` | 700ms: flips, dial |
| `dur-light` | 1200ms per sheet: relight |
| `stagger` | 60ms |
| Pointer damping | maath `damp`, λ = 2.5 |
| Scroll | Lenis `lerp 0.08`; ScrollTrigger `scrub: 1` |
| String spring | stiffness 40, damping 5, mass 1 (≈3 visible swings, settles in ~3 s) |

Springs and overshoot are **only** for things on strings or pins (tags, hung objects, the worker's limbs). Scenery sheets never overshoot.

### 7.2 Choreography

| Moment | What happens |
|---|---|
| **Pop-up entrance** (station 00, ~1.8 s) | The poster cross-fades out over 300ms. The desk sheets hinge up from flat on their bottom edges, **back → front**, each over 600ms `ease-settle` with a 90ms stagger. Then the lamp flickers (2 quick dips, 250ms total) and the worker walks in from the left. Return visits: 0.8 s, no flicker |
| **Dolly** | Scroll-scrubbed camera z between rests with dwell zones (§3). Arches slide past the edges; fog lifts the next station into colour |
| **Relight** | Sheets swap stock one by one, **from the window side outward**, 60ms stagger, each over `dur-light`. Lights change and fog colour follow the same timeline. Small lights change last (+300ms): they go out for morning and fade in for night |
| **Plate flip** | `dur-slow`, `ease-paper`, hinge on the left edge, thickness strip mid-turn |
| **Hung objects** | Pendulum sway ±2°, 5–7 s period, desynced by seed. The shadow on the sheet behind moves with them |
| **Station arrival** | Camera settles into its dwell, the worker stops and tips his hat, the plate fades up over 320ms (`ease-settle`, 12px rise) |

---

## 8. The worker

- **Size:** 5 units tall with the hat (the arch opening is 34, so he's small and precious).
- **Proportion:** 5.5 heads, toy-like and chunky. A profile cut (side view).
- **Pieces (flat sheets, pinned):** hat (accent), head (paper), torso (ink shirt), vest (accent, same sheet group as the torso), upper arm ×2, forearm + hand ×2, thigh ×2, shin + boot ×2, clipboard (paper). Pins: neck, shoulders, elbows, hips, knees.
- **Backing sheet:** a single `ink` silhouette offset 0.12 units behind him, like a mounted cut-out. It keeps him readable on the morning floor (§1.3).
- **Headlamp:** a 0.2-unit `glow` pinprick on the hat (night only).
- **Path:** a `CatmullRomCurve3` along the cable, zigzagging across the aisle so his heading stays within ±55° of lateral. His sheet yaw is clamped so it never goes more than 55° from facing the camera. On a direction change he turns about 180° over 600ms (the edge strip shows mid-turn).

| Walk param | Slow (default) | Brisk (scroll catching up) |
|---|---|---|
| Cycle (2 steps) | 2.2 s | 1.5 s |
| Stride / step | 1.6 units | 1.9 units |
| Hip swing | ±20° | ±24° |
| Knee flex (swing phase) | 0 → 35° | 0 → 40° |
| Arm swing (opposite phase) | ±15°, elbow 10–20° | ±18° |
| Body bob (2× freq) | 0.12 units | 0.14 units |
| Forward lean | 3° | 5° |
| Start / stop ease | 400ms | 300ms |

**Idle fidgets** (one every 4–7 s, random, seeded): hat adjust, look up at the lamp (head pin −12°), clipboard glance, weight shift. **Poke (click):** he walks on (see `portfolio_concept.md` §4).

---

## 9. Station art sheets

This is a sheet list per station. Stocks come from §1.2, and everything stays clear of the aisle.

| # | Left of aisle | Right of aisle | Hung | Far |
|---|---|---|---|---|
| 00 Desk | Desk front (R5), lamp arm + shade on hinge (R4), mug (R6) | Notebook open (R5), socket + plug (accent) | Title tag string (HTML) | Shelf with jars (R1) |
| 01 Storeroom | Shelf rack (R4), crates ×6 with cut-out handles (R5) | Pallet + one crate lifted mid-reorder (R5), reorder tags (R6) | Forecast line strip (R2) | Taller racks (R1) |
| 02 Control Room | Pipe run with valve wheel on pivot (R5) | Pressure gauge, needle pivot (R6); small rack with `glow` status pins (R4) | Cable loops (R2) | Pipe manifold silhouette (R1) |
| 03 Arcade | Paper head + EEG band (R5) | CRT with cut-out level (R4), screen `glow` (night) | Brainwave strip on strings (R2) | Arcade cabinet (R1) |
| 04 Drafting | Drafting board tilted on a hinge, with a paper browser window (R4/R5) | Stool (R6), T-square (R6) | ∑ π √ cut-outs (R2) | Plan chest (R1) |
| 05 Sill | Solar panel with cut-out cells (R4), OLED card (R6) | LED on a hinge arm (R5), Arduino board (R6) | Sun/moon mobile (R2) | Window frame hint (R1) |
| 06 Wall | Pegboard with tool tags (R4) | Corkboard with punched cards (R4), ribbons | Bunting (R2) | Workshop back wall (R1) |
| 07 Window | Window wall (R5/R7), sill socket where the cable ends | ← same | Moon disc (R2 → lightest) | City (R1) + sky (R0), `glow` windows |

---

## 10. Reduced motion, fallbacks, access

- **`prefers-reduced-motion`:** no entrance, drift, sway, fidgets or springs. The dolly becomes an instant cut between rests (a cross-fade, 200ms). The pointer still aims the lamp (light moves, nothing slides). Relight becomes a single 400ms cross-fade.
- **No WebGL / low tier / Save-Data** (`navigator.connection.saveData`): the 3D chunk is never downloaded. Poster + HTML plates on a `paper` backdrop. The full site still works.
- **Keyboard:** skip link → depth tag → title → each station's plate → worker button. Every control is a real button or link.
- **Screen readers:** the canvas is `aria-hidden`. All meaning lives in the HTML.
- **Tab hidden / canvas off-screen:** `frameloop="demand"`, so nothing renders.

---

## 11. Handoff to code (the next step, not started)

1. `globals.css`: `@theme` / `:root` tokens from §1.1, §2, §3, §7.1 as CSS custom properties, with night/morning under `[data-light="night" | "morning"]`, plus base type, frame mat and focus stitch.
2. `src/design/tokens.ts`: the same colour values plus §1.2 ramps, §4, §5 and §8 for the scene. (Two copies of the colour values: kept together in one PR, and a later build step can generate one from the other if they drift.)
3. `scripts/cut.ts`: the seeded edge-wobble baker (geometry + HTML `clip-path`).
