# Decisions and open questions

Where documents disagree, this file wins. Newest at the bottom of each table.

## Decided
| # | Decision | Why |
|---|---|---|
| D1 | Start fresh, using nothing from the earlier versions | The earlier "night workshop" was too heavy and too 3D |
| D2 | Audience: craft and design community first | Sets the polish bar |
| D3 | Frame = fixed paper shadowbox; the world is a sliding panorama behind it; the viewer stays still | The user's core idea: "the scene moves, not you" |
| D4 | Navigation is step-based (buttons, keys, swipe, one wheel gesture = one step) | Calm, accessible, predictable on every device |
| D5 | World = one tropical night river, spring to sea, dusk to first light | One coherent, beautiful place; not a literal illustration of projects |
| D6 | Projects are not literal scenes; content hangs at stops | The user wants one amazing world, not themed levels |
| D7 | Real depth from 2D: 13 art layers, 3 water strips, 3 firefly depths, wide parallax | The user asked for depth even though the scenes are 2D |
| D8 | Art is coded SVG, art-directed by screenshot | The user chose it; Claude generates the art |
| D9 | Mood = warm night with glowing lamps | The user's pick |
| D10 | Voice = warm and wry | The user's pick |
| D11 | Content = mixed: short hung tag in the world + full paper card | The user's pick |
| D12 | A small, silent paper traveller in a boat | The user's pick; adds life and scale |
| D13 | Contact = email, LinkedIn, CV download. No GitHub, no phone | The user's pick |
| D14 | Project media = image slots, no external links | The user's pick |
| D15 | No references; Awwwards-level bar | The user's pick |
| D16 | No three.js, no WebGL; CSS + SVG/raster; one layout for phone and desktop with a phone merge profile | Lightness |
| D17 | Moon is the only key light; shadow direction (0.5, 1) always | Coherence |
| D18 | Eight stops, order: Spring, Terraces, Gorge, Pond, Mangroves, Estuary, Village, Lighthouse | `world.md` |
| D19 | Step glides 1200 ms with `--ease-glide`; same easing for every layer, no stagger | Reads as one camera move |
| D20 | Pitch P = 1700 art units; artboard height 1000; speeds in `layers.md`; strip length 7·s·P + 2400; rest-fan x = s·(i·P + 260) | Consistent maths |
| D21 | Traveller anchor 0.30 of opening width (0.34 on phone portrait); hanger 260 units ahead | `frame-and-layout.md` |
| D22 | Blur and shadows are baked; no live filters on moving layers | Performance |
| D23 | Docs only until the user starts wiring | The user's instruction |

## Open (needs the user)
| # | Question | Blocks | Default if unanswered |
|---|---|---|---|
| Q1 | Confirm type: Fraunces (display) + Figtree (body) | Phase 2 | Use them |
| Q2 | LinkedIn URL | Phase 4 | Placeholder button hidden until given |
| Q3 | CV PDF file and its path (`public/cv/Muhammad-Fatih-Zamzami-CV.pdf`) | Phase 4 | Download button disabled |
| Q4 | Project images (cover and thumb per project) | Phase 4 | "Image soon" placeholder |
| Q5 | Are the ProtoTech awards tied to Refocus? | Phase 4 | Shown on the Refocus card; move if wrong |
| Q6 | Friendly name for the solar project tag ("Sunlight Meter") | Phase 4 | Use the formal title |
| Q7 | Approve removing unused dependencies (three, R3F, drei, gsap, lenis, zustand, etc.) | Phase 1 | Leave them |
| Q8 | Hosting and domain | Phase 7 | Vercel preview URL |
| Q9 | Keep 8 stops, or merge Spring into the title and make 7? | Phase 2 | 8 |
| Q10 | Final palette tuning after first render | Phase 3 | Tokens as written |
| Q11 | Include optional ambient creatures and hidden details? | Phase 6 | Yes, after the core |

## To decide during the build
| # | Question | When | How |
|---|---|---|---|
| B1 | SVG versus AVIF per layer | End of Phase 1 | Measured frame time and memory |
| B2 | Whether the lite profile is needed | Phase 7 | Real-device tests |
| B3 | Tabbed or accordion roles card on phone | Phase 4 | Try both at 320 px |
| B4 | Whether to add a quiet sound toggle later | After launch | Out of scope now |

## Out of scope
Sound, 3D, a CMS, a blog, dark/light themes, languages other than English, analytics beyond privacy-friendly basics, a contact form.

## Change log
- Docs set written in `agents/`: concept, world, art-direction, depth-system, layers, traveller, motion, frame-and-layout, ui-components, content, design-tokens, art-pipeline, tech-architecture, build-order, decisions.
