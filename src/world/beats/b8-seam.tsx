'use client';
// b8: the seam. Choreography from ../transitions. Hero: the camera pulls back through seven nested
// paper folds (outer folds move most), showing the whole world was one folded sheet.
// Text: four leadership roles, one at a time, each with its numbers stamped in (see <Spotlight>).
import type { BeatDef, Comp, LayerDef } from '@/engine';
import type { CSSProperties } from 'react';
import { scenes } from '@/content';
import manifest from '../../../public/art/b8-seam/manifest.json';
import { Spotlight, slots } from '../SceneText';
import { reveal, world } from '../transitions';

const SCREENS = 3.5;

// Four slots, the last one out before the dive (1 - 0.6 / SCREENS).
const W = 0.15, at = slots(4, 0.1, W, 0.035);
const text = <Spotlight slug="b8-seam" roles={scenes.b8} at={at} w={W} />;
const scrim = { '--scrim': 'rgb(28 20 44 / 0.68)', color: '#fff4de' } as CSSProperties;

const extra: Record<string, LayerDef> = { 'paper-dust': { highOnly: true }, 'paper-dust-p': { highOnly: true } };
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, push: -0.9, extra });
const desktop = comp('desktop', [1270, 500]);
const portrait = comp('portrait', [548, 660]);

export const b8Seam: BeatDef = {
  slug: 'b8-seam',
  screens: SCREENS,
  manifest,
  // focus = the lit window of the miniature mountain; text on the dark left page, clear of the folds
  desktop: {
    ...desktop,
    overlays: [{ node: text, className: 'left-[7vw] top-[13vh] w-[min(42vw,40rem)]', style: scrim, track: reveal() }],
  },
  portrait: {
    ...portrait,
    overlays: [{ node: text, className: 'left-[10vw] right-[10vw] bottom-[12svh]', style: scrim, track: reveal() }],
  },
};
