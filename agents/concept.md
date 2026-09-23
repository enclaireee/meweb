# Concept: The Paper-Cut Diorama

*A design language, not a scene. It describes how the material behaves, how depth and colour are organised, and how things move. The subject, palette and characters are yours to choose.*

---

## 1. The core idea

The screen is a **shadowbox**: a shallow box with sheets of hand-cut paper stood up one behind another, seen through a frame. Nothing is drawn *on* the screen. Everything is a **physical object inside a box**, and the design's job is to make that believable.

| Principle | Meaning |
|---|---|
| **Handmade** | Every edge is slightly imperfect, as if cut by hand. Nothing is vector-perfect. |
| **Layered** | Depth is real: flat sheets arranged in actual 3D space. The sheets are flat; the box is not. |
| **Staged** | It behaves like a small theatre: it can be relit, things hang on strings, and something small is alive in it. |

Reference points: toy theatres, pop-up books, museum specimen plates, shadow puppetry.

---

## 2. Material rules

These define the material. Everything else is flexible; these are not.

1. **One colour per sheet.** Each shape is a single flat stock. Paper has no gradients; only light does.
2. **Imperfect edges.** Outlines drift slightly along their length, like a blade or scissors wandering. Felt before it's noticed.
3. **Depth from shadow.** Each sheet casts a soft shadow onto the one behind it. The closer a sheet is to the viewer, the larger, softer and further offset its shadow.
4. **Thickness shows on the lit edge.** A hairline highlight on the side facing the light suggests the paper has thickness.
5. **Visible fibre everywhere.** A faint grain covers every surface, backdrop included, so the whole scene reads as one material.
6. **Openings are cut, not painted.** Windows, gaps and details are holes through a sheet, revealing the layer behind.
7. **One light source.** Shadows always fall in the same direction. If the light moves, everything's shadow moves with it.
8. **Paper doesn't stretch.** Sheets can shift, tilt, hinge, rotate, sway, lift and drop. They never squash, morph or melt.
9. **Flat inside, dimensional outside.** A single sheet never pretends to have volume (no bevels, no painted shading). All the 3D comes from how sheets sit in space relative to each other and to the light.

---

## 3. Depth structure

Any subject can be broken into a stack of roughly 6–10 sheets. What changes from back to front follows fixed rules.

| Property | Back of the box | Front of the box |
|---|---|---|
| **Value** | Lightest, closest to the backdrop | Darkest |
| **Saturation** | Muted, hazy | Richest |
| **Silhouette complexity** | Simple, broad shapes | Busy, detailed edges |
| **Shadow** | Tight and faint | Wide, soft and strong |
| **Movement (parallax)** | Barely moves | Moves the most |
| **Scale of elements** | Small, distant | Oversized, cropped by the frame |

**Sheet roles** (use whichever your subject needs):

- **Backdrop:** the lit card at the very back. Carries the "light source" feeling.
- **Hung elements:** objects on strings from the top of the box, in front of the backdrop but behind the scenery.
- **Far sheets:** the horizon. Simple and pale, detail only as tiny cut-outs.
- **Middle sheets:** the main shapes of the subject.
- **A guiding path:** one element that leads the eye from back to front (a road, a river, a line of light, a cable).
- **Stage floor:** the sheet where the hero lives.
- **Detail sheet:** small textured elements that reward a closer look.
- **Foreground:** dark, oversized silhouettes cropping the edges, so the viewer feels like they're peeking in.
- **Frame:** a mat and border that close the box.

---

## 4. Dimensional effects (where the concept shines)

This is the concept's biggest advantage. Because every element is a flat plane at a known depth, the scene is already a real 3D space, just a very simple one. That means dimensional effects look *correct* for free, and they're far more convincing than on a flat illustration. These are the effects worth leaning into.

### 4.1 Parallax, the foundation
Each sheet shifts by an amount tied to its depth. Near moves a lot, far barely moves. This is the minimum and it already makes the box feel real.

- Drive it from the pointer on desktop, drag on touch, and device tilt on phones (tilting the phone to "look around" the box is one of the strongest moments this concept can offer).
- Keep a gentle idle drift so the depth is visible even before anyone interacts.

### 4.2 Tilting the whole box
Instead of only sliding layers, rotate the entire box slightly in perspective as the viewer moves, like holding a shadowbox and turning it in your hands.

- Small angles only. A few degrees is enough; more breaks the "shallow box" feeling.
- The frame tilts with it, which sells that it's one physical object.
- Combined with parallax, this gives true "looking into" depth.

### 4.3 A movable light
Let the light source move (following the pointer, time of day, or a scene state) and have **every shadow respond**:

- Shadows slide away from the light, and the gap between sheets becomes visible as the light rakes across.
- The lit hairline edge moves to whichever side faces the light.
- The paper grain catches more light when it's lit at a low angle, like real fibres under a desk lamp.
- A "torch" mode (a pool of light following the cursor in a dark state) is a natural extension: sheets reveal themselves only where the light falls.

This is often more impressive than parallax, because it proves the layers are physically separated.

### 4.4 Layer separation and collapse
The spacing between sheets is a parameter you can animate.

- **Exploded view:** on hover or a key moment, the sheets pull apart in depth so the viewer sees the stack from a slight angle. Shadows grow as gaps widen.
- **Collapse:** sheets flatten back together into what looks like a single illustration. Toggling between the two is a satisfying "reveal the craft" moment, great for a portfolio intro.

### 4.5 Pop-up and hinge motion
Real paper folds and hinges. This is the one kind of rotation paper is built for.

- **Pop-up entrance:** sheets start lying flat on the floor of the box and hinge upright into place, back to front, like opening a pop-up book.
- **Hinged pieces:** doors, flaps, signs and cards rotate on a visible edge or pin.
- **Flip cards:** a piece rotates to reveal a different back side (paper has two sides; use it for hidden information or a second state).
- When a sheet turns edge-on, show its **thickness** as a thin edge strip. This tiny detail is what separates convincing paper from a flat plane.

### 4.6 Camera moves through the box
Treat scroll or navigation as the camera dollying into the box.

- As you "move forward," foreground sheets slide out past the edges and the next layers come into view, like walking through a set.
- Sections of a page can be different depths of the same box rather than separate slides.
- Keep the camera path straight and slow. The magic is in passing between layers, not in fancy flight.

### 4.7 Occlusion and peeking
Because layers genuinely overlap, things can hide.

- Elements tucked behind a sheet are revealed only when the viewer shifts their viewpoint.
- The hero can duck behind a layer and reappear.
- Rewarding viewers for looking around is something only a layered world can do.

### 4.8 Hanging objects in depth
Objects on strings live at their own depth, between sheets.

- They swing in space and cast moving shadows on the sheet behind them.
- A swinging object's shadow shifting across the scenery is a cheap, highly convincing depth cue.

### 4.9 Focus (use sparingly)
A slight softness on the very back or very front sheet can suggest a camera lens, drawing attention to the middle. Treat this as a *camera* effect, not a *paper* effect, and keep it subtle; the handmade crispness of edges is part of the charm.

### Dimensional rules

- **Depth is fixed per sheet.** Every effect should use the same depth values, so parallax, shadows, tilt and separation all agree. If they disagree, the illusion breaks instantly.
- **Shadows are proof.** Whenever something moves in depth, its shadow must change with it.
- **Shallow, not vast.** It's a tabletop box, not a landscape. Keep angles and distances small.
- **Rotate only on hinges and pivots.** Free-floating 3D spinning reads as digital, not paper.
- **Always return to rest.** After any dimensional move, the box settles back to its composed front view.

---

## 5. Colour logic

No fixed palette. Pick your own colours, but pick them by these rules.

**Building a palette**

- **One material family.** All colours should feel like papers from the same pack: similar softness, nothing neon or pure.
- **A value ramp, not a set of hues.** Arrange your stocks from light to dark first, then assign them back to front. Depth depends on the ramp, not on which hues you use.
- **One base hue family** carries most of the scene.
- **One accent**, clearly opposed to the base (warm against cool, or the reverse). It is used rarely: on the hero, and on two or three small details at most. Its scarcity is what makes it work.
- **A warm neutral paper** for the backdrop, UI and mat. It ties the scene and the interface together.
- **Ink** for text: a deep, slightly warm dark, never pure black.
- **Shadows are tinted** by the light, not grey.

**Lighting states (e.g. day and night)**

A second state isn't a dark filter over the first. It's **the same box relit**:

- Every sheet swaps to a new stock, but **the value ramp stays in the same order**. Back is still lightest, front still darkest.
- The whole scene shifts toward one temperature (cool for night, warm for dusk, etc.).
- Shadows change colour with the light.
- A few **small light sources** appear in the opposite temperature: tiny cut-out glows, pin-prick points. Small lights in a dark scene are what make it feel intimate rather than empty.
- The accent survives in both states, adjusted to the new light, so the hero stays recognisable.

---

## 6. Typography

- **One typeface voice, with a literary or archival feel.** It should look like a label, caption or plate, not a UI font.
- **Italic (or a secondary style) carries the voice:** emphasis, subtitles, labels, hints.
- **A small spaced-caps kicker** above the title, like a catalogue label.
- **The accent colour** may touch one word of the title and nowhere else in the text.
- Keep text minimal. The scene speaks; type only captions it.

---

## 7. UI as paper objects

Controls belong inside the paper world, not floating on top of it.

- **Title as a hung object.** A tag, label or card on a string, with a punched hole and a stitched or dashed inner border. It sways and reacts when disturbed.
- **Buttons as scraps.** Irregular torn or cut outlines, casting a small shadow. On hover they lift and tilt slightly, like being picked up.
- **Toggles as small mechanisms.** A recessed slot with a piece that slides or rotates, like a card-and-split-pin mechanism.
- **Hints as temporary labels.** A small strip in a corner that fades once the viewer starts interacting.
- **Dividers as craft marks:** perforations, pinking-shear dots, stitch lines.
- UI uses the neutral paper and the ink colour, and follows the same shadow and light rules as the scene.

---

## 8. Motion behaviour

Every movement should be explainable by paper, string, card or hands.

| Element | How it behaves |
|---|---|
| **Sheets (parallax)** | Slide sideways as if the viewer moves their head. Horizontal movement is stronger than vertical. Always smoothed, never snapping. See §4 for the full set of dimensional moves. |
| **Idle state** | When untouched, the view drifts slowly on its own. The box is never fully still. |
| **Entrance** | Sheets are placed into the box one by one, back to front, either rising into place or hinging up from flat like a pop-up. |
| **Hung objects** | Slow pendulum sway around the string's pivot. Swapping them means hauling up and lowering down, with a small overshoot like stage rigging. |
| **Tags and cards** | A damped spring: swing when disturbed, settle slowly. |
| **Loose pieces (confetti, leaves, sparks)** | Flutter and rotate as they fall, drifting sideways, never falling straight. |
| **Lighting change** | Rolls through the sheets in sequence with a short delay between each, like a lighting cue crossing a stage. Tiny lights appear last. |
| **Colour transitions** | Slow, over a second or more. Light changes; paper doesn't flash. |

**Rules**

- Slow over fast. Soft easing everywhere.
- Overshoot and springiness only for things on strings or pivots, never the scenery sheets.
- Ambient motion is constant but quiet: alive, not busy.
- Under reduced-motion preferences, ambient life stops and the scene stays composed.

---

## 9. The hero

Every diorama needs one small living thing. It can be a creature, an object or a figure.

- **Small relative to the scene.** This makes the world feel big and the hero feel precious.
- **Carries the accent colour.** It's the one thing your eye always finds.
- **Made of the same paper.** Cut shapes, flat colour, same edges and shadows. No special rendering.
- **Lives on one sheet.** It moves along its stage floor. It doesn't fly between depths. *Exception for a depth journey (§4.6):* the hero may walk along the guiding path into deeper layers, always on foot and always touching a floor. It never jumps or floats across the gap.
- **Moves like a puppet.** Hops, tilts, turns and fidgets in arcs, with a small reaction when it lands or stops (a puff, a bounce, a wobble).
- **Never fully still,** but never demanding attention.
- **Responds to the viewer.** Touching it should always produce a small, delightful reaction.

---

## 10. Interaction as play

There's no task. Every interaction is a small reward.

- **Look:** move, drag or tilt the device to peer into the box and find what's hidden behind layers.
- **Poke:** touch the hero or scene elements for a small reaction.
- **Relight:** switch between lighting states.
- **Regenerate (optional):** rebuild the scene with the same rules but new shapes, so it's always different but always recognisable.

Tone: **gentle curiosity**. Nothing punishes, nothing demands attention.

---

## 11. Voice

- Written like a **museum caption crossed with a picture book**.
- Short, warm, lightly playful sentences.
- Refers to the work as a physical object: counts sheets, names materials.
- Uses craft verbs: *cut, recut, fold, pin, place, hang*.

---

## 12. Do / Don't

| Do | Don't |
|---|---|
| Flat colour per shape | Gradients or painted shading inside a shape |
| Slightly imperfect edges | Perfect geometric curves |
| Real depth between flat sheets | Fake volume inside a sheet (bevels, painted 3D) |
| Hinges, pivots and small box tilts | Free 3D spinning or large camera swings |
| Shadows that respond to every depth change | Layers moving while shadows stay put |
| One consistent light direction | Shadows falling different ways |
| Light far, dark near | Equal contrast on every layer |
| One rare accent | Accent colour everywhere |
| Relight the box for a new state | A dark overlay for "night mode" |
| UI made from paper objects | Glassy, flat or material-style controls |
| Slow, physical motion | Snappy tweens, scaling, morphing |
| One small, characterful hero | Empty scenery with nothing alive |
