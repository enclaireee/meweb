/**
 * Timing numbers. Spec v4 §5.1.
 *
 * HONEST SCOPE, because the original promise was "one file, every number" and
 * that is only half true: CSS cannot import TypeScript, so anything a
 * stylesheet animates is defined there. This file holds the values components
 * pass to the DOM; §2 below lists the rest and says where they live, so there
 * is still one place to LOOK even though there are two places to edit.
 *
 * Nothing here is unused. A constant nobody reads is a number that will drift
 * away from the one that matters.
 */
export const motion = {
  // ── 1. Consumed by components ────────────────────────────────────────────

  /** Curtain ceiling. Exit is min(document.fonts.ready, this). Curtain.tsx */
  curtainCapMs: 600,
  /** How long the curtain takes to lift once it starts. Curtain.tsx */
  curtainLiftMs: 520,

  /** Per-character reveal duration, used to time the accent full stop's cool
   *  so colour changes only after that character has settled. SplitText.tsx */
  charRevealMs: 520,
  /** Delay between characters. SplitText.tsx */
  charStaggerMs: 30,

  /** Base delay between list items. Reveal.tsx */
  listStaggerMs: 40,
  /** Past this, items arrive together — an uncapped 15-item list finishes
   *  600ms after it starts, long after you began reading its head. Reveal.tsx */
  listStaggerCap: 6,

  /** The hero's later beats, after the greeting. page.tsx */
  heroBeatDelayMs: 520,
  heroCurrentlyDelayMs: 780,
} as const;

// ── 2. Defined in CSS, listed here so this file is still the index ──────────
//
//   Reveal distance          24px          globals.css  .reveal
//   Reveal duration          --dur-standard (320ms)
//   Character/curtain band   --dur-narrative (520ms)
//   Micro band (hover/focus) --dur-micro (160ms)
//   Easing                   --ease-out, --ease-narrative
//   Width axis range         82 → 100      globals.css  .split-char --wdth
//   Pointer nudge range      ±3            AxisNudge.tsx (clamped in JS)
//   Hero recede              scale 1→0.96, opacity 1→0   .hero-recede keyframes
//
// Removed rather than left lying around:
//   heroSupportDelayMs — the third hero line was cut in the v3.1 art-director
//     pass, so its delay had nothing to delay.
//   parallax rates — the general parallax layer was specced and deliberately
//     not built (v4 spec §15); the two elements that implement the z-model do
//     it in CSS.
//   maxConcurrent — stated as a budget and never enforced in code. It is a
//     design guideline and it lives in the spec, not here pretending to be a
//     runtime cap.
