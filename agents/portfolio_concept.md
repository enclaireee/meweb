# Portfolio concept: *The Night Workshop*

How `concept.md` (the Paper-Cut Diorama language) becomes Fatih's portfolio. It covers **what** the visitor experiences and **where** each piece of content lives. The actual values (colours, type, depths, timings) are in `design.md`, the tech is in `tech-research.md`, and the decision log is in `decisions.md`.

---

## 1. The pitch

A shadowbox of a workshop at night. You arrive at a desk under a lamp, where a small paper worker in an orange hard hat is waiting. Scroll, and he walks you deeper into the box along a floor cable, station by station. Each station is one project, cut from paper and lit by the lamp you hold. At the far end is a window over the city: that's where you say hello.

**One line:** *An electrical engineer's work, cut from paper and pinned into a box you can walk through.*

It suits Fatih because his work spans hardware (solar, EEG, SCADA), software (web, forecasting) and people (leading teams). A workshop is the one place where all three sit on the same bench.

---

## 2. Two ways through (the audience contract)

The audience is recruiters and craft lovers equally (`decisions.md`). The site serves both from the **same page**:

| | The skimmer (≈30 s) | The explorer (minutes) |
|---|---|---|
| Arrives | Name, role and one-line summary are readable in the first frame, before 3D loads | Watches the box pop up, aims the lamp, pokes the worker |
| Moves | Uses the **depth tag** to jump straight to any station | Scrolls; the worker walks ahead |
| Reads | Front of each plate: title, date, one caption, 2–3 facts | Turns the plate over for the full write-up |
| Leaves | Email / GitHub / LinkedIn, reachable from every station through the depth tag | Reaches the window at the end |

**Rule:** the scene may *delay* nothing. All text is real HTML, readable before, during and without WebGL.

---

## 3. The route

A straight, slow camera dolly (§4.6) through eight stations (00–07), built like a **toy theatre**: each station is a pair of dark paper **side panels and a top arch** (the foreground sheet) with objects standing at the sides and an open aisle down the middle. Looking down the aisle you see arch behind arch, fading into haze, all the way to the lit window at the far end. As you go through, each arch slides past the screen edges. The **floor cable** is the guiding path: it plugs into the desk socket at depth 0 and runs through every station to the window.

| # | Station | Content | Scene idea (what's cut from paper) |
|---|---|---|---|
| 0 | **The Desk** | Intro: name, role, summary, education | Desk, lamp (bulb = small light), mug, open notebook, the worker, the cable's plug |
| 1 | **The Storeroom** | DemandX (Sep 2026) | Shelves of crates with reorder tags, a paper forecast line pinned above, and one crate shown mid-reorder |
| 2 | **The Control Room** | OT Observability Lab (Jun–Aug 2026) | A gas pipe with a valve wheel (hinged), a pressure gauge with a pivoting needle, a small rack with pin-prick status lights |
| 3 | **The Arcade Corner** | Refocus: EEG neuro-adaptive game (Feb–Apr 2025) | A paper head wearing an EEG headband, a CRT showing a cut-out game level, and a brainwave strip strung across |
| 4 | **The Drafting Table** | KOMAT UNPAR 2025 website (Mar–Aug 2025) | A tilted drafting board holding a paper browser window, with ∑ π √ cut-outs hanging on strings |
| 5 | **The Sill** | Solar lighting system (May–Jun 2026) | A solar panel on a windowsill ledge, an LED on a hinge arm, a tiny OLED card showing a live readout |
| 6 | **The Wall** | Experience, awards, skills | Left: a **pegboard** where skills hang as labelled tools. Right: a **corkboard** of punched cards, one per role. Ribbons for the three awards |
| 7 | **The Window** | Contact | A big window cut-out and the city beyond (the back layer, dotted with lit windows). The cable ends at a wall socket under the sill |

**Why this order:** the newest and strongest work comes first (DemandX, then the OT internship). The hardware and software variety comes in the middle. Solar sits right before the window so the route rises toward the light. The Wall collects the CV material in one place for skimmers who jump there.

---

## 4. The worker (hero, §9)

- **Look:** a small paper figure in an **orange hard hat and vest** (the accent). The rest is ink and paper stock. He is mounted on a thin dark backing sheet, like a craft cut-out, so he reads on any floor in both lights (`design.md` §1.3 and §8 explain why).
- **Built as a split-pin puppet:** head, torso, and upper and lower arms and legs, all pinned at the joints. Only hinge rotation is allowed. Nothing stretches.
- **Idle (never still, never loud):** adjusts his hat, looks up at the lamp, checks a clipboard, shifts his weight. One fidget every 4–7 s.
- **Click → he walks.** A slow, deliberate walk (legs swing on their pins, a small bob at each step, no hopping). On the desk he walks a few steps along the cable. Anywhere in the journey, clicking him **walks him on to the next station, and the camera follows**. That makes him a friendly "next" button (it's also a real `<button>`, "Walk to next station").
- **Guide:** as you scroll, he walks the cable ahead of the camera and reaches each station first (§9 exception). Scroll faster than he walks and he picks up to a brisk walk. He never runs or jumps.
- **He's a profile puppet** (a flat sheet seen from the side). The cable zigzags across the aisle so he mostly walks sideways and never goes edge-on to the camera. When the zigzag changes direction, he turns about on his pivot, and his paper edge shows mid-turn (§4.5).
- **Arrival beat:** at each station he stops, tips his hard hat, and waits.
- **Reduced motion:** he stands still at the current station, and clicking him jumps you to the next one.

---

## 5. Content on paper objects

The scene is WebGL. **Everything you read is HTML** laid over it, styled as paper objects (§7) that obey the same light.

- **Title tag (station 0):** a hung paper tag with a punched hole and a stitched inner border. It holds the `<h1>` (name, with "Fatih" in the accent), the kicker and the italic summary. It sways on a damped spring when you move the lamp across it quickly.
- **Plates (stations 1–5):** a specimen plate per project. The **front** holds a label ("Plate 02"), the title, dates, an italic caption, 2–3 key facts with numbers, and stack tags. **"Turn over"** flips it on its hinge (§4.5, thickness strip visible mid-flip) to show the **back**: the full CV bullets. Both sides are always in the DOM; the back is simply hidden until the plate is turned.
- **The Wall (station 6):** the punched cards (roles) and pegboard tags (skills) are HTML lists styled as cards. Ribbons are the awards.
- **Window (station 7):** a paper card with email, GitHub and LinkedIn as scrap buttons.
- **Depth tag (always):** a small tag hanging at the top-left that works as the navigation: `00 Desk · 01 Storeroom · … · 07 Window`. The current station is marked with a punched hole. On mobile it collapses to "03 / 07" and opens into the list. It's a real `<nav>`.
- **Relight toggle:** a card-and-split-pin dial (a moon/sun disc turning in a slot). It switches night ↔ morning, and doubles as the site theme.
- **Hint strip:** "Move to aim the lamp · Scroll to walk in". It fades after the first interaction.

**No separate project pages for now.** One page, plates with hash anchors (`/#demandx`). Add `/work/[slug]` once a project has a write-up longer than a plate back.

---

## 6. Light and states

- **Night (default):** you carry the light, a warm work-lamp mounted on the camera rig and **aimed by the pointer** (§4.3). Tilt or drag on touch. Everything's shadow answers it. Small warm lights: the desk-lamp bulb, rack status pins, the worker's headlamp pin, the city windows.
- **Morning:** the same box relit (§5). A cool daylight comes from the window side, the pointer only nudges it, every sheet swaps to its morning stock, and the small lights go out. The change rolls through the sheets from the window outward (§8), with the city lights going out last.
- The theme follows `prefers-color-scheme` on the first visit (dark → night). After that it's the user's toggle, remembered in `localStorage`.

---

## 7. First visit, second by second

1. **0 ms:** HTML arrives: the frame mat, depth tag, title tag and a poster image of the composed desk scene. Readable immediately (this frame is the LCP).
2. **Idle:** the 3D chunk loads (three, R3F, GSAP, Lenis). The canvas renders its first frame behind the poster.
3. **Pop-up entrance (§4.5, ~1.8 s):** the poster cross-fades out, and the desk's sheets hinge up from flat, back to front. The lamp flickers on, and the worker walks in from the left edge and stops by the plug.
4. **Hint strip** appears. The box idles: a slow drift, the worker fidgets, the lamp follows the pointer.

On a return visit (anything already cached) the entrance is shortened to ~0.8 s.

---

## 8. Voice (§11), sample copy

- Kicker: `ELECTRICAL ENGINEERING · UNIVERSITAS INDONESIA`
- Title: *Muhammad **Fatih** Zamzami*
- Summary (italic): *Control systems, full-stack software and industrial monitoring, cut and pinned into eight stations.*
- Hint: *Move to aim the lamp. Scroll to walk in.*
- Plate caption, OT Lab: *Four kinds of plant equipment, one catalog. The alarms write themselves.*
- Plate caption, DemandX: *Every product gets the forecast that actually won.*
- Turn-over link: *Turn over* / *Turn back*
- Window: *The cable ends here. Say hello.*
- 404: *This sheet was never cut.*

---

## 9. Content decisions (defaults, flagged)

- **Contact shown:** email, GitHub (`enclaireee`), LinkedIn (`fatihzamzami`). **Phone / WhatsApp is not shown**, because a public phone number attracts spam. The CV PDF can carry it.
- **Education** sits on the desk plate (S1 EE, Universitas Indonesia, 2024–present).
- **Awards:** ProtoTech 2nd place + Best Presentation (IEEE ITB Sandbox 2.0, 2025) and Best BPH R&D (IME FTUI 2026), shown as ribbons on the Wall. **The ProtoTech awards were for Refocus**, so a small ribbon also sits on the Refocus plate front (confirmed 2026-09-24).
- **Project links** (repos, live sites) aren't in the CV. Plates get a link slot, left empty until provided.

---

## 10. Out of scope (for now)

Separate case-study pages, a blog, a CV download (easy to add later as a scrap button at the Window), a "regenerate the scene" mode (§10 optional), sound, and i18n (English only).
