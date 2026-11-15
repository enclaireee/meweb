'use client';
// b3: the vast hall. Choreography from ../transitions. Hero: the steepest dolly of any beat, down the hall to the far arch.
import type { BeatDef, Comp, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b3-scale-flip/manifest.json';
import { Spotlight, slots } from '../SceneText';
import { world } from '../transitions';

const SCREENS = 2.5;

// One role at a time on the calm wall (desktop) / dark floor (portrait): see <Spotlight>.
const W = 0.24, at = slots(2, 0.12, W, 0.06);
const text = <Spotlight slug="b3-scale-flip" roles={scenes.b3} at={at} w={W} />;

const extra: Record<string, LayerDef> = { dust: { highOnly: true }, 'dust-p': { highOnly: true } };
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, push: 0.32, extra });
const desktop = comp('desktop', [720, 520]);
const portrait = comp('portrait', [540, 640]);

export const b3ScaleFlip: BeatDef = {
  slug: 'b3-scale-flip',
  screens: SCREENS,
  manifest,
  // calm zone: the right wall on desktop; on portrait the dark floor at the bottom (art brief)
  desktop: {
    ...desktop,
    overlays: [{ node: text, className: 'right-[6vw] top-[11vh] w-[min(44vw,46rem)]' }],
  },
  portrait: {
    ...portrait,
    overlays: [{ node: text, className: 'left-[10vw] right-[10vw] bottom-[12svh]' }],
  },
};
