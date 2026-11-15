'use client';
// b4: the paper sun in the vault. Choreography from ../transitions (gates close over the previous beat,
// part, dolly toward the exit arch, dive). Hero: the two ray rings counter-rotate with scroll.
import type { BeatDef, Comp, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b4-inner-sun/manifest.json';
import heron from '../../../public/art/creatures/heron/manifest.json';
import { Creature } from '../Creature';
import { Spotlight, slots } from '../SceneText';
import { reveal, world } from '../transitions';

const SCREENS = 2.5;

// One role at a time on the dark rock, bottom-anchored: see <Spotlight>.
const W = 0.24, at = slots(2, 0.14, W, 0.06);
const text = <Spotlight slug="b4-inner-sun" roles={scenes.b4} at={at} w={W} bottom="always" />;
const bird = <Creature sheet={heron} ms={5000} />;

// Ray sheets are square and centred on the sun, so the box centre is the pivot.
const extra: Record<string, LayerDef> = {
  'sun-rays-outer': { origin: '50% 50%', track: [{ at: -0.1, rotate: 2 }, { at: 1.1, rotate: -22 }] },
  'sun-rays-inner': { origin: '50% 50%', track: [{ at: -0.1, rotate: -3 }, { at: 1.1, rotate: 33 }] },
  'mist-far': { track: [{ at: 0, x: 0 }, { at: 1, x: -90 }] },
  'mist-far-p': { track: [{ at: 0, x: 0 }, { at: 1, x: -60 }] },
  dust: { highOnly: true },
  'dust-p': { highOnly: true },
};
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, extra });

export const b4InnerSun: BeatDef = {
  slug: 'b4-inner-sun',
  screens: SCREENS,
  manifest,
  desktop: {
    ...comp('desktop', [1660, 800]),
    overlays: [
      { node: bird, rect: { x: 1296, y: 251, w: 528, h: 679 }, parallax: 0.4, track: reveal() }, // feet (1560, 930)
      { node: text, className: 'left-[9vw] bottom-[11vh] w-[min(42vw,44rem)]' },
    ],
  },
  portrait: {
    ...comp('portrait', [760, 960]),
    overlays: [
      { node: bird, rect: { x: 495, y: 431, w: 450, h: 579 }, parallax: 0.4, track: reveal() }, // feet (720, 1010)
      { node: text, className: 'left-[10vw] right-[10vw] bottom-[12svh]' },
    ],
  },
};
