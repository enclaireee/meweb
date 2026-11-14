# Concept draft: one world, portfolio inside it

> Status: draft for discussion. Nothing here is final.

## Core idea
There is **one paper world**. It exists whether or not you are visiting. The portfolio is not presented *to* the visitor; it is *found in* the world. Projects, skills, experience and contact are things that belong there: objects, buildings, creatures, signs, lights.

Test for every piece of content: **"If the portfolio did not exist, would this object still make sense in the world?"** If not, it is a showcase element and does not belong.

## What changes from v4
| v4 Paper River | New direction |
|---|---|
| Fixed shadowbox frame | Full-bleed world (frame optional, only as an opening/intro device) |
| Calm, step-based glides | Cinematic, with real moments of surprise; scroll or exploration |
| One palette, subtle sky shift | Distinct regions with distinct mood and palette, still one coherent world |
| Hung tag then card | Content is an object in the world; interacting with the object reveals the detail |
| Content is secondary | World is the draw, content is the discovery |

## What we take from the reference (transferable, not copied)
- Hard scene/mood changes between regions.
- A hero that is already a finished image in one screen.
- One short, large line per region; tiny label under it.
- Particles, light, sound, side progress nav as living details.
- Plain native scroll as the baseline.

## What we do NOT take
- Marketing-page structure ("The Game / Classes / Bosses / Download"). This is not selling a product.
- Presenting each work in its own custom showcase.

## How content lives in the world (examples to react to, not decided)
These are idea seeds only. The right mapping depends on the world chosen.
- **A project** is a thing a place would naturally have: a stall, a boat, a workshop, a lit window, a lantern, a bottle in the river. It looks like it belongs to the world; opening it shows a paper card with real detail (links, images, role).
- **Skills** are tools or crafts visible in the scene (a loom, a net, an instrument), not a bar chart.
- **Experience / timeline** is the journey itself (distance travelled, seasons, tide).
- **Contact** is an arrival: a lit lighthouse, a mailbox, a lamp left on.
- **Findability for recruiters:** a diegetic **map or index** (a paper map, a scroll) lists everything and jumps to it. Fast path exists without breaking the world.

## Decided structure (round 1): two lanes
- **Main lane:** the WOW experience. One scroll-based journey, complete on its own.
- **Projects lane:** a separate lane, optional. Entered by **clicking/tapping an object** in the main lane (the fork). Contains the projects.
- Option C (hybrid) from above is chosen; branches are optional.

### Modularity requirement for the projects lane
Adding a project later must be easy. Design rule: **a project is data plus (optionally) a small scene component, registered in one place.**
- Each project is one entry in a registry (title, date, role, links, media, tags, which world object it hangs on, optional custom scene component).
- The lane renders from the registry; no edits to core engine code to add a project.
- A project without custom art still works (generic paper card/scene from the data); custom art is an upgrade, not a requirement.
- Deep link per project id.

## Decided scroll language (round 2): a transition vocabulary
There is no single scroll mechanic. The world has a **vocabulary of transitions**, and each section boundary uses a different one, so no two feel alike:
- **Zoom-through:** scroll dives into an object (window, door, lantern, eye of a mask) and the next world is nested inside it.
- **Fold / unfold:** the scene is a paper sheet that folds away or unfolds to reveal the next one.
- Others may join later (tear, slide, curtain, pop-up rise, time shift) as long as they stay paper and stay in one world.

Rules to keep it coherent:
1. Every transition is scroll-driven and **fully reversible** (scroll up plays it backward).
2. One shared paper material language (grain, edge, shadow, light) so different transitions still feel like one object.
3. Distinct mood per section (palette, light), same world.
4. Priority is **full WOW**; the experience is not compromised for a recruiter shortcut. Baseline stays: real HTML text, reduced-motion fallback, deep links.
5. The projects lane is entered by the **same transition vocabulary** (e.g. zoom into the fork object) and is a **parallel lane of the same world**, with a clear exit back to the exact spot on the main lane.

## Structure: trunk and branches (earlier framing)
Direction from owner: the experience has a **main path (trunk)** and **projects as branches** off it. Everything is **one continuous scroll**.

- **Trunk:** the main journey. Scrolling down always moves forward, scrolling up reverses. Carries the story: arrival, who, experience, contact.
- **Branch:** a project section that splits off the trunk at a fork. It is its own region of the world with its own mood, but built from the world's own vocabulary (see mapping rule below), not a custom showcase.
- **Fork:** a visible moment in the world where the path divides. The visitor sees that a branch exists before choosing it.
- **Return:** a branch ends by rejoining the trunk (or looping back), so the visitor never gets lost and never needs a back button.

Ways a branch could work inside one scroll (to decide, see `open-questions.md`):
- **A. Inline detour.** The scroll passes through each branch in order, as extra chapters on the way. Simplest, but not really optional.
- **B. Choose-and-return.** At a fork, the visitor picks a branch; the scroll axis continues into it, and finishing (or scrolling back) returns to the trunk. Optional and feels like exploring.
- **C. Hybrid.** Trunk is linear and complete; branches are optional detours that open at forks. Skipping a fork costs nothing.

Hard requirements whichever is chosen:
1. One scroll container and one timeline; no route changes that break the experience.
2. Deep links to a branch (URL hash or param) so a project can be shared and recruiters can land on it.
3. Progress nav shows the trunk with branch marks and the current position.
4. Scroll back always reverses cleanly.
5. Reduced-motion and no-JS fallback: branches readable as plain sections.

## Craft principles (carried over, still valid)
1. Flat paper sheets, real depth through layering, parallax, haze, shadow. No fake 3D.
2. Light is the story: warm light leads the eye to what matters.
3. Real HTML text; works with motion reduced.
4. The craft must be good enough to be admired (audience includes the design/creative-dev community).
5. Keep it light: CSS/SVG first, canvas/WebGL only where it earns the effect.

## WOW levers (where the wow can come from without a showcase)
- Scale and composition of the opening image.
- A world that reacts to you (cursor light, paper that rustles, things that notice you).
- Contrast between regions (a sudden day to night, tight to vast).
- Sound (optional, off by default).
- Tiny delightful details that reward exploring.
