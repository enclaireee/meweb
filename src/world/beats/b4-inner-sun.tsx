'use client';
// b4: the paper sun in the vault. Choreography from ../transitions (gates close over the previous beat,
// part, dolly toward the exit arch, dive). Hero: the two ray rings counter-rotate with scroll.
import type { BeatDef, Comp, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b4-inner-sun/manifest.json';
import heron from '../../../public/art/creatures/heron/manifest.json';
import { Creature } from '../Creature';
import { useT } from '../lang';
import { At, Kicker, count, slots } from '../SceneText';
import { reveal, world } from '../transitions';

const SCREENS = 2.5;

// One role at a time on the dark rock: the year huge, the role under it, a small counter keeping place.
const W = 0.15, at = slots(3, 0.14, W);
function Years() {
  const t = useT();
  const n = scenes.b4.length;
  return (
    <div aria-hidden className="beat-text grid w-[min(40vw,42rem)] portrait:w-[88vw]">
      <At a={0.12} d={0.05} w={at[n - 1]! + W - 0.12} k="one" className="col-start-1 row-start-1 flex items-baseline justify-between self-start">
        <Kicker slug="b4-inner-sun" />
      </At>
      {scenes.b4.map((r, i) => (
        <At key={i} a={at[i]!} d={0.05} w={W} k="one" className="col-start-1 row-start-1 flex flex-col pt-[3vh]">
          <span className="self-end text-[0.75rem] tracking-[0.35em] tabular-nums opacity-70">{count(i, n)}</span>
          <span className="font-display text-[clamp(6rem,13vw,15rem)] leading-[0.82] tabular-nums">{r.years}</span>
          <span className="mt-[1vh] h-px w-full bg-current opacity-50" />
          <span className="pt-3 font-display text-[clamp(1.4rem,2.2vw,2.5rem)] leading-tight text-balance">{t(r.role)}</span>
          <span className="pt-1 text-[0.75rem] tracking-[0.25em] uppercase opacity-80">{r.org}</span>
          <span className="max-w-[34rem] pt-2 text-[clamp(0.9rem,1.05vw,1.1rem)] leading-snug opacity-80">{t(r.note)}</span>
        </At>
      ))}
    </div>
  );
}
const text = <Years />;
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
      { node: text, className: 'left-[6vw] bottom-[6vh]' },
    ],
  },
  portrait: {
    ...comp('portrait', [760, 960]),
    overlays: [
      { node: bird, rect: { x: 495, y: 431, w: 450, h: 579 }, parallax: 0.4, track: reveal() }, // feet (720, 1010)
      { node: text, className: 'left-[6vw] bottom-[6svh]' },
    ],
  },
};
