# Discussion log

## 1. Reset
- Deleted all previous code and notes. Fresh Next.js + TypeScript + Tailwind boilerplate.
- Keep: the **paper** aesthetic (paper-cut, layered, soft shadows).
- Problem with v4 (Paper River): not enough "showcase", not enough **WOW**.

## 2. Reference: https://aksarakala.vercel.app/
A landing page for a pixel-art action RPG. Checked by screenshot while scrolling (about 26 screens, native scroll, ~23,400px at 1440x900).

What creates the WOW there:
1. **Every section is a different world.** Dusk ruins, misty night combat, bamboo forest, crystal dungeon, boss reveal. Palette, mood and composition change completely. It plays like a film.
2. **Strong hero.** Huge display type, big foreground character, layered silhouettes, floating glowing glyphs tied to the theme, one high-contrast accent glow.
3. **Very little text, very large.** One punchy line per scene ("Release to cast."), a tiny sub-label under it.
4. **Living details.** Particles/fireflies in every scene, side progress nav with labels, sound toggle, language switch.
5. **Plain scroll.** Long page, no scroll hijack.
6. **The subject is shown, not described.** The game itself is on screen.

## 3. Diagnosis of v4 (Paper River), from its concept doc
- Fixed shadowbox frame shrinks the canvas; the world is seen through a small window.
- "Calm over clever" gave no moments of surprise.
- One world with one palette; the 8 stops felt alike.
- Work appeared as small hung tags, content hidden until opened. The content was secondary.

## 4. Owner direction (important, overrides earlier assistant proposal)
- The assistant first proposed "one project = one diorama, screenshots as paper screens". **Rejected.**
- Owner does **not** want a "CV presentation / showcase". Owner wants **one world**, and the portfolio is **put inside it**.
- If there is a Project A, it should simply **stick with the world**. Do not build a special scene or presentation for Project A. The world already has a natural place or object for it.
- The WOW should come from the world itself (craft, scale, atmosphere, discovery), not from presenting work.
- Discussion is captured in `agents/` in the repo.

## 5. Structure: projects are branches (owner direction)
- Projects live in **separate sections**, as **branches / forks** off the main path of the experience.
- Hard constraint: everything stays **one scroll-based experience**. No separate pages, no leaving the world.
- Still holds: branches must belong to the world (no custom showcase per project).
- Assistant note: if the river setting is kept, tributaries are a natural fit for branches. Not decided.

## 6. Answers from owner (AskUserQuestion round 1)
- Branches are **optional** (hybrid, option C). The main experience is complete without them.
- Entering a branch: **click/tap an object** in the world (the fork).
- Two **lanes**: **main lane** = the WOW experience; **projects lane** = where projects live, entered by click. Not "N branches by count"; projects are one lane.
- Projects lane must be **as modular as possible**: adding a project in the future must be easy.
- Setting: **undecided**. Owner wants something genuinely WOW for a portfolio, with a **scroll experience people have never felt before**.

## 7. Answers from owner (AskUserQuestion round 2)
- Scroll mechanic: a **hybrid**. Each section transition is **different and dynamic**. Chosen ingredients: **endless zoom** and **folding/unfolding paper**. (Pop-up book and time-as-scroll were not picked; may still appear as one transition among many.)
- Projects lane: **same world, parallel lane**. The camera slides/zooms into a lane of the same world; scroll keeps working; clear exit.
- Priority: **full WOW**. Fast-path for recruiters is not a requirement. (Engineering baseline stays: real HTML text, reduced-motion fallback, deep links.)

## 8. Answers from owner (AskUserQuestion round 3)
- World: **a giant folded paper map.** Scroll unfolds it; zooming into a point on the map enters that scene. Fold and zoom share one logic.
- Projects lane = **the other side of the map** (assistant's suggestion attached to this option; matches "parallel lane of the same world"). Confirm when detailing.
- Identity influence: **neutral / fantasy.** No Indonesian or electrical-engineering theme required. World stands on its own.

## 9. Answers from owner (AskUserQuestion round 4)
- Map fiction: **rejected all four standard options** (islands, mountains, towns, sky map). Owner: "dig deeper, nothing ordinary."
- Emotional tone: **epic and grand.**
- Main lane story: **aimless exploration.** No quest; the wonder of each region is the reason.
