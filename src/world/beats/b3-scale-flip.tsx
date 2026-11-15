'use client';
// b3: the vast hall. Choreography from ../transitions. Hero: the steepest dolly of any beat, down the hall to the far arch.
import type { BeatDef, Comp, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b3-scale-flip/manifest.json';
import { useT } from '../lang';
import { At, Kicker, count, slots } from '../SceneText';
import { world } from '../transitions';

const SCREENS = 2.5;

// One role at a time: a large title on the calm wall, replaced by the next as you scroll; the period
// runs up the margin and a small counter keeps place.
const W = 0.16, at = slots(3, 0.12, W);
function Roles() {
  const t = useT();
  return (
    <div aria-hidden className="beat-text grid">
      <At a={0.1} d={0.05} w={at[2]! + W - 0.1} k="one" className="col-start-1 row-start-1 self-start">
        <Kicker slug="b3-scale-flip" />
      </At>
      {scenes.b3.map((r, i) => (
        <At key={i} a={at[i]!} d={0.05} w={W} k="one" className="col-start-1 row-start-1 grid grid-cols-[auto_1fr] gap-x-[2.4vw] pt-[7vh]">
          <span className="row-span-4 rotate-180 border-l border-current/40 pl-2 text-[0.75rem] tracking-[0.3em] uppercase opacity-80 [writing-mode:vertical-rl]">{t(r.period)}</span>
          <span className="text-[0.75rem] tracking-[0.35em] tabular-nums opacity-70">{count(i, 3)}</span>
          <span className="font-display text-[clamp(2.6rem,5.4vw,6.4rem)] leading-[0.95] text-balance">{t(r.title)}</span>
          <span className="pt-4 text-[clamp(0.8rem,1vw,1rem)] font-semibold tracking-[0.2em] uppercase">{r.org}</span>
          <span className="max-w-[32rem] pt-2 text-[clamp(0.95rem,1.15vw,1.2rem)] leading-snug opacity-85">{t(r.note)}</span>
        </At>
      ))}
    </div>
  );
}
const text = <Roles />;

const extra: Record<string, LayerDef> = { dust: { highOnly: true }, 'dust-p': { highOnly: true } };
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, push: 0.32, extra });
const desktop = comp('desktop', [720, 520]);
const portrait = comp('portrait', [540, 640]);

export const b3ScaleFlip: BeatDef = {
  slug: 'b3-scale-flip',
  screens: SCREENS,
  manifest,
  // calm zone is the right wall
  desktop: {
    ...desktop,
    overlays: [{ node: text, className: 'right-[6vw] top-[12vh] w-[min(44vw,48rem)]' }],
  },
  portrait: {
    ...portrait,
    overlays: [{ node: text, className: 'left-[8vw] right-[8vw] top-[9svh]' }],
  },
};
