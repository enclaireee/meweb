'use client';
// b9: inside the lit window from b0 (last beat). Choreography from ../transitions. Hero: the window
// glow and its light shafts breathe together while the night view slides behind the fixed tracery.
import type { BeatDef, Comp, Keyframe, LayerDef } from '@/engine';
import manifest from '../../../public/art/b9-window/manifest.json';
import { profile, scenes, ui } from '@/content';
import { Glow, Loop, Particles } from '../Ambient';
import { useLang, useT } from '../lang';
import { At, Kicker, Ln, SectionHeading } from '../SceneText';
import { onLayer, world } from '../transitions';

const SCREENS = 1.6;
const s = scenes.b9;
const A = 0.3; // the letter's rows start here (the gates are open at 0.19)

// Text: a letter on the sill, tilted, with the contact link (keyboard users also get it from <Plain>). No phone number.
// The links are always in the DOM and clickable once the letter is up; the last beat keeps them to the end.
function Letter() {
  const t = useT();
  const c = profile.contact;
  const links = (['linkedin', 'github', 'cv'] as const).filter((k) => c[k]);
  const link = 'underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current';
  return (
    <div className="drop-shadow-[0_24px_30px_rgb(0_0_0/0.5)]">
      <div className="sheet flex w-[min(34rem,84vw)] rotate-[-2.2deg] flex-col gap-3 px-[clamp(1.4rem,3vw,2.6rem)] py-[clamp(1.2rem,3vw,2.4rem)] [clip-path:polygon(0_0.6%,40%_0,100%_0.8%,99.4%_60%,100%_99.4%,55%_100%,0_99%,0.5%_40%)]">
        <At a={A} d={0.05} k="rise" className="block">
          <Ln i={0}>
            <div aria-hidden className="flex items-baseline justify-between gap-4">
              <Kicker slug="b9-window" className="!opacity-60" />
              <span className="text-label tracking-[0.2em] uppercase opacity-60">{t(s.place)}</span>
            </div>
          </Ln>
          <Ln i={1}><p aria-hidden className="pt-2 font-display text-title leading-none font-semibold italic">{t(s.greeting)}</p></Ln>
          <Ln i={2}><p aria-hidden className="pt-2 font-display text-lead leading-snug">{t(s.body)}</p></Ln>
          <Ln i={3}>
            <a href={`mailto:${c.email}`} className={`inline-block pt-2 font-display text-lead break-all font-semibold italic ${link}`}>
              {c.email}
            </a>
          </Ln>
          {links.length > 0 && (
            <Ln i={4}>
              <p className="flex flex-wrap gap-x-5 gap-y-1 pt-2 text-body font-semibold">
                {links.map((k) => <a key={k} href={c[k]} className={link}>{t(ui.contact[k])}</a>)}
              </p>
            </Ln>
          )}
          <Ln i={5}>
            <p aria-hidden className="pt-2 font-display text-lead leading-snug">
              {t(s.signoff)} <span className="text-[1.5em] italic">{s.from}</span>
            </p>
          </Ln>
        </At>
      </div>
    </div>
  );
}
const text = <Letter />;
// The sheet itself settles in just before its rows; it stays to the end so the links stay clickable.
const track: Keyframe[] = [{ at: 0.2, opacity: 0, y: 24 }, { at: 0.29, opacity: 1, y: 0, ease: 'out' }];

function Head({ p = false }: { p?: boolean }) {
  const { lang } = useLang();
  const size = p ? 'text-[13cqw]' : lang === 'id' ? 'text-[19cqw]' : 'text-[21cqw]';
  return <SectionHeading slug="b9-window" size={size} className="text-[#f1e3c6]" />;
}
const head = <Head />;
const headP = <Head p />;
const headT: Keyframe[] = [{ at: 0.19, opacity: 0 }, { at: 0.2, opacity: 1 }];

// Idle: the sill lantern's flame flickers over a small breathing glow; snow falls outside, clipped to the glass.
const candle = (
  <div className="relative size-full">
    <div className="absolute -inset-[60%]"><Glow kind="flicker" lite color="rgb(255 190 100 / 0.5)" /></div>
    <Loop sprite="flame-1" flip="flame-2" kind="flicker" lite />
  </div>
);
const snow = (big: number) => (
  <div className="size-full overflow-hidden">
    <Particles sprite="snowflake" kind="fall" n={10} seed={2} lite size={[big, big * 1.8]} dur={[9, 15]} />
    <Particles sprite="snowflake" kind="fall" n={8} seed={6} size={[big * 0.8, big * 1.4]} dur={[11, 18]} />
  </div>
);

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
// Gates close less than the default, so the room stays visible between them.
const comp = (c: Comp, focus: [number, number], close: number) => world(manifest, c, SCREENS, { focus, last: true, close, extra });
const desktop = comp('desktop', [1260, 470], 360);
const portrait = comp('portrait', [540, 590], 140);

export const b9Window: BeatDef = {
  slug: 'b9-window',
  screens: SCREENS,
  manifest,
  // focus = the window. Snow sits behind the frame (the split), the heading on the left wall behind the floor and sill.
  desktop: {
    ...desktop,
    split: 'window-frame',
    overlays: [
      { node: snow(1.4), rect: { x: 1010, y: 160, w: 500, h: 620 }, behind: true, parallax: 0.3 },
      onLayer(desktop, 'wall', { x: 340, y: 750, w: 540, h: 170 }, head, { behind: true, track: headT }),
      { node: candle, rect: { x: 1160, y: 716, w: 40, h: 66 }, parallax: 0.3 },
      { node: text, className: 'left-[8vw] top-[12vh]', track },
    ],
  },
  portrait: {
    ...portrait,
    split: 'window-frame-p',
    overlays: [
      { node: snow(2.6), rect: { x: 290, y: 230, w: 500, h: 700 }, behind: true, parallax: 0.3 },
      onLayer(portrait, 'wall-p', { x: 110, y: 175, w: 560, h: 100 }, headP, { behind: true, track: headT }),
      { node: candle, rect: { x: 388, y: 880, w: 40, h: 66 }, parallax: 0.3 },
      { node: text, className: 'left-[8vw] bottom-[6svh]', track },
    ],
  },
};
