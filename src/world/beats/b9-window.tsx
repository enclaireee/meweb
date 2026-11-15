'use client';
// b9: inside the lit window from b0 (last beat). Choreography from ../transitions. Hero: the window
// glow and its light shafts breathe together while the night view slides behind the fixed tracery.
import type { BeatDef, Comp, LayerDef } from '@/engine';
import manifest from '../../../public/art/b9-window/manifest.json';
import { profile, scenes, ui } from '@/content';
import { useT } from '../lang';
import { Kicker } from '../SceneText';
import { reveal, world } from '../transitions';

const SCREENS = 2;
const s = scenes.b9;

// Text: a letter on the sill, tilted, with the contact link (keyboard users also get it from <Plain>). No phone number.
function Letter() {
  const t = useT();
  const c = profile.contact;
  const links = (['linkedin', 'github', 'cv'] as const).filter((k) => c[k]);
  const link = 'underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current';
  return (
    <div className="drop-shadow-[0_24px_30px_rgb(0_0_0/0.5)]">
      <div className="sheet flex w-[min(34rem,84vw)] rotate-[-2.2deg] flex-col gap-4 px-[clamp(1.4rem,3vw,2.6rem)] py-[clamp(1.4rem,3.4vw,2.8rem)] [clip-path:polygon(0_0.6%,40%_0,100%_0.8%,99.4%_60%,100%_99.4%,55%_100%,0_99%,0.5%_40%)]">
        <div aria-hidden className="flex items-baseline justify-between gap-4">
          <Kicker slug="b9-window" className="!opacity-60" />
          <span className="text-[0.7rem] tracking-[0.2em] uppercase opacity-60">{t(s.place)}</span>
        </div>
        <p aria-hidden className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] italic">{t(s.greeting)}</p>
        <p aria-hidden className="font-display text-[clamp(1.1rem,1.5vw,1.4rem)] leading-snug">{t(s.body)}</p>
        <a href={`mailto:${c.email}`} className={`font-display text-[clamp(1.25rem,2.2vw,2rem)] break-all italic ${link}`}>
          {c.email}
        </a>
        {links.length > 0 && (
          <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm tracking-wide">
            {links.map((k) => <a key={k} href={c[k]} className={link}>{t(ui.contact[k])}</a>)}
          </p>
        )}
        <p aria-hidden className="mt-2 font-display text-[clamp(1.05rem,1.4vw,1.3rem)] leading-snug">
          {t(s.signoff)}
          <br />
          <span className="text-[1.7em] italic">{s.from}</span>
        </p>
      </div>
    </div>
  );
}
const text = <Letter />;

const breathe: LayerDef = { track: [0.7, 1, 0.7, 1, 0.85].map((opacity, i) => ({ at: i / 4, opacity, ease: 'inOut' as const })) };
const slide = (x: number): LayerDef => ({ track: [{ at: 0, x: -x }, { at: 1, x }] });
const extra: Record<string, LayerDef> = {
  'window-glow': breathe,
  shafts: breathe,
  'shafts-p': breathe,
  'night-outside': slide(12),
  'range-outside': slide(28),
  'range-outside-p': slide(20),
  'outside-near': slide(48),
  'outside-near-p': slide(34),
  motes: { highOnly: true },
  'motes-p': { highOnly: true },
};
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, last: true, extra });
// Last beat: text stays to the end, so the link stays clickable.
const track = reveal({ last: true });

export const b9Window: BeatDef = {
  slug: 'b9-window',
  screens: SCREENS,
  manifest,
  // focus = the window
  desktop: { ...comp('desktop', [1260, 470]), overlays: [{ node: text, className: 'left-[8vw] top-[16vh]', track }] },
  portrait: { ...comp('portrait', [540, 590]), overlays: [{ node: text, className: 'left-[8vw] bottom-[6svh]', track }] },
};
