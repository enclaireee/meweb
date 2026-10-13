# Frame and layout

The screen is a **fixed paper shadowbox** hanging on a dark wall. Everything the visitor sees is inside it. The frame never moves.

## Structure (outside to inside)
1. **Wall**: `--c-wall`, almost black blue. A faint vignette (single radial overlay at 40 percent).
2. **Frame rings**: 4 stacked paper rings forming the box. From the outside: R1, R2, R3, R4. Each is a flat paper sheet with a cut rectangular opening slightly smaller than the one below, so you see a stepped bevel. Each ring casts a shadow into the ring behind it with the standard key light direction.
3. **Opening**: where the world shows. The world is clipped to it.
4. **Inner depth shadow**: an overlay on the opening, darkest at the top and left (frame casting shadow into the box), as if the world sits 120 units behind the frame.
5. **Grain overlay**: the paper grain from `art-direction.md`, above the world, below the rings.
6. **Corner ornaments**: four small kawung-pattern cut brackets, one on each corner of R1.
7. **Chrome** (UI): title plate, stop dots, controls, footer. See `ui-components.md`.

## Ring spec
Widths are measured inward from the viewport edge at desktop, in px, and scale with viewport.

| Ring | Colour token | Width desktop | Width phone | Shadow |
|---|---|---|---|---|
| R1 | `--c-frame-1` | 18 | 8 | 0 6px 14px / 0.45 |
| R2 | `--c-frame-2` | 14 | 6 | 0 4px 10px / 0.40 |
| R3 | `--c-frame-3` | 12 | 5 | 0 3px 8px / 0.35 |
| R4 | `--c-frame-4` | 10 | 4 | 0 2px 6px / 0.30 |

Total frame thickness: desktop 54 px, phone 23 px. The opening is the viewport minus the frame thickness on every side, plus the top plate allowance and the bottom controls allowance (below).
Rings are built from CSS (borders or stacked boxes with `box-shadow`) and a small number of inline SVG for the corner ornaments. They do not use images.

## Viewports
Opening size ranges:

| Class | Viewport | Frame | Opening | Notes |
|---|---|---|---|---|
| Phone portrait | 320 to 639 | 23 px | width − 46, height − 46 − chrome | Art cropped: ~450 to 600 units visible. Merge profile on. |
| Phone landscape | 640 to 899 high ≤ 480 | 23 px | wide, short | Artboard fills height; controls shrink. |
| Tablet | 640 to 1023 | 36 px | | |
| Desktop | 1024 to 1919 | 54 px | | Full 1900 units visible. |
| Large | 1920+ | 54 px, max opening 2200 px wide, centred | | Wall visible at sides above 2200. |

Use `100dvh` for height. Do not use `100vh` (mobile browser bars).

## Mapping the artboard
- Scale `k = max(openingH / 1000, openingW / 1900)`. The artboard is anchored **vertically centred, horizontally at the traveller anchor**.
- Vertical safe band 190 to 810 units is always visible. On very wide openings (aspect over 1.9) the artboard grows and crops top and bottom; the safe band holds.
- The traveller sits at `A = 0.30 · openingW` from the opening's left edge. On phone portrait use `A = 0.34 · openingW` so the tag (260 units ahead × k) fits: check `A + 260k + tagWidth/2 ≤ openingW − 16 px`; if not, shrink the tag (see below) rather than moving the anchor.
- **Tag position:** the tag hangs from the post at `A + 260k`, at vertical 34 percent of the opening. On phones, tags use their compact size.

## Chrome positions
| Piece | Desktop | Phone |
|---|---|---|
| Title plate (name + role) | Top-left on R1, a small paper label hung over the frame's top edge, 28 px from left | Top-centre, single line |
| Stop dots + labels | Bottom-centre on R1: 8 dots | Bottom-centre inside the opening above the buttons: 8 smaller dots |
| Prev / Next | Bottom-left and bottom-right on R1, 56 px round paper buttons | Bottom corners, 48 px, 12 px from the edges |
| Footer links (CV, motion toggle, credits) | Bottom-right on R1, small text | Folded into the "info" button inside the card of the final stop and a footer line below the fold of the no-JS view |
| Safe area | `env(safe-area-inset-*)` added to the frame outset on notched phones |

The chrome sits on the frame, not in the world, so it never hides the traveller or tags. At phone portrait the bottom 72 px of the opening is reserved: no important art lives there (the water W3 and foreground fill it).

## Layout rules
- The world never scrolls vertically. Page overflow is hidden on the stage; the stage is `position: fixed; inset: 0`.
- The cards scroll internally if they exceed the available height.
- Text in cards: line length 36 to 62 characters, base size 16 px minimum.
- Touch targets at least 44 px (dots have 44 px invisible hit areas).
- Respect `prefers-color-scheme`? No: the site has one palette (a night scene). The wall is dark in all modes.
- Focus ring: 2 px `--c-focus`, offset 3 px, visible against both the paper and the dark wall.

## Orientation and resizing
- Resizing recomputes `k` and `A`. The current stop stays. Layers re-mount tiles as needed.
- Portrait phones: a hint on first visit: "Swipe to float downstream" (see `content.md`), shown once.
- Landscape phones: the opening is short; the tag compact variant is used (see `ui-components.md`).

## No-JS and fallback view
Without JavaScript, or when `Reduce motion` plus very low-end devices:
- The same HTML content shows as a **stacked document**: the opening still shows a static poster (stop 0 art) at the top, followed by eight paper-card sections in order, then the footer. The frame is replaced by a simple paper edge.
- All content is therefore reachable, linkable (`#stop-3`) and indexable.
- See `tech-architecture.md` for the structure.

## Desktop wide-layout polish
- At widths over 1600, the traveller's anchor remains `0.30`, so the extra width is revealed to the right, where the tag lives.
- At ultrawide aspect (over 2.4), the opening is clamped to 2200 px and centred, so the wall shows on the sides.
