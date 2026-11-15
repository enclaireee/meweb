'use client';
// b1: the paper mountain up close. Choreography from ../transitions. Hero: the crease lines surface on the face.
// Text: one editorial sentence, lit word by word as the creases come up.
import type { BeatDef, Comp, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b1-approach/manifest.json';
import { Kicker, Words } from '../SceneText';
import { reveal, world } from '../transitions';

const SCREENS = 2;
const text = (
  <div aria-hidden className="beat-text flex w-[min(62vw,58rem)] flex-col gap-5 portrait:w-[84vw]">
    <Kicker slug="b1-approach" />
    <p className="font-display text-[clamp(1.45rem,3.3vw,3.6rem)] leading-[1.14] portrait:text-[clamp(1.35rem,5.6vw,2.2rem)]">
      <Words text={scenes.b1.sentence} from={0.14} to={0.52} emClass="italic text-[#ffdcaa]" />
    </p>
  </div>
);

const extra: Record<string, LayerDef> = {};
for (const s of ['', '-p']) {
  extra[`creases${s}`] = { track: [{ at: 0.12, opacity: 0 }, { at: 0.6, opacity: 1, ease: 'inOut' }] };
  extra[`clouds${s}`] = { track: [{ at: 0, x: 0 }, { at: 1, x: -80 }] };
}
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, extra });

export const b1Approach: BeatDef = {
  slug: 'b1-approach',
  screens: SCREENS,
  manifest,
  desktop: { ...comp('desktop', [960, 560]), overlays: [{ node: text, className: 'left-[8vw] top-[22vh]', track: reveal() }] },
  portrait: { ...comp('portrait', [540, 910]), overlays: [{ node: text, className: 'left-[8vw] bottom-[8svh]', track: reveal() }] },
};
