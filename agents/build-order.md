# Build order

Phases, each ending in something that can be looked at and judged. Do not start a phase until the previous one is accepted. No code exists yet; this is the plan for when wiring begins.

## Phase 0: Decisions closed
Resolve the open items in `decisions.md` that block work: type choice, LinkedIn URL, CV PDF, dependency cleanup approval.
**Accept:** items marked "blocks Phase 1" are all answered.

## Phase 1: Validation prototype (no art)
Plain coloured rectangles with baked-style shadows, 13 layers plus water, using the real speeds and strip lengths from `layers.md`. Wire `--pos`, step by button, a stub frame.
- Compare inline SVG, `<img>` SVG and AVIF tiles on desktop and a real phone.
- Measure frame time during a move, memory, and first paint.
**Accept:** a decision recorded in `decisions.md` (raster or SVG per layer) and the numbers meet `depth-system.md` budgets. Moves hold 55+ fps on a mid-range phone.

## Phase 2: Shell
Frame (rings, ornaments, grain, inner shadow), the stage, layout maths (`k`, anchor, safe band), input (button, key, wheel, swipe), nav state machine, hash deep links, reduced motion path, no-JS stacked view with placeholder copy.
**Accept:** all eight stops reachable by every input; no horizontal overflow at 320, 375, 768, 1280; state machine unit tests pass; stacked view shows all stops.

## Phase 3: Vertical slice
Final art for **stop 0 and stop 1** across all layers, the traveller (idle, travelling, arriving), water, fireflies, the tag and card for both stops, entry sequence.
**Accept:** the user judges the look at three viewport sizes and approves the art direction. The glide between the two stops feels like one camera move. The tag pendulum feels right.

## Phase 4: Content and UI complete
All eight tags and cards with real copy from `content.md`, image slots, nav dots, buttons, footer, hint, motion toggle, live region, SEO metadata.
**Accept:** keyboard and screen reader pass; axe clean; contrast per tokens; all copy checked against the CV.

## Phase 5: The rest of the river
Stops 2 to 7, in order, with sky tints, haze, and per-stop dials. Each stop is signed off as it lands.
**Accept:** per stop, landmark alignment (rest-fan) correct, no seam at tile joins, tag readable and unobstructed, budgets met.

## Phase 6: Life
Ambient creatures, hidden details, traveller reactions, lighthouse beam, lantern punched patterns on every lantern, pointer parallax.
**Accept:** idle motion count ≤ 12 concurrent; no frame regressions; reduced motion still looks complete.

## Phase 7: Polish and ship
Phone merge profile checked on real devices, lite profile, image optimisation, OG image, 404, performance pass, Lighthouse, final Playwright suite, domain and deploy.
**Accept:** Lighthouse performance ≥ 90 on mobile for the stacked content; FCP ≤ 1.8 s on 4G; CLS 0; zero console errors; art within budget.

## Definition of done (whole project)
- Eight stops reachable, content correct against the CV.
- Frame fixed, world moves, the traveller is silent and charming.
- Works at 320 px to 2560 px wide, portrait and landscape.
- Usable by keyboard and screen reader, with reduced motion.
- No 3D engine, no unneeded dependencies.
- Fast first load and steady 60 fps feel on a mid-range phone.

## Rough effort split (for planning, not a promise)
Prototype 5 percent, shell 15, slice 20, UI and content 10, remaining stops 35, life 10, polish 5.

## Suggested parallelisation (for agents)
- Art generators per stop are independent once the helpers exist (one agent per stop, never two on one file).
- UI components (tag, card, dots) are independent of art once tokens exist.
- State machine and input are independent of everything and unit-testable alone.
