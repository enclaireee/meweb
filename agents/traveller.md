# Traveller: the small silent boatman

A small paper figure in a flat boat, with a lantern on a hooked pole at the bow. Fixed on screen. The world moves past it. He never speaks; his body language is the voice.

## Look
- **Size:** about 150 units tall including hat (about 15 percent of the artboard). The boat is 260 units long, 34 units tall.
- **Shape language:** conical bamboo hat (the single strongest silhouette), simple cloak, one arm holding a pole. Hat 70 units across. Face never shown, his back is partly to us, three-quarter turned toward the direction of travel (right).
- **Colour:** body in `--ramp-1` with lit rim; hat `--c-bamboo` (a muted warm tan, the largest warm area outside lights); boat `--ramp-2` with a single `--c-ember` stripe; lantern `--c-lantern` with a punched shade.
- **Light:** the lantern lights a small warm disc on the water in W2 and tints the boat's near edge. His shadow is cast by the moon like everything else.
- **Placement:** anchor `A = 0.30 · frame width`. Waterline at vertical 62 percent of the artboard (620 units). He sits on W2.

## Parts (rig)
Each part is a flat SVG shape, positioned and rotated with CSS transforms. Pivot points in the part's local units.

| Part | Pivot | Notes |
|---|---|---|
| boat | centre bottom | rocks ±1.5° on `--dur-bob` |
| body | hip | leans ±2° with the pole stroke |
| head+hat | neck | tilts ±3°; hat stays dominant |
| pole arm | shoulder | rotates -18° to +12° as he poles |
| pole | hand | extends into the water; tip hidden below W2 edge |
| lantern pole | boat bow | slight sway ±2.5° lagging the boat |
| lantern | hook | swings ±6°, glow sprite scales 96 to 104% |
| wake | stern | two paper arcs that scale and fade |

Seven to nine pieces. All pieces are in one SVG so it is one composited layer.

## States
| State | When | Motion |
|---|---|---|
| idle | Resting at a stop | Slow bob (boat ±1.5° over 4.5 s). Gentle pole dip every 6 s. Lantern sway. |
| travelling | During a step (1.2 s) | Pole strokes, 2 per step, body leans forward, wake grows, boat dips 1.5% |
| arriving | Last 300 ms of a step | Pole holds the water, body leans back, wake fades |
| looking | Pointer hovers a tag | Head turns toward the tag, hat tilts 4° |
| greeting | Opening a card | Lifts the lantern 8 units, head tilt, lantern glow +12% |
| waiting | No input for 20 s | Slow stretch, lantern swing wider, looks at moon for 3 s |
| lighthouse | Stop 7 only | Turns the lantern low and waves to the keeper window |
| reduced | Reduced motion | Still pose, only a 1-unit lantern flicker |

State is derived from the navigation state (see `motion.md`), not from timers inside the character, except `waiting`.

## Reactions to the world
- **At stop 2 (gorge)** a bat passes: he glances up (head tilt).
- **At stop 3 (pond)** fireflies gather around the lantern; he holds still.
- **At stop 6 (village)** a rooster crows: he nods once.
- **At stop 7** see lighthouse state.

All are optional polish. Core needs idle, travelling, arriving only.

## Silence
No speech bubbles, no emote icons, no sound. The traveller's emotion is body language only.

## Accessibility
Decorative: `aria-hidden="true"`. His animation stops with reduced motion (see `motion.md`).

## Drawing checklist
- Hat reads as a cone even at 40 px wide.
- Pole arm and pole must be separate pieces so the stroke can be animated.
- Keep every piece at least 3 units thick.
- Lantern shade has a kawung hole pattern to throw light on the water.
- Do not give him facial features.
