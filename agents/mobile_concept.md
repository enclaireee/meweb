# Mobile concept: the layered dolly

*The phone experience (< 640px). Desktop and tablet keep the live 3D workshop unchanged. This doc supersedes the "Phones get their own layout" clothesline entry in `decisions.md`. The material rules in `concept.md` §2 still apply to everything here.*

> **Status (2026-09-24): built.** It's tested in Chromium (Pixel 7) and WebKit (iPhone 14) emulation, plus e2e. It hasn't been checked on a real device yet.
>
> **History:** the first version was a *kamishibai* card-pull (swipe sideways to pull the front card out). The user rejected it for two reasons: the caption card slid up over the scene, and the depth journey was gone. §9 records what that attempt taught.

---

## 1. Why rebuild

| Problem | What's actually going on |
|---|---|
| **Swiping doesn't work** | The clothesline scroller was a `position: fixed`, `pointer-events: none` layer, with all 8 sections stacked on top of one another. The page also scrolled vertically at 160svh per room, so the direction lock usually picked vertical before a sideways swipe registered. The rewrite removes the mechanism instead of patching it. |
| **Laggy, heats up** | Phones ran the same three.js scene as desktop. iOS doesn't expose `deviceMemory` and reports 6+ cores, so `initialTier()` rated an iPhone as **high**: DPR 1.75, 1024px shadow maps, ambient shadow passes, a walking worker and 8 stations mounted. |
| **Slow to load** | Nothing was interactive until the 302 kB gz scene chunk (three + R3F + GSAP + Lenis) had downloaded and the curtain lifted. |

The fix for all three is the same: **phones never load the 3D scene.** They get the rooms as baked paper layers. Then, since the depth journey is the point, those layers are walked through with a **layered dolly**.

---

## 2. The idea

The phone keeps the desktop's promise: **scroll to walk deeper into the workshop.** It does it with no 3D engine at all.

- **The top half is the room.** Each room is 5 flat sheets baked from the real scene (§4.2). Because every sheet sits at a known depth, a camera walking forward is just each sheet getting bigger at its own rate, about the vanishing point: a sheet at distance D, seen from Δ closer, is **D / (D − Δ)** times the size. Near sheets swell and fly out past the edges first. The back wall and its doorway grow until you step through, and the next room grows in from that doorway. It's a tunnel book you walk into (`concept.md` §4.6: "passing between layers").
- **The bottom half is the room's card.** It's fixed, and it scrolls on its own. It never covers the room.
- **Touch the room to travel, touch the card to read.** Dragging the scene scrolls the page, which snaps at every room. Dragging the card scrolls the card.
- **The worker is the storyteller.** He stands on the lip between the two halves and says one line per room.

---

## 3. Screen anatomy (portrait)

```
┌───────────────────────────┐
│ Program             ☾     │  ← program (the site nav), relight, "Tilt to look" under it
│                           │
│    the room: 5 baked      │  ← the stage: top 50svh, fixed
│    sheets, dollied by     │     drag here ↕ to walk (snaps per room)
│    the scroll             │
│ 🧍 "This one reads your    │  ← the storyteller on the lip, his line in a bubble
│     brainwaves."          │
├───────────────────────────┤
│ PLATE 03 · ARCADE CORNER  │
│ Refocus                   │  ← the card panel: bottom half, fixed,
│ Built with: Python, Godot │     scrolls on its own ↕ (overscroll contained)
│ The problem …             │
│ ‹ ● ● ● ◉ ● ● ● ● ›       │  ← the clappers: a punch per room; ‹ › back and on
└───────────────────────────┘
```

- **Shorter copy on phones:**
  - **Projects read title → "Built with" (the stack and links) → the story.** The big-number tags are desktop only (`.long`), and the stack card is reordered with `order` in `ProjectCards.module.css`.
  - Each project's three story beats use `brief` (one sentence each, cut from `story` with nothing added) instead of the full text. Globally, `.long` is the full text and `.brief` the phone cut.
  - The desk drops "Desk notes" (it repeats the name tag's summary) and "On the syllabus", so its card is the name tag, the three focus tags and Studying.
  - Desktop keeps everything.
- **The card is one sheet (with JS).** The panel itself is the paper. The pieces (`Hang`, `Board`) drop their own paper, hole, tilt and shadow and become sections separated by perforations:
  - Projects: a room-colour mark, the plate and the dates, the name, the hook; then the stack as chips with links as pill buttons; then the story as three beats on one stitched thread.
  - The desk: the name big, the focus tags as chips, then Studying.
  - The clappers are a dark bar, so they read against the sheet.
- **Card panel:** the room's existing papers (`Hang`, `Board`) laid in flow on a 3-column grid. The desk's three focus tags share a row; everything else is full width. Only the front room's panel is shown, and it swaps with a short fade at the midpoint of a walk.
- **Program:** `SiteNav`'s 5 items in a `popover` sheet: the recruiter's fast path.
- **Clappers:** 8 punched dots plus prev/next tabs, each one a plain `<a href="#slug">`.

---

## 4. How it works

### 4.1 The walk

- **Scroll length:** each station `<section>` is `--room-len` (40svh) of page, with `scroll-snap-type: y mandatory` on the page and `scroll-snap-align: start; scroll-snap-stop: always` on each section. One flick walks one room. A drag past the halfway point (~180px) commits to the next room; a shorter one springs back. **The last section is `100lvh`**, so the page ends a whole screen after the last room starts. Without it, the Wall and the Window started past the bottom of the scroll, and only anchors could reach them.
- **Camera coordinate:** `s = scrollY / room length`, from 0 to 7. `ui/Deck/wiring.ts` (phones only, lazy-loaded) runs on scroll (rAF-throttled). For every room r with |s − r| < 1, it sets each band's `--z` (a CSS `scale` about the vanishing point, `transform-origin: 50% 43%`) and its opacity:
  - **Rooms ahead** (d = s − r < 0) are smaller by the distance still to walk (d × 80 units), and fade in over the first 30% of the walk.
  - **Rooms being left** (d > 0): each sheet swells as D / (D − 80d) and fades by **distance, not size**, from 14 units away down to 4. The back wall must frame the doorway until you're through it.
  - **Band depths** from the camera at rest: B0 120, B1 78, B2 67, B3 50, B4 36.
- **Stacking:** every band is its own fixed layer (the stage is `display: contents`), so rooms interleave. From the bottom: every room's B0 (the room itself; later rooms higher, so the room ahead covers the one you're leaving), then every room's sheets B1–B4 (earlier rooms higher, because you look through this room's doorway into the next).
- **Only near rooms are displayed** (`data-near`, |d| < 1.6), so only they fetch their bands. Bands mid-walk get `will-change: scale` (`data-moving`).
- **Front room:** `data-active`, `store.station`, and `history.replaceState('#slug')` so the address can be shared. The wiring also handles deep links, anchors and `focusin`: focusing a hidden room's card walks there.
- **Before the wiring loads** (no `html[data-deck]` yet) the desk and its card are up. **Without JS** (gated on `html[data-js]`) the phone gets the plain readable stack of cards.

### 4.2 The room: baked bands

| Band | What it holds (local z; the camera sits at +35) | Tilt weight |
|---|---|---|
| B0 | **The whole box without this station's own sheets:** walls, floor, ceiling, rug, back wall, and everything through the doorway. Opaque haze behind. | 0.05 |
| B1 | Back sheets and the back wall slice, −36 to −47 (the window room: to the end, window and city included) | 0.2 |
| B2 | Middle and hung sheets, −23 to −38 | 0.45 |
| B3 | The stage, −7 to −25 | 0.7 |
| B4 | The arch, detail and wings, ≥ −9 | 1 |

- **B0 is the room, not a slice.** Wherever the sheets in front part or pass during a walk, the room's own walls and floor are behind them. (A sliced B0 showed purple haze around the doorway in mid-walk.)
- **Slices reach 2 units** into the band behind them, over floor and walls only (the depth gaps between sheet clusters leave room for this). Tilting then shows paper at the seams.
- **Baking:** run `npm run rooms` (`scripts/rooms.mts`) against a production build.
  - With `?bake`, the scene skips the worker, doesn't step its tier down, drops the view offset, and exposes `__bakeGo(station)` and `__bake(station, band)` (`scene/bake.tsx`).
  - Slices are global clipping planes in world z. B0 hides the station's own group, tagged `userData.station`.
  - Output: `public/rooms/<slug>-<night|morning>-b<0..4>.avif`, 800×1000 (a 400×500 viewport at 2×). Sheets are 6–35 kB each (B0 is the biggest), roughly 55–85 kB per room per light.
  - **Re-run it whenever a station's art, a room's paper or the lights change.**
- **Display:** each still is centred at its own 4:5 and covers the stage (the stage is 50svh; cover crops a little top and bottom). Each band overscans 16px for the tilt and drift. B2–B4 get a fixed `drop-shadow`.
- **Tilt and drift:** `TiltToggle` (now `onTilt`, no scene imports) eases toward the phone's angle and writes `--look-x/y` on the front room, which moves bands by weight. A 14s CSS drift runs on the front room only.
- **Loading:** every band is `<img loading="lazy">`, `display: none` from 640px up (desktop never fetches one). Room 00's night B0 is preloaded for phones only (`preload(..., { media })`). The other light's set loads on the first relight (`setLight` sets `html[data-relit]`).

### 4.3 Relight

Each band changes stock back to front, 80 ms apart, cross-fading over 600 ms: the lighting cue rolling across the stage (`concept.md` §8).

### 4.4 The storyteller

- He's drawn from `worker.cut.json` (the same hand-cut shapes as the 3D worker) as an inline SVG, **rendered on the server**, so there's no client JS for his paper (`ui/Deck/Storyteller.tsx`). Only his head and front arm move, on their pins. **He never walks.**
- He stands on the lip between the room and the card.
- **On each room:** once the walk stops (300 ms), he turns and says **one line** from `worker/lines.ts`, minus any line about cursors, clicks or scrolling. He also greets on load, says a line on relight, and wobbles with a reply when tapped.

---

## 5. What goes away on phones

| Removed | Replaced by |
|---|---|
| three.js scene chunk, R3F, GSAP, Lenis (302 kB gz) | Baked AVIF sheets, the dolly in ~4 kB of JS |
| The curtain loader | Nothing: the desk's B0 is the first paint |
| Hanging cards, the clothesline, the swipe hint | The card panel and the clappers |
| Walking worker, routines, chatter | The storyteller, one line per room |
| 160svh per room | 40svh per room, snapping |

`SceneMount` sets the tier to `none` on `PHONE` (`ui/Deck/phone.ts`), so `./Scene` is never imported. `ClientBoot` leaves the station tracking to the wiring. The hanging layout's styles (`Hang`, `Board`, `StationShell`) are gated behind `min-width: 640px`.

---

## 6. Budgets (phones)

| Budget | Limit | Measured (local production build, emulation) |
|---|---|---|
| JS beyond the shared route bundle | ≤ 6 kB gz | ~4 kB gz (the wiring chunk). Total JS on a phone: ~148 kB (the shared Next + React runtime) |
| First room (one light, 5 sheets) | ≤ 150 kB | ~55–85 kB |
| LCP (slow 4G, mid Android) | ≤ 1.5 s | The desk's B0 is the LCP element. Not yet measured under throttling |
| Interactive | At first paint | No curtain, no 3D |
| Walk | 60 fps on a mid Android | ≤ 10 layers change `scale` and `opacity` per frame. Needs a real-device trace |
| Idle | 0 JS per frame | The drift is CSS on the front room; the tilt rAF runs only while settling |

---

## 7. Accessibility

- Each room stays a `<section aria-labelledby>` in DOM order. Hidden cards are transparent, not `visibility: hidden`, so they stay in the accessibility tree, and focusing one walks to its room.
- The program, dots and ‹ › are plain anchors.
- **Reduced motion:** no swelling or drift. Rooms swap at the midpoint of the scroll instead, and the relight is a single quick fade.

---

## 8. Open questions

- **A real device.** Everything so far ran in emulation: Chromium synthesized touch drags, WebKit anchors and the relight. iOS Safari's momentum with mandatory snap, and the tilt permission prompt, need a real iPhone.
- **Tuning:** `--room-len` (40svh), the fade distances (14 → 4) and the band depths are first guesses tuned on screenshots.
- **Landscape phones** (≥ 640px wide) get the desktop layout without the scene.

---

## 9. What the kamishibai attempt taught (kept for the record)

- `position: sticky` cards in a horizontal scroller break in Chromium, which counts the sticky offset in the scroll width, and anchors break in WebKit.
- Chromium snaps to where a snap area is **drawn**. A snap target that moves with its own scroll-driven animation can never be landed on, so the snap target must be a still element.
- A caption that scrolls over the stage hides the scene. Keep them apart.
