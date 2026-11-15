'use client';
// b8: the seam. Choreography from ../transitions. Hero: the camera pulls back through seven nested
// paper folds (outer folds move most), showing the whole world was one folded sheet.
// Text: the story on the left, three numbers stamped in a column on the right.
import type { BeatDef, Comp, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b8-seam/manifest.json';
import { useLang, useT } from '../lang';
import { At, Kicker } from '../SceneText';
import { reveal, world } from '../transitions';

const SCREENS = 2;
const s = scenes.b8;

// One fixed column (a row on phones), so the three numbers never drift into each other or off screen.
function Nums() {
  const t = useT();
  const { lang } = useLang();
  return (
    <div aria-hidden className="beat-text grid gap-[3vh] text-right text-[#fff4de] portrait:grid-cols-[1fr_1.6fr_1fr] portrait:gap-3 portrait:text-left">
      {s.numbers.map((n, i) => (
        <At key={i} a={0.26 + 0.1 * i} d={0.07} k="stamp" className="flex flex-col">
          <span className="font-display text-[clamp(3rem,5.6vw,6.5rem)] leading-[0.85] tabular-nums portrait:text-[clamp(1.8rem,8vw,2.8rem)]">{lang === 'id' && n.nid ? n.nid : n.n}</span>
          <span className="pt-1 text-[0.7rem] tracking-[0.25em] uppercase opacity-85 portrait:text-[0.6rem] portrait:tracking-[0.15em]">{t(n.unit)}</span>
        </At>
      ))}
    </div>
  );
}
const nums = <Nums />;
function Story() {
  const t = useT();
  return (
    <div aria-hidden className="beat-text flex flex-col gap-3">
      <Kicker slug="b8-seam" />
      <p className="font-display text-[clamp(1.8rem,3.4vw,3.6rem)] leading-[1.02]">{t(s.role)}</p>
      <p className="text-[0.75rem] tracking-[0.22em] uppercase opacity-85">{t(s.event)}</p>
      <p className="font-display text-[clamp(1.05rem,1.5vw,1.5rem)] leading-snug italic">{t(s.story)}</p>
      <p className="mt-2 text-[clamp(0.8rem,0.95vw,0.95rem)] opacity-75">{t(s.also)}</p>
    </div>
  );
}
const story = <Story />;

const extra: Record<string, LayerDef> = { 'paper-dust': { highOnly: true }, 'paper-dust-p': { highOnly: true } };
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, push: -0.9, extra });
const desktop = comp('desktop', [1270, 500]);
const portrait = comp('portrait', [548, 660]);

export const b8Seam: BeatDef = {
  slug: 'b8-seam',
  screens: SCREENS,
  manifest,
  // focus = the lit window of the miniature mountain
  desktop: {
    ...desktop,
    overlays: [
      { node: nums, className: 'right-[5vw] top-[14vh]', track: reveal() },
      { node: story, className: 'left-[8vw] top-[22vh] w-[min(36vw,34rem)]', track: reveal() },
    ],
  },
  portrait: {
    ...portrait,
    overlays: [
      { node: nums, className: 'left-[8vw] right-[8vw] top-[56svh]', track: reveal() },
      { node: story, className: 'left-[8vw] right-[8vw] bottom-[6svh]', track: reveal() },
    ],
  },
};
