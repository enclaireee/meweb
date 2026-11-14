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
