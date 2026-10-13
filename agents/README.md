# agents/: design documentation

Everything needed to build the **Paper River** portfolio lives here. These docs are the design; the code is wired from them later. Where two docs disagree, `decisions.md` wins, then the more specific document wins over the more general one.

## Reading order
1. `concept.md`: what it is and why. Start here.
2. `world.md`: the river, the eight stops, the night's arc.
3. `art-direction.md`: how the paper looks and feels. The material rules.
4. `depth-system.md`: how flat layers get real depth. Coordinates, speeds, formulas.
5. `layers.md`: the layer manifest and what each layer contains at each stop.
6. `traveller.md`: the character.
7. `motion.md`: how things move, timings, input.
8. `frame-and-layout.md`: the shadowbox, responsive rules, chrome.
9. `ui-components.md`: tag, card, controls, dots, image slots.
10. `content.md`: all copy, taken from the CV.
11. `design-tokens.md`: exact colours, type, shadows, timings, with contrast checks.
12. `art-pipeline.md`: how to author and export the SVG layers.
13. `tech-architecture.md`: stack, folders, wiring, budgets, accessibility, testing.
14. `build-order.md`: phases and acceptance criteria.
15. `decisions.md`: decision log and open questions.

Also here: `CV_Muhammad Fatih Zamzami.md` (content source of truth) and `AGENTS.md` (a Next.js 16 warning for coding agents).

## One-paragraph summary
A fixed paper shadowbox frames a single paper-cut tropical night river. Thirteen art layers, three water strips and three depths of fireflies slide past at different speeds when the visitor steps to the next of eight stops. A small paper traveller poles a boat on the spot. At each stop a paper tag hangs in the world; opening it brings up a paper card with the details. The sky runs from dusk to first light across the journey. It is built with CSS, SVG and a little React, with no 3D engine.

## Conventions used in these docs
- **Art units**: the layer coordinate system. Artboard height is 1000 units. See `depth-system.md`.
- **Pitch (P)**: 1700 art units. The distance the speed-1.0 layer moves per stop.
- **Speed (s)**: how far a layer moves per stop, as a fraction of P.
- **Stop i**: 0 to 7.
- Token names look like `--c-moon`, `--ramp-3`, `--dur-step`. All defined in `design-tokens.md`.
- "Layer 07" means the layer with id `07` in `layers.md`.
