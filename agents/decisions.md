# Decisions (single source of truth)

Everything here is **decided by the owner** unless marked *proposal*. History and reasons are in `discussion-log.md`. Anything not here is in `open-questions.md`.

## Product
| Topic | Decision |
|---|---|
| What it is | A portfolio that is **one world**, not a CV presentation. The portfolio lives *inside* the world. |
| Experience | **One continuous scroll-based experience.** No separate pages that break it. |
| Priority | **Full WOW** (cinematic, epic, like the reference aksarakala.vercel.app). |
| Content rule | Every piece of content is something that **belongs in the world**; nothing is a custom showcase. |
| Identity | World is **neutral fantasy**; no Indonesian or electrical-engineering theme required. |
| Story | **Aimless exploration**, no quest. Ending is a calm place to leave a message (contact). |
| Tone | **Epic and grand.** |

## Structure
| Topic | Decision |
|---|---|
| Lanes | **Two lanes.** Main lane = the WOW journey. Projects lane = the reverse side of the world. |
| Entering projects | **Optional.** Click/tap a fork object in the main lane. Exit returns to the exact spot. |
| Projects | **Modular**: one registry entry per project; adding one needs no engine changes. |
| Length | Main lane about **15 to 20 screens** of scroll. |
| Initial content | From the owner's CV: **8 projects** (initial chambers), 7 roles, 4 awards. See `content-inventory.md`. |

## Content
| Topic | Decision |
|---|---|
| Contact (public) | Email, LinkedIn, GitHub, CV download. **No phone number.** |
| Project order | Grouped by kind (web platforms, data/ML, hardware/automation); newest first within a group. |
| Media | **Screenshots** available. Video, live URLs and repos: not confirmed. |
| Language | **English + Indonesian, with a toggle.** |

## World and art
| Topic | Decision |
|---|---|
| World | **The Hollow Mountain**: a small night mountain that unfolds and contains a vast world; scale flips at each fold. |
| Art style | **Layered flat papercut shadowbox** (v4 style): one-colour sheets, depth from overlap and baked shadows, light through cut holes. One main technique for the whole world. |
| Colour | **Firm flip**: cool moonlit outside, warm inside, changes again at the Second Fold. |
| Inside | **Nature and ruins mixed.** |
| Creatures | **One signature creature per region.** |
| Character | **Small figure, always on screen, follows the scroll**, as a scale reference. |
| Sound | **Optional ambient, off by default**, toggle in the nav. |
| Transitions | A **vocabulary** (unfold, zoom-through, layers part, pull-back, flip); all scroll-driven and reversible. |

## Technical
| Topic | Decision |
|---|---|
| Stack | Next.js 16 + React 19 + TypeScript + Tailwind v4 (in the repo). |
| Stance | **Good + light.** WebGL not assumed; 2D/CSS first. |
| Art authoring | **Procedural by code**, owner art-directs. |
| Devices | Mid-range phone and a 4 to 5 year old laptop must be smooth; adaptive quality on weaker devices. |
| Mobile | **Full vertical (portrait) recomposition.** |
| Hosting | **Vercel, no analytics.** |

## Build decisions (owner, 2026-11-14)
These override any conflicting wording in `concept.md`, `world-hollow-mountain.md`, `content-inventory.md` and `tech-spec.md`.

| Topic | Decision |
|---|---|
| Scope | **Everything**: 10 beats, 5 creatures, traveller, projects lane with 8 projects, deep links, EN + ID, sound. |
| Art vs content | **Art is world-only.** No object, prop or room is drawn for a specific project, role, skill or award. Content is HTML styled to belong to the world (paper cards, small labels). |
| Projects lane | Reverse side of the mountain: one **generic shell scene** with identical warm lit windows, grouped in 3 districts (web, data/ML, hardware). One window per project; its content (title, role, period, summary, links, screenshots) opens on a **paper card** in HTML. No per-project art; `chamber.scene` in the Project type is dropped. "Chamber" in older docs means window + card. |
| Roles, education, skills, awards | Carried by the **small label** of each main-lane beat (HTML text). No dedicated objects in the art. |
| Traveller | **Cloaked wanderer with a staff and one small warm lantern.** Walk cycle of 4 to 6 frames plus a look-up pose. |
| Creatures | Outside = night owl/moth; Inner Sun = colossal heron; Understory = giant stag with a canopy of antlers; Lantern Vault = lantern jellyfish/ray; Second Fold = **giant paper whale**. |
| Interaction | **Atmosphere only**: scroll, subtle pointer/gyro parallax, hover glow on forks. No mini-interactions. |
| Fork object | **One consistent shape**: a paper door/flap in the cavern wall with warm light leaking from its seam and a slow pulse. Real focusable button. |
| Copy | Agents draft **EN and ID** for every string including the big cinematic lines; the toggle switches everything. Owner edits `src/content/` afterwards. |
| Sound | Ambient from **open-licence sources (CC0 preferred)**, downloaded without per-file approval; source, author and licence recorded in `public/audio/CREDITS.md`. Off by default. |
| Routing | `/[lang]` (`en`, `id`) statically generated, `/[lang]/p/[id]` for project deep links, `/` redirects by `Accept-Language`. |
| Spikes | No throwaway spikes. **Beats 0 to 3 are the pilot** on the real engine (covers S1, S2, S3, S5); S4 (lane flip and exact return) is covered by engine tests. The other beats start only after the pilot passes in a browser. |
| Dev dependencies | `sharp`, `clipper2-ts`, `simplex-noise`, `svgpath`, `tsx`, `vitest` (dev-only). No GSAP, Lenis, three or zustand. |

## Build decisions b (owner, 2026-11-14, later the same day)
These override everything above where they conflict.

| Topic | Decision |
|---|---|
| Character | **No traveller.** No small figure anywhere. The giant creatures stay, redrawn larger and more detailed. The world must read as grand. |
| Art density | Still procedural by code, but **dense**: 14 to 16 layers per beat, no empty region over about 20% of the canvas, three depth planes each with small detail, scale cues (tiny architecture against huge forms), stacked-sheet depth. Paper grain is a CSS overlay, not baked. |
| Paper frame | **Layered paper frame on the screen edges**, always on screen: 3 to 4 nested torn-edge sheets with shadows, tinted per beat. |
| Transitions | Camera travels **through** the layers (per-layer dolly) and through a per-beat "gate" aperture whose sheets part; no plain cross-fades (except reduced motion). |
| Copy | **Portfolio first.** Each beat's big text is a plain section heading (name, About, Education, Experience, Projects, Skills, Awards, Leadership, Contact) and the facts are the main text. No cinematic/poetic lines. |
| Projects lane | Still a separate lane behind the door, but a **multi-scene scroll**: shell exterior intro, then one district beat per group (web, data/ML, hardware); project cards arrive inline on scroll, no dialog. Main lane has a Projects beat listing all projects, and the nav has a Projects button. Art stays world-only. |

## Build decisions c (owner, 2026-11-16)
Design pass "award level". These override everything above where they conflict.

| Topic | Decision |
|---|---|
| Length | Main lane **at most 20 screens** (hard cap), projects lane **at most 10**. Replaces "15 to 20" as a soft range. |
| Idle motion | **Idle motion is atmosphere.** Ambient loops that run without scrolling (stars, lanterns, leaves, creatures, window flicker) are allowed. Still no mini-games or click interactions in the scene. Off under `prefers-reduced-motion`. Desktop (`high` quality): full set, including art layers lifted out of the canvas as DOM "live" layers. Touch / `low` quality: a CSS-overlay-only subset (twinkle, snow, fireflies, flicker; no live layers, at most about 30 particles per beat). |
| Frame | Stays on screen but thinner: visible thickness **at most 24 px** per side at 1280 px, **at most 14 px** on phone; torn layered look kept. |
| On-screen copy | The main lane shows a **trimmed role**: kicker, period, title, organisation, **one** headline stat (the role's first stat), **one** line (its first point), and the project link if there is one. Full facts stay in `src/content/` and are still rendered in full by `<Plain>` (screen readers, no-JS), on the project cards and in the CV. |
| Opening | A short **opening sequence** (at most 2.5 s, never blocks scrolling, skipped under reduced motion, when loaded off the top, and on deep links) and an in-world **scroll cue** ("Scroll" / "Gulir") at the bottom of beat 0. |
| Wayfinding | A **section gauge** (dotted line into the mountain, one tick per section, lantern at the current position) that is real navigation; districts in the projects lane. |
| Typography | Body font **Source Sans 3**; display **Cormorant Garamond 600** over art. Five type tokens in `globals.css` `@theme`; minimum 16 px body and 12 px labels over art. |

## Superseded (do not use)
- Traveller / small always-on-screen figure; cinematic story lines as the main copy; projects lane as one static shell scene with dialog cards. Replaced by Build decisions b.
- Projects as diegetic chambers with their own objects/panels; experience, skills and awards as places or objects in the scene (the "first mapping ideas" in `content-inventory.md`). Replaced by cards and labels, see Build decisions.
- Paper River v4 world and its fixed shadowbox frame, step-based glides, hung tags and cards (kept only as an art-style reference).
- "Folded map" framing, "ink draws the world", "geography = folds", "each region a different paper craft". Dropped during discussion.
