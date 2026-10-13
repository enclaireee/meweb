# Motion: how everything moves

Calm, soft, continuous. The viewer is still; the world glides. Nothing snaps, nothing bounces.

## Navigation model
- State: `stop` (integer 0 to 7) and `phase` (`rest`, `moving`, `card`).
- One input = one step to the adjacent stop. Input during `moving` is queued (max 1 queued) and starts as soon as the move finishes.
- Direct jump (stop dots, deep links): moves straight to the target stop in one longer glide (see "Long jumps").
- `card` phase: opening a card locks stepping. Closing returns to `rest`.

## Inputs
| Input | Action |
|---|---|
| Next / Previous buttons | Step ±1 |
| ArrowRight, ArrowDown, PageDown, Space | Next |
| ArrowLeft, ArrowUp, PageUp, Shift+Space | Previous |
| Home / End | Jump to stop 0 / 7 |
| 1 to 8 | Jump to that stop |
| Wheel / trackpad | One gesture = one step. Accumulate `deltaX + deltaY`, trigger at 60 units, then ignore wheel until 700 ms after the move ends and the delta falls under 4 for 120 ms (kills trackpad inertia). |
| Touch swipe | Horizontal swipe, trigger at 48 px or velocity above 0.35 px/ms; swipe left = next. Vertical movement over horizontal ignored. |
| Click/tap on the stop dot | Jump |
| Tap tag | Open card |
| Esc, backdrop tap, close button | Close card |
| Hash URL `#stop-3` | Initial stop |

Keyboard: arrows only work when focus is not inside a text field or the open card's scrolling region.

## The step
- **Duration `--dur-step` = 1200 ms.** (Long jumps 1200 to 2200 ms, see below.)
- **Easing `--ease-glide` = `cubic-bezier(0.45, 0.05, 0.25, 1)`**: gentle start, long soft landing.
- Every layer shares **the same duration and easing** and moves its own distance `s · P` (see `depth-system.md`). No per-layer stagger.
- One animation drives it: a single progress value `t` from 0 to 1. Each layer's transform is `translate3d(-(s·(from + (to - from)·t)·P)·k, 0, 0)`. In CSS: the container sets `--pos` (the fractional stop) and layers read `calc(var(--pos) * var(--s) * ...)`. Wiring is in `tech-architecture.md`.
- During a move the traveller enters `travelling`; water ripple tiles speed up; fireflies drift slightly with the move; a 6 percent motion fade on the grain isn't used (keep it still).

## What else animates during a step (all derived from the same progress)
| Element | Behaviour |
|---|---|
| Tag of the old stop | Fades and drops 12 units over the first 250 ms, as the post slides away |
| Tag of the new stop | Appears in the last 400 ms, with a pendulum settle (below) |
| Sky tint | Interpolates `--sky-i` to `--sky-(i+1)` over the whole step |
| Fireflies | Count and brightness lerp by stop table in `design-tokens.md` |
| Stop dots | Active dot fills with an ink-bleed animation over 400 ms in the last third |
| Ambient creatures | Reset to idle at the old stop; start their loop at the new stop |

## Settle: the tag pendulum
When the move ends the hung tag swings like a pendulum: starts at 6°, damped over 2.4 s, three visible swings. A spring-free CSS keyframe (`@keyframes tag-settle`) with decreasing amplitude: 6, -3.6, 2.2, -1.3, 0.8, 0. The tag keeps a gentle idle sway at ±0.8° over 5 s afterwards.

## Long jumps
Duration = `1200 + 150 × (distance − 1)` ms, capped at 2200. Same easing. Intermediate stops flash past without settling.

## Idle ambient motion (always on, tiny)
| Thing | Motion | Period |
|---|---|---|
| Haze 03, 06 | drift +2 to +4 units/s horizontal | continuous, wraps at tile seam |
| Clouds in 01 | +4 units/s | continuous |
| Water ripple tiles | Slide +10 to +40 units/s depending on W1/W2/W3 | continuous |
| Fireflies | Float, opacity pulse 2.5 to 4.5 s | looped |
| Lantern glow | scale 98 to 102% | 3.6 s |
| Tags | sway ±0.8° | 5 s |
| Moon | none (it moves with the strip) | |
| Ambient creatures | 1 small loop each per stop | 6 to 11 s |

At most **12** concurrently animated elements outside the layer movement. Anything off-screen is paused (see `tech-architecture.md`).

## Pointer parallax (desktop pointer only)
- Pointer position normalised to -1…1 over the frame. Smoothed with a critically damped follow (time constant 180 ms).
- Each layer is additionally offset by `(px, py) · s_L · 14 units` horizontally and `· 5 units` vertically. Foreground moves most, sky least.
- The frame and grain do **not** move.
- Disabled on touch devices and for reduced motion. On touch, there is no device-tilt effect (battery, permission prompts).

## Hover, focus and press (UI)
| Element | Hover | Focus | Press |
|---|---|---|---|
| Hung tag | Rises 4 units, glow warms, traveller looks | Same as hover plus 2px `--c-focus` ring offset 3px | Dips 2 units, scale 0.98 |
| Next/Prev button | Lifts shadow, edge brightens | Ring | Pressed paper: shadow shrinks |
| Stop dot | Preview label appears | Ring | n/a |
| Close button on card | Rotates 90° over 200 ms | Ring | Scale 0.96 |
| CV download | Same as buttons | | |

Hover timings: 160 ms ease-out. No hover effects on touch.

## Card open and close
- **Open (480 ms, `--ease-paper`):** the card slips up from beneath the frame's bottom edge, 40 units overshoot, then settles; backdrop dims the world to 55 percent (a single overlay opacity, not a filter). The tag it came from fades to 0.
- **Close (320 ms):** reverse, faster.
- World ambient animation pauses behind the card except the haze and ripples at half rate.
- The traveller enters `greeting` on open.
- Focus moves to the card's close button; Esc closes; focus returns to the originating tag.

## Entry sequence (first load)
Total about 3.2 s, skippable by any input:
1. 0 to 400 ms: dark wall, frame rings fade in from 0 to 1 opacity, each ring offset by 80 ms.
2. 400 to 1400 ms: world fades up from black (a single overlay going from 1 to 0 opacity), sky first, then layers back to front 60 ms each (opacity only).
3. 1400 to 2200 ms: lanterns light (glow scales from 0 to 1), the traveller does one pole stroke.
4. 2200 to 3200 ms: the first tag drops in with the pendulum settle. Controls fade in.

## Reduced motion (`prefers-reduced-motion: reduce`)
- Step becomes a 250 ms cross-fade of the whole world (opacity swap on the two states) with the final position applied at the midpoint. No translate animation.
- No pointer parallax, no sway, no firefly drift (static dots, subtle opacity pulse removed), no pendulum.
- Water ripples are static. Haze static.
- Card opens with an 120 ms fade.
- The traveller holds a still pose.

Also respect a user toggle (`Reduce motion` in the footer) that persists in `localStorage` and sets `data-motion="reduced"`.

## Performance rules for motion
- Only `transform` and `opacity` animate.
- Layers promoted with `will-change: transform` **only during a move**, removed after 200 ms at rest to release memory.
- No JavaScript runs per frame except one `requestAnimationFrame` that updates `--pos` during a move and the smoothed pointer values.
- Pause every ambient animation when the tab is hidden (`visibilitychange`) or the frame is off-screen.
- If the median frame time exceeds 20 ms over a move, drop to the **lite profile** (fireflies halved, F3 off, haze static, pointer parallax off). Recorded in `tech-architecture.md`.

## Timing tokens
Defined in `design-tokens.md`: `--dur-step` 1200 ms, `--dur-card-in` 480 ms, `--dur-card-out` 320 ms, `--dur-hover` 160 ms, `--dur-bob` 4500 ms, `--dur-sway` 5000 ms, `--dur-settle` 2400 ms.
