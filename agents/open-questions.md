# Open questions

0. ~~Branch mechanics~~ **Decided:** optional hybrid, entered by clicking an object; two lanes (main + projects). Remaining: how the projects lane looks and behaves once entered.

0b. **(old text)** Inline detour (A), choose-and-return (B), or hybrid (C)? See `concept-draft.md`. How is a fork shown in the world, and how does the visitor choose while still using only scroll (scroll direction? hover/click on the fork? both)?

1. ~~World setting~~ **Decided: folded map, fantasy, neutral identity.** (old:) World setting and the "never felt before" scroll mechanic.** Undecided; owner wants something new. See `concept-draft.md` candidates.

1b. (older) **World setting.** Keep the SE-Asian night river (spring to sea), or a new world? The river is elegant for a journey, but a different setting may allow more varied regions.
2. **Navigation model.** Native scroll through the world, step-by-step (v4), or free exploration (drag/pan, walk)? Reference uses plain scroll.
3. **Interaction depth.** Atmosphere only (cursor light, parallax), or playful interaction (light lanterns, pull paper, row the boat)?
4. **Content inventory.** Real list of projects, experience, skills, and what media exists (screenshots, video, none). This decides what objects the world needs.
5. **Mapping rule.** How literal should object-to-content mapping be (obvious signage vs. discovered metaphor)?
6. ~~Audience balance~~ Decided: full WOW. (old:) Design/creative-dev community (Awwwards-style) vs recruiters. Decides how much to trade fast readability for atmosphere.
7. **Sound.** Yes/no, and what.
8. **Language.** English only, or EN/ID like the reference.
9. **Mobile.** Same world re-composed, or simplified.

## New after round 3
10. ~~Map fiction~~ **Decided in round 5: Folded World that draws itself, epic, aimless exploration.** Remaining: the actual regions/places, what the hero world looks like (terrain? architecture?), and the colour language of ink vs blank paper. Old text: **Map fiction (round 4: tone = epic, story = aimless exploration, standard options rejected; need a non-ordinary premise).** Old text: What kind of fantasy map: sea/islands, mountains/valleys, a city, the night sky? What are the regions of the front, and what is the tone (cozy, mysterious, epic)?
11. **What is the story of the main lane?** Why does the visitor unfold the map, and what do they arrive at (an ending/contact)?
12. **Technical feasibility spikes.** Fold in 3D (CSS 3D vs three.js/WebGL), zoom-through with nested scenes, performance budget. Prototype before locking.
13. **Content inventory** (still needed): projects, experience, skills, media.
14. **Hero content.** What is in the first grand screen (what does the folded world show)?
15. ~~Ink look~~ Superseded by round 6 (paper ART, not ink). Open: does anything stay blank/unexplored, and how does the world "build itself" from paper? Old text: Pure black/sepia ink on white, or coloured/light-emitting ink? Does the ink glow?
16. **Do we build a hero prototype first** (WebGL fold + ink reveal) to prove feel and performance before designing everything else?

## After round 9
World chosen: Hollow Mountain. Open details are listed at the end of `world-hollow-mountain.md`.

## After tech spec (round 13)
17. ~~Decided: procedural by code.~~ **Who authors the art?** Assumption: coded procedurally by Claude (as in v4) and art-directed by the owner. Confirm, or hand-made/AI-assisted assets?
18. ~~Decided: mid-range phone + ordinary laptop.~~ **Device and browser targets.** Which minimum phone/laptop and browsers must be smooth?
19. ~~Decided: full vertical recomposition.~~ **Mobile composition.** Same world recomposed vertically? Portrait framing of the beats.
20. ~~Decided: Vercel, no analytics.~~ **Hosting and analytics.** Vercel? Any analytics?
