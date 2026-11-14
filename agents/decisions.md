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

## Superseded (do not use)
- Paper River v4 world and its fixed shadowbox frame, step-based glides, hung tags and cards (kept only as an art-style reference).
- "Folded map" framing, "ink draws the world", "geography = folds", "each region a different paper craft". Dropped during discussion.
