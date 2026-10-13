# UI components

All UI is real HTML styled as paper. Art is decoration; every piece of text lives here. Colours and sizes refer to `design-tokens.md`.

## Component list
1. Hung tag (in the world)
2. Paper card (modal)
3. Image slot
4. Prev / Next buttons
5. Stop dots
6. Title plate
7. Footer / info
8. First-visit hint
9. Motion toggle

## 1. Hung tag
The short form of a stop's content, hanging from the post by two strings.

- **Element:** `<button class="tag" aria-haspopup="dialog" aria-controls="card-N">` positioned at `A + 260k`, hanging from the post's hook. The strings are decorative SVG.
- **Size (desktop):** 260 × 168 px. **Compact (phone, short landscape):** 200 × 132 px.
- **Content, top to bottom:** kicker (stop number + place, small caps, `--fs-kicker`), title (`--fs-tag-title`, serif), date line (`--fs-small`), one-line hook (max 80 chars, 2 lines), and a 56 × 40 px image thumbnail in the bottom-right corner (or the image slot placeholder).
- **Paper:** `--c-paper`, notched top corners (cut), punched hole for the string, 1.5 px lighter edge, shadow `--sh-tag`.
- **Behaviour:** pendulum settle on arrival, idle sway, hover lift, focus ring. Click or Enter opens the card.
- **A11y:** the accessible name is title + date. The strings are `aria-hidden`.
- **Hidden to AT while moving:** `inert` during `moving` phase.

### Tag content by stop
| Stop | Kicker | Title | Date |
|---|---|---|---|
| 0 | 00 · The Spring | Hello, I'm Fatih | |
| 1 | 01 · The Terraces | DemandX | Sep 2026 |
| 2 | 02 · The Gorge | OT Observability Lab | Jun – Aug 2026 |
| 3 | 03 · The Still Pond | Refocus | Feb – Apr 2025 |
| 4 | 04 · The Mangroves | KOMAT UNPAR 2025 | Mar – Aug 2025 |
| 5 | 05 · The Estuary | Sunlight Meter | May – Jun 2026 |
| 6 | 06 · The Stilt Village | Roles & Craft | 2023 – now |
| 7 | 07 · The Lighthouse | Say hello | |

Full text in `content.md`.

## 2. Paper card
The full content of a stop, opened from a tag.

- **Element:** `<dialog class="card" aria-labelledby="card-N-title">` opened with `showModal()`. Native focus trap and Esc handling.
- **Size:** desktop 560 px wide, max-height 78 dvh, centred in the opening. Phone: full opening width minus 24 px, max-height 84 dvh, anchored to the bottom (sheet).
- **Structure:**
  1. Header: kicker, title, date, close button (44 px, top-right).
  2. Image slot (16:9) when the stop has media.
  3. Summary paragraph (max 2 sentences).
  4. Bulleted highlights (3 to 5 bullets, drawn from the CV).
  5. Tech chips (small paper chips).
  6. Footer row: optional award/medal sticker.
- **Paper:** `--c-paper` with a 4 px `--c-paper-2` inner strip along the top (a folded flap look), 1.5 px lighter edge, shadow `--sh-card`, notched corners (same cut language as tags).
- **Scroll:** body scrolls internally with a cut-paper scrollbar-less look (`scrollbar-width: thin`). A bottom fade mask appears only when scrollable.
- **Animation:** see `motion.md` (slip up, 480 ms).
- **Close:** X button, Esc, tap on the dimmed world, or swipe down on phone (threshold 64 px). Focus returns to the tag.
- **No external links** from project cards (the user chose no links, just images). Contact card has mailto, LinkedIn, CV download.

### Card variants
| Variant | Used at | Differences |
|---|---|---|
| intro | stop 0 | Name large, role, two-sentence bio, a "how to explore" hint. No chips. |
| project | stops 1 to 5 | Standard structure with image, bullets, chips |
| roles | stop 6 | Tabbed or accordion list of 6 roles; skills grid; awards list |
| contact | stop 7 | Email (copy button), LinkedIn, CV download, location |

## 3. Image slot
A placeholder that is real: it holds a project image later.

- **Aspect:** 16:9, `object-fit: cover`. Thumbnail on the tag: 7:5.
- **Empty state:** a paper-cut placeholder, flat `--c-paper-2` with a cut mountain-and-moon silhouette, centred small label "Image soon". Not blank grey.
- **Filled state:** the image inside a paper mat (6 px `--c-paper` border, 1.5 px edge light, soft shadow), slight random rotation ±0.6° that is fixed per slot.
- **File convention:** `public/projects/<slug>/cover.avif` (16:9, 1600 × 900) and `thumb.avif` (700 × 500), with `.webp` fallback. Alt text required, defined in `content.md`.
- **Loading:** thumbnail loads with the tag, cover loads when the card opens. Layout reserved (no shift).

## 4. Prev / Next buttons
- 56 px (phone 48 px) round paper discs with a cut arrow glyph (a single arrow shape cut as a hole, light showing through).
- Hold a drop shadow `--sh-btn`. Disabled at the ends: dimmed to 45 percent with no shadow (still focusable but `aria-disabled`).
- Labels (visually hidden): "Previous place", "Next place". Keyboard: Tab order is Prev, tag, Next.
- Next pulses gently (opacity glow 1 to 1.15) at stop 0 until the first step.

## 5. Stop dots
- 8 dots in a row on a thin paper ribbon.
- Each dot 10 px (hit area 44 px). Active dot: 16 px, filled with `--c-lantern` and a tiny glow. Visited dots: `--c-paper`. Unvisited: `--c-paper` at 40 percent.
- Hover/focus shows a tooltip label with the place name (`--fs-small`).
- Role: `<nav aria-label="Places along the river">` containing a list of buttons; current has `aria-current="step"`.

## 6. Title plate
- Small paper label hung on the frame: "Muhammad Fatih Zamzami" + subtitle "Electrical engineering · Universitas Indonesia" (hidden on phone, name only).
- A link to stop 0, no other behaviour. It is the `<h1>` of the page.

## 7. Footer / info
- Items: "Download CV" (button), "Reduce motion" (toggle), "Made of paper, code and a very slow river." (credit).
- On desktop, bottom-right of R1 as tiny text.
- On phones, accessible via the final stop's card; footer line also exists in the no-JS stack.

## 8. First-visit hint
- A small paper chit that appears under the traveller at stop 0 after 2.5 s: "Swipe to drift downstream" (touch) or "Press → or scroll once" (pointer). Disappears after the first step or 8 s. Stored in `localStorage` (`seen-hint`) so it shows once. If storage is blocked, show every visit.

## 9. Motion toggle
- A switch in the footer, labelled "Reduce motion". Default follows the OS setting; saved to `localStorage`. Sets `data-motion="reduced"` on `<html>`.

## States matrix (common)
Every interactive component supports: default, hover (pointer only), focus-visible, active, disabled where relevant, and reduced-motion variant. See `motion.md`.

## Content width and type scale
In `design-tokens.md`. Body text 16 px minimum, tags 15 px minimum for the hook line.

## Tag collision rules
- Tags never overlap the traveller or the top plate.
- If the opening is too short (below 420 px high), cards open as full-height sheets and tags use the compact variant.
- If the tag would extend beyond the opening's right edge minus 16 px, it flips to hang from the post's other side (left of the post) with the strings mirrored.

## Semantic outline (rendered HTML)
```
<main>
  <h1> Muhammad Fatih Zamzami
  <section id="stop-0"> … <h2> …
  …
  <section id="stop-7"> …
</main>
```
Each stop section holds its full content in the DOM (used by the no-JS stack and by the card). The card is a `<dialog>` shell that reveals the section's content.
