# The Hollow Mountain (chosen world, draft v0)

> "It looked small from outside."

Status: chosen by owner. Details below are the assistant's draft for review, not yet confirmed.

## One-line
A quiet paper mountain at night that unfolds like origami and turns out to contain a vast world, and that world contains bigger ones.

## Fixed constraints
Layered flat papercut shadowbox (v4 art direction); epic cinematic tone (aksarakala-like: huge scenes, one big line per scene, glow, distinct mood per region); one continuous scroll; aimless exploration; neutral fantasy; two lanes; projects are modular and diegetic.

## Core mechanic: the scale flip
The signature move is that **scale and light invert at a fold**. Outside: small, cool, quiet. Inside: vast, warm, alive. The visitor's sense of size is reset again and again, so WOW never relies on one trick only.

Tools in the transition vocabulary used here: **unfold** (the mountain opening), **zoom-through** (passing a threshold), **layers part** (curtains of cut paper), **pull-back** (scale reveal).

## Main lane: beat sheet (draft)
~20 screens of native scroll. Lines are placeholders.

| # | Beat | What happens | Mood / light |
|---|---|---|---|
| 0 | **Outside** | One paper mountain under the moon, a single warm window, layered hills, mist. "It looked small from outside." | Cool moonlit, one warm point |
| 1 | **Approach** | Parallax push-in. The mountain fills the screen; crease lines show on its face. | Cool, tension rising |
| 2 | **The First Fold** | The mountain unfolds, origami-style, like a door opening. | Light leaks through the opening seam |
| 3 | **Scale flip** | Zoom-through the threshold. The interior is huge: a cavern hall far bigger than the mountain could be. "Bigger on the inside." | Colour flips to **warm** |
| 4 | **The Inner Sun** | A paper sun hangs in the vault, lit through vellum. First wide reveal, the epic hero shot. | Gold, glowing |
| 5 | **The Understory** | Layered forest canopies and roots, stairs of paper. Layers part like curtains as you walk through. | Deep green, dappled light |
| 6 | **The Lantern Vault** | Darkness; thousands of lanterns hung like constellations. Single big line. | Dark, cool with warm points |
| 7 | **The Second Fold** | Deep inside there is another mountain. It unfolds, and scale flips again. | Colour flips again (e.g. to dawn) |
| 8 | **The Seam** | Pull-back reveals the whole thing is nested folds of one sheet. | Quiet, vast |
| 9 | **The Window** | Back at the single warm window of beat 0, now seen from inside: the place to leave a message (contact). Loop closed. | Warm, calm |

Cadence: surprise, hold, surprise. Each beat is a full-screen composition; text is one large line plus a small label, as in the reference.

## Projects lane (reverse side)
- **Fork objects** inside the world: glowing doors, tabs or flaps that look like they belong to the cavern walls.
- **Clicking one flips the world inside-out.** You see the mountain's **outer shell** from the other side, where the skin has hollows, doors and balconies.
- **Each project is a chamber** in the shell, in the same papercut style. The chamber's content (title, role, date, links, media) lives inside the chamber as objects and panels that belong to the room.
- **Exit** flips back to the exact spot inside.

### Modularity
- A project is one entry in a registry: id, title, date, role, links, media, tags, chamber position or auto-placement, optional custom chamber scene.
- The shell is generated from the registry: adding an entry adds a chamber.
- Without custom art, a project uses a generic chamber template. Custom art is an upgrade, not a requirement.
- Deep link per project id.

## Rules to protect the WOW
1. Only one hero effect per beat.
2. Every transition is scroll-driven and reversible.
3. No beat repeats the same composition.
4. Warm light stays meaningful (sun, lanterns, window), also in the inside.
5. All text is real HTML; reduced-motion fallback exists.

## Decisions from round 10
- **Character:** a small figure (working name: the traveller) who exists to make the scale readable. Rules: always tiny against the world, silent, reacts to light and big things, never the focus of the frame; lives in the main lane and does not appear as a showcase in project chambers unless needed. Design and animation scope to be defined (keep cheap: few poses, mostly walking and looking up).
- **Colour:** firm flip. Outside cool moonlit; inside warm (gold sun); Second Fold flips again (e.g. dawn rose / cold blue). Colour is a WOW lever.
- **Inhabitants/environment:** nature and ruins mixed. Roots through staircases, trees through arches, moss on bridges, shrines half-swallowed. Vegetation and ruin share every region.
- Ruins give the world history without people; projects can live as **restored or still-lit rooms among the ruins**, which fits chambers.

## Open details (to discuss)
- ~~Character~~ decided: small scale-reference figure. Remaining: design, and whether it follows the scroll or appears at set moments.
- ~~Colour flip~~ decided: firm flip.
- Ending: is the window loop (beat 9) the right ending?
- ~~What lives inside~~ decided: nature and ruins mixed. Remaining: any huge creatures at epic moments?
- Number of nested folds and total scroll length.
- Sound.
- Hero execution: WebGL for the fold vs layered 2D/CSS with fakery; needs a spike.
