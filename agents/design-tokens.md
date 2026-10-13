# Design tokens

Exact values. Define as CSS custom properties on `:root` (names are final). Contrast ratios were computed (WCAG 2.x relative luminance).

## Colour: night ramp (cool, back to front)
| Token | Hex | Used for |
|---|---|---|
| `--ramp-0` | `#070B14` | Layer 11 base |
| `--ramp-1` | `#0D1626` | Layers 10, traveller body |
| `--ramp-2` | `#14233A` | Layers 08, 09 |
| `--ramp-3` | `#1D3552` | Layer 07 |
| `--ramp-4` | `#2B4A6B` | Layer 05 |
| `--ramp-5` | `#43698A` | Layer 04 |
| `--ramp-6` | `#6E93AB` | Layer 02 (volcano) |
| `--ramp-7` | `#A9C4D2` | Clouds, far mist highlight |
| `--c-ink-night` | `#04070D` | Layer 12 |
| `--c-haze` | `#7FA3B8` | Haze sheets, atmospheric tint target |
| `--c-shadow` | `#03060C` | All baked shadows |

## Colour: water
| Token | Hex |
|---|---|
| `--water-1` | `#122B45` (W1) |
| `--water-2` | `#0F2540` (W2) |
| `--water-3` | `#0A1B30` (W3) |
| `--water-hi` | `#3A6A8C` (ripple highlight cuts) |

## Colour: foliage (night-shifted)
`--leaf-1 #12342F`, `--leaf-2 #1B4A3F`, `--leaf-3 #27604F`, `--leaf-hi #3C7A66` (rim). Mangrove roots `--root #1A2B2A`. Rice terraces `--paddy #24574A`, with `--paddy-water #3F7F86`.

## Colour: light
| Token | Hex | Used for |
|---|---|---|
| `--c-moon` | `#F4EFD8` | Moon disc |
| `--c-moon-shade` | `#CFC9AC` | Moon craters |
| `--c-lantern` | `#FFB454` | Lantern glow, active dot, focus ring on dark |
| `--c-lantern-core` | `#FFE2A8` | Lantern centre |
| `--c-ember` | `#E0733A` | Boat stripe, warm accents |
| `--c-window` | `#FFC46B` | Window glow |
| `--c-firefly` | `#D9F26B` | Fireflies |
| `--c-dawn-rose` | `#E59C98` | Dawn horizon |
| `--c-dawn-gold` | `#F2C77A` | Dawn horizon, lighthouse beam |
| `--c-bamboo` | `#C79A5E` | Traveller's hat, bamboo posts |

## Colour: sky by stop (layer 00 gradient stops)
Each is the sky's mid colour at that stop; the strip blends linearly between them. Top is 35 percent darker, horizon 25 percent lighter, then the glow is added at the horizon.

| Stop | `--sky-N` | Horizon glow `--glow-N` |
|---|---|---|
| 0 | `#1F4A5C` | `#E8A25A` at 35% |
| 1 | `#14304A` | `#C98A52` at 18% |
| 2 | `#0C1D33` | none |
| 3 | `#09152A` | none |
| 4 | `#0B1A30` | none |
| 5 | `#1B3A5E` | `#7F9CC4` at 30%, `#E59C98` at 15% |
| 6 | `#5C7FA3` | `#E59C98` at 40%, `#F2C77A` at 30% |
| 7 | `#A9C0D0` | `#F2C77A` at 55% |

## Colour: paper UI
| Token | Hex | Used for |
|---|---|---|
| `--c-paper` | `#F1E8D4` | Tags, cards, buttons |
| `--c-paper-2` | `#E6DAC0` | Card flap, chips, placeholders |
| `--c-paper-dim` | `#A9A18C` | Visited dots, disabled |
| `--c-ink` | `#1A1F2B` | Text on paper |
| `--c-ink-soft` | `#4A4F5C` | Secondary text on paper |
| `--c-accent` | `#9A4A12` | Links/emphasis on paper |
| `--c-focus` | `#FFB454` | Focus ring over the dark world/wall |
| `--c-focus-ink` | `#1A1F2B` | Focus ring over paper surfaces |
| `--c-wall` | `#0A0D14` | Page background |
| `--c-frame-1` | `#1B2230` | Frame ring R1 |
| `--c-frame-2` | `#232C3D` | R2 |
| `--c-frame-3` | `#2D384C` | R3 |
| `--c-frame-4` | `#38455C` | R4 |

## Contrast checks (computed)
| Pair | Ratio | Result |
|---|---|---|
| `--c-ink` on `--c-paper` | 13.52:1 | AAA |
| `--c-ink-soft` on `--c-paper` | 6.72:1 | AA (body), near AAA |
| `--c-ink-soft` on `--c-paper-2` | 5.91:1 | AA |
| `--c-accent` on `--c-paper` | 5.13:1 | AA |
| `--c-paper` on `--c-wall` | 15.95:1 | AAA |
| `--c-moon` on `--c-wall` | 16.83:1 | AAA |
| `--c-paper-dim` on `--c-wall` | 7.55:1 | AAA (non-text 3:1 needed only) |
| `--c-lantern` on `--ramp-1` | 10.27:1 | AAA (focus ring on dark) |
| `--c-ink` on `--c-lantern` | 9.34:1 | AAA (text on lit button, if used) |

Rule: text only on `--c-paper` or `--c-paper-2`. Never put text directly on the world art.

## Typography
Fonts self-hosted through `next/font` **[confirm choice]**:
- **Display / titles:** Fraunces (variable), `SOFT` 100, `WONK` 0, weights 500 to 700. Warm, slightly craft-like serif that fits cut paper.
- **Body / UI:** Figtree (variable), weights 400 to 700.
- **Fallbacks:** `Georgia, serif` and `system-ui, sans-serif`.

| Token | Value |
|---|---|
| `--ff-display` | Fraunces, Georgia, serif |
| `--ff-body` | Figtree, system-ui, sans-serif |
| `--fs-kicker` | 12px, uppercase, tracking 0.14em, weight 600 |
| `--fs-small` | 13px / 1.4 |
| `--fs-body` | 16px / 1.55 |
| `--fs-tag-title` | 22px / 1.15 (compact 19px) |
| `--fs-card-title` | clamp(28px, 3vw, 40px) / 1.1 |
| `--fs-hero` | clamp(36px, 5vw, 56px) / 1.05 (stop 0 card) |
| `--fs-plate` | 15px, weight 600, tracking 0.02em |

Line length 36 to 62 characters in cards. No text below 12 px.

## Spacing (4 px base)
`--sp-1` 4, `--sp-2` 8, `--sp-3` 12, `--sp-4` 16, `--sp-5` 24, `--sp-6` 32, `--sp-7` 48, `--sp-8` 64. Page gutter 16 px on phones, 24 px on desktop.

## Radii
Paper has sharp corners. The only radii: round buttons (full), the moon and lantern shades (organic). `--r-chip` 4px for chips. Tags and cards use clipped notched corners via `clip-path`.

## Shadows (UI paper)
| Token | Value |
|---|---|
| `--sh-tag` | `0 10px 18px -6px rgb(3 6 12 / 0.55), 0 2px 3px rgb(3 6 12 / 0.4)` |
| `--sh-card` | `0 24px 48px -12px rgb(3 6 12 / 0.65), 0 4px 8px rgb(3 6 12 / 0.4)` |
| `--sh-btn` | `0 5px 10px -3px rgb(3 6 12 / 0.55), 0 1px 2px rgb(3 6 12 / 0.4)` |
| `--sh-btn-pressed` | `0 1px 2px rgb(3 6 12 / 0.5)` |
| Edge light | `inset 1.5px 1.5px 0 rgb(255 255 255 / 0.35)` |
| Edge dark | `inset -1.5px -1.5px 0 rgb(0 0 0 / 0.18)` |

All shadows lean down-right (positive x offsets are small) to match the moon.

## Z-order (stage)
| Token | Value | Element |
|---|---|---|
| `--z-world` | 0 | World layers |
| `--z-grain` | 10 | Grain, inner shadow |
| `--z-frame` | 20 | Rings |
| `--z-chrome` | 30 | Title plate, dots, buttons |
| `--z-tag` | 15 | Tags (above world, below frame) |
| `--z-dim` | 40 | Card backdrop |
| `--z-card` | 50 | Card |
| `--z-hint` | 35 | First-visit hint |

## Motion tokens
| Token | Value |
|---|---|
| `--dur-step` | 1200ms |
| `--dur-card-in` | 480ms |
| `--dur-card-out` | 320ms |
| `--dur-hover` | 160ms |
| `--dur-bob` | 4500ms |
| `--dur-sway` | 5000ms |
| `--dur-settle` | 2400ms |
| `--ease-glide` | `cubic-bezier(0.45, 0.05, 0.25, 1)` |
| `--ease-paper` | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |

## Wiring variables (set by script, read by CSS)
| Variable | Meaning | Set on |
|---|---|---|
| `--pos` | Fractional stop (0 to 7), animated during a move | stage |
| `--k` | CSS px per art unit | stage |
| `--anchor` | Traveller x in px (0.30 × opening width) | stage |
| `--px`, `--py` | Smoothed pointer -1…1 | stage |
| `--s` | Layer's speed factor | each layer |
| `--pitch` | 1700 | stage |
| `--sky-mix` | Fractional stop used for sky tint | stage |

Layer transform: `translate3d(calc((var(--pos) * var(--s) * var(--pitch) * -1 + var(--px) * var(--s) * 14) * var(--k) * 1px), calc(var(--py) * var(--s) * 5 * var(--k) * 1px), 0)`.

## Per-stop dials (data, not CSS)
| Stop | Fireflies F1/F2/F3 | Lantern glow | Haze thickness |
|---|---|---|---|
| 0 | 4 / 2 / 0 | 0.80 | 0.6 |
| 1 | 8 / 5 / 1 | 0.90 | 0.6 |
| 2 | 12 / 8 / 3 | 1.00 | 1.0 |
| 3 | 14 / 10 / 5 | 1.00 | 0.7 |
| 4 | 8 / 6 / 2 | 1.00 | 1.0 |
| 5 | 6 / 4 / 1 | 0.70 | 0.3 |
| 6 | 2 / 0 / 0 | 0.50 | 0.4 |
| 7 | 0 / 0 / 0 | 0.60 (lighthouse lamp 1.0) | 0.3 |

## Breakpoints
`--bp-phone` 640, `--bp-tablet` 1024, `--bp-large` 1920. Phone profile at width below 640.
