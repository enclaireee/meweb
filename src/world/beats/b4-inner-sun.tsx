'use client';
// b4: the paper sun in the vault. Choreography from ../transitions (gates close over the previous beat,
// part, dolly toward the exit arch, dive). Hero: the two ray rings counter-rotate with scroll, and keep turning slowly
// at rest (live layers, opposite directions). Text: the kicker "04 / Experience · Teaching" only (the heading is b3's),
// one role at a time on the dark rock.
import type { CSSProperties } from 'react';
import type { BeatDef, Comp, LayerDef, Track } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b4-inner-sun/manifest.json';
import heron from '../../../public/art/creatures/heron/manifest.json';
import { Particles } from '../Ambient';
import { Creature } from '../Creature';
import { Spotlight, slots } from '../SceneText';
import { reveal, world } from '../transitions';

const SCREENS = 1.8;

// One role at a time on the dark rock, bottom-anchored: see <Spotlight>. Roles arrive after the gates part (t 0.17)
// and the last has left before the dive (t 0.67).
const W = 0.2, at = slots(2, 0.17, W, 0.06);
const text = <Spotlight slug="b4-inner-sun" roles={scenes.b4} at={at} w={W} bottom="always" paper />;
const bird = <Creature sheet={heron} ms={5000} />;

// Ray sheets are square and centred on the sun, so the box centre is the pivot. Idle: outer ring turns one way in
// 200 s, the inner ring (mirrored, so it turns the other way) in 140 s. Scroll adds its own counter-rotation.
const style = (v: Record<string, string>) => v as CSSProperties;
const extra: Record<string, LayerDef> = {
  'sun-rays-outer': { origin: '50% 50%', live: { className: 'amb-rotate-c', style: style({ '--amb-dur': '200s' }) }, track: [{ at: -0.1, rotate: 2 }, { at: 1.1, rotate: -22 }] },
  'sun-rays-inner': { origin: '50% 50%', live: { className: 'amb-rotate-c', style: { ...style({ '--amb-dur': '140s' }), scale: '-1 1' } }, track: [{ at: -0.1, rotate: -3 }, { at: 1.1, rotate: 33 }] },
  'mist-far': { track: [{ at: 0, x: 0 }, { at: 1, x: -90 }] },
  'mist-far-p': { track: [{ at: 0, x: 0 }, { at: 1, x: -60 }] },
  dust: { highOnly: true },
  'dust-p': { highOnly: true },
};
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, close: c === 'desktop' ? 300 : 300, extra });

// Dust motes drift up through the light shafts (behind the near rock).
const motesT: Track = [{ at: 0.1, opacity: 0 }, { at: 0.24, opacity: 1 }, { at: 0.62, opacity: 1 }, { at: 0.72, opacity: 0 }];
const motes = (rect: { x: number; y: number; w: number; h: number }) => [
  { node: <Particles sprite="mote" kind="rise" n={8} seed={13} size={[0.5, 1]} lite />, rect, behind: true, track: motesT },
  { node: <Particles sprite="mote" kind="rise" n={9} seed={29} size={[0.4, 0.8]} />, rect, behind: true, track: motesT, highOnly: true },
];

export const b4InnerSun: BeatDef = {
  slug: 'b4-inner-sun',
  screens: SCREENS,
  manifest,
  desktop: {
    ...comp('desktop', [1660, 800]),
    split: 'rock-near',
    overlays: [
      ...motes({ x: 790, y: 200, w: 1000, h: 700 }),
      { node: bird, rect: { x: 1296, y: 251, w: 528, h: 679 }, parallax: 0.4, track: reveal() }, // feet (1560, 930)
      { node: text, className: 'left-[9vw] bottom-[11vh] w-[min(42vw,44rem)]' },
    ],
  },
  portrait: {
    ...comp('portrait', [760, 960]),
    split: 'rock-near-p',
    overlays: [
      ...motes({ x: 150, y: 300, w: 800, h: 700 }),
      { node: bird, rect: { x: 495, y: 431, w: 450, h: 579 }, parallax: 0.4, track: reveal() }, // feet (720, 1010)
      { node: text, className: 'left-[10vw] right-[10vw] bottom-[12svh]' },
    ],
  },
};
